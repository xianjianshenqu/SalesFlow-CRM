import { describe, it, expect, beforeAll } from '@jest/globals';

/**
 * 售前资源智能匹配服务测试
 */
describe('ResourceMatching Service', () => {
  let resourceMatchingService: any;
  let mockResources: any[];

  beforeAll(() => {
    resourceMatchingService = require('../../src/services/ai/resourceMatching').default;
    mockResources = [
      {
        id: 'resource-1',
        name: '张三',
        email: 'zhangsan@example.com',
        skills: ['技术演示', '需求分析', '方案设计'],
        experience: 5,
        status: 'available',
        currentWorkload: 20,
        completedRequests: 15,
        successRate: 0.9,
      },
      {
        id: 'resource-2',
        name: '李四',
        email: 'lisi@example.com',
        skills: ['需求分析', '项目管理', '沟通协调'],
        experience: 3,
        status: 'available',
        currentWorkload: 40,
        completedRequests: 10,
        successRate: 0.85,
      },
      {
        id: 'resource-3',
        name: '王五',
        email: 'wangwu@example.com',
        skills: ['技术演示', '培训交付'],
        experience: 2,
        status: 'busy',
        currentWorkload: 80,
        completedRequests: 5,
        successRate: 0.8,
      },
    ];
  });

  describe('matchResources', () => {
    it('should match resources and return sorted results', async () => {
      const input = {
        requestId: 'request-1',
        requestType: '技术支持',
        title: '客户系统演示',
        requiredSkills: ['技术演示', '需求分析'],
        priority: 'high' as const,
      };

      const result = await resourceMatchingService.matchResources(input, mockResources);

      expect(result).toBeDefined();
      expect(result.matchedResources).toBeInstanceOf(Array);
      expect(result.matchedResources.length).toBeGreaterThan(0);
      expect(result.bestMatch).toBeDefined();
      expect(result.bestMatch.resourceId).toBeDefined();
      expect(result.bestMatch.confidence).toBeGreaterThan(0);
      expect(result.alternatives).toBeInstanceOf(Array);
      expect(result.recommendations).toBeInstanceOf(Array);
    });

    it('should rank resources by match score', async () => {
      const input = {
        requestId: 'request-2',
        requestType: '方案设计',
        title: '解决方案设计',
        requiredSkills: ['方案设计', '需求分析'],
        priority: 'medium' as const,
      };

      const result = await resourceMatchingService.matchResources(input, mockResources);

      for (let i = 0; i < result.matchedResources.length - 1; i++) {
        expect(result.matchedResources[i].matchScore).toBeGreaterThanOrEqual(
          result.matchedResources[i + 1].matchScore
        );
      }
    });

    it('should return empty result when no resources available', async () => {
      const input = {
        requestId: 'request-3',
        requestType: '紧急支持',
        title: '紧急技术支持',
        requiredSkills: ['技术演示'],
        priority: 'high' as const,
      };

      const result = await resourceMatchingService.matchResources(input, []);

      expect(result.matchedResources).toHaveLength(0);
      expect(result.bestMatch.confidence).toBe(0);
    });
  });

  describe('calculateMatchScore', () => {
    it('should calculate skill match score correctly', () => {
      const input = {
        requestId: 'request-1',
        requestType: '技术支持',
        title: '测试请求',
        requiredSkills: ['技术演示', '需求分析', '方案设计'],
        priority: 'high' as const,
      };

      const result = resourceMatchingService.calculateMatchScore(input, mockResources[0]);

      expect(result.matchScore).toBeGreaterThan(0);
      expect(result.matchScore).toBeLessThanOrEqual(100);
      expect(result.matchedSkills).toContain('技术演示');
      expect(result.matchedSkills).toContain('需求分析');
      expect(result.factors.skillMatch.score).toBeGreaterThan(0);
    });

    it('should identify missing skills', () => {
      const input = {
        requestId: 'request-1',
        requestType: '技术支持',
        title: '测试请求',
        requiredSkills: ['技术演示', '人工智能', '大数据'],
        priority: 'high' as const,
      };

      const result = resourceMatchingService.calculateMatchScore(input, mockResources[0]);

      expect(result.missingSkills).toContain('人工智能');
      expect(result.missingSkills).toContain('大数据');
    });

    it('should determine recommendation level', () => {
      const highScoreInput = {
        requestId: 'request-1',
        requestType: '技术支持',
        title: '测试请求',
        requiredSkills: ['技术演示'],
        priority: 'high' as const,
      };

      const highScoreResult = resourceMatchingService.calculateMatchScore(highScoreInput, {
        ...mockResources[0],
        skills: ['技术演示', '需求分析', '方案设计', '项目管理'],
        experience: 10,
        currentWorkload: 0,
        successRate: 0.95,
      });

      expect(['highly_recommended', 'recommended', 'acceptable']).toContain(highScoreResult.recommendation);
    });

    it('should consider workload in scoring', () => {
      const input = {
        requestId: 'request-1',
        requestType: '技术支持',
        title: '测试请求',
        requiredSkills: ['技术演示'],
        priority: 'medium' as const,
      };

      const availableResult = resourceMatchingService.calculateMatchScore(input, {
        ...mockResources[0],
        currentWorkload: 20,
        status: 'available',
      });

      const busyResult = resourceMatchingService.calculateMatchScore(input, {
        ...mockResources[0],
        currentWorkload: 90,
        status: 'busy',
      });

      expect(availableResult.factors.workloadFit.score).toBeGreaterThan(busyResult.factors.workloadFit.score);
    });
  });

  describe('generateAssignmentRecommendation', () => {
    it('should generate assignment recommendation', async () => {
      const matchedResources = [
        {
          resource: mockResources[0],
          matchScore: 85,
          matchedSkills: ['技术演示', '需求分析'],
          missingSkills: [],
          factors: {
            skillMatch: { score: 90, weight: 40, details: '技能匹配良好' },
            experienceMatch: { score: 80, weight: 20, details: '经验丰富' },
            locationMatch: { score: 70, weight: 15, details: '位置适中' },
            workloadFit: { score: 90, weight: 15, details: '负载适中' },
            successHistory: { score: 85, weight: 10, details: '历史表现良好' },
          },
          recommendation: 'highly_recommended' as const,
        },
      ];

      const input = {
        requestId: 'request-1',
        matchedResources,
        urgencyLevel: 'normal' as const,
      };

      const result = await resourceMatchingService.generateAssignmentRecommendation(input);

      expect(result).toBeDefined();
      expect(result.recommendedResourceId).toBeDefined();
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.reasoning).toBeDefined();
      expect(result.riskAssessment).toBeDefined();
      expect(['low', 'medium', 'high']).toContain(result.riskAssessment.level);
      expect(result.suggestedTerms).toBeDefined();
    });

    it('should handle urgent requests differently', async () => {
      const matchedResources = [
        {
          resource: { ...mockResources[0], status: 'busy' as const },
          matchScore: 90,
          matchedSkills: ['技术演示'],
          missingSkills: [],
          factors: {
            skillMatch: { score: 95, weight: 40, details: '' },
            experienceMatch: { score: 80, weight: 20, details: '' },
            locationMatch: { score: 70, weight: 15, details: '' },
            workloadFit: { score: 30, weight: 15, details: '' },
            successHistory: { score: 85, weight: 10, details: '' },
          },
          recommendation: 'acceptable' as const,
        },
        {
          resource: { ...mockResources[1], status: 'available' as const },
          matchScore: 75,
          matchedSkills: ['需求分析'],
          missingSkills: ['技术演示'],
          factors: {
            skillMatch: { score: 60, weight: 40, details: '' },
            experienceMatch: { score: 70, weight: 20, details: '' },
            locationMatch: { score: 70, weight: 15, details: '' },
            workloadFit: { score: 85, weight: 15, details: '' },
            successHistory: { score: 80, weight: 10, details: '' },
          },
          recommendation: 'recommended' as const,
        },
      ];

      const input = {
        requestId: 'request-urgent',
        matchedResources,
        urgencyLevel: 'urgent' as const,
      };

      const result = await resourceMatchingService.generateAssignmentRecommendation(input);

      expect(result).toBeDefined();
    });
  });

  describe('optimizeResourceAllocation', () => {
    it('should optimize allocation for multiple requests', async () => {
      const requests = [
        {
          id: 'request-1',
          input: {
            requestId: 'request-1',
            requestType: '技术支持',
            title: '请求1',
            requiredSkills: ['技术演示'],
            priority: 'high' as const,
          },
          priority: 'high' as const,
        },
        {
          id: 'request-2',
          input: {
            requestId: 'request-2',
            requestType: '方案设计',
            title: '请求2',
            requiredSkills: ['方案设计'],
            priority: 'medium' as const,
          },
          priority: 'medium' as const,
        },
      ];

      const result = await resourceMatchingService.optimizeResourceAllocation(requests, mockResources);

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeLessThanOrEqual(requests.length);
    });
  });

  describe('predictResourceAvailability', () => {
    it('should predict resource availability', async () => {
      const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      const result = await resourceMatchingService.predictResourceAvailability('resource-1', futureDate);

      expect(result).toBeDefined();
      expect(typeof result.available).toBe('boolean');
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.reason).toBeDefined();
    });
  });
});