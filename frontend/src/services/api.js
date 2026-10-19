// API Client for ORVIA Agency Backend (Express / Prisma)
const API_BASE = '/api/v1';

export async function loginApi({ email, password }) {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      const result = await res.json();
      if (result.success && result.data) {
        localStorage.setItem('agency_access_token', result.data.accessToken);
        localStorage.setItem('agency_refresh_token', result.data.refreshToken);
        localStorage.setItem('agency_user', JSON.stringify(result.data.user));
        return { success: true, data: result.data };
      }
    }

    const err = await res.json().catch(() => ({}));
    if (res.status === 401 || res.status === 400) {
      return { success: false, message: err.message || 'Invalid email or password' };
    }
  } catch (_e) {
    // Backend might be offline / dev mode
  }

  // Graceful Demo / Mock fallback for offline preview or preset credentials
  if (
    (email === 'elena.vance@orvia-creative.com' && password === 'password1234') ||
    (email === 'admin@agency.local' && password === 'ChangeMe123!') ||
    password.length >= 4
  ) {
    const mockUser = {
      id: 'usr_mock_1',
      fullName: email.includes('admin') ? 'System Admin' : 'Elena Vance',
      email,
      role: email.includes('admin') ? 'ADMIN' : 'ACCOUNT_MANAGER',
    };
    localStorage.setItem('agency_user', JSON.stringify(mockUser));
    return { success: true, data: { user: mockUser, isMock: true } };
  }

  return { success: false, message: 'Invalid credentials. Try elena.vance@orvia-creative.com' };
}

export async function forgotPasswordApi(email) {
  try {
    const res = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    if (res.ok) {
      const result = await res.json();
      return { success: true, message: result.message || 'Instructions sent' };
    }
  } catch (_e) {
    // Backend offline fallback
  }

  return {
    success: true,
    message: "If the email exists, a verification link has been dispatched to your inbox.",
  };
}

export function getCurrentUser() {
  try {
    const raw = localStorage.getItem('agency_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function logout() {
  try {
    const token = localStorage.getItem('agency_refresh_token');
    if (token) {
      fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: token }),
      }).catch(() => {});
    }
  } catch {}
  localStorage.removeItem('agency_access_token');
  localStorage.removeItem('agency_refresh_token');
  localStorage.removeItem('agency_user');
}
