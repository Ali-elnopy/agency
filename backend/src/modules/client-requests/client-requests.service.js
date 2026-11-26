
import { prisma } from '../../config/prisma.js';
import { ApiError } from '../../utils/ApiError.js';
import { getRoleName } from '../../utils/roles.js';
import { TasksService } from '../tasks/tasks.service.js';
import { ClientRequestsModel } from './client-requests.model.js';

const MANAGEMENT_ROLES = new Set([
    'ADMIN',
    'ACCOUNT_MANAGER',
]);

const REQUEST_TYPES = new Set([
    'EXTRA_CONTENT',
    'PLAN_CHANGE',
    'NEW_IDEA',
]);

function parseId(value, label = 'Id') {
    const id = Number(value);

    if (!Number.isSafeInteger(id) || id <= 0) {
        throw new ApiError(400, `${label} must be a positive integer`);
    }

    return id;
}

function ensureRole(user, allowedRoles) {
    const role = getRoleName(user);

    if (!allowedRoles.has(role)) {
        throw new ApiError(403, 'You are not allowed to perform this action');
    }
}

function ensureValidRequestType(type) {
    if (!REQUEST_TYPES.has(type)) {
        throw new ApiError(400, 'Invalid client request type');
    }
}

function ensureValidDate(value) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        throw new ApiError(400, 'Planned deadline is invalid');
    }

    if (date <= new Date()) {
        throw new ApiError(400, 'Planned deadline must be in the future');
    }

    return date;
}

function ensureBrandHasManager(brand) {
    if (!brand.accountManagerId) {
        throw new ApiError(
            400,
            'This brand does not have an assigned account manager',
        );
    }
}

async function getRequestOrThrow(value) {
    const id = parseId(value, 'Client request id');

    const clientRequest = await ClientRequestsModel.findById(id);

    if (!clientRequest) {
        throw new ApiError(404, 'Client request not found');
    }

    return clientRequest;
}

function assertCanAccessRequest(clientRequest, currentUser) {
    const role = getRoleName(currentUser);

    if (role === 'ADMIN') {
        return;
    }

    if (role === 'CLIENT') {
        if (clientRequest.clientId !== currentUser.id) {
            throw new ApiError(
                403,
                'You can only access your own client requests',
            );
        }

        return;
    }

    if (role === 'ACCOUNT_MANAGER') {
        if (clientRequest.brand?.accountManagerId !== currentUser.id) {
            throw new ApiError(
                403,
                'You can only access requests for your assigned brands',
            );
        }

        return;
    }

    throw new ApiError(403, 'You are not allowed to access client requests');
}

function buildListWhere(filters, currentUser) {
    const role = getRoleName(currentUser);
    const conditions = [];

    if (role === 'CLIENT') {
        conditions.push({
            clientId: currentUser.id,
        });
    } else if (role === 'ACCOUNT_MANAGER') {
        conditions.push({
            brand: {
                accountManagerId: currentUser.id,
            },
        });
    } else if (role !== 'ADMIN') {
        throw new ApiError(403, 'You are not allowed to access client requests');
    }

    if (filters.status) {
        conditions.push({
            status: filters.status,
        });
    }

    if (filters.type) {
        conditions.push({
            type: filters.type,
        });
    }

    if (filters.brandId !== undefined) {
        conditions.push({
            brandId: parseId(filters.brandId, 'Brand id'),
        });
    }

    return conditions.length > 0
        ? { AND: conditions }
        : {};
}

