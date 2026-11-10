import { ContentItemsService } from './content-items.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiError } from '../../utils/ApiError.js';

function parseOptionalInteger(value, label) {
  if (value === undefined) {
    return undefined;
  }

  const parsed = Number(value);

  if (!Number.isSafeInteger(parsed)) {
    throw new ApiError(
      400,
      `${label} must be an integer`,
    );
  }

  return parsed;
}

export const ContentItemsController = {
  create: asyncHandler(async (req, res) => {
    const item = await ContentItemsService.create(
      req.body,
      req.user.id,
    );

    res.status(201).json({
      success: true,
      message: 'Content item created successfully',
      data: item,
    });
  }),

  list: asyncHandler(async (req, res) => {
    const filters = {
      contentPlanId: parseOptionalInteger(
        req.query.contentPlanId,
        'Content plan id',
      ),

      campaignId: parseOptionalInteger(
        req.query.campaignId,
        'Campaign id',
      ),

      type:
        typeof req.query.type === 'string'
          ? req.query.type
          : undefined,
    };

    const items = await ContentItemsService.list(
      filters,
    );

    res.status(200).json({
      success: true,
      data: {
        items,
        total: items.length,
      },
    });
  }),

  getById: asyncHandler(async (req, res) => {
    const item =
      await ContentItemsService.getById(
        req.params.id,
      );

    res.status(200).json({
      success: true,
      data: item,
    });
  }),

  update: asyncHandler(async (req, res) => {
    const item =
      await ContentItemsService.update(
        req.params.id,
        req.body,
      );

    res.status(200).json({
      success: true,
      message: 'Content item updated successfully',
      data: item,
    });
  }),

  remove: asyncHandler(async (req, res) => {
    const item =
      await ContentItemsService.remove(
        req.params.id,
      );

    res.status(200).json({
      success: true,
      message: 'Content item deleted successfully',
      data: item,
    });
  }),
};
