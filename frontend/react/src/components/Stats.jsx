import { Icon } from "./Icons.jsx";

export default function Stats() {
  return (
    <section className="stats">
      <article className="panel stat">
        <div className="stat__head">
          <span className="stat__label">ACTIVE BRANDS</span>
          <span className="stat__badges">
            <span className="pill is-green trend-pill">↗ +2.6%</span>
            <span className="chip is-orange"><Icon id="briefcase" /></span>
          </span>
        </div>
        <strong className="stat__value">24 <small>Brands</small></strong>
        <p className="stat__meta"><span className="trend">↗ +3</span> onboarded this quarter</p>
        <div className="stat__foot">
          <span className="avatars">
            <i className="avatar avatar--a">A</i>
            <i className="avatar avatar--b">X</i>
            <i className="avatar avatar--c">21</i>
          </span>
          <span className="stat__go"><Icon id="arrow" /></span>
        </div>
      </article>

      <article className="panel stat">
        <div className="stat__head">
          <span className="stat__label">USERS &amp; SEATS</span>
          <span className="stat__badges">
            <span className="pill is-green trend-pill">↗ +5.1%</span>
            <span className="chip is-green"><Icon id="users" /></span>
          </span>
        </div>
        <strong className="stat__value">148 <small>Seats</small></strong>
        <p className="stat__meta">132 Active • 16 Pending Invites</p>
        <div className="stat__foot">
          <span className="stat__note">36 seats remaining</span>
          <a href="#dashboard" className="pill is-orange">Upgrade Plan</a>
        </div>
      </article>

      <article className="panel stat">
        <div className="stat__head">
          <span className="stat__label">CONTENT IN REVIEW</span>
          <span className="stat__badges">
            <span className="pill is-amber trend-pill">8</span>
            <span className="chip is-amber"><Icon id="eye" /></span>
          </span>
        </div>
        <strong className="stat__value">38 <small>Items</small></strong>
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
            <span className="chip is-orange"><Icon id="trend" /></span>
          </span>
        </div>
        <strong className="stat__value">342 <small>Posts</small></strong>
        <p className="stat__meta"><span className="trend">↗ +28.4%</span> vs last month</p>
        <div className="stat__foot">
          <svg className="spark is-orange" viewBox="0 0 120 30" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 24 L15 19 L30 22 L45 13 L60 17 L75 9 L90 12 L105 6 L120 9" />
          </svg>
        </div>
      </article>
    </section>
  );
}
