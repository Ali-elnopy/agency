import React, { useEffect, useMemo, useState } from 'react';
import Toast from '../components/ui/Toast';
import useToast from '../hooks/useToast';
import { getTeams } from '../services/teams';

const FILTERS = ['All Squads', 'Creative', 'Strategy', 'Performance'];

export default function TeamsPage({ onOpenTeam, clientCount }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState(FILTERS[0]);
  const [sort, setSort] = useState('Recently Active');
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast, showToast } = useToast(3000);

  useEffect(() => {
    let alive = true;

    getTeams()
      .then((items) => {
        if (alive) setTeams(items);
      })
      .catch(() => {
        if (alive) setTeams([]);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  const visibleTeams = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return teams.filter((team) => {
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
  }, [teams, query, filter]);

  const totalTalent = teams.reduce((total, team) => total + (team.members || 0), 0);
  const accountCount = Number.isFinite(clientCount) ? clientCount : 27;

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
            <span className="pill is-orange">{teams.length} Teams Active</span>
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
              <strong>{totalTalent} Specialists</strong>
            </span>
          </span>
          <span className="head-badge">
            <svg aria-hidden="true" className="icon">
              <use href="#i-briefcase" />
            </svg>
            <span>
              Active Brands
              <br />
              <strong>{accountCount} Accounts</strong>
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

      {visibleTeams.length > 0 ? (
        <div className="team-grid">
          {visibleTeams.map((team) => (
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
            {loading ? 'Loading teams…' : 'No teams match the current filters.'}
          </p>
        </section>
      )}

      <Toast message={toast?.message} tone={toast?.tone} />
    </div>
  );
}
