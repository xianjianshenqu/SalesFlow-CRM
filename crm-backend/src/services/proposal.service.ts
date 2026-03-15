import { PrismaClient, ProposalStatus } from '@prisma/client';
import prisma from '../repositories/prisma';
import { CreateProposalInput, UpdateProposalInput, UpdateProposalStatusInput, ProposalQueryInput } from '../validators/proposal.validator';

/**
 * 商务方案服务 - 处理商务方案相关的业务逻辑
 */
class ProposalService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  /**
   * 创建商务方案
   */
  async create(data: CreateProposalInput, userId: string) {
    return this.prisma.proposal.create({
      data: {
        customerId: data.customerId,
        title: data.title,
        value: data.value,
        description: data.description,
        products: data.products || [],
        terms: data.terms,
        validUntil: data.validUntil ? new Date(data.validUntil) : null,
        notes: data.notes,
        status: 'draft',
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
   * 获取方案列表（分页、筛选）
   */
  async getAll(query: ProposalQueryInput) {
    const { page, limit, customerId, status, minAmount, maxAmount, startDate, endDate, search, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (customerId) {
      where.customerId = customerId;
    }

    if (status) {
      where.status = status as ProposalStatus;
    }

    if (minAmount || maxAmount) {
      where.value = {};
      if (minAmount) where.value.gte = minAmount;
      if (maxAmount) where.value.lte = maxAmount;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const [total, proposals] = await Promise.all([
      this.prisma.proposal.count({ where }),
      this.prisma.proposal.findMany({
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
      data: proposals,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * 获取方案详情
   */
  async getById(id: string) {
    return this.prisma.proposal.findUnique({
      where: { id },
      include: {
        customer: {
          select: { id: true, name: true, company: true, phone: true, email: true, address: true },
        },
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  /**
   * 更新方案
   */
  async update(id: string, data: UpdateProposalInput) {
    const updateData: any = { ...data };

    if (data.validUntil) {
      updateData.validUntil = new Date(data.validUntil);
    }

    return this.prisma.proposal.update({
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
   * 更新方案状态
   */
  async updateStatus(id: string, data: UpdateProposalStatusInput) {
    return this.prisma.proposal.update({
      where: { id },
      data: {
        status: data.status as ProposalStatus,
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
   * 删除方案
   */
  async delete(id: string) {
    return this.prisma.proposal.delete({
      where: { id },
    });
  }

  /**
   * AI生成方案
   * 根据客户信息智能生成商务方案
   */
  async generateWithAI(id: string) {
    const proposal = await this.getById(id);
    if (!proposal) {
      throw new Error('方案不存在');
    }

    // 模拟AI生成内容（实际项目中调用AI API）
    const generatedTerms = `
一、项目概述
本方案针对${proposal.customer?.company || proposal.customer?.name || '贵公司'}的具体需求，提供专业的解决方案。

二、服务内容
根据客户需求分析，我们提供以下产品/服务：
${Array.isArray(proposal.products) && proposal.products.length > 0 
  ? proposal.products.map((p: any, i: number) => `${i + 1}. ${p.name} x ${p.quantity} @ ¥${p.unitPrice}`).join('\n')
  : '1. 定制化解决方案（详见产品清单）'}

三、付款方式
- 首付款：合同签订后支付30%
- 中期款：项目中期支付40%
- 尾款：项目验收后支付30%

四、交付时间
根据项目规模和复杂度，预计交付周期为30-60个工作日。

五、服务承诺
- 7x24小时技术支持
- 免费培训服务
- 质保期内免费维护
    `.trim();

    // 生成的建议产品组合
    const valueNum = Number(proposal.value);
    const suggestedProducts = [
      { name: '基础服务包', quantity: 1, unitPrice: Math.round(valueNum * 0.3), totalPrice: Math.round(valueNum * 0.3) },
      { name: '高级功能模块', quantity: 1, unitPrice: Math.round(valueNum * 0.5), totalPrice: Math.round(valueNum * 0.5) },
      { name: '技术支持服务', quantity: 12, unitPrice: Math.round(valueNum * 0.2 / 12), totalPrice: Math.round(valueNum * 0.2) },
    ];

    // 更新方案
    return this.prisma.proposal.update({
      where: { id },
      data: {
        terms: generatedTerms,
        products: suggestedProducts,
      },
      include: {
        customer: {
          select: { id: true, name: true, company: true },
        },
      },
    });
  }

  /**
   * 获取方案统计
   */
  async getStats(customerId?: string) {
    const where: any = {};
    if (customerId) {
      where.customerId = customerId;
    }

    const [totalCount, statusCounts, totalValue, avgValue] = await Promise.all([
      this.prisma.proposal.count({ where }),
      this.prisma.proposal.groupBy({
        by: ['status'],
        where,
        _count: true,
        _sum: { value: true },
      }),
      this.prisma.proposal.aggregate({
        where,
        _sum: { value: true },
      }),
      this.prisma.proposal.aggregate({
        where,
        _avg: { value: true },
      }),
    ]);

    const statusDistribution: Record<string, { count: number; value: number }> = {
      draft: { count: 0, value: 0 },
      sent: { count: 0, value: 0 },
      accepted: { count: 0, value: 0 },
      rejected: { count: 0, value: 0 },
      expired: { count: 0, value: 0 },
    };

    statusCounts.forEach(item => {
      statusDistribution[item.status] = {
        count: item._count,
        value: Number(item._sum.value) || 0,
      };
    });

    // 计算转化率
    const acceptedCount = statusDistribution.accepted.count;
    const conversionRate = totalCount > 0 ? (acceptedCount / totalCount) * 100 : 0;

    return {
      total: totalCount,
      totalValue: Number(totalValue._sum.value) || 0,
      averageValue: Math.round(Number(avgValue._avg.value) || 0),
      conversionRate: Math.round(conversionRate * 100) / 100,
      statusDistribution,
    };
  }

  /**
   * 获取客户的方案列表
   */
  async getByCustomerId(customerId: string) {
    return this.prisma.proposal.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: {
          select: { id: true, name: true },
        },
      },
    });
  }

  /**
   * 发送方案（更新状态为已发送）
   */
  async send(id: string) {
    return this.prisma.proposal.update({
      where: { id },
      data: {
        status: 'sent',
        sentAt: new Date(),
      },
      include: {
        customer: {
          select: { id: true, name: true, company: true, email: true },
        },
      },
    });
  }
}

export default new ProposalService();