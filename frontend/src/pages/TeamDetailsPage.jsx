import React, { useMemo, useState } from 'react';
import Toast from '../components/ui/Toast';
import useToast from '../hooks/useToast';

const MEMBERS = [
  {
    id: 1,
    name: 'Elena Vance',
    email: 'elena.vance@orvia-creative.com',
    role: 'Admin / Lead',
    roleTone: 'is-orange',
    discipline: 'Account Manager',
    joined: 'Jan 2024',
    briefs: 5,
    briefTags: ['Aurora', 'Nordic'],
    tone: 'is-a',
    verified: true,
  },
  {
    id: 2,
    name: 'Marcus Brody',
    email: 'marcus.brody@orvia-creative.com',
    role: 'Account Manager',
    roleTone: 'is-gray',
    discipline: 'Account Manager',
    joined: 'Mar 2024',
    briefs: 4,
    briefTags: ['HyperPulse', 'Kroma'],
    tone: 'is-b',
  },
  {
    id: 3,
    name: 'Liam Chen',
    email: 'liam.chen@orvia-creative.com',
    role: 'Content Creator',
    roleTone: 'is-green',
    discipline: 'Strategist',
    joined: 'Apr 2024',
    briefs: 2,
    briefTags: ['Solaria Clean'],
    tone: 'is-c',
  },
  {
    id: 4,
    name: 'Amara Patel',
    email: 'amara.patel@orvia-creative.com',
    role: 'Content Creator',
    roleTone: 'is-purple',
    discipline: 'Content Creator',
    joined: 'May 2024',
    briefs: 2,
    briefTags: ['HyperPulse Social'],
    tone: 'is-d',
  },
  {
    id: 5,
    name: 'David K.',
    email: 'david.k@orvia-creative.com',
    role: 'Strategist',
    roleTone: 'is-gray',
    discipline: 'Brand Strategy',
    joined: 'Feb 2024',
    briefs: 1,
    briefTags: ['Market Analysis'],
    tone: 'is-a',
  },
  {
    id: 6,
    name: 'Nora Fields',
    email: 'nora.fields@orvia-creative.com',
    role: 'Art Lead',
    discipline: 'Creative Direction',
    joined: 'Jun 2024',
    briefs: 2,
    briefTags: ['Aurora', 'Pulse'],
    tone: 'is-b',
  },
  {
    id: 7,
    name: 'Idris Malik',
    email: 'idris.malik@orvia-creative.com',
    role: 'Strategist',
    discipline: 'Performance',
    joined: 'Jul 2024',
    briefs: 3,
    briefTags: ['Volt', 'Luna'],
    tone: 'is-c',
  },
  {
    id: 8,
    name: 'Hana Sato',
    email: 'hana.sato@orvia-creative.com',
    role: 'Account Manager',
    discipline: 'Client Operations',
    joined: 'Aug 2024',
    briefs: 2,
    briefTags: ['Nordic'],
    tone: 'is-d',
  },
];

const ROLES = ['All Roles', 'Account Manager', 'Account Manager', 'Content Creator', 'Strategist'];

// Client retainers currently governed by this squad.
const TEAM_CLIENTS = [
  {
    id: 1,
    name: 'Aura Skincare',
    initials: 'AS',
    tone: 'is-amber',
    status: 'Active',
    statusTone: 'is-green',
    category: 'Beauty & Wellness',
    text: 'DTC organic beauty line scaling omnibus influencer campaigns across TikTok & Meta.',
    manager: 'Elena Vance',
  },
  {
    id: 2,
    name: 'HyperPulse Energy',
    initials: 'HP',
    tone: 'is-orange',
    status: 'Active',
    statusTone: 'is-green',
    category: 'Beverage & Fitness',
    text: 'High performance electrolyte formula launch with sports sponsorship activation.',
    manager: 'Marcus Brody',
  },
  {
    id: 3,
    name: 'Nordic Living Furniture',
    initials: 'NL',
    tone: 'is-purple',
    status: 'Active',
    statusTone: 'is-green',
    category: 'Interior Design',
    text: 'Sustainable Scandinavian timber collection with interactive 3D spatial showroom.',
    manager: 'Elena Vance',
  },
  {
    id: 4,
    name: 'Kroma Audio',
    initials: 'KA',
    tone: 'is-gray',
    status: 'Onboarding',
    statusTone: 'is-purple',
    category: 'Consumer Tech',
    text: 'Audiophile noise-cancelling headphones targeting European and APAC distributors.',
    manager: 'Marcus Brody',
  },
  {
    id: 5,
    name: 'Solaria Clean Energy',
    initials: 'SC',
    tone: 'is-green',
    status: 'Review',
    statusTone: 'is-gray',
    category: 'Renewables',
    text: 'Commercial solar arrays and clean grid tech positioning for enterprise ESG programs.',
    manager: 'Liam Chen',
  },
];

