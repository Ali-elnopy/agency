import { TasksService } from './tasks.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const TasksController = {
  createDirectTask: asyncHandler(
    async (req, res) => {
      const task =
        await TasksService.createDirectTask(
          req.body,
          req.user.id,
        );

      res.status(201).json({
        success: true,
        message: 'Direct task created successfully',
        data: task,
      });
    },
  ),

  assignContentItemTasks: asyncHandler(
    async (req, res) => {
      const result =
        await TasksService.assignContentItemTasks(
          req.params.contentItemId,
          req.body,
          req.user.id,
        );

      res.status(201).json({
        success: true,
        message:
          'Content workflow tasks assigned successfully',
        data: result,
      });
    },
  ),

  list: asyncHandler(
    async (req, res) => {
      const filters = {
        assignedTo:
          req.query.assignedTo !== undefined
            ? Number(req.query.assignedTo)
            : undefined,

        createdBy:
          req.query.createdBy !== undefined
            ? Number(req.query.createdBy)
            : undefined,

        contentItemId:
          req.query.contentItemId !== undefined
            ? Number(req.query.contentItemId)
            : undefined,

        type:
          typeof req.query.type === 'string'
            ? req.query.type
            : undefined,

        status:
          typeof req.query.status === 'string'
            ? req.query.status
            : undefined,

        priority:
          typeof req.query.priority === 'string'
            ? req.query.priority
            : undefined,

        myTasks:
          req.query.myTasks === 'true',

        needsReview:
          req.query.needsReview === 'true',

        overdue:
          req.query.overdue === 'true',
      };

      const tasks =
        await TasksService.list(
          filters,
          req.user,
        );

      res.status(200).json({
        success: true,
        data: {
          tasks,
          total: tasks.length,
        },
      });
    },
  ),

  getById: asyncHandler(
    async (req, res) => {
      const task =
        await TasksService.getById(
          req.params.id,
        );

      res.status(200).json({
        success: true,
        data: task,
      });
    },
  ),

  update: asyncHandler(
    async (req, res) => {
      const task =
        await TasksService.update(
          req.params.id,
          req.body,
          req.user,
        );

      res.status(200).json({
        success: true,
        message: 'Task updated successfully',
        data: task,
      });
    },
  ),

  updateStatus: asyncHandler(
    async (req, res) => {
      const task =
        await TasksService.getById(
          req.params.id,
        );

      const updatedTask =
        await TasksService.changeStatus(
          task,
          req.body.status,
          req.user,
        );

      res.status(200).json({
        success: true,
        message: 'Task status updated successfully',
        data: updatedTask,
      });
    },
  ),

  remove: asyncHandler(
    async (req, res) => {
      const task =
        await TasksService.remove(
          req.params.id,
          req.user,
        );

      res.status(200).json({
        success: true,
        message: 'Task deleted successfully',
        data: task,
      });
    },
  ),
};