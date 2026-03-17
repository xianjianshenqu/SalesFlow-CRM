import { z } from 'zod';

/**
 * 绩效记录创建验证Schema
 */
export const createPerformanceSchema = z.object({
  userId: z.string().min(1, '用户ID不能为空'),
  date: z.string().transform(v => new Date(v)),
  calls: z.number().int().min(0).optional(),
  meetings: z.number().int().min(0).optional(),
  visits: z.number().int().min(0).optional(),
  proposals: z.number().int().min(0).optional(),
  closedDeals: z.number().int().min(0).optional(),
  revenue: z.number().min(0).optional(),
});

/**
 * 绩效查询验证Schema
 */
export const performanceQuerySchema = z.object({
  userId: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z.string().regex(/^\d+$/).transform(Number).default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).default('30'),
});

/**
 * 趋势查询验证Schema
 */
export const trendsQuerySchema = z.object({
  days: z.string().regex(/^\d+$/).transform(Number).default('30'),
});

/**
 * 教练建议类型枚举
 */
export const coachingTypeSchema = z.enum(['performance', 'skill', 'opportunity', 'time_management']);

/**
 * 教练建议优先级枚举
 */
export const coachingPrioritySchema = z.enum(['high', 'medium', 'low']);

/**
 * 教练建议状态枚举
 */
export const coachingStatusSchema = z.enum(['pending', 'completed', 'dismissed']);

/**
 * 创建教练建议验证Schema
 */
export const createCoachingSchema = z.object({
  userId: z.string().min(1, '用户ID不能为空'),
  type: coachingTypeSchema,
  priority: coachingPrioritySchema,
  title: z.string().min(1, '标题不能为空').max(200),
  description: z.string().min(1, '描述不能为空'),
  actions: z.array(z.object({
    step: z.number().int().positive(),
    action: z.string(),
    expectedOutcome: z.string(),
  })).optional(),
  metrics: z.record(z.number()).optional(),
  expiresAt: z.string().datetime().transform(v => new Date(v)).optional(),
});

/**
 * 教练建议查询验证Schema
 */
export const coachingQuerySchema = z.object({
  userId: z.string().optional(),
  status: coachingStatusSchema.optional(),
  type: coachingTypeSchema.optional(),
});

/**
 * 建议ID验证Schema
 */
export const suggestionIdSchema = z.object({
  id: z.string().min(1, '建议ID不能为空'),
});

/**
 * 绩效分析周期验证Schema
 */
export const periodSchema = z.enum(['daily', 'weekly', 'monthly']);

/**
 * 团队排名查询验证Schema
 */
export const rankingQuerySchema = z.object({
  department: z.string().optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).default('10'),
});

// 类型导出
export type CreatePerformanceInput = z.infer<typeof createPerformanceSchema>;
export type PerformanceQueryInput = z.infer<typeof performanceQuerySchema>;
export type TrendsQueryInput = z.infer<typeof trendsQuerySchema>;
export type CreateCoachingInput = z.infer<typeof createCoachingSchema>;
export type CoachingQueryInput = z.infer<typeof coachingQuerySchema>;
export type RankingQueryInput = z.infer<typeof rankingQuerySchema>;