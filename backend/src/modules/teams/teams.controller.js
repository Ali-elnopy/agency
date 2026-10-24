import { TeamsService } from './teams.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const TeamsController = {
  list: asyncHandler(async (req, res) => {
    const teams = await TeamsService.listTeams({
      status: req.query.status,
      query: req.query.query,
    });

    res.status(200).json({ success: true, data: teams });
  }),

  getById: asyncHandler(async (req, res) => {
    const team = await TeamsService.getTeam(req.params.id);

    res.status(200).json({ success: true, data: team });
  }),

  create: asyncHandler(async (req, res) => {
    const team = await TeamsService.createTeam(req.body, req.user.id);

    res.status(201).json({
      success: true,
      message: 'Team created successfully',
      data: team,
    });
  }),

  update: asyncHandler(async (req, res) => {
    const team = await TeamsService.updateTeam(req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: 'Team updated successfully',
      data: team,
    });
  }),

  addMember: asyncHandler(async (req, res) => {
    const team = await TeamsService.addMember(
      req.params.id,
      req.body.userId,
    );

    res.status(200).json({
      success: true,
      message: 'Team member added successfully',
      data: team,
    });
  }),

  removeMember: asyncHandler(async (req, res) => {
    const team = await TeamsService.removeMember(
      req.params.id,
      req.params.userId,
    );

    res.status(200).json({
      success: true,
      message: 'Team member removed successfully',
      data: team,
    });
  }),

  moveMember: asyncHandler(async (req, res) => {
    const team = await TeamsService.moveMember(
      req.params.id,
      req.params.userId,
      req.body.targetTeamId,
    );

    res.status(200).json({
      success: true,
      message: 'Team member moved successfully',
      data: team,
    });
  }),
<<<<<<< HEAD

  removeTeam: asyncHandler(async (req, res) => {
    const team = await TeamsService.deleteTeam(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Team deleted successfully',
      data: team,
    });
  }),
};
=======
};
>>>>>>> 13b0478 (feat: improve team management API)
