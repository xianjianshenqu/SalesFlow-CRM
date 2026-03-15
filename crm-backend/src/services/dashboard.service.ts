import { PrismaClient } from '@prisma/client';
import prisma from '../repositories/prisma';

/**
 * 仪表盘服务 - 处理仪表盘统计相关的业务逻辑
 */
class DashboardService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  /**
   * 获取概览统计
   */
  async getOverview(userId?: string) {
    const customerWhere = userId ? { createdById: userId } : {};
    const opportunityWhere = userId ? { createdById: userId } : {};
    const paymentWhere: any = userId ? { customer: { createdById: userId } } : {};

    const [
      totalCustomers,
      totalOpportunities,
      totalPayments,
      customersByStage,
      opportunityStats,
      paymentStats,
    ] = await Promise.all([
      this.prisma.customer.count({ where: customerWhere }),
      this.prisma.opportunity.count({ where: opportunityWhere }),
      this.prisma.payment.count({ where: paymentWhere }),
      this.prisma.customer.groupBy({
        by: ['stage'],
        where: customerWhere,
        _count: true,
        _sum: { estimatedValue: true },
      }),
      this.prisma.opportunity.aggregate({
        where: opportunityWhere,
        _sum: { value: true },
        _count: true,
      }),
      this.prisma.payment.aggregate({
        where: paymentWhere,
        _sum: { paidAmount: true, totalAmount: true },
        _count: true,
      }),
    ]);

    // 新增客户数（本月）
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const newCustomersThisMonth = await this.prisma.customer.count({
      where: {
        ...customerWhere,
        createdAt: { gte: firstDayOfMonth },
      },
    });

    // 成交客户数
    const wonCustomers = await this.prisma.customer.count({
      where: { ...customerWhere, stage: 'won' },
    });

    // 进行中的机会
    const activeOpportunities = await this.prisma.opportunity.count({
      where: { ...opportunityWhere, status: 'active' },
    });

    return {
      customers: {
        total: totalCustomers,
        newThisMonth: newCustomersThisMonth,
        won: wonCustomers,
        byStage: customersByStage.map(s => ({
          stage: s.stage,
          count: s._count,
          value: Number(s._sum.estimatedValue) || 0,
        })),
      },
      opportunities: {
        total: totalOpportunities,
        active: activeOpportunities,
        totalValue: Number(opportunityStats._sum.value) || 0,
      },
      payments: {
        total: totalPayments,
        paidAmount: Number(paymentStats._sum.paidAmount) || 0,
        totalAmount: Number(paymentStats._sum.totalAmount) || 0,
        completionRate: paymentStats._sum.totalAmount 
          ? Math.round((Number(paymentStats._sum.paidAmount) / Number(paymentStats._sum.totalAmount)) * 100) 
          : 0,
      },
    };
  }

  /**
   * 获取漏斗概览
   */
  async getFunnelSummary(userId?: string) {
    const where = userId ? { createdById: userId } : {};

    // 按阶段统计客户
    const customersByStage = await this.prisma.customer.groupBy({
      by: ['stage'],
      where,
      _count: true,
      _sum: { estimatedValue: true },
    });

    // 定义漏斗阶段顺序
    const stageOrder = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won'];
    const stageNames: Record<string, string> = {
      new: '新客户',
      contacted: '已联系',
      qualified: '已验证',
      proposal: '方案阶段',
      negotiation: '谈判中',
      won: '已成交',
    };

    // 构建漏斗数据
    const funnel = stageOrder.map(stage => {
      const data = customersByStage.find(s => s.stage === stage);
      return {
        stage,
        name: stageNames[stage] || stage,
        count: data?._count || 0,
        value: Number(data?._sum.estimatedValue) || 0,
      };
    });

    // 计算转化率
    const totalInFirstStage = funnel[0]?.count || 0;
    const conversionRates = funnel.map((item, index) => ({
      ...item,
      conversionRate: totalInFirstStage > 0 
        ? Math.round((item.count / totalInFirstStage) * 100) 
        : 0,
      dropOffRate: index > 0 && funnel[index - 1].count > 0
        ? Math.round(((funnel[index - 1].count - item.count) / funnel[index - 1].count) * 100)
        : 0,
    }));

    return {
      funnel: conversionRates,
      summary: {
        totalCustomers: funnel.reduce((sum, item) => sum + item.count, 0),
        totalValue: funnel.reduce((sum, item) => sum + item.value, 0),
        wonCount: funnel.find(f => f.stage === 'won')?.count || 0,
        wonValue: funnel.find(f => f.stage === 'won')?.value || 0,
      },
    };
  }

  /**
   * 获取AI建议
   */
  async getAISuggestions(userId: string) {
    const suggestions: Array<{
      type: string;
      priority: string;
      title: string;
      description: string;
      action: string;
      relatedId?: string;
    }> = [];

    // 获取需要跟进的客户
    const needFollowUp = await this.prisma.customer.findMany({
      where: {
        createdById: userId,
        OR: [
          { lastContactDate: null },
          { lastContactDate: { lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
        ],
        stage: { not: 'won' },
      },
      take: 5,
      select: { id: true, name: true, lastContactDate: true },
    });

    if (needFollowUp.length > 0) {
      suggestions.push({
        type: 'follow_up',
        priority: 'high',
        title: `${needFollowUp.length} 位客户需要跟进`,
        description: '这些客户已经超过7天没有联系了，建议尽快安排沟通',
        action: '查看客户列表',
      });
    }

    // 获取逾期回款
    const overduePayments = await this.prisma.payment.findMany({
      where: {
        status: 'overdue',
        customer: { createdById: userId },
      },
      select: { id: true, totalAmount: true, dueDate: true, customer: { select: { name: true } } },
    });

    if (overduePayments.length > 0) {
      const totalOverdue = overduePayments.reduce((sum, p) => sum + Number(p.totalAmount), 0);
      suggestions.push({
        type: 'payment',
        priority: 'high',
        title: `${overduePayments.length} 笔回款已逾期`,
        description: `逾期金额总计 ¥${totalOverdue.toLocaleString()}，请尽快跟进`,
        action: '查看逾期回款',
      });
    }

    // 获取即将到期的机会
    const expiringOpportunities = await this.prisma.opportunity.findMany({
      where: {
        createdById: userId,
        status: 'active',
        expectedCloseDate: {
          gte: new Date(),
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      },
      select: { id: true, title: true, value: true },
    });

    if (expiringOpportunities.length > 0) {
      suggestions.push({
        type: 'opportunity',
        priority: 'medium',
        title: `${expiringOpportunities.length} 个机会即将到期`,
        description: '这些销售机会预计在本周内到期，请关注进展',
        action: '查看销售机会',
      });
    }

    // 获取待办任务
    const pendingTasks = await this.prisma.scheduleTask.count({
      where: {
        assigneeId: userId,
        status: { in: ['pending', 'in_progress'] },
        dueDate: { lte: new Date() },
      },
    });

    if (pendingTasks > 0) {
      suggestions.push({
        type: 'task',
        priority: 'medium',
        title: `${pendingTasks} 个待办任务需要处理`,
        description: '您有未完成的任务，建议尽快处理',
        action: '查看待办事项',
      });
    }

    // 销售业绩建议
    const wonValue = await this.prisma.customer.aggregate({
      where: { createdById: userId, stage: 'won' },
      _sum: { estimatedValue: true },
    });

    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const monthWonValue = await this.prisma.customer.aggregate({
      where: {
        createdById: userId,
        stage: 'won',
        updatedAt: { gte: monthStart },
      },
      _sum: { estimatedValue: true },
    });

    suggestions.push({
      type: 'performance',
      priority: 'low',
      title: '本月业绩概览',
      description: `本月成交金额 ¥${Number(monthWonValue._sum.estimatedValue || 0).toLocaleString()}，累计成交 ¥${Number(wonValue._sum.estimatedValue || 0).toLocaleString()}`,
      action: '查看业绩报告',
    });

    return { suggestions };
  }

  /**
   * 获取今日日程
   */
  async getTodaySchedule(userId: string) {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const tasks = await this.prisma.scheduleTask.findMany({
      where: {
        assigneeId: userId,
        dueDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: { not: 'cancelled' },
      },
      orderBy: { dueDate: 'asc' },
      include: {
        customer: {
          select: { id: true, name: true, company: true, phone: true },
        },
      },
    });

    return {
      date: today.toISOString().split('T')[0],
      total: tasks.length,
      completed: tasks.filter(t => t.status === 'completed').length,
      pending: tasks.filter(t => t.status === 'pending').length,
      inProgress: tasks.filter(t => t.status === 'in_progress').length,
      tasks,
    };
  }

  /**
   * 获取最近录音
   */
  async getRecentRecordings(userId?: string, limit: number = 5) {
    const where: any = {};
    if (userId) {
      where.createdById = userId;
    }

    const recordings = await this.prisma.audioRecording.findMany({
      where,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: {
          select: { id: true, name: true, company: true },
        },
        createdBy: {
          select: { id: true, name: true },
        },
      },
    });

    return recordings;
  }

  /**
   * 获取销售趋势
   */
  async getSalesTrend(userId?: string, months: number = 6) {
    const trends = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const startDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const endDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

      const customerWhere: any = {
        stage: 'won',
        updatedAt: { gte: startDate, lte: endDate },
      };
      if (userId) {
        customerWhere.createdById = userId;
      }

      const [wonCount, wonValue, newCustomers] = await Promise.all([
        this.prisma.customer.count({ where: customerWhere }),
        this.prisma.customer.aggregate({
          where: customerWhere,
          _sum: { estimatedValue: true },
        }),
        this.prisma.customer.count({
          where: {
            createdAt: { gte: startDate, lte: endDate },
            ...(userId ? { createdById: userId } : {}),
          },
        }),
      ]);

      trends.push({
        month: startDate.toISOString().slice(0, 7),
        label: `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}`,
        wonCount,
        wonValue: Number(wonValue._sum.estimatedValue) || 0,
        newCustomers,
      });
    }

    return trends;
  }

  /**
   * 获取完整仪表盘数据
   */
  async getFullDashboard(userId: string) {
    const [overview, funnel, suggestions, todaySchedule, recentRecordings, salesTrend] = await Promise.all([
      this.getOverview(userId),
      this.getFunnelSummary(userId),
      this.getAISuggestions(userId),
      this.getTodaySchedule(userId),
      this.getRecentRecordings(userId),
      this.getSalesTrend(userId),
    ]);

    return {
      overview,
      funnel,
      suggestions,
      todaySchedule,
      recentRecordings,
      salesTrend,
      lastUpdated: new Date(),
    };
  }
}

export default new DashboardService();