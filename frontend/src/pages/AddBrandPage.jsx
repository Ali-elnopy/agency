import React, { useMemo, useState } from 'react';
import { useBrands } from '../context/brandsStore';
import {
  COUNTRIES,
  INDUSTRIES,
  TIMEZONES,
  initialsOf,
  isValidHttpUrl,
  timezoneLabelFor,
} from '../data/brands';

const DEFAULT_COUNTRY = COUNTRIES[0];

const EMPTY_FORM = {
  name: '',
  industry: '',
  country: DEFAULT_COUNTRY.name,
  timezone: DEFAULT_COUNTRY.timezone,
  driveFolderUrl: '',
};

export default function AddBrandPage({ onBack, onSaved }) {
  const { brands, addBrand } = useBrands();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  const selectedTimezone = useMemo(
    () => TIMEZONES.find((timezone) => timezone.value === form.timezone),
    [form.timezone],
  );

  const update = (key) => (event) => {
    const value = event.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const handleCountryChange = (event) => {
    const country = COUNTRIES.find((item) => item.name === event.target.value) ?? DEFAULT_COUNTRY;

    setForm((prev) => ({
      ...prev,
      country: country.name,
      timezone: country.timezone,
    }));
    setErrors((prev) => ({ ...prev, country: '', timezone: '' }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = {};
    const name = form.name.trim();
    const industry = form.industry.trim();

    if (!name) {
      nextErrors.name = 'Brand name is required.';
    } else if (name.length > 150) {
      nextErrors.name = 'Brand name must not exceed 150 characters.';
    } else if (
      brands.some((brand) => brand.name.toLowerCase() === name.toLowerCase())
    ) {
      nextErrors.name = 'A brand with this name already exists.';
    }

    if (!industry) nextErrors.industry = 'Industry is required.';
    if (!form.country) nextErrors.country = 'Country is required.';
    if (!form.timezone) nextErrors.timezone = 'Timezone is required.';

    if (form.driveFolderUrl.trim() && !isValidHttpUrl(form.driveFolderUrl.trim())) {
      nextErrors.driveFolderUrl = 'Enter a valid Drive folder URL, starting with http:// or https://.';
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const brand = addBrand({
      name,
      industry,
      country: form.country,
      timezone: form.timezone,
      timezoneLabel: timezoneLabelFor(form.timezone),
      driveFolderUrl: form.driveFolderUrl.trim(),
    });

    onSaved?.(brand);
  };

  return (
    <div className="page-screen brand-form-page">
      <section className="page-head">
        <h1 className="page-head__title">Add Brand</h1>
      </section>

      <form className="brand-form-card" onSubmit={handleSubmit} noValidate>
        <div className="brand-form-preview">
          <span className="cl-brand__mark brand-form-preview__mark is-orange">
            {initialsOf(form.name)}
          </span>
          <div className="brand-form-preview__copy">
            <strong>{form.name.trim() || 'New brand workspace'}</strong>
            <p>
              {form.industry.trim() || 'Industry'} · {form.country} ·{' '}
              {selectedTimezone?.label.split(' · ')[0] || timezoneLabelFor(form.timezone)}
            </p>
          </div>
          <span className="brand-status is-active">
            <i className="brand-status__dot" aria-hidden="true" />
            Active
          </span>
        </div>

        <div className="brand-form-grid">
          <div className="brand-field brand-field--full">
            <label htmlFor="brand-name">
              Brand Name <span className="brand-required">*</span>
            </label>
            <input
              id="brand-name"
              className="form-input"
              placeholder="e.g. Hyper El Barka"
              value={form.name}
              onChange={update('name')}
              aria-invalid={Boolean(errors.name)}
              autoFocus
            />
            {errors.name ? <span className="set-error">{errors.name}</span> : null}
          </div>

          <div className="brand-field">
            <label htmlFor="brand-industry">
              Industry <span className="brand-required">*</span>
            </label>
            <input
              id="brand-industry"
              className="form-input"
              placeholder="e.g. Fashion & Apparel"
              value={form.industry}
              onChange={update('industry')}
              list="brand-industry-options"
              aria-invalid={Boolean(errors.industry)}
            />
            <datalist id="brand-industry-options">
              {INDUSTRIES.map((industry) => (
                <option key={industry} value={industry} />
              ))}
            </datalist>
            {errors.industry ? <span className="set-error">{errors.industry}</span> : null}
          </div>

          <div className="brand-field">
            <label htmlFor="brand-country">
              Country <span className="brand-required">*</span>
            </label>
            <span className="form-select-wrap">
              <select
                id="brand-country"
                className="form-select"
                value={form.country}
                onChange={handleCountryChange}
                aria-invalid={Boolean(errors.country)}
              >
                {COUNTRIES.map((country) => (
                  <option key={country.name} value={country.name}>
                    {country.name}
                  </option>
                ))}
              </select>
              <svg aria-hidden="true" className="icon">
                <use href="#i-chevron" />
              </svg>
            </span>
            {errors.country ? <span className="set-error">{errors.country}</span> : null}
          </div>

          <div className="brand-field">
            <label htmlFor="brand-timezone">
              Timezone <span className="brand-required">*</span>
            </label>
            <span className="form-select-wrap">
              <select
                id="brand-timezone"
                className="form-select"
                value={form.timezone}
                onChange={update('timezone')}
                aria-invalid={Boolean(errors.timezone)}
              >
                {TIMEZONES.map((timezone) => (
                  <option key={timezone.value} value={timezone.value}>
                    {timezone.label}
                  </option>
                ))}
              </select>
              <svg aria-hidden="true" className="icon">
                <use href="#i-chevron" />
              </svg>
            </span>
            {errors.timezone ? <span className="set-error">{errors.timezone}</span> : null}
          </div>

          <div className="brand-field">
            <label htmlFor="brand-drive">Google Drive Folder URL</label>
            <input
              id="brand-drive"
              type="url"
              className="form-input"
              placeholder="https://drive.google.com/drive/folders/…"
              value={form.driveFolderUrl}
              onChange={update('driveFolderUrl')}
              aria-invalid={Boolean(errors.driveFolderUrl)}
            />
            {errors.driveFolderUrl ? (
              <span className="set-error">{errors.driveFolderUrl}</span>
            ) : (
              <span className="brand-field__hint">
                Shared folder for brand assets, references and final files.
              </span>
            )}
          </div>
        </div>

        <div className="brand-form-note">
          <span className="brand-form-note__icon">
            <svg aria-hidden="true" className="icon">
              <use href="#i-calendar" />
            </svg>
          </span>
          <p>
            The brand starts as <strong>Active</strong> and appears in the Brands workspace right
            away. You can create its first monthly plan from the brand dashboard.
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
            Create Brand
          </button>
        </div>
      </form>
    </div>
  );
}
