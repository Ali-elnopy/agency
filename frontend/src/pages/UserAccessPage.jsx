import React, { useState } from 'react';
import Switch from '../components/ui/Switch';
import Toast from '../components/ui/Toast';
import { RBAC_ROLES } from '../data/rbac';
import {
  DEACTIVATION_REASONS,
  DIRECTORY_STATS,
  DIRECTORY_USERS,
  REASSIGN_TARGETS,
} from '../data/users';

/* --------------------------------------------------------------- helpers */

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

/* ------------------------------------------------------------------ page */

export default function UserAccessPage({ onOpenRoles }) {
  const [selectedRole, setSelectedRole] = useState('creator');
  const [brands, setBrands] = useState(['Aura Mobility', 'Kinetic Health']);
  const [suspended, setSuspended] = useState(true);
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [toast, setToast] = useState('');

  const notify = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 3500);
  };

  const removeBrand = (brand) => setBrands((prev) => prev.filter((item) => item !== brand));

  const visibleUsers = DIRECTORY_USERS.filter((user) => {
    const matchesFilter =
      filter === 'all' || (filter === 'active' ? user.status === 'active' : user.status !== 'active');
    const term = query.trim().toLowerCase();
    const matchesQuery =
      !term || user.name.toLowerCase().includes(term) || user.email.toLowerCase().includes(term);
    return matchesFilter && matchesQuery;
  });

  return (
    <div className="page-screen">
      <div className="crumbs">
        <nav aria-label="Breadcrumb">
          <span>Workspace</span>
          <svg className="icon">
            <use href="#i-chevron" />
          </svg>
          <span>Users &amp; Clients</span>
          <svg className="icon">
            <use href="#i-chevron" />
          </svg>
          <strong>Edit User, Role &amp; Account</strong>
        </nav>

        {onOpenRoles && (
          <div className="view-switch" role="tablist" aria-label="Users workspace">
            <button type="button" className="view-switch__item is-active" aria-selected="true">
              Users Directory
            </button>
            <button type="button" className="view-switch__item" onClick={onOpenRoles}>
              Roles &amp; Permissions
            </button>
          </div>
        )}
      </div>

      <section className="page-head page-head--actions">
        <div>
          <div className="page-head__title-row">
            <h1 className="page-head__title">Manage User &amp; Role Access</h1>
            <span className="pill is-orange">Edit &amp; Governance Mode</span>
          </div>
          <p className="page-head__text">
            Add new members, modify user profile details, assign functional roles, or suspend/deactivate accounts.
          </p>
        </div>

        <div className="page-head__actions">
          <span className="seats-chip">
            Enterprise Seats: <b>{DIRECTORY_STATS.total}</b> / 180
          </span>
          <button type="button" className="button button--primary" onClick={() => notify('New user invitation draft created.')}>
            <svg className="icon">
              <use href="#i-plus" />
            </svg>
            Add User / Client
          </button>
        </div>
      </section>

      <div className="user-grid">
        {/* -------------------------------------------------- profile & role */}
        <section className="surface-card user-form">
          <header className="user-form__person">
            <span className="dir-avatar dir-avatar--orange">SL</span>
            <div className="user-form__identity">
              <div className="user-form__name">
                <strong>Sarah Lin</strong>
                <span className="pill is-green">
                  <i className="status-dot" />
                  Active Account
                </span>
              </div>
              <span className="user-form__meta">s.lin@orvia-creative.com • Added Oct 12, 2026</span>
            </div>
            <span className="member-chip">
              Internal
              <br />
              Member
            </span>
          </header>

          <div className="user-form__fields">
            <label className="set-field">
              <span className="set-label">Full Name *</span>
              <input className="set-input" defaultValue="Sarah Lin" />
            </label>
            <label className="set-field">
              <span className="set-label">Work Email *</span>
              <input className="set-input" type="email" defaultValue="s.lin@orvia-creative.com" />
            </label>
            <label className="set-field">
              <span className="set-label">Phone Number</span>
              <input className="set-input" defaultValue="+1 (555) 349-8120" />
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
              const isSelected = selectedRole === role.id;
              return (
                <button
                  key={role.id}
                  type="button"
                  className={`role-option role-option--${role.tone}${isSelected ? ' is-selected' : ''}`}
                  onClick={() => setSelectedRole(role.id)}
                  aria-pressed={isSelected}
                >
                  {isSelected && (
                    <span className="role-option__check" aria-hidden="true">
                      <svg className="icon" viewBox="0 0 24 24">
                        <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  )}
                  <span className="role-option__body">
                    <strong>{role.name}</strong>
                    <small>{role.summary}</small>
                  </span>
                  <span className={`role-option__badge is-${role.tone}${isSelected ? ' is-selected' : ''}`}>
                    {isSelected ? 'Selected' : role.badge}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="brand-row">
            <span className="brand-row__label">Brands:</span>
            {brands.map((brand) => (
              <span key={brand} className="brand-chip brand-chip--editable">
                {brand}
                <button type="button" aria-label={`Remove ${brand}`} onClick={() => removeBrand(brand)}>
                  ×
                </button>
              </span>
            ))}
            <button type="button" className="brand-chip brand-chip--add" onClick={() => notify('Brand assignment picker opened.')}>
              <svg className="icon">
                <use href="#i-plus" />
              </svg>
              Assign
            </button>
          </div>

          <footer className="user-form__foot">
            <button type="button" className="link" onClick={() => notify('Changes discarded.')}>
              Cancel
            </button>
            <button type="button" className="button button--primary" onClick={() => notify('User profile and role saved.')}>
              Save User &amp; Role
              <svg className="icon">
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
                <circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
                <path d="M6.5 17.5l11-11" fill="none" stroke="currentColor" strokeWidth="1.8" />
              </svg>
            </span>
            <div className="governance__title">
              <h2 className="surface-card__title">Account Status &amp; Deactivation</h2>
              <p className="surface-card__sub">Freeze sessions, revoke access, or deactivate user account</p>
            </div>
            <span className="pill is-danger pill--caps">Governance</span>
          </header>

          <div className="governance__suspend">
            <div>
              <p className="governance__row-title">
                Temporarily Suspend Account <span className="caps__ar">(تجميد مؤقت)</span>
              </p>
              <p className="governance__row-sub">Blocks login &amp; revokes active tokens without deleting history</p>
            </div>
            <Switch checked={suspended} onChange={setSuspended} label="Temporarily suspend account" />
          </div>

          <div className="governance__selects">
            <label className="set-field">
              <span className="set-label">Deactivation Reason</span>
              <span className="set-select-wrap">
                <select className="set-select" defaultValue={DEACTIVATION_REASONS[0]}>
                  {DEACTIVATION_REASONS.map((reason) => (
                    <option key={reason}>{reason}</option>
                  ))}
                </select>
                <svg className="icon">
                  <use href="#i-chevron" />
                </svg>
              </span>
            </label>
            <label className="set-field">
              <span className="set-label">Reassign Deliverables To</span>
              <span className="set-select-wrap">
                <select className="set-select" defaultValue={REASSIGN_TARGETS[0]}>
                  {REASSIGN_TARGETS.map((target) => (
                    <option key={target}>{target}</option>
                  ))}
                </select>
                <svg className="icon">
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
            <button type="button" className="button button--danger" onClick={() => notify('Account deactivation requires a second admin approval.')}>
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
              <span className="dir-counter">
                {DIRECTORY_STATS.total} Total
              </span>
              <span className="dir-counter">
                {DIRECTORY_STATS.suspended} Deactivated
              </span>
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
              Active ({DIRECTORY_STATS.active})
            </button>
            <button
              type="button"
              className={`dir-filter${filter === 'deactivated' ? ' is-active' : ''}`}
              onClick={() => setFilter('deactivated')}
            >
              Suspended / Deactivated ({DIRECTORY_STATS.suspended})
            </button>
            <label className="dir-search">
              <input
                type="search"
                placeholder="Filter by name or email"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Filter users"
              />
              <svg className="icon">
                <use href="#i-search" />
              </svg>
            </label>
          </div>
        </header>

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
              {visibleUsers.map((user) => (
                <tr key={user.id} className={user.status === 'deactivated' ? 'is-muted' : user.editing ? 'is-editing' : ''}>
                  <td>
                    <div className="dir-user">
                      <span className={`dir-avatar dir-avatar--${user.avatarTone}`}>{user.initials}</span>
                      <div>
                        <p className="dir-user__name">
                          {user.name}
                          {user.editing && <span className="dir-user__editing">(Editing)</span>}
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
                            onClick={() => notify(`Editing ${user.name}'s access…`)}
                          >
                            {user.editing ? 'Change Role' : 'Edit User'}
                          </button>
                          <button
                            type="button"
                            className="button button--danger-ghost button--xs"
                            onClick={() => notify(`${user.name}'s account will be deactivated.`)}
                          >
                            Deactivate
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          className="button button--success-ghost button--xs"
                          onClick={() => notify(`${user.name}'s account reactivated.`)}
                        >
                          Reactivate Account
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!visibleUsers.length && (
            <p className="dir-empty">No users match this filter.</p>
          )}
        </div>
      </section>

      <Toast message={toast} />
    </div>
  );
}
