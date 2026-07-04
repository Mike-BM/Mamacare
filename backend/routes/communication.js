import express from 'express';
import { supabase } from '../config/supabase.js';
import { smsService } from '../services/smsService.js';
import { whatsappService } from '../services/whatsappService.js';
import { emailService } from '../services/emailService.js';

const router = express.Router();

/**
 * @route POST /api/communication/send-sms
 * @desc Send a standard SMS message
 */
router.post('/send-sms', async (req, res) => {
  const { to, body } = req.body;
  if (!to || !body) {
    return res.status(400).json({ error: 'Validation Error', message: 'Parameters "to" and "body" are required.' });
  }

  const result = await smsService.sendSMS(to, body);
  if (!result.success) {
    return res.status(500).json({ error: 'SMS Send Failed', message: result.error });
  }

  res.json({ message: 'SMS sent successfully.', messageId: result.messageId });
});

/**
 * @route POST /api/communication/send-whatsapp
 * @desc Send a WhatsApp message
 */
router.post('/send-whatsapp', async (req, res) => {
  const { to, body } = req.body;
  if (!to || !body) {
    return res.status(400).json({ error: 'Validation Error', message: 'Parameters "to" and "body" are required.' });
  }

  const result = await whatsappService.sendWhatsApp(to, body);
  if (!result.success) {
    return res.status(500).json({ error: 'WhatsApp Send Failed', message: result.error });
  }

  res.json({ message: 'WhatsApp message sent successfully.', messageId: result.messageId });
});

/**
 * @route POST /api/communication/send-email
 * @desc Trigger email notifications using predefined templates
 */
router.post('/send-email', async (req, res) => {
  const { to, template, data } = req.body;
  
  if (!to || !template || !data) {
    return res.status(400).json({ error: 'Validation Error', message: 'Parameters "to", "template", and "data" are required.' });
  }

  try {
    switch (template) {
      case 'welcome':
        await emailService.sendWelcomeEmail(to, data.name);
        break;
      case 'reminder':
        await emailService.sendAppointmentReminder(to, data);
        break;
      case 'receipt':
        await emailService.sendPaymentReceipt(to, data);
        break;
      case 'confirmation':
        await emailService.sendAppointmentConfirmation(to, data);
        break;
      default:
        return res.status(400).json({ error: 'Validation Error', message: `Invalid template: ${template}` });
    }

    res.json({ message: `Email triggered successfully using template: ${template}.` });
  } catch (err) {
    console.error('Email API route error:', err);
    res.status(500).json({ error: 'Email Trigger Failed', message: err.message });
  }
});

/**
 * @route POST /api/communication/trigger-sos
 * @desc Dispatch critical emergency alerts via SMS, WhatsApp, and Email concurrently
 */
router.post('/trigger-sos', async (req, res) => {
  const { userId, latitude, longitude, symptoms } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'Validation Error', message: 'Parameter "userId" is required.' });
  }

  try {
    // 1. Fetch mother profile & emergency contacts
    const { data: mother, error: motherErr } = await supabase
      .from('mothers')
      .select('*, profiles(full_name, email)')
      .eq('user_id', userId)
      .single();

    if (motherErr || !mother) {
      console.error('[trigger-sos] Mother query error:', motherErr);
      return res.status(404).json({ error: 'Not Found', message: 'Mother profile not found.', dbError: motherErr?.message });
    }

    const patientName = mother.profiles?.full_name || 'MamaCare User';
    const patientPhone = mother.profiles?.phone || 'Not provided';
    const patientEmail = mother.profiles?.email || 'Not provided';

    // Extract emergency contacts from health_data JSON
    let contacts = [];
    if (mother.health_data && typeof mother.health_data === 'object') {
      contacts = mother.health_data.emergency_contacts || [];
    }

    // Default emergency contact if none registered
    if (contacts.length === 0) {
      contacts = [
        {
          name: 'MamaCare Emergency Dispatcher',
          phone: '+254712345678',
          email: 'emergency@nnekahealth.co',
          relationship: 'Platform default clinic responder'
        }
      ];
    }

    const mapsLink = (latitude && longitude)
      ? `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
      : 'Location details unavailable';

    const smsBody = `[EMERGENCY ALERT] ${patientName} has triggered a maternal distress SOS!\nPhone: ${patientPhone}\nSymptoms: ${symptoms || 'Maternal Distress'}\nLocation: ${mapsLink}\nPlease respond immediately.`;

    const smsPromises = [];
    const waPromises = [];
    const emailRecipients = [];

    // 2. Queue concurrent SMS, WhatsApp, and Emails to emergency contacts
    for (const c of contacts) {
      if (c.phone) {
        smsPromises.push(smsService.sendSMS(c.phone, smsBody));
        waPromises.push(whatsappService.sendWhatsApp(c.phone, smsBody));
      }
      if (c.email) {
        emailRecipients.push(c.email);
      }
    }

    // Also send admin notification email
    emailRecipients.push('hellonnekahealth@gmail.com');

    // Email dispatch trigger
    const emailPromise = emailService.sendEmergencyAlert(emailRecipients, {
      patientName,
      location: mapsLink,
      symptoms: symptoms || 'Maternal Distress'
    });

    // 3. Log the emergency in the active database alerts table
    // Fetch a nearby hospital if available, otherwise insert hospital-less alert
    const { data: hospital } = await supabase
      .from('hospitals')
      .select('id')
      .limit(1)
      .single();

    const { data: alertLog, error: alertErr } = await supabase
      .from('alerts')
      .insert({
        mother_id: mother.id,
        hospital_id: hospital?.id || null,
        severity: 'critical',
        message: `Distress symptoms: ${symptoms || 'Maternal Distress'}. Location Coordinates: ${latitude || 'N/A'}, ${longitude || 'N/A'}. GPS maps: ${mapsLink}`,
        status: 'active'
      })
      .select()
      .single();

    if (alertErr) {
      console.error('[SOS API] Failed to log alert in DB:', alertErr.message);
    }

    // Await all messaging triggers concurrently
    const smsResults = await Promise.all(smsPromises);
    const waResults = await Promise.all(waPromises);
    await emailPromise;

    res.json({
      message: 'SOS Emergency alerts broadcasted successfully.',
      alertId: alertLog?.id || null,
      details: {
        recipientContactsCount: contacts.length,
        smsDispatched: smsResults.filter(r => r.success).length,
        whatsappDispatched: waResults.filter(r => r.success).length,
        emailsSent: emailRecipients
      }
    });

  } catch (err) {
    console.error('Distress SOS API route error:', err);
    res.status(500).json({ error: 'SOS Dispatch Failed', message: err.message });
  }
});

export default router;
