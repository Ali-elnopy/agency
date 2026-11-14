
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import { ApiError } from '../../utils/ApiError.js';
import { BrandBriefsModel } from './brand-briefs.model.js';
import { generateBrandBrief } from './ai/gemini.service.js';
import { BRIEF_PROMPT_VERSION } from './ai/brief.prompt.js';

const currentDir = path.dirname(fileURLToPath(import.meta.url));

const templatesPath = path.join(
    currentDir,
    '../client-onboarding/templates/agency_client_onboarding_templates.json',
);

const templatesBundle = JSON.parse(
    readFileSync(templatesPath, 'utf8'),
);

function getRoleName(user) {
    return user?.role?.name ?? user?.role ?? '';
}

const resolveComposition = (mainCategory, activityType) => {
    const category = templatesBundle.onboarding_flow.main_categories.find(
        (item) => item.code === mainCategory,
    );

    if (!category) {
        throw new ApiError(400, 'Invalid onboarding category.');
    }

    // GENERAL and MEDICAL have no subtype.
    if (!category.requires_subtype) {
        return templatesBundle.compositions[mainCategory];
    }

    // Resolve the selected subtype using the onboarding flow.
    const subtype = category.subtypes.find(
        (item) => item.code === activityType,
    );

    if (!subtype) {
        throw new ApiError(400, 'Invalid onboarding activity type.');
    }

    return templatesBundle.compositions[subtype.composition];
};

const buildQuestionsAndAnswers = (onboarding) => {
    const composition = resolveComposition(
        onboarding.mainCategory,
        onboarding.activityType,
    );

    if (!composition?.length) {
        throw new ApiError(400, 'Could not resolve onboarding template.');
    }

    const questions = [];

    for (const templateCode of composition) {
        const template = templatesBundle.templates[templateCode];

        if (!template) {
            throw new ApiError(500, 'Onboarding template is missing.');
        }

        for (const section of template.sections) {
            for (const question of section.questions) {
                questions.push({
                    code: question.code,
                    label: question.label,
                    section: section.title,
                });
            }
        }
    }

    const answersByCode = new Map(
        onboarding.answers.map((item) => [
            item.questionCode,
            item.answer,
        ]),
    );

    return questions
        .filter((question) => {
            if (!answersByCode.has(question.code)) {
                return false;
            }

            const answer = answersByCode.get(question.code);

            if (answer === null || answer === undefined) {
                return false;
            }

            if (typeof answer === 'string' && !answer.trim()) {
                return false;
            }

            if (Array.isArray(answer) && answer.length === 0) {
                return false;
            }

            return true;
        })
        .map((question) => ({
            section: question.section,
            question: question.label,
            answer: answersByCode.get(question.code),
        }));
};

const assertCanGenerate = (user, brand) => {
    const roleName = getRoleName(user);

    if (roleName === 'ADMIN') {
        return;
    }

    if (roleName !== 'ACCOUNT_MANAGER') {
        throw new ApiError(
            403,
            'Only administrators and assigned account managers can generate Brand Briefs.',
        );
    }

    if (brand.accountManagerId !== user.id) {
        throw new ApiError(
            403,
            'You can only generate Brand Briefs for your assigned brands.',
        );
    }
};

const BRIEF_STATUS_TO_UI = {
    GENERATED: 'draft',
    APPROVED: 'approved',
    NEEDS_CHANGES: 'needs_changes',
    REJECTED: 'rejected',
    GENERATING: 'generating',
    FAILED: 'failed',
};

function toBriefDto(brief) {
    const content =
        brief.content && typeof brief.content === 'object'
            ? brief.content
            : {};

    return {
        id: `brief-${brief.id}`,
        serverId: brief.id,
        onboardingId: brief.onboardingId,
        brandId: String(brief.onboarding?.brandId ?? ''),
        brandName: brief.onboarding?.brand?.name ?? '',
        version: brief.version,
        status: BRIEF_STATUS_TO_UI[brief.status] ?? 'draft',
        backendStatus: brief.status,
        objectives: Array.isArray(content.objectives)
            ? content.objectives
            : [],
        targetAudience: content.targetAudience ?? '',
        competitors: content.competitors ?? '',
        toneOfVoice: content.toneOfVoice ?? '',
        suggestedQuestions: Array.isArray(content.suggestedQuestions)
            ? content.suggestedQuestions
            : [],
        sections: content.sections ?? null,
        notes: content.notes ?? '',
        approvedBy: content.approvedBy ?? null,
        approvedAt: content.approvedAt ?? null,
        generatedAt: brief.generatedAt ?? brief.createdAt,
        modelName: brief.modelName ?? null,
        generatedBy: brief.generatedBy?.fullName ?? null,
    };
}

function canManage(user, brand) {
    if (getRoleName(user) === 'ADMIN') {
        return true;
    }

    return (
        getRoleName(user) === 'ACCOUNT_MANAGER' &&
        brand?.accountManagerId === user.id
    );
}

function assertCanRead(user, brand) {
    const roleName = getRoleName(user);

    if (roleName === 'ADMIN') return;

    if (roleName === 'ACCOUNT_MANAGER' && brand?.accountManagerId === user.id) {
        return;
    }

    // Preserve the existing explicit employee read permission for a brief ID.
    if (roleName === 'EMPLOYEE') return;

    throw new ApiError(403, 'You cannot read this Brand Brief.');
}

