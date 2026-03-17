import { Router } from 'express';
import presalesActivityController from '../controllers/presalesActivity.controller';
import { authMiddleware } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
  createActivitySchema,
  updateActivitySchema,
  activityQuerySchema,
  activityIdSchema,
  approvalActionSchema,
  createQrCodeSchema,
  qrCodeIdSchema,
  signInSchema,
  signInQuerySchema,
  signInIdSchema,
  createQuestionSchema,
  updateQuestionSchema,
  answerQuestionSchema,
  questionQuerySchema,
  questionIdSchema,
} from '../validators/presalesActivity.validator';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: PresalesActivity
 *   description: 售前活动管理
 */

// ==================== 活动管理路由 ====================

/**
 * @swagger
 * /presales/activities:
 *   get:
 *     summary: 获取活动列表
 *     tags: [PresalesActivity]
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
 *         name: type
 *         schema:
 *           type: string
 *           enum: [demo, poc, training, seminar, other]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, pending_approval, approved, ongoing, completed, cancelled]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 成功获取活动列表
 */
router.get(
  '/activities',
  authMiddleware,
  validate(activityQuerySchema, 'query'),
  presalesActivityController.getActivities,
);

/**
 * @swagger
 * /presales/activities:
 *   post:
 *     summary: 创建活动
 *     tags: [PresalesActivity]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - type
 *               - startTime
 *               - endTime
 *             properties:
 *               title:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [demo, poc, training, seminar, other]
 *               description:
 *                 type: string
 *               customerId:
 *                 type: string
 *               location:
 *                 type: string
 *               startTime:
 *                 type: string
 *                 format: date-time
 *               endTime:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: 活动创建成功
 */
router.post(
  '/activities',
  authMiddleware,
  validate(createActivitySchema),
  presalesActivityController.createActivity,
);

/**
 * @swagger
 * /presales/activities/{id}:
 *   get:
 *     summary: 获取活动详情
 *     tags: [PresalesActivity]
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
 *         description: 成功获取活动详情
 */
router.get(
  '/activities/:id',
  authMiddleware,
  validate(activityIdSchema, 'params'),
  presalesActivityController.getActivityById,
);

/**
 * @swagger
 * /presales/activities/{id}:
 *   put:
 *     summary: 更新活动
 *     tags: [PresalesActivity]
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
 *               location:
 *                 type: string
 *               startTime:
 *                 type: string
 *                 format: date-time
 *               endTime:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: 活动更新成功
 */
router.put(
  '/activities/:id',
  authMiddleware,
  validate(activityIdSchema, 'params'),
  validate(updateActivitySchema),
  presalesActivityController.updateActivity,
);

/**
 * @swagger
 * /presales/activities/{id}:
 *   delete:
 *     summary: 删除活动
 *     tags: [PresalesActivity]
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
 *         description: 活动删除成功
 */
router.delete(
  '/activities/:id',
  authMiddleware,
  validate(activityIdSchema, 'params'),
  presalesActivityController.deleteActivity,
);

// ==================== 审批流程路由 ====================

/**
 * @swagger
 * /presales/activities/{id}/submit-approval:
 *   post:
 *     summary: 提交审批
 *     tags: [PresalesActivity]
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
 *         description: 活动已提交审批
 */
router.post(
  '/activities/:id/submit-approval',
  authMiddleware,
  validate(activityIdSchema, 'params'),
  presalesActivityController.submitForApproval,
);

/**
 * @swagger
 * /presales/activities/{id}/approve:
 *   post:
 *     summary: 审批通过
 *     tags: [PresalesActivity]
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
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: 活动审批通过
 */
router.post(
  '/activities/:id/approve',
  authMiddleware,
  validate(activityIdSchema, 'params'),
  validate(approvalActionSchema),
  presalesActivityController.approveActivity,
);

/**
 * @swagger
 * /presales/activities/{id}/reject:
 *   post:
 *     summary: 审批拒绝
 *     tags: [PresalesActivity]
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
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: 活动已拒绝
 */
router.post(
  '/activities/:id/reject',
  authMiddleware,
  validate(activityIdSchema, 'params'),
  validate(approvalActionSchema),
  presalesActivityController.rejectActivity,
);

// ==================== 二维码管理路由 ====================

/**
 * @swagger
 * /presales/activities/{id}/qrcodes:
 *   post:
 *     summary: 生成二维码
 *     tags: [PresalesActivity]
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
 *               - codeType
 *             properties:
 *               codeType:
 *                 type: string
 *                 enum: [exclusive, generic]
 *               validFrom:
 *                 type: string
 *                 format: date-time
 *               validUntil:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: 二维码生成成功
 */
