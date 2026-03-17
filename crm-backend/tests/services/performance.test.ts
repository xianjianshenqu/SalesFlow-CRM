import { describe, it, expect, jest, beforeAll, afterAll, beforeEach } from '@jest/globals';

/**
 * 销售绩效服务测试
 */
describe('PerformanceService', () => {
  // 使用any类型避免复杂的mock类型问题
  const mockPrisma: any = {
    salesPerformance: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    coachingSuggestion: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    opportunity: {
      findMany: jest.fn(),
    },
    audioRecording: {
      findMany: jest.fn(),
    },
    scheduleTask: {
      findMany: jest.fn(),
    },
  };

  // 动态导入服务
  let performanceService: any;

  beforeAll(async () => {
    // Mock prisma模块
    jest.mock('../../src/repositories/prisma', () => mockPrisma);
    performanceService = require('../../src/services/performance.service').default;
    // 替换prisma实例
    performanceService.prisma = mockPrisma;
  });

  afterAll(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('recordPerformance', () => {
    it('should create new performance record when not exists', async () => {
      const input = {
        userId: 'user-1',
        date: new Date('2024-01-15'),
        calls: 10,
        meetings: 3,
        visits: 2,
        proposals: 1,
        closedDeals: 0,
        revenue: 0,
      };

      mockPrisma.salesPerformance.findUnique.mockResolvedValue(null);
      mockPrisma.salesPerformance.create.mockResolvedValue({
        id: 'perf-1',
        ...input,
        revenue: BigInt(0),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await performanceService.recordPerformance(input);

      expect(mockPrisma.salesPerformance.findUnique).toHaveBeenCalled();
      expect(mockPrisma.salesPerformance.create).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(result.id).toBe('perf-1');
    });

    it('should update existing performance record', async () => {
      const existingRecord = {
        id: 'perf-1',
        userId: 'user-1',
        date: new Date('2024-01-15'),
        calls: 10,
        meetings: 3,
        visits: 2,
        proposals: 1,
        closedDeals: 0,
        revenue: BigInt(50000),
      };

      const input = {
        userId: 'user-1',
        date: new Date('2024-01-15'),
        calls: 5,
        meetings: 1,
        visits: 0,
        proposals: 0,
        closedDeals: 1,
        revenue: 30000,
      };

      mockPrisma.salesPerformance.findUnique.mockResolvedValue(existingRecord);
      mockPrisma.salesPerformance.update.mockResolvedValue({
        ...existingRecord,
        calls: 15,
        meetings: 4,
        visits: 2,
        proposals: 1,
        closedDeals: 1,
        revenue: BigInt(80000),
      });

      await performanceService.recordPerformance(input);

      expect(mockPrisma.salesPerformance.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'perf-1' },
        })
      );
    });
  });

  describe('getPerformanceRecords', () => {
    it('should return paginated performance records', async () => {
      const mockRecords = [
        { id: 'perf-1', userId: 'user-1', date: new Date(), calls: 10, meetings: 3 },
        { id: 'perf-2', userId: 'user-2', date: new Date(), calls: 8, meetings: 2 },
      ];

      mockPrisma.salesPerformance.count.mockResolvedValue(2);
      mockPrisma.salesPerformance.findMany.mockResolvedValue(mockRecords);

      const result = await performanceService.getPerformanceRecords({
        page: 1,
        limit: 10,
      });

      expect(result.data).toHaveLength(2);
      expect(result.pagination.total).toBe(2);
      expect(result.pagination.page).toBe(1);
    });

    it('should filter by userId and date range', async () => {
      mockPrisma.salesPerformance.count.mockResolvedValue(5);
      mockPrisma.salesPerformance.findMany.mockResolvedValue([]);

      await performanceService.getPerformanceRecords({
        userId: 'user-1',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      });

      expect(mockPrisma.salesPerformance.findMany).toHaveBeenCalled();
    });
  });

  describe('getUserPerformance', () => {
    it('should return user performance with summary', async () => {
      const mockRecords = [
        { id: 'perf-1', userId: 'user-1', date: new Date(), calls: 10, meetings: 3, visits: 2, proposals: 2, closedDeals: 1, revenue: BigInt(50000) },
        { id: 'perf-2', userId: 'user-1', date: new Date(), calls: 8, meetings: 2, visits: 1, proposals: 1, closedDeals: 0, revenue: BigInt(0) },
      ];

      mockPrisma.salesPerformance.findMany.mockResolvedValue(mockRecords);

      const result = await performanceService.getUserPerformance('user-1');

      expect(result.records).toHaveLength(2);
      expect(result.summary.totalCalls).toBe(18);
      expect(result.summary.totalMeetings).toBe(5);
      expect(result.summary.totalRevenue).toBe(50000);
    });
  });

  describe('getCoachingSuggestions', () => {
    it('should return coaching suggestions for user', async () => {
      const mockSuggestions = [
        { id: 'coach-1', userId: 'user-1', type: 'performance', priority: 'high', title: '提升通话量', status: 'pending' },
        { id: 'coach-2', userId: 'user-1', type: 'skill', priority: 'medium', title: '改进谈判技巧', status: 'pending' },
      ];

      mockPrisma.coachingSuggestion.findMany.mockResolvedValue(mockSuggestions);

      const result = await performanceService.getCoachingSuggestions('user-1');

      expect(result).toHaveLength(2);
      expect(result[0].type).toBe('performance');
    });

    it('should filter by status', async () => {
      mockPrisma.coachingSuggestion.findMany.mockResolvedValue([]);

      await performanceService.getCoachingSuggestions('user-1', 'pending');

      expect(mockPrisma.coachingSuggestion.findMany).toHaveBeenCalled();
    });
  });

  describe('completeCoachingSuggestion', () => {
    it('should mark suggestion as completed', async () => {
      mockPrisma.coachingSuggestion.update.mockResolvedValue({
        id: 'coach-1',
        status: 'completed',
      });

      const result = await performanceService.completeCoachingSuggestion('coach-1');

      expect(mockPrisma.coachingSuggestion.update).toHaveBeenCalledWith({
        where: { id: 'coach-1' },
        data: { status: 'completed' },
      });
      expect(result.status).toBe('completed');
    });
  });

  describe('dismissCoachingSuggestion', () => {
    it('should mark suggestion as dismissed', async () => {
      mockPrisma.coachingSuggestion.update.mockResolvedValue({
        id: 'coach-1',
        status: 'dismissed',
      });

      const result = await performanceService.dismissCoachingSuggestion('coach-1');

      expect(mockPrisma.coachingSuggestion.update).toHaveBeenCalledWith({
        where: { id: 'coach-1' },
        data: { status: 'dismissed' },
      });
      expect(result.status).toBe('dismissed');
    });
  });

  describe('getTeamRanking', () => {
    it('should return team ranking sorted by revenue', async () => {
      const mockUsers = [
        { id: 'user-1', name: 'User 1', department: 'Sales', avatar: null },
        { id: 'user-2', name: 'User 2', department: 'Sales', avatar: null },
        { id: 'user-3', name: 'User 3', department: 'Sales', avatar: null },
      ];

      mockPrisma.user.findMany.mockResolvedValue(mockUsers);
      
      mockPrisma.salesPerformance.findMany
        .mockResolvedValueOnce([{ userId: 'user-1', calls: 10, meetings: 5, visits: 3, proposals: 4, closedDeals: 2, revenue: BigInt(200000) }])
        .mockResolvedValueOnce([{ userId: 'user-2', calls: 8, meetings: 4, visits: 2, proposals: 3, closedDeals: 1, revenue: BigInt(150000) }])
        .mockResolvedValueOnce([{ userId: 'user-3', calls: 12, meetings: 6, visits: 4, proposals: 5, closedDeals: 3, revenue: BigInt(250000) }]);

      const result = await performanceService.getTeamRanking();

      expect(result).toHaveLength(3);
      expect(result[0].rank).toBe(1);
      expect(result[0].revenue).toBe(250000);
    });
  });

  describe('getStats', () => {
    it('should return performance statistics', async () => {
      mockPrisma.user.findMany.mockResolvedValue([
        { id: 'user-1' },
        { id: 'user-2' },
      ]);

      mockPrisma.salesPerformance.findMany.mockResolvedValue([
        { userId: 'user-1', calls: 20, meetings: 8, visits: 5, proposals: 6, closedDeals: 2, revenue: BigInt(100000) },
        { userId: 'user-2', calls: 15, meetings: 6, visits: 3, proposals: 4, closedDeals: 1, revenue: BigInt(80000) },
      ]);

      const result = await performanceService.getStats();

      expect(result.totalRevenue).toBe(180000);
      expect(result.totalDeals).toBe(3);
      expect(result.totalCalls).toBe(35);
      expect(result.totalMeetings).toBe(14);
      expect(result.activeUsers).toBe(2);
    });
  });
});