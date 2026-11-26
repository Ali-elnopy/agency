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
    const email = String(req.body?.email ?? '').trim();
    const appPassword = String(req.body?.appPassword ?? '').trim();
    const resendApiKey = String(req.body?.resendApiKey ?? '').trim();
    const mailFrom = String(req.body?.mailFrom ?? '').trim();

    if (!resendApiKey && !(email && appPassword)) {
      return res.status(400).json({
        success: false,
        message:
          'Provide a Resend API key, or a sender email plus a Gmail app password.',
      });
    }

    if (resendApiKey && !/^re_[A-Za-z0-9_-]{8,}$/.test(resendApiKey)) {
      return res.status(400).json({
        success: false,
        message: 'That does not look like a Resend API key (it must start with re_).',
      });
    }

    setRuntimeSmtpConfig({ email, appPassword, resendApiKey, mailFrom });
    const cfg = getMailConfig();
    res.status(200).json({
      success: true,
      message: cfg.provider
        ? `Email delivery activated via ${cfg.provider.toUpperCase()}.`
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

  updateMe: asyncHandler(async (req, res) => {
    const user = await AuthService.updateCurrentUserProfile(req.user.id, req.body);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
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
    const publicData = { ...(result || {}) };
    delete publicData.code;

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
    const publicData = { ...(result || {}) };
    delete publicData.code;

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
