import { z } from 'zod';

export const EMPLOYEE_PERMISSIONS = [
  'CREATE_CONTENT',
  'MANAGE_CONTENT',
  'REVIEW_CONTENT',
  'PUBLISH_CONTENT',
];

const employeePermissionEnum = z.enum([
  'CREATE_CONTENT',
  'MANAGE_CONTENT',
  'REVIEW_CONTENT',
  'PUBLISH_CONTENT',
]);

const createRoleNameEnum = z.enum([
  'ACCOUNT_MANAGER',
  'CLIENT',
  'EMPLOYEE',
]);

const updateRoleNameEnum = z.enum([
  'ADMIN',
  'ACCOUNT_MANAGER',
  'CLIENT',
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

    roleName: createRoleNameEnum,

    jobTitleId: z.number().int().positive().nullable().optional(),
    customJobTitle: z.string().trim().min(1).max(100).nullable().optional(),
    teamId: z.number().int().positive().nullable().optional(),
    permissions: z.array(employeePermissionEnum).optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.roleName !== 'EMPLOYEE' && data.permissions && data.permissions.length > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Permissions can only be assigned to the EMPLOYEE role',
        path: ['permissions'],
      });
    }
  });

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

    roleName: updateRoleNameEnum.optional(),

    jobTitleId: z.number().int().positive().nullable().optional(),
    customJobTitle: z.string().trim().min(1).max(100).nullable().optional(),
    teamId: z.number().int().positive().nullable().optional(),
    permissions: z.array(employeePermissionEnum).optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });
