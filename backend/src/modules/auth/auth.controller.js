import * as service from './auth.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const login = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await service.login(req.body) });
});

export const refresh = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await service.refresh(req.body.refreshToken) });
});

export const logout = asyncHandler(async (req, res) => {
  await service.logout(req.body.refreshToken);
  res.status(204).end();
});

export const forgotPassword = asyncHandler(async (req, res) => {
  await service.forgotPassword(req.body.email);
  res.json({ success: true, message: 'If the email exists, a reset link has been sent' });
});

export const resetPassword = asyncHandler(async (req, res) => {
  await service.resetPassword(req.body);
  res.json({ success: true, message: 'Password updated' });
});

export const changePassword = asyncHandler(async (req, res) => {
  await service.changePassword(req.user.id, req.body);
  res.json({ success: true, message: 'Password changed, please log in again' });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ success: true, data: req.user });
});
