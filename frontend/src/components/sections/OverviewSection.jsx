import React, { useMemo } from 'react';
import { useBrands } from '../../context/brandsStore';
import { useWorkspace } from '../../context/workspaceStore';

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

function isUnassignedBrand(brand) {
  return brand?.teamId == null && !String(brand?.team ?? '').trim();
}

// Brands reference their team by id once the API owns the record; the local
// fixtures only carry the team name, so both are accepted.
function brandBelongsToTeam(brand, team) {
  if (brand?.teamId != null) return String(brand.teamId) === String(team.id);

  return Boolean(brand?.team) && brand.team === team.name;
}

function workloadState(clients, max) {
  if (clients === 0) return { state: 'Ready', tone: 'is-gray' };
  if (clients === max && max > 1) return { state: 'At Capacity', tone: 'is-red' };
  if (clients >= Math.ceil(max * 0.66)) return { state: 'Optimal', tone: 'is-green' };

  return { state: 'Has Space', tone: 'is-amber' };
}

export default function OverviewSection({ stats, onViewWorkload, onAssignTeam }) {
  const { brands } = useBrands();
  const { users, teams: workspaceTeams } = useWorkspace();

  const hasStats = Boolean(stats);
  const hasBrands = brands.length > 0;
  const hasPeople = users.length > 0;
  const hasTeams = workspaceTeams.length > 0;

  // Attention Required is driven by workspace brands so Assign Team always
  // opens against a real record, not a stale dashboard snapshot.
  const unassignedBrands = useMemo(() => brands.filter(isUnassignedBrand), [brands]);

  const alerts = useMemo(() => {
    if (hasBrands) {
      if (unassignedBrands.length === 0) return [];

      return [
        {
          group: 'Brands without teams',
          count: unassignedBrands.length,
          tone: 'Needs Team',
          rows: unassignedBrands.slice(0, 8).map((brand) => ({
            ...brand,
            sub: `${brand.industry || 'Brand'} · No team`,
            action: 'Assign Team',
          })),
        },
      ];
    }

    return Array.isArray(stats?.alerts)
      ? stats.alerts.filter(
          (alert) => (alert.count ?? alert.rows?.length ?? 0) > 0 && alert.rows?.length > 0,
        )
      : [];
  }, [hasBrands, stats?.alerts, unassignedBrands]);

  // Brands per team: computed from the project records (brands + teams) so the
  // card agrees with the Brands screen. API stats are only a fallback for
  // accounts where the project lists could not be loaded.
  const teamRows = useMemo(() => {
    if (!hasTeams) {
      return Array.isArray(stats?.teamWorkload) ? stats.teamWorkload : [];
    }

    const activeTeams = workspaceTeams.filter((team) => team.status !== 'inactive');
    const statsTeams = new Map(
      (Array.isArray(stats?.teamWorkload) ? stats.teamWorkload : []).map((team) => [
        String(team.id),
        team,
      ]),
    );

    const rows = activeTeams.map((team) => {
      const linked = brands.filter((brand) => brandBelongsToTeam(brand, team)).length;
      const clients = linked > 0 ? linked : (team.brandIds?.length ?? 0);
      const members =
        statsTeams.get(String(team.id))?.members ??
        Math.max(
          users.filter((user) => String(user.teamId) === String(team.id)).length,
          team.memberIds?.length ?? 0,
        );

      return { id: team.id, name: team.name, members, clients, pct: 0 };
    });

    const max = Math.max(1, ...rows.map((row) => row.clients));

    return rows
      .map((row) => ({ ...row, pct: Math.round((row.clients / max) * 100) }))
      .sort(
        (a, b) =>
          b.clients - a.clients ||
          b.members - a.members ||
          String(a.name).localeCompare(String(b.name)),
      );
  }, [brands, hasTeams, stats?.teamWorkload, users, workspaceTeams]);

  // Workload: the API already ranks account managers; when it is unavailable,
  // derive the same view from the project's people and brands.
  const workload = useMemo(() => {
    if (Array.isArray(stats?.workload) && stats.workload.length > 0) return stats.workload;
    if (!hasPeople) return [];

    const managers = users.filter((user) => user.systemAccess === 'account_manager');
    if (managers.length === 0) return [];

    const counts = managers.map(
      (manager) =>
        brands.filter(
          (brand) =>
            (brand.accountManagerId != null &&
              String(brand.accountManagerId) === String(manager.id)) ||
            (brand.manager &&
              manager.fullName &&
              String(brand.manager).toLowerCase() === String(manager.fullName).toLowerCase()),
        ).length,
    );

    const max = Math.max(1, ...counts);
    const teamNameById = new Map(
      workspaceTeams.map((team) => [String(team.id), team.name]),
    );

    return managers.map((manager, index) => {
      const clients = counts[index];
      const { state, tone } = workloadState(clients, max);

      return {
        id: manager.id,
        name: manager.fullName,
        role: clients === max && max > 1 ? 'Lead' : clients === 0 ? 'Available' : 'AM',
        team:
          manager.teamName ||
          teamNameById.get(String(manager.teamId)) ||
          'Unassigned',
        clients,
        pct: Math.round((clients / max) * 100),
        state,
        tone,
      };
    });
  }, [brands, hasPeople, stats?.workload, users, workspaceTeams]);

  const totalClients = hasBrands ? brands.length : (stats?.totalClients ?? 0);
  // "Employees" means studio staff, not every directory account (admins and
  // account managers are excluded by the API stat), so keep that definition
  // when the aggregate is available and mirror it when it is not.
  const employeeUsers = users.filter((user) => user.systemAccess === 'employee');
  const totalEmployees = hasStats
    ? (stats.totalEmployees ?? 0)
    : employeeUsers.length;
  const activeEmployees = hasStats
    ? (stats.activeEmployees ?? 0)
    : employeeUsers.filter((user) => user.active !== false).length;
  const activeTeams = hasTeams
    ? workspaceTeams.filter((team) => team.status !== 'inactive').length
    : (stats?.activeTeams ?? 0);
  const totalTeams = hasTeams ? workspaceTeams.length : (stats?.totalTeams ?? 0);

  const unassignedTeamBrands = hasBrands
    ? unassignedBrands.length
    : (stats?.teamAssignment?.unassignedClients ?? 0);
  const assignedBrands = hasBrands
    ? Math.max(0, brands.length - unassignedBrands.length)
    : (stats?.teamAssignment?.assignedClients ?? 0);
  const deactivatedEmployees = Math.max(0, totalEmployees - activeEmployees);

  const emptyTeams = teamRows.filter((team) => (team.clients ?? 0) === 0).length;
  const teamsWithBrands = teamRows.length - emptyTeams;

  const alertCount = alerts.reduce((total, alert) => total + (alert.count ?? 0), 0);

  const hasBrandData = hasBrands || hasStats;
  const hasPeopleData = hasPeople || hasStats;
  const hasTeamData = hasTeams || hasStats;

  const kpis = [
    {
      ...KPI_META[0],
      value: hasBrandData ? String(totalClients) : '—',
      chip: hasBrandData ? `${assignedBrands} assigned` : 'No data',
      chipTone: hasBrandData && assignedBrands > 0 ? 'is-green' : 'is-amber',
      foot: hasBrandData
        ? `${unassignedTeamBrands} ${
            unassignedTeamBrands === 1 ? 'brand' : 'brands'
          } without a team`
        : 'Studio metrics are unavailable for this account.',
    },
    {
      ...KPI_META[1],
      value: hasPeopleData ? String(totalEmployees) : '—',
      chip: hasPeopleData ? `${activeEmployees} active` : 'No data',
      chipTone: hasPeopleData ? 'is-purple' : 'is-amber',
      foot: hasPeopleData
        ? deactivatedEmployees > 0
          ? `${deactivatedEmployees} deactivated ${
              deactivatedEmployees === 1 ? 'account' : 'accounts'
            }`
          : 'Every account is active'
        : 'Studio metrics are unavailable for this account.',
    },
    {
      ...KPI_META[2],
      value: hasTeamData ? String(activeTeams) : '—',
      chip: hasTeamData ? (emptyTeams > 0 ? `${emptyTeams} empty` : 'All covered') : 'No data',
      chipTone: hasTeamData ? (emptyTeams > 0 ? 'is-amber' : 'is-green') : 'is-amber',
      foot: hasTeamData
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

            {teamRows.length > 0 ? (
              <div className="ov-bars">
                {teamRows.map((team) => (
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
                <strong>{hasTeamData ? 'No teams yet.' : 'Team data is unavailable.'}</strong>
                <p>
                  {hasTeamData
                    ? 'Create a team to start distributing brands across the studio.'
                    : 'Sign in with an administrator account to see team distribution.'}
                </p>
              </div>
            )}
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
                            {hasPeopleData
                              ? 'No account managers yet.'
                              : 'Workload data is unavailable.'}
                          </strong>
                          <p>
                            {hasPeopleData
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
                {hasBrandData
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
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        const brand =
                          brands.find((item) => String(item.id) === String(row.id)) ?? row;
                        onAssignTeam?.(brand);
                      }}
                    >
                      {row.action || 'Assign Team'}
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
