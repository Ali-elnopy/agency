
import { z } from 'zod';

const positiveId = z.coerce.number().int().positive();

export const createPlatformAccountSchema = z.object({
  brandId: positiveId,
  platform: z.string().trim().min(1).max(30),
  accountName: z.string().trim().min(1).max(200),
  accountUrl: z.string().trim().url().nullable().optional(),
}).strict();

export const updatePlatformAccountSchema = z.object({
  brandId: positiveId.optional(),
  platform: z.string().trim().min(1).max(30).optional(),
  accountName: z.string().trim().min(1).max(200).optional(),
  accountUrl: z.string().trim().url().nullable().optional(),
}).strict();

export const updatePlatformAccountStatusSchema = z.object({
  isActive: z.boolean(),
}).strict();
