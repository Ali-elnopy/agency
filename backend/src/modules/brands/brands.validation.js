import { z } from 'zod';

const name = z
  .string()
  .trim()
  .min(1, 'Brand name is required')
  .max(150, 'Brand name must not exceed 150 characters');

const industry = z
  .string()
  .trim()
  .max(100, 'Industry must not exceed 100 characters')
  .nullable()
  .optional();

const websiteUrl = z
  .string()
  .trim()
  .url('Website URL must be valid')
  .nullable()
  .optional();

const description = z.string().trim().nullable().optional();

const teamId = z.number().int().positive().nullable().optional();

const accountManagerId = z.number().int().positive().nullable().optional();

export const createBrandSchema = z
  .object({
    name,
    industry,
    websiteUrl,
    description,
    teamId,
    accountManagerId,
  })
  .strict();

export const updateBrandSchema = z
  .object({
    name: name.optional(),
    industry,
    websiteUrl,
    description,
    teamId,
    accountManagerId,
    status: z.enum(['active', 'paused', 'archived']).optional(),
  })
  .strict();
