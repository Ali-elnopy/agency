import { ClientChangeRequestsService } from './client-change-requests.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const ClientChangeRequestsController = {
  submitClientReview: asyncHandler(async (req, res) => {
    const result = await ClientChangeRequestsService.submitClientReview(
      req.params.id,
      req.body,
      req.user,
    );

    res.status(req.body.decision === 'REQUEST_CHANGES' ? 201 : 200).json({
      success: true,
      message:
        req.body.decision === 'APPROVE'
          ? 'Content approved by client successfully'
          : 'Client change request submitted successfully',
      data: result,
    });
  }),

  list: asyncHandler(async (req, res) => {
    const filters = {
      status: typeof req.query.status === 'string' ? req.query.status : undefined,
      contentItemId:
        req.query.contentItemId !== undefined
          ? Number(req.query.contentItemId)
          : undefined,
      brandId:
        req.query.brandId !== undefined ? Number(req.query.brandId) : undefined,
    };

    const requests = await ClientChangeRequestsService.list(filters, req.user);

    res.status(200).json({
      success: true,
      data: {
        requests,
        total: requests.length,
      },
    });
  }),

  getById: asyncHandler(async (req, res) => {
    const requestItem = await ClientChangeRequestsService.getById(
      req.params.id,
      req.user,
    );

    res.status(200).json({
      success: true,
      data: requestItem,
    });
  }),

  resolve: asyncHandler(async (req, res) => {
    const result = await ClientChangeRequestsService.resolve(
      req.params.id,
      req.body,
      req.user,
    );

    res.status(200).json({
      success: true,
      message: 'Client change request resolved successfully',
      data: result,
    });
  }),

  forward: asyncHandler(async (req, res) => {
    const result = await ClientChangeRequestsService.forward(
      req.params.id,
      req.body,
      req.user,
    );

    res.status(200).json({
      success: true,
      message: 'Client change request forwarded to creative successfully',
      data: result,
    });
  }),
};
