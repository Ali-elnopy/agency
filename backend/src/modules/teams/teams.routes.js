import { Router } from 'express';
import { TeamsController } from './teams.controller.js';
import {
  createTeamSchema,
  updateTeamSchema,
  addTeamMemberSchema,
  moveTeamMemberSchema,
} from './teams.validation.js';
import { authenticate } from '../../middlewares/auth.js';
import { requireAdmin } from '../../middlewares/requireAdmin.js';
import { validate } from '../../middlewares/validate.js';

export const teamsRouter = Router();

teamsRouter.use(authenticate, requireAdmin);

teamsRouter.get('/', TeamsController.list);

teamsRouter.get('/:id', TeamsController.getById);

teamsRouter.post(
  '/',
  validate(createTeamSchema),
  TeamsController.create,
);

teamsRouter.patch(
  '/:id',
  validate(updateTeamSchema),
  TeamsController.update,
);

teamsRouter.post(
  '/:id/members',
  validate(addTeamMemberSchema),
  TeamsController.addMember,
);

teamsRouter.delete(
  '/:id/members/:userId',
  TeamsController.removeMember,
);

teamsRouter.post(
  '/:id/members/:userId/move',
  validate(moveTeamMemberSchema),
  TeamsController.moveMember,
);

teamsRouter.delete('/:id', TeamsController.removeTeam);
