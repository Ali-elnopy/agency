
import { z } from 'zod';

const positiveId = z.coerce.number().int().positive();

const year = z.number().int().min(2000).max(2100);
const month = z.number().int().min(1).max(12);

const status = z.enum([
  'DRAFT',
  'IN_REVIEW',
  'NEEDS_CHANGES',
  'APPROVED',
]);

export const createContentPlanSchema = z.object({
  brandId: positiveId,
  platformAccountId: positiveId,
  title: z.string().trim().min(1).max(200),
  year,
  month,
  monthlyGoals: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
}).strict();

export const updateContentPlanSchema = z.object({
  brandId: positiveId.optional(),
  platformAccountId: positiveId.optional(),
  title: z.string().trim().min(1).max(200).optional(),
  year: year.optional(),
  month: month.optional(),
  monthlyGoals: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
}).strict();

export const updateContentPlanStatusSchema = z.object({
  status,
}).strict();
