import React from 'react';
import { useBrands } from '../../context/brandsStore';
import { platformShort } from '../../data/brandWorkspace';

export default function SocialPlatformsSection({
  brand,
  onAddPlatform,
  onEditPlatform,
  onDeletePlatform,
  onOpenPlan,
}) {
  const { getPlatforms, getPlanDirections } = useBrands();
  const platforms = getPlatforms(brand.id);
  const directions = getPlanDirections(brand.id);

  return (
    <div className="bw-section">
      <header className="bw-head">
        <div>
          <h2 className="bw-title">Social Media Platforms</h2>
          <p className="bw-sub">
            Every channel the brand publishes on. Plans are kept separately for each platform.
          </p>
        </div>
        <button type="button" className="button button--primary button--sm" onClick={onAddPlatform}>
          <svg aria-hidden="true" className="icon">
            <use href="#i-plus" />
          </svg>
          Add Platform
        </button>
      </header>

      {platforms.length ? (
        <div className="bw-platform-cards">
          {platforms.map((platform) => {
            const platformDirections = directions.filter(
              (item) => item.platformId === platform.id,
            );

            return (
              <article className="bw-card bw-platform-tile" key={platform.id}>
                <header className="bw-platform-tile__head">
                  <span className={`bw-platform-mark ${platform.tone ?? 'is-orange'}`}>
                    {platform.short || platformShort(platform.name)}
                  </span>
                  <div>
                    <h3>{platform.name}</h3>
                    <p>{platform.handle || 'No handle saved'}</p>
                  </div>
                  <span className="bw-card__actions">
                    <button
                      type="button"
                      className="bw-icon-btn"
                      title="Edit platform"
                      aria-label={`Edit ${platform.name}`}
                      onClick={() => onEditPlatform?.(platform)}
                    >
                      <svg aria-hidden="true" className="icon">
                        <use href="#i-pencil" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="bw-icon-btn is-danger"
                      title="Delete platform"
                      aria-label={`Delete ${platform.name}`}
                      onClick={() => onDeletePlatform?.(platform)}
                    >
                      <svg aria-hidden="true" className="icon">
                        <use href="#i-trash" />
                      </svg>
                    </button>
                  </span>
                </header>

                <p className="bw-platform-tile__goal">
                  {platform.goal || 'No goal added for this platform yet.'}
                </p>

                <div className="bw-platform-tile__meta">
                  <span>
                    <strong>{platform.monthlyTarget || 0}</strong> pieces / month
                  </span>
                  <span>
                    <strong>{platformDirections.length}</strong> plan directions
                  </span>
                </div>

                <div className="bw-chip-row">
                  {platform.contentTypes?.length ? (
                    platform.contentTypes.map((type) => (
                      <span className="bw-chip" key={type}>
                        {type}
                      </span>
                    ))
                  ) : (
                    <span className="bw-muted">No content types selected.</span>
                  )}
                </div>

                <footer className="bw-platform-tile__foot">
                  {platform.url ? (
                    <a className="brand-link" href={platform.url} target="_blank" rel="noreferrer">
                      Open profile
                      <svg aria-hidden="true" className="icon">
                        <use href="#i-external" />
                      </svg>
                    </a>
                  ) : (
                    <span />
                  )}
                  <button
                    type="button"
                    className="button button--ghost button--sm"
                    onClick={() => onOpenPlan?.(platform.id)}
                  >
                    Open plans
                  </button>
                </footer>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="bw-empty bw-empty--panel">
          <strong>No social platforms yet.</strong>
          <p>Add Instagram, Facebook, TikTok or any other channel to start planning per platform.</p>
          <button type="button" className="button button--primary button--sm" onClick={onAddPlatform}>
            <svg aria-hidden="true" className="icon">
              <use href="#i-plus" />
            </svg>
            Add Platform
          </button>
        </div>
      )}
    </div>
  );
}
