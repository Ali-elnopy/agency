import React, { useMemo, useState } from 'react';
import Toast from '../components/ui/Toast';
import useToast from '../hooks/useToast';

const TEAMS = [
  {
    id: 1,
    name: 'Brand Strategy & Growth',
    category: 'Strategy',
    members: 8,
    clients: 5,
    tone: 'is-purple',
    blurb:
      'Specialized squad leading multi-platform brand strategy, market positioning, and high-velocity launch campaigns.',
    lead: 'Elana Vance',
    leadRole: 'Lead',
    ecosystem: ['Aurora Skincare', 'HyperPulse', 'Nordic Living'],
    extra: 2,
    capacity: 94,
    capacityLabel: '94% Capacity',
    capacityState: 'is-high',
  },
  {
    id: 2,
    name: 'Creative & Motion Studio',
    category: 'Creative',
    members: 12,
    clients: 7,
    tone: 'is-orange',
    blurb:
      'End-to-end art direction, visual identity systems, motion graphics and 3D renderings for enterprise launches.',
    lead: 'Marcus Brady',
    leadRole: 'Art Director',
    ecosystem: ['Zenith Watches', 'Solaris Energy', 'Voice Apparel'],
    extra: 4,
    capacity: 88,
    capacityLabel: '⚡ High Velocity',
    capacityState: 'is-high',
  },
  {
    id: 3,
    name: 'Performance Content Squad',
    category: 'Performance',
    members: 8,
    clients: 4,
    tone: 'is-green',
    blurb:
      'Short-form video assets, high-converting paid social ad creatives, and multi-variant testing sprints.',
    lead: 'Sofia Chen',
    leadRole: 'Squad Lead',
    ecosystem: ['Volt Beverage', 'Luna Sleep'],
    extra: 2,
    capacity: 72,
    capacityLabel: '◎ ROAS Focus',
    capacityState: 'is-ok',
  },
  {
    id: 4,
    name: 'Editorial & Brand Voice',
    category: 'Creative',
    members: 5,
    clients: 5,
    tone: 'is-amber',
    blurb:
      'Brand narratives, campaign copywriting, creative concealing, tone guidelines and editorial governance.',
    lead: 'David K.',
    leadRole: 'Editorial Lead',
    ecosystem: ['Bloom Care Group', 'Kinetic Motors'],
    extra: 3,
    capacity: 64,
    capacityLabel: '◎ Editorial Pace',
    capacityState: 'is-space',
  },
  {
    id: 5,
    name: 'Social Operations & Community',
    category: 'Performance',
    members: 7,
    clients: 6,
    tone: 'is-green',
    blurb:
      'Real-time social media management, community engagement workflows and always-on channel operations.',
    lead: 'Liam Chen',
    leadRole: 'Community Lead',
    ecosystem: ['Vertex AI', 'Nova Robotics'],
    extra: 4,
    capacity: 81,
    capacityLabel: '⚡ Always-On',
    capacityState: 'is-ok',
  },
  {
    id: 6,
    name: 'Digital Product Design',
    category: 'Creative',
    members: 4,
    clients: 2,
    tone: 'is-purple',
    blurb:
      'Interactive web experiences, UX research, visual design kits and conversion rate UI iterations.',
    lead: 'Taro Tanaka',
    leadRole: 'Product Lead',
    ecosystem: ['Kinetic Motors', 'HyperPulse'],
    extra: 0,
    capacity: 46,
    capacityLabel: '◎ Studio Ready',
    capacityState: 'is-ready',
  },
];

const FILTERS = ['All Squads', 'Creative', 'Strategy', 'Performance'];

