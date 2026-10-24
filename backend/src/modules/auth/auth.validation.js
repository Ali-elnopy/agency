import { z } from 'zod';

export const loginSchema = z
  .object({
    email: z.string().trim().email('Please enter a valid email address').max(255),

    password: z.string().min(1, 'Password is required').max(128, 'Password is too long'),
  })
  .strict();

const strongPasswordSchema = z
  .string()
  .min(12, 'Password must be at least 12 characters')
  .max(128, 'Password must not exceed 128 characters')
  .regex(/[a-z]/, 'Password must contain a lowercase letter')
  .regex(/[A-Z]/, 'Password must contain an uppercase letter')
  .regex(/[0-9]/, 'Password must contain a number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain a special character');

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
      .regex(/^[a-f0-9]{64}$/, 'This reset link is invalid. Request a new one.'),

    newPassword: strongPasswordSchema,
  })
  .strict();
