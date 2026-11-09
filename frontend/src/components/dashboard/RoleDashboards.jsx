import React from 'react';
import { useSprint3 } from '../../context/sprint3Store';
import { isTaskOverdue } from '../../data/sprintWorkflow';

export function AccountManagerDashboardView({ go }) {
  const { tasks, clientRequests, t } = useSprint3();

  const pendingReviews = tasks.filter((t) => t.status === 'in_review');
  const overdueTasks = tasks.filter(isTaskOverdue);
  const pendingRequests = clientRequests.filter((r) => r.status === 'submitted' || r.status === 'under_review');

  return (
    <div className="role-dashboard am-dashboard">
      <section className="page-head page-head--actions">
        <div>
          <span className="cl-label">{t('Account Manager Command Center')}</span>
          <h1 className="page-head__title">{t('Dashboard')}</h1>
          <p className="content-plan__lead">
            {t('Monitor internal creative review queues, resolve overdue deliverables, and address incoming client requests.')}
          </p>
        </div>
        <div className="s3-actions-row">
          <button type="button" className="button button--ghost" onClick={() => go('managerProgress')}>
            <svg aria-hidden="true" className="icon"><use href="#i-trend" /></svg>
            {t('Team Progress')}
          </button>
          <button type="button" className="button button--primary" onClick={() => go('tasks')}>
            <svg aria-hidden="true" className="icon"><use href="#i-layers" /></svg>
            {t('Tasks Management')}
          </button>
        </div>
      </section>

      {/* AM KPIs */}
      <div className="s3-stats">
        <article className="s3-stat">
          <span>{t('Internal Review Queue')}</span>
          <strong className="is-purple">{pendingReviews.length}</strong>
          <small>{t('Tasks pending your sign-off')}</small>
        </article>

        <article className="s3-stat">
          <span>{t('Global Overdue Tasks')}</span>
          <strong className={overdueTasks.length > 0 ? 'is-red' : 'is-green'}>
            {overdueTasks.length}
          </strong>
          <small>{t('Requires immediate management intervention')}</small>
        </article>

        <article className="s3-stat">
          <span>{t('Client Requests')}</span>
          <strong className="is-amber">{pendingRequests.length}</strong>
          <small>{t('Submitted')}</small>
        </article>

        <article className="s3-stat">
          <span>{t('Active Tasks')}</span>
          <strong>{tasks.filter((t) => t.status !== 'completed').length}</strong>
          <small>{t('Across all studio brands')}</small>
        </article>
      </div>

      <div className="ov-grid">
        <div className="ov-main">
          {/* Pending Internal Reviews */}
          <section className="cl-card">
            <header className="cl-card__head">
              <div>
                <h2 className="cl-card__title">
                  <span className="cl-card__icon is-purple">
                    <svg aria-hidden="true" className="icon"><use href="#i-check" /></svg>
                  </span>
                  {t('Internal Review Queue')}
                </h2>
                <p className="cl-card__sub">{t('Creative work delivered by team members awaiting your approval or revisions.')}</p>
              </div>
              <button type="button" className="ec-link" onClick={() => go('tasks')}>
                {t('Tasks Management')} →
              </button>
            </header>

            <div className="review-queue-list">
              {pendingReviews.length === 0 ? (
                <div className="ws-empty">
                  <strong>{t('No tasks in this category')}</strong>
                  <p>{t('All creative submissions have been reviewed.')}</p>
                </div>
              ) : (
                pendingReviews.map((task) => (
                  <div key={task.id} className="review-queue-item" onClick={() => go('tasks')}>
                    <div className="review-queue-item__left">
                      <span className="cl-label">{t(task.brandName)}</span>
                      <strong className="review-queue-item__title">{t(task.title)}</strong>
                      <span className="review-queue-item__author">
                        {t('Assigned To')}: {t(task.assigneeName)} ({t(task.assigneeRole || 'Creator')})
                      </span>
                    </div>

                    <div className="review-queue-item__right">
                      <span className="pill is-purple">{t('In Review')}</span>
                      <button type="button" className="button button--primary button--sm">
                        {t('Approve & Complete')}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Incoming Client Requests */}
          <section className="cl-card">
            <header className="cl-card__head">
              <div>
                <h2 className="cl-card__title">
                  <span className="cl-card__icon is-amber">
                    <svg aria-hidden="true" className="icon"><use href="#i-mail" /></svg>
                  </span>
                  {t('Client Requests')}
                </h2>
                <p className="cl-card__sub">{t('Incoming spontaneous requests awaiting triage and assignment.')}</p>
              </div>
              <button type="button" className="ec-link" onClick={() => go('clientRequests')}>
                {t('Client Requests')} →
              </button>
            </header>

            <div className="review-queue-list">
              {pendingRequests.length === 0 ? (
                <div className="ws-empty">
                  <strong>{t('No requests yet')}</strong>
                  <p>{t('No pending client requests.')}</p>
                </div>
              ) : (
                pendingRequests.map((req) => (
                  <div key={req.id} className="review-queue-item" onClick={() => go('clientRequests')}>
                    <div className="review-queue-item__left">
                      <div className="review-queue-item__meta-row">
                        <span className="cl-label">{t(req.brandName)}</span>
                        <span className={`pill is-${req.urgency === 'urgent' ? 'red' : 'blue'}`}>
                          {t(req.urgency === 'urgent' ? 'Urgent' : 'Standard')}
                        </span>
                      </div>
                      <strong className="review-queue-item__title">{t(req.title)}</strong>
                      <p className="review-queue-item__snippet">{req.description}</p>
                    </div>

                    <div className="review-queue-item__right">
                      <button type="button" className="button button--primary button--sm">
                        {t('Accept & Convert to Task')}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* Right Rail: Overdue Watchlist */}
        <aside className="ov-rail">
          <section className="cl-card">
            <header className="cl-card__head">
              <h2 className="cl-card__title">
                <span className="cl-card__icon is-danger">
                  <svg aria-hidden="true" className="icon"><use href="#i-alert" /></svg>
                </span>
                {t('Global Overdue Tasks')}
              </h2>
              <span className="pill is-red">{overdueTasks.length}</span>
            </header>

            <div className="overdue-list">
              {overdueTasks.length === 0 ? (
                <p className="cl-card__sub">{t('Good job! You have cleared all urgent work.')}</p>
              ) : (
                overdueTasks.map((tItem) => (
                  <article key={tItem.id} className="overdue-item" onClick={() => go('tasks')}>
                    <div className="overdue-item__top">
                      <span className="cl-label">{t(tItem.brandName)}</span>
                      <span className="overdue-item__tag is-red">{tItem.deadline}</span>
                    </div>
                    <h4 className="overdue-item__title">{t(tItem.title)}</h4>
                    <footer className="overdue-item__foot">
                      <span>{t(tItem.assigneeName)}</span>
                      <span className="pill is-red">{t('Overdue')}</span>
                    </footer>
                  </article>
                ))
              )}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

export function CreativeDashboardView({ go }) {
  const { tasks, t } = useSprint3();

  // Filter tasks for creative
  const myTasks = tasks.filter(
    (task) =>
      task.assigneeId === '160' ||
      task.assigneeName === 'Sarah Lin' ||
      task.assigneeRole === 'Content Creator'
  );

  const revisionsTasks = myTasks.filter((t) => t.revisionsRequired && t.status !== 'completed');
  const overdueTasks = myTasks.filter(isTaskOverdue);
  const inProgressTasks = myTasks.filter((t) => t.status === 'in_progress');
  const completedTasks = myTasks.filter((t) => t.status === 'completed');

  return (
    <div className="role-dashboard creative-dashboard">
      <section className="page-head page-head--actions">
        <div>
          <span className="cl-label">{t('Creative Specialist Workspace')}</span>
          <h1 className="page-head__title">{t('Dashboard')}</h1>
          <p className="content-plan__lead">
            {t('Daily execution focus: active sprint deliverables, manager feedback, and delivery submissions.')}
          </p>
        </div>
        <div className="s3-actions-row">
          <button type="button" className="button button--primary" onClick={() => go('myWork')}>
            <svg aria-hidden="true" className="icon"><use href="#i-check" /></svg>
            {t('My Work Dashboard')}
          </button>
        </div>
      </section>

      {/* Creative KPIs */}
      <div className="s3-stats">
        <article className="s3-stat">
          <span>{t('Active Tasks')}</span>
          <strong>{inProgressTasks.length + revisionsTasks.length}</strong>
          <small>{t('In execution')}</small>
        </article>

        <article className="s3-stat">
          <span>{t('Returned with Revisions')}</span>
          <strong className={revisionsTasks.length > 0 ? 'is-red' : 'is-green'}>
            {revisionsTasks.length}
          </strong>
          <small>{t('Action Required')}</small>
        </article>

        <article className="s3-stat">
          <span>{t('Overdue')}</span>
          <strong className={overdueTasks.length > 0 ? 'is-red' : 'is-green'}>
            {overdueTasks.length}
          </strong>
          <small>{t('Past deadline')}</small>
        </article>

        <article className="s3-stat">
          <span>{t('Completed Tasks')}</span>
          <strong className="is-green">{completedTasks.length}</strong>
          <small>{t('Signed off this sprint')}</small>
        </article>
      </div>

      {/* Revision Alerts Banner */}
      {revisionsTasks.length > 0 ? (
        <div className="cl-card revision-banner-card" onClick={() => go('myWork')}>
          <div className="revision-banner__icon">
            <svg aria-hidden="true" className="icon"><use href="#i-alert" /></svg>
          </div>
          <div className="revision-banner__content">
            <h3>{t('Returned with Revisions')} ({revisionsTasks.length})</h3>
            <p>
              {revisionsTasks[0]?.title}: "{revisionsTasks[0]?.revisionsNote || t('Manager Feedback')}"
            </p>
          </div>
          <button type="button" className="button button--primary button--sm is-danger">
            {t('Action Required')} →
          </button>
        </div>
      ) : null}

      {/* Tasks Queue */}
      <section className="cl-card">
        <header className="cl-card__head">
          <div>
            <h2 className="cl-card__title">{t("Today's Tasks")}</h2>
            <p className="cl-card__sub">{t('High-priority sprint tasks scheduled for your attention.')}</p>
          </div>
          <button type="button" className="ec-link" onClick={() => go('myWork')}>
            {t('My Work Dashboard')} →
          </button>
        </header>

        <div className="review-queue-list">
          {myTasks.length === 0 ? (
            <div className="ws-empty">
              <strong>{t('Good job! You have cleared all urgent work.')}</strong>
            </div>
          ) : (
            myTasks.slice(0, 5).map((task) => {
              const overdue = isTaskOverdue(task);
              return (
                <div key={task.id} className="review-queue-item" onClick={() => go('myWork')}>
                  <div className="review-queue-item__left">
                    <div className="review-queue-item__meta-row">
                      <span className="cl-label">{t(task.brandName)}</span>
                      <span className={`pill is-${task.priority === 'high' ? 'red' : 'amber'}`}>
                        {t(task.priority === 'high' ? 'High' : 'Medium')}
                      </span>
                    </div>
                    <strong className="review-queue-item__title">{t(task.title)}</strong>
                    <span className={`review-queue-item__author ${overdue ? 'is-danger' : ''}`}>
                      {t('Deadline')}: {task.deadline} {overdue ? `(${t('Overdue')})` : ''}
                    </span>
                  </div>

                  <div className="review-queue-item__right">
                    <span className={`pill is-${task.status === 'completed' ? 'green' : task.status === 'in_review' ? 'purple' : 'amber'}`}>
                      {t(task.status === 'in_review' ? 'In Review' : task.status === 'completed' ? 'Completed' : 'In Progress')}
                    </span>
                    <button type="button" className="button button--ghost button--sm">
                      {t('Task Details')} →
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}

export function ClientDashboardView({ go }) {
  const { clientReviews, clientRequests, publishingItems, t } = useSprint3();

  // Data isolation: Client sees Nike
  const pendingApprovals = clientReviews.filter(
    (r) => (r.brandId === '1' || r.brandName === 'Nike') && r.status === 'pending_client_review'
  );

  const approvedPosts = clientReviews.filter(
    (r) => (r.brandId === '1' || r.brandName === 'Nike') && r.status === 'approved'
  );

  const myRequests = clientRequests.filter(
    (r) => r.brandId === '1' || r.brandName === 'Nike'
  );

  const published = publishingItems.filter(
    (p) => (p.brandId === '1' || p.brandName === 'Nike') && p.status === 'published'
  );

  return (
    <div className="role-dashboard client-dashboard">
      <section className="page-head page-head--actions">
        <div>
          <span className="cl-label">{t('Client Portal Hub')} — {t('Nike')}</span>
          <h1 className="page-head__title">{t('Dashboard')}</h1>
          <p className="content-plan__lead">
            {t('Review creative deliverables awaiting your approval, monitor release schedules, and submit special campaign requests.')}
          </p>
        </div>
        <div className="s3-actions-row">
          <button type="button" className="button button--ghost" onClick={() => go('clientRequests')}>
            <svg aria-hidden="true" className="icon"><use href="#i-plus" /></svg>
            {t('Submit New Request')}
          </button>
          <button type="button" className="button button--primary" onClick={() => go('clientReview')}>
            <svg aria-hidden="true" className="icon"><use href="#i-eye" /></svg>
            {t('Review & Approve Content')}
          </button>
        </div>
      </section>

      {/* Client KPIs */}
      <div className="s3-stats">
        <article className="s3-stat">
          <span>{t('Pending Client Review')}</span>
          <strong className={pendingApprovals.length > 0 ? 'is-purple' : 'is-green'}>
            {pendingApprovals.length}
          </strong>
          <small>{t('Posts ready for your review')}</small>
        </article>

        <article className="s3-stat">
          <span>{t('Approved Content Volume')}</span>
          <strong className="is-green">{approvedPosts.length}</strong>
          <small>{t('Scheduled for broadcasting')}</small>
        </article>

        <article className="s3-stat">
          <span>{t('Client Requests')}</span>
          <strong>{myRequests.length}</strong>
          <small>{t('Active campaign requests')}</small>
        </article>

        <article className="s3-stat">
          <span>{t('Published Volume')}</span>
          <strong className="is-green">{published.length}</strong>
          <small>{t('Live on social platforms')}</small>
        </article>
      </div>

      <div className="ov-grid">
        <div className="ov-main">
          {/* Posts Awaiting Approval Feed Preview */}
          <section className="cl-card">
            <header className="cl-card__head">
              <div>
                <h2 className="cl-card__title">
                  <span className="cl-card__icon is-purple">
                    <svg aria-hidden="true" className="icon"><use href="#i-eye" /></svg>
                  </span>
                  {t('Review & Approve Content')}
                </h2>
                <p className="cl-card__sub">{t('High-fidelity feed preview of deliverables awaiting your sign-off.')}</p>
              </div>
              <button type="button" className="ec-link" onClick={() => go('clientReview')}>
                {t('Client Review Portal')} →
              </button>
            </header>

            <div className="client-dash-reviews">
              {pendingApprovals.length === 0 ? (
                <div className="ws-empty">
                  <strong>{t('Good job! You have cleared all urgent work.')}</strong>
                  <p>{t('All delivered content items have been approved.')}</p>
                </div>
              ) : (
                pendingApprovals.map((item) => (
                  <div key={item.id} className="client-dash-review-card" onClick={() => go('clientReview')}>
                    <img src={item.mediaPreview} alt={item.title} className="client-dash-thumb" />
                    <div className="client-dash-info">
                      <span className="cl-label">{t(item.platform)} · {item.format}</span>
                      <strong>{t(item.title)}</strong>
                      <p>{item.caption.substring(0, 110)}…</p>
                    </div>
                    <button type="button" className="button button--primary button--sm">
                      {t('Approve Post')}
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* Right Rail: Client Requests Tracker */}
        <aside className="ov-rail">
          <section className="cl-card">
            <header className="cl-card__head">
              <h2 className="cl-card__title">
                <span className="cl-card__icon">
                  <svg aria-hidden="true" className="icon"><use href="#i-mail" /></svg>
                </span>
                {t('Client Requests')}
              </h2>
              <button type="button" className="button button--ghost button--sm" onClick={() => go('clientRequests')}>
                +
              </button>
            </header>

            <div className="client-requests-mini-list">
              {myRequests.length === 0 ? (
                <p className="cl-card__sub">{t('No requests yet')}</p>
              ) : (
                myRequests.map((req) => (
                  <div key={req.id} className="client-mini-req" onClick={() => go('clientRequests')}>
                    <div className="client-mini-req__top">
                      <strong>{t(req.title)}</strong>
                      <span
                        className={`pill is-${
                          req.status === 'assigned'
                            ? 'green'
                            : req.status === 'rejected'
                            ? 'red'
                            : 'amber'
                        }`}
                      >
                        {t(
                          req.status === 'submitted'
                            ? 'Submitted'
                            : req.status === 'under_review'
                            ? 'Under Review'
                            : req.status === 'assigned'
                            ? 'Assigned'
                            : 'Rejected'
                        )}
                      </span>
                    </div>
                    <small>{req.deadline}</small>
                  </div>
                ))
              )}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
