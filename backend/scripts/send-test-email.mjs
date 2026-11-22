/**
 * Sends one real password-reset email so email delivery can be verified
 * independently of the database and the HTTP API.
 *
 * Usage:
 *   npm run mail:test -- you@example.com
 *   MAIL_TEST_TO=you@example.com npm run mail:test
 *
 * With RESEND_API_KEY or SMTP_USER/SMTP_PASS set, this goes to the real inbox.
 * In development with no provider configured it uses Ethereal and prints the
 * preview URL of the delivered test message.
 */
import { getMailConfig, sendPasswordResetEmail } from '../src/utils/mailer.js';

const to = process.argv[2] || process.env.MAIL_TEST_TO;

if (!to) {
  console.error('Usage: npm run mail:test -- you@example.com');
  process.exit(1);
}

const config = getMailConfig();

console.log('Mail transport:', config.provider || 'development fallback (Ethereal / in-app)');
console.log('From address:  ', config.from);
console.log('Recipient:     ', to);

const token = String(Math.floor(100000 + Math.random() * 900000));

try {
  const result = await sendPasswordResetEmail({
    to,
    fullName: 'Mail Delivery Test',
    token,
    expiresInMinutes: 10,
  });

  console.log('\nDelivered through:', result.provider);
  console.log('Subject:           Password Reset Verification Code');
  console.log('Test code:        ', token);

  if (result.previewUrl) {
    console.log('Preview inbox:    ', result.previewUrl);
  }

  if (result.provider === 'in-app') {
    console.log(
      '\nNo real transport was configured, so nothing left this machine. ' +
        'Set RESEND_API_KEY (recommended) or SMTP_USER/SMTP_PASS in backend/.env and run again.',
    );
    process.exitCode = 2;
  }
} catch (error) {
  console.error('\nEmail delivery failed:', error?.message || error);
  console.error(
    'Check RESEND_API_KEY / MAIL_FROM (or SMTP_USER / SMTP_PASS) and the provider dashboard.',
  );
  process.exitCode = 1;
}
