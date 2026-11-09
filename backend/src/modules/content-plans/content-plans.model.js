
import { prisma } from '../../config/prisma.js';

const contentPlanSelect = {
  id: true,
  brandId: true,
  platformAccountId: true,
  title: true,
  year: true,
  month: true,
  monthlyGoals: true,
  notes: true,
  status: true,
  createdBy: true,
  assignedToId: true,
  createdAt: true,
  updatedAt: true,
  brand: {
    select: {
      id: true,
      name: true,
    },
  },
  platformAccount: {
    select: {
      id: true,
      platform: true,
      accountName: true,
      accountUrl: true,
      isActive: true,
    },
  },
  creator: {
    select: {
      id: true,
      fullName: true,
      email: true,
    },
  },
  assignedTo: {
    select: { id: true, fullName: true, email: true, jobTitle: { select: { name: true } } },
  },
};

export const ContentPlansModel = {
  create(data) {
    return prisma.contentPlan.create({
      data,
      select: contentPlanSelect,
    });
  },

  list({ brandId, platformAccountId, year, month, status, accessWhere = {} } = {}) {
    const where = { ...accessWhere };

    if (brandId !== undefined) where.brandId = brandId;
    if (platformAccountId !== undefined) {
      where.platformAccountId = platformAccountId;
    }
    if (year !== undefined) where.year = year;
    if (month !== undefined) where.month = month;
    if (status) where.status = status;

    return prisma.contentPlan.findMany({
      where,
      select: contentPlanSelect,
      orderBy: [
        { year: 'desc' },
        { month: 'desc' },
        { createdAt: 'desc' },
      ],
    });
  },

  findById(id, accessWhere = {}) {
    return prisma.contentPlan.findFirst({
      where: { id, ...accessWhere },
      select: contentPlanSelect,
    });
  },

  update(id, data) {
    return prisma.contentPlan.update({
      where: { id },
      data,
      select: contentPlanSelect,
    });
  },

  remove(id) {
    return prisma.contentPlan.delete({
      where: { id },
      select: contentPlanSelect,
    });
  },

  findBrandById(id, accessWhere = {}) {
    return prisma.brand.findFirst({
      where: { id, ...accessWhere },
      select: { id: true },
    });
  },

  findContentCreatorById(id, teamId) {
    return prisma.user.findFirst({
      where: {
        id,
        isActive: true,
        role: { is: { name: 'EMPLOYEE' } },
        jobTitle: { is: { name: 'Content Creator', isActive: true } },
        ...(teamId == null ? {} : { memberships: { some: { teamId } } }),
      },
      select: { id: true, fullName: true, email: true },
    });
  },

  findBrandAssignmentInfo(id) {
    return prisma.brand.findUnique({
      where: { id },
      select: { id: true, teamId: true },
    });
  },

  findPlatformAccountById(id) {
    return prisma.platformAccount.findUnique({
      where: { id },
      select: {
        id: true,
        brandId: true,
        isActive: true,
      },
    });
  },
};
