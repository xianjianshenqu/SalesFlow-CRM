import { Router } from 'express';
import proposalController from '../controllers/proposal.controller';
import { authMiddleware } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
  createProposalSchema,
  updateProposalSchema,
  updateProposalStatusSchema,
  proposalQuerySchema,
  proposalIdSchema,
  createTemplateSchema,
  templateQuerySchema,
  createRequirementAnalysisSchema,
  updateRequirementAnalysisSchema,
  aiAnalyzeRequestSchema,
  designProposalSchema,
  matchTemplateSchema,
  createReviewSchema,
  addReviewCommentSchema,
  reviewResultSchema,
  createCustomerProposalSchema,
  updateCustomerProposalEmailSchema,
  addDiscussionSchema,
  updateTermsSchema,
} from '../validators/proposal.validator';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Proposals
 *   description: 商务方案管理
 */

/**
 * @swagger
 * /proposals:
 *   get:
 *     summary: 获取方案列表
 *     tags: [Proposals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: customerId
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, sent, accepted, rejected, expired]
 *       - in: query
 *         name: minAmount
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxAmount
 *         schema:
 *           type: number
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 成功获取方案列表
 */
router.get(
  '/',
  authMiddleware,
  validate(proposalQuerySchema, 'query'),
  proposalController.getAll,
);

/**
 * @swagger
 * /proposals/stats:
 *   get:
 *     summary: 获取方案统计
 *     tags: [Proposals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: customerId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 成功获取方案统计
 */
router.get('/stats', authMiddleware, proposalController.getStats);

/**
 * @swagger
 * /proposals:
 *   post:
 *     summary: 创建商务方案
 *     tags: [Proposals]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customerId
 *               - title
 *               - value
 *             properties:
 *               customerId:
 *                 type: string
 *               title:
 *                 type: string
 *               value:
 *                 type: number
 *               description:
 *                 type: string
 *               products:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *                     unitPrice:
 *                       type: number
 *                     totalPrice:
 *                       type: number
 *               terms:
 *                 type: string
 *               validUntil:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: 方案创建成功
 */
router.post(
  '/',
  authMiddleware,
  validate(createProposalSchema),
  proposalController.create,
);

/**
 * @swagger
 * /proposals/{id}:
 *   get:
 *     summary: 获取方案详情
 *     tags: [Proposals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 成功获取方案详情
 */
router.get(
  '/:id',
  authMiddleware,
  validate(proposalIdSchema, 'params'),
  proposalController.getById,
);

/**
 * @swagger
 * /proposals/{id}:
 *   put:
 *     summary: 更新方案
 *     tags: [Proposals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               value:
 *                 type: number
 *               description:
 *                 type: string
 *               products:
 *                 type: array
 *                 items:
 *                   type: object
 *               terms:
 *                 type: string
 *     responses:
 *       200:
 *         description: 方案更新成功
 */
router.put(
  '/:id',
  authMiddleware,
  validate(proposalIdSchema, 'params'),
  validate(updateProposalSchema),
  proposalController.update,
);

/**
 * @swagger
 * /proposals/{id}/status:
 *   patch:
 *     summary: 更新方案状态
 *     tags: [Proposals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [draft, sent, accepted, rejected, expired]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: 状态更新成功
 */
router.patch(
  '/:id/status',
  authMiddleware,
  validate(proposalIdSchema, 'params'),
  validate(updateProposalStatusSchema),
  proposalController.updateStatus,
);

/**
 * @swagger
 * /proposals/{id}/generate:
 *   post:
 *     summary: AI生成方案内容
 *     tags: [Proposals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: AI生成成功
 */
router.post(
  '/:id/generate',
  authMiddleware,
  validate(proposalIdSchema, 'params'),
  proposalController.generateWithAI,
);

/**
 * @swagger
 * /proposals/{id}/send:
 *   post:
 *     summary: 发送方案给客户
 *     tags: [Proposals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 方案发送成功
 */
router.post(
  '/:id/send',
  authMiddleware,
  validate(proposalIdSchema, 'params'),
  proposalController.send,
);

/**
 * @swagger
 * /proposals/{id}/smart-generate:
 *   post:
 *     summary: AI智能生成完整方案
 *     tags: [Proposals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: AI智能方案生成成功
 */
router.post(
  '/:id/smart-generate',
  authMiddleware,
  validate(proposalIdSchema, 'params'),
  proposalController.generateSmartProposal,
);

/**
 * @swagger
 * /proposals/{id}/pricing-strategy:
 *   get:
 *     summary: 获取智能定价策略
 *     tags: [Proposals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 获取定价策略成功
 */
router.get(
  '/:id/pricing-strategy',
  authMiddleware,
  validate(proposalIdSchema, 'params'),
  proposalController.getPricingStrategy,
);

/**
 * @swagger
 * /proposals/{id}/recommend-products:
 *   get:
 *     summary: 获取推荐产品组合
 *     tags: [Proposals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 获取产品推荐成功
 */
router.get(
  '/:id/recommend-products',
  authMiddleware,
  validate(proposalIdSchema, 'params'),
  proposalController.getRecommendedProducts,
);

/**
 * @swagger
 * /proposals/{id}:
 *   delete:
 *     summary: 删除方案
 *     tags: [Proposals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 方案删除成功
 */
router.delete(
  '/:id',
  authMiddleware,
  validate(proposalIdSchema, 'params'),
  proposalController.delete,
);

// ==================== 模板管理路由 ====================

