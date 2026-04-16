import type { APIRoute } from 'astro';
import { z } from 'zod';

export const prerender = false;

const SUBJECTS = [
  'Web Hosting',
  'Game Server Hosting',
  'TeamSpeak Hosting',
  'Discord Bot Hosting',
  'Lavalink Hosting',
  'General',
] as const;

const schema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  subject: z.enum(SUBJECTS),
  message: z.string().min(10).max(2000),
  honeypot: z.string().max(0),
});

export const POST: APIRoute = async ({ request }) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
  }

  const result = schema.safeParse(body);
  if (!result.success) {
    return new Response(JSON.stringify({ error: 'Validation failed', issues: result.error.issues }), { status: 422 });
  }

  const { name, email, subject, message } = result.data;

  const apiKey = import.meta.env.RESEND_API_KEY;
  const contactEmail = import.meta.env.CONTACT_EMAIL ?? 'admin@snaildev.uk';

  if (!apiKey) {
    // Dev mode: just log and succeed
    console.log('[Contact form]', { name, email, subject, message });
    return new Response(JSON.stringify({ ok: true, dev: true }), { status: 200 });
  }

  try {
    const { Resend } = await import('resend');
    const resend = new Resend(apiKey);

    // Send notification to owner
    await resend.emails.send({
      from: 'Press5 Contact <noreply@press5.xyz>',
      to: contactEmail,
      replyTo: email,
      subject: `[Press5] ${subject} enquiry from ${name}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px;">
          <h2 style="color: #2563EB;">New enquiry — ${subject}</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; font-weight: bold; color: #374151; width: 100px;">Name</td><td style="padding: 8px 0;">${name}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold; color: #374151;">Email</td><td style="padding: 8px 0;"><a href="mailto:${email}">${email}</a></td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold; color: #374151;">Service</td><td style="padding: 8px 0;">${subject}</td></tr>
          </table>
          <hr style="margin: 16px 0; border: none; border-top: 1px solid #E5E7EB;" />
          <h3 style="color: #374151; margin-bottom: 8px;">Message</h3>
          <p style="color: #4B5563; line-height: 1.6;">${message.replace(/\n/g, '<br/>')}</p>
        </div>
      `,
    });

    // Send confirmation to user
    await resend.emails.send({
      from: 'Press5.xyz <noreply@press5.xyz>',
      to: email,
      subject: `We got your message — Press5.xyz`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px;">
          <h2 style="color: #2563EB;">Thanks, ${name}!</h2>
          <p style="color: #4B5563; line-height: 1.6;">We've received your enquiry about <strong>${subject}</strong> and will get back to you within 24 hours — usually sooner.</p>
          <p style="color: #4B5563; line-height: 1.6;">In the meantime, you're welcome to join our TeamSpeak server at <strong>press5.xyz</strong> for a quicker chat.</p>
          <br/>
          <p style="color: #6B7280; font-size: 14px;">— The Press5.xyz Team</p>
        </div>
      `,
    });

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err) {
    console.error('[Contact API] Resend error:', err);
    return new Response(JSON.stringify({ error: 'Failed to send email' }), { status: 500 });
  }
};
