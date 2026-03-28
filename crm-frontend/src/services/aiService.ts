/**
 * AI功能服务API
 * 处理商机评分、流失预警、客户洞察等AI功能的前端API调用
 */

import axios from 'axios';
import type {
  OpportunityScore,
  ScoreSummary,
  ChurnAlert,
  CustomerInsight,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002/api/v1';

// 创建axios实例
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加认证token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ==================== 商机评分API ====================

/**
 * 计算商机评分
 */
export const calculateOpportunityScore = async (opportunityId: string): Promise<OpportunityScore> => {
  const response = await api.post(`/ai/opportunities/${opportunityId}/score`);
  return response.data.data;
};

/**
 * 获取商机评分
 */
export const getOpportunityScore = async (opportunityId: string): Promise<OpportunityScore> => {
  const response = await api.get(`/ai/opportunities/${opportunityId}/score`);
  return response.data.data;
};

/**
 * 获取评分概览
 */
export const getScoreSummary = async (): Promise<ScoreSummary> => {
  const response = await api.get('/ai/opportunities/score-summary');
  return response.data.data;
};

// ==================== 流失预警API ====================

/**
 * 分析客户流失风险
 */
export const analyzeChurnRisk = async (customerId: string): Promise<ChurnAlert> => {
  const response = await api.post(`/ai/customers/${customerId}/churn-analysis`);
  return response.data.data;
};

/**
 * 获取客户流失预警
 */
export const getChurnAlert = async (customerId: string): Promise<ChurnAlert> => {
  const response = await api.get(`/ai/customers/${customerId}/churn-alert`);
  return response.data.data;
};

/**
 * 获取流失预警列表
 */
export const getChurnAlerts = async (params?: {
  riskLevel?: 'high' | 'medium' | 'low';
  status?: 'active' | 'handled' | 'ignored';
  page?: number;
  limit?: number;
}): Promise<{ items: ChurnAlert[]; total: number; page: number; limit: number; totalPages: number }> => {
  const response = await api.get('/ai/churn-alerts', { params });
  return response.data.data;
};

/**
 * 处理流失预警
 */
export const handleChurnAlert = async (
  alertId: string,
  action: 'handled' | 'ignored'
): Promise<ChurnAlert> => {
  const response = await api.patch(`/ai/churn-alerts/${alertId}/handle`, { action });
  return response.data.data;
};

// ==================== 客户画像API ====================

/**
 * 生成客户洞察
 */
export const generateCustomerInsights = async (customerId: string): Promise<CustomerInsight> => {
  const response = await api.post(`/ai/customers/${customerId}/insights`);
  return response.data.data;
};

/**
 * 获取客户洞察
 */
export const getCustomerInsights = async (customerId: string): Promise<CustomerInsight> => {
  const response = await api.get(`/ai/customers/${customerId}/insights`);
  return response.data.data;
};

// ==================== 综合分析API ====================

/**
 * 获取AI仪表盘数据
 */
export const getAIDashboardData = async (): Promise<{
  scoreSummary: ScoreSummary;
  churnAlerts: { items: ChurnAlert[]; total: number };
}> => {
  const [scoreSummary, churnAlerts] = await Promise.all([
    getScoreSummary(),
    getChurnAlerts({ limit: 5 }),
  ]);

  return {
    scoreSummary,
    churnAlerts,
  };
};

export default {
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
  // 综合分析
  getAIDashboardData,
};