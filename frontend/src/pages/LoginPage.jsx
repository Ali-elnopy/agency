import React, { useState } from 'react';
import InfoModal from '../components/modals/InfoModal';
import Logo from '../components/Logo';
import useAuth from '../hooks/useAuth';
import { useSprint3 } from '../context/sprint3Store';

export default function LoginPage({ onNavigate, theme, onToggleTheme }) {
  const auth = useAuth();
  const { login } = auth;
  const { lang, setLang, t } = useSprint3();
  const DEV_BYPASS = import.meta.env.DEV && import.meta.env.VITE_DEV_BYPASS_LOGIN === 'true';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isTrialOpen, setIsTrialOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (import.meta.env.DEV && DEV_BYPASS && !email.trim() && !password.trim()) {
      try {
        auth.devLogin();
        onNavigate('dashboard', { replace: true });
      } catch {
        setError(t('Development login bypass is disabled.'));
      }
      return;
    }

    setLoading(true);

    try {
      const result = await login({ email, password });

      if (result.success) {
        onNavigate('dashboard', { replace: true });
      } else {
        setError(t(result.message || 'Login failed. Please check your credentials.'));
      }
    } catch {
      setError(t('An unexpected error occurred during sign in.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
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
          </div>
        </header>

        <div className="login__body">
          <span className="badge">{t('Welcome back')}</span>

          <h1 className="login__title">{t('Sign in to your workspace')}</h1>
          <p className="login__subtitle">
            {t('Access your creative operations, briefs, pipelines, and client approvals.')}
          </p>

          {error && (
            <div className="form__error" role="alert">
              {error}
            </div>
          )}

          <form className="form" onSubmit={handleSubmit} noValidate={DEV_BYPASS}>
            <div className="field">
              <label htmlFor="email" className="is-req">
                {t('Work Email')}
              </label>
              <div className="input input--icon">
                <svg className="input__lead" viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="3" y="5" width="18" height="14" rx="2.5" />
                  <path d="M3.5 7.5l8.5 6 8.5-6" />
                </svg>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="elena.vance@orvia-partners.agency.com"
                  autoComplete="email"
                  required={!DEV_BYPASS}
                />
              </div>
            </div>

            <div className="field">
              <div className="field__row">
                <label htmlFor="password" className="is-req">
                  {t('Password')}
                </label>
                <a
                  href="#forgot"
                  className="link"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('forgot');
                  }}
                >
                  {t('Forgot password?')}
                </a>
              </div>
              <div className="input input--icon">
                <svg className="input__lead" viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="4.5" y="10.5" width="15" height="9.5" rx="2.5" />
                  <path d="M8 10.5V7.8a4 4 0 0 1 8 0v2.7" />
                </svg>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="input__toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? t('Hide password') : t('Show password')}
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

            <label className="check">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span className="check__box" />
              <span className="check__text">
                <strong>{t('Keep me signed in for 30 days')}</strong>
                <small>{t('Only for trusted private devices')}</small>
              </span>
            </label>

            <button type="submit" className="btn" disabled={loading}>
              {loading ? t('Authenticating…') : t('Log in to ORVIA')}
              <svg viewBox="0 0 24 24" aria-hidden="true" style={{ transform: lang === 'ar' ? 'rotate(180deg)' : 'none' }}>
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </button>

          </form>
        </div>

        <footer className="login__footer">
          <p>{t('SOC2 Type II & 256-bit SSL Protected')}</p>
          <nav className="footer-nav">
            <a href="#privacy" onClick={(e) => e.preventDefault()}>
              {t('Privacy')}
            </a>
            <span className="dot">·</span>
            <a href="#terms" onClick={(e) => e.preventDefault()}>
              {t('Terms')}
            </a>
            <span className="dot">·</span>
            <a
              href="#contact"
              className="is-accent"
              onClick={(e) => {
                e.preventDefault();
                setIsHelpOpen(true);
              }}
            >
              {t('Contact Support')}
            </a>
          </nav>
        </footer>
      </section>

      {/* Help Modal */}
      <InfoModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        title={t('ORVIA Workspace Support')}
        subtitle={t('Need assistance accessing your creative workspace?')}
        icon="#i-users"
        iconColor="orange"
      >
        <p className="modal-copy">
          {t('For login assistance, password resets, or enterprise single sign-on (SSO) queries, please contact your studio administrator.')}
        </p>
        <p className="modal-copy modal-copy--muted">
          {t('Support desk:')} <code>support@orvia-creative.com</code>
        </p>
      </InfoModal>

      {/* Trial Modal */}
      <InfoModal
        isOpen={isTrialOpen}
        onClose={() => setIsTrialOpen(false)}
        title={t('Start 14-Day Studio Trial')}
        subtitle={t('Experience full production velocity for your brand & agency.')}
        icon="#i-zap"
        iconColor="green"
        actionText={t('Request Access')}
      >
        <p className="modal-copy">
          {t('Includes 20 user seats, multi-brand asset review gates, real-time feedback canvases, and priority support.')}
        </p>
        <p className="modal-copy modal-copy--muted">
          {t('Direct onboarding:')} <code>sales@orvia-creative.com</code>
        </p>
      </InfoModal>
    </>
  );
}
