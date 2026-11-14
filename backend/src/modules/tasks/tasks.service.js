import { TasksModel } from './tasks.model.js';
import { ApiError } from '../../utils/ApiError.js';
import { prisma } from '../../config/prisma.js';

const ACCOUNT_MANAGER_ROLES = new Set([
  'ADMIN',
  'ACCOUNT_MANAGER',
]);

const VALID_STATUSES = new Set([
  'TODO',
  'IN_PROGRESS',
  'SUBMITTED',
  'IN_REVIEW',
  'NEEDS_CHANGES',
  'COMPLETED',
  'CANCELLED',
]);

function getRoleName(user) {
  return user?.role?.name ?? user?.role ?? '';
}

function parseId(value, label = 'Id') {
  const id = Number(value);

  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new ApiError(
      400,
      `${label} must be a positive integer`,
    );
  }

  return id;
}

function ensureAccountManager(user) {
  if (!ACCOUNT_MANAGER_ROLES.has(getRoleName(user))) {
    throw new ApiError(
      403,
      'Only account managers can assign or manage workflow tasks',
    );
  }
}

function ensureUserExists(user) {
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
}

function ensureValidDate(value, label = 'Date') {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new ApiError(400, `${label} is invalid`);
  }

  return date;
}

function calculateDeadline(baseDate, offsetMinutes) {
  return new Date(
    baseDate.getTime() + offsetMinutes * 60 * 1000,
  );
}

function mapPrismaError(error) {
  if (error?.code === 'P2003') {
    throw new ApiError(
      400,
      'Invalid user, content item, or task reference',
    );
  }

  if (error?.code === 'P2025') {
    throw new ApiError(404, 'Task not found');
  }

  if (error?.code === 'P2002') {
    throw new ApiError(
      409,
      'A conflicting task already exists',
    );
  }

  throw error;
}

async function getTaskOrThrow(value) {
  const id = parseId(value, 'Task id');

  const task = await TasksModel.findById(id);

  if (!task) {
    throw new ApiError(404, 'Task not found');
  }

  return task;
}

async function getDeadlineRule(contentType, taskType) {
  const rule = await TasksModel.findDeadlineRule(
    contentType,
    taskType,
  );

  if (!rule || !rule.isActive) {
    throw new ApiError(
      400,
      `No active deadline rule configured for ${contentType} / ${taskType}`,
    );
  }

  return rule;
}

async function validateAssignee(userId) {
  const id = parseId(userId, 'Assignee id');

  const user = await TasksModel.findUserById(id);

  ensureUserExists(user);

  if (getRoleName(user) === 'CLIENT') {
    throw new ApiError(
      400,
      'Clients cannot be assigned internal tasks',
    );
  }

  return user;
}

