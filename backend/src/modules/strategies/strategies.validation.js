
import { z } from 'zod';

const positiveId = z.coerce.number().int().positive();

export const createStrategySchema = z
    .object({
        brandId: positiveId,
        title: z.string().trim().min(1).max(200),
    })
    .strict();

export const updateStrategySchema = z
    .object({
        title: z.string().trim().min(1).max(200).optional(),
    })
    .strict()
    .refine((data) => Object.keys(data).length > 0, {
        message: 'At least one field must be provided',
    });

export const strategyFeedbackSchema = z
    .object({
        message: z.string().trim().min(1).max(5000),
    })
    .strict();

export const strategyApprovalSchema = z
    .object({
        comment: z.string().trim().max(5000).nullable().optional(),
    })
    .strict();
