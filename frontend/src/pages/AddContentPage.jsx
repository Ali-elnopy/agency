import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import PlanModal from '../components/brands/PlanModal';
import Toast from '../components/ui/Toast';
import useToast from '../hooks/useToast';
import { useBrands } from '../context/brandsStore';
import {
  BRAND_STATUS_LABEL,
  CONTENT_STATUS_LABEL,
  CONTENT_TYPES,
  CONTENT_TYPE_LABEL,
  TOV_OPTIONS,
  formatDate,
  formatTime,
  initialsOf,
  isValidHttpUrl,
  monthKey,
  monthLabel,
} from '../data/brands';

const STATUS_TONE = {
  planned: 'is-amber',
  delivered: 'is-green',
  delayed: 'is-red',
};

function monthBounds(month) {
  const [year, monthNumber] = String(month).split('-').map(Number);
  const lastDay = new Date(year, monthNumber, 0).getDate();

  return {
    min: `${month}-01`,
    max: `${month}-${String(lastDay).padStart(2, '0')}`,
  };
}

function weekdayLabel(value) {
  if (!value) return '—';

  const date = new Date(`${value}T12:00:00`);

  if (Number.isNaN(date.getTime())) return '—';

  return date.toLocaleDateString('en-US', { weekday: 'long' });
}

function defaultDateFor(month) {
  const today = new Date().toISOString().slice(0, 10);
  return today.startsWith(month) ? today : `${month}-01`;
}

