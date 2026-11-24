
import { beforeAll, afterAll, describe, it, expect, vi } from 'vitest';

import { prisma } from '../src/config/prisma.js';
import { ContentPlansService } from '../src/modules/content-plans/content-plans.service.js';
import { NotificationsModel } from '../src/modules/notifications/notifications.model.js';

describe('Content Plan Notifications - Supabase Integration', () => {
    let client;
    let accountManager;
    let brand;
    let platformAccount;
    let contentPlan;

    let originalCreate;

    const createdUserIds = [];

    beforeAll(async () => {
        // 1. Find existing roles. Never create or modify roles.
        const clientRole = await prisma.role.findUnique({
            where: { name: 'CLIENT' },
        });

        const managerRole = await prisma.role.findUnique({
            where: { name: 'ACCOUNT_MANAGER' },
        });

        if (!clientRole || !managerRole) {
            throw new Error(
                'Required roles CLIENT and ACCOUNT_MANAGER must already exist.',
            );
        }

        // 2. Create unique temporary users.
        const uniqueId = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;

        client = await prisma.user.create({
            data: {
                fullName: 'Temporary Test Client',
                email: `test-client-${uniqueId}@example.com`,
                passwordHash: 'temporary-test-hash',
                roleId: clientRole.id,
            },
        });

        createdUserIds.push(client.id);

        accountManager = await prisma.user.create({
            data: {
                fullName: 'Temporary Test Account Manager',
                email: `test-manager-${uniqueId}@example.com`,
                passwordHash: 'temporary-test-hash',
                roleId: managerRole.id,
            },
        });

        createdUserIds.push(accountManager.id);

        // 3. Create a temporary brand.
        brand = await prisma.brand.create({
            data: {
                name: `Temporary Notification Test Brand ${uniqueId}`,
                clientId: client.id,
                accountManagerId: accountManager.id,
                createdBy: accountManager.id,
            },
        });

        // 4. Create a temporary platform account.
        platformAccount = await prisma.platformAccount.create({
            data: {
                brandId: brand.id,
                platform: 'INSTAGRAM',
                accountName: `test-account-${uniqueId}`,
            },
        });

        // 5. Create a temporary content plan.
        contentPlan = await prisma.contentPlan.create({
            data: {
                brandId: brand.id,
                platformAccountId: platformAccount.id,
                title: `Temporary Notification Test Plan ${uniqueId}`,
                year: 2026,
                month: 11,
                createdBy: accountManager.id,
                status: 'DRAFT',
            },
        });

        originalCreate = NotificationsModel.create;
    });

    afterAll(async () => {
        // Restore the original model method.
        if (originalCreate) {
            NotificationsModel.create = originalCreate;
        }

        // Delete only records created by this test.
        if (createdUserIds.length > 0) {
            await prisma.notification.deleteMany({
                where: {
                    recipientId: { in: createdUserIds },
                },
            });
        }

        if (contentPlan) {
            await prisma.contentPlan.deleteMany({
                where: { id: contentPlan.id },
            });
        }

        if (platformAccount) {
            await prisma.platformAccount.deleteMany({
                where: { id: platformAccount.id },
            });
        }

        if (brand) {
            await prisma.brand.deleteMany({
                where: { id: brand.id },
            });
        }

        if (createdUserIds.length > 0) {
            await prisma.user.deleteMany({
                where: {
                    id: { in: createdUserIds },
                },
            });
        }

        await prisma.$disconnect();
    });

    it('should create notifications and rollback the status update if notification creation fails', async () => {
        const managerUser = {
            id: accountManager.id,
            role: {
                name: 'ACCOUNT_MANAGER',
            },
        };

        // -----------------------------------------
        // CASE 1: DRAFT -> IN_REVIEW
        // Expected: Client + Account Manager
        // -----------------------------------------

        const submittedPlan = await ContentPlansService.updateStatus(
            contentPlan.id,
            'IN_REVIEW',
            managerUser,
        );

        expect(submittedPlan.status).toBe('IN_REVIEW');

        let notifications = await prisma.notification.findMany({
            where: {
                recipientId: {
                    in: [client.id, accountManager.id],
                },
            },
            orderBy: { id: 'asc' },
        });

        expect(notifications).toHaveLength(2);

        expect(
            notifications.map((notification) => notification.recipientId).sort(),
        ).toEqual([client.id, accountManager.id].sort());

        expect(
            notifications.every(
                (notification) => notification.type === 'CONTENT_PLAN_SUBMITTED',
            ),
        ).toBe(true);

        // -----------------------------------------
        // CASE 2: IN_REVIEW -> APPROVED
        // Expected: Client only
        // -----------------------------------------

        const approvedPlan = await ContentPlansService.updateStatus(
            contentPlan.id,
            'APPROVED',
            managerUser,
        );

        expect(approvedPlan.status).toBe('APPROVED');

        notifications = await prisma.notification.findMany({
            where: {
                recipientId: {
                    in: [client.id, accountManager.id],
                },
            },
        });

        expect(notifications).toHaveLength(3);

        const approvalNotification = notifications.filter(
            (notification) =>
                notification.type === 'CONTENT_PLAN_APPROVED',
        );

        expect(approvalNotification).toHaveLength(1);
        expect(approvalNotification[0].recipientId).toBe(client.id);

        // -----------------------------------------
        // CASE 3: Force notification creation failure
        // Expected: Transaction rollback
        // -----------------------------------------

        // Put the plan back into IN_REVIEW for this test case.
        await prisma.contentPlan.update({
            where: { id: contentPlan.id },
            data: { status: 'IN_REVIEW' },
        });

        const notificationsBeforeFailure =
            await prisma.notification.count({
                where: {
                    recipientId: {
                        in: [client.id, accountManager.id],
                    },
                },
            });

        // Force a real PostgreSQL foreign-key violation
        // inside the actual transaction.
        vi.spyOn(NotificationsModel, 'create').mockImplementation(
            (data, db = prisma) => {
                return originalCreate(
                    {
                        ...data,
                        recipientId: 2147483647,
                    },
                    db,
                );
            },
        );

        await expect(
            ContentPlansService.updateStatus(
                contentPlan.id,
                'NEEDS_CHANGES',
                managerUser,
            ),
        ).rejects.toBeDefined();

        // Restore the real implementation.
        NotificationsModel.create = originalCreate;

        // Verify that the status update was rolled back.
        const persistedPlan = await prisma.contentPlan.findUnique({
            where: { id: contentPlan.id },
            select: { status: true },
        });

        expect(persistedPlan.status).toBe('IN_REVIEW');

        // Verify that no notification was saved.
        const notificationsAfterFailure =
            await prisma.notification.count({
                where: {
                    recipientId: {
                        in: [client.id, accountManager.id],
                    },
                },
            });

        expect(notificationsAfterFailure).toBe(
            notificationsBeforeFailure,
        );
    });

},
    30000,
);
