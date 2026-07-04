import { env } from '../config/env.js';
import crypto from 'crypto';


const isTwilioConfigured = () => {
  return env.twilioAccountSid && env.twilioAuthToken && 
         !env.twilioAccountSid.includes('your_') && !env.twilioAuthToken.includes('your_');
};

export const whatsappService = {
  /**
   * Send a WhatsApp message via Twilio API
   * @param {string} to - Destination phone number (e.g. +254712345678)
   * @param {string} body - Message body
   * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
   */
  sendWhatsApp: async (to, body) => {
    if (!isTwilioConfigured()) {
      console.log(`[MOCK WHATSAPP] To: whatsapp:${to} | Message: ${body}`);
      return { success: true, messageId: `mock_wa_${crypto.randomUUID().substring(0, 8)}` };
    }

    try {
      const auth = Buffer.from(`${env.twilioAccountSid}:${env.twilioAuthToken}`).toString('base64');
      
      // Twilio WhatsApp sandbox number is usually +14155238886, or a custom configured number
      const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER || '+14155238886';
      const formattedFrom = fromNumber.startsWith('whatsapp:') ? fromNumber : `whatsapp:${fromNumber}`;
      const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;

      const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${env.twilioAccountSid}/Messages.json`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          To: formattedTo,
          From: formattedFrom,
          Body: body
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to send WhatsApp message through Twilio.');
      }

      console.log(`WhatsApp message sent successfully to ${to}. SID: ${data.sid}`);
      return { success: true, messageId: data.sid };
    } catch (err) {
      console.error(`Failed to send WhatsApp to ${to}:`, err.message);
      return { success: false, error: err.message };
    }
  }
};
