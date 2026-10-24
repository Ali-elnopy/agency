import { DashboardModel } from './dashboard.model.js';

function workloadState(clients, max) {
  if (clients === 0) return { state: 'Ready', tone: 'is-gray' };
  if (clients === max && max > 1) return { state: 'At Capacity', tone: 'is-red' };
  if (clients >= Math.ceil(max * 0.66)) return { state: 'Optimal', tone: 'is-green' };

  return { state: 'Has Space', tone: 'is-amber' };
}

export const DashboardService = {
  async getDashboardStats() {
    const [
      [
        totalClients,
        totalEmployees,
        activeEmployees,
        totalTeams,
        activeTeams,
        assignedClients,
        unassignedClients,
        totalAccountManagers,
      ],
      managers,
      brands,
    ] = await Promise.all([DashboardModel.getStats(), DashboardModel.listAccountManagers(), DashboardModel.listBrandAssignments()]);

    const counts = managers.map(
      (manager) => brands.filter((brand) => brand.accountManagerId === manager.id).length,
    );

    const max = Math.max(1, ...counts);

    const workload = managers.map((manager, index) => {
      const clients = counts[index];
      const { state, tone } = workloadState(clients, max);

      return {
        id: manager.id,
        name: manager.fullName,
        role: clients === max && max > 1 ? 'Lead' : clients === 0 ? 'Available' : 'AM',
        team: manager.memberships?.[0]?.team?.name ?? 'Unassigned',
        clients,
        pct: Math.round((clients / max) * 100),
        state,
        tone,
      };
    });

    const withoutManager = brands
      .filter((brand) => brand.accountManagerId == null)
      .slice(0, 5)
      .map((brand) => ({
        id: brand.id,
        name: brand.name,
        sub: brand.industry || 'No account manager',
        action: 'Assign Manager',
      }));

    const withoutTeam = brands
      .filter((brand) => brand.teamId == null)
      .slice(0, 5)
      .map((brand) => ({
        id: brand.id,
        name: brand.name,
        sub: `${brand.industry || 'Brand'} · No Squad`,
        action: 'Assign Team',
      }));

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
      workload,
      alerts: [
        {
          group: 'Brands without an account manager',
          count: unassignedClients,
          tone: 'High Priority',
          rows: withoutManager,
        },
        {
          group: 'Brands without a team',
          count: brands.filter((brand) => brand.teamId == null).length,
          tone: 'Needs Squad',
          rows: withoutTeam,
        },
      ],
    };
  },
};
