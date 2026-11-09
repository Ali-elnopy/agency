
import { PlatformAccountsService } from './platform-accounts.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiError } from '../../utils/ApiError.js';

function parseOptionalId(value, label) {
  if (value === undefined) return undefined;

  const id = Number(value);

  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new ApiError(400, `${label} must be a positive integer`);
  }

  return id;
}

function parseOptionalBoolean(value, label) {
  if (value === undefined) return undefined;
  if (value === 'true') return true;
  if (value === 'false') return false;

  throw new ApiError(400, `${label} must be true or false`);
}

export const PlatformAccountsController = {
  create: asyncHandler(async (req, res) => {
    const account = await PlatformAccountsService.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Platform account created successfully',
      data: account,
    });
  }),

  list: asyncHandler(async (req, res) => {
    const filters = {
      brandId: parseOptionalId(req.query.brandId, 'Brand id'),
      platform:
        typeof req.query.platform === 'string'
          ? req.query.platform.trim()
          : undefined,
      isActive: parseOptionalBoolean(req.query.isActive, 'isActive'),
    };

    const accounts = await PlatformAccountsService.list(filters);

    res.status(200).json({
      success: true,
      data: { accounts, total: accounts.length },
    });
  }),

  getById: asyncHandler(async (req, res) => {
    const account = await PlatformAccountsService.getById(req.params.id);

    res.status(200).json({ success: true, data: account });
  }),

  update: asyncHandler(async (req, res) => {
    const account = await PlatformAccountsService.update(
      req.params.id,
      req.body,
    );

    res.status(200).json({
      success: true,
      message: 'Platform account updated successfully',
      data: account,
    });
  }),

  updateStatus: asyncHandler(async (req, res) => {
    const account = await PlatformAccountsService.updateStatus(
      req.params.id,
      req.body.isActive,
    );

    res.status(200).json({
      success: true,
      message: 'Platform account status updated successfully',
      data: account,
    });
  }),

  remove: asyncHandler(async (req, res) => {
    const account = await PlatformAccountsService.remove(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Platform account deleted successfully',
      data: account,
    });
  }),
};
