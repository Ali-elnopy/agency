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
  materialUrl: true,
  toneOfVoice: true,
  caption: true,
  notes: true,
  clientReviewStatus: true,
  clientApprovedAt: true,
  publishStatus: true,
  publishedAt: true,
  publishUrl: true,
  publishedBy: true,
  publishNotes: true,
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

  publisher: {
    select: {
      id: true,
      fullName: true,
      email: true,
    },
  },
};

export const revisionSelect = {
  id: true,
  contentItemId: true,
  revisionNumber: true,
  title: true,
  type: true,
  scheduledDate: true,
  reference: true,
  materialUrl: true,
  toneOfVoice: true,
  caption: true,
  notes: true,
  submissionUrl: true,
  submissionNotes: true,
  source: true,
  changeReason: true,
  taskId: true,
  createdBy: true,
  createdAt: true,

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

  list({ contentPlanId, campaignId, type, clientId } = {}) {
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

    if (clientId !== undefined) {
      where.contentPlan = {
        brand: {
          clientId,
        },
      };
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

  findById(id, clientId) {
    const where = {
      id,
    };

    if (clientId !== undefined) {
      where.contentPlan = {
        brand: {
          clientId,
        },
      };
    }

    return prisma.contentItem.findFirst({
      where,
      select: contentItemSelect,
    });
  },

  findByIdWithAccess(id) {
    return prisma.contentItem.findUnique({
      where: { id },
      select: {
        ...contentItemSelect,
        contentPlan: {
          select: {
            id: true,
            title: true,
            brandId: true,
            platformAccountId: true,
            year: true,
            month: true,
            brand: {
              select: {
                id: true,
                name: true,
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
        },
        tasks: {
          select: {
            id: true,
            assignedTo: true,
            type: true,
            status: true,
          },
        },
      },
    });
  },

  findContentPlanById(id) {
    return prisma.contentPlan.findUnique({
      where: { id },
      select: {
        id: true,
        brandId: true,
        brand: {
          select: {
            id: true,
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

  async createRevisionSnapshot(
    {
      contentItem,
      createdBy,
      source = 'CONTENT_UPDATE',
      changeReason = null,
      submissionUrl = null,
      submissionNotes = null,
      taskId = null,
    },
    db = prisma,
  ) {
    if (!db?.contentItemRevision?.create || !contentItem?.id || !createdBy) {
      return null;
    }

    const latest = db.contentItemRevision.findFirst
      ? await db.contentItemRevision.findFirst({
          where: { contentItemId: contentItem.id },
          orderBy: { revisionNumber: 'desc' },
          select: { revisionNumber: true },
        })
      : null;

    const nextRevisionNumber = (latest?.revisionNumber ?? 0) + 1;

    return db.contentItemRevision.create({
      data: {
        contentItemId: contentItem.id,
        revisionNumber: nextRevisionNumber,
        title: contentItem.title,
        type: contentItem.type,
        scheduledDate: contentItem.scheduledDate,
        reference: contentItem.reference ?? null,
        materialUrl: contentItem.materialUrl ?? null,
        toneOfVoice: contentItem.toneOfVoice ?? null,
        caption: contentItem.caption ?? null,
        notes: contentItem.notes ?? null,
        submissionUrl: submissionUrl ?? null,
        submissionNotes: submissionNotes ?? null,
        source,
        changeReason: changeReason ?? null,
        taskId: taskId ?? null,
        createdBy,
      },
      select: revisionSelect,
    });
  },

  listRevisions(contentItemId, order = 'desc') {
    return prisma.contentItemRevision.findMany({
      where: { contentItemId },
      select: revisionSelect,
      orderBy: [{ revisionNumber: order === 'asc' ? 'asc' : 'desc' }],
    });
  },

  findRevisionById(contentItemId, revisionId) {
    return prisma.contentItemRevision.findFirst({
      where: {
        id: revisionId,
        contentItemId,
      },
      select: revisionSelect,
    });
  },

  updatePublishing(id, data, db = prisma) {
    return db.contentItem.update({
      where: { id },
      data,
      select: {
        id: true,
        title: true,
        scheduledDate: true,
        clientReviewStatus: true,
        clientApprovedAt: true,
        publishStatus: true,
        publishedAt: true,
        publishUrl: true,
        publishNotes: true,
        publishedBy: true,
        publisher: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });
  },

  listCalendar(where = {}) {
    return prisma.contentItem.findMany({
      where,
      select: {
        id: true,
        title: true,
        type: true,
        scheduledDate: true,
        clientReviewStatus: true,
        clientApprovedAt: true,
        publishStatus: true,
        publishedAt: true,
        publishUrl: true,
        contentPlan: {
          select: {
            id: true,
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
              },
            },
          },
        },
        campaign: {
          select: {
            id: true,
            name: true,
          },
        },
        tasks: {
          where: {
            status: {
              not: 'CANCELLED',
            },
          },
          orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
          take: 1,
          select: {
            id: true,
            type: true,
            status: true,
          },
        },
      },
      orderBy: [{ scheduledDate: 'asc' }, { id: 'asc' }],
    });
  },
};
