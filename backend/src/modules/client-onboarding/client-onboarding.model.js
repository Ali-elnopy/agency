
import { prisma } from '../../config/prisma.js';

export const ClientOnboardingModel = {
    findBrandByClientId(clientId) {
        return prisma.brand.findUnique({
            where: { clientId },
            select: {
                id: true,
                name: true,
                clientId: true,
                accountManagerId: true,
                onboarding: {
                    include: {
                        answers: true,
                    },
                },
            },
        });
    },

    findBrandWithOnboarding(brandId) {
        return prisma.brand.findUnique({
            where: { id: brandId },
            select: {
                id: true,
                name: true,
                clientId: true,
                accountManagerId: true,
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

    submitWithNotification({
        onboardingId,
        recipientId,
        title,
        message,
        data,
    }) {
        return prisma.$transaction(async (tx) => {
            // Prevent duplicate submissions and duplicate notifications
            // if two submit requests arrive at the same time.
            const updateResult = await tx.clientOnboarding.updateMany({
                where: {
                    id: onboardingId,
                    status: { not: 'SUBMITTED' },
                },
                data: {
                    status: 'SUBMITTED',
                    submittedAt: new Date(),
                },
            });

            if (updateResult.count !== 1) {
                return null;
            }

            const onboarding = await tx.clientOnboarding.findUnique({
                where: { id: onboardingId },
                include: { answers: true },
            });

            await tx.notification.create({
                data: {
                    recipientId,
                    type: 'ONBOARDING_SUBMITTED',
                    title,
                    message,
                    data,
                },
            });

            return onboarding;
        });
    },
};
