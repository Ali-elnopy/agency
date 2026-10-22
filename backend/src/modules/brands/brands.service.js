
import { BrandsModel } from './brands.model.js';
import { ApiError } from '../../utils/ApiError.js';

async function validateTeam(teamId) {
  if (teamId == null) return;

  const team = await BrandsModel.findTeamById(teamId);

  if (!team) {
    throw new ApiError(400, 'Selected team does not exist');
  }

  if (!team.isActive) {
    throw new ApiError(400, 'Selected team is inactive');
  }
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

function mapPrismaError(error) {
  if (error?.code === 'P2003' || error?.code === 'P2014') {
    throw new ApiError(
      400,
      'Invalid team, account manager, or creator reference',
    );
  }

  throw error;
}

export const BrandsService = {
  async createBrand(input, adminId) {
    await validateTeam(input.teamId);
    await validateAccountManager(input.accountManagerId);

    const data = {
      name: input.name,
      industry: input.industry ?? null,
      websiteUrl: input.websiteUrl ?? null,
      description: input.description ?? null,
      teamId: input.teamId ?? null,
      accountManagerId: input.accountManagerId ?? null,
      createdBy: adminId,
    };

    try {
      return await BrandsModel.create(data);
    } catch (error) {
      mapPrismaError(error);
    }
  },
};
