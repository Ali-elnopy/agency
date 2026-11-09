import React, { useEffect, useMemo, useState } from 'react';
import { useBrands } from '../../context/brandsStore';
import {
  PLAN_DIRECTION_STATUSES,
  PLAN_DIRECTION_STATUS_LABEL,
  PLAN_DIRECTION_STATUS_TONE,
} from '../../data/brandWorkspace';
import {
  CONTENT_TYPES,
  CONTENT_TYPE_LABEL,
  monthKey,
  monthLabel,
  shiftMonth,
} from '../../data/brands';

const EMPTY = { title: '', body: '', status: 'draft' };

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function shortDate(value) {
  if (!value) return '—';
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
}

export default function PlanDirectionSection({
  brand,
  onToast,
  onAddPlatform,
  onAddContent,
  initialPlatformId,
  initialMonth,
}) {
  const {
    getPlatforms,
    getPlanDirections,
    savePlanDirection,
    deletePlanDirection,
    content,
  } = useBrands();

  const platforms = getPlatforms(brand.id);
  const [platformId, setPlatformId] = useState(initialPlatformId ?? '');
  const [month, setMonth] = useState(initialMonth || monthKey());
  const [editor, setEditor] = useState(null);

  useEffect(() => {
    if (platforms.length && !platforms.some((item) => item.id === platformId)) {
      setPlatformId(platforms[0].id);
    }
    if (!platforms.length) setPlatformId('');
  }, [platforms, platformId]);

  const platform = platforms.find((item) => item.id === platformId) ?? null;

  const directions = useMemo(
    () =>
      platform
        ? getPlanDirections(brand.id)
            .filter((item) => item.platformId === platform.id && item.month === month)
            .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
        : [],
    [getPlanDirections, brand.id, platform, month],
  );

  const monthContent = useMemo(
    () =>
      platform
        ? content
            .filter(
              (item) =>
                item.brandId === brand.id &&
                item.month === month &&
                String(item.platformId) === String(platform.id),
            )
            .sort((a, b) =>
              `${a.publishDate}T${a.publishTime}`.localeCompare(
                `${b.publishDate}T${b.publishTime}`,
              ),
            )
        : [],
    [content, brand.id, month, platform],
  );

  const monthsWithDirections = useMemo(() => {
    const months = new Set(
      getPlanDirections(brand.id)
        .filter((item) => item.platformId === platformId)
        .map((item) => item.month),
    );
    return Array.from(months).sort().reverse();
  }, [getPlanDirections, brand.id, platformId]);

  const activeDirection = directions.find((item) => item.status === 'active') ?? directions[0];
  const target = platform?.monthlyTarget ?? 0;
  const delivered = monthContent.filter((item) => item.status === 'delivered').length;

  const startCreate = () => setEditor({ ...EMPTY });
  const startEdit = (direction) =>
    setEditor({
      id: direction.id,
      title: direction.title,
      body: direction.body,
      status: direction.status,
    });

  const handleSave = (event) => {
    event.preventDefault();
    if (!editor) return;
    if (!editor.title.trim() || !editor.body.trim()) {
      onToast?.('Add a title and the plan direction.', 'danger');
      return;
    }

    savePlanDirection({
      id: editor.id,
      brandId: brand.id,
      platformId,
      month,
      title: editor.title,
      body: editor.body,
      status: editor.status,
    });

    setEditor(null);
    onToast?.(
      editor.id ? 'Plan direction updated.' : `Plan added for ${monthLabel(month)}.`,
    );
  };

  if (!platforms.length) {
    return (
      <div className="bw-section">
        <header className="bw-head">
          <div>
            <h2 className="bw-title">Monthly Plans</h2>
            <p className="bw-sub">Platform, month, plan direction and the content plan together.</p>
          </div>
        </header>
        <div className="bw-empty bw-empty--panel">
          <strong>Add a platform first.</strong>
          <p>Monthly plans are separated by platform, so start by adding one.</p>
          <button type="button" className="button button--primary button--sm" onClick={onAddPlatform}>
            <svg aria-hidden="true" className="icon">
              <use href="#i-plus" />
            </svg>
            Add Platform
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bw-section">
      <header className="bw-head">
        <div>
          <h2 className="bw-title">Monthly Plans</h2>
          <p className="bw-sub">
            {platform?.name} · {monthLabel(month)} — the direction, the target and everything
            planned for this month.
          </p>
        </div>
        <button type="button" className="button button--primary button--sm" onClick={startCreate}>
          <svg aria-hidden="true" className="icon">
            <use href="#i-plus" />
          </svg>
          Add plan direction
        </button>
      </header>

      <div className="bw-toolbar">
        <div className="bw-tabs is-platforms">
          {platforms.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`bw-tab${item.id === platformId ? ' is-active' : ''}`}
              onClick={() => setPlatformId(item.id)}
            >
              {item.name}
            </button>
          ))}
        </div>

        <div className="bw-month">
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
          <input
            type="month"
            className="form-input"
            value={month}
            onChange={(event) => event.target.value && setMonth(event.target.value)}
            aria-label="Monthly plan month"
          />
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

      {monthsWithDirections.length > 1 ? (
        <div className="bw-history">
          <span>Months with a plan:</span>
          {monthsWithDirections.map((item) => (
            <button
              key={item}
              type="button"
              className={`bw-chip${item === month ? ' is-active' : ''}`}
              onClick={() => setMonth(item)}
            >
              {monthLabel(item)}
            </button>
          ))}
        </div>
      ) : null}

      <div className="bw-plan-layout">
        <section className="bw-card bw-plan-card">
          <header className="bw-plan-card__head">
            <div>
              <span className="bw-label">Plan</span>
              <h3>{platform?.name} Plan</h3>
              <p>{monthLabel(month)} · {month}</p>
            </div>
            <span
              className={`pill ${
                activeDirection
                  ? PLAN_DIRECTION_STATUS_TONE[activeDirection.status] ?? 'is-gray'
                  : 'is-gray'
              }`}
            >
              {activeDirection
                ? PLAN_DIRECTION_STATUS_LABEL[activeDirection.status] ?? activeDirection.status
                : 'No plan yet'}
            </span>
          </header>

          <div className="bw-plan-card__section">
            <span className="bw-label">Platform goal</span>
            <p>{platform?.goal || 'No goal set for this platform.'}</p>
          </div>

          <div className="bw-plan-card__stats">
            <div>
              <span>Required this month</span>
              <strong>{target || '—'}</strong>
            </div>
            <div>
              <span>Planned</span>
              <strong>{monthContent.length}</strong>
            </div>
            <div>
              <span>Delivered</span>
              <strong className="is-green">{delivered}</strong>
            </div>
          </div>

          <div className="bw-plan-card__section">
            <span className="bw-label">Content types</span>
            <div className="bw-chip-row">
              {platform?.contentTypes?.length ? (
                platform.contentTypes.map((type) => (
                  <span className="bw-chip" key={type}>
                    {type}
                  </span>
                ))
              ) : (
                <span className="bw-muted">No content types selected.</span>
              )}
            </div>
          </div>

          {activeDirection ? (
            <div className="bw-plan-card__direction">
              <span className="bw-label">Latest direction</span>
              <strong>{activeDirection.title}</strong>
              <p>{activeDirection.body}</p>
            </div>
          ) : (
            <div className="bw-empty">
              <strong>No direction for {monthLabel(month)} yet.</strong>
              <p>Add what this platform should achieve this month.</p>
              <button type="button" className="button button--primary button--sm" onClick={startCreate}>
                <svg aria-hidden="true" className="icon">
                  <use href="#i-plus" />
                </svg>
                Add plan direction
              </button>
            </div>
          )}
        </section>

        <section className="bw-card">
          <header className="bw-card__head">
            <div>
              <h3>Plan directions</h3>
              <p>More than one direction can be active for the same month.</p>
            </div>
            <span className="pill is-gray">{directions.length}</span>
          </header>

          {editor ? (
            <form className="bw-form" onSubmit={handleSave}>
              <div className="bw-field">
                <label htmlFor="direction-title">Title</label>
                <input
                  id="direction-title"
                  className="form-input"
                  value={editor.title}
                  placeholder="Launch the refill ritual"
                  onChange={(event) =>
                    setEditor((prev) => ({ ...prev, title: event.target.value }))
                  }
                />
              </div>
              <div className="bw-field">
                <label htmlFor="direction-body">Direction</label>
                <textarea
                  id="direction-body"
                  className="form-textarea"
                  rows={5}
                  placeholder="The narrative, formats, hooks and calls to action for this month…"
                  value={editor.body}
                  onChange={(event) => setEditor((prev) => ({ ...prev, body: event.target.value }))}
                />
              </div>
              <div className="bw-field">
                <label htmlFor="direction-status">Status</label>
                <span className="form-select-wrap">
                  <select
                    id="direction-status"
                    className="form-select"
                    value={editor.status}
                    onChange={(event) =>
                      setEditor((prev) => ({ ...prev, status: event.target.value }))
                    }
                  >
                    {PLAN_DIRECTION_STATUSES.map((status) => (
                      <option key={status.id} value={status.id}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                  <svg aria-hidden="true" className="icon">
                    <use href="#i-chevron" />
                  </svg>
                </span>
              </div>
              <div className="bw-actions">
                <button
                  type="button"
                  className="button button--ghost button--sm"
                  onClick={() => setEditor(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="button button--primary button--sm">
                  Save direction
                </button>
              </div>
            </form>
          ) : directions.length ? (
            <ul className="bw-direction-list">
              {directions.map((direction) => (
                <li key={direction.id}>
                  <strong>
                    {direction.title}
                    <span
                      className={`pill ${
                        PLAN_DIRECTION_STATUS_TONE[direction.status] ?? 'is-gray'
                      }`}
                    >
                      {PLAN_DIRECTION_STATUS_LABEL[direction.status] ?? direction.status}
                    </span>
                  </strong>
                  <p>{direction.body}</p>
                  <div className="bw-direction-row">
                    <small>Updated {formatDate(direction.updatedAt)}</small>
                    <span>
                      <button
                        type="button"
                        className="bw-link"
                        onClick={() => startEdit(direction)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="bw-link is-danger"
                        onClick={() => {
                          deletePlanDirection(direction.id);
                          onToast?.('Plan direction deleted.');
                        }}
                      >
                        Delete
                      </button>
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            !editor && (
              <div className="bw-empty">
                <strong>No directions yet.</strong>
                <p>The platform has no plan for {monthLabel(month)}.</p>
              </div>
            )
          )}
        </section>
      </div>

      <section className="bw-card">
        <header className="bw-card__head">
          <div>
            <h3>
              {platform?.name} content plan · {monthLabel(month)}
            </h3>
            <p>
              {monthContent.length} {monthContent.length === 1 ? 'piece' : 'pieces'} planned
              {target ? ` of ${target}` : ''}.
            </p>
          </div>
          <button
            type="button"
            className="button button--primary button--sm"
            onClick={() => onAddContent?.(month, platformId)}
          >
            <svg aria-hidden="true" className="icon">
              <use href="#i-plus" />
            </svg>
            Add Content
          </button>
        </header>

        {monthContent.length ? (
          <div className="table-wrap">
            <table className="table bw-table">
              <thead>
                <tr>
                  <th>Content</th>
                  <th>Type</th>
                  <th>Publish</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {monthContent.map((item) => {
                  const type = CONTENT_TYPES.find((option) => option.id === item.type) ?? null;

                  return (
                    <tr key={item.id}>
                      <td>
                        <div className="ov-person">
                          <span className="content-item__icon">
                            <svg aria-hidden="true" className="icon">
                              <use href={type?.icon ?? '#i-file'} />
                            </svg>
                          </span>
                          {item.title}
                        </div>
                      </td>
                      <td>{CONTENT_TYPE_LABEL[item.type] ?? item.type}</td>
                      <td>
                        {shortDate(item.publishDate)}
                        <small> · {item.publishTime}</small>
                      </td>
                      <td>
                        <span className={`content-status is-${item.status}`}>
                          <i aria-hidden="true" />
                          {item.status === 'delivered' ? 'Delivered' : 'Planned'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bw-empty">
            <strong>No content planned for this platform in {monthLabel(month)}.</strong>
            <p>Add the first piece, or switch the month to review a previous plan.</p>
            <button
              type="button"
              className="button button--primary button--sm"
              onClick={() => onAddContent?.(month, platformId)}
            >
              <svg aria-hidden="true" className="icon">
                <use href="#i-plus" />
              </svg>
              Add Content
            </button>
          </div>
        )}
      </section>

      <p className="bw-footnote">
        Plans are kept separately for every platform and month. Pick another month to review a
        previous plan.
      </p>
    </div>
  );
}
