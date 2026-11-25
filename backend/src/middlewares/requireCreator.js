import { ApiError } from '../utils/ApiError.js';
import { getRoleName, isContentCreatorUser } from '../utils/roles.js';

/**
 * Middleware: requireCreator
 * Enforces that only Content Creators (canonical CONTENT_CREATOR role, or
 * legacy CREATOR / EMPLOYEE with Content Creator job title) can execute
 * Create, Edit, or Delete actions on Content Management resources
 * (Campaigns, Content Items).
 */
export const requireCreator = (req, res, next) => {
  const roleName = getRoleName(req.user);

  const isAllowed =
    isContentCreatorUser(req.user) ||
    (roleName === 'EMPLOYEE' && !req.user?.jobTitle);

  if (!isAllowed) {
    return next(
      new ApiError(
        403,
        'Permission denied: Only Content Creators can create, edit, or delete content plans, campaigns, and items.',
      ),
    );
  }

  next();
};
