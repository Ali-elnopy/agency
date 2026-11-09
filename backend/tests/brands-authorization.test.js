
import { describe, it, expect, beforeEach, vi } from 'vitest';

const state = vi.hoisted(() => ({
    listCalls: [],
    accessibleCalls: [],
    findByIdCalls: [],
    brand: { id: 1, name: 'Test Brand' },
}));

vi.mock('../src/modules/brands/brands.model.js', () => ({
    BrandsModel: {
        list: async (filters) => {
            state.listCalls.push(filters);
            return [state.brand];
        },

        findById: async (id) => {
            state.findByIdCalls.push(id);
            return state.brand;
        },

        findAccessibleById: async (id, accessWhere) => {
            state.accessibleCalls.push({ id, accessWhere });
            return state.brand;
        },
    },
}));

const { BrandsService } = await import(
    '../src/modules/brands/brands.service.js'
);

const admin = {
    id: 1,
    role: { name: 'ADMIN' },
};

const accountManager = {
    id: 2,
    role: { name: 'ACCOUNT_MANAGER' },
};

const contentCreator = {
    id: 3,
    role: { name: 'EMPLOYEE' },
    jobTitle: { name: 'Content Creator' },
};

const client = {
    id: 4,
    role: { name: 'CLIENT' },
};

beforeEach(() => {
    state.listCalls = [];
    state.accessibleCalls = [];
    state.findByIdCalls = [];
    state.brand = { id: 1, name: 'Test Brand' };
});

describe('Brands Authorization - List', () => {
    it('allows Admin to list all brands', async () => {
        await BrandsService.listBrands({}, admin);

        expect(state.listCalls[0].accessWhere).toEqual({});
    });

    it('restricts Account Manager to assigned brands', async () => {
        await BrandsService.listBrands({}, accountManager);

        expect(state.listCalls[0].accessWhere).toEqual({
            accountManagerId: 2,
        });
    });

    it('restricts Content Creator to brands of their teams', async () => {
        await BrandsService.listBrands({}, contentCreator);

        expect(state.listCalls[0].accessWhere).toEqual({
            team: {
                is: {
                    memberships: {
                        some: {
                            userId: 3,
                        },
                    },
                },
            },
        });
    });

    it('restricts Client to their own brand', async () => {
        await BrandsService.listBrands({}, client);

        expect(state.listCalls[0].accessWhere).toEqual({
            clientId: 4,
        });
    });
});

describe('Brands Authorization - Get by ID', () => {
    it('allows Admin to access any brand', async () => {
        await BrandsService.getBrand(1, admin);

        expect(state.findByIdCalls).toEqual([1]);
        expect(state.accessibleCalls).toHaveLength(0);
    });

    it('restricts Account Manager by accountManagerId', async () => {
        await BrandsService.getBrand(1, accountManager);

        expect(state.accessibleCalls[0]).toEqual({
            id: 1,
            accessWhere: { accountManagerId: 2 },
        });
    });

    it('restricts Content Creator by team membership', async () => {
        await BrandsService.getBrand(1, contentCreator);

        expect(state.accessibleCalls[0].accessWhere).toEqual({
            team: {
                is: {
                    memberships: {
                        some: {
                            userId: 3,
                        },
                    },
                },
            },
        });
    });

    it('restricts Client by clientId', async () => {
        await BrandsService.getBrand(1, client);

        expect(state.accessibleCalls[0]).toEqual({
            id: 1,
            accessWhere: { clientId: 4 },
        });
    });

    it('returns 404 when the brand is outside the user scope', async () => {
        state.brand = null;

        await expect(
            BrandsService.getBrand(99, accountManager),
        ).rejects.toMatchObject({
            statusCode: 404,
        });
    });

    it('returns 403 for an unsupported role', async () => {
        const unsupportedUser = {
            id: 5,
            role: { name: 'EMPLOYEE' },
            jobTitle: { name: 'Other Job Title' },
        };

        await expect(
            BrandsService.listBrands({}, unsupportedUser),
        ).rejects.toMatchObject({
            statusCode: 403,
        });
    });
});
