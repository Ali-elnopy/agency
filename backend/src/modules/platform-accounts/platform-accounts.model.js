
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

  list({ brandId, platform, isActive, accessWhere } = {}) {
  const where = {};

  if (brandId !== undefined) where.brandId = brandId;
  if (platform) where.platform = platform;
  if (isActive !== undefined) where.isActive = isActive;

  if (accessWhere && Object.keys(accessWhere).length > 0) {
    where.brand = accessWhere;
  }

  return prisma.platformAccount.findMany({
    where,
    select: platformAccountSelect,
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
  });
},

  findById(id) {
    return prisma.platformAccount.findUnique({
      where: { id },
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

  findBrandById(id) {
    return prisma.brand.findUnique({
      where: { id },
      select: { id: true },
    });
  },

  findAccessibleById(id, accessWhere) {
  return prisma.platformAccount.findFirst({
    where: {
      id,
      brand: accessWhere,
    },
    select: platformAccountSelect,
  });
},

findAccessibleBrandById(id, accessWhere) {
  return prisma.brand.findFirst({
    where: {
      id,
      ...accessWhere,
    },
    select: {
      id: true,
    },
  });
},
};
