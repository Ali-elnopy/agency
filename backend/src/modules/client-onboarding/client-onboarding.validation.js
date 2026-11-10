
import { z } from 'zod';

export const selectTemplateSchema = z
    .object({
        mainCategory: z
            .string()
            .trim()
            .min(1, 'Main category is required')
            .max(30),
        activityType: z
            .string()
            .trim()
            .max(50)
            .optional(),
    })
    .strict();

export const getTemplateSchema = z
    .object({
        mainCategory: z
            .string()
            .trim()
            .min(1, 'Main category is required')
            .max(30),
        activityType: z
            .string()
            .trim()
            .max(50)
            .optional(),
    })
    .strict();

export const saveAnswersSchema = z
    .object({
        answers: z
            .array(
                z
                    .object({
                        questionCode: z
                            .string()
                            .trim()
                            .min(1)
                            .max(100),
                        answer: z.unknown(),
                    })
                    .strict(),
            )
            .min(1, 'At least one answer is required'),
    })
    .strict();
