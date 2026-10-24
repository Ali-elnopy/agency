/**
 * Outbound email for transactional messages (currently password resets).
 *
 * Two transports are supported so the project works with a hosted provider or
 * a plain mailbox:
 *   - Resend  → set RESEND_API_KEY (HTTP API, no dependency)
 *   - SMTP    → set SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS (nodemailer)
 *
 * When neither is configured `isMailerConfigured()` returns false and the auth
 * service answers with a clear "not configured" error instead of pretending an
 * email was sent.
 */

const RESEND_ENDPOINT = 'https://api.resend.com/emails';

const read = (key) => String(process.env[key] ?? '').trim();

export function getMailConfig() {
  const resendKey = read('RESEND_API_KEY');
  const smtpHost = read('SMTP_HOST');

  return {
    provider: resendKey ? 'resend' : smtpHost ? 'smtp' : null,
    resendKey,
    from: read('MAIL_FROM') || 'ORVIA <onboarding@resend.dev>',
    smtp: {
      host: smtpHost,
      port: Number(read('SMTP_PORT') || 587),
      secure: read('SMTP_SECURE') === 'true',
      user: read('SMTP_USER'),
      pass: read('SMTP_PASS'),
    },
  };
}

export function isMailerConfigured() {
  return getMailConfig().provider !== null;
}

/** Base URL the reset link should point at (the SPA, not the API). */
export function frontendBaseUrl() {
  const raw =
    read('FRONTEND_URL') ||
    read('CLIENT_URL').split(',')[0] ||
    'http://localhost:5173';

  return raw.replace(/\/+$/, '');
}

export function buildResetUrl(token) {
  return `${frontendBaseUrl()}/#reset?token=${encodeURIComponent(token)}`;
}

let smtpTransport = null;

async function smtpTransportFor(config) {
  if (!smtpTransport) {
    const { default: nodemailer } = await import('nodemailer');
    smtpTransport = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.secure,
      auth: config.smtp.user ? { user: config.smtp.user, pass: config.smtp.pass } : undefined,
    });
  }

  return smtpTransport;
}

export async function sendMail({ to, subject, html, text }) {
  const config = getMailConfig();

  if (config.provider === 'resend') {
    const response = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from: config.from, to: [to], subject, html, text }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      throw new Error(`Resend rejected the message (${response.status}): ${detail.slice(0, 300)}`);
    }

    return { provider: 'resend' };
  }

  if (config.provider === 'smtp') {
    const transport = await smtpTransportFor(config);
    await transport.sendMail({ from: config.from, to, subject, html, text });
    return { provider: 'smtp' };
  }

  throw new Error('No mail transport is configured (RESEND_API_KEY or SMTP_HOST).');
}

function resetEmailBody({ fullName, resetUrl, expiresInMinutes }) {
  const name = fullName || 'there';

  const text = [
    `Hi ${name},`,
    '',
    'We received a request to reset the password for your ORVIA workspace account.',
    `Open this link to choose a new password (valid for ${expiresInMinutes} minutes):`,
    resetUrl,
    '',
    'If you did not request this, you can ignore this email — your current password stays unchanged.',
    '',
    'ORVIA — Agency OS',
  ].join('\n');

  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:32px 16px;background:#f4f5f9;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#1b1d29;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:16px;padding:36px;border:1px solid #e6e8f0;">
      <tr><td>
        <p style="margin:0 0 24px;font-size:13px;letter-spacing:.18em;text-transform:uppercase;color:#6a6f85;">ORVIA — Agency OS</p>
        <h1 style="margin:0 0 16px;font-size:24px;line-height:1.3;">Reset your password</h1>
        <p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#3c4157;">Hi ${name}, we received a request to reset the password for your workspace account.</p>
        <p style="margin:0 0 28px;font-size:15px;line-height:1.6;color:#3c4157;">This link is valid for ${expiresInMinutes} minutes and can be used once.</p>
        <p style="margin:0 0 28px;">
          <a href="${resetUrl}" style="display:inline-block;background:#ff5a36;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:14px 26px;border-radius:999px;">Choose a new password</a>
        </p>
        <p style="margin:0 0 8px;font-size:13px;line-height:1.6;color:#6a6f85;">If the button does not work, copy this address into your browser:</p>
        <p style="margin:0 0 28px;font-size:13px;line-height:1.6;word-break:break-all;color:#3c4157;">${resetUrl}</p>
        <hr style="border:0;border-top:1px solid #e6e8f0;margin:0 0 20px;" />
        <p style="margin:0;font-size:12px;line-height:1.6;color:#6a6f85;">If you did not request this, you can ignore this email — your current password stays unchanged.</p>
      </td></tr>
    </table>
  </body>
</html>`;

  return { text, html };
}

export async function sendPasswordResetEmail({
  to,
  fullName,
  token,
  expiresInMinutes = 30,
}) {
  const resetUrl = buildResetUrl(token);
  const { text, html } = resetEmailBody({ fullName, resetUrl, expiresInMinutes });

  await sendMail({
    to,
    subject: 'Reset your ORVIA password',
    text,
    html,
  });

  return { resetUrl };
}
