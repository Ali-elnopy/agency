import React, { useState } from 'react';
import Toast from '../components/ui/Toast';
import useAuth from '../hooks/useAuth';
import useToast from '../hooks/useToast';
import { changePassword } from '../services/users';
import { validatePasswordChange } from '../utils/validation';

const PASSWORD_RULES = [
  { id: 'length', label: '16+ characters', test: (value) => value.length >= 16 },
  { id: 'upper', label: 'Uppercase (A-Z)', test: (value) => /[A-Z]/.test(value) },
  { id: 'number', label: 'Numbers (0-9)', test: (value) => /[0-9]/.test(value) },
  { id: 'symbol', label: 'Special symbol (!@#)', test: (value) => /[^A-Za-z0-9]/.test(value) },
];

const STRENGTH_LABELS = ['Weak', 'Weak', 'Fair', 'Good', 'Strong'];

const DEADLINE_STORAGE_KEY = 'orvia_workflow_deadlines_v1';

const DEFAULT_DEADLINES = {
  production: 24,
  review: 12,
  publish: 0,
};

const DEADLINE_STAGES = [
  {
    id: 'production',
    label: 'Production',
    copy: 'Deadline is calculated this many hours before the content publish time.',
  },
  {
    id: 'review',
    label: 'Review',
    copy: 'Deadline is calculated this many hours before the content publish time.',
  },
  {
    id: 'publish',
    label: 'Publish',
    copy: 'Deadline is calculated this many hours before the content publish time.',
  },
];

function strengthOf(value) {
  if (!value) return 0;
  return PASSWORD_RULES.reduce((count, rule) => (rule.test(value) ? count + 1 : count), 0);
}

function isValidDeadline(value) {
  return Number.isInteger(value) && value >= 0 && value <= 720;
}

function readDeadlines() {
  if (typeof window === 'undefined') return { ...DEFAULT_DEADLINES };

  try {
    const parsed = JSON.parse(window.localStorage.getItem(DEADLINE_STORAGE_KEY));
    if (!parsed || typeof parsed !== 'object') return { ...DEFAULT_DEADLINES };

    return {
      production: isValidDeadline(parsed.production)
        ? parsed.production
        : DEFAULT_DEADLINES.production,
      review: isValidDeadline(parsed.review) ? parsed.review : DEFAULT_DEADLINES.review,
      publish: isValidDeadline(parsed.publish) ? parsed.publish : DEFAULT_DEADLINES.publish,
    };
  } catch {
    return { ...DEFAULT_DEADLINES };
  }
}

function writeDeadlines(value) {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(DEADLINE_STORAGE_KEY, JSON.stringify(value));
  } catch {
    // The rule still applies for this session when storage is unavailable.
  }
}

