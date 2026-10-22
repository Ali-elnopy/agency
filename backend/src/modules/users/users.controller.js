import { UsersService } from './users.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const UsersController = {
  list: asyncHandler(async (req, res) => {
    const result = await UsersService.listUsers({
      status: req.query.status,
      query: req.query.query,
      roleName: req.query.roleName,
    });

    res.status(200).json({ success: true, data: result });
  }),

  getById: asyncHandler(async (req, res) => {
    const user = await UsersService.getUser(req.params.id);
    res.status(200).json({ success: true, data: user });
  }),

  create: asyncHandler(async (req, res) => {
    const user = await UsersService.createUser(req.body, req.user.id);
    res.status(201).json({ success: true, message: 'User created successfully', data: user });
  }),

  update: asyncHandler(async (req, res) => {
    const user = await UsersService.updateUser(req.params.id, req.body);
    res.status(200).json({ success: true, message: 'User updated successfully', data: user });
  }),

  deactivate: asyncHandler(async (req, res) => {
    const user = await UsersService.deactivateUser(req.params.id);
    res.status(200).json({ success: true, message: 'User deactivated successfully', data: user });
  }),

  reactivate: asyncHandler(async (req, res) => {
    const user = await UsersService.reactivateUser(req.params.id);
    res.status(200).json({ success: true, message: 'User reactivated successfully', data: user });
  }),

  remove: asyncHandler(async (req, res) => {
    const result = await UsersService.deleteUser(req.params.id);
    res.status(200).json({ success: true, message: 'User deleted successfully', data: result });
  }),
};
