import React, { useState } from 'react';
import { useSprint3 } from '../context/sprint3Store';
import { useBrands } from '../context/brandsStore';
import { seedAnalytics } from '../data/sprintWorkflow';
import { PageHeader } from '../components/sprint3/Sprint3UI';

export default function AnalyticsPage() {
  const { tasks, publishingItems, clientReviews, t } = useSprint3();
  const { brands } = useBrands();

  const [dateRange, setDateRange] = useState('30d');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [toastMsg, setToastMsg] = useState('');

  const handleExport = (format) => {
    setToastMsg(`${t('Report exported successfully')} (${format.toUpperCase()})`);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const inReviewTasks = tasks.filter((t) => t.status === 'in_review').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress').length;
  const todoTasks = tasks.filter((t) => t.status === 'todo').length;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 84;
  const approvedCount = clientReviews.filter((r) => r.status === 'approved').length;
  const publishedCount = publishingItems.filter((p) => p.status === 'published').length;

  return (
    <div className="page-screen analytics-page">
      <PageHeader
        eyebrow={t('Client & Delivery')}
        title={t('Performance & Analytics')}
        description={t('Executive intelligence: track on-time delivery ratios, client timeline velocities, approval turnaround, and employee capacity reports.')}
        actions={
          <div className="s3-actions-row">
            <button
              type="button"
              className="button button--ghost"
              onClick={() => handleExport('csv')}
            >
              <svg aria-hidden="true" className="icon"><use href="#i-download" /></svg>
              {t('Export CSV')}
            </button>
            <button
              type="button"
              className="button button--primary"
              onClick={() => handleExport('pdf')}
            >
              <svg aria-hidden="true" className="icon"><use href="#i-download" /></svg>
              {t('Export PDF')}
            </button>
          </div>
        }
      />

      {toastMsg ? (
        <div className="s3-alert is-green analytics__toast">
          <svg aria-hidden="true" className="icon"><use href="#i-check" /></svg>
          {toastMsg}
        </div>
      ) : null}

      {/* Filter Bar */}
      <section className="s3-toolbar analytics-toolbar">
        <label className="analytics-filter-label">
          <span>{t('Date Range')}:</span>
          <select
            className="s3-toolbar__select"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="7d">{t('Last 7 Days')}</option>
            <option value="30d">{t('Last 30 Days')}</option>
            <option value="quarter">{t('This Quarter')}</option>
          </select>
        </label>

        <label className="analytics-filter-label">
          <span>{t('Brand')}:</span>
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
        </label>
      </section>

      {/* KPI Highlights */}
      <div className="s3-stats analytics-stats">
        <article className="s3-stat">
          <span>{t('Completion Rate')}</span>
          <strong className="is-green">{completionRate}%</strong>
          <small>{completedTasks} of {totalTasks} {t('Tasks')}</small>
        </article>

        <article className="s3-stat">
          <span>{t('On-Time Delivery Rate')}</span>
          <strong className="is-green">88%</strong>
          <small>12% {t('Overdue')}</small>
        </article>

        <article className="s3-stat">
          <span>{t('Approved Content Volume')}</span>
          <strong className="is-purple">{approvedCount || 38}</strong>
          <small>{publishedCount || 26} {t('Published')}</small>
        </article>

        <article className="s3-stat">
          <span>{t('Average Turnaround')}</span>
          <strong>1.4 {t('Days')}</strong>
          <small>{t('From brief to client approval')}</small>
        </article>
      </div>

      <div className="analytics-grid">
        {/* Task Status Distribution */}
        <section className="cl-card">
          <header className="cl-card__head">
            <div>
              <h2 className="cl-card__title">{t('Tasks Management')}</h2>
              <p className="cl-card__sub">{t('Execution breakdown across active workflow statuses.')}</p>
            </div>
          </header>

          <div className="analytics-breakdown">
            <div className="breakdown-bar">
              <div
                className="breakdown-seg is-green"
                style={{ width: `${(completedTasks / Math.max(1, totalTasks)) * 100}%` }}
                title={`${t('Completed')}: ${completedTasks}`}
              />
              <div
                className="breakdown-seg is-purple"
                style={{ width: `${(inReviewTasks / Math.max(1, totalTasks)) * 100}%` }}
                title={`${t('In Review')}: ${inReviewTasks}`}
              />
              <div
                className="breakdown-seg is-amber"
                style={{ width: `${(inProgressTasks / Math.max(1, totalTasks)) * 100}%` }}
                title={`${t('In Progress')}: ${inProgressTasks}`}
              />
              <div
                className="breakdown-seg is-gray"
                style={{ width: `${(todoTasks / Math.max(1, totalTasks)) * 100}%` }}
                title={`${t('To Do')}: ${todoTasks}`}
              />
            </div>

            <div className="breakdown-legend">
              <div className="legend-item">
                <span className="legend-dot is-green" />
                <span>{t('Completed')} ({completedTasks})</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot is-purple" />
                <span>{t('In Review')} ({inReviewTasks})</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot is-amber" />
                <span>{t('In Progress')} ({inProgressTasks})</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot is-gray" />
                <span>{t('To Do')} ({todoTasks})</span>
              </div>
            </div>
          </div>
        </section>

        {/* Client Timelines Progress */}
        <section className="cl-card">
          <header className="cl-card__head">
            <div>
              <h2 className="cl-card__title">{t('Client Timelines Progress')}</h2>
              <p className="cl-card__sub">{t('Progress against planned sprint deliverables per account.')}</p>
            </div>
          </header>

          <div className="analytics-timelines">
            {seedAnalytics.brandProgress.map((bp) => (
              <div key={bp.brandId} className="timeline-row">
                <div className="timeline-row__head">
                  <strong>{t(bp.brandName)}</strong>
                  <span>{bp.completed} / {bp.total} {t('Tasks')} ({bp.pct}%)</span>
                </div>
                <div className="timeline-row__bar">
                  <div
                    className={`timeline-row__fill ${bp.pct >= 80 ? 'is-green' : bp.pct >= 50 ? 'is-amber' : 'is-purple'}`}
                    style={{ width: `${bp.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Employee Workload Matrix */}
        <section className="cl-card analytics-fullwidth">
          <header className="cl-card__head">
            <div>
              <h2 className="cl-card__title">{t('Employee Workload Matrix')}</h2>
              <p className="cl-card__sub">{t('Capacity allocation and active task load across creative squads.')}</p>
            </div>
          </header>

          <div className="table-wrap">
            <table className="table analytics-table">
              <thead>
                <tr>
                  <th>{t('Team Member')}</th>
                  <th>{t('Role preview')}</th>
                  <th>{t('Active Tasks')}</th>
                  <th>{t('Capacity Usage')}</th>
                  <th>{t('Capacity State')}</th>
                </tr>
              </thead>
              <tbody>
                {seedAnalytics.workloadDistribution.map((emp) => (
                  <tr key={emp.id}>
                    <td>
                      <div className="analytics-user-cell">
                        <span className="cl-avatar cl-avatar--orange">
                          {emp.name.split(' ').map((n) => n[0]).join('').substring(0, 2)}
                        </span>
                        <strong>{t(emp.name)}</strong>
                      </div>
                    </td>
                    <td>{t(emp.role)}</td>
                    <td>
                      <strong>{emp.activeTasks}</strong> / {emp.capacity}
                    </td>
                    <td>
                      <div className="analytics-table__track">
                        <div
                          className={`analytics-table__fill ${emp.pct > 75 ? 'is-danger' : 'is-green'}`}
                          style={{ width: `${emp.pct}%` }}
                        />
                      </div>
                    </td>
                    <td>
                      <span className={`pill is-${emp.pct > 75 ? 'red' : 'green'}`}>
                        {t(emp.pct > 75 ? 'At Capacity' : 'Optimal')} ({emp.pct}%)
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