export const TasksService = {
  async createDirectTask(input, currentUser) {
    if (!ACCOUNT_MANAGER_ROLES.has(getRoleName(currentUser))) {
      throw new ApiError(403, 'Only account managers can create direct tasks');
    }

    const createdBy = parseId(currentUser.id, 'User id');

    const assignee = await validateAssignee(
      input.assignedTo,
    );

    const plannedDeadline = ensureValidDate(
      input.plannedDeadline,
      'Planned deadline',
    );

    try {
      return await TasksModel.create({
        contentItemId: null,
        type: 'DIRECT',
        title: input.title,
        description: input.description ?? null,
        assignedTo: assignee.id,
        createdBy,
        status: 'TODO',
        priority: input.priority ?? 'MEDIUM',
        plannedDeadline,
        effectiveDeadline: plannedDeadline,
      });
    } catch (error) {
      mapPrismaError(error);
    }
  },

  async assignContentItemTasks(
    contentItemIdValue,
    input,
    currentUser,
  ) {
    ensureAccountManager(currentUser);

    const createdBy = parseId(currentUser.id, 'User id');

    const contentItemId = parseId(
      contentItemIdValue,
      'Content item id',
    );

    const contentItem =
      await TasksModel.findContentItemById(
        contentItemId,
      );

    if (!contentItem) {
      throw new ApiError(
        404,
        'Content item not found',
      );
    }

    if (
      getRoleName(currentUser) === 'ACCOUNT_MANAGER' &&
      contentItem.contentPlan?.brand?.accountManagerId !== currentUser.id
    ) {
      throw new ApiError(
        403,
        'You can only assign tasks to content items of your assigned brands',
      );
    }

    const existingTasks =
      await TasksModel.findExistingWorkflowTasks(
        contentItemId,
      );

    const hasCreationTask = existingTasks.some(
      (task) => task.type === 'CONTENT_CREATION',
    );

    const hasReviewTask = existingTasks.some(
      (task) => task.type === 'REVIEW',
    );

    if (hasCreationTask || hasReviewTask) {
      throw new ApiError(
        409,
        'Workflow tasks have already been assigned for this content item',
      );
    }

    const creationAssigneeId =
      input.creationAssigneeId ??
      contentItem.createdBy;

    const reviewerId =
      input.reviewerId ??
      contentItem.contentPlan.brand.accountManagerId;

    if (!reviewerId) {
      throw new ApiError(
        400,
        'No account manager is assigned to this brand',
      );
    }

    const creationAssignee =
      await validateAssignee(creationAssigneeId);

    const reviewer =
      await validateAssignee(reviewerId);

    if (!ACCOUNT_MANAGER_ROLES.has(getRoleName(reviewer))) {
      throw new ApiError(
        400,
        'Reviewer must be an account manager',
      );
    }

    const creationRule =
      await getDeadlineRule(
        contentItem.type,
        'CONTENT_CREATION',
      );

    const reviewRule =
      await getDeadlineRule(
        contentItem.type,
        'REVIEW',
      );

    const scheduledDate = ensureValidDate(
      contentItem.scheduledDate,
      'Content scheduled date',
    );

    const creationDeadline =
      calculateDeadline(
        scheduledDate,
        creationRule.offsetMinutes,
      );

    const reviewDeadline =
      calculateDeadline(
        scheduledDate,
        reviewRule.offsetMinutes,
      );

    try {
      return await prisma.$transaction(
        async (tx) => {
          const creationTask =
            await tx.task.create({
              data: {
                contentItemId,
                type: 'CONTENT_CREATION',
                title: `Create: ${contentItem.title}`,
                description: null,
                assignedTo: creationAssignee.id,
                createdBy,
                status: 'TODO',
                priority: 'MEDIUM',
                plannedDeadline: creationDeadline,
                effectiveDeadline: creationDeadline,
              },
            });

          const reviewTask =
            await tx.task.create({
              data: {
                contentItemId,
                type: 'REVIEW',
                title: `Review: ${contentItem.title}`,
                description: null,
                assignedTo: reviewer.id,
                createdBy,
                status: 'TODO',
                priority: 'HIGH',
                plannedDeadline: reviewDeadline,
                effectiveDeadline: reviewDeadline,
                dependsOnTaskId: creationTask.id,
              },
            });

          return {
            creationTask,
            reviewTask,
          };
        },
      );
    } catch (error) {
      mapPrismaError(error);
    }
  },

  async list(filters, currentUser) {
    const roleName = getRoleName(currentUser);

    if (roleName === 'CLIENT') {
      throw new ApiError(403, 'Clients cannot access tasks');
    }

    let scopeWhere = null;

    if (roleName === 'ADMIN') {
      scopeWhere = null;
    } else if (roleName === 'ACCOUNT_MANAGER') {
      scopeWhere = {
        OR: [
          { assignedTo: currentUser.id },
          { createdBy: currentUser.id },
          {
            contentItem: {
              contentPlan: {
                brand: {
                  accountManagerId: currentUser.id,
                },
              },
            },
          },
        ],
      };
    } else {
      scopeWhere = {
        assignedTo: currentUser.id,
      };
    }

    const filtersWhere = {};

    if ((roleName === 'ADMIN' || roleName === 'ACCOUNT_MANAGER') && filters.assignedTo !== undefined) {
      filtersWhere.assignedTo = parseId(
        filters.assignedTo,
        'Assignee id',
      );
    }

    if (filters.myTasks) {
      filtersWhere.assignedTo = currentUser.id;
    }

    if (filters.createdBy !== undefined) {
      filtersWhere.createdBy = parseId(
        filters.createdBy,
        'Creator id',
      );
    }

    if (filters.contentItemId !== undefined) {
      filtersWhere.contentItemId = parseId(
        filters.contentItemId,
        'Content item id',
      );
    }

    if (filters.type) {
      filtersWhere.type = filters.type;
    }

    if (filters.status) {
      filtersWhere.status = filters.status;
    }

    if (filters.priority) {
      filtersWhere.priority = filters.priority;
    }

    if (filters.needsReview) {
      filtersWhere.assignedTo = currentUser.id;
      filtersWhere.type = 'REVIEW';
      filtersWhere.status = {
        in: ['TODO', 'IN_REVIEW', 'NEEDS_CHANGES'],
      };
    }

    if (filters.overdue) {
      filtersWhere.assignedTo = currentUser.id;
      filtersWhere.status = {
        notIn: ['COMPLETED', 'CANCELLED'],
      };

      filtersWhere.effectiveDeadline = {
        lt: new Date(),
      };
    }

    const where = scopeWhere
      ? {
          AND: [
            filtersWhere,
            scopeWhere,
          ],
        }
      : filtersWhere;

    return TasksModel.list(where);
  },

  async getById(value, currentUser) {
    const task = await getTaskOrThrow(value);
    const roleName = getRoleName(currentUser);
    const isPrivileged = ACCOUNT_MANAGER_ROLES.has(roleName);
    const isAssignee = task.assignedTo === currentUser.id;
    const isCreator = task.createdBy === currentUser.id;

    if (!isPrivileged && !isAssignee && !isCreator) {
      throw new ApiError(403, 'You are not allowed to view this task');
    }

    return task;
  },

  async update(
    value,
    input,
    currentUser,
  ) {
    const task = await getTaskOrThrow(value);

    const roleName = getRoleName(currentUser);
    const isAdmin = roleName === 'ADMIN';

    const isAccountManager = roleName === 'ACCOUNT_MANAGER';

    const isAssignee =
      task.assignedTo === currentUser.id;

    const isCreator =
      task.createdBy === currentUser.id;

    if (
      !isAdmin &&
      !isAccountManager &&
      !isAssignee &&
      !isCreator
    ) {
      throw new ApiError(
        403,
        'You are not allowed to update this task',
      );
    }

    const data = {};

    if (input.title !== undefined) {
      data.title = input.title;
    }

    if (input.description !== undefined) {
      data.description = input.description;
    }

    if (input.priority !== undefined) {
      data.priority = input.priority;
    }

    if (input.assignedTo !== undefined) {
      if (!isAdmin && !isAccountManager) {
        throw new ApiError(
          403,
          'Only account managers can reassign tasks',
        );
      }

      const assignee =
        await validateAssignee(
          input.assignedTo,
        );

      data.assignedTo = assignee.id;
    }

    if (input.plannedDeadline !== undefined) {
      if (!isAdmin && !isAccountManager) {
        throw new ApiError(
          403,
          'Only account managers can change planned deadlines',
        );
      }

      data.plannedDeadline =
        ensureValidDate(
          input.plannedDeadline,
          'Planned deadline',
        );
    }

    if (input.effectiveDeadline !== undefined) {
      if (!isAdmin && !isAccountManager) {
        throw new ApiError(
          403,
          'Only account managers can change effective deadlines',
        );
      }

      data.effectiveDeadline =
        input.effectiveDeadline === null
          ? null
          : ensureValidDate(
              input.effectiveDeadline,
              'Effective deadline',
            );
    }

    if (input.status !== undefined) {
      await this.changeStatus(
        task,
        input.status,
        currentUser,
      );

      return getTaskOrThrow(value);
    }

    try {
      return await TasksModel.update(
        task.id,
        data,
      );
    } catch (error) {
      mapPrismaError(error);
    }
  },

  async changeStatus(
    task,
    newStatus,
    currentUser,
  ) {
    if (!VALID_STATUSES.has(newStatus)) {
      throw new ApiError(
        400,
        'Invalid task status',
      );
    }

    const roleName = getRoleName(currentUser);
    const isAdmin = roleName === 'ADMIN';

    const isAccountManager = roleName === 'ACCOUNT_MANAGER';

    const isAssignee =
      task.assignedTo === currentUser.id;

    if (
      !isAdmin &&
      !isAccountManager &&
      !isAssignee
    ) {
      throw new ApiError(
        403,
        'You are not allowed to change this task status',
      );
    }

    const data = {
      status: newStatus,
    };

    if (
      newStatus === 'IN_PROGRESS' &&
      !task.startedAt
    ) {
      data.startedAt = new Date();
    }

    if (newStatus === 'COMPLETED') {
      data.completedAt = new Date();
    }

    if (
      newStatus !== 'COMPLETED' &&
      task.completedAt
    ) {
      data.completedAt = null;
    }

    try {
      const updatedTask =
        await TasksModel.update(
          task.id,
          data,
        );

      if (
        newStatus === 'SUBMITTED'
      ) {
        await this.handleTaskSubmission(
          updatedTask,
        );
      }

      if (
        newStatus === 'COMPLETED' &&
        updatedTask.type === 'REVIEW'
      ) {
        await this.handleReviewCompletion(
          updatedTask,
        );
      }

      return updatedTask;
    } catch (error) {
      mapPrismaError(error);
    }
  },

  async handleTaskSubmission(task) {
    if (
      task.type !== 'CONTENT_CREATION'
    ) {
      return;
    }

    const reviewTask =
      await prisma.task.findFirst({
        where: {
          contentItemId:
            task.contentItemId,
          type: 'REVIEW',
          status: {
            notIn: [
              'COMPLETED',
              'CANCELLED',
            ],
          },
        },
      });

    if (!reviewTask) {
      return;
    }

    const reviewRule =
      await TasksModel.findDeadlineRule(
        task.contentItem.type,
        'REVIEW',
      );

    if (!reviewRule) {
      return;
    }

    const effectiveDeadline =
      calculateDeadline(
        task.completedAt ?? new Date(),
        reviewRule.offsetMinutes * -1,
      );

    await TasksModel.update(
      reviewTask.id,
      {
        status: 'IN_REVIEW',
        effectiveDeadline,
      },
    );
  },

  async handleReviewCompletion(task) {
    if (
      task.type !== 'REVIEW'
    ) {
      return;
    }

    // Publish task will be added in the next workflow step.
    return task;
  },

  async remove(value, currentUser) {
    const task = await getTaskOrThrow(value);

    const roleName = getRoleName(currentUser);
    const isAdmin = roleName === 'ADMIN';

    const isAccountManager = roleName === 'ACCOUNT_MANAGER';

    if (
      !isAdmin &&
      !isAccountManager
    ) {
      throw new ApiError(
        403,
        'Only account managers can delete tasks',
      );
    }

    try {
      return await TasksModel.remove(
        task.id,
      );
    } catch (error) {
      mapPrismaError(error);
    }
  },
};
