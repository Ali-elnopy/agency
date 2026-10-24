
import { ContentPlansService } from './content-plans.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiError } from '../../utils/ApiError.js';

function parseOptionalInteger(value, label) {
  if (value === undefined) return undefined;

  const parsed = Number(value);

  if (!Number.isSafeInteger(parsed)) {
    throw new ApiError(400, `${label} must be an integer`);
  }

  return parsed;
}

export const ContentPlansController = {
  create: asyncHandler(async (req, res) => {
    const plan = await ContentPlansService.create(req.body, req.user.id);

    res.status(201).json({
      success: true,
      message: 'Content plan created successfully',
      data: plan,
    });
  }),

  list: asyncHandler(async (req, res) => {
    const filters = {
      brandId: parseOptionalInteger(req.query.brandId, 'Brand id'),
      platformAccountId: parseOptionalInteger(
        req.query.platformAccountId,
        'Platform account id',
      ),
      year: parseOptionalInteger(req.query.year, 'Year'),
      month: parseOptionalInteger(req.query.month, 'Month'),
      status:
        typeof req.query.status === 'string'
          ? req.query.status
          : undefined,
    };

    const plans = await ContentPlansService.list(filters);

    res.status(200).json({
      success: true,
      data: { plans, total: plans.length },
    });
  }),

  getById: asyncHandler(async (req, res) => {
    const plan = await ContentPlansService.getById(req.params.id);

    res.status(200).json({ success: true, data: plan });
  }),

  update: asyncHandler(async (req, res) => {
    const plan = await ContentPlansService.update(
      req.params.id,
      req.body,
    );

    res.status(200).json({
      success: true,
      message: 'Content plan updated successfully',
      data: plan,
    });
  }),

  updateStatus: asyncHandler(async (req, res) => {
    const plan = await ContentPlansService.updateStatus(
      req.params.id,
      req.body.status,
    );

    res.status(200).json({
      success: true,
      message: 'Content plan status updated successfully',
      data: plan,
    });
  }),

  remove: asyncHandler(async (req, res) => {
    const plan = await ContentPlansService.remove(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Content plan deleted successfully',
      data: plan,
    });
  }),
};
