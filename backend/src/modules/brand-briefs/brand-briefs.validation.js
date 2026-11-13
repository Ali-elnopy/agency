import { z } from 'zod';

const positiveId = z.coerce.number().int().positive();

const briefStatus = z.enum([
  'GENERATED',
  'APPROVED',
  'NEEDS_CHANGES',
  'REJECTED',
]);

export const listBriefsQuerySchema = z
  .object({
    brandId: positiveId.optional(),
    status: briefStatus.optional(),
  })
  .strict();

export const updateBriefSchema = z
  .object({
    status: briefStatus.optional(),
    content: z.record(z.string(), z.unknown()).optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });
