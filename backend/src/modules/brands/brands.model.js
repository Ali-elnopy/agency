
import { prisma } from '../../config/prisma.js';

const brandSelect = {
  id: true,
  name: true,
  industry: true,
  websiteUrl: true,
  description: true,
  status: true,
  clientId: true,
  accountManagerId: true,
  teamId: true,
  createdBy: true,
  createdAt: true,
  updatedAt: true,
  client: {
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      isActive: true,
    },
  },
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
  async createWithClient({ brandData, clientData }) {
    return prisma.$transaction(async (tx) => {
      const clientRole = await tx.role.findUnique({
        where: { name: 'CLIENT' },
        select: { id: true },
      });

      if (!clientRole) {
        const error = new Error('CLIENT role is not configured');
        error.code = 'CLIENT_ROLE_MISSING';
        throw error;
      }

      const client = await tx.user.create({
        data: {
          ...clientData,
          roleId: clientRole.id,
        },
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          isActive: true,
        },
      });

      return tx.brand.create({
        data: {
          ...brandData,
          clientId: client.id,
        },
        select: brandSelect,
      });
    });
  },

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
          select: { name: true },
        },
      },
    });
  },
};
