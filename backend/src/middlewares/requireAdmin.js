import { ApiError } from '../utils/ApiError.js';

export const requireAdmin = (req, res, next) => {
  if (req.user?.role?.name !== 'ADMIN') {
    return next(new ApiError(403, 'Administrator access required'));
  }

  next();
};
