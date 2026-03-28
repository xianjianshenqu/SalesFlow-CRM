import { PrismaClient, ProposalStatus } from '@prisma/client';
import prisma from '../repositories/prisma';
import { CreateProposalInput, UpdateProposalInput, UpdateProposalStatusInput, ProposalQueryInput } from '../validators/proposal.validator';
import { proposalAIService, knowledgeAIService } from './ai';
import type { SmartQuotationResult, ProposalGenerationResult } from './ai/types';
import knowledgeService from './knowledge.service';

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
   * 创建后直接进入需求分析阶段
   */
  async create(data: CreateProposalInput, userId: string) {
    // 创建方案并设置状态为需求分析阶段
    const proposal = await this.prisma.proposal.create({
      data: {
        customerId: data.customerId,
        title: data.title,
        value: data.value,
        description: data.description,
        products: data.products || [],
        terms: data.terms,
        validUntil: data.validUntil ? new Date(data.validUntil) : null,
        notes: data.notes,
        status: 'requirement_analysis' as any, // 直接进入需求分析阶段
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

    // 自动创建初始需求分析记录
    await (this.prisma as any).requirementAnalysis.create({
      data: {
        proposalId: proposal.id,
        customerId: data.customerId,
        sourceType: 'manual',
        status: 'draft',
      },
    });

    return proposal;
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

  // ==================== AI增强功能 ====================

  /**
   * 智能生成完整方案
   * 基于客户信息AI生成方案内容
   */
  async generateSmartProposal(id: string): Promise<ProposalGenerationResult> {
    const proposal = await this.getById(id);
    if (!proposal) {
      throw new Error('方案不存在');
    }

    // 获取客户详细信息
    const customer = await this.prisma.customer.findUnique({
      where: { id: proposal.customerId },
      select: {
        id: true,
        name: true,
        company: true,
        industry: true,
        notes: true,
      },
    });

    // 获取客户洞察（如果有）- 使用类型断言
    const customerInsight = await (this.prisma as any).customerInsight?.findUnique?.({
      where: { customerId: proposal.customerId },
    });

    // 从知识库获取相关产品
    let knowledgeProducts: any[] = [];
    try {
      knowledgeProducts = await knowledgeService.exportProducts({
        category: customer?.industry || undefined,
        isActive: true,
      });
    } catch (error) {
      console.warn('[Proposal Service] 从知识库获取产品失败，将使用默认推荐:', error);
    }

    // 构建AI输入
    const aiInput = {
      customerId: proposal.customerId,
      customerName: customer?.name ?? customer?.company ?? undefined,
      industry: customer?.industry ?? undefined,
      company: customer?.company ?? customer?.name ?? undefined,
      title: proposal.title,
      value: Number(proposal.value),
      description: proposal.description ?? undefined,
      products: proposal.products as Array<{ name: string; quantity: number; unitPrice: number; totalPrice: number }> || [],
      customerNeeds: (customerInsight?.extractedNeeds as string[]) ?? undefined,
      painPoints: ((customerInsight?.painPoints as Array<{ point: string }>)?.map(p => p.point)) ?? undefined,
    };

    // 调用AI服务生成方案（使用知识库增强版本）
    let generatedProposal: ProposalGenerationResult;
    if (knowledgeProducts.length > 0) {
      generatedProposal = await proposalAIService.generateProposalWithKnowledge(
        aiInput,
        knowledgeProducts,
        [] // 模板数据暂时为空
      );
    } else {
      generatedProposal = await proposalAIService.generateProposalContent(aiInput);
    }

    // 更新方案内容
    await this.prisma.proposal.update({
      where: { id },
      data: {
        terms: generatedProposal.terms,
        products: generatedProposal.productRecommendations.map(p => ({
          name: p.name,
          quantity: p.quantity,
          unitPrice: p.unitPrice,
          totalPrice: p.totalPrice,
        })),
        description: generatedProposal.executiveSummary,
      },
    });

    return generatedProposal;
  }

  /**
   * 获取智能定价策略
   */
  async getPricingStrategy(id: string): Promise<SmartQuotationResult> {
    const proposal = await this.getById(id);
    if (!proposal) {
      throw new Error('方案不存在');
    }

    // 获取客户详细信息
    const customer = await this.prisma.customer.findUnique({
      where: { id: proposal.customerId },
      select: {
        id: true,
        name: true,
        company: true,
        industry: true,
        estimatedValue: true,
      },
    });

    // 获取客户历史交易
    const previousDeals = await this.prisma.proposal.findMany({
      where: {
        customerId: proposal.customerId,
        status: 'accepted',
      },
      select: { value: true, products: true, createdAt: true },
      take: 5,
    });

    // 构建AI输入
    const aiInput = {
      customerId: proposal.customerId,
      customerName: customer?.name ?? customer?.company ?? undefined,
      industry: customer?.industry ?? undefined,
      company: customer?.company ?? customer?.name ?? undefined,
      estimatedValue: Number(proposal.value),
      products: (proposal.products as Array<{ name: string; quantity: number; unitPrice?: number }>) || [],
      previousDeals: previousDeals.map(d => ({
        value: Number(d.value),
        products: (d.products as string[]) || [],
        date: d.createdAt,
      })),
    };

    // 调用AI服务获取定价策略
    return proposalAIService.generateSmartQuotation(aiInput);
  }

  /**
   * 获取推荐产品组合
   */
  async getRecommendedProducts(id: string): Promise<Array<{
    name: string;
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    benefit: string;
    priority: 'essential' | 'recommended' | 'optional';
  }>> {
    const proposal = await this.getById(id);
    if (!proposal) {
      throw new Error('方案不存在');
    }

    // 获取客户信息
    const customer = await this.prisma.customer.findUnique({
      where: { id: proposal.customerId },
      select: {
        id: true,
        name: true,
        company: true,
        industry: true,
      },
    });

    // 调用AI生成方案，提取产品推荐
    const generatedProposal = await proposalAIService.generateProposalContent({
      customerId: proposal.customerId,
      customerName: customer?.name ?? customer?.company ?? undefined,
      industry: customer?.industry ?? undefined,
      company: customer?.company ?? customer?.name ?? undefined,
      title: proposal.title,
      value: Number(proposal.value),
      description: proposal.description ?? undefined,
    });

    return generatedProposal.productRecommendations;
  }

  /**
   * AI生成方案（增强版）
   * 结合客户洞察和历史数据生成更智能的方案
   */
  async generateWithAIEnhanced(id: string) {
    const proposal = await this.getById(id);
    if (!proposal) {
      throw new Error('方案不存在');
    }

    // 同时获取定价策略和方案内容
    const [pricingStrategy, generatedContent] = await Promise.all([
      this.getPricingStrategy(id),
      this.generateSmartProposal(id),
    ]);

    // 应用定价策略
    const finalValue = pricingStrategy.recommendedPrice;

    // 更新方案
    return this.prisma.proposal.update({
      where: { id },
      data: {
        value: finalValue,
        terms: generatedContent.terms,
        products: generatedContent.productRecommendations.map(p => ({
          name: p.name,
          quantity: p.quantity,
          unitPrice: p.unitPrice,
          totalPrice: p.totalPrice,
        })),
        description: generatedContent.executiveSummary,
      },
      include: {
        customer: {
          select: { id: true, name: true, company: true },
        },
      },
    });
  }

  // ==================== 模板管理方法 ====================

  /**
   * 获取模板列表
   */
  async getTemplates(query: { page: number; limit: number; category?: string; search?: string }) {
    const { page, limit, category, search } = query;
    const skip = (page - 1) * limit;

    const where: any = { isActive: true };
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const [total, templates] = await Promise.all([
      (this.prisma as any).proposalTemplate.count({ where }),
      (this.prisma as any).proposalTemplate.findMany({
        where,
        skip,
        take: limit,
        orderBy: { usageCount: 'desc' },
      }),
    ]);

    return {
      data: templates,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * 创建模板
   */
  async createTemplate(data: any, userId: string) {
    return (this.prisma as any).proposalTemplate.create({
      data: {
        ...data,
        createdById: userId,
      },
    });
  }

  /**
   * 克隆模板
   */
  async cloneTemplate(templateId: string, userId: string) {
    const template = await (this.prisma as any).proposalTemplate.findUnique({
      where: { id: templateId },
    });
    if (!template) throw new Error('模板不存在');

    return (this.prisma as any).proposalTemplate.create({
      data: {
        name: `${template.name} (副本)`,
        category: template.category,
        description: template.description,
        content: template.content,
        products: template.products,
        terms: template.terms,
        tags: template.tags,
        createdById: userId,
      },
    });
  }

  // ==================== 需求分析阶段方法 ====================

  /**
   * 创建需求分析
   */
  async createRequirementAnalysis(proposalId: string, data: any) {
    // 更新方案状态
    await this.prisma.proposal.update({
      where: { id: proposalId },
      data: { status: 'requirement_analysis' as any },
    });

    return (this.prisma as any).requirementAnalysis.create({
      data: {
        proposalId,
        customerId: data.customerId,
        sourceType: data.sourceType,
        recordingId: data.recordingId,
        rawContent: data.rawContent,
      },
    });
  }

  /**
   * 获取需求分析
   */
  async getRequirementAnalysis(proposalId: string) {
    return (this.prisma as any).requirementAnalysis.findUnique({
      where: { proposalId },
    });
  }

  /**
   * 更新需求分析
   */
  async updateRequirementAnalysis(proposalId: string, data: any) {
    return (this.prisma as any).requirementAnalysis.update({
      where: { proposalId },
      data: {
        ...data,
        aiEnhanced: data.extractedNeeds !== undefined,
      },
    });
  }

  /**
   * AI分析需求
   */
  async aiAnalyzeRequirement(proposalId: string, sourceType: string, recordingId?: string) {
    const proposal = await this.getById(proposalId);
    if (!proposal) throw new Error('方案不存在');

    // 获取相关数据进行AI分析
    let analysisResult: any = {
      extractedNeeds: [],
      painPoints: [],
      budgetHint: null,
      decisionTimeline: null,
    };

    if (sourceType === 'recording' && recordingId) {
      // 从录音分析
      const recording = await this.prisma.audioRecording.findUnique({
        where: { id: recordingId },
        select: {
          summary: true,
          keywords: true,
          keyPoints: true,
          transcript: true,
        },
      });
      if (recording) {
        analysisResult = this.extractNeedsFromRecording(recording);
      }
    }

    // 搜索知识库中相关内容进行增强
    try {
      const knowledgeResults = await knowledgeService.searchKnowledge({
        q: proposal.title || '',
        limit: 5,
      });

      // 如果知识库中有相关产品，添加到分析结果
      if (knowledgeResults.results.products && knowledgeResults.results.products.length > 0) {
        analysisResult.knowledgeRefs = knowledgeResults.results.products.map((p: any) => ({
          type: 'product',
          id: p.id,
          name: p.productName,
          price: p.unitPrice,
        }));
      }
    } catch (error) {
      console.warn('[Proposal Service] 知识库搜索失败:', error);
      // 静默降级，不影响现有功能
    }

    // 更新需求分析记录
    await (this.prisma as any).requirementAnalysis.update({
      where: { proposalId },
      data: {
        extractedNeeds: analysisResult.extractedNeeds,
        painPoints: analysisResult.painPoints,
        budgetHint: analysisResult.budgetHint,
        decisionTimeline: analysisResult.decisionTimeline,
        aiEnhanced: true,
      },
    });

    return analysisResult;
  }

  /**
   * AI补充需求
   * 结合知识库增强需求分析
   */
  async aiEnhanceRequirement(proposalId: string) {
    const analysis = await this.getRequirementAnalysis(proposalId);
    if (!analysis) throw new Error('需求分析不存在');

    // 获取方案和客户信息用于知识库增强
    const proposal = await this.getById(proposalId);
    const customer = proposal ? await this.prisma.customer.findUnique({
      where: { id: proposal.customerId },
      select: { industry: true, name: true },
    }) : null;

    let enhancedContent = `${analysis.rawContent || ''}`;
    let enhancedNeeds: string[] = [];
    let suggestedProducts: string[] = [];

    // 尝试使用知识库AI增强需求分析
    try {
      const enhancementResult = await knowledgeAIService.enhanceRequirementAnalysis(
        analysis.rawContent || proposal?.title || '',
        {
          industry: customer?.industry,
          proposalValue: proposal ? Number(proposal.value) : undefined,
        }
      );

      // 使用增强结果更新内容
      if (enhancementResult.enhancedNeeds && enhancementResult.enhancedNeeds.length > 0) {
        enhancedNeeds = enhancementResult.enhancedNeeds.map(n => n.need);
        enhancedContent += '\n\n【AI需求分析】\n' +
          enhancementResult.enhancedNeeds.map(n => `- ${n.need}（${n.priority}优先级）`).join('\n');
      }

      if (enhancementResult.suggestedProducts && enhancementResult.suggestedProducts.length > 0) {
        suggestedProducts = enhancementResult.suggestedProducts.map(p => p.name);
        enhancedContent += '\n\n【建议产品】\n' +
          enhancementResult.suggestedProducts.map(p => `- ${p.name}：${p.reason}`).join('\n');
      }

      if (enhancementResult.estimatedBudget) {
        enhancedContent += `\n\n【预算估算】\n参考范围：¥${enhancementResult.estimatedBudget.min?.toLocaleString() || '未确定'} - ¥${enhancementResult.estimatedBudget.max?.toLocaleString() || '未确定'}`;
      }

      if (enhancementResult.additionalInsights && enhancementResult.additionalInsights.length > 0) {
        enhancedContent += '\n\n【附加洞察】\n' +
          enhancementResult.additionalInsights.map(i => `- ${i}`).join('\n');
      }
    } catch (error) {
      // 知识库增强失败，使用默认增强逻辑
      console.warn('[Proposal Service] 知识库增强失败，使用默认逻辑:', error);
      enhancedContent += '\n\n【AI补充分析】\n- 建议关注客户的数字化转型需求\n- 可能存在预算审批流程\n- 推荐在下一阶段提供技术演示';
    }

    return (this.prisma as any).requirementAnalysis.update({
      where: { proposalId },
      data: {
        rawContent: enhancedContent,
        extractedNeeds: enhancedNeeds.length > 0 ? enhancedNeeds : analysis.extractedNeeds,
        aiEnhanced: true,
      },
    });
  }

  /**
   * 确认需求分析
   */
  async confirmRequirementAnalysis(proposalId: string, finalContent: string) {
    // 更新需求分析状态
    await (this.prisma as any).requirementAnalysis.update({
      where: { proposalId },
      data: {
        status: 'confirmed',
        finalContent,
      },
    });

    // 更新方案状态到设计阶段
    return this.prisma.proposal.update({
      where: { id: proposalId },
      data: { status: 'designing' as any },
    });
  }

  // ==================== 方案设计阶段方法 ====================

  /**
   * 开始方案设计
   */
  async startDesign(proposalId: string) {
    return this.prisma.proposal.update({
      where: { id: proposalId },
      data: { status: 'designing' as any },
    });
  }

  /**
   * AI匹配模板
   */
  async matchTemplate(proposalId: string, criteria: { industry?: string; needs?: string[]; budget?: number }) {
    const proposal = await this.getById(proposalId);
    if (!proposal) throw new Error('方案不存在');

    // 获取所有活跃模板
    const templates = await (this.prisma as any).proposalTemplate.findMany({
      where: { isActive: true },
    });

    // 计算匹配分数
    const matchedTemplates = templates.map((template: any) => {
      let score = 0;
      
      // 行业匹配
      if (criteria.industry && template.category === criteria.industry) {
        score += 40;
      }
      
      // 预算匹配
      if (criteria.budget && template.products) {
        const templateValue = (template.products as any[]).reduce((sum: number, p: any) => sum + (p.totalPrice || 0), 0);
        const diff = Math.abs(criteria.budget - templateValue);
        if (diff < criteria.budget * 0.1) score += 30;
        else if (diff < criteria.budget * 0.3) score += 20;
        else if (diff < criteria.budget * 0.5) score += 10;
      }
      
      // 需求匹配
      if (criteria.needs && template.tags) {
        const matchedTags = (criteria.needs as string[]).filter(n => 
          (template.tags as string[]).some(t => t.toLowerCase().includes(n.toLowerCase()))
        );
        score += matchedTags.length * 10;
      }

      return { ...template, matchScore: Math.min(score, 100) };
    });

    // 按分数排序返回top 5
    return matchedTemplates
      .sort((a: any, b: any) => b.matchScore - a.matchScore)
      .slice(0, 5);
  }

  /**
   * 应用模板生成方案
   */
  async applyTemplate(proposalId: string, templateId: string) {
    const template = await (this.prisma as any).proposalTemplate.findUnique({
      where: { id: templateId },
    });
    if (!template) throw new Error('模板不存在');

    // 增加模板使用次数
    await (this.prisma as any).proposalTemplate.update({
      where: { id: templateId },
      data: { usageCount: { increment: 1 } },
    });

    // 更新方案内容
    return this.prisma.proposal.update({
      where: { id: proposalId },
      data: {
        products: template.products,
        terms: template.terms,
        description: template.description,
      },
      include: {
        customer: { select: { id: true, name: true, company: true } },
      },
    });
  }

  /**
   * 更新方案设计内容
   */
  async updateDesign(proposalId: string, data: any) {
    return this.prisma.proposal.update({
      where: { id: proposalId },
      data: {
        products: data.products,
        terms: data.terms,
        description: data.description,
      },
    });
  }

  /**
   * 确认方案设计
   */
  async confirmDesign(proposalId: string) {
    // 更新方案状态到内部评审
    return this.prisma.proposal.update({
      where: { id: proposalId },
      data: { status: 'pending_review' as any },
    });
  }

  // ==================== 内部评审阶段方法 ====================

  /**
   * 发起内部评审
   */
  async createReview(proposalId: string, data: { reviewerId?: string; sharedWith?: string[] }) {
    // 创建评审记录
    const review = await (this.prisma as any).proposalReview.create({
      data: {
        proposalId,
        reviewerId: data.reviewerId,
        sharedWith: data.sharedWith || [],
        status: 'pending',
      },
    });

    // 更新方案状态
    await this.prisma.proposal.update({
      where: { id: proposalId },
      data: { status: 'pending_review' as any },
    });

    return review;
  }

  /**
   * 获取评审信息
   */
  async getReview(proposalId: string) {
    return (this.prisma as any).proposalReview.findUnique({
      where: { proposalId },
      include: {
        proposal: {
          include: {
            customer: { select: { id: true, name: true, company: true } },
          },
        },
      },
    });
  }

  /**
   * 添加评审意见
   */
  async addReviewComment(proposalId: string, userId: string, comment: string) {
    const review = await this.getReview(proposalId);
    if (!review) throw new Error('评审记录不存在');

    const comments = review.comments || [];
    comments.push({
      userId,
      comment,
      createdAt: new Date().toISOString(),
    });

    return (this.prisma as any).proposalReview.update({
      where: { proposalId },
      data: { comments },
    });
  }

  /**
   * 评审通过
   */
  async approveReview(proposalId: string, resultNotes: string) {
    await (this.prisma as any).proposalReview.update({
      where: { proposalId },
      data: {
        status: 'approved',
        result: 'approved',
        resultNotes,
        reviewedAt: new Date(),
      },
    });

    return this.prisma.proposal.update({
      where: { id: proposalId },
      data: { status: 'review_passed' as any },
    });
  }

  /**
   * 评审驳回
   */
  async rejectReview(proposalId: string, resultNotes: string) {
    await (this.prisma as any).proposalReview.update({
      where: { proposalId },
      data: {
        status: 'rejected',
        result: 'rejected',
        resultNotes,
        reviewedAt: new Date(),
      },
    });

    return this.prisma.proposal.update({
      where: { id: proposalId },
      data: { status: 'review_rejected' as any },
    });
  }

  // ==================== 客户提案阶段方法 ====================

  /**
   * 创建客户提案
   */
  async createCustomerProposalRecord(proposalId: string, data: { emailTo: string; emailCc?: string[]; emailSubject?: string; emailBody?: string }) {
    const trackingToken = this.generateTrackingToken();

    const customerProposal = await (this.prisma as any).customerProposalRecord.create({
      data: {
        proposalId,
        emailTo: data.emailTo,
        emailCc: data.emailCc,
        emailSubject: data.emailSubject,
        emailBody: data.emailBody,
        trackingToken,
        sendStatus: 'draft',
      },
    });

    // 更新方案状态
    await this.prisma.proposal.update({
      where: { id: proposalId },
      data: { status: 'customer_proposal' as any },
    });

    return customerProposal;
  }

  /**
   * 获取客户提案信息
   */
  async getCustomerProposalRecord(proposalId: string) {
    return (this.prisma as any).customerProposalRecord.findUnique({
      where: { proposalId },
    });
  }

  /**
   * 生成邮件模板
   */
  async generateEmailTemplate(proposalId: string) {
    const proposal = await this.getById(proposalId);
    if (!proposal) throw new Error('方案不存在');

    const customer = proposal.customer as any;
    const customerName = customer?.company || customer?.name || '贵公司';

    return {
      subject: `商务合作方案 - ${proposal.title}`,
      body: `尊敬的${customerName}负责人：

您好！

感谢您对我们方案的关注。现附上我们为贵公司量身定制的商务方案，方案详情如下：

【方案名称】${proposal.title}
【方案金额】¥${Number(proposal.value).toLocaleString()}
【有效期至】${proposal.validUntil ? new Date(proposal.validUntil).toLocaleDateString() : '另行通知'}

我们期待与贵公司的合作，如有任何问题，请随时联系我们。

此致
敬礼！`,
    };
  }

  /**
   * 更新邮件内容
   */
  async updateCustomerProposalEmail(proposalId: string, data: any) {
    return (this.prisma as any).customerProposalRecord.update({
      where: { proposalId },
      data: {
        emailTo: data.emailTo,
        emailCc: data.emailCc,
        emailSubject: data.emailSubject,
        emailBody: data.emailBody,
      },
    });
  }

  /**
   * 发送邮件（更新状态）
   */
  async sendCustomerProposal(proposalId: string) {
    await (this.prisma as any).customerProposalRecord.update({
      where: { proposalId },
      data: {
        sendStatus: 'sent',
        sentAt: new Date(),
      },
    });

    return this.prisma.proposal.update({
      where: { id: proposalId },
      data: { status: 'sent' as any },
    });
  }

  /**
   * 记录邮件打开
   */
  async trackEmailOpen(trackingToken: string) {
    const record = await (this.prisma as any).customerProposalRecord.findUnique({
      where: { trackingToken },
    });
    if (!record) return null;

    return (this.prisma as any).customerProposalRecord.update({
      where: { trackingToken },
      data: {
        sendStatus: 'opened',
        openedAt: new Date(),
        openCount: { increment: 1 },
      },
    });
  }

  // ==================== 商务谈判阶段方法 ====================

  /**
   * 创建商务谈判
   */
  async createNegotiation(proposalId: string) {
    const negotiation = await (this.prisma as any).negotiationRecord.create({
      data: {
        proposalId,
        discussions: [],
        agreedTerms: [],
        status: 'ongoing',
      },
    });

    // 更新方案状态
    await this.prisma.proposal.update({
      where: { id: proposalId },
      data: { status: 'negotiation' as any },
    });

    return negotiation;
  }

  /**
   * 获取谈判记录
   */
  async getNegotiation(proposalId: string) {
    return (this.prisma as any).negotiationRecord.findUnique({
      where: { proposalId },
    });
  }

  /**
   * 添加讨论记录
   */
  async addDiscussion(proposalId: string, data: { content: string; participants?: string[] }) {
    const negotiation = await this.getNegotiation(proposalId);
    if (!negotiation) throw new Error('谈判记录不存在');

    const discussions = negotiation.discussions || [];
    discussions.push({
      date: new Date().toISOString(),
      content: data.content,
      participants: data.participants || [],
    });

    return (this.prisma as any).negotiationRecord.update({
      where: { proposalId },
      data: { discussions },
    });
  }

  /**
   * 更新条款
   */
  async updateAgreedTerms(proposalId: string, agreedTerms: any[]) {
    return (this.prisma as any).negotiationRecord.update({
      where: { proposalId },
      data: { agreedTerms },
    });
  }

  /**
   * 完成谈判
   */
  async completeNegotiation(proposalId: string) {
    await (this.prisma as any).negotiationRecord.update({
      where: { proposalId },
      data: { status: 'completed' },
    });

    return this.prisma.proposal.update({
      where: { id: proposalId },
      data: { status: 'accepted' as any },
    });
  }

  // ==================== 辅助方法 ====================

  /**
   * 从录音提取需求
   */
  private extractNeedsFromRecording(recording: any) {
    const needs: any[] = [];
    const painPoints: any[] = [];

    // 从关键词提取需求
    if (recording.keywords && Array.isArray(recording.keywords)) {
      recording.keywords.forEach((keyword: string) => {
        needs.push({
          need: keyword,
          priority: 'medium' as const,
          source: '录音分析',
        });
      });
    }

    // 从要点提取痛点
    if (recording.keyPoints && Array.isArray(recording.keyPoints)) {
      recording.keyPoints.forEach((point: string) => {
        painPoints.push({
          point,
          severity: 'medium' as const,
          category: '业务需求',
        });
      });
    }

    return {
      extractedNeeds: needs,
      painPoints,
      budgetHint: null,
      decisionTimeline: null,
    };
  }

  /**
   * 生成跟踪令牌
   */
  private generateTrackingToken(): string {
    return Buffer.from(Date.now().toString() + Math.random().toString())
      .toString('base64')
      .replace(/[+/=]/g, '')
      .substring(0, 32);
  }
}

export default new ProposalService();