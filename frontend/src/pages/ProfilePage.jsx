import React, { useEffect, useMemo, useRef, useState } from 'react';
import Toast from '../components/ui/Toast';
import useAuth from '../hooks/useAuth';
import useToast from '../hooks/useToast';
import { validateProfile } from '../utils/validation';
import managerPhoto from '../assets/managerPhoto';

// Profile screen (sidebar destination). Mirrors the Add User layout – a centred
// single-column card – and keeps only the "My details" section (no Security).
export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const { toast, showToast } = useToast(4000);
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
  const [photo, setPhoto] = useState(managerPhoto);

  useEffect(() => {
    setProfile(currentProfile);
    setErrors({});
  }, [currentProfile]);

  const notify = (message, tone = 'success') => showToast(message, tone);

  const isDirty =
    profile.fullName !== currentProfile.fullName ||
    profile.email !== currentProfile.email ||
    profile.phone !== currentProfile.phone;

  const roleName =
    user?.role === 'ACCOUNT_MANAGER' ? 'Account Manager / Ops' : 'Studio Lead / Account Manager';

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

  const handlePhotoPick = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setPhoto(String(reader.result));
      notify('Profile photo updated.');
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const handleCrop = () => {
    notify('Crop tool opened.', 'info');
  };

  const handleRemovePhoto = () => {
    setPhoto('');
    notify('Profile photo removed.', 'info');
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

  return (
    <div className="page-screen au-page">
      <div className="au-wrap">
        <div className="crumbs au-crumbs">
          <nav aria-label="Breadcrumb">
            <span>Account</span>
            <svg aria-hidden="true" className="icon">
              <use href="#i-chevron" />
            </svg>
            <strong>My Profile</strong>
          </nav>
        </div>

        <header className="au-head">
          <div className="au-head__copy">
            <h1>My Profile</h1>
            <p>Manage your personal details and workspace identity.</p>
          </div>
          <span className="pill is-green live-chip">Active Member</span>
        </header>

        <div className="au-card">
          <section className="au-section">
            <div className="au-sec-head">
              <div className="au-sec-title">
                <span className="au-sec-icon">
                  <svg aria-hidden="true" className="icon">
                    <use href="#i-user" />
                  </svg>
                </span>
                <div>
                  <h2>My details</h2>
                  <p>Personal identification and role assignment within the agency.</p>
                </div>
              </div>
              <span className="au-step">Profile</span>
            </div>

            <div className="au-upload">
              <button
                type="button"
                className="au-upload__avatar is-clickable"
                onClick={() => fileRef.current?.click()}
                aria-label="Upload profile photo"
              >
                {photo ? (
                  <img src={photo} alt="" />
                ) : (
                  <svg aria-hidden="true" className="icon">
                    <use href="#i-user" />
                  </svg>
                )}
                <span className="au-upload__cam">
                  <svg aria-hidden="true" className="icon">
                    <use href="#i-camera" />
                  </svg>
                </span>
              </button>

              <div className="au-upload__copy">
                <strong>Profile Photo</strong>
                <p>PNG, JPG, or WEBP up to 5MB. Circular display across Kanban &amp; avatars.</p>
                <div className="upload__actions">
                  <button
                    type="button"
                    className="button button--ghost button--xs"
                    onClick={() => fileRef.current?.click()}
                  >
                    <svg aria-hidden="true" className="icon">
                      <use href="#i-upload" />
                    </svg>
                    Upload photo
                  </button>
                  <button type="button" className="button button--ghost button--xs" onClick={handleCrop}>
                    <svg aria-hidden="true" className="icon">
                      <use href="#i-crop" />
                    </svg>
                    Crop
                  </button>
                  <button
                    type="button"
                    className="button button--ghost button--xs button--danger-ghost"
                    onClick={handleRemovePhoto}
                  >
                    <svg aria-hidden="true" className="icon">
                      <use href="#i-trash" />
                    </svg>
                    Remove
                  </button>
                </div>
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

            <div className="au-grid">
              <div className="au-field">
                <label className="au-label" htmlFor="profile-name">
                  Full Name
                  <span className="req">*</span>
                </label>
                <input
                  id="profile-name"
                  className="form-input"
                  value={profile.fullName}
                  onChange={updateField('fullName')}
                  autoComplete="name"
                  aria-invalid={Boolean(errors.fullName)}
                />
                {errors.fullName && <span className="set-error">{errors.fullName}</span>}
              </div>

              <div className="au-field">
                <div className="au-label-row">
                  <label className="au-label" htmlFor="profile-phone">
                    Phone Number
                  </label>
                  <small className="au-optional">Optional</small>
                </div>
                <input
                  id="profile-phone"
                  className="form-input"
                  placeholder="+1 (555) 234-5678"
                  value={profile.phone}
                  onChange={updateField('phone')}
                  autoComplete="tel"
                />
                <span className="au-hint">Used strictly for two-factor security alerts.</span>
              </div>

              <div className="au-field au-field--full">
                <div className="au-label-row">
                  <span className="au-label">Work Email</span>
                  <small className="au-optional">Managed by workspace administrator</small>
                </div>
                <span className="input-icon">
                  <svg aria-hidden="true" className="icon">
                    <use href="#i-lock" />
                  </svg>
                  <input
                    className="form-input"
                    value={profile.email}
                    readOnly
                    aria-label="Work email"
                  />
                </span>
                <span className="au-hint">
                  Contact your administrator to change your sign-in email.
                </span>
                {errors.email && <span className="set-error">{errors.email}</span>}
              </div>

              <div className="au-field">
                <span className="au-label">Role Assignment</span>
                <span className="input-icon">
                  <svg aria-hidden="true" className="icon">
                    <use href="#i-briefcase" />
                  </svg>
                  <input className="form-input" value={roleName} readOnly aria-label="Role assignment" />
                </span>
                <span className="au-hint">Assigned by your workspace administrator.</span>
              </div>

              <div className="au-field">
                <span className="au-label">Assigned Squad</span>
                <span className="input-icon">
                  <svg aria-hidden="true" className="icon">
                    <use href="#i-layers" />
                  </svg>
                  <input
                    className="form-input"
                    value="Brand Strategy & Growth"
                    readOnly
                    aria-label="Assigned squad"
                  />
                </span>
                <span className="au-hint">Squad membership follows your team assignments.</span>
              </div>
            </div>
          </section>
        </div>

        <div className={`au-savebar${isDirty ? ' is-dirty' : ''}`}>
          <p className="au-savebar__note">
            <i className="au-savebar__dot" aria-hidden="true" />
            {isDirty ? 'Unsaved changes' : 'All changes saved'}
          </p>
          <div className="au-savebar__actions">
            <button type="button" className="button button--ghost button--sm" onClick={handleDiscard}>
              Cancel
            </button>
            <button
              type="button"
              className="button button--primary button--sm"
              onClick={handleSave}
              disabled={saving}
            >
              <svg aria-hidden="true" className="icon">
                <use href="#i-check" />
              </svg>
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </div>
      </div>

      <Toast message={toast?.message} tone={toast?.tone} />
    </div>
  );
}
