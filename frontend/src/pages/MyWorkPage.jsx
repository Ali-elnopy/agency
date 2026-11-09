import React, { useState, useMemo } from 'react';
import { useSprint3 } from '../context/sprint3Store';
import { isTaskOverdue, formatDateTime, TASK_PRIORITIES } from '../data/tasksData';
import TaskDetailModal from '../components/tasks/TaskDetailModal';
import Toast from '../components/ui/Toast';
import useToast from '../hooks/useToast';

export default function MyWorkPage() {
  const { tasks = [], changeTaskStatus, role, t } = useSprint3();
  const { toast, showToast } = useToast(4000);

  const [activeTab, setActiveTab] = useState('today'); // 'today' | 'upcoming' | 'overdue' | 'high_priority' | 'revisions'
  const [activeTask, setActiveTask] = useState(null);

  // Consider tasks for employee (or all active creative tasks if testing/previewing)
  const employeeTasks = useMemo(() => {
    return tasks.filter((task) => {
      // In creative mode, or by default show Sarah Lin / employee assigned tasks
      return true;
    });
  }, [tasks]);

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  // Group calculations
  const overdueTasks = useMemo(() => {
    return employeeTasks.filter((t) => isTaskOverdue(t.deadline, t.status));
  }, [employeeTasks]);

  const todayTasks = useMemo(() => {
    return employeeTasks.filter((t) => {
      if (t.status === 'completed') return false;
      const due = new Date(t.deadline);
      return due >= startOfToday && due <= endOfToday;
    });
  }, [employeeTasks, startOfToday, endOfToday]);

  const upcomingTasks = useMemo(() => {
    return employeeTasks.filter((t) => {
      if (t.status === 'completed') return false;
      const due = new Date(t.deadline);
      return due > endOfToday;
    });
  }, [employeeTasks, endOfToday]);

  const highPriorityTasks = useMemo(() => {
    return employeeTasks.filter((t) => t.priority === 'high' && t.status !== 'completed');
  }, [employeeTasks]);

  const revisionTasks = useMemo(() => {
    return employeeTasks.filter((t) => Boolean(t.revisionNote) || t.returnedForRevision);
  }, [employeeTasks]);

  // Current list based on active tab
  const displayedTasks = useMemo(() => {
    switch (activeTab) {
      case 'today':
        return todayTasks.length > 0 ? todayTasks : employeeTasks.slice(0, 3);
      case 'upcoming':
        return upcomingTasks;
      case 'overdue':
        return overdueTasks;
      case 'high_priority':
        return highPriorityTasks;
      case 'revisions':
        return revisionTasks;
      default:
        return employeeTasks;
    }
  }, [activeTab, todayTasks, upcomingTasks, overdueTasks, highPriorityTasks, revisionTasks, employeeTasks]);

  const handleStartTask = (taskId) => {
    changeTaskStatus(taskId, 'in_progress');
    showToast(t('Task moved to In Progress 🚀'), 'info');
  };

  const handleSubmitForReview = (taskId) => {
    changeTaskStatus(taskId, 'in_review');
    showToast(t('Task submitted for review 📋'), 'success');
  };

  return (
    <div className="page-screen s3-page">
      <header className="page-head">
        <div>
          <span className="s3-eyebrow">{t('My Work')}</span>
          <h1 className="page-head__title">{t('My Work')}</h1>
          <p className="page-head__sub">
            {t('Personal workspace for executing assigned creative deliverables')}
          </p>
        </div>
      </header>

      {/* Quick Filter Tabs */}
      <div className="s3-tabs" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', borderBottom: '1px solid var(--line)', paddingBottom: 12 }}>
        <button
          type="button"
          className={`button button--sm ${activeTab === 'today' ? 'button--primary' : 'button--ghost'}`}
          onClick={() => setActiveTab('today')}
        >
          📅 {t("Today's Tasks")} ({todayTasks.length})
        </button>

        <button
          type="button"
          className={`button button--sm ${activeTab === 'upcoming' ? 'button--primary' : 'button--ghost'}`}
          onClick={() => setActiveTab('upcoming')}
        >
          ⏳ {t('Upcoming')} ({upcomingTasks.length})
        </button>

        <button
          type="button"
          className={`button button--sm ${activeTab === 'overdue' ? 'button--primary is-red' : 'button--ghost'}`}
          style={overdueTasks.length > 0 ? { borderColor: '#ef4444', color: activeTab === 'overdue' ? '#fff' : '#ef4444' } : {}}
          onClick={() => setActiveTab('overdue')}
        >
          ⚠️ {t('Overdue')} ({overdueTasks.length})
        </button>

        <button
          type="button"
          className={`button button--sm ${activeTab === 'high_priority' ? 'button--primary' : 'button--ghost'}`}
          onClick={() => setActiveTab('high_priority')}
        >
          🔥 {t('High Priority')} ({highPriorityTasks.length})
        </button>

        <button
          type="button"
          className={`button button--sm ${activeTab === 'revisions' ? 'button--primary' : 'button--ghost'}`}
          style={revisionTasks.length > 0 ? { borderColor: '#f59e0b', color: activeTab === 'revisions' ? '#fff' : '#d97706' } : {}}
          onClick={() => setActiveTab('revisions')}
        >
          ↩ {t('Returned with Revisions')} ({revisionTasks.length})
        </button>
      </div>

      {/* Task Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 16 }}>
        {displayedTasks.length === 0 ? (
          <div className="s3-card" style={{ padding: 48, textAlign: 'center', color: 'var(--faint)' }}>
            <h3>✓ {t('All clear!')}</h3>
            <p>{t('No tasks found under this filter.')}</p>
          </div>
        ) : (
          displayedTasks.map((task) => {
            const overdue = isTaskOverdue(task.deadline, task.status);
            const prio = TASK_PRIORITIES.find((p) => p.id === task.priority) || TASK_PRIORITIES[1];

            return (
              <div
                key={task.id}
                className="s3-card"
                style={{
                  border: overdue ? '2px solid #ef4444' : task.revisionNote ? '1.5px solid #f59e0b' : '1px solid var(--line)',
                  padding: 18,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  boxShadow: overdue ? '0 4px 14px rgba(239, 68, 68, 0.12)' : 'var(--shadow-sm)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span className="status-pill is-gray">{task.brandName}</span>
                    <span className={`status-pill ${prio.tone}`}>{t('Priority')}: {t(prio.label)}</span>
                    {overdue && (
                      <span className="status-pill is-red" style={{ fontWeight: 800 }}>
                        ⚠️ {t('Overdue')}
                      </span>
                    )}
                    {task.status === 'in_review' && (
                      <span className="status-pill is-amber">{t('In Review')}</span>
                    )}
                    {task.status === 'in_progress' && (
                      <span className="status-pill is-blue">{t('In Progress')}</span>
                    )}
                    {task.status === 'completed' && (
                      <span className="status-pill is-green">✓ {t('Completed')}</span>
                    )}
                  </div>

                  <div style={{ fontSize: 12.5, color: overdue ? '#dc2626' : 'var(--faint)', fontWeight: overdue ? 700 : 500 }}>
                    {t('Deadline')}: {formatDateTime(task.deadline)}
                  </div>
                </div>

                <div style={{ cursor: 'pointer' }} onClick={() => setActiveTask(task)}>
                  <h3 style={{ margin: '0 0 6px', fontSize: 16, color: 'var(--ink)' }}>
                    {task.title}
                  </h3>
                  <p style={{ margin: 0, fontSize: 13.5, color: 'var(--ink)', lineHeight: 1.55 }}>
                    {task.description}
                  </p>
                </div>

                {task.contentTitle && (
                  <span style={{ fontSize: 12, color: 'var(--purple)', display: 'inline-block' }}>
                    📌 {t('Associated Content Item')}: <strong>{task.contentTitle}</strong>
                  </span>
                )}

                {/* Prominent Manager Feedback Box if returned with revisions */}
                {task.revisionNote && (
                  <div style={{
                    background: 'rgba(245, 158, 11, 0.12)',
                    border: '1px solid rgba(245, 158, 11, 0.4)',
                    borderRadius: 8,
                    padding: '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                  }}>
                    <strong style={{ color: '#d97706', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                      ↩ {t('Manager Feedback:')}
                    </strong>
                    <p style={{ margin: 0, fontSize: 13.5, color: 'var(--ink)', fontWeight: 500 }}>
                      {task.revisionNote}
                    </p>
                  </div>
                )}

                {/* Action buttons */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1px solid var(--line)', flexWrap: 'wrap', gap: 10 }}>
                  <button
                    type="button"
                    className="button button--sm button--ghost"
                    onClick={() => setActiveTask(task)}
                  >
                    {t('Task Details')}
                  </button>

                  <div style={{ display: 'flex', gap: 8 }}>
                    {task.status === 'to_do' && (
                      <button
                        type="button"
                        className="button button--sm button--primary"
                        onClick={() => handleStartTask(task.id)}
                      >
                        🚀 {t('Start Task')}
                      </button>
                    )}

                    {task.status === 'in_progress' && (
                      <button
                        type="button"
                        className="button button--sm button--primary"
                        onClick={() => handleSubmitForReview(task.id)}
                      >
                        📋 {t('Submit for Review')}
                      </button>
                    )}

                    {task.status === 'in_review' && (
                      <span className="status-pill is-amber" style={{ padding: '6px 12px' }}>
                        ⏳ {t('Waiting for manager review')}
                      </span>
                    )}

                    {task.status === 'completed' && (
                      <span className="status-pill is-green" style={{ padding: '6px 12px' }}>
                        ✓ {t('Completed')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <TaskDetailModal
        task={activeTask}
        isOpen={Boolean(activeTask)}
        onClose={() => setActiveTask(null)}
        onUpdated={() => showToast(t('Task updated successfully!'), 'info')}
      />

      <Toast message={toast?.message} tone={toast?.tone} />
    </div>
  );
}
