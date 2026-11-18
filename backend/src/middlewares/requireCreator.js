
import { ApiError } from '../utils/ApiError.js';

/**
 * Middleware: requireCreator
 *
 * Allows only CONTENT_CREATOR users to perform:
 * - Create Content Plans
 * - Edit Content Plans
 * - Delete Content Plans
 * - Create Campaigns
 * - Edit Campaigns
 * - Delete Campaigns
 * - Create Content Items
 * - Edit Content Items
 * - Delete Content Items
 *
 * CREATIVE users do not have these permissions.
 */
export const requireCreator = (req, res, next) => {
  const roleName = String(
    req.user?.role?.name || req.user?.role || '',
  )
    .trim()
    .toUpperCase();

  const isContentCreator = roleName === 'CONTENT_CREATOR';

  if (!isContentCreator) {
    return next(
      new ApiError(
        403,
        'Permission denied: Only Content Creators can create, edit, or delete content plans, campaigns, and items.',
      ),
    );
  }

  next();
};
