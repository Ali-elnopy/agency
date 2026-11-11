
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
};
