import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkSchema() {
  console.log("Checking database...");

  // Get one row from mothers
  const { data: mother, error: mErr } = await supabase.from('mothers').select('*').limit(1);
  if (mErr) {
    console.error("Error fetching mothers:", mErr);
  } else {
    console.log("Mother row columns:", mother.length > 0 ? Object.keys(mother[0]) : "No mothers found");
  }

  // Get one row from appointments
  const { data: apt, error: aErr } = await supabase.from('appointments').select('*').limit(1);
  if (aErr) {
    console.error("Error fetching appointments:", aErr);
  } else {
    console.log("Appointment row columns:", apt.length > 0 ? Object.keys(apt[0]) : "No appointments found");
  }

  // Check relationship join by querying appointments with mothers join
  const { data: joinMother, error: jmErr } = await supabase
    .from('appointments')
    .select(`
      *,
      mothers (
        *
      )
    `)
    .limit(1);
  if (jmErr) {
    console.error("Error joining mothers:", jmErr);
  } else {
    console.log("Success joining mothers. Mother join data:", joinMother[0]?.mothers);
  }

  // Check profiles table columns
  const { data: profile, error: pErr } = await supabase.from('profiles').select('*').limit(1);
  if (pErr) {
    console.error("Error fetching profiles:", pErr);
  } else {
    console.log("Profile row columns:", profile.length > 0 ? Object.keys(profile[0]) : "No profiles found");
  }
}

checkSchema();
