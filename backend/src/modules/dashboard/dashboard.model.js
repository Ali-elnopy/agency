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
};