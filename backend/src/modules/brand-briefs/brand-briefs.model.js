
import { prisma } from '../../config/prisma.js';

export const BrandBriefsModel = {
    findBrandForGeneration(brandId) {
        return prisma.brand.findUnique({
            where: { id: brandId },
            select: {
                id: true,
                name: true,
                industry: true,
                description: true,
                websiteUrl: true,
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

    findLatestByOnboardingId(onboardingId) {
        return prisma.brandBrief.findFirst({
            where: { onboardingId },
            orderBy: { version: 'desc' },
        });
    },

    findNextVersion(onboardingId) {
        return prisma.brandBrief.aggregate({
            where: { onboardingId },
            _max: {
                version: true,
            },
        });
    },

    create(data) {
        return prisma.brandBrief.create({
            data,
        });
    },

    updateStatus(id, status, errorMessage = null) {
        return prisma.brandBrief.update({
            where: { id },
            data: {
                status,
                errorMessage,
            },
        });
    },

    saveGeneratedContent(id, { content, modelName }) {
        return prisma.brandBrief.update({
            where: { id },
            data: {
                content,
                modelName,
                status: 'GENERATED',
                errorMessage: null,
                generatedAt: new Date(),
            },
        });
    },
};
