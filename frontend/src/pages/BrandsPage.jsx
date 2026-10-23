import React, { useMemo, useState } from 'react';
import { useBrands } from '../context/brandsStore';
import {
  BRAND_STATUSES,
  BRAND_STATUS_LABEL,
  initialsOf,
  monthShortLabel,
} from '../data/brands';

const ALL_STATUSES = 'all';

function normalize(value) {
  return String(value ?? '').toLowerCase().trim();
}

export default function BrandsPage({ onOpenBrand, onAddBrand }) {
  const { brands, plans, content } = useBrands();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState(ALL_STATUSES);

  const filtered = useMemo(() => {
    const needle = normalize(query);

    return brands.filter((brand) => {
      if (status !== ALL_STATUSES && brand.status !== status) return false;
      if (!needle) return true;

      return [
        brand.name,
        brand.industry,
        brand.country,
        brand.timezone,
        brand.timezoneLabel,
        brand.manager,
        brand.team,
        BRAND_STATUS_LABEL[brand.status],
      ]
        .filter(Boolean)
        .some((value) => normalize(value).includes(needle));
    });
  }, [brands, query, status]);

  const counts = useMemo(
    () =>
      brands.reduce(
        (accumulator, brand) => {
          accumulator.all += 1;
          if (brand.status) accumulator[brand.status] = (accumulator[brand.status] ?? 0) + 1;
          return accumulator;
        },
        { all: 0, active: 0, onboarding: 0, archived: 0 },
      ),
    [brands],
  );

  const planSummary = useMemo(() => {
    const summary = new Map();

    brands.forEach((brand) => {
      const brandPlans = plans
        .filter((item) => item.brandId === brand.id)
        .sort((a, b) => a.month.localeCompare(b.month));
      const plan = brandPlans[brandPlans.length - 1] ?? null;
      const items = plan
        ? content.filter((item) => item.brandId === brand.id && item.month === plan.month).length
        : 0;

      summary.set(brand.id, { plan, items });
    });

    return summary;
  }, [brands, plans, content]);

  const hasFilters = query.trim() !== '' || status !== ALL_STATUSES;

  return (
    <div className="page-screen brands-page">
      <section className="page-head page-head--actions">
        <h1 className="page-head__title">Brands</h1>
        <div className="page-head__actions">
          <button type="button" className="button button--primary" onClick={onAddBrand}>
            <svg aria-hidden="true" className="icon">
              <use href="#i-plus" />
            </svg>
            Add Brand
          </button>
        </div>
      </section>

      <div className="filters brands-filters">
        <label className="search">
          <input
            type="search"
            placeholder="Search brands by name, industry, country or manager…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Search brands"
          />
          <svg aria-hidden="true" className="icon">
            <use href="#i-search" />
          </svg>
        </label>

        <span className="filter-select">
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            aria-label="Filter brands by status"
          >
            <option value={ALL_STATUSES}>All statuses ({counts.all})</option>
            {BRAND_STATUSES.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label} ({counts[option.id] ?? 0})
              </option>
            ))}
          </select>
          <svg aria-hidden="true" className="icon">
            <use href="#i-chevron" />
          </svg>
        </span>

        <span className="brands-count">
          {filtered.length} {filtered.length === 1 ? 'brand' : 'brands'}
        </span>
      </div>

      {filtered.length > 0 ? (
        <div className="brands-grid">
          {filtered.map((brand) => {
            const { plan, items } = planSummary.get(brand.id) ?? {};
            const statusLabel = BRAND_STATUS_LABEL[brand.status] ?? 'Active';

            return (
              <article className="brand-card" key={brand.id}>
                <div className="brand-card__top">
                  <span className={`cl-brand__mark brand-card__mark ${brand.tone}`}>
                    {brand.initials || initialsOf(brand.name)}
                  </span>
                  <span className={`brand-status is-${brand.status}`}>
                    <i className="brand-status__dot" aria-hidden="true" />
                    {statusLabel}
                  </span>
                </div>

                <div className="brand-card__body">
                  <div className="brand-card__name-row">
                    <h2 className="brand-card__name">{brand.name}</h2>
                    {brand.verified ? (
                      <span className="brand-card__verified" title="Verified brand">
                        <svg aria-hidden="true" className="icon">
                          <use href="#i-check" />
                        </svg>
                      </span>
                    ) : null}
                  </div>

                  <p className="brand-card__industry">{brand.industry || 'Uncategorized'}</p>

                  <div className="brand-card__meta">
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
                  </div>

                  <div className="brand-card__manager">
                    {brand.manager ? (
                      <>
                        <span className="brand-mini-avatar">
                          {brand.managerInitials || initialsOf(brand.manager)}
                        </span>
                        <span className="brand-card__manager-copy">
                          <strong>{brand.manager}</strong>
                          <small>{brand.team || 'No team assigned'}</small>
                        </span>
                      </>
                    ) : (
                      <span className="brand-unassigned">
                        <svg aria-hidden="true" className="icon">
                          <use href="#i-user-plus" />
                        </svg>
                        Awaiting manager assignment
                      </span>
                    )}
                  </div>
                </div>

                <div className="brand-card__foot">
                  <span className="brand-card__plan">
                    {plan
                      ? `${monthShortLabel(plan.month)} plan · ${items} ${items === 1 ? 'item' : 'items'}`
                      : 'No monthly plan yet'}
                  </span>
                  <button
                    type="button"
                    className="brand-open"
                    onClick={() => onOpenBrand(brand.id)}
                  >
                    Open Brand
                    <svg aria-hidden="true" className="icon">
                      <use href="#i-arrow" />
                    </svg>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <section className="brand-empty brand-empty--page">
          <span className="brand-empty__icon">
            <svg aria-hidden="true" className="icon">
              <use href="#i-briefcase" />
            </svg>
          </span>
          <h2>{brands.length === 0 ? 'No brands yet' : 'No brands match those filters'}</h2>
          <p>
            {brands.length === 0
              ? 'Create your first brand workspace to start building monthly content plans.'
              : 'Try a different name, industry, country or status.'}
          </p>
          <div className="brand-empty__actions">
            {hasFilters ? (
              <button
                type="button"
                className="button button--ghost"
                onClick={() => {
                  setQuery('');
                  setStatus(ALL_STATUSES);
                }}
              >
                Clear filters
              </button>
            ) : null}
            <button type="button" className="button button--primary" onClick={onAddBrand}>
              <svg aria-hidden="true" className="icon">
                <use href="#i-plus" />
              </svg>
              Add Brand
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
