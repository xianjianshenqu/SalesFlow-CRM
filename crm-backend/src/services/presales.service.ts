import { PrismaClient, ResourceStatus, RequestStatus, RequestPriority } from '@prisma/client';
import prisma from '../repositories/prisma';
import { CreateResourceInput, UpdateResourceInput, ResourceQueryInput, CreateRequestInput, UpdateRequestInput, UpdateRequestStatusInput, RequestQueryInput } from '../validators/presales.validator';
import { resourceMatchingService } from './ai';
import { ResourceInfo } from './ai/types';

/**
 * 售前服务 - 处理售前资源和请求相关的业务逻辑
 */
class PresalesService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  // ==================== 资源管理 ====================

  /**
   * 创建售前资源
   */
  async createResource(data: CreateResourceInput) {
    return this.prisma.preSalesResource.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        skills: data.skills || [],
        experience: data.experience,
        certifications: data.certifications || [],
        status: 'available',
        availability: data.availability,
        location: data.location,
        notes: data.notes,
      },
    });
  }

  /**
   * 获取售前资源列表
   */
  async getResources(query: ResourceQueryInput) {
    const { page, limit, status, skill, search, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (status) {
      where.status = status as ResourceStatus;
    }

    if (skill) {
      where.skills = { has: skill };
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { skills: { hasSome: [search] } },
      ];
    }

    const [total, resources] = await Promise.all([
      this.prisma.preSalesResource.count({ where }),
      this.prisma.preSalesResource.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
    ]);

    return {
      data: resources,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * 获取售前资源详情
   */
  async getResourceById(id: string) {
    return this.prisma.preSalesResource.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            assignedRequests: true,
          },
        },
      },
    });
  }

  /**
   * 更新售前资源
   */
  async updateResource(id: string, data: UpdateResourceInput) {
    return this.prisma.preSalesResource.update({
      where: { id },
      data: {
        ...data,
        status: data.status as ResourceStatus | undefined,
      },
    });
  }

  /**
   * 删除售前资源
   */
  async deleteResource(id: string) {
    return this.prisma.preSalesResource.delete({
      where: { id },
    });
  }

  // ==================== 请求管理 ====================

  /**
   * 创建售前请求
   */
  async createRequest(data: CreateRequestInput, userId: string) {
    return this.prisma.preSalesRequest.create({
      data: {
        customerId: data.customerId,
        type: data.type,
        title: data.title,
        description: data.description,
        priority: data.priority as RequestPriority,
        requiredSkills: data.requiredSkills || [],
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        estimatedDuration: data.estimatedDuration,
        notes: data.notes,
        status: 'pending',
        createdById: userId,
      },
      include: {
        customer: {
          select: { id: true, name: true, company: true },
        },
      },
    });
  }

  /**
   * 获取售前请求列表
   */
  async getRequests(query: RequestQueryInput) {
    const { page, limit, customerId, status, priority, type, assignedResourceId, search, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (customerId) {
      where.customerId = customerId;
    }

    if (status) {
      where.status = status as RequestStatus;
    }

    if (priority) {
      where.priority = priority as RequestPriority;
    }

    if (type) {
      where.type = type;
    }

    if (assignedResourceId) {
      where.assignedResourceId = assignedResourceId;
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { type: { contains: search } },
      ];
    }

    const [total, requests] = await Promise.all([
      this.prisma.preSalesRequest.count({ where }),
      this.prisma.preSalesRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          customer: {
            select: { id: true, name: true, company: true },
          },
          assignedResource: {
            select: { id: true, name: true, email: true },
          },
          createdBy: {
            select: { id: true, name: true },
          },
        },
      }),
    ]);

    return {
      data: requests,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * 获取售前请求详情
   */
  async getRequestById(id: string) {
    return this.prisma.preSalesRequest.findUnique({
      where: { id },
      include: {
        customer: {
          select: { id: true, name: true, company: true, phone: true, email: true },
        },
        assignedResource: {
          select: { id: true, name: true, email: true, phone: true, skills: true },
        },
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  /**
   * 更新售前请求
   */
  async updateRequest(id: string, data: UpdateRequestInput) {
    const updateData: any = { ...data };

    if (data.dueDate) {
      updateData.dueDate = new Date(data.dueDate);
    }

    if (data.priority) {
      updateData.priority = data.priority as RequestPriority;
    }

    return this.prisma.preSalesRequest.update({
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
   * 更新请求状态
   */
  async updateRequestStatus(id: string, data: UpdateRequestStatusInput) {
    const updateData: any = {
      status: data.status as RequestStatus,
    };

    if (data.assignedResourceId) {
      updateData.assignedResourceId = data.assignedResourceId;
      updateData.assignedAt = new Date();
    }

    if (data.status === 'completed') {
      updateData.completedAt = new Date();
    }

    return this.prisma.preSalesRequest.update({
      where: { id },
      data: updateData,
      include: {
        customer: {
          select: { id: true, name: true, company: true },
        },
        assignedResource: {
          select: { id: true, name: true },
        },
      },
    });
  }

  /**
   * 删除售前请求
   */
  async deleteRequest(id: string) {
    return this.prisma.preSalesRequest.delete({
      where: { id },
    });
  }

  // ==================== 统计和匹配 ====================

  /**
   * 获取售前统计
   */
  async getStats() {
    const [resourceStats, requestStats] = await Promise.all([
      this.getResourceStats(),
      this.getRequestStats(),
    ]);

    return {
      resources: resourceStats,
      requests: requestStats,
    };
  }

  /**
   * 获取资源统计
   */
  private async getResourceStats() {
    const [total, statusCounts] = await Promise.all([
      this.prisma.preSalesResource.count(),
      this.prisma.preSalesResource.groupBy({
        by: ['status'],
        _count: true,
      }),
    ]);

    const statusDistribution: Record<string, number> = {
      available: 0,
      busy: 0,
      offline: 0,
    };

    statusCounts.forEach(item => {
      statusDistribution[item.status] = item._count;
    });

    return {
      total,
      statusDistribution,
    };
  }

  /**
   * 获取请求统计
   */
  private async getRequestStats() {
    const [total, statusCounts, priorityCounts] = await Promise.all([
      this.prisma.preSalesRequest.count(),
      this.prisma.preSalesRequest.groupBy({
        by: ['status'],
        _count: true,
      }),
      this.prisma.preSalesRequest.groupBy({
        by: ['priority'],
        _count: true,
      }),
    ]);

    const statusDistribution: Record<string, number> = {
      pending: 0,
      assigned: 0,
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
      total,
      statusDistribution,
      priorityDistribution,
    };
  }

  /**
   * 智能匹配资源
   * 根据请求所需技能匹配合适的资源
   */
  async matchResources(requestId: string) {
    const request = await this.getRequestById(requestId);
    if (!request) {
      throw new Error('请求不存在');
    }

    const requiredSkills = request.requiredSkills as string[] || [];

    // 查找所有可用资源
    const availableResources = await this.prisma.preSalesResource.findMany({
      where: {
        status: 'available',
      },
    });

    // 计算匹配分数
    const matchedResources = availableResources.map(resource => {
      const resourceSkills = resource.skills as string[] || [];
      const matchedSkills = requiredSkills.filter(skill => resourceSkills.includes(skill));
      const matchScore = requiredSkills.length > 0 
        ? (matchedSkills.length / requiredSkills.length) * 100 
        : 100;

      return {
        resource,
        matchScore: Math.round(matchScore),
        matchedSkills,
        missingSkills: requiredSkills.filter(skill => !resourceSkills.includes(skill)),
      };
    });

    // 按匹配分数排序
    return matchedResources.sort((a, b) => b.matchScore - a.matchScore);
  }

  // ==================== AI增强匹配功能 ====================

  /**
   * AI智能匹配资源
   * 使用多维度评分算法进行更精准的资源匹配
   */
  async smartMatchResources(requestId: string) {
    const request = await this.getRequestById(requestId);
    if (!request) {
      throw new Error('请求不存在');
    }

    // 获取所有资源并转换为匹配服务需要的格式
    const allResources = await this.prisma.preSalesResource.findMany();
    
    // 获取每个资源的工作负载
    const resourceWorkloads = await this.getResourceWorkloads();

    // 转换为ResourceInfo格式
    const resourcesInfo: ResourceInfo[] = allResources.map(resource => ({
      id: resource.id,
      name: resource.name,
      email: resource.email ?? undefined,
      phone: resource.phone ?? undefined,
      skills: (resource.skills as string[]) || [],
      experience: resource.experience ?? undefined,
      certifications: (resource.certifications as string[]) || [],
      status: resource.status as 'available' | 'busy' | 'offline',
      availability: resource.availability ?? undefined,
      location: resource.location ?? undefined,
      currentWorkload: resourceWorkloads[resource.id] || 0,
      completedRequests: 0,
      successRate: 0.85,
    }));

    // 调用AI匹配服务
    const matchResult = await resourceMatchingService.matchResources(
      {
        requestId: request.id,
        requestType: request.type,
        title: request.title,
        description: request.description ?? undefined,
        requiredSkills: (request.requiredSkills as string[]) || [],
        priority: request.priority as 'high' | 'medium' | 'low',
        dueDate: request.dueDate ?? undefined,
        estimatedDuration: request.estimatedDuration ?? undefined,
        location: undefined,
        customerId: request.customerId,
        customerIndustry: undefined,
      },
      resourcesInfo
    );

    // 保存匹配记录
    for (const matched of matchResult.matchedResources) {
      await (this.prisma as any).resourceMatchRecord?.create?.({
        data: {
          requestId,
          resourceId: matched.resource.id,
          matchScore: matched.matchScore,
          matchedSkills: matched.matchedSkills,
          missingSkills: matched.missingSkills,
          aiRecommendation: matchResult.bestMatch.resourceId === matched.resource.id,
          factors: matched.factors,
        },
      });
    }

    return matchResult;
  }

  /**
   * 自动分配资源
   * 基于AI匹配结果自动分配最优资源
   */
  async autoAssignResource(requestId: string) {
    // 获取智能匹配结果
    const matchResult = await this.smartMatchResources(requestId);

    if (matchResult.matchedResources.length === 0) {
      throw new Error('没有找到合适的资源');
    }

    // 生成分配建议
    const assignmentRecommendation = await resourceMatchingService.generateAssignmentRecommendation({
      requestId,
      matchedResources: matchResult.matchedResources,
      urgencyLevel: 'normal',
    });

    // 执行自动分配
    const bestResourceId = assignmentRecommendation.recommendedResourceId;

    // 更新请求状态
    const updatedRequest = await this.prisma.preSalesRequest.update({
      where: { id: requestId },
      data: {
        status: 'assigned',
        assignedResourceId: bestResourceId,
        assignedAt: new Date(),
      },
      include: {
        customer: {
          select: { id: true, name: true, company: true },
        },
        assignedResource: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return {
      request: updatedRequest,
      assignment: assignmentRecommendation,
      matchResult,
    };
  }

  /**
   * 获取资源工作负载
   */
  async getResourceWorkloads(): Promise<Record<string, number>> {
    const resources = await this.prisma.preSalesResource.findMany({
      include: {
        _count: {
          select: {
            assignedRequests: {
              where: {
                status: { in: ['assigned', 'in_progress'] },
              },
            },
          },
        },
      },
    });

    const workloads: Record<string, number> = {};
    resources.forEach(resource => {
      // 假设每个进行中的请求占30%负载
      workloads[resource.id] = Math.min(100, (resource._count?.assignedRequests || 0) * 30);
    });

    return workloads;
  }

  /**
   * 获取资源负载概览
   */
  async getResourcesWorkloadOverview() {
    const resources = await this.prisma.preSalesResource.findMany({
      include: {
        _count: {
          select: {
            assignedRequests: {
              where: {
                status: { in: ['assigned', 'in_progress'] },
              },
            },
          },
        },
      },
    });

    const workloads = await this.getResourceWorkloads();

    return resources.map(resource => ({
      id: resource.id,
      name: resource.name,
      email: resource.email,
      status: resource.status,
      skills: resource.skills,
      currentWorkload: workloads[resource.id] || 0,
      activeRequests: resource._count?.assignedRequests || 0,
      availability: workloads[resource.id] < 60 ? 'high' : workloads[resource.id] < 80 ? 'medium' : 'low',
    }));
  }

  /**
   * 优化资源分配
   * 当有多个待分配请求时进行全局优化
   */
  async optimizeResourceAllocation(requestIds: string[]) {
    // 获取所有待分配请求
    const requests = await this.prisma.preSalesRequest.findMany({
      where: {
        id: { in: requestIds },
        status: 'pending',
      },
    });

    if (requests.length === 0) {
      return [];
    }

    // 获取所有资源
    const allResources = await this.prisma.preSalesResource.findMany();
    const resourceWorkloads = await this.getResourceWorkloads();

    const resourcesInfo: ResourceInfo[] = allResources.map(resource => ({
      id: resource.id,
      name: resource.name,
      email: resource.email ?? undefined,
      phone: resource.phone ?? undefined,
      skills: (resource.skills as string[]) || [],
      experience: resource.experience ?? undefined,
      certifications: (resource.certifications as string[]) || [],
      status: resource.status as 'available' | 'busy' | 'offline',
      availability: resource.availability ?? undefined,
      location: resource.location ?? undefined,
      currentWorkload: resourceWorkloads[resource.id] || 0,
      completedRequests: 0,
      successRate: 0.85,
    }));

    // 调用优化服务
    const assignments = await resourceMatchingService.optimizeResourceAllocation(
      requests.map(r => ({
        id: r.id,
        input: {
          requestId: r.id,
          requestType: r.type,
          title: r.title,
          description: r.description ?? undefined,
          requiredSkills: (r.requiredSkills as string[]) || [],
          priority: r.priority as 'high' | 'medium' | 'low',
        },
        priority: r.priority as 'high' | 'medium' | 'low',
      })),
      resourcesInfo
    );

    // 应用分配结果
    const results = [];
    for (const assignment of assignments) {
      const updated = await this.prisma.preSalesRequest.update({
        where: { id: assignment.requestId },
        data: {
          status: 'assigned',
          assignedResourceId: assignment.assignedResourceId,
          assignedAt: new Date(),
        },
        include: {
          customer: {
            select: { id: true, name: true, company: true },
          },
          assignedResource: {
            select: { id: true, name: true, email: true },
          },
        },
      });
      results.push({
        request: updated,
        score: assignment.score,
        reasoning: assignment.reasoning,
      });
    }

    return results;
  }
}

export default new PresalesService();