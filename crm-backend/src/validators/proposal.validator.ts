import { z } from 'zod';

/**
 * 方案状态枚举
 */
export const proposalStatusSchema = z.enum(['draft', 'sent', 'accepted', 'rejected', 'expired']);

/**
 * 创建商务方案验证Schema
 */
export const createProposalSchema = z.object({
  customerId: z.string().min(1, '客户ID不能为空'),
  title: z.string().min(1, '方案标题不能为空').max(200, '标题最多200字符'),
  value: z.number().positive('方案金额必须为正数'),
  description: z.string().optional(),
  products: z.array(z.object({
    name: z.string(),
    quantity: z.number().int().positive(),
    unitPrice: z.number().positive(),
    totalPrice: z.number().positive(),
  })).optional(),
  terms: z.string().optional(),
  validUntil: z.string().datetime('日期格式不正确').optional(),
  notes: z.string().optional(),
});

/**
 * 更新商务方案验证Schema
 */
export const updateProposalSchema = z.object({
  title: z.string().min(1, '方案标题不能为空').max(200, '标题最多200字符').optional(),
  value: z.number().positive('方案金额必须为正数').optional(),
  description: z.string().optional(),
  products: z.array(z.object({
    name: z.string(),
    quantity: z.number().int().positive(),
    unitPrice: z.number().positive(),
    totalPrice: z.number().positive(),
  })).optional(),
  terms: z.string().optional(),
  validUntil: z.string().datetime('日期格式不正确').optional(),
  notes: z.string().optional(),
});

/**
 * 更新方案状态验证Schema
 */
export const updateProposalStatusSchema = z.object({
  status: proposalStatusSchema,
  notes: z.string().optional(),
});

/**
 * 方案查询参数验证Schema
 */
export const proposalQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).default('10'),
  customerId: z.string().optional(),
  status: proposalStatusSchema.optional(),
  minAmount: z.string().regex(/^\d+$/).transform(Number).optional(),
  maxAmount: z.string().regex(/^\d+$/).transform(Number).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'value', 'validUntil']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * 方案ID参数验证Schema
 */
export const proposalIdSchema = z.object({
  id: z.string().min(1, '方案ID不能为空'),
});

export type CreateProposalInput = z.infer<typeof createProposalSchema>;
export type UpdateProposalInput = z.infer<typeof updateProposalSchema>;
export type UpdateProposalStatusInput = z.infer<typeof updateProposalStatusSchema>;
export type ProposalQueryInput = z.infer<typeof proposalQuerySchema>;