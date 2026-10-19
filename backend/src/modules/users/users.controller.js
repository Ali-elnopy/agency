import * as service from './users.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const list = asyncHandler(async (req, res) => {
  const { items, meta } = await service.list(req.query);
  res.json({ success: true, data: items, meta });
});

export const getById = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await service.getById(req.params.id) });
});

export const create = asyncHandler(async (req, res) => {
  res.status(201).json({ success: true, data: await service.create(req.user, req.body) });
});

export const update = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await service.update(req.user, req.params.id, req.body) });
});
