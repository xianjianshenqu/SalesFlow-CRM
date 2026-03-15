import { Router } from 'express';
import dashboardController from '../controllers/dashboard.controller';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: 仪表盘与数据统计
 */

/**
 * @swagger
 * /dashboard/overview:
 *   get:
 *     summary: 获取概览统计
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取概览统计
 */
router.get('/overview', authMiddleware, dashboardController.getOverview);

/**
 * @swagger
 * /dashboard/funnel-summary:
 *   get:
 *     summary: 获取漏斗概览
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取漏斗概览
 */
router.get('/funnel-summary', authMiddleware, dashboardController.getFunnelSummary);

/**
 * @swagger
 * /dashboard/ai-suggestions:
 *   get:
 *     summary: 获取AI建议
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取AI建议
 */
router.get('/ai-suggestions', authMiddleware, dashboardController.getAISuggestions);

/**
 * @swagger
 * /dashboard/today-schedule:
 *   get:
 *     summary: 获取今日日程
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取今日日程
 */
router.get('/today-schedule', authMiddleware, dashboardController.getTodaySchedule);

/**
 * @swagger
 * /dashboard/recent-recordings:
 *   get:
 *     summary: 获取最近录音
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *     responses:
 *       200:
 *         description: 成功获取最近录音
 */
router.get('/recent-recordings', authMiddleware, dashboardController.getRecentRecordings);

/**
 * @swagger
 * /dashboard/sales-trend:
 *   get:
 *     summary: 获取销售趋势
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: months
 *         schema:
 *           type: integer
 *           default: 6
 *     responses:
 *       200:
 *         description: 成功获取销售趋势
 */
router.get('/sales-trend', authMiddleware, dashboardController.getSalesTrend);

/**
 * @swagger
 * /dashboard/full:
 *   get:
 *     summary: 获取完整仪表盘数据
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取完整仪表盘数据
 */
router.get('/full', authMiddleware, dashboardController.getFullDashboard);

export default router;