import { ApiError } from '../utils/ApiError.js';

/**
 * Middleware: requireCreator
 * Enforces that only Creator / Content Creator users
 * can execute Create, Edit, or Delete actions on Content Management resources
 * (Content Plans, Campaigns, Content Items).
 * All other roles (Admin, Account Manager, Regular Employee, Client)
 * are strictly Read-Only.
 */
export const requireCreator = (req, res, next) => {
  const roleName = String(req.user?.role?.name || req.user?.role || '').toUpperCase();
  const jobTitle = String(req.user?.jobTitle?.name || req.user?.jobTitle || '').toLowerCase();
  const isCreator =
    roleName === 'CONTENT_CREATOR' ||
    roleName === 'CREATOR' ||
    (roleName === 'EMPLOYEE' && jobTitle === 'content creator');

  if (!isCreator) {
    return next(
      new ApiError(
        403,
        'Permission denied: Only Employees (Content Creators) have permission to create, edit, or delete content plans, campaigns, and items.',
      ),
    );
  }

  next();
};
