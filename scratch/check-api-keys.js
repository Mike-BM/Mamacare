
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

async function checkKeys() {
  console.log('🔍 Starting API Key Validation...\n');

  // 1. Gemini
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey || geminiKey.includes('dummy')) {
    console.error('❌ GEMINI_API_KEY: Missing or dummy value.');
  } else {
    try {
      const genAI = new GoogleGenerativeAI(geminiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      // Simple probe - just checking if we can initialize
      console.log('✅ GEMINI_API_KEY: Format looks correct.');
    } catch (e) {
      console.error('❌ GEMINI_API_KEY: Initialization failed:', e.message);
    }
  }

  // 2. ElevenLabs
  const elevenKey = process.env.ELEVENLABS_API_KEY;
  if (!elevenKey) {
    console.error('❌ ELEVENLABS_API_KEY: Missing.');
  } else {
    try {
      const response = await fetch('https://api.elevenlabs.io/v1/voices', {
        headers: { 'xi-api-key': elevenKey }
      });
      if (response.status === 200) {
        console.log('✅ ELEVENLABS_API_KEY: Valid and connected.');
      } else {
        console.error(`❌ ELEVENLABS_API_KEY: API returned status ${response.status}. Key might be invalid.`);
      }
    } catch (e) {
      console.error('❌ ELEVENLABS_API_KEY: Connection failed:', e.message);
    }
  }

  // 3. Supabase
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseAnonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl) {
    console.error('❌ SUPABASE_URL: Missing.');
  } else {
    // Check Service Role Key
    if (!supabaseServiceKey) {
      console.error('❌ SUPABASE_SERVICE_ROLE_KEY: Missing.');
    } else {
      try {
        const response = await fetch(`${supabaseUrl}/rest/v1/?apikey=${supabaseServiceKey}`);
        if (response.status === 200 || response.status === 204) {
          console.log('✅ SUPABASE_SERVICE_ROLE_KEY: Working.');
        } else {
          console.error(`❌ SUPABASE_SERVICE_ROLE_KEY: API returned status ${response.status}.`);
        }
      } catch (e) {
        console.error('❌ SUPABASE_SERVICE_ROLE_KEY: Connection failed:', e.message);
      }
    }

    // Check Anon/Publishable Key
    if (!supabaseAnonKey) {
      console.error('❌ VITE_SUPABASE_PUBLISHABLE_KEY: Missing.');
    } else {
      try {
        const response = await fetch(`${supabaseUrl}/rest/v1/?apikey=${supabaseAnonKey}`);
        if (response.status === 200 || response.status === 204) {
          console.log('✅ VITE_SUPABASE_PUBLISHABLE_KEY: Working.');
        } else {
          console.error(`❌ VITE_SUPABASE_PUBLISHABLE_KEY: API returned status ${response.status}.`);
        }
      } catch (e) {
        console.error('❌ VITE_SUPABASE_PUBLISHABLE_KEY: Connection failed:', e.message);
      }
    }
  }

  // 4. SendGrid (Optional check)
  const sendgridKey = process.env.SENDGRID_API_KEY;
  if (!sendgridKey || sendgridKey.includes('dummy')) {
    console.warn('⚠️ SENDGRID_API_KEY: Missing. Email service will run in MOCK mode.');
  } else {
    console.log('✅ SENDGRID_API_KEY: Present.');
  }

  console.log('\n🏁 Validation complete.');
}

checkKeys();
