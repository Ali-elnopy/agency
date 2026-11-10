import React, { useState } from 'react';
import { useSprint3 } from '../../context/sprint3Store';
import { isTaskOverdue, formatDateTime, TASK_STATUSES, TASK_PRIORITIES } from '../../data/tasksData';

export default function TaskDetailModal({ task, isOpen, onClose, onUpdated }) {
  const { changeTaskStatus, deleteTask, t } = useSprint3();
  const [showRevisionInput, setShowRevisionInput] = useState(false);
  const [revisionNote, setRevisionNote] = useState('');
  const [error, setError] = useState('');

  if (!isOpen || !task) return null;

  const overdue = isTaskOverdue(task.deadline, task.status);
  const priorityObj = TASK_PRIORITIES.find((p) => p.id === task.priority) || TASK_PRIORITIES[1];
  const statusObj = TASK_STATUSES.find((s) => s.id === task.status) || TASK_STATUSES[0];

  const handleStatusChange = (nextStatus) => {
    changeTaskStatus(task.id, nextStatus);
    if (onUpdated) onUpdated();
    onClose();
  };

  const handleReturnRevisions = (e) => {
    e.preventDefault();
    if (!revisionNote.trim()) {
      setError(t('Why do you need changes? (required to request changes)'));
      return;
    }
    changeTaskStatus(task.id, 'to_do', revisionNote.trim());
    if (onUpdated) onUpdated();
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm(t('Are you sure you want to delete this task?'))) {
      deleteTask(task.id);
      if (onUpdated) onUpdated();
      onClose();
    }
  };

  return (
    <div className="s3-modal-backdrop" onClick={onClose}>
      <div className="s3-modal" style={{ maxWidth: 580 }} onClick={(e) => e.stopPropagation()}>
        <header className="s3-modal__head">
          <div className="s3-modal__title-group">
            <span className="s3-eyebrow">{t('Task Details')} · {t(task.brandName)}</span>
            <h2>{t(task.title)}</h2>
          </div>
          <button type="button" className="s3-modal-close" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" aria-hidden="true" width="18" height="18">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </header>

        <div className="s3-modal__body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Status, Priority & Overdue Badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span className={`status-pill ${statusObj.tone}`}>
              {t(statusObj.label)}
            </span>
            <span className={`status-pill ${priorityObj.tone}`}>
              {t('Priority')}: {t(priorityObj.label)}
            </span>
            {overdue && (
              <span className="status-pill is-red" style={{ fontWeight: 800 }}>
                ⚠️ {t('Overdue')}
              </span>
            )}
          </div>

          {/* Overdue alert banner */}
          {overdue && (
            <div className="task-overdue-banner" style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#dc2626',
              padding: '10px 14px',
              borderRadius: 8,
              fontSize: 13,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              <strong style={{ fontSize: 16 }}>⚠️</strong>
              <div>
                <strong>{t('Task deadline has passed!')}</strong>
                <div>{t('Scheduled deadline')}: {formatDateTime(task.deadline)}</div>
              </div>
            </div>
          )}

          {/* Revision feedback banner if present */}
          {task.revisionNote && (
            <div style={{
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              padding: '12px 14px',
              borderRadius: 8,
            }}>
              <strong style={{ color: '#d97706', display: 'block', marginBottom: 4 }}>
                {t('Manager Feedback:')}
              </strong>
              <p style={{ margin: 0, fontSize: 13.5, color: 'var(--ink)' }}>
                {t(task.revisionNote)}
              </p>
            </div>
          )}

          {/* Description */}
          <div>
            <strong style={{ display: 'block', fontSize: 12, textTransform: 'uppercase', color: 'var(--faint)', marginBottom: 4 }}>
              {t('Description')}
            </strong>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: 'var(--ink)' }}>
              {t(task.description) || t('No description provided.')}
            </p>
          </div>

          {/* Meta grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, background: 'var(--soft)', padding: 14, borderRadius: 10 }}>
            <div>
              <span style={{ display: 'block', fontSize: 11, color: 'var(--faint)' }}>{t('Assignee')}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <span className="avatar avatar--sm avatar--accent" style={{ width: 26, height: 26, fontSize: 11 }}>
                  {task.assigneeAvatar}
                </span>
                <div>
                  <strong style={{ fontSize: 13 }}>{t(task.assigneeName)}</strong>
                  <div style={{ fontSize: 11, color: 'var(--faint)' }}>{t(task.assigneeRole)}</div>
                </div>
              </div>
            </div>

            <div>
              <span style={{ display: 'block', fontSize: 11, color: 'var(--faint)' }}>{t('Deadline')}</span>
              <strong style={{ fontSize: 13, display: 'block', marginTop: 6, color: overdue ? '#dc2626' : 'var(--ink)' }}>
                {formatDateTime(task.deadline)}
              </strong>
            </div>

            {task.contentTitle && (
              <div style={{ gridColumn: 'span 2' }}>
                <span style={{ display: 'block', fontSize: 11, color: 'var(--faint)' }}>{t('Associated Content Item')}</span>
                <span className="status-pill is-purple" style={{ marginTop: 4, display: 'inline-block' }}>
                  📌 {t(task.contentTitle)}
                </span>
              </div>
            )}
          </div>

          {/* Interactive Status Actions */}
          <div style={{ borderTop: '1px solid var(--line)', paddingTop: 14 }}>
            <strong style={{ display: 'block', fontSize: 12, color: 'var(--faint)', marginBottom: 10 }}>
              {t('Move status')}
            </strong>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {task.status !== 'to_do' && (
                <button
                  type="button"
                  className="button button--ghost"
                  onClick={() => handleStatusChange('to_do')}
                >
                  {t('To Do')}
                </button>
              )}

              {task.status !== 'in_progress' && (
                <button
                  type="button"
                  className="button button--ghost"
                  onClick={() => handleStatusChange('in_progress')}
                >
                  🚀 {t('Start Task')}
                </button>
              )}

              {task.status !== 'in_review' && (
                <button
                  type="button"
                  className="button button--ghost"
                  onClick={() => handleStatusChange('in_review')}
                >
                  📋 {t('Submit for Review')}
                </button>
              )}

              {task.status !== 'completed' && (
                <button
                  type="button"
                  className="button button--primary"
                  onClick={() => handleStatusChange('completed')}
                >
                  ✓ {t('Mark Completed')}
                </button>
              )}

              <button
                type="button"
                className="button button--danger-ghost"
                onClick={() => setShowRevisionInput(!showRevisionInput)}
              >
                ↩ {t('Return with Revisions')}
              </button>
            </div>

            {showRevisionInput && (
              <form onSubmit={handleReturnRevisions} style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {error && <span className="form__error">{error}</span>}
                <textarea
                  className="form-textarea"
                  rows={2}
                  value={revisionNote}
                  onChange={(e) => { setRevisionNote(e.target.value); setError(''); }}
                  placeholder={t('Explain requested changes to the creator (required)...')}
                  required
                />
                <button type="submit" className="button button--danger-ghost" style={{ alignSelf: 'flex-start' }}>
                  {t('Confirm & Return')}
                </button>
              </form>
            )}
          </div>
        </div>

        <footer className="s3-modal__foot" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button type="button" className="button button--danger-ghost" onClick={handleDelete}>
            {t('Delete')}
          </button>
          <button type="button" className="button button--ghost" onClick={onClose}>
            {t('Close')}
          </button>
        </footer>
      </div>
    </div>
  );
}
