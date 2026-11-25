import { prisma } from '../../config/prisma.js';
import { ApiError } from '../../utils/ApiError.js';
import { getRoleName } from '../../utils/roles.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import {
  ClientChangeRequestsModel,
  changeRequestSelect,
} from './client-change-requests.model.js';

const MANAGER_ROLES = new Set(['ADMIN', 'ACCOUNT_MANAGER']);

function parseId(value, label = 'Id') {
  const id = Number(value);

  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new ApiError(400, `${label} must be a positive integer`);
  }

  return id;
}

function calculateDeadline(baseDate, offsetMinutes) {
  return new Date(baseDate.getTime() + offsetMinutes * 60 * 1000);
}

function buildModificationDescription(clientNotes, accountManagerNotes) {
  const parts = [`Client Change Request:\n${clientNotes}`];

  if (accountManagerNotes && accountManagerNotes.trim()) {
    parts.push(`Account Manager Instructions:\n${accountManagerNotes.trim()}`);
  }

  return parts.join('\n\n');
}

function assertCanManageChangeRequest(changeRequest, currentUser) {
  const roleName = getRoleName(currentUser);

  if (!MANAGER_ROLES.has(roleName)) {
    throw new ApiError(
      403,
      'Only admins and account managers can manage client change requests',
    );
  }

  if (roleName === 'ACCOUNT_MANAGER') {
    const brandAccountManagerId =
      changeRequest.brand?.accountManagerId ?? changeRequest.accountManagerId;

    if (brandAccountManagerId !== currentUser.id) {
      throw new ApiError(
        403,
        'You can only manage client change requests for your assigned brands',
      );
    }
  }
}

async function getChangeRequestOrThrow(idValue) {
  const id = parseId(idValue, 'Change request id');
  const changeRequest = await ClientChangeRequestsModel.findById(id);

  if (!changeRequest) {
    throw new ApiError(404, 'Client change request not found');
  }

  return changeRequest;
}

