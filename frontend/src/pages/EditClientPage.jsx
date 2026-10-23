import React, { useState } from 'react';
import Toast from '../components/ui/Toast';
import Logo from '../components/Logo';
import useToast from '../hooks/useToast';

const ACTIVITY = [
  {
    title: 'Brand positioning updated',
    text: 'Marcus Bell revised the brand core positioning statement',
    time: '4 hours ago',
    tone: 'is-orange',
  },
  {
    title: 'Asset batch uploaded',
    text: '14 hero assets synced to the creative library',
    time: 'Yesterday',
    tone: 'is-purple',
  },
  {
    title: 'Portal access granted',
    text: 'Sophia Chen enabled for client portal review',
    time: '2 days ago',
    tone: 'is-green',
  },
];

const STAGE = ['Intake', 'AI Clarification', 'AM Review', 'Client Sign-Off'];

const INITIAL_FORM = {
  brandName: 'Aurora Skincare',
  industry: 'Beauty & Personal Care',
  website: 'https://auroraskincare.com',
  positioning:
    'Clinically-backed, clean-formulation skincare for the modern self-directed consumer. Aurora pairs ingredient transparency with editorial-grade storytelling across retail, DTC and social.',
  contactName: 'Sophia Chen',
  contactTitle: 'VP of Global Marketing',
  contactEmail: 'sophia.chen@auroraskincare.io',
  contactPhone: '+1 (415) 890-2341',
  manager: 'Marcus Bell',
  studio: 'Brand Strategy & Growth',
};

