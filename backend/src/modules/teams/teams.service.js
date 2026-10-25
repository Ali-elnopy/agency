
import { TeamsModel } from './teams.model.js';
import { ApiError } from '../../utils/ApiError.js';

const VALID_STATUSES = new Set(['active', 'inactive']);

function parseId(value, label = 'ID') {
  const id = Number(value);

  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new ApiError(400, `${label} must be a positive integer`);
  }

  return id;
}

async function getExistingTeam(idValue) {
  const id = parseId(idValue, 'Team ID');
  const team = await TeamsModel.findById(id);

  if (!team) {
    throw new ApiError(404, 'Team not found');
  }

  return team;
}

async function assertEligibleUsers(ids) {
  const uniqueIds = [...new Set(ids)];

  if (uniqueIds.length === 0) return;

  const users = await TeamsModel.findEligibleUsersByIds(uniqueIds);

  if (users.length !== uniqueIds.length) {
    throw new ApiError(
      400,
      'One or more users do not exist, are inactive, or cannot be assigned to a team',
    );
  }
}

function mapPrismaError(error) {
  if (error?.code === 'P2002') {
    throw new ApiError(409, 'A team with this name already exists');
  }

  if (error?.code === 'P2025') {
    throw new ApiError(404, 'Team or membership not found');
  }

  if (error?.code === 'P2003' || error?.code === 'P2014') {
    throw new ApiError(
      409,
      'This operation conflicts with existing references',
    );
  }

  throw error;
}

export const TeamsService = {
  async listTeams({ status, query }) {
    const normalizedStatus = status?.trim().toLowerCase();

    if (normalizedStatus && !VALID_STATUSES.has(normalizedStatus)) {
      throw new ApiError(400, 'status must be active or inactive');
    }

    return TeamsModel.list({
      status: normalizedStatus,
      query: query?.trim() || undefined,
    });
  },

  async getTeam(idValue) {
    return getExistingTeam(idValue);
  },

  async deleteTeam(idValue) {
    const team = await getExistingTeam(idValue);
    const assignedBrands = await TeamsModel.countBrands(team.id);

    if (assignedBrands > 0) {
      throw new ApiError(
        409,
        'Reassign this team’s brands before deleting it',
      );
    }

    try {
      return await TeamsModel.remove(team.id);
    } catch (error) {
      mapPrismaError(error);
    }
  },

  async createTeam(input, adminId) {
    const teamLeadId =
      input.teamLeadId == null
        ? null
        : parseId(input.teamLeadId, 'Team Leader ID');

    const memberIds = [...new Set(input.memberIds ?? [])];

    // A team leader must be eligible to join a team.
    if (teamLeadId !== null) {
      await assertEligibleUsers([teamLeadId]);

      // Automatically make the team leader a team member.
      if (!memberIds.includes(teamLeadId)) {
        memberIds.push(teamLeadId);
      }
    }

    await assertEligibleUsers(memberIds);

    try {
      return await TeamsModel.create(
        {
          name: input.name,
          description: input.description ?? null,
          teamLeadId,
          createdBy: adminId,
        },
        memberIds,
      );
    } catch (error) {
      mapPrismaError(error);
    }
  },

  async updateTeam(idValue, input) {
    const team = await getExistingTeam(idValue);
    const data = {};

    if (input.name !== undefined) {
      data.name = input.name;
    }

    if (input.description !== undefined) {
      data.description = input.description;
    }

    if (input.isActive !== undefined) {
      data.isActive = input.isActive;
    }

    try {
      if (input.teamLeadId !== undefined) {
        const teamLeadId =
          input.teamLeadId === null
            ? null
            : parseId(input.teamLeadId, 'Team Leader ID');

        // Validate the new leader before updating the team.
        if (teamLeadId !== null) {
          await assertEligibleUsers([teamLeadId]);
        }

        // The model updates the leader and membership transactionally.
        return await TeamsModel.update(
          team.id,
          data,
          teamLeadId,
        );
      }

      return await TeamsModel.update(team.id, data);
    } catch (error) {
      mapPrismaError(error);
    }
  },

  async addMember(teamIdValue, userIdValue) {
    const team = await getExistingTeam(teamIdValue);
    const userId = parseId(userIdValue, 'User ID');

    const user = await TeamsModel.findEligibleUserById(userId);

    if (!user) {
      throw new ApiError(
        400,
        'User does not exist, is inactive, or cannot be assigned to a team',
      );
    }

    try {
      return await TeamsModel.addMember(team.id, userId);
    } catch (error) {
      mapPrismaError(error);
    }
  },

  async removeMember(teamIdValue, userIdValue) {
    const team = await getExistingTeam(teamIdValue);
    const userId = parseId(userIdValue, 'User ID');

    const isMember = team.memberships.some(
      ({ user }) => user.id === userId,
    );

    if (!isMember) {
      throw new ApiError(404, 'User is not a member of this team');
    }

    try {
      return await TeamsModel.removeMember(team.id, userId);
    } catch (error) {
      mapPrismaError(error);
    }
  },

  async moveMember(sourceTeamIdValue, userIdValue, targetTeamIdValue) {
    const sourceTeam = await getExistingTeam(sourceTeamIdValue);
    const targetTeamId = parseId(targetTeamIdValue, 'Target team ID');
    const userId = parseId(userIdValue, 'User ID');

    if (sourceTeam.id === targetTeamId) {
      throw new ApiError(400, 'Source and target teams must be different');
    }

    const targetTeam = await TeamsModel.findById(targetTeamId);

    if (!targetTeam) {
      throw new ApiError(404, 'Target team not found');
    }

    const isMember = sourceTeam.memberships.some(
      ({ user }) => user.id === userId,
    );

    if (!isMember) {
      throw new ApiError(404, 'User is not a member of the source team');
    }

    // A leader cannot be moved out while still leading the source team.
    if (sourceTeam.teamLeadId === userId) {
      throw new ApiError(
        400,
        'Cannot move the team leader before removing or changing the team leadership',
      );
    }

    const user = await TeamsModel.findEligibleUserById(userId);

    if (!user) {
      throw new ApiError(
        400,
        'User is inactive or cannot be assigned to a team',
      );
    }

    try {
      return await TeamsModel.moveMember(
        sourceTeam.id,
        targetTeam.id,
        userId,
      );
    } catch (error) {
      mapPrismaError(error);
    }
  },
};
