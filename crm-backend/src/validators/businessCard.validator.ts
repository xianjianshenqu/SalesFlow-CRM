import { z } from 'zod';

// OCR识别结果结构
export const ocrResultSchema = z.object({
  name: z.string().optional(),           // 姓名
  title: z.string().optional(),          // 职位
  department: z.string().optional(),     // 部门
  company: z.string().optional(),        // 公司
  email: z.string().optional(),          // 邮箱
  phone: z.string().optional(),          // 电话
  mobile: z.string().optional(),         // 手机
  address: z.string().optional(),        // 地址
  website: z.string().optional(),        // 网站
  wechat: z.string().optional(),         // 微信
});

// 从名片创建客户验证
export const createCustomerFromCardSchema = z.object({
  name: z.string().min(1, '客户名称不能为空'),
  shortName: z.string().min(1).max(10).optional(),
  industry: z.string().optional(),
  city: z.string().optional(),
  address: z.string().optional(),
  priority: z.enum(['high', 'medium', 'low']).default('medium'),
  source: z.enum(['direct', 'referral', 'website', 'conference', 'partner']).default('direct'),
  notes: z.string().optional(),
  // 联系人信息
  contactName: z.string().min(1, '联系人姓名不能为空'),
  contactTitle: z.string().optional(),
  contactDepartment: z.string().optional(),
  contactEmail: z.string().email().optional().or(z.literal('')),
  contactPhone: z.string().optional(),
  contactMobile: z.string().optional(),
  contactWechat: z.string().optional(),
  contactRole: z.enum(['decision_maker', 'key_influencer', 'coach', 'end_user', 'gatekeeper', 'blocker']).default('end_user'),
});

// 名片查询验证
export const businessCardQuerySchema = z.object({
  status: z.enum(['pending', 'processed', 'failed']).optional(),
  page: z.string().optional(),
  pageSize: z.string().optional(),
});

export type OcrResult = z.infer<typeof ocrResultSchema>;
export type CreateCustomerFromCardInput = z.infer<typeof createCustomerFromCardSchema>;