import React, { useEffect, useState } from 'react';
import ConfirmModal from '../components/modals/ConfirmModal';
import Toast from '../components/ui/Toast';
import useToast from '../hooks/useToast';
import { useWorkspace } from '../context/workspaceStore';
import { useSprint3 } from '../context/sprint3Store';
import {
  ACCESS_LEVELS,
  ACCESS_LEVEL_BY_ID,
  PERMISSION_OPTIONS,
  permissionsForAccess,
} from '../data/workspace';
import { getJobTitles } from '../services/users';
import { isOtherJobTitle, jobTitleOptions, OTHER_JOB_TITLE } from '../data/jobTitles';

function emptyForm(user) {
  const currentTitle = user?.jobTitle ?? '';

  return {
    fullName: user?.fullName ?? '',
    jobTitle: user?.systemAccess === 'admin' ? '' : currentTitle,
    customJobTitle: '',
    systemAccess: user?.systemAccess ?? 'employee',
    teamId: user?.teamId ?? '',
    teamIds: Array.isArray(user?.teamIds) && user.teamIds.length
      ? [...user.teamIds]
      : user?.teamId
        ? [user.teamId]
        : [],
    active: user?.active !== false,
    permissions: [...(user?.permissions ?? [])],
  };
}

export default function UserAccessPage({ onAddUser, onAddMemberViaTeam, initialQuery }) {
  const { t } = useSprint3();
  const { users, teams, updateUser, deleteUser } = useWorkspace();
  const [editingId, setEditingId] = useState(null);
  const [availableJobTitles, setAvailableJobTitles] = useState([]);
  const [form, setForm] = useState(emptyForm());
  const [errors, setErrors] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [query, setQuery] = useState('');
  const { toast, showToast } = useToast(3500);

  const jobTitleChoices = jobTitleOptions(
    availableJobTitles,
    isOtherJobTitle(form.jobTitle) ? '' : form.jobTitle,
  );

  useEffect(() => {
    getJobTitles()
      .then((titles) => setAvailableJobTitles(Array.isArray(titles) ? titles : []))
      .catch(() => {});
  }, []);

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

  const userTeamNames = (targetUser) => {
    const ids = Array.isArray(targetUser?.teamIds) && targetUser.teamIds.length
      ? targetUser.teamIds
      : targetUser?.teamId
        ? [targetUser.teamId]
        : [];
    if (!ids.length) return t('Not assigned');
    return ids
      .map((id) => teams.find((team) => String(team.id) === String(id))?.name)
      .filter(Boolean)
      .map(t)
      .join(', ');
  };

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

  const updateJobTitle = (event) => {
    const value = event.target.value;

    setForm((prev) => ({
      ...prev,
      jobTitle: value,
      customJobTitle: isOtherJobTitle(value) ? prev.customJobTitle : '',
    }));
    setErrors((prev) => ({ ...prev, jobTitle: undefined, customJobTitle: undefined }));
  };

  const updateAccess = (event) => {
    const systemAccess = event.target.value;

    setForm((prev) => ({
      ...prev,
      systemAccess,
      jobTitle: systemAccess === 'admin' ? '' : prev.jobTitle,
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

    const isAdmin = form.systemAccess === 'admin';
    if (!isAdmin && !form.jobTitle) {
      nextErrors.jobTitle = 'Job title is required.';
    } else if (!isAdmin && isOtherJobTitle(form.jobTitle) && !form.customJobTitle.trim()) {
      nextErrors.customJobTitle = 'Enter the job title.';
    }

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    try {
      const resolvedJobTitle = isAdmin
        ? ''
        : isOtherJobTitle(form.jobTitle)
          ? form.customJobTitle.trim()
          : form.jobTitle.trim();

      await updateUser(editingId, {
        fullName: form.fullName.trim(),
        jobTitle: resolvedJobTitle,
        systemAccess: form.systemAccess,
        teamId: (form.teamIds && form.teamIds[0]) || (form.teamId ? form.teamId : null),
        teamIds: form.teamIds && form.teamIds.length ? form.teamIds : form.teamId ? [form.teamId] : [],
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
          <h1 className="ws-page-title">{t('Users')}</h1>
          <p className="ws-page-sub">{t('Edit roles, permissions and account status.')}</p>
        </div>

        <button
          type="button"
          className="ws-btn ws-btn--primary"
          onClick={onAddUser || onAddMemberViaTeam}
        >
          <svg aria-hidden="true" className="icon">
            <use href="#i-plus" />
          </svg>
          {t('Add User')} +
        </button>
      </section>

      <div className="ws-kpis">
        <article className="ws-kpi">
          <span className="ws-kpi__label">{t('Users')}</span>
          <strong className="ws-kpi__value">{total}</strong>
        </article>
        <article className="ws-kpi">
          <span className="ws-kpi__label">{t('Active')}</span>
          <strong className="ws-kpi__value">{active}</strong>
        </article>
        <article className="ws-kpi">
          <span className="ws-kpi__label">{t('Inactive')}</span>
          <strong className="ws-kpi__value">{inactive}</strong>
        </article>
      </div>

      {needle && (
        <div className="ws-filter-note">
          <span>
            {t('Showing matches for')} <strong>{query}</strong>
          </span>
          <button type="button" className="ws-link" onClick={() => setQuery('')}>
            {t('Clear')}
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
                      <strong className="ws-user-name">{t(user.fullName)}</strong>
                      <span
                        className={`ws-badge ${user.active ? 'ws-badge--active' : 'ws-badge--inactive'}`}
                      >
                        {user.active ? t('Active') : t('Inactive')}
                      </span>
                      <span className="ws-badge ws-badge--role">{t(access.short)}</span>
                    </div>
                    <p className="ws-user-meta">
                      {user.systemAccess === 'admin'
                        ? user.email
                        : `${user.jobTitle ? `${t(user.jobTitle)} • ` : ''}${user.email}`}
                    </p>
                    <p className="ws-user-team">{t('Teams')}: {userTeamNames(user)}</p>
                  </div>

                  <div className="ws-row-actions">
                    <button type="button" className="ws-btn ws-btn--ghost" onClick={closeEditor}>
                      {t('Close')}
                    </button>
                    <button
                      type="button"
                      className="ws-btn ws-btn--danger-ghost"
                      onClick={() => setDeleteTarget(user)}
                    >
                      {t('Delete')}
                    </button>
                  </div>
                </div>

                <div className="ws-editor">
                  <div className="ws-form-grid">
                    <label className={`ws-field${errors.fullName ? ' is-invalid' : ''}`}>
                      <span>{t('Full Name')}</span>
                      <input
                        className="ws-input"
                        value={form.fullName}
                        onChange={updateField('fullName')}
                        autoComplete="name"
                      />
                      {errors.fullName && <small className="ws-error">{errors.fullName}</small>}
                    </label>

                    {form.systemAccess !== 'admin' && (
                      <label
                        className={`ws-field${
                          errors.jobTitle || errors.customJobTitle ? ' is-invalid' : ''
                        }`}
                      >
                        <span>{t('Job Title')}</span>
                        <span className="ws-select-wrap">
                          <select
                            className="ws-select"
                            value={form.jobTitle}
                            onChange={updateJobTitle}
                          >
                            <option value="">{t('Select a job title')}</option>
                            {jobTitleChoices.map((item) => (
                              <option key={item.id} value={item.name}>
                                {item.name}
                              </option>
                            ))}
                            <option value={OTHER_JOB_TITLE}>{t('Other')}</option>
                          </select>
                          <svg aria-hidden="true" className="icon">
                            <use href="#i-chevron" />
                          </svg>
                        </span>
                        {isOtherJobTitle(form.jobTitle) && (
                          <input
                            className="ws-input"
                            placeholder={t('Enter the job title')}
                            value={form.customJobTitle}
                            onChange={updateField('customJobTitle')}
                          />
                        )}
                        {errors.jobTitle && <small className="ws-error">{errors.jobTitle}</small>}
                        {errors.customJobTitle && (
                          <small className="ws-error">{errors.customJobTitle}</small>
                        )}
                      </label>
                    )}
                  </div>

                  <div className="ws-access-row">
                    <label className="ws-field">
                      <span>{t('Access Level')}</span>
                      <span className="ws-select-wrap">
                        <select
                          className="ws-select"
                          value={form.systemAccess}
                          onChange={updateAccess}
                        >
                          {ACCESS_LEVELS.map((level) => (
                            <option key={level.id} value={level.id}>
                              {t(level.label)}
                            </option>
                          ))}
                        </select>
                        <svg aria-hidden="true" className="icon">
                          <use href="#i-chevron" />
                        </svg>
                      </span>
                    </label>

                    <div className="ws-field" style={{ gridColumn: 'span 2' }}>
                      <span style={{ fontWeight: 600, fontSize: '13px', marginBottom: '6px', display: 'block' }}>
                        {t('Assigned Teams')}
                      </span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {teams.map((team) => {
                          const isMember = (form.teamIds || (form.teamId ? [form.teamId] : [])).map(String).includes(String(team.id));
                          return (
                            <label
                              key={team.id}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                fontSize: '12.5px',
                                cursor: 'pointer',
                                padding: '5px 12px',
                                borderRadius: '8px',
                                background: isMember ? 'rgba(242, 106, 61, 0.12)' : '#f8f9fa',
                                color: isMember ? '#f26a3d' : '#334155',
                                border: `1px solid ${isMember ? '#f26a3d' : '#e2e8f0'}`,
                                fontWeight: isMember ? '600' : '400',
                                transition: 'all 0.15s ease',
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={isMember}
                                onChange={(e) => {
                                  const current = (form.teamIds || (form.teamId ? [form.teamId] : [])).map(String);
                                  const updated = e.target.checked
                                    ? Array.from(new Set([...current, String(team.id)]))
                                    : current.filter((id) => id !== String(team.id));
                                  setForm((prev) => ({
                                    ...prev,
                                    teamId: updated[0] || '',
                                    teamIds: updated,
                                  }));
                                }}
                              />
                              {t(team.name)}
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    <label className="ws-inline-check">
                      <input
                        type="checkbox"
                        checked={form.active}
                        onChange={updateField('active')}
                      />
                      {t('Active account')}
                    </label>
                  </div>

                  <fieldset className="ws-permissions">
                    <legend>{t('Work Permissions')}</legend>
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
                            <span>{t(permission.shortLabel ?? permission.label)}</span>
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>

                  <p className="ws-permission-note">
                    {t(form.systemAccess === 'admin'
                      ? 'Admin always receives all permissions across the entire workspace.'
                      : form.systemAccess === 'team_leader'
                        ? 'Team Leader has full management and review access over their assigned team.'
                        : form.systemAccess === 'account_manager'
                          ? 'Account Manager receives Review + Publish permissions.'
                          : 'Configure individual work permissions for this team member.')}
                  </p>

                  <footer className="ws-editor__foot">
                    <button type="button" className="ws-btn ws-btn--primary" onClick={saveUser}>
                      {t('Save User')}
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
                    <strong className="ws-user-name">{t(user.fullName)}</strong>
                    <span
                      className={`ws-badge ${user.active ? 'ws-badge--active' : 'ws-badge--inactive'}`}
                    >
                      {user.active ? t('Active') : t('Inactive')}
                    </span>
                    <span className="ws-badge ws-badge--role">{t(access.short)}</span>
                  </div>
                  <p className="ws-user-meta">
                    {user.systemAccess === 'admin'
                      ? user.email
                      : `${user.jobTitle ? `${t(user.jobTitle)} • ` : ''}${user.email}`}
                  </p>
                  <p className="ws-user-team">{t('Teams')}: {userTeamNames(user)}</p>
                </div>

                <div className="ws-row-actions">
                  <button type="button" className="ws-btn ws-btn--ghost" onClick={() => openEditor(user)}>
                    {t('Edit User')}
                  </button>
                  <button
                    type="button"
                    className="ws-btn ws-btn--danger-ghost"
                    onClick={() => setDeleteTarget(user)}
                  >
                    {t('Delete')}
                  </button>
                </div>
              </div>
            </article>
          );
        })}

        {!visibleUsers.length && (
          <div className="ws-empty">
            <strong>{t('No users found.')}</strong>
            <p>{t('Try a different name or email.')}</p>
          </div>
        )}
      </section>

      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title={t('Delete user?')}
        subtitle={t('This action cannot be undone.')}
        icon="#i-trash"
        confirmText={t('Delete User')}
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
