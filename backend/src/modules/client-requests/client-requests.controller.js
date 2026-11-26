
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ClientRequestsService } from './client-requests.service.js';

export const ClientRequestsController = {
    create: asyncHandler(async (req, res) => {
        const clientRequest = await ClientRequestsService.create(
            req.body,
            req.user,
        );

        res.status(201).json({
            success: true,
            message: 'Client request submitted successfully',
            data: clientRequest,
        });
    }),

    list: asyncHandler(async (req, res) => {
        const filters = {
            status:
                typeof req.query.status === 'string'
                    ? req.query.status
                    : undefined,

            type:
                typeof req.query.type === 'string'
                    ? req.query.type
                    : undefined,

            brandId:
                req.query.brandId !== undefined
                    ? Number(req.query.brandId)
                    : undefined,
        };

        const requests = await ClientRequestsService.list(
            filters,
            req.user,
        );

        res.status(200).json({
            success: true,
            data: {
                requests,
                total: requests.length,
            },
        });
    }),

    getById: asyncHandler(async (req, res) => {
        const clientRequest = await ClientRequestsService.getById(
            req.params.id,
            req.user,
        );

        res.status(200).json({
            success: true,
            data: clientRequest,
        });
    }),

    accept: asyncHandler(async (req, res) => {
        const result = await ClientRequestsService.accept(
            req.params.id,
            req.body,
            req.user,
        );

        res.status(200).json({
            success: true,
            message: 'Client request accepted and task created successfully',
            data: result,
        });
    }),

    reject: asyncHandler(async (req, res) => {
        const clientRequest = await ClientRequestsService.reject(
            req.params.id,
            req.body,
            req.user,
        );

        res.status(200).json({
            success: true,
            message: 'Client request rejected successfully',
            data: clientRequest,
        });
    }),
};
