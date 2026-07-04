import express from 'express';
import crypto from 'crypto';
import { supabase } from '../config/supabase.js';
import { env } from '../config/env.js';
import { emailService } from '../services/emailService.js';
import { securityService } from '../services/securityService.js';

const router = express.Router();

// Helper to check if keys are configured
const isFlutterwaveConfigured = () => {
  return env.flutterwaveSecretKey && !env.flutterwaveSecretKey.includes('your_');
};

const isDailyConfigured = () => {
  return env.dailyApiKey && !env.dailyApiKey.includes('your_');
};

/**
 * @route POST /api/payments/initialize
 * @desc Initialize a Flutterwave checkout session
 */
router.post('/initialize', async (req, res) => {
  const { appointmentId, amount, email, name, phoneNumber, purpose } = req.body;

  if (!amount || !email || !name || !purpose) {
    return res.status(400).json({ error: 'Validation Error', message: 'Amount, email, name, and purpose are required.' });
  }

  const txRef = `mc-tx-${crypto.randomUUID()}`;

  try {
    // If appointmentId is provided, verify it exists
    if (purpose === 'appointment' && appointmentId) {
      const { data: appointment, error: apptError } = await supabase
        .from('appointments')
        .select('id')
        .eq('id', appointmentId)
        .single();

      if (apptError || !appointment) {
        return res.status(400).json({ error: 'Not Found', message: 'Appointment profile not found.' });
      }
    }

    // Check if Flutterwave keys are configured
    if (!isFlutterwaveConfigured()) {
      console.log(`[MOCK PAYMENT] Initializing mock checkout link for tx_ref: ${txRef}`);
      // Generate a mock validation redirect link
      const redirectUrl = `${req.protocol}://${req.get('host')}/api/payments/verify?status=successful&tx_ref=${txRef}&transaction_id=mock_flw_${crypto.randomBytes(6).toString('hex')}&appointment_id=${appointmentId || ''}&purpose=${purpose}&email=${encodeURIComponent(email)}&amount=${amount}`;
      
      return res.json({
        status: 'success',
        message: 'Mock payment gateway initialized.',
        paymentLink: redirectUrl,
        tx_ref: txRef,
        isMock: true
      });
    }

    // Call Flutterwave Standard Payment Initialization API
    const response = await fetch('https://api.flutterwave.com/v3/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.flutterwaveSecretKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        tx_ref: txRef,
        amount: amount,
        currency: 'KES',
        redirect_url: `${req.protocol}://${req.get('host')}/api/payments/verify`,
        meta: {
          appointment_id: appointmentId,
          purpose: purpose,
          phone_number: phoneNumber
        },
        customer: {
          email: email,
          phonenumber: phoneNumber,
          name: name
        },
        customizations: {
          title: 'MamaCare Health Platform',
          description: purpose === 'appointment' ? 'Telemedicine Consultation Copay' : 'MamaFund Savings Contribution',
          logo: 'https://nnekahealth.co/logo.png'
        }
      })
    });

    const flwData = await response.json();
    if (!response.ok || flwData.status !== 'success') {
      throw new Error(flwData.message || 'Flutterwave payment initialization failed.');
    }

    res.json({
      status: 'success',
      paymentLink: flwData.data.link,
      tx_ref: txRef
    });
  } catch (err) {
    console.error('Payment initialization error:', err);
    res.status(500).json({ error: 'Payment Error', message: err.message });
  }
});

/**
 * @route GET /api/payments/verify
 * @desc Verify transaction and redirect/render status page
 */
