import React from 'react';

const KPIS = [
  {
    label: 'Active Clients',
    value: '12',
    unit: 'Clients',
    icon: 'i-briefcase',
    tone: 'is-orange',
    chip: '+4 this week',
    chipTone: 'is-green',
    foot: '2 archived client brands',
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

const MANAGERS = [
  { name: 'Elana Vance', role: 'Lead', clients: 4, pct: 33 },
  { name: 'Marcus Vance', role: 'AM', clients: 3, pct: 25 },
  { name: 'Sarah Jenkins', role: 'AM', clients: 2, pct: 17 },
  { name: 'David K.', role: 'AM', clients: 1, pct: 8 },
  { name: 'Jessica Wong', role: 'Available', clients: 0, pct: 0 },
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
    group: 'Clients without an account manager',
    count: 2,
    tone: 'High Priority',
    rows: [
      { name: 'Lumina Health', sub: 'HealthTech & Telehealth', action: 'Assign Manager' },
      { name: 'Solaris Energy', sub: 'Renewables', action: 'Assign Manager' },
    ],
  },
  {
    group: 'Clients without a team',
    count: 1,
    tone: 'Needs Squad',
    rows: [
      { name: 'Apex Dynamics', sub: 'Aerospace Engineering · No Squad', action: 'Assign Team' },
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

export default function OverviewSection({
  stats,
  onAddClient,
  onAddUser,
  onCreateTeam,
  onViewWorkload,
}) {
  const kpis = [
    {
      ...KPIS[0],
      value: stats ? String(stats.totalClients) : KPIS[0].value,
      foot: stats
        ? `${stats.accountManagerAssignment?.unassignedClients ?? 0} clients without an account manager`
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
      <section className="ov-quick">
        <span className="ov-quick__icon">
          <svg aria-hidden="true" className="icon">
            <use href="#i-zap" />
          </svg>
        </span>
        <div className="ov-quick__body">
          <h2>Quick Actions</h2>
          <p>Accelerate onboarding across clients, team rosters, and studio seats.</p>
        </div>
        <div className="ov-quick__actions">
          <button type="button" className="button button--primary button--sm" onClick={onAddClient}>
            <svg aria-hidden="true" className="icon">
              <use href="#i-plus" />
            </svg>
            Add Client
          </button>
          <button type="button" className="button button--dark button--sm" onClick={onAddUser}>
            Add User
          </button>
          <button type="button" className="button button--ghost button--sm" onClick={onCreateTeam}>
            <svg aria-hidden="true" className="icon">
              <use href="#i-plus" />
            </svg>
            Create Team
          </button>
        </div>
      </section>

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
                <h2 className="cl-card__title">Clients per Account Manager</h2>
                <p className="cl-card__sub">
                  Real-time distribution of active brand retainers across the studio&rsquo;s account
                  managers.
                </p>
              </div>
              <button type="button" className="ec-link" onClick={onViewWorkload}>
                View workload in Clients →
              </button>
            </header>

            <div className="ov-bars">
              {MANAGERS.map((manager) => (
                <div key={manager.name} className="ov-bar">
                  <span className="cl-avatar cl-avatar--orange">{initials(manager.name)}</span>
                  <span className="ov-bar__name">
                    {manager.name}
                    <em className={manager.role === 'Lead' ? 'is-lead' : ''}>{manager.role}</em>
                  </span>
                  <span className="ov-bar__track">
                    <i style={{ width: `${manager.pct}%` }} />
                  </span>
                  <span className="ov-bar__value">{manager.clients} clients</span>
                  <span className="ov-bar__pct">{manager.pct}%</span>
                </div>
              ))}
            </div>
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
                    <th>Active Clients</th>
                    <th>Capacity State</th>
                  </tr>
                </thead>
                <tbody>
                  {MATRIX.map((row) => (
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
              <span className="pill is-orange">5 Alerts</span>
            </header>

            {ALERTS.map((alert) => (
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
              Unassigned clients cannot proceed with AI briefs until both a manager and team are
              confirmed.
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
