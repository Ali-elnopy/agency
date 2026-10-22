import React, { useMemo, useState } from 'react';
import Logo from '../components/Logo';

const REQUIREMENTS = [
  { id: 'length', label: 'At least 10 characters long', test: (value) => value.length >= 10 },
  {
    id: 'upper',
    label: 'Contains at least one uppercase letter (A-Z)',
    test: (value) => /[A-Z]/.test(value),
  },
  {
    id: 'number',
    label: 'Contains at least one number (0-9)',
    test: (value) => /\d/.test(value),
  },
  {
    id: 'symbol',
    label: 'Contains at least one special symbol (!@#$%^&*)',
    test: (value) => /[^A-Za-z0-9]/.test(value),
  },
];

const STRENGTH_LABELS = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];

export default function ResetPasswordPage({
  onNavigate,
  theme,
  onToggleTheme,
  email = '',
  accountEmail,
}) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [done, setDone] = useState(false);

  const passed = useMemo(
    () => REQUIREMENTS.filter((rule) => rule.test(password)).length,
    [password],
  );
  const strengthLabel = STRENGTH_LABELS[passed];
  const matches = confirm.length > 0 && confirm === password;
  const canSubmit = passed === REQUIREMENTS.length && matches;
  const target = email || accountEmail || 'your ORVIA workspace account';

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!canSubmit) return;
    setDone(true);
  };

  return (
    <section className="login">
      <header className="login__header">
        <a
          href="#login"
          className="brand"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('login');
          }}
        >
          <Logo />
          <span className="brand__text">
            <strong>ORVIA</strong>
          </span>
        </a>

        <div className="login__actions">
          <button
            type="button"
            className="theme-toggle"
            aria-label="Toggle dark mode"
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            <svg className="icon-moon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />
            </svg>
            <svg className="icon-sun" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
            </svg>
          </button>

          <ol className="stepper">
            <li className={done ? '' : 'is-active'}>1. Reset Form</li>
            <li className={done ? 'is-active' : ''}>2. Success</li>
            <li>3. Expired Link</li>
          </ol>
        </div>
      </header>

      <div className="login__body">
        <span className="badge">
          <svg aria-hidden="true">
            <use href="#i-key" />
          </svg>
          Secure Credential Update
        </span>

        <h1 className="login__title">Reset your password</h1>
        <p className="login__subtitle">Choose a strong, unique password for {target}</p>

        {done ? (
          <div className="auth-notice" role="status">
            <strong>Password updated</strong>
            <p className="auth-notice__text">
              Your credentials are secured. You can now sign in with your new password.
            </p>
            <button
              type="button"
              className="btn auth-notice__btn"
              onClick={() => onNavigate('login')}
            >
              Sign in to ORVIA
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </button>
          </div>
        ) : (
          <form className="form" onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="rp-password">New Password</label>
              <div className="input">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="rp-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="input__toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="pw-strength">
              <div className="pw-strength__head">
                <span>Password Strength</span>
                <strong className={passed === REQUIREMENTS.length ? 'is-strong' : ''}>
                  {password ? strengthLabel : '—'} ({passed}/4)
                </strong>
              </div>
              <div className="pw-strength__bar">
                {REQUIREMENTS.map((rule, index) => (
                  <i key={rule.id} className={index < passed ? 'is-on' : ''} />
                ))}
              </div>
            </div>

            <div className="pw-reqs">
              <ul>
                {REQUIREMENTS.map((rule) => {
                  const ok = rule.test(password);
                  return (
                    <li key={rule.id} className={ok ? 'is-ok' : ''}>
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <circle cx="12" cy="12" r="11" />
                        <path d="M7.4 12.3l3.1 3.1 6.1-6.6" />
                      </svg>
                      {rule.label}
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="field">
              <label htmlFor="rp-confirm">Confirm New Password</label>
              <div className="input">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  id="rp-confirm"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="input__toggle"
                  onClick={() => setShowConfirm(!showConfirm)}
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                >
                  {showConfirm ? (
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {matches && (
                <span className="pw-match">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M5 12.5l4.5 4.5L19 7.5" />
                  </svg>
                  Passwords match
                </span>
              )}
            </div>

            <button type="submit" className="btn" disabled={!canSubmit}>
              Update password &amp; sign in
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </button>

            <a
              href="#login"
              className="back-link"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('login');
              }}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M19 12H5M11 6l-6 6 6 6" />
              </svg>
              Return to Login
            </a>
          </form>
        )}
      </div>

      <footer className="login__footer">
        <p>
          Need assistance?{' '}
          <a href="#support" className="link link--strong" onClick={(e) => e.preventDefault()}>
            Contact Support
          </a>
        </p>
        <nav className="footer-nav">
          <span>Studio Security Protocol 2.4</span>
        </nav>
      </footer>
    </section>
  );
}
