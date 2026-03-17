/**
 * AI服务模块入口
 * 统一导出所有AI服务
 */

// 类型导出
export * from './types';

// 服务导出
export { default as followUpAnalysisService } from './followUpAnalysis';
export { default as reportGenerationService } from './reportGeneration';
export { default as opportunityScoringService } from './opportunityScoring';
export { default as churnAnalysisService } from './churnAnalysis';
export { default as customerInsightService } from './customerInsight';

// 阶段三新增服务导出
export { default as proposalAIService } from './proposalAI';
export { default as salesCoachService } from './salesCoach';
export { default as resourceMatchingService } from './resourceMatching';

// 导入现有AI服务
import aiService from '../ai.service';
import followUpAnalysisService from './followUpAnalysis';
import reportGenerationService from './reportGeneration';
import opportunityScoringService from './opportunityScoring';
import churnAnalysisService from './churnAnalysis';
import customerInsightService from './customerInsight';

// 阶段三新增服务导入
import proposalAIService from './proposalAI';
import salesCoachService from './salesCoach';
import resourceMatchingService from './resourceMatching';

/**
 * AI服务统一接口
 */
export const aiServices = {
  // 现有服务
  audioAnalysis: aiService,
  companyAnalysis: aiService,

  // 新增服务
  followUpAnalysis: followUpAnalysisService,
  reportGeneration: reportGenerationService,

  // 阶段二新增服务
  opportunityScoring: opportunityScoringService,
  churnAnalysis: churnAnalysisService,
  customerInsight: customerInsightService,

  // 阶段三新增服务
  proposalAI: proposalAIService,
  salesCoach: salesCoachService,
  resourceMatching: resourceMatchingService,
};

export default aiServices;