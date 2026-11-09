
import { prisma } from '../../config/prisma.js';

const publicUserSelect = {
  id: true,
  fullName: true,
  email: true,
  isActive: true,
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
};

const teamSelect = {
  id: true,
  name: true,
  description: true,
  isActive: true,
  createdBy: true,
  teamLeadId: true,
  createdAt: true,
  updatedAt: true,

  creator: {
    select: {
      id: true,
      fullName: true,
    },
  },

  teamLead: {
    select: {
      id: true,
      fullName: true,
      email: true,
    },
  },

  memberships: {
    orderBy: { joinedAt: 'asc' },
    select: {
      joinedAt: true,
      user: {
        select: publicUserSelect,
      },
    },
  },

  _count: {
    select: { memberships: true },
  },
};

export const TeamsModel = {
  list({ status, query }) {
    const where = {};

    if (status === 'active') where.isActive = true;
    if (status === 'inactive') where.isActive = false;

    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ];
    }

    return prisma.team.findMany({
      where,
      select: teamSelect,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });
  },

  findById(id) {
    return prisma.team.findUnique({
      where: { id },
      select: teamSelect,
    });
  },

  countBrands(teamId) {
    return prisma.brand.count({ where: { teamId } });
  },

  remove(id) {
    return prisma.team.delete({
      where: { id },
      select: teamSelect,
    });
  },

  findEligibleUsersByIds(ids) {
    return prisma.user.findMany({
      where: {
        id: { in: ids },
        isActive: true,
        role: {
          is: {
            name: { in: ['EMPLOYEE', 'ACCOUNT_MANAGER', 'TEAM_LEADER'] },
          },
        },
      },
      select: publicUserSelect,
    });
  },

  findEligibleUserById(id) {
    return prisma.user.findFirst({
      where: {
        id,
        isActive: true,
        role: {
          is: {
            name: { in: ['EMPLOYEE', 'ACCOUNT_MANAGER', 'TEAM_LEADER'] },
          },
        },
      },
      select: publicUserSelect,
    });
  },

  /* A person can only belong to one team, so membership checks look at every
     team except the one currently being edited. */
  findMembershipsForUsers(userIds, excludeTeamId = null) {
    if (!userIds.length) return Promise.resolve([]);

    return prisma.teamMembership.findMany({
      where: {
        userId: { in: userIds },
        ...(excludeTeamId == null ? {} : { teamId: { not: excludeTeamId } }),
      },
      select: {
        userId: true,
        teamId: true,
        team: { select: { name: true } },
        user: { select: { fullName: true } },
      },
    });
  },

  async create(data, memberIds) {
    return prisma.$transaction(async (tx) => {
      const team = await tx.team.create({
        data,
        select: { id: true },
      });

      if (memberIds.length > 0) {
        await tx.teamMembership.createMany({
          data: memberIds.map((userId) => ({
            teamId: team.id,
            userId,
          })),
          skipDuplicates: true,
        });
      }

      return tx.team.findUnique({
        where: { id: team.id },
        select: teamSelect,
      });
    });
  },

  async update(id, data, teamLeadId) {
    return prisma.$transaction(async (tx) => {
      const updateData = { ...data };

      if (teamLeadId !== undefined) {
        updateData.teamLeadId = teamLeadId;
      }

      await tx.team.update({
        where: { id },
        data: updateData,
      });

      // If a leader is assigned, ensure they are a member of this team.
      if (teamLeadId !== undefined && teamLeadId !== null) {
        await tx.teamMembership.upsert({
          where: {
            teamId_userId: {
              teamId: id,
              userId: teamLeadId,
            },
          },
          create: {
            teamId: id,
            userId: teamLeadId,
          },
          update: {},
        });
      }

      // Setting teamLeadId to null removes the leadership role only.
      // It does not remove the user from team membership.

      return tx.team.findUnique({
        where: { id },
        select: teamSelect,
      });
    });
  },

  async addMember(teamId, userId) {
    await prisma.teamMembership.upsert({
      where: {
        teamId_userId: { teamId, userId },
      },
      create: { teamId, userId },
      update: {},
    });

    return this.findById(teamId);
  },

  async removeMember(teamId, userId) {
    await prisma.$transaction(async (tx) => {
      await tx.team.updateMany({
        where: { id: teamId, teamLeadId: userId },
        data: { teamLeadId: null },
      });
      await tx.teamMembership.deleteMany({
        where: { teamId, userId },
      });
    });

    return this.findById(teamId);
  },

  async moveMember(sourceTeamId, targetTeamId, userId) {
    return prisma.$transaction(async (tx) => {
      await tx.teamMembership.delete({
        where: {
          teamId_userId: {
            teamId: sourceTeamId,
            userId,
          },
        },
      });

      await tx.teamMembership.upsert({
        where: {
          teamId_userId: {
            teamId: targetTeamId,
            userId,
          },
        },
        create: {
          teamId: targetTeamId,
          userId,
        },
        update: {},
      });

      return tx.team.findUnique({
        where: { id: sourceTeamId },
        select: teamSelect,
      });
    });
  },
};
