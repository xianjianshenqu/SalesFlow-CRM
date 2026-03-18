import { PrismaClient, TaskType, TaskPriority, TaskStatus, ProposalStatus } from '@prisma/client';
import prisma from '../repositories/prisma';
import { CreateScheduleInput, UpdateScheduleInput, UpdateStatusInput, ScheduleQueryInput } from '../validators/schedule.validator';

// ==================== AI建议相关类型定义 ====================

/**
 * 客户评分结果
 */
interface CustomerScore {
  totalScore: number;
  urgencyLevel: 'critical' | 'high' | 'medium' | 'low';
  reasons: string[];
}

/**
 * 沟通模式分析结果
 */
interface CommunicationPattern {
  customerId: string;
  contactCount: number;
  avgDaysBetweenContacts: number;
  lastContactDate: Date | null;
  sentiment: 'positive' | 'neutral' | 'negative';
}

/**
 * AI建议项
 */
interface AISuggestion {
  type: 'urgent' | 'follow_up' | 'reminder' | 'optimization';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  actionRequired: string;
  suggestedActions?: Array<{
    action: string;
    customerId?: string;
    customerName?: string;
    contactName?: string;
    contactRole?: string;
    reason?: string;
    urgencyLevel?: string;
    dueDate?: Date;
    time?: string;
  }>;
  impactScore?: number;
  category?: 'overdue' | 'high_value' | 'neglected' | 'optimization' | 'daily' | 'proposal' | 'location' | 'contact';
  relatedCustomerId?: string;
  relatedCustomerName?: string;
}

/**
 * 日程任务服务 - 处理日程任务相关的业务逻辑
 */
