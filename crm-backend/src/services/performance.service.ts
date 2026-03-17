/**
 * 销售绩效服务
 * 处理销售绩效数据记录、查询、统计等功能
 */

import { PrismaClient } from '@prisma/client';
import prisma from '../repositories/prisma';
import { salesCoachService } from './ai';
import { PerformanceAnalysisInput, PerformanceAnalysisResult } from './ai/types';

/**
 * 绩效数据输入接口
 */
export interface CreatePerformanceInput {
  userId: string;
  date: Date;
  calls?: number;
  meetings?: number;
  visits?: number;
  proposals?: number;
  closedDeals?: number;
  revenue?: number;
}

/**
 * 绩效查询接口
 */
export interface PerformanceQueryInput {
  userId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

/**
 * 教练建议创建输入
 */
export interface CreateCoachingInput {
  userId: string;
  type: 'performance' | 'skill' | 'opportunity' | 'time_management';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  actions?: Array<{ step: number; action: string; expectedOutcome: string }>;
  metrics?: Record<string, number>;
  expiresAt?: Date;
}

/**
 * 销售绩效服务类
 */
class PerformanceService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  // ==================== 绩效数据管理 ====================

  /**
   * 记录绩效数据
   */
  async recordPerformance(data: CreatePerformanceInput) {
    // 检查是否已有该日期的记录
    const existing = await this.prisma.salesPerformance.findUnique({
      where: {
        userId_date: {
          userId: data.userId,
          date: data.date,
        },
      },
    });

    if (existing) {
      // 更新现有记录
      return this.prisma.salesPerformance.update({
        where: { id: existing.id },
        data: {
          calls: (existing.calls || 0) + (data.calls || 0),
          meetings: (existing.meetings || 0) + (data.meetings || 0),
          visits: (existing.visits || 0) + (data.visits || 0),
          proposals: (existing.proposals || 0) + (data.proposals || 0),
          closedDeals: (existing.closedDeals || 0) + (data.closedDeals || 0),
          revenue: Number(existing.revenue) + (data.revenue || 0),
        },
      });
    }

    // 创建新记录
    return this.prisma.salesPerformance.create({
      data: {
        userId: data.userId,
        date: data.date,
        calls: data.calls || 0,
        meetings: data.meetings || 0,
        visits: data.visits || 0,
        proposals: data.proposals || 0,
        closedDeals: data.closedDeals || 0,
        revenue: data.revenue || 0,
      },
    });
  }

  /**
   * 批量记录绩效数据
   */
  async batchRecordPerformance(records: CreatePerformanceInput[]) {
    const results = [];
    for (const record of records) {
      const result = await this.recordPerformance(record);
      results.push(result);
    }
    return results;
  }

