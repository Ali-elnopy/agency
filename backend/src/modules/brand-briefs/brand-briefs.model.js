
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

    list({ brandId, status, accountManagerId } = {}) {
        const onboardingFilter = {
            ...(brandId ? { brandId } : {}),
            ...(accountManagerId
                ? { brand: { accountManagerId } }
                : {}),
        };

        return prisma.brandBrief.findMany({
            where: {
                ...(status ? { status } : {}),
                ...(Object.keys(onboardingFilter).length
                    ? { onboarding: onboardingFilter }
                    : {}),
            },
            orderBy: [{ createdAt: 'desc' }],
            include: {
                onboarding: {
                    select: {
                        id: true,
                        brandId: true,
                        status: true,
                        brand: {
                            select: {
                                id: true,
                                name: true,
                                accountManagerId: true,
                            },
                        },
                    },
                },
                generatedBy: {
                    select: { id: true, fullName: true },
                },
            },
        });
    },

    findById(id) {
        return prisma.brandBrief.findUnique({
            where: { id },
            include: {
                onboarding: {
                    select: {
                        id: true,
                        brandId: true,
                        status: true,
                        brand: {
                            select: {
                                id: true,
                                name: true,
                                accountManagerId: true,
                            },
                        },
                    },
                },
                generatedBy: {
                    select: { id: true, fullName: true },
                },
            },
        });
    },

    updateBrief(id, data) {
        return prisma.brandBrief.update({
            where: { id },
            data,
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
