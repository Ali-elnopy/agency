import { prisma } from '../../config/prisma.js';

const taskSelect = {
  id: true,
  contentItemId: true,
  type: true,
  title: true,
  description: true,
  assignedTo: true,
  createdBy: true,
  status: true,
  priority: true,
  plannedDeadline: true,
  effectiveDeadline: true,
  startedAt: true,
  completedAt: true,
  dependsOnTaskId: true,
  createdAt: true,
  updatedAt: true,

  contentItem: {
    select: {
      id: true,
      title: true,
      type: true,
      scheduledDate: true,
      contentPlanId: true,
    },
  },

  assignee: {
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
    },
  },

  creator: {
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
    },
  },

  dependsOn: {
    select: {
      id: true,
      type: true,
      title: true,
      status: true,
      plannedDeadline: true,
      effectiveDeadline: true,
      completedAt: true,
    },
  },
};

export const TasksModel = {
  create(data) {
    return prisma.task.create({
      data,
      select: taskSelect,
    });
  },

  createMany(data) {
    return prisma.task.createMany({
      data,
    });
  },

  list(where = {}) {
    return prisma.task.findMany({
      where,
      select: taskSelect,
      orderBy: [
        { effectiveDeadline: 'asc' },
        { createdAt: 'desc' },
      ],
    });
  },

  findById(id) {
    return prisma.task.findUnique({
      where: { id },
      select: taskSelect,
    });
  },

  update(id, data) {
    return prisma.task.update({
      where: { id },
      data,
      select: taskSelect,
    });
  },

  remove(id) {
    return prisma.task.delete({
      where: { id },
      select: taskSelect,
    });
  },

  findContentItemById(id) {
    return prisma.contentItem.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        type: true,
        scheduledDate: true,
        createdBy: true,

        contentPlan: {
          select: {
            id: true,
            brandId: true,
            brand: {
              select: {
                id: true,
                accountManagerId: true,
              },
            },
          },
        },
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
        role: true,
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

  findExistingWorkflowTasks(contentItemId) {
    return prisma.task.findMany({
      where: {
        contentItemId,
        type: {
          in: ['CONTENT_CREATION', 'REVIEW'],
        },
      },
      select: {
        id: true,
        type: true,
        status: true,
        assignedTo: true,
      },
    });
  },
};