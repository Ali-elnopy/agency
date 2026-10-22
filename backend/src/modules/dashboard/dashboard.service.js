import { DashboardModel } from './dashboard.model.js';

export const DashboardService = {
  async getDashboardStats() {
    const [
      totalClients,
      totalEmployees,
      activeEmployees,
      totalTeams,
      activeTeams,
      assignedClients,
      unassignedClients,
      totalAccountManagers,
    ] = await DashboardModel.getStats();

    return {
      totalClients,
      totalEmployees,
      activeEmployees,
      totalTeams,
      activeTeams,
      accountManagerAssignment: {
        totalAccountManagers,
        assignedClients,
        unassignedClients,
      },
    };
  },
};