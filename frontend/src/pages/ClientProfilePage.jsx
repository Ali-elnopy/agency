import React, { useState } from 'react';
import Toast from '../components/ui/Toast';
import Logo from '../components/Logo';
import managerPhoto from '../assets/managerPhoto';
import useToast from '../hooks/useToast';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'intake', label: 'Requirements Intake', dot: true },
  { id: 'briefs', label: 'AI Brief & Clarifications' },
  { id: 'strategy', label: 'Strategy', badge: 'Queued' },
  { id: 'plans', label: 'Content Plans', badge: '0 In Draft' },
];

const META = {
  'Lumina Health': {
    uid: 'CLI-8842-1H',
    industry: 'HealthTech & Telehealth',
    site: 'luminahealth.io',
    since: 'Oct 14, 2024',
    tenure: 'Managed 4 months',
    retainer: '$24,500',
    deliverables: '7',
    health: '98%',
    healthNote: 'High Sentiment',
    milestone: 'Brief Sign-Off',
    milestoneNote: 'Today',
    description:
      'High-growth telehealth platform providing AI-assisted patient triage, specialist bookings, and asynchronous clinical care across North America and Western Europe.',
    sector: 'HealthTech / AI',
    scale: 'Series B (140 FTE)',
    instagram: '@luminahealth (Global)',
    reach: '142k reach',
    contactName: 'Dr. Aris Thorne',
    contactRole: 'Co-Founder & Chief Medical Officer',
    contactBadge: 'Decision Maker • Sign-off Authority',
    contactEmail: 'aris.thorne@luminahealth.io',
    contactPhone: '+1 (555) 234-8901',
    manager: 'Marcus Vance',
    managerRole: 'Senior Client Partner',
    managerEmail: 'marcus.v@orvia-creative.com',
    team: 'Brand Strategy & Growth Squad',
    teamNote: 'Allocated for Sprint Cycles 24-26',
    teamMembers: '6 Active Members',
    teamAvatars: ['MV', 'AC', 'NB', 'SD'],
    teamMix: ['1 Strategy', '2 Design', '1 Copy', '2 Motion'],
  },
};

const FALLBACK = {
  uid: 'CLI-0000-XX',
  industry: 'Creative & Media',
  site: 'orvia-creative.com',
  since: 'Jan 08, 2025',
  tenure: 'Managed 6 months',
  retainer: '$18,900',
  deliverables: '5',
  health: '94%',
  healthNote: 'Stable',
  milestone: 'Creative Review',
  milestoneNote: 'Tomorrow',
  description:
    'Multi-market brand partner running always-on creative production across paid social, video and lifecycle channels.',
  sector: 'Consumer / Retail',
  scale: 'Series A (60 FTE)',
  instagram: '@brand (Global)',
  reach: '86k reach',
  contactName: 'Sophia Chen',
  contactRole: 'VP of Global Marketing',
  contactBadge: 'Primary Contact • Decision Maker',
  contactEmail: 'sophia.chen@auroraskincare.com',
  contactPhone: 'US: +1 (415) 890-2341',
  manager: 'Marcus Bell',
  managerRole: 'Account Director',
  managerEmail: 'marcus.b@orvia-creative.com',
  team: 'Brand Strategy & Growth Squad',
  teamNote: 'Allocated for Sprint Cycles 24-26',
  teamMembers: '6 Active Members',
  teamAvatars: ['MB', 'AC', 'NB', 'SD'],
  teamMix: ['1 Strategy', '2 Design', '1 Copy', '2 Motion'],
};

const LIFECYCLE = [
  {
    id: 1,
    state: 'done',
    label: 'Done',
    title: '1. Collecting Info',
    text: 'Intake form, stakeholder Q&A completed.',
  },
  {
    id: 2,
    state: 'done',
    label: 'Done',
    title: '2. AI Clarification',
    text: 'Tone synthesized, brief contradictions solved.',
  },
  {
    id: 3,
    state: 'active',
    label: 'Active Stage',
    title: '3. AM Review',
    text: 'Marcus Vance finalizing scope validation.',
  },
  {
    id: 4,
    state: 'pending',
    label: 'Pending',
    title: '4. Client Sign-Off',
    text: 'Final approval & asset production launch.',
  },
];

function initialsOf(name) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
}

