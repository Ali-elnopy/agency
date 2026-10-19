import React, { useState } from 'react';
import NewRoleModal from './modals/NewRoleModal';
import InfoModal from './modals/InfoModal';

const INITIAL_ROLES = [
  {
    id: 'lead',
    title: 'Studio Lead & Admin',
    badge: 'Full Control',
    color: 'orange',
    icon: '#i-target',
    text: 'Total governance, budgets, client tenancy, system API keys.',
    tags: ['All Workspaces', 'Approve & Publish', 'Audit Log'],
    members: '4 Members',
  },
  {
    id: 'director',
    title: 'Art Director',
    badge: 'Review & Approve',
    color: 'purple',
    icon: '#i-eye',
    text: 'Asset approval flows, brand guide compliance & asset planning.',
    tags: ['Brand Assets', 'Stage Gate Sign-off'],
    members: '18 Members',
  },
  {
    id: 'creator',
    title: 'Creator & Copywriter',
    badge: 'Edit & Draft',
    color: 'green',
    icon: '#i-file',
    text: 'Draft creation, copy generation, canvas updates & revisions.',
    tags: ['Assignments', 'Submit for Review'],
    members: '44 Members',
  },
  {
    id: 'client',
    title: 'Client Reviewer',
    badge: 'External Sign-off',
    color: 'gray',
    icon: '#i-users',
    text: 'External portal view, feedback markup, final approval & sign-off.',
    tags: ['Client Portal Only', 'Approvals Access'],
    members: '9 Members',
  },
];

export default function RolesSection({ onRoleCreated }) {
  const [roles, setRoles] = useState(INITIAL_ROLES);
  const [isNewRoleOpen, setIsNewRoleOpen] = useState(false);
  const [isMatrixOpen, setIsMatrixOpen] = useState(false);
  const [toast, setToast] = useState('');

  const handleAddRole = (newRole) => {
    setRoles((prev) => [newRole, ...prev]);
    if (onRoleCreated) onRoleCreated(newRole);

    setToast(`Role "${newRole.title}" successfully created and active.`);
    setTimeout(() => {
      setToast('');
    }, 4000);
  };

  return (
    <>
      <article className="panel">
        <header className="panel__head">
          <div>
            <h2 className="panel__title">
              <span className="chip is-orange">
                <svg className="icon">
                  <use href="#i-users" />
                </svg>
              </span>
              Roles &amp; Permissions
            </h2>
            <p className="panel__sub">Studio access matrix, governance levels &amp; member privileges.</p>
          </div>
          <button
            type="button"
            className="button button--primary button--sm"
            onClick={() => setIsNewRoleOpen(true)}
          >
            <svg className="icon">
              <use href="#i-plus" />
            </svg>
            New Role
          </button>
        </header>

        <ul className="roles">
          {roles.map((role) => (
            <li key={role.id} className="role">
              <span className={`role__icon is-${role.color}`}>
                <svg className="icon">
                  <use href={role.icon} />
                </svg>
              </span>
              <div className="role__body">
                <div className="role__top">
                  <strong>{role.title}</strong>
                  <span className={`pill is-${role.color}`}>{role.badge}</span>
                </div>
                <p className="role__text">{role.text}</p>
                <p className="role__tags">
                  {role.tags.map((tag, i) => (
                    <span key={i}>{tag}</span>
                  ))}
                </p>
              </div>
              <span className="role__count">
                <svg className="icon">
                  <use href="#i-users" />
                </svg>
                {role.members}
              </span>
            </li>
          ))}
        </ul>

        <footer className="panel__foot">
          <span className="panel__foot-note">
            <svg className="icon">
              <use href="#i-check" />
            </svg>
            ISO &amp; Role-based ICOM Sync Active
          </span>
          <a
            href="#matrix"
            className="link-action"
            onClick={(e) => {
              e.preventDefault();
              setIsMatrixOpen(true);
            }}
          >
            Open Permissions Matrix{' '}
            <svg className="icon">
              <use href="#i-arrow" />
            </svg>
          </a>
        </footer>
      </article>

      {/* New Role Creation Modal */}
      <NewRoleModal
        isOpen={isNewRoleOpen}
        onClose={() => setIsNewRoleOpen(false)}
        onAddRole={handleAddRole}
      />

      {/* Permissions Matrix Detail Modal */}
      <InfoModal
        isOpen={isMatrixOpen}
        onClose={() => setIsMatrixOpen(false)}
        title="Permissions Matrix (RBAC)"
        subtitle="Current policy mapping across agency workspace tiers."
        icon="#i-target"
        iconColor="orange"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <p style={{ color: 'var(--muted)', fontSize: '13px' }}>
            ORVIA employs granular Role-Based Access Control (RBAC). All actions are audit-logged and synced with ISO 27001 compliance standards.
          </p>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', marginTop: '6px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--line)', textAlign: 'left', color: 'var(--label)' }}>
                <th style={{ padding: '8px 4px' }}>Role</th>
                <th style={{ padding: '8px 4px' }}>Tier</th>
                <th style={{ padding: '8px 4px' }}>Publish</th>
                <th style={{ padding: '8px 4px' }}>Audit</th>
              </tr>
            </thead>
            <tbody>
              {roles.slice(0, 5).map((r) => (
                <tr key={r.id} style={{ borderBottom: '1px solid var(--line)' }}>
                  <td style={{ padding: '8px 4px', fontWeight: 600 }}>{r.title}</td>
                  <td style={{ padding: '8px 4px' }}>
                    <span className={`pill is-${r.color}`} style={{ fontSize: '10px', padding: '2px 6px' }}>
                      {r.badge}
                    </span>
                  </td>
                  <td style={{ padding: '8px 4px', color: 'var(--green)' }}>✓ Active</td>
                  <td style={{ padding: '8px 4px', color: 'var(--muted)' }}>Synced</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </InfoModal>

      {/* Floating Toast Notification */}
      {toast && (
        <div className="toast-notice">
          <span className="toast-icon chip is-green">
            <svg className="icon" viewBox="0 0 24 24" width="14" height="14">
              <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="2.5" />
            </svg>
          </span>
          <span>{toast}</span>
        </div>
      )}
    </>
  );
}
