import React, { useState } from 'react';

const SECTORS = [
  'HealthTech & Telehealth',
  'EV Automotive & Fleet',
  'Organic Cosmetics',
  'Enterprise AI SaaS',
  'Industrial Automation',
  'Hospitality Franchise',
  'Renewable Energy',
  'Aerospace Engineering',
];

const EMPTY = {
  brandName: '',
  sector: '',
  website: '',
  description: '',
  contactName: '',
  contactPhone: '',
  contactEmail: '',
};

/**
 * Shared brand + primary-contact form. Rendered inside the onboarding drawer on
 * the Clients directory and on the standalone edit screen.
 */
export default function ClientForm({
  mode = 'add',
  initial,
  onCancel,
  onSave,
  footerClass = 'cl-drawer__foot',
  idPrefix = 'cl',
}) {
  const [form, setForm] = useState({ ...EMPTY, ...initial });

  const update = (key) => (event) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (onSave) onSave(form);
  };

  return (
    <form
      className={`cl-form${footerClass === 'cl-drawer__foot' ? '' : ' cl-form--page'}`}
      onSubmit={handleSubmit}
    >
      <div className="cl-form__body">
        <p className="cl-drawer__intro">
          Configure brand identity, workspace owners, and team assignments.
        </p>

        <div className="cl-note">
          <svg className="icon" aria-hidden="true">
            <use href="#i-alert" />
          </svg>
          <span>
            <strong>Note:</strong> Each client represents one brand. All creative briefs, workspace
            assets, workflows, and approvals are strictly isolated to this entity.
          </span>
        </div>

        <section className="cl-sec">
          <header className="cl-sec__head">
            <h2 className="cl-sec__title">
              <span className="cl-sec__num">1.</span> Brand Identity
            </h2>
            <span className="cl-sec__hint">Step 1 of 3</span>
          </header>

          <div className="cl-field">
            <span className="cl-field__label">Brand Logo</span>
            <div className="cl-upload">
              <span className="cl-upload__mark">
                <svg aria-hidden="true" className="icon">
                  <use href="#i-layers" />
                </svg>
              </span>
              <div className="cl-upload__body">
                <strong>Upload Logo</strong>
                <small>or drag &amp; drop</small>
                <p>PNG, SVG, or JPG up to 5MB (Square 1:1 recommended)</p>
              </div>
            </div>
          </div>

          <div className="cl-field">
            <label className="cl-field__label" htmlFor={`${idPrefix}-name`}>
              Brand Name<span className="req">*</span>
            </label>
            <input
              id={`${idPrefix}-name`}
              className="form-input"
              value={form.brandName}
              onChange={update('brandName')}
              placeholder="e.g., Lumina Health Tech"
            />
          </div>

          <div className="cl-field">
            <label className="cl-field__label" htmlFor={`${idPrefix}-sector`}>
              Activity / Industry<span className="req">*</span>
            </label>
            <span className="filter-select" style={{ width: '100%' }}>
              <select id={`${idPrefix}-sector`} value={form.sector} onChange={update('sector')}>
                <option value="">Select primary brand sector…</option>
                {SECTORS.map((sector) => (
                  <option key={sector} value={sector}>
                    {sector}
                  </option>
                ))}
              </select>
              <svg aria-hidden="true" className="icon">
                <use href="#i-chevron" />
              </svg>
            </span>
          </div>

          <div className="cl-field">
            <label className="cl-field__label" htmlFor={`${idPrefix}-site`}>
              Website <small>(Optional)</small>
            </label>
            <div className="cl-input-wrap">
              <svg className="cl-input-wrap__icon" viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.7" />
                <path
                  d="M3 12h18M12 3c2.6 3 2.6 15 0 18M12 3c-2.6 3-2.6 15 0 18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                />
              </svg>
              <input
                id={`${idPrefix}-site`}
                className="form-input"
                value={form.website}
                onChange={update('website')}
                placeholder="https://luminahealth.io"
              />
            </div>
          </div>

          <div className="cl-field">
            <label className="cl-field__label" htmlFor={`${idPrefix}-desc`}>
              Short Description
            </label>
            <textarea
              id={`${idPrefix}-desc`}
              className="form-textarea"
              rows={3}
              value={form.description}
              onChange={update('description')}
              placeholder="High-growth telehealth platform providing AI-assisted patient triage and remote wellness consultations…"
            />
          </div>
        </section>

        <section className="cl-sec">
          <header className="cl-sec__head">
            <h2 className="cl-sec__title">
              <span className="cl-sec__num">2.</span> Key Contact Person
            </h2>
            <span className="cl-sec__hint">Primary Stakeholder</span>
          </header>

          <div className="cl-grid2">
            <div className="cl-field" style={{ marginTop: 0 }}>
              <label className="cl-field__label" htmlFor={`${idPrefix}-contact`}>
                Full Name<span className="req">*</span>
              </label>
              <input
                id={`${idPrefix}-contact`}
                className="form-input"
                value={form.contactName}
                onChange={update('contactName')}
                placeholder="e.g., Dr. Aris Thorne"
              />
            </div>

            <div className="cl-field" style={{ marginTop: 0 }}>
              <label className="cl-field__label" htmlFor={`${idPrefix}-phone`}>
                Direct Phone
              </label>
              <input
                id={`${idPrefix}-phone`}
                className="form-input"
                value={form.contactPhone}
                onChange={update('contactPhone')}
                placeholder="+1 (555) 234-8901"
              />
            </div>
          </div>

          <div className="cl-field">
            <div className="cl-sec__head" style={{ marginBottom: 6 }}>
              <label
                className="cl-field__label"
                htmlFor={`${idPrefix}-email`}
                style={{ margin: 0 }}
              >
                Contact Work Email<span className="req">*</span>
              </label>
              <span className="cl-valid">
                <svg aria-hidden="true" className="icon">
                  <use href="#i-check" />
                </svg>
                Valid corporate format
              </span>
            </div>
            <div className="cl-input-wrap">
              <svg
                className="cl-input-wrap__icon"
                viewBox="0 0 24 24"
                aria-hidden="true"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
              >
                <rect x="3" y="5" width="18" height="14" rx="2.5" />
                <path d="M3.5 7.5l8.5 6 8.5-6" />
              </svg>
              <input
                id={`${idPrefix}-email`}
                type="email"
                className="form-input"
                value={form.contactEmail}
                onChange={update('contactEmail')}
                placeholder="aris.thorne@luminahealth.io"
              />
            </div>
          </div>
        </section>
      </div>

      <footer className={footerClass}>
        <button type="button" className="button button--ghost" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="button button--primary">
          {mode === 'edit' ? 'Save Client Changes' : 'Save & Onboard Client'}
          <svg aria-hidden="true" className="icon">
            <use href="#i-arrow" />
          </svg>
        </button>
      </footer>
    </form>
  );
}
