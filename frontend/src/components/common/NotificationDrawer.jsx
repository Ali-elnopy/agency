import React from 'react';
import { useSprint3 } from '../../context/sprint3Store';

export default function NotificationDrawer({ isOpen, onClose }) {
  const { notifications, markNotificationRead, markAllNotificationsRead, clearNotifications, t } =
    useSprint3();

  if (!isOpen) return null;

  return (
    <div className="notif-drawer-backdrop" onClick={onClose}>
      <div
        className="notif-drawer"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={t('Notifications')}
      >
        <header className="notif-drawer__head">
          <div className="notif-drawer__title-wrap">
            <svg aria-hidden="true" className="icon notif-drawer__icon">
              <use href="#i-bell" />
            </svg>
            <h2 className="notif-drawer__title">{t('Notifications')}</h2>
            <span className="notif-drawer__badge">
              {notifications.filter((n) => !n.read).length}
            </span>
          </div>
          <div className="notif-drawer__actions">
            {notifications.length > 0 ? (
              <>
                <button
                  type="button"
                  className="button button--ghost button--sm"
                  onClick={markAllNotificationsRead}
                  title={t('Mark all as read')}
                >
                  {t('Mark all as read')}
                </button>
                <button
                  type="button"
                  className="button button--ghost button--sm"
                  onClick={clearNotifications}
                  title={t('Clear all')}
                >
                  {t('Clear all')}
                </button>
              </>
            ) : null}
            <button
              type="button"
              className="button button--ghost button--sm notif-drawer__close"
              onClick={onClose}
              aria-label={t('Close')}
            >
              ✕
            </button>
          </div>
        </header>

        <div className="notif-drawer__body">
          {notifications.length === 0 ? (
            <div className="notif-empty">
              <svg aria-hidden="true" className="icon notif-empty__icon">
                <use href="#i-check" />
              </svg>
              <p>{t('No notifications')}</p>
            </div>
          ) : (
            <div className="notif-list">
              {notifications.map((item) => (
                <div
                  key={item.id}
                  className={`notif-item ${item.read ? 'is-read' : 'is-unread'} notif-item--${item.type}`}
                  onClick={() => markNotificationRead(item.id)}
                >
                  <span className="notif-item__bullet" />
                  <div className="notif-item__content">
                    <div className="notif-item__top">
                      <strong className="notif-item__title">{t(item.title)}</strong>
                      <span className="notif-item__time">{t(item.timestamp)}</span>
                    </div>
                    <p className="notif-item__msg">{t(item.message)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
