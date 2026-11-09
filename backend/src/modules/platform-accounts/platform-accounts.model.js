
import { prisma } from '../../config/prisma.js';

const platformAccountSelect = {
  id: true,
  brandId: true,
  platform: true,
  accountName: true,
  accountUrl: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  brand: {
    select: {
      id: true,
      name: true,
    },
  },
};

export const PlatformAccountsModel = {
  create(data) {
    return prisma.platformAccount.create({
      data,
      select: platformAccountSelect,
    });
  },

  list({ brandId, platform, isActive, accessWhere = {} } = {}) {
    const where = { ...accessWhere };

    if (brandId !== undefined) where.brandId = brandId;
    if (platform) where.platform = platform;
    if (isActive !== undefined) where.isActive = isActive;

    return prisma.platformAccount.findMany({
      where,
      select: platformAccountSelect,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });
  },

  findById(id, accessWhere = {}) {
    return prisma.platformAccount.findFirst({
      where: { id, ...accessWhere },
      select: platformAccountSelect,
    });
  },

  update(id, data) {
    return prisma.platformAccount.update({
      where: { id },
      data,
      select: platformAccountSelect,
    });
  },

  remove(id) {
    return prisma.platformAccount.delete({
      where: { id },
      select: platformAccountSelect,
    });
  },

  findBrandById(id, accessWhere = {}) {
    return prisma.brand.findFirst({
      where: { id, ...accessWhere },
      select: { id: true },
    });
  },
};
