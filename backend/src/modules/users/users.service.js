
import bcrypt from 'bcryptjs';
import { UsersModel } from './users.model.js';
import { ApiError } from '../../utils/ApiError.js';

import { prisma } from '../../config/prisma.js';

const MANAGEABLE_ROLES = new Set([
  'ADMIN',
  'ACCOUNT_MANAGER',
  'TEAM_LEADER',
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

const LAST_ADMIN_MESSAGE =
  'The workspace must keep at least one active administrator. Create or promote another admin before changing this account.';

function isAdminRole(roleName) {
  return roleName === 'ADMIN';
}

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
      'Users can only be assigned ADMIN, TEAM_LEADER, ACCOUNT_MANAGER or EMPLOYEE roles',
    );
  }
}

async function getManageableUser(idValue) {
  const id = parseUserId(idValue);
  const user = await UsersModel.findById(id);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return user;
}

/**
 * The workspace must never be left without an active administrator: the last
 * one cannot be demoted, deactivated or deleted. The check excludes the
 * account being changed, so an already-inactive admin does not count.
 */
async function assertAnotherActiveAdmin(user) {
  if (!user.isActive || !isAdminRole(user.role?.name)) return;

  const remaining = await UsersModel.countActiveAdmins({ excludeId: user.id });

  if (remaining === 0) {
    throw new ApiError(409, LAST_ADMIN_MESSAGE);
  }
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

    let jobTitle = null;

    if (input.roleName === 'ADMIN') {
      // Admins do not have or require a job title.
      jobTitle = null;
    } else if (input.customJobTitle?.trim()) {
      jobTitle = await UsersModel.findJobTitleByName(input.customJobTitle.trim());
      if (!jobTitle) {
        jobTitle = await prisma.jobTitle.create({
          data: { name: input.customJobTitle.trim(), isActive: true },
        });
      }
    } else if (input.jobTitleId != null) {
      jobTitle = await resolveJobTitleById(input.jobTitleId);
    } else if (input.roleName === 'ACCOUNT_MANAGER') {
      jobTitle = await resolveAccountManagerJobTitle();
    } else if (input.roleName === 'TEAM_LEADER') {
      let tlTitle = await UsersModel.findJobTitleByName('Team Leader');
      if (!tlTitle) {
        tlTitle = await prisma.jobTitle.create({
          data: { name: 'Team Leader', isActive: true },
        });
      }
      jobTitle = tlTitle;
    } else {
      throw new ApiError(400, 'A job title is required for this role');
    }

    const passwordHash = await bcrypt.hash(input.password, 12);

    try {
      const created = await UsersModel.create({
        fullName: input.fullName,
        email: input.email,
        passwordHash,
        phone: input.phone ?? null,
        roleId,
        jobTitleId: jobTitle ? jobTitle.id : null,
        createdBy: adminId,
      });

      if (input.teamId) {
        await prisma.teamMembership.upsert({
          where: {
            teamId_userId: {
              teamId: input.teamId,
              userId: created.id,
            },
          },
          create: {
            teamId: input.teamId,
            userId: created.id,
          },
          update: {},
        });

        if (input.roleName === 'TEAM_LEADER') {
          await prisma.team.update({
            where: { id: input.teamId },
            data: { teamLeadId: created.id },
          });
        }
      }

      return await UsersModel.findById(created.id);
    } catch (error) {
      mapPrismaError(error);
    }
  },

  async updateUser(idValue, input) {
    const user = await getManageableUser(idValue);

    // Administrator accounts can keep their profile up to date, but their role
    // is fixed: changing it would be the fastest way to leave the workspace
    // without an admin.
    if (isAdminRole(user.role?.name)) {
      if (input.roleName !== undefined && input.roleName !== 'ADMIN') {
        throw new ApiError(409, LAST_ADMIN_MESSAGE);
      }

      if ((input.jobTitleId !== undefined && input.jobTitleId !== null) || input.customJobTitle?.trim()) {
        throw new ApiError(
          400,
          'Administrator accounts do not have a job title',
        );
      }

      const profile = {};

      if (input.fullName !== undefined) profile.fullName = input.fullName;
      if (input.email !== undefined) profile.email = input.email;
      if (input.phone !== undefined) profile.phone = input.phone;

      if (Object.keys(profile).length === 0) {
        throw new ApiError(
          400,
          'Administrator accounts only accept name, email and phone changes',
        );
      }

      try {
        return await UsersModel.update(user.id, profile);
      } catch (error) {
        mapPrismaError(error);
      }
    }

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

    if (resultingRoleName === 'ADMIN') {
      data.jobTitleId = null;
    } else if (input.customJobTitle?.trim()) {
      jobTitle = await UsersModel.findJobTitleByName(input.customJobTitle.trim());
      if (!jobTitle) {
        jobTitle = await prisma.jobTitle.create({
          data: { name: input.customJobTitle.trim(), isActive: true },
        });
      }
      data.jobTitleId = jobTitle.id;
    } else if (input.jobTitleId !== undefined) {
      if (input.jobTitleId === null) {
        data.jobTitleId = null;
      } else {
        jobTitle = await resolveJobTitleById(input.jobTitleId);
        data.jobTitleId = jobTitle.id;
      }
    } else if (resultingRoleName === 'ACCOUNT_MANAGER') {
      jobTitle = await resolveAccountManagerJobTitle();
      data.jobTitleId = jobTitle.id;
    } else if (resultingRoleName === 'TEAM_LEADER' && !user.jobTitleId) {
      let tlTitle = await UsersModel.findJobTitleByName('Team Leader');
      if (!tlTitle) {
        tlTitle = await prisma.jobTitle.create({
          data: { name: 'Team Leader', isActive: true },
        });
      }
      data.jobTitleId = tlTitle.id;
    }

    try {
      await UsersModel.update(user.id, data);

      if (input.teamId !== undefined) {
        if (input.teamId === null) {
          await prisma.teamMembership.deleteMany({
            where: { userId: user.id },
          });
          await prisma.team.updateMany({
            where: { teamLeadId: user.id },
            data: { teamLeadId: null },
          });
        } else {
          await prisma.teamMembership.deleteMany({
            where: { userId: user.id, teamId: { not: input.teamId } },
          });
          await prisma.teamMembership.upsert({
            where: {
              teamId_userId: {
                teamId: input.teamId,
                userId: user.id,
              },
            },
            create: {
              teamId: input.teamId,
              userId: user.id,
            },
            update: {},
          });

          if (resultingRoleName === 'TEAM_LEADER') {
            await prisma.team.update({
              where: { id: input.teamId },
              data: { teamLeadId: user.id },
            });
          }
        }
      }

      return await UsersModel.findById(user.id);
    } catch (error) {
      mapPrismaError(error);
    }
  },

  async deactivateUser(idValue) {
    const user = await getManageableUser(idValue);

    await assertAnotherActiveAdmin(user);

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

    await assertAnotherActiveAdmin(user);

    try {
      await UsersModel.delete(user.id);
      return { id: user.id };
    } catch (error) {
      mapPrismaError(error);
    }
  },
};
