import { ApiError } from '../utils/ApiError.js';

export const isContentCreator = (user) =>
  user?.role?.name === 'EMPLOYEE' && user?.jobTitle?.name === 'Content Creator';

export const requireRoles = (...allowedRoles) => (req, res, next) => {
  const roleName = req.user?.role?.name;
  const allowed = allowedRoles.includes(roleName) ||
    (allowedRoles.includes('CONTENT_CREATOR') && isContentCreator(req.user));

  if (!allowed) return next(new ApiError(403, 'You do not have permission to perform this action'));
  next();
};

export function brandScopeWhere(user) {
  if (user?.role?.name === 'ADMIN') return {};
  if (user?.role?.name === 'ACCOUNT_MANAGER') return { accountManagerId: user.id };
  if (user?.role?.name === 'CLIENT') return { clientId: user.id };
  if (isContentCreator(user)) {
    return { contentPlans: { some: { assignedToId: user.id } } };
  }
  throw new ApiError(403, 'You do not have permission to access brands');
}

export function contentPlanScopeWhere(user) {
  if (user?.role?.name === 'ADMIN') return {};
  if (user?.role?.name === 'ACCOUNT_MANAGER') {
    return { brand: { is: { accountManagerId: user.id } } };
  }
  if (user?.role?.name === 'CLIENT') {
    return { brand: { is: { clientId: user.id } } };
  }
  if (isContentCreator(user)) return { assignedToId: user.id };
  throw new ApiError(403, 'You do not have permission to access content plans');
}

export function platformAccountScopeWhere(user) {
  if (user?.role?.name === 'ADMIN') return {};
  if (user?.role?.name === 'ACCOUNT_MANAGER') {
    return { brand: { is: { accountManagerId: user.id } } };
  }
  if (user?.role?.name === 'CLIENT') {
    return { brand: { is: { clientId: user.id } } };
  }
  if (isContentCreator(user)) {
    return { contentPlans: { some: { assignedToId: user.id } } };
  }
  throw new ApiError(403, 'You do not have permission to access platform accounts');
}
