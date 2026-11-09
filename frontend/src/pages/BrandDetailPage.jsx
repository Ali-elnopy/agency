import React, { useMemo, useState } from 'react';
import Modal from '../components/common/Modal';
import ConfirmModal from '../components/modals/ConfirmModal';
import PlanModal from '../components/brands/PlanModal';
import EditBrandModal from '../components/brands/EditBrandModal';
import AddPlatformModal from '../components/brands/AddPlatformModal';
import BrandBriefSection from '../components/brands/BrandBriefSection';
import ContentStrategySection from '../components/brands/ContentStrategySection';
import PlanDirectionSection from '../components/brands/PlanDirectionSection';
import SocialPlatformsSection from '../components/brands/SocialPlatformsSection';
import FilesAssetsSection from '../components/brands/FilesAssetsSection';
import BrandWorkspaceHub from '../components/brands/BrandWorkspaceHub';
import Toast from '../components/ui/Toast';
import useToast from '../hooks/useToast';
import { useBrands } from '../context/brandsStore';
import {
  BRAND_STATUS_LABEL,
  CONTENT_STATUS_LABEL,
  CONTENT_TYPES,
  displayUrl,
  formatDate,
  formatTime,
  initialsOf,
  monthKey,
  monthLabel,
  shiftMonth,
} from '../data/brands';

function percent(value, total) {
  if (!total) return 0;
  return Math.min(100, Math.round((value / total) * 100));
}

function InfoRow({ label, children }) {
  return (
    <div className="brand-info-row">
      <span className="brand-info-row__label">{label}</span>
      <div className="brand-info-row__value">{children}</div>
    </div>
  );
}

