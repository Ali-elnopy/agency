import { Router } from 'express';

import { prisma } from '../../config/prisma.js';
import { authenticate } from '../../middlewares/auth.js';
import { requireAdmin } from '../../middlewares/requireAdmin.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const metaRouter = Router();

metaRouter.use(authenticate, requireAdmin);

metaRouter.get(
  '/roles',
  asyncHandler(async (_req, res) => {
    const roles = await prisma.role.findMany({
      select: { id: true, name: true, description: true },
      orderBy: { id: 'asc' },
    });

    res.status(200).json({ success: true, data: { roles } });
  }),
);

metaRouter.get(
  '/job-titles',
  asyncHandler(async (_req, res) => {
    const jobTitles = await prisma.jobTitle.findMany({
      where: { isActive: true },
      select: { id: true, name: true, description: true },
      orderBy: { name: 'asc' },
    });

    res.status(200).json({ success: true, data: { jobTitles } });
  }),
);
