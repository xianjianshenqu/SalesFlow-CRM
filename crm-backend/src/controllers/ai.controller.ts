/**
 * AI功能控制器
 * 处理AI相关的API请求
 */

import { Request, Response, NextFunction } from 'express';
import prisma from '../repositories/prisma';
import { followUpAnalysisService, reportGenerationService } from '../services/ai';

/**
 * 获取跟进建议列表
 */
export const getFollowUpSuggestions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const { status, priority, page = 1, limit = 20 } = req.query;

    const where: any = {};
    
    // 筛选当前用户负责的客户
    where.customer = { ownerId: userId };
    
    if (status) {
      where.status = status;
    }
    if (priority) {
      where.priority = priority;
    }

    const [suggestions, total] = await Promise.all([
      prisma.followUpSuggestion.findMany({
        where,
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              company: true,
              shortName: true,
              industry: true,
              phone: true,
            },
          },
        },
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'desc' },
        ],
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
      }),
      prisma.followUpSuggestion.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        items: suggestions,
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 为客户生成跟进建议
 */
export const generateFollowUpSuggestion = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { customerId } = req.body;

    if (!customerId) {
      res.status(400).json({
        success: false,
        message: '缺少客户ID',
      });
      return;
    }

    // 获取客户信息
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        recordings: {
          where: { status: 'analyzed' },
          orderBy: { recordedAt: 'desc' },
          take: 5,
          select: {
            sentiment: true,
            summary: true,
            recordedAt: true,
          },
        },
        opportunities: {
          where: { status: 'active' },
          select: {
            stage: true,
            value: true,
            lastActivity: true,
          },
        },
        scheduleTasks: {
          where: { status: { in: ['pending', 'in_progress'] } },
          select: {
            type: true,
            status: true,
            dueDate: true,
          },
        },
      },
    });

    if (!customer) {
      res.status(404).json({
        success: false,
        message: '客户不存在',
      });
      return;
    }

    // 调用AI服务分析
    const suggestion = await followUpAnalysisService.analyzeFollowUpTiming({
      customerId: customer.id,
      customerName: customer.name,
      industry: customer.industry || undefined,
      lastContactDate: customer.lastContactDate,
      recordings: customer.recordings.map(r => ({
        sentiment: r.sentiment || 'neutral',
        summary: r.summary || undefined,
        recordedAt: r.recordedAt,
      })),
      opportunities: customer.opportunities.map(o => ({
        stage: o.stage,
        value: Number(o.value),
        lastActivity: o.lastActivity,
      })),
      scheduleTasks: customer.scheduleTasks.map(t => ({
        type: t.type,
        status: t.status,
        dueDate: t.dueDate,
      })),
    });

    // 保存建议到数据库
    const savedSuggestion = await prisma.followUpSuggestion.create({
      data: {
        customerId,
        type: suggestion.type,
        priority: suggestion.priority,
        reason: suggestion.reason,
        suggestedAt: suggestion.suggestedAt,
        expiresAt: suggestion.expiresAt,
        status: 'pending',
      },
    });

    // 更新客户的最后分析时间
    await prisma.customer.update({
      where: { id: customerId },
      data: { lastAnalysisAt: new Date() },
    });

    res.json({
      success: true,
      data: {
        ...savedSuggestion,
        customer: {
          id: customer.id,
          name: customer.name,
          company: customer.company,
          shortName: customer.shortName,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 更新跟进建议状态
 */
export const updateSuggestionStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'completed', 'dismissed'].includes(status)) {
      res.status(400).json({
        success: false,
        message: '无效的状态值',
      });
      return;
    }

    const suggestion = await prisma.followUpSuggestion.update({
      where: { id },
      data: { status },
    });

    res.json({
      success: true,
      data: suggestion,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 生成跟进话术
 */
export const generateScript = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      customerId,
      contactName,
      contactType,
      purpose,
      previousContext,
    } = req.body as {
      customerId: string;
      contactName?: string;
      contactType: 'call' | 'visit' | 'email' | 'wechat';
      purpose: string;
      previousContext?: string;
    };

    if (!customerId || !contactType || !purpose) {
      res.status(400).json({
        success: false,
        message: '缺少必要参数',
      });
      return;
    }

    // 获取客户信息
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        recordings: {
          where: { status: 'analyzed' },
          orderBy: { recordedAt: 'desc' },
          take: 3,
          select: {
            keywords: true,
            summary: true,
          },
        },
      },
    });

    if (!customer) {
      res.status(404).json({
        success: false,
        message: '客户不存在',
      });
      return;
    }

    // 从录音中提取痛点
    const painPoints: string[] = [];
    const interests: string[] = [];
    
    for (const recording of customer.recordings) {
      if (recording.keywords) {
        const keywords = recording.keywords as string[];
        interests.push(...keywords.slice(0, 2));
      }
    }

    // 调用AI服务生成话术
    const result = await followUpAnalysisService.generateScript({
      customerName: customer.name,
      contactName,
      industry: customer.industry || undefined,
      contactType,
      purpose,
      previousContext,
      painPoints: [...new Set(painPoints)],
      interests: [...new Set(interests)].slice(0, 5),
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 生成日报/周报
 */
export const generateReport = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const { type = 'daily', date } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: '未授权',
      });
      return;
    }

    // 获取用户信息
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: '用户不存在',
      });
      return;
    }

    // 计算日期范围
    const reportDate = date ? new Date(date) : new Date();
    const startDate = new Date(reportDate);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(startDate);
    if (type === 'weekly') {
      endDate.setDate(endDate.getDate() + 7);
    } else {
      endDate.setDate(endDate.getDate() + 1);
    }

    // 获取活动数据
    const [customers, opportunities, tasks, recordings, payments] = await Promise.all([
      // 客户
      prisma.customer.findMany({
        where: {
          ownerId: userId,
          createdAt: { gte: startDate, lt: endDate },
        },
        select: {
          name: true,
          stage: true,
          lastContactDate: true,
        },
      }),
      // 商机
      prisma.opportunity.findMany({
        where: {
          ownerId: userId,
          updatedAt: { gte: startDate, lt: endDate },
        },
        include: {
          customer: {
            select: { name: true },
          },
        },
      }),
      // 任务
      prisma.scheduleTask.findMany({
        where: {
          assigneeId: userId,
          updatedAt: { gte: startDate, lt: endDate },
        },
        include: {
          customer: {
            select: { name: true },
          },
        },
      }),
      // 录音
      prisma.audioRecording.findMany({
        where: {
          createdBy: { id: userId },
          recordedAt: { gte: startDate, lt: endDate },
        },
        include: {
          customer: {
            select: { name: true },
          },
        },
      }),
      // 回款
      prisma.payment.findMany({
        where: {
          paidDate: { gte: startDate, lt: endDate },
        },
        include: {
          customer: {
            select: { name: true },
          },
        },
      }),
    ]);

    // 计算统计数据
    const stats = {
      totalCalls: recordings.length,
      totalMeetings: tasks.filter(t => t.type === 'meeting').length,
      totalVisits: tasks.filter(t => t.type === 'visit').length,
      totalRecordings: recordings.length,
      newCustomers: customers.filter(c => c.stage === 'new').length,
      opportunityValue: opportunities.reduce((sum, o) => sum + Number(o.value), 0),
      closedDeals: opportunities.filter(o => o.stage === 'won').length,
    };

    // 调用AI服务生成报告
    const report = await reportGenerationService.generateReport({
      userId,
      userName: user.name,
      date: reportDate,
      type,
      activities: {
        customers: customers.map(c => ({
          name: c.name,
          stage: c.stage,
          lastContact: c.lastContactDate ?? undefined,
        })),
        opportunities: opportunities.map(o => ({
          title: o.title,
          customerName: o.customer.name,
          stage: o.stage,
          value: Number(o.value),
        })),
        tasks: tasks.map(t => ({
          title: t.title,
          type: t.type,
          status: t.status,
          customerName: t.customer?.name,
        })),
        recordings: recordings.map(r => ({
          customerName: r.customer.name,
          duration: r.duration,
          sentiment: r.sentiment || 'neutral',
          summary: r.summary || undefined,
        })),
        payments: payments.map(p => ({
          customerName: p.customer.name,
          amount: Number(p.paidAmount),
          status: p.status,
        })),
      },
      stats,
    });

    // 保存报告到数据库
    const savedReport = await prisma.dailyReport.create({
      data: {
        userId,
        date: reportDate,
        type,
        content: report.content,
        summary: report.summary,
        highlights: report.highlights,
        risks: report.risks,
        nextActions: report.nextActions,
      },
    });

    res.json({
      success: true,
      data: {
        ...savedReport,
        stats,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 获取报告列表
 */
export const getReports = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const { type, page = 1, limit = 10 } = req.query;

    const where: any = { userId };
    if (type) {
      where.type = type;
    }

    const [reports, total] = await Promise.all([
      prisma.dailyReport.findMany({
        where,
        orderBy: { date: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
      }),
      prisma.dailyReport.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        items: reports,
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 获取报告详情
 */
export const getReportById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const report = await prisma.dailyReport.findFirst({
      where: { id, userId },
    });

    if (!report) {
      res.status(404).json({
        success: false,
        message: '报告不存在',
      });
      return;
    }

    res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 更新报告内容
 */
export const updateReport = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const { content, summary, highlights, risks, nextActions } = req.body;

    const report = await prisma.dailyReport.findFirst({
      where: { id, userId },
    });

    if (!report) {
      res.status(404).json({
        success: false,
        message: '报告不存在',
      });
      return;
    }

    const updatedReport = await prisma.dailyReport.update({
      where: { id },
      data: {
        content,
        summary,
        highlights,
        risks,
        nextActions,
      },
    });

    res.json({
      success: true,
      data: updatedReport,
    });
  } catch (error) {
    next(error);
  }
};