import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import knowledgeController from '../controllers/knowledge.controller';
import { authMiddleware } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
  uploadDocumentSchema,
  documentQuerySchema,
  documentIdSchema,
  createProductSchema,
  updateProductSchema,
  productQuerySchema,
  productIdSchema,
  createContractSchema,
  updateContractSchema,
  contractQuerySchema,
  contractIdSchema,
  createCustomTableSchema,
  updateCustomTableSchema,
  customTableIdSchema,
  customTableRowIdSchema,
  customTableRowQuerySchema,
  createCustomTableRowSchema,
  updateCustomTableRowSchema,
  knowledgeSearchSchema,
} from '../validators/knowledge.validator';

const router = Router();

// 确保上传目录存在
const uploadDir = path.join(process.cwd(), 'uploads', 'knowledge');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 配置 multer 存储
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    // 生成唯一文件名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `doc-${uniqueSuffix}${ext}`);
  },
});

// 文件过滤器
const fileFilter = (_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
    'application/vnd.ms-excel', // xls
    'text/csv', // csv
    'application/pdf', // pdf
    'application/msword', // doc
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
    'image/png', // png
    'image/jpeg', // jpg
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('不支持的文件类型'));
  }
};

// 创建 multer 实例
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
});

// 导入专用 multer（内存存储，用于解析）
const importUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB
  },
});

// ==================== 文档管理路由 ====================

/**
 * @swagger
 * tags:
 *   name: Knowledge
 *   description: 企业知识库管理
 */

/**
 * @swagger
 * /knowledge/documents:
 *   get:
 *     summary: 获取文档列表
 *     tags: [Knowledge]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/documents',
  authMiddleware,
  validate(documentQuerySchema, 'query'),
  knowledgeController.getDocuments,
);

/**
 * @swagger
 * /knowledge/documents/upload:
 *   post:
 *     summary: 上传文档
 *     tags: [Knowledge]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/documents/upload',
  authMiddleware,
  upload.single('file'),
  validate(uploadDocumentSchema),
  knowledgeController.uploadDocument,
);

/**
 * @swagger
 * /knowledge/documents/{id}:
 *   get:
 *     summary: 获取文档详情
 *     tags: [Knowledge]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/documents/:id',
  authMiddleware,
  validate(documentIdSchema, 'params'),
  knowledgeController.getDocumentById,
);

/**
 * @swagger
 * /knowledge/documents/{id}:
 *   delete:
 *     summary: 删除文档
 *     tags: [Knowledge]
 *     security:
 *       - bearerAuth: []
 */
router.delete(
  '/documents/:id',
  authMiddleware,
  validate(documentIdSchema, 'params'),
  knowledgeController.deleteDocument,
);

/**
 * @swagger
 * /knowledge/documents/{id}/parse:
 *   post:
 *     summary: 解析文档
 *     tags: [Knowledge]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/documents/:id/parse',
  authMiddleware,
  validate(documentIdSchema, 'params'),
  knowledgeController.parseDocument,
);

// ==================== 产品价格表路由 ====================

/**
 * @swagger
 * /knowledge/products:
 *   get:
 *     summary: 获取产品列表
 *     tags: [Knowledge]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/products',
  authMiddleware,
  validate(productQuerySchema, 'query'),
  knowledgeController.getProducts,
);

/**
 * @swagger
 * /knowledge/products:
 *   post:
 *     summary: 创建产品
 *     tags: [Knowledge]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/products',
  authMiddleware,
  validate(createProductSchema),
  knowledgeController.createProduct,
);

/**
 * @swagger
 * /knowledge/products/{id}:
 *   put:
 *     summary: 更新产品
 *     tags: [Knowledge]
 *     security:
 *       - bearerAuth: []
 */
router.put(
  '/products/:id',
  authMiddleware,
  validate(productIdSchema, 'params'),
  validate(updateProductSchema),
  knowledgeController.updateProduct,
);

/**
 * @swagger
 * /knowledge/products/{id}:
 *   delete:
 *     summary: 删除产品
 *     tags: [Knowledge]
 *     security:
 *       - bearerAuth: []
 */
router.delete(
  '/products/:id',
  authMiddleware,
  validate(productIdSchema, 'params'),
  knowledgeController.deleteProduct,
);

