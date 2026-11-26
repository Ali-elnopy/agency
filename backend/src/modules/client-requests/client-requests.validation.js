
import { z } from 'zod';

const positiveId = z.coerce.number().int().positive();

const requestType = z.enum([
    'EXTRA_CONTENT',
    'PLAN_CHANGE',
    'NEW_IDEA',
]);

const priority = z.enum([
    'LOW',
    'MEDIUM',
    'HIGH',
    'URGENT',
]);

const date = z.coerce.date();

export const createClientRequestSchema = z.object({
    type: requestType,

    description: z
        .string()
        .trim()
        .min(1, 'Description is required')
        .max(5000),
}).strict();

export const acceptClientRequestSchema = z.object({
    assignedTo: positiveId,

    plannedDeadline: date,

    priority: priority.optional(),
}).strict();

export const rejectClientRequestSchema = z.object({
    reason: z
        .string()
        .trim()
        .min(1, 'Rejection reason is required')
        .max(5000),
}).strict();

export const clientRequestListQuerySchema = z.object({
    status: z.enum([
        'PENDING',
        'ACCEPTED',
        'REJECTED',
    ]).optional(),

    type: requestType.optional(),

    brandId: positiveId.optional(),
}).strict();
