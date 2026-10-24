import React, { useMemo, useState } from 'react';
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
  const [editorOpen, setEditorOpen] = useState(false);
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
  const target = selectedPlan
    ? selectedPlan.postsTarget + selectedPlan.reelsTarget
    : null;
  const completion = target ? Math.min(100, Math.round((monthItems.length / target) * 100)) : 0;

  const setField = (setter, key) => (event) => {
    setter(event.target.value);
    setErrors((prev) => ({ ...prev, [key]: '' }));
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

    if (!brand) return;

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
    setTitle('');
    setCaption('');
    setNotes('');
    setDesignDirection('');
    setReferenceUrl('');
    setMaterialUrl('');
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
          <button
            type="button"
            className="button button--primary button--sm"
            onClick={() => setEditorOpen((value) => !value)}
          >
            <svg aria-hidden="true" className="icon">
              <use href="#i-plus" />
            </svg>
            {editorOpen ? 'Close editor' : 'Add Row'}
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

      {editorOpen ? (
        <form className="content-plan__editor" onSubmit={handleSubmit} noValidate>
          <header className="content-plan__editor-head">
            <div>
              <strong>New plan row</strong>
              <span>
                Row {monthItems.length + 1} · {monthLabel(planMonth)}
              </span>
            </div>
            <button
              type="button"
              className="content-plan__editor-close"
              onClick={() => setEditorOpen(false)}
              aria-label="Close row editor"
            >
              ×
            </button>
          </header>

          <div className="content-plan__editor-grid">
            <div className="brand-field">
              <label htmlFor="cp-date">
                Publish Date <span className="brand-required">*</span>
              </label>
              <input
                id="cp-date"
                type="date"
                className="form-input"
                value={publishDate}
                onChange={setField(setPublishDate, 'publishDate')}
                min={bounds.min}
                max={bounds.max}
                aria-invalid={Boolean(errors.publishDate)}
              />
              {errors.publishDate ? (
                <span className="set-error">{errors.publishDate}</span>
              ) : null}
            </div>

            <div className="brand-field">
              <span className="content-plan__field-label">Day</span>
              <div className="content-plan__readonly" aria-live="polite">
                {weekdayLabel(publishDate)}
              </div>
            </div>

            <div className="brand-field">
              <label htmlFor="cp-time">
                Suggested Time <span className="brand-required">*</span>
              </label>
              <input
                id="cp-time"
                type="time"
                className="form-input"
                value={publishTime}
                onChange={setField(setPublishTime, 'publishTime')}
                aria-invalid={Boolean(errors.publishTime)}
              />
              {errors.publishTime ? (
                <span className="set-error">{errors.publishTime}</span>
              ) : null}
            </div>

            <div className="brand-field">
              <label htmlFor="cp-type">
                Content Type <span className="brand-required">*</span>
              </label>
              <span className="form-select-wrap">
                <select
                  id="cp-type"
                  className="form-select"
                  value={type}
                  onChange={setField(setType, 'type')}
                >
                  {CONTENT_TYPES.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <svg aria-hidden="true" className="icon">
                  <use href="#i-chevron" />
                </svg>
              </span>
            </div>

            <div className="brand-field">
              <label htmlFor="cp-tov">Tone of Voice</label>
              <span className="form-select-wrap">
                <select
                  id="cp-tov"
                  className="form-select"
                  value={tov}
                  onChange={setField(setTov, 'tov')}
                >
                  {TOV_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <svg aria-hidden="true" className="icon">
                  <use href="#i-chevron" />
                </svg>
              </span>
            </div>

            <div className="brand-field">
              <span className="content-plan__field-label">Status</span>
              <div className="content-plan__readonly">
                <span className="pill is-amber">Planned</span>
              </div>
            </div>

            <div className="brand-field content-plan__editor-full">
              <label htmlFor="cp-idea">
                Idea <span className="brand-required">*</span>
              </label>
              <input
                id="cp-idea"
                className="form-input"
                placeholder="e.g. The refill ritual, simplified"
                value={title}
                onChange={setField(setTitle, 'title')}
                maxLength={160}
                aria-invalid={Boolean(errors.title)}
                autoFocus
              />
              {errors.title ? (
                <span className="set-error">{errors.title}</span>
              ) : (
                <span className="brand-field__hint">
                  The working idea from the brief. {title.length}/160
                </span>
              )}
            </div>

            <div className="brand-field content-plan__editor-full">
              <label htmlFor="cp-caption">Idea Description</label>
              <textarea
                id="cp-caption"
                className="form-textarea"
                placeholder="What the post or reel says, and why it matters to the audience…"
                value={caption}
                onChange={setField(setCaption, 'caption')}
                rows={3}
              />
            </div>

            <div className="brand-field content-plan__editor-full">
              <label htmlFor="cp-brief">Brief (Script / Copy)</label>
              <textarea
                id="cp-brief"
                className="form-textarea"
                placeholder="The script, caption, talking points or production notes behind the idea…"
                value={notes}
                onChange={setField(setNotes, 'notes')}
                rows={3}
              />
            </div>

            <div className="brand-field content-plan__editor-full">
              <label htmlFor="cp-direction">Design Direction</label>
              <textarea
                id="cp-direction"
                className="form-textarea"
                placeholder="Visual style, references, format, colours, typography or shoot notes…"
                value={designDirection}
                onChange={setField(setDesignDirection, 'designDirection')}
                rows={3}
              />
            </div>

            <div className="brand-field">
              <label htmlFor="cp-reference">Reference Link</label>
              <input
                id="cp-reference"
                type="url"
                className="form-input"
                placeholder="https://…"
                value={referenceUrl}
                onChange={setField(setReferenceUrl, 'referenceUrl')}
                aria-invalid={Boolean(errors.referenceUrl)}
              />
              {errors.referenceUrl ? (
                <span className="set-error">{errors.referenceUrl}</span>
              ) : (
                <span className="brand-field__hint">Inspiration or an approved reference.</span>
              )}
            </div>

            <div className="brand-field">
              <label htmlFor="cp-material">Materials / Drive Link</label>
              <input
                id="cp-material"
                type="url"
                className="form-input"
                placeholder="https://drive.google.com/…"
                value={materialUrl}
                onChange={setField(setMaterialUrl, 'materialUrl')}
                aria-invalid={Boolean(errors.materialUrl)}
              />
              {errors.materialUrl ? (
                <span className="set-error">{errors.materialUrl}</span>
              ) : (
                <span className="brand-field__hint">Assets, footage or final files.</span>
              )}
            </div>
          </div>

          <div className="content-plan__editor-actions">
            <button
              type="button"
              className="button button--ghost"
              onClick={() => setEditorOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="button button--primary">
              <svg aria-hidden="true" className="icon">
                <use href="#i-plus" />
              </svg>
              Add row to sheet
            </button>
          </div>
        </form>
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
            <button
              type="button"
              className="button button--ghost button--sm"
              onClick={() => setEditorOpen(true)}
            >
              <svg aria-hidden="true" className="icon">
                <use href="#i-plus" />
              </svg>
              Add row
            </button>
          </div>
        </header>

        <div className="content-plan__scroll">
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
              {monthItems.length === 0 ? (
                <tr>
                  <td className="content-plan-table__empty" colSpan={10}>
                    <strong>This sheet is empty.</strong>
                    <span>
                      Add the first row for {monthLabel(planMonth)} to start the content plan.
                    </span>
                    <button
                      type="button"
                      className="button button--primary button--sm"
                      onClick={() => setEditorOpen(true)}
                    >
                      <svg aria-hidden="true" className="icon">
                        <use href="#i-plus" />
                      </svg>
                      Add first row
                    </button>
                  </td>
                </tr>
              ) : (
                monthItems.map((item, index) => (
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
                ))
              )}
            </tbody>
          </table>
        </div>
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
