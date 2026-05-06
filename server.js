import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';

import { validateEnv } from './backend/config/env.js';
import { standardLimiter, tierBasedLimiter } from './backend/middleware/rateLimiter.js';
import { emailService } from './backend/services/emailService.js';

dotenv.config();
validateEnv(); // Fail fast if critical env vars are missing

const app = express();
app.use(cors());
app.use(express.json());

// Apply rate limiting
app.use('/api/', standardLimiter);

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

const systemInstruction = `You are Dr. Nneka, a warm, culturally-sensitive maternal health AI assistant for MamaCare. 
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

const analyzeRiskAndRespond = async (messages, modelName = 'gemini-1.5-flash') => {
  const model = genAI.getGenerativeModel({ model: modelName });
  const chat = model.startChat({
    history: messages.slice(0, -1).map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    })),
    systemInstruction: { parts: [{ text: systemInstruction }]},
  });

  const startTime = Date.now();
  let aiResponseText = "";
  try {
    const result = await chat.sendMessage(messages[messages.length - 1].content);
    aiResponseText = result.response.text();
    const responseTime = Date.now() - startTime;
    
    // Attempt to parse JSON
    try {
      const parsed = JSON.parse(aiResponseText.trim().replace(/```json/g, '').replace(/```/g, ''));
      return { success: true, data: parsed, responseTime, modelName };
    } catch (parseError) {
      // Fallback rule-based parsing if JSON fails
      let riskLevel = 'low';
      const textLower = aiResponseText.toLowerCase();
      if (textLower.includes('bleed') || textLower.includes('severe pain') || textLower.includes('emergency')) {
        riskLevel = 'emergency';
      }
      return { 
        success: true, 
        data: { message: aiResponseText, riskLevel, symptoms: [], recommendedAction: 'Please consult a doctor if concerned.' },
        responseTime,
        modelName
      };
    }
  } catch (error) {
    // Fallback if Gemini completely fails
    const responseTime = Date.now() - startTime;
    return {
      success: false,
      data: {
        message: "I am having trouble connecting right now, my dear. If you are experiencing severe pain, bleeding, or other serious symptoms, please go to the nearest hospital immediately.",
        riskLevel: "emergency",
        symptoms: [],
        recommendedAction: "Seek immediate medical care if urgent."
      },
      responseTime,
      modelName: "fallback-rule-based"
    };
  }
};

app.post('/api/ai/chat', async (req, res) => {
  const { messages, language, userId } = req.body;
  const result = await analyzeRiskAndRespond(messages, 'gemini-1.5-flash');
  
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
  const result = await analyzeRiskAndRespond(messages, 'gemini-1.5-flash'); // use flash for simple queries
  
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
  const result = await analyzeRiskAndRespond(messages, 'gemini-1.5-flash');
  
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

app.post('/api/appointments/book', async (req, res) => {
  const { userId, doctorId, time, amount } = req.body;
  
  // 1. First, find the mother_id from the mothers table using the user's auth ID
  const { data: motherData, error: motherError } = await supabase
    .from('mothers')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (motherError || !motherData) {
    return res.status(400).json({ error: "Mother profile not found. Please complete your profile." });
  }

  // 2. Insert into appointments using the existing schema
  const { data, error } = await supabase
    .from('appointments')
    .insert({
      mother_id: motherData.id,
      doctor_id: doctorId, 
      appointment_date: time, // Corrected column name
      status: 'pending',
      amount: amount
    })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  
  res.json({ success: true, appointment: data });
});

// Flutterwave Webhook
app.post('/api/webhooks/flutterwave', async (req, res) => {
  const secretHash = process.env.FLUTTERWAVE_WEBHOOK_HASH;
  const signature = req.headers['verif-hash'];

  if (!signature || signature !== secretHash) {
    return res.status(401).end();
  }

  const payload = req.body;

  if (payload.status === 'successful' && payload.meta.purpose === 'appointment') {
    const appointmentId = payload.meta.appointment_id;

    try {
      // 1. Create Daily.co Room
      const dailyResponse = await fetch('https://api.daily.co/v1/rooms', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.DAILY_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          properties: {
            exp: Math.floor(Date.now() / 1000) + 86400, // Room expires in 24 hours
            enable_chat: true
          }
        })
      });
      
      const roomData = await dailyResponse.json();
      const secureVideoLink = roomData.url;

      // 2. Update Supabase: Confirm appointment & attach link
      await supabase
        .from('appointments')
        .update({ 
          status: 'confirmed', 
          video_link: secureVideoLink 
        })
        .eq('id', appointmentId);

      // 3. Optional: Send Email/SMS notification via emailService
      // await emailService.sendAppointmentConfirmation(payload.customer.email, secureVideoLink);

      console.log(`Appointment ${appointmentId} confirmed with link: ${secureVideoLink}`);
    } catch (err) {
      console.error('Webhook processing error:', err);
    }
  }

  res.status(200).end();
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