export default function AddContentPage({ brandId, initialMonth, initialPlatformId, onBack }) {
  const { getBrand, plans, content, addContent, savePlan, getPlatforms } = useBrands();
  const { toast, showToast } = useToast(5000);

  const brand = getBrand(brandId);
  const platforms = useMemo(() => (brand ? getPlatforms(brand.id) : []), [brand, getPlatforms]);
  const brandPlans = useMemo(
    () =>
      plans
        .filter((plan) => plan.brandId === brandId)
        .sort((a, b) => a.month.localeCompare(b.month)),
    [plans, brandId],
  );

  const [planMonth, setPlanMonth] = useState(
    () => initialMonth || brandPlans[brandPlans.length - 1]?.month || monthKey(),
  );
  const [platformId, setPlatformId] = useState(initialPlatformId ?? 'all');
  const [isAdding, setIsAdding] = useState(false);
  const draftRowRef = useRef(null);
  const ideaInputRef = useRef(null);
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [type, setType] = useState(CONTENT_TYPES[0].id);
  const [title, setTitle] = useState('');
  const [publishDate, setPublishDate] = useState(() =>
    defaultDateFor(initialMonth || brandPlans[brandPlans.length - 1]?.month || monthKey()),
  );
  const [publishTime, setPublishTime] = useState('10:00');
  const [tov, setTov] = useState(TOV_OPTIONS[0]);
  const [caption, setCaption] = useState('');
  const [notes, setNotes] = useState('');
  const [designDirection, setDesignDirection] = useState('');
  const [referenceUrl, setReferenceUrl] = useState('');
  const [materialUrl, setMaterialUrl] = useState('');
  const [errors, setErrors] = useState({});

  const selectedPlan = brandPlans.find((plan) => plan.month === planMonth) ?? null;
  const bounds = monthBounds(planMonth);

  const monthItems = useMemo(
    () =>
      content
        .filter(
          (item) =>
            item.brandId === brandId &&
            item.month === planMonth &&
            (platformId === 'all' || String(item.platformId) === String(platformId)),
        )
        .sort((a, b) =>
          `${a.publishDate}T${a.publishTime}`.localeCompare(`${b.publishDate}T${b.publishTime}`),
        ),
    [content, brandId, planMonth, platformId],
  );

  const posts = monthItems.filter((item) => item.type === 'post').length;
  const reels = monthItems.filter((item) => item.type === 'reel').length;
  const target = selectedPlan ? selectedPlan.postsTarget + selectedPlan.reelsTarget : null;
  const completion = target ? Math.min(100, Math.round((monthItems.length / target) * 100)) : 0;

  // The new row is edited directly in the sheet, so bring it into view and
  // focus its first field. Clicking Add Row again re-focuses the open draft
  // instead of appearing to do nothing.
  useLayoutEffect(() => {
    if (!isAdding) return;

    draftRowRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    ideaInputRef.current?.focus({ preventScroll: true });
  }, [isAdding]);

  const setField = (setter, key) => (event) => {
    setter(event.target.value);
    setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const resetDraft = () => {
    setType(CONTENT_TYPES[0].id);
    setTitle('');
    setPublishDate(defaultDateFor(planMonth));
    setPublishTime('10:00');
    setTov(TOV_OPTIONS[0]);
    setCaption('');
    setNotes('');
    setDesignDirection('');
    setReferenceUrl('');
    setMaterialUrl('');
    setErrors({});
  };

  const startAdding = () => {
    if (isAdding) {
      draftRowRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      ideaInputRef.current?.focus({ preventScroll: true });
      return;
    }

    resetDraft();
    setIsAdding(true);
  };

  const cancelAdding = () => {
    resetDraft();
    setIsAdding(false);
  };

  const handleMonthChange = (event) => {
    const nextMonth = event.target.value;

    if (!nextMonth) return;

    setPlanMonth(nextMonth);
    setPublishDate((prev) => (prev.startsWith(nextMonth) ? prev : `${nextMonth}-01`));
    setErrors((prev) => ({ ...prev, publishDate: '' }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!brand || !isAdding) return;

    const nextErrors = {};
    const idea = title.trim();

    if (!idea) nextErrors.title = 'An idea is required.';
    else if (idea.length > 160) {
      nextErrors.title = 'The idea must not exceed 160 characters.';
    }

    if (!publishDate) nextErrors.publishDate = 'Publish date is required.';
    else if (!publishDate.startsWith(planMonth)) {
      nextErrors.publishDate = `Pick a date inside ${monthLabel(planMonth)}.`;
    }

    if (!publishTime) nextErrors.publishTime = 'Suggested time is required.';
    if (referenceUrl.trim() && !isValidHttpUrl(referenceUrl.trim())) {
      nextErrors.referenceUrl = 'Enter a valid reference URL.';
    }
    if (materialUrl.trim() && !isValidHttpUrl(materialUrl.trim())) {
      nextErrors.materialUrl = 'Enter a valid materials URL.';
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    addContent({
      brandId: brand.id,
      month: planMonth,
      platformId: platformId === 'all' ? null : platformId,
      type,
      title: idea,
      publishDate,
      publishTime,
      tov,
      caption,
      notes,
      designDirection,
      referenceUrl,
      materialUrl,
    });

    showToast(`Row ${monthItems.length + 1} added to ${monthLabel(planMonth)}.`, 'success');
    resetDraft();
    setIsAdding(false);
  };

  const handleSavePlan = (values) => {
    if (!brand) return;

    savePlan({ brandId: brand.id, ...values });
    setPlanMonth(values.month);
    setPublishDate((prev) =>
      prev.startsWith(values.month) ? prev : defaultDateFor(values.month),
    );
    setPlanModalOpen(false);
    showToast(`Monthly plan saved for ${monthLabel(values.month)}.`, 'success');
  };

  if (!brand) {
    return (
      <div className="page-screen">
        <section className="page-head">
          <h1 className="page-head__title">Content Plan</h1>
        </section>
        <section className="brand-empty brand-empty--page">
          <span className="brand-empty__icon">
            <svg aria-hidden="true" className="icon">
              <use href="#i-file" />
            </svg>
          </span>
          <h2>Brand not found</h2>
          <p>Return to the Brands workspace and open a brand before planning content.</p>
          <button type="button" className="button button--primary" onClick={onBack}>
            Back to Brands
          </button>
        </section>
      </div>
    );
  }

  const statusLabel = BRAND_STATUS_LABEL[brand.status] ?? 'Active';

  return (
    <div className="page-screen content-plan-page">
      <section className="page-head page-head--actions">
        <div>
          <span className="cl-label">Content plan</span>
          <h1 className="page-head__title">Content Plan</h1>
          <p className="content-plan__lead">
            Plan every post and reel in one sheet — from the idea and brief to the design
            direction.
          </p>
        </div>

        <div className="page-head__actions">
          <button type="button" className="button button--ghost button--sm" onClick={onBack}>
            <svg aria-hidden="true" className="icon brand-back-icon">
              <use href="#i-arrow" />
            </svg>
            Back to {brand.name}
          </button>
        </div>
      </section>

      <section className="content-plan__toolbar">
        <div className="content-plan__brand">
          <span className={`cl-brand__mark content-plan__brand-mark ${brand.tone}`}>
            {brand.initials || initialsOf(brand.name)}
          </span>
          <div className="content-plan__brand-copy">
            <strong>{brand.name}</strong>
            <p>
              {brand.industry || 'Uncategorized'} · {brand.team || 'No team'} ·{' '}
              {brand.manager || 'No account manager'}
            </p>
          </div>
          <span className={`brand-status is-${brand.status}`}>
            <i className="brand-status__dot" aria-hidden="true" />
            {statusLabel}
          </span>
        </div>

        <div className="content-plan__controls">
          {platforms.length ? (
            <label className="content-plan__month">
              <span>Platform</span>
              <span className="form-select-wrap">
                <select
                  className="form-select"
                  value={platformId}
                  onChange={(event) => setPlatformId(event.target.value)}
                  aria-label="Filter content plan by platform"
                >
                  <option value="all">All platforms</option>
                  {platforms.map((platform) => (
                    <option key={platform.id} value={platform.id}>
                      {platform.name}
                    </option>
                  ))}
                </select>
                <svg aria-hidden="true" className="icon">
                  <use href="#i-chevron" />
                </svg>
              </span>
            </label>
          ) : null}

          <label className="content-plan__month">
            <span>Month</span>
            <input
              type="month"
              className="form-input"
              value={planMonth}
              onChange={handleMonthChange}
            />
          </label>
          <button
            type="button"
            className="button button--ghost button--sm"
            onClick={() => setPlanModalOpen(true)}
          >
            <svg aria-hidden="true" className="icon">
              <use href="#i-target" />
            </svg>
            {selectedPlan ? 'Edit targets' : 'Set targets'}
          </button>
          <button type="button" className="button button--primary button--sm" onClick={startAdding}>
            <svg aria-hidden="true" className="icon">
              <use href="#i-plus" />
            </svg>
            Add Row
          </button>
        </div>
      </section>

      <div className="content-plan__stats">
        <article className="content-plan__stat">
          <span>Rows in sheet</span>
          <strong>{monthItems.length}</strong>
          <small>{monthLabel(planMonth)}</small>
        </article>
        <article className="content-plan__stat">
          <span>Posts</span>
          <strong>
            {posts}
            {selectedPlan ? <em>/ {selectedPlan.postsTarget}</em> : null}
          </strong>
          <small>{selectedPlan ? 'against target' : 'no target set'}</small>
        </article>
        <article className="content-plan__stat">
          <span>Reels</span>
          <strong>
            {reels}
            {selectedPlan ? <em>/ {selectedPlan.reelsTarget}</em> : null}
          </strong>
          <small>{selectedPlan ? 'against target' : 'no target set'}</small>
        </article>
        <article className="content-plan__stat">
          <span>Monthly target</span>
          <strong>{target ?? '—'}</strong>
          <small>{target ? `${completion}% added` : 'set a target to track progress'}</small>
        </article>
      </div>

      {!selectedPlan ? (
        <div className="content-plan__notice">
          <div>
            <strong>No monthly targets for {monthLabel(planMonth)}</strong>
            <span>Add targets to compare the sheet against the plan.</span>
          </div>
          <button
            type="button"
            className="button button--ghost button--sm"
            onClick={() => setPlanModalOpen(true)}
          >
            <svg aria-hidden="true" className="icon">
              <use href="#i-target" />
            </svg>
            Set targets
          </button>
        </div>
      ) : null}

      <section className="content-plan__sheet">
        <header className="content-plan__sheet-head">
          <div>
            <span className="content-plan__sheet-eyebrow">Content plan</span>
            <strong>
              {monthLabel(planMonth)} · {brand.name}
            </strong>
          </div>
          <div className="content-plan__sheet-meta">
            <span>{monthItems.length} rows</span>
            <span>
              {posts} posts · {reels} reels
            </span>
            <button type="button" className="button button--ghost button--sm" onClick={startAdding}>
              <svg aria-hidden="true" className="icon">
                <use href="#i-plus" />
              </svg>
              Add row
            </button>
          </div>
        </header>

        <div className="content-plan__scroll">
          <form
            id="content-row-form"
            className="content-plan__form"
            onSubmit={handleSubmit}
            noValidate
          >
          <table className="content-plan-table">
            <colgroup>
              <col className="content-plan-table__col-index" />
              <col className="content-plan-table__col-date" />
              <col className="content-plan-table__col-day" />
              <col className="content-plan-table__col-time" />
              <col className="content-plan-table__col-type" />
              <col className="content-plan-table__col-idea" />
              <col className="content-plan-table__col-copy" />
              <col className="content-plan-table__col-copy" />
              <col className="content-plan-table__col-copy" />
              <col className="content-plan-table__col-status" />
            </colgroup>
            <thead>
              <tr>
                <th>#</th>
                <th>Publish Date</th>
                <th>Day</th>
                <th>Suggested Time</th>
                <th>Content Type</th>
                <th>Idea (TOV)</th>
                <th>Idea Description</th>
                <th>Brief (Script / Copy)</th>
                <th>Design Direction</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {monthItems.length === 0 && !isAdding ? (
                <tr>
                  <td className="content-plan-table__empty" colSpan={10}>
                    <strong>This sheet is empty.</strong>
                    <span>
                      Add the first row for {monthLabel(planMonth)} to start the content plan.
                    </span>
                    <button
                      type="button"
                      className="button button--primary button--sm"
                      onClick={startAdding}
                    >
                      <svg aria-hidden="true" className="icon">
                        <use href="#i-plus" />
                      </svg>
                      Add first row
                    </button>
                  </td>
                </tr>
              ) : null}

              {monthItems.map((item, index) => (
                  <tr key={item.id}>
                    <td className="content-plan-table__index">{index + 1}</td>
                    <td className="content-plan-table__date">{formatDate(item.publishDate)}</td>
                    <td>{weekdayLabel(item.publishDate)}</td>
                    <td className="content-plan-table__time">{formatTime(item.publishTime)}</td>
                    <td>
                      <span className={`content-plan__type is-${item.type}`}>
                        {CONTENT_TYPE_LABEL[item.type] ?? item.type}
                      </span>
                    </td>
                    <td>
                      <strong className="content-plan-table__idea">{item.title}</strong>
                      {item.tov ? <span className="content-plan__tov">{item.tov}</span> : null}
                    </td>
                    <td>
                      <span className="content-plan-table__copy">
                        {item.caption || '—'}
                      </span>
                    </td>
                    <td>
                      <span className="content-plan-table__copy">{item.notes || '—'}</span>
                    </td>
                    <td>
                      <span className="content-plan-table__copy">
                        {item.designDirection || '—'}
                      </span>
                    </td>
                    <td>
                      <span className={`pill ${STATUS_TONE[item.status] ?? 'is-gray'}`}>
                        {CONTENT_STATUS_LABEL[item.status] ?? item.status}
                      </span>
                      {item.referenceUrl || item.materialUrl ? (
                        <span className="content-plan-table__links">
                          {item.referenceUrl ? (
                            <a href={item.referenceUrl} target="_blank" rel="noreferrer">
                              Reference
                            </a>
                          ) : null}
                          {item.materialUrl ? (
                            <a href={item.materialUrl} target="_blank" rel="noreferrer">
                              Materials
                            </a>
                          ) : null}
                        </span>
                      ) : null}
                    </td>
                  </tr>
                ))}

              {isAdding ? (
                <>
                  <tr ref={draftRowRef} className="content-plan-table__draft">
                    <td className="content-plan-table__index">{monthItems.length + 1}</td>
                    <td>
                      <input
                        type="date"
                        className="content-plan__cell-input"
                        value={publishDate}
                        onChange={setField(setPublishDate, 'publishDate')}
                        min={bounds.min}
                        max={bounds.max}
                        aria-label="Publish date"
                        aria-invalid={Boolean(errors.publishDate)}
                      />
                      {errors.publishDate ? (
                        <span className="content-plan__cell-error">{errors.publishDate}</span>
                      ) : null}
                    </td>
                    <td className="content-plan-table__draft-day">{weekdayLabel(publishDate)}</td>
                    <td>
                      <input
                        type="time"
                        className="content-plan__cell-input"
                        value={publishTime}
                        onChange={setField(setPublishTime, 'publishTime')}
                        aria-label="Suggested time"
                        aria-invalid={Boolean(errors.publishTime)}
                      />
                      {errors.publishTime ? (
                        <span className="content-plan__cell-error">{errors.publishTime}</span>
                      ) : null}
                    </td>
                    <td>
                      <select
                        className="content-plan__cell-input"
                        value={type}
                        onChange={setField(setType, 'type')}
                        aria-label="Content type"
                      >
                        {CONTENT_TYPES.map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        ref={ideaInputRef}
                        className="content-plan__cell-input"
                        placeholder="Idea"
                        value={title}
                        onChange={setField(setTitle, 'title')}
                        maxLength={160}
                        aria-label="Idea"
                        aria-invalid={Boolean(errors.title)}
                      />
                      <select
                        className="content-plan__cell-input content-plan__cell-input--spaced"
                        value={tov}
                        onChange={setField(setTov, 'tov')}
                        aria-label="Tone of voice"
                      >
                        {TOV_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                      {errors.title ? (
                        <span className="content-plan__cell-error">{errors.title}</span>
                      ) : null}
                    </td>
                    <td>
                      <textarea
                        className="content-plan__cell-textarea"
                        placeholder="What the post or reel says…"
                        value={caption}
                        onChange={setField(setCaption, 'caption')}
                        rows={2}
                        aria-label="Idea description"
                      />
                    </td>
                    <td>
                      <textarea
                        className="content-plan__cell-textarea"
                        placeholder="Script, caption, talking points…"
                        value={notes}
                        onChange={setField(setNotes, 'notes')}
                        rows={2}
                        aria-label="Brief"
                      />
                    </td>
                    <td>
                      <textarea
                        className="content-plan__cell-textarea"
                        placeholder="Visual style, references, format…"
                        value={designDirection}
                        onChange={setField(setDesignDirection, 'designDirection')}
                        rows={2}
                        aria-label="Design direction"
                      />
                    </td>
                    <td>
                      <span className="pill is-amber">Planned</span>
                    </td>
                  </tr>
                  <tr className="content-plan-table__draft-links">
                    <td colSpan={10}>
                      <div className="content-plan__draft-links">
                        <label>
                          <span>Reference link</span>
                          <input
                            type="url"
                            className="content-plan__cell-input"
                            placeholder="https://…"
                            value={referenceUrl}
                            onChange={setField(setReferenceUrl, 'referenceUrl')}
                            aria-invalid={Boolean(errors.referenceUrl)}
                          />
                          {errors.referenceUrl ? (
                            <span className="content-plan__cell-error">
                              {errors.referenceUrl}
                            </span>
                          ) : null}
                        </label>
                        <label>
                          <span>Materials link</span>
                          <input
                            type="url"
                            className="content-plan__cell-input"
                            placeholder="https://drive.google.com/…"
                            value={materialUrl}
                            onChange={setField(setMaterialUrl, 'materialUrl')}
                            aria-invalid={Boolean(errors.materialUrl)}
                          />
                          {errors.materialUrl ? (
                            <span className="content-plan__cell-error">
                              {errors.materialUrl}
                            </span>
                          ) : null}
                        </label>
                        <small>Optional. Links appear in the Status column after saving.</small>
                      </div>
                    </td>
                  </tr>
                </>
              ) : null}
            </tbody>
          </table>
          </form>
        </div>

        {monthItems.length > 0 || isAdding ? (
          <footer className="content-plan__footer">
            {isAdding ? (
              <>
                <button type="button" className="button button--ghost" onClick={cancelAdding}>
                  Cancel
                </button>
                <button type="submit" form="content-row-form" className="button button--primary">
                  <svg aria-hidden="true" className="icon">
                    <use href="#i-plus" />
                  </svg>
                  Add row to sheet
                </button>
              </>
            ) : (
              <button type="button" className="button button--primary" onClick={startAdding}>
                <svg aria-hidden="true" className="icon">
                  <use href="#i-plus" />
                </svg>
                Add Row
              </button>
            )}
          </footer>
        ) : null}
      </section>

      {planModalOpen ? (
        <PlanModal
          brand={brand}
          initialMonth={planMonth}
          plans={brandPlans}
          onClose={() => setPlanModalOpen(false)}
          onSave={handleSavePlan}
        />
      ) : null}

      <Toast message={toast?.message} tone={toast?.tone} />
    </div>
  );
}
