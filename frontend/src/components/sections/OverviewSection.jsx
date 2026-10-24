import React from 'react';

const KPI_META = [
  { label: 'Total Brands', unit: 'Brands', icon: 'i-briefcase', tone: 'is-orange' },
  { label: 'Total Employees', unit: 'Studio Seats', icon: 'i-users', tone: 'is-purple' },
  { label: 'Active Teams', unit: 'Operational Units', icon: 'i-layers', tone: 'is-green' },
];

function initials(name) {
  return String(name || '')
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
}

export default function OverviewSection({ stats, onViewWorkload, onAssignTeam }) {
  const hasStats = Boolean(stats);

  const workload = Array.isArray(stats?.workload) ? stats.workload : [];
  const teams = Array.isArray(stats?.teamWorkload) ? stats.teamWorkload : [];

  const alerts = Array.isArray(stats?.alerts)
    ? stats.alerts.filter(
        (alert) => (alert.count ?? alert.rows?.length ?? 0) > 0 && alert.rows?.length > 0,
      )
    : [];

  const visibleTeams = teams.slice(0, 6);
  const hiddenTeams = teams.length - visibleTeams.length;

  const totalClients = stats?.totalClients ?? 0;
  const totalEmployees = stats?.totalEmployees ?? 0;
  const activeEmployees = stats?.activeEmployees ?? 0;
  const activeTeams = stats?.activeTeams ?? 0;
  const totalTeams = stats?.totalTeams ?? 0;

  const assignedBrands = stats?.teamAssignment?.assignedClients ?? 0;
  const unassignedTeamBrands = stats?.teamAssignment?.unassignedClients ?? 0;
  const deactivatedEmployees = Math.max(0, totalEmployees - activeEmployees);

  const emptyTeams = teams.filter((team) => (team.clients ?? 0) === 0).length;
  const teamsWithBrands = teams.length - emptyTeams;

  const alertCount = alerts.reduce((total, alert) => total + (alert.count ?? 0), 0);

  const kpis = [
    {
      ...KPI_META[0],
      value: hasStats ? String(totalClients) : '—',
      chip: hasStats ? `${assignedBrands} assigned` : 'No data',
      chipTone: hasStats && assignedBrands > 0 ? 'is-green' : 'is-amber',
      foot: hasStats
        ? `${unassignedTeamBrands} ${
            unassignedTeamBrands === 1 ? 'brand' : 'brands'
          } without a team`
        : 'Studio metrics are unavailable for this account.',
    },
    {
      ...KPI_META[1],
      value: hasStats ? String(totalEmployees) : '—',
      chip: hasStats ? `${activeEmployees} active` : 'No data',
      chipTone: hasStats ? 'is-purple' : 'is-amber',
      foot: hasStats
        ? deactivatedEmployees > 0
          ? `${deactivatedEmployees} deactivated ${
              deactivatedEmployees === 1 ? 'account' : 'accounts'
            }`
          : 'Every account is active'
        : 'Studio metrics are unavailable for this account.',
    },
    {
      ...KPI_META[2],
      value: hasStats ? String(activeTeams) : '—',
      chip: hasStats ? (emptyTeams > 0 ? `${emptyTeams} empty` : 'All covered') : 'No data',
      chipTone: hasStats ? (emptyTeams > 0 ? 'is-amber' : 'is-green') : 'is-amber',
      foot: hasStats
        ? `${teamsWithBrands} of ${totalTeams} teams have assigned brands`
        : 'Studio metrics are unavailable for this account.',
    },
  ];

  return (
    <>
      <div className="ov-kpis">
        {kpis.map((kpi) => (
          <article key={kpi.label} className="ov-kpi">
            <span className={`ov-kpi__icon tile ${kpi.tone}`}>
              <svg aria-hidden="true" className="icon">
                <use href={`#${kpi.icon}`} />
              </svg>
            </span>
            <span className="cl-label">{kpi.label}</span>
            <strong className="ov-kpi__value">
              {kpi.value}
              <small>{kpi.unit}</small>
            </strong>
            <div className="ov-kpi__foot">
              <span className={`pill ${kpi.chipTone}`}>{kpi.chip}</span>
              <span>{kpi.foot}</span>
            </div>
          </article>
        ))}
      </div>

      <div className="ov-grid">
        <div className="ov-main">
          <section className="cl-card">
            <header className="cl-card__head">
              <div>
                <h2 className="cl-card__title">Brands per Teams</h2>
                <p className="cl-card__sub">
                  Brands currently assigned to each team in the workspace.
                </p>
              </div>
              <button type="button" className="ec-link" onClick={onViewWorkload}>
                Review assignments in Brands →
              </button>
            </header>

            {visibleTeams.length > 0 ? (
              <div className="ov-bars">
                {visibleTeams.map((team) => (
                  <div key={team.id ?? team.name} className="ov-bar">
                    <span className="cl-avatar cl-avatar--orange">{initials(team.name)}</span>
                    <span className="ov-bar__name">
                      <span className="ov-bar__label" title={team.name}>
                        {team.name}
                      </span>
                      <em>
                        {team.members} {team.members === 1 ? 'member' : 'members'}
                      </em>
                    </span>
                    <span className="ov-bar__track">
                      <i style={{ width: `${team.pct}%` }} />
                    </span>
                    <span className="ov-bar__value">
                      {team.clients} {team.clients === 1 ? 'brand' : 'brands'}
                    </span>
                    <span className="ov-bar__pct">{team.pct}%</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="ws-empty">
                <strong>{hasStats ? 'No teams yet.' : 'Team data is unavailable.'}</strong>
                <p>
                  {hasStats
                    ? 'Create a team to start distributing brands across the studio.'
                    : 'Sign in with an administrator account to see team distribution.'}
                </p>
              </div>
            )}

            {hiddenTeams > 0 ? (
              <p className="ov-bars__more">
                +{hiddenTeams} more {hiddenTeams === 1 ? 'team' : 'teams'} in the workspace.
              </p>
            ) : null}
          </section>

          <section className="cl-card">
            <header className="cl-card__head">
              <div>
                <h2 className="cl-card__title">Workload Allocation Matrix</h2>
                <p className="cl-card__sub">
                  Account managers and the brands currently assigned to them.
                </p>
              </div>
            </header>

            <div className="table-wrap">
              <table className="table ov-table">
                <thead>
                  <tr>
                    <th>Account Manager</th>
                    <th>Assigned Team</th>
                    <th>Brands</th>
                    <th>Capacity State</th>
                  </tr>
                </thead>
                <tbody>
                  {workload.length > 0 ? (
                    workload.map((row) => (
                      <tr key={row.id ?? row.name}>
                        <td>
                          <div className="ov-person">
                            <span className="cl-avatar cl-avatar--gray">{initials(row.name)}</span>
                            {row.name}
                          </div>
                        </td>
                        <td>{row.team}</td>
                        <td>
                          <strong>{row.clients}</strong>
                        </td>
                        <td>
                          <span className={`pill ${row.tone}`}>{row.state}</span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4}>
                        <div className="ws-empty">
                          <strong>
                            {hasStats ? 'No account managers yet.' : 'Workload data is unavailable.'}
                          </strong>
                          <p>
                            {hasStats
                              ? 'Add an account manager to start tracking brand capacity.'
                              : 'Sign in with an administrator account to see workload.'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <aside className="ov-rail">
          <section className="cl-card">
            <header className="cl-card__head">
              <h2 className="cl-card__title">
                <span className="cl-card__icon is-warn">
                  <svg aria-hidden="true" className="icon">
                    <use href="#i-alert" />
                  </svg>
                </span>
                Attention Required
              </h2>
              <span className={`pill ${alertCount > 0 ? 'is-orange' : 'is-green'}`}>
                {alertCount} {alertCount === 1 ? 'Alert' : 'Alerts'}
              </span>
            </header>

            {alerts.length === 0 ? (
              <p className="cl-card__sub">
                {hasStats
                  ? 'Every brand has a team assigned.'
                  : 'Alerts are unavailable for this account.'}
              </p>
            ) : null}

            {alerts.map((alert) => (
              <div key={alert.group} className="ov-alert">
                <div className="ov-alert__head">
                  <span className="cl-label">
                    {alert.group} <strong>({alert.count})</strong>
                  </span>
                  <span
                    className={`pill ${alert.tone === 'High Priority' ? 'is-red' : 'is-amber'}`}
                  >
                    {alert.tone}
                  </span>
                </div>

                {alert.rows.map((row) => (
                  <div key={row.id ?? row.name} className="ov-alert__row">
                    <span className="ov-alert__mark">{initials(row.name)}</span>
                    <span>
                      <strong>{row.name}</strong>
                      <small>{row.sub}</small>
                    </span>
                    <button
                      type="button"
                      className="cl-profile-btn"
                      onClick={() => onAssignTeam?.(row)}
                    >
                      {row.action}
                    </button>
                  </div>
                ))}
              </div>
            ))}

            {hasStats ? (
              <div className="ov-alert__warn">
                <svg aria-hidden="true" className="icon">
                  <use href="#i-alert" />
                </svg>
                Brands without a team are excluded from team workload until a team is assigned.
              </div>
            ) : null}
          </section>
        </aside>
      </div>
    </>
  );
}
