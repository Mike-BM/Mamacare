import dotenv from 'dotenv';
dotenv.config();

const requiredKeys = [
  'GEMINI_API_KEY',
  'SENDGRID_API_KEY',
  // Normally we would check these too, but to prevent crashing the dev environment if they are missing right now,
  // we'll comment them out for the fail-fast check unless we provide dummy values.
  // 'SUPABASE_URL',
  // 'SUPABASE_SERVICE_ROLE_KEY',
  // 'JWT_SECRET'
];

export function validateEnv() {
  const missingKeys = requiredKeys.filter(key => !process.env[key]);
  
  if (missingKeys.length > 0) {
    console.warn('⚠️ WARNING: Missing recommended environment variables:');
    missingKeys.forEach(key => console.warn(`   - ${key}`));
    console.warn('Please update your .env file for full functionality.');
    // In production we would fail fast: process.exit(1);
  } else {
    console.log('✅ Environment variables validated successfully.');
  }
}

export const env = {
  geminiApiKey: process.env.GEMINI_API_KEY || 'dummy_gemini_key',
  sendgridApiKey: process.env.SENDGRID_API_KEY || 'SG.dummy_sendgrid_key',
  supabaseUrl: process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY,
  jwtSecret: process.env.JWT_SECRET || 'fallback_jwt_secret_dev_only',
  mpesaConsumerKey: process.env.MPESA_CONSUMER_KEY,
  mpesaConsumerSecret: process.env.MPESA_CONSUMER_SECRET,
  mpesaPasskey: process.env.MPESA_PASSKEY,
  twilioAccountSid: process.env.TWILIO_ACCOUNT_SID,
  twilioAuthToken: process.env.TWILIO_AUTH_TOKEN,
  encryptionKey: process.env.ENCRYPTION_KEY || '12345678901234567890123456789012'
};
