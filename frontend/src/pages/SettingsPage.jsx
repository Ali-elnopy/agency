import React, { useState } from 'react';
import Switch from '../components/ui/Switch';
import Toast from '../components/ui/Toast';

const BRANDS = ['Aura Mobility', 'Kinetic Health', 'Vanguard Audio', 'Solace Skincare'];

export default function SettingsPage({ user }) {
  const name = user?.fullName || 'Elena Vance';
  const email = user?.email || 'elena.vance@orvia-creative.com';

  const [twoFA, setTwoFA] = useState(true);
  const [urgentAlerts, setUrgentAlerts] = useState(true);
  const [auditLogs, setAuditLogs] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [toast, setToast] = useState('');

  const notify = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 3500);
  };

  return (
    <div className="settings">
      {/* Breadcrumb */}
      <div className="crumbs">
        <nav aria-label="Breadcrumb">
          <span>Workspace</span>
          <svg className="icon">
            <use href="#i-chevron" />
          </svg>
          <span>Settings</span>
          <svg className="icon">
            <use href="#i-chevron" />
          </svg>
          <strong>My Profile &amp; Identity</strong>
        </nav>
      </div>

      {/* Page head */}
      <section className="page-head settings-head">
        <div className="settings-head__main">
          <div className="settings-title">
            <h1 className="page-head__title">My Profile</h1>
            <span className="pill is-green verified-pill">Verified Studio Lead</span>
            <span className="id-chip">ID: #ORV-0014</span>
          </div>
          <p className="page-head__text">
            Manage your personal profile, workspace role credentials, security authentication, and brand notifications.
          </p>
        </div>

        <div className="settings-head__actions">
          <button type="button" className="button button--ghost" onClick={() => notify('Opening audit activity…')}>
            View Audit Activity
          </button>
          <button type="button" className="button button--primary" onClick={() => notify('Profile changes saved successfully.')}>
            Save Profile Changes
          </button>
        </div>
      </section>

      {/* Body */}
      <div className="settings-grid">
        {/* ---------------- Left column ---------------- */}
        <div className="settings-col">
          <section className="surface-card profile-card">
            <div className="profile-top">
              <span className="profile-avatar">
                <span className="profile-avatar__inner">
                  <svg viewBox="0 0 24 24" aria-hidden="true" className="profile-avatar__glyph">
                    <circle cx="12" cy="8.6" r="4.1" />
                    <path d="M4.6 20.6a7.4 7.4 0 0 1 14.8 0" />
                  </svg>
                </span>
              </span>

              <div className="profile-id">
                <div className="profile-name">
                  <strong>{name}</strong>
                  <span className="badge-internal">Internal</span>
                </div>
                <span className="profile-email">
                  {email}
                  <span className="profile-email__meta"> • Added Oct 12, 2026</span>
                </span>
                <div className="profile-actions">
                  <button type="button" className="button button--primary button--sm" onClick={() => notify('Choose a new profile photo…')}>
                    Update Avatar
                  </button>
                  <button type="button" className="button button--ghost button--sm" onClick={() => notify('Avatar removed.')}>
                    Remove
                  </button>
                </div>
              </div>

              <span className="pill is-green profile-status">
                <i className="status-dot" />
                Active
              </span>
            </div>

            {/* Assigned workspace role */}
            <div className="role-box">
              <div className="role-box__body">
                <span className="caps">Assigned Workspace Role</span>
                <p className="role-box__name">Studio Lead &amp; Admin</p>
                <p className="role-box__desc">Full governance: budgets, client invites, system API keys</p>
              </div>
              <span className="role-box__tag">
                Full
                <br />
                Control
              </span>
            </div>

            {/* Brands */}
            <div className="brands">
              <div className="brands__head">
                <span className="caps caps--muted">Assigned Brands &amp; Workspaces</span>
                <a
                  className="link-action"
                  href="#access"
                  onClick={(e) => {
                    e.preventDefault();
                    notify('Opening workspace access…');
                  }}
                >
                  Manage Access
                  <svg className="icon">
                    <use href="#i-arrow" />
                  </svg>
                </a>
              </div>
              <div className="brands__list">
                {BRANDS.map((brand) => (
                  <span key={brand} className="brand-chip">
                    {brand}
                  </span>
                ))}
                <span className="brand-chip brand-chip--more">+20 Active Brands</span>
              </div>
            </div>

            {/* Mini stats */}
            <div className="profile-stats">
              <div className="set-stat">
                <span className="set-stat__label">Sign-Offs</span>
                <p className="set-stat__value">
                  142 <small className="is-up">+18%</small>
                </p>
              </div>
              <div className="set-stat">
                <span className="set-stat__label">Direct Reports</span>
                <p className="set-stat__value">
                  18 <small>Creators</small>
                </p>
              </div>
              <div className="set-stat">
                <span className="set-stat__label">Trust Score</span>
                <p className="set-stat__value is-trust">99.9%</p>
              </div>
            </div>
          </section>

          {/* Security */}
          <section className="surface-card security-card">
            <header className="security-head">
              <span className="security-head__icon">
                <svg className="icon">
                  <use href="#i-shield" />
                </svg>
              </span>
              <div className="security-head__body">
                <h2 className="security-head__title">Security &amp; Authentication</h2>
                <p className="security-head__sub">Enterprise SSO &amp; Two-Factor Protection</p>
              </div>
              <span className="pill is-green soc-pill">SOC2 Verified</span>
            </header>

            <div className="security-row">
              <div className="security-row__body">
                <p className="security-row__title">Two-Factor Authentication (2FA)</p>
                <p className="security-row__sub">Authenticator App &amp; Hardware Key enforced</p>
              </div>
              <Switch checked={twoFA} onChange={setTwoFA} label="Two-factor authentication" />
            </div>

            <div className="security-row">
              <div className="security-row__body">
                <p className="security-row__title">Google Workspace SSO &amp; Figma Token</p>
                <p className="security-row__sub">Last synced: Today, 09:42 AM • Cairo, EG</p>
              </div>
              <span className="security-link">
                Connected
                <svg className="icon">
                  <use href="#i-check" />
                </svg>
              </span>
            </div>
          </section>
        </div>

        {/* ---------------- Right column ---------------- */}
        <div className="settings-col">
          <section className="surface-card">
            <header className="surface-card__head">
              <div>
                <h2 className="surface-card__title">Personal &amp; Contact Information</h2>
                <p className="surface-card__sub">
                  Displayed across internal studio briefs, client sign-off portals, and audit logs.
                </p>
              </div>
              <span className="primary-tag">
                Primary
                <br />
                Profile
              </span>
            </header>

            <div className="set-form">
              <label className="set-field">
                <span className="set-label">Full Name *</span>
                <input className="set-input" defaultValue={name} />
              </label>

              <label className="set-field set-field--ok">
                <span className="set-label">Work Email *</span>
                <input className="set-input" type="email" defaultValue={email} />
                <svg className="icon set-field__ok">
                  <use href="#i-check" />
                </svg>
              </label>

              <label className="set-field">
                <span className="set-label">Job Title / Display Role</span>
                <input className="set-input" defaultValue="Executive Studio Lead" />
              </label>

              <label className="set-field">
                <span className="set-label">Phone / Direct WhatsApp</span>
                <input className="set-input" defaultValue="+1 (555) 234-8900" />
              </label>

              <label className="set-field">
                <span className="set-label">Department / Pod</span>
                <span className="set-select-wrap">
                  <select className="set-select" defaultValue="exec">
                    <option value="exec">Executive &amp; Creative Operations</option>
                    <option value="content">Content Production</option>
                    <option value="design">Brand Design</option>
                  </select>
                  <svg className="icon">
                    <use href="#i-chevron" />
                  </svg>
                </span>
              </label>

              <label className="set-field">
                <span className="set-label">Timezone &amp; Workspace Locale</span>
                <span className="set-select-wrap">
                  <select className="set-select" defaultValue="cairo">
                    <option value="cairo">(GMT+02:00) Cairo / EET • English (US)</option>
                    <option value="london">(GMT+00:00) London / GMT • English (UK)</option>
                    <option value="dubai">(GMT+04:00) Dubai / GST • English (US)</option>
                  </select>
                  <svg className="icon">
                    <use href="#i-chevron" />
                  </svg>
                </span>
              </label>
            </div>
          </section>

          <div className="settings-duo">
            {/* Password */}
            <section className="surface-card">
              <header className="surface-card__head">
                <h2 className="surface-card__title">Password &amp; Credentials</h2>
                <span className="status-text">Strong</span>
              </header>

              <div className="set-field pw-field">
                <span className="set-label">Current Password</span>
                <input className="set-input" type="password" defaultValue="orvia2026secure" />
              </div>

              <div className="set-field pw-field">
                <span className="set-label">New Password</span>
                <input className="set-input" type="password" defaultValue="orvia2026secure!" />
                <button type="button" className="pw-update" onClick={() => notify('Password updated successfully.')}>
                  Update
                </button>
              </div>

              <div className="pw-foot">
                <span>Last changed 14 days ago</span>
                <a
                  className="link-action"
                  href="#revoke"
                  onClick={(e) => {
                    e.preventDefault();
                    notify('Revoking other active sessions…');
                  }}
                >
                  Revoke other sessions
                </a>
              </div>
            </section>

            {/* Notifications */}
            <section className="surface-card">
              <header className="surface-card__head">
                <h2 className="surface-card__title">Workflow Notifications</h2>
                <span className="caps">Real-Time</span>
              </header>

              <div className="notif-list">
                <div className="notif">
                  <div className="notif__body">
                    <p className="notif__title">Urgent Client Sign-Off Alerts</p>
                    <p className="notif__sub">Instant push &amp; email on bottleneck items</p>
                  </div>
                  <Switch checked={urgentAlerts} onChange={setUrgentAlerts} label="Urgent client sign-off alerts" />
                </div>

                <div className="notif">
                  <div className="notif__body">
                    <p className="notif__title">Role &amp; Permission Audit Logs</p>
                    <p className="notif__sub">Alert when admin modifies user roles</p>
                  </div>
                  <Switch checked={auditLogs} onChange={setAuditLogs} label="Role and permission audit logs" />
                </div>

                <div className="notif">
                  <div className="notif__body">
                    <p className="notif__title">Weekly Production Velocity Digest</p>
                    <p className="notif__sub">Every Monday at 09:00 AM</p>
                  </div>
                  <Switch checked={weeklyDigest} onChange={setWeeklyDigest} label="Weekly production velocity digest" />
                </div>
              </div>
            </section>
          </div>

          {/* Sync footer */}
          <div className="settings-sync">
            <p className="settings-sync__text">
              <i className="settings-sync__dot" />
              All profile changes sync immediately with SSO &amp; active client portals.
            </p>
            <div className="settings-sync__actions">
              <a
                className="link"
                href="#discard"
                onClick={(e) => {
                  e.preventDefault();
                  notify('Changes discarded.');
                }}
              >
                Discard
              </a>
              <button type="button" className="button button--primary" onClick={() => notify('Profile changes saved successfully.')}>
                Save Changes
                <svg className="icon">
                  <use href="#i-arrow" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <Toast message={toast} />
    </div>
  );
}
