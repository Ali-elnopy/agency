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

export default function AddUserPage({ onBack, onSaved }) {
  const { toast, showToast } = useToast(3000);
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    roleId: 'am',
    pod: PODS[0],
  });
  const [invite, setInvite] = useState(true);
  const [errors, setErrors] = useState({});

  const role = ROLES.find((item) => item.id === form.roleId) ?? ROLES[0];

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
    <form className="page-screen" onSubmit={handleSubmit}>
      <div className="crumbs">
        <nav aria-label="Breadcrumb">
          <button type="button" className="link-action" onClick={onBack}>
            Users
          </button>
          <svg aria-hidden="true" className="icon">
            <use href="#i-chevron" />
          </svg>
          <strong>Add User</strong>
        </nav>
        <span className="pill is-green live-chip">Live Workspace Sync</span>
      </div>

      <section className="page-head">
        <h1 className="page-head__title">Add User</h1>
        <p className="page-head__text">
          Provision an account and assign workspace privileges to a team member.
        </p>
      </section>

      <div className="form-grid">
        <div className="stack">
          <section className="form-section">
            <div className="form-section__head">
              <div>
                <h2>Personal Details</h2>
                <p>Basic contact identity, reachability and public profile visual.</p>
              </div>
              <span className="form-step">Step 01</span>
            </div>

            <div className="form-fields">
              <div className="form-field form-field--full">
                <span className="form-label">Upload Photo</span>
                <div className="upload upload--compact">
                  <span className="upload__avatar">
                    <svg aria-hidden="true" className="icon">
                      <use href="#i-users" />
                    </svg>
                    <span className="upload__cam">
                      <svg aria-hidden="true" className="icon">
                        <use href="#i-camera" />
                      </svg>
                    </span>
                  </span>
                  <p>
                    PNG, JPG, or WEBP up to 5MB. Circular display across Kanban &amp; approvals.
                  </p>
                </div>
              </div>

              <div className="form-field">
                <label className="form-label" htmlFor="au-name">
                  Full Name <small>Required</small>
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

              <div className="form-field">
                <label className="form-label" htmlFor="au-phone">
                  Phone Number <small>Optional</small>
                </label>
                <input
                  id="au-phone"
                  className="form-input"
                  placeholder="US: +1 (555) 234-5678"
                  value={form.phone}
                  onChange={update('phone')}
                />
                <span className="form-hint">Used strictly for two-factor security alerts.</span>
              </div>

              <div className="form-field form-field--full">
                <label className="form-label" htmlFor="au-email">
                  Work Email <small>Required</small>
                </label>
                <input
                  id="au-email"
                  className="form-input"
                  placeholder="maya@agency.orvia.com"
                  value={form.email}
                  onChange={update('email')}
                  aria-invalid={Boolean(errors.email)}
                />
                {errors.email && <span className="set-error">{errors.email}</span>}
              </div>
            </div>
          </section>

          <section className="form-section">
            <div className="form-section__head">
              <div>
                <h2>Access &amp; Team Assignment</h2>
                <p>Designate administrative boundaries, operational scope and production pod.</p>
              </div>
              <span className="form-step">Step 02</span>
            </div>

            <div className="form-fields">
              <div className="form-field">
                <label className="form-label" htmlFor="au-role">
                  Workspace Role <small>Required</small>
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

              <div className="form-field">
                <label className="form-label" htmlFor="au-pod">
                  Functional Team Pod <small>Optional</small>
                </label>
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

              <div className="form-field form-field--full">
                <div className="notice notice--purple">
                  <svg aria-hidden="true" className="icon">
                    <use href="#i-shield" />
                  </svg>
                  <span>
                    <strong>{role.name}</strong> — {role.scope}
                    <br />
                    {role.blurb}
                  </span>
                </div>
              </div>

              <div className="form-field form-field--full">
                <div className="notice">
                  <Switch
                    checked={invite}
                    onChange={setInvite}
                    label="Send onboarding invitation email immediately"
                  />
                  <span>
                    <strong>Send onboarding invitation email immediately</strong>
                    <br />
                    The user will receive an authenticated onboarding security magic link valid for
                    48 hours.
                  </span>
                </div>
              </div>
            </div>

            <div className="form-foot">
              <button type="button" className="button button--ghost" onClick={onBack}>
                Cancel
              </button>
              <button type="submit" className="button button--primary">
                Create User
              </button>
            </div>
          </section>
        </div>

        <aside className="rail">
          <section className="rail-card">
            <div className="rail-card__head">
              <h2>Provisioning Checklist</h2>
            </div>
            <div className="timeline">
              <div className="timeline__item is-green">
                <strong>Identity</strong>
                <p>Full name and work email are required before provisioning.</p>
              </div>
              <div className="timeline__item is-orange">
                <strong>Access scope</strong>
                <p>The workspace role sets visibility and edit boundaries.</p>
              </div>
              <div className="timeline__item is-purple">
                <strong>Team pod</strong>
                <p>Assigned pods receive the member on their capacity board.</p>
              </div>
              <div className="timeline__item is-amber">
                <strong>Invitation</strong>
                <p>Magic links expire after 48 hours for security.</p>
              </div>
            </div>
          </section>
        </aside>
      </div>

      <Toast message={toast?.message} tone={toast?.tone} />
    </form>
  );
}
