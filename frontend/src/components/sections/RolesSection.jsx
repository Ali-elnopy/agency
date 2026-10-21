import React, { useState } from 'react';
import NewRoleModal from '../modals/NewRoleModal';
import InfoModal from '../modals/InfoModal';
import Toast from '../ui/Toast';
import useToast from '../../hooks/useToast';

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

export default function RolesSection({ onRoleCreated, onOpenMatrix }) {
  const [roles, setRoles] = useState(INITIAL_ROLES);
  const [isNewRoleOpen, setIsNewRoleOpen] = useState(false);
  const [isMatrixOpen, setIsMatrixOpen] = useState(false);
  const { toast, showToast } = useToast();

  const handleAddRole = (newRole) => {
    setRoles((prev) => [newRole, ...prev]);
    if (onRoleCreated) onRoleCreated(newRole);

    showToast(`Role "${newRole.title}" successfully created and active.`);
  };

  return (
    <>
      <article className="panel">
        <header className="panel__head">
          <div>
            <h2 className="panel__title">
              <span className="chip is-orange">
                <svg aria-hidden="true" className="icon">
                  <use href="#i-users" />
                </svg>
              </span>
              Roles &amp; Permissions
            </h2>
            <p className="panel__sub">
              Studio access matrix, governance levels &amp; member privileges.
            </p>
          </div>
          <button
            type="button"
            className="button button--primary button--sm"
            onClick={() => setIsNewRoleOpen(true)}
          >
            <svg aria-hidden="true" className="icon">
              <use href="#i-plus" />
            </svg>
            New Role
          </button>
        </header>

        <ul className="roles">
          {roles.map((role) => (
            <li key={role.id} className="role">
              <span className={`role__icon is-${role.color}`}>
                <svg aria-hidden="true" className="icon">
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
                <svg aria-hidden="true" className="icon">
                  <use href="#i-users" />
                </svg>
                {role.members}
              </span>
            </li>
          ))}
        </ul>

        <footer className="panel__foot">
          <span className="panel__foot-note">
            <svg aria-hidden="true" className="icon">
              <use href="#i-check" />
            </svg>
            ISO &amp; Role-based ICOM Sync Active
          </span>
          <a
            href="#matrix"
            className="link-action"
            onClick={(e) => {
              e.preventDefault();
              if (onOpenMatrix) onOpenMatrix();
              else setIsMatrixOpen(true);
            }}
          >
            Open Permissions Matrix{' '}
            <svg aria-hidden="true" className="icon">
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
        <div className="modal-stack">
          <p className="modal-copy modal-copy--muted">
            ORVIA employs granular Role-Based Access Control (RBAC). All actions are audit-logged
            and synced with ISO 27001 compliance standards.
          </p>

          <table className="modal-table">
            <thead>
              <tr>
                <th>Role</th>
                <th>Tier</th>
                <th>Publish</th>
                <th>Audit</th>
              </tr>
            </thead>
            <tbody>
              {roles.slice(0, 5).map((r) => (
                <tr key={r.id}>
                  <td className="is-role">{r.title}</td>
                  <td>
                    <span className={`pill is-${r.color} pill--compact`}>{r.badge}</span>
                  </td>
                  <td className="is-active">✓ Active</td>
                  <td className="is-synced">Synced</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </InfoModal>

      <Toast message={toast?.message} tone={toast?.tone} />
    </>
  );
}
