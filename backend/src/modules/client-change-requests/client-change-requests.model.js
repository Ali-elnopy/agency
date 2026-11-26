import { prisma } from '../../config/prisma.js';

export const changeRequestSelect = {
  id: true,
  contentItemId: true,
  brandId: true,
  clientId: true,
  accountManagerId: true,
  status: true,
  clientNotes: true,
  accountManagerNotes: true,
  relatedTaskId: true,
  resolvedAt: true,
  forwardedAt: true,
  createdAt: true,
  updatedAt: true,
  contentItem: {
    select: {
      id: true,
      title: true,
      type: true,
      scheduledDate: true,
      reference: true,
      toneOfVoice: true,
      caption: true,
      notes: true,
      contentPlanId: true,
      createdBy: true,
      clientReviewStatus: true,
      clientApprovedAt: true,
    },
  },
  brand: {
    select: {
      id: true,
      name: true,
      clientId: true,
      accountManagerId: true,
    },
  },
  client: {
    select: {
      id: true,
      fullName: true,
      email: true,
    },
  },
  accountManager: {
    select: {
      id: true,
      fullName: true,
      email: true,
    },
  },
  relatedTask: {
    select: {
      id: true,
      type: true,
      title: true,
      status: true,
      assignedTo: true,
      plannedDeadline: true,
      effectiveDeadline: true,
    },
  },
};

export const ClientChangeRequestsModel = {
  list(where = {}) {
    return prisma.clientChangeRequest.findMany({
      where,
      select: changeRequestSelect,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });
  },

  findById(id) {
    return prisma.clientChangeRequest.findUnique({
      where: { id },
      select: changeRequestSelect,
    });
  },

  findContentItemForReview(id) {
    return prisma.contentItem.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        type: true,
        scheduledDate: true,
        contentPlanId: true,
        createdBy: true,
        clientReviewStatus: true,
        clientApprovedAt: true,
        contentPlan: {
          select: {
            id: true,
            brandId: true,
            brand: {
              select: {
                id: true,
                name: true,
                clientId: true,
                accountManagerId: true,
              },
            },
          },
        },
      },
    });
  },

  findLatestCreationTask(contentItemId) {
    return prisma.task.findFirst({
      where: {
        contentItemId,
        type: { in: ['CONTENT_CREATION', 'CONTENT_MODIFICATION'] },
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      select: {
        id: true,
        type: true,
        assignedTo: true,
        status: true,
      },
    });
  },

  findLatestReviewTask(contentItemId) {
    return prisma.task.findFirst({
      where: {
        contentItemId,
        type: 'REVIEW',
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      select: {
        id: true,
        status: true,
        assignedTo: true,
      },
    });
  },

  findUserById(id) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        fullName: true,
        email: true,
        isActive: true,
        role: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  },

  findDeadlineRule(contentType, taskType) {
    return prisma.taskDeadlineRule.findUnique({
      where: {
        contentType_taskType: {
          contentType,
          taskType,
        },
      },
      select: {
        id: true,
        contentType: true,
        taskType: true,
        offsetMinutes: true,
        isActive: true,
      },
    });
  },
};
