import { Router } from 'express';
import scheduleController from '../controllers/schedule.controller';
import { authMiddleware } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
  createScheduleSchema,
  updateScheduleSchema,
  updateStatusSchema,
  scheduleQuerySchema,
  scheduleIdSchema,
} from '../validators/schedule.validator';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Schedules
 *   description: 日程任务管理
 */

/**
 * @swagger
 * /schedules:
 *   get:
 *     summary: 获取日程列表
 *     tags: [Schedules]
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
 *         name: type
 *         schema:
 *           type: string
 *           enum: [call, meeting, email, visit, follow_up, other]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, in_progress, completed, cancelled]
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [high, medium, low]
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
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 成功获取日程列表
 */
router.get(
  '/',
  authMiddleware,
  validate(scheduleQuerySchema, 'query'),
  scheduleController.getAll,
);

/**
 * @swagger
 * /schedules/stats:
 *   get:
 *     summary: 获取日程统计
 *     tags: [Schedules]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取日程统计
 */
router.get('/stats', authMiddleware, scheduleController.getStats);

/**
 * @swagger
 * /schedules/today:
 *   get:
 *     summary: 获取今日日程
 *     tags: [Schedules]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取今日日程
 */
router.get('/today', authMiddleware, scheduleController.getToday);

/**
 * @swagger
 * /schedules/ai-suggestions:
 *   get:
 *     summary: 获取AI智能建议
 *     tags: [Schedules]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取AI建议
 */
router.get('/ai-suggestions', authMiddleware, scheduleController.getAISuggestions);

/**
 * @swagger
 * /schedules:
 *   post:
 *     summary: 创建日程任务
 *     tags: [Schedules]
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
 *               - type
 *               - dueDate
 *             properties:
 *               customerId:
 *                 type: string
 *               title:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [call, meeting, email, visit, follow_up, other]
 *               priority:
 *                 type: string
 *                 enum: [high, medium, low]
 *               description:
 *                 type: string
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *               reminder:
 *                 type: boolean
 *               location:
 *                 type: string
 *     responses:
 *       201:
 *         description: 日程创建成功
 */
router.post(
  '/',
  authMiddleware,
  validate(createScheduleSchema),
  scheduleController.create,
);

/**
 * @swagger
 * /schedules/{id}:
 *   get:
 *     summary: 获取日程详情
 *     tags: [Schedules]
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
 *         description: 成功获取日程详情
 */
router.get(
  '/:id',
  authMiddleware,
  validate(scheduleIdSchema, 'params'),
  scheduleController.getById,
);

/**
 * @swagger
 * /schedules/{id}:
 *   put:
 *     summary: 更新日程
 *     tags: [Schedules]
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
 *               type:
 *                 type: string
 *                 enum: [call, meeting, email, visit, follow_up, other]
 *               priority:
 *                 type: string
 *                 enum: [high, medium, low]
 *               status:
 *                 type: string
 *                 enum: [pending, in_progress, completed, cancelled]
 *               description:
 *                 type: string
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: 日程更新成功
 */
router.put(
  '/:id',
  authMiddleware,
  validate(scheduleIdSchema, 'params'),
  validate(updateScheduleSchema),
  scheduleController.update,
);

/**
 * @swagger
 * /schedules/{id}/status:
 *   patch:
 *     summary: 更新任务状态
 *     tags: [Schedules]
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
 *                 enum: [pending, in_progress, completed, cancelled]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: 状态更新成功
 */
router.patch(
  '/:id/status',
  authMiddleware,
  validate(scheduleIdSchema, 'params'),
  validate(updateStatusSchema),
  scheduleController.updateStatus,
);

/**
 * @swagger
 * /schedules/{id}:
 *   delete:
 *     summary: 删除日程
 *     tags: [Schedules]
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
 *         description: 日程删除成功
 */
router.delete(
  '/:id',
  authMiddleware,
  validate(scheduleIdSchema, 'params'),
  scheduleController.delete,
);

export default router;