import { Router } from 'express';
import performanceController from '../controllers/performance.controller';
import { authMiddleware } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
  createPerformanceSchema,
  performanceQuerySchema,
  trendsQuerySchema,
  coachingQuerySchema,
  suggestionIdSchema,
  rankingQuerySchema,
} from '../validators/performance.validator';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Performance
 *   description: 销售绩效管理
 */

// ==================== 绩效数据路由 ====================

/**
 * @swagger
 * /performance/records:
 *   get:
 *     summary: 获取绩效记录列表
 *     tags: [Performance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 30
 *     responses:
 *       200:
 *         description: 成功获取绩效记录
 */
router.get(
  '/records',
  authMiddleware,
  validate(performanceQuerySchema, 'query'),
  performanceController.getRecords,
);

/**
 * @swagger
 * /performance/record:
 *   post:
 *     summary: 记录绩效数据
 *     tags: [Performance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - date
 *             properties:
 *               userId:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *               calls:
 *                 type: integer
 *               meetings:
 *                 type: integer
 *               visits:
 *                 type: integer
 *               proposals:
 *                 type: integer
 *               closedDeals:
 *                 type: integer
 *               revenue:
 *                 type: number
 *     responses:
 *       201:
 *         description: 绩效数据记录成功
 */
router.post(
  '/record',
  authMiddleware,
  validate(createPerformanceSchema),
  performanceController.recordPerformance,
);

/**
 * @swagger
 * /performance/record/batch:
 *   post:
 *     summary: 批量记录绩效数据
 *     tags: [Performance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - records
 *             properties:
 *               records:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       201:
 *         description: 批量记录成功
 */
router.post(
  '/record/batch',
  authMiddleware,
  performanceController.batchRecordPerformance,
);

/**
 * @swagger
 * /performance/user/{userId}:
 *   get:
 *     summary: 获取用户绩效详情
 *     tags: [Performance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: 成功获取用户绩效
 */
router.get(
  '/user/:userId',
  authMiddleware,
  performanceController.getUserPerformance,
);

// ==================== 绩效仪表盘路由 ====================

/**
 * @swagger
 * /performance/dashboard:
 *   get:
 *     summary: 获取绩效仪表盘
 *     tags: [Performance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取仪表盘数据
 */
router.get('/dashboard', authMiddleware, performanceController.getDashboard);

/**
 * @swagger
 * /performance/trends:
 *   get:
 *     summary: 获取绩效趋势
 *     tags: [Performance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 30
 *     responses:
 *       200:
 *         description: 成功获取趋势数据
 */
router.get(
  '/trends',
  authMiddleware,
  validate(trendsQuerySchema, 'query'),
  performanceController.getTrends,
);

/**
 * @swagger
 * /performance/analysis:
 *   get:
 *     summary: AI绩效分析
 *     tags: [Performance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [daily, weekly, monthly]
 *           default: weekly
 *     responses:
 *       200:
 *         description: 绩效分析完成
 */
router.get('/analysis', authMiddleware, performanceController.analyzePerformance);

// ==================== 教练建议路由 ====================

/**
 * @swagger
 * /performance/coaching/generate:
 *   post:
 *     summary: 生成AI教练建议
 *     tags: [Performance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: 教练建议生成成功
 */
router.post(
  '/coaching/generate',
  authMiddleware,
  performanceController.generateCoaching,
);

/**
 * @swagger
 * /performance/coaching:
 *   get:
 *     summary: 获取教练建议列表
 *     tags: [Performance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, completed, dismissed]
 *     responses:
 *       200:
 *         description: 成功获取建议列表
 */
router.get(
  '/coaching',
  authMiddleware,
  validate(coachingQuerySchema, 'query'),
  performanceController.getCoachingSuggestions,
);

/**
 * @swagger
 * /performance/coaching/{id}/complete:
 *   post:
 *     summary: 完成教练建议
 *     tags: [Performance]
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
 *         description: 建议已标记完成
 */
router.post(
  '/coaching/:id/complete',
  authMiddleware,
  validate(suggestionIdSchema, 'params'),
  performanceController.completeCoachingSuggestion,
);

/**
 * @swagger
 * /performance/coaching/{id}/dismiss:
 *   post:
 *     summary: 忽略教练建议
 *     tags: [Performance]
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
 *         description: 建议已忽略
 */
router.post(
  '/coaching/:id/dismiss',
  authMiddleware,
  validate(suggestionIdSchema, 'params'),
  performanceController.dismissCoachingSuggestion,
);

// ==================== 团队排名与统计路由 ====================

/**
 * @swagger
 * /performance/ranking:
 *   get:
 *     summary: 获取团队排名
 *     tags: [Performance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: 成功获取团队排名
 */
router.get(
  '/ranking',
  authMiddleware,
  validate(rankingQuerySchema, 'query'),
  performanceController.getTeamRanking,
);

/**
 * @swagger
 * /performance/stats:
 *   get:
 *     summary: 获取绩效统计概览
 *     tags: [Performance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 成功获取统计
 */
router.get('/stats', authMiddleware, performanceController.getStats);

export default router;