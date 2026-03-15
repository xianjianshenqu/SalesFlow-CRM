import { PrismaClient, ServiceStatus } from '@prisma/client';
import prisma from '../repositories/prisma';
import { CreateServiceInput, UpdateServiceInput, UpdateProgressInput, CreateMilestoneInput, UpdateMilestoneInput, ServiceQueryInput } from '../validators/service.validator';

/**
 * 售后服务服务 - 处理售后服务项目相关的业务逻辑
 */
class ServiceService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  /**
   * 创建服务项目
   */
  async create(data: CreateServiceInput, userId: string) {
    return this.prisma.serviceProject.create({
      data: {
        customerId: data.customerId,
        name: data.name,
        description: data.description,
        type: data.type,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        budget: data.budget,
        milestones: data.milestones || [],
        status: 'pending',
        progress: 0,
        createdById: userId,
      },
      include: {
        customer: {
          select: { id: true, name: true, company: true },
        },
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  /**
   * 获取服务项目列表
   */
  async getAll(query: ServiceQueryInput) {
    const { page, limit, customerId, status, type, search, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (customerId) {
      where.customerId = customerId;
    }

    if (status) {
      where.status = status as ServiceStatus;
    }

    if (type) {
      where.type = type;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const [total, services] = await Promise.all([
      this.prisma.serviceProject.count({ where }),
      this.prisma.serviceProject.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          customer: {
            select: { id: true, name: true, company: true },
          },
          createdBy: {
            select: { id: true, name: true },
          },
        },
      }),
    ]);

    return {
      data: services,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * 获取服务项目详情
   */
  async getById(id: string) {
    return this.prisma.serviceProject.findUnique({
      where: { id },
      include: {
        customer: {
          select: { id: true, name: true, company: true, phone: true, email: true },
        },
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  /**
   * 更新服务项目
   */
  async update(id: string, data: UpdateServiceInput) {
    const updateData: any = { ...data };

    if (data.status) {
      updateData.status = data.status as ServiceStatus;
    }

    if (data.startDate) {
      updateData.startDate = new Date(data.startDate);
    }

    if (data.endDate) {
      updateData.endDate = new Date(data.endDate);
    }

    return this.prisma.serviceProject.update({
      where: { id },
      data: updateData,
      include: {
        customer: {
          select: { id: true, name: true, company: true },
        },
      },
    });
  }

  /**
   * 更新项目进度
   */
  async updateProgress(id: string, data: UpdateProgressInput) {
    const updateData: any = {
      progress: data.progress,
    };

    // 如果进度达到100%，自动更新状态为已完成
    if (data.progress === 100) {
      updateData.status = 'completed';
      updateData.completedAt = new Date();
    } else if (data.progress > 0) {
      updateData.status = 'in_progress';
    }

    return this.prisma.serviceProject.update({
      where: { id },
      data: updateData,
      include: {
        customer: {
          select: { id: true, name: true, company: true },
        },
      },
    });
  }

  /**
   * 删除服务项目
   */
  async delete(id: string) {
    return this.prisma.serviceProject.delete({
      where: { id },
    });
  }

  /**
   * 添加里程碑
   */
  async addMilestone(id: string, data: CreateMilestoneInput) {
    const service = await this.getById(id);
    if (!service) {
      throw new Error('服务项目不存在');
    }

    const milestones = service.milestones as any[] || [];
    const newMilestone = {
      id: `ms-${Date.now()}`,
      name: data.name,
      description: data.description,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      status: 'pending' as const,
      createdAt: new Date(),
    };

    return this.prisma.serviceProject.update({
      where: { id },
      data: {
        milestones: [...milestones, newMilestone],
      },
      include: {
        customer: {
          select: { id: true, name: true, company: true },
        },
      },
    });
  }

  /**
   * 更新里程碑状态
   */
  async updateMilestone(id: string, milestoneId: string, data: UpdateMilestoneInput) {
    const service = await this.getById(id);
    if (!service) {
      throw new Error('服务项目不存在');
    }

    const milestones = service.milestones as any[] || [];
    const milestoneIndex = milestones.findIndex(m => m.id === milestoneId);

    if (milestoneIndex === -1) {
      throw new Error('里程碑不存在');
    }

    milestones[milestoneIndex] = {
      ...milestones[milestoneIndex],
      status: data.status,
      completedAt: data.status === 'completed' ? new Date() : null,
      notes: data.notes,
    };

    // 计算总体进度
    const completedCount = milestones.filter(m => m.status === 'completed').length;
    const progress = Math.round((completedCount / milestones.length) * 100);

    return this.prisma.serviceProject.update({
      where: { id },
      data: {
        milestones,
        progress,
        status: progress === 100 ? 'completed' as ServiceStatus : service.status as ServiceStatus,
      },
      include: {
        customer: {
          select: { id: true, name: true, company: true },
        },
      },
    });
  }

  /**
   * 获取服务统计
   */
  async getStats(customerId?: string) {
    const where: any = {};
    if (customerId) {
      where.customerId = customerId;
    }

    const [totalCount, statusCounts, avgProgress, totalBudget] = await Promise.all([
      this.prisma.serviceProject.count({ where }),
      this.prisma.serviceProject.groupBy({
        by: ['status'],
        where,
        _count: true,
      }),
      this.prisma.serviceProject.aggregate({
        where,
        _avg: { progress: true },
      }),
      this.prisma.serviceProject.aggregate({
        where,
        _sum: { budget: true },
      }),
    ]);

    const statusDistribution: Record<string, number> = {
      pending: 0,
      in_progress: 0,
      completed: 0,
      on_hold: 0,
      cancelled: 0,
    };

    statusCounts.forEach(item => {
      statusDistribution[item.status] = item._count;
    });

    return {
      total: totalCount,
      averageProgress: Math.round(Number(avgProgress._avg.progress) || 0),
      totalBudget: Number(totalBudget._sum.budget) || 0,
      statusDistribution,
    };
  }

  /**
   * 获取客户的服务项目列表
   */
  async getByCustomerId(customerId: string) {
    return this.prisma.serviceProject.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: {
          select: { id: true, name: true },
        },
      },
    });
  }
}

export default new ServiceService();