
import { prisma } from '../../config/prisma.js';

const clientRequestSelect = {
    id: true,
    brandId: true,
    clientId: true,
    accountManagerId: true,
    employeeId: true,
    type: true,
    description: true,
    status: true,
    rejectionReason: true,
    relatedTaskId: true,
    resolvedAt: true,
    createdAt: true,
    updatedAt: true,

    brand: {
        select: {
            id: true,
            clientId: true,
            accountManagerId: true,
            teamId: true,
        },
    },

    client: {
        select: {
            id: true,
            fullName: true,
            email: true,
        },
    },

    accountManager: {
        select: {
            id: true,
            fullName: true,
            email: true,
        },
    },

    employee: {
        select: {
            id: true,
            fullName: true,
            email: true,
        },
    },

    relatedTask: {
        select: {
            id: true,
            type: true,
            title: true,
            status: true,
            priority: true,
            assignedTo: true,
            plannedDeadline: true,
        },
    },
};

export const ClientRequestsModel = {
    findBrandByClientId(clientId, db = prisma) {
        return db.brand.findUnique({
            where: { clientId },
            select: {
                id: true,
                clientId: true,
                accountManagerId: true,
                teamId: true,
            },
        });
    },

    findById(id, db = prisma) {
        return db.clientRequest.findUnique({
            where: { id },
            select: clientRequestSelect,
        });
    },

    list(where = {}, db = prisma) {
        return db.clientRequest.findMany({
            where,
            select: clientRequestSelect,
            orderBy: {
                createdAt: 'desc',
            },
        });
    },

    create(data, db = prisma) {
        return db.clientRequest.create({
            data,
            select: clientRequestSelect,
        });
    },

    findTeamMembership(teamId, userId, db = prisma) {
        return db.teamMembership.findUnique({
            where: {
                teamId_userId: {
                    teamId,
                    userId,
                },
            },
            select: {
                teamId: true,
                userId: true,
            },
        });
    },

    findUserById(id, db = prisma) {
        return db.user.findUnique({
            where: { id },
            select: {
                id: true,
                fullName: true,
                email: true,
                isActive: true,
                role: {
                    select: {
                        name: true,
                    },
                },
            },
        });
    },

    updatePending(id, data, db = prisma) {
        return db.clientRequest.updateMany({
            where: {
                id,
                status: 'PENDING',
            },
            data,
        });
    },
};
