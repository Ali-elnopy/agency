import { ApiError } from '../utils/ApiError.js';

export const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const isOperational = err instanceof ApiError;
  const statusCode = isOperational ? err.statusCode : 500;

  if (statusCode >= 500) {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    // Operational errors carry a message meant for the client (for example a
    // 503 explaining that email delivery is not configured). Unexpected
    // failures stay opaque.
    message: statusCode >= 500 && !isOperational ? 'Internal server error' : err.message,
  });
};
