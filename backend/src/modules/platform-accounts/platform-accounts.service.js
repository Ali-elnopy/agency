
import { PlatformAccountsModel } from './platform-accounts.model.js';
import { ApiError } from '../../utils/ApiError.js';

function parseId(value, label = 'Id') {
  const id = Number(value);

  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new ApiError(400, `${label} must be a positive integer`);
  }

  return id;
}

async function getAccountOrThrow(value) {
  const id = parseId(value, 'Platform account id');
  const account = await PlatformAccountsModel.findById(id);

  if (!account) throw new ApiError(404, 'Platform account not found');

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
  async create(input) {
    const brandId = parseId(input.brandId, 'Brand id');
    await validateBrand(brandId);

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

  async list(filters) {
    return PlatformAccountsModel.list(filters);
  },

  async getById(value) {
    return getAccountOrThrow(value);
  },

  async update(value, input) {
    const account = await getAccountOrThrow(value);

    if (input.brandId !== undefined) {
      input = {
        ...input,
        brandId: parseId(input.brandId, 'Brand id'),
      };

      await validateBrand(input.brandId);
    }

    try {
      return await PlatformAccountsModel.update(account.id, input);
    } catch (error) {
      mapPrismaError(error);
    }
  },

  async updateStatus(value, isActive) {
    const account = await getAccountOrThrow(value);

    try {
      return await PlatformAccountsModel.update(account.id, { isActive });
    } catch (error) {
      mapPrismaError(error);
    }
  },

  async remove(value) {
    const account = await getAccountOrThrow(value);

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
