import React, { useMemo, useState } from 'react';
import Toast from '../components/ui/Toast';
import useToast from '../hooks/useToast';
import useAuth from '../hooks/useAuth';
import { useBrands } from '../context/brandsStore';
import { useSprint3 } from '../context/sprint3Store';
import {
  STRATEGY_FLOW_LABEL,
  STRATEGY_FLOW_TONE,
  STRATEGY_SECTIONS,
  formatStamp,
} from '../data/sprint3';
import {
  EmptyState,
  PageHeader,
  StatusPill,
} from '../components/sprint3/Sprint3UI';

const BRIEF_SECTION_LABEL = {
  overview: 'Brand overview',
  goals: 'Goals',
  audience: 'Audience',
  competitors: 'Competitors',
  tone: 'Tone of voice',
  messages: 'Key messages',
};

const PLATFORM_PRESETS = ['Instagram', 'TikTok', 'LinkedIn', 'YouTube', 'Facebook', 'X'];

const emptyDraft = (brand, brief) => ({
  id: null,
  brandId: brand?.id,
  brandName: brand?.name,
  briefId: brief?.id ?? '',
  title: '',
  platforms: [],
  sections: STRATEGY_SECTIONS.reduce((sections, section) => {
    sections[section.id] = { body: '', briefSection: '' };
    return sections;
  }, {}),
});

