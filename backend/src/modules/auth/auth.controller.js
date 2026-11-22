import { AuthService } from './auth.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { getMailConfig, setRuntimeSmtpConfig } from '../../utils/mailer.js';

export const AuthController = {
  mailStatus: asyncHandler(async (req, res) => {
    const cfg = getMailConfig();
    res.status(200).json({
      success: true,
      data: {
        configured: Boolean(cfg.provider),
        provider: cfg.provider,
        smtpUser: cfg.smtp?.user || '',
        from: cfg.from || '',
      },
    });
  }),

  updateMailConfig: asyncHandler(async (req, res) => {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        success: false,
        message: 'Runtime mail configuration is disabled in production.',
      });
    }
    const { email, appPassword, resendApiKey, mailFrom } = req.body || {};
    setRuntimeSmtpConfig({ email, appPassword, resendApiKey, mailFrom });
    const cfg = getMailConfig();
    res.status(200).json({
      success: true,
      message: cfg.provider
        ? `Real email delivery activated via ${cfg.provider.toUpperCase()}!`
        : 'Mail configuration saved.',
      data: {
        configured: Boolean(cfg.provider),
        provider: cfg.provider,
        smtpUser: cfg.smtp?.user || '',
        from: cfg.from || '',
      },
    });
  }),

  login: asyncHandler(async (req, res) => {
    const result = await AuthService.login(req.body);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result,
    });
  }),
  refresh: asyncHandler(async (req, res) => {
    const result = await AuthService.refresh(req.body.refreshToken);

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
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
    const { code: _omitCode, ...publicData } = result || {};

    res.status(200).json({
      success: true,
      message: result.message,
      data: publicData,
    });
  }),

  verifyOtp: asyncHandler(async (req, res) => {
    const result = await AuthService.verifyOtp(req.body);

    res.status(200).json({
      success: true,
      message: result.message,
      data: result,
    });
  }),

  resendOtp: asyncHandler(async (req, res) => {
    const result = await AuthService.resendOtp(req.body);
    const { code: _omitCode, ...publicData } = result || {};

    res.status(200).json({
      success: true,
      message: result.message,
      data: publicData,
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
      data: result,
    });
  }),
};
