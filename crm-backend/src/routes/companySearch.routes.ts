import { Router } from 'express';
import companySearchController from '../controllers/companySearch.controller';
import { authMiddleware } from '../middlewares';

const router = Router();

/**
 * @swagger
 * /companies/search:
 *   get:
 *     summary: 搜索企业
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: keyword
 *         required: true
 *         schema:
 *           type: string
 *         description: 搜索关键词（企业名称、简称或信用代码）
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 返回结果数量限制
 *     responses:
 *       200:
 *         description: 企业搜索结果列表
 */
router.get('/search', authMiddleware, companySearchController.search);

/**
 * @swagger
 * /companies/{creditCode}:
 *   get:
 *     summary: 获取企业详情
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: creditCode
 *         required: true
 *         schema:
 *           type: string
 *         description: 统一社会信用代码
 *     responses:
 *       200:
 *         description: 企业详细信息
 *       404:
 *         description: 企业不存在
 */
router.get('/:creditCode', authMiddleware, companySearchController.getDetail);

export default router;