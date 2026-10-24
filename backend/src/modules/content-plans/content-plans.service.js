
import { ContentPlansModel } from './content-plans.model.js';
import { ApiError } from '../../utils/ApiError.js';

const CONTENT_PLAN_STATUSES = new Set([
  'DRAFT',
  'IN_REVIEW',
  'NEEDS_CHANGES',
  'APPROVED',
]);

function parseId(value, label = 'Id') {
  const id = Number(value);

  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new ApiError(400, `${label} must be a positive integer`);
  }

  return id;
}

async function getPlanOrThrow(value) {
  const id = parseId(value, 'Content plan id');
  const plan = await ContentPlansModel.findById(id);

  if (!plan) throw new ApiError(404, 'Content plan not found');

  return plan;
}

async function validateBrand(brandId) {
  const brand = await ContentPlansModel.findBrandById(brandId);

  if (!brand) throw new ApiError(400, 'Selected brand does not exist');
}

async function validatePlatformAccount(platformAccountId, brandId) {
  const account = await ContentPlansModel.findPlatformAccountById(
    platformAccountId,
  );

  if (!account) {
    throw new ApiError(400, 'Selected platform account does not exist');
  }

  if (account.brandId !== brandId) {
    throw new ApiError(
      400,
      'Platform account must belong to the selected brand',
    );
  }

  if (!account.isActive) {
    throw new ApiError(400, 'Selected platform account is inactive');
  }
}

function mapPrismaError(error) {
  if (error?.code === 'P2003') {
    throw new ApiError(400, 'Invalid brand, platform account, or user reference');
  }

  if (error?.code === 'P2025') {
    throw new ApiError(404, 'Content plan not found');
  }

  throw error;
}

export const ContentPlansService = {
  async create(input, userId) {
    const brandId = parseId(input.brandId, 'Brand id');
    const platformAccountId = parseId(
      input.platformAccountId,
      'Platform account id',
    );
    const createdBy = parseId(userId, 'User id');

    await validateBrand(brandId);
    await validatePlatformAccount(platformAccountId, brandId);

    try {
      return await ContentPlansModel.create({
        ...input,
        brandId,
        platformAccountId,
        createdBy,
        monthlyGoals: input.monthlyGoals ?? null,
        notes: input.notes ?? null,
      });
    } catch (error) {
      mapPrismaError(error);
    }
  },

  async list(filters) {
    return ContentPlansModel.list(filters);
  },

  async getById(value) {
    return getPlanOrThrow(value);
  },

  async update(value, input) {
    const plan = await getPlanOrThrow(value);

    const brandId =
      input.brandId !== undefined
        ? parseId(input.brandId, 'Brand id')
        : plan.brandId;

    const platformAccountId =
      input.platformAccountId !== undefined
        ? parseId(input.platformAccountId, 'Platform account id')
        : plan.platformAccountId;

    if (input.brandId !== undefined) {
      await validateBrand(brandId);
    }

    if (
      input.brandId !== undefined ||
      input.platformAccountId !== undefined
    ) {
      await validatePlatformAccount(platformAccountId, brandId);
    }

    const data = { ...input };

    if (input.brandId !== undefined) data.brandId = brandId;
    if (input.platformAccountId !== undefined) {
      data.platformAccountId = platformAccountId;
    }

    try {
      return await ContentPlansModel.update(plan.id, data);
    } catch (error) {
      mapPrismaError(error);
    }
  },

  async updateStatus(value, newStatus) {
    const plan = await getPlanOrThrow(value);

    if (!CONTENT_PLAN_STATUSES.has(newStatus)) {
      throw new ApiError(400, 'Invalid content plan status');
    }

    try {
      return await ContentPlansModel.update(plan.id, {
        status: newStatus,
      });
    } catch (error) {
      mapPrismaError(error);
    }
  },

  async remove(value) {
    const plan = await getPlanOrThrow(value);

    try {
      return await ContentPlansModel.remove(plan.id);
    } catch (error) {
      mapPrismaError(error);
    }
  },
};
