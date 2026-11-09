
import bcrypt from 'bcryptjs';
import { BrandsModel } from './brands.model.js';
import { ApiError } from '../../utils/ApiError.js';
import { brandScopeWhere } from '../../middlewares/authorization.js';

const BRAND_STATUSES = new Set(['active', 'paused', 'archived']);

async function validateTeam(teamId) {
  if (teamId == null) return;

  const team = await BrandsModel.findTeamById(teamId);

  if (!team) throw new ApiError(400, 'Selected team does not exist');
  if (!team.isActive) throw new ApiError(400, 'Selected team is inactive');
}

async function validateAccountManager(accountManagerId) {
  if (accountManagerId == null) return;

  const accountManager =
    await BrandsModel.findAccountManagerById(accountManagerId);

  if (!accountManager) {
    throw new ApiError(400, 'Selected account manager does not exist');
  }

  if (!accountManager.isActive) {
    throw new ApiError(400, 'Selected account manager is inactive');
  }

  if (accountManager.role?.name !== 'ACCOUNT_MANAGER') {
    throw new ApiError(
      400,
      'Selected user must have the ACCOUNT_MANAGER role',
    );
  }
}

function parseBrandId(value) {
  const id = Number(value);

  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new ApiError(400, 'Brand id must be a positive integer');
  }

  return id;
}

async function getBrandOrThrow(idValue, user) {
  const id = parseBrandId(idValue);
  const brand = await BrandsModel.findById(id, brandScopeWhere(user));

  if (!brand) throw new ApiError(404, 'Brand not found');

  return brand;
}

function mapPrismaError(error) {
  if (error?.code === 'P2002') {
    throw new ApiError(409, 'This client email is already registered');
  }

  if (error?.code === 'P2003' || error?.code === 'P2014') {
    throw new ApiError(
      400,
      'Invalid team, account manager, creator, or client reference',
    );
  }

  if (error?.code === 'CLIENT_ROLE_MISSING') {
    throw new ApiError(
      500,
      'CLIENT role is missing. Configure the role before creating clients.',
    );
  }

  throw error;
}

export const BrandsService = {
  async createBrand(input, adminId) {
    await validateTeam(input.teamId);
    await validateAccountManager(input.accountManagerId);

    const brandData = {
      name: input.name,
      industry: input.industry ?? null,
      websiteUrl: input.websiteUrl ?? null,
      description: input.description ?? null,
      status: input.status ? String(input.status).toLowerCase() : 'active',
      teamId: input.teamId ?? null,
      accountManagerId: input.accountManagerId ?? null,
      createdBy: adminId,
    };

    try {
      if (input.client) {
        const passwordHash = await bcrypt.hash(input.client.password, 12);
        const clientData = {
          fullName: input.client.fullName,
          email: input.client.email,
          phone: input.client.phone ?? null,
          passwordHash,
          createdBy: adminId,
        };
        return await BrandsModel.createWithClient({ brandData, clientData });
      }

      return await BrandsModel.create(brandData);
    } catch (error) {
      mapPrismaError(error);
    }
  },

  async listBrands(filters = {}, user) {
    return BrandsModel.list({ ...filters, accessWhere: brandScopeWhere(user) });
  },

  async getBrand(id, user) {
    return getBrandOrThrow(id, user);
  },

  async updateBrand(idValue, input, user) {
    const brand = await getBrandOrThrow(idValue, user);

    if (user.role?.name === 'ACCOUNT_MANAGER' && (input.teamId !== undefined || input.accountManagerId !== undefined)) {
      throw new ApiError(403, 'Only administrators can reassign a brand or change its team');
    }

    const lowerStatus = input.status !== undefined ? String(input.status).toLowerCase() : undefined;
    if (lowerStatus !== undefined && !BRAND_STATUSES.has(lowerStatus)) {
      throw new ApiError(400, 'Invalid brand status');
    }

    if (input.teamId !== undefined) await validateTeam(input.teamId);
    if (input.accountManagerId !== undefined) {
      await validateAccountManager(input.accountManagerId);
    }

    const data = {};

    for (const key of [
      'name',
      'industry',
      'websiteUrl',
      'description',
      'teamId',
      'accountManagerId',
    ]) {
      if (input[key] !== undefined) data[key] = input[key];
    }

    if (lowerStatus !== undefined) data.status = lowerStatus;

    try {
      return await BrandsModel.update(brand.id, data);
    } catch (error) {
      mapPrismaError(error);
    }
  },

  async deleteBrand(idValue, user) {
    const brand = await getBrandOrThrow(idValue, user);
    return BrandsModel.remove(brand.id);
  },
};
