import { useState } from "react";
import Brand from "./Brand.jsx";
import ThemeToggle from "./ThemeToggle.jsx";

const ArrowRight = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export default function Login() {
  // Show / hide password
  const [showPassword, setShowPassword] = useState(false);

  // Sign in opens the dashboard
  const handleLogin = (event) => {
    event.preventDefault();
    window.location.hash = "#dashboard";
  };

  return (
    <section className="login">
      <header className="login__header">
        <Brand sub />

        <div className="login__actions">
          <ThemeToggle />

          <a href="#" className="help-link" data-show="login">
            Need help?
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.7M12 17h.01" />
            </svg>
          </a>

          <a href="#login" className="help-link" data-show="forgot">
            Back to sign in
            <ArrowRight />
          </a>
        </div>
      </header>

      {/* View: Login */}
      <div className="login__body" data-show="login">
        <span className="badge"><i></i>Workspace Portal v3.4</span>

        <h1 className="login__title">Welcome back</h1>
        <p className="login__subtitle">
          Log in to your workspace to manage creative briefs, team reviews, and client deliverables.
        </p>

        <form className="form" action="#" method="post" onSubmit={handleLogin}>
          <div className="field">
            <label htmlFor="email">WORK EMAIL</label>
            <div className="input">
              <input type="email" id="email" name="email" defaultValue="elena.vance@orvia-creative.com" autoComplete="email" />
              <svg className="input__icon input__icon--ok" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 12.5l4.5 4.5L19 7.5" />
              </svg>
            </div>
          </div>

          <div className="field">
            <div className="field__row">
              <label htmlFor="password">PASSWORD</label>
              <a href="#forgot" className="link">Forgot password?</a>
            </div>
            <div className="input">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                defaultValue="password1234"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="input__toggle"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((v) => !v)}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </button>
            </div>
          </div>

          <div className="form__meta">
            <label className="check">
              <input type="checkbox" defaultChecked />
              <span className="check__box"></span>
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

          <button type="submit" className="btn">
            Sign in to ORVIA
            <ArrowRight />
          </button>
        </form>
      </div>

      {/* View: Forgot password */}
      <div className="login__body" data-show="forgot">
        <span className="badge"><i></i>Account Security</span>

        <h1 className="login__title">Reset your password</h1>
        <p className="login__subtitle">
          Enter the email associated with your ORVIA account and we'll send you a secure verification link to reset your password.
        </p>

        <form className="form" action="#" method="post" onSubmit={(e) => e.preventDefault()}>
          <div className="field">
            <label htmlFor="reset-email">WORK EMAIL</label>
            <div className="input">
              <input type="email" id="reset-email" name="email" placeholder="name@orvia-creative.com" autoComplete="email" />
              <svg className="input__icon input__icon--mail" viewBox="0 0 24 24" aria-hidden="true">
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

          <button type="submit" className="btn">
            Send Reset Instructions
            <ArrowRight />
          </button>

          <a href="#login" className="back-link">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M19 12H5M11 6l-6 6 6 6" />
            </svg>
            Back to sign in
          </a>
        </form>
      </div>

      <footer className="login__footer">
        <p>Don't have an agency team yet? <a href="#" className="link link--strong">Start 14-day trial</a></p>
        <nav className="footer-nav">
          <a href="#">Terms</a>
          <a href="#">Privacy</a>
          <span>SOC2 Type II</span>
        </nav>
      </footer>
    </section>
  );
}
