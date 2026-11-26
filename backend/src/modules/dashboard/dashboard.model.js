import { prisma } from '../../config/prisma.js';

export const DashboardModel = {
  getStats() {
    return Promise.all([
      // Count all clients (brands).
      prisma.brand.count(),

      // Count all employees.
      prisma.user.count({
        where: {
          role: {
            is: { name: 'EMPLOYEE' },
          },
        },
      }),

      // Count active employees.
      prisma.user.count({
        where: {
          isActive: true,
          role: {
            is: { name: 'EMPLOYEE' },
          },
        },
      }),

      // Count all teams.
      prisma.team.count(),

      // Count active teams.
      prisma.team.count({
        where: { isActive: true },
      }),

      // Count clients assigned to an account manager.
      prisma.brand.count({
        where: {
          accountManagerId: { not: null },
        },
      }),

      // Count clients without an account manager.
      prisma.brand.count({
        where: {
          accountManagerId: null,
        },
      }),

      // Count all account managers.
      prisma.user.count({
        where: {
          role: {
            is: { name: 'ACCOUNT_MANAGER' },
          },
        },
      }),
    ]);
  },

  listAccountManagers() {
    return prisma.user.findMany({
      where: {
        isActive: true,
        role: { is: { name: 'ACCOUNT_MANAGER' } },
      },
      select: {
        id: true,
        fullName: true,
        memberships: {
          select: { team: { select: { name: true } } },
          take: 1,
        },
      },
      orderBy: { fullName: 'asc' },
    });
  },

  listBrandAssignments() {
    return prisma.brand.findMany({
      select: {
        id: true,
        name: true,
        industry: true,
        accountManagerId: true,
        teamId: true,
        team: { select: { name: true } },
      },
      orderBy: { name: 'asc' },
    });
  },

  // Teams drive the "Brands per Teams" card, so the dashboard needs every
  // active team even when no brand is assigned to it yet.
  listTeams() {
    return prisma.team.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        _count: { select: { memberships: true } },
      },
      orderBy: { name: 'asc' },
    });
  },

  // --- Feature #4: Progress Tracking Aggregations ---

  groupTasksByStatus(where) {
    return prisma.task.groupBy({
      by: ['status'],
      where,
      _count: { _all: true },
    });
  },

  countOverdueTasks(where, now = new Date()) {
    return prisma.task.count({
      where: {
        AND: [
          where,
          {
            status: { notIn: ['COMPLETED', 'CANCELLED'] },
          },
          {
            OR: [
              { effectiveDeadline: { lt: now } },
              {
                effectiveDeadline: null,
                plannedDeadline: { lt: now },
              },
            ],
          },
        ],
      },
    });
  },

  findCompletedTaskTimings(where) {
    return prisma.task.findMany({
      where: {
        AND: [
          where,
          {
            status: 'COMPLETED',
            completedAt: { not: null },
          },
        ],
      },
      select: {
        startedAt: true,
        createdAt: true,
        completedAt: true,
      },
    });
  },

  // --- Feature #5: Team Performance Aggregations ---

  groupTasksByAssigneeAndStatus(where) {
    return prisma.task.groupBy({
      by: ['assignedTo', 'status'],
      where,
      _count: { _all: true },
    });
  },

  groupOverdueTasksByAssignee(where, now = new Date()) {
    return prisma.task.groupBy({
      by: ['assignedTo'],
      where: {
        AND: [
          where,
          {
            status: { notIn: ['COMPLETED', 'CANCELLED'] },
          },
          {
            OR: [
              { effectiveDeadline: { lt: now } },
              {
                effectiveDeadline: null,
                plannedDeadline: { lt: now },
              },
            ],
          },
        ],
      },
      _count: { _all: true },
    });
  },

  findCompletedTaskPerformanceTimings(where) {
    return prisma.task.findMany({
      where: {
        AND: [
          where,
          {
            status: 'COMPLETED',
            completedAt: { not: null },
          },
        ],
      },
      select: {
        assignedTo: true,
        startedAt: true,
        createdAt: true,
        completedAt: true,
        plannedDeadline: true,
        effectiveDeadline: true,
      },
    });
  },

  findUsersByIds(ids) {
    if (!ids.length) {
      return Promise.resolve([]);
    }

    return prisma.user.findMany({
      where: {
        id: { in: ids },
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: {
          select: {
            id: true,
            name: true,
          },
        },
        jobTitle: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  },
};
