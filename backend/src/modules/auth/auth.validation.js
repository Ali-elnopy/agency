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

export const updateProfileSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, 'Full name must be at least 2 characters')
      .max(150, 'Full name must not exceed 150 characters')
      .optional(),

    phone: z
      .string()
      .trim()
      .max(30, 'Phone number must not exceed 30 characters')
      .nullable()
      .optional(),
  })
  .strict()
  .refine((data) => data.fullName !== undefined || data.phone !== undefined, {
    message: 'At least one field must be provided',
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

export const verifyOtpSchema = z
  .object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email('Please enter a valid email address')
      .max(255, 'Email is too long'),

    otp: z
      .string()
      .trim()
      .regex(/^\d{6}$/, 'Enter the 6-digit verification code from your email.'),
  })
  .strict();

export const resendOtpSchema = z
  .object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email('Please enter a valid email address')
      .max(255, 'Email is too long'),
  })
  .strict();

const resetTokenSchema = z
  .string()
  .trim()
  .regex(/^[a-f0-9]{64}$/i, 'Invalid reset authorization token.');

export const resetPasswordSchema = z
  .object({
    // `resetToken` is the canonical field. `token` remains accepted so older
    // clients keep working during the rollout.
    resetToken: resetTokenSchema.optional(),
    token: resetTokenSchema.optional(),

    newPassword: strongPasswordSchema,
    confirmPassword: z.string().optional(),
  })
  .strict()
  .refine((data) => Boolean(data.resetToken || data.token), {
    path: ['resetToken'],
    message: 'Verify your email code before choosing a new password.',
  })
  .refine(
    (data) => data.confirmPassword === undefined || data.confirmPassword === data.newPassword,
    {
      path: ['confirmPassword'],
      message: 'Passwords do not match.',
    },
  );
