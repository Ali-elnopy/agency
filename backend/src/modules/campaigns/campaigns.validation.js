import { z } from 'zod';

const positiveId = z.coerce.number().int().positive();

const date = z.coerce.date();

export const createCampaignSchema = z
  .object({
    contentPlanId: positiveId,
    name: z.string().trim().min(1).max(200),
    objective: z.string().trim().max(5000).nullable().optional(),
    startDate: date,
    endDate: date,
  })
  .strict()
  .refine((data) => data.startDate <= data.endDate, {
    message: 'Start date must be before or equal to end date',
    path: ['endDate'],
  });

export const updateCampaignSchema = z
  .object({
    contentPlanId: positiveId.optional(),
    name: z.string().trim().min(1).max(200).optional(),
    objective: z.string().trim().max(5000).nullable().optional(),
    startDate: date.optional(),
    endDate: date.optional(),
  })
  .strict()
  .refine(
    (data) =>
      data.startDate === undefined ||
      data.endDate === undefined ||
      data.startDate <= data.endDate,
    {
      message: 'Start date must be before or equal to end date',
      path: ['endDate'],
    },
  );