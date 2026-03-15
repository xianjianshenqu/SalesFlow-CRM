import { PrismaClient, Sentiment } from '@prisma/client';
import prisma from '../repositories/prisma';
import { CreateRecordingInput, UpdateRecordingInput, RecordingQueryInput } from '../validators/recording.validator';
import aiService from './ai.service';

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
   * 调用AI服务进行语音分析
   */
  async analyze(id: string) {
    // 获取录音信息
    const recording = await this.getById(id);
    if (!recording) {
      throw new Error('录音不存在');
    }

    // 更新状态为处理中
    await this.prisma.audioRecording.update({
      where: { id },
      data: { status: 'processing' },
    });

    try {
      // 调用AI服务进行分析
      const aiResult = await aiService.analyzeRecording(
        recording.fileUrl || '',
        recording.duration,
        {
          name: recording.customer?.name,
          industry: recording.customer?.company ?? undefined,
        }
      );

      // 更新录音分析结果
      const updated = await this.prisma.audioRecording.update({
        where: { id },
        data: {
          sentiment: aiResult.sentiment,
          summary: aiResult.summary,
          keywords: aiResult.keywords,
          keyPoints: aiResult.keyPoints,
          actionItems: aiResult.actionItems,
          transcript: aiResult.transcript,
          status: 'analyzed',
          notes: JSON.stringify({
            psychology: aiResult.psychology,
            suggestions: aiResult.suggestions,
          }),
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

      return {
        ...updated,
        psychology: aiResult.psychology,
        suggestions: aiResult.suggestions,
      };
    } catch (error) {
      // 分析失败，恢复状态
      await this.prisma.audioRecording.update({
        where: { id },
        data: { status: 'pending' },
      });
      throw error;
    }
  }

  /**
   * 上传录音文件
   */
  async upload(data: {
    customerId: string;
    title: string;
    fileUrl: string;
    duration: number;
    fileSize?: number;
    contactPerson?: string;
  }, userId: string) {
    return this.prisma.audioRecording.create({
      data: {
        customerId: data.customerId,
        title: data.title,
        fileUrl: data.fileUrl,
        duration: data.duration,
        fileSize: data.fileSize,
        contactPerson: data.contactPerson,
        status: 'pending',
        createdById: userId,
      },
      include: {
        customer: {
          select: { id: true, name: true, company: true, shortName: true },
        },
        createdBy: {
          select: { id: true, name: true },
        },
      },
    });
  }

  /**
   * 从钉钉同步录音（模拟）
   */
  async syncFromDingTalk(userId: string) {
    // 获取所有客户用于关联
    const customers = await this.prisma.customer.findMany({
      select: { id: true, name: true, shortName: true, contactPerson: true },
      take: 20,
    });

    if (customers.length === 0) {
      return { synced: 0, recordings: [] };
    }

    // 随机选择1-3个客户生成模拟录音
    const syncCount = Math.floor(Math.random() * 3) + 1;
    const selectedCustomers = customers
      .sort(() => 0.5 - Math.random())
      .slice(0, syncCount);

    const recordings = [];

    for (const customer of selectedCustomers) {
      const duration = Math.floor(Math.random() * 1800) + 120; // 2-32分钟
      const recording = await this.prisma.audioRecording.create({
        data: {
          customerId: customer.id,
          title: `与${customer.name}的通话`,
          contactPerson: customer.contactPerson || '未知联系人',
          duration,
          fileSize: duration * 16000, // 假设16kbps
          fileUrl: `https://dingtalk-recording.example.com/${Date.now()}.m4a`,
          status: 'pending',
          createdById: userId,
          recordedAt: new Date(Date.now() - Math.random() * 86400000 * 7), // 最近7天内
        },
        include: {
          customer: {
            select: { id: true, name: true, company: true, shortName: true },
          },
        },
      });
      recordings.push(recording);
    }

    return {
      synced: recordings.length,
      recordings,
    };
  }

  /**
   * 获取录音详情（包含AI分析结果）
   */
  async getDetailById(id: string) {
    const recording = await this.prisma.audioRecording.findUnique({
      where: { id },
      include: {
        customer: {
          select: { 
            id: true, 
            name: true, 
            company: true, 
            shortName: true,
            phone: true, 
            email: true,
            contactPerson: true,
          },
        },
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!recording) return null;

    // 解析额外数据
    let psychology = null;
    let suggestions = [];

    if (recording.notes) {
      try {
        const extraData = JSON.parse(recording.notes);
        psychology = extraData.psychology || null;
        suggestions = extraData.suggestions || [];
      } catch (e) {
        // 解析失败，忽略
      }
    }

    return {
      ...recording,
      psychology,
      suggestions,
    };
  }

  /**
   * 获取录音统计
   */
  async getStats(customerId?: string) {
    const where: any = {};
    if (customerId) {
      where.customerId = customerId;
    }

    const [
      totalCount,
      sentimentCounts,
      statusCounts,
      avgDuration,
      totalDuration,
      todayCount,
      weekCount,
    ] = await Promise.all([
      this.prisma.audioRecording.count({ where }),
      this.prisma.audioRecording.groupBy({
        by: ['sentiment'],
        where,
        _count: true,
      }),
      this.prisma.audioRecording.groupBy({
        by: ['status'],
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
      this.prisma.audioRecording.count({
        where: {
          ...where,
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      this.prisma.audioRecording.count({
        where: {
          ...where,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
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

    const statusDistribution: Record<string, number> = {
      pending: 0,
      processing: 0,
      analyzed: 0,
    };

    statusCounts.forEach((item: { status: string; _count: number }) => {
      statusDistribution[item.status] = item._count;
    });

    // 计算分析完成率
    const analyzedRate = totalCount > 0 
      ? Math.round((statusDistribution.analyzed / totalCount) * 100) 
      : 0;

    // 计算AI准确率（模拟）
    const aiAccuracy = analyzedRate > 0 ? 94 + Math.floor(Math.random() * 5) : 0;

    return {
      total: totalCount,
      averageDuration: Math.round(avgDuration._avg.duration || 0),
      totalDuration: totalDuration._sum.duration || 0,
      sentimentDistribution,
      statusDistribution,
      todayCount,
      weekCount,
      analyzedRate,
      aiAccuracy,
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