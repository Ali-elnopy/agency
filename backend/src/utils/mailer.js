/**
 * Outbound email for transactional messages (password resets).
 *
 * Supported transports:
 *   - Gmail / Apple iCloud / Custom SMTP → set SMTP_USER & SMTP_PASS (and optionally SMTP_HOST / SMTP_PORT / SMTP_SECURE)
 *   - Resend HTTP API                    → set RESEND_API_KEY
 *   - Live Ethereal SMTP Webmail (dev)   → automatic fallback via nodemailer.createTestAccount()
 */

import dotenv from 'dotenv';

const RESEND_ENDPOINT = 'https://api.resend.com/emails';

const read = (key) => String(process.env[key] ?? '').trim();

let runtimeSmtp = { user: '', pass: '', host: '' };

export function setRuntimeSmtpConfig({ email, appPassword }) {
  const user = String(email ?? '').trim();
  const pass = String(appPassword ?? '').replace(/\s+/g, '');
  const domain = user.split('@')[1]?.toLowerCase() || '';
  const host =
    domain === 'icloud.com' || domain === 'me.com' || domain === 'mac.com'
      ? 'smtp.mail.me.com'
      : 'smtp.gmail.com';
  runtimeSmtp = { user, pass, host };
  smtpTransport = null;
  smtpCacheKey = '';
}

export function getMailConfig() {
  dotenv.config({ override: true });
  const resendKey = read('RESEND_API_KEY');
  const smtpUser = runtimeSmtp.user || read('SMTP_USER') || read('GMAIL_USER') || read('APPLE_EMAIL');
  const smtpPass = (runtimeSmtp.pass || read('SMTP_PASS') || read('GMAIL_APP_PASSWORD') || read('APPLE_APP_PASSWORD')).replace(/\s+/g, '');
  let smtpHost = runtimeSmtp.host || read('SMTP_HOST');

  if ((!smtpHost || smtpHost === 'smtp.gmail.com' || smtpHost === 'smtp.mail.me.com') && smtpUser) {
    const domain = smtpUser.split('@')[1]?.toLowerCase() || '';
    if (domain === 'gmail.com' || domain === 'googlemail.com') {
      smtpHost = 'smtp.gmail.com';
    } else if (domain === 'icloud.com' || domain === 'me.com' || domain === 'mac.com') {
      smtpHost = 'smtp.mail.me.com';
    }
  }

  const isGmail = smtpHost === 'smtp.gmail.com';
  const defaultPort = isGmail ? 465 : 587;
  const port = Number(read('SMTP_PORT') || defaultPort);
  const secure = read('SMTP_SECURE') ? read('SMTP_SECURE') === 'true' : port === 465;

  const hasRealSmtp = Boolean(smtpHost && smtpUser && smtpPass);

  return {
    provider: resendKey ? 'resend' : hasRealSmtp ? 'smtp' : null,
    resendKey,
    from: read('MAIL_FROM') || (smtpUser ? `ORVIA <${smtpUser}>` : 'ORVIA <no-reply@orvia.co>'),
    smtp: {
      host: smtpHost,
      port,
      secure,
      user: smtpUser,
      pass: smtpPass,
    },
  };
}

export function isMailerConfigured() {
  return getMailConfig().provider !== null || process.env.NODE_ENV !== 'production';
}

/** Base URL the reset link should point at (the SPA, not the API). */
export function frontendBaseUrl() {
  const raw = read('FRONTEND_URL') || read('CLIENT_URL').split(',')[0] || 'http://localhost:5173';

  return raw.replace(/\/+$/, '');
}

export function buildResetUrl(token) {
  return `${frontendBaseUrl()}/#reset?token=${encodeURIComponent(token)}`;
}

let smtpTransport = null;
let smtpCacheKey = '';
let etherealAccountPromise = null;

async function smtpTransportFor(config) {
  const key = `${config.smtp.host}:${config.smtp.port}:${config.smtp.user}`;
  if (!smtpTransport || smtpCacheKey !== key) {
    const { default: nodemailer } = await import('nodemailer');
    smtpTransport = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.secure,
      auth: config.smtp.user ? { user: config.smtp.user, pass: config.smtp.pass } : undefined,
    });
    smtpCacheKey = key;
  }

  return smtpTransport;
}

