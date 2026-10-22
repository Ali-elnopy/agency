
import { BrandsService } from './brands.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const BrandsController = {
  create: asyncHandler(async (req, res) => {
    const brand = await BrandsService.createBrand(req.body, req.user.id);

    res.status(201).json({
      success: true,
      message: 'Brand created successfully',
      data: brand,
    });
  }),
};
