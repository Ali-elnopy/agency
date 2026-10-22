
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
