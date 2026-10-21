import React from 'react';

/**
 * Floating toast shared by every dashboard screen.
 * tone: "success" (default) | "info" | "danger"
 * Renders nothing when there is no message.
 */
export default function Toast({ message, tone = 'success' }) {
  if (!message) return null;

  const toneClass = tone === 'info' ? 'is-amber' : tone === 'danger' ? 'is-red' : 'is-green';

  return (
    <div className="toast-notice" role="status" aria-live="polite">
      <span className={`toast-icon chip ${toneClass}`}>
        <svg className="icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          {tone === 'success' ? (
            <path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          ) : (
            <path d="M12 7.2v5.4M12 16.4v.2" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
          )}
        </svg>
      </span>
      <span>{message}</span>
    </div>
  );
}
