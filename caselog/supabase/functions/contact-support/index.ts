import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import nodemailer from 'npm:nodemailer@6.9.16';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json(405, { error: 'Method not allowed' });

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
  const smtpHost = Deno.env.get('SMTP_HOST') ?? 'smtp.hostinger.com';
  const smtpPort = Number(Deno.env.get('SMTP_PORT') ?? '465');
  const smtpUser = Deno.env.get('SMTP_USER') ?? '';
  const smtpPass = Deno.env.get('SMTP_PASS') ?? '';
  const supportTo = Deno.env.get('SUPPORT_TO') ?? 'robert.vlasiu@gmail.com';

  if (!smtpUser || !smtpPass) {
    return json(500, { error: 'Support email is not configured on the server.' });
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return json(401, { error: 'Sign in to contact support.' });

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return json(401, { error: 'Sign in to contact support.' });

  let body: { subject?: string; message?: string };
  try {
    body = await req.json();
  } catch {
    return json(400, { error: 'Invalid request body.' });
  }

  const message = body.message?.trim();
  if (!message || message.length < 10) {
    return json(400, { error: 'Please enter at least 10 characters describing your issue.' });
  }
  if (message.length > 5000) {
    return json(400, { error: 'Message is too long (max 5000 characters).' });
  }

  const subject = (body.subject?.trim() || 'Auris support request').slice(0, 120);
  const fromEmail = user.email ?? 'unknown@auris.app';
  const text = [
    `From: ${fromEmail}`,
    `User ID: ${user.id}`,
    '',
    message,
  ].join('\n');

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: { user: smtpUser, pass: smtpPass },
    });

    await transporter.sendMail({
      from: `"Auris Support" <${smtpUser}>`,
      to: supportTo,
      replyTo: fromEmail,
      subject: `[Auris] ${subject}`,
      text,
    });

    return json(200, { ok: true });
  } catch (e) {
    console.error('SMTP send failed:', e);
    return json(500, { error: 'Could not send your message. Try again in a moment.' });
  }
});
