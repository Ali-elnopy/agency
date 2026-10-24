import React, { useState } from 'react';
import CredentialsModal from '../components/common/CredentialsModal';
import Switch from '../components/ui/Switch';
import Toast from '../components/ui/Toast';
import useToast from '../hooks/useToast';
import { createUser, getJobTitles } from '../services/users';
import { addTeamMember, getTeams } from '../services/teams';
import { generateTemporaryPassword } from '../utils/credentials';

const ROLES = [
  {
    id: 'am',
    name: 'Account Manager',
    scope: 'Brand & Content Operations',
    blurb:
      'Manage assigned brands, intake brand briefs, run AI classifications, review creative deliverables and approve publishing calendars.',
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

function podToTeamName(pod) {
  return String(pod).replace(/\s*\(\d+\s*members?\)$/i, '').trim();
}

export default function AddUserPage({ onBack, onSaved }) {
  const { toast, showToast } = useToast(6000);
  const [form, setForm] = useState(EMPTY_FORM);
  const [invite, setInvite] = useState(true);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [credentials, setCredentials] = useState(null);

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

    createAccount();
  };

  const createAccount = async () => {
    const roleMap = { am: 'ACCOUNT_MANAGER', creator: 'EMPLOYEE' };
    const roleName = roleMap[form.roleId];

    if (!roleName) {
      showToast(
        'Workspace Admin accounts are provisioned by the platform and cannot be created here.',
        'danger',
      );
      return;
    }

    let jobTitleId = null;

    if (roleName === 'EMPLOYEE') {
      const titles = await getJobTitles().catch(() => []);
      jobTitleId = titles.find((title) => title.name === 'Content Creator')?.id ?? null;

      if (!jobTitleId) {
        showToast('The Content Creator job title is not configured in the database.', 'danger');
        return;
      }
    }

    const password = generateTemporaryPassword();

    setSaving(true);

    try {
      const created = await createUser({
        fullName: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        password,
        roleName,
        jobTitleId,
      });

      const teams = await getTeams().catch(() => []);
      const team = teams.find((item) => item.name === podToTeamName(form.pod));

      if (team && created?.id) {
        await addTeamMember(team.id, created.id).catch(() => {});
      }

      setCredentials({
        fullName: created?.fullName || form.fullName.trim(),
        email: created?.email || form.email.trim().toLowerCase(),
        // A mock account only exists in this browser; never show a password
        // for an account the API did not really create.
        password: created?.isMock ? '' : password,
        isDemo: Boolean(created?.isMock),
      });
      setForm(EMPTY_FORM);
    } catch (error) {
      showToast(error.message || 'Could not create this user. Please try again.', 'danger');
    } finally {
      setSaving(false);
    }
  };

  const closeCredentials = () => {
    const saved = credentials;

    setCredentials(null);

    if (!saved?.isDemo) showToast('User created successfully.');
    if (onSaved) onSaved('User created successfully.');
  };

  return (
    <form className="page-screen au-page" onSubmit={handleSubmit}>
      <div className="au-wrap">
        <header className="au-head">
          <div className="au-head__copy">
            <h1>Add User</h1>
          </div>
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
            <button type="submit" className="button button--primary button--sm" disabled={saving}>
              <svg aria-hidden="true" className="icon">
                <use href="#i-user-plus" />
              </svg>
              {saving ? 'Adding…' : 'Add User'}
            </button>
          </div>
        </div>
      </div>

      <CredentialsModal
        isOpen={Boolean(credentials)}
        fullName={credentials?.fullName}
        email={credentials?.email}
        password={credentials?.password}
        isDemo={credentials?.isDemo}
        onClose={closeCredentials}
      />

      <Toast message={toast?.message} tone={toast?.tone} />
    </form>
  );
}
