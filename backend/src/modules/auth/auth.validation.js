import { z } from 'zod';

export const loginSchema = z
  .object({
    email: z.string().trim().email('Please enter a valid email address').max(255),

    password: z.string().min(1, 'Password is required').max(128, 'Password is too long'),
  })
  .strict();
export const refreshTokenSchema = z
  .object({
    refreshToken: z
      .string()
      .trim()
      .regex(/^[a-f0-9]{64}$/, 'Invalid refresh token'),
  })
  .strict();

const strongPasswordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must not exceed 128 characters');

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1).max(128),

    newPassword: strongPasswordSchema,
  })
  .strict()
  .refine((data) => data.currentPassword !== data.newPassword, {
    path: ['newPassword'],
    message: 'New password must differ from current password',
  });

export const forgotPasswordSchema = z
  .object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email('Please enter a valid email address')
      .max(255, 'Email is too long'),
  })
  .strict();

export const resetPasswordSchema = z
  .object({
    token: z
      .string()
      .trim()
      .regex(/^(\d{6}|[a-f0-9]{64})$/, 'Enter a valid 6-digit verification code.'),

    newPassword: strongPasswordSchema,
  })
  .strict();
