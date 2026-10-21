import { z } from 'zod';

export const loginSchema = z
  .object({
    email: z.string().trim().email('Please enter a valid email address').max(255),

    password: z.string().min(1, 'Password is required').max(128, 'Password is too long'),
  })
  .strict();

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1).max(128),

    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password is too long'),
  })
  .strict()
  .refine((data) => data.currentPassword !== data.newPassword, {
    path: ['newPassword'],
    message: 'New password must differ from current password',
  });
