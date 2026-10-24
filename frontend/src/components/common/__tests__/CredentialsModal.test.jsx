import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import CredentialsModal from '../CredentialsModal';

const writeText = vi.fn().mockResolvedValue(undefined);

beforeEach(() => {
  writeText.mockClear();
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText },
  });
});

function setup(props = {}) {
  const onClose = vi.fn();

  render(
    <CredentialsModal
      isOpen
      fullName="Maya Lin"
      email="maya@agency.com"
      password="Str0ng!Passw0rdX"
      onClose={onClose}
      {...props}
    />,
  );

  return { onClose };
}

describe('CredentialsModal', () => {
  it('keeps the password visible until the admin dismisses it', () => {
    setup();

    expect(screen.getByText('Str0ng!Passw0rdX')).toBeInTheDocument();
    expect(screen.getByText('maya@agency.com')).toBeInTheDocument();
  });

  it('copies only the password, without the label', () => {
    setup();

    fireEvent.click(screen.getByRole('button', { name: /copy temporary password/i }));

    expect(writeText).toHaveBeenCalledWith('Str0ng!Passw0rdX');
  });

  it('copies the email and the password together', () => {
    setup();

    fireEvent.click(screen.getByRole('button', { name: /copy email and password/i }));

    expect(writeText).toHaveBeenCalledWith(
      'Email: maya@agency.com\nTemporary password: Str0ng!Passw0rdX',
    );
  });

  it('closes from the confirmation button', () => {
    const { onClose } = setup();

    fireEvent.click(screen.getByRole('button', { name: /i saved the credentials/i }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('cannot be dismissed accidentally with Escape', () => {
    const { onClose } = setup();

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onClose).not.toHaveBeenCalled();
  });

  it('never shows a password when the account was only mocked', () => {
    setup({ password: '', isDemo: true });

    expect(screen.queryByText('Str0ng!Passw0rdX')).not.toBeInTheDocument();
    expect(screen.getByText(/demo mode is on/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /copy temporary password/i })).not.toBeInTheDocument();
  });

  it('explains a failed team link without hiding the credentials', () => {
    setup({ warning: 'Team not found.' });

    expect(screen.getByText('Str0ng!Passw0rdX')).toBeInTheDocument();
    expect(screen.getByText(/team link failed/i)).toBeInTheDocument();
  });
});

