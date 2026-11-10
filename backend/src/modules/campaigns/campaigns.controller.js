import { CampaignsService } from './campaigns.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiError } from '../../utils/ApiError.js';

function parseOptionalInteger(value, label) {
  if (value === undefined) {
    return undefined;
  }

  const parsed = Number(value);

  if (!Number.isSafeInteger(parsed)) {
    throw new ApiError(400, `${label} must be an integer`);
  }

  return parsed;
}

export const CampaignsController = {
  create: asyncHandler(async (req, res) => {
    const campaign = await CampaignsService.create(
      req.body,
      req.user.id,
    );

    res.status(201).json({
      success: true,
      message: 'Campaign created successfully',
      data: campaign,
    });
  }),

  list: asyncHandler(async (req, res) => {
    const filters = {
      contentPlanId: parseOptionalInteger(
        req.query.contentPlanId,
        'Content plan id',
      ),
    };

    const campaigns = await CampaignsService.list(filters);

    res.status(200).json({
      success: true,
      data: {
        campaigns,
        total: campaigns.length,
      },
    });
  }),

  getById: asyncHandler(async (req, res) => {
    const campaign = await CampaignsService.getById(
      req.params.id,
    );

    res.status(200).json({
      success: true,
      data: campaign,
    });
  }),

  update: asyncHandler(async (req, res) => {
    const campaign = await CampaignsService.update(
      req.params.id,
      req.body,
    );

    res.status(200).json({
      success: true,
      message: 'Campaign updated successfully',
      data: campaign,
    });
  }),

  remove: asyncHandler(async (req, res) => {
    const campaign = await CampaignsService.remove(
      req.params.id,
    );

    res.status(200).json({
      success: true,
      message: 'Campaign deleted successfully',
      data: campaign,
    });
  }),
};