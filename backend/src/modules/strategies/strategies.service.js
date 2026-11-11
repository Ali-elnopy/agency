
import { StrategiesModel } from './strategies.model.js';
import {
    deleteStrategyFile,
    getStrategyFilePath,
    validatePdfFile,
} from './strategies.storage.js';
import { ApiError } from '../../utils/ApiError.js';

function parseId(value, label = 'ID') {
    const id = Number(value);

    if (!Number.isInteger(id) || id <= 0) {
        throw new ApiError(400, `Invalid ${label}`);
    }

    return id;
}

function getRole(user) {
    return user?.role?.name;
}

function isContentCreator(user) {
    return (
        getRole(user) === 'EMPLOYEE' &&
        user?.jobTitle?.name === 'Content Creator'
    );
}

function getApproverType(user) {
    const role = getRole(user);

    if (role === 'ACCOUNT_MANAGER' || role === 'CLIENT') {
        return role;
    }

    return null;
}

function canAccessBrand(brand, user) {
    if (!brand || !user) {
        return false;
    }

    const role = getRole(user);

    if (role === 'ADMIN') {
        return true;
    }

    if (
        role === 'ACCOUNT_MANAGER' &&
        brand.accountManagerId === user.id
    ) {
        return true;
    }

    if (role === 'CLIENT' && brand.clientId === user.id) {
        return true;
    }

    if (isContentCreator(user)) {
        return (
            brand.team?.memberships?.some(
                (membership) => membership.userId === user.id,
            ) ?? false
        );
    }

    return false;
}

function assertContentCreator(user) {
    if (!isContentCreator(user)) {
        throw new ApiError(
            403,
            'Only Content Creators can manage and upload strategies',
        );
    }
}

async function getBrandOrThrow(brandId, user) {
    const id = parseId(brandId, 'Brand ID');

    const brand = await StrategiesModel.findBrandById(id);

    if (!brand || !canAccessBrand(brand, user)) {
        throw new ApiError(404, 'Brand not found');
    }

    return brand;
}

async function getStrategyOrThrow(strategyId, user) {
    const id = parseId(strategyId, 'Strategy ID');

    const strategy = await StrategiesModel.findById(id);

    if (!strategy) {
        throw new ApiError(404, 'Strategy not found');
    }

    // Fetch team memberships separately for authorization.
    // This avoids exposing team membership data in the API response.
    const brand = await StrategiesModel.findBrandById(strategy.brandId);

    if (!brand || !canAccessBrand(brand, user)) {
        throw new ApiError(404, 'Strategy not found');
    }

    return strategy;
}

async function getVersionOrThrow(strategyId, versionId) {
    const id = parseId(versionId, 'Version ID');

    const version = await StrategiesModel.findVersion(strategyId, id);

    if (!version) {
        throw new ApiError(404, 'Strategy version not found');
    }

    return version;
}

function getListWhere(user) {
    const role = getRole(user);

    if (role === 'ADMIN') {
        return {};
    }

    if (role === 'ACCOUNT_MANAGER') {
        return {
            brand: {
                accountManagerId: user.id,
            },
        };
    }

    if (role === 'CLIENT') {
        return {
            brand: {
                clientId: user.id,
            },
        };
    }

    if (isContentCreator(user)) {
        return {
            brand: {
                team: {
                    memberships: {
                        some: {
                            userId: user.id,
                        },
                    },
                },
            },
        };
    }

    return {
        id: -1,
    };
}

