import React, { useState } from 'react';
import Toast from '../components/ui/Toast';
import { PERMISSION_GROUPS, RBAC_ROLES } from '../data/rbac';

/* ------------------------------------------------------------------ cells */

function PermissionCell({ value }) {
  if (value === 'allow') {
    return (
      <span className="perm-cell">
        <span className="perm-check">
          <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </span>
    );
  }

  if (!value) {
    return (
      <span className="perm-cell">
        <span className="perm-check perm-check--empty" aria-hidden="true" />
      </span>
    );
  }

  return (
    <span className="perm-cell">
      <span className={`perm-tag perm-tag--${value.tone}`}>{value.label}</span>
    </span>
  );
}

/* ------------------------------------------------------------------ page */

export default function RolesPermissionsPage({ onOpenUsers }) {
  const [activeRole, setActiveRole] = useState('creator');
  const [toast, setToast] = useState('');

  const notify = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 3500);
  };

  return (
    <div className="page-screen">
      <div className="crumbs">
        <nav aria-label="Breadcrumb">
          <span>Workspace</span>
          <svg className="icon">
            <use href="#i-chevron" />
          </svg>
          <span>Admin Governance</span>
          <svg className="icon">
            <use href="#i-chevron" />
          </svg>
          <strong>Roles &amp; Permissions</strong>
        </nav>

        {onOpenUsers && (
          <div className="view-switch" role="tablist" aria-label="Users workspace">
            <button type="button" className="view-switch__item" onClick={onOpenUsers}>
              Users Directory
            </button>
            <button type="button" className="view-switch__item is-active" aria-selected="true">
              Roles &amp; Permissions
            </button>
          </div>
        )}
      </div>

      <section className="page-head page-head--actions">
        <div>
          <div className="page-head__title-row">
            <h1 className="page-head__title">Roles &amp; Permissions</h1>
            <span className="pill is-orange">RBAC Engine v3.4</span>
            <span className="pill is-green">
              <i className="status-dot" />
              SCIM Sync Active
            </span>
          </div>
          <p className="page-head__text">
            Configure and enforce granular module permissions according to each user&apos;s job function across all 24 brands.
          </p>
        </div>

        <div className="page-head__actions">
          <button type="button" className="button button--ghost" onClick={() => notify('Role defaults restored.')}>
            Reset Role Defaults
          </button>
          <button type="button" className="button button--primary" onClick={() => notify('Permissions applied and pushed to 148 sessions.')}>
            Apply &amp; Enforce Permissions
            <svg className="icon">
              <use href="#i-arrow" />
            </svg>
          </button>
        </div>
      </section>

      {/* Role selector */}
      <section className="rbac-roles" aria-label="Workspace roles">
        {RBAC_ROLES.map((role) => (
          <button
            key={role.id}
            type="button"
            className={`rbac-card rbac-card--${role.tone}${activeRole === role.id ? ' is-selected' : ''}`}
            onClick={() => setActiveRole(role.id)}
            aria-pressed={activeRole === role.id}
          >
            <span className="rbac-card__top">
              <span className="rbac-card__badge">{role.badge}</span>
              <span className="rbac-card__members">{role.members}</span>
            </span>
            <strong className="rbac-card__name">{role.name}</strong>
            <span className="rbac-card__summary">{role.summary}</span>
          </button>
        ))}
      </section>

      {/* Matrix */}
      <section className="surface-card perm-card">
        <header className="surface-card__head">
          <div>
            <h2 className="surface-card__title">Granular Permission Matrix</h2>
            <p className="surface-card__sub">
              Capability-level access control synced across agency workspaces, client portals, and digital assets.
            </p>
          </div>
          <span className="perm-card__legend">
            <i className="perm-card__legend-dot" />
            Live policy
          </span>
        </header>

        <div className="perm-scroll">
          <div className="perm-table" role="table" aria-label="Permission matrix">
            <div className="perm-row perm-row--head" role="row">
              <span className="perm-cap perm-cap--head" role="columnheader">
                Capability / Functional Permission
              </span>
              {RBAC_ROLES.map((role) => (
                <span
                  key={role.id}
                  role="columnheader"
                  className={`perm-role${activeRole === role.id ? ' is-active' : ''}`}
                >
                  {role.name}
                </span>
              ))}
            </div>

            {PERMISSION_GROUPS.map((group) => (
              <React.Fragment key={group.id}>
                <div className="perm-section" role="row">
                  <span className="perm-section__title">
                    {group.index}. {group.title}
                  </span>
                  <span className="perm-section__ar">({group.subtitle})</span>
                </div>

                {group.capabilities.map((capability) => (
                  <div key={capability.id} className="perm-row" role="row">
                    <div className="perm-cap" role="cell">
                      <strong>{capability.name}</strong>
                      <small>{capability.hint}</small>
                    </div>
                    {RBAC_ROLES.map((role) => (
                      <span
                        key={role.id}
                        role="cell"
                        className={`perm-col${activeRole === role.id ? ' is-active' : ''}`}
                      >
                        <PermissionCell value={capability.permissions[role.id]} />
                      </span>
                    ))}
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>

        <footer className="perm-card__foot">
          <span className="perm-card__version">v3.4</span>
          <span className="perm-card__sync">
            <i className="perm-card__legend-dot" />
            SSO &amp; Role-Based SCIM Sync Active: permission updates propagate to all 148 active user sessions in
            <b> &lt;200ms</b>
          </span>
          <span className="perm-card__updated">Last updated by Elena V. • Today 15:08</span>
        </footer>
      </section>

      <Toast message={toast} />
    </div>
  );
}
