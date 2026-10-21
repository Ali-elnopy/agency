import React, { useCallback, useEffect, useState } from 'react';
import Switch from '../components/ui/Switch';
import Toast from '../components/ui/Toast';
import InfoModal from '../components/modals/InfoModal';
import ViewTabs from '../components/ui/ViewTabs';
import useToast from '../hooks/useToast';
import { RBAC_ROLES } from '../data/rbac';
import { DEACTIVATION_REASONS, DIRECTORY_STATS, REASSIGN_TARGETS } from '../data/users';
import { deactivateUser, getUsers, updateUser } from '../services/users';
import { validateProfile } from '../utils/validation';

/* --------------------------------------------------------------- helpers */

function roleIdForName(roleName) {
  return RBAC_ROLES.find((role) => roleName?.startsWith(role.name))?.id ?? 'creator';
}

function StatusPill({ status }) {
  if (status === 'active') {
    return (
      <span className="pill is-green">
        <i className="status-dot" />
        Active
      </span>
    );
  }

  return (
    <span className="pill is-danger">
      <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="M6.5 17.5l11-11" fill="none" stroke="currentColor" strokeWidth="1.8" />
      </svg>
      Deactivated
    </span>
  );
}

const EMPTY_FORM = {
  fullName: '',
  email: '',
  phone: '',
  roleId: 'creator',
  brands: [],
  suspended: false,
};

const VIEW_TABS = [
  { id: 'users', label: 'Users Directory' },
  { id: 'roles', label: 'Roles & Permissions' },
];

/* ------------------------------------------------------------------ page */