export default function TeamDetailsPage({ team = 'Brand Strategy & Growth', onBack }) {
  const [query, setQuery] = useState('');
  const [role, setRole] = useState('All Roles');
  const { toast, showToast } = useToast(3000);

  const members = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return MEMBERS.filter((member) => {
      if (role !== 'All Roles' && !member.role.includes(role)) return false;
      if (
        needle &&
        !`${member.name} ${member.email} ${member.role}`.toLowerCase().includes(needle)
      ) {
        return false;
      }
      return true;
    });
  }, [query, role]);

  return (
    <div className="page-screen">
      <div className="crumbs">
        <button type="button" className="link-action" onClick={onBack}>
          ← Back to Teams
        </button>
        <nav aria-label="Breadcrumb">
          <span>Admin</span>
          <svg aria-hidden="true" className="icon">
            <use href="#i-chevron" />
          </svg>
          <a
            href="#teams"
            onClick={(e) => {
              e.preventDefault();
              onBack?.();
            }}
          >
            Teams
          </a>
          <svg aria-hidden="true" className="icon">
            <use href="#i-chevron" />
          </svg>
          <strong>{team}</strong>
        </nav>
      </div>

      <section className="page-head page-head--actions">
        <div className="head-title-group">
          <span className="tile is-purple tile--lg">
            <svg aria-hidden="true" className="icon">
              <use href="#i-layers" />
            </svg>
          </span>
          <div>
            <div className="page-head__title-row">
              <h1 className="page-head__title">{team}</h1>
              <span className="pill is-green">
                <i className="status-dot" />
                Active
              </span>
            </div>
            <span className="pill is-gray td-cat">Creative Operations</span>
            <p className="page-head__text">
              Specialized squad leading multi-platform brand strategy, market positioning and
              high-velocity launch campaigns for premium enterprise accounts.
            </p>
            <div className="head-meta">
              <span>
                <svg aria-hidden="true" className="icon">
                  <use href="#i-calendar" />
                </svg>
                Created Jan 14, 2024
              </span>
              <span>
                <svg aria-hidden="true" className="icon">
                  <use href="#i-users" />
                </svg>
                Lead: Elena Vance (Admin)
              </span>
              <span>
                <svg aria-hidden="true" className="icon">
                  <use href="#i-globe" />
                </svg>
                Agency Node: North America HQ
              </span>
            </div>
          </div>
        </div>

        <div className="page-head__actions">
          <button
            type="button"
            className="button button--ghost button--sm"
            onClick={() => showToast('Opening team settings…', 'info')}
          >
            Edit
          </button>
          <button
            type="button"
            className="button button--danger-ghost button--sm"
            onClick={() => showToast('Deleting a team requires owner approval.', 'info')}
          >
            Delete Team
          </button>
        </div>
      </section>

      <section className="stats">
        <article className="panel stat">
          <div className="stat__head">
            <span className="stat__label">TOTAL TEAM MEMBERS</span>
            <span className="chip is-orange">
              <svg aria-hidden="true" className="icon">
                <use href="#i-users" />
              </svg>
            </span>
          </div>
          <strong className="stat__value">
            8 <small>Employees</small>
          </strong>
          <p className="stat__meta">4 Account Mgrs · 3 Strategists · 1 Art Lead</p>
        </article>

        <article className="panel stat">
          <div className="stat__head">
            <span className="stat__label">ASSIGNED CLIENT BRANDS</span>
            <span className="chip is-green">
              <svg aria-hidden="true" className="icon">
                <use href="#i-briefcase" />
              </svg>
            </span>
          </div>
          <strong className="stat__value">
            5 <small>Active Brands</small>
          </strong>
          <p className="stat__meta">• High capacity allocation · 100% Retainer</p>
        </article>

        <article className="panel stat">
          <div className="stat__head">
            <span className="stat__label">ONGOING CREATIVE BRIEFS</span>
            <span className="chip is-purple">
              <svg aria-hidden="true" className="icon">
                <use href="#i-file" />
              </svg>
            </span>
          </div>
          <strong className="stat__value">
            14 <small>Briefs Active</small>
          </strong>
          <p className="stat__meta">• 4 in creative review · 2 awaiting client sign-off</p>
        </article>
      </section>

      <section className="panel">
        <div className="panel__head">
          <div>
            <h2 className="panel__title">
              Team Members
              <span className="pill is-gray">{MEMBERS.length}</span>
            </h2>
            <p className="panel__sub">Roster, disciplines and per-member brief allocation.</p>
          </div>
        </div>

        <div className="filters" style={{ marginTop: 14 }}>
          <label className="search">
            <input
              type="search"
              placeholder="Search squad members…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <svg aria-hidden="true" className="icon">
              <use href="#i-search" />
            </svg>
          </label>

          <span className="filter-select">
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              {ROLES.filter((item, index) => ROLES.indexOf(item) === index).map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
            <svg aria-hidden="true" className="icon">
              <use href="#i-chevron" />
            </svg>
          </span>

          <button
            type="button"
            className="button button--primary button--sm"
            style={{ marginLeft: 'auto' }}
            onClick={() => showToast('Opening the add employee picker…', 'info')}
          >
            <svg aria-hidden="true" className="icon">
              <use href="#i-plus" />
            </svg>
            Add Employees
          </button>
        </div>

        <div className="table-wrap">
          <table className="table td-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Role &amp; Discipline</th>
                <th>Joined Squad</th>
                <th>Assigned Briefs</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id}>
                  <td>
                    <div className="brand-cell">
                      <span className={`avatar ${member.tone}`}>
                        {member.name
                          .split(' ')
                          .map((part) => part[0])
                          .join('')
                          .substring(0, 2)}
                      </span>
                      <span>
                        <strong>
                          {member.name}
                          {member.verified && (
                            <svg
                              aria-hidden="true"
                              className="icon td-verified"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                cx="12"
                                cy="12"
                                r="9"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                              />
                              <path
                                d="m8 12.5 2.8 2.8L16 9.5"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </strong>
                        <small>{member.email}</small>
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="td-role">
                      <span className={`pill ${member.roleTone}`}>{member.role}</span>
                      <span className="td-role__discipline">{member.discipline}</span>
                    </div>
                  </td>
                  <td className="sub">{member.joined}</td>
                  <td>
                    <div className="eco-tags" style={{ marginTop: 0 }}>
                      <span className="eco-tag">
                        <i />
                        {member.briefs} briefs
                      </span>
                      {member.briefTags.map((tag) => (
                        <span key={tag} className="eco-tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <div className="alert__actions">
                      <button
                        type="button"
                        className="button button--ghost button--xs"
                        onClick={() => showToast(`Move ${member.name} to another squad…`, 'info')}
                      >
                        Move
                      </button>
                      <button
                        type="button"
                        className="button button--danger-ghost button--xs"
                        onClick={() => showToast(`Remove ${member.name} from the squad?`, 'info')}
                      >
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel">
        <div className="panel__head">
          <div>
            <h2 className="panel__title">
              Assigned Clients
              <span className="pill is-gray">{TEAM_CLIENTS.length} Brands</span>
            </h2>
            <p className="panel__sub">
              Client brand retainers and campaigns currently governed by this team squad.
            </p>
          </div>
          <span className="td-clients__note">Viewing all {TEAM_CLIENTS.length} accounts</span>
        </div>

        <div className="td-clients">
          {TEAM_CLIENTS.map((client) => (
            <article key={client.id} className="td-client">
              <div className="td-client__top">
                <span className={`td-client__logo ${client.tone}`}>{client.initials}</span>
                <div className="td-client__id">
                  <strong>{client.name}</strong>
                  <small>{client.category}</small>
                </div>
                <span className={`pill ${client.statusTone}`}>{client.status}</span>
              </div>
              <p className="td-client__text">{client.text}</p>
              <div className="td-client__foot">
                <span>Account Mgr:</span>
                <strong>{client.manager}</strong>
              </div>
            </article>
          ))}
        </div>
      </section>

      <Toast message={toast?.message} tone={toast?.tone} />
    </div>
  );
}
