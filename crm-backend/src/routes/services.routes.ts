import { Router } from 'express';
import serviceController from '../controllers/service.controller';
import { authMiddleware } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
  createServiceSchema,
  updateServiceSchema,
  updateProgressSchema,
  createMilestoneSchema,
  updateMilestoneSchema,
  serviceQuerySchema,
  serviceIdSchema,
  milestoneIdSchema,
} from '../validators/service.validator';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Services
 *   description: 售后服务管理
 */

/**
 * @swagger
 * /services:
 *   get:
 *     summary: 获取服务项目列表
 *     tags: [Services]
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
 *           enum: [pending, in_progress, completed, on_hold, cancelled]
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 成功获取服务项目列表
 */
router.get(
  '/',
  authMiddleware,
  validate(serviceQuerySchema, 'query'),
  serviceController.getAll,
);

/**
 * @swagger
 * /services/stats:
 *   get:
 *     summary: 获取服务统计
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: customerId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 成功获取服务统计
 */
router.get('/stats', authMiddleware, serviceController.getStats);

/**
 * @swagger
 * /services:
 *   post:
 *     summary: 创建服务项目
 *     tags: [Services]
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
 *               - name
 *               - startDate
 *             properties:
 *               customerId:
 *                 type: string
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               type:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               budget:
 *                 type: number
 *               milestones:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *     responses:
 *       201:
 *         description: 服务项目创建成功
 */
router.post(
  '/',
  authMiddleware,
  validate(createServiceSchema),
  serviceController.create,
);

/**
 * @swagger
 * /services/{id}:
 *   get:
 *     summary: 获取服务项目详情
 *     tags: [Services]
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
 *         description: 成功获取服务项目详情
 */
router.get(
  '/:id',
  authMiddleware,
  validate(serviceIdSchema, 'params'),
  serviceController.getById,
);

/**
 * @swagger
 * /services/{id}:
 *   put:
 *     summary: 更新服务项目
 *     tags: [Services]
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
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [pending, in_progress, completed, on_hold, cancelled]
 *               budget:
 *                 type: number
 *     responses:
 *       200:
 *         description: 服务项目更新成功
 */
router.put(
  '/:id',
  authMiddleware,
  validate(serviceIdSchema, 'params'),
  validate(updateServiceSchema),
  serviceController.update,
);

/**
 * @swagger
 * /services/{id}/progress:
 *   patch:
 *     summary: 更新项目进度
 *     tags: [Services]
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
 *               - progress
 *             properties:
 *               progress:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: 进度更新成功
 */
router.patch(
  '/:id/progress',
  authMiddleware,
  validate(serviceIdSchema, 'params'),
  validate(updateProgressSchema),
  serviceController.updateProgress,
);

/**
 * @swagger
 * /services/{id}/milestones:
 *   post:
 *     summary: 添加里程碑
 *     tags: [Services]
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
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: 里程碑添加成功
 */
router.post(
  '/:id/milestones',
  authMiddleware,
  validate(serviceIdSchema, 'params'),
  validate(createMilestoneSchema),
  serviceController.addMilestone,
);

/**
 * @swagger
 * /services/{id}/milestones/{milestoneId}:
 *   patch:
 *     summary: 更新里程碑状态
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: milestoneId
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
 *                 enum: [pending, in_progress, completed]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: 里程碑更新成功
 */
router.patch(
  '/:id/milestones/:milestoneId',
  authMiddleware,
  validate(milestoneIdSchema, 'params'),
  validate(updateMilestoneSchema),
  serviceController.updateMilestone,
);

/**
 * @swagger
 * /services/{id}:
 *   delete:
 *     summary: 删除服务项目
 *     tags: [Services]
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
 *         description: 服务项目删除成功
 */
router.delete(
  '/:id',
  authMiddleware,
  validate(serviceIdSchema, 'params'),
  serviceController.delete,
);

export default router;