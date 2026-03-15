import { z } from 'zod';

// 联系人角色枚举
export const contactRoleSchema = z.enum([
  'decision_maker',   // 决策人
  'key_influencer',   // 关键人/影响者
  'coach',            // 教练/内线
  'end_user',         // 用户
  'gatekeeper',       // 把关人
  'blocker',          // 反对者
]);

// 创建联系人验证
export const createContactSchema = z.object({
  name: z.string().min(1, '联系人姓名不能为空'),
  title: z.string().optional(),           // 职位
  department: z.string().optional(),      // 部门
  email: z.string().email('邮箱格式不正确').optional().or(z.literal('')),
  phone: z.string().optional(),
  mobile: z.string().optional(),          // 手机
  wechat: z.string().optional(),          // 微信
  role: contactRoleSchema.default('end_user'),
  isPrimary: z.boolean().default(false),  // 是否主联系人
  notes: z.string().optional(),
  lastContact: z.string().optional(),     // 最后联系时间
});

// 更新联系人验证
export const updateContactSchema = z.object({
  name: z.string().min(1).optional(),
  title: z.string().optional(),
  department: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  mobile: z.string().optional(),
  wechat: z.string().optional(),
  role: contactRoleSchema.optional(),
  isPrimary: z.boolean().optional(),
  notes: z.string().optional(),
  lastContact: z.string().optional(),
});

// 联系人查询验证
export const contactQuerySchema = z.object({
  customerId: z.string().optional(),
  role: contactRoleSchema.optional(),
  department: z.string().optional(),
  isPrimary: z.string().optional(),
  search: z.string().optional(),
  page: z.string().optional(),
  pageSize: z.string().optional(),
});

// 批量导入联系人验证
export const batchImportContactsSchema = z.object({
  contacts: z.array(createContactSchema).min(1, '至少导入一个联系人'),
});

export type CreateContactInput = z.infer<typeof createContactSchema>;
export type UpdateContactInput = z.infer<typeof updateContactSchema>;
export type ContactRole = z.infer<typeof contactRoleSchema>;