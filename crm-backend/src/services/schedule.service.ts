import { PrismaClient, TaskType, TaskPriority, TaskStatus } from '@prisma/client';
import prisma from '../repositories/prisma';
import { CreateScheduleInput, UpdateScheduleInput, UpdateStatusInput, ScheduleQueryInput } from '../validators/schedule.validator';

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
   * AI智能建议
   * 根据历史数据和当前情况提供智能建议
   */
  async getAISuggestions(userId: string) {
    // 获取用户相关的任务
    const [pendingTasks, overdueTasks, todayTasks, recentCustomers] = await Promise.all([
      this.prisma.scheduleTask.findMany({
        where: { assigneeId: userId, status: 'pending' },
        take: 5,
        orderBy: { dueDate: 'asc' },
        include: { customer: { select: { id: true, name: true } } },
      }),
      this.prisma.scheduleTask.findMany({
        where: {
          assigneeId: userId,
          dueDate: { lt: new Date() },
          status: { in: ['pending', 'in_progress'] },
        },
        take: 5,
        orderBy: { dueDate: 'asc' },
        include: { customer: { select: { id: true, name: true } } },
      }),
      this.getToday(userId),
      this.prisma.customer.findMany({
        where: { createdById: userId },
        take: 10,
        orderBy: { updatedAt: 'desc' },
        select: { id: true, name: true, stage: true, lastContactDate: true },
      }),
    ]);

    const suggestions: Array<{
      type: string;
      priority: string;
      title: string;
      description: string;
      actionRequired: string;
      relatedCustomerId?: string;
      relatedCustomerName?: string;
    }> = [];

    // 处理逾期任务建议
    if (overdueTasks.length > 0) {
      overdueTasks.forEach(task => {
        suggestions.push({
          type: 'urgent',
          priority: 'high',
          title: `逾期任务: ${task.title}`,
          description: `您有一个逾期任务需要处理，原定截止日期: ${task.dueDate.toLocaleDateString()}`,
          actionRequired: '请尽快处理或重新安排时间',
          relatedCustomerId: task.customerId || undefined,
          relatedCustomerName: task.customer?.name,
        });
      });
    }

    // 今日任务提醒
    if (todayTasks.length > 0) {
      suggestions.push({
        type: 'reminder',
        priority: 'medium',
        title: `今日有 ${todayTasks.length} 个待办事项`,
        description: '请合理安排时间完成今日任务',
        actionRequired: '查看今日日程',
      });
    }

    // 客户跟进建议
    const needFollowUp = recentCustomers.filter(c => {
      if (!c.lastContactDate) return true;
      const daysSinceContact = Math.floor(
        (new Date().getTime() - new Date(c.lastContactDate).getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysSinceContact > 7;
    });

    if (needFollowUp.length > 0) {
      suggestions.push({
        type: 'follow_up',
        priority: 'medium',
        title: `有 ${needFollowUp.length} 位客户需要跟进`,
        description: '这些客户已经超过7天没有联系了',
        actionRequired: '建议安排电话或拜访跟进',
      });
    }

    return {
      suggestions,
      summary: {
        totalSuggestions: suggestions.length,
        urgentCount: suggestions.filter(s => s.priority === 'high').length,
        pendingTasks: pendingTasks.length,
        overdueTasks: overdueTasks.length,
        todayTasks: todayTasks.length,
      },
    };
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