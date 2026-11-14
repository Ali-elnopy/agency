
import { ClientOnboardingService } from './client-onboarding.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const ClientOnboardingController = {
    getCategories: asyncHandler(async (req, res) => {
        const result = ClientOnboardingService.getAvailableCategories(
            req.user,
        );

        res.status(200).json({
            success: true,
            data: result,
        });
    }),

    getTemplate: asyncHandler(async (req, res) => {
        const { mainCategory, activityType } = req.query;

        const template = ClientOnboardingService.getTemplate(
            req.user,
            mainCategory,
            activityType,
        );

        res.status(200).json({
            success: true,
            data: template,
        });
    }),

    getMyOnboarding: asyncHandler(async (req, res) => {
        const result = await ClientOnboardingService.getMyOnboarding(
            req.user,
        );

        res.status(200).json({
            success: true,
            data: result,
        });
    }),

    getBrandOnboarding: asyncHandler(async (req, res) => {
        const result = await ClientOnboardingService.getBrandOnboarding(
            req.params.brandId ?? req.params.id,
            req.user,
        );

        res.status(200).json({
            success: true,
            data: result,
        });
    }),

    selectTemplate: asyncHandler(async (req, res) => {
        const onboarding = await ClientOnboardingService.selectTemplate(
            req.user,
            req.body,
        );

        res.status(200).json({
            success: true,
            message: 'Onboarding template selected successfully',
            data: onboarding,
        });
    }),

    saveAnswers: asyncHandler(async (req, res) => {
        const onboarding = await ClientOnboardingService.saveAnswers(
            req.user,
            req.body.answers,
        );

        res.status(200).json({
            success: true,
            message: 'Onboarding answers saved successfully',
            data: onboarding,
        });
    }),

    submit: asyncHandler(async (req, res) => {
        const onboarding = await ClientOnboardingService.submit(
            req.user,
        );

        res.status(200).json({
            success: true,
            message: 'Onboarding submitted successfully',
            data: onboarding,
        });
    }),
};
