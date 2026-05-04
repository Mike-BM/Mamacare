import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const { patient_id, availability_id, reason, type } = await req.json()
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // 1. Lock the slot
  const { data: slot, error: slotError } = await supabase
    .from('availability')
    .update({ is_booked: true })
    .eq('id', availability_id)
    .eq('is_booked', false) // race condition guard
    .select()
    .single()

  if (slotError || !slot) {
    return new Response(JSON.stringify({ error: 'Slot no longer available' }), {
      status: 409,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  // 2. Create appointment
  const { data: appt, error } = await supabase
    .from('appointments')
    .insert({
      patient_id,
      provider_id: slot.provider_id,
      availability_id,
      reason,
      type,
      status: 'pending'
    })
    .select('*, provider:providers(full_name, role)')
    .single()

  if (error) {
    // Rollback slot
    await supabase.from('availability').update({ is_booked: false }).eq('id', availability_id)
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }

  // 3. Send SMS notification (Twilio/Africa's Talking)
  // TODO: integrate SMS here

  return new Response(JSON.stringify({ success: true, appointment: appt }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