export const StrategiesService = {
    async create(data, user) {
        assertContentCreator(user);

        await getBrandOrThrow(data.brandId, user);

        return StrategiesModel.create({
            brandId: parseId(data.brandId, 'Brand ID'),
            title: data.title,
            status: 'DRAFT',
        });
    },

    async list(filters = {}, user) {
        const where = getListWhere(user);

        if (filters.brandId !== undefined) {
            where.brandId = parseId(filters.brandId, 'Brand ID');
        }

        return StrategiesModel.findMany(where);
    },

    async getById(strategyId, user) {
        return getStrategyOrThrow(strategyId, user);
    },

    async update(strategyId, data, user) {
        assertContentCreator(user);

        const strategy = await getStrategyOrThrow(strategyId, user);

        return StrategiesModel.update(strategy.id, data);
    },

    async uploadVersion(strategyId, file, user) {
        if (!file) {
            throw new ApiError(400, 'Strategy PDF file is required');
        }

        let storageKey;

        try {
            assertContentCreator(user);

            const strategy = await getStrategyOrThrow(strategyId, user);

            storageKey = `strategies/${file.filename}`;

            await validatePdfFile(file.path);

            const latestVersion = await StrategiesModel.findLatestVersion(
                strategy.id,
            );

            const versionNumber = latestVersion
                ? latestVersion.version + 1
                : 1;

            return await StrategiesModel.createVersionAndUpdateStrategy({
                strategyId: strategy.id,
                versionData: {
                    strategyId: strategy.id,
                    version: versionNumber,
                    storageKey,
                    fileName: file.originalname,
                    mimeType: 'application/pdf',
                    fileSize: file.size,
                    uploadedById: user.id,
                },
            });
        } catch (error) {
            if (storageKey) {
                await deleteStrategyFile(storageKey).catch(() => { });
            }

            if (error.code === 'P2002') {
                throw new ApiError(
                    409,
                    'A new strategy version was uploaded simultaneously. Please try again.',
                );
            }

            throw error;
        }
    },

    async getVersionFile(strategyId, versionId, user) {
        const strategy = await getStrategyOrThrow(strategyId, user);

        const version = await getVersionOrThrow(
            strategy.id,
            versionId,
        );

        return {
            filePath: getStrategyFilePath(version.storageKey),
            fileName: version.fileName,
            mimeType: version.mimeType,
        };
    },

    async requestChanges(strategyId, versionId, data, user) {
        if (getRole(user) !== 'CLIENT') {
            throw new ApiError(
                403,
                'Only the Client can request strategy changes',
            );
        }

        const strategy = await getStrategyOrThrow(strategyId, user);

        const version = await getVersionOrThrow(
            strategy.id,
            versionId,
        );

        const latestVersion = await StrategiesModel.findLatestVersion(
            strategy.id,
        );

        if (!latestVersion || latestVersion.id !== version.id) {
            throw new ApiError(
                400,
                'Change requests can only be submitted for the latest version',
            );
        }

        const clientApproval = await StrategiesModel.findApproval(
            version.id,
            'CLIENT',
        );

        if (clientApproval?.decision === 'APPROVED') {
            throw new ApiError(
                400,
                'You have already approved this strategy version',
            );
        }

        const managerApproval = await StrategiesModel.findApproval(
            version.id,
            'ACCOUNT_MANAGER',
        );

        if (managerApproval?.decision !== 'APPROVED') {
            throw new ApiError(
                400,
                'The Account Manager must approve the strategy before the Client can review it',
            );
        }

        const hasOpenFeedback = await StrategiesModel.hasOpenFeedback(
            version.id,
        );

        if (hasOpenFeedback) {
            throw new ApiError(
                400,
                'There is already an open change request for this version',
            );
        }

        return StrategiesModel.createFeedback({
            strategyId: strategy.id,
            versionId: version.id,
            requestedBy: user.id,
            message: data.message,
            status: 'OPEN',
        });
    },

    async approve(strategyId, versionId, data, user) {
        const approverType = getApproverType(user);

        if (!approverType) {
            throw new ApiError(
                403,
                'Only the Account Manager or Client can approve a strategy',
            );
        }

        const strategy = await getStrategyOrThrow(strategyId, user);

        const version = await getVersionOrThrow(
            strategy.id,
            versionId,
        );

        const latestVersion = await StrategiesModel.findLatestVersion(
            strategy.id,
        );

        if (!latestVersion || latestVersion.id !== version.id) {
            throw new ApiError(
                400,
                'Only the latest strategy version can be approved',
            );
        }

        const hasOpenFeedback = await StrategiesModel.hasOpenFeedback(
            version.id,
        );

        if (hasOpenFeedback) {
            throw new ApiError(
                400,
                'This version has an open change request. A new version must be uploaded first.',
            );
        }

        if (approverType === 'CLIENT') {
            const managerApproval = await StrategiesModel.findApproval(
                version.id,
                'ACCOUNT_MANAGER',
            );

            if (managerApproval?.decision !== 'APPROVED') {
                throw new ApiError(
                    400,
                    'The Account Manager must approve the strategy before the Client',
                );
            }
        }

        return StrategiesModel.approveVersion({
            strategyId: strategy.id,
            versionId: version.id,
            approverId: user.id,
            approverType,
            comment: data.comment,
        });
    },
};