router.get(
  '/templates',
  authMiddleware,
  validate(templateQuerySchema, 'query'),
  proposalController.getTemplates,
);

router.post(
  '/templates',
  authMiddleware,
  validate(createTemplateSchema),
  proposalController.createTemplate,
);

router.post(
  '/templates/:id/clone',
  authMiddleware,
  proposalController.cloneTemplate,
);

// ==================== 需求分析阶段路由 ====================

router.post(
  '/:id/requirement-analysis',
  authMiddleware,
  validate(proposalIdSchema, 'params'),
  validate(createRequirementAnalysisSchema),
  proposalController.createRequirementAnalysis,
);

router.get(
  '/:id/requirement-analysis',
  authMiddleware,
  validate(proposalIdSchema, 'params'),
  proposalController.getRequirementAnalysis,
);

router.post(
  '/:id/requirement-analysis/ai-analyze',
  authMiddleware,
  validate(proposalIdSchema, 'params'),
  validate(aiAnalyzeRequestSchema),
  proposalController.aiAnalyzeRequirement,
);

router.post(
  '/:id/requirement-analysis/ai-enhance',
  authMiddleware,
  validate(proposalIdSchema, 'params'),
  proposalController.aiEnhanceRequirement,
);

router.put(
  '/:id/requirement-analysis',
  authMiddleware,
  validate(proposalIdSchema, 'params'),
  validate(updateRequirementAnalysisSchema),
  proposalController.updateRequirementAnalysis,
);

router.post(
  '/:id/requirement-analysis/confirm',
  authMiddleware,
  validate(proposalIdSchema, 'params'),
  proposalController.confirmRequirementAnalysis,
);

// ==================== 方案设计阶段路由 ====================

router.post(
  '/:id/design',
  authMiddleware,
  validate(proposalIdSchema, 'params'),
  proposalController.startDesign,
);

router.post(
  '/:id/design/match-template',
  authMiddleware,
  validate(proposalIdSchema, 'params'),
  validate(matchTemplateSchema),
  proposalController.matchTemplate,
);

router.post(
  '/:id/design/apply-template',
  authMiddleware,
  validate(proposalIdSchema, 'params'),
  proposalController.applyTemplate,
);

router.put(
  '/:id/design',
  authMiddleware,
  validate(proposalIdSchema, 'params'),
  validate(designProposalSchema),
  proposalController.updateDesign,
);

router.post(
  '/:id/design/confirm',
  authMiddleware,
  validate(proposalIdSchema, 'params'),
  proposalController.confirmDesign,
);

// ==================== 内部评审阶段路由 ====================

router.post(
  '/:id/review',
  authMiddleware,
  validate(proposalIdSchema, 'params'),
  validate(createReviewSchema),
  proposalController.createReview,
);

router.get(
  '/:id/review',
  authMiddleware,
  validate(proposalIdSchema, 'params'),
  proposalController.getReview,
);

router.post(
  '/:id/review/comment',
  authMiddleware,
  validate(proposalIdSchema, 'params'),
  validate(addReviewCommentSchema),
  proposalController.addReviewComment,
);

router.post(
  '/:id/review/approve',
  authMiddleware,
  validate(proposalIdSchema, 'params'),
  validate(reviewResultSchema),
  proposalController.approveReview,
);

router.post(
  '/:id/review/reject',
  authMiddleware,
  validate(proposalIdSchema, 'params'),
  validate(reviewResultSchema),
  proposalController.rejectReview,
);

// ==================== 客户提案阶段路由 ====================

router.post(
  '/:id/customer-proposal',
  authMiddleware,
  validate(proposalIdSchema, 'params'),
  validate(createCustomerProposalSchema),
  proposalController.createCustomerProposalRecord,
);

router.get(
  '/:id/customer-proposal',
  authMiddleware,
  validate(proposalIdSchema, 'params'),
  proposalController.getCustomerProposalRecord,
);

router.post(
  '/:id/customer-proposal/generate-email',
  authMiddleware,
  validate(proposalIdSchema, 'params'),
  proposalController.generateEmailTemplate,
);

router.put(
  '/:id/customer-proposal/email',
  authMiddleware,
  validate(proposalIdSchema, 'params'),
  validate(updateCustomerProposalEmailSchema),
  proposalController.updateCustomerProposalEmail,
);

router.post(
  '/:id/customer-proposal/send',
  authMiddleware,
  validate(proposalIdSchema, 'params'),
  proposalController.sendCustomerProposal,
);

router.get(
  '/track/:token',
  proposalController.trackEmailOpen,
);

// ==================== 商务谈判阶段路由 ====================

router.post(
  '/:id/negotiation',
  authMiddleware,
  validate(proposalIdSchema, 'params'),
  proposalController.createNegotiation,
);

router.get(
  '/:id/negotiation',
  authMiddleware,
  validate(proposalIdSchema, 'params'),
  proposalController.getNegotiation,
);

router.post(
  '/:id/negotiation/discussion',
  authMiddleware,
  validate(proposalIdSchema, 'params'),
  validate(addDiscussionSchema),
  proposalController.addDiscussion,
);

router.put(
  '/:id/negotiation/terms',
  authMiddleware,
  validate(proposalIdSchema, 'params'),
  validate(updateTermsSchema),
  proposalController.updateNegotiationTerms,
);

router.post(
  '/:id/negotiation/complete',
  authMiddleware,
  validate(proposalIdSchema, 'params'),
  proposalController.completeNegotiation,
);

export default router;