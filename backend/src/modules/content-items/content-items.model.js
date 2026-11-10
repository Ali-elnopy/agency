import { prisma } from '../../config/prisma.js';

const contentItemSelect = {
  id: true,
  contentPlanId: true,
  campaignId: true,
  createdBy: true,
  scheduledDate: true,
  type: true,
  title: true,
  reference: true,
  toneOfVoice: true,
  caption: true,
  notes: true,
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

  campaign: {
    select: {
      id: true,
      name: true,
      objective: true,
      startDate: true,
      endDate: true,
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

export const ContentItemsModel = {
  create(data) {
    return prisma.contentItem.create({
      data,
      select: contentItemSelect,
    });
  },

  list({ contentPlanId, campaignId, type } = {}) {
    const where = {};

    if (contentPlanId !== undefined) {
      where.contentPlanId = contentPlanId;
    }

    if (campaignId !== undefined) {
      where.campaignId = campaignId;
    }

    if (type !== undefined) {
      where.type = type;
    }

    return prisma.contentItem.findMany({
      where,
      select: contentItemSelect,
      orderBy: [
        { scheduledDate: 'asc' },
        { createdAt: 'asc' },
      ],
    });
  },

  findById(id) {
    return prisma.contentItem.findUnique({
      where: { id },
      select: contentItemSelect,
    });
  },

  findContentPlanById(id) {
    return prisma.contentPlan.findUnique({
      where: { id },
      select: {
        id: true,
      },
    });
  },

  findCampaignById(id) {
    return prisma.campaign.findUnique({
      where: { id },
      select: {
        id: true,
        contentPlanId: true,
        startDate: true,
        endDate: true,
      },
    });
  },

  update(id, data) {
    return prisma.contentItem.update({
      where: { id },
      data,
      select: contentItemSelect,
    });
  },

  remove(id) {
    return prisma.contentItem.delete({
      where: { id },
      select: contentItemSelect,
    });
  },
};