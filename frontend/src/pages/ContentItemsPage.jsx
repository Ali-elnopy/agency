import React, { useMemo, useState } from 'react';
import Modal from '../components/common/Modal';
import Toast from '../components/ui/Toast';
import useToast from '../hooks/useToast';
import { useBrands } from '../context/brandsStore';
import { useSprint3 } from '../context/sprint3Store';
import ContentDetailsModal from '../components/sprint3/ContentDetailsModal';
import {
  CONTENT_STATUSES,
  CONTENT_STATUS_LABEL,
  CONTENT_TYPE_LABEL,
  formatDate,
  monthKey,
  monthLabel,
} from '../data/brands';
import { linesOf } from '../data/sprint3';
import {
  EmptyState,
  PageHeader,
  Stat,
  StatusPill,
} from '../components/sprint3/Sprint3UI';

const STATUS_TONE = {
  planned: 'is-amber',
  delivered: 'is-green',
  delayed: 'is-red',
};

const CAMPAIGN_COLORS = ['is-orange', 'is-blue', 'is-purple', 'is-green', 'is-pink'];

const EMPTY_CAMPAIGN = {
  name: '',
  objective: '',
  startDate: '',
  endDate: '',
};

export default function ContentItemsPage({ initialBrandId, onOpenPlan }) {
  const { brands, content, updateContent } = useBrands();
  const {
    getApprovedStrategy,
    getCampaigns,
    addCampaign,
    deleteCampaign,
    getContentMeta,
    saveContentMeta,
    autoConvertContentToTasks,
    role,
    t,
  } = useSprint3();
  const { toast, showToast } = useToast(4500);

  const activeBrands = brands.filter((brand) => brand.status !== 'archived');
  const [brandId, setBrandId] = useState(initialBrandId || activeBrands[0]?.id || '');
  const [month, setMonth] = useState(() => monthKey());
  const [view, setView] = useState('table');
  const [campaignFilter, setCampaignFilter] = useState('all');
  const [pillarFilter, setPillarFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [detailsItem, setDetailsItem] = useState(null);
  const [campaignModal, setCampaignModal] = useState(false);
  const [campaignForm, setCampaignForm] = useState(EMPTY_CAMPAIGN);
  const [campaignError, setCampaignError] = useState('');
  const [campaignToDelete, setCampaignToDelete] = useState(null);

  const brand = brands.find((item) => String(item.id) === String(brandId)) ?? null;
  const strategy = brand ? getApprovedStrategy(brand.id) : null;
  const campaigns = brand ? getCampaigns(brand.id) : [];
  const canEdit = role !== 'client';

  const pillars = useMemo(() => {
    const fromStrategy = linesOf(strategy?.sections?.pillars?.body ?? '');
    const fromItems = content
      .filter((item) => String(item.brandId) === String(brandId))
      .map((item) => getContentMeta(item.id).pillar || item.pillar)
      .filter(Boolean);
    return Array.from(new Set([...fromStrategy, ...fromItems]));
  }, [strategy, content, brandId, getContentMeta]);

  const items = useMemo(
    () =>
      content
        .filter((item) => String(item.brandId) === String(brandId) && item.month === month)
        .filter((item) => {
          const meta = getContentMeta(item.id);
          const campaignId = meta.campaignId ?? item.campaignId ?? '';
          const pillar = meta.pillar ?? item.pillar ?? '';
          if (campaignFilter !== 'all' && campaignId !== campaignFilter) return false;
          if (pillarFilter !== 'all' && pillar !== pillarFilter) return false;
          if (statusFilter !== 'all' && item.status !== statusFilter) return false;
          return true;
        })
        .sort((a, b) =>
          `${a.publishDate}T${a.publishTime}`.localeCompare(
            `${b.publishDate}T${b.publishTime}`,
          ),
        ),
    [content, brandId, month, campaignFilter, pillarFilter, statusFilter, getContentMeta],
  );

  const months = useMemo(() => {
    const keys = content
      .filter((item) => String(item.brandId) === String(brandId))
      .map((item) => item.month)
      .filter(Boolean);
    return Array.from(new Set([monthKey(), ...keys])).sort().reverse();
  }, [content, brandId]);

  const linked = items.filter((item) => {
    const meta = getContentMeta(item.id);
    return Boolean(meta.pillar || item.pillar);
  }).length;
  const inCampaign = items.filter((item) => {
    const meta = getContentMeta(item.id);
    return Boolean(meta.campaignId || item.campaignId);
  }).length;
  const detailsReady = items.filter(
    (item) => getContentMeta(item.id).detailsStatus === 'saved',
  ).length;

  const applyStrategyDefaults = () => {
    if (!strategy) return;
    const defaultPillar = pillars[0] ?? '';
    const defaultPlatform = strategy.platforms?.[0] ?? '';
    let touched = 0;

    items.forEach((item) => {
      const meta = getContentMeta(item.id);
      const patch = {};
      if (!meta.pillar && !item.pillar && defaultPillar) patch.pillar = defaultPillar;
      if (!meta.platform && !item.platform && defaultPlatform) patch.platform = defaultPlatform;
      if (Object.keys(patch).length) {
        touched += 1;
        updateContent(item.id, patch);
        saveContentMeta(item.id, patch);
      }
    });

    showToast(
      touched
        ? `${touched} ${t('items linked to the approved strategy.')}`
        : t('Every item is already linked.'),
      touched ? 'success' : 'info',
    );
  };

  const setItemField = (item, key, value) => {
    updateContent(item.id, { [key]: value });
    saveContentMeta(item.id, { [key]: value });
  };

  const createCampaign = () => {
    if (!campaignForm.name.trim()) {
      setCampaignError(t('Campaign name is required.'));
      return;
    }
    addCampaign({
      brandId,
      ...campaignForm,
      name: campaignForm.name.trim(),
      color: CAMPAIGN_COLORS[campaigns.length % CAMPAIGN_COLORS.length],
    });
    setCampaignForm(EMPTY_CAMPAIGN);
    setCampaignModal(false);
    setCampaignError('');
    showToast(t('Campaign created.'), 'success');
  };

  const campaignName = (id) => campaigns.find((campaign) => campaign.id === id)?.name ?? '';

  const renderCampaignSelect = (item) => {
    const meta = getContentMeta(item.id);
    const value = meta.campaignId ?? item.campaignId ?? '';
    return (
      <span className="form-select-wrap s3-inline-select">
        <select
          className="form-select"
          value={value}
          onChange={(event) => setItemField(item, 'campaignId', event.target.value)}
          aria-label={t('Campaign')}
          disabled={!canEdit}
        >
          <option value="">{t('No campaign')}</option>
          {campaigns.map((campaign) => (
            <option key={campaign.id} value={campaign.id}>
              {campaign.name}
            </option>
          ))}
        </select>
        <svg aria-hidden="true" className="icon">
          <use href="#i-chevron" />
        </svg>
      </span>
    );
  };

  const renderPillarSelect = (item) => {
    const meta = getContentMeta(item.id);
    const value = meta.pillar ?? item.pillar ?? '';
    return (
      <span className="form-select-wrap s3-inline-select">
        <select
          className="form-select"
          value={value}
          onChange={(event) => setItemField(item, 'pillar', event.target.value)}
          aria-label={t('Pillar')}
          disabled={!canEdit}
        >
          <option value="">{t('No pillar')}</option>
          {Array.from(new Set([...pillars, value].filter(Boolean))).map((pillar) => (
            <option key={pillar} value={pillar}>
              {pillar}
            </option>
          ))}
        </select>
        <svg aria-hidden="true" className="icon">
          <use href="#i-chevron" />
        </svg>
      </span>
    );
  };

  const renderDetailsStatus = (item) => {
    const meta = getContentMeta(item.id);
    const ready = meta.detailsStatus === 'saved';
    return (
      <span className={`s3-detail-state${ready ? ' is-ready' : ''}`}>
        <i aria-hidden="true" />
        {ready ? t('Details ready') : t('Details draft')}
      </span>
    );
  };

  return (
    <div className="page-screen s3-page">
      <PageHeader
        eyebrow={t('Content Items')}
        title={t('Content Plan & Items')}
        description={t(
          'The plan is re-linked to the approved strategy: pillars and platforms flow in automatically, and every item can join one campaign.',
        )}
        actions={
          <div className="s3-head-actions">
            <span className="form-select-wrap">
              <select
                className="form-select"
                value={brandId}
                onChange={(event) => setBrandId(event.target.value)}
                aria-label={t('Brand')}
              >
                {activeBrands.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
              <svg aria-hidden="true" className="icon">
                <use href="#i-chevron" />
              </svg>
            </span>
            <button
              type="button"
              className="button button--primary"
              onClick={() => onOpenPlan?.(brandId, month)}
            >
              <svg aria-hidden="true" className="icon">
                <use href="#i-calendar" />
              </svg>
              {t('Open plan sheet')}
            </button>
          </div>
        }
      />

      {strategy ? (
        <section className="s3-linked-banner">
          <span className="s3-linked-banner__icon">
            <svg aria-hidden="true" className="icon">
              <use href="#i-layers" />
            </svg>
          </span>
          <div>
            <strong>{t('Linked strategy')}: {strategy.title}</strong>
            <p>
              {t('Auto-filled from the approved strategy')} · {pillars.length} {t('pillars')} ·{' '}
              {(strategy.platforms ?? []).length} {t('platforms')}
            </p>
          </div>
          {canEdit ? (
            <button type="button" className="button button--ghost button--sm" onClick={applyStrategyDefaults}>
              <svg aria-hidden="true" className="icon">
                <use href="#i-zap" />
              </svg>
              {t('Apply strategy defaults')}
            </button>
          ) : null}
        </section>
      ) : (
        <section className="s3-warning">
          <svg aria-hidden="true" className="icon">
            <use href="#i-alert" />
          </svg>
          <span>
            {t(
              'No approved strategy for this brand yet. Approve the strategy to auto-fill pillars and platforms.',
            )}
          </span>
        </section>
      )}

      <div className="s3-stats">
        <Stat label={t('Items')} value={items.length} note={monthLabel(month)} />
        <Stat label={t('Pillar linked')} value={linked} note={t('Pulled from strategy')} />
        <Stat label={t('In a campaign')} value={inCampaign} note={t('One campaign per item')} />
        <Stat label={t('Details ready')} value={detailsReady} note={t('Caption & assets complete')} />
      </div>

      <section className="s3-toolbar s3-toolbar--wrap">
        <span className="form-select-wrap s3-toolbar__select">
          <select
            className="form-select"
            value={month}
            onChange={(event) => setMonth(event.target.value)}
            aria-label={t('Month')}
          >
            {months.map((key) => (
              <option key={key} value={key}>
                {monthLabel(key)}
              </option>
            ))}
          </select>
          <svg aria-hidden="true" className="icon">
            <use href="#i-chevron" />
          </svg>
        </span>

        <span className="form-select-wrap s3-toolbar__select">
          <select
            className="form-select"
            value={campaignFilter}
            onChange={(event) => setCampaignFilter(event.target.value)}
            aria-label={t('Campaign')}
          >
            <option value="all">{t('All campaigns')}</option>
            {campaigns.map((campaign) => (
              <option key={campaign.id} value={campaign.id}>
                {campaign.name}
              </option>
            ))}
          </select>
          <svg aria-hidden="true" className="icon">
            <use href="#i-chevron" />
          </svg>
        </span>

        <span className="form-select-wrap s3-toolbar__select">
          <select
            className="form-select"
            value={pillarFilter}
            onChange={(event) => setPillarFilter(event.target.value)}
            aria-label={t('Pillar')}
          >
            <option value="all">{t('All pillars')}</option>
            {pillars.map((pillar) => (
              <option key={pillar} value={pillar}>
                {pillar}
              </option>
            ))}
          </select>
          <svg aria-hidden="true" className="icon">
            <use href="#i-chevron" />
          </svg>
        </span>

        <span className="form-select-wrap s3-toolbar__select">
          <select
            className="form-select"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            aria-label={t('Status')}
          >
            <option value="all">{t('All statuses')}</option>
            {CONTENT_STATUSES.map((status) => (
              <option key={status.id} value={status.id}>
                {t(status.label)}
              </option>
            ))}
          </select>
          <svg aria-hidden="true" className="icon">
            <use href="#i-chevron" />
          </svg>
        </span>

        <span className="s3-view-toggle">
          <button
            type="button"
            className={view === 'table' ? 'is-active' : ''}
            onClick={() => setView('table')}
          >
            <svg aria-hidden="true" className="icon">
              <use href="#i-table" />
            </svg>
            {t('Table')}
          </button>
          <button
            type="button"
            className={view === 'kanban' ? 'is-active' : ''}
            onClick={() => setView('kanban')}
          >
            <svg aria-hidden="true" className="icon">
              <use href="#i-layers" />
            </svg>
            {t('Kanban')}
          </button>
        </span>

        {canEdit ? (
          <>
            <button
              type="button"
              className="button button--ghost button--sm"
              onClick={() => {
                const count = autoConvertContentToTasks(filtered, brandId, brand?.name);
                showToast(
                  count > 0
                    ? `${count} ${t('Convert Content to Tasks')} ✓`
                    : t('All content items are already converted to tasks!'),
                  count > 0 ? 'success' : 'info',
                );
              }}
              title={t('Convert Content to Tasks')}
            >
              <svg aria-hidden="true" className="icon">
                <use href="#i-zap" />
              </svg>
              {t('Convert Content to Tasks')}
            </button>
            <button
              type="button"
              className="button button--ghost button--sm"
              onClick={() => setCampaignModal(true)}
            >
              <svg aria-hidden="true" className="icon">
                <use href="#i-plus" />
              </svg>
              {t('New campaign')}
            </button>
          </>
        ) : null}
      </section>

      <section className="s3-card s3-campaigns">
        <header className="s3-card__head">
          <div>
            <span className="s3-eyebrow">{t('Campaigns')}</span>
            <h2>{t('Campaign grouping')}</h2>
          </div>
          <StatusPill label={`${campaigns.length}`} tone="is-purple" />
        </header>

        {campaigns.length ? (
          <div className="s3-campaign-grid">
            {campaigns.map((campaign) => {
              const count = content.filter((item) => {
                const meta = getContentMeta(item.id);
                return (
                  String(item.brandId) === String(brandId) &&
                  (meta.campaignId ?? item.campaignId) === campaign.id
                );
              }).length;

              return (
                <article className={`s3-campaign ${campaign.color}`} key={campaign.id}>
                  <div className="s3-campaign__top">
                    <strong>{campaign.name}</strong>
                    {canEdit ? (
                      <button
                        type="button"
                        className="s3-mini-btn is-danger"
                        onClick={() => setCampaignToDelete(campaign)}
                        aria-label={`${t('Delete')} ${campaign.name}`}
                      >
                        <svg aria-hidden="true" className="icon">
                          <use href="#i-trash" />
                        </svg>
                      </button>
                    ) : null}
                  </div>
                  <p>{campaign.objective || t('No objective set.')}</p>
                  <footer>
                    <span>{count} {t('items')}</span>
                    <span>
                      {campaign.startDate || '—'} → {campaign.endDate || '—'}
                    </span>
                  </footer>
                </article>
              );
            })}
          </div>
        ) : (
          <p className="s3-muted">
            {t('No campaigns for this brand yet. Create one to group the plan.')}
          </p>
        )}
      </section>

      {items.length ? (
        view === 'table' ? (
          <section className="s3-card">
            <div className="s3-table-wrap">
              <table className="s3-table">
                <thead>
                  <tr>
                    <th>{t('Content')}</th>
                    <th>{t('Platform')}</th>
                    <th>{t('Date')}</th>
                    <th>{t('Pillar')}</th>
                    <th>{t('Campaign')}</th>
                    <th>{t('Status')}</th>
                    <th>{t('Details')}</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => {
                    const meta = getContentMeta(item.id);
                    const platform = meta.platform ?? item.platform ?? '';
                    return (
                      <tr key={item.id}>
                        <td>
                          <div className="s3-item-cell">
                            <span className={`content-item__icon is-${item.type}`}>
                              <svg aria-hidden="true" className="icon">
                                <use href={item.type === 'reel' ? '#i-camera' : '#i-file'} />
                              </svg>
                            </span>
                            <span>
                              <strong>{item.title}</strong>
                              <small>
                                {t(CONTENT_TYPE_LABEL[item.type] ?? item.type)}
                                {item.tov ? ` · ${item.tov}` : ''}
                              </small>
                            </span>
                          </div>
                        </td>
                        <td>
                          {platform ? (
                            <StatusPill label={platform} tone="is-blue" />
                          ) : (
                            <span className="s3-muted">—</span>
                          )}
                        </td>
                        <td className="s3-nowrap">{formatDate(item.publishDate)}</td>
                        <td>{renderPillarSelect(item)}</td>
                        <td>{renderCampaignSelect(item)}</td>
                        <td>
                          <StatusPill
                            label={t(CONTENT_STATUS_LABEL[item.status] ?? item.status)}
                            tone={STATUS_TONE[item.status] ?? 'is-gray'}
                          />
                        </td>
                        <td>
                          <button
                            type="button"
                            className="button button--ghost button--xs"
                            onClick={() => setDetailsItem(item)}
                          >
                            {t('Open')}
                          </button>
                          <div className="s3-detail-under">{renderDetailsStatus(item)}</div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        ) : (
          <div className="s3-kanban">
            {CONTENT_STATUSES.map((status) => {
              const columnItems = items.filter((item) => item.status === status.id);
              return (
                <section className={`s3-kanban-col is-${status.id}`} key={status.id}>
                  <header>
                    <strong>{t(status.label)}</strong>
                    <span>{columnItems.length}</span>
                  </header>
                  {columnItems.map((item) => {
                    const meta = getContentMeta(item.id);
                    return (
                      <article className="s3-kanban-card" key={item.id}>
                        <span className="s3-kanban-card__type">
                          {t(CONTENT_TYPE_LABEL[item.type] ?? item.type)}
                        </span>
                        <strong>{item.title}</strong>
                        <small>{formatDate(item.publishDate)}</small>
                        <div className="s3-kanban-card__tags">
                          {meta.pillar || item.pillar ? (
                            <span>{meta.pillar ?? item.pillar}</span>
                          ) : null}
                          {meta.platform || item.platform ? (
                            <span>{meta.platform ?? item.platform}</span>
                          ) : null}
                          {meta.campaignId || item.campaignId ? (
                            <span className="is-campaign">
                              {campaignName(meta.campaignId ?? item.campaignId)}
                            </span>
                          ) : null}
                        </div>
                        <button
                          type="button"
                          className="button button--ghost button--xs"
                          onClick={() => setDetailsItem(item)}
                        >
                          {t('Content details')}
                        </button>
                      </article>
                    );
                  })}
                  {!columnItems.length ? (
                    <p className="s3-kanban-empty">{t('No items')}</p>
                  ) : null}
                </section>
              );
            })}
          </div>
        )
      ) : (
        <EmptyState
          icon="#i-calendar"
          title={t('No items for this month')}
          text={t('Open the plan sheet to add posts and reels, then link them to the strategy.')}
          action={
            <button
              type="button"
              className="button button--primary"
              onClick={() => onOpenPlan?.(brandId, month)}
            >
              {t('Open plan sheet')}
            </button>
          }
        />
      )}

      {detailsItem ? (
        <ContentDetailsModal
          content={detailsItem}
          brand={brand}
          strategy={strategy}
          onClose={() => setDetailsItem(null)}
          onSaved={(state) => {
            setDetailsItem(null);
            showToast(
              state === 'saved' ? t('Content details saved.') : t('Details saved as draft'),
              'success',
            );
          }}
        />
      ) : null}

      <Modal
        isOpen={campaignModal}
        onClose={() => setCampaignModal(false)}
        title={t('New campaign')}
        subtitle={t('Group related content items under one campaign.')}
        icon="#i-layers"
        iconColor="purple"
        maxWidth="520px"
        footer={
          <>
            <button type="button" className="button button--ghost" onClick={() => setCampaignModal(false)}>
              {t('Cancel')}
            </button>
            <button type="button" className="button button--primary" onClick={createCampaign}>
              {t('Create campaign')}
            </button>
          </>
        }
      >
        <div className="s3-form-grid">
          <label className="s3-field s3-field--full">
            <span className="s3-field__label">{t('Campaign name')} *</span>
            <input
              className="form-input"
              value={campaignForm.name}
              onChange={(event) => {
                setCampaignForm((prev) => ({ ...prev, name: event.target.value }));
                setCampaignError('');
              }}
              placeholder="Always-On Care"
            />
            {campaignError ? <span className="set-error">{campaignError}</span> : null}
          </label>

          <label className="s3-field s3-field--full">
            <span className="s3-field__label">{t('Objective')}</span>
            <textarea
              className="form-textarea"
              rows={2}
              value={campaignForm.objective}
              onChange={(event) =>
                setCampaignForm((prev) => ({ ...prev, objective: event.target.value }))
              }
              placeholder={t('What the campaign should achieve…')}
            />
          </label>

          <label className="s3-field">
            <span className="s3-field__label">{t('Start date')}</span>
            <input
              type="date"
              className="form-input"
              value={campaignForm.startDate}
              onChange={(event) =>
                setCampaignForm((prev) => ({ ...prev, startDate: event.target.value }))
              }
            />
          </label>

          <label className="s3-field">
            <span className="s3-field__label">{t('End date')}</span>
            <input
              type="date"
              className="form-input"
              value={campaignForm.endDate}
              onChange={(event) =>
                setCampaignForm((prev) => ({ ...prev, endDate: event.target.value }))
              }
            />
          </label>
        </div>
      </Modal>

      <Modal
        isOpen={Boolean(campaignToDelete)}
        onClose={() => setCampaignToDelete(null)}
        title={t('Delete campaign?')}
        subtitle={campaignToDelete?.name}
        icon="#i-trash"
        iconColor="amber"
        maxWidth="440px"
        footer={
          <>
            <button type="button" className="button button--ghost" onClick={() => setCampaignToDelete(null)}>
              {t('Cancel')}
            </button>
            <button
              type="button"
              className="button button--danger"
              onClick={() => {
                deleteCampaign(campaignToDelete.id);
                setCampaignToDelete(null);
                showToast(t('Campaign deleted.'), 'success');
              }}
            >
              {t('Delete')}
            </button>
          </>
        }
      >
        <p className="modal-copy">
          {t('Items in this campaign stay in the plan and become unassigned.')}
        </p>
      </Modal>

      <Toast message={toast?.message} tone={toast?.tone} />
    </div>
  );
}
