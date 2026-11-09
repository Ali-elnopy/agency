import React, { useMemo, useState } from 'react';
import { useSprint3 } from '../context/sprint3Store';
import { useBrands } from '../context/brandsStore';
import { isTaskOverdue, seedAnalytics } from '../data/sprintWorkflow';
import { PageHeader } from '../components/sprint3/Sprint3UI';
import TaskDetailModal from '../components/sprint4/TaskDetailModal';

export default function ManagerProgressPage() {
  const { tasks, t } = useSprint3();
  const { brands } = useBrands();

  const [activeTask, setActiveTask] = useState(null);

  // Overdue tasks across all projects
  const overdueTasks = useMemo(() => {
    return tasks.filter(isTaskOverdue);
  }, [tasks]);

  // Brand progress computed dynamically from tasks
  const brandProgressList = useMemo(() => {
    const list = brands.map((brand) => {
      const bTasks = tasks.filter((t) => String(t.brandId) === String(brand.id));
      const total = bTasks.length;
      const completed = bTasks.filter((t) => t.status === 'completed').length;
      const inProgress = bTasks.filter((t) => t.status === 'in_progress' || t.status === 'in_review').length;
      const overdue = bTasks.filter(isTaskOverdue).length;
      const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
      return {
        brandId: brand.id,
        brandName: brand.name,
        total,
        completed,
        inProgress,
        overdue,
        pct,
      };
    });

    return list.sort((a, b) => b.total - a.total);
  }, [brands, tasks]);

  // Workload matrix
  const workloadList = seedAnalytics.workloadDistribution;

  return (
    <div className="page-screen manager-progress-page">
      <PageHeader
        eyebrow={t('Execution & Review')}
        title={t('Team Progress')}
        description={t('Real-time studio delivery tracking: monitor brand progress bars, resolve global overdue tasks, and optimize squad workload distribution.')}
      />

      {/* Top Progress Stats */}
      <div className="s3-stats">
        <article className="s3-stat">
          <span>{t('Overall Client Progress')}</span>
          <strong className="is-green">
            {Math.round(
              brandProgressList.reduce((acc, b) => acc + b.pct, 0) /
                Math.max(1, brandProgressList.length)
            )}
            %
          </strong>
          <small>{brandProgressList.filter((b) => b.pct === 100).length} {t('Completed')}</small>
        </article>

        <article className="s3-stat">
          <span>{t('Global Overdue Tasks')}</span>
          <strong className={overdueTasks.length > 0 ? 'is-red' : 'is-green'}>
            {overdueTasks.length}
          </strong>
          <small>{t('Requires immediate management intervention')}</small>
        </article>

        <article className="s3-stat">
          <span>{t('Active Tasks')}</span>
          <strong>{tasks.filter((t) => t.status !== 'completed').length}</strong>
          <small>{t('Across all studio brands')}</small>
        </article>

        <article className="s3-stat">
          <span>{t('Capacity Usage')}</span>
          <strong className="is-purple">64%</strong>
          <small>{t('Optimal workload balance')}</small>
        </article>
      </div>

      <div className="progress-layout">
        {/* Left Column: Client Progress Bars */}
        <div className="progress-main">
          <section className="cl-card">
            <header className="cl-card__head">
              <div>
                <h2 className="cl-card__title">{t('Overall Client Progress')}</h2>
                <p className="cl-card__sub">{t('Delivery progress calculated from completed and active tasks per brand.')}</p>
              </div>
            </header>

            <div className="progress-bars-list">
              {brandProgressList.map((brand) => (
                <div key={brand.brandId} className="progress-bar-row">
                  <div className="progress-bar-row__top">
                    <span className="progress-bar-row__name">{t(brand.brandName)}</span>
                    <div className="progress-bar-row__meta">
                      <span>{brand.completed}/{brand.total} {t('Tasks')}</span>
                      <strong className="progress-bar-row__pct">{brand.pct}%</strong>
                    </div>
                  </div>

                  <div className="progress-bar-row__track">
                    <div
                      className={`progress-bar-row__fill ${brand.pct === 100 ? 'is-full' : ''}`}
                      style={{ width: `${brand.pct}%` }}
                    />
                  </div>

                  {brand.overdue > 0 ? (
                    <span className="progress-bar-row__alert">
                      <svg aria-hidden="true" className="icon"><use href="#i-alert" /></svg>
                      {brand.overdue} {t('Overdue')}
                    </span>
                  ) : null}
                </div>
              ))}
            </div>
          </section>

          {/* Workload Distribution Chart */}
          <section className="cl-card">
            <header className="cl-card__head">
              <div>
                <h2 className="cl-card__title">{t('Team Workload Distribution')}</h2>
                <p className="cl-card__sub">{t('Active task distribution across specialists to avoid overloading team members.')}</p>
              </div>
            </header>

            <div className="workload-list">
              {workloadList.map((emp) => (
                <div key={emp.id} className="workload-row">
                  <div className="workload-row__user">
                    <span className="cl-avatar cl-avatar--orange">
                      {emp.name.split(' ').map((n) => n[0]).join('').substring(0, 2)}
                    </span>
                    <div>
                      <strong>{t(emp.name)}</strong>
                      <small>{t(emp.role)}</small>
                    </div>
                  </div>

                  <div className="workload-row__track-wrap">
                    <div className="workload-row__track">
                      <div
                        className={`workload-row__fill ${emp.pct > 80 ? 'is-danger' : emp.pct > 60 ? 'is-amber' : 'is-green'}`}
                        style={{ width: `${emp.pct}%` }}
                      />
                    </div>
                    <span className="workload-row__stat">
                      {emp.activeTasks} / {emp.capacity} {t('Active Tasks')} ({emp.pct}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Global Overdue Tasks Roll-up */}
        <aside className="progress-rail">
          <section className="cl-card progress-rail-card">
            <header className="cl-card__head">
              <h2 className="cl-card__title">
                <span className="cl-card__icon is-danger">
                  <svg aria-hidden="true" className="icon"><use href="#i-alert" /></svg>
                </span>
                {t('Global Overdue Tasks')}
              </h2>
              <span className="pill is-red">{overdueTasks.length}</span>
            </header>

            {overdueTasks.length === 0 ? (
              <p className="cl-card__sub">{t('Good job! You have cleared all urgent work.')}</p>
            ) : (
              <div className="overdue-list">
                {overdueTasks.map((task) => (
                  <article
                    key={task.id}
                    className="overdue-item"
                    onClick={() => setActiveTask(task)}
                  >
                    <div className="overdue-item__top">
                      <span className="cl-label">{t(task.brandName)}</span>
                      <span className="overdue-item__tag is-red">
                        <svg aria-hidden="true" className="icon"><use href="#i-clock" /></svg>
                        {task.deadline}
                      </span>
                    </div>

                    <h4 className="overdue-item__title">{t(task.title)}</h4>

                    <footer className="overdue-item__foot">
                      <span>{t(task.assigneeName)}</span>
                      <button
                        type="button"
                        className="button button--ghost button--sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveTask(task);
                        }}
                      >
                        {t('Action Required')} →
                      </button>
                    </footer>
                  </article>
                ))}
              </div>
            )}
          </section>
        </aside>
      </div>

      {activeTask ? (
        <TaskDetailModal
          task={activeTask}
          isOpen={Boolean(activeTask)}
          onClose={() => setActiveTask(null)}
        />
      ) : null}
    </div>
  );
}