export default function UserAccessPage({ onOpenRoles }) {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(DIRECTORY_STATS);
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);
  const [busyUserId, setBusyUserId] = useState(null);
  const [deactivateTarget, setDeactivateTarget] = useState(null);
  const [deactivating, setDeactivating] = useState(false);
  const [deactivationReason, setDeactivationReason] = useState(DEACTIVATION_REASONS[0]);
  const [reassignTo, setReassignTo] = useState(REASSIGN_TARGETS[0]);
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const { toast, showToast } = useToast(3500);

  const notify = (message, tone = 'success') => showToast(message, tone);

  const selectUser = useCallback((user) => {
    setSelectedId(user.id);
    setForm({
      fullName: user.name ?? '',
      email: user.email ?? '',
      phone: user.phone ?? '',
      roleId: user.roleId ?? roleIdForName(user.role),
      brands: [...(user.brands ?? [])],
      suspended: Boolean(user.suspended),
    });
    setErrors({});
  }, []);

  const loadDirectory = useCallback(async () => {
    setLoading(true);
    setLoadError('');

    try {
      const result = await getUsers();
      setUsers(result.users);
      setStats(result.stats);

      const preferred =
        result.users.find((user) => user.editing && user.status === 'active') ?? result.users[0];

      if (preferred) selectUser(preferred);
    } catch (error) {
      setLoadError(error.message || 'Could not load the user directory.');
    } finally {
      setLoading(false);
    }
  }, [selectUser]);

  useEffect(() => {
    loadDirectory();
  }, [loadDirectory]);

  const selectedUser = users.find((user) => user.id === selectedId) ?? null;
  const headerUser = selectedUser ?? {
    name: 'Loading…',
    email: '',
    initials: '—',
    avatarTone: 'muted',
    status: 'active',
  };

  const visibleUsers = users.filter((user) => {
    const matchesFilter =
      filter === 'all' ||
      (filter === 'active' ? user.status === 'active' : user.status !== 'active');
    const term = query.trim().toLowerCase();
    const matchesQuery =
      !term || user.name.toLowerCase().includes(term) || user.email.toLowerCase().includes(term);
    return matchesFilter && matchesQuery;
  });

  const updateField = (field) => (event) => {
    const { value } = event.target;

    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const removeBrand = (brand) => {
    setForm((prev) => ({ ...prev, brands: prev.brands.filter((item) => item !== brand) }));
  };

  const handleSelect = (user) => {
    selectUser(user);
    notify(`Editing ${user.name}'s access.`, 'info');
  };

  const handleSave = async () => {
    if (!selectedUser) return;

    const nextErrors = validateProfile(form);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length) return;

    const role = RBAC_ROLES.find((item) => item.id === form.roleId);

    setSaving(true);

    try {
      const updated = await updateUser(selectedUser.id, {
        name: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        roleId: form.roleId,
        role: role?.name ?? selectedUser.role,
        roleHint: role ? `${role.badge} • ${role.summary}` : selectedUser.roleHint,
        brands: form.brands,
        suspended: form.suspended,
      });

      setUsers((prev) =>
        prev.map((user) => (user.id === selectedUser.id ? { ...user, ...updated } : user)),
      );
      notify('User profile and role saved.');
    } catch (error) {
      notify(error.message || 'Could not save this user. Please try again.', 'danger');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (selectedUser) selectUser(selectedUser);
    notify('Changes discarded.', 'info');
  };

  const handleDeactivate = async () => {
    if (!deactivateTarget) return;

    setDeactivating(true);

    try {
      const updated = await deactivateUser(deactivateTarget.id, {
        reason: deactivationReason,
        reassignTo,
      });

      setUsers((prev) =>
        prev.map((user) => (user.id === deactivateTarget.id ? { ...user, ...updated } : user)),
      );
      setStats((prev) => ({
        ...prev,
        active: Math.max(0, prev.active - 1),
        suspended: prev.suspended + 1,
      }));
      notify(`${updated.name || deactivateTarget.name}'s account deactivated.`);
      setDeactivateTarget(null);
    } catch (error) {
      notify(error.message || 'Could not deactivate this account. Please try again.', 'danger');
    } finally {
      setDeactivating(false);
    }
  };

  const handleReactivate = async (user) => {
    setBusyUserId(user.id);

    try {
      const updated = await updateUser(user.id, {
        status: 'active',
        suspended: false,
        role: user.role.replace(' (Revoked)', ''),
        roleHint: 'Access restored • Role re-applied',
      });

      setUsers((prev) =>
        prev.map((item) => (item.id === user.id ? { ...item, ...updated } : item)),
      );
      setStats((prev) => ({
        ...prev,
        active: prev.active + 1,
        suspended: Math.max(0, prev.suspended - 1),
      }));
      notify(`${updated.name || user.name}'s account reactivated.`);
    } catch (error) {
      notify(error.message || 'Could not reactivate this account. Please try again.', 'danger');
    } finally {
      setBusyUserId(null);
    }
  };

  const openDeactivate = (user) => {
    setDeactivateTarget(user);
    setDeactivationReason(DEACTIVATION_REASONS[0]);
    setReassignTo(REASSIGN_TARGETS[0]);
  };

  return (
    <div className="page-screen" id="view-panel" role="tabpanel" aria-labelledby="view-tab-users">
      <div className="crumbs">
        <nav aria-label="Breadcrumb">
          <span>Workspace</span>
          <svg aria-hidden="true" className="icon">
            <use href="#i-chevron" />
          </svg>
          <span>Users &amp; Clients</span>
          <svg aria-hidden="true" className="icon">
            <use href="#i-chevron" />
          </svg>
          <strong>Edit User, Role &amp; Account</strong>
        </nav>

        {onOpenRoles && (
          <ViewTabs
            label="Users workspace"
            tabs={VIEW_TABS}
            activeId="users"
            onChange={(id) => {
              if (id === 'roles') onOpenRoles();
            }}
          />
        )}
      </div>

      <section className="page-head page-head--actions">
        <div>
          <div className="page-head__title-row">
            <h1 className="page-head__title">Manage User &amp; Role Access</h1>
            <span className="pill is-orange">Edit &amp; Governance Mode</span>
          </div>
          <p className="page-head__text">
            Add new members, modify user profile details, assign functional roles, or
            suspend/deactivate accounts.
          </p>
        </div>

        <div className="page-head__actions">
          <span className="seats-chip">
            Enterprise Seats: <b>{stats.total}</b> / 180
          </span>
          <button
            type="button"
            className="button button--primary"
            onClick={() => notify('New user invitation draft created.')}
          >
            <svg aria-hidden="true" className="icon">
              <use href="#i-plus" />
            </svg>
            Add User / Client
          </button>
        </div>
      </section>

      <div className="user-grid">
        {/* -------------------------------------------------- profile & role */}
        <section className="surface-card user-form" id="user-form">
          <header className="user-form__person">
            <span className={`dir-avatar dir-avatar--${headerUser.avatarTone}`}>
              {headerUser.initials}
            </span>
            <div className="user-form__identity">
              <div className="user-form__name">
                <strong>{headerUser.name}</strong>
                <span
                  className={`pill ${headerUser.status === 'active' ? 'is-green' : 'is-danger'}`}
                >
                  <i className="status-dot" />
                  {headerUser.status === 'active' ? 'Active Account' : 'Deactivated Account'}
                </span>
              </div>
              <span className="user-form__meta">
                {headerUser.email} • Added {headerUser.addedAt ?? 'Oct 12, 2026'}
              </span>
            </div>
            <span className="member-chip">
              Internal
              <br />
              Member
            </span>
          </header>

          <div className="user-form__fields">
            <label className={`set-field${errors.fullName ? ' is-invalid' : ''}`}>
              <span className="set-label">Full Name *</span>
              <input
                className="set-input"
                value={form.fullName}
                onChange={updateField('fullName')}
                autoComplete="name"
                aria-invalid={Boolean(errors.fullName)}
                aria-describedby={errors.fullName ? 'user-fullname-error' : undefined}
              />
              {errors.fullName && (
                <span className="set-error" id="user-fullname-error" role="alert">
                  {errors.fullName}
                </span>
              )}
            </label>

            <label className={`set-field${errors.email ? ' is-invalid' : ''}`}>
              <span className="set-label">Work Email *</span>
              <input
                className="set-input"
                type="email"
                value={form.email}
                onChange={updateField('email')}
                autoComplete="email"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? 'user-email-error' : undefined}
              />
              {errors.email && (
                <span className="set-error" id="user-email-error" role="alert">
                  {errors.email}
                </span>
              )}
            </label>

            <label className="set-field">
              <span className="set-label">Phone Number</span>
              <input
                className="set-input"
                value={form.phone}
                onChange={updateField('phone')}
                autoComplete="tel"
              />
            </label>
          </div>

          <div className="role-picker__head">
            <span className="caps">
              Assign Functional Role <span className="caps__ar">(تحديد الـ ROLE والصلاحيات)</span> *
            </span>
            <a
              className="link"
              href="#permissions"
              onClick={(e) => {
                e.preventDefault();
                onOpenRoles?.();
              }}
            >
              Auto-applies role permissions
            </a>
          </div>

          <div className="role-picker">
            {RBAC_ROLES.map((role) => {
              const isSelected = form.roleId === role.id;
              return (
                <button
                  key={role.id}
                  type="button"
                  className={`role-option role-option--${role.tone}${isSelected ? ' is-selected' : ''}`}
                  onClick={() => setForm((prev) => ({ ...prev, roleId: role.id }))}
                  aria-pressed={isSelected}
                >
                  {isSelected && (
                    <span className="role-option__check" aria-hidden="true">
                      <svg aria-hidden="true" className="icon" viewBox="0 0 24 24">
                        <path
                          d="M5 12.5l4.5 4.5L19 7.5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  )}
                  <span className="role-option__body">
                    <strong>{role.name}</strong>
                    <small>{role.summary}</small>
                  </span>
                  <span
                    className={`role-option__badge is-${role.tone}${isSelected ? ' is-selected' : ''}`}
                  >
                    {isSelected ? 'Selected' : role.badge}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="brand-row">
            <span className="brand-row__label">Brands:</span>
            {form.brands.map((brand) => (
              <span key={brand} className="brand-chip brand-chip--editable">
                {brand}
                <button
                  type="button"
                  aria-label={`Remove ${brand}`}
                  onClick={() => removeBrand(brand)}
                >
                  ×
                </button>
              </span>
            ))}
            <button
              type="button"
              className="brand-chip brand-chip--add"
              onClick={() => notify('Brand assignment picker opened.')}
            >
              <svg aria-hidden="true" className="icon">
                <use href="#i-plus" />
              </svg>
              Assign
            </button>
          </div>

          <footer className="user-form__foot">
            <button type="button" className="link" onClick={handleCancel}>
              Cancel
            </button>
            <button
              type="button"
              className="button button--primary"
              onClick={handleSave}
              disabled={!selectedUser || saving}
            >
              {saving ? 'Saving…' : 'Save User & Role'}
              <svg aria-hidden="true" className="icon">
                <use href="#i-arrow" />
              </svg>
            </button>
          </footer>
        </section>

        {/* ------------------------------------------------------- governance */}
        <section className="surface-card governance">
          <header className="governance__head">
            <span className="governance__icon">
              <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
                <circle
                  cx="12"
                  cy="12"
                  r="8.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <path d="M6.5 17.5l11-11" fill="none" stroke="currentColor" strokeWidth="1.8" />
              </svg>
            </span>
            <div className="governance__title">
              <h2 className="surface-card__title">Account Status &amp; Deactivation</h2>
              <p className="surface-card__sub">
                Freeze sessions, revoke access, or deactivate user account
              </p>
            </div>
            <span className="pill is-danger pill--caps">Governance</span>
          </header>

          <div className="governance__suspend">
            <div>
              <p className="governance__row-title">
                Temporarily Suspend Account <span className="caps__ar">(تجميد مؤقت)</span>
              </p>
              <p className="governance__row-sub">
                Blocks login &amp; revokes active tokens without deleting history
              </p>
            </div>
            <Switch
              checked={form.suspended}
              onChange={(value) => setForm((prev) => ({ ...prev, suspended: value }))}
              label="Temporarily suspend account"
            />
          </div>

          <div className="governance__selects">
            <label className="set-field">
              <span className="set-label">Deactivation Reason</span>
              <span className="set-select-wrap">
                <select
                  className="set-select"
                  value={deactivationReason}
                  onChange={(e) => setDeactivationReason(e.target.value)}
                >
                  {DEACTIVATION_REASONS.map((reason) => (
                    <option key={reason}>{reason}</option>
                  ))}
                </select>
                <svg aria-hidden="true" className="icon">
                  <use href="#i-chevron" />
                </svg>
              </span>
            </label>
            <label className="set-field">
              <span className="set-label">Reassign Deliverables To</span>
              <span className="set-select-wrap">
                <select
                  className="set-select"
                  value={reassignTo}
                  onChange={(e) => setReassignTo(e.target.value)}
                >
                  {REASSIGN_TARGETS.map((target) => (
                    <option key={target}>{target}</option>
                  ))}
                </select>
                <svg aria-hidden="true" className="icon">
                  <use href="#i-chevron" />
                </svg>
              </span>
            </label>
          </div>

          <div className="danger-zone">
            <div className="danger-zone__body">
              <strong>Deactivate Account &amp; Revoke Seat</strong>
              <p>Immediately frees 1 Enterprise Seat &amp; archives user work</p>
            </div>
            <button
              type="button"
              className="button button--danger"
              onClick={() => selectedUser && openDeactivate(selectedUser)}
              disabled={!selectedUser || selectedUser.status !== 'active'}
            >
              Deactivate User
            </button>
          </div>
        </section>
      </div>

      {/* --------------------------------------------------------- directory */}
      <section className="surface-card dir-card">
        <header className="dir-card__head">
          <div className="dir-card__heading">
            <h2 className="surface-card__title">Workspace Users &amp; Account Status Directory</h2>
            <div className="dir-card__counters">
              <span className="dir-counter">{stats.total} Total</span>
              <span className="dir-counter">{stats.suspended} Deactivated</span>
            </div>
          </div>

          <div className="dir-filters" role="tablist" aria-label="Filter users">
            <button
              type="button"
              className={`dir-filter${filter === 'all' ? ' is-active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All Users
            </button>
            <button
              type="button"
              className={`dir-filter${filter === 'active' ? ' is-active' : ''}`}
              onClick={() => setFilter('active')}
            >
              Active ({stats.active})
            </button>
            <button
              type="button"
              className={`dir-filter${filter === 'deactivated' ? ' is-active' : ''}`}
              onClick={() => setFilter('deactivated')}
            >
              Suspended / Deactivated ({stats.suspended})
            </button>
            <label className="dir-search">
              <input
                type="search"
                placeholder="Filter by name or email"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Filter users"
              />
              <svg aria-hidden="true" className="icon">
                <use href="#i-search" />
              </svg>
            </label>
          </div>
        </header>

        {loadError && (
          <p className="dir-empty">
            {loadError}{' '}
            <button type="button" className="link" onClick={loadDirectory}>
              Retry
            </button>
          </p>
        )}

        <div className="dir-scroll">
          <table className="dir-table">
            <thead>
              <tr>
                <th>User &amp; Email</th>
                <th>Type</th>
                <th>Assigned Role &amp; Permissions</th>
                <th>Assigned Brands</th>
                <th>Account Status</th>
                <th className="dir-table__actions-head">Manage / Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6}>
                    <p className="dir-empty">Loading directory…</p>
                  </td>
                </tr>
              ) : (
                visibleUsers.map((user) => (
                  <tr
                    key={user.id}
                    className={`${user.status === 'deactivated' ? 'is-muted' : ''}${
                      user.id === selectedId ? ' is-selected' : ''
                    }`}
                  >
                    <td>
                      <div className="dir-user">
                        <span className={`dir-avatar dir-avatar--${user.avatarTone}`}>
                          {user.initials}
                        </span>
                        <div>
                          <p className="dir-user__name">
                            {user.name}
                            {user.id === selectedId && (
                              <span className="dir-user__editing">(Editing)</span>
                            )}
                          </p>
                          <p className="dir-user__email">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`type-chip type-chip--${user.typeTone}`}>{user.type}</span>
                    </td>
                    <td>
                      <p className="dir-role">{user.role}</p>
                      <p className="dir-role__hint">{user.roleHint}</p>
                    </td>
                    <td>
                      <div className="dir-brands">
                        {user.brands.length ? (
                          user.brands.map((brand) => (
                            <span key={brand} className="brand-chip brand-chip--tiny">
                              {brand}
                            </span>
                          ))
                        ) : (
                          <span className="dir-brands__empty">No Active Brands</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <StatusPill status={user.status} />
                    </td>
                    <td>
                      <div className="dir-actions">
                        {user.status === 'active' ? (
                          <>
                            <button
                              type="button"
                              className="button button--ghost button--xs"
                              onClick={() => handleSelect(user)}
                            >
                              {user.id === selectedId ? 'Change Role' : 'Edit User'}
                            </button>
                            <button
                              type="button"
                              className="button button--danger-ghost button--xs"
                              onClick={() => openDeactivate(user)}
                            >
                              Deactivate
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            className="button button--success-ghost button--xs"
                            onClick={() => handleReactivate(user)}
                            disabled={busyUserId === user.id}
                          >
                            {busyUserId === user.id ? 'Reactivating…' : 'Reactivate Account'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {!loading && !visibleUsers.length && !loadError && (
            <p className="dir-empty">No users match this filter.</p>
          )}
        </div>
      </section>

      <InfoModal
        isOpen={Boolean(deactivateTarget)}
        onClose={() => {
          if (!deactivating) setDeactivateTarget(null);
        }}
        title="Deactivate account?"
        subtitle="Access is revoked immediately."
        icon="#i-shield"
        iconColor="danger"
        actionText={deactivating ? 'Deactivating…' : 'Deactivate account'}
        actionBusy={deactivating}
        actionDisabled={deactivating}
        closeOnAction={false}
        onAction={handleDeactivate}
      >
        <p className="modal-copy">
          <strong>{deactivateTarget?.name}</strong> will lose access, active sessions will be
          revoked, and their deliverables will be reassigned to <strong>{reassignTo}</strong>.
        </p>
        <p className="modal-copy modal-copy--muted">Reason: {deactivationReason}</p>
      </InfoModal>

      <Toast message={toast?.message} tone={toast?.tone} />
    </div>
  );
}
