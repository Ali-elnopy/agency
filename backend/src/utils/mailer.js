/**
 * Outbound email for transactional messages (password resets).
 *
 * Supported transports:
 *   - Resend official Node SDK          → set RESEND_API_KEY (preferred)
 *   - Gmail / Apple iCloud / Custom SMTP → set SMTP_USER & SMTP_PASS (and optionally SMTP_HOST / SMTP_PORT / SMTP_SECURE)
 *   - Live Ethereal SMTP Webmail (dev)   → automatic fallback via nodemailer.createTestAccount()
 */

import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';

const RESEND_ENDPOINT = 'https://api.resend.com/emails';

const read = (key) => String(process.env[key] ?? '').trim();
const appName = () => read('APP_NAME') || 'ORVIA';

const isPlaceholder = (val) =>
  !val ||
  val === 're_your_resend_api_key' ||
  val === 'your_resend_api_key' ||
  val === 'your_google_app_password' ||
  val === 'your.address@gmail.com';

let runtimeSmtp = { user: '', pass: '', host: '', resendKey: '', mailFrom: '' };

export function setRuntimeSmtpConfig({ email, appPassword, resendApiKey, mailFrom }) {
  const user = String(email ?? '').trim();
  const pass = String(appPassword ?? '').replace(/\s+/g, '');
  const rKey = String(resendApiKey ?? '').trim();
  const mFrom = String(mailFrom ?? '').trim();
  const domain = user.split('@')[1]?.toLowerCase() || '';
  const host =
    domain === 'icloud.com' || domain === 'me.com' || domain === 'mac.com'
      ? 'smtp.mail.me.com'
      : 'smtp.gmail.com';
  runtimeSmtp = {
    user: user || runtimeSmtp.user,
    pass: pass || runtimeSmtp.pass,
    host: user ? host : runtimeSmtp.host,
    resendKey: rKey || runtimeSmtp.resendKey,
    mailFrom: mFrom || runtimeSmtp.mailFrom,
  };
  smtpTransport = null;
  smtpCacheKey = '';

  // Also persist to backend/.env in development so it survives server restarts
  if (process.env.NODE_ENV !== 'production') {
    try {
      const envPath = path.resolve(process.cwd(), '.env');
      let content = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
      const upsert = (k, v) => {
        const re = new RegExp(`^${k}=.*$`, 'm');
        if (re.test(content)) content = content.replace(re, `${k}=${v}`);
        else content += `\n${k}=${v}`;
      };
      if (rKey) {
        upsert('RESEND_API_KEY', rKey);
        process.env.RESEND_API_KEY = rKey;
      }
      if (mFrom) {
        upsert('MAIL_FROM', `"${mFrom.replace(/"/g, '')}"`);
        process.env.MAIL_FROM = mFrom;
      }
      if (user) {
        upsert('SMTP_USER', user);
        upsert('SMTP_HOST', host);
        upsert('SMTP_PORT', host === 'smtp.gmail.com' ? '465' : '587');
        process.env.SMTP_USER = user;
        process.env.SMTP_HOST = host;
      }
      if (pass) {
        upsert('SMTP_PASS', pass);
        process.env.SMTP_PASS = pass;
      }
      fs.writeFileSync(envPath, content, 'utf8');
    } catch {
      // Best-effort persistence in dev
    }
  }
}

