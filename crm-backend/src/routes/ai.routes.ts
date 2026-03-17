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
  // 商机评分
  calculateOpportunityScore,
  getOpportunityScore,
  getScoreSummary,
  // 流失预警
  analyzeChurnRisk,
  getChurnAlert,
  getChurnAlerts,
  handleChurnAlert,
  // 客户画像
  generateCustomerInsights,
  getCustomerInsights,
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

// ==================== 商机评分 ====================

// 计算商机评分
router.post('/opportunities/:id/score', calculateOpportunityScore);

// 获取商机评分
router.get('/opportunities/:id/score', getOpportunityScore);

// 获取评分概览
router.get('/opportunities/score-summary', getScoreSummary);

// ==================== 流失预警 ====================

// 分析客户流失风险
router.post('/customers/:id/churn-analysis', analyzeChurnRisk);

// 获取客户流失预警
router.get('/customers/:id/churn-alert', getChurnAlert);

// 获取流失预警列表
router.get('/churn-alerts', getChurnAlerts);

// 处理流失预警
router.patch('/churn-alerts/:id/handle', handleChurnAlert);

// ==================== 客户画像 ====================

// 生成客户洞察
router.post('/customers/:id/insights', generateCustomerInsights);

// 获取客户洞察
router.get('/customers/:id/insights', getCustomerInsights);

export default router;