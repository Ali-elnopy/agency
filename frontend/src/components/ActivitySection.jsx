import React, { useState, useEffect } from 'react';
import InfoModal from './modals/InfoModal';

const INITIAL_ACTIVITIES = [
  {
    id: 1,
    avatarClass: 'is-a',
    initials: 'EV',
    name: 'Elena Vance',
    time: '8m ago',
    role: 'Studio Lead',
    action: (
      <>
        <span className="pill is-green">
          <svg className="icon">
            <use href="#i-check" />
          </svg>
          Approved
        </span>{' '}
        "Lumina Brand Refresh Q3 Hero Motion"
      </>
    ),
  },
  {
    id: 2,
    avatarClass: 'is-b',
    initials: 'DR',
    name: 'Devon Ray',
    time: '42m ago',
    role: 'Content Creator',
    action: 'Uploaded 6 new 3D assets to "Kinetic Health Launch"',
  },
  {
    id: 3,
    avatarClass: 'is-c',
    initials: 'MK',
    name: 'Milo Kostas',
    time: '2h ago',
    role: 'Account Manager',
    action: 'Invited 2 client stakeholders from "Aura Mobility"',
  },
  {
    id: 4,
    avatarClass: 'is-d',
    initials: 'SL',
    name: 'Sarah Lin',
    hasDot: true,
    time: '3h ago',
    role: 'Brand Lead',
    action: 'Updated the "Q4 Style Guide Deck"',
  },
  {
    id: 5,
    isSys: true,
    name: 'System Engine',
    time: '5h ago',
    desc: 'Automated cloud backup & CDN distribution completed for 14 active brands.',
  },
];

export default function ActivitySection({ incomingActivity }) {
  const [activities, setActivities] = useState(INITIAL_ACTIVITIES);
  const [isViewAllOpen, setIsViewAllOpen] = useState(false);

  useEffect(() => {
    if (incomingActivity) {
      setActivities((prev) => [incomingActivity, ...prev]);
    }
  }, [incomingActivity]);

  return (
    <>
      <article className="panel panel--activity">
        <header className="panel__head">
          <h2 className="panel__title">Studio Activity</h2>
          <a
            href="#all-activity"
            className="link-action"
            onClick={(e) => {
              e.preventDefault();
              setIsViewAllOpen(true);
            }}
          >
            View All
          </a>
        </header>

        <ul className="feed">
          {activities.map((item) =>
            item.isSys ? (
              <li key={item.id} className="feed__item feed__item--sys">
                <span className="feed__avatar feed__avatar--sys">
                  <svg className="icon">
                    <use href="#i-layers" />
                  </svg>
                </span>
                <div className="feed__body">
                  <p className="feed__who">
                    <strong>{item.name}</strong>
                    <span className="feed__time">{item.time}</span>
                  </p>
                  <p className="feed__desc">{item.desc}</p>
                </div>
              </li>
            ) : (
              <li key={item.id} className="feed__item">
                <span className={`feed__avatar ${item.avatarClass}`}>{item.initials}</span>
                <div className="feed__body">
                  <p className="feed__who">
                    <strong>
                      {item.name}
                      {item.hasDot && <i className="feed__dot" />}
                    </strong>
                    <span className="feed__time">{item.time}</span>
                  </p>
                  <p className="feed__line">
                    {item.action} <span className="feed__role">{item.role}</span>
                  </p>
                </div>
              </li>
            ),
          )}
        </ul>
      </article>

      {/* Audit Feed Modal */}
      <InfoModal
        isOpen={isViewAllOpen}
        onClose={() => setIsViewAllOpen(false)}
        title="Complete Studio Activity Audit Log"
        subtitle="Real-time production stream across all active team seats."
        icon="#i-chart"
        iconColor="purple"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <p style={{ color: 'var(--muted)', fontSize: '13px' }}>
            Listing chronological actions recorded in the agency event ledger.
          </p>
          <div style={{ maxHeight: '240px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {activities.map((a) => (
              <div
                key={a.id}
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  background: 'var(--soft)',
                  border: '1px solid var(--line)',
                  fontSize: '12.5px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <strong>{a.name}</strong>
                  <span style={{ color: 'var(--muted)', fontSize: '11px' }}>{a.time}</span>
                </div>
                <div style={{ color: 'var(--ink)' }}>{a.action || a.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </InfoModal>
    </>
  );
}
