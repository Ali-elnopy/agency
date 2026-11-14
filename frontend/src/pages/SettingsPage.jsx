import React, { useState } from 'react';
import Toast from '../components/ui/Toast';
import useAuth from '../hooks/useAuth';
import useToast from '../hooks/useToast';
import { useSprint3 } from '../context/sprint3Store';
import { changePassword } from '../services/users';
import { validatePasswordChange } from '../utils/validation';

const PASSWORD_RULES = [
  { id: 'length', label: '16+ characters', test: (value) => value.length >= 16 },
  { id: 'upper', label: 'Uppercase (A-Z)', test: (value) => /[A-Z]/.test(value) },
  { id: 'number', label: 'Numbers (0-9)', test: (value) => /[0-9]/.test(value) },
  { id: 'symbol', label: 'Special symbol (!@#)', test: (value) => /[^A-Za-z0-9]/.test(value) },
];

const STRENGTH_LABELS = ['Weak', 'Weak', 'Fair', 'Good', 'Strong'];

function strengthOf(value) {
  if (!value) return 0;
  return PASSWORD_RULES.reduce((count, rule) => (rule.test(value) ? count + 1 : count), 0);
}

export default function SettingsPage({ onSignOut }) {
  const { user } = useAuth();
  const { toast, showToast } = useToast(3500);
  const { t } = useSprint3();

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [changingPassword, setChangingPassword] = useState(false);
  const [visible, setVisible] = useState({ current: false, next: false, confirm: false });

  const notify = (message, tone = 'success') => showToast(t(message), tone);

  const strength = strengthOf(passwordForm.newPassword);
  const passwordsMatch =
    passwordForm.confirmPassword.length > 0 &&
    passwordForm.confirmPassword === passwordForm.newPassword;

  const updatePasswordField = (field) => (event) => {
    const { value } = event.target;

    setPasswordForm((prev) => ({ ...prev, [field]: value }));
    setPasswordErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handlePasswordUpdate = async () => {
    const nextErrors = validatePasswordChange(passwordForm);

    if (
      passwordForm.newPassword &&
      PASSWORD_RULES.some((rule) => !rule.test(passwordForm.newPassword))
    ) {
      nextErrors.newPassword =
        t('Use 16+ characters with an uppercase letter, a number and a special symbol.');
    }

    if (passwordForm.newPassword && passwordForm.currentPassword === passwordForm.newPassword) {
      nextErrors.newPassword = t('Choose a password that differs from your current one.');
    }

    setPasswordErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setChangingPassword(true);

    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      notify('Password changed successfully.');
    } catch (error) {
      notify(error.message || 'Could not update your password. Please check your current password.', 'danger');
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="page-screen st-page">
      <header className="st-head">
        <span className="st-eyebrow">{t('Admin Settings')}</span>
        <h1>{t('Settings')}</h1>
        <p>{t('Update password and session preferences.')}</p>
      </header>

      <section className="st-card st-security">
        <header className="st-card__head st-card__head--row">
          <div>
            <h2>{t('Security')}</h2>
            <p>{t('Update password and session preferences.')}</p>
          </div>
          <span className="st-card__icon st-card__icon--purple">
            <svg aria-hidden="true" className="icon">
              <use href="#i-lock" />
            </svg>
          </span>
        </header>

        <div className="st-security__grid">
          <div className="st-security__form">
            <div className="pf-field">
              <div className="pf-label-row">
                <label className="pf-label" htmlFor="pf-current">
                  {t('Current Password')}
                </label>
              </div>
              <div className="pf-password">
                <input
                  id="pf-current"
                  className="pf-input"
                  type={visible.current ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  value={passwordForm.currentPassword}
                  onChange={updatePasswordField('currentPassword')}
                  autoComplete="current-password"
                  aria-invalid={Boolean(passwordErrors.currentPassword)}
                />
                <button
                  type="button"
                  className="pf-eye"
                  aria-label={visible.current ? t('Hide password') : t('Show password')}
                  onClick={() => setVisible((prev) => ({ ...prev, current: !prev.current }))}
                >
                  <svg aria-hidden="true" className="icon">
                    <use href="#i-eye" />
                  </svg>
                </button>
              </div>
              {passwordErrors.currentPassword && (
                <span className="st-error">{t(passwordErrors.currentPassword)}</span>
              )}
            </div>

            <div className="pf-field">
              <div className="pf-label-row">
                <label className="pf-label" htmlFor="pf-new">
                  {t('New Password')}
                </label>
              </div>
              <div className="pf-password">
                <input
                  id="pf-new"
                  className="pf-input"
                  type={visible.next ? 'text' : 'password'}
                  placeholder={t('Enter fresh passphrase')}
                  value={passwordForm.newPassword}
                  onChange={updatePasswordField('newPassword')}
                  autoComplete="new-password"
                  aria-invalid={Boolean(passwordErrors.newPassword)}
                />
                <button
                  type="button"
                  className="pf-eye"
                  aria-label={visible.next ? t('Hide password') : t('Show password')}
                  onClick={() => setVisible((prev) => ({ ...prev, next: !prev.next }))}
                >
                  <svg aria-hidden="true" className="icon">
                    <use href="#i-eye" />
                  </svg>
                </button>
              </div>
              {passwordErrors.newPassword && (
                <span className="st-error">{t(passwordErrors.newPassword)}</span>
              )}
            </div>

            <div className="pf-strength">
              <div className="pf-strength__head">
                <span>{t('Security strength:')}</span>
                <span className="pf-strength__bars" aria-hidden="true">
                  {PASSWORD_RULES.map((rule, index) => (
                    <i key={rule.id} className={index < strength ? 'is-on' : ''} />
                  ))}
                </span>
                <strong>
                  {t(STRENGTH_LABELS[strength])} ({strength}/4)
                </strong>
              </div>

              <ul className="pf-checks">
                {PASSWORD_RULES.map((rule) => {
                  const passed = rule.test(passwordForm.newPassword);
                  return (
                    <li key={rule.id} className={passed ? 'is-pass' : ''}>
                      <svg aria-hidden="true" className="icon">
                        <use href={passed ? '#i-check' : '#i-circle'} />
                      </svg>
                      {t(rule.label)}
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="pf-field">
              <div className="pf-label-row">
                <label className="pf-label" htmlFor="pf-confirm">
                  {t('Confirm New Password')}
                </label>
              </div>
              <div className="pf-password">
                <input
                  id="pf-confirm"
                  className="pf-input"
                  type={visible.confirm ? 'text' : 'password'}
                  placeholder={t('Re-type new passphrase')}
                  value={passwordForm.confirmPassword}
                  onChange={updatePasswordField('confirmPassword')}
                  autoComplete="new-password"
                  aria-invalid={Boolean(passwordErrors.confirmPassword)}
                />
                <button
                  type="button"
                  className="pf-eye"
                  aria-label={visible.confirm ? t('Hide password') : t('Show password')}
                  onClick={() => setVisible((prev) => ({ ...prev, confirm: !prev.confirm }))}
                >
                  <svg aria-hidden="true" className="icon">
                    <use href="#i-eye" />
                  </svg>
                </button>
              </div>
              {passwordErrors.confirmPassword && (
                <span className="st-error">{t(passwordErrors.confirmPassword)}</span>
              )}
              {passwordsMatch && (
                <span className="pf-match">
                  <svg aria-hidden="true" className="icon">
                    <use href="#i-check" />
                  </svg>
                  {t('Passwords match correctly')}
                </span>
              )}
            </div>

            <div className="pf-security-actions">
              <button
                type="button"
                className="pf-update"
                onClick={handlePasswordUpdate}
                disabled={changingPassword}
              >
                {changingPassword ? t('Updating…') : t('Update password')}
              </button>
              <button
                type="button"
                className="pf-logout"
                onClick={() => {
                  if (onSignOut) onSignOut();
                  else notify('Signed out.', 'info');
                }}
              >
                <svg aria-hidden="true" className="icon">
                  <use href="#i-logout" />
                </svg>
                {t('Log out')}
              </button>
            </div>
          </div>

          <aside className="st-sessions">
            <span className="st-sessions__icon">
              <svg aria-hidden="true" className="icon">
                <use href="#i-shield" />
              </svg>
            </span>
            <strong>{t('Active Sessions')}</strong>
            <p>{t('Logged in on 3 devices')}</p>
            <button
              type="button"
              className="st-sessions__button"
              onClick={() => notify('Signed out of all other devices.')}
            >
              {t('Log out all devices')}
            </button>
            <span className="st-sessions__user">
              {t(user?.fullName || 'Elena Vance')}
              <small>{user?.role === 'ADMIN' ? t('Workspace Admin') : t('Account Manager')}</small>
            </span>
          </aside>
        </div>
      </section>

      <Toast message={toast?.message} tone={toast?.tone} />
    </div>
  );
}
