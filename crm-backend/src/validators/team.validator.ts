import { z } from 'zod';

/**
 * 团队角色枚举
 */
export const teamRoleSchema = z.enum(['sales', 'manager', 'admin', 'support', 'presales']);

/**
 * 创建团队成员验证Schema
 */
export const createTeamMemberSchema = z.object({
  name: z.string().min(1, '姓名不能为空').max(50, '姓名最多50字符'),
  email: z.string().email('邮箱格式不正确'),
  phone: z.string().max(20).optional(),
  role: teamRoleSchema,
  avatar: z.string().url().optional(),
  department: z.string().max(100).optional(),
  position: z.string().max(100).optional(),
  targets: z.object({
    revenue: z.number().positive().optional(),
    deals: z.number().int().positive().optional(),
    customers: z.number().int().positive().optional(),
  }).optional(),
  skills: z.array(z.string()).optional(),
  bio: z.string().max(500).optional(),
});

/**
 * 更新团队成员验证Schema
 */
export const updateTeamMemberSchema = z.object({
  name: z.string().min(1, '姓名不能为空').max(50, '姓名最多50字符').optional(),
  email: z.string().email('邮箱格式不正确').optional(),
  phone: z.string().max(20).optional(),
  role: teamRoleSchema.optional(),
  avatar: z.string().url().optional(),
  department: z.string().max(100).optional(),
  position: z.string().max(100).optional(),
  targets: z.object({
    revenue: z.number().positive().optional(),
    deals: z.number().int().positive().optional(),
    customers: z.number().int().positive().optional(),
  }).optional(),
  skills: z.array(z.string()).optional(),
  bio: z.string().max(500).optional(),
  isActive: z.boolean().optional(),
});

/**
 * 团队成员查询参数验证Schema
 */
export const teamMemberQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).default('10'),
  role: teamRoleSchema.optional(),
  department: z.string().optional(),
  search: z.string().optional(),
  isActive: z.string().transform(v => v === 'true').optional(),
  sortBy: z.enum(['name', 'revenue', 'deals', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * 团队成员ID参数验证Schema
 */
export const teamMemberIdSchema = z.object({
  id: z.string().min(1, '成员ID不能为空'),
});

/**
 * 创建团队活动验证Schema
 */
export const createTeamActivitySchema = z.object({
  type: z.enum(['deal_closed', 'customer_added', 'meeting_scheduled', 'task_completed', 'achievement', 'other']),
  title: z.string().min(1, '活动标题不能为空').max(200),
  description: z.string().optional(),
  relatedCustomerId: z.string().optional(),
  relatedOpportunityId: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

/**
 * 活动查询参数验证Schema
 */
export const activityQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).default('20'),
  memberId: z.string().optional(),
  type: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export type CreateTeamMemberInput = z.infer<typeof createTeamMemberSchema>;
export type UpdateTeamMemberInput = z.infer<typeof updateTeamMemberSchema>;
export type TeamMemberQueryInput = z.infer<typeof teamMemberQuerySchema>;
export type CreateTeamActivityInput = z.infer<typeof createTeamActivitySchema>;
export type ActivityQueryInput = z.infer<typeof activityQuerySchema>;