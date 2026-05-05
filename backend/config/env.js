import dotenv from 'dotenv';
dotenv.config();

const requiredKeys = [
  'GEMINI_API_KEY',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'JWT_SECRET',
  'ENCRYPTION_KEY'
];

export function validateEnv() {
  const missingKeys = requiredKeys.filter(key => {
    if (key === 'SUPABASE_URL') {
      return !process.env.SUPABASE_URL && !process.env.VITE_SUPABASE_URL;
    }
    return !process.env[key];
  });
  
  if (missingKeys.length > 0) {
    console.error('❌ CRITICAL ERROR: Missing environment variables:');
    missingKeys.forEach(key => console.error(`   - ${key}`));
    console.error('Please save your .env file and ensure all keys are present.');
    process.exit(1);
  } else {
    console.log('✅ Environment variables validated successfully.');
  }
}

export const env = {
  geminiApiKey: process.env.GEMINI_API_KEY,
  sendgridApiKey: process.env.SENDGRID_API_KEY,
  supabaseUrl: process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY,
  jwtSecret: process.env.JWT_SECRET,
  mpesaConsumerKey: process.env.MPESA_CONSUMER_KEY,
  mpesaConsumerSecret: process.env.MPESA_CONSUMER_SECRET,
  mpesaPasskey: process.env.MPESA_PASSKEY,
  twilioAccountSid: process.env.TWILIO_ACCOUNT_SID,
  twilioAuthToken: process.env.TWILIO_AUTH_TOKEN,
  dailyApiKey: process.env.DAILY_API_KEY,
  flutterwavePublicKey: process.env.FLUTTERWAVE_PUBLIC_KEY,
  flutterwaveSecretKey: process.env.FLUTTERWAVE_SECRET_KEY,
  googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
  encryptionKey: process.env.ENCRYPTION_KEY
};
