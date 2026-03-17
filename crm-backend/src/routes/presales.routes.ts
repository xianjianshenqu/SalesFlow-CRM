import { Router } from 'express';
import presalesController from '../controllers/presales.controller';
import { authMiddleware } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
  createResourceSchema,
  updateResourceSchema,
  resourceQuerySchema,
  resourceIdSchema,
  createRequestSchema,
  updateRequestSchema,
  updateRequestStatusSchema,
  requestQuerySchema,
  requestIdSchema,
} from '../validators/presales.validator';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Presales
 *   description: 售前中心管理
 */

// ==================== 资源管理路由 ====================

/**
 * @swagger
 * /presales/resources:
 *   get:
 *     summary: 获取售前资源列表
 *     tags: [Presales]
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [available, busy, offline]
 *       - in: query
 *         name: skill
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 成功获取售前资源列表
 */
router.get(
  '/resources',
  authMiddleware,
  validate(resourceQuerySchema, 'query'),
  presalesController.getResources,
);

/**
 * @swagger
 * /presales/resources:
 *   post:
 *     summary: 创建售前资源
 *     tags: [Presales]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *               experience:
 *                 type: integer
 *     responses:
 *       201:
 *         description: 售前资源创建成功
 */
router.post(
  '/resources',
  authMiddleware,
  validate(createResourceSchema),
  presalesController.createResource,
);

/**
 * @swagger
 * /presales/resources/{id}:
 *   get:
 *     summary: 获取售前资源详情
 *     tags: [Presales]
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
 *         description: 成功获取售前资源详情
 */
router.get(
  '/resources/:id',
  authMiddleware,
  validate(resourceIdSchema, 'params'),
  presalesController.getResourceById,
);

/**
 * @swagger
 * /presales/resources/{id}:
 *   put:
 *     summary: 更新售前资源
 *     tags: [Presales]
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
 *               phone:
 *                 type: string
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *               status:
 *                 type: string
 *                 enum: [available, busy, offline]
 *     responses:
 *       200:
 *         description: 售前资源更新成功
 */
router.put(
  '/resources/:id',
  authMiddleware,
  validate(resourceIdSchema, 'params'),
  validate(updateResourceSchema),
  presalesController.updateResource,
);

/**
 * @swagger
 * /presales/resources/{id}:
 *   delete:
 *     summary: 删除售前资源
 *     tags: [Presales]
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
 *         description: 售前资源删除成功
 */
router.delete(
  '/resources/:id',
  authMiddleware,
  validate(resourceIdSchema, 'params'),
  presalesController.deleteResource,
);

// ==================== 请求管理路由 ====================

/**
 * @swagger
 * /presales/stats:
 *   get:
 *     summary: 获取售前统计
 *     tags: [Presales]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取售前统计
 */
router.get(
  '/stats',
  authMiddleware,
  presalesController.getStats,
);

/**
 * @swagger
 * /presales/resources/workload:
 *   get:
 *     summary: 获取资源负载概览
 *     tags: [Presales]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取资源负载概览
 */
router.get(
  '/resources/workload',
  authMiddleware,
  presalesController.getResourcesWorkloadOverview,
);

/**
 * @swagger
 * /presales/requests:
 *   get:
 *     summary: 获取售前请求列表
 *     tags: [Presales]
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
 *           enum: [pending, assigned, in_progress, completed, cancelled]
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [high, medium, low]
 *     responses:
 *       200:
 *         description: 成功获取售前请求列表
 */
router.get(
  '/requests',
  authMiddleware,
  validate(requestQuerySchema, 'query'),
  presalesController.getRequests,
);

/**
 * @swagger
 * /presales/requests:
 *   post:
 *     summary: 创建售前请求
 *     tags: [Presales]
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
 *               - type
 *               - title
 *             properties:
 *               customerId:
 *                 type: string
 *               type:
 *                 type: string
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               priority:
 *                 type: string
 *                 enum: [high, medium, low]
 *               requiredSkills:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: 售前请求创建成功
 */
router.post(
  '/requests',
  authMiddleware,
  validate(createRequestSchema),
  presalesController.createRequest,
);

/**
 * @swagger
 * /presales/requests/{id}:
 *   get:
 *     summary: 获取售前请求详情
 *     tags: [Presales]
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
 *         description: 成功获取售前请求详情
 */
router.get(
  '/requests/:id',
  authMiddleware,
  validate(requestIdSchema, 'params'),
  presalesController.getRequestById,
);

/**
 * @swagger
 * /presales/requests/{id}:
 *   put:
 *     summary: 更新售前请求
 *     tags: [Presales]
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
 *               description:
 *                 type: string
 *               priority:
 *                 type: string
 *                 enum: [high, medium, low]
 *     responses:
 *       200:
 *         description: 售前请求更新成功
 */
router.put(
  '/requests/:id',
  authMiddleware,
  validate(requestIdSchema, 'params'),
  validate(updateRequestSchema),
  presalesController.updateRequest,
);

/**
 * @swagger
 * /presales/requests/{id}/status:
 *   patch:
 *     summary: 更新请求状态
 *     tags: [Presales]
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
 *                 enum: [pending, assigned, in_progress, completed, cancelled]
 *               assignedResourceId:
 *                 type: string
 *     responses:
 *       200:
 *         description: 请求状态更新成功
 */
router.patch(
  '/requests/:id/status',
  authMiddleware,
  validate(requestIdSchema, 'params'),
  validate(updateRequestStatusSchema),
  presalesController.updateRequestStatus,
);

/**
 * @swagger
 * /presales/requests/{id}/match:
 *   get:
 *     summary: 智能匹配资源
 *     tags: [Presales]
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
 *         description: 资源匹配成功
 */
router.get(
  '/requests/:id/match',
  authMiddleware,
  validate(requestIdSchema, 'params'),
  presalesController.matchResources,
);

/**
 * @swagger
 * /presales/requests/{id}/smart-match:
 *   get:
 *     summary: AI智能匹配资源
 *     tags: [Presales]
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
 *         description: AI资源匹配成功
 */
router.get(
  '/requests/:id/smart-match',
  authMiddleware,
  validate(requestIdSchema, 'params'),
  presalesController.smartMatchResources,
);

/**
 * @swagger
 * /presales/requests/{id}/auto-assign:
 *   post:
 *     summary: 自动分配资源
 *     tags: [Presales]
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
 *         description: 自动分配成功
 */
router.post(
  '/requests/:id/auto-assign',
  authMiddleware,
  validate(requestIdSchema, 'params'),
  presalesController.autoAssignResource,
);

/**
 * @swagger
 * /presales/requests/{id}:
 *   delete:
 *     summary: 删除售前请求
 *     tags: [Presales]
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
 *         description: 售前请求删除成功
 */
router.delete(
  '/requests/:id',
  authMiddleware,
  validate(requestIdSchema, 'params'),
  presalesController.deleteRequest,
);

export default router;