
import { PlatformAccountsModel } from './platform-accounts.model.js';
import { ApiError } from '../../utils/ApiError.js';
const MANAGEMENT_ROLES = new Set(['ADMIN', 'ACCOUNT_MANAGER']);
function getBrandAccessWhere(user) {
  if (user.role === 'ADMIN') {
    return {};
  }

  if (user.role === 'ACCOUNT_MANAGER') {
    return {
      accountManagerId: user.id,
    };
  }

  if (user.role === 'CLIENT') {
    return {
      clientId: user.id,
    };
  }

  if (
    user.role === 'EMPLOYEE' &&
    user.jobTitle?.name === 'Content Creator'
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

  throw new ApiError(403, 'You are not allowed to access platform accounts');
}
function parseId(value, label = 'Id') {
  const id = Number(value);

  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new ApiError(400, `${label} must be a positive integer`);
  }

  return id;
}

async function getAccountOrThrow(value, user) {
  const id = parseId(value, 'Platform account id');

  const accessWhere = getBrandAccessWhere(user);

  const account = await PlatformAccountsModel.findAccessibleById(
    id,
    accessWhere,
  );

  if (!account) {
    throw new ApiError(404, 'Platform account not found');
  }

  return account;
}

async function validateBrand(brandId) {
  if (brandId === undefined) return;

  const brand = await PlatformAccountsModel.findBrandById(brandId);

  if (!brand) throw new ApiError(400, 'Selected brand does not exist');
}

function mapPrismaError(error) {
  if (error?.code === 'P2003') {
    throw new ApiError(400, 'Invalid brand reference');
  }

  if (error?.code === 'P2025') {
    throw new ApiError(404, 'Platform account not found');
  }

  throw error;
}

export const PlatformAccountsService = {
  async create(input, user) {
  const brandId = parseId(input.brandId, 'Brand id');

  const accessWhere = getBrandAccessWhere(user);

  if (user.role !== 'ADMIN' && user.role !== 'ACCOUNT_MANAGER') {
    throw new ApiError(
      403,
      'Only Admins and Account Managers can create platform accounts',
    );
  }

  const brand = await PlatformAccountsModel.findAccessibleBrandById(
    brandId,
    accessWhere,
  );

  if (!brand) {
    throw new ApiError(404, 'Brand not found');
  }

  try {
    return await PlatformAccountsModel.create({
      ...input,
      brandId,
      accountUrl: input.accountUrl ?? null,
    });
  } catch (error) {
    mapPrismaError(error);
  }
},

  async list(filters, user) {
  const accessWhere = getBrandAccessWhere(user);

  return PlatformAccountsModel.list({
    ...filters,
    accessWhere,
  });
},

  async getById(value, user) {
  return getAccountOrThrow(value, user);
},

  async update(value, input, user) {
  const account = await getAccountOrThrow(value, user);

  if (!MANAGEMENT_ROLES.has(user.role)) {
    throw new ApiError(
      403,
      'Only Admins and Account Managers can update platform accounts',
    );
  }

  const targetBrandId =
    input.brandId !== undefined
      ? parseId(input.brandId, 'Brand id')
      : account.brandId;

  const accessWhere = getBrandAccessWhere(user);

  const brand = await PlatformAccountsModel.findAccessibleBrandById(
    targetBrandId,
    accessWhere,
  );

  if (!brand) {
    throw new ApiError(404, 'Brand not found');
  }

  const updateData = {
    ...input,
    brandId: targetBrandId,
  };

  try {
    return await PlatformAccountsModel.update(
      account.id,
      updateData,
    );
  } catch (error) {
    mapPrismaError(error);
  }
},

  async updateStatus(value, isActive, user) {
  const account = await getAccountOrThrow(value, user);

  if (!MANAGEMENT_ROLES.has(user.role)) {
    throw new ApiError(
      403,
      'Only Admins and Account Managers can update platform account status',
    );
  }

  try {
    return await PlatformAccountsModel.update(
      account.id,
      { isActive },
    );
  } catch (error) {
    mapPrismaError(error);
  }
},

  async remove(value, user) {
  const account = await getAccountOrThrow(value, user);

  if (!MANAGEMENT_ROLES.has(user.role)) {
    throw new ApiError(
      403,
      'Only Admins and Account Managers can delete platform accounts',
    );
  }

  try {
    return await PlatformAccountsModel.remove(account.id);
  } catch (error) {
    if (error?.code === 'P2003') {
      throw new ApiError(
        409,
        'Cannot delete this account because content plans reference it',
      );
    }

    mapPrismaError(error);
  }
},
  
};
