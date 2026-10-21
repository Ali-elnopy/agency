import React, { useState } from 'react';
import { forgotPasswordApi } from '../services/api';

export default function ForgotPage({ onNavigate, theme, onToggleTheme }) {
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
          className="brand"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('login');
          }}
        >
          <span className="brand__mark" aria-hidden="true" />
          <span className="brand__text">
            <strong>ORVIA</strong>
            <small>AGENCY OS</small>
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

          <a
            href="#login"
            className="help-link"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('login');
            }}
          >
            Back to sign in
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </a>
        </div>
      </header>

      <div className="login__body">
        <span className="badge">
          <i />
          Account Security
        </span>

        <h1 className="login__title">Reset your password</h1>
        <p className="login__subtitle">
          Enter the email associated with your ORVIA account and we&apos;ll send you a secure
          verification link to reset your password.
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
            </button>
          </div>
        ) : (
          <form className="form" onSubmit={handleSubmit}>
            {error && (
              <div className="form__error" role="alert">
                {error}
              </div>
            )}

            <div className="field">
              <label htmlFor="reset-email">WORK EMAIL</label>
              <div className="input">
                <input
                  type="email"
                  id="reset-email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@orvia-creative.com"
                  autoComplete="email"
                  required
                />
                <svg
                  className="input__icon input__icon--mail"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="M3 7l9 6 9-6" />
                </svg>
              </div>
            </div>

            <p className="note">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
              </svg>
              Links expire in 60 minutes for security.
            </p>

            <button type="submit" className="btn" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Instructions'}
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
              Back to sign in
            </a>
          </form>
        )}
      </div>

      <footer className="login__footer">
        <p>
          Don&apos;t have an agency team yet?{' '}
          <a href="#trial" className="link link--strong" onClick={(e) => e.preventDefault()}>
            Start 14-day trial
          </a>
        </p>
        <nav className="footer-nav">
          <a href="#terms" onClick={(e) => e.preventDefault()}>
            Terms
          </a>
          <a href="#privacy" onClick={(e) => e.preventDefault()}>
            Privacy
          </a>
          <span>SOC2 Type II</span>
        </nav>
      </footer>
    </section>
  );
}
