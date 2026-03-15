import { Router } from 'express';
import teamController from '../controllers/team.controller';
import { authMiddleware } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
  createTeamMemberSchema,
  updateTeamMemberSchema,
  teamMemberQuerySchema,
  teamMemberIdSchema,
  createTeamActivitySchema,
  activityQuerySchema,
} from '../validators/team.validator';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Team
 *   description: 团队管理
 */

/**
 * @swagger
 * /team/members:
 *   get:
 *     summary: 获取团队成员列表
 *     tags: [Team]
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
 *         name: role
 *         schema:
 *           type: string
 *           enum: [sales, manager, admin, support, presales]
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 成功获取成员列表
 */
router.get(
  '/members',
  authMiddleware,
  validate(teamMemberQuerySchema, 'query'),
  teamController.getMembers,
);

/**
 * @swagger
 * /team/stats:
 *   get:
 *     summary: 获取团队统计
 *     tags: [Team]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取团队统计
 */
router.get('/stats', authMiddleware, teamController.getStats);

/**
 * @swagger
 * /team/ranking:
 *   get:
 *     summary: 获取业绩排行
 *     tags: [Team]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [revenue, deals, customers]
 *           default: revenue
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: 成功获取排行榜
 */
router.get('/ranking', authMiddleware, teamController.getRanking);

/**
 * @swagger
 * /team/activities:
 *   get:
 *     summary: 获取团队活动
 *     tags: [Team]
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
 *           default: 20
 *       - in: query
 *         name: memberId
 *         schema:
 *           type: string
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 成功获取团队活动
 */
router.get(
  '/activities',
  authMiddleware,
  validate(activityQuerySchema, 'query'),
  teamController.getActivities,
);

/**
 * @swagger
 * /team/members:
 *   post:
 *     summary: 创建团队成员
 *     tags: [Team]
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
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [sales, manager, admin, support, presales]
 *               department:
 *                 type: string
 *               position:
 *                 type: string
 *     responses:
 *       201:
 *         description: 成员创建成功
 */
router.post(
  '/members',
  authMiddleware,
  validate(createTeamMemberSchema),
  teamController.createMember,
);

/**
 * @swagger
 * /team/activities:
 *   post:
 *     summary: 创建团队活动
 *     tags: [Team]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - title
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [deal_closed, customer_added, meeting_scheduled, task_completed, achievement, other]
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               relatedCustomerId:
 *                 type: string
 *     responses:
 *       201:
 *         description: 活动记录成功
 */
router.post(
  '/activities',
  authMiddleware,
  validate(createTeamActivitySchema),
  teamController.createActivity,
);

/**
 * @swagger
 * /team/members/{id}:
 *   get:
 *     summary: 获取成员详情
 *     tags: [Team]
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
 *         description: 成功获取成员详情
 */
router.get(
  '/members/:id',
  authMiddleware,
  validate(teamMemberIdSchema, 'params'),
  teamController.getMemberById,
);

/**
 * @swagger
 * /team/members/{id}:
 *   put:
 *     summary: 更新团队成员
 *     tags: [Team]
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
 *               role:
 *                 type: string
 *                 enum: [sales, manager, admin, support, presales]
 *               department:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: 成员更新成功
 */
router.put(
  '/members/:id',
  authMiddleware,
  validate(teamMemberIdSchema, 'params'),
  validate(updateTeamMemberSchema),
  teamController.updateMember,
);

/**
 * @swagger
 * /team/members/{id}:
 *   delete:
 *     summary: 删除团队成员
 *     tags: [Team]
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
 *         description: 成员删除成功
 */
router.delete(
  '/members/:id',
  authMiddleware,
  validate(teamMemberIdSchema, 'params'),
  teamController.deleteMember,
);

export default router;