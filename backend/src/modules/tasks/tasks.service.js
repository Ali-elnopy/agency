import { TasksModel } from './tasks.model.js';
import { ApiError } from '../../utils/ApiError.js';
import { prisma } from '../../config/prisma.js';
import { getRoleName, isContentCreatorUser } from '../../utils/roles.js';
import { NotificationsService } from '../notifications/notifications.service.js';

const ACCOUNT_MANAGER_ROLES = new Set(['ADMIN', 'ACCOUNT_MANAGER']);

const VALID_STATUSES = new Set([
  'TODO',
  'IN_PROGRESS',
  'SUBMITTED',
  'IN_REVIEW',
  'NEEDS_CHANGES',
  'COMPLETED',
  'CANCELLED',
]);

function parseId(value, label = 'Id') {
  const id = Number(value);

  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new ApiError(400, `${label} must be a positive integer`);
  }

  return id;
}

function ensureNotClient(user) {
  if (getRoleName(user) === 'CLIENT') {
    throw new ApiError(403, 'Clients are not allowed to access internal tasks');
  }
}

function ensureAccountManager(user) {
  if (!ACCOUNT_MANAGER_ROLES.has(getRoleName(user))) {
    throw new ApiError(403, 'Only admins and account managers can assign or manage workflow tasks');
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
  return new Date(baseDate.getTime() + offsetMinutes * 60 * 1000);
}

function mapPrismaError(error) {
  if (error?.code === 'P2003') {
    throw new ApiError(400, 'Invalid user, content item, or task reference');
  }

  if (error?.code === 'P2025') {
    throw new ApiError(404, 'Task not found');
  }

  if (error?.code === 'P2002') {
    throw new ApiError(409, 'A conflicting task already exists');
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
  const rule = await TasksModel.findDeadlineRule(contentType, taskType);

  if (!rule || !rule.isActive) {
    throw new ApiError(400, `No active deadline rule configured for ${contentType} / ${taskType}`);
  }

  return rule;
}

async function validateAssignee(userId) {
  const id = parseId(userId, 'Assignee id');
  const user = await TasksModel.findUserById(id);

  ensureUserExists(user);

  if (getRoleName(user) === 'CLIENT') {
    throw new ApiError(400, 'Clients cannot be assigned internal tasks');
  }

  return user;
}

function assertCanChangeStatus(task, newStatus, currentUser) {
  ensureNotClient(currentUser);

  if (!VALID_STATUSES.has(newStatus)) {
    throw new ApiError(400, 'Invalid task status');
  }

  const roleName = getRoleName(currentUser);
  const isAdmin = roleName === 'ADMIN';
  const isAccountManager = roleName === 'ACCOUNT_MANAGER';
  const isAssignee = task.assignedTo === currentUser.id;

  // CREATIVE users can change status only on their assigned tasks.
  if (roleName === 'CREATIVE' && !isAssignee) {
    throw new ApiError(403, 'You can only change the status of tasks assigned to you');
  }

  if (!isAdmin && !isAccountManager && !isAssignee) {
    throw new ApiError(403, 'You are not allowed to change this task status');
  }

  if (
    newStatus === 'SUBMITTED' &&
    task.type === 'CONTENT_CREATION' &&
    (roleName === 'CREATIVE' || isContentCreatorUser(currentUser))
  ) {
    throw new ApiError(
      400,
      'Use the content submission endpoint to submit this task',
    );
  }

  if (
    (task.type === 'CONTENT_CREATION' || task.type === 'REVIEW') &&
    (newStatus === 'COMPLETED' || newStatus === 'NEEDS_CHANGES') &&
    !isAdmin &&
    !isAccountManager
  ) {
    throw new ApiError(
      403,
      'Only admins and account managers can approve or request changes on content workflow tasks',
    );
  }
}

export const TasksService = {
  async createDirectTask(input, currentUser) {
    ensureAccountManager(currentUser);

    const createdBy = parseId(currentUser.id, 'User id');
    const assignee = await validateAssignee(input.assignedTo);
    const plannedDeadline = ensureValidDate(input.plannedDeadline, 'Planned deadline');

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

  async assignContentItemTasks(contentItemIdValue, input, currentUser) {
    ensureAccountManager(currentUser);

    const createdBy = parseId(currentUser.id, 'User id');
    const contentItemId = parseId(contentItemIdValue, 'Content item id');
    const contentItem = await TasksModel.findContentItemById(contentItemId);

    if (!contentItem) {
      throw new ApiError(404, 'Content item not found');
    }

    if (
      getRoleName(currentUser) === 'ACCOUNT_MANAGER' &&
      contentItem.contentPlan?.brand?.accountManagerId !== currentUser.id
    ) {
      throw new ApiError(403, 'You can only assign tasks to content items of your assigned brands');
    }

    const existingTasks = await TasksModel.findExistingWorkflowTasks(contentItemId);

    const hasCreationTask = existingTasks.some((task) => task.type === 'CONTENT_CREATION');
    const hasReviewTask = existingTasks.some((task) => task.type === 'REVIEW');

    if (hasCreationTask || hasReviewTask) {
      throw new ApiError(409, 'Workflow tasks have already been assigned for this content item');
    }

    const creationAssigneeId = input.creationAssigneeId ?? contentItem.createdBy;
    const reviewerId = input.reviewerId ?? contentItem.contentPlan?.brand?.accountManagerId;

    if (!reviewerId) {
      throw new ApiError(400, 'No account manager is assigned to this brand');
    }

    const creationAssignee = await validateAssignee(creationAssigneeId);
    const reviewer = await validateAssignee(reviewerId);

    if (!ACCOUNT_MANAGER_ROLES.has(getRoleName(reviewer))) {
      throw new ApiError(400, 'Reviewer must be an account manager');
    }

    const creationRule = await getDeadlineRule(contentItem.type, 'CONTENT_CREATION');
    const reviewRule = await getDeadlineRule(contentItem.type, 'REVIEW');

    const scheduledDate = ensureValidDate(contentItem.scheduledDate, 'Content scheduled date');

    const creationDeadline = calculateDeadline(scheduledDate, creationRule.offsetMinutes);
    const reviewDeadline = calculateDeadline(scheduledDate, reviewRule.offsetMinutes);

    try {
      return await prisma.$transaction(async (tx) => {
        const creationTask = await tx.task.create({
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

        const reviewTask = await tx.task.create({
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
      });
    } catch (error) {
      mapPrismaError(error);
    }
  },

  async list(filters, currentUser) {
    ensureNotClient(currentUser);

    const roleName = getRoleName(currentUser);

    const scopeWhere =
      roleName === 'ADMIN'
        ? null
        : roleName === 'ACCOUNT_MANAGER'
          ? {
              OR: [
                {
                  assignedTo: currentUser.id,
                },
                {
                  createdBy: currentUser.id,
                },
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
            }
          : {
              assignedTo: currentUser.id,
            };

    const filtersWhere = {};

    if (
      (roleName === 'ADMIN' || roleName === 'ACCOUNT_MANAGER') &&
      filters.assignedTo !== undefined
    ) {
      filtersWhere.assignedTo = parseId(filters.assignedTo, 'Assignee id');
    }

    if (filters.myTasks) {
      filtersWhere.assignedTo = currentUser.id;
    }

    if (filters.createdBy !== undefined) {
      filtersWhere.createdBy = parseId(filters.createdBy, 'Creator id');
    }

    if (filters.contentItemId !== undefined) {
      filtersWhere.contentItemId = parseId(filters.contentItemId, 'Content item id');
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
          AND: [filtersWhere, scopeWhere],
        }
      : filtersWhere;

    return TasksModel.list(where);
  },

  async getById(value, currentUser) {
    ensureNotClient(currentUser);

    const task = await getTaskOrThrow(value);

    const roleName = getRoleName(currentUser);
    const isManager = ACCOUNT_MANAGER_ROLES.has(roleName);
    const isAssignee = task.assignedTo === currentUser.id;
    const isCreator = task.createdBy === currentUser.id;

    if (!isManager && !isAssignee && !isCreator) {
      throw new ApiError(403, 'You are not allowed to view this task');
    }

    return task;
  },

  async update(value, input, currentUser) {
    ensureNotClient(currentUser);

    const roleName = getRoleName(currentUser);

    // CREATIVE users must use the dedicated status/submit endpoints.
    // They cannot edit task fields through PATCH /:id.
    if (roleName === 'CREATIVE') {
      throw new ApiError(403, 'Creative users cannot directly edit tasks');
    }

    const task = await getTaskOrThrow(value);

    const isAdmin = roleName === 'ADMIN';
    const isAccountManager = roleName === 'ACCOUNT_MANAGER';
    const isAssignee = task.assignedTo === currentUser.id;
    const isCreator = task.createdBy === currentUser.id;

    if (!isAdmin && !isAccountManager && !isAssignee && !isCreator) {
      throw new ApiError(403, 'You are not allowed to update this task');
    }

    if (input.status !== undefined) {
      assertCanChangeStatus(task, input.status, currentUser);
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
        throw new ApiError(403, 'Only account managers can reassign tasks');
      }

      const assignee = await validateAssignee(input.assignedTo);
      data.assignedTo = assignee.id;
    }

    if (input.plannedDeadline !== undefined) {
      if (!isAdmin && !isAccountManager) {
        throw new ApiError(403, 'Only account managers can change planned deadlines');
      }

      data.plannedDeadline = ensureValidDate(input.plannedDeadline, 'Planned deadline');
    }

    if (input.effectiveDeadline !== undefined) {
      if (!isAdmin && !isAccountManager) {
        throw new ApiError(403, 'Only account managers can change effective deadlines');
      }

      data.effectiveDeadline =
        input.effectiveDeadline === null
          ? null
          : ensureValidDate(input.effectiveDeadline, 'Effective deadline');
    }

    try {
      let updatedTask = task;

      if (Object.keys(data).length > 0) {
        updatedTask = await TasksModel.update(task.id, data);
      }

      if (input.status !== undefined) {
        updatedTask = await this.changeStatus(updatedTask, input.status, currentUser);
      }

      return updatedTask;
    } catch (error) {
      mapPrismaError(error);
    }
  },

  async submitContentTask(value, input, currentUser) {
    ensureNotClient(currentUser);

    const task = await getTaskOrThrow(value);
    const roleName = getRoleName(currentUser);

    // Only the assigned creative or content creator can submit the content task.
    if (roleName !== 'CREATIVE' && !isContentCreatorUser(currentUser)) {
      throw new ApiError(403, 'Only creative users or content creators can submit content tasks');
    }

    // The task must be assigned to the current user.
    if (task.assignedTo !== currentUser.id) {
      throw new ApiError(403, 'You can only submit tasks assigned to you');
    }

    // Only content creation tasks can be submitted this way.
    if (task.type !== 'CONTENT_CREATION') {
      throw new ApiError(400, 'Only content creation tasks can be submitted');
    }

    // A task cannot be submitted after it is completed or cancelled.
    if (task.status === 'COMPLETED' || task.status === 'CANCELLED') {
      throw new ApiError(400, 'This task can no longer be submitted');
    }

    try {
      return await prisma.$transaction(async (tx) => {
        const submittedAt = new Date();
        const submissionNotes =
          input.submissionNotes !== undefined
            ? input.submissionNotes
            : task.submissionNotes ?? null;

        const updatedTask = await tx.task.update({
          where: { id: task.id },
          data: {
            submissionUrl: input.submissionUrl,
            submissionNotes,
            submittedAt,
            status: 'SUBMITTED',
          },
          select: {
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
            submissionUrl: true,
            submissionNotes: true,
            submittedAt: true,
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
                reference: true,
                toneOfVoice: true,
                caption: true,
                notes: true,
              },
            },
          },
        });

        await this.handleTaskSubmission(updatedTask, tx);

        return updatedTask;
      });
    } catch (error) {
      mapPrismaError(error);
    }
  },

  async reviewTask(value, input, currentUser) {
    ensureNotClient(currentUser);

    const roleName = getRoleName(currentUser);

    if (!ACCOUNT_MANAGER_ROLES.has(roleName)) {
      throw new ApiError(403, 'Only admins and account managers can review content tasks');
    }

    const targetTask = await getTaskOrThrow(value);

    let creationTask = null;
    let reviewTask = null;

    if (targetTask.type === 'CONTENT_CREATION') {
      creationTask = targetTask;
      reviewTask = await prisma.task.findFirst({
        where: {
          contentItemId: targetTask.contentItemId,
          type: 'REVIEW',
          status: { not: 'CANCELLED' },
        },
        orderBy: { createdAt: 'asc' },
      });
    } else if (targetTask.type === 'REVIEW') {
      reviewTask = targetTask;
      creationTask = targetTask.dependsOnTaskId
        ? await TasksModel.findById(targetTask.dependsOnTaskId)
        : await prisma.task.findFirst({
            where: {
              contentItemId: targetTask.contentItemId,
              type: 'CONTENT_CREATION',
            },
            orderBy: { createdAt: 'asc' },
          });
    } else {
      throw new ApiError(400, 'Only content creation or review tasks can be reviewed');
    }

    if (!creationTask) {
      throw new ApiError(404, 'Linked content creation task not found');
    }

    if (!reviewTask) {
      throw new ApiError(400, 'No active review task found for this content item');
    }

    if (roleName === 'ACCOUNT_MANAGER') {
      const brandAccountManagerId =
        creationTask.contentItem?.contentPlan?.brand?.accountManagerId ??
        reviewTask.contentItem?.contentPlan?.brand?.accountManagerId;

      if (brandAccountManagerId !== undefined && brandAccountManagerId !== null) {
        if (brandAccountManagerId !== currentUser.id) {
          throw new ApiError(403, 'You can only review tasks for your assigned brands');
        }
      } else if (reviewTask.assignedTo !== currentUser.id) {
        throw new ApiError(403, 'You can only review tasks assigned to you');
      }
    }

    if (
      creationTask.status === 'COMPLETED' ||
      creationTask.status === 'CANCELLED' ||
      reviewTask.status === 'COMPLETED' ||
      reviewTask.status === 'CANCELLED'
    ) {
      throw new ApiError(400, 'This task can no longer be reviewed');
    }

    if (creationTask.status !== 'SUBMITTED') {
      throw new ApiError(400, 'Only submitted content creation tasks can be reviewed');
    }

    const { decision, notes } = input;
    const now = new Date();
    const isApproved = decision === 'COMPLETED';

    const creationUpdateData = {
      status: decision,
      completedAt: isApproved ? now : null,
    };

    const reviewUpdateData = {
      status: decision,
      completedAt: isApproved ? now : null,
      ...(notes !== undefined ? { description: notes } : {}),
    };

    try {
      return await prisma.$transaction(async (tx) => {
        const updatedCreationTask = await tx.task.update({
          where: { id: creationTask.id },
          data: creationUpdateData,
        });

        const updatedReviewTask = await tx.task.update({
          where: { id: reviewTask.id },
          data: reviewUpdateData,
        });

        await NotificationsService.create(
          {
            recipientId: creationTask.assignedTo,
            type: isApproved ? 'TASK_REVIEW_APPROVED' : 'TASK_NEEDS_CHANGES',
            title: isApproved ? 'Content Approved' : 'Changes Requested',
            message: isApproved
              ? `Your submission for "${creationTask.title}" has been approved.`
              : `Changes were requested for "${creationTask.title}".`,
            data: {
              taskId: creationTask.id,
              reviewTaskId: reviewTask.id,
              contentItemId: creationTask.contentItemId,
              decision,
              notes: notes ?? null,
            },
          },
          tx,
        );

        return {
          creationTask: updatedCreationTask,
          reviewTask: updatedReviewTask,
        };
      });
    } catch (error) {
      mapPrismaError(error);
    }
  },

  async changeStatus(task, newStatus, currentUser) {
    assertCanChangeStatus(task, newStatus, currentUser);

    const data = {
      status: newStatus,
    };

    if (newStatus === 'IN_PROGRESS' && !task.startedAt) {
      data.startedAt = new Date();
    }

    if (newStatus === 'SUBMITTED' && !task.submittedAt) {
      data.submittedAt = new Date();
    }

    if (newStatus === 'COMPLETED') {
      data.completedAt = new Date();
    }

    if (newStatus !== 'COMPLETED' && task.completedAt) {
      data.completedAt = null;
    }

    try {
      const updatedTask = await TasksModel.update(task.id, data);

      if (newStatus === 'SUBMITTED') {
        await this.handleTaskSubmission(updatedTask);
      }

      if (newStatus === 'COMPLETED' && updatedTask.type === 'REVIEW') {
        await this.handleReviewCompletion(updatedTask);
      }

      return updatedTask;
    } catch (error) {
      mapPrismaError(error);
    }
  },

  async handleTaskSubmission(task, db = prisma) {
    if (task.type !== 'CONTENT_CREATION' || !task.contentItemId) {
      return;
    }

    const reviewTask = await db.task.findFirst({
      where: {
        contentItemId: task.contentItemId,
        type: 'REVIEW',
        status: {
          notIn: ['COMPLETED', 'CANCELLED'],
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    if (!reviewTask) {
      return;
    }

    const updateData = {
      status: 'IN_REVIEW',
      completedAt: null,
    };

    if (task.contentItem?.type) {
      const reviewRule = await TasksModel.findDeadlineRule(task.contentItem.type, 'REVIEW');

      if (reviewRule && reviewRule.isActive) {
        updateData.effectiveDeadline = calculateDeadline(
          task.submittedAt ?? new Date(),
          Math.abs(reviewRule.offsetMinutes),
        );
      }
    }

    if (db === prisma) {
      await TasksModel.update(reviewTask.id, updateData);
    } else {
      await db.task.update({
        where: { id: reviewTask.id },
        data: updateData,
      });
    }

    if (reviewTask.assignedTo) {
      await NotificationsService.create(
        {
          recipientId: reviewTask.assignedTo,
          type: 'TASK_SUBMITTED',
          title: 'Content Submitted for Review',
          message: `A submission for "${task.title}" is ready for review.`,
          data: {
            taskId: task.id,
            reviewTaskId: reviewTask.id,
            contentItemId: task.contentItemId,
            submissionUrl: task.submissionUrl ?? null,
          },
        },
        db,
      );
    }
  },

  async handleReviewCompletion(task) {
    if (task.type !== 'REVIEW') {
      return;
    }

    // Publish task will be added in the next workflow step.
    return task;
  },

  async remove(value, currentUser) {
    ensureAccountManager(currentUser);

    const task = await getTaskOrThrow(value);

    try {
      return await TasksModel.remove(task.id);
    } catch (error) {
      mapPrismaError(error);
    }
  },
};
