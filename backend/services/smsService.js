import { env } from '../config/env.js';
import crypto from 'crypto';


const isTwilioConfigured = () => {
  return env.twilioAccountSid && env.twilioAuthToken && 
         !env.twilioAccountSid.includes('your_') && !env.twilioAuthToken.includes('your_');
};

export const smsService = {
  /**
   * Send an SMS via Twilio API
   * @param {string} to - Destination phone number (e.g. +254712345678)
   * @param {string} body - Message body
   * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
   */
  sendSMS: async (to, body) => {
    if (!isTwilioConfigured()) {
      console.log(`[MOCK SMS] To: ${to} | Message: ${body}`);
      return { success: true, messageId: `mock_sms_${crypto.randomUUID().substring(0, 8)}` };
    }

    try {
      const auth = Buffer.from(`${env.twilioAccountSid}:${env.twilioAuthToken}`).toString('base64');
      const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${env.twilioAccountSid}/Messages.json`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          To: to,
          From: process.env.TWILIO_PHONE_NUMBER || '+1234567890',
          Body: body
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to send SMS through Twilio.');
      }

      console.log(`SMS sent successfully to ${to}. SID: ${data.sid}`);
      return { success: true, messageId: data.sid };
    } catch (err) {
      console.error(`Failed to send SMS to ${to}:`, err.message);
      return { success: false, error: err.message };
    }
  }
};
