import { Router } from 'express';
import recordingController, { uploadMiddleware } from '../controllers/recording.controller';
import { authMiddleware } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
  createRecordingSchema,
  updateRecordingSchema,
  recordingQuerySchema,
  recordingIdSchema,
} from '../validators/recording.validator';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Recordings
 *   description: AI录音分析管理
 */

/**
 * @swagger
 * /recordings:
 *   get:
 *     summary: 获取录音列表
 *     tags: [Recordings]
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
 *         name: sentiment
 *         schema:
 *           type: string
 *           enum: [positive, neutral, negative]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 成功获取录音列表
 */
router.get(
  '/',
  authMiddleware,
  validate(recordingQuerySchema, 'query'),
  recordingController.getAll,
);

/**
 * @swagger
 * /recordings/stats:
 *   get:
 *     summary: 获取录音统计
 *     tags: [Recordings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: customerId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 成功获取录音统计
 */
router.get('/stats', authMiddleware, recordingController.getStats);

/**
 * @swagger
 * /recordings/overview:
 *   get:
 *     summary: 获取录音统计概览
 *     tags: [Recordings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取统计概览
 */
router.get('/overview', authMiddleware, recordingController.getStats);

/**
 * @swagger
 * /recordings/upload:
 *   post:
 *     summary: 上传录音文件
 *     tags: [Recordings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *               - customerId
 *               - title
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               customerId:
 *                 type: string
 *               title:
 *                 type: string
 *               contactPerson:
 *                 type: string
 *               duration:
 *                 type: integer
 *     responses:
 *       201:
 *         description: 录音上传成功
 */
router.post(
  '/upload',
  authMiddleware,
  uploadMiddleware,
  recordingController.upload,
);

/**
 * @swagger
 * /recordings/sync:
 *   post:
 *     summary: 从钉钉同步录音（模拟）
 *     tags: [Recordings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 同步成功
 */
router.post('/sync', authMiddleware, recordingController.syncFromDingTalk);

/**
 * @swagger
 * /recordings:
 *   post:
 *     summary: 创建录音
 *     tags: [Recordings]
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
 *               - duration
 *               - fileUrl
 *             properties:
 *               customerId:
 *                 type: string
 *               title:
 *                 type: string
 *               duration:
 *                 type: integer
 *               fileUrl:
 *                 type: string
 *               transcript:
 *                 type: string
 *               summary:
 *                 type: string
 *               sentiment:
 *                 type: string
 *                 enum: [positive, neutral, negative]
 *               keywords:
 *                 type: array
 *                 items:
 *                   type: string
 *               actionItems:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: 录音创建成功
 */
router.post(
  '/',
  authMiddleware,
  validate(createRecordingSchema),
  recordingController.create,
);

/**
 * @swagger
 * /recordings/{id}:
 *   get:
 *     summary: 获取录音详情
 *     tags: [Recordings]
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
 *         description: 成功获取录音详情
 */
router.get(
  '/:id',
  authMiddleware,
  validate(recordingIdSchema, 'params'),
  recordingController.getById,
);

/**
 * @swagger
 * /recordings/{id}/detail:
 *   get:
 *     summary: 获取录音详情（包含AI分析结果）
 *     tags: [Recordings]
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
 *         description: 成功获取录音详情
 */
router.get(
  '/:id/detail',
  authMiddleware,
  validate(recordingIdSchema, 'params'),
  recordingController.getDetail,
);

/**
 * @swagger
 * /recordings/{id}:
 *   put:
 *     summary: 更新录音
 *     tags: [Recordings]
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
 *               transcript:
 *                 type: string
 *               summary:
 *                 type: string
 *               sentiment:
 *                 type: string
 *                 enum: [positive, neutral, negative]
 *               keywords:
 *                 type: array
 *                 items:
 *                   type: string
 *               actionItems:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: 录音更新成功
 */
router.put(
  '/:id',
  authMiddleware,
  validate(recordingIdSchema, 'params'),
  validate(updateRecordingSchema),
  recordingController.update,
);

/**
 * @swagger
 * /recordings/{id}:
 *   delete:
 *     summary: 删除录音
 *     tags: [Recordings]
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
 *         description: 录音删除成功
 */
router.delete(
  '/:id',
  authMiddleware,
  validate(recordingIdSchema, 'params'),
  recordingController.delete,
);

/**
 * @swagger
 * /recordings/{id}/analyze:
 *   post:
 *     summary: 触发AI分析
 *     tags: [Recordings]
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
 *         description: AI分析完成
 */
router.post(
  '/:id/analyze',
  authMiddleware,
  validate(recordingIdSchema, 'params'),
  recordingController.analyze,
);

export default router;