import { z } from 'zod';

const positiveId = z.coerce.number().int().positive();

const date = z.coerce.date();

const contentType = z
  .string()
  .trim()
  .min(1)
  .max(50);

export const createContentItemSchema = z
  .object({
    contentPlanId: positiveId,

    campaignId: positiveId.nullable().optional(),

    scheduledDate: date,

    type: contentType,

    title: z
      .string()
      .trim()
      .min(1)
      .max(200),

    reference: z
      .string()
      .trim()
      .max(5000)
      .nullable()
      .optional(),

    toneOfVoice: z
      .string()
      .trim()
      .max(5000)
      .nullable()
      .optional(),

    caption: z
      .string()
      .trim()
      .max(10000)
      .nullable()
      .optional(),

    notes: z
      .string()
      .trim()
      .max(5000)
      .nullable()
      .optional(),
  })
  .strict();

export const updateContentItemSchema = z
  .object({
    contentPlanId: positiveId.optional(),

    campaignId: positiveId.nullable().optional(),

    scheduledDate: date.optional(),

    type: contentType.optional(),

    title: z
      .string()
      .trim()
      .min(1)
      .max(200)
      .optional(),

    reference: z
      .string()
      .trim()
      .max(5000)
      .nullable()
      .optional(),

    toneOfVoice: z
      .string()
      .trim()
      .max(5000)
      .nullable()
      .optional(),

    caption: z
      .string()
      .trim()
      .max(10000)
      .nullable()
      .optional(),

    notes: z
      .string()
      .trim()
      .max(5000)
      .nullable()
      .optional(),
  })
  .strict();