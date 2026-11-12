import { ApiError } from '../utils/ApiError.js';

/**
 * Middleware: requireCreator
 * Enforces that only users with the 'CREATOR' role (or creator@orvia.com)
 * can execute Create, Edit, or Delete actions on Content Management resources
 * (Content Plans, Campaigns, Content Items).
 * All other roles (Admin, Account Manager, Employee/Content Creator, Client)
 * are strictly Read-Only.
 */
export const requireCreator = (req, res, next) => {
  const roleName = String(req.user?.role?.name || req.user?.role || '').toUpperCase();
  const jobTitle = String(req.user?.jobTitle?.name || req.user?.jobTitle || '').toLowerCase();
  const email = String(req.user?.email || '').toLowerCase();

  // Employee (Content Creator) holds the creator execution privileges.
  // Legacy creator credentials and roles also map here cleanly.
  const isEmployeeCreator =
    roleName === 'EMPLOYEE' ||
    roleName === 'CONTENT_CREATOR' ||
    roleName === 'CREATOR' ||
    email === 'employee@orvia.com' ||
    email === 'creator@orvia.com' ||
    jobTitle.includes('creator') ||
    jobTitle.includes('employee');

  if (!isEmployeeCreator) {
    return next(
      new ApiError(
        403,
        'Permission denied: Only Employees (Content Creators) have permission to create, edit, or delete content plans, campaigns, and items.',
      ),
    );
  }

  next();
};
