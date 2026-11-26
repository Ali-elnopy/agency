import { ContentItemsModel } from './content-items.model.js';
import { prisma } from '../../config/prisma.js';
import { ApiError } from '../../utils/ApiError.js';
import { getRoleName } from '../../utils/roles.js';
import { NotificationsService } from '../notifications/notifications.service.js';

const MANAGER_ROLES = new Set(['ADMIN', 'ACCOUNT_MANAGER']);

const MEANINGFUL_CONTENT_FIELDS = [
  'title',
  'type',
  'scheduledDate',
  'reference',
  'toneOfVoice',
  'caption',
  'notes',
];

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

function isClient(user) {
  return getRoleName(user) === 'CLIENT';
}

function assertCreatorTeamAccess(plan, user) {
  const userId = parseId(user?.id, 'User id');
  const isMember = plan.brand?.team?.memberships?.some(
    (membership) => membership.userId === userId,
  );

  if (!isMember) {
    throw new ApiError(
      403,
      'You can only manage content items for brands assigned to your team',
    );
  }
}

function assertCanReadContentItem(item, user) {
  const roleName = getRoleName(user);
  const userId = parseId(user?.id, 'User id');

  if (roleName === 'ADMIN') {
    return;
  }

  const brand = item.contentPlan?.brand;

  if (roleName === 'CLIENT') {
    if (!brand || brand.clientId !== userId) {
      throw new ApiError(
        403,
        'You can only access content items belonging to your own brand',
      );
    }
    return;
  }

  if (roleName === 'ACCOUNT_MANAGER') {
    if (!brand || brand.accountManagerId !== userId) {
      throw new ApiError(
        403,
        'You can only access content items for your assigned brands',
      );
    }
    return;
  }

  const isCreator = item.createdBy === userId;
  const isTeamMember = brand?.team?.memberships?.some(
    (membership) => membership.userId === userId,
  );
  const isTaskAssignee = item.tasks?.some(
    (task) => task.assignedTo === userId,
  );

  if (!isCreator && !isTeamMember && !isTaskAssignee) {
    throw new ApiError(
      403,
      'You are not authorized to access this content item',
    );
  }
}

function detectChangedContentFields(existing, nextData) {
  const changed = [];

  for (const field of MEANINGFUL_CONTENT_FIELDS) {
    if (nextData[field] === undefined) {
      continue;
    }

    if (field === 'scheduledDate') {
      const prevTime = existing.scheduledDate
        ? new Date(existing.scheduledDate).getTime()
        : null;
      const nextTime = nextData.scheduledDate
        ? new Date(nextData.scheduledDate).getTime()
        : null;

      if (prevTime !== nextTime) {
        changed.push(field);
      }
      continue;
    }

    const prevVal = existing[field] ?? null;
    const nextVal = nextData[field] ?? null;

    if (prevVal !== nextVal) {
      changed.push(field);
    }
  }

  return changed;
}

async function getContentItemOrThrow(value, user) {
  const id = parseId(value, 'Content item id');

  const clientId = isClient(user)
    ? parseId(user.id, 'User id')
    : undefined;

  const item = await ContentItemsModel.findById(
    id,
    clientId,
  );

  if (!item) {
    throw new ApiError(404, 'Content item not found');
  }

  return item;
}

async function getContentItemWithAccessOrThrow(value) {
  const id = parseId(value, 'Content item id');
  const item = await ContentItemsModel.findByIdWithAccess(id);

  if (!item) {
    throw new ApiError(404, 'Content item not found');
  }

  return item;
}

async function validateContentPlan(contentPlanId, user) {
  const plan = await ContentItemsModel.findContentPlanById(
    contentPlanId,
  );

  if (!plan) {
    throw new ApiError(
      400,
      'Selected content plan does not exist',
    );
  }

  if (user) {
    assertCreatorTeamAccess(plan, user);
  }

  return plan;
}

async function validateCampaign(
  campaignId,
  contentPlanId,
  scheduledDate,
) {
  const campaign = await ContentItemsModel.findCampaignById(
    campaignId,
  );

  if (!campaign) {
    throw new ApiError(
      400,
      'Selected campaign does not exist',
    );
  }

  if (campaign.contentPlanId !== contentPlanId) {
    throw new ApiError(
      400,
      'Campaign must belong to the selected content plan',
    );
  }

  if (
    scheduledDate < campaign.startDate ||
    scheduledDate > campaign.endDate
  ) {
    throw new ApiError(
      400,
      'Content item date must be within the campaign date range',
    );
  }
}