export const ClientRequestsService = {
    async create(input, currentUser) {
        if (getRoleName(currentUser) !== 'CLIENT') {
            throw new ApiError(403, 'Only clients can create client requests');
        }

        ensureValidRequestType(input.type);

        const clientId = parseId(currentUser.id, 'Client id');

        const brand = await ClientRequestsModel.findBrandByClientId(clientId);

        if (!brand) {
            throw new ApiError(404, 'No brand was found for this client');
        }

        ensureBrandHasManager(brand);

        return ClientRequestsModel.create({
            brandId: brand.id,
            clientId,
            accountManagerId: brand.accountManagerId,
            type: input.type,
            description: input.description,
            status: 'PENDING',
        });
    },

    async list(filters, currentUser) {
        const where = buildListWhere(filters, currentUser);

        return ClientRequestsModel.list(where);
    },

    async getById(value, currentUser) {
        const clientRequest = await getRequestOrThrow(value);

        assertCanAccessRequest(clientRequest, currentUser);

        return clientRequest;
    },

    async accept(value, input, currentUser) {
        ensureRole(currentUser, MANAGEMENT_ROLES);

        const id = parseId(value, 'Client request id');
        const assignedTo = parseId(input.assignedTo, 'Assignee id');
        const plannedDeadline = ensureValidDate(input.plannedDeadline);

        const clientRequest = await getRequestOrThrow(id);

        assertCanAccessRequest(clientRequest, currentUser);

        if (clientRequest.status !== 'PENDING') {
            throw new ApiError(409, 'Only pending requests can be accepted');
        }

        const brand = await ClientRequestsModel.findBrandByClientId(
            clientRequest.clientId,
        );

        if (!brand || brand.id !== clientRequest.brandId) {
            throw new ApiError(404, 'The request brand could not be found');
        }

        ensureBrandHasManager(brand);

        const role = getRoleName(currentUser);

        if (
            role === 'ACCOUNT_MANAGER' &&
            brand.accountManagerId !== currentUser.id
        ) {
            throw new ApiError(
                403,
                'You can only accept requests for your assigned brands',
            );
        }

        if (!brand.teamId) {
            throw new ApiError(
                400,
                'This brand does not have an assigned team',
            );
        }

        const employee = await ClientRequestsModel.findUserById(assignedTo);

        if (!employee) {
            throw new ApiError(404, 'Assigned employee not found');
        }

        if (!employee.isActive) {
            throw new ApiError(400, 'The assigned employee is inactive');
        }

        if (getRoleName(employee) !== 'EMPLOYEE') {
            throw new ApiError(
                400,
                'Only employees can be assigned to client requests',
            );
        }

        const membership = await ClientRequestsModel.findTeamMembership(
            brand.teamId,
            assignedTo,
        );

        if (!membership) {
            throw new ApiError(
                400,
                'The assigned employee must belong to the brand team',
            );
        }

        const now = new Date();

        try {
            return await prisma.$transaction(async (tx) => {
                // Prevent accepting the same request more than once.
                const updatedCount = await ClientRequestsModel.updatePending(
                    id,
                    {
                        status: 'ACCEPTED',
                        employeeId: assignedTo,
                        resolvedAt: now,
                    },
                    tx,
                );

                if (updatedCount.count !== 1) {
                    throw new ApiError(
                        409,
                        'This request has already been processed',
                    );
                }

                // Reuse the existing Direct Task creation logic.
                // Passing tx keeps task creation inside this transaction.
                const task = await TasksService.createDirectTask(
                    {
                        title: `Client Request: ${clientRequest.type}`,
                        description: clientRequest.description,
                        assignedTo,
                        plannedDeadline,
                        priority: input.priority ?? 'MEDIUM',
                    },
                    currentUser,
                    tx,
                );

                const updatedRequest = await tx.clientRequest.update({
                    where: { id },
                    data: {
                        relatedTaskId: task.id,
                    },
                    select: {
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
                    },
                });

                return {
                    request: updatedRequest,
                    task,
                };
            });
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }

            if (error?.code === 'P2003') {
                throw new ApiError(400, 'Invalid employee or task reference');
            }

            if (error?.code === 'P2002') {
                throw new ApiError(409, 'A task is already linked to this request');
            }

            throw error;
        }
    },

    async reject(value, input, currentUser) {
        ensureRole(currentUser, MANAGEMENT_ROLES);

        const id = parseId(value, 'Client request id');
        const clientRequest = await getRequestOrThrow(id);

        assertCanAccessRequest(clientRequest, currentUser);

        if (clientRequest.status !== 'PENDING') {
            throw new ApiError(409, 'Only pending requests can be rejected');
        }

        const now = new Date();

        const result = await ClientRequestsModel.updatePending(
            id,
            {
                status: 'REJECTED',
                rejectionReason: input.reason,
                resolvedAt: now,
            },
        );

        if (result.count !== 1) {
            throw new ApiError(
                409,
                'This request has already been processed',
            );
        }

        return ClientRequestsModel.findById(id);
    },
};
