
import { z } from 'zod';

export const createBrandSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Brand name is required')
      .max(150, 'Brand name must not exceed 150 characters'),

    industry: z
      .string()
      .trim()
      .max(100, 'Industry must not exceed 100 characters')
      .nullable()
      .optional(),

    websiteUrl: z
      .string()
      .trim()
      .url('Website URL must be valid')
      .nullable()
      .optional(),

    description: z.string().trim().nullable().optional(),

    teamId: z.number().int().positive().nullable().optional(),

    accountManagerId: z.number().int().positive().nullable().optional(),
  })
  .strict();
