import React from 'react';

export default function Showcase() {
  return (
    <aside className="showcase">
      <div className="showcase__top">
        <span className="eyebrow">
          <i />
          VELOCITY ENGINE
        </span>
        <span className="status">
          Enterprise Agency Cloud <i /> 99.99% Uptime
        </span>
      </div>

      <div className="showcase__hero">
        <h2 className="headline">
          From brief <em>to impact.</em>
        </h2>
        <p className="tagline">One connected creative workflow.</p>

        <div className="stage">
          <article className="card card--flow">
            <h3>
              <span className="card__icon">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M13 3L5 14h6l-1 7 8-11h-6z" />
                </svg>
              </span>
              Flow
            </h3>
            <p>Keep work moving seamlessly from idea to high impact.</p>
          </article>

          <article className="card card--collab">
            <h3>
              <span className="card__icon">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="9" cy="8" r="3" />
                  <path d="M3 19c0-3 2.7-5 6-5s6 2 6 5M16 5.5a3 3 0 0 1 0 5M18 14c2 .6 3 2.2 3 5" />
                </svg>
              </span>
              Collaboration
            </h3>
            <p>Agencies, internal talent, and clients on the same page.</p>
          </article>

          <article className="card card--momentum">
            <h3>
              <span className="card__icon">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
                </svg>
              </span>
              Creative Momentum
            </h3>
            <p>Turn abstract concepts into measurable campaign output.</p>
          </article>

          <svg className="ribbon" viewBox="0 0 420 260" aria-hidden="true">
            <defs>
              <linearGradient id="gradPurple" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#5a4a8a" />
                <stop offset="1" stopColor="#1d1840" />
              </linearGradient>
              <linearGradient id="gradOrange" x1="0" y1="1" x2="1" y2="0">
                <stop offset="0" stopColor="#ff7a45" />
                <stop offset="1" stopColor="#ffb48a" />
              </linearGradient>
              <linearGradient id="gradDeep" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#e2531c" />
                <stop offset="1" stopColor="#ff8c55" />
              </linearGradient>
            </defs>
            <path
              d="M70 200C150 140 270 50 400 70C410 120 330 195 210 218C140 232 90 222 70 200Z"
              fill="url(#gradPurple)"
            />
            <path
              d="M12 186C120 160 235 62 335 52C310 112 205 188 95 208C52 214 22 204 12 186Z"
              fill="url(#gradOrange)"
            />
            <path
              d="M12 186C95 196 215 160 335 52C255 165 125 212 45 206C28 204 16 196 12 186Z"
              fill="url(#gradDeep)"
            />
            <path
              d="M18 190C90 200 160 185 215 160"
              fill="none"
              stroke="#c9c6d6"
              strokeWidth="3"
              strokeLinecap="round"
              opacity=".85"
            />
          </svg>

          <span className="dot dot--left" />
          <span className="dot dot--right" />
        </div>
      </div>

      <ul className="steps">
        <li>CLIENTS</li>
        <li>BRANDS</li>
        <li>TEAMS</li>
        <li>CONTENT</li>
        <li>REVIEW</li>
        <li>APPROVE</li>
        <li className="is-active">ANALYZE</li>
      </ul>
    </aside>
  );
}
