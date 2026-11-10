import React, { useState, useMemo } from 'react';
import { useSprint3 } from '../context/sprint3Store';
import { useBrands } from '../context/brandsStore';
import { isTaskOverdue, formatDateTime, TASK_STATUSES, TASK_PRIORITIES } from '../data/tasksData';
import NewTaskModal from '../components/tasks/NewTaskModal';
import TaskDetailModal from '../components/tasks/TaskDetailModal';
import Toast from '../components/ui/Toast';
import useToast from '../hooks/useToast';

export default function TasksPage() {
  const { tasks = [], campaigns = [], autoConvertContentToTasks, changeTaskStatus, t } = useSprint3();
  const { brands = [] } = useBrands();
  const { toast, showToast } = useToast(4000);

  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'table'
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [search, setSearch] = useState('');

  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [activeTask, setActiveTask] = useState(null);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (selectedBrand !== 'all' && task.brandId !== selectedBrand) return false;
      if (selectedPriority !== 'all' && task.priority !== selectedPriority) return false;
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchTitle = task.title?.toLowerCase().includes(query);
        const matchBrand = task.brandName?.toLowerCase().includes(query);
        const matchAssignee = task.assigneeName?.toLowerCase().includes(query);
        if (!matchTitle && !matchBrand && !matchAssignee) return false;
      }
      return true;
    });
  }, [tasks, selectedBrand, selectedPriority, search]);

  const handleConvertContent = () => {
    // Generate tasks from campaigns / items
    const sampleItems = [
      { id: 'ci-auto-1', title: 'Spring Product Reveal Video', platform: 'Instagram', format: 'Reels' },
      { id: 'ci-auto-2', title: 'Founder Manifesto on Sustainability', platform: 'LinkedIn', format: 'Article' },
      { id: 'ci-auto-3', title: 'Science Behind Automation Carousel', platform: 'LinkedIn', format: 'Carousel' },
      { id: 'ci-auto-4', title: 'Behind the Scenes Athlete Interview', platform: 'TikTok', format: 'Vertical Video' },
      { id: 'ci-auto-5', title: 'VIP Early Access Drop Announcement', platform: 'Instagram', format: 'Story Sequence' },
    ];
    const brand = brands[0] || { id: '1', name: 'Nike' };
    const count = autoConvertContentToTasks(sampleItems, brand.id, brand.name);
    if (count > 0) {
      showToast(`${count} ${t('Convert Content to Tasks')} ✓`, 'success');
    } else {
      showToast(t('All content items are already converted to tasks!'), 'info');
    }
  };

  return (
    <div className="page-screen s3-page">
      <header className="page-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <span className="s3-eyebrow">{t('Tasks Management')}</span>
          <h1 className="page-head__title">{t('Executive Tasks')}</h1>
          <p className="page-head__sub">
            {t('Manage, distribute and track creative execution across your team')}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            type="button"
            className="button button--ghost"
            onClick={handleConvertContent}
            title={t('Convert Content to Tasks')}
          >
            <svg aria-hidden="true" className="icon" width="16" height="16">
              <use href="#i-zap" />
            </svg>
            {t('Convert Content to Tasks')}
          </button>

          <button
            type="button"
            className="button button--primary"
            onClick={() => setIsNewTaskOpen(true)}
          >
            <svg aria-hidden="true" className="icon" width="16" height="16">
              <use href="#i-plus" />
            </svg>
            {t('New Task')}
          </button>
        </div>
      </header>

      {/* Control bar: Filters, Search, View switch */}
      <div className="s3-card" style={{ padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', flex: 1 }}>
          <div className="search-wrap" style={{ minWidth: 220, maxWidth: 320 }}>
            <input
              type="search"
              className="form-input"
              style={{ height: 36, paddingLeft: 32, paddingRight: 32 }}
              placeholder={t('Search tasks...')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="form-input"
            style={{ width: 'auto', height: 36, padding: '0 12px' }}
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
          >
            <option value="all">{t('All Brands')}</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>

          <select
            className="form-input"
            style={{ width: 'auto', height: 36, padding: '0 12px' }}
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
          >
            <option value="all">{t('All Priorities')}</option>
            {TASK_PRIORITIES.map((p) => (
              <option key={p.id} value={p.id}>{t(p.label)}</option>
            ))}
          </select>
        </div>

        {/* View Toggle */}
        <div style={{ display: 'inline-flex', background: 'var(--soft)', padding: 3, borderRadius: 8, border: '1px solid var(--line)' }}>
          <button
            type="button"
            className={`button button--sm ${viewMode === 'kanban' ? 'button--primary' : 'button--ghost'}`}
            style={{ height: 30, padding: '0 12px' }}
            onClick={() => setViewMode('kanban')}
          >
            {t('Kanban Board')}
          </button>
          <button
            type="button"
            className={`button button--sm ${viewMode === 'table' ? 'button--primary' : 'button--ghost'}`}
            style={{ height: 30, padding: '0 12px' }}
            onClick={() => setViewMode('table')}
          >
            {t('Table View')}
          </button>
        </div>
      </div>

      {/* Main View: Kanban or Table */}
      {viewMode === 'kanban' ? (
        <div className="tasks-kanban-board" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 16,
          alignItems: 'start',
        }}>
          {TASK_STATUSES.map((status) => {
            const columnTasks = filteredTasks.filter((t) => t.status === status.id);

            return (
              <div
                key={status.id}
                className="kanban-column"
                style={{
                  background: 'var(--card)',
                  borderRadius: 14,
                  border: '1px solid var(--line)',
                  padding: 14,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  minHeight: 450,
                }}
              >
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 10, borderBottom: '1px solid var(--line)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className={`status-pill ${status.tone}`} style={{ fontSize: 12 }}>
                      {t(status.label)}
                    </span>
                    <strong style={{ fontSize: 13, color: 'var(--ink)' }}>({columnTasks.length})</strong>
                  </div>
                </header>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {columnTasks.length === 0 ? (
                    <div style={{ padding: '24px 10px', textAlign: 'center', color: 'var(--faint)', fontSize: 13 }}>
                      {t('No tasks in this column')}
                    </div>
                  ) : (
                    columnTasks.map((task) => {
                      const overdue = isTaskOverdue(task.deadline, task.status);
                      const prio = TASK_PRIORITIES.find((p) => p.id === task.priority) || TASK_PRIORITIES[1];

                      return (
                        <div
                          key={task.id}
                          className="task-kanban-card"
                          onClick={() => setActiveTask(task)}
                          style={{
                            background: 'var(--surface)',
                            border: overdue ? '2px solid #ef4444' : '1px solid var(--line)',
                            borderRadius: 12,
                            padding: 14,
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 10,
                            boxShadow: overdue ? '0 4px 12px rgba(239, 68, 68, 0.15)' : 'var(--shadow-sm)',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                            <span className="status-pill is-gray" style={{ fontSize: 11, padding: '2px 8px' }}>
                              {t(task.brandName)}
                            </span>
                            <span className={`status-pill ${prio.tone}`} style={{ fontSize: 10, padding: '1px 6px' }}>
                              {t(prio.label)}
                            </span>
                          </div>

                          <strong style={{ fontSize: 14, color: 'var(--ink)', lineHeight: 1.4 }}>
                            {t(task.title)}
                          </strong>

                          {task.contentTitle && (
                            <span style={{ fontSize: 11, color: 'var(--purple)', display: 'inline-block' }}>
                              📌 {t(task.contentTitle)}
                            </span>
                          )}

                          {task.revisionNote && (
                            <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: 6, padding: '6px 8px', fontSize: 11.5, color: '#b45309' }}>
                              ↩ {t('Returned with Revisions')}
                            </div>
                          )}

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4, paddingTop: 8, borderTop: '1px solid var(--line)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span className="avatar avatar--sm avatar--accent" style={{ width: 22, height: 22, fontSize: 10 }}>
                                {task.assigneeAvatar}
                              </span>
                              <span style={{ fontSize: 11.5, color: 'var(--faint)' }}>{t(task.assigneeName)}</span>
                            </div>

                            <div style={{ textAlign: 'right' }}>
                              {overdue ? (
                                <span className="status-pill is-red" style={{ fontSize: 10, fontWeight: 700 }}>
                                  ⚠️ {t('Overdue')}
                                </span>
                              ) : (
                                <span style={{ fontSize: 11, color: 'var(--faint)' }}>
                                  {formatDateTime(task.deadline)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Data Table View */
        <div className="s3-card" style={{ padding: 0, overflowX: 'auto' }}>
          <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
            <thead>
              <tr style={{ background: 'var(--soft)', borderBottom: '1px solid var(--line)' }}>
                <th style={{ padding: '12px 16px', textAlign: 'inherit' }}>{t('Task Name')}</th>
                <th style={{ padding: '12px 16px', textAlign: 'inherit' }}>{t('Brand')}</th>
                <th style={{ padding: '12px 16px', textAlign: 'inherit' }}>{t('Assignee')}</th>
                <th style={{ padding: '12px 16px', textAlign: 'inherit' }}>{t('Priority')}</th>
                <th style={{ padding: '12px 16px', textAlign: 'inherit' }}>{t('Status')}</th>
                <th style={{ padding: '12px 16px', textAlign: 'inherit' }}>{t('Deadline')}</th>
                <th style={{ padding: '12px 16px', textAlign: 'inherit' }}>{t('Action')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: 32, textAlign: 'center', color: 'var(--faint)' }}>
                    {t('No tasks found')}
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => {
                  const overdue = isTaskOverdue(task.deadline, task.status);
                  const prio = TASK_PRIORITIES.find((p) => p.id === task.priority) || TASK_PRIORITIES[1];
                  const st = TASK_STATUSES.find((s) => s.id === task.status) || TASK_STATUSES[0];

                  return (
                    <tr
                      key={task.id}
                      onClick={() => setActiveTask(task)}
                      style={{ borderBottom: '1px solid var(--line)', cursor: 'pointer', transition: 'background 0.15s' }}
                    >
                      <td style={{ padding: '12px 16px' }}>
                        <strong style={{ display: 'block', color: 'var(--ink)' }}>{t(task.title)}</strong>
                        {task.contentTitle && <small style={{ color: 'var(--purple)' }}>📌 {t(task.contentTitle)}</small>}
                      </td>
                      <td style={{ padding: '12px 16px' }}>{t(task.brandName)}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span className="avatar avatar--sm avatar--accent" style={{ width: 22, height: 22, fontSize: 10 }}>
                            {task.assigneeAvatar}
                          </span>
                          <span>{t(task.assigneeName)}</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span className={`status-pill ${prio.tone}`}>{t(prio.label)}</span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span className={`status-pill ${st.tone}`}>{t(st.label)}</span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        {overdue ? (
                          <span className="status-pill is-red" style={{ fontWeight: 800 }}>
                            ⚠️ {t('Overdue')} ({formatDateTime(task.deadline)})
                          </span>
                        ) : (
                          <span>{formatDateTime(task.deadline)}</span>
                        )}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <button type="button" className="button button--sm button--ghost" onClick={(e) => { e.stopPropagation(); setActiveTask(task); }}>
                          {t('Task Details')}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      <NewTaskModal
        isOpen={isNewTaskOpen}
        onClose={() => setIsNewTaskOpen(false)}
        onCreated={() => showToast(t('Task created successfully!'), 'success')}
      />

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
