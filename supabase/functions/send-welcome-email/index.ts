import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
    
    const { email, name, role } = await req.json();

    const { data, error } = await resend.emails.send({
      from: 'Nneka Health <onboarding@resend.dev>', // Note: Use your verified domain in production
      to: [email],
      subject: 'Welcome to Nneka Health!',
      html: `
        <div style="font-family: sans-serif; max-w-2xl; margin: 0 auto; padding: 20px;">
          <h1 style="color: #FF1493;">Welcome to Nneka Health, ${name}!</h1>
          <p>We are thrilled to have you join our maternal care community as a <strong>${role}</strong>.</p>
          <p>Your account has been successfully created. You can now log in to your dashboard to explore all our features.</p>
          <br/>
          <p>Best regards,</p>
          <p><strong>The Nneka Health Team</strong></p>
        </div>
      `,
    });

    if (error) {
      throw error;
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
