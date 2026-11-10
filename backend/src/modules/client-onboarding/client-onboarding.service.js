
import fs from 'node:fs';

import { ClientOnboardingModel } from './client-onboarding.model.js';
import { ApiError } from '../../utils/ApiError.js';

const templateBundle = JSON.parse(
    fs.readFileSync(
        new URL(
            './templates/agency_client_onboarding_templates.json',
            import.meta.url,
        ),
        'utf8',
    ),
);

const TEMPLATE_VERSION = templateBundle.schema_version;

function ensureClient(user) {
    if (user?.role?.name !== 'CLIENT') {
        throw new ApiError(403, 'Only clients can access onboarding');
    }

    if (!user.id) {
        throw new ApiError(401, 'Authenticated client not found');
    }
}

function getCategory(categoryCode) {
    const category = templateBundle.onboarding_flow.main_categories.find(
        (item) => item.code === categoryCode,
    );

    if (!category) {
        throw new ApiError(400, 'Invalid onboarding category');
    }

    return category;
}

function buildTemplate(mainCategory, activityType) {
    const category = getCategory(mainCategory);

    let selectedActivity;

    if (category.requires_subtype) {
        if (!activityType || typeof activityType !== 'string') {
            throw new ApiError(400, 'Activity type is required');
        }

        selectedActivity = category.subtypes.find(
            (item) => item.code === activityType,
        );

        if (!selectedActivity) {
            throw new ApiError(400, 'Invalid activity type');
        }
    } else {
        if (activityType && activityType !== category.code) {
            throw new ApiError(400, 'This category does not support activity types');
        }
    }

    const compositionKey = selectedActivity
        ? selectedActivity.composition
        : category.template_code;

    const templateCodes = templateBundle.compositions[compositionKey];

    if (!Array.isArray(templateCodes) || templateCodes.length === 0) {
        throw new ApiError(500, 'Onboarding template composition is invalid');
    }

    const uniqueTemplateCodes = [...new Set(templateCodes)];
    const sections = [];

    for (const templateCode of uniqueTemplateCodes) {
        const template = templateBundle.templates[templateCode];

        if (!template) {
            throw new ApiError(
                500,
                `Onboarding template "${templateCode}" was not found`,
            );
        }

        for (const section of template.sections) {
            sections.push({
                ...section,
                templateCode,
            });
        }
    }

    const questions = sections.flatMap((section) => section.questions);

    return {
        mainCategory,
        activityType: selectedActivity
            ? selectedActivity.code
            : category.code,
        templateVersion: TEMPLATE_VERSION,
        templateCodes: uniqueTemplateCodes,
        sections,
        questions,
    };
}

function validateAnswer(question, answer) {
    if (answer === null || answer === undefined) {
        return;
    }

    switch (question.type) {
        case 'text':
        case 'textarea':
            if (typeof answer !== 'string') {
                throw new ApiError(
                    400,
                    `Answer for "${question.code}" must be text`,
                );
            }
            break;

        case 'single_select':
            if (
                typeof answer !== 'string' ||
                !question.options?.includes(answer)
            ) {
                throw new ApiError(
                    400,
                    `Invalid selected option for "${question.code}"`,
                );
            }
            break;

        case 'multi_select':
            if (
                !Array.isArray(answer) ||
                !answer.every(
                    (item) =>
                        typeof item === 'string' &&
                        question.options?.includes(item),
                )
            ) {
                throw new ApiError(
                    400,
                    `Invalid selected options for "${question.code}"`,
                );
            }
            break;

        case 'boolean':
            if (typeof answer !== 'boolean') {
                throw new ApiError(
                    400,
                    `Answer for "${question.code}" must be true or false`,
                );
            }
            break;

        default:
            throw new ApiError(400, 'Unsupported question answer type');
    }
}

async function getClientBrand(user) {
    ensureClient(user);

    const brand = await ClientOnboardingModel.findBrandByClientId(user.id);

    if (!brand) {
        throw new ApiError(404, 'No brand is linked to this client');
    }

    return brand;
}

