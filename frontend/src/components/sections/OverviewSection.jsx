import React from 'react';

const KPIS = [
  {
    label: 'Active Brands',
    value: '12',
    unit: 'Brands',
    icon: 'i-briefcase',
    tone: 'is-orange',
    chip: '+4 this week',
    chipTone: 'is-green',
    foot: '2 archived brand workspaces',
  },
  {
    label: 'Total Employees',
    value: '24',
    unit: 'Studio Seats',
    icon: 'i-users',
    tone: 'is-purple',
    chip: '2 Admin',
    chipTone: 'is-purple',
    foot: '1 Manager · 2 Pending invites',
  },
  {
    label: 'Active Teams',
    value: '5',
    unit: 'Operational Units',
    icon: 'i-layers',
    tone: 'is-green',
    chip: 'Optimized',
    chipTone: 'is-green',
    foot: 'Average team size 4.8 members',
  },
];

const TEAMS = [
  { name: 'Brand Strategy', members: 5, clients: 4, pct: 100 },
  { name: 'Social Content', members: 4, clients: 3, pct: 75 },
  { name: 'Performance Ops', members: 4, clients: 2, pct: 50 },
  { name: 'Creative Direction', members: 3, clients: 1, pct: 25 },
  { name: 'Editorial & Brand Voice', members: 3, clients: 0, pct: 0 },
];

const MATRIX = [
  { name: 'Elana Vance', team: 'Brand Strategy', clients: 4, state: 'At Capacity', tone: 'is-red' },
  { name: 'Marcus Vance', team: 'Social Content', clients: 3, state: 'Optimal', tone: 'is-green' },
  {
    name: 'Sarah Jenkins',
    team: 'Performance Ops',
    clients: 2,
    state: 'Has Space',
    tone: 'is-amber',
  },
  { name: 'David K.', team: 'Creative Direction', clients: 1, state: 'Ready', tone: 'is-purple' },
  { name: 'Jessica Wong', team: 'Unassigned', clients: 0, state: 'Ready', tone: 'is-gray' },
];

const ALERTS = [
  {
    group: 'Brands without teams',
    count: 1,
    tone: 'Needs Team',
    rows: [
      { name: 'Apex Dynamics', sub: 'Aerospace Engineering · No team', action: 'Assign Team' },
    ],
  },
];

function initials(name) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
}

export default function OverviewSection({ stats, onViewWorkload }) {
  const hasWorkload = Array.isArray(stats?.workload) && stats.workload.length > 0;

  const matrix = hasWorkload ? stats.workload : MATRIX;
  const teams =
    Array.isArray(stats?.teamWorkload) && stats.teamWorkload.length > 0
      ? stats.teamWorkload
      : TEAMS;

  const alerts = Array.isArray(stats?.alerts)
    ? stats.alerts.filter((alert) => alert.rows.length > 0)
    : ALERTS;

  const visibleTeams = teams.slice(0, 6);
  const hiddenTeams = teams.length - visibleTeams.length;

  const alertCount = alerts.reduce((total, alert) => total + alert.count, 0);
  const unassignedTeamBrands = stats?.teamAssignment?.unassignedClients ?? 0;

  const kpis = [
    {
      ...KPIS[0],
      value: stats ? String(stats.totalClients) : KPIS[0].value,
      foot: stats
        ? `${unassignedTeamBrands} ${
            unassignedTeamBrands === 1 ? 'brand' : 'brands'
          } without a team`
        : KPIS[0].foot,
    },
    {
      ...KPIS[1],
      value: stats ? String(stats.totalEmployees) : KPIS[1].value,
      chip: stats ? `${stats.activeEmployees} Active` : KPIS[1].chip,
      foot: stats
        ? `${stats.totalEmployees - stats.activeEmployees} deactivated accounts`
        : KPIS[1].foot,
    },
    {
      ...KPIS[2],
      value: stats ? String(stats.activeTeams) : KPIS[2].value,
      foot: stats ? `${stats.totalTeams} operational units in the workspace` : KPIS[2].foot,
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
                  Real-time distribution of active brand retainers across the studio&rsquo;s teams.
                </p>
              </div>
              <button type="button" className="ec-link" onClick={onViewWorkload}>
                Review assignments in Brands →
              </button>
            </header>

            <div className="ov-bars">
              {visibleTeams.map((team) => (
                <div key={team.name} className="ov-bar">
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

            {hiddenTeams > 0 ? (
              <p className="ov-bars__more">
                +{hiddenTeams} more {hiddenTeams === 1 ? 'team' : 'teams'} with no assigned
                brands.
              </p>
            ) : null}
          </section>

          <section className="cl-card">
            <header className="cl-card__head">
              <h2 className="cl-card__title">Workload Allocation Matrix</h2>
            </header>

            <div className="table-wrap">
              <table className="table ov-table">
                <thead>
                  <tr>
                    <th>Account Manager</th>
                    <th>Assigned Team</th>
                    <th>Active Brands</th>
                    <th>Capacity State</th>
                  </tr>
                </thead>
                <tbody>
                  {matrix.map((row) => (
                    <tr key={row.name}>
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
                  ))}
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
              <span className="pill is-orange">{alertCount} Alerts</span>
            </header>

            {alerts.length === 0 ? (
              <p className="cl-card__sub">Every brand has a team assigned.</p>
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
                  <div key={row.name} className="ov-alert__row">
                    <span className="ov-alert__mark">{initials(row.name)}</span>
                    <span>
                      <strong>{row.name}</strong>
                      <small>{row.sub}</small>
                    </span>
                    <button type="button" className="cl-profile-btn">
                      {row.action}
                    </button>
                  </div>
                ))}
              </div>
            ))}

            <div className="ov-alert__warn">
              <svg aria-hidden="true" className="icon">
                <use href="#i-alert" />
              </svg>
              Unassigned brands cannot proceed with AI briefs until a team is confirmed.
            </div>
          </section>

          <section className="ov-system">
            <div className="ov-system__head">
              <span>System Integrity</span>
              <span className="pill is-green">Operational</span>
            </div>
            <strong>All studio systems operational</strong>
            <p>
              API uptime 99.98% in the last 30 days. No impacts detected across your active
              workspaces.
            </p>
          </section>
        </aside>
      </div>
    </>
  );
}
