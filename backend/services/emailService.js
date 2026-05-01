import sgMail from '@sendgrid/mail';
import Handlebars from 'handlebars';
import { env } from '../config/env.js';

// Initialize SendGrid
if (env.sendgridApiKey && !env.sendgridApiKey.includes('dummy')) {
  sgMail.setApiKey(env.sendgridApiKey);
}

// Simple mock queue for failed emails (In production, use Redis/Bull)
const failedEmailQueue = [];

// Templates
const templates = {
  welcome: Handlebars.compile(`
    <div style="font-family: sans-serif; padding: 20px;">
      <h1>Welcome to MamaCare, {{name}}! 🤰🏾</h1>
      <p>We are thrilled to be part of your pregnancy journey. Log in to your dashboard to start tracking your progress, connect with other mamas, and get personalized advice from Dr. Nneka.</p>
      <p>Stay radiant,<br>The MamaCare Team</p>
    </div>
  `),
  appointmentReminder: Handlebars.compile(`
    <div style="font-family: sans-serif; padding: 20px;">
      <h2>Hi {{name}},</h2>
      <p>This is a reminder for your upcoming appointment with {{doctorName}} at <strong>{{hospitalName}}</strong> on <strong>{{date}}</strong> at <strong>{{time}}</strong>.</p>
      <p>Please arrive 15 minutes early.</p>
    </div>
  `),
  emergencyAlert: Handlebars.compile(`
    <div style="font-family: sans-serif; padding: 20px; border: 2px solid red;">
      <h1 style="color: red;">EMERGENCY ALERT 🚨</h1>
      <p><strong>{{patientName}}</strong> has triggered an emergency SOS!</p>
      <p><strong>Location:</strong> {{location}}</p>
      <p><strong>Symptoms:</strong> {{symptoms}}</p>
      <p>Please respond immediately.</p>
    </div>
  `),
  weeklyReport: Handlebars.compile(`
    <div style="font-family: sans-serif; padding: 20px; background-color: #fce4ec;">
      <h2>Week {{week}} Progress 👶🏾</h2>
      <p>Hi {{name}}, your baby is the size of a <strong>{{babySize}}</strong>!</p>
      <p>{{tips}}</p>
    </div>
  `),
  paymentReceipt: Handlebars.compile(`
    <div style="font-family: sans-serif; padding: 20px;">
      <h2>Payment Receipt</h2>
      <p>Thank you for your contribution of <strong>{{amount}}</strong> to your MamaCare wallet.</p>
      <p>Transaction ID: {{transactionId}}</p>
    </div>
  `)
};

async function sendEmailWithRetry(msg, retries = 3) {
  if (!env.sendgridApiKey || env.sendgridApiKey.includes('dummy')) {
    console.log(`[MOCK EMAIL] To: ${msg.to} | Subject: ${msg.subject}`);
    return;
  }

  try {
    await sgMail.send(msg);
    console.log(`✅ Email sent successfully to ${msg.to}`);
  } catch (error) {
    console.error(`❌ Failed to send email to ${msg.to}. Retries left: ${retries}`);
    if (retries > 0) {
      setTimeout(() => sendEmailWithRetry(msg, retries - 1), 5000);
    } else {
      console.log(`📥 Adding email to failed queue for manual retry later.`);
      failedEmailQueue.push(msg);
    }
  }
}

export const emailService = {
  sendWelcomeEmail: async (email, name) => {
    const msg = {
      to: email,
      from: 'hello@mamacare.africa',
      subject: 'Welcome to MamaCare!',
      html: templates.welcome({ name })
    };
    await sendEmailWithRetry(msg);
  },
  
  sendAppointmentReminder: async (email, data) => {
    const msg = {
      to: email,
      from: 'appointments@mamacare.africa',
      subject: 'Reminder: Upcoming Hospital Appointment',
      html: templates.appointmentReminder(data)
    };
    await sendEmailWithRetry(msg);
  },
  
  sendEmergencyAlert: async (contacts, data) => {
    // contacts is an array of emails
    const messages = contacts.map(contact => ({
      to: contact,
      from: 'emergency@mamacare.africa',
      subject: `🚨 EMERGENCY: ${data.patientName}`,
      html: templates.emergencyAlert(data)
    }));
    
    for (const msg of messages) {
      await sendEmailWithRetry(msg);
    }
  },
  
  sendWeeklyReport: async (email, data) => {
    const msg = {
      to: email,
      from: 'reports@mamacare.africa',
      subject: `Your Week ${data.week} Pregnancy Update!`,
      html: templates.weeklyReport(data)
    };
    await sendEmailWithRetry(msg);
  },
  
  sendPaymentReceipt: async (email, data) => {
    const msg = {
      to: email,
      from: 'billing@mamacare.africa',
      subject: 'MamaCare Payment Receipt',
      html: templates.paymentReceipt(data)
    };
    await sendEmailWithRetry(msg);
  },
  
  processFailedQueue: async () => {
    if (failedEmailQueue.length === 0) return;
    console.log(`Processing ${failedEmailQueue.length} failed emails...`);
    const queueToProcess = [...failedEmailQueue];
    failedEmailQueue.length = 0; // clear
    
    for (const msg of queueToProcess) {
      await sendEmailWithRetry(msg, 1); // just 1 retry for background job
    }
  }
};