export const ClientOnboardingService = {
    getAvailableCategories(user) {
        ensureClient(user);

        return {
            categories: templateBundle.onboarding_flow.main_categories,
        };
    },

    getTemplate(user, mainCategory, activityType) {
        ensureClient(user);

        return buildTemplate(mainCategory, activityType);
    },

    async getMyOnboarding(user) {
        const brand = await getClientBrand(user);

        return {
            brand: {
                id: brand.id,
                name: brand.name,
            },
            onboarding: brand.onboarding,
        };
    },

    async selectTemplate(user, { mainCategory, activityType }) {
        const brand = await getClientBrand(user);

        const template = buildTemplate(mainCategory, activityType);

        const existingOnboarding = brand.onboarding;

        if (existingOnboarding?.status === 'SUBMITTED') {
            throw new ApiError(
                409,
                'Submitted onboarding cannot be changed',
            );
        }

        const validQuestionCodes = template.questions.map(
            (question) => question.code,
        );

        if (!existingOnboarding) {
            return ClientOnboardingModel.create({
                brandId: brand.id,
                mainCategory: template.mainCategory,
                activityType: template.activityType,
                templateVersion: template.templateVersion,
                status: 'DRAFT',
            });
        }

        return ClientOnboardingModel.updateSelection({
            onboardingId: existingOnboarding.id,
            mainCategory: template.mainCategory,
            activityType: template.activityType,
            templateVersion: template.templateVersion,
            validQuestionCodes,
        });
    },

    async saveAnswers(user, answers) {
        const brand = await getClientBrand(user);
        const onboarding = brand.onboarding;

        if (!onboarding) {
            throw new ApiError(
                400,
                'Select an onboarding category before saving answers',
            );
        }

        if (onboarding.status === 'SUBMITTED') {
            throw new ApiError(
                409,
                'Submitted onboarding cannot be changed',
            );
        }

        if (!Array.isArray(answers) || answers.length === 0) {
            throw new ApiError(400, 'Answers must be a non-empty array');
        }

        const template = buildTemplate(
            onboarding.mainCategory,
            onboarding.activityType,
        );

        const questionsByCode = new Map(
            template.questions.map((question) => [
                question.code,
                question,
            ]),
        );

        const receivedCodes = new Set();

        for (const item of answers) {
            if (
                !item ||
                typeof item.questionCode !== 'string' ||
                !Object.prototype.hasOwnProperty.call(item, 'answer')
            ) {
                throw new ApiError(
                    400,
                    'Each answer must contain questionCode and answer',
                );
            }

            if (receivedCodes.has(item.questionCode)) {
                throw new ApiError(
                    400,
                    `Duplicate answer for "${item.questionCode}"`,
                );
            }

            receivedCodes.add(item.questionCode);

            const question = questionsByCode.get(item.questionCode);

            if (!question) {
                throw new ApiError(
                    400,
                    `Question "${item.questionCode}" does not belong to the selected template`,
                );
            }

            validateAnswer(question, item.answer);
        }

        for (const item of answers) {
            await ClientOnboardingModel.upsertAnswers(
                onboarding.id,
                answers,
            );
        }

        return ClientOnboardingModel.findByBrandId(brand.id);
    },

    async submit(user) {
        const brand = await getClientBrand(user);
        const onboarding = brand.onboarding;

        if (!onboarding) {
            throw new ApiError(
                400,
                'Select an onboarding category before submitting',
            );
        }

        if (onboarding.status === 'SUBMITTED') {
            throw new ApiError(409, 'Onboarding has already been submitted');
        }

        const template = buildTemplate(
            onboarding.mainCategory,
            onboarding.activityType,
        );

        const answeredCodes = new Set(
            onboarding.answers.map((item) => item.questionCode),
        );

        const missingRequiredQuestions = template.questions
            .filter(
                (question) =>
                    question.required && !answeredCodes.has(question.code),
            )
            .map((question) => question.code);

        if (missingRequiredQuestions.length > 0) {
            throw new ApiError(
                400,
                'Some required onboarding questions are missing',
            );
        }

        return ClientOnboardingModel.updateStatus(
            onboarding.id,
            'SUBMITTED',
        );
    },
};
