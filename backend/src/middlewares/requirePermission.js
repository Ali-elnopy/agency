import { ApiError } from '../utils/ApiError.js';

/**
 * Reusable permission middleware.
 * Behavior:
 * - ADMIN: Always allowed (full access / bypass).
 * - EMPLOYEE: Checks individual permissions assigned via UserPermission.
 * - ACCOUNT_MANAGER / CLIENT: Checks permissions assigned via RolePermission.
 *
 * Returns HTTP 403 when the user does not have the required permission.
 */
export const requirePermission = (...permissionCodes) => {
  return (req, res, next) => {
    const user = req.user;

    if (!user) {
      return next(new ApiError(401, 'Authentication required'));
    }

    const roleName = user.role?.name || user.role;

    // ADMIN has full access
    if (roleName === 'ADMIN') {
      return next();
    }

    let userPermissionCodes = [];

    if (roleName === 'EMPLOYEE') {
      userPermissionCodes = (user.permissions || []).map(
        (p) => p.permission?.code || p.code || p,
      );
    } else if (roleName === 'ACCOUNT_MANAGER' || roleName === 'CLIENT') {
      userPermissionCodes = (user.role?.permissions || []).map(
        (rp) => rp.permission?.code || rp.code || rp,
      );
    }

    const hasPermission = permissionCodes.some((code) =>
      userPermissionCodes.includes(code),
    );

    if (!hasPermission) {
      return next(
        new ApiError(
          403,
          `Permission denied: Requires ${permissionCodes.join(' or ')}`,
        ),
      );
    }

    next();
  };
};