export default function BrandDetailPage({
  brandId,
  initialMonth,
  onBack,
  onAddContent,
  onDeleted,
}) {
  const {
    getBrand,
    plans,
    content,
    savePlan,
    updateBrand,
    deleteBrand,
    updateContentStatus,
    addPlatform,
    updatePlatform,
    deletePlatform,
    getPlatforms,
    getBriefs,
    getStrategies,
    getPlanDirections,
    getAssets,
  } = useBrands();
  const { toast, showToast } = useToast(4000);

  const defaultMonth = useMemo(() => {
    const current = monthKey();
    const months = plans
      .filter((plan) => plan.brandId === brandId)
      .map((plan) => plan.month)
      .sort();

    if (initialMonth && months.includes(initialMonth)) return initialMonth;

    return months.includes(current) ? current : months[months.length - 1] ?? current;
  }, [plans, brandId, initialMonth]);

  const [month, setMonth] = useState(defaultMonth);
  const [planOpen, setPlanOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [archiveBusy, setArchiveBusy] = useState(false);
  const [tab, setTab] = useState('hub');
  const [platformModal, setPlatformModal] = useState(null);
  const [platformToDelete, setPlatformToDelete] = useState(null);
  const [directionsFocus, setDirectionsFocus] = useState(null);

  const brand = getBrand(brandId);

  const brandPlans = useMemo(
    () =>
      plans
        .filter((plan) => plan.brandId === brandId)
        .sort((a, b) => a.month.localeCompare(b.month)),
    [plans, brandId],
  );

  const brandContent = useMemo(
    () => content.filter((item) => item.brandId === brandId),
    [content, brandId],
  );

  if (!brand) {
    return (
      <div className="page-screen">
        <section className="page-head">
          <h1 className="page-head__title">Brand not found</h1>
        </section>
        <section className="brand-empty brand-empty--page">
          <span className="brand-empty__icon">
            <svg aria-hidden="true" className="icon">
              <use href="#i-briefcase" />
            </svg>
          </span>
          <h2>This brand is no longer available</h2>
          <p>It may have been deleted from this workspace. Your other brands are still here.</p>
          <button type="button" className="button button--primary" onClick={onBack}>
            Back to Brands
          </button>
        </section>
      </div>
    );
  }

  const plan = brandPlans.find((item) => item.month === month) ?? null;

  const monthItems = brandContent
    .filter((item) => item.month === month)
    .sort((a, b) =>
      `${a.publishDate}T${a.publishTime}`.localeCompare(`${b.publishDate}T${b.publishTime}`),
    );

  const target = plan ? plan.postsTarget + plan.reelsTarget : 0;
  const added = monthItems.length;
  const delivered = monthItems.filter((item) => item.status === 'delivered').length;
  const delayed = monthItems.filter((item) => item.status === 'delayed').length;
  const stillOwed = Math.max(0, target - added);
  const delayRate = target ? Math.round((delayed / target) * 100) : 0;
  const completion = percent(delivered, target);

  const postsItems = monthItems.filter((item) => item.type === 'post');
  const reelsItems = monthItems.filter((item) => item.type === 'reel');
  const postsDelivered = postsItems.filter((item) => item.status === 'delivered').length;
  const reelsDelivered = reelsItems.filter((item) => item.status === 'delivered').length;

  const statusLabel = BRAND_STATUS_LABEL[brand.status] ?? 'Active';
  const isArchived = brand.status === 'archived';

  const platforms = getPlatforms(brand.id);
  const briefs = getBriefs(brand.id);
  const strategies = getStrategies(brand.id);
  const brandDirections = getPlanDirections(brand.id);
  const assets = getAssets(brand.id);

  const notify = (message, tone = 'success') => showToast(message, tone);

  const handleSavePlatform = (values) => {
    if (platformModal?.id) {
      updatePlatform(platformModal.id, values);
      showToast('Platform updated.');
    } else {
      addPlatform(brand.id, values);
      showToast('Platform added.');
    }

    setPlatformModal(null);
  };

  const confirmDeletePlatform = () => {
    if (!platformToDelete) return;

    deletePlatform(platformToDelete.id);
    setPlatformToDelete(null);
    showToast('Platform deleted.');
  };

  const openDirections = (platformId, focusMonth) => {
    setDirectionsFocus({ platformId, month: focusMonth });
    setTab('direction');
  };

  const handleSavePlan = (values) => {
    savePlan({ brandId: brand.id, ...values });
    setMonth(values.month);
    setPlanOpen(false);
    showToast(`Monthly plan saved for ${monthLabel(values.month)}.`, 'success');
  };

  const handleMarkDelivered = (item) => {
    updateContentStatus(item.id, 'delivered');
    showToast(`“${item.title}” marked as delivered.`, 'success');
  };

  const handleDelete = () => {
    deleteBrand(brand.id);
    setDeleteOpen(false);
    onDeleted?.();
  };

  const handleEditSave = async (patch) => {
    await updateBrand(brand.id, patch);
    showToast('Brand details updated successfully.');
  };

  const handleArchive = async () => {
    if (archiveBusy) return;

    setArchiveBusy(true);

    try {
      await updateBrand(brand.id, { status: isArchived ? 'active' : 'archived' });
      setArchiveOpen(false);
      showToast(
        isArchived
          ? `${brand.name} restored to the active workspace.`
          : `${brand.name} archived. You can restore it at any time.`,
      );
    } catch (err) {
      showToast(err?.message || 'Could not update this brand.', 'danger');
    } finally {
      setArchiveBusy(false);
    }
  };

  return (
    <div className="page-screen brand-detail-page">
      <section className="brand-hero">
        <div className="brand-hero__identity">
          <span className={`cl-brand__mark brand-hero__mark ${brand.tone}`}>
            {brand.initials || initialsOf(brand.name)}
          </span>
          <div className="brand-hero__copy">
            <div className="brand-hero__title">
              <h1>{brand.name}</h1>
              {brand.verified ? (
                <span className="brand-card__verified" title="Verified brand">
                  <svg aria-hidden="true" className="icon">
                    <use href="#i-check" />
                  </svg>
                </span>
              ) : null}
              <span className={`brand-status is-${brand.status}`}>
                <i className="brand-status__dot" aria-hidden="true" />
                {statusLabel}
              </span>
            </div>

            <div className="brand-hero__meta">
              <span>
                <svg aria-hidden="true" className="icon">
                  <use href="#i-briefcase" />
                </svg>
                {brand.industry || 'Uncategorized'}
              </span>
              <span>
                <svg aria-hidden="true" className="icon">
                  <use href="#i-globe" />
                </svg>
                {brand.country || 'Country not set'}
              </span>
              <span>
                <svg aria-hidden="true" className="icon">
                  <use href="#i-clock" />
                </svg>
                {brand.timezoneLabel || brand.timezone || 'Timezone not set'}
              </span>
              {brand.website ? (
                <a href={brand.website} target="_blank" rel="noreferrer">
                  <svg aria-hidden="true" className="icon">
                    <use href="#i-external" />
                  </svg>
                  {displayUrl(brand.website)}
                </a>
              ) : null}
            </div>

            <div className="bw-hero-platforms">
              {platforms.length ? (
                platforms.map((platform) => (
                  <button
                    key={platform.id}
                    type="button"
                    className={`bw-hero-platform ${platform.tone ?? ''}`}
                    onClick={() => setTab('social')}
                    title={`${platform.name} settings`}
                  >
                    {platform.name}
                  </button>
                ))
              ) : (
                <span className="bw-muted">No social platforms yet.</span>
              )}
              <button
                type="button"
                className="bw-hero-platform is-add"
                onClick={() => setPlatformModal({})}
              >
                <svg aria-hidden="true" className="icon">
                  <use href="#i-plus" />
                </svg>
                Add Platform
              </button>
            </div>
          </div>
        </div>

        <div className="brand-hero__actions">
          <button
            type="button"
            className="button button--ghost"
            onClick={() => setEditOpen(true)}
          >
            <svg aria-hidden="true" className="icon">
              <use href="#i-edit" />
            </svg>
            Edit Brand
          </button>
          <button
            type="button"
            className="button button--dark"
            onClick={() => setPlanOpen(true)}
          >
            <svg aria-hidden="true" className="icon">
              <use href="#i-calendar" />
            </svg>
            {plan ? 'Update Monthly Plan' : 'Create Monthly Plan'}
          </button>
          <button
            type="button"
            className="button button--primary"
            onClick={() => onAddContent?.(month)}
          >
            <svg aria-hidden="true" className="icon">
              <use href="#i-plus" />
            </svg>
            Add Content
          </button>
          <button
            type="button"
            className="button button--ghost"
            onClick={() => setArchiveOpen(true)}
          >
            <svg aria-hidden="true" className="icon">
              <use href="#i-archive" />
            </svg>
            {isArchived ? 'Restore Brand' : 'Archive Brand'}
          </button>
          <button
            type="button"
            className="button button--danger-ghost"
            onClick={() => setDeleteOpen(true)}
          >
            <svg aria-hidden="true" className="icon">
              <use href="#i-trash" />
            </svg>
            Delete Brand
          </button>
        </div>
      </section>

      {tab === 'hub' ? (
        <BrandWorkspaceHub
          brand={brand}
          counts={{
            brief: `${briefs.length} ${briefs.length === 1 ? 'file' : 'files'}`,
            strategy: `${strategies.length} ${strategies.length === 1 ? 'strategy' : 'strategies'}`,
            direction: `${brandDirections.length} ${
              brandDirections.length === 1 ? 'direction' : 'directions'
            }`,
            assets: `${assets.length} ${assets.length === 1 ? 'file' : 'files'}`,
            social: `${platforms.length} ${platforms.length === 1 ? 'platform' : 'platforms'}`,
          }}
          onOpen={(next) => setTab(next)}
        />
      ) : (
        <div className="bw-section-shell">
          <button type="button" className="bw-back" onClick={() => setTab('hub')}>
            <span aria-hidden="true">←</span> Brand workspace
          </button>

      {tab === 'overview' ? (
        <div className="brand-detail-grid">
        <div className="brand-detail-main">
          <section className="cl-card brand-plan-card">
            <div className="brand-section-head">
              <div>
                <h2 className="brand-section-title">
                  <span className="brand-section-icon">
                    <svg aria-hidden="true" className="icon">
                      <use href="#i-calendar" />
                    </svg>
                  </span>
                  Monthly Content Plan
                </h2>
                <p className="brand-section-sub">
                  Targets, delivery health and content output for this brand.
                </p>
              </div>

              <div className="plan-month">
                <button
                  type="button"
                  className="plan-month__nav is-prev"
                  onClick={() => setMonth((value) => shiftMonth(value, -1))}
                  aria-label="Previous month"
                >
                  <svg aria-hidden="true" className="icon">
                    <use href="#i-chevron" />
                  </svg>
                </button>
                <strong>{monthLabel(month)}</strong>
                <button
                  type="button"
                  className="plan-month__nav"
                  onClick={() => setMonth((value) => shiftMonth(value, 1))}
                  aria-label="Next month"
                >
                  <svg aria-hidden="true" className="icon">
                    <use href="#i-chevron" />
                  </svg>
                </button>
              </div>
            </div>

            {plan ? (
              <>
                <div className="plan-targets">
                  <article className="plan-target">
                    <span className="plan-target__icon is-post">
                      <svg aria-hidden="true" className="icon">
                        <use href="#i-file" />
                      </svg>
                    </span>
                    <div className="plan-target__copy">
                      <span>Posts</span>
                      <strong>{plan.postsTarget}</strong>
                      <small>
                        {postsItems.length} added · {postsDelivered} delivered
                      </small>
                    </div>
                    <span className="plan-target__progress">
                      <i
                        style={{
                          width: `${percent(postsDelivered, plan.postsTarget)}%`,
                        }}
                      />
                    </span>
                  </article>

                  <article className="plan-target">
                    <span className="plan-target__icon is-reel">
                      <svg aria-hidden="true" className="icon">
                        <use href="#i-camera" />
                      </svg>
                    </span>
                    <div className="plan-target__copy">
                      <span>Reels</span>
                      <strong>{plan.reelsTarget}</strong>
                      <small>
                        {reelsItems.length} added · {reelsDelivered} delivered
                      </small>
                    </div>
                    <span className="plan-target__progress">
                      <i
                        style={{
                          width: `${percent(reelsDelivered, plan.reelsTarget)}%`,
                        }}
                      />
                    </span>
                  </article>
                </div>

                <div className="plan-stats">
                  <article className="plan-stat">
                    <span>Target</span>
                    <strong>{target}</strong>
                    <small>
                      {plan.postsTarget} posts · {plan.reelsTarget} reels
                    </small>
                  </article>
                  <article className="plan-stat">
                    <span>Content added</span>
                    <strong>{added}</strong>
                    <small>
                      {postsItems.length} posts · {reelsItems.length} reels
                    </small>
                  </article>
                  <article className="plan-stat">
                    <span>Delivered</span>
                    <strong className="is-green">{delivered}</strong>
                    <small>Ready and shipped</small>
                  </article>
                  <article className="plan-stat">
                    <span>Still owed</span>
                    <strong className={stillOwed > 0 ? 'is-amber' : 'is-green'}>
                      {stillOwed}
                    </strong>
                    <small>Remaining in the plan</small>
                  </article>
                  <article className="plan-stat">
                    <span>Delayed</span>
                    <strong className={delayed > 0 ? 'is-red' : ''}>{delayed}</strong>
                    <small>Past their intended slot</small>
                  </article>
                  <article className="plan-stat">
                    <span>Delay rate</span>
                    <strong className={delayRate > 0 ? 'is-red' : ''}>{delayRate}%</strong>
                    <small>Of the monthly target</small>
                  </article>
                </div>

                <div className="plan-completion">
                  <div
                    className="plan-ring"
                    style={{ '--value': completion }}
                    role="img"
                    aria-label={`Plan completion ${completion}%`}
                  >
                    <strong>{completion}%</strong>
                  </div>
                  <div className="plan-completion__copy">
                    <div className="plan-completion__head">
                      <strong>Plan completion</strong>
                      <span>
                        {delivered} of {target} deliverables
                      </span>
                    </div>
                    <p>
                      {completion >= 100
                        ? 'Every planned deliverable has been shipped for this month.'
                        : `${stillOwed} deliverables are still owed. Mark content as delivered as it ships.`}
                    </p>
                    <div className="plan-progress" aria-hidden="true">
                      <span style={{ width: `${completion}%` }} />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="brand-empty brand-empty--plan">
                <span className="brand-empty__icon">
                  <svg aria-hidden="true" className="icon">
                    <use href="#i-calendar" />
                  </svg>
                </span>
                <h3>No plan for {monthLabel(month)}</h3>
                <p>
                  Set the monthly post and reel targets before adding content to this brand.
                </p>
                <button
                  type="button"
                  className="button button--primary button--sm"
                  onClick={() => setPlanOpen(true)}
                >
                  <svg aria-hidden="true" className="icon">
                    <use href="#i-plus" />
                  </svg>
                  Create Monthly Plan
                </button>
              </div>
            )}
          </section>

          {plan ? (
            <section className="cl-card brand-content-card">
              <div className="brand-section-head">
                <div>
                  <h2 className="brand-section-title">
                    <span className="brand-section-icon">
                      <svg aria-hidden="true" className="icon">
                        <use href="#i-table" />
                      </svg>
                    </span>
                    Content Calendar
                    <span className="brand-count-pill">{monthItems.length}</span>
                  </h2>
                  <p className="brand-section-sub">
                    Everything added to the {monthLabel(month)} plan.
                  </p>
                </div>

                <button
                  type="button"
                  className="button button--ghost button--sm"
                  onClick={() => onAddContent?.(month)}
                >
                  <svg aria-hidden="true" className="icon">
                    <use href="#i-plus" />
                  </svg>
                  Add Content
                </button>
              </div>

              {monthItems.length ? (
                <div className="brand-content-wrap">
                  <table className="brand-content-table">
                    <thead>
                      <tr>
                        <th scope="col">Content</th>
                        <th scope="col">Publish</th>
                        <th scope="col">TOV</th>
                        <th scope="col">Links</th>
                        <th scope="col">Status</th>
                        <th scope="col">
                          <span className="brand-sr">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthItems.map((item) => {
                        const type =
                          CONTENT_TYPES.find((option) => option.id === item.type) ??
                          CONTENT_TYPES[0];

                        return (
                          <tr key={item.id}>
                            <td>
                              <div className="content-item">
                                <span className={`content-item__icon is-${item.type}`}>
                                  <svg aria-hidden="true" className="icon">
                                    <use href={type.icon} />
                                  </svg>
                                </span>
                                <span className="content-item__copy">
                                  <strong>{item.title}</strong>
                                  <small>
                                    {type.label}
                                    {item.caption ? ` · ${item.caption}` : ''}
                                  </small>
                                </span>
                              </div>
                            </td>
                            <td>
                              <span className="content-date">{formatDate(item.publishDate)}</span>
                              <small>{formatTime(item.publishTime)}</small>
                            </td>
                            <td>
                              <span className="content-tov">{item.tov || '—'}</span>
                            </td>
                            <td>
                              <div className="content-links">
                                {item.referenceUrl ? (
                                  <a
                                    href={item.referenceUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    title="Open reference link"
                                    aria-label="Open reference link"
                                  >
                                    <svg aria-hidden="true" className="icon">
                                      <use href="#i-external" />
                                    </svg>
                                  </a>
                                ) : null}
                                {item.materialUrl ? (
                                  <a
                                    href={item.materialUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    title="Open materials"
                                    aria-label="Open materials"
                                  >
                                    <svg aria-hidden="true" className="icon">
                                      <use href="#i-layers" />
                                    </svg>
                                  </a>
                                ) : null}
                                {!item.referenceUrl && !item.materialUrl ? (
                                  <span className="content-links__empty">—</span>
                                ) : null}
                              </div>
                            </td>
                            <td>
                              <span className={`content-status is-${item.status}`}>
                                <i aria-hidden="true" />
                                {CONTENT_STATUS_LABEL[item.status] ?? 'Planned'}
                              </span>
                            </td>
                            <td>
                              {item.status !== 'delivered' ? (
                                <button
                                  type="button"
                                  className="content-deliver"
                                  onClick={() => handleMarkDelivered(item)}
                                  title="Mark as delivered"
                                  aria-label={`Mark ${item.title} as delivered`}
                                >
                                  <svg aria-hidden="true" className="icon">
                                    <use href="#i-check" />
                                  </svg>
                                </button>
                              ) : (
                                <span className="content-delivered" title="Delivered">
                                  <svg aria-hidden="true" className="icon">
                                    <use href="#i-check" />
                                  </svg>
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="brand-empty">
                  <span className="brand-empty__icon">
                    <svg aria-hidden="true" className="icon">
                      <use href="#i-file" />
                    </svg>
                  </span>
                  <h3>No content added yet</h3>
                  <p>Start filling the {monthLabel(month)} plan with posts and reels.</p>
                  <button
                    type="button"
                    className="button button--primary button--sm"
                    onClick={() => onAddContent?.(month)}
                  >
                    <svg aria-hidden="true" className="icon">
                      <use href="#i-plus" />
                    </svg>
                    Add Content
                  </button>
                </div>
              )}
            </section>
          ) : null}
        </div>

        <aside className="brand-detail-side">
          <section className="cl-card brand-info-card">
            <div className="brand-section-head">
              <div>
                <h2 className="brand-section-title">
                  <span className="brand-section-icon">
                    <svg aria-hidden="true" className="icon">
                      <use href="#i-briefcase" />
                    </svg>
                  </span>
                  Brand Information
                </h2>
                <p className="brand-section-sub">The full workspace record for this brand.</p>
              </div>
            </div>

            {brand.description ? (
              <p className="brand-info__description">{brand.description}</p>
            ) : (
              <p className="brand-info__description is-muted">No brand description added yet.</p>
            )}

            <div className="brand-info-list">
              <InfoRow label="Industry">
                <strong>{brand.industry || 'Uncategorized'}</strong>
              </InfoRow>
              <InfoRow label="Country">
                <strong>{brand.country || 'Not set'}</strong>
              </InfoRow>
              <InfoRow label="Timezone">
                <strong>{brand.timezoneLabel || brand.timezone || 'Not set'}</strong>
                {brand.timezone ? <small className="brand-info-sub">{brand.timezone}</small> : null}
              </InfoRow>
              <InfoRow label="Website">
                {brand.website ? (
                  <a
                    className="brand-link"
                    href={brand.website}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {displayUrl(brand.website)}
                    <svg aria-hidden="true" className="icon">
                      <use href="#i-external" />
                    </svg>
                  </a>
                ) : (
                  <span className="brand-info-muted">Not provided</span>
                )}
              </InfoRow>
              <InfoRow label="Drive folder">
                {brand.driveFolderUrl ? (
                  <a
                    className="brand-link"
                    href={brand.driveFolderUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open Drive folder
                    <svg aria-hidden="true" className="icon">
                      <use href="#i-external" />
                    </svg>
                  </a>
                ) : (
                  <span className="brand-info-muted">Not connected</span>
                )}
              </InfoRow>
              <InfoRow label="Account manager">
                {brand.manager ? (
                  <span className="brand-info-person">
                    <span className="brand-mini-avatar">
                      {brand.managerInitials || initialsOf(brand.manager)}
                    </span>
                    <span>
                      <strong>{brand.manager}</strong>
                      <small>{brand.managerRole || brand.managerEmail}</small>
                    </span>
                  </span>
                ) : (
                  <span className="brand-info-muted">Unassigned</span>
                )}
              </InfoRow>
              <InfoRow label="Team">
                <strong>{brand.team || 'Unassigned'}</strong>
                {brand.teamMembers ? (
                  <small className="brand-info-sub">{brand.teamMembers}</small>
                ) : null}
              </InfoRow>
              <InfoRow label="Onboarded">
                <strong>{formatDate(brand.createdAt)}</strong>
              </InfoRow>
              <InfoRow label="Status">
                <span className={`brand-status is-${brand.status}`}>
                  <i className="brand-status__dot" aria-hidden="true" />
                  {statusLabel}
                </span>
              </InfoRow>
            </div>
          </section>

          <section className="cl-card brand-contact-card">
            <div className="brand-section-head">
              <div>
                <h2 className="brand-section-title">
                  <span className="brand-section-icon">
                    <svg aria-hidden="true" className="icon">
                      <use href="#i-user" />
                    </svg>
                  </span>
                  Primary Contact
                </h2>
                <p className="brand-section-sub">Day-to-day brand stakeholder.</p>
              </div>
            </div>

            {brand.contactName ? (
              <>
                <div className="brand-contact">
                  <span className="brand-contact__avatar">
                    {initialsOf(brand.contactName)}
                  </span>
                  <div className="brand-contact__copy">
                    <strong>{brand.contactName}</strong>
                    <small>{brand.contactRole || 'Primary contact'}</small>
                  </div>
                </div>

                <div className="brand-contact__links">
                  {brand.contactEmail ? (
                    <a href={`mailto:${brand.contactEmail}`}>
                      <svg aria-hidden="true" className="icon">
                        <use href="#i-mail" />
                      </svg>
                      {brand.contactEmail}
                    </a>
                  ) : null}
                  {brand.contactPhone ? (
                    <a href={`tel:${brand.contactPhone}`}>
                      <svg aria-hidden="true" className="icon">
                        <use href="#i-phone" />
                      </svg>
                      {brand.contactPhone}
                    </a>
                  ) : null}
                </div>
              </>
            ) : (
              <p className="brand-info-muted brand-contact__empty">
                No primary contact has been added for this brand yet.
              </p>
            )}
          </section>
        </aside>
      </div>
      ) : null}

      {tab === 'brief' ? <BrandBriefSection brand={brand} onToast={notify} /> : null}

      {tab === 'strategy' ? <ContentStrategySection brand={brand} onToast={notify} /> : null}

      {tab === 'direction' ? (
        <PlanDirectionSection
          brand={brand}
          onToast={notify}
          onAddPlatform={() => setPlatformModal({})}
          onAddContent={(contentMonth, platformId) => onAddContent?.(contentMonth, platformId)}
          initialPlatformId={directionsFocus?.platformId}
          initialMonth={directionsFocus?.month}
        />
      ) : null}

      {tab === 'assets' ? <FilesAssetsSection brand={brand} onToast={notify} /> : null}

      {tab === 'social' ? (
        <SocialPlatformsSection
          brand={brand}
          onAddPlatform={() => setPlatformModal({})}
          onEditPlatform={(platform) => setPlatformModal(platform)}
          onDeletePlatform={(platform) => setPlatformToDelete(platform)}
          onOpenPlan={(platformId) => openDirections(platformId, monthKey())}
        />
      ) : null}
        </div>
      )}

      {planOpen ? (
        <PlanModal
          brand={brand}
          initialMonth={month}
          plans={brandPlans}
          onClose={() => setPlanOpen(false)}
          onSave={handleSavePlan}
        />
      ) : null}

      <Modal
        isOpen={archiveOpen}
        onClose={archiveBusy ? () => {} : () => setArchiveOpen(false)}
        title={isArchived ? 'Restore brand?' : 'Archive brand?'}
        subtitle={
          isArchived
            ? `${brand.name} will return to the active workspace.`
            : `${brand.name} will be hidden from active work but kept intact.`
        }
        icon="#i-archive"
        iconColor="amber"
        maxWidth="480px"
        footer={
          <>
            <button
              type="button"
              className="button button--ghost"
              onClick={() => setArchiveOpen(false)}
              disabled={archiveBusy}
            >
              Cancel
            </button>
            <button
              type="button"
              className={`button ${isArchived ? 'button--primary' : 'button--dark'}`}
              onClick={handleArchive}
              disabled={archiveBusy}
            >
              <svg aria-hidden="true" className="icon">
                <use href={isArchived ? '#i-check' : '#i-archive'} />
              </svg>
              {archiveBusy ? 'Saving…' : isArchived ? 'Restore Brand' : 'Archive Brand'}
            </button>
          </>
        }
      >
        <p className="modal-copy">
          {isArchived ? (
            <>
              Restoring <strong>{brand.name}</strong> makes it active again. Its plans, content and
              assets are unchanged.
            </>
          ) : (
            <>
              Archiving <strong>{brand.name}</strong> keeps every plan, content item and asset, but
              removes the brand from active work. You can restore it at any time.
            </>
          )}
        </p>
      </Modal>

      <Modal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete brand?"
        subtitle={`This will permanently remove ${brand.name} from the workspace.`}
        icon="#i-trash"
        iconColor="amber"
        maxWidth="480px"
        footer={
          <>
            <button
              type="button"
              className="button button--ghost"
              onClick={() => setDeleteOpen(false)}
            >
              Cancel
            </button>
            <button type="button" className="button button--danger" onClick={handleDelete}>
              <svg aria-hidden="true" className="icon">
                <use href="#i-trash" />
              </svg>
              Delete Brand
            </button>
          </>
        }
      >
        <p className="modal-copy">
          Deleting <strong>{brand.name}</strong> also removes its monthly plans and all content
          items. This action cannot be undone.
        </p>
        <div className="modal-info-card">
          <div className="modal-info-card__title">
            {brandPlans.length} {brandPlans.length === 1 ? 'monthly plan' : 'monthly plans'} ·{' '}
            {brandContent.length} {brandContent.length === 1 ? 'content item' : 'content items'}
          </div>
          <p className="modal-info-card__text">
            Consider archiving the brand instead if you only need to pause the workspace.
          </p>
        </div>
      </Modal>

      {editOpen && brand ? (
        <EditBrandModal
          brand={brand}
          onClose={() => setEditOpen(false)}
          onSave={handleEditSave}
        />
      ) : null}

      {platformModal !== null ? (
        <AddPlatformModal
          brand={brand}
          platform={platformModal.id ? platformModal : undefined}
          onClose={() => setPlatformModal(null)}
          onSave={handleSavePlatform}
        />
      ) : null}

      <ConfirmModal
        isOpen={Boolean(platformToDelete)}
        onClose={() => setPlatformToDelete(null)}
        title="Delete platform?"
        subtitle={platformToDelete ? `${platformToDelete.name} will be removed from ${brand.name}.` : ''}
        icon="#i-trash"
        iconColor="amber"
        confirmText="Delete Platform"
        onConfirm={confirmDeletePlatform}
      >
        <p className="modal-copy">
          Its plan directions will be removed too. Content items already created stay in the
          monthly calendar.
        </p>
      </ConfirmModal>

      <Toast message={toast?.message} tone={toast?.tone} />
    </div>
  );
}
