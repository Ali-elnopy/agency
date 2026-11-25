import { CampaignsModel } from './campaigns.model.js';
import { ApiError } from '../../utils/ApiError.js';
import { getRoleName, isContentCreatorUser } from '../../utils/roles.js';

function parseId(value, label = 'Id') {
  const id = Number(value);

  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new ApiError(400, `${label} must be a positive integer`);
  }

  return id;
}

function getBrandAccessWhere(user) {
  const role = getRoleName(user);

  if (role === 'ADMIN') {
    return {};
  }

  if (role === 'ACCOUNT_MANAGER') {
    return {
      accountManagerId: user.id,
    };
  }

  if (role === 'CLIENT') {
    return {
      clientId: user.id,
    };
  }

  if (isContentCreatorUser(user) || role === 'CREATIVE' || role === 'EMPLOYEE') {
    return {
      team: {
        is: {
          memberships: {
            some: {
              userId: user.id,
            },
          },
        },
      },
    };
  }

  throw new ApiError(403, 'You are not authorized to access campaigns');
}

function assertCreatorTeamAccess(contentPlan, user) {
  const userId = parseId(user?.id, 'User id');
  const isMember = contentPlan.brand?.team?.memberships?.some(
    (membership) => membership.userId === userId,
  );

  if (!isMember) {
    throw new ApiError(
      403,
      'You can only manage campaigns for brands assigned to your team',
    );
  }
}

async function getCampaignOrThrow(value, user) {
  const id = parseId(value, 'Campaign id');
  const accessWhere = user ? getBrandAccessWhere(user) : undefined;

  const campaign = await CampaignsModel.findById(id, accessWhere);

  if (!campaign) {
    throw new ApiError(404, 'Campaign not found');
  }

  return campaign;
}

async function validateContentPlan(contentPlanId, user) {
  const contentPlan = await CampaignsModel.findContentPlanById(
    contentPlanId,
  );

  if (!contentPlan) {
    throw new ApiError(400, 'Selected content plan does not exist');
  }

  if (user) {
    assertCreatorTeamAccess(contentPlan, user);
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
  async create(input, user) {
    const contentPlanId = parseId(
      input.contentPlanId,
      'Content plan id',
    );

    const createdBy = parseId(user?.id, 'User id');

    await validateContentPlan(contentPlanId, user);

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

  async list(filters, user) {
    const parsedFilters = { ...filters };

    if (parsedFilters.contentPlanId !== undefined) {
      parsedFilters.contentPlanId = parseId(
        parsedFilters.contentPlanId,
        'Content plan id',
      );
    }

    parsedFilters.accessWhere = getBrandAccessWhere(user);

    return CampaignsModel.list(parsedFilters);
  },

  async getById(value, user) {
    return getCampaignOrThrow(value, user);
  },

  async update(value, input, user) {
    const campaign = await getCampaignOrThrow(value, user);

    await validateContentPlan(campaign.contentPlanId, user);

    const data = { ...input };

    if (input.contentPlanId !== undefined) {
      const contentPlanId = parseId(
        input.contentPlanId,
        'Content plan id',
      );

      await validateContentPlan(contentPlanId, user);

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

  async remove(value, user) {
    const campaign = await getCampaignOrThrow(value, user);

    await validateContentPlan(campaign.contentPlanId, user);

    try {
      return await CampaignsModel.remove(campaign.id);
    } catch (error) {
      mapPrismaError(error);
    }
  },
};
