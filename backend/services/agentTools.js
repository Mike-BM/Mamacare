import { supabase } from '../config/supabase.js';
import { smsService } from './smsService.js';
import { whatsappService } from './whatsappService.js';
import { emailService } from './emailService.js';
import crypto from 'crypto';

export function parseAppointmentDateTime(dateInput, timeInput) {
  let datePart = dateInput ? String(dateInput).trim().toLowerCase() : '';
  let timePart = timeInput ? String(timeInput).trim().toLowerCase() : '';

  // Default to tomorrow at 10:00 AM
  const defaultDate = new Date();
  defaultDate.setDate(defaultDate.getDate() + 1);
  defaultDate.setHours(10, 0, 0, 0);

  const fuzzyTerms = ['any time', 'anytime', 'whenever', 'asap', 'as soon as possible', 'flexible', 'anytime tomorrow', 'anytime today', 'open'];
  const isFuzzyDate = !datePart || fuzzyTerms.includes(datePart);
  const isFuzzyTime = !timePart || fuzzyTerms.includes(timePart);

  let targetDate = new Date();

  // Parse Date Part
  if (isFuzzyDate) {
    targetDate.setDate(targetDate.getDate() + 1);
  } else if (datePart === 'today') {
    // Keep today
  } else if (datePart === 'tomorrow') {
    targetDate.setDate(targetDate.getDate() + 1);
  } else if (datePart.startsWith('next ')) {
    const dayName = datePart.replace('next ', '').trim();
    const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const targetDayIndex = daysOfWeek.indexOf(dayName);
    if (targetDayIndex !== -1) {
      let currentDayIndex = targetDate.getDay();
      let daysToAdd = (targetDayIndex + 7 - currentDayIndex) % 7;
      if (daysToAdd === 0) daysToAdd = 7;
      targetDate.setDate(targetDate.getDate() + daysToAdd);
    } else {
      targetDate.setDate(targetDate.getDate() + 1);
    }
  } else {
    const parsedDate = new Date(datePart);
    if (!isNaN(parsedDate.getTime())) {
      targetDate = parsedDate;
    } else {
      targetDate.setDate(targetDate.getDate() + 1);
    }
  }

  // Parse Time Part
  let hours = 10;
  let minutes = 0;

  if (!isFuzzyTime) {
    const timeRegex = /(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/;
    const match = timePart.match(timeRegex);
    if (match) {
      hours = parseInt(match[1], 10);
      minutes = match[2] ? parseInt(match[2], 10) : 0;
      const ampm = match[3];
      if (ampm === 'pm' && hours < 12) {
        hours += 12;
      } else if (ampm === 'am' && hours === 12) {
        hours = 0;
      }
    }
  }

  targetDate.setHours(hours, minutes, 0, 0);

  if (isNaN(targetDate.getTime())) {
    return defaultDate;
  }

  return targetDate;
}

export const agentTools = {
  /**
   * Retrieves the maternal profile of the user
   */
  get_maternal_profile: async ({ userId }) => {
    try {
      const { data, error } = await supabase
        .from('mothers')
        .select('*, profiles(full_name, email)')
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        return { error: 'Not Found', message: 'Maternal profile not found.' };
      }

      return {
        success: true,
        profile: {
          fullName: data.profiles?.full_name,
          email: data.profiles?.email,
          pregnancyStageWeeks: data.pregnancy_stage,
          dueDate: data.due_date,
          healthData: data.health_data,
          sosStatus: data.sos_status,
          lastCheckup: data.last_checkup
        }
      };
    } catch (err) {
      return { error: 'Internal Error', message: err.message };
    }
  },

  /**
   * Automatically schedules an appointment
   */
  book_appointment: async ({ userId, doctorId, date, slot }) => {
    try {
      // Find mother_id
      const { data: motherData, error: motherErr } = await supabase
        .from('mothers')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (motherErr || !motherData) {
        return { error: 'Not Found', message: 'Mother profile not found. Please complete profile registration.' };
      }

      // Convert date/slot to ISO
      const appointmentDateTime = parseAppointmentDateTime(date, slot);
      const appointmentDate = appointmentDateTime.toISOString();

      let finalDoctorId = '00000000-0000-0000-0000-000000000002'; // default fallback (Dr. Eliza Keith)

      if (doctorId) {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (uuidRegex.test(doctorId)) {
          finalDoctorId = doctorId;
        } else {
          // Resolve doctor name to UUID
          const cleanName = doctorId.replace(/^dr\.?\s*/i, '').trim();
          const { data: matchedProvider } = await supabase
            .from('providers')
            .select('id')
            .ilike('full_name', `%${cleanName}%`)
            .limit(1)
            .maybeSingle();

          if (matchedProvider) {
            finalDoctorId = matchedProvider.id;
          }
        }
      }

      const { data: appointment, error: apptErr } = await supabase
        .from('appointments')
        .insert({
          mother_id: motherData.id,
          doctor_id: finalDoctorId,
          appointment_date: appointmentDate,
          appointment_type: 'video',
          status: 'pending',
          amount: 1500, // standard KES 1500
          notes: 'Booked via MamaCare Platform.'
        })
        .select('*, providers(full_name)')
        .single();

      if (apptErr) throw apptErr;

      // Send notifications (Email, SMS, WhatsApp)
      let motherName = 'MamaCare Mother';
      let motherEmail = null;
      let motherPhone = '+254712345678'; // Default fallback

      try {
        const { data: motherProfile } = await supabase
          .from('mothers')
          .select('*, profiles(full_name, email)')
          .eq('id', motherData.id)
          .single();

        if (motherProfile?.profiles) {
          motherName = motherProfile.profiles.full_name || motherName;
          motherEmail = motherProfile.profiles.email || motherEmail;
        }

        const { data: authUser } = await supabase.auth.admin.getUserById(userId);
        if (authUser?.user) {
          motherPhone = authUser.user.phone || authUser.user.user_metadata?.phone || motherPhone;
        }
      } catch (profileErr) {
        console.error('Failed to retrieve user profile/phone details for notifications:', profileErr);
      }

      const dateStr = appointmentDateTime.toLocaleDateString();
      const timeStr = appointmentDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const doctorName = appointment.providers?.full_name || 'Dr. Eliza Keith';

      // 1. Send Email
      if (motherEmail) {
        try {
          await emailService.sendAppointmentConfirmation(motherEmail, {
            name: motherName,
            doctorName: doctorName,
            date: dateStr,
            slot: timeStr,
            type: 'video',
            notes: 'Booked via MamaCare Platform.'
          });
        } catch (mailErr) {
          console.error('Failed to send appointment confirmation email:', mailErr);
        }
      }

      // 2. Send SMS
      try {
        const smsBody = `Hello ${motherName}, your appointment with ${doctorName} has been booked for ${dateStr} at ${timeStr}. Keep track on MamaCare!`;
        await smsService.sendSMS(motherPhone, smsBody);
      } catch (smsErr) {
        console.error('Failed to send appointment confirmation SMS:', smsErr);
      }

      // 3. Send WhatsApp
      try {
        const whatsappBody = `Hello ${motherName}, your appointment with ${doctorName} has been booked for ${dateStr} at ${timeStr}. Keep track on MamaCare!`;
        await whatsappService.sendWhatsApp(motherPhone, whatsappBody);
      } catch (waErr) {
        console.error('Failed to send appointment confirmation WhatsApp:', waErr);
      }

      // 4. Send Admin Email Notification
      try {
        await emailService.sendAppointmentConfirmation('hellonnekahealth@gmail.com', {
          name: `${motherName} (Platform Booking)`,
          doctorName: doctorName,
          date: dateStr,
          slot: timeStr,
          type: 'video',
          notes: 'Booked via MamaCare Platform.'
        });
      } catch (adminMailErr) {
        console.error('Failed to send admin notification email:', adminMailErr);
      }

      return {
        success: true,
        message: 'Appointment booked successfully. Awaiting payment.',
        appointment: {
          id: appointment.id,
          date: dateStr,
          time: timeStr,
          status: appointment.status,
          amount: appointment.amount,
          doctor: doctorName
        }
      };
    } catch (err) {
      return { error: 'Booking Failed', message: err.message };
    }
  },

  /**
   * Triggers payment initialization
   */
  initialize_payment: async ({ userId, appointmentId, amount, purpose }) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!profile) {
        return { error: 'Not Found', message: 'User profile not found.' };
      }

      const txRef = `mc-tx-${crypto.randomUUID()}`;
      
      // Auto-initialize mock redirect payment url
      const mockRedirectUrl = `http://localhost:3001/api/payments/verify?status=successful&tx_ref=${txRef}&transaction_id=mock_flw_${crypto.randomBytes(6).toString('hex')}&appointment_id=${appointmentId || ''}&purpose=${purpose || 'appointment'}&email=${encodeURIComponent(profile.email)}&amount=${amount || 1500}`;

      return {
        success: true,
        tx_ref: txRef,
        amount: amount || 1500,
        paymentLink: mockRedirectUrl,
        message: 'Payment initialized successfully. Please direct the user to open the payment link.'
      };
    } catch (err) {
      return { error: 'Payment Initialization Failed', message: err.message };
    }
  },

  /**
   * Triggers an emergency SOS broadcast
   */
  trigger_sos: async ({ userId, latitude, longitude, symptoms }) => {
    try {
      const { data: mother } = await supabase
        .from('mothers')
        .select('*, profiles(full_name, email)')
        .eq('user_id', userId)
        .single();

      if (!mother) {
        return { error: 'Not Found', message: 'Mother profile not found.' };
      }

      let phone = '+254712345678'; // fallback
      try {
        const { data: userData } = await supabase.auth.admin.getUserById(userId);
        if (userData?.user?.phone) {
          phone = userData.user.phone;
        } else if (userData?.user?.user_metadata?.phone) {
          phone = userData.user.user_metadata.phone;
        }
      } catch (authErr) {
        console.warn('Failed to retrieve user phone from auth schema:', authErr.message);
      }

      const patientName = mother.profiles?.full_name || 'MamaCare User';
      const patientPhone = phone;
      const mapsLink = `https://www.google.com/maps/search/?api=1&query=${latitude || -1.2921},${longitude || 36.8219}`;

      const smsBody = `[SOS ALERT] Emergency triggered for ${patientName}!\nPhone: ${patientPhone}\nSymptoms: ${symptoms || 'Maternal Distress'}\nLocation: ${mapsLink}`;

      // Dispatch mock communication alerts
      await smsService.sendSMS(patientPhone, smsBody);
      await whatsappService.sendWhatsApp(patientPhone, smsBody);
      await emailService.sendEmergencyAlert(['hellonnekahealth@gmail.com'], {
        patientName,
        location: mapsLink,
        symptoms: symptoms || 'Maternal distress SOS triggered.'
      });

      // Log alert
      await supabase.from('alerts').insert({
        mother_id: mother.id,
        severity: 'critical',
        message: `SOS Alert triggered. Symptoms: ${symptoms || 'None'}. Location: ${mapsLink}`,
        status: 'active'
      });

      return {
        success: true,
        message: 'Emergency SOS distress alerts successfully broadcasted to clinic responders and dispatchers.'
      };
    } catch (err) {
      return { error: 'SOS Broadcast Failed', message: err.message };
    }
  },

  /**
   * Sends SMS via SMS service
   */
  send_sms: async ({ to, body }) => {
    const result = await smsService.sendSMS(to, body);
    return result;
  },

  /**
   * Sends WhatsApp via WhatsApp service
   */
  send_whatsapp: async ({ to, body }) => {
    const result = await whatsappService.sendWhatsApp(to, body);
    return result;
  }
};
