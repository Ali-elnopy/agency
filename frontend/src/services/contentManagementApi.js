import { apiRequest } from './http';
import { isMockApiEnabled } from './api';

/**
 * Standardized Content Management API Client
 * Endpoints aligned with backend routes:
 * - /api/content-plans
 * - /api/content-items
 * - /api/notifications
 */

export const CONTENT_TYPES = ['POST', 'REEL', 'STORY'];

export async function fetchContentPlansApi({ brandId, platformAccountId, year, month, status } = {}) {
  const params = new URLSearchParams();
  if (brandId) params.append('brandId', brandId);
  if (platformAccountId) params.append('platformAccountId', platformAccountId);
  if (year) params.append('year', year);
  if (month) params.append('month', month);
  if (status) params.append('status', status);

  const query = params.toString();
  const endpoint = `/content-plans${query ? `?${query}` : ''}`;
  return apiRequest(endpoint, { method: 'GET' });
}

export async function fetchContentPlanByIdApi(planId) {
  return apiRequest(`/content-plans/${planId}`, { method: 'GET' });
}

export async function createContentPlanApi(payload) {
  return apiRequest('/content-plans', {
    method: 'POST',
    body: payload,
  });
}

export async function updateContentPlanApi(planId, payload) {
  return apiRequest(`/content-plans/${planId}`, {
    method: 'PATCH',
    body: payload,
  });
}

export async function deleteContentPlanApi(planId) {
  return apiRequest(`/content-plans/${planId}`, {
    method: 'DELETE',
  });
}

export async function fetchContentItemsApi({ contentPlanId, campaignId, type } = {}) {
  const params = new URLSearchParams();
  if (contentPlanId) params.append('contentPlanId', contentPlanId);
  if (campaignId) params.append('campaignId', campaignId);
  if (type) params.append('type', type);

  const query = params.toString();
  const endpoint = `/content-items${query ? `?${query}` : ''}`;
  return apiRequest(endpoint, { method: 'GET' });
}

export async function createContentItemApi(payload) {
  return apiRequest('/content-items', {
    method: 'POST',
    body: payload,
  });
}

export async function updateContentItemApi(itemId, payload) {
  return apiRequest(`/content-items/${itemId}`, {
    method: 'PATCH',
    body: payload,
  });
}

export async function deleteContentItemApi(itemId) {
  return apiRequest(`/content-items/${itemId}`, {
    method: 'DELETE',
  });
}

/* ---------------- Notifications API ---------------- */

export async function fetchUnreadNotificationCountApi() {
  if (isMockApiEnabled()) {
    return { success: false, data: null };
  }
  try {
    return await apiRequest('/notifications/unread-count', { method: 'GET' });
  } catch {
    // Offline: let the provider fall back to its local unread count instead of
    // displaying a made-up number.
    return { success: false, data: null };
  }
}

export async function fetchNotificationsApi() {
  if (isMockApiEnabled()) {
    return { success: false, data: [] };
  }
  try {
    return await apiRequest('/notifications', { method: 'GET' });
  } catch {
    return { success: false, data: [] };
  }
}

export async function markNotificationAsReadApi(notificationId) {
  if (isMockApiEnabled()) {
    return { success: false };
  }
  try {
    return await apiRequest(`/notifications/${notificationId}/read`, { method: 'PATCH' });
  } catch {
    return { success: false };
  }
}

export async function markAllNotificationsAsReadApi() {
  if (isMockApiEnabled()) {
    return { success: false };
  }
  try {
    return await apiRequest('/notifications/read-all', { method: 'PATCH' });
  } catch {
    return { success: false };
  }
}
