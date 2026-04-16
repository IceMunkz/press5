import type { APIRoute } from 'astro';
import { z } from 'zod';

export const prerender = false;

const schema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  subject: z.enum(['Web Hosting', 'TeamSpeak Hosting', 'Discord Bot Hosting', 'General']),
  message: z.string().min(20).max(2000),
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
  const contactEmail = import.meta.env.CONTACT_EMAIL ?? 'admin@press5.xyz';

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
      subject: `[Press5] ${subject} enquiry from ${name}`,
      html: `
        <h2>New contact form submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
        <p><strong>Subject:</strong> ${subject}</p>
        <hr/>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br/>')}</p>
      `,
    });

    // Send confirmation to user
    await resend.emails.send({
      from: 'Press5.xyz <noreply@press5.xyz>',
      to: email,
      subject: `We received your message — Press5.xyz`,
      html: `
        <h2>Thanks for reaching out, ${name}!</h2>
        <p>We've received your message about <strong>${subject}</strong> and will get back to you within 24 hours.</p>
        <p>In the meantime, feel free to join our TeamSpeak server at <strong>press5.xyz</strong> for a quicker chat.</p>
        <br/>
        <p>— The Press5.xyz Team</p>
      `,
    });

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err) {
    console.error('[Contact API] Resend error:', err);
    return new Response(JSON.stringify({ error: 'Failed to send email' }), { status: 500 });
  }
};
