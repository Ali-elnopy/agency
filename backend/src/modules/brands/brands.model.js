
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
  findRoleByName(name) {
    return prisma.role.findUnique({
      where: { name },
      select: { id: true, name: true },
    });
  },

  createWithClient(brandData, clientData) {
    return prisma.$transaction(async (tx) => {
      const client = await tx.user.create({
        data: clientData,
        select: {
          id: true,
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


  list({ query, status, teamId, accountManagerId, accessWhere } = {}) {
    const conditions = [];

    // Mandatory access restrictions.
    if (accessWhere && Object.keys(accessWhere).length > 0) {
      conditions.push(accessWhere);
    }

    // Additional filters.
    if (status) {
      conditions.push({ status });
    }

    if (teamId != null) {
      conditions.push({ teamId });
    }

    if (accountManagerId != null) {
      conditions.push({ accountManagerId });
    }

    if (query) {
      conditions.push({
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { industry: { contains: query, mode: 'insensitive' } },
        ],
      });
    }

    const where = conditions.length > 0
      ? { AND: conditions }
      : {};

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
  findAccessibleById(id, accessWhere) {
    return prisma.brand.findFirst({
      where: {
        id,
        ...accessWhere,
      },
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
