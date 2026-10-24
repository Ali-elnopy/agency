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
      teams,
    ] = await Promise.all([
      DashboardModel.getStats(),
      DashboardModel.listAccountManagers(),
      DashboardModel.listBrandAssignments(),
      DashboardModel.listTeams(),
    ]);

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

    // Brands per team: every active team gets a row so empty teams are visible.
    const teamRows = teams.map((team) => ({
      id: team.id,
      name: team.name,
      members: team._count?.memberships ?? 0,
      clients: brands.filter((brand) => brand.teamId === team.id).length,
    }));

    const maxTeam = Math.max(1, ...teamRows.map((team) => team.clients));

    const teamWorkload = teamRows
      .sort(
        (a, b) => b.clients - a.clients || a.name.localeCompare(b.name),
      )
      .map((team) => ({
        ...team,
        pct: Math.round((team.clients / maxTeam) * 100),
      }));

    const withoutTeam = brands
      .filter((brand) => brand.teamId == null)
      .slice(0, 5)
      .map((brand) => ({
        id: brand.id,
        name: brand.name,
        sub: `${brand.industry || 'Brand'} · No team`,
        action: 'Assign Team',
      }));

    const unassignedTeamClients = brands.filter((brand) => brand.teamId == null).length;

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
      teamAssignment: {
        assignedClients: totalClients - unassignedTeamClients,
        unassignedClients: unassignedTeamClients,
      },
      workload,
      teamWorkload,
      alerts: [
        {
          group: 'Brands without teams',
          count: unassignedTeamClients,
          tone: 'Needs Team',
          rows: withoutTeam,
        },
      ],
    };
  },
};
