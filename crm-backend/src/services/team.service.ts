import { PrismaClient, TeamRole } from '@prisma/client';
import prisma from '../repositories/prisma';
import { CreateTeamMemberInput, UpdateTeamMemberInput, TeamMemberQueryInput, CreateTeamActivityInput, ActivityQueryInput } from '../validators/team.validator';
import { hashPassword } from '../utils/jwt';

/**
 * 团队服务 - 处理团队成员和活动相关的业务逻辑
 */
class TeamService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  /**
   * 创建团队成员
   */
  async createMember(data: CreateTeamMemberInput, _userId: string) {
    // 生成默认密码
    const defaultPassword = 'TempPassword123!';
    const hashedPassword = await hashPassword(defaultPassword);

    // 创建用户账号
    const user = await this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: data.role as any,
      },
    });

    // 创建团队成员记录
    return this.prisma.teamMember.create({
      data: {
        userId: user.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: data.role as TeamRole,
        avatar: data.avatar,
        department: data.department,
        position: data.position,
        targets: data.targets || {},
        skills: data.skills || [],
        bio: data.bio,
        revenue: 0,
        deals: 0,
        customers: 0,
      },
      include: {
        user: {
          select: { id: true, email: true, role: true },
        },
      },
    });
  }

  /**
   * 获取团队成员列表
   */
  async getMembers(query: TeamMemberQueryInput) {
    const { page, limit, role, department, search, isActive, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (role) {
      where.role = role as TeamRole;
    }

    if (department) {
      where.department = department;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { department: { contains: search } },
      ];
    }

    const [total, members] = await Promise.all([
      this.prisma.teamMember.count({ where }),
      this.prisma.teamMember.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          user: {
            select: { id: true, email: true, role: true },
          },
        },
      }),
    ]);

    return {
      data: members,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * 获取团队成员详情
   */
  async getMemberById(id: string) {
    return this.prisma.teamMember.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, email: true, role: true, createdAt: true },
        },
      },
    });
  }

  /**
   * 更新团队成员
   */
  async updateMember(id: string, data: UpdateTeamMemberInput) {
    return this.prisma.teamMember.update({
      where: { id },
      data: {
        ...data,
        role: data.role as TeamRole | undefined,
      },
      include: {
        user: {
          select: { id: true, email: true, role: true },
        },
      },
    });
  }

  /**
   * 删除团队成员
   */
  async deleteMember(id: string) {
    return this.prisma.teamMember.delete({
      where: { id },
    });
  }

  /**
   * 获取团队业绩排行
   */
  async getRanking(type: 'revenue' | 'deals' | 'customers' = 'revenue', limit: number = 10) {
    return this.prisma.teamMember.findMany({
      where: { isActive: true },
      orderBy: { [type]: 'desc' },
      take: limit,
      select: {
        id: true,
        name: true,
        avatar: true,
        role: true,
        department: true,
        revenue: true,
        deals: true,
        customers: true,
      },
    });
  }

  /**
   * 获取团队统计
   */
  async getStats() {
    const [totalMembers, activeMembers, roleDistribution, totalRevenue, totalDeals] = await Promise.all([
      this.prisma.teamMember.count(),
      this.prisma.teamMember.count({ where: { isActive: true } }),
      this.prisma.teamMember.groupBy({
        by: ['role'],
        _count: true,
      }),
      this.prisma.teamMember.aggregate({
        _sum: { revenue: true },
      }),
      this.prisma.teamMember.aggregate({
        _sum: { deals: true },
      }),
    ]);

    const roles: Record<string, number> = {};
    roleDistribution.forEach(item => {
      roles[item.role] = item._count;
    });

    return {
      totalMembers,
      activeMembers,
      inactiveMembers: totalMembers - activeMembers,
      totalRevenue: Number(totalRevenue._sum.revenue) || 0,
      totalDeals: Number(totalDeals._sum.deals) || 0,
      averageRevenuePerMember: totalMembers > 0 
        ? Math.round((Number(totalRevenue._sum.revenue) || 0) / totalMembers) 
        : 0,
      roleDistribution: roles,
    };
  }

  /**
   * 记录团队活动
   */
  async createActivity(memberId: string, data: CreateTeamActivityInput) {
    return this.prisma.teamActivity.create({
      data: {
        memberId,
        type: data.type,
        title: data.title,
        description: data.description,
        relatedCustomerId: data.relatedCustomerId,
        relatedOpportunityId: data.relatedOpportunityId,
        metadata: data.metadata || {},
      },
      include: {
        member: {
          select: { id: true, name: true, avatar: true },
        },
        relatedCustomer: {
          select: { id: true, name: true, company: true },
        },
      },
    });
  }

  /**
   * 获取团队活动列表
   */
  async getActivities(query: ActivityQueryInput) {
    const { page, limit, memberId, type, startDate, endDate } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (memberId) {
      where.memberId = memberId;
    }

    if (type) {
      where.type = type;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [total, activities] = await Promise.all([
      this.prisma.teamActivity.count({ where }),
      this.prisma.teamActivity.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          member: {
            select: { id: true, name: true, avatar: true, role: true },
          },
          relatedCustomer: {
            select: { id: true, name: true, company: true },
          },
        },
      }),
    ]);

    return {
      data: activities,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * 更新成员业绩数据
   */
  async updateMemberStats(memberId: string, stats: { revenue?: number; deals?: number; customers?: number }) {
    const member = await this.prisma.teamMember.findUnique({
      where: { id: memberId },
    });

    if (!member) {
      throw new Error('成员不存在');
    }

    return this.prisma.teamMember.update({
      where: { id: memberId },
      data: {
        revenue: stats.revenue !== undefined ? Number(member.revenue) + stats.revenue : member.revenue,
        deals: stats.deals !== undefined ? member.deals + stats.deals : member.deals,
        customers: stats.customers !== undefined ? member.customers + stats.customers : member.customers,
      },
    });
  }
}

export default new TeamService();