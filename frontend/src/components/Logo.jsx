import React from 'react';

/**
 * ORVIA brand mark — modern squircle logo badge with concentric circles.
 */
export default function Logo({ className = '', size = 34, title = 'ORVIA' }) {
  const decorative = !title;
  return (
    <div
      className={`logo-badge${className ? ` ${className}` : ''}`}
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.28),
        background: '#111111',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
      }}
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : title}
      aria-hidden={decorative ? 'true' : undefined}
    >
      <svg width={Math.round(size * 0.58)} height={Math.round(size * 0.58)} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="#ffffff" strokeWidth="2.2" />
        <circle cx="12" cy="12" r="4" fill="#ffffff" />
      </svg>
    </div>
  );
}
