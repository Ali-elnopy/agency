import { z } from 'zod';

const positiveId = z.coerce.number().int().positive();

const date = z.coerce.date();

const contentType = z
  .string()
  .trim()
  .min(1)
  .max(50);

export const PUBLISH_STATUSES = [
  'NOT_PUBLISHED',
  'SCHEDULED',
  'PUBLISHED',
  'FAILED',
];

export const CLIENT_REVIEW_STATUSES = [
  'NOT_READY',
  'PENDING_CLIENT_REVIEW',
  'CHANGES_REQUESTED',
  'IN_MODIFICATION',
  'APPROVED',
];

const httpUrlSchema = z
  .string()
  .trim()
  .max(2000)
  .url('Publish URL must be a valid URL')
  .refine(
    (value) => {
      try {
        const parsed = new URL(value);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
      } catch {
        return false;
      }
    },
    { message: 'Publish URL must use http or https protocol' },
  );

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

    materialUrl: httpUrlSchema.nullable().optional(),

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

    changeReason: z
      .string()
      .trim()
      .max(1000)
      .nullable()
      .optional(),
  })
  .strict();

export const listRevisionsQuerySchema = z
  .object({
    order: z.enum(['asc', 'desc']).optional(),
  })
  .strict();

export const updatePublishingSchema = z
  .object({
    publishStatus: z.enum(PUBLISH_STATUSES),

    publishUrl: httpUrlSchema.nullable().optional(),

    publishedAt: date.nullable().optional(),

    publishNotes: z
      .string()
      .trim()
      .max(2000)
      .nullable()
      .optional(),
  })
  .strict();

export const calendarQuerySchema = z
  .object({
    from: date.optional(),
    to: date.optional(),
    brandId: positiveId.optional(),
    campaignId: positiveId.optional(),
    contentType: contentType.optional(),
    platformAccountId: positiveId.optional(),
    clientReviewStatus: z.enum(CLIENT_REVIEW_STATUSES).optional(),
    publishStatus: z.enum(PUBLISH_STATUSES).optional(),
  })
  .strict()
  .refine(
    (data) => !(data.from && data.to && data.from > data.to),
    {
      message: '"from" date must be earlier than or equal to "to" date',
      path: ['from'],
    },
  );