/**
 * @swagger
 * /knowledge/products/import:
 *   post:
 *     summary: 导入产品（Excel/CSV）
 *     tags: [Knowledge]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/products/import',
  authMiddleware,
  importUpload.single('file'),
  knowledgeController.importProducts,
);

/**
 * @swagger
 * /knowledge/products/export:
 *   get:
 *     summary: 导出产品（Excel）
 *     tags: [Knowledge]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/products/export',
  authMiddleware,
  validate(productQuerySchema, 'query'),
  knowledgeController.exportProducts,
);

// ==================== 合同模板路由 ====================

/**
 * @swagger
 * /knowledge/contracts:
 *   get:
 *     summary: 获取合同模板列表
 *     tags: [Knowledge]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/contracts',
  authMiddleware,
  validate(contractQuerySchema, 'query'),
  knowledgeController.getContracts,
);

/**
 * @swagger
 * /knowledge/contracts:
 *   post:
 *     summary: 创建合同模板
 *     tags: [Knowledge]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/contracts',
  authMiddleware,
  validate(createContractSchema),
  knowledgeController.createContract,
);

/**
 * @swagger
 * /knowledge/contracts/{id}:
 *   get:
 *     summary: 获取合同模板详情
 *     tags: [Knowledge]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/contracts/:id',
  authMiddleware,
  validate(contractIdSchema, 'params'),
  knowledgeController.getContractById,
);

/**
 * @swagger
 * /knowledge/contracts/{id}:
 *   put:
 *     summary: 更新合同模板
 *     tags: [Knowledge]
 *     security:
 *       - bearerAuth: []
 */
router.put(
  '/contracts/:id',
  authMiddleware,
  validate(contractIdSchema, 'params'),
  validate(updateContractSchema),
  knowledgeController.updateContract,
);

/**
 * @swagger
 * /knowledge/contracts/{id}:
 *   delete:
 *     summary: 删除合同模板
 *     tags: [Knowledge]
 *     security:
 *       - bearerAuth: []
 */
router.delete(
  '/contracts/:id',
  authMiddleware,
  validate(contractIdSchema, 'params'),
  knowledgeController.deleteContract,
);

// ==================== 自定义数据表路由 ====================

/**
 * @swagger
 * /knowledge/custom-tables:
 *   get:
 *     summary: 获取自定义数据表列表
 *     tags: [Knowledge]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/custom-tables',
  authMiddleware,
  knowledgeController.getCustomTables,
);

/**
 * @swagger
 * /knowledge/custom-tables:
 *   post:
 *     summary: 创建自定义数据表
 *     tags: [Knowledge]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/custom-tables',
  authMiddleware,
  validate(createCustomTableSchema),
  knowledgeController.createCustomTable,
);

/**
 * @swagger
 * /knowledge/custom-tables/{id}:
 *   put:
 *     summary: 更新自定义数据表
 *     tags: [Knowledge]
 *     security:
 *       - bearerAuth: []
 */
router.put(
  '/custom-tables/:id',
  authMiddleware,
  validate(customTableIdSchema, 'params'),
  validate(updateCustomTableSchema),
  knowledgeController.updateCustomTable,
);

/**
 * @swagger
 * /knowledge/custom-tables/{id}:
 *   delete:
 *     summary: 删除自定义数据表
 *     tags: [Knowledge]
 *     security:
 *       - bearerAuth: []
 */
router.delete(
  '/custom-tables/:id',
  authMiddleware,
  validate(customTableIdSchema, 'params'),
  knowledgeController.deleteCustomTable,
);

/**
 * @swagger
 * /knowledge/custom-tables/{id}/rows:
 *   get:
 *     summary: 获取自定义数据表行数据
 *     tags: [Knowledge]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/custom-tables/:id/rows',
  authMiddleware,
  validate(customTableIdSchema, 'params'),
  validate(customTableRowQuerySchema, 'query'),
  knowledgeController.getCustomTableRows,
);

/**
 * @swagger
 * /knowledge/custom-tables/{id}/rows:
 *   post:
 *     summary: 添加自定义数据行
 *     tags: [Knowledge]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/custom-tables/:id/rows',
  authMiddleware,
  validate(customTableIdSchema, 'params'),
  validate(createCustomTableRowSchema),
  knowledgeController.createCustomTableRow,
);

/**
 * @swagger
 * /knowledge/custom-tables/{id}/rows/{rowId}:
 *   put:
 *     summary: 更新自定义数据行
 *     tags: [Knowledge]
 *     security:
 *       - bearerAuth: []
 */
router.put(
  '/custom-tables/:id/rows/:rowId',
  authMiddleware,
  validate(customTableRowIdSchema, 'params'),
  validate(updateCustomTableRowSchema),
  knowledgeController.updateCustomTableRow,
);

/**
 * @swagger
 * /knowledge/custom-tables/{id}/rows/{rowId}:
 *   delete:
 *     summary: 删除自定义数据行
 *     tags: [Knowledge]
 *     security:
 *       - bearerAuth: []
 */
router.delete(
  '/custom-tables/:id/rows/:rowId',
  authMiddleware,
  validate(customTableRowIdSchema, 'params'),
  knowledgeController.deleteCustomTableRow,
);

// ==================== 知识库搜索路由 ====================

/**
 * @swagger
 * /knowledge/search:
 *   get:
 *     summary: 知识库搜索
 *     tags: [Knowledge]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/search',
  authMiddleware,
  validate(knowledgeSearchSchema, 'query'),
  knowledgeController.searchKnowledge,
);

export default router;
