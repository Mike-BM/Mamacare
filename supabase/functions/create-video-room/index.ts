import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { appointment_id } = await req.json()
    const DAILY_API_KEY = Deno.env.get('DAILY_API_KEY')

    if (!DAILY_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'DAILY_API_KEY not set in Supabase environment' }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create a room on Daily.co
    const response = await fetch('https://api.daily.co/v1/rooms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DAILY_API_KEY}`
      },
      body: JSON.stringify({
        name: `apt-${appointment_id}-${Math.random().toString(36).substring(7)}`,
        properties: {
          enable_chat: true,
          start_video_off: false,
          start_audio_off: false,
          exp: Math.floor(Date.now() / 1000) + 3600 // expires in 1 hour
        }
      })
    })

    const room = await response.json()

    if (room.error) {
      return new Response(
        JSON.stringify({ error: room.error, info: room.info }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ url: room.url }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