export const ClientChangeRequestsService = {
  async submitClientReview(contentItemIdValue, input, currentUser) {
    const roleName = getRoleName(currentUser);

    if (roleName !== 'CLIENT') {
      throw new ApiError(403, 'Only clients can submit a client review');
    }

    const contentItemId = parseId(contentItemIdValue, 'Content item id');
    const contentItem = await ClientChangeRequestsModel.findContentItemForReview(contentItemId);

    if (!contentItem) {
      throw new ApiError(404, 'Content item not found');
    }

    const brand = contentItem.contentPlan?.brand;

    if (!brand || brand.clientId !== currentUser.id) {
      throw new ApiError(403, 'You can only review content items belonging to your own brand');
    }

    if (contentItem.clientReviewStatus !== 'PENDING_CLIENT_REVIEW') {
      throw new ApiError(
        400,
        `Content item is not ready for client review (current status: ${contentItem.clientReviewStatus})`,
      );
    }

    if (input.decision === 'APPROVE') {
      const now = new Date();

      return prisma.$transaction(async (tx) => {
        const updatedContentItem = await tx.contentItem.update({
          where: { id: contentItem.id },
          data: {
            clientReviewStatus: 'APPROVED',
            clientApprovedAt: now,
          },
          select: {
            id: true,
            title: true,
            contentPlanId: true,
            clientReviewStatus: true,
            clientApprovedAt: true,
          },
        });

        if (brand.accountManagerId) {
          await NotificationsService.create(
            {
              recipientId: brand.accountManagerId,
              type: 'CONTENT_CLIENT_APPROVED',
              title: 'Content Approved by Client',
              message: `The client approved "${contentItem.title}".`,
              data: {
                contentItemId: contentItem.id,
                brandId: brand.id,
                clientId: currentUser.id,
              },
            },
            tx,
          );
        }

        return {
          contentItem: updatedContentItem,
        };
      });
    }

    // decision === 'REQUEST_CHANGES'
    if (!brand.accountManagerId) {
      throw new ApiError(400, 'No account manager is assigned to this brand');
    }

    return prisma.$transaction(async (tx) => {
      const changeRequest = await tx.clientChangeRequest.create({
        data: {
          contentItemId: contentItem.id,
          brandId: brand.id,
          clientId: currentUser.id,
          accountManagerId: brand.accountManagerId,
          status: 'PENDING',
          clientNotes: input.notes,
        },
        select: changeRequestSelect,
      });

      const updatedContentItem = await tx.contentItem.update({
        where: { id: contentItem.id },
        data: {
          clientReviewStatus: 'CHANGES_REQUESTED',
          clientApprovedAt: null,
        },
        select: {
          id: true,
          title: true,
          contentPlanId: true,
          clientReviewStatus: true,
          clientApprovedAt: true,
        },
      });

      await NotificationsService.create(
        {
          recipientId: brand.accountManagerId,
          type: 'CLIENT_CHANGE_REQUEST_CREATED',
          title: 'Client Requested Changes',
          message: `The client requested changes for "${contentItem.title}".`,
          data: {
            changeRequestId: changeRequest.id,
            contentItemId: contentItem.id,
            brandId: brand.id,
            clientId: currentUser.id,
            clientNotes: input.notes,
          },
        },
        tx,
      );

      return {
        contentItem: updatedContentItem,
        changeRequest,
      };
    });
  },

  async list(filters, currentUser) {
    const roleName = getRoleName(currentUser);

    if (roleName !== 'ADMIN' && roleName !== 'ACCOUNT_MANAGER' && roleName !== 'CLIENT') {
      throw new ApiError(403, 'You are not allowed to access client change requests');
    }

    const where = {};

    if (roleName === 'ACCOUNT_MANAGER') {
      where.brand = { accountManagerId: currentUser.id };
    } else if (roleName === 'CLIENT') {
      where.clientId = currentUser.id;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.contentItemId !== undefined) {
      where.contentItemId = parseId(filters.contentItemId, 'Content item id');
    }

    if (filters.brandId !== undefined) {
      where.brandId = parseId(filters.brandId, 'Brand id');
    }

    return ClientChangeRequestsModel.list(where);
  },

  async getById(idValue, currentUser) {
    const roleName = getRoleName(currentUser);

    if (roleName !== 'ADMIN' && roleName !== 'ACCOUNT_MANAGER' && roleName !== 'CLIENT') {
      throw new ApiError(403, 'You are not allowed to access client change requests');
    }

    const changeRequest = await getChangeRequestOrThrow(idValue);

    if (roleName === 'CLIENT' && changeRequest.clientId !== currentUser.id) {
      throw new ApiError(403, 'You can only view your own change requests');
    }

    if (roleName === 'ACCOUNT_MANAGER') {
      const brandAccountManagerId =
        changeRequest.brand?.accountManagerId ?? changeRequest.accountManagerId;

      if (brandAccountManagerId !== currentUser.id) {
        throw new ApiError(
          403,
          'You can only view client change requests for your assigned brands',
        );
      }
    }

    return changeRequest;
  },

  async resolve(idValue, input, currentUser) {
    const changeRequest = await getChangeRequestOrThrow(idValue);

    assertCanManageChangeRequest(changeRequest, currentUser);

    if (changeRequest.status !== 'PENDING') {
      throw new ApiError(
        400,
        `Cannot resolve a change request that is already ${changeRequest.status}`,
      );
    }

    const now = new Date();

    return prisma.$transaction(async (tx) => {
      const updatedChangeRequest = await tx.clientChangeRequest.update({
        where: { id: changeRequest.id },
        data: {
          status: 'RESOLVED',
          accountManagerNotes: input.notes ?? null,
          resolvedAt: now,
        },
        select: changeRequestSelect,
      });

      const updatedContentItem = await tx.contentItem.update({
        where: { id: changeRequest.contentItemId },
        data: {
          clientReviewStatus: 'PENDING_CLIENT_REVIEW',
        },
        select: {
          id: true,
          title: true,
          contentPlanId: true,
          clientReviewStatus: true,
          clientApprovedAt: true,
        },
      });

      await NotificationsService.create(
        {
          recipientId: changeRequest.clientId,
          type: 'CLIENT_CHANGE_REQUEST_RESOLVED',
          title: 'Change Request Resolved',
          message: `Your change request for "${changeRequest.contentItem?.title ?? 'content'}" has been resolved.`,
          data: {
            changeRequestId: changeRequest.id,
            contentItemId: changeRequest.contentItemId,
            brandId: changeRequest.brandId,
            notes: input.notes ?? null,
          },
        },
        tx,
      );

      return {
        changeRequest: updatedChangeRequest,
        contentItem: updatedContentItem,
      };
    });
  },

  async forward(idValue, input, currentUser) {
    const changeRequest = await getChangeRequestOrThrow(idValue);

    assertCanManageChangeRequest(changeRequest, currentUser);

    if (changeRequest.status !== 'PENDING') {
      throw new ApiError(
        400,
        `Cannot forward a change request that is already ${changeRequest.status}`,
      );
    }

    const contentItem = changeRequest.contentItem;
    const latestCreationTask = await ClientChangeRequestsModel.findLatestCreationTask(
      changeRequest.contentItemId,
    );
    const latestReviewTask = await ClientChangeRequestsModel.findLatestReviewTask(
      changeRequest.contentItemId,
    );

    const assigneeId =
      input.assignedTo ??
      latestCreationTask?.assignedTo ??
      contentItem?.createdBy;

    if (!assigneeId) {
      throw new ApiError(400, 'No responsible creative or content creator found to assign');
    }

    const assignee = await ClientChangeRequestsModel.findUserById(
      parseId(assigneeId, 'Assignee id'),
    );

    if (!assignee || assignee.isActive === false) {
      throw new ApiError(404, 'Assignee user not found');
    }

    if (getRoleName(assignee) === 'CLIENT') {
      throw new ApiError(400, 'Clients cannot be assigned internal modification tasks');
    }

    const reviewerId =
      changeRequest.brand?.accountManagerId ??
      changeRequest.accountManagerId ??
      currentUser.id;

    const scheduledDate = contentItem?.scheduledDate
      ? new Date(contentItem.scheduledDate)
      : new Date();

    const creationRule = contentItem?.type
      ? await ClientChangeRequestsModel.findDeadlineRule(contentItem.type, 'CONTENT_CREATION')
      : null;
    const reviewRule = contentItem?.type
      ? await ClientChangeRequestsModel.findDeadlineRule(contentItem.type, 'REVIEW')
      : null;

    const modificationDeadline = input.plannedDeadline
      ? new Date(input.plannedDeadline)
      : creationRule?.isActive
        ? calculateDeadline(scheduledDate, creationRule.offsetMinutes)
        : scheduledDate;

    const reviewDeadline = reviewRule?.isActive
      ? calculateDeadline(scheduledDate, reviewRule.offsetMinutes)
      : modificationDeadline;

    const now = new Date();
    const description = buildModificationDescription(
      changeRequest.clientNotes,
      input.notes,
    );
    const previousTaskId = latestReviewTask?.id ?? latestCreationTask?.id ?? null;

    return prisma.$transaction(async (tx) => {
      const modificationTask = await tx.task.create({
        data: {
          contentItemId: changeRequest.contentItemId,
          type: 'CONTENT_MODIFICATION',
          title: `Modify: ${contentItem?.title ?? `Content Item #${changeRequest.contentItemId}`}`,
          description,
          assignedTo: assignee.id,
          createdBy: currentUser.id,
          status: 'TODO',
          priority: input.priority ?? 'HIGH',
          plannedDeadline: modificationDeadline,
          effectiveDeadline: modificationDeadline,
          dependsOnTaskId: previousTaskId,
        },
      });

      const reviewTask = await tx.task.create({
        data: {
          contentItemId: changeRequest.contentItemId,
          type: 'REVIEW',
          title: `Review: ${contentItem?.title ?? `Content Item #${changeRequest.contentItemId}`}`,
          description: null,
          assignedTo: reviewerId,
          createdBy: currentUser.id,
          status: 'TODO',
          priority: 'HIGH',
          plannedDeadline: reviewDeadline,
          effectiveDeadline: reviewDeadline,
          dependsOnTaskId: modificationTask.id,
        },
      });

      const updatedChangeRequest = await tx.clientChangeRequest.update({
        where: { id: changeRequest.id },
        data: {
          status: 'ACCEPTED',
          accountManagerNotes: input.notes ?? null,
          forwardedAt: now,
          relatedTaskId: modificationTask.id,
        },
        select: changeRequestSelect,
      });

      const updatedContentItem = await tx.contentItem.update({
        where: { id: changeRequest.contentItemId },
        data: {
          clientReviewStatus: 'IN_MODIFICATION',
          clientApprovedAt: null,
        },
        select: {
          id: true,
          title: true,
          contentPlanId: true,
          clientReviewStatus: true,
          clientApprovedAt: true,
        },
      });

      await NotificationsService.create(
        {
          recipientId: assignee.id,
          type: 'TASK_MODIFICATION_ASSIGNED',
          title: 'Client Modification Task Assigned',
          message: `A client-requested modification for "${contentItem?.title ?? 'content'}" has been assigned to you.`,
          data: {
            changeRequestId: changeRequest.id,
            taskId: modificationTask.id,
            reviewTaskId: reviewTask.id,
            contentItemId: changeRequest.contentItemId,
            clientNotes: changeRequest.clientNotes,
            accountManagerNotes: input.notes ?? null,
          },
        },
        tx,
      );

      return {
        changeRequest: updatedChangeRequest,
        modificationTask,
        reviewTask,
        contentItem: updatedContentItem,
      };
    });
  },
};
