import { z } from 'zod';

// 分析企业输入验证
export const analyzeCompanySchema = z.object({
  companyName: z.string().min(1, '公司名称不能为空').optional(),
  imageUrl: z.string().url('图片URL格式不正确').optional(),
}).refine(
  (data) => data.companyName || data.imageUrl,
  { message: '请提供公司名称或图片URL' }
);

// 转换为客户验证
export const convertToCustomerSchema = z.object({
  name: z.string().min(1, '客户名称不能为空'),
  shortName: z.string().min(1).max(10).optional(),
  industry: z.string().optional(),
  city: z.string().optional(),
  address: z.string().optional(),
  priority: z.enum(['high', 'medium', 'low']).default('medium'),
  source: z.enum(['direct', 'referral', 'website', 'conference', 'partner']).default('direct'),
  notes: z.string().optional(),
  contactPerson: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
});

// 查询历史记录验证
export const getHistorySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  status: z.enum(['analyzed', 'converted']).optional(),
  search: z.string().optional(),
});

export type AnalyzeCompanyInput = z.infer<typeof analyzeCompanySchema>;
export type ConvertToCustomerInput = z.infer<typeof convertToCustomerSchema>;
export type GetHistoryQuery = z.infer<typeof getHistorySchema>;