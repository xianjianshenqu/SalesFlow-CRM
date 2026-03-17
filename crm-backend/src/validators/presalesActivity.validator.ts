import { z } from 'zod';

/**
 * 活动状态枚举
 */
export const activityStatusSchema = z.enum(['draft', 'pending_approval', 'approved', 'ongoing', 'completed', 'cancelled']);

/**
 * 审批状态枚举
 */
export const approvalStatusSchema = z.enum(['none', 'pending', 'approved', 'rejected']);

/**
 * 活动类型枚举
 */
export const activityTypeSchema = z.enum(['demo', 'poc', 'training', 'seminar', 'other']);

/**
 * 二维码类型枚举
 */
export const qrCodeTypeSchema = z.enum(['exclusive', 'generic']);

/**
 * 问题分类枚举
 */
export const questionCategorySchema = z.enum(['product', 'pricing', 'technical', 'implementation', 'others']);

/**
 * 问题优先级枚举
 */
export const questionPrioritySchema = z.enum(['high', 'medium', 'low']);

/**
 * 问题状态枚举
 */
export const questionStatusSchema = z.enum(['pending', 'answered', 'closed']);

// ==================== 活动验证 ====================

/**
 * 创建活动验证Schema
 */
export const createActivitySchema = z.object({
  title: z.string().min(1, '活动标题不能为空').max(200),
  type: activityTypeSchema,
  description: z.string().max(2000).optional(),
  customerId: z.string().optional(),
  location: z.string().max(200).optional(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
});

/**
 * 更新活动验证Schema
 */
export const updateActivitySchema = z.object({
  title: z.string().min(1, '活动标题不能为空').max(200).optional(),
  type: activityTypeSchema.optional(),
  description: z.string().max(2000).optional(),
  customerId: z.string().optional().nullable(),
  location: z.string().max(200).optional(),
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
  status: activityStatusSchema.optional(),
});

/**
 * 活动查询参数验证Schema
 */
export const activityQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).default('10'),
  type: activityTypeSchema.optional(),
  status: activityStatusSchema.optional(),
  approvalStatus: approvalStatusSchema.optional(),
  customerId: z.string().optional(),
  search: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  sortBy: z.enum(['createdAt', 'startTime', 'title']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * 活动ID参数验证Schema
 */
export const activityIdSchema = z.object({
  id: z.string().min(1, '活动ID不能为空'),
});

/**
 * 审批操作验证Schema
 */
export const approvalActionSchema = z.object({
  notes: z.string().max(1000).optional(),
});

// ==================== 二维码验证 ====================

/**
 * 创建二维码验证Schema
 */
export const createQrCodeSchema = z.object({
  codeType: qrCodeTypeSchema,
  validFrom: z.string().datetime().optional(),
  validUntil: z.string().datetime().optional().nullable(),
});

/**
 * 二维码ID参数验证Schema
 */
export const qrCodeIdSchema = z.object({
  qrCodeId: z.string().min(1, '二维码ID不能为空'),
});

// ==================== 签到验证 ====================

/**
 * 签到验证Schema
 */
export const signInSchema = z.object({
  qrCodeId: z.string().min(1, '二维码ID不能为空'),
  customerName: z.string().min(1, '姓名不能为空').max(100),
  phone: z.string().min(1, '手机号不能为空').max(20),
  email: z.string().email('邮箱格式不正确').optional().or(z.literal('')),
  company: z.string().max(200).optional(),
  title: z.string().max(100).optional(),
  notes: z.string().max(500).optional(),
});

/**
 * 签到查询参数验证Schema
 */
export const signInQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).default('20'),
  isNewCustomer: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  search: z.string().optional(),
});

/**
 * 签到ID参数验证Schema
 */
export const signInIdSchema = z.object({
  signInId: z.string().min(1, '签到ID不能为空'),
});

// ==================== 问题验证 ====================

/**
 * 创建问题验证Schema
 */
export const createQuestionSchema = z.object({
  question: z.string().min(1, '问题内容不能为空').max(2000),
  category: questionCategorySchema.optional(),
  priority: questionPrioritySchema.optional(),
});

/**
 * 更新问题验证Schema
 */
export const updateQuestionSchema = z.object({
  category: questionCategorySchema.optional(),
  priority: questionPrioritySchema.optional(),
  status: questionStatusSchema.optional(),
});

/**
 * 回答问题验证Schema
 */
export const answerQuestionSchema = z.object({
  answer: z.string().min(1, '回答内容不能为空').max(2000),
});

/**
 * 问题查询参数验证Schema
 */
export const questionQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).default('20'),
  category: questionCategorySchema.optional(),
  priority: questionPrioritySchema.optional(),
  status: questionStatusSchema.optional(),
  search: z.string().optional(),
});

/**
 * 问题ID参数验证Schema
 */
export const questionIdSchema = z.object({
  questionId: z.string().min(1, '问题ID不能为空'),
});

/**
 * AI分类问题验证Schema
 */
export const classifyQuestionSchema = z.object({
  question: z.string().min(1, '问题内容不能为空').max(2000),
});

// ==================== 类型导出 ====================

export type CreateActivityInput = z.infer<typeof createActivitySchema>;
export type UpdateActivityInput = z.infer<typeof updateActivitySchema>;
export type ActivityQueryInput = z.infer<typeof activityQuerySchema>;
export type CreateQrCodeInput = z.infer<typeof createQrCodeSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type SignInQueryInput = z.infer<typeof signInQuerySchema>;
export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;
export type UpdateQuestionInput = z.infer<typeof updateQuestionSchema>;
export type AnswerQuestionInput = z.infer<typeof answerQuestionSchema>;
export type QuestionQueryInput = z.infer<typeof questionQuerySchema>;
export type ClassifyQuestionInput = z.infer<typeof classifyQuestionSchema>;