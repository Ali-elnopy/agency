import React, { useEffect, useState } from 'react';
import ConfirmModal from '../components/modals/ConfirmModal';
import Toast from '../components/ui/Toast';
import useToast from '../hooks/useToast';
import { useWorkspace } from '../context/workspaceStore';
import {
  ACCESS_LEVELS,
  ACCESS_LEVEL_BY_ID,
  PERMISSION_OPTIONS,
  permissionsForAccess,
} from '../data/workspace';

function emptyForm(user) {
  return {
    fullName: user?.fullName ?? '',
    jobTitle: user?.jobTitle ?? '',
    systemAccess: user?.systemAccess ?? 'employee',
    active: user?.active !== false,
    permissions: [...(user?.permissions ?? [])],
  };
}

export default function UserAccessPage({ onAddMemberViaTeam, initialQuery }) {
  const { users, teams, updateUser, deleteUser } = useWorkspace();
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [errors, setErrors] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [query, setQuery] = useState('');
  const { toast, showToast } = useToast(3500);

  useEffect(() => {
    setQuery(initialQuery?.query ?? '');
  }, [initialQuery]);

  const total = users.length;
  const active = users.filter((user) => user.active).length;
  const inactive = total - active;

  const needle = query.trim().toLowerCase();
  const visibleUsers = users.filter((user) => {
    if (!needle) return true;

    return `${user.fullName} ${user.email} ${user.jobTitle}`.toLowerCase().includes(needle);
  });

  const teamName = (teamId) => teams.find((team) => team.id === teamId)?.name ?? 'Not assigned';

  const openEditor = (user) => {
    setEditingId(user.id);
    setForm(emptyForm(user));
    setErrors({});
  };

  const closeEditor = () => {
    setEditingId(null);
    setErrors({});
  };

  const updateField = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;

    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const updateAccess = (event) => {
    const systemAccess = event.target.value;

    setForm((prev) => ({
      ...prev,
      systemAccess,
      permissions: permissionsForAccess(systemAccess, prev.permissions),
    }));
  };

  const togglePermission = (permissionId) => {
    if (form.systemAccess !== 'employee') return;

    setForm((prev) => {
      const selected = prev.permissions.includes(permissionId);

      return {
        ...prev,
        permissions: selected
          ? prev.permissions.filter((permission) => permission !== permissionId)
          : [...prev.permissions, permissionId],
      };
    });
  };

  const saveUser = async () => {
    const nextErrors = {};

    if (!form.fullName.trim()) nextErrors.fullName = 'Full name is required.';
    if (!form.jobTitle.trim()) nextErrors.jobTitle = 'Job title is required.';

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    try {
      await updateUser(editingId, {
        fullName: form.fullName,
        jobTitle: form.jobTitle,
        systemAccess: form.systemAccess,
        permissions: permissionsForAccess(form.systemAccess, form.permissions),
        active: form.active,
      });

      setEditingId(null);
      showToast('User updated successfully.');
    } catch (error) {
      showToast(error.message || 'Could not update this user.', 'danger');
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      await deleteUser(deleteTarget.id);

      if (editingId === deleteTarget.id) setEditingId(null);
      showToast('User deleted.');
    } catch (error) {
      showToast(error.message || 'Could not delete this user.', 'danger');
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="ws-page">
      <section className="ws-page-head">
        <div>
          <h1 className="ws-page-title">Users</h1>
          <p className="ws-page-sub">Edit roles, permissions and account status.</p>
        </div>

        <button type="button" className="ws-btn ws-btn--primary" onClick={onAddMemberViaTeam}>
          <svg aria-hidden="true" className="icon">
            <use href="#i-plus" />
          </svg>
          Create Member via Team
        </button>
      </section>

      <div className="ws-kpis">
        <article className="ws-kpi">
          <span className="ws-kpi__label">Users</span>
          <strong className="ws-kpi__value">{total}</strong>
        </article>
        <article className="ws-kpi">
          <span className="ws-kpi__label">Active</span>
          <strong className="ws-kpi__value">{active}</strong>
        </article>
        <article className="ws-kpi">
          <span className="ws-kpi__label">Inactive</span>
          <strong className="ws-kpi__value">{inactive}</strong>
        </article>
      </div>

      {needle && (
        <div className="ws-filter-note">
          <span>
            Showing matches for <strong>{query}</strong>
          </span>
          <button type="button" className="ws-link" onClick={() => setQuery('')}>
            Clear
          </button>
        </div>
      )}

      <section className="ws-user-list">
        {visibleUsers.map((user) => {
          const isEditing = editingId === user.id;
          const access = ACCESS_LEVEL_BY_ID[user.systemAccess] ?? ACCESS_LEVEL_BY_ID.employee;

          if (isEditing) {
            return (
              <article className="ws-user-row ws-user-row--editing" key={user.id}>
                <div className="ws-user-row__main">
                  <div>
                    <div className="ws-name-line">
                      <strong className="ws-user-name">{user.fullName}</strong>
                      <span
                        className={`ws-badge ${user.active ? 'ws-badge--active' : 'ws-badge--inactive'}`}
                      >
                        {user.active ? 'Active' : 'Inactive'}
                      </span>
                      <span className="ws-badge ws-badge--role">{access.short}</span>
                    </div>
                    <p className="ws-user-meta">
                      {user.jobTitle} • {user.email}
                    </p>
                    <p className="ws-user-team">Team: {teamName(user.teamId)}</p>
                  </div>

                  <div className="ws-row-actions">
                    <button type="button" className="ws-btn ws-btn--ghost" onClick={closeEditor}>
                      Close
                    </button>
                    <button
                      type="button"
                      className="ws-btn ws-btn--danger-ghost"
                      onClick={() => setDeleteTarget(user)}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="ws-editor">
                  <div className="ws-form-grid">
                    <label className={`ws-field${errors.fullName ? ' is-invalid' : ''}`}>
                      <span>Full Name</span>
                      <input
                        className="ws-input"
                        value={form.fullName}
                        onChange={updateField('fullName')}
                        autoComplete="name"
                      />
                      {errors.fullName && <small className="ws-error">{errors.fullName}</small>}
                    </label>

                    <label className={`ws-field${errors.jobTitle ? ' is-invalid' : ''}`}>
                      <span>Job Title</span>
                      <input
                        className="ws-input"
                        value={form.jobTitle}
                        onChange={updateField('jobTitle')}
                      />
                      {errors.jobTitle && <small className="ws-error">{errors.jobTitle}</small>}
                    </label>
                  </div>

                  <div className="ws-access-row">
                    <label className="ws-field">
                      <span>Access Level</span>
                      <span className="ws-select-wrap">
                        <select
                          className="ws-select"
                          value={form.systemAccess}
                          onChange={updateAccess}
                        >
                          {ACCESS_LEVELS.map((level) => (
                            <option key={level.id} value={level.id}>
                              {level.label}
                            </option>
                          ))}
                        </select>
                        <svg aria-hidden="true" className="icon">
                          <use href="#i-chevron" />
                        </svg>
                      </span>
                    </label>

                    <label className="ws-inline-check">
                      <input
                        type="checkbox"
                        checked={form.active}
                        onChange={updateField('active')}
                      />
                      Active account
                    </label>
                  </div>

                  <fieldset className="ws-permissions">
                    <legend>Work Permissions</legend>
                    <div className="ws-permission-grid">
                      {PERMISSION_OPTIONS.map((permission) => {
                        const checked = form.permissions.includes(permission.id);
                        const locked = form.systemAccess !== 'employee';

                        return (
                          <label
                            className={`ws-permission${locked ? ' is-locked' : ''}`}
                            key={permission.id}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => togglePermission(permission.id)}
                              disabled={locked}
                            />
                            <span>{permission.shortLabel ?? permission.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>

                  <p className="ws-permission-note">
                    Admin always receives all permissions. Account Manager always receives Review +
                    Publish.
                  </p>

                  <footer className="ws-editor__foot">
                    <button type="button" className="ws-btn ws-btn--primary" onClick={saveUser}>
                      Save User
                    </button>
                  </footer>
                </div>
              </article>
            );
          }

          return (
            <article className="ws-user-row" key={user.id}>
              <div className="ws-user-row__main">
                <div>
                  <div className="ws-name-line">
                    <strong className="ws-user-name">{user.fullName}</strong>
                    <span
                      className={`ws-badge ${user.active ? 'ws-badge--active' : 'ws-badge--inactive'}`}
                    >
                      {user.active ? 'Active' : 'Inactive'}
                    </span>
                    <span className="ws-badge ws-badge--role">{access.short}</span>
                  </div>
                  <p className="ws-user-meta">
                    {user.jobTitle} • {user.email}
                  </p>
                  <p className="ws-user-team">Team: {teamName(user.teamId)}</p>
                </div>

                <div className="ws-row-actions">
                  <button type="button" className="ws-btn ws-btn--ghost" onClick={() => openEditor(user)}>
                    Edit User
                  </button>
                  <button
                    type="button"
                    className="ws-btn ws-btn--danger-ghost"
                    onClick={() => setDeleteTarget(user)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </article>
          );
        })}

        {!visibleUsers.length && (
          <div className="ws-empty">
            <strong>No users found.</strong>
            <p>Try a different name or email.</p>
          </div>
        )}
      </section>

      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete user?"
        subtitle="This action cannot be undone."
        icon="#i-trash"
        confirmText="Delete User"
        onConfirm={confirmDelete}
      >
        <p className="ws-modal-copy">
          <strong>{deleteTarget?.fullName}</strong> will be removed from the workspace and
          unassigned from their team.
        </p>
      </ConfirmModal>

      <Toast message={toast?.message} tone={toast?.tone} />
    </div>
  );
}
