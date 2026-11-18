import { beforeEach, describe, expect, it, vi } from 'vitest';

const state = vi.hoisted(() => ({
    upsertCalls: [],
    findBrandByClientId: null,
}));

vi.mock('../src/modules/client-onboarding/client-onboarding.model.js', () => ({
    ClientOnboardingModel: {
        findBrandByClientId: async (clientId) => {
            state.findBrandByClientId = clientId;
            return {
                id: 'brand-1',
                name: 'Acme Brand',
                accountManagerId: 'manager-1',
                onboarding: {
                    id: 'onboarding-1',
                    status: 'DRAFT',
                    mainCategory: 'GENERAL',
                    activityType: null,
                },
            };
        },
        findByBrandId: async () => ({ id: 'onboarding-1', answers: [] }),
        upsertAnswers: async (onboardingId, answers) => {
            state.upsertCalls.push({ onboardingId, answers });
            return answers;
        },
    },
}));

const { ClientOnboardingService } = await import(
    '../src/modules/client-onboarding/client-onboarding.service.js'
);

describe('ClientOnboardingService', () => {
    beforeEach(() => {
        state.upsertCalls = [];
        state.findBrandByClientId = null;
    });

    it('persists the full answer set in a single upsert call', async () => {
        const user = {
            id: 'client-1',
            fullName: 'Client Name',
            role: { name: 'CLIENT' },
        };

        const answers = [
            { questionCode: 'COM_INFO_NATURE', answer: 'Fashion retail' },
            { questionCode: 'COM_GOALS_MAIN', answer: 'Increase sales' },
        ];

        await ClientOnboardingService.saveAnswers(user, answers);

        expect(state.findBrandByClientId).toBe('client-1');
        expect(state.upsertCalls).toHaveLength(1);
        expect(state.upsertCalls[0]).toEqual({
            onboardingId: 'onboarding-1',
            answers,
        });
    });

    it('uses the category template code for GENERAL onboarding', () => {
        const user = {
            id: 'client-1',
            fullName: 'Client Name',
            role: { name: 'CLIENT' },
        };

        const template = ClientOnboardingService.getTemplate(user, 'GENERAL');

        expect(template.mainCategory).toBe('GENERAL');
        expect(template.activityType).toBe('GENERAL');
        expect(template.templateCodes).toContain('COMMON');
        expect(template.templateCodes).not.toContain('GENERAL');
    });
});
