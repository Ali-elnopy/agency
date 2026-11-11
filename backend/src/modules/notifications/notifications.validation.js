
import { z } from 'zod';

const positiveId = z.coerce.number().int().positive();

export const notificationIdParamsSchema = z
    .object({
        id: positiveId,
    })
    .strict();
