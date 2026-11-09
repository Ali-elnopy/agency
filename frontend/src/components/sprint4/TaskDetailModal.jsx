import React, { useState } from 'react';
import { useSprint3 } from '../../context/sprint3Store';
import { isTaskOverdue, TASK_PRIORITIES } from '../../data/sprintWorkflow';

export default function TaskDetailModal({ task, isOpen, onClose }) {
  const {
    role,
    changeTaskStatus,
    submitTaskForReview,
    approveTaskInternal,
    requestTaskRevisions,
    t,
  } = useSprint3();

  const [creatorNote, setCreatorNote] = useState('');
  const [managerNote, setManagerNote] = useState('');
  const [revisionsNote, setRevisionsNote] = useState('');
  const [showRevisionForm, setShowRevisionForm] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !task) return null;

  const overdue = isTaskOverdue(task);
  const isManager = role === 'admin' || role === 'account_manager';
  const isCreative = role === 'creative';

  const handleStartTask = () => {
    changeTaskStatus(task.id, 'in_progress', 'Creator started active work.');
    onClose();
  };

  const handleSubmitReview = (e) => {
    e.preventDefault();
    submitTaskForReview(task.id, creatorNote);
    onClose();
  };

  const handleApprove = () => {
    approveTaskInternal(task.id, managerNote || 'Internal review passed.');
    onClose();
  };

  const handleRequestRevisions = (e) => {
    e.preventDefault();
    if (!revisionsNote.trim()) {
      setErrorMsg(t('Revision Notes (Required)'));
      return;
    }
    requestTaskRevisions(task.id, revisionsNote.trim());
    onClose();
  };

  return (
    <div className="s3-modal-backdrop" onClick={onClose}>
      <div
        className="s3-modal s3-modal--wide task-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
      >
        <header className="s3-modal__head">
          <div className="task-modal__head-meta">
            <span className="cl-label">{t(task.brandName)}</span>
            <div className="task-modal__badges">
              <span className={`pill is-${task.status === 'completed' ? 'green' : task.status === 'in_review' ? 'purple' : task.status === 'in_progress' ? 'amber' : 'gray'}`}>
                {t(task.status === 'todo' ? 'To Do' : task.status === 'in_progress' ? 'In Progress' : task.status === 'in_review' ? 'In Review' : 'Completed')}
              </span>
              <span className={`pill is-${task.priority === 'high' ? 'red' : task.priority === 'medium' ? 'amber' : 'blue'}`}>
                {t('Priority')}: {t(task.priority === 'high' ? 'High' : task.priority === 'medium' ? 'Medium' : 'Low')}
              </span>
              {overdue ? (
                <span className="pill is-red task-badge-overdue">
                  <svg aria-hidden="true" className="icon"><use href="#i-clock" /></svg>
                  {t('Overdue')}
                </span>
              ) : null}
              {task.revisionsRequired ? (
                <span className="pill is-red">
                  {t('Returned with Revisions')}
                </span>
              ) : null}
            </div>
          </div>
          <button type="button" className="s3-modal__close" onClick={onClose}>✕</button>
        </header>

        <div className="task-modal__body">
          <div className="task-modal__main">
            <h2 className="task-modal__title">{t(task.title)}</h2>
            <p className="task-modal__desc">{task.description}</p>

            {task.revisionsRequired && task.revisionsNote ? (
              <div className="task-modal__revisions-box">
                <span className="task-modal__revisions-tag">
                  <svg aria-hidden="true" className="icon"><use href="#i-alert" /></svg>
                  {t('Manager Feedback')}
                </span>
                <p>{task.revisionsNote}</p>
              </div>
            ) : null}

            <div className="task-modal__properties">
              <div className="task-prop">
                <span className="task-prop__label">{t('Assigned To')}</span>
                <div className="task-prop__user">
                  <span className="cl-avatar cl-avatar--orange">{task.assigneeAvatar || 'SL'}</span>
                  <div>
                    <strong>{t(task.assigneeName)}</strong>
                    <small>{t(task.assigneeRole || 'Content Specialist')}</small>
                  </div>
                </div>
              </div>

              <div className="task-prop">
                <span className="task-prop__label">{t('Deadline')}</span>
                <span className={`task-prop__val ${overdue ? 'is-danger' : ''}`}>
                  {task.deadline || '—'} {overdue ? `(${t('Overdue')})` : ''}
                </span>
              </div>

              <div className="task-prop">
                <span className="task-prop__label">{t('Linked Content Item')}</span>
                <span className="task-prop__val">{task.contentTitle || task.title}</span>
              </div>
            </div>

            {/* Action Section based on status and role */}
            <div className="task-modal__action-area">
              {task.status === 'todo' ? (
                <button
                  type="button"
                  className="button button--primary"
                  onClick={handleStartTask}
                >
                  <svg aria-hidden="true" className="icon"><use href="#i-zap" /></svg>
                  {t('Start Task')}
                </button>
              ) : null}

              {task.status === 'in_progress' ? (
                <form onSubmit={handleSubmitReview} className="task-modal__submit-box">
                  <label className="task-modal__form-label">{t('Submit for Review')}</label>
                  <textarea
                    className="s3-input"
                    rows={3}
                    placeholder={t('Explain what the creator needs to change…')}
                    value={creatorNote}
                    onChange={(e) => setCreatorNote(e.target.value)}
                  />
                  <button type="submit" className="button button--primary">
                    <svg aria-hidden="true" className="icon"><use href="#i-send" /></svg>
                    {t('Submit for Review')}
                  </button>
                </form>
              ) : null}

              {task.status === 'in_review' && isManager ? (
                <div className="task-modal__review-controls">
                  <div className="task-modal__review-buttons">
                    <button
                      type="button"
                      className="button button--primary"
                      onClick={handleApprove}
                    >
                      <svg aria-hidden="true" className="icon"><use href="#i-check" /></svg>
                      {t('Approve & Complete')}
                    </button>
                    <button
                      type="button"
                      className="button button--ghost task-btn-revisions"
                      onClick={() => setShowRevisionForm(!showRevisionForm)}
                    >
                      <svg aria-hidden="true" className="icon"><use href="#i-alert" /></svg>
                      {t('Request Revisions')}
                    </button>
                  </div>

                  {showRevisionForm ? (
                    <form onSubmit={handleRequestRevisions} className="task-modal__revisions-form">
                      {errorMsg ? <div className="s3-alert is-red">{errorMsg}</div> : null}
                      <label className="task-modal__form-label">{t('Revision Notes (Required)')}</label>
                      <textarea
                        className="s3-input"
                        rows={3}
                        required
                        placeholder={t('Explain what the creator needs to change…')}
                        value={revisionsNote}
                        onChange={(e) => {
                          setRevisionsNote(e.target.value);
                          setErrorMsg('');
                        }}
                      />
                      <button type="submit" className="button button--primary is-danger">
                        {t('Request Revisions')}
                      </button>
                    </form>
                  ) : null}
                </div>
              ) : null}

              {task.status === 'completed' ? (
                <div className="task-modal__completed-banner">
                  <svg aria-hidden="true" className="icon"><use href="#i-check" /></svg>
                  <span>{t('Task approved and completed')}</span>
                </div>
              ) : null}
            </div>
          </div>

          {/* Audit Trail Sidebar */}
          <aside className="task-modal__audit-rail">
            <h3 className="task-audit__title">
              <svg aria-hidden="true" className="icon"><use href="#i-clock" /></svg>
              {t('Audit Trail & History')}
            </h3>

            <div className="task-audit__list">
              {(task.auditTrail || []).map((audit) => (
                <div key={audit.id} className="task-audit__item">
                  <div className="task-audit__dot" />
                  <div className="task-audit__content">
                    <div className="task-audit__head">
                      <strong>{t(audit.action)}</strong>
                      <span className="task-audit__time">{audit.timestamp}</span>
                    </div>
                    <span className="task-audit__author">
                      {t(audit.author)} · {t(audit.authorRole)}
                    </span>
                    {audit.note ? <p className="task-audit__note">{audit.note}</p> : null}
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