function mapPrismaError(error) {
  if (error?.code === 'P2003') {
    throw new ApiError(
      400,
      'Invalid content plan, campaign, or user reference',
    );
  }

  if (error?.code === 'P2025') {
    throw new ApiError(
      404,
      'Content item not found',
    );
  }

  throw error;
}

function formatPublishingResponse(item) {
  return {
    id: item.id,
    title: item.title,
    scheduledDate: item.scheduledDate,
    clientReviewStatus: item.clientReviewStatus,
    clientApprovedAt: item.clientApprovedAt ?? null,
    publishStatus: item.publishStatus ?? 'NOT_PUBLISHED',
    publishedAt: item.publishedAt ?? null,
    publishUrl: item.publishUrl ?? null,
    publishNotes: item.publishNotes ?? null,
    publishedBy: item.publishedBy ?? null,
    publisher: item.publisher ?? null,
  };
}

export const ContentItemsService = {
  async create(input, user) {
    const contentPlanId = parseId(
      input.contentPlanId,
      'Content plan id',
    );

    const createdBy = parseId(
      typeof user === 'object' ? user?.id : user,
      'User id',
    );

    const scheduledDate = input.scheduledDate;

    await validateContentPlan(
      contentPlanId,
      typeof user === 'object' ? user : null,
    );

    if (input.campaignId !== undefined && input.campaignId !== null) {
      const campaignId = parseId(
        input.campaignId,
        'Campaign id',
      );

      await validateCampaign(
        campaignId,
        contentPlanId,
        scheduledDate,
      );
    }

    try {
      return await ContentItemsModel.create({
        ...input,
        contentPlanId,
        campaignId: input.campaignId ?? null,
        createdBy,
        reference: input.reference ?? null,
        toneOfVoice: input.toneOfVoice ?? null,
        caption: input.caption ?? null,
        notes: input.notes ?? null,
      });
    } catch (error) {
      mapPrismaError(error);
    }
  },

  async list(filters, user) {
    const parsedFilters = {
      ...filters,
    };

    if (parsedFilters.contentPlanId !== undefined) {
      parsedFilters.contentPlanId = parseId(
        parsedFilters.contentPlanId,
        'Content plan id',
      );
    }

    if (parsedFilters.campaignId !== undefined) {
      parsedFilters.campaignId = parseId(
        parsedFilters.campaignId,
        'Campaign id',
      );
    }

    if (isClient(user)) {
      parsedFilters.clientId = parseId(
        user.id,
        'User id',
      );
    }

    return ContentItemsModel.list(parsedFilters);
  },

  async getById(value, user) {
    return getContentItemOrThrow(value, user);
  },

  async update(value, input, user) {
    const item = await getContentItemOrThrow(value);

    if (user) {
      await validateContentPlan(item.contentPlanId, user);
    }

    const contentPlanId =
      input.contentPlanId !== undefined
        ? parseId(
          input.contentPlanId,
          'Content plan id',
        )
        : item.contentPlanId;

    const scheduledDate =
      input.scheduledDate ?? item.scheduledDate;

    if (contentPlanId !== item.contentPlanId || !user) {
      await validateContentPlan(contentPlanId, user);
    }

    const campaignId =
      input.campaignId !== undefined
        ? input.campaignId
        : item.campaignId;

    if (campaignId !== null && campaignId !== undefined) {
      const parsedCampaignId = parseId(
        campaignId,
        'Campaign id',
      );

      await validateCampaign(
        parsedCampaignId,
        contentPlanId,
        scheduledDate,
      );
    }

    const { changeReason, ...restInput } = input;

    const data = {
      ...restInput,
      contentPlanId,
    };

    if (input.campaignId !== undefined) {
      data.campaignId =
        input.campaignId === null
          ? null
          : parseId(
            input.campaignId,
            'Campaign id',
          );
    }

    const changedFields = detectChangedContentFields(item, data);

    try {
      const updated = await ContentItemsModel.update(
        item.id,
        data,
      );

      if (
        changedFields.length > 0 &&
        typeof ContentItemsModel.createRevisionSnapshot === 'function'
      ) {
        const actorId =
          typeof user === 'object' ? user?.id : (user ?? item.createdBy);

        await ContentItemsModel.createRevisionSnapshot({
          contentItem: updated,
          createdBy: actorId,
          source: 'CONTENT_UPDATE',
          changeReason:
            changeReason ?? `Updated ${changedFields.join(', ')}`,
        });
      }

      return updated;
    } catch (error) {
      mapPrismaError(error);
    }
  },

  async remove(value, user) {
    const item = await getContentItemOrThrow(value);

    if (user) {
      await validateContentPlan(item.contentPlanId, user);
    }

    try {
      return await ContentItemsModel.remove(item.id);
    } catch (error) {
      mapPrismaError(error);
    }
  },

  // --- Feature #1: Revision History ---

  async listRevisions(contentItemIdValue, query, user) {
    const item = await getContentItemWithAccessOrThrow(contentItemIdValue);
    assertCanReadContentItem(item, user);

    const order = query?.order === 'asc' ? 'asc' : 'desc';
    const revisions = await ContentItemsModel.listRevisions(item.id, order);

    return {
      contentItemId: item.id,
      revisions,
      total: revisions.length,
    };
  },

  async getRevisionById(contentItemIdValue, revisionIdValue, user) {
    const item = await getContentItemWithAccessOrThrow(contentItemIdValue);
    assertCanReadContentItem(item, user);

    const revisionId = parseId(revisionIdValue, 'Revision id');
    const revision = await ContentItemsModel.findRevisionById(item.id, revisionId);

    if (!revision) {
      throw new ApiError(404, 'Content item revision not found');
    }

    return revision;
  },

  // --- Feature #2: Publishing Tracking ---

  async getPublishing(contentItemIdValue, user) {
    const item = await getContentItemWithAccessOrThrow(contentItemIdValue);
    assertCanReadContentItem(item, user);

    return formatPublishingResponse(item);
  },

  async updatePublishing(contentItemIdValue, input, user) {
    const roleName = getRoleName(user);

    if (!MANAGER_ROLES.has(roleName)) {
      throw new ApiError(
        403,
        'Only admins and account managers can update publishing status',
      );
    }

    const item = await getContentItemWithAccessOrThrow(contentItemIdValue);
    const brand = item.contentPlan?.brand;

    if (roleName === 'ACCOUNT_MANAGER') {
      if (!brand || brand.accountManagerId !== user.id) {
        throw new ApiError(
          403,
          'You can only manage publishing for your assigned brands',
        );
      }
    }

    const nextStatus = input.publishStatus;
    const currentStatus = item.publishStatus ?? 'NOT_PUBLISHED';

    if (nextStatus !== 'NOT_PUBLISHED' && item.clientReviewStatus !== 'APPROVED') {
      throw new ApiError(
        400,
        `Content item must be approved by the client before publishing (current review status: ${item.clientReviewStatus})`,
      );
    }

    if (currentStatus === 'PUBLISHED' && nextStatus !== 'PUBLISHED') {
      throw new ApiError(
        400,
        `Published content cannot be reverted to ${nextStatus}`,
      );
    }

    const effectivePublishUrl =
      input.publishUrl !== undefined ? input.publishUrl : item.publishUrl;

    if (nextStatus === 'PUBLISHED' && !effectivePublishUrl) {
      throw new ApiError(
        400,
        'Publish URL is required when marking content as published',
      );
    }

    const updateData = {
      publishStatus: nextStatus,
      publishUrl: effectivePublishUrl ?? null,
      ...(input.publishNotes !== undefined
        ? { publishNotes: input.publishNotes }
        : {}),
    };

    if (nextStatus === 'PUBLISHED') {
      updateData.publishedAt = input.publishedAt ?? item.publishedAt ?? new Date();
      updateData.publishedBy = user.id;
    } else {
      updateData.publishedAt = null;
      if (nextStatus === 'NOT_PUBLISHED') {
        updateData.publishedBy = null;
      }
    }

    const isNewlyPublished =
      nextStatus === 'PUBLISHED' && currentStatus !== 'PUBLISHED';

    try {
      return await prisma.$transaction(async (tx) => {
        const updated = await ContentItemsModel.updatePublishing(
          item.id,
          updateData,
          tx,
        );

        if (isNewlyPublished && brand?.clientId) {
          await NotificationsService.create(
            {
              recipientId: brand.clientId,
              type: 'CONTENT_PUBLISHED',
              title: 'Content Published',
              message: `"${item.title}" has been published.`,
              data: {
                contentItemId: item.id,
                brandId: brand.id,
                publishUrl: updated.publishUrl ?? null,
                publishedAt: updated.publishedAt ?? null,
              },
            },
            tx,
          );
        }

        return formatPublishingResponse(updated);
      });
    } catch (error) {
      mapPrismaError(error);
    }
  },

  // --- Feature #3: Calendar API ---

  async getCalendar(query, user) {
    const roleName = getRoleName(user);
    const userId = parseId(user?.id, 'User id');

    const andConditions = [];

    if (roleName === 'ACCOUNT_MANAGER') {
      andConditions.push({
        contentPlan: {
          brand: {
            accountManagerId: userId,
          },
        },
      });
    } else if (roleName === 'CLIENT') {
      andConditions.push({
        contentPlan: {
          brand: {
            clientId: userId,
          },
        },
      });
    } else if (roleName !== 'ADMIN') {
      andConditions.push({
        OR: [
          { createdBy: userId },
          {
            contentPlan: {
              brand: {
                team: {
                  memberships: {
                    some: { userId },
                  },
                },
              },
            },
          },
          {
            tasks: {
              some: { assignedTo: userId },
            },
          },
        ],
      });
    }

    if (query.from || query.to) {
      const scheduledDateFilter = {};
      if (query.from) {
        scheduledDateFilter.gte = query.from;
      }
      if (query.to) {
        scheduledDateFilter.lte = query.to;
      }
      andConditions.push({ scheduledDate: scheduledDateFilter });
    }

    if (query.brandId !== undefined) {
      andConditions.push({
        contentPlan: {
          brandId: query.brandId,
        },
      });
    }

    if (query.platformAccountId !== undefined) {
      andConditions.push({
        contentPlan: {
          platformAccountId: query.platformAccountId,
        },
      });
    }

    if (query.campaignId !== undefined) {
      andConditions.push({ campaignId: query.campaignId });
    }

    if (query.contentType !== undefined) {
      andConditions.push({ type: query.contentType });
    }

    if (query.clientReviewStatus !== undefined) {
      andConditions.push({ clientReviewStatus: query.clientReviewStatus });
    }

    if (query.publishStatus !== undefined) {
      andConditions.push({ publishStatus: query.publishStatus });
    }

    const where = andConditions.length > 0 ? { AND: andConditions } : {};
    const rows = await ContentItemsModel.listCalendar(where);
    const hideInternalTaskStatus = roleName === 'CLIENT';

    const items = rows.map((row) => ({
      id: row.id,
      title: row.title,
      contentType: row.type,
      scheduledDate: row.scheduledDate,
      clientReviewStatus: row.clientReviewStatus,
      publishStatus: row.publishStatus ?? 'NOT_PUBLISHED',
      publishedAt: row.publishedAt ?? null,
      publishUrl: row.publishUrl ?? null,
      platform: row.contentPlan?.platformAccount
        ? {
            id: row.contentPlan.platformAccount.id,
            platform: row.contentPlan.platformAccount.platform,
            accountName: row.contentPlan.platformAccount.accountName,
          }
        : null,
      brand: row.contentPlan?.brand
        ? {
            id: row.contentPlan.brand.id,
            name: row.contentPlan.brand.name,
          }
        : null,
      campaign: row.campaign
        ? {
            id: row.campaign.id,
            name: row.campaign.name,
          }
        : null,
      taskStatus: hideInternalTaskStatus
        ? null
        : (row.tasks?.[0]?.status ?? null),
    }));

    return {
      items,
      total: items.length,
      range: {
        from: query.from ? query.from.toISOString() : null,
        to: query.to ? query.to.toISOString() : null,
      },
    };
  },
};
