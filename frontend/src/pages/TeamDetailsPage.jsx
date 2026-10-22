import React, { useMemo, useState } from 'react';
import Toast from '../components/ui/Toast';
import useToast from '../hooks/useToast';

const MEMBERS = [
  {
    id: 1,
    name: 'Elana Vance',
    email: 'elena.vance@orvia-creative.com',
    role: 'Admin / Lead',
    discipline: 'Account Manager',
    joined: 'Jan 2024',
    briefs: 3,
    briefTags: ['Aurora', 'Nordic'],
    tone: 'is-a',
  },
  {
    id: 2,
    name: 'Marcus Brody',
    email: 'marcus.brody@orvia-creative.com',
    role: 'Account Manager',
    discipline: 'Client Operations',
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
    discipline: 'Strategist',
    joined: 'Apr 2024',
    briefs: 2,
    briefTags: ['Solaris'],
    tone: 'is-c',
  },
  {
    id: 4,
    name: 'Amara Patel',
    email: 'amara.patel@orvia-creative.com',
    role: 'Content Creator',
    discipline: 'Social Studio',
    joined: 'May 2024',
    briefs: 2,
    briefTags: ['Kroma'],
    tone: 'is-d',
  },
  {
    id: 5,
    name: 'David K.',
    email: 'david.k@orvia-creative.com',
    role: 'Strategist',
    discipline: 'Brand Strategy',
    joined: 'Feb 2024',
    briefs: 1,
    briefTags: ['Market Analytics'],
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
        <nav aria-label="Breadcrumb">
          <button type="button" className="link-action" onClick={onBack}>
            ← Back to Teams
          </button>
          <svg aria-hidden="true" className="icon">
            <use href="#i-chevron" />
          </svg>
          <span>Admin</span>
          <svg aria-hidden="true" className="icon">
            <use href="#i-chevron" />
          </svg>
          <strong>{team}</strong>
        </nav>
        <span className="pill is-green live-chip">Active</span>
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
            <p className="page-head__text">
              Creative Operations — specialized squad leading multi-platform brand strategy, market
              positioning and high-velocity launch campaigns for premium enterprise accounts.
            </p>
            <div className="head-meta">
              <span>Created Jan 14, 2024</span>
              <span>Lead: Elana Vance (Admin)</span>
              <span>Agency Node: North America HQ</span>
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
            Add Employee
          </button>
        </div>

        <div className="table-wrap">
          <table className="table">
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
                        <strong>{member.name}</strong>
                        <small>{member.email}</small>
                      </span>
                    </div>
                  </td>
                  <td>
                    <strong>{member.role}</strong>
                    <small className="sub" style={{ display: 'block' }}>
                      {member.discipline}
                    </small>
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

      <Toast message={toast?.message} tone={toast?.tone} />
    </div>
  );
}
