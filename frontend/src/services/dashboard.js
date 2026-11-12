import { apiRequest } from './http';
import { getAccessToken } from './tokenStorage';
import { isMockApiEnabled } from './api';

/**
 * Dashboard statistics.
 *
 *   GET /dashboard -> {
 *     totalClients, totalEmployees, activeEmployees, totalTeams, activeTeams,
 *     accountManagerAssignment: { totalAccountManagers, assignedClients, unassignedClients },
 *     teamAssignment: { assignedClients, unassignedClients },
 *     workload, teamWorkload, alerts
 *   }
 */

function isDevSession() {
  return (
    import.meta.env.DEV &&
    import.meta.env.VITE_DEV_BYPASS_LOGIN === 'true' &&
    getAccessToken() === 'dev-bypass-token'
  );
}

export async function getDashboardStats() {
  if (isDevSession() || isMockApiEnabled()) return null;

  try {
    const body = await apiRequest('/dashboard');
    return body?.data ?? body;
  } catch {
    return null;
  }
}