function parseBriefId(value) {
    const id = Number(value);

    if (!Number.isSafeInteger(id) || id <= 0) {
        throw new ApiError(400, 'Invalid brief id.');
    }

    return id;
}

export const BrandBriefsService = {
    async list(user, filters = {}) {
        const roleName = getRoleName(user);
        let accountManagerId;

        if (roleName === 'ACCOUNT_MANAGER') {
            accountManagerId = user.id;
        } else if (roleName !== 'ADMIN') {
            throw new ApiError(403, 'You cannot read Brand Briefs.');
        }

        const briefs = await BrandBriefsModel.list({
            ...filters,
            accountManagerId,
        });

        return {
            briefs: briefs.map(toBriefDto),
            total: briefs.length,
        };
    },

    async getById(id, user) {
        const brief = await BrandBriefsModel.findById(
            parseBriefId(id),
        );

        if (!brief) {
            throw new ApiError(404, 'Brand Brief not found.');
        }

        assertCanRead(user, brief.onboarding?.brand);

        return toBriefDto(brief);
    },

    async update(id, payload, user) {
        const existing = await BrandBriefsModel.findById(
            parseBriefId(id),
        );

        if (!existing) {
            throw new ApiError(404, 'Brand Brief not found.');
        }

        if (!canManage(user, existing.onboarding?.brand)) {
            throw new ApiError(
                403,
                'Only administrators and assigned account managers can update Brand Briefs.',
            );
        }

        const currentContent =
            existing.content && typeof existing.content === 'object'
                ? existing.content
                : {};

        const nextContent = payload.content
            ? { ...currentContent, ...payload.content }
            : { ...currentContent };

        if (payload.status === 'APPROVED') {
            nextContent.approvedBy =
                user?.fullName ?? user?.email ?? 'Account Manager';
            nextContent.approvedAt = new Date().toISOString();
        }

        const updated = await BrandBriefsModel.updateBrief(
            existing.id,
            {
                ...(payload.status ? { status: payload.status } : {}),
                ...(payload.content
                    ? { content: nextContent }
                    : {}),
            },
        );

        return toBriefDto(updated);
    },

    async approve(id, comment, user) {
        return this.update(
            id,
            {
                status: 'APPROVED',
                content: {
                    ...(comment ? { notes: comment } : {}),
                },
            },
            user,
        );
    },
    async generate(brandId, user) {
        const parsedBrandId = Number(brandId);

        if (
            !Number.isInteger(parsedBrandId) ||
            parsedBrandId <= 0
        ) {
            throw new ApiError(400, 'Invalid brand ID.');
        }

        const brand = await BrandBriefsModel.findBrandForGeneration(
            parsedBrandId,
        );

        if (!brand) {
            throw new ApiError(404, 'Brand not found.');
        }

        assertCanGenerate(user, brand);

        const onboarding = brand.onboarding;

        if (!onboarding) {
            throw new ApiError(
                400,
                'This brand does not have an onboarding record.',
            );
        }

        if (onboarding.status !== 'SUBMITTED') {
            throw new ApiError(
                400,
                'The client must submit onboarding before generating a Brand Brief.',
            );
        }

        const latestBrief =
            await BrandBriefsModel.findLatestByOnboardingId(onboarding.id);

        if (latestBrief?.status === 'GENERATING') {
            throw new ApiError(
                409,
                'A Brand Brief is already being generated for this brand.',
            );
        }

        const versionData =
            await BrandBriefsModel.findNextVersion(onboarding.id);

        const nextVersion = (versionData._max.version ?? 0) + 1;

        const questionsAndAnswers =
            buildQuestionsAndAnswers(onboarding);

        const sourceSnapshot = {
            brand: {
                id: brand.id,
                name: brand.name,
                industry: brand.industry,
                description: brand.description,
                websiteUrl: brand.websiteUrl,
            },
            mainCategory: onboarding.mainCategory,
            activityType: onboarding.activityType,
            templateVersion: onboarding.templateVersion,
            questionsAndAnswers,
        };

        const brief = await BrandBriefsModel.create({
            onboardingId: onboarding.id,
            generatedById: user.id,
            version: nextVersion,
            status: 'GENERATING',
            promptVersion: BRIEF_PROMPT_VERSION,
            sourceSnapshot,
        });

        try {
            const result = await generateBrandBrief({
                brand: sourceSnapshot.brand,
                mainCategory: onboarding.mainCategory,
                activityType: onboarding.activityType,
                templateVersion: onboarding.templateVersion,
                questionsAndAnswers,
            });

            const savedBrief =
                await BrandBriefsModel.saveGeneratedContent(
                    brief.id,
                    {
                        content: result.content,
                        modelName: result.modelName,
                    },
                );

            return savedBrief;
        } catch (error) {
            console.error(
                `Brand Brief generation failed for brand ${brand.id}:`,
                error,
            );

            await BrandBriefsModel.updateStatus(
                brief.id,
                'FAILED',
                'Brand Brief generation failed. Please try again.',
            );

            throw new ApiError(
                502,
                'Brand Brief generation failed. Please try again.',
            );
        }
    },
};