export default function ClientProfilePage({ client = 'Lumina Health', onEditClient }) {
  const [tab, setTab] = useState('overview');
  const { toast, showToast } = useToast(3000);
  const data = META[client] ?? FALLBACK;

  return (
    <div className="page-screen">
      <section className="cl-profile-card">
        <div className="cl-profile-head">
          <div className="cl-profile-id">
            <span className="cl-logo">
              <Logo title="" />
            </span>
            <div>
              <div className="cl-profile-name">
                {client}
                <span className="cl-verified">
                  <svg aria-hidden="true" className="icon">
                    <use href="#i-check" />
                  </svg>
                </span>
                <span className="pill is-green">
                  <i className="status-dot" />
                  Active Account
                </span>
              </div>
              <div className="cl-meta">
                <span>
                  <svg aria-hidden="true" className="icon">
                    <use href="#i-briefcase" />
                  </svg>
                  {data.industry}
                </span>
                <span>
                  <svg aria-hidden="true" className="icon">
                    <use href="#i-external" />
                  </svg>
                  {data.site}
                </span>
                <span>
                  <svg aria-hidden="true" className="icon">
                    <use href="#i-clock" />
                  </svg>
                  {data.tenure} (since {data.since})
                </span>
              </div>
            </div>
          </div>

          <div className="cl-profile-actions">
            <button
              type="button"
              className="button button--ghost button--sm"
              onClick={() => onEditClient && onEditClient()}
            >
              <svg aria-hidden="true" className="icon">
                <use href="#i-file" />
              </svg>
              Edit Client
            </button>
            <button
              type="button"
              className="button button--ghost button--sm is-danger"
              onClick={() => showToast('Archive requires a secondary confirmation.', 'info')}
            >
              <svg aria-hidden="true" className="icon">
                <use href="#i-layers" />
              </svg>
              Archive Client
            </button>
          </div>
        </div>

        <div className="cl-stats">
          <div className="cl-stat">
            <span>Active Monthly Retainer</span>
            <strong>
              {data.retainer}
              <small>/mo</small>
            </strong>
          </div>
          <div className="cl-stat">
            <span>Active Deliverables</span>
            <strong>
              {data.deliverables}
              <small>In Pipeline</small>
            </strong>
          </div>
          <div className="cl-stat">
            <span>Health Score</span>
            <strong>
              {data.health}
              <em>{data.healthNote}</em>
            </strong>
          </div>
          <div className="cl-stat">
            <span>Next Studio Milestone</span>
            <strong style={{ fontSize: 12 }}>
              {data.milestone}
              <small>({data.milestoneNote})</small>
            </strong>
          </div>
        </div>
      </section>

      <div className="cl-tabs2" role="tablist" aria-label="Client profile sections">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            className={tab === item.id ? 'is-active' : ''}
            onClick={() => setTab(item.id)}
          >
            {item.label}
            {item.dot && <span className="cl-tab-dot" />}
            {item.badge && <span className="cl-tab-badge">{item.badge}</span>}
          </button>
        ))}
      </div>

      <div className="cl-grid">
        <div className="cl-col">
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
              <button
                type="button"
                className="cl-more"
                aria-label="Copy brand summary"
                onClick={() => showToast('Brand summary copied to clipboard.', 'info')}
              >
                <svg aria-hidden="true" className="icon">
                  <use href="#i-file" />
                </svg>
              </button>
            </header>

            <span className="cl-label">Company Description</span>
            <p className="cl-desc">{data.description}</p>

            <div className="cl-mini-row">
              <div className="cl-mini">
                <span className="cl-label">Industry Sector</span>
                <strong>{data.sector}</strong>
              </div>
              <div className="cl-mini">
                <span className="cl-label">Founded / Scale</span>
                <strong>{data.scale}</strong>
              </div>
            </div>

            <div style={{ marginTop: 14 }}>
              <span className="cl-label">Digital Footprint</span>
              <div className="cl-digital">
                <a href={`https://${data.site}`} onClick={(event) => event.preventDefault()}>
                  <svg aria-hidden="true" className="icon">
                    <use href="#i-external" />
                  </svg>
                  https://{data.site}
                </a>
                <span>
                  <svg aria-hidden="true" className="icon">
                    <use href="#i-users" />
                  </svg>
                  {data.instagram}
                  <em>{data.reach}</em>
                </span>
              </div>
            </div>

            <div className="cl-onboard">
              <span>
                Client Onboarded: <strong>{data.since}</strong>
              </span>
              <span>
                Account Tenure: <strong>{data.tenure.replace('Managed ', '')}</strong>
              </span>
            </div>
          </section>

          <section className="cl-card">
            <header className="cl-card__head">
              <h2 className="cl-card__title">
                <span className="cl-card__icon">
                  <svg aria-hidden="true" className="icon">
                    <use href="#i-users" />
                  </svg>
                </span>
                Primary Client Contact
              </h2>
              <span className="pill is-green">
                <i className="status-dot" />
                Portal Active
              </span>
            </header>

            <div className="cl-contact">
              <span className="cl-contact__avatar">{initialsOf(data.contactName)}</span>
              <div>
                <div className="cl-contact__name">
                  {data.contactName}
                  <svg aria-hidden="true" className="icon">
                    <use href="#i-check" />
                  </svg>
                </div>
                <div className="cl-contact__role">{data.contactRole}</div>
                <div className="cl-contact__tags">
                  <span>{data.contactBadge}</span>
                </div>
              </div>
            </div>

            <div className="cl-rows">
              <div className="cl-row">
                <svg aria-hidden="true" className="icon">
                  <use href="#i-send" />
                </svg>
                {data.contactEmail}
              </div>
              <div className="cl-row">
                <svg aria-hidden="true" className="icon">
                  <use href="#i-bell" />
                </svg>
                {data.contactPhone}
                <em>Direct Mobile</em>
              </div>
              <div className="cl-row">
                <svg aria-hidden="true" className="icon">
                  <use href="#i-clock" />
                </svg>
                Client Portal Activity
                <em>Logged in 2 hrs ago</em>
              </div>
            </div>

            <div className="cl-contact-actions">
              <button
                type="button"
                className="button"
                onClick={() => showToast('Composing a message to the primary contact…', 'info')}
              >
                <svg aria-hidden="true" className="icon">
                  <use href="#i-send" />
                </svg>
                Send Message
              </button>
              <button type="button" className="cl-more" aria-label="More contact actions">
                <svg aria-hidden="true" className="icon">
                  <use href="#i-panel" />
                </svg>
              </button>
            </div>
          </section>
        </div>

        <div className="cl-col">
          <section className="cl-card">
            <header className="cl-card__head">
              <h2 className="cl-card__title">
                <span className="cl-card__icon">
                  <svg aria-hidden="true" className="icon">
                    <use href="#i-users" />
                  </svg>
                </span>
                Account Manager
              </h2>
              <button
                type="button"
                className="cl-profile-btn"
                onClick={() => showToast('Account manager reassignment requested.', 'info')}
              >
                <svg aria-hidden="true" className="icon">
                  <use href="#i-arrow" />
                </svg>
                Change
              </button>
            </header>

            <div className="cl-am">
              <div className="cl-am__photo">
                <img
                  className="cl-am__photo-img"
                  src={managerPhoto}
                  alt={`${data.manager} portrait`}
                />
                <div className="cl-am__badge">
                  <div className="cl-am__badge-top">
                    <span>Studio Workload</span>
                    <strong>6/7 Clients</strong>
                  </div>
                  <div className="cl-am__bar">
                    <i />
                  </div>
                  <small>✓ Optimal studio threshold</small>
                </div>
              </div>
              <div className="cl-am__info">
                <div className="cl-am__name">
                  {data.manager}
                  <span className="cl-am__tag">Lead AM</span>
                </div>
                <div className="cl-am__role">{data.managerRole}</div>
                <div className="cl-am__email">{data.managerEmail}</div>
              </div>
            </div>
          </section>

          <section className="cl-card">
            <header className="cl-card__head">
              <h2 className="cl-card__title">
                <span className="cl-card__icon">
                  <svg aria-hidden="true" className="icon">
                    <use href="#i-layers" />
                  </svg>
                </span>
                Responsible Team
              </h2>
              <button
                type="button"
                className="cl-profile-btn"
                onClick={() => showToast('Team assignment requested.', 'info')}
              >
                <svg aria-hidden="true" className="icon">
                  <use href="#i-arrow" />
                </svg>
                Change
              </button>
            </header>

            <div className="cl-team-head">
              <strong>{data.team}</strong>
              <span>{data.teamMembers}</span>
            </div>
            <p className="cl-team-sub">{data.teamNote}</p>

            <div className="cl-team-mix">
              <span className="cl-avatars">
                {data.teamAvatars.map((initials) => (
                  <span key={initials} className="cl-avatar cl-avatar--gray">
                    {initials}
                  </span>
                ))}
                <span className="cl-avatar cl-avatar--orange">+2</span>
              </span>
              {data.teamMix.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </section>

          <section className="cl-card">
            <header className="cl-card__head">
              <h2 className="cl-card__title">
                <span className="cl-card__icon">
                  <svg aria-hidden="true" className="icon">
                    <use href="#i-target" />
                  </svg>
                </span>
                Lifecycle &amp; Milestone Summary
              </h2>
              <span className="pill is-orange">Stage 3 of 4</span>
            </header>
            <p className="cl-team-sub" style={{ marginTop: -8, marginBottom: 12 }}>
              Live progress tracker across ORVIA Studio pipeline
            </p>

            <div className="cl-life">
              {LIFECYCLE.map((step) => (
                <div
                  key={step.id}
                  className={`cl-step${
                    step.state === 'active'
                      ? ' is-active'
                      : step.state === 'pending'
                        ? ' is-pending'
                        : ''
                  }`}
                >
                  <div className="cl-step__top">
                    {step.state === 'done' ? (
                      <svg aria-hidden="true" className="icon">
                        <use href="#i-check" />
                      </svg>
                    ) : (
                      <span className="cl-step__num">{step.id}</span>
                    )}
                    {step.label}
                  </div>
                  <strong>{step.title}</strong>
                  <p>{step.text}</p>
                  <i className={step.state === 'done' ? 'is-full' : ''} />
                </div>
              ))}
            </div>

            <div className="cl-life-foot">
              <span>
                <svg aria-hidden="true" className="icon">
                  <use href="#i-bell" />
                </svg>
                Pending action: Marcus Vance to approve AI Brief by 5:00 PM EST.
              </span>
              <a href="#brief" onClick={(event) => event.preventDefault()}>
                View Active AI Brief →
              </a>
            </div>
          </section>
        </div>
      </div>

      <Toast message={toast?.message} tone={toast?.tone} />
    </div>
  );
}
