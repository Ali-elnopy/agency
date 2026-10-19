import React, { useState } from 'react';
import InfoModal from './modals/InfoModal';

export default function StatsSection() {
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);

  return (
    <>
      <section className="stats">
        <article className="panel stat">
          <div className="stat__head">
            <span className="stat__label">ACTIVE BRANDS</span>
            <span className="stat__badges">
              <span className="pill is-green trend-pill">↗ +2.6%</span>
              <span className="chip is-orange">
                <svg className="icon">
                  <use href="#i-briefcase" />
                </svg>
              </span>
            </span>
          </div>
          <strong className="stat__value">
            24 <small>Brands</small>
          </strong>
          <p className="stat__meta">
            <span className="trend">↗ +3</span> onboarded this quarter
          </p>
          <div className="stat__foot">
            <span className="avatars">
              <i className="avatar avatar--a">A</i>
              <i className="avatar avatar--b">X</i>
              <i className="avatar avatar--c">21</i>
            </span>
            <span className="stat__go">
              <svg className="icon">
                <use href="#i-arrow" />
              </svg>
            </span>
          </div>
        </article>

        <article className="panel stat">
          <div className="stat__head">
            <span className="stat__label">USERS &amp; SEATS</span>
            <span className="stat__badges">
              <span className="pill is-green trend-pill">↗ +5.1%</span>
              <span className="chip is-green">
                <svg className="icon">
                  <use href="#i-users" />
                </svg>
              </span>
            </span>
          </div>
          <strong className="stat__value">
            148 <small>Seats</small>
          </strong>
          <p className="stat__meta">132 Active • 16 Pending Invites</p>
          <div className="stat__foot">
            <span className="stat__note">36 seats remaining</span>
            <a
              href="#upgrade"
              className="pill is-orange"
              onClick={(e) => {
                e.preventDefault();
                setIsUpgradeOpen(true);
              }}
            >
              Upgrade Plan
            </a>
          </div>
        </article>

        <article className="panel stat">
          <div className="stat__head">
            <span className="stat__label">CONTENT IN REVIEW</span>
            <span className="stat__badges">
              <span className="pill is-amber trend-pill">8</span>
              <span className="chip is-amber">
                <svg className="icon">
                  <use href="#i-eye" />
                </svg>
              </span>
            </span>
          </div>
          <strong className="stat__value">
            38 <small>Items</small>
          </strong>
          <p className="stat__meta">12 require urgent client sign-off</p>
          <div className="stat__foot">
            <span className="pill is-amber">5 bottlenecks flagged</span>
          </div>
        </article>

        <article className="panel stat">
          <div className="stat__head">
            <span className="stat__label">PUBLISHED THIS MONTH</span>
            <span className="stat__badges">
              <span className="pill is-green trend-pill">↗ New</span>
              <span className="chip is-orange">
                <svg className="icon">
                  <use href="#i-trend" />
                </svg>
              </span>
            </span>
          </div>
          <strong className="stat__value">
            342 <small>Posts</small>
          </strong>
          <p className="stat__meta">
            <span className="trend">↗ +28.4%</span> vs last month
          </p>
          <div className="stat__foot">
            <svg className="spark is-orange" viewBox="0 0 120 30" preserveAspectRatio="none" aria-hidden="true">
              <path d="M0 24 L15 19 L30 22 L45 13 L60 17 L75 9 L90 12 L105 6 L120 9" />
            </svg>
          </div>
        </article>
      </section>

      {/* Upgrade Plan Modal */}
      <InfoModal
        isOpen={isUpgradeOpen}
        onClose={() => setIsUpgradeOpen(false)}
        title="Upgrade Agency Seat Capacity"
        subtitle="Scale your studio with unlimited seats, custom roles, and dedicated CDN."
        icon="#i-zap"
        iconColor="orange"
        actionText="Contact Enterprise Sales"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <p>
            You are currently on the <strong>Studio Pro (184 Seats)</strong> tier with 36 seats remaining.
          </p>
          <div style={{ padding: '12px', borderRadius: '10px', background: 'var(--soft)', border: '1px solid var(--line)' }}>
            <h4 style={{ color: 'var(--accent-text)', marginBottom: '4px' }}>Enterprise Velocity</h4>
            <p style={{ fontSize: '12.5px', color: 'var(--muted)' }}>
              Includes unlimited seats, custom domain white-labeling, SOC2 compliance reports, and priority 24/7 SLA.
            </p>
          </div>
        </div>
      </InfoModal>
    </>
  );
}