  /**
   * 获取绩效记录
   */
  async getPerformanceRecords(query: PerformanceQueryInput) {
    const { userId, startDate, endDate, page = 1, limit = 30 } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (userId) where.userId = userId;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const [total, records] = await Promise.all([
      this.prisma.salesPerformance.count({ where }),
      this.prisma.salesPerformance.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'desc' },
        include: {
          user: {
            select: { id: true, name: true, email: true, department: true },
          },
        },
      }),
    ]);

    return {
      data: records,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * 获取用户绩效详情
   */
  async getUserPerformance(userId: string, startDate?: Date, endDate?: Date) {
    const where: any = { userId };
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = startDate;
      if (endDate) where.date.lte = endDate;
    }

    const records = await this.prisma.salesPerformance.findMany({
      where,
      orderBy: { date: 'desc' },
    });

    // 计算汇总数据
    const summary = {
      totalCalls: records.reduce((sum, r) => sum + r.calls, 0),
      totalMeetings: records.reduce((sum, r) => sum + r.meetings, 0),
      totalVisits: records.reduce((sum, r) => sum + r.visits, 0),
      totalProposals: records.reduce((sum, r) => sum + r.proposals, 0),
      totalClosedDeals: records.reduce((sum, r) => sum + r.closedDeals, 0),
      totalRevenue: records.reduce((sum, r) => sum + Number(r.revenue), 0),
      avgCallsPerDay: records.length > 0 ? records.reduce((sum, r) => sum + r.calls, 0) / records.length : 0,
      avgMeetingsPerDay: records.length > 0 ? records.reduce((sum, r) => sum + r.meetings, 0) / records.length : 0,
      conversionRate: 0,
    };

    // 计算转化率
    if (summary.totalProposals > 0) {
      summary.conversionRate = (summary.totalClosedDeals / summary.totalProposals) * 100;
    }

    return {
      records,
      summary,
    };
  }

  // ==================== 绩效分析 ====================

  /**
   * 获取绩效仪表盘数据
   */
  async getDashboard(userId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // 获取本月数据
    const currentMonth = await this.getUserPerformance(userId, startOfMonth, now);

    // 获取上月数据
    const lastMonth = await this.getUserPerformance(userId, startOfLastMonth, endOfLastMonth);

    // 计算环比变化
    const changes = {
      revenue: this.calculateChange(currentMonth.summary.totalRevenue, lastMonth.summary.totalRevenue),
      deals: this.calculateChange(currentMonth.summary.totalClosedDeals, lastMonth.summary.totalClosedDeals),
      calls: this.calculateChange(currentMonth.summary.totalCalls, lastMonth.summary.totalCalls),
      meetings: this.calculateChange(currentMonth.summary.totalMeetings, lastMonth.summary.totalMeetings),
    };

    // 获取最近的教练建议
    const pendingCoaching = await this.prisma.coachingSuggestion.count({
      where: { userId, status: 'pending' },
    });

    return {
      currentMonth: currentMonth.summary,
      lastMonth: lastMonth.summary,
      changes,
      pendingCoaching,
      recentRecords: currentMonth.records.slice(0, 7),
    };
  }

  /**
   * 获取绩效趋势
   */
  async getTrends(userId: string, days: number = 30) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const records = await this.prisma.salesPerformance.findMany({
      where: {
        userId,
        date: { gte: startDate, lte: endDate },
      },
      orderBy: { date: 'asc' },
    });

    // 按日期整理数据
    const dailyData = records.map(r => ({
      date: r.date.toISOString().split('T')[0],
      calls: r.calls,
      meetings: r.meetings,
      visits: r.visits,
      proposals: r.proposals,
      closedDeals: r.closedDeals,
      revenue: Number(r.revenue),
    }));

    // 计算移动平均
    const movingAverage = this.calculateMovingAverage(dailyData.map(d => d.revenue), 7);

    // 预测趋势
    const prediction = await salesCoachService.predictPerformanceTrend(
      records.map(r => ({ date: r.date, revenue: Number(r.revenue), deals: r.closedDeals }))
    );

    return {
      dailyData,
      movingAverage,
      prediction,
    };
  }

  /**
   * AI绩效分析
   */
  async analyzePerformance(userId: string, period: 'daily' | 'weekly' | 'monthly' = 'weekly'): Promise<PerformanceAnalysisResult> {
    const now = new Date();
    let startDate: Date;
    let endDate = now;

    switch (period) {
      case 'daily':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'weekly':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
    }

    // 获取绩效数据
    const performance = await this.getUserPerformance(userId, startDate, endDate);

    // 获取用户信息
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true },
    });

    // 获取相关商机数据
    const opportunities = await this.prisma.opportunity.findMany({
      where: {
        ownerId: userId,
        updatedAt: { gte: startDate, lte: endDate },
      },
      select: { stage: true, value: true, lastActivity: true },
    });

    // 获取录音数据
    const recordings = await this.prisma.audioRecording.findMany({
      where: {
        createdById: userId,
        recordedAt: { gte: startDate, lte: endDate },
      },
      select: { sentiment: true, duration: true, recordedAt: true },
    });

    // 获取任务数据
    const tasks = await this.prisma.scheduleTask.findMany({
      where: {
        assigneeId: userId,
        dueDate: { gte: startDate, lte: endDate },
      },
      select: { type: true, status: true, dueDate: true },
    });

    // 获取上月对比数据
    const lastPeriodStart = new Date(startDate);
    lastPeriodStart.setDate(lastPeriodStart.getDate() - (period === 'daily' ? 1 : period === 'weekly' ? 7 : 30));
    const lastPeriodEnd = new Date(startDate);
    lastPeriodEnd.setDate(lastPeriodEnd.getDate() - 1);

    const lastPeriod = await this.getUserPerformance(userId, lastPeriodStart, lastPeriodEnd);

    // 构建分析输入
    const input: PerformanceAnalysisInput = {
      userId,
      userName: user?.name || 'Unknown',
      period,
      startDate,
      endDate,
      metrics: {
        calls: performance.summary.totalCalls,
        meetings: performance.summary.totalMeetings,
        visits: performance.summary.totalVisits,
        proposals: performance.summary.totalProposals,
        closedDeals: performance.summary.totalClosedDeals,
        revenue: performance.summary.totalRevenue,
        opportunities: opportunities.map(o => ({
          stage: o.stage,
          value: Number(o.value),
          lastActivity: o.lastActivity || undefined,
        })),
        recordings: recordings.map(r => ({
          sentiment: r.sentiment || 'neutral',
          duration: r.duration,
          recordedAt: r.recordedAt,
        })),
        tasks: tasks.map(t => ({
          type: t.type,
          status: t.status,
          dueDate: t.dueDate,
        })),
      },
      previousPeriodComparison: {
        revenueChange: this.calculateChangePercent(performance.summary.totalRevenue, lastPeriod.summary.totalRevenue),
        dealsChange: this.calculateChangePercent(performance.summary.totalClosedDeals, lastPeriod.summary.totalClosedDeals),
        callsChange: this.calculateChangePercent(performance.summary.totalCalls, lastPeriod.summary.totalCalls),
        meetingsChange: this.calculateChangePercent(performance.summary.totalMeetings, lastPeriod.summary.totalMeetings),
      },
    };

    return salesCoachService.analyzePerformance(input);
  }

  // ==================== 教练建议管理 ====================

  /**
   * 生成教练建议
   */
  async generateCoachingSuggestions(userId: string) {
    // 先进行绩效分析
    const performanceAnalysis = await this.analyzePerformance(userId);

    // 生成建议
    const coachingResult = await salesCoachService.generateCoachingSuggestions({
      userId,
      performanceAnalysis,
    });

    // 保存建议到数据库
    const savedSuggestions = [];
    for (const suggestion of coachingResult.suggestions) {
      const saved = await this.prisma.coachingSuggestion.create({
        data: {
          userId,
          type: suggestion.type,
          priority: suggestion.priority,
          title: suggestion.title,
          description: suggestion.description,
          actions: suggestion.actions,
          metrics: suggestion.metrics,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7天后过期
        },
      });
      savedSuggestions.push(saved);
    }

    return {
      suggestions: savedSuggestions,
      weeklyPlan: coachingResult.weeklyPlan,
      motivationMessage: coachingResult.motivationMessage,
    };
  }

  /**
   * 获取教练建议列表
   */
  async getCoachingSuggestions(userId: string, status?: string) {
    const where: any = { userId };
    if (status) where.status = status;

    return this.prisma.coachingSuggestion.findMany({
      where,
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
    });
  }

  /**
   * 完成教练建议
   */
  async completeCoachingSuggestion(id: string) {
    return this.prisma.coachingSuggestion.update({
      where: { id },
      data: { status: 'completed' },
    });
  }

  /**
   * 忽略教练建议
   */
  async dismissCoachingSuggestion(id: string) {
    return this.prisma.coachingSuggestion.update({
      where: { id },
      data: { status: 'dismissed' },
    });
  }

  // ==================== 排名与对比 ====================

  /**
   * 获取团队绩效排名
   */
  async getTeamRanking(department?: string, limit: number = 10) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // 构建查询条件
    const userWhere: any = { isActive: true };
    if (department) userWhere.department = department;

    // 获取所有活跃用户
    const users = await this.prisma.user.findMany({
      where: userWhere,
      select: { id: true, name: true, department: true, avatar: true },
    });

    // 获取每个用户的绩效数据
    const rankings = [];
    for (const user of users) {
      const performance = await this.getUserPerformance(user.id, startOfMonth, now);

      rankings.push({
        user,
        revenue: performance.summary.totalRevenue,
        deals: performance.summary.totalClosedDeals,
        conversionRate: performance.summary.conversionRate,
        calls: performance.summary.totalCalls,
        meetings: performance.summary.totalMeetings,
      });
    }

    // 按收入排序
    rankings.sort((a, b) => b.revenue - a.revenue);

    // 添加排名
    return rankings.slice(0, limit).map((r, index) => ({
      ...r,
      rank: index + 1,
    }));
  }

  /**
   * 获取绩效统计概览
   */
  async getStats(department?: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const userWhere: any = { isActive: true };
    if (department) userWhere.department = department;

    const users = await this.prisma.user.findMany({
      where: userWhere,
      select: { id: true },
    });

    const userIds = users.map(u => u.id);

    // 获取本月绩效汇总
    const performances = await this.prisma.salesPerformance.findMany({
      where: {
        userId: { in: userIds },
        date: { gte: startOfMonth, lte: now },
      },
    });

    const totalRevenue = performances.reduce((sum, p) => sum + Number(p.revenue), 0);
    const totalDeals = performances.reduce((sum, p) => sum + p.closedDeals, 0);
    const totalCalls = performances.reduce((sum, p) => sum + p.calls, 0);
    const totalMeetings = performances.reduce((sum, p) => sum + p.meetings, 0);

    // 目标达成统计
    const targetRevenue = userIds.length * 100000; // 假设每人目标10万
    const achievementRate = targetRevenue > 0 ? (totalRevenue / targetRevenue) * 100 : 0;

    return {
      totalRevenue,
      totalDeals,
      totalCalls,
      totalMeetings,
      activeUsers: userIds.length,
      targetRevenue,
      achievementRate: Math.round(achievementRate * 100) / 100,
      avgRevenuePerUser: userIds.length > 0 ? totalRevenue / userIds.length : 0,
      avgDealsPerUser: userIds.length > 0 ? totalDeals / userIds.length : 0,
    };
  }

  // ==================== 辅助方法 ====================

  private calculateChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }

  private calculateChangePercent(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }

  private calculateMovingAverage(data: number[], window: number): number[] {
    const result: number[] = [];
    for (let i = 0; i < data.length; i++) {
      const start = Math.max(0, i - window + 1);
      const windowData = data.slice(start, i + 1);
      const avg = windowData.reduce((a, b) => a + b, 0) / windowData.length;
      result.push(Math.round(avg));
    }
    return result;
  }
}

export default new PerformanceService();