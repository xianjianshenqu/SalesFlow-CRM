import { z } from 'zod';

/**
 * 服务项目状态枚举
 */
export const serviceStatusSchema = z.enum(['pending', 'in_progress', 'completed', 'on_hold', 'cancelled']);

/**
 * 里程碑状态枚举
 */
export const milestoneStatusSchema = z.enum(['pending', 'in_progress', 'completed']);

/**
 * 创建服务项目验证Schema
 */
export const createServiceSchema = z.object({
  customerId: z.string().min(1, '客户ID不能为空'),
  name: z.string().min(1, '项目名称不能为空').max(200),
  description: z.string().optional(),
  type: z.string().max(100).optional(),
  startDate: z.string().datetime('开始日期格式不正确'),
  endDate: z.string().datetime('结束日期格式不正确').optional(),
  budget: z.number().positive('预算必须为正数').optional(),
  milestones: z.array(z.object({
    name: z.string(),
    description: z.string().optional(),
    dueDate: z.string().datetime().optional(),
    status: milestoneStatusSchema.optional(),
  })).optional(),
  teamMemberIds: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

/**
 * 更新服务项目验证Schema
 */
export const updateServiceSchema = z.object({
  name: z.string().min(1, '项目名称不能为空').max(200).optional(),
  description: z.string().optional(),
  type: z.string().max(100).optional(),
  startDate: z.string().datetime('开始日期格式不正确').optional(),
  endDate: z.string().datetime('结束日期格式不正确').optional(),
  budget: z.number().positive('预算必须为正数').optional(),
  status: serviceStatusSchema.optional(),
  notes: z.string().optional(),
});

/**
 * 更新进度验证Schema
 */
export const updateProgressSchema = z.object({
  progress: z.number().min(0).max(100),
  notes: z.string().optional(),
});

/**
 * 创建里程碑验证Schema
 */
export const createMilestoneSchema = z.object({
  name: z.string().min(1, '里程碑名称不能为空'),
  description: z.string().optional(),
  dueDate: z.string().datetime().optional(),
});

/**
 * 更新里程碑状态验证Schema
 */
export const updateMilestoneSchema = z.object({
  status: milestoneStatusSchema,
  completedAt: z.string().datetime().optional(),
  notes: z.string().optional(),
});

/**
 * 服务项目查询参数验证Schema
 */
export const serviceQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).default('10'),
  customerId: z.string().optional(),
  status: serviceStatusSchema.optional(),
  type: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'startDate', 'progress', 'budget']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * 服务项目ID参数验证Schema
 */
export const serviceIdSchema = z.object({
  id: z.string().min(1, '服务项目ID不能为空'),
});

/**
 * 里程碑ID参数验证Schema
 */
export const milestoneIdSchema = z.object({
  id: z.string().min(1, '里程碑ID不能为空'),
  milestoneId: z.string().min(1, '里程碑ID不能为空'),
});

export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
export type UpdateProgressInput = z.infer<typeof updateProgressSchema>;
export type CreateMilestoneInput = z.infer<typeof createMilestoneSchema>;
export type UpdateMilestoneInput = z.infer<typeof updateMilestoneSchema>;
export type ServiceQueryInput = z.infer<typeof serviceQuerySchema>;