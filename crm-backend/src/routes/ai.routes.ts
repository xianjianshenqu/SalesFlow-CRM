/**
 * AI功能路由
 */

import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth';
import {
  getFollowUpSuggestions,
  generateFollowUpSuggestion,
  updateSuggestionStatus,
  generateScript,
  generateReport,
  getReports,
  getReportById,
  updateReport,
} from '../controllers/ai.controller';

const router = Router();

// 所有AI路由需要认证
router.use(authMiddleware);

// ==================== 跟进建议 ====================

// 获取跟进建议列表
router.get('/follow-up-suggestions', getFollowUpSuggestions);

// 为客户生成跟进建议
router.post('/follow-up-suggestions/generate', generateFollowUpSuggestion);

// 更新跟进建议状态
router.patch('/follow-up-suggestions/:id/status', updateSuggestionStatus);

// ==================== 话术生成 ====================

// 生成跟进话术
router.post('/scripts/generate', generateScript);

// ==================== 报告生成 ====================

// 生成日报/周报
router.post('/reports/generate', generateReport);

// 获取报告列表
router.get('/reports', getReports);

// 获取报告详情
router.get('/reports/:id', getReportById);

// 更新报告内容
router.put('/reports/:id', updateReport);

export default router;