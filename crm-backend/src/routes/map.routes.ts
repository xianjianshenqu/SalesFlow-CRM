import { Router } from 'express';
import mapController from '../controllers/map.controller';
import { authMiddleware } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
  customerDistributionQuerySchema,
  routeQuerySchema,
  createRouteSchema,
  updateRouteSchema,
  optimizeRouteSchema,
  routeIdSchema,
} from '../validators/map.validator';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Map
 *   description: 地图与客户分布
 */

/**
 * @swagger
 * /map/customers:
 *   get:
 *     summary: 获取客户分布数据
 *     tags: [Map]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: province
 *         schema:
 *           type: string
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *       - in: query
 *         name: stage
 *         schema:
 *           type: string
 *       - in: query
 *         name: hasLocation
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: 成功获取客户分布数据
 */
router.get(
  '/customers',
  authMiddleware,
  validate(customerDistributionQuerySchema, 'query'),
  mapController.getCustomerDistribution,
);

/**
 * @swagger
 * /map/heatmap:
 *   get:
 *     summary: 获取热力图数据
 *     tags: [Map]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取热力图数据
 */
router.get('/heatmap', authMiddleware, mapController.getHeatmapData);

/**
 * @swagger
 * /map/regions:
 *   get:
 *     summary: 获取区域统计
 *     tags: [Map]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取区域统计
 */
router.get('/regions', authMiddleware, mapController.getRegionStats);

/**
 * @swagger
 * /map/routes:
 *   get:
 *     summary: 获取拜访路线列表
 *     tags: [Map]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: memberId
 *         schema:
 *           type: string
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           pattern: ^\d{4}-\d{2}-\d{2}$
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [planned, in_progress, completed]
 *     responses:
 *       200:
 *         description: 成功获取拜访路线列表
 */
router.get(
  '/routes',
  authMiddleware,
  validate(routeQuerySchema, 'query'),
  mapController.getRoutes,
);

/**
 * @swagger
 * /map/routes:
 *   post:
 *     summary: 创建拜访路线
 *     tags: [Map]
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
 *               - memberId
 *               - date
 *               - customerIds
 *             properties:
 *               name:
 *                 type: string
 *               memberId:
 *                 type: string
 *               date:
 *                 type: string
 *                 pattern: ^\d{4}-\d{2}-\d{2}$
 *               customerIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: 拜访路线创建成功
 */
router.post(
  '/routes',
  authMiddleware,
  validate(createRouteSchema),
  mapController.createRoute,
);

/**
 * @swagger
 * /map/routes/optimize:
 *   post:
 *     summary: 优化拜访路线
 *     tags: [Map]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customerIds
 *             properties:
 *               customerIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 minItems: 2
 *               startLocation:
 *                 type: object
 *                 properties:
 *                   lat:
 *                     type: number
 *                   lng:
 *                     type: number
 *               endLocation:
 *                 type: object
 *                 properties:
 *                   lat:
 *                     type: number
 *                   lng:
 *                     type: number
 *               optimizeFor:
 *                 type: string
 *                 enum: [distance, time]
 *                 default: distance
 *     responses:
 *       200:
 *         description: 路线优化成功
 */
router.post(
  '/routes/optimize',
  authMiddleware,
  validate(optimizeRouteSchema),
  mapController.optimizeRoute,
);

/**
 * @swagger
 * /map/routes/{id}:
 *   put:
 *     summary: 更新拜访路线
 *     tags: [Map]
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
 *               customerIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               status:
 *                 type: string
 *                 enum: [planned, in_progress, completed]
 *     responses:
 *       200:
 *         description: 拜访路线更新成功
 */
router.put(
  '/routes/:id',
  authMiddleware,
  validate(routeIdSchema, 'params'),
  validate(updateRouteSchema),
  mapController.updateRoute,
);

export default router;