export default function StrategyWorkspacePage({ initialBrandId, onOpenBriefs, onOpenContent }) {
  const { user } = useAuth();
  const { brands, getPlatforms } = useBrands();
  const {
    briefs,
    strategies: allStrategies,
    saveStrategy,
    setStrategyStatus,
    role,
    t,
  } = useSprint3();
  const { toast, showToast } = useToast(5000);

  const activeBrands = brands.filter((brand) => brand.status !== 'archived');
  const [brandId, setBrandId] = useState(initialBrandId || activeBrands[0]?.id || '');
  const [editor, setEditor] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [reviewNote, setReviewNote] = useState('');
  const [clientReason, setClientReason] = useState('');
  const [clientError, setClientError] = useState('');

  const brand = brands.find((item) => String(item.id) === String(brandId)) ?? null;
  const approvedBrief = useMemo(
    () =>
      briefs
        .filter(
          (brief) =>
            String(brief.brandId) === String(brandId) && brief.status === 'approved',
        )
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0] ?? null,
    [briefs, brandId],
  );

  const strategies = useMemo(
    () =>
      allStrategies
        .filter((item) => String(item.brandId) === String(brandId))
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [brandId, allStrategies],
  );

  const strategy = strategies.find((item) => item.id === selectedId) ?? strategies[0] ?? null;

  const canCreate = role === 'creative' || role === 'admin' || role === 'account_manager';
  const isEditing = Boolean(editor);
  const strategyStatus = strategy?.status ?? 'draft';
  const canEditStrategy =
    isEditing ||
    ((role === 'creative' || role === 'admin') &&
      (strategyStatus === 'draft' || strategyStatus === 'changes_requested'));
  const canReview =
    (role === 'account_manager' || role === 'admin') && strategyStatus === 'in_review';
  const canClientReview =
    (role === 'client' || role === 'admin') && strategyStatus === 'client_review';
  const isApproved = strategyStatus === 'approved';

  const platformOptions = useMemo(() => {
    const names = [
      ...(brand ? getPlatforms(brand.id).map((platform) => platform.name) : []),
      ...PLATFORM_PRESETS,
      ...(strategy?.platforms ?? []),
    ];
    return Array.from(new Set(names.filter(Boolean)));
  }, [brand, getPlatforms, strategy]);

  const startNew = () => {
    if (!brand || !approvedBrief) return;
    setEditor(emptyDraft(brand, approvedBrief));
    setSelectedId(null);
    setReviewNote('');
    setClientReason('');
    setClientError('');
  };

  const startEdit = () => {
    if (!strategy) return;
    setEditor({
      id: strategy.id,
      brandId: strategy.brandId,
      brandName: strategy.brandName,
      briefId: strategy.briefId,
      title: strategy.title,
      platforms: [...(strategy.platforms ?? [])],
      sections: STRATEGY_SECTIONS.reduce((sections, section) => {
        sections[section.id] = {
          body: strategy.sections?.[section.id]?.body ?? '',
          briefSection: strategy.sections?.[section.id]?.briefSection ?? '',
        };
        return sections;
      }, {}),
    });
  };

  const setSection = (sectionId, patch) => {
    setEditor((prev) => ({
      ...prev,
      sections: {
        ...prev.sections,
        [sectionId]: { ...prev.sections[sectionId], ...patch },
      },
    }));
  };

  const togglePlatform = (name) => {
    setEditor((prev) => ({
      ...prev,
      platforms: prev.platforms.includes(name)
        ? prev.platforms.filter((item) => item !== name)
        : [...prev.platforms, name],
    }));
  };

  const persist = (status) => {
    if (!editor) return null;

    if (!editor.title.trim()) {
      showToast(t('Give the strategy a title first.'), 'danger');
      return null;
    }

    const payload = {
      id: editor.id ?? undefined,
      brandId: editor.brandId,
      brandName: editor.brandName,
      briefId: editor.briefId,
      title: editor.title,
      platforms: editor.platforms,
      sections: editor.sections,
      status,
      authorName: editor.id
        ? undefined
        : user?.fullName || 'Content Creator',
    };

    const saved = saveStrategy(payload);
    setEditor(null);
    if (!editor.id && saved?.id) setSelectedId(saved.id);
    return saved;
  };

  const handleSaveDraft = () => {
    const saved = persist('draft');
    if (saved) showToast(t('Strategy saved as a draft.'), 'success');
  };

  const handleSubmit = () => {
    const filled = STRATEGY_SECTIONS.filter(
      (section) => String(editor?.sections?.[section.id]?.body ?? '').trim(),
    );
    if (filled.length < 3) {
      showToast(t('Fill at least three strategy sections before submitting.'), 'danger');
      return;
    }
    const saved = persist('in_review');
    if (saved) showToast(t('Strategy sent to the account manager for review.'), 'success');
  };

  const handleReturn = () => {
    if (!strategy) return;
    if (!reviewNote.trim()) {
      showToast(t('Add a review note before returning the strategy.'), 'danger');
      return;
    }
    setStrategyStatus(strategy.id, 'changes_requested', {
      reviewerNote: reviewNote.trim(),
      reviewerName: user?.fullName || 'Account Manager',
    });
    setReviewNote('');
    showToast(t('Strategy returned to the content creator.'), 'info');
  };

  const handleSendToClient = () => {
    if (!strategy) return;
    setStrategyStatus(strategy.id, 'client_review', {
      reviewerNote: reviewNote.trim(),
      reviewerName: user?.fullName || 'Account Manager',
    });
    setReviewNote('');
    showToast(t('Strategy approved and sent to the client.'), 'success');
  };

  const handleClientApprove = () => {
    if (!strategy) return;
    setStrategyStatus(strategy.id, 'approved', {
      clientName: user?.fullName || 'Client',
      clientReason: '',
      approvedAt: new Date().toISOString(),
    });
    showToast(t('Strategy approved. The content plan is now linked.'), 'success');
  };

  const handleClientChanges = () => {
    if (!strategy) return;
    if (!clientReason.trim()) {
      setClientError(t('Reason is required'));
      return;
    }
    setStrategyStatus(strategy.id, 'changes_requested', {
      clientName: user?.fullName || 'Client',
      clientReason: clientReason.trim(),
    });
    setClientReason('');
    setClientError('');
    showToast(t('Your change request was sent to the account manager.'), 'info');
  };

  const renderReadOnlySections = (source) => (
    <div className="s3-strategy-read">
      {STRATEGY_SECTIONS.map((section) => {
        const body = source?.sections?.[section.id]?.body ?? '';
        const linked = source?.sections?.[section.id]?.briefSection ?? '';
        return (
          <article className="s3-strategy-read__section" key={section.id}>
            <header>
              <strong>{t(section.label)}</strong>
              {linked ? (
                <span className="s3-link-badge">
                  <svg aria-hidden="true" className="icon">
                    <use href="#i-layers" />
                  </svg>
                  {t(BRIEF_SECTION_LABEL[linked] ?? linked)}
                </span>
              ) : (
                <span className="s3-link-badge is-muted">{t('Not linked')}</span>
              )}
            </header>
            <p className={body ? undefined : 'is-muted'}>{body || t('Not written yet.')}</p>
          </article>
        );
      })}
    </div>
  );

  return (
    <div className="page-screen s3-page">
      <PageHeader
        eyebrow={t('Strategy')}
        title={t('Strategy Formulation')}
        description={t(
          'Write the strategy next to the approved brief, link every section, then move it through review to client approval.',
        )}
        actions={
          <div className="s3-head-actions">
            <span className="form-select-wrap">
              <select
                className="form-select"
                value={brandId}
                onChange={(event) => {
                  setBrandId(event.target.value);
                  setEditor(null);
                  setSelectedId(null);
                }}
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
            {canCreate ? (
              <button
                type="button"
                className="button button--primary"
                onClick={startNew}
                disabled={!approvedBrief}
              >
                <svg aria-hidden="true" className="icon">
                  <use href="#i-plus" />
                </svg>
                {t('New strategy')}
              </button>
            ) : null}
          </div>
        }
      />

      {!approvedBrief ? (
        <EmptyState
          icon="#i-file"
          title={t('No approved brief')}
          text={t(
            'The strategy editor needs an approved brief. Generate and approve the AI brief for this brand first.',
          )}
          action={
            <button type="button" className="button button--primary" onClick={() => onOpenBriefs?.()}>
              {t('Open AI Briefs')}
            </button>
          }
        />
      ) : (
        <>
          {strategies.length ? (
            <div className="s3-strategy-tabs">
              {strategies.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`s3-strategy-tab${strategy?.id === item.id && !isEditing ? ' is-active' : ''}`}
                  onClick={() => {
                    setSelectedId(item.id);
                    setEditor(null);
                    setReviewNote('');
                    setClientReason('');
                    setClientError('');
                  }}
                >
                  <span>{item.title}</span>
                  <StatusPill
                    label={t(STRATEGY_FLOW_LABEL[item.status] ?? item.status)}
                    tone={STRATEGY_FLOW_TONE[item.status] ?? 'is-gray'}
                  />
                </button>
              ))}
            </div>
          ) : null}

          {editor ? (
            <div className="s3-strategy-layout">
              <aside className="s3-card s3-brief-side">
                <header className="s3-card__head">
                  <div>
                    <span className="s3-eyebrow">{t('Approved brief')}</span>
                    <h2>{approvedBrief.brandName}</h2>
                    <p className="s3-muted">
                      {t('Approved by')} {approvedBrief.approverName} ·{' '}
                      {formatStamp(approvedBrief.approvedAt)}
                    </p>
                  </div>
                </header>

                <p className="s3-muted s3-brief-side__hint">
                  {t(
                    'Use the link selector on each strategy section to connect it to a brief section.',
                  )}
                </p>

                {Object.keys(BRIEF_SECTION_LABEL).map((key) => (
                  <div className="s3-brief-snippet" key={key}>
                    <strong>{t(BRIEF_SECTION_LABEL[key])}</strong>
                    <p>{approvedBrief.sections?.[key] || t('Not provided.')}</p>
                  </div>
                ))}
              </aside>

              <section className="s3-card s3-strategy-editor">
                <header className="s3-card__head">
                  <div>
                    <span className="s3-eyebrow">
                      {editor.id ? t('Strategy editor') : t('New strategy')}
                    </span>
                    <h2>{t('Strategy editor')}</h2>
                  </div>
                  <StatusPill
                    label={t(
                      STRATEGY_FLOW_LABEL[editor.id ? strategyStatus : 'draft'] ?? 'Draft',
                    )}
                    tone={STRATEGY_FLOW_TONE[editor.id ? strategyStatus : 'draft'] ?? 'is-gray'}
                  />
                </header>

                <label className="s3-field">
                  <span className="s3-field__label">{t('Strategy title')}</span>
                  <input
                    className="form-input"
                    value={editor.title}
                    onChange={(event) =>
                      setEditor((prev) => ({ ...prev, title: event.target.value }))
                    }
                    placeholder="Q4 Everyday Care Strategy"
                  />
                </label>

                <div className="s3-editor-sections">
                  {STRATEGY_SECTIONS.map((section) => (
                    <div className="s3-editor-section" key={section.id}>
                      <div className="s3-editor-section__head">
                        <div>
                          <strong>{t(section.label)}</strong>
                          <small>{t(section.hint)}</small>
                        </div>
                        <span className="form-select-wrap s3-link-select">
                          <select
                            className="form-select"
                            value={editor.sections[section.id].briefSection}
                            onChange={(event) =>
                              setSection(section.id, {
                                briefSection: event.target.value,
                              })
                            }
                            aria-label={t('Link to brief section')}
                          >
                            <option value="">{t('Link to brief section')}</option>
                            {Object.keys(BRIEF_SECTION_LABEL).map((key) => (
                              <option key={key} value={key}>
                                {t(BRIEF_SECTION_LABEL[key])}
                              </option>
                            ))}
                          </select>
                          <svg aria-hidden="true" className="icon">
                            <use href="#i-chevron" />
                          </svg>
                        </span>
                      </div>

                      <textarea
                        className="form-textarea"
                        rows={section.id === 'pillars' ? 4 : 3}
                        value={editor.sections[section.id].body}
                        onChange={(event) =>
                          setSection(section.id, { body: event.target.value })
                        }
                        placeholder={t(section.placeholder)}
                      />

                      {editor.sections[section.id].briefSection ? (
                        <div className="s3-linked-snippet">
                          <span>{t('From the brief')}</span>
                          <p>
                            {approvedBrief.sections?.[
                              editor.sections[section.id].briefSection
                            ] || t('This brief section is empty.')}
                          </p>
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>

                <div className="s3-field">
                  <span className="s3-field__label">{t('Platforms')}</span>
                  <p className="s3-field__hint">
                    {t('Platforms selected here are auto-filled into the content plan.')}
                  </p>
                  <div className="s3-chip-row">
                    {platformOptions.map((name) => (
                      <button
                        key={name}
                        type="button"
                        className={`s3-choice-chip${editor.platforms.includes(name) ? ' is-on' : ''}`}
                        onClick={() => togglePlatform(name)}
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                </div>

                <footer className="s3-form-actions s3-form-actions--between">
                  <button
                    type="button"
                    className="button button--ghost"
                    onClick={() => setEditor(null)}
                  >
                    {t('Cancel')}
                  </button>
                  <span className="s3-inline-actions">
                    <button type="button" className="button button--ghost" onClick={handleSaveDraft}>
                      {t('Save draft')}
                    </button>
                    <button type="button" className="button button--primary" onClick={handleSubmit}>
                      <svg aria-hidden="true" className="icon">
                        <use href="#i-send" />
                      </svg>
                      {t('Submit to account manager')}
                    </button>
                  </span>
                </footer>
              </section>
            </div>
          ) : strategy ? (
            <section className="s3-card s3-strategy-view">
              <header className="s3-card__head">
                <div>
                  <span className="s3-eyebrow">{strategy.brandName}</span>
                  <h2>
                    {strategy.title}
                    <StatusPill
                      label={t(STRATEGY_FLOW_LABEL[strategy.status] ?? strategy.status)}
                      tone={STRATEGY_FLOW_TONE[strategy.status] ?? 'is-gray'}
                    />
                  </h2>
                  <p className="s3-muted">
                    {strategy.authorName ? `${t('By')} ${strategy.authorName}` : ''} ·{' '}
                    {t('Updated')} {formatStamp(strategy.updatedAt)}
                  </p>
                </div>
                <div className="s3-head-actions">
                  {canEditStrategy ? (
                    <button type="button" className="button button--ghost" onClick={startEdit}>
                      <svg aria-hidden="true" className="icon">
                        <use href="#i-pencil" />
                      </svg>
                      {t('Edit')}
                    </button>
                  ) : null}
                  {isApproved ? (
                    <button
                      type="button"
                      className="button button--primary"
                      onClick={() => onOpenContent?.(strategy.brandId)}
                    >
                      <svg aria-hidden="true" className="icon">
                        <use href="#i-calendar" />
                      </svg>
                      {t('Open content plan')}
                    </button>
                  ) : null}
                </div>
              </header>

              <ol className="s3-flow">
                {['draft', 'in_review', 'client_review', 'approved'].map((step, index) => {
                  const currentIndex = ['draft', 'in_review', 'client_review', 'approved'].indexOf(
                    strategy.status === 'changes_requested' ? 'draft' : strategy.status,
                  );
                  return (
                    <li
                      key={step}
                      className={`${index <= currentIndex ? 'is-done' : ''}${
                        step === strategy.status ? ' is-current' : ''
                      }`}
                    >
                      <span>{index + 1}</span>
                      <strong>{t(STRATEGY_FLOW_LABEL[step])}</strong>
                    </li>
                  );
                })}
              </ol>

              {strategy.reviewerNote ? (
                <div className="s3-review-note">
                  <strong>{t('Account manager note')}</strong>
                  <p>{strategy.reviewerNote}</p>
                  {strategy.reviewerName ? <small>— {strategy.reviewerName}</small> : null}
                </div>
              ) : null}

              {strategy.clientReason ? (
                <div className="s3-review-note is-client">
                  <strong>{t('Client change request')}</strong>
                  <p>{strategy.clientReason}</p>
                  {strategy.clientName ? <small>— {strategy.clientName}</small> : null}
                </div>
              ) : null}

              {isApproved ? (
                <div className="s3-approved-banner">
                  <span className="s3-approved-banner__icon">
                    <svg aria-hidden="true" className="icon">
                      <use href="#i-check" />
                    </svg>
                  </span>
                  <div>
                    <strong>{t('The strategy is approved')}</strong>
                    <p>
                      {t('Approved by')} {strategy.clientName || strategy.reviewerName} ·{' '}
                      {formatStamp(strategy.approvedAt)}
                    </p>
                  </div>
                </div>
              ) : null}

              {renderReadOnlySections(strategy)}

              <div className="s3-platform-tags">
                <span>{t('Platforms')}</span>
                {(strategy.platforms ?? []).length ? (
                  strategy.platforms.map((name) => (
                    <span className="s3-platform-tag" key={name}>
                      {name}
                    </span>
                  ))
                ) : (
                  <em className="s3-muted">{t('None selected.')}</em>
                )}
              </div>

              {canReview ? (
                <div className="s3-review-panel">
                  <h3>{t('Account manager review')}</h3>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    value={reviewNote}
                    onChange={(event) => setReviewNote(event.target.value)}
                    placeholder={t('Notes for the creator or the client…')}
                  />
                  <div className="s3-form-actions">
                    <button type="button" className="button button--danger-ghost" onClick={handleReturn}>
                      <svg aria-hidden="true" className="icon">
                        <use href="#i-arrow" />
                      </svg>
                      {t('Return to creator')}
                    </button>
                    <button type="button" className="button button--primary" onClick={handleSendToClient}>
                      <svg aria-hidden="true" className="icon">
                        <use href="#i-send" />
                      </svg>
                      {t('Approve & send to client')}
                    </button>
                  </div>
                </div>
              ) : null}

              {canClientReview ? (
                <div className="s3-review-panel is-client">
                  <h3>{t('Client approval')}</h3>
                  <p>
                    {t(
                      'Approve the strategy to unlock the content plan, or tell the team what should change.',
                    )}
                  </p>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    value={clientReason}
                    onChange={(event) => {
                      setClientReason(event.target.value);
                      setClientError('');
                    }}
                    placeholder={t('Why do you need changes? (required to request changes)')}
                  />
                  {clientError ? <span className="set-error">{clientError}</span> : null}
                  <div className="s3-form-actions">
                    <button type="button" className="button button--ghost" onClick={handleClientChanges}>
                      {t('Request changes')}
                    </button>
                    <button type="button" className="button button--primary" onClick={handleClientApprove}>
                      <svg aria-hidden="true" className="icon">
                        <use href="#i-check" />
                      </svg>
                      {t('Approve')}
                    </button>
                  </div>
                </div>
              ) : null}

              {strategyStatus === 'in_review' && !canReview ? (
                <p className="s3-muted s3-waiting">
                  {t('Waiting for the account manager to review this strategy.')}
                </p>
              ) : null}

              {strategyStatus === 'client_review' && !canClientReview ? (
                <p className="s3-muted s3-waiting">
                  {t('Waiting for the client to approve this strategy.')}
                </p>
              ) : null}
            </section>
          ) : (
            <EmptyState
              icon="#i-chart"
              title={t('No strategy yet for this brand')}
              text={t('Start from the approved brief and draft the first strategy version.')}
              action={
                canCreate ? (
                  <button type="button" className="button button--primary" onClick={startNew}>
                    {t('New strategy')}
                  </button>
                ) : null
              }
            />
          )}
        </>
      )}

      <Toast message={toast?.message} tone={toast?.tone} />
    </div>
  );
}