router.get('/verify', async (req, res) => {
  const { status, tx_ref, transaction_id, appointment_id, purpose, email, amount } = req.query;

  if (status !== 'successful' && status !== 'completed') {
    return res.send(renderPaymentResultPage(false, 'Transaction was not successful or was cancelled.'));
  }

  try {
    let verified = false;
    let appointmentId = appointment_id;
    let paymentPurpose = purpose;
    let customerEmail = email;
    let paidAmount = amount;

    // Check if it was a real Flutterwave transaction or mock
    if (transaction_id && transaction_id.startsWith('mock_flw_')) {
      verified = true;
    } else if (transaction_id) {
      // Real Flutterwave verification
      const response = await fetch(`https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`, {
        headers: {
          'Authorization': `Bearer ${env.flutterwaveSecretKey}`
        }
      });
      const verifyData = await response.json();
      
      if (response.ok && verifyData.status === 'success' && verifyData.data.status === 'successful') {
        verified = true;
        appointmentId = verifyData.data.meta?.appointment_id;
        paymentPurpose = verifyData.data.meta?.purpose;
        customerEmail = verifyData.data.customer?.email;
        paidAmount = verifyData.data.amount;
      }
    }

    if (!verified) {
      return res.send(renderPaymentResultPage(false, 'Transaction verification failed.'));
    }

    // Process verification business logic
    let secureVideoLink = null;
    
    if (paymentPurpose === 'appointment' && appointmentId) {
      // 1. Generate Daily.co video room if telehealth consultation
      if (isDailyConfigured()) {
        try {
          const dailyResponse = await fetch('https://api.daily.co/v1/rooms', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${env.dailyApiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              properties: {
                exp: Math.floor(Date.now() / 1000) + 86400, // expires in 24 hours
                enable_chat: true
              }
            })
          });
          const roomData = await dailyResponse.json();
          if (dailyResponse.ok) {
            secureVideoLink = roomData.url;
          }
        } catch (dailyErr) {
          console.error('[Payments Verify] Daily.co room creation failed:', dailyErr);
        }
      }

      // Fallback secure room URL if Daily key not configured
      if (!secureVideoLink) {
        secureVideoLink = `https://meet.jit.si/MamaCareConsultation-${crypto.randomBytes(4).toString('hex')}`;
      }

      // 2. Update Supabase appointment status and link
      const { data: appointment, error: updateError } = await supabase
        .from('appointments')
        .update({
          status: 'confirmed',
          video_room_url: secureVideoLink
        })
        .eq('id', appointmentId)
        .select('*, providers(full_name)')
        .single();

      if (updateError) {
        console.error('[Payments Verify] Failed to update appointment status:', updateError.message);
      }

      // 3. Send email confirmation
      if (customerEmail && appointment) {
        const doctorName = appointment.providers?.full_name || 'MamaCare Midwife';
        const dateStr = new Date(appointment.appointment_date).toLocaleDateString();
        const timeStr = new Date(appointment.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        await emailService.sendAppointmentConfirmation(customerEmail, {
          name: customerEmail.split('@')[0],
          doctorName,
          date: dateStr,
          slot: timeStr,
          type: appointment.appointment_type || 'video',
          notes: secureVideoLink
        });
      }
    } else {
      // MamaFund or general payment
      if (customerEmail) {
        await emailService.sendPaymentReceipt(customerEmail, {
          amount: `KES ${paidAmount}`,
          transactionId: transaction_id || tx_ref
        });
      }
    }

    // Success Screen
    res.send(renderPaymentResultPage(true, `Payment confirmed successfully! KES ${paidAmount} received.`, secureVideoLink));

  } catch (err) {
    console.error('[Payments Verify] Unexpected verification error:', err);
    res.send(renderPaymentResultPage(false, `Verification error: ${err.message}`));
  }
});

/**
 * @route POST /api/payments/mpesa/stkpush
 * @desc Trigger M-Pesa STK push (mobile money simulation/integration)
 */
router.post('/mpesa/stkpush', async (req, res) => {
  const { phoneNumber, amount, appointmentId, purpose, email } = req.body;

  if (!phoneNumber || !amount || !purpose) {
    return res.status(400).json({ error: 'Validation Error', message: 'PhoneNumber, amount, and purpose are required.' });
  }

  // Sanitize phone number to format 254XXXXXXXXX
  let formattedPhone = phoneNumber.trim().replace('+', '');
  if (formattedPhone.startsWith('0')) {
    formattedPhone = '254' + formattedPhone.substring(1);
  }

  const txRef = `mpesa-tx-${crypto.randomUUID()}`;

  console.log(`[M-PESA STK] Triggering STK push to ${formattedPhone} for KES ${amount}.`);

  // Simple M-Pesa Daraja flow simulation for dev testing
  // It waits 2 seconds and auto-resolves to mock user interaction.
  try {
    // If appointment is present, verify and update asynchronously
    setTimeout(async () => {
      let secureVideoLink = `https://meet.jit.si/MamaCareConsultation-Mpesa-${crypto.randomBytes(4).toString('hex')}`;
      
      if (purpose === 'appointment' && appointmentId) {
        // Daily.co fallback simulation
        if (isDailyConfigured()) {
          try {
            const dailyResponse = await fetch('https://api.daily.co/v1/rooms', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${env.dailyApiKey}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ properties: { enable_chat: true } })
            });
            const roomData = await dailyResponse.json();
            if (dailyResponse.ok) secureVideoLink = roomData.url;
          } catch (e) {
            console.error('[M-Pesa STK Async] Daily.co fail:', e.message);
          }
        }

        // Update DB
        const { data: appointment } = await supabase
          .from('appointments')
          .update({ status: 'confirmed', video_room_url: secureVideoLink })
          .eq('id', appointmentId)
          .select('*, providers(full_name)')
          .single();

        // Send email
        if (email && appointment) {
          const doctorName = appointment.providers?.full_name || 'MamaCare Specialist';
          const dateStr = new Date(appointment.appointment_date).toLocaleDateString();
          const timeStr = new Date(appointment.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          await emailService.sendAppointmentConfirmation(email, {
            name: email.split('@')[0],
            doctorName,
            date: dateStr,
            slot: timeStr,
            type: appointment.appointment_type || 'video',
            notes: secureVideoLink
          });
        }
        
        console.log(`[M-PESA SUCCESS] Appointment ${appointmentId} updated via STK Push Callback simulation.`);
      } else if (email) {
        await emailService.sendPaymentReceipt(email, {
          amount: `KES ${amount}`,
          transactionId: txRef
        });
      }
    }, 3000);

    res.json({
      success: true,
      message: 'STK push initialized. Please check your phone to enter M-Pesa PIN.',
      merchantRequestID: `ws_CO_${crypto.randomBytes(4).toString('hex')}`,
      checkoutRequestID: `ws_CO_${crypto.randomBytes(4).toString('hex')}`,
      tx_ref: txRef
    });
  } catch (err) {
    console.error('M-Pesa STK API Error:', err);
    res.status(500).json({ error: 'M-Pesa Error', message: err.message });
  }
});

