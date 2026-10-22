import React, { useState } from 'react';
import { forgotPasswordApi } from '../services/api';
import Logo from '../components/Logo';

export default function ForgotPage({ onNavigate, theme, onToggleTheme, onEmailSubmit }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError('');

    const result = await forgotPasswordApi(email);

    if (result.success) {
      setSubmitted(true);
      setMessage(result.message);
      if (onEmailSubmit) onEmailSubmit(email);
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  return (
    <section className="login">
      <header className="login__header">
        <a
          href="#login"
          className="back-link--top"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('login');
          }}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor">
            <path d="M19 12H5M11 6l-6 6 6 6" />
          </svg>
          Back to Sign In
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
            <li className={submitted ? '' : 'is-active'}>Forgot Password</li>
            <li className={submitted ? 'is-active' : ''}>Sent ✓</li>
          </ol>
        </div>
      </header>

      <div className="login__body">
        <a
          href="#login"
          className="brand brand--body"
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

        <h1 className="login__title">Forgot your password?</h1>
        <p className="login__subtitle">
          Enter the work email your agency uses and we&apos;ll send you a secure reset link.
        </p>

        {submitted ? (
          <div className="auth-notice" role="status">
            <strong>Check your inbox!</strong>
            <p className="auth-notice__text">{message}</p>
            <button
              type="button"
              className="btn auth-notice__btn"
              onClick={() => onNavigate('login')}
            >
              Return to Sign In
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </button>
            <a
              href="#reset"
              className="back-link"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('reset');
              }}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
              I already have a reset link
            </a>
          </div>
        ) : (
          <form className="form" onSubmit={handleSubmit}>
            {error && (
              <div className="form__error" role="alert">
                {error}
              </div>
            )}

            <div className="field">
              <label htmlFor="reset-email">Work Email Address</label>
              <div className="input input--icon">
                <svg className="input__lead" viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="3" y="5" width="18" height="14" rx="2.5" />
                  <path d="M3.5 7.5l8.5 6 8.5-6" />
                </svg>
                <input
                  type="email"
                  id="reset-email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@agency.com"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn" disabled={loading}>
              {loading ? 'Sending…' : 'Send reset link'}
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </button>

            <div className="notice">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 3l7 3v6c0 4.2-2.9 7.7-7 9-4.1-1.3-7-4.8-7-9V6z" />
                <path d="M9.2 12.2l2 2 3.6-3.9" />
              </svg>
              <div className="notice__body">
                <strong>Security Notice</strong>
                For security reasons, we do not confirm whether an account exists with this email
                address.
              </div>
            </div>
          </form>
        )}
      </div>

      <footer className="login__footer">
        <p>End-to-end 256-bit encryption</p>
        <nav className="footer-nav">
          <a href="#privacy" onClick={(e) => e.preventDefault()}>
            Privacy Policy
          </a>
          <span className="dot">·</span>
          <a href="#help" onClick={(e) => e.preventDefault()}>
            Help Desk
          </a>
        </nav>
      </footer>
    </section>
  );
}
