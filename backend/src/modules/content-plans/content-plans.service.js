
import { ContentPlansModel } from './content-plans.model.js';
import { ApiError } from '../../utils/ApiError.js';
import { brandScopeWhere, contentPlanScopeWhere, isContentCreator } from '../../middlewares/authorization.js';

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

async function getPlanOrThrow(value, user) {
  const id = parseId(value, 'Content plan id');
  const plan = await ContentPlansModel.findById(id, contentPlanScopeWhere(user));

  if (!plan) throw new ApiError(404, 'Content plan not found');

  return plan;
}

async function validateBrand(brandId, user) {
  const brand = await ContentPlansModel.findBrandById(brandId, brandScopeWhere(user));

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

async function validateAssignee(assignedToId, brandId) {
  if (assignedToId == null) return null;
  const brand = await ContentPlansModel.findBrandAssignmentInfo(brandId);
  if (!brand) throw new ApiError(400, 'Selected brand does not exist');
  const creator = await ContentPlansModel.findContentCreatorById(assignedToId, brand.teamId);
  if (!creator) {
    throw new ApiError(400, 'Assignee must be an active Content Creator in the brand team');
  }
  return creator.id;
}

export const ContentPlansService = {
  async create(input, user) {
    const brandId = parseId(input.brandId, 'Brand id');
    const platformAccountId = parseId(
      input.platformAccountId,
      'Platform account id',
    );
    const createdBy = parseId(user.id, 'User id');

    await validateBrand(brandId, user);
    await validatePlatformAccount(platformAccountId, brandId);
    const assignedToId = await validateAssignee(input.assignedToId, brandId);

    try {
      return await ContentPlansModel.create({
        ...input,
        brandId,
        platformAccountId,
        createdBy,
        assignedToId,
        monthlyGoals: input.monthlyGoals ?? null,
        notes: input.notes ?? null,
      });
    } catch (error) {
      mapPrismaError(error);
    }
  },

  async list(filters, user) {
    return ContentPlansModel.list({ ...filters, accessWhere: contentPlanScopeWhere(user) });
  },

  async getById(value, user) {
    return getPlanOrThrow(value, user);
  },

  async update(value, input, user) {
    const plan = await getPlanOrThrow(value, user);

    if (isContentCreator(user)) {
      if (plan.status === 'APPROVED') {
        throw new ApiError(403, 'Approved content plans cannot be edited by Content Creators');
      }
      const allowed = new Set(['title', 'monthlyGoals', 'notes']);
      if (Object.keys(input).some((key) => !allowed.has(key))) {
        throw new ApiError(403, 'Content Creators can only edit the content of plans assigned to them');
      }
    } else if (!['ADMIN', 'ACCOUNT_MANAGER'].includes(user.role?.name)) {
      throw new ApiError(403, 'You do not have permission to edit content plans');
    }

    const brandId =
      input.brandId !== undefined
        ? parseId(input.brandId, 'Brand id')
        : plan.brandId;

    const platformAccountId =
      input.platformAccountId !== undefined
        ? parseId(input.platformAccountId, 'Platform account id')
        : plan.platformAccountId;

    if (input.brandId !== undefined) {
      await validateBrand(brandId, user);
    }

    const data = { ...input };

    if (input.assignedToId !== undefined) {
      data.assignedToId = await validateAssignee(input.assignedToId, brandId);
    } else if (input.brandId !== undefined && plan.assignedToId != null) {
      await validateAssignee(plan.assignedToId, brandId);
    }

    if (
      input.brandId !== undefined ||
      input.platformAccountId !== undefined
    ) {
      await validatePlatformAccount(platformAccountId, brandId);
    }

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

  async updateStatus(value, newStatus, user) {
    const plan = await getPlanOrThrow(value, user);
    if (!['ADMIN', 'ACCOUNT_MANAGER'].includes(user.role?.name) && !isContentCreator(user)) {
      throw new ApiError(403, 'You do not have permission to change this content plan status');
    }
    if (isContentCreator(user) && (newStatus !== 'IN_REVIEW' || plan.status === 'APPROVED')) {
      throw new ApiError(403, 'Content Creators can only submit unapproved plans for review');
    }

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

  async remove(value, user) {
    if (user.role?.name !== 'ADMIN') throw new ApiError(403, 'Only administrators can delete content plans');
    const plan = await getPlanOrThrow(value, user);

    try {
      return await ContentPlansModel.remove(plan.id);
    } catch (error) {
      mapPrismaError(error);
    }
  },
};
