import React, { useRef, useState } from 'react';
import Toast from '../components/ui/Toast';
import useAvatar from '../hooks/useAvatar';
import useToast from '../hooks/useToast';
import { getJobTitles, updateUser } from '../services/users';
import { addTeamMember, getTeams } from '../services/teams';
import { clearAvatar, fileToAvatar, saveAvatar } from '../services/avatarStore';

const PODS = [
  'Growth & Performance Team (14 members)',
  'Brand Strategy & Growth (8 members)',
  'Creative & Motion Studio (12 members)',
  'Performance Content Squad (8 members)',
];

const PORTFOLIOS = ['Acme Corp', 'Lumina A.', 'Apex Global', 'Velcoe Media'];

function initialsOf(name) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
}

export default function EditUserPage({ member = 'Marcus Vance', record, onBack, onSaved }) {
  const { toast, showToast } = useToast(3000);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    fullName: record?.fullName || member,
    email: record?.email || `${member.split(' ')[0].toLowerCase()}.vance@orvia-agency.com`,
    phone: record?.phone || 'US: +1 (555) 340-1188',
    jobTitle: record?.jobTitleName || 'Senior Account Manager',
    pod: PODS[0],
  });

  const photoRef = useRef(null);
  const [memberKey] = useState(record?.email || form.email);
  const avatar = useAvatar(memberKey) || null;

  const handlePhotoPick = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    try {
      const dataUrl = await fileToAvatar(file);
      saveAvatar(memberKey, dataUrl);
      showToast('Profile photo updated.');
    } catch (error) {
      showToast(error.message || 'Could not read that image.', 'danger');
    }
  };

  const handleRemovePhoto = () => {
    clearAvatar(memberKey);
    showToast('Profile photo removed.', 'info');
  };

  const update = (key) => (event) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
    setDirty(true);
  };

  const handleSave = async () => {
    if (!record?.id) {
      setDirty(false);
      showToast('Member profile updated successfully.');
      if (onSaved) onSaved('Member profile updated successfully.');
      return;
    }

    setSaving(true);

    try {
      const titles = await getJobTitles().catch(() => []);
      const match = titles.find(
        (title) => title.name.toLowerCase() === form.jobTitle.trim().toLowerCase(),
      );

      await updateUser(record.id, {
        name: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        ...(match ? { jobTitleId: match.id } : {}),
      });

      const teamName = form.pod.replace(/\s*\(\d+\s*members?\)$/i, '').trim();
      const teams = await getTeams().catch(() => []);
      const team = teams.find((item) => item.name === teamName);

      if (team) await addTeamMember(team.id, record.id).catch(() => {});

      setDirty(false);
      showToast('Member profile updated successfully.');
      if (onSaved) onSaved('Member profile updated successfully.');
    } catch (error) {
      showToast(error.message || 'Could not update this member. Please try again.', 'danger');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-screen">
      <div className="crumbs">
        <nav aria-label="Breadcrumb">
          <button type="button" className="link-action" onClick={onBack}>
            Users
          </button>
          <svg aria-hidden="true" className="icon">
            <use href="#i-chevron" />
          </svg>
          <strong>Edit User</strong>
        </nav>
        <span className="pill is-green live-chip">Active Account</span>
      </div>

      <section className="page-head page-head--actions">
        <div className="head-title-group">
          <span className="avatar avatar--lg is-a">
            {avatar ? <img src={avatar} alt="" /> : initialsOf(member)}
          </span>
          <div>
            <div className="page-head__title-row">
              <h1 className="page-head__title">{member}</h1>
              <span className="pill is-green">
                <i className="status-dot" />
                Active Account
              </span>
              <span className="pill is-orange">{record?.role || 'Account Manager'}</span>
            </div>
            <div className="head-meta">
              <span>Created {record?.addedAt || 'Oct 14, 2025'}</span>
              <span>
                {record?.lastLoginAt
                  ? `Last active ${new Date(record.lastLoginAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}`
                  : 'Never signed in'}
              </span>
              <span>ID: {record?.id ? `USR-${String(record.id).padStart(5, '0')}` : 'USR-84923'}</span>
            </div>
          </div>
        </div>

        <div className="page-head__actions">
          <button
            type="button"
            className="button button--ghost button--sm"
            onClick={() => showToast('Opening the activity audit log…', 'info')}
          >
            Activity Log
          </button>
        </div>
      </section>

      {dirty && (
        <div className="save-bar">
          <span>You have unsaved changes in Personal Details &amp; Roles.</span>
          <div className="save-bar__actions">
            <button
              type="button"
              className="button button--ghost button--xs"
              onClick={() => setDirty(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="button button--primary button--xs"
              onClick={handleSave}
              disabled={saving}
            >
              Save changes
            </button>
          </div>
        </div>
      )}

      <div className="form-grid">
        <div className="stack">
          <section className="form-section">
            <div className="form-section__head">
              <div>
                <h2>Personal Details</h2>
                <p>
                  Update member credentials, work identity and primary agency contact information.
                </p>
              </div>
            </div>

            <div className="form-fields">
              <div className="form-field form-field--full">
                <span className="form-label">Profile Photo</span>
                <div className="upload">
                  <span className="upload__mark">
                    {avatar ? <img src={avatar} alt="" /> : initialsOf(member)}
                  </span>
                  <div className="upload__body">
                    <strong>{member.toLowerCase().replace(/\s+/g, '-')}.jpg</strong>
                    <p>JPG, PNG or WebP under 5MB. Recommended resolution: 400x400px.</p>
                    <div className="upload__actions">
                      <button
                        type="button"
                        className="button button--ghost button--xs"
                        onClick={() => photoRef.current?.click()}
                      >
                        Change photo
                      </button>
                      <button
                        type="button"
                        className="button button--ghost button--xs button--danger-ghost"
                        onClick={handleRemovePhoto}
                      >
                        Remove
                      </button>
                    </div>
                    <input
                      ref={photoRef}
                      type="file"
                      accept="image/*"
                      className="pf-file"
                      onChange={handlePhotoPick}
                      aria-label="Change profile photo"
                    />
                  </div>
                </div>
              </div>

              <div className="form-field">
                <label className="form-label" htmlFor="eu-name">
                  Full Name <small>Local or preferred</small>
                </label>
                <input
                  id="eu-name"
                  className="form-input"
                  value={form.fullName}
                  onChange={update('fullName')}
                />
              </div>

              <div className="form-field">
                <label className="form-label" htmlFor="eu-email">
                  Work Email <small>Verified</small>
                </label>
                <span className="input-icon">
                  <svg aria-hidden="true" className="icon">
                    <use href="#i-check" />
                  </svg>
                  <input
                    id="eu-email"
                    className="form-input"
                    value={form.email}
                    onChange={update('email')}
                  />
                </span>
                <span className="form-hint">
                  Used for workspace single sign-on (SSO) and client communication.
                </span>
              </div>

              <div className="form-field">
                <label className="form-label" htmlFor="eu-phone">
                  Phone Number <small>Optional</small>
                </label>
                <input
                  id="eu-phone"
                  className="form-input"
                  value={form.phone}
                  onChange={update('phone')}
                />
              </div>

              <div className="form-field">
                <label className="form-label" htmlFor="eu-title">
                  Job Title &amp; Specialization
                </label>
                <input
                  id="eu-title"
                  className="form-input"
                  value={form.jobTitle}
                  onChange={update('jobTitle')}
                />
              </div>
            </div>
          </section>

          <section className="form-section">
            <div className="form-section__head">
              <div>
                <h2>Team Assignment</h2>
                <p>
                  Assign this team member to an operational pod to allocate briefs and client review
                  boards.
                </p>
              </div>
            </div>

            <div className="pod">
              <div className="pod__head">
                <strong>Growth &amp; Performance Team</strong>
                <span className="pill is-gray">14 Members</span>
              </div>
              <p className="sub" style={{ marginTop: 6 }}>
                Team Lead: Julian Vance • Pod #04
              </p>
              <div className="form-fields" style={{ marginTop: 12 }}>
                <div className="form-field form-field--full">
                  <label className="form-label" htmlFor="eu-pod">
                    Change Assigned Team
                  </label>
                  <span className="form-select-wrap">
                    <select
                      id="eu-pod"
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
              </div>
            </div>
          </section>

          <section className="form-section">
            <div className="form-section__head">
              <div>
                <h2>Role &amp; Permissions</h2>
                <p>
                  Controls workspace visibility, client asset manipulation and system privileges.
                </p>
              </div>
              <button
                type="button"
                className="button button--ghost button--xs"
                onClick={() => showToast('Opening the role change matrix…', 'info')}
              >
                Change role
              </button>
            </div>

            <div className="pod">
              <div className="pod__head">
                <strong>Account Manager</strong>
                <span className="pill is-purple">Standard Tier</span>
              </div>
              <p className="sub" style={{ marginTop: 8 }}>
                Can create and edit client briefs, manage brand assets, run AI classification runs
                and liaise with client portal contacts. Cannot manage billing or delete workspace
                data.
              </p>
            </div>
          </section>

          <div className="form-foot">
            <button type="button" className="button button--ghost" onClick={onBack}>
              Cancel
            </button>
            <button
              type="button"
              className="button button--primary"
              onClick={handleSave}
              disabled={saving}
            >
              Save changes
            </button>
          </div>
        </div>

        <aside className="rail">
          <section className="rail-card">
            <div className="rail-card__head">
              <h2>Member Summary</h2>
              <span className="pill is-gray pill--caps">Live Snapshot</span>
            </div>

            <div className="person">
              <span className="avatar avatar--lg is-a">
                {avatar ? <img src={avatar} alt="" /> : initialsOf(member)}
              </span>
              <div className="person__body">
                <strong>{member}</strong>
                <small>{form.email}</small>
              </div>
            </div>

            <div className="kv" style={{ marginTop: 12 }}>
              <span>Access Role</span>
              <strong>{record?.role || 'Account Manager'}</strong>
            </div>
            <div className="kv">
              <span>Team Pod</span>
              <strong>{form.pod.replace(/\s*\(\d+\s*members?\)$/i, '')}</strong>
            </div>
            <div className="kv">
              <span>Status</span>
              <strong>{record?.status === 'deactivated' ? 'Deactivated' : 'Active'}</strong>
            </div>
            <div className="kv">
              <span>Joined Workspace</span>
              <strong>{record?.addedAt || 'Oct 14, 2025'}</strong>
            </div>
            <div className="kv">
              <span>Last Login</span>
              <strong>Today, 09:42 AM</strong>
            </div>
          </section>

          <section className="rail-card">
            <div className="rail-card__head">
              <h2>Active Portfolios (4)</h2>
              <button
                type="button"
                className="link-action"
                onClick={() => showToast('Re-assigning portfolios…', 'info')}
              >
                Re-assign
              </button>
            </div>
            <div className="eco-tags" style={{ marginTop: 0 }}>
              {PORTFOLIOS.map((portfolio) => (
                <span key={portfolio} className="eco-tag">
                  <i />
                  {portfolio}
                </span>
              ))}
            </div>
            <div className="form-foot" style={{ justifyContent: 'space-between' }}>
              <button type="button" className="link-action">
                View Activity Audit Log →
              </button>
              <button type="button" className="link-action">
                Active Briefs Queue (8) →
              </button>
            </div>
          </section>

          <section className="rail-card">
            <div className="rail-card__head">
              <h2>Weekly Brief Throughput</h2>
              <span className="delta-up">+18% vs avg</span>
            </div>
            <svg
              className="spark is-purple"
              viewBox="0 0 120 30"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path d="M0 22 L20 18 L40 24 L60 10 L80 14 L100 8 L120 12" />
            </svg>
            <div className="mini-stats" style={{ marginTop: 12 }}>
              <div className="mini-stat">
                <strong>2</strong>
                <span>Mon</span>
              </div>
              <div className="mini-stat">
                <strong>8</strong>
                <span>Wed</span>
              </div>
              <div className="mini-stat">
                <strong>4</strong>
                <span>Fri</span>
              </div>
            </div>
          </section>
        </aside>
      </div>

      <Toast message={toast?.message} tone={toast?.tone} />
    </div>
  );
}
