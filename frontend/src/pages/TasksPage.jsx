import React, { useMemo, useState } from 'react';
import { useSprint3 } from '../context/sprint3Store';
import { useBrands } from '../context/brandsStore';
import { isTaskOverdue, TASK_STATUSES } from '../data/sprintWorkflow';
import { PageHeader, EmptyState } from '../components/sprint3/Sprint3UI';
import TaskDetailModal from '../components/sprint4/TaskDetailModal';
import NewTaskModal from '../components/sprint4/NewTaskModal';

export default function TasksPage() {
  const { tasks, changeTaskStatus, autoConvertContentToTasks, t } = useSprint3();
  const { brands } = useBrands();

  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'table'
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTask, setActiveTask] = useState(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Filtering
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (selectedBrand !== 'all' && String(task.brandId) !== String(selectedBrand)) return false;
      if (selectedPriority !== 'all' && task.priority !== selectedPriority) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = (task.title || '').toLowerCase().includes(query);
        const matchBrand = (task.brandName || '').toLowerCase().includes(query);
        const matchAssignee = (task.assigneeName || '').toLowerCase().includes(query);
        if (!matchTitle && !matchBrand && !matchAssignee) return false;
      }
      return true;
    });
  }, [tasks, selectedBrand, selectedPriority, searchQuery]);

  const overdueCount = useMemo(() => {
    return filteredTasks.filter(isTaskOverdue).length;
  }, [filteredTasks]);

  const handleConvert = () => {
    const mockContentItems = [
      { id: 'ci-gen-1', title: 'Summer Workout Tips Carousel', caption: 'High value retention content' },
      { id: 'ci-gen-2', title: 'Behind the Scenes Motion Clip', caption: 'Production floor footage' },
      { id: 'ci-gen-3', title: 'Customer Transformation Reel', caption: 'User generated spotlight' },
    ];
    const brand = brands.find((b) => String(b.id) === String(selectedBrand)) || brands[0];
    const count = autoConvertContentToTasks(mockContentItems, brand?.id, brand?.name);
    setToastMessage(`${t('Tasks generated from Content Plan')}: ${count}`);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, statusId) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      changeTaskStatus(taskId, statusId, `Moved via Kanban board to ${statusId}`);
    }
  };

  return (
    <div className="page-screen tasks-page">
      <PageHeader
        eyebrow={t('Execution & Review')}
        title={t('Tasks Management')}
        description={t('Track, assign, and review content execution across Kanban and table workflows.')}
        actions={
          <div className="s3-actions-row">
            <button
              type="button"
              className="button button--ghost"
              onClick={handleConvert}
              title={t('Generate from Content Plan')}
            >
              <svg aria-hidden="true" className="icon"><use href="#i-zap" /></svg>
              {t('Generate from Content Plan')}
            </button>
            <button
              type="button"
              className="button button--primary"
              onClick={() => setShowNewModal(true)}
            >
              <svg aria-hidden="true" className="icon"><use href="#i-plus" /></svg>
              {t('New Task')}
            </button>
          </div>
        }
      />

      {toastMessage ? (
        <div className="s3-alert is-green tasks-toast">
          <svg aria-hidden="true" className="icon"><use href="#i-check" /></svg>
          {toastMessage}
        </div>
      ) : null}

      {/* Filter Toolbar */}
      <section className="s3-toolbar tasks-toolbar">
        <div className="s3-search-box">
          <svg aria-hidden="true" className="icon"><use href="#i-search" /></svg>
          <input
            type="search"
            placeholder={t('Search tasks…')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <select
          className="s3-toolbar__select"
          value={selectedBrand}
          onChange={(e) => setSelectedBrand(e.target.value)}
        >
          <option value="all">{t('All')}: {t('Brands')}</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>
              {t(b.name)}
            </option>
          ))}
        </select>

        <select
          className="s3-toolbar__select"
          value={selectedPriority}
          onChange={(e) => setSelectedPriority(e.target.value)}
        >
          <option value="all">{t('All')}: {t('Priority')}</option>
          <option value="high">{t('High')}</option>
          <option value="medium">{t('Medium')}</option>
          <option value="low">{t('Low')}</option>
        </select>

        {overdueCount > 0 ? (
          <span className="pill is-red tasks-overdue-pill">
            <svg aria-hidden="true" className="icon"><use href="#i-clock" /></svg>
            {overdueCount} {t('Overdue')}
          </span>
        ) : null}

        <div className="s3-view-toggle">
          <button
            type="button"
            className={viewMode === 'kanban' ? 'is-active' : ''}
            onClick={() => setViewMode('kanban')}
          >
            <svg aria-hidden="true" className="icon"><use href="#i-layers" /></svg>
            {t('Kanban')}
          </button>
          <button
            type="button"
            className={viewMode === 'table' ? 'is-active' : ''}
            onClick={() => setViewMode('table')}
          >
            <svg aria-hidden="true" className="icon"><use href="#i-table" /></svg>
            {t('Table')}
          </button>
        </div>
      </section>

      {/* Views */}
      {viewMode === 'kanban' ? (
        <div className="kanban-board">
          {TASK_STATUSES.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.id);
            return (
              <div
                key={col.id}
                className="kanban-col"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col.id)}
              >
                <header className="kanban-col__head">
                  <div className="kanban-col__title-wrap">
                    <span className={`pill ${col.color}`}>{t(col.label)}</span>
                    <span className="kanban-col__count">{colTasks.length}</span>
                  </div>
                </header>

                <div className="kanban-col__cards">
                  {colTasks.length === 0 ? (
                    <div className="kanban-col__empty">{t('No tasks in this category')}</div>
                  ) : (
                    colTasks.map((task) => {
                      const overdue = isTaskOverdue(task);
                      return (
                        <article
                          key={task.id}
                          className={`kanban-card ${overdue ? 'is-overdue' : ''} ${task.revisionsRequired ? 'is-revisions' : ''}`}
                          draggable
                          onDragStart={(e) => e.dataTransfer.setData('text/plain', task.id)}
                          onClick={() => setActiveTask(task)}
                        >
                          <div className="kanban-card__top">
                            <span className="kanban-card__brand">{t(task.brandName)}</span>
                            <span className={`pill is-${task.priority === 'high' ? 'red' : task.priority === 'medium' ? 'amber' : 'blue'}`}>
                              {t(task.priority === 'high' ? 'High' : task.priority === 'medium' ? 'Medium' : 'Low')}
                            </span>
                          </div>

                          <h3 className="kanban-card__title">{t(task.title)}</h3>
                          <p className="kanban-card__desc">{task.description}</p>

                          {overdue ? (
                            <div className="kanban-card__alert is-overdue">
                              <svg aria-hidden="true" className="icon"><use href="#i-clock" /></svg>
                              <span>{t('Overdue')} ({task.deadline})</span>
                            </div>
                          ) : null}

                          {task.revisionsRequired ? (
                            <div className="kanban-card__alert is-revisions">
                              <svg aria-hidden="true" className="icon"><use href="#i-alert" /></svg>
                              <span>{t('Returned with Revisions')}</span>
                            </div>
                          ) : null}

                          <footer className="kanban-card__foot">
                            <div className="kanban-card__assignee" title={t(task.assigneeName)}>
                              <span className="cl-avatar cl-avatar--orange">
                                {task.assigneeAvatar || 'SL'}
                              </span>
                              <span>{t(task.assigneeName)}</span>
                            </div>
                            <span className="kanban-card__date">{task.deadline}</span>
                          </footer>
                        </article>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="cl-card table-wrap">
          <table className="table tasks-table">
            <thead>
              <tr>
                <th>{t('Task Title')}</th>
                <th>{t('Brand')}</th>
                <th>{t('Assigned To')}</th>
                <th>{t('Priority')}</th>
                <th>{t('Status')}</th>
                <th>{t('Deadline')}</th>
                <th>{t('Audit Trail & History')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <EmptyState
                      icon="#i-file"
                      title={t('No tasks in this category')}
                      text={t('Create a new task or generate tasks from the approved content plan.')}
                    />
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => {
                  const overdue = isTaskOverdue(task);
                  return (
                    <tr
                      key={task.id}
                      className="tasks-table__row"
                      onClick={() => setActiveTask(task)}
                    >
                      <td>
                        <div className="tasks-table__title-cell">
                          <strong>{t(task.title)}</strong>
                          <small>{task.description}</small>
                        </div>
                      </td>
                      <td>
                        <span className="cl-label">{t(task.brandName)}</span>
                      </td>
                      <td>
                        <div className="tasks-table__user">
                          <span className="cl-avatar cl-avatar--orange">
                            {task.assigneeAvatar || 'SL'}
                          </span>
                          <span>{t(task.assigneeName)}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`pill is-${task.priority === 'high' ? 'red' : task.priority === 'medium' ? 'amber' : 'blue'}`}>
                          {t(task.priority === 'high' ? 'High' : task.priority === 'medium' ? 'Medium' : 'Low')}
                        </span>
                      </td>
                      <td>
                        <span className={`pill is-${task.status === 'completed' ? 'green' : task.status === 'in_review' ? 'purple' : task.status === 'in_progress' ? 'amber' : 'gray'}`}>
                          {t(task.status === 'todo' ? 'To Do' : task.status === 'in_progress' ? 'In Progress' : task.status === 'in_review' ? 'In Review' : 'Completed')}
                        </span>
                      </td>
                      <td>
                        <span className={overdue ? 'tasks-table__overdue' : ''}>
                          {task.deadline} {overdue ? `⚠️` : ''}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="button button--ghost button--sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveTask(task);
                          }}
                        >
                          <svg aria-hidden="true" className="icon"><use href="#i-clock" /></svg>
                          {task.auditTrail?.length || 0}
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

      {/* Task Detail Modal */}
      {activeTask ? (
        <TaskDetailModal
          task={activeTask}
          isOpen={Boolean(activeTask)}
          onClose={() => setActiveTask(null)}
        />
      ) : null}

      {/* New Task Modal */}
      {showNewModal ? (
        <NewTaskModal
          isOpen={showNewModal}
          onClose={() => setShowNewModal(false)}
        />
      ) : null}
    </div>
  );
}
