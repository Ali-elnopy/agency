import React, { useEffect, useRef, useState } from 'react';
import Modal from './Modal';
import { copyToClipboard } from '../../utils/credentials';
import './CredentialsModal.css';

const COPIED_RESET_MS = 2500;

function CredentialRow({ label, value, mono = false, onCopy, copied }) {
  return (
    <div className="cred-row">
      <div className="cred-row__meta">
        <span className="cred-row__label">{label}</span>
        <code className={`cred-row__value${mono ? ' is-mono' : ''}`}>{value || '—'}</code>
      </div>
      <button
        type="button"
        className="cred-copy"
        onClick={onCopy}
        aria-label={`Copy ${label.toLowerCase()}`}
      >
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  );
}

/**
 * Shows the credentials of an account that was just created.
 *
 * The password is shown here (not in a toast) because a toast disappears after
 * a few seconds and cannot be copied reliably. Closing the dialog is the only
 * way to dismiss it, so the administrator decides when the credentials are
 * gone from the screen.
 */
export default function CredentialsModal({
  isOpen,
  fullName = '',
  email = '',
  password = '',
  isDemo = false,
  warning = '',
  onClose,
}) {
  const [copied, setCopied] = useState('');
  const timer = useRef(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const copy = async (key, value) => {
    const ok = await copyToClipboard(value);

    if (!ok) return;

    setCopied(key);

    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      timer.current = null;
      setCopied('');
    }, COPIED_RESET_MS);
  };

  const copyAll = () =>
    copy('all', [`Email: ${email}`, `Temporary password: ${password}`].join('\n'));

  const demo = isDemo || !password;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={demo ? 'Member saved without a login' : 'Account created'}
      subtitle={
        demo
          ? 'This browser is running in demo mode, so no server account was created.'
          : `Share these credentials with ${fullName || 'the new member'}.`
      }
      icon={demo ? '#i-alert' : '#i-shield'}
      iconColor={demo ? 'amber' : 'green'}
      maxWidth="520px"
      dismissible={false}
      footer={
        <button type="button" className="cred-done" onClick={onClose} autoFocus>
          {demo ? 'Got it' : 'I saved the credentials'}
        </button>
      }
    >
      {demo ? (
        <div className="cred-alert cred-alert--warn" role="status">
          <strong>Demo mode is on.</strong>
          <p>
            The member exists in this browser only. The API was never called, so the account cannot
            sign in and no password is shown. Turn demo mode off and add the member again to create
            a real login.
          </p>
        </div>
      ) : (
        <>
          <div className="cred-alert" role="status">
            <strong>This password is shown only once.</strong>
            <p>
              Copy it now. If it is lost, use “Forgot password” on the sign-in screen or set a new
              password from the user directory.
            </p>
          </div>

          <div className="cred-list">
            <CredentialRow
              label="Email"
              value={email}
              copied={copied === 'email'}
              onCopy={() => copy('email', email)}
            />
            <CredentialRow
              label="Temporary password"
              value={password}
              mono
              copied={copied === 'password'}
              onCopy={() => copy('password', password)}
            />
          </div>

          <div className="cred-actions">
            <button type="button" className="cred-copy cred-copy--all" onClick={copyAll}>
              {copied === 'all' ? 'Credentials copied' : 'Copy email and password'}
            </button>
          </div>

          {warning && (
            <div className="cred-alert cred-alert--warn" role="status">
              <strong>The account is ready, but the team link failed.</strong>
              <p>{warning} You can add the member to the team again from the Teams screen.</p>
            </div>
          )}

          <p className="cred-note">
            The member can change this password after signing in. Passwords are stored hashed, so
            nobody can read them back later — not even an administrator.
          </p>
        </>
      )}
    </Modal>
  );
}
