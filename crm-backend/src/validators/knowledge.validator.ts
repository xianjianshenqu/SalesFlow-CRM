import { z } from 'zod';

// ==================== 文档分类枚举 ====================

export const documentCategorySchema = z.enum([
  'product_pricing',
  'proposal_template',
  'contract_template',
  'custom',
]);

// ==================== 文档管理验证 Schema ====================

export const uploadDocumentSchema = z.object({
  title: z.string().min(1, '文档标题不能为空').max(200, '标题最多200字符'),
  category: documentCategorySchema,
  description: z.string().max(1000, '描述最多1000字符').optional(),
  tags: z.array(z.string()).optional(),
  subCategory: z.string().max(100).optional(),
});

export const documentQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).default('10'),
  category: documentCategorySchema.optional(),
  search: z.string().optional(),
  isActive: z.string().transform(val => val === 'true').optional(),
});

export const documentIdSchema = z.object({
  id: z.string().min(1, '文档ID不能为空'),
});

// ==================== 产品价格表验证 Schema ====================

export const createProductSchema = z.object({
  productName: z.string().min(1, '产品名称不能为空').max(200, '名称最多200字符'),
  productCode: z.string().max(100).optional(),
  category: z.string().max(100).optional(),
  specification: z.string().optional(),
  unitPrice: z.number().positive('单价必须为正数'),
  unit: z.string().max(50).optional(),
  minQuantity: z.number().int().nonnegative().optional(),
  discount: z.object({
    type: z.enum(['percentage', 'fixed']),
    value: z.number(),
  }).optional(),
  validFrom: z.string().datetime().optional(),
  validUntil: z.string().datetime().optional(),
  notes: z.string().optional(),
  documentId: z.string().optional(),
});

export const updateProductSchema = z.object({
  productName: z.string().min(1, '产品名称不能为空').max(200, '名称最多200字符').optional(),
  productCode: z.string().max(100).optional(),
  category: z.string().max(100).optional(),
  specification: z.string().optional(),
  unitPrice: z.number().positive('单价必须为正数').optional(),
  unit: z.string().max(50).optional(),
  minQuantity: z.number().int().nonnegative().optional(),
  discount: z.object({
    type: z.enum(['percentage', 'fixed']),
    value: z.number(),
  }).optional(),
  validFrom: z.string().datetime().optional().nullable(),
  validUntil: z.string().datetime().optional().nullable(),
  isActive: z.boolean().optional(),
  notes: z.string().optional(),
});

export const productQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).default('10'),
  category: z.string().optional(),
  search: z.string().optional(),
  isActive: z.string().transform(val => val === 'true').optional(),
  minPrice: z.string().regex(/^\d+(\.\d+)?$/).transform(Number).optional(),
  maxPrice: z.string().regex(/^\d+(\.\d+)?$/).transform(Number).optional(),
});

export const productIdSchema = z.object({
  id: z.string().min(1, '产品ID不能为空'),
});

// ==================== 合同模板验证 Schema ====================

export const createContractSchema = z.object({
  name: z.string().min(1, '模板名称不能为空').max(200, '名称最多200字符'),
  category: z.string().min(1, '分类不能为空').max(100),
  description: z.string().max(1000).optional(),
  content: z.string().min(1, '模板内容不能为空'),
  variables: z.array(z.object({
    name: z.string(),
    label: z.string(),
    type: z.enum(['text', 'number', 'date', 'select']),
    required: z.boolean().optional(),
    options: z.array(z.string()).optional(),
  })).optional(),
  tags: z.array(z.string()).optional(),
});

export const updateContractSchema = z.object({
  name: z.string().min(1, '模板名称不能为空').max(200, '名称最多200字符').optional(),
  category: z.string().min(1, '分类不能为空').max(100).optional(),
  description: z.string().max(1000).optional(),
  content: z.string().min(1, '模板内容不能为空').optional(),
  variables: z.array(z.object({
    name: z.string(),
    label: z.string(),
    type: z.enum(['text', 'number', 'date', 'select']),
    required: z.boolean().optional(),
    options: z.array(z.string()).optional(),
  })).optional(),
  tags: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

export const contractQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).default('10'),
  category: z.string().optional(),
  search: z.string().optional(),
  isActive: z.string().transform(val => val === 'true').optional(),
});

export const contractIdSchema = z.object({
  id: z.string().min(1, '模板ID不能为空'),
});

// ==================== 自定义数据表验证 Schema ====================

export const createCustomTableSchema = z.object({
  name: z.string().min(1, '表名不能为空').max(100, '名称最多100字符'),
  description: z.string().max(500).optional(),
  columns: z.array(z.object({
    name: z.string(),
    label: z.string(),
    type: z.enum(['text', 'number', 'date', 'select', 'textarea', 'checkbox']),
    required: z.boolean().optional(),
    options: z.array(z.string()).optional(),
    width: z.number().optional(),
  })),
});

export const updateCustomTableSchema = z.object({
  name: z.string().min(1, '表名不能为空').max(100, '名称最多100字符').optional(),
  description: z.string().max(500).optional(),
  columns: z.array(z.object({
    name: z.string(),
    label: z.string(),
    type: z.enum(['text', 'number', 'date', 'select', 'textarea', 'checkbox']),
    required: z.boolean().optional(),
    options: z.array(z.string()).optional(),
    width: z.number().optional(),
  })).optional(),
});

export const customTableIdSchema = z.object({
  id: z.string().min(1, '数据表ID不能为空'),
});

export const customTableRowIdSchema = z.object({
  id: z.string().min(1, '数据表ID不能为空'),
  rowId: z.string().min(1, '数据行ID不能为空'),
});

export const customTableRowQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).default('20'),
  search: z.string().optional(),
});

export const createCustomTableRowSchema = z.object({
  data: z.record(z.any()),
});

export const updateCustomTableRowSchema = z.object({
  data: z.record(z.any()),
});

// ==================== 知识库搜索验证 Schema ====================

export const knowledgeSearchSchema = z.object({
  q: z.string().min(1, '搜索关键词不能为空'),
  types: z.string().optional(), // 逗号分隔：documents,products,contracts
  limit: z.string().regex(/^\d+$/).transform(Number).default('10'),
});

// ==================== 类型导出 ====================

export type UploadDocumentInput = z.infer<typeof uploadDocumentSchema>;
export type DocumentQueryInput = z.infer<typeof documentQuerySchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductQueryInput = z.infer<typeof productQuerySchema>;
export type CreateContractInput = z.infer<typeof createContractSchema>;
export type UpdateContractInput = z.infer<typeof updateContractSchema>;
export type ContractQueryInput = z.infer<typeof contractQuerySchema>;
export type CreateCustomTableInput = z.infer<typeof createCustomTableSchema>;
export type UpdateCustomTableInput = z.infer<typeof updateCustomTableSchema>;
export type CreateCustomTableRowInput = z.infer<typeof createCustomTableRowSchema>;
export type UpdateCustomTableRowInput = z.infer<typeof updateCustomTableRowSchema>;
export type CustomTableRowQueryInput = z.infer<typeof customTableRowQuerySchema>;
export type KnowledgeSearchInput = z.infer<typeof knowledgeSearchSchema>;
