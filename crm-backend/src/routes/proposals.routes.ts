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

export default router;