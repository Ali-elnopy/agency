
import { StrategiesService } from './strategies.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiError } from '../../utils/ApiError.js';

function parseOptionalInteger(value, label) {
    if (value === undefined) {
        return undefined;
    }

    const parsed = Number(value);

    if (!Number.isSafeInteger(parsed) || parsed <= 0) {
        throw new ApiError(
            400,
            `${label} must be a positive integer`,
        );
    }

    return parsed;
}

export const StrategiesController = {
    create: asyncHandler(async (req, res) => {
        const strategy = await StrategiesService.create(
            req.body,
            req.user,
        );

        res.status(201).json({
            success: true,
            message: 'Strategy created successfully',
            data: strategy,
        });
    }),

    list: asyncHandler(async (req, res) => {
        const filters = {
            brandId: parseOptionalInteger(
                req.query.brandId,
                'Brand id',
            ),
        };

        const strategies = await StrategiesService.list(
            filters,
            req.user,
        );

        res.status(200).json({
            success: true,
            data: {
                strategies,
                total: strategies.length,
            },
        });
    }),

    getById: asyncHandler(async (req, res) => {
        const strategy = await StrategiesService.getById(
            req.params.id,
            req.user,
        );

        res.status(200).json({
            success: true,
            data: strategy,
        });
    }),

    update: asyncHandler(async (req, res) => {
        const strategy = await StrategiesService.update(
            req.params.id,
            req.body,
            req.user,
        );

        res.status(200).json({
            success: true,
            message: 'Strategy updated successfully',
            data: strategy,
        });
    }),

    uploadVersion: asyncHandler(async (req, res) => {
        const version = await StrategiesService.uploadVersion(
            req.params.id,
            req.file,
            req.user,
        );

        res.status(201).json({
            success: true,
            message: 'Strategy version uploaded successfully',
            data: version,
        });
    }),

    getVersionFile: asyncHandler(async (req, res, next) => {
        const file = await StrategiesService.getVersionFile(
            req.params.id,
            req.params.versionId,
            req.user,
        );

        res.setHeader(
            'Content-Disposition',
            `inline; filename*=UTF-8''${encodeURIComponent(file.fileName)}`,
        );

        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('Cache-Control', 'private, no-store');

        res.type('application/pdf');

        res.sendFile(file.filePath, (error) => {
            if (error && !res.headersSent) {
                next(error);
            }
        });
    }),

    requestChanges: asyncHandler(async (req, res) => {
        const feedback = await StrategiesService.requestChanges(
            req.params.id,
            req.params.versionId,
            req.body,
            req.user,
        );

        res.status(201).json({
            success: true,
            message: 'Strategy change request submitted successfully',
            data: feedback,
        });
    }),

    approve: asyncHandler(async (req, res) => {
        const result = await StrategiesService.approve(
            req.params.id,
            req.params.versionId,
            req.body,
            req.user,
        );

        res.status(200).json({
            success: true,
            message: 'Strategy approval recorded successfully',
            data: result,
        });
    }),

    remove: asyncHandler(async (req, res) => {
        const result = await StrategiesService.remove(
            req.params.id,
            req.user,
        );

        res.status(200).json({
            success: true,
            message: 'Strategy deleted successfully',
            data: result,
        });
    }),
};
