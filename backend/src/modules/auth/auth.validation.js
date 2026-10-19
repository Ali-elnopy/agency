import { z } from 'zod';

export const passwordField = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password too long');

export const loginSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(1),
});

export const refreshSchema = z.object({ refreshToken: z.string().min(1) });

export const forgotPasswordSchema = z.object({ email: z.string().email().toLowerCase() });

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: passwordField,
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: passwordField,
});
