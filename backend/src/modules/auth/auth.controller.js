import { AuthService } from './auth.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const AuthController = {
  login: asyncHandler(async (req, res) => {
    const result = await AuthService.login(req.body);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result,
    });
  }),

  me: asyncHandler(async (req, res) => {
    const user = await AuthService.getCurrentUser(req.user.id);

    res.status(200).json({
      success: true,
      data: { user },
    });
  }),

  changePassword: asyncHandler(async (req, res) => {
    const result = await AuthService.changePassword(req.user.id, req.authSession.id, req.body, {
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(200).json({
      success: true,
      message: result.message,
    });
  }),

  logout: asyncHandler(async (req, res) => {
    const result = await AuthService.logout(req.user.id, req.authSession.id);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  }),

  forgotPassword: asyncHandler(async (req, res) => {
    const result = await AuthService.requestPasswordReset(req.body);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  }),

  resetPassword: asyncHandler(async (req, res) => {
    const result = await AuthService.resetPassword(req.body, {
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(200).json({
      success: true,
      message: result.message,
    });
  }),
};
