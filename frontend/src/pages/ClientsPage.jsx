import React, { useEffect, useMemo, useRef, useState } from 'react';
import Toast from '../components/ui/Toast';
import ClientDrawer from '../components/ClientDrawer';
import useToast from '../hooks/useToast';
import { CLIENTS } from '../data/clients';

const MANAGERS = [
  'All Managers (18 Clients)',
  'Marcus Vance',
  'Sarah Jenkins',
  'Maya Lin',
  'David Chen',
];
const TEAMS = [
  'All Teams (3 Squads)',
  'Brand Strategy Squad',
  'Performance Ops',
  'Creative Direction & Motion',
  'Digital Product Design',
];
const STATUSES = ['All Status', 'Active', 'Onboarding', 'Archived'];

const WORKLOAD = [
  {
    name: 'Marcus Vance',
    role: 'Senior Client Partner',
    team: 'Brand Strategy Squad',
    clients: 6,
    capacity: 94,
    state: 'is-high',
  },
  {
    name: 'Sarah Jenkins',
    role: 'Account Director',
    team: 'Performance Ops',
    clients: 5,
    capacity: 82,
    state: 'is-ok',
  },
  {
    name: 'Maya Lin',
    role: 'Client Operations Lead',
    team: 'Creative Direction & Motion',
    clients: 4,
    capacity: 68,
    state: 'is-space',
  },
  {
    name: 'David Chen',
    role: 'Brand Strategist',
    team: 'Brand Strategy Squad',
    clients: 3,
    capacity: 41,
    state: 'is-ready',
  },
  {
    name: 'Liam Chen',
    role: 'Community Manager',
    team: 'Editorial & Brand Voice',
    clients: 2,
    capacity: 24,
    state: 'is-ready',
  },
];

const STATUS_LABEL = {
  active: 'Active',
  onboarding: 'Onboarding',
  archived: 'Archived',
};

function initialsOf(name) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
}

