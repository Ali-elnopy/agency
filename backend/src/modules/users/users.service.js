
import bcrypt from 'bcryptjs';
import { UsersModel } from './users.model.js';
import { ApiError } from '../../utils/ApiError.js';

const MANAGEABLE_ROLES = new Set([
  'ACCOUNT_MANAGER',
  'EMPLOYEE',
]);

const EMPLOYEE_JOB_TITLES = new Set([
  'Media Buyer',
  'Photographer',
  'Video Editor',
  'Social Media Specialist',
  'Marketing Manager',
  'Content Creator',
  'Graphic Designer',
]);

const VALID_STATUSES = new Set([
  'active',
  'deactivated',
  'inactive',
]);

function parseUserId(value) {
  const id = Number(value);

  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new ApiError(400, 'User id must be a positive integer');
  }

  return id;
}

function assertManageableRole(roleName) {
  if (!MANAGEABLE_ROLES.has(roleName)) {
    throw new ApiError(
      400,
      'Users can only be assigned EMPLOYEE or ACCOUNT_MANAGER roles',
    );
  }
}

async function getManageableUser(idValue) {
  const id = parseUserId(idValue);
  const user = await UsersModel.findById(id);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (!MANAGEABLE_ROLES.has(user.role?.name)) {
    throw new ApiError(
      403,
      'Administrator accounts cannot be managed through this endpoint',
    );
  }

  return user;
}

async function resolveRoleId(roleName) {
  assertManageableRole(roleName);

  const role = await UsersModel.findRoleByName(roleName);

  if (!role) {
    throw new ApiError(
      409,
      `Role ${roleName} is not configured in the database`,
    );
  }

  return role.id;
}

async function resolveJobTitleById(jobTitleId) {
  if (jobTitleId == null) {
    throw new ApiError(400, 'A job title is required');
  }

  const jobTitle = await UsersModel.findJobTitleById(jobTitleId);

  if (!jobTitle || !jobTitle.isActive) {
    throw new ApiError(
      400,
      'Job title does not exist or is inactive',
    );
  }

  return jobTitle;
}

async function resolveAccountManagerJobTitle() {
  const jobTitle = await UsersModel.findJobTitleByName('Account Manager');

  if (!jobTitle || !jobTitle.isActive) {
    throw new ApiError(
      409,
      'The active Account Manager job title is not configured in the database',
    );
  }

  return jobTitle;
}

function assertEmployeeJobTitle(jobTitle) {
  if (!EMPLOYEE_JOB_TITLES.has(jobTitle.name)) {
    throw new ApiError(
      400,
      'Employees must have one of the following job titles: Media Buyer, Photographer, Video Editor, Social Media Specialist, Marketing Manager, Content Creator, or Graphic Designer',
    );
  }
}

function mapPrismaError(error) {
  if (error?.code === 'P2002') {
    throw new ApiError(409, 'A user with this email already exists');
  }

  if (error?.code === 'P2003' || error?.code === 'P2014') {
    throw new ApiError(
      409,
      'This user is still referenced by other records. Reassign or remove those references before deleting the user',
    );
  }

  if (error?.code === 'P2025') {
    throw new ApiError(404, 'User not found');
  }

  throw error;
}

export const UsersService = {
  async listUsers({ status, query, roleName }) {
    const normalizedStatus = status?.trim().toLowerCase();

    if (normalizedStatus && !VALID_STATUSES.has(normalizedStatus)) {
      throw new ApiError(400, 'status must be active or deactivated');
    }

    const normalizedRoleName = roleName?.trim().toUpperCase();

    if (normalizedRoleName) {
      assertManageableRole(normalizedRoleName);
    }

    const normalizedQuery = query?.trim();

    const [users, stats] = await Promise.all([
      UsersModel.list({
        status: normalizedStatus,
        query: normalizedQuery || undefined,
        roleName: normalizedRoleName || undefined,
      }),
      UsersModel.getStats(),
    ]);

    return { users, stats };
  },

  async getUser(idValue) {
    const id = parseUserId(idValue);
    const user = await UsersModel.findById(id);

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    return user;
  },

  async createUser(input, adminId) {
    const roleId = await resolveRoleId(input.roleName);

    let jobTitle;

    if (input.roleName === 'ACCOUNT_MANAGER') {
      // Account Manager gets its matching job title automatically.
      jobTitle = await resolveAccountManagerJobTitle();
    } else {
      // Every Employee must have one of the three supported titles.
      jobTitle = await resolveJobTitleById(input.jobTitleId);
      assertEmployeeJobTitle(jobTitle);
    }

    const passwordHash = await bcrypt.hash(input.password, 12);

    try {
      return await UsersModel.create({
        fullName: input.fullName,
        email: input.email,
        passwordHash,
        phone: input.phone ?? null,
        roleId,
        jobTitleId: jobTitle.id,
        createdBy: adminId,
      });
    } catch (error) {
      mapPrismaError(error);
    }
  },

  async updateUser(idValue, input) {
    const user = await getManageableUser(idValue);

    const resultingRoleName = input.roleName ?? user.role.name;
    assertManageableRole(resultingRoleName);

    const data = {};

    if (input.fullName !== undefined) {
      data.fullName = input.fullName;
    }

    if (input.email !== undefined) {
      data.email = input.email;
    }

    if (input.phone !== undefined) {
      data.phone = input.phone;
    }

    if (input.roleName !== undefined) {
      data.roleId = await resolveRoleId(resultingRoleName);
    }

    let jobTitle;

    if (resultingRoleName === 'ACCOUNT_MANAGER') {
      // Also replaces an Employee title when changing to Account Manager.
      jobTitle = await resolveAccountManagerJobTitle();
    } else if (input.jobTitleId !== undefined) {
      // A supplied Employee title must exist, be active, and be allowed.
      jobTitle = await resolveJobTitleById(input.jobTitleId);
      assertEmployeeJobTitle(jobTitle);
    } else {
      // Keep the current title only if it is already a valid Employee title.
      jobTitle = user.jobTitle;

      if (!jobTitle || !EMPLOYEE_JOB_TITLES.has(jobTitle.name)) {
        throw new ApiError(
          400,
          'A valid Employee job title is required when assigning the Employee role',
        );
      }
    }

    data.jobTitleId = jobTitle.id;

    try {
      return await UsersModel.update(user.id, data);
    } catch (error) {
      mapPrismaError(error);
    }
  },

  async deactivateUser(idValue) {
    const user = await getManageableUser(idValue);

    try {
      return await UsersModel.deactivate(user.id);
    } catch (error) {
      mapPrismaError(error);
    }
  },

  async reactivateUser(idValue) {
    const user = await getManageableUser(idValue);

    try {
      return await UsersModel.reactivate(user.id);
    } catch (error) {
      mapPrismaError(error);
    }
  },

  async deleteUser(idValue) {
    const user = await getManageableUser(idValue);

    try {
      await UsersModel.delete(user.id);
      return { id: user.id };
    } catch (error) {
      mapPrismaError(error);
    }
  },
};
