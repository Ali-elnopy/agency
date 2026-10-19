import { z } from 'zod';
import { passwordField } from '../auth/auth.validation.js';

const role = z.enum(['ADMIN', 'ACCOUNT_MANAGER', 'EMPLOYEE', 'CLIENT']);

export const idParam = z.object({ id: z.string().uuid() });

export const createUserSchema = z.object({
  email: z.string().email().toLowerCase(),
  fullName: z.string().min(2).max(100),
  phone: z.string().max(30).optional(),
  role,
  password: passwordField,
});

export const updateUserSchema = z
  .object({
    fullName: z.string().min(2).max(100),
    phone: z.string().max(30).nullable(),
    role,
    isActive: z.boolean(),
  })
  .partial()
  .refine((d) => Object.keys(d).length > 0, 'No fields to update');

export const listUsersQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  role: role.optional(),
  search: z.string().optional(),
});
