import { z } from 'zod';

const positiveId = z.coerce.number().int().positive();
const date = z.coerce.date();

const taskStatus = z.enum([
  'TODO',
  'IN_PROGRESS',
  'SUBMITTED',
  'IN_REVIEW',
  'NEEDS_CHANGES',
  'COMPLETED',
  'CANCELLED',
]);

export const progressQuerySchema = z
  .object({
    brandId: positiveId.optional(),
    campaignId: positiveId.optional(),
    assigneeId: positiveId.optional(),
    from: date.optional(),
    to: date.optional(),
    status: taskStatus.optional(),
  })
  .strict()
  .refine(
    (data) => !(data.from && data.to && data.from > data.to),
    {
      message: '"from" date must be earlier than or equal to "to" date',
      path: ['from'],
    },
  );

export const teamPerformanceQuerySchema = z
  .object({
    from: date.optional(),
    to: date.optional(),
    teamId: positiveId.optional(),
    userId: positiveId.optional(),
    brandId: positiveId.optional(),
  })
  .strict()
  .refine(
    (data) => !(data.from && data.to && data.from > data.to),
    {
      message: '"from" date must be earlier than or equal to "to" date',
      path: ['from'],
    },
  );
