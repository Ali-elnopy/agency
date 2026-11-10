import { ContentItemsModel } from './content-items.model.js';
import { ApiError } from '../../utils/ApiError.js';

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

async function getContentItemOrThrow(value) {
  const id = parseId(value, 'Content item id');

  const item = await ContentItemsModel.findById(id);

  if (!item) {
    throw new ApiError(404, 'Content item not found');
  }

  return item;
}

async function validateContentPlan(contentPlanId) {
  const plan = await ContentItemsModel.findContentPlanById(
    contentPlanId,
  );

  if (!plan) {
    throw new ApiError(
      400,
      'Selected content plan does not exist',
    );
  }
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

export const ContentItemsService = {
  async create(input, userId) {
    const contentPlanId = parseId(
      input.contentPlanId,
      'Content plan id',
    );

    const createdBy = parseId(
      userId,
      'User id',
    );

    const scheduledDate = input.scheduledDate;

    await validateContentPlan(contentPlanId);

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
        campaignId:
          input.campaignId ?? null,
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

  async list(filters) {
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

    return ContentItemsModel.list(parsedFilters);
  },

  async getById(value) {
    return getContentItemOrThrow(value);
  },

  async update(value, input) {
    const item = await getContentItemOrThrow(value);

    const contentPlanId =
      input.contentPlanId !== undefined
        ? parseId(
            input.contentPlanId,
            'Content plan id',
          )
        : item.contentPlanId;

    const scheduledDate =
      input.scheduledDate ??
      item.scheduledDate;

    await validateContentPlan(contentPlanId);

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

    const data = {
      ...input,
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

    try {
      return await ContentItemsModel.update(
        item.id,
        data,
      );
    } catch (error) {
      mapPrismaError(error);
    }
  },

  async remove(value) {
    const item = await getContentItemOrThrow(value);

    try {
      return await ContentItemsModel.remove(item.id);
    } catch (error) {
      mapPrismaError(error);
    }
  },
};