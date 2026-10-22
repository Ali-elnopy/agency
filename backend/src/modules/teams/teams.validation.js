
import { z } from 'zod';

const positiveId = z.number().int().positive();

const memberIdsSchema = z
  .array(positiveId)
  .refine((ids) => new Set(ids).size === ids.length, {
    message: 'Member IDs must not contain duplicates',
  });

export const createTeamSchema = z
  .object({
    name: z.string().trim().min(2).max(100),
    description: z.string().trim().max(2000).nullable().optional(),
    memberIds: memberIdsSchema.optional(),
  })
  .strict();

export const updateTeamSchema = z
  .object({
    name: z.string().trim().min(2).max(100).optional(),
    description: z.string().trim().max(2000).nullable().optional(),
    isActive: z.boolean().optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

export const addTeamMemberSchema = z
  .object({
    userId: positiveId,
  })
  .strict();

export const moveTeamMemberSchema = z
  .object({
    targetTeamId: positiveId,
  })
  .strict();
