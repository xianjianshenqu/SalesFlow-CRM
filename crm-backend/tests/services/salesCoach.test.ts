import { describe, it, expect, beforeAll } from '@jest/globals';

/**
 * 销售绩效AI教练服务测试
 */
describe('SalesCoach Service', () => {
  let salesCoachService: any;

  beforeAll(() => {
    // 使用 default 导出
    salesCoachService = require('../../src/services/ai/salesCoach').default;
  });

  describe('analyzePerformance', () => {
    it('should analyze performance and return insights', async () => {
      const input = {
        userId: 'user-1',
        userName: '测试用户',
        period: 'weekly',
        startDate: new Date(),
        endDate: new Date(),
        metrics: {
          calls: 50,
          meetings: 15,
          visits: 8,
          proposals: 10,
          closedDeals: 3,
          revenue: 150000,
          opportunities: [],
          recordings: [],
          tasks: [],
        },
        previousPeriodComparison: {
          revenueChange: 10,
          dealsChange: 5,
          callsChange: 15,
          meetingsChange: -5,
        },
      };

      const result = await salesCoachService.analyzePerformance(input);

      expect(result).toBeDefined();
      expect(result.overallScore).toBeGreaterThanOrEqual(0);
      expect(result.overallScore).toBeLessThanOrEqual(100);
      expect(result.strengths).toBeInstanceOf(Array);
      expect(result.metrics).toBeDefined();
    });

    it('should identify strengths based on performance', async () => {
      const input = {
        userId: 'user-1',
        userName: '测试用户',
        period: 'monthly',
        startDate: new Date(),
        endDate: new Date(),
        metrics: {
          calls: 100,
          meetings: 30,
          visits: 20,
          proposals: 25,
          closedDeals: 10,
          revenue: 500000,
          opportunities: [],
          recordings: [],
          tasks: [],
        },
        previousPeriodComparison: {
          revenueChange: 20,
          dealsChange: 15,
          callsChange: 10,
          meetingsChange: 10,
        },
      };

      const result = await salesCoachService.analyzePerformance(input);

      expect(result.strengths.length).toBeGreaterThan(0);
    });
  });

  describe('generateCoachingSuggestions', () => {
    it('should generate coaching suggestions', async () => {
      // 先分析绩效获取完整的数据结构
      const analysisInput = {
        userId: 'user-1',
        userName: '测试用户',
        period: 'weekly',
        startDate: new Date(),
        endDate: new Date(),
        metrics: {
          calls: 30,
          meetings: 8,
          visits: 4,
          proposals: 6,
          closedDeals: 2,
          revenue: 80000,
          opportunities: [],
          recordings: [],
          tasks: [],
        },
        previousPeriodComparison: {
          revenueChange: 5,
          dealsChange: 0,
          callsChange: 10,
          meetingsChange: -5,
        },
      };

      const performanceAnalysis = await salesCoachService.analyzePerformance(analysisInput);

      const input = {
        userId: 'user-1',
        performanceAnalysis,
      };

      const result = await salesCoachService.generateCoachingSuggestions(input);

      expect(result).toBeDefined();
      expect(result.suggestions).toBeInstanceOf(Array);
      expect(result.weeklyPlan).toBeDefined();
      expect(result.motivationMessage).toBeDefined();
    });
  });

  describe('predictPerformanceTrend', () => {
    it('should predict performance trend', async () => {
      const historicalData = [
        { date: new Date('2024-01-01'), revenue: 100000, deals: 2 },
        { date: new Date('2024-01-08'), revenue: 120000, deals: 3 },
        { date: new Date('2024-01-15'), revenue: 110000, deals: 2 },
        { date: new Date('2024-01-22'), revenue: 140000, deals: 4 },
      ];

      const result = await salesCoachService.predictPerformanceTrend(historicalData);

      expect(result).toBeDefined();
      // 检查返回的关键字段
      if (result.trend) {
        expect(['up', 'down', 'stable', 'improving', 'declining']).toContain(result.trend);
      }
      if (result.predictedRevenue !== undefined) {
        expect(result.predictedRevenue).toBeGreaterThan(0);
      }
    });

    it('should handle limited historical data', async () => {
      const limitedData = [
        { date: new Date(), revenue: 50000, deals: 1 },
      ];

      const result = await salesCoachService.predictPerformanceTrend(limitedData);

      expect(result).toBeDefined();
    });
  });
});