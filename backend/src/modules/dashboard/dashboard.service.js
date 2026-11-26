import { DashboardModel } from './dashboard.model.js';
import { ApiError } from '../../utils/ApiError.js';
import { getRoleName } from '../../utils/roles.js';

const MS_PER_HOUR = 1000 * 60 * 60;

function round2(value) {
  return Number(value.toFixed(2));
}

function workloadState(clients, max) {
  if (clients === 0) return { state: 'Ready', tone: 'is-gray' };
  if (clients === max && max > 1) return { state: 'At Capacity', tone: 'is-red' };
  if (clients >= Math.ceil(max * 0.66)) return { state: 'Optimal', tone: 'is-green' };

  return { state: 'Has Space', tone: 'is-amber' };
}

function buildAccountManagerTaskScope(userId) {
  return {
    OR: [
      { assignedTo: userId },
      { createdBy: userId },
      {
        contentItem: {
          contentPlan: {
            brand: {
              accountManagerId: userId,
            },
          },
        },
      },
    ],
  };
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
        (a, b) =>
          b.clients - a.clients ||
          b.members - a.members ||
          a.name.localeCompare(b.name),
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

  // --- Feature #4: Progress Tracking ---

  async getProgress(filters, currentUser) {
    const roleName = getRoleName(currentUser);

    if (roleName === 'CLIENT') {
      throw new ApiError(403, 'Clients are not allowed to access progress tracking');
    }

    const andConditions = [];

    if (roleName === 'ACCOUNT_MANAGER') {
      andConditions.push(buildAccountManagerTaskScope(currentUser.id));
    } else if (roleName !== 'ADMIN') {
      if (
        filters.assigneeId !== undefined &&
        filters.assigneeId !== currentUser.id
      ) {
        throw new ApiError(403, 'You can only view your own task progress');
      }

      andConditions.push({ assignedTo: currentUser.id });
    }

    if (filters.brandId !== undefined) {
      andConditions.push({
        contentItem: {
          contentPlan: {
            brandId: filters.brandId,
          },
        },
      });
    }

    if (filters.campaignId !== undefined) {
      andConditions.push({
        contentItem: {
          campaignId: filters.campaignId,
        },
      });
    }

    if (filters.assigneeId !== undefined) {
      andConditions.push({ assignedTo: filters.assigneeId });
    }

    if (filters.status !== undefined) {
      andConditions.push({ status: filters.status });
    }

    if (filters.from || filters.to) {
      const createdAtFilter = {};
      if (filters.from) {
        createdAtFilter.gte = filters.from;
      }
      if (filters.to) {
        createdAtFilter.lte = filters.to;
      }
      andConditions.push({ createdAt: createdAtFilter });
    }

    const where = andConditions.length > 0 ? { AND: andConditions } : {};
    const now = new Date();

    const [statusGroups, overdueTasks, completedTimings] = await Promise.all([
      DashboardModel.groupTasksByStatus(where),
      DashboardModel.countOverdueTasks(where, now),
      DashboardModel.findCompletedTaskTimings(where),
    ]);

    const statusCounts = {
      TODO: 0,
      IN_PROGRESS: 0,
      SUBMITTED: 0,
      IN_REVIEW: 0,
      NEEDS_CHANGES: 0,
      COMPLETED: 0,
      CANCELLED: 0,
    };

    let totalTasks = 0;

    for (const group of statusGroups) {
      const count = group._count?._all ?? 0;
      totalTasks += count;
      if (Object.hasOwn(statusCounts, group.status)) {
        statusCounts[group.status] = count;
      }
    }

    const completionRate =
      totalTasks > 0
        ? round2((statusCounts.COMPLETED / totalTasks) * 100)
        : 0;

    let averageCompletionTime = null;
    if (completedTimings.length > 0) {
      let totalDurationHours = 0;
      let validCount = 0;

      for (const task of completedTimings) {
        const start = task.startedAt ?? task.createdAt;
        if (!start || !task.completedAt) {
          continue;
        }
        const diffMs = Math.max(
          0,
          new Date(task.completedAt).getTime() - new Date(start).getTime(),
        );
        totalDurationHours += diffMs / MS_PER_HOUR;
        validCount += 1;
      }

      if (validCount > 0) {
        averageCompletionTime = round2(totalDurationHours / validCount);
      }
    }

    return {
      totalTasks,
      todoTasks: statusCounts.TODO,
      inProgressTasks: statusCounts.IN_PROGRESS,
      submittedTasks: statusCounts.SUBMITTED,
      inReviewTasks: statusCounts.IN_REVIEW,
      needsChangesTasks: statusCounts.NEEDS_CHANGES,
      completedTasks: statusCounts.COMPLETED,
      cancelledTasks: statusCounts.CANCELLED,
      overdueTasks,
      completionRate,
      averageCompletionTime,
      filters: {
        brandId: filters.brandId ?? null,
        campaignId: filters.campaignId ?? null,
        assigneeId: filters.assigneeId ?? null,
        status: filters.status ?? null,
        from: filters.from ? filters.from.toISOString() : null,
        to: filters.to ? filters.to.toISOString() : null,
      },
    };
  },

  // --- Feature #5: Team Performance ---

  async getTeamPerformance(filters, currentUser) {
    const roleName = getRoleName(currentUser);

    if (roleName === 'CLIENT') {
      throw new ApiError(403, 'Clients are not allowed to access team performance');
    }

    const andConditions = [];

    if (roleName === 'ACCOUNT_MANAGER') {
      andConditions.push(buildAccountManagerTaskScope(currentUser.id));
    } else if (roleName !== 'ADMIN') {
      if (
        (filters.userId !== undefined && filters.userId !== currentUser.id) ||
        filters.teamId !== undefined
      ) {
        throw new ApiError(403, 'You can only view your own performance metrics');
      }

      andConditions.push({ assignedTo: currentUser.id });
    }

    if (filters.brandId !== undefined) {
      andConditions.push({
        contentItem: {
          contentPlan: {
            brandId: filters.brandId,
          },
        },
      });
    }

    if (filters.userId !== undefined) {
      andConditions.push({ assignedTo: filters.userId });
    }

    if (filters.teamId !== undefined) {
      andConditions.push({
        assignee: {
          memberships: {
            some: {
              teamId: filters.teamId,
            },
          },
        },
      });
    }

    if (filters.from || filters.to) {
      const createdAtFilter = {};
      if (filters.from) {
        createdAtFilter.gte = filters.from;
      }
      if (filters.to) {
        createdAtFilter.lte = filters.to;
      }
      andConditions.push({ createdAt: createdAtFilter });
    }

    const where = andConditions.length > 0 ? { AND: andConditions } : {};
    const now = new Date();

    const [assigneeStatusGroups, overdueGroups, completedTasks] =
      await Promise.all([
        DashboardModel.groupTasksByAssigneeAndStatus(where),
        DashboardModel.groupOverdueTasksByAssignee(where, now),
        DashboardModel.findCompletedTaskPerformanceTimings(where),
      ]);

    const metricsByUser = new Map();

    const ensureEntry = (userId) => {
      if (!metricsByUser.has(userId)) {
        metricsByUser.set(userId, {
          userId,
          totalAssignedTasks: 0,
          completedTasks: 0,
          inProgressTasks: 0,
          overdueTasks: 0,
          completedOnTime: 0,
          completedLate: 0,
          totalCompletionHours: 0,
          completionSamples: 0,
          totalDelayHours: 0,
        });
      }
      return metricsByUser.get(userId);
    };

    for (const row of assigneeStatusGroups) {
      const entry = ensureEntry(row.assignedTo);
      const count = row._count?._all ?? 0;
      entry.totalAssignedTasks += count;
      if (row.status === 'COMPLETED') {
        entry.completedTasks += count;
      } else if (row.status === 'IN_PROGRESS') {
        entry.inProgressTasks += count;
      }
    }

    for (const row of overdueGroups) {
      const entry = ensureEntry(row.assignedTo);
      entry.overdueTasks = row._count?._all ?? 0;
    }

    for (const task of completedTasks) {
      const entry = ensureEntry(task.assignedTo);
      const completedAtMs = new Date(task.completedAt).getTime();
      const deadline = task.effectiveDeadline ?? task.plannedDeadline;
      const start = task.startedAt ?? task.createdAt;

      if (start) {
        const durationMs = Math.max(0, completedAtMs - new Date(start).getTime());
        entry.totalCompletionHours += durationMs / MS_PER_HOUR;
        entry.completionSamples += 1;
      }

      if (deadline) {
        const deadlineMs = new Date(deadline).getTime();
        if (completedAtMs <= deadlineMs) {
          entry.completedOnTime += 1;
        } else {
          entry.completedLate += 1;
          entry.totalDelayHours += (completedAtMs - deadlineMs) / MS_PER_HOUR;
        }
      } else {
        entry.completedOnTime += 1;
      }
    }

    const userIds = [...metricsByUser.keys()];
    const users = await DashboardModel.findUsersByIds(userIds);
    const userMap = new Map(users.map((user) => [user.id, user]));

    const members = userIds
      .map((userId) => {
        const entry = metricsByUser.get(userId);
        const user = userMap.get(userId);
        const completionRate =
          entry.totalAssignedTasks > 0
            ? round2((entry.completedTasks / entry.totalAssignedTasks) * 100)
            : 0;
        const onTimeRate =
          entry.completedTasks > 0
            ? round2((entry.completedOnTime / entry.completedTasks) * 100)
            : 0;
        const averageCompletionTime =
          entry.completionSamples > 0
            ? round2(entry.totalCompletionHours / entry.completionSamples)
            : null;
        const averageDelay =
          entry.completedTasks === 0
            ? null
            : entry.completedLate > 0
              ? round2(entry.totalDelayHours / entry.completedLate)
              : 0;

        return {
          user: user
            ? {
                id: user.id,
                fullName: user.fullName,
                email: user.email,
                role: user.role?.name ?? null,
                jobTitle: user.jobTitle?.name ?? null,
              }
            : {
                id: userId,
                fullName: null,
                email: null,
                role: null,
                jobTitle: null,
              },
          totalAssignedTasks: entry.totalAssignedTasks,
          completedTasks: entry.completedTasks,
          inProgressTasks: entry.inProgressTasks,
          overdueTasks: entry.overdueTasks,
          completedOnTime: entry.completedOnTime,
          completedLate: entry.completedLate,
          completionRate,
          onTimeRate,
          averageCompletionTime,
          averageDelay,
        };
      })
      .sort(
        (a, b) =>
          b.completedTasks - a.completedTasks ||
          b.onTimeRate - a.onTimeRate ||
          (a.user.fullName ?? '').localeCompare(b.user.fullName ?? ''),
      );

    return {
      members,
      totalMembers: members.length,
      filters: {
        from: filters.from ? filters.from.toISOString() : null,
        to: filters.to ? filters.to.toISOString() : null,
        teamId: filters.teamId ?? null,
        userId: filters.userId ?? null,
        brandId: filters.brandId ?? null,
      },
    };
  },
};
