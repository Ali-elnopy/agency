import { apiRequest } from './http';
import { getAccessToken } from './tokenStorage';

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
  // The single-file demo build has no API; the page keeps its static KPIs.
  if (isDevSession()) return null;

  const body = await apiRequest('/dashboard');

  return body?.data ?? body;
}
