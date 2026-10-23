import React, { useMemo, useState } from 'react';
import { useBrands } from '../context/brandsStore';
import {
  BRAND_STATUS_LABEL,
  CONTENT_TYPES,
  TOV_OPTIONS,
  initialsOf,
  isValidHttpUrl,
  monthLabel,
} from '../data/brands';

function defaultDateFor(month) {
  const today = new Date().toISOString().slice(0, 10);
  return today.startsWith(month) ? today : `${month}-01`;
}

export default function AddContentPage({ brandId, initialMonth, onBack, onSaved }) {
  const { getBrand, plans, content, addContent } = useBrands();

  const brand = getBrand(brandId);
  const brandPlans = useMemo(
    () =>
      plans
        .filter((plan) => plan.brandId === brandId)
        .sort((a, b) => a.month.localeCompare(b.month)),
    [plans, brandId],
  );

  const fallbackPlan =
    brandPlans.find((plan) => plan.month === initialMonth) ??
    brandPlans[brandPlans.length - 1] ??
    null;

  const [planMonth, setPlanMonth] = useState(fallbackPlan?.month ?? initialMonth);
  const [type, setType] = useState(CONTENT_TYPES[0].id);
  const [title, setTitle] = useState('');
  const [publishDate, setPublishDate] = useState(() =>
    defaultDateFor(fallbackPlan?.month ?? initialMonth),
  );
  const [publishTime, setPublishTime] = useState('10:00');
  const [tov, setTov] = useState(TOV_OPTIONS[0]);
  const [caption, setCaption] = useState('');
  const [notes, setNotes] = useState('');
  const [referenceUrl, setReferenceUrl] = useState('');
  const [materialUrl, setMaterialUrl] = useState('');
  const [errors, setErrors] = useState({});

  const selectedPlan = brandPlans.find((plan) => plan.month === planMonth) ?? null;
  const planItems = content.filter(
    (item) => item.brandId === brandId && item.month === planMonth,
  ).length;
  const planTarget = selectedPlan
    ? selectedPlan.postsTarget + selectedPlan.reelsTarget
    : 0;

  const update = (key) => (event) => {
    setFormValue(key, event.target.value);
  };

  function setFormValue(key, value) {
    const setters = {
      planMonth: setPlanMonth,
      type: setType,
      title: setTitle,
      publishDate: setPublishDate,
      publishTime: setPublishTime,
      tov: setTov,
      caption: setCaption,
      notes: setNotes,
      referenceUrl: setReferenceUrl,
      materialUrl: setMaterialUrl,
    };

    setters[key]?.(value);
    setErrors((prev) => ({ ...prev, [key]: '' }));
  }

  const handlePlanChange = (event) => {
    const nextMonth = event.target.value;
    setPlanMonth(nextMonth);
    setPublishDate((prev) => (prev.startsWith(nextMonth) ? prev : defaultDateFor(nextMonth)));
    setErrors((prev) => ({ ...prev, planMonth: '' }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!brand) return;

    const nextErrors = {};

    if (!planMonth || !selectedPlan) nextErrors.planMonth = 'Choose a monthly plan.';
    if (!type) nextErrors.type = 'Choose a content type.';
    if (!title.trim()) nextErrors.title = 'Content title is required.';
    else if (title.trim().length > 160) {
      nextErrors.title = 'Content title must not exceed 160 characters.';
    }
    if (!publishDate) nextErrors.publishDate = 'Publish date is required.';
    if (!publishTime) nextErrors.publishTime = 'Publish time is required.';
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
      type,
      title,
      publishDate,
      publishTime,
      tov,
      caption,
      notes,
      referenceUrl,
      materialUrl,
    });

    onSaved?.();
  };

  if (!brand) {
    return (
      <div className="page-screen">
        <section className="page-head">
          <h1 className="page-head__title">Add Content</h1>
        </section>
        <section className="brand-empty brand-empty--page">
          <span className="brand-empty__icon">
            <svg aria-hidden="true" className="icon">
              <use href="#i-file" />
            </svg>
          </span>
          <h2>Brand not found</h2>
          <p>Return to the Brands workspace and open a brand before adding content.</p>
          <button type="button" className="button button--primary" onClick={onBack}>
            Back to Brands
          </button>
        </section>
      </div>
    );
  }

  if (!brandPlans.length) {
    return (
      <div className="page-screen">
        <section className="page-head">
          <h1 className="page-head__title">Add Content</h1>
        </section>
        <section className="brand-empty brand-empty--page">
          <span className="brand-empty__icon">
            <svg aria-hidden="true" className="icon">
              <use href="#i-calendar" />
            </svg>
          </span>
          <h2>No monthly plan yet</h2>
          <p>
            Create a monthly plan for {brand.name} before adding content. The plan defines the
            post and reel targets for the month.
          </p>
          <button type="button" className="button button--primary" onClick={onBack}>
            Back to {brand.name}
          </button>
        </section>
      </div>
    );
  }

  const statusLabel = BRAND_STATUS_LABEL[brand.status] ?? 'Active';

  return (
    <div className="page-screen brand-form-page">
      <section className="page-head page-head--actions">
        <h1 className="page-head__title">Add Content</h1>
        <div className="page-head__actions">
          <button type="button" className="button button--ghost button--sm" onClick={onBack}>
            <svg aria-hidden="true" className="icon brand-back-icon">
              <use href="#i-arrow" />
            </svg>
            Back to {brand.name}
          </button>
        </div>
      </section>

      <form className="brand-form-card" onSubmit={handleSubmit} noValidate>
        <div className="brand-form-context">
          <span className={`cl-brand__mark brand-form-context__mark ${brand.tone}`}>
            {brand.initials || initialsOf(brand.name)}
          </span>
          <div className="brand-form-context__copy">
            <strong>{brand.name}</strong>
            <p>
              {brand.industry || 'Uncategorized'} · {brand.country} ·{' '}
              {brand.timezoneLabel || brand.timezone}
            </p>
          </div>
          <span className={`brand-status is-${brand.status}`}>
            <i className="brand-status__dot" aria-hidden="true" />
            {statusLabel}
          </span>
        </div>

        <div className="brand-form-grid">
          <div className="brand-field">
            <label htmlFor="content-plan">
              Monthly Plan <span className="brand-required">*</span>
            </label>
            <span className="form-select-wrap">
              <select
                id="content-plan"
                className="form-select"
                value={planMonth}
                onChange={handlePlanChange}
                aria-invalid={Boolean(errors.planMonth)}
              >
                {brandPlans.map((plan) => (
                  <option key={plan.month} value={plan.month}>
                    {monthLabel(plan.month)} · {plan.postsTarget} posts / {plan.reelsTarget} reels
                  </option>
                ))}
              </select>
              <svg aria-hidden="true" className="icon">
                <use href="#i-chevron" />
              </svg>
            </span>
            {errors.planMonth ? <span className="set-error">{errors.planMonth}</span> : null}
          </div>

          <div className="brand-field">
            <label htmlFor="content-type">
              Content Type <span className="brand-required">*</span>
            </label>
            <span className="form-select-wrap">
              <select
                id="content-type"
                className="form-select"
                value={type}
                onChange={update('type')}
                aria-invalid={Boolean(errors.type)}
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
            {errors.type ? <span className="set-error">{errors.type}</span> : null}
          </div>

          <div className="brand-field brand-field--full">
            <label htmlFor="content-title">
              Content Title <span className="brand-required">*</span>
            </label>
            <input
              id="content-title"
              className="form-input"
              placeholder="e.g. The refill ritual, simplified"
              value={title}
              onChange={update('title')}
              maxLength={160}
              aria-invalid={Boolean(errors.title)}
              autoFocus
            />
            {errors.title ? (
              <span className="set-error">{errors.title}</span>
            ) : (
              <span className="brand-field__hint">
                Use the working title from the content brief. {title.length}/160
              </span>
            )}
          </div>

          <div className="brand-field">
            <label htmlFor="content-date">
              Publish Date <span className="brand-required">*</span>
            </label>
            <input
              id="content-date"
              type="date"
              className="form-input"
              value={publishDate}
              onChange={update('publishDate')}
              aria-invalid={Boolean(errors.publishDate)}
            />
            {errors.publishDate ? (
              <span className="set-error">{errors.publishDate}</span>
            ) : null}
          </div>

          <div className="brand-field">
            <label htmlFor="content-time">
              Publish Time <span className="brand-required">*</span>
            </label>
            <input
              id="content-time"
              type="time"
              className="form-input"
              value={publishTime}
              onChange={update('publishTime')}
              aria-invalid={Boolean(errors.publishTime)}
            />
            {errors.publishTime ? (
              <span className="set-error">{errors.publishTime}</span>
            ) : null}
          </div>

          <div className="brand-field brand-field--full">
            <label htmlFor="content-tov">TOV</label>
            <span className="form-select-wrap">
              <select
                id="content-tov"
                className="form-select"
                value={tov}
                onChange={update('tov')}
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

          <div className="brand-field brand-field--full">
            <label htmlFor="content-caption">Caption</label>
            <textarea
              id="content-caption"
              className="form-textarea"
              placeholder="Write the caption or key message for this content…"
              value={caption}
              onChange={update('caption')}
              rows={4}
            />
          </div>

          <div className="brand-field brand-field--full">
            <label htmlFor="content-notes">Notes</label>
            <textarea
              id="content-notes"
              className="form-textarea"
              placeholder="Production notes, approvals, or anything the team should know…"
              value={notes}
              onChange={update('notes')}
              rows={3}
            />
          </div>

          <div className="brand-field">
            <label htmlFor="content-reference">Reference Link</label>
            <input
              id="content-reference"
              type="url"
              className="form-input"
              placeholder="https://…"
              value={referenceUrl}
              onChange={update('referenceUrl')}
              aria-invalid={Boolean(errors.referenceUrl)}
            />
            {errors.referenceUrl ? (
              <span className="set-error">{errors.referenceUrl}</span>
            ) : (
              <span className="brand-field__hint">Inspiration or approved reference.</span>
            )}
          </div>

          <div className="brand-field">
            <label htmlFor="content-material">Materials / Google Drive Link</label>
            <input
              id="content-material"
              type="url"
              className="form-input"
              placeholder="https://drive.google.com/…"
              value={materialUrl}
              onChange={update('materialUrl')}
              aria-invalid={Boolean(errors.materialUrl)}
            />
            {errors.materialUrl ? (
              <span className="set-error">{errors.materialUrl}</span>
            ) : (
              <span className="brand-field__hint">Assets, footage or final files.</span>
            )}
          </div>
        </div>

        <div className="brand-form-note">
          <span className="brand-form-note__icon">
            <svg aria-hidden="true" className="icon">
              <use href="#i-target" />
            </svg>
          </span>
          <p>
            This item will be added to the <strong>{monthLabel(planMonth)}</strong> plan as{' '}
            <strong>Planned</strong>. The plan currently has <strong>{planItems}</strong> of{' '}
            <strong>{planTarget}</strong> deliverables added.
          </p>
        </div>

        <div className="brand-form__actions">
          <button type="button" className="button button--ghost" onClick={onBack}>
            Cancel
          </button>
          <button type="submit" className="button button--primary">
            <svg aria-hidden="true" className="icon">
              <use href="#i-plus" />
            </svg>
            Add Content
          </button>
        </div>
      </form>
    </div>
  );
}