async function sendViaEthereal({ from, to, subject, html, text }) {
  const { default: nodemailer } = await import('nodemailer');
  if (!etherealAccountPromise) {
    etherealAccountPromise = nodemailer.createTestAccount();
  }
  const testAccount = await etherealAccountPromise;
  const transport = nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  const info = await transport.sendMail({
    from: from || `ORVIA <${testAccount.user}>`,
    to,
    subject,
    html,
    text,
  });

  const previewUrl = nodemailer.getTestMessageUrl(info) || '';
  console.log('\n================== [ORVIA SMTP EMAIL SENT] ==================');
  console.log(`To:          ${to}`);
  console.log(`Subject:     ${subject}`);
  console.log(`Webmail URL: ${previewUrl}`);
  console.log('=============================================================\n');
  return { provider: 'ethereal-smtp', previewUrl };
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

    return { provider: 'resend', previewUrl: '' };
  }

  if (config.provider === 'smtp') {
    const transport = await smtpTransportFor(config);
    await transport.sendMail({ from: config.from, to, subject, html, text });
    console.log(`[ORVIA Mailer] Sent real SMTP email via ${config.smtp.host} to ${to}`);
    return { provider: 'smtp', previewUrl: '' };
  }

  if (process.env.NODE_ENV !== 'production') {
    console.log('\n================== [ORVIA IN-APP VERIFICATION CODE] ==================');
    console.log(`To:      ${to}`);
    console.log(`Subject: ${subject}`);
    console.log('======================================================================\n');
    return { provider: 'in-app', previewUrl: '' };
  }

  throw new Error('No mail transport is configured (RESEND_API_KEY or SMTP_USER/SMTP_PASS).');
}

function resetEmailBody({ fullName, resetUrl, token, expiresInMinutes }) {
  const name = fullName || 'there';

  const text = [
    `Hi ${name},`,
    '',
    'We received a request to reset the password for your ORVIA workspace account.',
    '',
    `Your 6-digit verification code is: ${token}`,
    '',
    `Enter this code in the ORVIA password reset screen (valid for ${expiresInMinutes} minutes).`,
    '',
    'If you did not request this, you can ignore this email — your current password stays unchanged.',
    '',
    'ORVIA — Studio Workspace',
  ].join('\n');

  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:32px 16px;background:#F4F3EF;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#17171C;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:0 auto;background:#FFFFFF;border-radius:24px;padding:36px;border:1px solid #E5E3DE;">
      <tr><td>
        <p style="margin:0 0 20px;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#6E6D72;font-weight:700;">ORVIA · STUDIO WORKSPACE</p>
        <h1 style="margin:0 0 14px;font-size:26px;line-height:1.2;color:#17171C;">Your verification code</h1>
        <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#45454d;">Hi <strong>${name}</strong>, enter this 6-digit verification code in ORVIA to reset your password:</p>
        <div style="background:#F4F3EF;border:2px dashed #17171C;border-radius:16px;padding:22px 18px;margin:0 0 22px;text-align:center;">
          <div style="font-size:11px;text-transform:uppercase;letter-spacing:.14em;color:#6E6D72;margin-bottom:8px;font-weight:700;">Verification Code · رمز التحقق</div>
          <div style="font-family:'JetBrains Mono',monospace;font-size:36px;font-weight:800;letter-spacing:10px;color:#17171C;">${token}</div>
        </div>
        <p style="margin:0 0 20px;font-size:13.5px;line-height:1.6;color:#6E6D72;">This code is valid for <strong>${expiresInMinutes} minutes</strong> and can only be used once.</p>
        <hr style="border:0;border-top:1px solid #E5E3DE;margin:0 0 16px;" />
        <p style="margin:0;font-size:12px;line-height:1.6;color:#6E6D72;">If you did not request this, you can safely ignore this email — your password stays unchanged.</p>
      </td></tr>
    </table>
  </body>
</html>`;

  return { text, html };
}

export async function sendPasswordResetEmail({ to, fullName, token, expiresInMinutes = 30 }) {
  const resetUrl = buildResetUrl(token);
  const { text, html } = resetEmailBody({ fullName, resetUrl, token, expiresInMinutes });

  const mailResult = await sendMail({
    to,
    subject: `ORVIA Verification Code: ${token}`,
    text,
    html,
  });

  return {
    resetUrl,
    token,
    provider: mailResult?.provider || 'smtp',
    previewUrl: mailResult?.previewUrl || '',
  };
}
