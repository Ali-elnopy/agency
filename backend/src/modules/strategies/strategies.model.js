
import { prisma } from '../../config/prisma.js';

const strategySelect = {
    id: true,
    brandId: true,
    title: true,
    status: true,
    createdAt: true,
    updatedAt: true,
    brand: {
        select: {
            id: true,
            name: true,
            clientId: true,
            accountManagerId: true,
            teamId: true,
        },
    },
    versions: {
        orderBy: {
            version: 'desc',
        },
        select: {
            id: true,
            strategyId: true,
            version: true,
            fileName: true,
            mimeType: true,
            fileSize: true,
            uploadedById: true,
            createdAt: true,
            uploadedBy: {
                select: {
                    id: true,
                    fullName: true,
                },
            },
            feedback: {
                orderBy: {
                    createdAt: 'desc',
                },
                select: {
                    id: true,
                    requestedBy: true,
                    message: true,
                    status: true,
                    createdAt: true,
                    resolvedAt: true,
                    requester: {
                        select: {
                            id: true,
                            fullName: true,
                        },
                    },
                },
            },
            approvals: {
                orderBy: {
                    createdAt: 'desc',
                },
                select: {
                    id: true,
                    approverId: true,
                    approverType: true,
                    decision: true,
                    comment: true,
                    createdAt: true,
                    approver: {
                        select: {
                            id: true,
                            fullName: true,
                        },
                    },
                },
            },
        },
    },
};

export const StrategiesModel = {
    async findBrandById(brandId) {
        return prisma.brand.findUnique({
            where: { id: brandId },
            select: {
                id: true,
                name: true,
                clientId: true,
                accountManagerId: true,
                teamId: true,
                team: {
                    select: {
                        memberships: {
                            select: {
                                userId: true,
                            },
                        },
                    },
                },
            },
        });
    },

    async create(data) {
        return prisma.strategy.create({
            data,
            select: strategySelect,
        });
    },

    async findMany(where = {}) {
        return prisma.strategy.findMany({
            where,
            orderBy: {
                updatedAt: 'desc',
            },
            select: strategySelect,
        });
    },

    async findById(id) {
        return prisma.strategy.findUnique({
            where: { id },
            select: strategySelect,
        });
    },

    async update(id, data) {
        return prisma.strategy.update({
            where: { id },
            data,
            select: strategySelect,
        });
    },

    async remove(id) {
        return prisma.strategy.delete({
            where: { id },
        });
    },

    async findLatestVersion(strategyId) {
        return prisma.strategyVersion.findFirst({
            where: { strategyId },
            orderBy: {
                version: 'desc',
            },
        });
    },

    async createVersionAndUpdateStrategy({ strategyId, versionData }) {
        return prisma.$transaction(async (tx) => {
            const version = await tx.strategyVersion.create({
                data: versionData,
                select: {
                    id: true,
                    strategyId: true,
                    version: true,
                    fileName: true,
                    mimeType: true,
                    fileSize: true,
                    uploadedById: true,
                    createdAt: true,
                },
            });

            // A new version addresses outstanding feedback on older versions.
            await tx.strategyFeedback.updateMany({
                where: {
                    status: 'OPEN',
                    version: {
                        strategyId,
                    },
                },
                data: {
                    status: 'ADDRESSED',
                    resolvedAt: new Date(),
                },
            });

            await tx.strategy.update({
                where: { id: strategyId },
                data: {
                    status: 'PENDING_ACCOUNT_MANAGER',
                },
            });

            return version;
        });
    },

    async findVersion(strategyId, versionId) {
        return prisma.strategyVersion.findFirst({
            where: {
                id: versionId,
                strategyId,
            },
            select: {
                id: true,
                strategyId: true,
                version: true,
                storageKey: true,
                fileName: true,
                mimeType: true,
                fileSize: true,
                uploadedById: true,
                createdAt: true,
            },
        });
    },

    async hasOpenFeedback(versionId) {
        const count = await prisma.strategyFeedback.count({
            where: {
                versionId,
                status: 'OPEN',
            },
        });

        return count > 0;
    },

    async findApproval(versionId, approverType) {
        return prisma.strategyApproval.findUnique({
            where: {
                versionId_approverType: {
                    versionId,
                    approverType,
                },
            },
        });
    },

    async createFeedback({ strategyId, ...feedbackData }) {
        return prisma.$transaction(async (tx) => {
            const feedback = await tx.strategyFeedback.create({
                data: feedbackData,
                select: {
                    id: true,
                    versionId: true,
                    requestedBy: true,
                    message: true,
                    status: true,
                    createdAt: true,
                    resolvedAt: true,
                },
            });

            await tx.strategy.update({
                where: { id: strategyId },
                data: {
                    status: 'CHANGES_REQUESTED',
                },
            });

            return feedback;
        });
    },

    async approveVersion({
        strategyId,
        versionId,
        approverId,
        approverType,
        comment,
    }) {
        return prisma.$transaction(async (tx) => {
            const approval = await tx.strategyApproval.upsert({
                where: {
                    versionId_approverType: {
                        versionId,
                        approverType,
                    },
                },
                create: {
                    versionId,
                    approverId,
                    approverType,
                    decision: 'APPROVED',
                    comment: comment ?? null,
                },
                update: {
                    approverId,
                    decision: 'APPROVED',
                    comment: comment ?? null,
                    createdAt: new Date(),
                },
                select: {
                    id: true,
                    versionId: true,
                    approverId: true,
                    approverType: true,
                    decision: true,
                    comment: true,
                    createdAt: true,
                },
            });

            const approvals = await tx.strategyApproval.findMany({
                where: {
                    versionId,
                },
                select: {
                    approverType: true,
                    decision: true,
                },
            });

            const managerApproved = approvals.some(
                (item) =>
                    item.approverType === 'ACCOUNT_MANAGER' &&
                    item.decision === 'APPROVED',
            );

            const clientApproved = approvals.some(
                (item) =>
                    item.approverType === 'CLIENT' &&
                    item.decision === 'APPROVED',
            );

            let status = 'PENDING_ACCOUNT_MANAGER';

            if (managerApproved && !clientApproved) {
                status = 'PENDING_CLIENT';
            }

            if (managerApproved && clientApproved) {
                status = 'APPROVED';
            }

            await tx.strategy.update({
                where: { id: strategyId },
                data: { status },
            });

            return {
                approval,
                strategyStatus: status,
            };
        });
    },
};
