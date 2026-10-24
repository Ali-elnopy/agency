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

  list: asyncHandler(async (req, res) => {
    const { query, status, teamId, accountManagerId } = req.query;

    const brands = await BrandsService.listBrands({
      query: typeof query === 'string' && query.trim() ? query.trim() : undefined,
      status: typeof status === 'string' && status ? status : undefined,
      teamId: teamId != null ? Number(teamId) : undefined,
      accountManagerId:
        accountManagerId != null ? Number(accountManagerId) : undefined,
    });

    res.status(200).json({
      success: true,
      data: { brands, total: brands.length },
    });
  }),

  getById: asyncHandler(async (req, res) => {
    const brand = await BrandsService.getBrand(req.params.id);

    res.status(200).json({ success: true, data: brand });
  }),

  update: asyncHandler(async (req, res) => {
    const brand = await BrandsService.updateBrand(req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: 'Brand updated successfully',
      data: brand,
    });
  }),

  remove: asyncHandler(async (req, res) => {
    const brand = await BrandsService.deleteBrand(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Brand deleted successfully',
      data: brand,
    });
  }),
};