export function getMailConfig() {
  dotenv.config({ override: true });
  const rawResend = runtimeSmtp.resendKey || read('RESEND_API_KEY');
  const resendKey = isPlaceholder(rawResend) ? '' : rawResend;

  const rawUser = runtimeSmtp.user || read('SMTP_USER') || read('GMAIL_USER') || read('APPLE_EMAIL');
  const smtpUser = isPlaceholder(rawUser) ? '' : rawUser;

  const rawPass = (
    runtimeSmtp.pass ||
    read('SMTP_PASS') ||
    read('GMAIL_APP_PASSWORD') ||
    read('APPLE_APP_PASSWORD')
  ).replace(/\s+/g, '');
  const smtpPass = isPlaceholder(rawPass) ? '' : rawPass;

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
  const customFrom = runtimeSmtp.mailFrom || read('MAIL_FROM') || read('EMAIL_FROM');

  return {
    provider: resendKey ? 'resend' : hasRealSmtp ? 'smtp' : null,
    resendKey,
    from:
      resendKey
        ? customFrom && !customFrom.includes('@gmail.com')
          ? customFrom
          : 'ORVIA <onboarding@resend.dev>'
        : customFrom || (smtpUser ? `ORVIA <${smtpUser}>` : 'ORVIA <no-reply@orvia.co>'),
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

async function sendViaResend(config, { to, subject, html, text }) {
  // Official SDK: https://github.com/resend/resend-node
  const { Resend } = await import('resend');
  const resend = new Resend(config.resendKey);
  const { data, error } = await resend.emails.send({
    from: config.from,
    to: [to],
    subject,
    html,
    text,
  });

  if (error) {
    const detail = error.message || JSON.stringify(error).slice(0, 300);
    throw new Error(`Resend rejected the message: ${detail}`);
  }

  return { provider: 'resend', id: data?.id || '', previewUrl: '' };
}

async function sendViaResendHttp(config, { to, subject, html, text }) {
  // Kept as a safety net for environments where the SDK cannot be loaded.
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
    try {
      return await sendViaResend(config, { to, subject, html, text });
    } catch (error) {
      const sdkUnavailable =
        error?.code === 'ERR_MODULE_NOT_FOUND' ||
        /Cannot find package 'resend'/.test(String(error?.message || ''));

      if (!sdkUnavailable) throw error;

      console.warn('[ORVIA Mailer] resend SDK unavailable, using the HTTP API instead.');
      return sendViaResendHttp(config, { to, subject, html, text });
    }
  }

  if (config.provider === 'smtp') {
    const transport = await smtpTransportFor(config);
    await transport.sendMail({ from: config.from, to, subject, html, text });
    console.log(`[ORVIA Mailer] Sent real SMTP email via ${config.smtp.host} to ${to}`);
    return { provider: 'smtp', previewUrl: '' };
  }

  if (process.env.NODE_ENV !== 'production') {
    // Development fallback: a real SMTP send into an Ethereal test inbox.
    // It is not a fake success — the message is delivered and can be opened
    // through the preview URL returned to the client.
    return sendViaEthereal({ from: config.from, to, subject, html, text });
  }

  throw new Error('No mail transport is configured (RESEND_API_KEY or SMTP_USER/SMTP_PASS).');
}

function resetEmailBody({ fullName, token, expiresInMinutes }) {
  const name = fullName || 'there';
  const product = appName();

  const text = [
    `Hello ${name},`,
    '',
    `We received a request to reset the password for your ${product} account.`,
    '',
    `Your verification code is: ${token}`,
    '',
    `This code expires in ${expiresInMinutes} minutes and can only be used once.`,
    '',
    'Never share this code with anyone. Our team will never ask you for it.',
    '',
    'If you did not request this password reset, please ignore this email — your current password stays unchanged.',
    '',
    'Best regards,',
    `${product} Team`,
  ].join('\n');

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Password Reset Verification Code</title>
  </head>
  <body style="margin:0;padding:32px 16px;background:#F4F3EF;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#17171C;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;">
      Your ${product} verification code is ${token}. Enter this 6-digit code to reset your password (expires in ${expiresInMinutes} minutes).
    </div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:0 auto;background:#FFFFFF;border-radius:24px;padding:36px;border:1px solid #E5E3DE;">
      <tr><td>
        <p style="margin:0 0 20px;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#6E6D72;font-weight:700;">${product} · PASSWORD RESET</p>
        <h1 style="margin:0 0 14px;font-size:26px;line-height:1.2;color:#17171C;">Password Reset Verification Code</h1>
        <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#45454d;">Hello <strong>${name}</strong>,</p>
        <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#45454d;">We received a request to reset the password for your ${product} account. Enter this verification code to continue:</p>
        <div style="background:#F4F3EF;border:2px dashed #17171C;border-radius:16px;padding:22px 18px;margin:0 0 22px;text-align:center;">
          <div style="font-size:11px;text-transform:uppercase;letter-spacing:.14em;color:#6E6D72;margin-bottom:8px;font-weight:700;">Your verification code</div>
          <div style="font-family:'JetBrains Mono',Consolas,monospace;font-size:38px;font-weight:800;letter-spacing:12px;color:#17171C;">${token}</div>
        </div>
        <p style="margin:0 0 12px;font-size:13.5px;line-height:1.6;color:#6E6D72;">This code expires in <strong>${expiresInMinutes} minutes</strong> and can only be used once.</p>
        <p style="margin:0 0 20px;font-size:13.5px;line-height:1.6;color:#6E6D72;">Never share this code with anyone. Our team will never ask you for it.</p>
        <hr style="border:0;border-top:1px solid #E5E3DE;margin:0 0 16px;" />
        <p style="margin:0;font-size:12px;line-height:1.6;color:#6E6D72;">If you did not request this password reset, please ignore this email — your current password stays unchanged.</p>
        <p style="margin:16px 0 0;font-size:12px;line-height:1.6;color:#6E6D72;">Best regards,<br /><strong>${product} Team</strong></p>
      </td></tr>
    </table>
  </body>
</html>`;

  return { text, html };
}

export async function sendPasswordResetEmail({ to, fullName, token, expiresInMinutes = 10 }) {
  const { text, html } = resetEmailBody({ fullName, token, expiresInMinutes });

  const mailResult = await sendMail({
    to,
    subject: 'Password Reset Verification Code',
    text,
    html,
  });

  return {
    token,
    provider: mailResult?.provider || 'smtp',
    previewUrl: mailResult?.previewUrl || '',
  };
}
