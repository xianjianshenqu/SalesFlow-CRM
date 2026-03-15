import { z } from 'zod';

/**
 * 地理坐标验证Schema
 */
export const coordinateSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

/**
 * 客户分布查询参数验证Schema
 */
export const customerDistributionQuerySchema = z.object({
  province: z.string().optional(),
  city: z.string().optional(),
  stage: z.string().optional(),
  hasLocation: z.string().transform(v => v === 'true').optional(),
});

/**
 * 路线优化请求验证Schema
 */
export const optimizeRouteSchema = z.object({
  customerIds: z.array(z.string().min(1)).min(2, '至少需要2个客户'),
  startLocation: coordinateSchema.optional(),
  endLocation: coordinateSchema.optional(),
  optimizeFor: z.enum(['distance', 'time']).default('distance'),
});

/**
 * 拜访路线查询参数验证Schema
 */
export const routeQuerySchema = z.object({
  memberId: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  status: z.enum(['planned', 'in_progress', 'completed']).optional(),
});

/**
 * 创建拜访路线验证Schema
 */
export const createRouteSchema = z.object({
  name: z.string().min(1, '路线名称不能为空').max(100),
  memberId: z.string().min(1, '成员ID不能为空'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  customerIds: z.array(z.string().min(1)).min(1, '至少需要1个客户'),
  notes: z.string().optional(),
});

/**
 * 更新拜访路线验证Schema
 */
export const updateRouteSchema = z.object({
  name: z.string().min(1, '路线名称不能为空').max(100).optional(),
  customerIds: z.array(z.string().min(1)).optional(),
  status: z.enum(['planned', 'in_progress', 'completed']).optional(),
  notes: z.string().optional(),
});

/**
 * 路线ID参数验证Schema
 */
export const routeIdSchema = z.object({
  id: z.string().min(1, '路线ID不能为空'),
});

export type CoordinateInput = z.infer<typeof coordinateSchema>;
export type CustomerDistributionQueryInput = z.infer<typeof customerDistributionQuerySchema>;
export type OptimizeRouteInput = z.infer<typeof optimizeRouteSchema>;
export type RouteQueryInput = z.infer<typeof routeQuerySchema>;
export type CreateRouteInput = z.infer<typeof createRouteSchema>;
export type UpdateRouteInput = z.infer<typeof updateRouteSchema>;