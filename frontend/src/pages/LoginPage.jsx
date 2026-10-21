import React, { useState } from 'react';
import { getMockCredentials } from '../services/api';
import InfoModal from '../components/modals/InfoModal';
import useAuth from '../hooks/useAuth';

export default function LoginPage({ onNavigate, theme, onToggleTheme }) {
  const auth = useAuth();
  const { login } = auth;
  const DEV_BYPASS = import.meta.env.DEV && import.meta.env.VITE_DEV_BYPASS_LOGIN === 'true';
  const demoAccounts = getMockCredentials();
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
        onNavigate('dashboard');
      } catch {
        setError('Development login bypass is disabled.');
      }
      return;
    }

    setLoading(true);

    try {
      const result = await login({ email, password });

      if (result.success) {
        onNavigate('dashboard');
      } else {
        setError(result.message || 'Login failed. Please check your credentials.');
      }
    } catch {
      setError('An unexpected error occurred during sign in.');
    } finally {
      setLoading(false);
    }
  };

  const applyDemoAccount = (account) => {
    setEmail(account.email);
    setPassword(account.password);
    setError('');
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
              href="#help"
              className="help-link"
              onClick={(e) => {
                e.preventDefault();
                setIsHelpOpen(true);
              }}
            >
              Need help?
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="9" />
                <path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.7M12 17h.01" />
              </svg>
            </a>
          </div>
        </header>

        <div className="login__body">
          <span className="badge">
            <i />
            Workspace Portal v3.4
          </span>

          <h1 className="login__title">Welcome back</h1>
          <p className="login__subtitle">
            Log in to your workspace to manage creative briefs, team reviews, and client
            deliverables.
          </p>

          {error && (
            <div className="form__error" role="alert">
              {error}
            </div>
          )}

          <form className="form" onSubmit={handleSubmit} noValidate={DEV_BYPASS}>
            <div className="field">
              <label htmlFor="email">WORK EMAIL</label>
              <div className="input">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required={!DEV_BYPASS}
                />
                <svg className="input__icon input__icon--ok" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M5 12.5l4.5 4.5L19 7.5" />
                </svg>
              </div>
            </div>

            <div className="field">
              <div className="field__row">
                <label htmlFor="password">PASSWORD</label>
                <a
                  href="#forgot"
                  className="link"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('forgot');
                  }}
                >
                  Forgot password?
                </a>
              </div>
              <div className="input">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
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

            <div className="form__meta">
              <label className="check">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className="check__box" />
                Keep me signed in for 30 days
              </label>

              <span className="secure">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="5" y="11" width="14" height="9" rx="2" />
                  <path d="M8 11V8a4 4 0 0 1 8 0v3" />
                </svg>
                SSO &amp; 2FA Enabled
              </span>
            </div>

            <button type="submit" className="btn" disabled={loading}>
              {loading ? 'Authenticating...' : 'Sign in to ORVIA'}
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </button>

            {demoAccounts.length > 0 && (
              <div className="quick-login">
                <span>Demo login:</span>
                {demoAccounts.map((account) => (
                  <button
                    key={account.email}
                    type="button"
                    className="quick-login__btn"
                    onClick={() => applyDemoAccount(account)}
                    title={account.email}
                  >
                    {account.label}
                  </button>
                ))}
              </div>
            )}
          </form>
        </div>

        <footer className="login__footer">
          <p>
            Don&apos;t have an agency team yet?{' '}
            <a
              href="#trial"
              className="link link--strong"
              onClick={(e) => {
                e.preventDefault();
                setIsTrialOpen(true);
              }}
            >
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

      {/* Help Modal */}
      <InfoModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        title="ORVIA Workspace Support"
        subtitle="Need assistance accessing your creative workspace?"
        icon="#i-users"
        iconColor="orange"
      >
        <p className="modal-copy">
          For login assistance, password resets, or enterprise single sign-on (SSO) queries, please
          contact your studio administrator.
        </p>
        <p className="modal-copy modal-copy--muted">
          Support desk: <code>support@orvia-creative.com</code>
        </p>
      </InfoModal>

      {/* Trial Modal */}
      <InfoModal
        isOpen={isTrialOpen}
        onClose={() => setIsTrialOpen(false)}
        title="Start 14-Day Studio Trial"
        subtitle="Experience full production velocity for your brand &amp; agency."
        icon="#i-zap"
        iconColor="green"
        actionText="Request Access"
      >
        <p className="modal-copy">
          Includes 20 user seats, multi-brand asset review gates, real-time feedback canvases, and
          priority support.
        </p>
        <p className="modal-copy modal-copy--muted">
          Direct onboarding: <code>sales@orvia-creative.com</code>
        </p>
      </InfoModal>
    </>
  );
}