export default function TeamsPage({ onOpenTeam }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState(FILTERS[0]);
  const [sort, setSort] = useState('Recently Active');
  const { toast, showToast } = useToast(3000);

  const teams = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return TEAMS.filter((team) => {
      if (filter !== FILTERS[0] && team.category !== filter) return false;
      if (
        needle &&
        !`${team.name} ${team.blurb} ${team.lead} ${team.ecosystem.join(' ')}`
          .toLowerCase()
          .includes(needle)
      ) {
        return false;
      }
      return true;
    });
  }, [query, filter]);

  return (
    <div className="page-screen">
      <div className="crumbs">
        <nav aria-label="Breadcrumb">
          <span>Admin</span>
          <svg aria-hidden="true" className="icon">
            <use href="#i-chevron" />
          </svg>
          <strong>Teams</strong>
        </nav>
        <span className="pill is-green live-chip">Production Mode</span>
      </div>

      <section className="page-head page-head--actions">
        <div>
          <div className="page-head__title-row">
            <h1 className="page-head__title">Teams</h1>
            <span className="pill is-orange">{TEAMS.length} Teams Active</span>
          </div>
          <p className="page-head__text">
            Organize creative personnel, squad capacities, and assigned brand client ecosystems.
          </p>
        </div>
        <div className="head-badges">
          <span className="head-badge">
            <svg aria-hidden="true" className="icon">
              <use href="#i-users" />
            </svg>
            <span>
              Total Talent
              <br />
              <strong>42 Specialists</strong>
            </span>
          </span>
          <span className="head-badge">
            <svg aria-hidden="true" className="icon">
              <use href="#i-briefcase" />
            </svg>
            <span>
              Active Brands
              <br />
              <strong>27 Accounts</strong>
            </span>
          </span>
          <button
            type="button"
            className="button button--primary"
            onClick={() => showToast('Opening the create team flow…', 'info')}
          >
            <svg aria-hidden="true" className="icon">
              <use href="#i-plus" />
            </svg>
            Create Team
          </button>
        </div>
      </section>

      <div className="filters">
        <label className="search">
          <input
            type="search"
            placeholder="Search teams by name, member or client…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <svg aria-hidden="true" className="icon">
            <use href="#i-search" />
          </svg>
        </label>

        <span className="filter-select">
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            {FILTERS.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
          <svg aria-hidden="true" className="icon">
            <use href="#i-chevron" />
          </svg>
        </span>

        <span className="filter-select">
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option>Recently Active</option>
            <option>Capacity (High → Low)</option>
            <option>Members (High → Low)</option>
            <option>Name (A → Z)</option>
          </select>
          <svg aria-hidden="true" className="icon">
            <use href="#i-chevron" />
          </svg>
        </span>

        <button
          type="button"
          className="button button--ghost button--sm"
          onClick={() => showToast('Exporting team roster…', 'info')}
        >
          <svg aria-hidden="true" className="icon">
            <use href="#i-download" />
          </svg>
          Export
        </button>
      </div>

      {teams.length > 0 ? (
        <div className="team-grid">
          {teams.map((team) => (
            <article key={team.id} className={`team-card ${team.tone}`}>
              <div className="team-card__top">
                <div className="team-card__chips">
                  <span className="pill is-green">
                    <i className="status-dot" />
                    Active
                  </span>
                  <span className="pill is-gray">{team.members} Members</span>
                  <span className="pill is-gray">{team.clients} Clients</span>
                </div>
                <span className={`tile ${team.tone}`}>
                  <svg aria-hidden="true" className="icon">
                    <use href="#i-layers" />
                  </svg>
                </span>
              </div>

              <h2 className="team-card__title">{team.name}</h2>
              <p className="team-card__text">{team.blurb}</p>

              <div className="team-card__lead">
                <span className="cl-avatars">
                  {[team.lead, ...team.ecosystem].slice(0, 3).map((person) => (
                    <span key={person} className="cl-avatar cl-avatar--gray">
                      {person
                        .split(' ')
                        .map((part) => part[0])
                        .join('')
                        .padEnd(2, person[1] || '')
                        .substring(0, 2)
                        .toUpperCase()}
                    </span>
                  ))}
                  {team.extra > 0 && (
                    <span className="cl-avatar cl-avatar--orange">+{team.extra}</span>
                  )}
                </span>
                <div>
                  <small>Squad Lead</small>
                  <strong>{team.lead}</strong>
                </div>
                <span className="pill is-orange">{team.leadRole}</span>
              </div>

              <div>
                <span className="eco-label">Client Ecosystem</span>
                <div className="eco-tags">
                  {team.ecosystem.map((brand) => (
                    <span key={brand} className="eco-tag">
                      <i /> {brand}
                    </span>
                  ))}
                  {team.extra > 0 && <span className="eco-tag">+{team.extra} more</span>}
                </div>
              </div>

              <div className="team-card__foot">
                <span className={`capacity ${team.capacityState}`}>{team.capacityLabel}</span>
                <button type="button" className="link-action" onClick={() => onOpenTeam(team.name)}>
                  View Team →
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <section className="panel">
          <p className="sub" style={{ padding: '8px 0' }}>
            No teams match the current filters.
          </p>
        </section>
      )}

      <Toast message={toast?.message} tone={toast?.tone} />
    </div>
  );
}
