import React, { useState } from 'react';
import Switch from '../components/ui/Switch';
import Toast from '../components/ui/Toast';
import useToast from '../hooks/useToast';

const ROLES = [
  {
    id: 'am',
    name: 'Account Manager',
    scope: 'Client & Content Operations',
    blurb:
      'Manage assigned clients, intake client briefs, run AI classifications, review creative deliverables and approve publishing calendars.',
  },
  {
    id: 'admin',
    name: 'Workspace Admin',
    scope: 'Full Governance',
    blurb: 'Full control over users, roles, billing and workspace-wide settings.',
  },
  {
    id: 'creator',
    name: 'Content Creator',
    scope: 'Production Studio',
    blurb:
      'Produce and upload creative assets, respond to review notes and ship approved deliverables.',
  },
];

const PODS = [
  'Social Media Copy (12 members)',
  'Brand Strategy & Growth (8 members)',
  'Creative & Motion Studio (12 members)',
  'Performance Content Squad (8 members)',
];

const EMPTY_FORM = {
  fullName: '',
  phone: '',
  email: '',
  roleId: 'am',
  pod: PODS[0],
};

export default function AddUserPage({ onBack, onSaved }) {
  const { toast, showToast } = useToast(3000);
  const [form, setForm] = useState(EMPTY_FORM);
  const [invite, setInvite] = useState(true);
  const [errors, setErrors] = useState({});

  const role = ROLES.find((item) => item.id === form.roleId) ?? ROLES[0];
  const isDirty =
    Boolean(form.fullName || form.phone || form.email) ||
    form.roleId !== EMPTY_FORM.roleId ||
    form.pod !== EMPTY_FORM.pod ||
    invite !== true;

  const update = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = {};

    if (!form.fullName.trim()) nextErrors.fullName = 'Full name is required.';
    if (!form.email.trim()) nextErrors.email = 'A work email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      nextErrors.email = 'Enter a valid email address.';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    showToast(
      invite ? 'User created — onboarding invitation sent.' : 'User created without an invitation.',
    );
    if (onSaved) onSaved();
  };

  return (
    <form className="page-screen au-page" onSubmit={handleSubmit}>
      <div className="au-wrap">
        <div className="crumbs au-crumbs">
          <nav aria-label="Breadcrumb">
            <button type="button" className="link-action" onClick={onBack}>
              Users
            </button>
            <svg aria-hidden="true" className="icon">
              <use href="#i-chevron" />
            </svg>
            <strong>Add User</strong>
          </nav>
        </div>

        <header className="au-head">
          <div className="au-head__copy">
            <h1>Add User</h1>
            <p>Provision an account and assign workspace privileges to a team member.</p>
          </div>
          <span className="pill is-green live-chip">Live Workspace Sync</span>
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
                  <h2>Personal Details</h2>
                  <p>Basic contact identity, reachability and public profile visual.</p>
                </div>
              </div>
              <span className="au-step">Step 01</span>
            </div>

            <div className="au-upload">
              <span className="au-upload__avatar">
                <svg aria-hidden="true" className="icon">
                  <use href="#i-user" />
                </svg>
                <span className="au-upload__cam">
                  <svg aria-hidden="true" className="icon">
                    <use href="#i-camera" />
                  </svg>
                </span>
              </span>
              <div className="au-upload__copy">
                <strong>Upload Photo</strong>
                <p>PNG, JPG, or WEBP up to 5MB. Circular display across Kanban &amp; avatars.</p>
              </div>
            </div>

            <div className="au-grid">
              <div className="au-field">
                <label className="au-label" htmlFor="au-name">
                  Full Name
                  <span className="req">*</span>
                </label>
                <input
                  id="au-name"
                  className="form-input"
                  placeholder="Maya Lin"
                  value={form.fullName}
                  onChange={update('fullName')}
                  aria-invalid={Boolean(errors.fullName)}
                />
                {errors.fullName && <span className="set-error">{errors.fullName}</span>}
              </div>

              <div className="au-field">
                <div className="au-label-row">
                  <label className="au-label" htmlFor="au-phone">
                    Phone Number
                  </label>
                  <small className="au-optional">Optional</small>
                </div>
                <input
                  id="au-phone"
                  className="form-input"
                  placeholder="+1 (555) 234-5678"
                  value={form.phone}
                  onChange={update('phone')}
                />
                <span className="au-hint">Used strictly for two-factor security alerts.</span>
              </div>

              <div className="au-field au-field--full">
                <label className="au-label" htmlFor="au-email">
                  Work Email
                  <span className="req">*</span>
                </label>
                <div className="input-icon">
                  <svg aria-hidden="true" className="icon">
                    <use href="#i-mail" />
                  </svg>
                  <input
                    id="au-email"
                    className="form-input"
                    placeholder="maya@agency.orvia.com"
                    value={form.email}
                    onChange={update('email')}
                    aria-invalid={Boolean(errors.email)}
                  />
                </div>
                {errors.email && <span className="set-error">{errors.email}</span>}
              </div>
            </div>
          </section>

          <div className="au-divider" aria-hidden="true" />

          <section className="au-section">
            <div className="au-sec-head">
              <div className="au-sec-title">
                <span className="au-sec-icon">
                  <svg aria-hidden="true" className="icon">
                    <use href="#i-shield" />
                  </svg>
                </span>
                <div>
                  <h2>Access &amp; Team Assignment</h2>
                  <p>Designate administrative boundaries, operational scope and production pod.</p>
                </div>
              </div>
              <span className="au-step">Step 02</span>
            </div>

            <div className="au-grid">
              <div className="au-field">
                <label className="au-label" htmlFor="au-role">
                  Workspace Role
                  <span className="req">*</span>
                </label>
                <span className="form-select-wrap">
                  <select
                    id="au-role"
                    className="form-select"
                    value={form.roleId}
                    onChange={update('roleId')}
                  >
                    {ROLES.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                  <svg aria-hidden="true" className="icon">
                    <use href="#i-chevron" />
                  </svg>
                </span>
              </div>

              <div className="au-field">
                <div className="au-label-row">
                  <label className="au-label" htmlFor="au-pod">
                    Functional Team Pod
                  </label>
                  <small className="au-optional">Optional</small>
                </div>
                <span className="form-select-wrap">
                  <select
                    id="au-pod"
                    className="form-select"
                    value={form.pod}
                    onChange={update('pod')}
                  >
                    {PODS.map((pod) => (
                      <option key={pod}>{pod}</option>
                    ))}
                  </select>
                  <svg aria-hidden="true" className="icon">
                    <use href="#i-chevron" />
                  </svg>
                </span>
              </div>

              <div className="au-role-note">
                <div className="au-role-note__head">
                  <span className="au-role-note__icon">
                    <svg aria-hidden="true" className="icon">
                      <use href="#i-alert" />
                    </svg>
                  </span>
                  <strong>{role.name}</strong>
                  <span className="au-role-note__pill">{role.scope}</span>
                </div>
                <p>{role.blurb}</p>
              </div>

              <div className="au-invite">
                <div className="au-invite__head">
                  <span className="au-invite__icon">
                    <svg aria-hidden="true" className="icon">
                      <use href="#i-send" />
                    </svg>
                  </span>
                  <strong>Send onboarding invitation email immediately</strong>
                  <Switch checked={invite} onChange={setInvite} label="Send invitation email" />
                </div>
                <p>
                  The user will receive an authenticated onboarding security magic link valid for 48
                  hours to establish credentials and complete two-factor registration.
                </p>
              </div>
            </div>
          </section>
        </div>

        <div className={`au-savebar${isDirty ? ' is-dirty' : ''}`}>
          <p className="au-savebar__note">
            <i className="au-savebar__dot" aria-hidden="true" />
            {isDirty ? 'Unsaved notifications' : 'All changes saved'}
          </p>
          <div className="au-savebar__actions">
            <button type="button" className="button button--ghost button--sm" onClick={onBack}>
              Cancel
            </button>
            <button type="submit" className="button button--primary button--sm">
              <svg aria-hidden="true" className="icon">
                <use href="#i-user-plus" />
              </svg>
              Add User
            </button>
          </div>
        </div>
      </div>

      <Toast message={toast?.message} tone={toast?.tone} />
    </form>
  );
}