export default function SettingsPage({ onSignOut }) {
  const { user } = useAuth();
  const { toast, showToast } = useToast(3500);

  const [deadlines, setDeadlines] = useState(readDeadlines);
  const [savedDeadlines, setSavedDeadlines] = useState(readDeadlines);
  const [deadlineErrors, setDeadlineErrors] = useState({});

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [changingPassword, setChangingPassword] = useState(false);
  const [visible, setVisible] = useState({ current: false, next: false, confirm: false });

  const notify = (message, tone = 'success') => showToast(message, tone);

  const strength = strengthOf(passwordForm.newPassword);
  const passwordsMatch =
    passwordForm.confirmPassword.length > 0 &&
    passwordForm.confirmPassword === passwordForm.newPassword;

  const updateDeadline = (stageId) => (event) => {
    const { value } = event.target;

    setDeadlines((prev) => ({ ...prev, [stageId]: value }));
    setDeadlineErrors((prev) => {
      if (!prev[stageId]) return prev;
      const next = { ...prev };
      delete next[stageId];
      return next;
    });
  };

  const saveDeadline = (stage) => {
    const raw = String(deadlines[stage.id] ?? '').trim();
    const value = raw === '' ? Number.NaN : Number(raw);

    if (!isValidDeadline(value)) {
      setDeadlineErrors((prev) => ({
        ...prev,
        [stage.id]: 'Enter a whole number between 0 and 720.',
      }));
      return;
    }

    const next = { ...savedDeadlines, [stage.id]: value };
    setSavedDeadlines(next);
    setDeadlines((prev) => ({ ...prev, [stage.id]: value }));
    writeDeadlines(next);
    notify(`${stage.label} deadline saved.`);
  };

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
        'Use 16+ characters with an uppercase letter, a number and a special symbol.';
    }

    if (passwordForm.newPassword && passwordForm.currentPassword === passwordForm.newPassword) {
      nextErrors.newPassword = 'Choose a password that differs from your current one.';
    }

    if (!passwordForm.confirmPassword) {
      nextErrors.confirmPassword = 'Confirm your new password.';
    } else if (passwordForm.confirmPassword !== passwordForm.newPassword) {
      nextErrors.confirmPassword = 'Passwords do not match.';
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
      notify('Password updated successfully.');
    } catch (error) {
      notify(error.message || 'Could not update your password. Please try again.', 'danger');
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="page-screen st-page">
      <header className="st-head">
        <span className="st-eyebrow">Admin Settings</span>
        <h1>Settings</h1>
        <p>Control default workflow deadlines and keep your account secure.</p>
      </header>

      <section className="st-card">
        <header className="st-card__head">
          <div>
            <h2>Workflow Settings</h2>
            <p>
              Control the default deadline rules used when an Account Manager assigns a new content
              workflow. Existing tasks keep their current due dates.
            </p>
          </div>
          <span className="st-card__icon">
            <svg aria-hidden="true" className="icon">
              <use href="#i-clock" />
            </svg>
          </span>
        </header>

        <div className="st-rules">
          <header className="st-rules__head">
            <h3>Deadline Rules</h3>
            <p>Example: 48 hours means the task is due 48 hours before publish_at.</p>
          </header>

          <div className="st-rule-list">
            {DEADLINE_STAGES.map((stage) => (
              <div className="st-rule" key={stage.id}>
                <div className="st-rule__copy">
                  <strong>{stage.label}</strong>
                  <p>{stage.copy}</p>
                </div>

                <div className="st-rule__field">
                  <label htmlFor={`deadline-${stage.id}`}>Hours before publish</label>
                  <div className="st-rule__controls">
                    <input
                      id={`deadline-${stage.id}`}
                      className={`st-input${deadlineErrors[stage.id] ? ' is-invalid' : ''}`}
                      type="number"
                      min="0"
                      max="720"
                      step="1"
                      inputMode="numeric"
                      value={deadlines[stage.id]}
                      onChange={updateDeadline(stage.id)}
                    />
                    <button
                      type="button"
                      className="st-save"
                      onClick={() => saveDeadline(stage)}
                    >
                      Save
                    </button>
                  </div>
                  {deadlineErrors[stage.id] && (
                    <small className="st-error">{deadlineErrors[stage.id]}</small>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="st-card st-security">
        <header className="st-card__head st-card__head--row">
          <div>
            <h2>Security</h2>
            <p>Update password and session preferences.</p>
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
                  Current Password
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
                  aria-label={visible.current ? 'Hide password' : 'Show password'}
                  onClick={() => setVisible((prev) => ({ ...prev, current: !prev.current }))}
                >
                  <svg aria-hidden="true" className="icon">
                    <use href="#i-eye" />
                  </svg>
                </button>
              </div>
              {passwordErrors.currentPassword && (
                <span className="st-error">{passwordErrors.currentPassword}</span>
              )}
            </div>

            <div className="pf-field">
              <div className="pf-label-row">
                <label className="pf-label" htmlFor="pf-new">
                  New Password
                </label>
              </div>
              <div className="pf-password">
                <input
                  id="pf-new"
                  className="pf-input"
                  type={visible.next ? 'text' : 'password'}
                  placeholder="Enter fresh passphrase"
                  value={passwordForm.newPassword}
                  onChange={updatePasswordField('newPassword')}
                  autoComplete="new-password"
                  aria-invalid={Boolean(passwordErrors.newPassword)}
                />
                <button
                  type="button"
                  className="pf-eye"
                  aria-label={visible.next ? 'Hide password' : 'Show password'}
                  onClick={() => setVisible((prev) => ({ ...prev, next: !prev.next }))}
                >
                  <svg aria-hidden="true" className="icon">
                    <use href="#i-eye" />
                  </svg>
                </button>
              </div>
              {passwordErrors.newPassword && (
                <span className="st-error">{passwordErrors.newPassword}</span>
              )}
            </div>

            <div className="pf-strength">
              <div className="pf-strength__head">
                <span>Security strength:</span>
                <span className="pf-strength__bars" aria-hidden="true">
                  {PASSWORD_RULES.map((rule, index) => (
                    <i key={rule.id} className={index < strength ? 'is-on' : ''} />
                  ))}
                </span>
                <strong>
                  {STRENGTH_LABELS[strength]} ({strength}/4)
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
                      {rule.label}
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="pf-field">
              <div className="pf-label-row">
                <label className="pf-label" htmlFor="pf-confirm">
                  Confirm New Password
                </label>
              </div>
              <div className="pf-password">
                <input
                  id="pf-confirm"
                  className="pf-input"
                  type={visible.confirm ? 'text' : 'password'}
                  placeholder="Re-type new passphrase"
                  value={passwordForm.confirmPassword}
                  onChange={updatePasswordField('confirmPassword')}
                  autoComplete="new-password"
                  aria-invalid={Boolean(passwordErrors.confirmPassword)}
                />
                <button
                  type="button"
                  className="pf-eye"
                  aria-label={visible.confirm ? 'Hide password' : 'Show password'}
                  onClick={() => setVisible((prev) => ({ ...prev, confirm: !prev.confirm }))}
                >
                  <svg aria-hidden="true" className="icon">
                    <use href="#i-eye" />
                  </svg>
                </button>
              </div>
              {passwordErrors.confirmPassword && (
                <span className="st-error">{passwordErrors.confirmPassword}</span>
              )}
              {passwordsMatch && (
                <span className="pf-match">
                  <svg aria-hidden="true" className="icon">
                    <use href="#i-check" />
                  </svg>
                  Passwords match correctly
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
                {changingPassword ? 'Updating…' : 'Update password'}
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
                Log out
              </button>
            </div>
          </div>

          <aside className="st-sessions">
            <span className="st-sessions__icon">
              <svg aria-hidden="true" className="icon">
                <use href="#i-shield" />
              </svg>
            </span>
            <strong>Active Sessions</strong>
            <p>Logged in on 3 devices</p>
            <button
              type="button"
              className="st-sessions__button"
              onClick={() => notify('Signed out of all other devices.')}
            >
              Log out all devices
            </button>
            <span className="st-sessions__user">
              {user?.fullName || 'Elena Vance'}
              <small>{user?.role === 'ADMIN' ? 'Workspace Admin' : 'Account Manager'}</small>
            </span>
          </aside>
        </div>
      </section>

      <Toast message={toast?.message} tone={toast?.tone} />
    </div>
  );
}
