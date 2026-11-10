
import { Router } from 'express';

import { ClientOnboardingController } from './client-onboarding.controller.js';
import {
    selectTemplateSchema,
    getTemplateSchema,
    saveAnswersSchema,
} from './client-onboarding.validation.js';

import { authenticate } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';

export const clientOnboardingRouter = Router();

clientOnboardingRouter.use(authenticate);

clientOnboardingRouter.get(
    '/categories',
    ClientOnboardingController.getCategories,
);

clientOnboardingRouter.get(
    '/template',
    validate(getTemplateSchema, 'query'),
    ClientOnboardingController.getTemplate,
);

clientOnboardingRouter.get(
    '/me',
    ClientOnboardingController.getMyOnboarding,
);

clientOnboardingRouter.put(
    '/selection',
    validate(selectTemplateSchema),
    ClientOnboardingController.selectTemplate,
);

clientOnboardingRouter.put(
    '/answers',
    validate(saveAnswersSchema),
    ClientOnboardingController.saveAnswers,
);

clientOnboardingRouter.post(
    '/submit',
    ClientOnboardingController.submit,
);
