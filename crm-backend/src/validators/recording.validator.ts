import { z } from 'zod';

/**
 * AI录音分析情感类型
 */
export const sentimentSchema = z.enum(['positive', 'neutral', 'negative']);

/**
 * 创建录音验证Schema
 */
export const createRecordingSchema = z.object({
  customerId: z.string().min(1, '客户ID不能为空'),
  title: z.string().min(1, '录音标题不能为空').max(200, '标题最多200字符'),
  duration: z.number().int().positive('录音时长必须为正整数'),
  fileUrl: z.string().url('录音文件URL格式不正确'),
  fileSize: z.number().int().positive('文件大小必须为正整数').optional(),
  transcript: z.string().optional(),
  summary: z.string().optional(),
  sentiment: sentimentSchema.optional(),
  keywords: z.array(z.string()).optional(),
  actionItems: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

/**
 * 更新录音验证Schema
 */
export const updateRecordingSchema = z.object({
  title: z.string().min(1, '录音标题不能为空').max(200, '标题最多200字符').optional(),
  transcript: z.string().optional(),
  summary: z.string().optional(),
  sentiment: sentimentSchema.optional(),
  keywords: z.array(z.string()).optional(),
  actionItems: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

/**
 * 录音查询参数验证Schema
 */
export const recordingQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).default('10'),
  customerId: z.string().optional(),
  sentiment: sentimentSchema.optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'duration', 'sentiment']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * 录音ID参数验证Schema
 */
export const recordingIdSchema = z.object({
  id: z.string().min(1, '录音ID不能为空'),
});

export type CreateRecordingInput = z.infer<typeof createRecordingSchema>;
export type UpdateRecordingInput = z.infer<typeof updateRecordingSchema>;
export type RecordingQueryInput = z.infer<typeof recordingQuerySchema>;