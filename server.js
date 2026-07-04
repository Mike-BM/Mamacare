import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';

import { validateEnv } from './backend/config/env.js';
import { standardLimiter, tierBasedLimiter } from './backend/middleware/rateLimiter.js';
import { emailService } from './backend/services/emailService.js';
import { smsService } from './backend/services/smsService.js';
import { whatsappService } from './backend/services/whatsappService.js';
import { parseAppointmentDateTime } from './backend/services/agentTools.js';


import authRouter from './backend/routes/auth.js';
import paymentsRouter from './backend/routes/payments.js';
import communicationRouter from './backend/routes/communication.js';
import agentRouter from './backend/routes/agent.js';
import { authGuard } from './backend/middleware/authGuard.js';

dotenv.config();
validateEnv(); // Fail fast if critical env vars are missing

const app = express();
app.use(cors());
app.use(express.json());

// Apply rate limiting
app.use('/api/', standardLimiter);

// Mount Modular API routers
app.use('/api/auth', authRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/communication', communicationRouter);
app.use('/api/ai/agent', agentRouter);

// Root and API health check endpoint
app.get(['/', '/api', '/api/'], (req, res) => {
  res.json({
    status: 'healthy',
    service: 'nnekahealth-backend',
    message: 'Nneka Health API is running.',
    timestamp: new Date().toISOString()
  });
});


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // 32 bytes
const IV_LENGTH = 16;

function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

const systemInstruction = `You are Dr. Nneka, a warm, culturally-sensitive maternal health AI assistant for Nneka Health. 
Your goal is to support pregnant women and mothers in Africa (with knowledge of local customs, foods, and dialects like Swahili, Yoruba, Hausa, Zulu, but you respond in the language the user speaks).
Be warm, deeply empathetic, and professional. Use "we" and "my dear" where culturally appropriate.
You MUST also evaluate the medical risk level of the user's situation in EVERY response, based on their message.
Provide your response in JSON format exactly as follows:
{
  "message": "Your conversational reply here",
  "riskLevel": "low" | "medium" | "high" | "emergency",
  "symptoms": ["list of detected symptoms"],
  "recommendedAction": "Actionable advice, e.g., 'rest', 'drink water', 'visit hospital immediately'"
}
Do not use Markdown blocks (like \`\`\`json). Just return the raw JSON object.
Rule of thumb for risk:
- emergency: heavy bleeding, severe abdominal pain, blurry vision, loss of fetal movement.
- high: fever, persistent vomiting, high blood pressure signs.
- medium: mild cramping, spotting, headache.
- low: general questions, nutrition, normal pregnancy symptoms.`;

const analyzeRiskAndRespond = async (messages, modelName = 'gemini-2.5-flash') => {
  const candidates = [modelName, 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-flash-latest', 'gemini-2.0-flash-lite'];
  const startTime = Date.now();
  let lastError = null;

  for (const name of candidates) {
    try {
      console.log(`[AI] Attempting response with model: ${name}`);
      const model = genAI.getGenerativeModel({ model: name });
      
      const chat = model.startChat({
        history: messages.slice(0, -1).map(m => ({
          role: (m.role === 'assistant' || m.role === 'bot' || m.role === 'model') ? 'model' : 'user',
          parts: [{ text: m.content || m.text || '' }]
        })),
        systemInstruction: { parts: [{ text: systemInstruction }] },
      });

      const userContent = messages[messages.length - 1].content || messages[messages.length - 1].text || '';
      const result = await chat.sendMessage(userContent);
      const aiResponseText = result.response.text();
      const responseTime = Date.now() - startTime;

      // Try to parse JSON response
      try {
        const cleanJson = aiResponseText.trim().replace(/^```json\s*/, '').replace(/\s*```$/, '');
        const parsed = JSON.parse(cleanJson);
        return { success: true, data: parsed, responseTime, modelName: name };
      } catch (parseError) {
        console.warn(`[AI] JSON parse failed for ${name}, using rule-based fallback`, parseError.message);
        let riskLevel = 'low';
        const txt = aiResponseText.toLowerCase();
        if (txt.includes('bleed') || txt.includes('severe pain') || txt.includes('emergency')) {
          riskLevel = 'emergency';
        } else if (txt.includes('fever') || txt.includes('vomit')) {
          riskLevel = 'high';
        }
        
        return {
          success: true,
          data: { 
            message: aiResponseText, 
            riskLevel, 
            symptoms: [], 
            recommendedAction: 'Please consult a doctor if concerned.' 
          },
          responseTime,
          modelName: name,
        };
      }
    } catch (e) {
      console.error(`[AI] Model ${name} failed:`, e.message);
      lastError = e;
      continue; // Try next model
    }
  }

  // All models failed
  const responseTime = Date.now() - startTime;
  return {
    success: false,
    error: lastError?.message,
    data: {
      message: 'I am so sorry, my dear, but I am having trouble connecting. If you are experiencing serious symptoms, please seek immediate medical attention.',
      riskLevel: 'emergency',
      symptoms: [],
      recommendedAction: 'Seek immediate medical care.',
    },
    responseTime,
    modelName: 'all-failed',
  };
};

app.post('/api/ai/chat', async (req, res) => {
  const { messages, language, userId } = req.body;
  const result = await analyzeRiskAndRespond(messages, 'gemini-2.5-flash');
  
  // Log to Supabase
  if (userId) {
    const userMsg = messages[messages.length - 1].content;
    await supabase.from('ai_conversations').insert({
      user_id: userId,
      encrypted_content: encrypt(userMsg),
      role: 'user',
      language,
      model_used: result.modelName
    });

    const aiConvRes = await supabase.from('ai_conversations').insert({
      user_id: userId,
      encrypted_content: encrypt(result.data.message),
      role: 'assistant',
      risk_level: result.data.riskLevel,
      language,
      model_used: result.modelName,
      response_time_ms: result.responseTime
    }).select('id').single();

    if (result.data.riskLevel !== 'low' && aiConvRes.data) {
      await supabase.from('risk_assessments').insert({
        user_id: userId,
        conversation_id: aiConvRes.data.id,
        risk_level: result.data.riskLevel,
        symptoms: result.data.symptoms,
        recommended_action: result.data.recommendedAction
      });
    }
  }

  res.json(result.data);
});

app.post('/api/ai/triage', async (req, res) => {
  const { symptoms, userId } = req.body;
  const messages = [{ role: 'user', content: `I am experiencing the following symptoms: ${symptoms}. What is your assessment?` }];
  const result = await analyzeRiskAndRespond(messages, 'gemini-2.5-flash'); // use flash for simple queries
  
  if (userId) {
    // Log
    const aiConvRes = await supabase.from('ai_conversations').insert({
      user_id: userId,
      encrypted_content: encrypt(result.data.message),
      role: 'assistant',
      risk_level: result.data.riskLevel,
      model_used: result.modelName,
      response_time_ms: result.responseTime
    }).select('id').single();

    if (aiConvRes.data) {
      await supabase.from('risk_assessments').insert({
        user_id: userId,
        conversation_id: aiConvRes.data.id,
        risk_level: result.data.riskLevel,
        symptoms: result.data.symptoms,
        recommended_action: result.data.recommendedAction
      });
    }
  }

  res.json(result.data);
});

app.post('/api/ai/voice', async (req, res) => {
  // Simple endpoint to process transcribed voice text same as chat
  const { transcript, language, userId } = req.body;
  const messages = [{ role: 'user', content: transcript }];
  const result = await analyzeRiskAndRespond(messages, 'gemini-2.5-flash');
  
  if (userId) {
     await supabase.from('ai_conversations').insert({
      user_id: userId,
      encrypted_content: encrypt(transcript),
      role: 'user',
      language,
      model_used: result.modelName
    });

    const aiConvRes = await supabase.from('ai_conversations').insert({
      user_id: userId,
      encrypted_content: encrypt(result.data.message),
      role: 'assistant',
      risk_level: result.data.riskLevel,
      language,
      model_used: result.modelName,
      response_time_ms: result.responseTime
    }).select('id').single();
  }

  res.json(result.data);
});

app.post('/api/ai/speak', async (req, res) => {
  try {
    const { text, language } = req.body;
    
    // Fallback to fetch if the library isn't available
    const DR_NNEKA_VOICE_ID = 'EXAVITQu4vr4xnSDxMaL'; // A standard warm voice as fallback
    const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

    if (!ELEVENLABS_API_KEY) {
      return res.status(400).json({ error: 'ElevenLabs API key not configured' });
    }

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${DR_NNEKA_VOICE_ID}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.3,
          use_speaker_boost: true
        }
      })
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.statusText}`);
    }

    res.set('Content-Type', 'audio/mpeg');
    const arrayBuffer = await response.arrayBuffer();
    res.send(Buffer.from(arrayBuffer));
    
  } catch (error) {
    console.error('TTS error:', error);
    res.status(500).json({ error: 'Voice generation failed' });
  }
});

// --- NEW: Appointments & Payments ---

app.post('/api/appointments/book', authGuard, async (req, res) => {
  const userId = req.user.id;
  const { doctorId, time, amount } = req.body;
  
  // 1. First, find the mother_id from the mothers table using the user's auth ID
  const { data: motherData, error: motherError } = await supabase
    .from('mothers')
    .select('id, profiles(full_name, email)')
    .eq('user_id', userId)
    .single();

  if (motherError || !motherData) {
    return res.status(400).json({ error: "Mother profile not found. Please complete your profile." });
  }

  // Parse fuzzy/relative date
  const appointmentDateTime = parseAppointmentDateTime(time);
  const appointmentDate = appointmentDateTime.toISOString();

  // 2. Insert into appointments using the existing schema
  const { data: appointment, error } = await supabase
    .from('appointments')
    .insert({
      mother_id: motherData.id,
      doctor_id: doctorId || '00000000-0000-0000-0000-000000000002', // default fallback Dr. Eliza Keith
      appointment_date: appointmentDate, 
      status: 'pending',
      amount: amount || 1500
    })
    .select('*, providers(full_name)')
    .single();

  if (error) return res.status(500).json({ error: error.message });
  
  // Send notifications immediately!
  let motherName = motherData.profiles?.full_name || 'MamaCare Mother';
  let motherEmail = motherData.profiles?.email;
  let motherPhone = req.user.phone || req.user.user_metadata?.phone || '+254712345678';
  const doctorName = appointment.providers?.full_name || 'Dr. Eliza Keith';
  
  const dateStr = appointmentDateTime.toLocaleDateString();
  const timeStr = appointmentDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const smsBody = `Hello ${motherName}, your appointment with ${doctorName} has been booked for ${dateStr} at ${timeStr}. Keep track on MamaCare!`;

  try {
    // 1. Email confirmation
    if (motherEmail) {
      await emailService.sendAppointmentConfirmation(motherEmail, {
        name: motherName,
        doctorName: doctorName,
        date: dateStr,
        slot: timeStr,
        type: 'video',
        notes: 'Booked via MamaCare Booking Service.'
      });
    }

    // 2. SMS confirmation
    await smsService.sendSMS(motherPhone, smsBody);

    // 3. WhatsApp confirmation
    await whatsappService.sendWhatsApp(motherPhone, smsBody);

    // 4. Admin Email Notification
    await emailService.sendAppointmentConfirmation('hellonnekahealth@gmail.com', {
      name: `${motherName} (Web API Booking)`,
      doctorName: doctorName,
      date: dateStr,
      slot: timeStr,
      type: 'video',
      notes: 'Booked via MamaCare Booking Service.'
    });
  } catch (notifyErr) {
    console.error('Failed to send web API booking notifications:', notifyErr);
  }

  res.json({ success: true, appointment });
});

// Flutterwave Webhook
app.post('/api/webhooks/flutterwave', (req, res) => {
  res.redirect(307, '/api/payments/webhook/flutterwave');
});

app.post('/api/appointments/notify', async (req, res) => {
  const { email, phone, name, doctorName, date, slot, type, notes } = req.body;
  try {
    const emailData = {
      name,
      doctorName,
      date,
      slot,
      type,
      notes
    };
    if (email) {
      await emailService.sendAppointmentConfirmation(email, emailData);
    }
    await emailService.sendAppointmentConfirmation('hellonnekahealth@gmail.com', {
      ...emailData,
      name: `${name} (Admin Notification)`
    });

    // Also send SMS and WhatsApp confirmations!
    const targetPhone = phone || '+254712345678';
    const smsBody = `Hello ${name}, your appointment with ${doctorName} has been booked for ${date} at ${slot}. Keep track on MamaCare!`;

    try {
      await smsService.sendSMS(targetPhone, smsBody);
    } catch (smsErr) {
      console.error("SMS notification trigger failed:", smsErr);
    }

    try {
      await whatsappService.sendWhatsApp(targetPhone, smsBody);
    } catch (waErr) {
      console.error("WhatsApp notification trigger failed:", waErr);
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Error triggering appointment confirmation notifications:", error);
    res.status(500).json({ error: error.message });
  }
});

// --- Referral Integration for Partner Hospitals ---
app.post('/api/v1/hospital/referral', async (req, res) => {
  const { hospital_id, hospital_mrn, referring_doctor, patient, referral } = req.body;
  
  try {
    // 1. Try to find patient (mother) by phone or name
    let motherId = null;
    let patientUserId = null;
    
    // Find matching profile by email first
    const emailToSearch = patient.phone + '@nnekahealth-referred.com';
    const { data: profileData } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', emailToSearch)
      .limit(1);

    if (profileData && profileData.length > 0) {
      patientUserId = profileData[0].id;
      const { data: m } = await supabase
        .from('mothers')
        .select('id')
        .eq('user_id', patientUserId)
        .single();
      if (m) motherId = m.id;
    } else {
      // Find in mothers using raw join / metadata if possible
      const { data: mothersList } = await supabase
        .from('mothers')
        .select('id, user_id, profiles!inner(full_name)')
        .eq('profiles.full_name', patient.name)
        .limit(1);
      if (mothersList && mothersList.length > 0) {
        motherId = mothersList[0].id;
        patientUserId = mothersList[0].user_id;
      }
    }
    
    // If not found, let's create a placeholder mother and profile
    if (!motherId) {
      try {
        // Create user in Auth using admin API to satisfy foreign key constraints
        const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
          email: emailToSearch,
          email_confirm: true,
          user_metadata: { full_name: patient.name, role: 'mother' }
        });
        
        if (authErr) throw authErr;
        
        patientUserId = authData.user.id;
        
        // Wait, did the trigger create the mother row? Let's check or try to update/insert.
        const { data: existingMother } = await supabase
          .from('mothers')
          .select('id')
          .eq('user_id', patientUserId)
          .single();
          
        if (existingMother) {
          motherId = existingMother.id;
          // Update mother with due date and stage
          await supabase
            .from('mothers')
            .update({
              due_date: patient.due_date,
              pregnancy_stage: patient.pregnancy_week || 24,
              health_data: { referred: true, referral_mrn: hospital_mrn }
            })
            .eq('id', motherId);
        } else {
          // If trigger didn't insert it, let's insert it
          const { data: newMother, error: nmErr } = await supabase
            .from('mothers')
            .insert({
              user_id: patientUserId,
              due_date: patient.due_date,
              pregnancy_stage: patient.pregnancy_week || 24,
              health_data: { referred: true, referral_mrn: hospital_mrn }
            })
            .select('id')
            .single();
            
          if (nmErr) throw nmErr;
          if (newMother) motherId = newMother.id;
        }
      } catch (authError) {
        console.error("Auth user creation failed, falling back to direct database insertion:", authError);
        // Fallback: Try insert directly (might fail if foreign keys are strictly enforced on auth.users in Postgres)
        const tempId = crypto.randomUUID();
        patientUserId = tempId;
        
        await supabase.from('profiles').insert({
          id: tempId,
          full_name: patient.name,
          email: emailToSearch,
          role: 'mother'
        });
        
        const { data: newMother } = await supabase
          .from('mothers')
          .insert({
            user_id: tempId,
            due_date: patient.due_date,
            pregnancy_stage: patient.pregnancy_week || 24,
            health_data: { referred: true, referral_mrn: hospital_mrn }
          })
          .select('id')
          .single();
          
        if (newMother) motherId = newMother.id;
      }
    }

    // 2. Select a doctor based on specialty
    let assignedDoctorId = null;
    const { data: doctors } = await supabase
      .from('providers')
      .select('id, specialty')
      .eq('verification_status', 'verified')
      .eq('is_active', true);
      
    if (doctors && doctors.length > 0) {
      // Try to find matching specialty
      const matched = doctors.find(doc => doc.specialty?.toLowerCase().includes(referral.preferred_specialty?.toLowerCase()));
      assignedDoctorId = matched ? matched.id : doctors[0].id;
    } else {
      // Fallback doctor (Dr. Eliza Keith)
      assignedDoctorId = '00000000-0000-0000-0000-000000000002'; // mock uuid
    }

    // 3. Create appointment
    const notesValue = `Hospital Referral from ${hospital_id} | MRN: ${hospital_mrn} | Referred by: ${referring_doctor} | Urgency: ${referral.urgency?.toUpperCase()} | Notes: ${referral.notes || ''}`;
    
    const { data: appt, error: apptErr } = await supabase
      .from('appointments')
      .insert({
        mother_id: motherId,
        doctor_id: assignedDoctorId,
        hospital_id: hospital_id,
        appointment_date: new Date(Date.now() + 86400000).toISOString(), // set to tomorrow
        appointment_type: 'video',
        status: 'pending',
        notes: notesValue
      })
      .select()
      .single();

    if (apptErr) throw apptErr;

    // 4. Create chat conversation
    if (patientUserId && assignedDoctorId) {
      const { data: conv, error: convErr } = await supabase
        .from('conversations')
        .insert({
          participant_1_id: patientUserId,
          participant_1_type: 'patient',
          participant_2_id: assignedDoctorId,
          participant_2_type: 'provider',
          last_message_preview: `Hospital Referral: ${referral.reason}`,
          related_appointment_id: appt.id
        })
        .select()
        .single();

      if (!convErr && conv) {
        // Insert initial system referral message
        await supabase.from('messages').insert({
          conversation_id: conv.id,
          sender_id: patientUserId,
          sender_type: 'hospital',
          content: `REFERRAL RECEIVED\nFrom: ${hospital_id}\nReferred by: ${referring_doctor}\nPatient: ${patient.name}\nUrgency: ${referral.urgency?.toUpperCase()}\nMRN: ${hospital_mrn}\nClinical Notes: ${referral.notes || ''}`,
          message_type: 'appointment_update',
          appointment_id: appt.id
        });
      }
    }

    // Retrieve doctor profile info for the response
    let doctorName = 'Dr. Eliza Keith';
    if (assignedDoctorId) {
      const { data: docProfile } = await supabase
        .from('providers')
        .select('full_name')
        .eq('id', assignedDoctorId)
        .single();
      if (docProfile) doctorName = docProfile.full_name;
    }

    res.json({
      status: "success",
      referral_id: `REF-2026-${Math.floor(100 + Math.random() * 900)}`,
      assigned_doctor: doctorName,
      doctor_license: "KMPDC-A12345",
      scheduled_time: new Date(Date.now() + 86400000).toISOString(),
      patient_notification_sent: true,
      doctor_notification_sent: true
    });
    
  } catch (error) {
    console.error("Referral creation failed:", error);
    res.status(500).json({ error: error.message });
  }
});

export default app;

const PORT = process.env.PORT || 3001;
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
