import { Router } from 'express';

import { prisma } from '../../config/prisma.js';
import { authenticate } from '../../middlewares/auth.js';
import { requireAdmin } from '../../middlewares/requireAdmin.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const metaRouter = Router();

metaRouter.use(authenticate);

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

metaRouter.post(
  '/job-titles',
  asyncHandler(async (req, res) => {
    const name = String(req.body?.name ?? '').trim();
    if (!name) {
      return res.status(400).json({ success: false, message: 'Job title name is required' });
    }
    const jobTitle = await prisma.jobTitle.upsert({
      where: { name },
      create: { name, isActive: true },
      update: { isActive: true },
      select: { id: true, name: true, description: true },
    });
    res.status(201).json({ success: true, data: { jobTitle } });
  }),
);
