import React, { useMemo, useState } from 'react';
import { useSprint3 } from '../context/sprint3Store';
import { isTaskOverdue } from '../data/sprintWorkflow';
import { PageHeader, EmptyState } from '../components/sprint3/Sprint3UI';
import TaskDetailModal from '../components/sprint4/TaskDetailModal';

export default function MyWorkPage() {
  const { tasks, t } = useSprint3();

  const [activeTab, setActiveTab] = useState('today'); // 'today' | 'upcoming' | 'overdue' | 'high_priority' | 'revisions'
  const [selectedTask, setSelectedTask] = useState(null);

  // In mock session, let's treat tasks assigned to Sarah Lin or general creators as "My Work"
  const myTasks = useMemo(() => {
    return tasks.filter((task) => {
      return (
        task.assigneeId === '160' ||
        task.assigneeName === 'Sarah Lin' ||
        task.assigneeRole === 'Content Creator'
      );
    });
  }, [tasks]);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const categorizedTasks = useMemo(() => {
    return {
      today: myTasks.filter((t) => t.deadline === todayStr && t.status !== 'completed'),
      upcoming: myTasks.filter((t) => t.deadline > todayStr && t.status !== 'completed'),
      overdue: myTasks.filter(isTaskOverdue),
      high_priority: myTasks.filter((t) => t.priority === 'high' && t.status !== 'completed'),
      revisions: myTasks.filter((t) => t.revisionsRequired && t.status !== 'completed'),
    };
  }, [myTasks, todayStr]);

  const displayedTasks = categorizedTasks[activeTab] || [];

  return (
    <div className="page-screen my-work-page">
      <PageHeader
        eyebrow={t('Execution & Review')}
        title={t('My Work Dashboard')}
        description={t('Your focused task queue: prioritize daily execution, address manager revisions, and submit deliverables.')}
      />

      {/* Quick Tabs */}
      <nav className="my-work__tabs">
        <button
          type="button"
          className={`my-work__tab ${activeTab === 'today' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('today')}
        >
          <span>{t("Today's Tasks")}</span>
          <span className="my-work__tab-count">{categorizedTasks.today.length}</span>
        </button>

        <button
          type="button"
          className={`my-work__tab ${activeTab === 'upcoming' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('upcoming')}
        >
          <span>{t('Upcoming')}</span>
          <span className="my-work__tab-count">{categorizedTasks.upcoming.length}</span>
        </button>

        <button
          type="button"
          className={`my-work__tab ${activeTab === 'overdue' ? 'is-active' : ''} ${categorizedTasks.overdue.length > 0 ? 'is-danger' : ''}`}
          onClick={() => setActiveTab('overdue')}
        >
          <svg aria-hidden="true" className="icon"><use href="#i-clock" /></svg>
          <span>{t('Overdue')}</span>
          <span className="my-work__tab-count is-red">{categorizedTasks.overdue.length}</span>
        </button>

        <button
          type="button"
          className={`my-work__tab ${activeTab === 'high_priority' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('high_priority')}
        >
          <span>{t('High Priority')}</span>
          <span className="my-work__tab-count">{categorizedTasks.high_priority.length}</span>
        </button>

        <button
          type="button"
          className={`my-work__tab ${activeTab === 'revisions' ? 'is-active' : ''} ${categorizedTasks.revisions.length > 0 ? 'is-warning' : ''}`}
          onClick={() => setActiveTab('revisions')}
        >
          <svg aria-hidden="true" className="icon"><use href="#i-alert" /></svg>
          <span>{t('Returned with Revisions')}</span>
          <span className="my-work__tab-count is-amber">{categorizedTasks.revisions.length}</span>
        </button>
      </nav>

      {/* Task Cards Grid */}
      <div className="my-work__grid">
        {displayedTasks.length === 0 ? (
          <div className="cl-card my-work__empty-card">
            <EmptyState
              icon="#i-check"
              title={t('Good job! You have cleared all urgent work.')}
              text={t('No tasks in this category')}
            />
          </div>
        ) : (
          displayedTasks.map((task) => {
            const overdue = isTaskOverdue(task);
            return (
              <article
                key={task.id}
                className={`cl-card my-work-card ${overdue ? 'is-overdue' : ''} ${task.revisionsRequired ? 'is-revisions' : ''}`}
                onClick={() => setSelectedTask(task)}
              >
                <header className="my-work-card__head">
                  <div className="my-work-card__brand-wrap">
                    <span className="cl-label">{t(task.brandName)}</span>
                    <span className={`pill is-${task.priority === 'high' ? 'red' : task.priority === 'medium' ? 'amber' : 'blue'}`}>
                      {t(task.priority === 'high' ? 'High' : task.priority === 'medium' ? 'Medium' : 'Low')}
                    </span>
                  </div>

                  <span className={`pill is-${task.status === 'completed' ? 'green' : task.status === 'in_review' ? 'purple' : task.status === 'in_progress' ? 'amber' : 'gray'}`}>
                    {t(task.status === 'todo' ? 'To Do' : task.status === 'in_progress' ? 'In Progress' : task.status === 'in_review' ? 'In Review' : 'Completed')}
                  </span>
                </header>

                <h3 className="my-work-card__title">{t(task.title)}</h3>
                <p className="my-work-card__desc">{task.description}</p>

                {task.revisionsRequired && task.revisionsNote ? (
                  <div className="my-work-card__feedback">
                    <span className="my-work-card__feedback-label">
                      <svg aria-hidden="true" className="icon"><use href="#i-alert" /></svg>
                      {t('Manager Feedback')}:
                    </span>
                    <p>{task.revisionsNote}</p>
                  </div>
                ) : null}

                <footer className="my-work-card__foot">
                  <div className="my-work-card__meta">
                    <span className={`my-work-card__deadline ${overdue ? 'is-overdue' : ''}`}>
                      <svg aria-hidden="true" className="icon"><use href="#i-clock" /></svg>
                      {t('Deadline')}: {task.deadline} {overdue ? `(${t('Overdue')})` : ''}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="button button--primary button--sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTask(task);
                    }}
                  >
                    {task.status === 'todo'
                      ? t('Start Task')
                      : task.status === 'in_progress'
                      ? t('Submit for Review')
                      : t('Task Details')}
                  </button>
                </footer>
              </article>
            );
          })
        )}
      </div>

      {selectedTask ? (
        <TaskDetailModal
          task={selectedTask}
          isOpen={Boolean(selectedTask)}
          onClose={() => setSelectedTask(null)}
        />
      ) : null}
    </div>
  );
}
