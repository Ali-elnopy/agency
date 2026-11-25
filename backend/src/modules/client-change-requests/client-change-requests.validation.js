import { z } from 'zod';

const positiveId = z.coerce.number().int().positive();

const changeRequestStatus = z.enum(['PENDING', 'ACCEPTED', 'RESOLVED']);

const priority = z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']);

export const clientReviewSchema = z
  .object({
    decision: z.enum(['APPROVE', 'REQUEST_CHANGES']),
    notes: z.string().trim().max(5000).nullable().optional(),
  })
  .strict()
  .refine(
    (data) =>
      data.decision !== 'REQUEST_CHANGES' ||
      (typeof data.notes === 'string' && data.notes.trim().length > 0),
    {
      path: ['notes'],
      message: 'Notes are required when requesting changes',
    },
  );

export const listClientChangeRequestsQuerySchema = z
  .object({
    status: changeRequestStatus.optional(),
    contentItemId: positiveId.optional(),
    brandId: positiveId.optional(),
  })
  .strict();

export const resolveClientChangeRequestSchema = z
  .object({
    notes: z.string().trim().max(5000).nullable().optional(),
  })
  .strict();

export const forwardClientChangeRequestSchema = z
  .object({
    notes: z.string().trim().max(5000).nullable().optional(),
    assignedTo: positiveId.optional(),
    priority: priority.optional(),
    plannedDeadline: z.coerce.date().optional(),
  })
  .strict();
