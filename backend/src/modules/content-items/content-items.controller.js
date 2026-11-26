import { ContentItemsService } from './content-items.service.js';
import {
  calendarQuerySchema,
  listRevisionsQuerySchema,
} from './content-items.validation.js';
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
      req.user,
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
      req.user,
    );

    res.status(200).json({
      success: true,
      data: {
        items,
        total: items.length,
      },
    });
  }),

  getCalendar: asyncHandler(async (req, res) => {
    const parsedQuery = calendarQuerySchema.parse(req.query);
    const data = await ContentItemsService.getCalendar(
      parsedQuery,
      req.user,
    );

    res.status(200).json({
      success: true,
      message: 'Content calendar retrieved successfully',
      data,
    });
  }),

  getById: asyncHandler(async (req, res) => {
    const item = await ContentItemsService.getById(
      req.params.id,
      req.user,
    );

    res.status(200).json({
      success: true,
      data: item,
    });
  }),

  update: asyncHandler(async (req, res) => {
    const item = await ContentItemsService.update(
      req.params.id,
      req.body,
      req.user,
    );

    res.status(200).json({
      success: true,
      message: 'Content item updated successfully',
      data: item,
    });
  }),

  remove: asyncHandler(async (req, res) => {
    const item = await ContentItemsService.remove(
      req.params.id,
      req.user,
    );

    res.status(200).json({
      success: true,
      message: 'Content item deleted successfully',
      data: item,
    });
  }),

  listRevisions: asyncHandler(async (req, res) => {
    const parsedQuery = listRevisionsQuerySchema.parse(req.query);
    const data = await ContentItemsService.listRevisions(
      req.params.id,
      parsedQuery,
      req.user,
    );

    res.status(200).json({
      success: true,
      message: 'Content item revisions retrieved successfully',
      data,
    });
  }),

  getRevisionById: asyncHandler(async (req, res) => {
    const revision = await ContentItemsService.getRevisionById(
      req.params.id,
      req.params.revisionId,
      req.user,
    );

    res.status(200).json({
      success: true,
      message: 'Content item revision retrieved successfully',
      data: revision,
    });
  }),

  getPublishing: asyncHandler(async (req, res) => {
    const publishing = await ContentItemsService.getPublishing(
      req.params.id,
      req.user,
    );

    res.status(200).json({
      success: true,
      message: 'Publishing status retrieved successfully',
      data: publishing,
    });
  }),

  updatePublishing: asyncHandler(async (req, res) => {
    const publishing = await ContentItemsService.updatePublishing(
      req.params.id,
      req.body,
      req.user,
    );

    res.status(200).json({
      success: true,
      message: 'Publishing status updated successfully',
      data: publishing,
    });
  }),
};