export default function ClientsPage({ onOpenClient, addClientRequest = 0 }) {
  const [tab, setTab] = useState('all');
  const [query, setQuery] = useState('');
  const [manager, setManager] = useState(MANAGERS[0]);
  const [team, setTeam] = useState(TEAMS[0]);
  const [status, setStatus] = useState(STATUSES[0]);
  const [includeArchived, setIncludeArchived] = useState(true);
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState('add');
  const [drawerInitial, setDrawerInitial] = useState(null);
  const { toast, showToast } = useToast(3000);

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return CLIENTS.filter((client) => {
      if (!includeArchived && client.status === 'archived') return false;
      if (manager !== MANAGERS[0] && client.manager !== manager) return false;
      if (team !== TEAMS[0] && client.team !== team) return false;
      if (status !== STATUSES[0] && client.status !== status.toLowerCase()) return false;
      if (
        needle &&
        !`${client.name} ${client.industry} ${client.manager} ${client.team}`
          .toLowerCase()
          .includes(needle)
      ) {
        return false;
      }
      return true;
    });
  }, [query, manager, team, status, includeArchived]);

  const clearFilters = () => {
    setQuery('');
    setManager(MANAGERS[0]);
    setTeam(TEAMS[0]);
    setStatus(STATUSES[0]);
    setIncludeArchived(true);
    setPage(1);
  };

  const lastAddRequest = useRef(addClientRequest);

  useEffect(() => {
    if (addClientRequest !== lastAddRequest.current) {
      lastAddRequest.current = addClientRequest;
      setDrawerMode('add');
      setDrawerInitial(null);
      setDrawerOpen(true);
    }
  }, [addClientRequest]);

  const openEditDrawer = (client) => {
    setDrawerMode('edit');
    setDrawerInitial({
      brandName: client.name,
      sector: client.industry,
      website: '',
      description: '',
      contactName: '',
      contactPhone: '',
      contactEmail: '',
    });
    setDrawerOpen(true);
  };

  return (
    <div className="page-screen">
      <header className="cl-head">
        <div>
          <div className="cl-head__title">
            <h1>Clients</h1>
          </div>
        </div>
      </header>

      <div className="cl-toolbar">
        <div className="cl-tabs" role="tablist" aria-label="Client views">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'all'}
            className={tab === 'all' ? 'is-active' : ''}
            onClick={() => setTab('all')}
          >
            All Clients (Table)
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'workload'}
            className={tab === 'workload' ? 'is-active' : ''}
            onClick={() => setTab('workload')}
          >
            By Account Manager (Workload)
          </button>
        </div>

        <label className="cl-search">
          <svg aria-hidden="true" className="icon">
            <use href="#i-search" />
          </svg>
          <input
            type="search"
            aria-label="Search clients"
            placeholder="Search clients, brands, industries, or managers…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>

        <div className="cl-toolbar__actions">
          <button
            type="button"
            className="button button--ghost button--sm"
            onClick={() => showToast('Exporting the client roster as CSV…', 'info')}
          >
            <svg aria-hidden="true" className="icon">
              <use href="#i-download" />
            </svg>
            Export CSV
          </button>
          <button
            type="button"
            className="button button--ghost button--sm"
            onClick={() => showToast('Filter presets are saved per workspace.', 'info')}
          >
            <svg aria-hidden="true" className="icon">
              <use href="#i-filter" />
            </svg>
            Filter Presets
          </button>
        </div>
      </div>

      {tab === 'all' ? (
        <>
          <div className="cl-filters">
            <span className="filter-select">
              <select
                aria-label="Filter by account manager"
                value={manager}
                onChange={(event) => setManager(event.target.value)}
              >
                {MANAGERS.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
              <svg aria-hidden="true" className="icon">
                <use href="#i-chevron" />
              </svg>
            </span>

            <span className="filter-select">
              <select
                aria-label="Filter by team"
                value={team}
                onChange={(event) => setTeam(event.target.value)}
              >
                {TEAMS.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
              <svg aria-hidden="true" className="icon">
                <use href="#i-chevron" />
              </svg>
            </span>

            <span className="filter-select">
              <select
                aria-label="Filter by status"
                value={status}
                onChange={(event) => setStatus(event.target.value)}
              >
                {STATUSES.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
              <svg aria-hidden="true" className="icon">
                <use href="#i-chevron" />
              </svg>
            </span>

            <label className="check-inline">
              <input
                type="checkbox"
                checked={includeArchived}
                onChange={(event) => setIncludeArchived(event.target.checked)}
              />
              Include archived
            </label>

            <button type="button" className="cl-clear" onClick={clearFilters}>
              <svg aria-hidden="true" className="icon">
                <use href="#i-filter" />
              </svg>
              Clear filters
            </button>
          </div>

          <section className="cl-panel">
            <div className="table-wrap">
              <table className="cl-table">
                <thead>
                  <tr>
                    <th>Brand / Client</th>
                    <th>Account Manager</th>
                    <th>Responsible Team</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((client) => (
                    <tr key={client.id}>
                      <td>
                        <div className="cl-brand">
                          <span className={`cl-brand__mark ${client.tone}`}>{client.initials}</span>
                          <span>
                            <span className="cl-brand__name">
                              {client.name}
                              {client.verified && (
                                <svg aria-hidden="true" className="icon">
                                  <use href="#i-check" />
                                </svg>
                              )}
                              {client.attention && (
                                <span className="cl-attention">Attention needed</span>
                              )}
                            </span>
                            <span className="cl-brand__sub">{client.industry}</span>
                          </span>
                        </div>
                      </td>

                      <td>
                        {client.manager ? (
                          <div className="cl-person">
                            <span className="cl-avatar cl-avatar--orange">
                              {client.managerInitials}
                            </span>
                            <span>
                              <span className="cl-person__name">{client.manager}</span>
                              <span className="cl-person__meta">
                                <svg aria-hidden="true" className="icon">
                                  <use href="#i-users" />
                                </svg>
                                {client.managerClients} active clients
                              </span>
                            </span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="cl-assign-link"
                            onClick={() => openEditDrawer(client)}
                          >
                            <svg aria-hidden="true" className="icon">
                              <use href="#i-plus" />
                            </svg>
                            Assign Manager
                          </button>
                        )}
                      </td>

                      <td>
                        {client.team ? (
                          <div className="cl-team">
                            {client.teamAvatars && (
                              <span className="cl-avatars">
                                {client.teamAvatars.map((initials) => (
                                  <span key={initials} className="cl-avatar cl-avatar--gray">
                                    {initials}
                                  </span>
                                ))}
                              </span>
                            )}
                            <span className="cl-team__name">{client.team}</span>
                          </div>
                        ) : (
                          <span className="cl-brand__sub">Pending assignment</span>
                        )}
                      </td>

                      <td>
                        <span
                          className={`cl-status${
                            client.status === 'onboarding'
                              ? ' is-onboarding'
                              : client.status === 'archived'
                                ? ' is-archived'
                                : ''
                          }`}
                        >
                          {STATUS_LABEL[client.status]}
                        </span>
                      </td>

                      <td>
                        <span className="cl-date">
                          <strong>{client.created.split(',')[0]},</strong>
                          {client.created.split(', ')[1]}
                        </span>
                      </td>

                      <td>
                        <div className="cl-actions">
                          {client.status === 'archived' ? (
                            <button
                              type="button"
                              className="cl-profile-btn"
                              onClick={() => showToast(`${client.name} restored to active.`)}
                            >
                              Restore
                            </button>
                          ) : client.status === 'onboarding' ? (
                            <button
                              type="button"
                              className="cl-assign-btn"
                              onClick={() => openEditDrawer(client)}
                            >
                              Assign
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="cl-profile-btn"
                              onClick={() => onOpenClient && onOpenClient(client.name)}
                            >
                              Profile
                              <svg aria-hidden="true" className="icon">
                                <use href="#i-arrow" />
                              </svg>
                            </button>
                          )}
                          <button
                            type="button"
                            className="cl-more"
                            aria-label={`More actions for ${client.name}`}
                            onClick={() => showToast(`Actions for ${client.name}.`, 'info')}
                          >
                            <svg aria-hidden="true" className="icon">
                              <use href="#i-panel" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {rows.length === 0 && (
                    <tr>
                      <td colSpan={6}>
                        <p className="cl-brand__sub" style={{ padding: '18px 0' }}>
                          No clients match the current filters.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="cl-foot">
              <span>
                Showing <strong>{rows.length ? 1 : 0}</strong> to <strong>{rows.length}</strong> of{' '}
                <strong>20</strong> client organizations
              </span>
              <nav className="cl-pager" aria-label="Pagination">
                {[1, 2, 3].map((number) => (
                  <button
                    key={number}
                    type="button"
                    className={page === number ? 'is-active' : ''}
                    onClick={() => setPage(number)}
                  >
                    {number}
                  </button>
                ))}
                <button type="button" aria-label="Next page" onClick={() => setPage(2)}>
                  <svg aria-hidden="true" className="icon">
                    <use href="#i-chevron" />
                  </svg>
                </button>
              </nav>
            </div>
          </section>
        </>
      ) : (
        <section className="cl-panel" style={{ padding: 18 }}>
          <div className="panel__head">
            <div>
              <h2 className="panel__title">
                <span className="chip is-purple">
                  <svg aria-hidden="true" className="icon">
                    <use href="#i-chart" />
                  </svg>
                </span>
                Workload Allocation Matrix
              </h2>
              <p className="panel__sub">
                Balance client ownership across account managers before assigning new brands.
              </p>
            </div>
          </div>

          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Account Manager</th>
                  <th>Assigned Team</th>
                  <th>Active Clients</th>
                  <th>Capacity State</th>
                </tr>
              </thead>
              <tbody>
                {WORKLOAD.map((row) => (
                  <tr key={row.name}>
                    <td>
                      <div className="brand-cell">
                        <span className="tile is-orange">{initialsOf(row.name)}</span>
                        <span>
                          <strong>{row.name}</strong>
                          <small>{row.role}</small>
                        </span>
                      </div>
                    </td>
                    <td>{row.team}</td>
                    <td>
                      <div
                        className="progress"
                        style={{ '--c': 'var(--orange)', '--p': row.capacity }}
                      >
                        <span>
                          {row.clients} clients · {row.capacity}%
                        </span>
                        <i />
                      </div>
                    </td>
                    <td>
                      <span className={`capacity ${row.state}`}>
                        {row.state === 'is-high'
                          ? 'At Capacity'
                          : row.state === 'is-ok'
                            ? 'Optimal'
                            : row.state === 'is-space'
                              ? 'Has Space'
                              : 'Ready'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <ClientDrawer
        open={drawerOpen}
        mode={drawerMode}
        initial={drawerInitial}
        onClose={() => setDrawerOpen(false)}
        onSave={() => {
          setDrawerOpen(false);
          showToast(
            drawerMode === 'edit' ? 'Client record updated.' : 'Client onboarded successfully.',
          );
        }}
      />

      <Toast message={toast?.message} tone={toast?.tone} />
    </div>
  );
}