export default function EditClientPage({ onBack, onSaved }) {
  const { toast, showToast } = useToast(3000);
  const [stage] = useState(2);
  const [form, setForm] = useState(INITIAL_FORM);

  const isDirty = JSON.stringify(form) !== JSON.stringify(INITIAL_FORM);

  const update = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const save = () => {
    showToast('Client record updated.');
    if (onSaved) onSaved();
  };

  return (
    <div className="page-screen ec-page">
      <header className="ec-hero">
        <div className="ec-hero__id">
          <span className="ec-hero__logo">
            <strong>AS</strong>
            <small>BOTANIC</small>
            <button
              type="button"
              className="ec-hero__cam"
              aria-label="Change client logo"
              title="Change client logo"
              onClick={() => showToast('Logo upload opened.', 'info')}
            >
              <svg aria-hidden="true" className="icon">
                <use href="#i-camera" />
              </svg>
            </button>
          </span>

          <div className="ec-hero__copy">
            <div className="ec-hero__title">
              <h1>{form.brandName}</h1>
              <button
                type="button"
                className="ec-hero__edit"
                aria-label="Rename client"
                title="Rename client"
                onClick={() => {
                  const input = document.getElementById('ec-brand');
                  input?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  input?.focus({ preventScroll: true });
                }}
              >
                <svg aria-hidden="true" className="icon">
                  <use href="#i-pencil" />
                </svg>
              </button>
              <span className="pill is-green">
                <i className="status-dot" />
                Active Pipeline
              </span>
            </div>

            <p className="ec-hero__meta">
              <span>
                <svg aria-hidden="true" className="icon">
                  <use href="#i-calendar" />
                </svg>
                Created Oct 14, 2024
              </span>
              <i className="ec-hero__sep" aria-hidden="true">
                ·
              </i>
              <span>
                <svg aria-hidden="true" className="icon">
                  <use href="#i-user" />
                </svg>
                {form.manager}
              </span>
              <i className="ec-hero__sep" aria-hidden="true">
                ·
              </i>
              <span>
                <svg aria-hidden="true" className="icon">
                  <use href="#i-layers" />
                </svg>
                {form.studio}
              </span>
              <i className="ec-hero__sep" aria-hidden="true">
                ·
              </i>
              <span className="ec-hero__tenant">Tenant ID: #ORV-7492</span>
            </p>
          </div>
        </div>

        <div className="ec-hero__actions">
          <button
            type="button"
            className="button button--sm ec-portal"
            onClick={() => showToast('Client portal preview opened.', 'info')}
          >
            <svg aria-hidden="true" className="icon">
              <use href="#i-external" />
            </svg>
            Client Portal
          </button>
          <button
            type="button"
            className="button button--sm ec-danger"
            onClick={() => showToast('Archive requires a secondary confirmation.', 'info')}
          >
            <svg aria-hidden="true" className="icon">
              <use href="#i-archive" />
            </svg>
            Archive
          </button>
        </div>
      </header>

      <div className="ec-grid">
        <div className="ec-main">
          <section className="cl-card">
            <header className="cl-card__head">
              <h2 className="cl-card__title">
                <span className="cl-card__icon">
                  <svg aria-hidden="true" className="icon">
                    <use href="#i-briefcase" />
                  </svg>
                </span>
                Brand Information
              </h2>
              <span className="ec-link">Timeline &amp; History</span>
            </header>

            <div className="ec-logo-row">
              <span className="ec-logo lg">
                <Logo title="" />
              </span>
              <div className="ec-logo-copy">
                <div className="ec-logo-btns">
                  <button type="button" className="button button--ghost button--xs">
                    Change Logo
                  </button>
                  <button
                    type="button"
                    className="button button--ghost button--xs"
                    onClick={() => showToast('Logo removal queued for review.', 'info')}
                  >
                    Remove
                  </button>
                </div>
                <p>Uploaded 256×256px (SVG or PNG) · Square 1:1 recommended</p>
                <small>Last file: Aurora_Logo_Master.svg</small>
              </div>
            </div>

            <div className="cl-grid2">
              <div className="cl-field" style={{ marginTop: 0 }}>
                <label className="cl-field__label" htmlFor="ec-brand">
                  Brand Name<span className="req">*</span>
                </label>
                <input
                  id="ec-brand"
                  className="form-input"
                  value={form.brandName}
                  onChange={update('brandName')}
                />
              </div>

              <div className="cl-field" style={{ marginTop: 0 }}>
                <label className="cl-field__label" htmlFor="ec-industry">
                  Primary Industry<span className="req">*</span>
                </label>
                <span className="filter-select">
                  <select id="ec-industry" value={form.industry} onChange={update('industry')}>
                    <option>Beauty &amp; Personal Care</option>
                    <option>HealthTech &amp; Telehealth</option>
                    <option>EV Automotive &amp; Fleet</option>
                    <option>Enterprise AI SaaS</option>
                    <option>Hospitality Franchise</option>
                  </select>
                  <svg aria-hidden="true" className="icon">
                    <use href="#i-chevron" />
                  </svg>
                </span>
              </div>
            </div>

            <div className="cl-field">
              <label className="cl-field__label" htmlFor="ec-site">
                Official Website URL<span className="req">*</span>
              </label>
              <div className="cl-input-wrap">
                <svg className="cl-input-wrap__icon" viewBox="0 0 24 24" aria-hidden="true">
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  />
                  <path
                    d="M3 12h18M12 3c2.6 3 2.6 15 0 18M12 3c-2.6 3-2.6 15 0 18"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  />
                </svg>
                <input
                  id="ec-site"
                  className="form-input"
                  value={form.website}
                  onChange={update('website')}
                />
              </div>
            </div>

            <div className="cl-field">
              <label className="cl-field__label" htmlFor="ec-positioning">
                Brand Core Positioning / Creative Scope
              </label>
              <textarea
                id="ec-positioning"
                className="form-textarea"
                rows={4}
                value={form.positioning}
                onChange={update('positioning')}
              />
              <p className="ec-hint">
                Used internally by AI for strategic intent and visual tone alignment.
              </p>
            </div>

            <div className="ec-warn">
              <svg aria-hidden="true" className="icon">
                <use href="#i-alert" />
              </svg>
              <span>
                <strong>LinkedIn mismatch:</strong> the profile “Aurora Skincare” is already tied to
                another workspace. Renaming is only allowed by workspace owners with brand
                verification rights.
              </span>
            </div>
          </section>

          <section className="cl-card">
            <header className="cl-card__head">
              <div>
                <h2 className="cl-card__title">
                  <span className="cl-card__icon">
                    <svg aria-hidden="true" className="icon">
                      <use href="#i-users" />
                    </svg>
                  </span>
                  Key Client Contact
                </h2>
                <p className="cl-card__sub">
                  Primary stakeholder for approval loops, account reviews, and billing notices.
                </p>
              </div>
            </header>

            <div className="cl-grid2">
              <div className="cl-field">
                <label className="cl-field__label" htmlFor="ec-contact">
                  Primary Contact Name<span className="req">*</span>
                </label>
                <input
                  id="ec-contact"
                  className="form-input"
                  value={form.contactName}
                  onChange={update('contactName')}
                />
              </div>
              <div className="cl-field">
                <label className="cl-field__label" htmlFor="ec-title">
                  Official Client Title
                </label>
                <input
                  id="ec-title"
                  className="form-input"
                  value={form.contactTitle}
                  onChange={update('contactTitle')}
                />
              </div>
            </div>

            <div className="cl-grid2">
              <div className="cl-field">
                <label className="cl-field__label" htmlFor="ec-email">
                  Work Email Address<span className="req">*</span>
                </label>
                <input
                  id="ec-email"
                  type="email"
                  className="form-input"
                  value={form.contactEmail}
                  onChange={update('contactEmail')}
                />
              </div>
              <div className="cl-field">
                <label className="cl-field__label" htmlFor="ec-phone">
                  Direct Contact Phone
                </label>
                <div className="cl-input-wrap">
                  <svg aria-hidden="true" className="icon cl-input-wrap__icon">
                    <use href="#i-bell" />
                  </svg>
                  <input
                    id="ec-phone"
                    className="form-input"
                    value={form.contactPhone}
                    onChange={update('contactPhone')}
                  />
                </div>
              </div>
            </div>

            <button
              type="button"
              className="link-action"
              onClick={() => showToast('Secondary contact form opened.', 'info')}
            >
              + Add Secondary Contact
            </button>
          </section>

          <section className="cl-card">
            <header className="cl-card__head">
              <div>
                <h2 className="cl-card__title">
                  <span className="cl-card__icon">
                    <svg aria-hidden="true" className="icon">
                      <use href="#i-layers" />
                    </svg>
                  </span>
                  Resource &amp; Ownership Assignment
                </h2>
                <p className="cl-card__sub">
                  Allocate operational ownership and creative delivery responsibility.
                </p>
              </div>
            </header>

            <div className="cl-grid2">
              <div className="cl-field">
                <label className="cl-field__label" htmlFor="ec-manager">
                  Lead Account Manager<span className="req">*</span>
                </label>
                <span className="filter-select">
                  <select id="ec-manager" value={form.manager} onChange={update('manager')}>
                    <option>Marcus Bell</option>
                    <option>Elana Vance</option>
                    <option>Marcus Brady</option>
                    <option>Liam Chen</option>
                  </select>
                  <svg aria-hidden="true" className="icon">
                    <use href="#i-chevron" />
                  </svg>
                </span>
              </div>
              <div className="cl-field">
                <label className="cl-field__label" htmlFor="ec-studio">
                  Assigned Creative Studio<span className="req">*</span>
                </label>
                <span className="filter-select">
                  <select id="ec-studio" value={form.studio} onChange={update('studio')}>
                    <option>Brand Strategy &amp; Growth</option>
                    <option>Creative &amp; Motion Studio</option>
                    <option>Performance Content Squad</option>
                    <option>Digital Product Design</option>
                  </select>
                  <svg aria-hidden="true" className="icon">
                    <use href="#i-chevron" />
                  </svg>
                </span>
              </div>
            </div>

            <div className="ec-note">
              <svg aria-hidden="true" className="icon">
                <use href="#i-shield" />
              </svg>
              <span>
                <strong>Responsibility matrix:</strong> changing the account manager transfers all
                active projects and approval queues. Confirm the incoming lead before saving.
              </span>
            </div>
          </section>
        </div>

        <aside className="ec-rail">
          <section className="cl-card">
            <header className="cl-card__head">
              <h2 className="cl-card__title">
                <span className="cl-card__icon">
                  <svg aria-hidden="true" className="icon">
                    <use href="#i-chart" />
                  </svg>
                </span>
                Client Overview
              </h2>
              <button type="button" className="cl-more" aria-label="Edit overview">
                <svg aria-hidden="true" className="icon">
                  <use href="#i-file" />
                </svg>
              </button>
            </header>

            <div className="ec-kpis">
              <div>
                <strong>3</strong>
                <span>Active Briefs</span>
              </div>
              <div>
                <strong>1</strong>
                <span>Pending</span>
              </div>
              <div>
                <strong>98%</strong>
                <span>Health Score</span>
              </div>
            </div>

            <div className="ec-rail-block">
              <span className="cl-label">Assigned To</span>
              <div className="ec-rail-row">
                <span>Account Manager</span>
                <strong>{form.manager}</strong>
              </div>
              <div className="ec-rail-row">
                <span>Creative Studio</span>
                <strong>{form.studio}</strong>
              </div>
            </div>

            <div className="ec-rail-block">
              <span className="cl-label">Client Record</span>
              <div className="ec-rail-row">
                <span>Onboarded</span>
                <strong>Oct 14, 2024</strong>
              </div>
              <div className="ec-rail-row">
                <span>Last Active</span>
                <strong>2 hours ago</strong>
              </div>
              <div className="ec-rail-row">
                <span>Total Billings</span>
                <strong>$84,200</strong>
              </div>
            </div>

            <div className="ec-rail-foot">
              <span>
                <i className="status-dot" /> 24 Active Projects
              </span>
              <span className="ec-link">View Briefs</span>
            </div>
          </section>

          <section className="cl-card">
            <header className="cl-card__head">
              <h2 className="cl-card__title">
                <span className="cl-card__icon">
                  <svg aria-hidden="true" className="icon">
                    <use href="#i-clock" />
                  </svg>
                </span>
                Activity Log
              </h2>
              <span className="ec-link">View Full</span>
            </header>

            <ul className="ec-log">
              {ACTIVITY.map((item) => (
                <li key={item.title}>
                  <span className={`ec-log__dot ${item.tone}`} />
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.text}</p>
                    <small>{item.time}</small>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="cl-card ec-lifecycle">
            <header className="cl-card__head">
              <h2 className="cl-card__title">
                <span className="cl-card__icon">
                  <svg aria-hidden="true" className="icon">
                    <use href="#i-target" />
                  </svg>
                </span>
                Lifecycle &amp; Archival
              </h2>
              <span className="pill is-orange">Stage {stage + 1} of 4</span>
            </header>

            <div className="ec-stages">
              {STAGE.map((label, index) => (
                <div
                  key={label}
                  className={`ec-stage${index < stage ? ' is-done' : index === stage ? ' is-active' : ''}`}
                >
                  <span className="ec-stage__dot">
                    {index < stage ? (
                      <svg aria-hidden="true" className="icon">
                        <use href="#i-check" />
                      </svg>
                    ) : (
                      index + 1
                    )}
                  </span>
                  <span>{label}</span>
                </div>
              ))}
            </div>

            <div className="ec-archive">
              <div>
                <strong>Archive Client Workspace</strong>
                <p>
                  Archiving hides the brand from active rosters, pauses all briefs, and converts the
                  account to read-only. Data is retained for 12 months.
                </p>
              </div>
              <button
                type="button"
                className="button button--sm ec-danger"
                onClick={() => showToast('Archive requires a secondary confirmation.', 'info')}
              >
                Archive Client
              </button>
            </div>
          </section>

          <section className="ec-compliance">
            <span className="ec-compliance__title">
              <svg aria-hidden="true" className="icon">
                <use href="#i-shield" />
              </svg>
              Compliance Requirement
            </span>
            <p>
              This workspace holds PII under GDPR. Access is limited to assigned studio members and
              is logged in the audit trail.
            </p>
          </section>
        </aside>
      </div>

      <div className={`ec-savebar${isDirty ? ' is-dirty' : ''}`}>
        <p className="ec-savebar__note">
          <i className="ec-savebar__dot" aria-hidden="true" />
          <strong>{isDirty ? 'Unsaved Modifications' : 'All changes saved'}</strong>
          <span>
            {isDirty
              ? '· Changes pending in Brand Information & Assigned Leadership'
              : '· This client record is up to date'}
          </span>
        </p>
        <div className="ec-savebar__actions">
          <button type="button" className="button button--ghost button--sm" onClick={onBack}>
            Cancel
          </button>
          <button type="button" className="button button--primary button--sm" onClick={save}>
            Save Changes
          </button>
        </div>
      </div>

      <Toast message={toast?.message} tone={toast?.tone} />
    </div>
  );
}
