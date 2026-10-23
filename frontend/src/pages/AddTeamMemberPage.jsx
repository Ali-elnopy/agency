import React, { useState } from 'react';
import Toast from '../components/ui/Toast';
import useToast from '../hooks/useToast';
import { useWorkspace } from '../context/workspaceStore';
import {
  ACCESS_LEVELS,
  PERMISSION_OPTIONS,
  permissionsForAccess,
} from '../data/workspace';

const EMPTY_FORM = {
  fullName: '',
  email: '',
  jobTitle: '',
  systemAccess: 'employee',
  permissions: [],
};

export default function AddTeamMemberPage({ team: teamName, onBack, onSaved }) {
  const { teams, users, createMember } = useWorkspace();
  const { toast, showToast } = useToast(3500);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  const team = teams.find((item) => item.name === teamName) ?? null;

  if (!team) {
    return (
      <div className="ws-page">
        <button type="button" className="ws-back" onClick={onBack}>
          <span aria-hidden="true">←</span> Back to Teams
        </button>
        <div className="ws-empty ws-empty--panel">
          <strong>Team not found.</strong>
          <p>This team may have been deleted.</p>
        </div>
      </div>
    );
  }

  const updateField = (field) => (event) => {
    const value = event.target.value;

    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const updateAccess = (event) => {
    const systemAccess = event.target.value;

    setForm((prev) => ({
      ...prev,
      systemAccess,
      permissions: permissionsForAccess(systemAccess, prev.permissions),
    }));
  };

  const togglePermission = (permissionId) => {
    if (form.systemAccess !== 'employee') return;

    setForm((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter((permission) => permission !== permissionId)
        : [...prev.permissions, permissionId],
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const nextErrors = {};
    const fullName = form.fullName.trim();
    const email = form.email.trim().toLowerCase();
    const jobTitle = form.jobTitle.trim();

    if (!fullName) nextErrors.fullName = 'Full name is required.';
    if (!email) nextErrors.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = 'Enter a valid email address.';
    } else if (users.some((user) => user.email.toLowerCase() === email)) {
      nextErrors.email = 'A member with this email already exists.';
    }
    if (!jobTitle) nextErrors.jobTitle = 'Job title is required.';

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    createMember({
      fullName,
      email,
      jobTitle,
      systemAccess: form.systemAccess,
      permissions: permissionsForAccess(form.systemAccess, form.permissions),
      teamId: team.id,
    });

    if (onSaved) {
      onSaved('Team member added successfully.');
      return;
    }

    setForm(EMPTY_FORM);
    showToast('Team member added successfully.');
  };

  return (
    <form className="ws-page ws-form-page" onSubmit={handleSubmit}>
      <button type="button" className="ws-back" onClick={onBack}>
        <span aria-hidden="true">←</span> Back to {team.name}
      </button>

      <header className="ws-form-head">
        <span className="ws-eyebrow">{team.name}</span>
        <h1 className="ws-page-title">Add Team Member</h1>
        <p className="ws-page-sub">Create a login account and add the member directly to this team.</p>
      </header>

      <div className="ws-form-card">
        <div className="ws-form-stack">
          <label className={`ws-field${errors.fullName ? ' is-invalid' : ''}`}>
            <span>
              Full Name <em>*</em>
            </span>
            <input
              className="ws-input"
              value={form.fullName}
              onChange={updateField('fullName')}
              placeholder="Example: Ahmed Mohamed"
              autoComplete="name"
            />
            {errors.fullName && <small className="ws-error">{errors.fullName}</small>}
          </label>

          <label className={`ws-field${errors.email ? ' is-invalid' : ''}`}>
            <span>
              Email <em>*</em>
            </span>
            <input
              className="ws-input"
              type="email"
              value={form.email}
              onChange={updateField('email')}
              placeholder="ahmed@agency.com"
              autoComplete="email"
            />
            {errors.email && <small className="ws-error">{errors.email}</small>}
          </label>

          <label className={`ws-field${errors.jobTitle ? ' is-invalid' : ''}`}>
            <span>
              Job Title <em>*</em>
            </span>
            <input
              className="ws-input"
              value={form.jobTitle}
              onChange={updateField('jobTitle')}
              placeholder="Designer, Video Editor, Content Creator..."
            />
            <small className="ws-hint">
              Job Title is flexible. You can write any role used by your agency.
            </small>
            {errors.jobTitle && <small className="ws-error">{errors.jobTitle}</small>}
          </label>

          <label className="ws-field">
            <span>
              System Access <em>*</em>
            </span>
            <span className="ws-select-wrap">
              <select className="ws-select" value={form.systemAccess} onChange={updateAccess}>
                {ACCESS_LEVELS.map((level) => (
                  <option key={level.id} value={level.id}>
                    {level.label}
                  </option>
                ))}
              </select>
              <svg aria-hidden="true" className="icon">
                <use href="#i-chevron" />
              </svg>
            </span>
          </label>

          <fieldset className="ws-permissions ws-permissions--form">
            <legend>Work Permissions</legend>
            <div className="ws-permission-list">
              {PERMISSION_OPTIONS.map((permission) => {
                const locked = form.systemAccess !== 'employee';

                return (
                  <label
                    className={`ws-permission-card${locked ? ' is-locked' : ''}`}
                    key={permission.id}
                  >
                    <input
                      type="checkbox"
                      checked={form.permissions.includes(permission.id)}
                      onChange={() => togglePermission(permission.id)}
                      disabled={locked}
                    />
                    <span className="ws-permission-card__body">
                      <strong>{permission.label}</strong>
                      <small>{permission.description}</small>
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <div className="ws-callout">
            <strong>Login Credentials</strong>
            <p>
              The system will automatically generate a secure temporary password for this member.
            </p>
          </div>

          <footer className="ws-form-foot">
            <button type="button" className="ws-btn ws-btn--ghost" onClick={onBack}>
              Cancel
            </button>
            <button type="submit" className="ws-btn ws-btn--primary">
              Create Member
            </button>
          </footer>
        </div>
      </div>

      <Toast message={toast?.message} tone={toast?.tone} />
    </form>
  );
}