router.post(
  '/activities/:id/qrcodes',
  authMiddleware,
  validate(activityIdSchema, 'params'),
  validate(createQrCodeSchema),
  presalesActivityController.createQrCode,
);

/**
 * @swagger
 * /presales/activities/{id}/qrcodes:
 *   get:
 *     summary: 获取活动二维码列表
 *     tags: [PresalesActivity]
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
 *         description: 成功获取二维码列表
 */
router.get(
  '/activities/:id/qrcodes',
  authMiddleware,
  validate(activityIdSchema, 'params'),
  presalesActivityController.getQrCodes,
);

/**
 * @swagger
 * /presales/qrcodes/{qrCodeId}:
 *   get:
 *     summary: 获取二维码详情
 *     tags: [PresalesActivity]
 *     parameters:
 *       - in: path
 *         name: qrCodeId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 成功获取二维码详情
 */
router.get(
  '/qrcodes/:qrCodeId',
  validate(qrCodeIdSchema, 'params'),
  presalesActivityController.getQrCodeById,
);

// ==================== 签到功能路由 ====================

/**
 * @swagger
 * /presales/sign-in:
 *   post:
 *     summary: 扫码签到
 *     tags: [PresalesActivity]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - qrCodeId
 *               - customerName
 *               - phone
 *             properties:
 *               qrCodeId:
 *                 type: string
 *               customerName:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               company:
 *                 type: string
 *               title:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: 签到成功
 */
router.post(
  '/sign-in',
  validate(signInSchema),
  presalesActivityController.signIn,
);

/**
 * @swagger
 * /presales/activities/{id}/sign-ins:
 *   get:
 *     summary: 获取活动签到记录
 *     tags: [PresalesActivity]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: 成功获取签到记录
 */
router.get(
  '/activities/:id/sign-ins',
  authMiddleware,
  validate(activityIdSchema, 'params'),
  validate(signInQuerySchema, 'query'),
  presalesActivityController.getSignIns,
);

/**
 * @swagger
 * /presales/sign-ins/{signInId}:
 *   get:
 *     summary: 获取签到详情
 *     tags: [PresalesActivity]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: signInId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 成功获取签到详情
 */
router.get(
  '/sign-ins/:signInId',
  authMiddleware,
  validate(signInIdSchema, 'params'),
  presalesActivityController.getSignInById,
);

// ==================== 问题管理路由 ====================

/**
 * @swagger
 * /presales/sign-ins/{signInId}/questions:
 *   post:
 *     summary: 提交问题
 *     tags: [PresalesActivity]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - question
 *             properties:
 *               question:
 *                 type: string
 *               category:
 *                 type: string
 *               priority:
 *                 type: string
 *     responses:
 *       201:
 *         description: 问题提交成功
 */
router.post(
  '/sign-ins/:signInId/questions',
  validate(signInIdSchema, 'params'),
  validate(createQuestionSchema),
  presalesActivityController.createQuestion,
);

/**
 * @swagger
 * /presales/activities/{id}/questions:
 *   get:
 *     summary: 获取活动问题列表
 *     tags: [PresalesActivity]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 成功获取问题列表
 */
router.get(
  '/activities/:id/questions',
  authMiddleware,
  validate(activityIdSchema, 'params'),
  validate(questionQuerySchema, 'query'),
  presalesActivityController.getQuestions,
);

/**
 * @swagger
 * /presales/questions/{questionId}:
 *   patch:
 *     summary: 更新问题
 *     tags: [PresalesActivity]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               category:
 *                 type: string
 *               priority:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: 问题更新成功
 */
router.patch(
  '/questions/:questionId',
  authMiddleware,
  validate(questionIdSchema, 'params'),
  validate(updateQuestionSchema),
  presalesActivityController.updateQuestion,
);

/**
 * @swagger
 * /presales/questions/{questionId}/answer:
 *   post:
 *     summary: 回答问题
 *     tags: [PresalesActivity]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: questionId
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
 *               - answer
 *             properties:
 *               answer:
 *                 type: string
 *     responses:
 *       200:
 *         description: 问题回答成功
 */
router.post(
  '/questions/:questionId/answer',
  authMiddleware,
  validate(questionIdSchema, 'params'),
  validate(answerQuestionSchema),
  presalesActivityController.answerQuestion,
);

// ==================== 统计路由 ====================

/**
 * @swagger
 * /presales/activities/{id}/stats:
 *   get:
 *     summary: 获取活动统计
 *     tags: [PresalesActivity]
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
 *         description: 成功获取活动统计
 */
router.get(
  '/activities/:id/stats',
  authMiddleware,
  validate(activityIdSchema, 'params'),
  presalesActivityController.getActivityStats,
);

export default router;