import { z } from 'zod';

/**
 * 方案状态枚举（扩展）
 */
export const proposalStatusSchema = z.enum([
  'draft',
  'requirement_analysis',
  'designing',
  'pending_review',
  'review_passed',
  'review_rejected',
  'customer_proposal',
  'negotiation',
  'sent',
  'accepted',
  'rejected',
  'expired'
]);

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

// ==================== 方案模板验证 Schema ====================

export const createTemplateSchema = z.object({
  name: z.string().min(1, '模板名称不能为空').max(100, '名称最多100字符'),
  category: z.string().min(1, '分类不能为空'),
  description: z.string().optional(),
  content: z.string().min(1, '模板内容不能为空'),
  products: z.array(z.object({
    name: z.string(),
    quantity: z.number().int().positive(),
    unitPrice: z.number().positive(),
    totalPrice: z.number().positive(),
  })).optional(),
  terms: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const templateQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).default('10'),
  category: z.string().optional(),
  search: z.string().optional(),
});

// ==================== 需求分析阶段验证 Schema ====================

export const createRequirementAnalysisSchema = z.object({
  customerId: z.string().min(1, '客户ID不能为空'),
  sourceType: z.enum(['manual', 'ai_recording', 'ai_followup']),
  recordingId: z.string().optional(),
  rawContent: z.string().optional(),
});

export const updateRequirementAnalysisSchema = z.object({
  rawContent: z.string().optional(),
  finalContent: z.string().optional(),
  extractedNeeds: z.array(z.object({
    need: z.string(),
    priority: z.enum(['high', 'medium', 'low']),
    source: z.string(),
  })).optional(),
  painPoints: z.array(z.object({
    point: z.string(),
    severity: z.enum(['high', 'medium', 'low']),
    category: z.string(),
  })).optional(),
  budgetHint: z.object({
    range: z.string().optional(),
    timeline: z.string().optional(),
  }).optional(),
  decisionTimeline: z.string().optional(),
});

export const aiAnalyzeRequestSchema = z.object({
  sourceType: z.enum(['recording', 'followup']),
  recordingId: z.string().optional(),
});

// ==================== 方案设计阶段验证 Schema ====================

export const designProposalSchema = z.object({
  templateId: z.string().optional(),
  products: z.array(z.object({
    name: z.string(),
    quantity: z.number().int().positive(),
    unitPrice: z.number().positive(),
    totalPrice: z.number().positive(),
    description: z.string().optional(),
    priority: z.enum(['essential', 'recommended', 'optional']).optional(),
  })).optional(),
  terms: z.string().optional(),
  description: z.string().optional(),
});

export const matchTemplateSchema = z.object({
  industry: z.string().optional(),
  needs: z.array(z.string()).optional(),
  budget: z.number().optional(),
});

// ==================== 内部评审阶段验证 Schema ====================

export const createReviewSchema = z.object({
  reviewerId: z.string().optional(),
  sharedWith: z.array(z.string()).optional(),
});

export const addReviewCommentSchema = z.object({
  comment: z.string().min(1, '评审意见不能为空'),
});

export const reviewResultSchema = z.object({
  result: z.enum(['approved', 'rejected']),
  resultNotes: z.string().optional(),
});

// ==================== 客户提案阶段验证 Schema ====================

export const createCustomerProposalSchema = z.object({
  emailTo: z.string().email('邮箱格式不正确'),
  emailCc: z.array(z.string().email()).optional(),
  emailSubject: z.string().min(1, '邮件主题不能为空').optional(),
  emailBody: z.string().optional(),
});

export const updateCustomerProposalEmailSchema = z.object({
  emailTo: z.string().email('邮箱格式不正确').optional(),
  emailCc: z.array(z.string().email()).optional(),
  emailSubject: z.string().min(1, '邮件主题不能为空').optional(),
  emailBody: z.string().optional(),
});

// ==================== 商务谈判阶段验证 Schema ====================

export const createNegotiationSchema = z.object({});

export const addDiscussionSchema = z.object({
  content: z.string().min(1, '讨论内容不能为空'),
  participants: z.array(z.string()).optional(),
});

export const updateTermsSchema = z.object({
  agreedTerms: z.array(z.object({
    term: z.string(),
    value: z.string(),
    confirmed: z.boolean().optional(),
  })).optional(),
});

// ==================== 类型导出 ====================

export type CreateTemplateInput = z.infer<typeof createTemplateSchema>;
export type TemplateQueryInput = z.infer<typeof templateQuerySchema>;
export type CreateRequirementAnalysisInput = z.infer<typeof createRequirementAnalysisSchema>;
export type UpdateRequirementAnalysisInput = z.infer<typeof updateRequirementAnalysisSchema>;
export type AiAnalyzeRequestInput = z.infer<typeof aiAnalyzeRequestSchema>;
export type DesignProposalInput = z.infer<typeof designProposalSchema>;
export type MatchTemplateInput = z.infer<typeof matchTemplateSchema>;
export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type AddReviewCommentInput = z.infer<typeof addReviewCommentSchema>;
export type ReviewResultInput = z.infer<typeof reviewResultSchema>;
export type CreateCustomerProposalInput = z.infer<typeof createCustomerProposalSchema>;
export type UpdateCustomerProposalEmailInput = z.infer<typeof updateCustomerProposalEmailSchema>;
export type CreateNegotiationInput = z.infer<typeof createNegotiationSchema>;
export type AddDiscussionInput = z.infer<typeof addDiscussionSchema>;
export type UpdateTermsInput = z.infer<typeof updateTermsSchema>;