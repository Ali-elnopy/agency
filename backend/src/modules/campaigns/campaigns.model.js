import { prisma } from '../../config/prisma.js';

const campaignSelect = {
  id: true,
  contentPlanId: true,
  name: true,
  objective: true,
  startDate: true,
  endDate: true,
  createdBy: true,
  createdAt: true,
  updatedAt: true,

  contentPlan: {
    select: {
      id: true,
      title: true,
      brandId: true,
      platformAccountId: true,
      year: true,
      month: true,
    },
  },

  creator: {
    select: {
      id: true,
      fullName: true,
      email: true,
    },
  },
};

export const CampaignsModel = {
  create(data) {
    return prisma.campaign.create({
      data,
      select: campaignSelect,
    });
  },

  list({ contentPlanId, accessWhere } = {}) {
    const where = {};

    if (contentPlanId !== undefined) {
      where.contentPlanId = contentPlanId;
    }

    if (accessWhere && Object.keys(accessWhere).length > 0) {
      where.contentPlan = {
        brand: accessWhere,
      };
    }

    return prisma.campaign.findMany({
      where,
      select: campaignSelect,
      orderBy: [
        { startDate: 'asc' },
        { createdAt: 'desc' },
      ],
    });
  },

  findById(id, accessWhere) {
    const where = { id };

    if (accessWhere && Object.keys(accessWhere).length > 0) {
      where.contentPlan = {
        brand: accessWhere,
      };
    }

    return prisma.campaign.findFirst({
      where,
      select: campaignSelect,
    });
  },

  findContentPlanById(id) {
    return prisma.contentPlan.findUnique({
      where: { id },
      select: {
        id: true,
        brandId: true,
        platformAccountId: true,
        brand: {
          select: {
            id: true,
            clientId: true,
            accountManagerId: true,
            teamId: true,
            team: {
              select: {
                memberships: {
                  select: {
                    userId: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  },

  update(id, data) {
    return prisma.campaign.update({
      where: { id },
      data,
      select: campaignSelect,
    });
  },

  remove(id) {
    return prisma.campaign.delete({
      where: { id },
      select: campaignSelect,
    });
  },
};