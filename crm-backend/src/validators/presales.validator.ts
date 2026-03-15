import { z } from 'zod';

/**
 * 售前资源状态枚举
 */
export const resourceStatusSchema = z.enum(['available', 'busy', 'offline']);

/**
 * 售前请求状态枚举
 */
export const requestStatusSchema = z.enum(['pending', 'assigned', 'in_progress', 'completed', 'cancelled']);

/**
 * 售前请求优先级枚举
 */
export const requestPrioritySchema = z.enum(['high', 'medium', 'low']);

/**
 * 创建售前资源验证Schema
 */
export const createResourceSchema = z.object({
  name: z.string().min(1, '资源名称不能为空').max(100),
  email: z.string().email('邮箱格式不正确'),
  phone: z.string().max(20).optional(),
  skills: z.array(z.string()).optional(),
  experience: z.number().int().positive().optional(),
  certifications: z.array(z.string()).optional(),
  availability: z.string().optional(),
  location: z.string().max(200).optional(),
  notes: z.string().optional(),
});

/**
 * 更新售前资源验证Schema
 */
export const updateResourceSchema = z.object({
  name: z.string().min(1, '资源名称不能为空').max(100).optional(),
  email: z.string().email('邮箱格式不正确').optional(),
  phone: z.string().max(20).optional(),
  skills: z.array(z.string()).optional(),
  experience: z.number().int().positive().optional(),
  certifications: z.array(z.string()).optional(),
  status: resourceStatusSchema.optional(),
  availability: z.string().optional(),
  location: z.string().max(200).optional(),
  notes: z.string().optional(),
});

/**
 * 售前资源查询参数验证Schema
 */
export const resourceQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).default('10'),
  status: resourceStatusSchema.optional(),
  skill: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['name', 'experience', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * 创建售前请求验证Schema
 */
export const createRequestSchema = z.object({
  customerId: z.string().min(1, '客户ID不能为空'),
  type: z.string().min(1, '请求类型不能为空').max(50),
  title: z.string().min(1, '请求标题不能为空').max(200),
  description: z.string().optional(),
  priority: requestPrioritySchema.default('medium'),
  requiredSkills: z.array(z.string()).optional(),
  dueDate: z.string().datetime().optional(),
  estimatedDuration: z.number().int().positive().optional(),
  notes: z.string().optional(),
});

/**
 * 更新售前请求验证Schema
 */
export const updateRequestSchema = z.object({
  type: z.string().min(1, '请求类型不能为空').max(50).optional(),
  title: z.string().min(1, '请求标题不能为空').max(200).optional(),
  description: z.string().optional(),
  priority: requestPrioritySchema.optional(),
  requiredSkills: z.array(z.string()).optional(),
  dueDate: z.string().datetime().optional(),
  estimatedDuration: z.number().int().positive().optional(),
  notes: z.string().optional(),
});

/**
 * 更新请求状态验证Schema
 */
export const updateRequestStatusSchema = z.object({
  status: requestStatusSchema,
  assignedResourceId: z.string().optional(),
  notes: z.string().optional(),
});

/**
 * 售前请求查询参数验证Schema
 */
export const requestQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).default('10'),
  customerId: z.string().optional(),
  status: requestStatusSchema.optional(),
  priority: requestPrioritySchema.optional(),
  type: z.string().optional(),
  assignedResourceId: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'dueDate', 'priority']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * 资源ID参数验证Schema
 */
export const resourceIdSchema = z.object({
  id: z.string().min(1, '资源ID不能为空'),
});

/**
 * 请求ID参数验证Schema
 */
export const requestIdSchema = z.object({
  id: z.string().min(1, '请求ID不能为空'),
});

export type CreateResourceInput = z.infer<typeof createResourceSchema>;
export type UpdateResourceInput = z.infer<typeof updateResourceSchema>;
export type ResourceQueryInput = z.infer<typeof resourceQuerySchema>;
export type CreateRequestInput = z.infer<typeof createRequestSchema>;
export type UpdateRequestInput = z.infer<typeof updateRequestSchema>;
export type UpdateRequestStatusInput = z.infer<typeof updateRequestStatusSchema>;
export type RequestQueryInput = z.infer<typeof requestQuerySchema>;