const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isValidEmail(value) {
  return EMAIL_PATTERN.test(String(value ?? '').trim());
}

export function validateProfile(values) {
  const errors = {};
  const fullName = String(values.fullName ?? '').trim();
  const email = String(values.email ?? '').trim();

  if (!fullName) errors.fullName = 'Full name is required.';
  if (!email) errors.email = 'Work email is required.';
  else if (!isValidEmail(email)) errors.email = 'Enter a valid email address.';

  return errors;
}

export function validatePasswordChange({ currentPassword, newPassword }) {
  const errors = {};

  if (!currentPassword) errors.currentPassword = 'Enter your current password.';
  if (!newPassword) errors.newPassword = 'Enter a new password.';
  else if (String(newPassword).length < 8) errors.newPassword = 'Use at least 8 characters.';

  return errors;
}
