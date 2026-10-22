import React, { useEffect, useMemo, useRef, useState } from 'react';
import Toast from '../components/ui/Toast';
import useAuth from '../hooks/useAuth';
import useAvatar from '../hooks/useAvatar';
import useToast from '../hooks/useToast';
import { changePassword } from '../services/users';
import { clearAvatar, cropAvatar, fileToAvatar, saveAvatar } from '../services/avatarStore';
import { validatePasswordChange, validateProfile } from '../utils/validation';
import managerPhoto from '../assets/managerPhoto';

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
  const { user, updateProfile } = useAuth();
  const { toast, showToast } = useToast(3500);
  const fileRef = useRef(null);

  const currentProfile = useMemo(
    () => ({
      fullName: user?.fullName || 'Elena Vance',
      email: user?.email || 'elena.vance@orvia-creative.com',
      phone: user?.phone || '+1 (555) 382-9014',
    }),
    [user],
  );

  const [profile, setProfile] = useState(currentProfile);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const storedAvatar = useAvatar(user?.email);
  const photo = storedAvatar === undefined ? managerPhoto : storedAvatar;

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [changingPassword, setChangingPassword] = useState(false);
  const [visible, setVisible] = useState({ current: false, next: false, confirm: false });

  useEffect(() => {
    setProfile(currentProfile);
    setErrors({});
  }, [currentProfile]);

  const notify = (message, tone = 'success') => showToast(message, tone);

  const strength = strengthOf(passwordForm.newPassword);
  const passwordsMatch =
    passwordForm.confirmPassword.length > 0 &&
    passwordForm.confirmPassword === passwordForm.newPassword;

  const updateField = (field) => (event) => {
    const { value } = event.target;

    setProfile((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const updatePhone = (event) => {
    const digits = event.target.value.replace(/^\+1\s*/, '');
    setProfile((prev) => ({ ...prev, phone: `+1 ${digits}` }));
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

  const handleSave = async () => {
    const nextErrors = validateProfile(profile);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length) return;

    setSaving(true);

    try {
      await updateProfile({
        name: profile.fullName.trim(),
        email: profile.email.trim().toLowerCase(),
        phone: profile.phone.trim(),
      });
      notify('Profile changes saved successfully.');
    } catch (error) {
      notify(error.message || 'Could not save your profile. Please try again.', 'danger');
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    setProfile(currentProfile);
    setErrors({});
    notify('Changes discarded.', 'info');
  };

  const handlePasswordUpdate = async () => {
    const nextErrors = validatePasswordChange(passwordForm);
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

  const handlePhotoPick = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    try {
      const dataUrl = await fileToAvatar(file);
      saveAvatar(user?.email, dataUrl);
      notify('Profile photo updated.');
    } catch (error) {
      notify(error.message || 'Could not read that image.', 'danger');
    }
  };

  const handleCrop = async () => {
    if (!storedAvatar) {
      notify('Upload a photo before cropping.', 'info');
      return;
    }

    try {
      const dataUrl = await cropAvatar(storedAvatar);
      saveAvatar(user?.email, dataUrl);
      notify('Photo cropped to a 1:1 square.');
    } catch (error) {
      notify(error.message || 'Could not crop that photo.', 'danger');
    }
  };

  const roleName =
    user?.role === 'ACCOUNT_MANAGER' ? 'Account Manager / Ops' : 'Studio Lead / Account Manager';
  const localPhone = profile.phone.replace(/^\+1\s*/, '');

  return (
    <div className="page-screen pf-page">
      <div className="crumbs">
        <nav aria-label="Breadcrumb">
          <span>Settings</span>
          <svg aria-hidden="true" className="icon">
            <use href="#i-chevron" />
          </svg>
          <strong>My Profile</strong>
        </nav>
      </div>

      <header className="pf-head">
        <div className="pf-head__tags">
          <span className="pf-account-pill">
            <svg aria-hidden="true" className="icon">
              <use href="#i-shield" />
            </svg>
            Account Center
          </span>
          <span className="pf-head__workspace">
            <i className="pf-head__dot" aria-hidden="true" />
            Orvia Agency OS
          </span>
        </div>
        <h1>My Profile</h1>
        <p>
          Manage your personal details, workspace preferences, and account security credentials.
        </p>
      </header>

      <div className="pf-grid">
        {/* ---------------- My details ---------------- */}
        <section className="pf-card">
          <header className="pf-card__head">
            <span className="pf-card__icon">
              <svg aria-hidden="true" className="icon">
                <use href="#i-user" />
              </svg>
            </span>
            <div className="pf-card__title">
              <h2>My details</h2>
              <p>Personal identification and role assignment within the agency.</p>
            </div>
            <span className="pf-member">
              <svg aria-hidden="true" className="icon">
                <use href="#i-user" />
              </svg>
              Active Member
            </span>
          </header>

          <div className="pf-divider" />

          <div className="pf-photo">
            <span className="pf-photo__frame">
              {photo ? (
                <img src={photo} alt="" />
              ) : (
                <svg aria-hidden="true" className="icon">
                  <use href="#i-user" />
                </svg>
              )}
            </span>

            <div className="pf-photo__body">
              <div className="pf-photo__buttons">
                <button type="button" className="pf-mini" onClick={() => fileRef.current?.click()}>
                  <svg aria-hidden="true" className="icon">
                    <use href="#i-upload" />
                  </svg>
                  Upload photo
                </button>
                <button
                  type="button"
                  className="pf-mini"
                  onClick={handleCrop}
                >
                  <svg aria-hidden="true" className="icon">
                    <use href="#i-crop" />
                  </svg>
                  Crop
                </button>
                <button
                  type="button"
                  className="pf-mini pf-mini--danger"
                  onClick={() => {
                    clearAvatar(user?.email);
                    notify('Profile photo removed.', 'info');
                  }}
                >
                  <svg aria-hidden="true" className="icon">
                    <use href="#i-trash" />
                  </svg>
                  Remove
                </button>
              </div>
              <p>JPG, PNG or WebP under 5MB. Recommended square 1:1 aspect ratio.</p>
            </div>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="pf-file"
              onChange={handlePhotoPick}
              aria-label="Upload profile photo"
            />
          </div>

          <div className="pf-fields">
            <div className="pf-field">
              <div className="pf-label-row">
                <label className="pf-label" htmlFor="pf-name">
                  Full Name<span className="req">*</span>
                </label>
                <small className="pf-note">Editable</small>
              </div>
              <input
                id="pf-name"
                className="pf-input"
                value={profile.fullName}
                onChange={updateField('fullName')}
                autoComplete="name"
                aria-invalid={Boolean(errors.fullName)}
              />
              {errors.fullName && <span className="set-error">{errors.fullName}</span>}
            </div>

            <div className="pf-field">
              <div className="pf-label-row">
                <label className="pf-label" htmlFor="pf-phone">
                  Phone Number
                </label>
              </div>
              <div className="pf-phone">
                <span className="pf-phone__code">
                  <svg aria-hidden="true" className="icon">
                    <use href="#i-phone" />
                  </svg>
                  +1
                </span>
                <input
                  id="pf-phone"
                  className="pf-input"
                  value={localPhone}
                  onChange={updatePhone}
                  autoComplete="tel"
                />
              </div>
            </div>

            <div className="pf-field pf-field--full">
              <div className="pf-label-row">
                <span className="pf-label pf-label--locked">
                  <svg aria-hidden="true" className="icon">
                    <use href="#i-lock" />
                  </svg>
                  Work Email
                </span>
                <small className="pf-note">Managed by workspace administrator</small>
              </div>
              <div className="pf-readonly">
                <input
                  className="pf-input"
                  value={profile.email}
                  readOnly
                  aria-label="Work email"
                />
                <button
                  type="button"
                  className="pf-readonly__gear"
                  aria-label="Email settings"
                  title="Managed by your administrator"
                  onClick={() =>
                    notify('Email is managed by your workspace administrator.', 'info')
                  }
                >
                  <svg aria-hidden="true" className="icon">
                    <use href="#i-settings" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="pf-field">
              <div className="pf-label-row">
                <span className="pf-label pf-label--locked">
                  <svg aria-hidden="true" className="icon">
                    <use href="#i-lock" />
                  </svg>
                  Role Assignment
                </span>
              </div>
              <div className="pf-role">
                <svg aria-hidden="true" className="icon pf-role__icon">
                  <use href="#i-briefcase" />
                </svg>
                <span className="pf-role__name">{roleName}</span>
                <span className="pf-role__meta">
                  Level
                  <b>4</b>
                </span>
              </div>
            </div>

            <div className="pf-field">
              <div className="pf-label-row">
                <span className="pf-label pf-label--locked">
                  <svg aria-hidden="true" className="icon">
                    <use href="#i-lock" />
                  </svg>
                  Assigned Squad
                </span>
              </div>
              <div className="pf-squad">
                <span className="pf-squad__icon">
                  <svg aria-hidden="true" className="icon">
                    <use href="#i-layers" />
                  </svg>
                </span>
                <span className="pf-squad__name">Brand Strategy &amp; Growth</span>
                <span className="pf-squad__meta">
                  Ops
                  <b>Assigned</b>
                </span>
              </div>
            </div>
          </div>

          <div className="pf-divider" />

          <div className="pf-actions">
            <button type="button" className="pf-ghost" onClick={handleDiscard}>
              Cancel
            </button>
            <button type="button" className="pf-save" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </section>

        {/* ---------------- Security ---------------- */}
        <section className="pf-card">
          <header className="pf-card__head pf-card__head--security">
            <div className="pf-card__title">
              <h2>Security</h2>
              <p>Update password and session preferences.</p>
            </div>
            <span className="pf-card__icon pf-card__icon--purple">
              <svg aria-hidden="true" className="icon">
                <use href="#i-lock" />
              </svg>
            </span>
          </header>

          <div className="pf-divider" />

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
              <span className="set-error">{passwordErrors.currentPassword}</span>
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
              <span className="set-error">{passwordErrors.newPassword}</span>
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

          <div className="pf-sessions">
            <div>
              <strong>Active Sessions</strong>
              <p>Logged in on 3 devices</p>
            </div>
            <button
              type="button"
              className="pf-mini"
              onClick={() => notify('Signed out of all other devices.')}
            >
              Log out all devices
            </button>
          </div>
        </section>
      </div>

      <Toast message={toast?.message} tone={toast?.tone} />
    </div>
  );
}
