/**
 * 陌生拜访AI助手路由
 */

import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth';
import {
  analyzeCompany,
  convertToCustomer,
  getHistory,
  getRecord,
  deleteRecord,
} from '../controllers/coldVisit.controller';

const router = Router();

// 所有路由都需要认证
router.use(authMiddleware);

/**
 * @route POST /api/v1/cold-visit/analyze
 * @desc 分析企业信息
 * @access Private
 */
router.post('/analyze', analyzeCompany);

/**
 * @route GET /api/v1/cold-visit/history
 * @desc 获取分析历史记录
 * @access Private
 */
router.get('/history', getHistory);

/**
 * @route GET /api/v1/cold-visit/:id
 * @desc 获取单个分析记录
 * @access Private
 */
router.get('/:id', getRecord);

/**
 * @route POST /api/v1/cold-visit/:id/convert
 * @desc 将分析记录转换为客户
 * @access Private
 */
router.post('/:id/convert', convertToCustomer);

/**
 * @route DELETE /api/v1/cold-visit/:id
 * @desc 删除分析记录
 * @access Private
 */
router.delete('/:id', deleteRecord);

export default router;