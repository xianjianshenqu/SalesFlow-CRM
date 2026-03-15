import { z } from 'zod';

/**
 * 任务类型枚举
 */
export const taskTypeSchema = z.enum(['call', 'meeting', 'email', 'visit', 'follow_up', 'other']);

/**
 * 任务优先级枚举
 */
export const prioritySchema = z.enum(['high', 'medium', 'low']);

/**
 * 任务状态枚举
 */
export const taskStatusSchema = z.enum(['pending', 'in_progress', 'completed', 'cancelled']);

/**
 * 创建日程任务验证Schema
 */
export const createScheduleSchema = z.object({
  customerId: z.string().min(1, '客户ID不能为空'),
  title: z.string().min(1, '任务标题不能为空').max(200, '标题最多200字符'),
  type: taskTypeSchema,
  priority: prioritySchema.default('medium'),
  description: z.string().optional(),
  dueDate: z.string().datetime('日期格式不正确'),
  reminder: z.boolean().default(true),
  reminderMinutes: z.number().int().positive('提醒时间必须为正整数').optional(),
  location: z.string().max(500).optional(),
  notes: z.string().optional(),
});

/**
 * 更新日程任务验证Schema
 */
export const updateScheduleSchema = z.object({
  title: z.string().min(1, '任务标题不能为空').max(200, '标题最多200字符').optional(),
  type: taskTypeSchema.optional(),
  priority: prioritySchema.optional(),
  status: taskStatusSchema.optional(),
  description: z.string().optional(),
  dueDate: z.string().datetime('日期格式不正确').optional(),
  reminder: z.boolean().optional(),
  reminderMinutes: z.number().int().positive('提醒时间必须为正整数').optional(),
  location: z.string().max(500).optional(),
  notes: z.string().optional(),
});

/**
 * 更新任务状态验证Schema
 */
export const updateStatusSchema = z.object({
  status: taskStatusSchema,
  notes: z.string().optional(),
});

/**
 * 日程查询参数验证Schema
 */
export const scheduleQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).default('10'),
  customerId: z.string().optional(),
  type: taskTypeSchema.optional(),
  status: taskStatusSchema.optional(),
  priority: prioritySchema.optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['dueDate', 'createdAt', 'priority']).default('dueDate'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

/**
 * 任务ID参数验证Schema
 */
export const scheduleIdSchema = z.object({
  id: z.string().min(1, '任务ID不能为空'),
});

export type CreateScheduleInput = z.infer<typeof createScheduleSchema>;
export type UpdateScheduleInput = z.infer<typeof updateScheduleSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
export type ScheduleQueryInput = z.infer<typeof scheduleQuerySchema>;