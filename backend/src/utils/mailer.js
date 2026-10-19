// Placeholder: لحد ما نقرر قناة الإشعارات (open decision في الـ brief).
// بعدين نبدّله بـ nodemailer / أي provider.
export async function sendMail({ to, subject, text }) {
  console.log(`📧 [mail stub] to=${to} | ${subject}\n${text}`);
}
