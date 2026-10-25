import React, { useEffect, useMemo, useState } from 'react';
import CredentialsModal from '../components/common/CredentialsModal';
import Switch from '../components/ui/Switch';
import Toast from '../components/ui/Toast';
import useToast from '../hooks/useToast';
import { createUser, getJobTitles } from '../services/users';
import { getTeams } from '../services/teams';
import { orderJobTitles, resolveJobTitle } from '../data/jobTitles';
import { generateTemporaryPassword } from '../utils/credentials';

const ROLES = [
  {
    id: 'admin',
    name: 'Workspace Admin',
    backendRole: 'ADMIN',
    scope: 'Full Governance',
    blurb: 'Full control over users, roles, billing, teams and workspace-wide settings.',
  },
  {
    id: 'team_leader',
    name: 'Team Leader',
    backendRole: 'TEAM_LEADER',
    scope: 'Team Supervision & Workflows',
    blurb: 'Supervise assigned team members, track deadlines, review work and manage team content.',
  },
  {
    id: 'am',
    name: 'Account Manager',
    backendRole: 'ACCOUNT_MANAGER',
    scope: 'Brand & Content Operations',
    blurb: 'Manage assigned brands, intake briefs, review deliverables and approve publishing calendars.',
  },
  {
    id: 'creator',
    name: 'Team Member / Creator',
    backendRole: 'EMPLOYEE',
    scope: 'Production Studio',
    blurb: 'Produce and upload creative assets, draft posts, respond to review notes and ship deliverables.',
  },
];

const EMPTY_FORM = {
  fullName: '',
  phone: '',
  email: '',
  roleId: 'team_leader',
  jobTitle: '',
  teamId: '',
};

export default function AddUserPage({ onBack, onSaved }) {
  const { toast, showToast } = useToast(6000);
  const [form, setForm] = useState(EMPTY_FORM);
  const [invite, setInvite] = useState(true);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [credentials, setCredentials] = useState(null);

  const [availableTeams, setAvailableTeams] = useState([]);
  const [availableJobTitles, setAvailableJobTitles] = useState([]);

  const jobTitleChoices = useMemo(
    () => orderJobTitles(availableJobTitles),
    [availableJobTitles],
  );

  useEffect(() => {
    getTeams()
      .then((teams) => setAvailableTeams(Array.isArray(teams) ? teams : []))
      .catch(() => {});

    getJobTitles()
      .then((titles) => setAvailableJobTitles(Array.isArray(titles) ? titles : []))
      .catch(() => {});
  }, []);

  const role = ROLES.find((item) => item.id === form.roleId) ?? ROLES[0];
  const isAdmin = role.backendRole === 'ADMIN';

  const isDirty =
    Boolean(form.fullName || form.phone || form.email) ||
    form.roleId !== EMPTY_FORM.roleId ||
    Boolean(form.teamId) ||
    Boolean(form.jobTitle);

  const update = (key) => (event) => {
    const val = event.target.value;
    setForm((prev) => ({ ...prev, [key]: val }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = {};

    if (!form.fullName.trim()) nextErrors.fullName = 'Full name is required.';
    if (!form.email.trim()) nextErrors.email = 'A work email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      nextErrors.email = 'Enter a valid email address.';

    if (!isAdmin) {
      if (!form.jobTitle) {
        nextErrors.jobTitle = 'Job title is required.';
      }
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    createAccount();
  };

  const createAccount = async () => {
    const password = generateTemporaryPassword();

    const titlePayload = isAdmin
      ? {}
      : resolveJobTitle(availableJobTitles, form.jobTitle);

    setSaving(true);

    try {
      const created = await createUser({
        fullName: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        password,
        roleName: role.backendRole,
        jobTitleId: titlePayload.jobTitleId ?? null,
        customJobTitle: titlePayload.customJobTitle,
        teamId: form.teamId ? Number(form.teamId) : null,
      });

      setCredentials({
        fullName: created?.fullName || form.fullName.trim(),
        email: created?.email || form.email.trim().toLowerCase(),
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
    <form className="page-screen au-page au-page--profile" onSubmit={handleSubmit}>
      <div className="au-wrap au-wrap--profile">
        <header className="au-head">
          <div className="au-head__copy">
            <h1>Add User</h1>
            <p>Create a new user account with role permissions and team assignments.</p>
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
                  <p>Basic contact identity, reachability and public profile info.</p>
                </div>
              </div>
              <span className="au-step">Step 01</span>
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
                <span className="au-hint">Used for SMS alerts and account security.</span>
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
                    type="email"
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
                  <h2>Access &amp; Role Assignment</h2>
                  <p>Designate user permissions, role, job title and team affiliation.</p>
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
                  <label className="au-label" htmlFor="au-team">
                    {role.backendRole === 'TEAM_LEADER' ? 'Team to Lead' : 'Functional Team'}
                  </label>
                  <small className="au-optional">Optional</small>
                </div>
                <span className="form-select-wrap">
                  <select
                    id="au-team"
                    className="form-select"
                    value={form.teamId}
                    onChange={update('teamId')}
                  >
                    <option value="">No Team Assigned</option>
                    {availableTeams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                  <svg aria-hidden="true" className="icon">
                    <use href="#i-chevron" />
                  </svg>
                </span>
              </div>

              {!isAdmin && (
                <div className="au-field">
                  <label className="au-label" htmlFor="au-jobtitle">
                    Job Title
                    <span className="req">*</span>
                  </label>
                  <span className="form-select-wrap">
                    <select
                      id="au-jobtitle"
                      className="form-select"
                      value={form.jobTitle}
                      onChange={update('jobTitle')}
                    >
                      <option value="">Select a Job Title</option>
                      {jobTitleChoices.map((title) => (
                        <option key={title.id} value={title.name}>
                          {title.name}
                        </option>
                      ))}
                    </select>
                    <svg aria-hidden="true" className="icon">
                      <use href="#i-chevron" />
                    </svg>
                  </span>
                  {errors.jobTitle && <span className="set-error">{errors.jobTitle}</span>}
                </div>
              )}

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
                  The user will receive an authenticated onboarding security link valid for 48 hours
                  to establish credentials and sign in.
                </p>
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
