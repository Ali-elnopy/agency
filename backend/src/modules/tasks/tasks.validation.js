import { z } from 'zod';

const positiveId = z.coerce.number().int().positive();

const taskType = z.enum([
  'CONTENT_CREATION',
  'REVIEW',
  'PUBLISH',
  'DIRECT',
]);

const taskStatus = z.enum([
  'TODO',
  'IN_PROGRESS',
  'SUBMITTED',
  'IN_REVIEW',
  'NEEDS_CHANGES',
  'COMPLETED',
  'CANCELLED',
]);

const priority = z.enum([
  'LOW',
  'MEDIUM',
  'HIGH',
  'URGENT',
]);

const date = z.coerce.date();

export const createDirectTaskSchema = z.object({
  title: z.string().trim().min(1).max(200),

  description: z
    .string()
    .trim()
    .max(5000)
    .nullable()
    .optional(),

  assignedTo: positiveId,

  priority: priority.optional(),

  plannedDeadline: date,
}).strict();

export const assignContentItemTasksSchema = z.object({
  creationAssigneeId: positiveId.optional(),

  reviewerId: positiveId.optional(),
}).strict();

export const updateTaskSchema = z.object({
  assignedTo: positiveId.optional(),

  title: z.string().trim().min(1).max(200).optional(),

  description: z
    .string()
    .trim()
    .max(5000)
    .nullable()
    .optional(),

  priority: priority.optional(),

  status: taskStatus.optional(),

  plannedDeadline: date.optional(),

  effectiveDeadline: date.nullable().optional(),
}).strict();

export const updateTaskStatusSchema = z.object({
  status: taskStatus,
}).strict();

export const taskListQuerySchema = z.object({
  assignedTo: positiveId.optional(),

  createdBy: positiveId.optional(),

  contentItemId: positiveId.optional(),

  type: taskType.optional(),

  status: taskStatus.optional(),

  priority: priority.optional(),

  myTasks: z.coerce.boolean().optional(),

  needsReview: z.coerce.boolean().optional(),

  overdue: z.coerce.boolean().optional(),
}).strict();