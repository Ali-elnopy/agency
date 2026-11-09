import React, { useState } from 'react';
import { forgotPasswordApi } from '../services/api';
import Logo from '../components/Logo';
import { useSprint3 } from '../context/sprint3Store';

export default function ForgotPage({ onNavigate, theme, onToggleTheme, onEmailSubmit }) {
  const { lang, setLang, t } = useSprint3();
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
      setError(t(result.message));
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
          <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" style={{ transform: lang === 'ar' ? 'rotate(180deg)' : 'none' }}>
            <path d="M19 12H5M11 6l-6 6 6 6" />
          </svg>
          {t('Back to Sign In')}
        </a>

        <div className="login__actions" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            className="s3-lang-toggle"
            onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
            title={lang === 'ar' ? 'Switch to English' : 'التحويل إلى العربية'}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '32px',
              padding: '0 12px',
              fontSize: '12.5px',
              fontWeight: '700',
              borderRadius: '8px',
              border: '1px solid var(--auth-input-line, rgba(0,0,0,0.12))',
              background: 'var(--auth-input-bg, #ffffff)',
              color: 'var(--auth-ink, #1e1b3c)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {lang === 'ar' ? 'English' : 'عربي'}
          </button>

          <button
            type="button"
            className="theme-toggle"
            aria-label="Toggle dark mode"
            onClick={onToggleTheme}
            title={theme === 'dark' ? t('Switch to Light Mode') : t('Switch to Dark Mode')}
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
            <li className={submitted ? '' : 'is-active'}>{t('Forgot Password')}</li>
            <li className={submitted ? 'is-active' : ''}>{t('Sent ✓')}</li>
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

        <h1 className="login__title">{t('Forgot your password?')}</h1>
        <p className="login__subtitle">
          {t('Enter the work email your agency uses and we\'ll send you a secure reset link.')}
        </p>

        {submitted ? (
          <div className="auth-notice" role="status">
            <strong>{t('Check your inbox!')}</strong>
            <p className="auth-notice__text">{t(message)}</p>
            <button
              type="button"
              className="btn auth-notice__btn"
              onClick={() => onNavigate('login')}
            >
              {t('Return to Sign In')}
              <svg viewBox="0 0 24 24" aria-hidden="true" style={{ transform: lang === 'ar' ? 'rotate(180deg)' : 'none' }}>
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
              <svg viewBox="0 0 24 24" aria-hidden="true" style={{ transform: lang === 'ar' ? 'rotate(180deg)' : 'none' }}>
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
              {t('I already have a reset link')}
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
              <label htmlFor="reset-email">{t('Work Email Address')}</label>
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
              {loading ? t('Sending…') : t('Send reset link')}
              <svg viewBox="0 0 24 24" aria-hidden="true" style={{ transform: lang === 'ar' ? 'rotate(180deg)' : 'none' }}>
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </button>

            <div className="notice">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 3l7 3v6c0 4.2-2.9 7.7-7 9-4.1-1.3-7-4.8-7-9V6z" />
                <path d="M9.2 12.2l2 2 3.6-3.9" />
              </svg>
              <div className="notice__body">
                <strong>{t('Security Notice')}</strong>
                {t('For security reasons, we do not confirm whether an account exists with this email address.')}
              </div>
            </div>
          </form>
        )}
      </div>

      <footer className="login__footer">
        <p>{t('End-to-end 256-bit encryption')}</p>
        <nav className="footer-nav">
          <a href="#privacy" onClick={(e) => e.preventDefault()}>
            {t('Privacy Policy')}
          </a>
          <span className="dot">·</span>
          <a href="#help" onClick={(e) => e.preventDefault()}>
            {t('Help Desk')}
          </a>
        </nav>
      </footer>
    </section>
  );
}