class ScheduleService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  /**
   * 创建日程任务
   */
  async create(data: CreateScheduleInput, userId: string) {
    return this.prisma.scheduleTask.create({
      data: {
        ...data,
        type: data.type as TaskType,
        priority: data.priority as TaskPriority,
        dueDate: new Date(data.dueDate),
        assigneeId: userId,
        createdById: userId,
      },
      include: {
        customer: {
          select: { id: true, name: true, company: true },
        },
        assignee: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  /**
   * 获取日程列表（分页、筛选）
   */
  async getAll(query: ScheduleQueryInput) {
    const { page, limit, customerId, type, status, priority, startDate, endDate, search, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (customerId) {
      where.customerId = customerId;
    }

    if (type) {
      where.type = type as TaskType;
    }

    if (status) {
      where.status = status as TaskStatus;
    }

    if (priority) {
      where.priority = priority as TaskPriority;
    }

    if (startDate || endDate) {
      where.dueDate = {};
      if (startDate) where.dueDate.gte = new Date(startDate);
      if (endDate) where.dueDate.lte = new Date(endDate);
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const [total, tasks] = await Promise.all([
      this.prisma.scheduleTask.count({ where }),
      this.prisma.scheduleTask.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          customer: {
            select: { id: true, name: true, company: true },
          },
          assignee: {
            select: { id: true, name: true },
          },
        },
      }),
    ]);

    return {
      data: tasks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * 获取日程详情
   */
  async getById(id: string) {
    return this.prisma.scheduleTask.findUnique({
      where: { id },
      include: {
        customer: {
          select: { id: true, name: true, company: true, phone: true, email: true },
        },
        assignee: {
          select: { id: true, name: true, email: true },
        },
        createdBy: {
          select: { id: true, name: true },
        },
      },
    });
  }

  /**
   * 更新日程
   */
  async update(id: string, data: UpdateScheduleInput) {
    const updateData: any = { ...data };

    if (data.type) updateData.type = data.type as TaskType;
    if (data.priority) updateData.priority = data.priority as TaskPriority;
    if (data.status) updateData.status = data.status as TaskStatus;
    if (data.dueDate) updateData.dueDate = new Date(data.dueDate);

    return this.prisma.scheduleTask.update({
      where: { id },
      data: updateData,
      include: {
        customer: {
          select: { id: true, name: true, company: true },
        },
        assignee: {
          select: { id: true, name: true },
        },
      },
    });
  }

  /**
   * 更新任务状态
   */
  async updateStatus(id: string, data: UpdateStatusInput) {
    return this.prisma.scheduleTask.update({
      where: { id },
      data: {
        status: data.status as TaskStatus,
        notes: data.notes,
      },
      include: {
        customer: {
          select: { id: true, name: true, company: true },
        },
      },
    });
  }

  /**
   * 删除日程
   */
  async delete(id: string) {
    return this.prisma.scheduleTask.delete({
      where: { id },
    });
  }

  /**
   * 获取今日日程
   */
  async getToday(userId: string) {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    return this.prisma.scheduleTask.findMany({
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
  }

  /**
   * 获取日程统计
   */
  async getStats(userId?: string) {
    const where: any = {};
    if (userId) {
      where.assigneeId = userId;
    }

    const [totalCount, statusCounts, priorityCounts, todayCount, overdueCount] = await Promise.all([
      this.prisma.scheduleTask.count({ where }),
      this.prisma.scheduleTask.groupBy({
        by: ['status'],
        where,
        _count: true,
      }),
      this.prisma.scheduleTask.groupBy({
        by: ['priority'],
        where,
        _count: true,
      }),
      this.getTodayCount(userId),
      this.getOverdueCount(userId),
    ]);

    const statusDistribution: Record<string, number> = {
      pending: 0,
      in_progress: 0,
      completed: 0,
      cancelled: 0,
    };

    statusCounts.forEach(item => {
      statusDistribution[item.status] = item._count;
    });

    const priorityDistribution: Record<string, number> = {
      high: 0,
      medium: 0,
      low: 0,
    };

    priorityCounts.forEach(item => {
      priorityDistribution[item.priority] = item._count;
    });

    return {
      total: totalCount,
      today: todayCount,
      overdue: overdueCount,
      statusDistribution,
      priorityDistribution,
    };
  }

  /**
   * 获取今日任务数量
   */
  private async getTodayCount(userId?: string) {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const where: any = {
      dueDate: { gte: startOfDay, lte: endOfDay },
      status: { not: 'cancelled' },
    };

    if (userId) {
      where.assigneeId = userId;
    }

    return this.prisma.scheduleTask.count({ where });
  }

  /**
   * 获取逾期任务数量
   */
  private async getOverdueCount(userId?: string) {
    const now = new Date();

    const where: any = {
      dueDate: { lt: now },
      status: { in: ['pending', 'in_progress'] },
    };

    if (userId) {
      where.assigneeId = userId;
    }

    return this.prisma.scheduleTask.count({ where });
  }

  /**
   * AI智能建议 - 基于多维度分析生成个性化日程建议
   * 
   * 分析维度:
   * 1. 客户紧急程度 - 基于客户等级、项目阶段、合同状态
   * 2. 历史沟通频率 - 最近联系时间、沟通间隔、互动模式
   * 3. 客户地理位置 - 距离、区域优先级、拜访路径优化
   */
  async getAISuggestions(userId: string) {
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const endOfDay = new Date(now.setHours(23, 59, 59, 999));
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // 获取综合数据
    const [
      pendingTasks,
      overdueTasks,
      todayTasks,
      ownedCustomers,
      recentRecordings,
      upcomingProposals,
      contacts
    ] = await Promise.all([
      // 待处理任务
      this.prisma.scheduleTask.findMany({
        where: { assigneeId: userId, status: 'pending' },
        take: 10,
        orderBy: { dueDate: 'asc' },
        include: { 
          customer: { 
            select: { id: true, name: true, priority: true, stage: true, city: true, lat: true, lng: true } 
          } 
        },
      }),
      // 逾期任务
      this.prisma.scheduleTask.findMany({
        where: {
          assigneeId: userId,
          dueDate: { lt: new Date() },
          status: { in: ['pending', 'in_progress'] },
        },
        take: 10,
        orderBy: { dueDate: 'asc' },
        include: { 
          customer: { 
            select: { id: true, name: true, priority: true, stage: true } 
          } 
        },
      }),
      // 今日任务
      this.getToday(userId),
      // 用户负责的客户
      this.prisma.customer.findMany({
        where: { ownerId: userId },
        orderBy: [
          { priority: 'desc' },
          { updatedAt: 'desc' }
        ],
        select: { 
          id: true, 
          name: true, 
          stage: true, 
          priority: true,
          lastContactDate: true,
          estimatedValue: true,
          city: true,
          province: true,
          lat: true,
          lng: true,
          riskScore: true,
          engagementScore: true,
          updatedAt: true
        },
      }),
      // 最近录音/沟通记录
      this.prisma.audioRecording.findMany({
        where: { createdById: userId, recordedAt: { gte: thirtyDaysAgo } },
        orderBy: { recordedAt: 'desc' },
        take: 20,
        select: {
          id: true,
          customerId: true,
          recordedAt: true,
          sentiment: true,
          summary: true,
          customer: { select: { id: true, name: true } }
        }
      }),
      // 进行中的商机/方案
      this.prisma.proposal.findMany({
        where: { 
          ownerId: userId,
          status: { in: ['requirement_analysis', 'designing', 'pending_review', 'customer_proposal', 'negotiation'] as ProposalStatus[] }
        },
        orderBy: { updatedAt: 'desc' },
        take: 10,
        select: {
          id: true,
          title: true,
          status: true,
          value: true,
          validUntil: true,
          customerId: true,
          customer: { select: { id: true, name: true, priority: true } }
        }
      }),
      // 关键联系人
      this.prisma.contact.findMany({
        where: { 
          customer: { ownerId: userId },
          role: { in: ['decision_maker', 'key_influencer'] }
        },
        orderBy: { lastContact: 'desc' },
        take: 15,
        select: {
          id: true,
          name: true,
          role: true,
          lastContact: true,
          customerId: true,
          customer: { select: { id: true, name: true, priority: true } }
        }
      })
    ]);

    const suggestions: AISuggestion[] = [];
    const customerScores: Map<string, CustomerScore> = new Map();

    // ==================== 1. 客户紧急程度分析 ====================
    for (const customer of ownedCustomers) {
      const score = this.calculateCustomerUrgencyScore(customer, now);
      customerScores.set(customer.id, score);
    }

    // ==================== 2. 沟通频率分析 ====================
    const communicationPatterns = this.analyzeCommunicationPatterns(
      recentRecordings,
      contacts,
      thirtyDaysAgo
    );

    // ==================== 3. 逾期任务处理建议 ====================
    if (overdueTasks.length > 0) {
      const highPriorityOverdue = overdueTasks.filter(t => 
        t.customer?.priority === 'high' || customerScores.get(t.customerId || '')?.urgencyLevel === 'critical'
      );
      
      if (highPriorityOverdue.length > 0) {
        suggestions.push({
          type: 'urgent',
          priority: 'high',
          title: `⚠️ ${highPriorityOverdue.length} 个高优先级任务已逾期`,
          description: `涉及客户: ${highPriorityOverdue.slice(0, 3).map(t => t.customer?.name || '未知').join('、')}`,
          actionRequired: '立即处理或重新安排',
          suggestedActions: highPriorityOverdue.slice(0, 3).map(t => ({
            action: t.title,
            customerId: t.customerId,
            customerName: t.customer?.name,
            dueDate: t.dueDate
          })),
          impactScore: 95,
          category: 'overdue'
        });
      }

      const normalOverdue = overdueTasks.filter(t => 
        t.customer?.priority !== 'high' && customerScores.get(t.customerId || '')?.urgencyLevel !== 'critical'
      );
      
      if (normalOverdue.length > 0) {
        suggestions.push({
          type: 'urgent',
          priority: 'medium',
          title: `📋 ${normalOverdue.length} 个任务已逾期`,
          description: '建议尽快处理，避免影响客户关系',
          actionRequired: '查看并重新安排',
          suggestedActions: normalOverdue.slice(0, 3).map(t => ({
            action: t.title,
            customerId: t.customerId,
            customerName: t.customer?.name
          })),
          impactScore: 70,
          category: 'overdue'
        });
      }
    }

    // ==================== 4. 高价值客户跟进建议 ====================
    const highValueCustomers = ownedCustomers
      .filter(c => {
        const score = customerScores.get(c.id);
        return score && (score.urgencyLevel === 'critical' || score.urgencyLevel === 'high');
      })
      .sort((a, b) => {
        const scoreA = customerScores.get(a.id)?.totalScore || 0;
        const scoreB = customerScores.get(b.id)?.totalScore || 0;
        return scoreB - scoreA;
      });

    if (highValueCustomers.length > 0) {
      const topCustomers = highValueCustomers.slice(0, 5);
      suggestions.push({
        type: 'follow_up',
        priority: 'high',
        title: `🎯 重点客户跟进建议`,
        description: `基于客户等级、项目阶段和历史互动分析，建议优先跟进以下客户`,
        actionRequired: '安排本周跟进计划',
        suggestedActions: topCustomers.map(c => {
          const score = customerScores.get(c.id)!;
          const lastContact = c.lastContactDate 
            ? Math.floor((Date.now() - new Date(c.lastContactDate).getTime()) / (1000 * 60 * 60 * 24))
            : null;
          return {
            customerId: c.id,
            customerName: c.name,
            action: this.generateFollowUpAction(c.stage, lastContact),
            reason: score.reasons.join('、'),
            urgencyLevel: score.urgencyLevel
          };
        }),
        impactScore: 90,
        category: 'high_value'
      });
    }

    // ==================== 5. 长期未联系客户提醒 ====================
    const neglectedCustomers = ownedCustomers.filter(c => {
      if (!c.lastContactDate) return true;
      const daysSinceContact = Math.floor(
        (Date.now() - new Date(c.lastContactDate).getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysSinceContact > 14 && c.stage !== 'won' && c.stage !== 'lost';
    });

    if (neglectedCustomers.length > 0) {
      const prioritizedNeglected = neglectedCustomers
        .sort((a, b) => {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) - 
                 (priorityOrder[a.priority as keyof typeof priorityOrder] || 0);
        })
        .slice(0, 5);

      suggestions.push({
        type: 'reminder',
        priority: 'medium',
        title: `📞 ${neglectedCustomers.length} 位客户超过14天未联系`,
        description: '长期不联系可能导致客户流失风险',
        actionRequired: '安排电话或拜访跟进',
        suggestedActions: prioritizedNeglected.map(c => {
          const days = c.lastContactDate 
            ? Math.floor((Date.now() - new Date(c.lastContactDate).getTime()) / (1000 * 60 * 60 * 24))
            : '从未';
          return {
            customerId: c.id,
            customerName: c.name,
            action: `${days}天未联系，建议电话跟进`,
            reason: c.priority === 'high' ? '高优先级客户' : undefined
          };
        }),
        impactScore: 65,
        category: 'neglected'
      });
    }

    // ==================== 6. 今日任务优化建议 ====================
    if (todayTasks.length > 0) {
      // 分析今日任务的时间分布和优先级
      const taskAnalysis = this.analyzeTodayTasks(todayTasks, customerScores);
      
      if (taskAnalysis.optimizationTips.length > 0) {
        suggestions.push({
          type: 'optimization',
          priority: 'medium',
          title: `📅 今日日程优化建议`,
          description: `今日共 ${todayTasks.length} 个任务，AI分析后提供以下优化建议`,
          actionRequired: '优化日程安排',
          suggestedActions: taskAnalysis.optimizationTips,
          impactScore: 60,
          category: 'optimization'
        });
      }

      suggestions.push({
        type: 'reminder',
        priority: 'low',
        title: `今日待办: ${todayTasks.length} 项任务`,
        description: `高优先级 ${taskAnalysis.highPriorityCount} 项，已优化 ${taskAnalysis.aiOptimizedCount} 项`,
        actionRequired: '查看详情',
        suggestedActions: todayTasks.slice(0, 5).map(t => ({
          action: t.title,
          customerId: t.customerId,
          customerName: t.customer?.name,
          time: t.dueDate ? new Date(t.dueDate).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) : undefined
        })),
        impactScore: 40,
        category: 'daily'
      });
    }

    // ==================== 7. 商机推进建议 ====================
    const activeProposals = upcomingProposals.filter(p => 
      p.status === 'negotiation' as ProposalStatus || p.status === 'customer_proposal' as ProposalStatus
    );

    if (activeProposals.length > 0) {
      const criticalProposals = activeProposals.filter(p => {
        if (!p.validUntil) return false;
        const daysUntilExpiry = Math.floor(
          (new Date(p.validUntil).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );
        return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
      });

      if (criticalProposals.length > 0) {
        suggestions.push({
          type: 'urgent',
          priority: 'high',
          title: `⏰ ${criticalProposals.length} 个方案即将过期`,
          description: '请尽快跟进商务谈判进度',
          actionRequired: '联系客户确认',
          suggestedActions: criticalProposals.map(p => ({
            customerId: p.customerId,
            customerName: p.customer?.name!, // 修复类型错误
            action: `${p.title} - 有效期至 ${new Date(p.validUntil!).toLocaleDateString()}`,
            reason: `金额: ¥${Number(p.value).toLocaleString()}`
          })),
          impactScore: 85,
          category: 'proposal'
        });
      }
    }

    // ==================== 8. 地理位置优化建议 ====================
    const customersWithLocation = ownedCustomers.filter(c => c.lat && c.lng);
    if (customersWithLocation.length >= 2) {
      const locationOptimization = this.analyzeLocationOptimization(customersWithLocation, customerScores);
      if (locationOptimization) {
        suggestions.push(locationOptimization);
      }
    }

    // ==================== 9. 联系人关系维护建议 ====================
    const keyContactsNeedingAttention = contacts.filter(c => {
      if (!c.lastContact) return true;
      const daysSinceContact = Math.floor(
        (Date.now() - new Date(c.lastContact).getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysSinceContact > 21; // 决策人/关键人超过3周未联系
    });

    if (keyContactsNeedingAttention.length > 0) {
      suggestions.push({
        type: 'follow_up',
        priority: 'medium',
        title: `👥 ${keyContactsNeedingAttention.length} 位关键联系人需维护`,
        description: '决策人和关键影响者的关系维护至关重要',
        actionRequired: '安排关系维护活动',
        suggestedActions: keyContactsNeedingAttention.slice(0, 4).map(c => ({
          customerId: c.customerId,
          customerName: c.customer?.name,
          contactName: c.name,
          contactRole: c.role === 'decision_maker' ? '决策人' : '关键影响者',
          action: `联系 ${c.name} (${c.role === 'decision_maker' ? '决策人' : '关键影响者'})`
        })),
        impactScore: 55,
        category: 'contact'
      });
    }

    // 按影响分数排序
    suggestions.sort((a, b) => (b.impactScore || 0) - (a.impactScore || 0));

    // 生成摘要统计
    const summary = {
      totalSuggestions: suggestions.length,
      urgentCount: suggestions.filter(s => s.priority === 'high').length,
      highPriorityCustomers: highValueCustomers.length,
      overdueTasks: overdueTasks.length,
      todayTasks: todayTasks.length,
      neglectedCustomers: neglectedCustomers.length,
      overallHealthScore: this.calculateOverallHealthScore(suggestions, ownedCustomers.length),
      recommendedActionsToday: suggestions.slice(0, 3).map(s => s.title)
    };

    return {
      suggestions,
      summary,
      generatedAt: new Date().toISOString(),
      nextUpdateAt: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30分钟后更新
    };
  }

  /**
   * 计算客户紧急程度评分
   */
  private calculateCustomerUrgencyScore(customer: any, now: Date): CustomerScore {
    let totalScore = 0;
    const reasons: string[] = [];
    let urgencyLevel: 'critical' | 'high' | 'medium' | 'low' = 'low';

    // 1. 客户优先级权重 (0-30分)
    const priorityScore = {
      high: 30,
      medium: 15,
      low: 5
    };
    const pScore = priorityScore[customer.priority as keyof typeof priorityScore] || 5;
    totalScore += pScore;
    if (customer.priority === 'high') {
      reasons.push('高优先级客户');
    }

    // 2. 项目阶段权重 (0-25分)
    const stageScore: Record<string, number> = {
      'negotiation': 25,
      'proposal': 20,
      'qualified': 15,
      'contacted': 10,
      'new': 8,
      'won': 5,
      'lost': 0
    };
    const sScore = stageScore[customer.stage] || 5;
    totalScore += sScore;
    if (customer.stage === 'negotiation') {
      reasons.push('处于商务谈判阶段');
    } else if (customer.stage === 'proposal') {
      reasons.push('已提交方案');
    }

    // 3. 最近联系时间权重 (0-25分)
    if (customer.lastContactDate) {
      const daysSinceContact = Math.floor(
        (now.getTime() - new Date(customer.lastContactDate).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSinceContact > 14) {
        totalScore += 25;
        reasons.push(`超过${daysSinceContact}天未联系`);
      } else if (daysSinceContact > 7) {
        totalScore += 15;
        reasons.push(`${daysSinceContact}天未联系`);
      } else {
        totalScore += 5;
      }
    } else {
      totalScore += 20;
      reasons.push('从未联系过');
    }

    // 4. 预估价值权重 (0-20分)
    if (customer.estimatedValue) {
      const value = Number(customer.estimatedValue);
      if (value >= 100000) {
        totalScore += 20;
        reasons.push(`高价值客户 (¥${(value / 10000).toFixed(0)}万)`);
      } else if (value >= 50000) {
        totalScore += 15;
      } else if (value >= 10000) {
        totalScore += 10;
      } else {
        totalScore += 5;
      }
    }

    // 5. 风险评分权重 (0-20分附加)
    if (customer.riskScore && customer.riskScore > 70) {
      totalScore += 20;
      reasons.push(`流失风险高 (${customer.riskScore}分)`);
    } else if (customer.riskScore && customer.riskScore > 50) {
      totalScore += 10;
    }

    // 确定紧急程度等级
    if (totalScore >= 70) {
      urgencyLevel = 'critical';
    } else if (totalScore >= 50) {
      urgencyLevel = 'high';
    } else if (totalScore >= 30) {
      urgencyLevel = 'medium';
    }

    return { totalScore, urgencyLevel, reasons };
  }

  /**
   * 分析沟通模式
   */
  private analyzeCommunicationPatterns(
    recordings: any[],
    contacts: any[],
    since: Date
  ): CommunicationPattern[] {
    const patterns: CommunicationPattern[] = [];
    const customerContactCount = new Map<string, number>();

    // 统计每个客户的沟通次数
    for (const recording of recordings) {
      const count = customerContactCount.get(recording.customerId) || 0;
      customerContactCount.set(recording.customerId, count + 1);
    }

    // 分析沟通频率
    for (const [customerId, count] of customerContactCount) {
      const customerRecordings = recordings.filter(r => r.customerId === customerId);
      const avgDaysBetweenContacts = this.calculateAvgDaysBetweenContacts(customerRecordings);
      
      patterns.push({
        customerId,
        contactCount: count,
        avgDaysBetweenContacts,
        lastContactDate: customerRecordings[0]?.recordedAt,
        sentiment: this.calculateAverageSentiment(customerRecordings)
      });
    }

    return patterns;
  }

  /**
   * 计算平均沟通间隔
   */
  private calculateAvgDaysBetweenContacts(recordings: any[]): number {
    if (recordings.length < 2) return 0;
    
    const sortedDates = recordings
      .map(r => new Date(r.recordedAt).getTime())
      .sort((a, b) => b - a);
    
    let totalDays = 0;
    for (let i = 0; i < sortedDates.length - 1; i++) {
      totalDays += (sortedDates[i] - sortedDates[i + 1]) / (1000 * 60 * 60 * 24);
    }
    
    return Math.round(totalDays / (sortedDates.length - 1));
  }

  /**
   * 计算平均情感倾向
   */
  private calculateAverageSentiment(recordings: any[]): 'positive' | 'neutral' | 'negative' {
    const sentimentScores = recordings
      .filter(r => r.sentiment)
      .map(r => {
        switch (r.sentiment) {
          case 'positive': return 1;
          case 'neutral': return 0;
          case 'negative': return -1;
          default: return 0;
        }
      });
    
    if (sentimentScores.length === 0) return 'neutral';
    
    const avg = sentimentScores.reduce((a, b) => a + b, 0) / sentimentScores.length;
    if (avg > 0.3) return 'positive';
    if (avg < -0.3) return 'negative';
    return 'neutral';
  }

  /**
   * 分析今日任务
   */
  private analyzeTodayTasks(tasks: any[], customerScores: Map<string, CustomerScore>): {
    highPriorityCount: number;
    aiOptimizedCount: number;
    optimizationTips: any[];
  } {
    let highPriorityCount = 0;
    const optimizationTips: any[] = [];

    // 统计高优先级任务
    for (const task of tasks) {
      const score = customerScores.get(task.customerId);
      if (task.priority === 'high' || score?.urgencyLevel === 'critical') {
        highPriorityCount++;
      }
    }

    // 生成优化建议
    const callTasks = tasks.filter(t => t.type === 'call');
    const visitTasks = tasks.filter(t => t.type === 'visit' || t.type === 'meeting');

    if (callTasks.length >= 3) {
      optimizationTips.push({
        action: `建议将 ${callTasks.length} 个电话集中在上午10-11点或下午3-4点拨打`,
        reason: '历史数据显示此时段接通率最高'
      });
    }

    if (visitTasks.length >= 2) {
      optimizationTips.push({
        action: '建议按地理位置优化拜访路线',
        reason: '可节省路程时间约30%'
      });
    }

    return {
      highPriorityCount,
      aiOptimizedCount: optimizationTips.length,
      optimizationTips
    };
  }

  /**
   * 分析地理位置优化
   */
  private analyzeLocationOptimization(
    customers: any[],
    customerScores: Map<string, CustomerScore>
  ): AISuggestion | null {
    // 按紧急程度和位置分组
    const highUrgencyCustomers = customers.filter(c => {
      const score = customerScores.get(c.id);
      return score && (score.urgencyLevel === 'critical' || score.urgencyLevel === 'high');
    });

    if (highUrgencyCustomers.length < 2) return null;

    // 检查是否有同城市/区域的客户可以合并拜访
    const cityGroups = new Map<string, any[]>();
    for (const customer of highUrgencyCustomers) {
      const city = customer.city || '未知';
      const group = cityGroups.get(city) || [];
      group.push(customer);
      cityGroups.set(city, group);
    }

    const citiesWithMultipleCustomers = Array.from(cityGroups.entries())
      .filter(([_, customers]) => customers.length >= 2);

    if (citiesWithMultipleCustomers.length > 0) {
      const [city, cityCustomers] = citiesWithMultipleCustomers[0];
      return {
        type: 'optimization',
        priority: 'medium',
        title: `📍 ${city} 区域有 ${cityCustomers.length} 个重点客户`,
        description: '建议安排同一天拜访，优化路线效率',
        actionRequired: '规划区域拜访行程',
        suggestedActions: cityCustomers.slice(0, 4).map(c => ({
          customerId: c.id,
          customerName: c.name,
          action: `拜访 ${c.name}`,
          reason: customerScores.get(c.id)?.reasons[0]
        })),
        impactScore: 50,
        category: 'location'
      };
    }

    return null;
  }

  /**
   * 生成跟进动作建议
   */
  private generateFollowUpAction(stage: string, daysSinceContact: number | null): string {
    if (daysSinceContact === null) {
      return '建立首次联系';
    }

    if (stage === 'negotiation') {
      return '推进商务谈判进度';
    }

    if (stage === 'proposal') {
      return '确认方案反馈，推进决策';
    }

    if (daysSinceContact > 14) {
      return '紧急安排拜访或电话';
    }

    if (daysSinceContact > 7) {
      return '安排跟进电话';
    }

    return '保持联系频率';
  }

  /**
   * 计算整体健康分数
   */
  private calculateOverallHealthScore(suggestions: AISuggestion[], totalCustomers: number): number {
    let baseScore = 100;

    // 逾期任务扣分
    const overdueCount = suggestions.filter(s => s.category === 'overdue').length;
    baseScore -= overdueCount * 10;

    // 高优先级建议扣分
    const highPriorityCount = suggestions.filter(s => s.priority === 'high').length;
    baseScore -= highPriorityCount * 5;

    // 忽略客户扣分
    const neglectedCount = suggestions.filter(s => s.category === 'neglected').length;
    baseScore -= neglectedCount * 3;

    // 确保分数在0-100之间
    return Math.max(0, Math.min(100, baseScore));
  }

  /**
   * 获取客户的日程列表
   */
  async getByCustomerId(customerId: string) {
    return this.prisma.scheduleTask.findMany({
      where: { customerId },
      orderBy: { dueDate: 'desc' },
      include: {
        assignee: {
          select: { id: true, name: true },
        },
      },
    });
  }
}

export default new ScheduleService();