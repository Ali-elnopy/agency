import React, { useRef } from 'react';

/**
 * Segmented view switch used by the Users/Roles screens. Arrow keys move the
 * selection, and only the active tab stays in the tab order.
 */
export default function ViewTabs({ label, tabs, activeId, onChange }) {
  const refs = useRef(new Map());

  const focusTab = (index) => {
    const next = tabs[(index + tabs.length) % tabs.length];

    onChange(next.id);
    window.setTimeout(() => refs.current.get(next.id)?.focus(), 0);
  };

  const handleKeyDown = (event, index) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      focusTab(index + 1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      focusTab(index - 1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      focusTab(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      focusTab(tabs.length - 1);
    }
  };

  return (
    <div className="view-switch" role="tablist" aria-label={label}>
      {tabs.map((tab, index) => {
        const isActive = tab.id === activeId;

        return (
          <button
            key={tab.id}
            ref={(node) => {
              if (node) refs.current.set(tab.id, node);
              else refs.current.delete(tab.id);
            }}
            type="button"
            role="tab"
            id={`view-tab-${tab.id}`}
            className={`view-switch__item${isActive ? ' is-active' : ''}`}
            aria-selected={isActive}
            aria-controls="view-panel"
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(tab.id)}
            onKeyDown={(event) => handleKeyDown(event, index)}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
