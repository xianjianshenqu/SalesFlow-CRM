import { PrismaClient, Sentiment } from '@prisma/client';
import prisma from '../repositories/prisma';
import { CreateRecordingInput, UpdateRecordingInput, RecordingQueryInput } from '../validators/recording.validator';

/**
 * 录音服务 - 处理AI录音分析相关的业务逻辑
 */
class RecordingService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  /**
   * 创建录音记录
   */
  async create(data: CreateRecordingInput, userId: string) {
    return this.prisma.audioRecording.create({
      data: {
        ...data,
        sentiment: data.sentiment as Sentiment | undefined,
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
   * 获取录音列表（分页、筛选）
   */
  async getAll(query: RecordingQueryInput) {
    const { page, limit, customerId, sentiment, startDate, endDate, search, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (customerId) {
      where.customerId = customerId;
    }

    if (sentiment) {
      where.sentiment = sentiment as Sentiment;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { summary: { contains: search } },
        { transcript: { contains: search } },
      ];
    }

    const [total, recordings] = await Promise.all([
      this.prisma.audioRecording.count({ where }),
      this.prisma.audioRecording.findMany({
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
      data: recordings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * 获取录音详情
   */
  async getById(id: string) {
    return this.prisma.audioRecording.findUnique({
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
   * 更新录音
   */
  async update(id: string, data: UpdateRecordingInput) {
    return this.prisma.audioRecording.update({
      where: { id },
      data: {
        ...data,
        sentiment: data.sentiment as Sentiment | undefined,
      },
      include: {
        customer: {
          select: { id: true, name: true, company: true },
        },
      },
    });
  }

  /**
   * 删除录音
   */
  async delete(id: string) {
    return this.prisma.audioRecording.delete({
      where: { id },
    });
  }

  /**
   * 触发AI分析
   * 实际项目中这里会调用AI服务进行语音分析
   */
  async analyze(id: string) {
    // 获取录音信息
    const recording = await this.getById(id);
    if (!recording) {
      throw new Error('录音不存在');
    }

    // 模拟AI分析结果（实际项目中调用AI API）
    const sentiments: Sentiment[] = ['positive', 'neutral', 'negative'];
    const randomSentiment = sentiments[Math.floor(Math.random() * sentiments.length)];
    
    const sampleKeywords = [
      '产品需求', '价格谈判', '竞品对比', '项目预算', 
      '决策流程', '合作意向', '技术支持', '售后服务',
    ];
    
    const sampleActionItems = [
      '发送产品报价单',
      '安排技术演示',
      '准备合作方案',
      '跟进竞品对比',
      '协调内部资源',
    ];

    // 随机选择关键词和行动项
    const keywords = sampleKeywords
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.floor(Math.random() * 3) + 2);
    
    const actionItems = sampleActionItems
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.floor(Math.random() * 2) + 1);

    // 生成模拟摘要
    const summaries = [
      `客户对${keywords[0]}表示关注，需要进一步沟通确认。`,
      `本次通话主要讨论了${keywords[0]}和${keywords[1]}相关内容，客户态度${randomSentiment === 'positive' ? '积极' : randomSentiment === 'negative' ? '消极' : '一般'}。`,
      `客户询问了关于${keywords[0]}的详细信息，建议后续重点关注。`,
    ];

    const summary = summaries[Math.floor(Math.random() * summaries.length)];

    // 更新录音分析结果
    return this.prisma.audioRecording.update({
      where: { id },
      data: {
        sentiment: randomSentiment,
        summary,
        keywords,
        actionItems,
        // 模拟生成转录文本
        transcript: `[AI转录] 这是一段${recording.duration}秒的通话录音，主要涉及${keywords.join('、')}等话题。`,
      },
      include: {
        customer: {
          select: { id: true, name: true, company: true },
        },
      },
    });
  }

  /**
   * 获取录音统计
   */
  async getStats(customerId?: string) {
    const where: any = {};
    if (customerId) {
      where.customerId = customerId;
    }

    const [totalCount, sentimentCounts, avgDuration, totalDuration] = await Promise.all([
      this.prisma.audioRecording.count({ where }),
      this.prisma.audioRecording.groupBy({
        by: ['sentiment'],
        where,
        _count: true,
      }),
      this.prisma.audioRecording.aggregate({
        where,
        _avg: { duration: true },
      }),
      this.prisma.audioRecording.aggregate({
        where,
        _sum: { duration: true },
      }),
    ]);

    const sentimentDistribution = {
      positive: 0,
      neutral: 0,
      negative: 0,
    };

    sentimentCounts.forEach(item => {
      if (item.sentiment) {
        sentimentDistribution[item.sentiment] = item._count;
      }
    });

    return {
      total: totalCount,
      averageDuration: Math.round(avgDuration._avg.duration || 0),
      totalDuration: totalDuration._sum.duration || 0,
      sentimentDistribution,
    };
  }

  /**
   * 获取客户的录音列表
   */
  async getByCustomerId(customerId: string) {
    return this.prisma.audioRecording.findMany({
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

export default new RecordingService();