/**
 * @route POST /api/payments/webhook/flutterwave
 * @desc Handle incoming Flutterwave webhook notifications
 */
router.post('/webhook/flutterwave', async (req, res) => {
  const secretHash = process.env.FLUTTERWAVE_WEBHOOK_HASH;
  const signature = req.headers['verif-hash'];

  if (secretHash && (!signature || signature !== secretHash)) {
    await securityService.sendAlert('Invalid signature on Flutterwave webhook route.', 'high');
    return res.status(401).end();
  }

  const payload = req.body;
  if (payload.status === 'successful') {
    const appointmentId = payload.meta?.appointment_id;
    const purpose = payload.meta?.purpose;

    console.log(`[WEBHOOK] Flutterwave confirmed payment success for tx_ref: ${payload.tx_ref}`);

    try {
      if (purpose === 'appointment' && appointmentId) {
        let secureVideoLink = `https://meet.jit.si/MamaCareConsultation-${crypto.randomBytes(4).toString('hex')}`;
        
        if (isDailyConfigured()) {
          const dailyResponse = await fetch('https://api.daily.co/v1/rooms', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${env.dailyApiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ properties: { enable_chat: true } })
          });
          const roomData = await dailyResponse.json();
          if (dailyResponse.ok) secureVideoLink = roomData.url;
        }

        await supabase
          .from('appointments')
          .update({
            status: 'confirmed',
            video_room_url: secureVideoLink
          })
          .eq('id', appointmentId);

        if (payload.customer?.email) {
          await emailService.sendAppointmentConfirmation(payload.customer.email, {
            name: payload.customer.name || payload.customer.email.split('@')[0],
            doctorName: 'MamaCare Doctor',
            date: 'Scheduled date',
            slot: 'Scheduled slot',
            type: 'video',
            notes: secureVideoLink
          });
        }
      } else if (payload.customer?.email) {
        await emailService.sendPaymentReceipt(payload.customer.email, {
          amount: `${payload.currency} ${payload.amount}`,
          transactionId: payload.id
        });
      }
    } catch (err) {
      console.error('[Webhook Processing Error]:', err.message);
    }
  }

  res.status(200).end();
});

// HTML Renderer for redirect response
function renderPaymentResultPage(success, message, videoLink = null) {
  const colorClass = success ? 'text-green-500' : 'text-red-500';
  const icon = success 
    ? `<svg class="w-20 h-20 mx-auto text-green-500 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`
    : `<svg class="w-20 h-20 mx-auto text-red-500 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`;
  
  const videoButton = videoLink 
    ? `<a href="${videoLink}" target="_blank" class="block w-full text-center bg-primary text-white font-bold py-3 px-4 rounded-xl hover:bg-opacity-90 transition-all mb-4 bg-[#8b5cf6]">Join Video Call Consultation</a>` 
    : '';

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>MamaCare - Payment Status</title>
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-[#09090b] text-white min-h-screen flex items-center justify-center p-4 font-sans">
      <div class="max-w-md w-full bg-white/5 border border-white/10 rounded-[32px] p-8 text-center backdrop-blur-md shadow-2xl">
        ${icon}
        <h2 class="text-3xl font-black mb-2">${success ? 'Payment Successful' : 'Payment Failed'}</h2>
        <p class="text-white/60 mb-8 font-medium">${message}</p>
        
        ${videoButton}
        
        <button onclick="window.close()" class="w-full bg-white/10 border border-white/20 text-white font-bold py-3 px-4 rounded-xl hover:bg-white/20 transition-all">
          Close Window
        </button>
      </div>
    </body>
    </html>
  `;
}

export default router;
