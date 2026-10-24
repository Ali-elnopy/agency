
import { z } from 'zod';

const manageableRoleName = z.enum([
  'ADMIN',
  'ACCOUNT_MANAGER',
  'TEAM_LEADER',
  'EMPLOYEE',
]);

const passwordSchema = z
  .string()
  .min(12, 'Password must be at least 12 characters')
  .max(128, 'Password must not exceed 128 characters')
  .regex(/[a-z]/, 'Password must contain a lowercase letter')
  .regex(/[A-Z]/, 'Password must contain an uppercase letter')
  .regex(/[0-9]/, 'Password must contain a number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain a special character');

export const createUserSchema = z
  .object({
    fullName: z.string().trim().min(2).max(150),

    email: z
      .string()
      .trim()
      .email()
      .max(255)
      .transform((value) => value.toLowerCase()),

    password: passwordSchema,

    phone: z.string().trim().max(30).nullable().optional(),

    roleName: manageableRoleName,

    jobTitleId: z.number().int().positive().nullable().optional(),
    customJobTitle: z.string().trim().min(1).max(100).nullable().optional(),
    teamId: z.number().int().positive().nullable().optional(),
  })
  .strict();

export const updateUserSchema = z
  .object({
    fullName: z.string().trim().min(2).max(150).optional(),

    email: z
      .string()
      .trim()
      .email()
      .max(255)
      .transform((value) => value.toLowerCase())
      .optional(),

    phone: z.string().trim().max(30).nullable().optional(),

    roleName: manageableRoleName.optional(),

    jobTitleId: z.number().int().positive().nullable().optional(),
    customJobTitle: z.string().trim().min(1).max(100).nullable().optional(),
    teamId: z.number().int().positive().nullable().optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });
