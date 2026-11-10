
import { prisma } from '../../config/prisma.js';

export const ClientOnboardingModel = {
    findBrandByClientId(clientId) {
        return prisma.brand.findUnique({
            where: { clientId },
            select: {
                id: true,
                name: true,
                clientId: true,
                onboarding: {
                    include: {
                        answers: true,
                    },
                },
            },
        });
    },

    findByBrandId(brandId) {
        return prisma.clientOnboarding.findUnique({
            where: { brandId },
            include: {
                answers: true,
            },
        });
    },

    create(data) {
        return prisma.clientOnboarding.create({
            data,
            include: {
                answers: true,
            },
        });
    },

    updateSelection({
        onboardingId,
        mainCategory,
        activityType,
        templateVersion,
        validQuestionCodes,
    }) {
        return prisma.$transaction(async (tx) => {
            // Remove answers that don't exist in the newly selected template.
            await tx.onboardingAnswer.deleteMany({
                where: {
                    onboardingId,
                    questionCode: {
                        notIn: validQuestionCodes,
                    },
                },
            });

            // Update the selected category and activity.
            return tx.clientOnboarding.update({
                where: { id: onboardingId },
                data: {
                    mainCategory,
                    activityType,
                    templateVersion,
                },
                include: {
                    answers: true,
                },
            });
        });
    },

    upsertAnswers(onboardingId, answers) {
        return prisma.$transaction(
            answers.map(({ questionCode, answer }) =>
                prisma.onboardingAnswer.upsert({
                    where: {
                        onboardingId_questionCode: {
                            onboardingId,
                            questionCode,
                        },
                    },
                    create: {
                        onboardingId,
                        questionCode,
                        answer,
                    },
                    update: {
                        answer,
                    },
                }),
            ),
        );
    },

    updateStatus(onboardingId, status) {
        return prisma.clientOnboarding.update({
            where: { id: onboardingId },
            data: {
                status,
                submittedAt: status === 'SUBMITTED' ? new Date() : null,
            },
            include: {
                answers: true,
            },
        });
    },
};
