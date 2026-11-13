import { asyncHandler } from '../../utils/asyncHandler.js';
import { BrandBriefsService } from './brand-briefs.service.js';

export const BrandBriefsController = {
    generate: asyncHandler(async (req, res) => {
        const brief = await BrandBriefsService.generate(
            req.params.brandId,
            req.user,
        );

        res.status(201).json({
            success: true,
            message: 'Brand Brief generated successfully.',
            data: brief,
        });
    }),

    list: asyncHandler(async (req, res) => {
        const filters = {
            brandId: req.query.brandId
                ? Number(req.query.brandId)
                : undefined,
            status:
                typeof req.query.status === 'string'
                    ? req.query.status
                    : undefined,
        };

        const result = await BrandBriefsService.list(
            req.user,
            filters,
        );

        res.status(200).json({
            success: true,
            message: 'Brand Briefs retrieved successfully.',
            data: result,
        });
    }),

    getById: asyncHandler(async (req, res) => {
        const brief = await BrandBriefsService.getById(
            req.params.id,
            req.user,
        );

        res.status(200).json({
            success: true,
            data: brief,
        });
    }),

    update: asyncHandler(async (req, res) => {
        const brief = await BrandBriefsService.update(
            req.params.id,
            req.body,
            req.user,
        );

        res.status(200).json({
            success: true,
            message: 'Brand Brief updated successfully.',
            data: brief,
        });
    }),

    approve: asyncHandler(async (req, res) => {
        const brief = await BrandBriefsService.approve(
            req.params.id,
            req.body?.comment,
            req.user,
        );

        res.status(200).json({
            success: true,
            message: 'Brand Brief approved successfully.',
            data: brief,
        });
    }),
};
