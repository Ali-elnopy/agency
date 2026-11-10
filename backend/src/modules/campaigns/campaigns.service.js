import { CampaignsModel } from './campaigns.model.js';
import { ApiError } from '../../utils/ApiError.js';

function parseId(value, label = 'Id') {
  const id = Number(value);

  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new ApiError(400, `${label} must be a positive integer`);
  }

  return id;
}

async function getCampaignOrThrow(value) {
  const id = parseId(value, 'Campaign id');

  const campaign = await CampaignsModel.findById(id);

  if (!campaign) {
    throw new ApiError(404, 'Campaign not found');
  }

  return campaign;
}

async function validateContentPlan(contentPlanId) {
  const contentPlan = await CampaignsModel.findContentPlanById(
    contentPlanId,
  );

  if (!contentPlan) {
    throw new ApiError(400, 'Selected content plan does not exist');
  }

  return contentPlan;
}

function mapPrismaError(error) {
  if (error?.code === 'P2003') {
    throw new ApiError(400, 'Invalid content plan or user reference');
  }

  if (error?.code === 'P2025') {
    throw new ApiError(404, 'Campaign not found');
  }

  throw error;
}

export const CampaignsService = {
  async create(input, userId) {
    const contentPlanId = parseId(
      input.contentPlanId,
      'Content plan id',
    );

    const createdBy = parseId(userId, 'User id');

    await validateContentPlan(contentPlanId);

    try {
      return await CampaignsModel.create({
        ...input,
        contentPlanId,
        createdBy,
        objective: input.objective ?? null,
      });
    } catch (error) {
      mapPrismaError(error);
    }
  },

  async list(filters) {
    if (filters.contentPlanId !== undefined) {
      filters.contentPlanId = parseId(
        filters.contentPlanId,
        'Content plan id',
      );
    }

    return CampaignsModel.list(filters);
  },

  async getById(value) {
    return getCampaignOrThrow(value);
  },

  async update(value, input) {
    const campaign = await getCampaignOrThrow(value);

    const data = { ...input };

    if (input.contentPlanId !== undefined) {
      const contentPlanId = parseId(
        input.contentPlanId,
        'Content plan id',
      );

      await validateContentPlan(contentPlanId);

      data.contentPlanId = contentPlanId;
    }

    /*
     * If only one date is updated, validate it against
     * the existing date stored in the campaign.
     */
    const startDate =
      input.startDate !== undefined
        ? input.startDate
        : campaign.startDate;

    const endDate =
      input.endDate !== undefined
        ? input.endDate
        : campaign.endDate;

    if (startDate > endDate) {
      throw new ApiError(
        400,
        'Start date must be before or equal to end date',
      );
    }

    try {
      return await CampaignsModel.update(campaign.id, data);
    } catch (error) {
      mapPrismaError(error);
    }
  },

  async remove(value) {
    const campaign = await getCampaignOrThrow(value);

    try {
      return await CampaignsModel.remove(campaign.id);
    } catch (error) {
      mapPrismaError(error);
    }
  },
};