import { prisma } from '../../config/prisma.js';

const publicUserSelect = {
  id: true,
  fullName: true,
  email: true,
  phone: true,
  isActive: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
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

export const UsersModel = {
  list({ status, query, roleName }) {
    const where = {};

    if (status === 'active') where.isActive = true;
    if (status === 'deactivated' || status === 'inactive') where.isActive = false;
    if (roleName) where.role = { is: { name: roleName } };

    if (query) {
      where.OR = [
        { fullName: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
      ];
    }

    return prisma.user.findMany({
      where,
      select: publicUserSelect,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });
  },

  findById(id) {
    return prisma.user.findUnique({
      where: { id },
      select: publicUserSelect,
    });
  },

  findRoleByName(name) {
    return prisma.role.findUnique({ where: { name } });
  },

  findJobTitleById(id) {
    return prisma.jobTitle.findUnique({ where: { id } });
  },
  findJobTitleByName(name) {
    return prisma.jobTitle.findUnique({
      where: { name },
    });
  },
  create(data) {
    return prisma.user.create({
      data,
      select: publicUserSelect,
    });
  },

  update(id, data) {
    return prisma.user.update({
      where: { id },
      data,
      select: publicUserSelect,
    });
  },

  async deactivate(id) {
    const now = new Date();

    return prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id },
        data: { isActive: false },
        select: publicUserSelect,
      });

      await tx.authSession.updateMany({
        where: { userId: id, revokedAt: null },
        data: { revokedAt: now },
      });

      return user;
    });
  },

  reactivate(id) {
    return prisma.user.update({
      where: { id },
      data: { isActive: true },
      select: publicUserSelect,
    });
  },

  delete(id) {
    return prisma.user.delete({ where: { id }, select: { id: true } });
  },

  async getStats() {
    const [total, active, suspended] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.count({ where: { isActive: false } }),
    ]);

    return { total, active, suspended };
  },
};
