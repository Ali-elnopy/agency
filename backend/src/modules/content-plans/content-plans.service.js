import { ContentPlansModel } from './content-plans.model.js';
import { ApiError } from '../../utils/ApiError.js';

const CONTENT_PLAN_STATUSES = new Set([
  'DRAFT',
  'IN_REVIEW',
  'NEEDS_CHANGES',
  'APPROVED',
]);

const MANAGEMENT_ROLES = new Set([
  'ADMIN',
  'ACCOUNT_MANAGER',
]);

function parseId(value, label = 'Id') {
  const id = Number(value);

  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new ApiError(400, `${label} must be a positive integer`);
  }

  return id;
}

/**
 * Determines which brands the authenticated user can access.
 */
function getBrandAccessWhere(user) {
  const role = user?.role?.name;

  // Admin can access all brands.
  if (role === 'ADMIN') {
    return {};
  }

  // Account Manager can access assigned brands only.
  if (role === 'ACCOUNT_MANAGER') {
    return {
      accountManagerId: user.id,
    };
  }

  // Content Creator can access brands assigned to their team.
  if (
    role === 'EMPLOYEE' &&
    user?.jobTitle?.name === 'Content Creator'
  ) {
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

  // Client can access their own brand only.
  if (role === 'CLIENT') {
    return {
      clientId: user.id,
    };
  }

  throw new ApiError(
    403,
    'You are not authorized to access content plans',
  );
}

/**
 * Returns the plan only if the current user
 * has access to the plan's brand.
 */
async function getPlanOrThrow(value, user) {
  const id = parseId(value, 'Content plan id');

  const accessWhere = getBrandAccessWhere(user);

  const plan =
    user?.role?.name === 'ADMIN'
      ? await ContentPlansModel.findById(id)
      : await ContentPlansModel.findAccessibleById(
          id,
          accessWhere,
        );

  if (!plan) {
    throw new ApiError(404, 'Content plan not found');
  }

  return plan;
}

/**
 * Only Admin and Account Manager can manage
 * all content plans under their allowed brands.
 *
 * Content Creators are allowed only when their team
 * has access to the selected brand.
 */
function ensureCanManageBrand(user, brand) {
  const role = user?.role?.name;

  if (role === 'ADMIN') {
    return;
  }

  if (
    role === 'ACCOUNT_MANAGER' &&
    brand.accountManagerId === user.id
  ) {
    return;
  }

  if (
    role === 'EMPLOYEE' &&
    user?.jobTitle?.name === 'Content Creator' &&
    brand.team?.memberships?.some(
      (membership) => membership.userId === user.id,
    )
  ) {
    return;
  }

  throw new ApiError(
    403,
    'You are not authorized to manage this content plan',
  );
}

async function validateBrand(brandId, user) {
  const brand = await ContentPlansModel.findAccessibleBrandById(
    brandId,
    getBrandAccessWhere(user),
  );

  if (!brand) {
    throw new ApiError(404, 'Brand not found');
  }

  return brand;
}

async function validatePlatformAccount(
  platformAccountId,
  brandId,
) {
  const account =
    await ContentPlansModel.findPlatformAccountById(
      platformAccountId,
    );

  if (!account) {
    throw new ApiError(
      400,
      'Selected platform account does not exist',
    );
  }

  if (account.brandId !== brandId) {
    throw new ApiError(
      400,
      'Platform account must belong to the selected brand',
    );
  }

  if (!account.isActive) {
    throw new ApiError(
      400,
      'Selected platform account is inactive',
    );
  }
}

function mapPrismaError(error) {
  if (error?.code === 'P2002') {
    throw new ApiError(
      409,
      'A content plan already exists for this platform account and month',
    );
  }

  if (error?.code === 'P2003') {
    throw new ApiError(
      400,
      'Invalid brand, platform account, or user reference',
    );
  }

  if (error?.code === 'P2025') {
    throw new ApiError(
      404,
      'Content plan not found',
    );
  }

  throw error;
}

export const ContentPlansService = {
  async create(input, user) {
    const brandId = parseId(
      input.brandId,
      'Brand id',
    );

    const platformAccountId = parseId(
      input.platformAccountId,
      'Platform account id',
    );

    const createdBy = parseId(
      user.id,
      'User id',
    );

    const brand = await validateBrand(
      brandId,
      user,
    );

    ensureCanManageBrand(user, brand);

    await validatePlatformAccount(
      platformAccountId,
      brandId,
    );

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

  async list(filters, user) {
    const accessWhere =
      getBrandAccessWhere(user);

    return ContentPlansModel.list({
      ...filters,
      accessWhere,
    });
  },

  async getById(value, user) {
    return getPlanOrThrow(
      value,
      user,
    );
  },

  async update(value, input, user) {
    const plan = await getPlanOrThrow(
      value,
      user,
    );

    const brand = await validateBrand(
      plan.brandId,
      user,
    );

    ensureCanManageBrand(
      user,
      brand,
    );

    const brandId =
      input.brandId !== undefined
        ? parseId(
            input.brandId,
            'Brand id',
          )
        : plan.brandId;

    const platformAccountId =
      input.platformAccountId !== undefined
        ? parseId(
            input.platformAccountId,
            'Platform account id',
          )
        : plan.platformAccountId;

    if (
      input.brandId !== undefined ||
      input.platformAccountId !== undefined
    ) {
      const targetBrand =
        await validateBrand(
          brandId,
          user,
        );

      ensureCanManageBrand(
        user,
        targetBrand,
      );

      await validatePlatformAccount(
        platformAccountId,
        brandId,
      );
    }

    const data = {
      ...input,
    };

    if (input.brandId !== undefined) {
      data.brandId = brandId;
    }

    if (
      input.platformAccountId !== undefined
    ) {
      data.platformAccountId =
        platformAccountId;
    }

    try {
      return await ContentPlansModel.update(
        plan.id,
        data,
      );
    } catch (error) {
      mapPrismaError(error);
    }
  },

  async updateStatus(
    value,
    newStatus,
    user,
  ) {
    const plan = await getPlanOrThrow(
      value,
      user,
    );

    const brand = await validateBrand(
      plan.brandId,
      user,
    );

    ensureCanManageBrand(
      user,
      brand,
    );

    if (
      !CONTENT_PLAN_STATUSES.has(
        newStatus,
      )
    ) {
      throw new ApiError(
        400,
        'Invalid content plan status',
      );
    }

    const role =
      user?.role?.name;

    // Content Creator can submit a plan
    // for review.
    if (
      !MANAGEMENT_ROLES.has(role) &&
      newStatus === 'IN_REVIEW'
    ) {
      const canSubmit =
        (
          plan.status === 'DRAFT' ||
          plan.status === 'NEEDS_CHANGES'
        );

      if (!canSubmit) {
        throw new ApiError(
          400,
          `Cannot change content plan status from ${plan.status} to ${newStatus}`,
        );
      }
    }

    // Admin / Account Manager can approve
    // or request changes.
    if (
      MANAGEMENT_ROLES.has(role)
    ) {
      const allowedTransitions = {
        DRAFT: [
          'IN_REVIEW',
        ],
        IN_REVIEW: [
          'APPROVED',
          'NEEDS_CHANGES',
        ],
        NEEDS_CHANGES: [
          'IN_REVIEW',
        ],
        APPROVED: [],
      };

      if (
        !allowedTransitions[
          plan.status
        ]?.includes(newStatus)
      ) {
        throw new ApiError(
          400,
          `Cannot change content plan status from ${plan.status} to ${newStatus}`,
        );
      }
    }

    try {
      return await ContentPlansModel.update(
        plan.id,
        {
          status: newStatus,
        },
      );
    } catch (error) {
      mapPrismaError(error);
    }
  },

  async remove(value, user) {
    const plan = await getPlanOrThrow(
      value,
      user,
    );

    const brand = await validateBrand(
      plan.brandId,
      user,
    );

    ensureCanManageBrand(
      user,
      brand,
    );

    try {
      return await ContentPlansModel.remove(
        plan.id,
      );
    } catch (error) {
      mapPrismaError(error);
    }
  },
};