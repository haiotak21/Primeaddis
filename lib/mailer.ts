/**
 * Lightweight Resend.com mailer wrapper
 *
 * Environment variables:
 * - RESEND_API_KEY: required API key for Resend.com
 * - RESEND_FROM: optional default from address (used if `SMTP_FROM` is not set)
 * - SMTP_FROM: preferred from address used across the app (if set)
 */
export async function sendMail({
  to,
  subject,
  html,
  text,
  from,
}: {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not configured in environment');
  }

  const payload: Record<string, unknown> = {
    // Prefer the global `SMTP_FROM` env var so all app emails use the same sender
    from: from || process.env.SMTP_FROM || process.env.RESEND_FROM || 'no-reply@example.com',
    to,
    subject,
  };

  if (html) payload.html = html;
  if (text) payload.text = text;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '<unreadable>');
    throw new Error(`Resend send failed: ${res.status} ${res.statusText} - ${body}`);
  }

  return res.json();
}
