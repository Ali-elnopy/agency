import { prisma } from '../../config/prisma.js';

const brandSelect = {
  id: true,
  name: true,
  industry: true,
  websiteUrl: true,
  description: true,
  status: true,
  accountManagerId: true,
  teamId: true,
  createdBy: true,
  createdAt: true,
  updatedAt: true,
  team: {
    select: {
      id: true,
      name: true,
    },
  },
  accountManager: {
    select: {
      id: true,
      fullName: true,
      email: true,
    },
  },
};

export const BrandsModel = {
  create(data) {
    return prisma.brand.create({
      data,
      select: brandSelect,
    });
  },

  list({ query, status, teamId, accountManagerId } = {}) {
    const where = {};

    if (status) where.status = status;
    if (teamId != null) where.teamId = teamId;
    if (accountManagerId != null) where.accountManagerId = accountManagerId;

    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { industry: { contains: query, mode: 'insensitive' } },
      ];
    }

    return prisma.brand.findMany({
      where,
      select: brandSelect,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });
  },

  findById(id) {
    return prisma.brand.findUnique({
      where: { id },
      select: brandSelect,
    });
  },

  update(id, data) {
    return prisma.brand.update({
      where: { id },
      data,
      select: brandSelect,
    });
  },

  remove(id) {
    return prisma.brand.delete({
      where: { id },
      select: brandSelect,
    });
  },

  findTeamById(id) {
    return prisma.team.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        isActive: true,
      },
    });
  },

  findAccountManagerById(id) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        fullName: true,
        isActive: true,
        role: {
          select: {
            name: true,
          },
        },
      },
    });
  },
};
