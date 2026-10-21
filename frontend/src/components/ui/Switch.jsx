import React from 'react';

/**
 * Accessible on/off switch used across Settings, RBAC and user governance screens.
 */
export default function Switch({ checked, onChange, label, disabled = false }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      className={`switch${checked ? ' is-on' : ''}`}
      onClick={() => onChange(!checked)}
    >
      <span className="switch__knob" />
    </button>
  );
}
