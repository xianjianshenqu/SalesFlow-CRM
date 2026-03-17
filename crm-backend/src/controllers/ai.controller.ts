/**
 * AI功能控制器
 * 处理AI相关的API请求
 */

import { Request, Response, NextFunction } from 'express';
import prisma from '../repositories/prisma';
import {
  followUpAnalysisService,
  reportGenerationService,
  opportunityScoringService,
  churnAnalysisService,
  customerInsightService,
} from '../services/ai';

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

// ==================== 商机评分 ====================

/**
 * 计算商机评分
 */
export const calculateOpportunityScore = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    // 获取商机详情
    const opportunity = await prisma.opportunity.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            industry: true,
            stage: true,
          },
        },
        score: true,
      },
    });

    if (!opportunity) {
      res.status(404).json({
        success: false,
        message: '商机不存在',
      });
      return;
    }

    // 获取相关数据
    const [recordings, contacts, scheduleTasks] = await Promise.all([
      prisma.audioRecording.findMany({
        where: { customerId: opportunity.customerId, status: 'analyzed' },
        select: { sentiment: true, recordedAt: true },
        orderBy: { recordedAt: 'desc' },
        take: 10,
      }),
      prisma.contact.findMany({
        where: { customerId: opportunity.customerId },
        select: { role: true, isPrimary: true },
      }),
      prisma.scheduleTask.findMany({
        where: { customerId: opportunity.customerId },
        select: { type: true, status: true },
      }),
    ]);

    // 调用评分服务
    const scoreResult = await opportunityScoringService.analyzeOpportunity({
      opportunityId: opportunity.id,
      customerId: opportunity.customerId,
      customerIndustry: opportunity.customer.industry || undefined,
      customerStage: opportunity.customer.stage,
      value: Number(opportunity.value),
      stage: opportunity.stage,
      expectedCloseDate: opportunity.expectedCloseDate,
      lastActivity: opportunity.lastActivity,
      recordings: recordings.map(r => ({
        sentiment: r.sentiment || 'neutral',
        recordedAt: r.recordedAt,
      })),
      contacts: contacts.map(c => ({
        role: c.role,
        isPrimary: c.isPrimary,
      })),
      scheduleTasks: scheduleTasks.map(t => ({
        type: t.type,
        status: t.status,
      })),
    });

    // 保存评分结果
    const savedScore = await prisma.opportunityScore.upsert({
      where: { opportunityId: id },
      create: {
        opportunityId: id,
        overallScore: scoreResult.overallScore,
        winProbability: scoreResult.winProbability,
        engagementScore: scoreResult.engagementScore,
        budgetScore: scoreResult.budgetScore,
        authorityScore: scoreResult.authorityScore,
        needScore: scoreResult.needScore,
        timingScore: scoreResult.timingScore,
        factors: scoreResult.factors,
        riskFactors: scoreResult.riskFactors,
        recommendations: scoreResult.recommendations,
      },
      update: {
        overallScore: scoreResult.overallScore,
        winProbability: scoreResult.winProbability,
        engagementScore: scoreResult.engagementScore,
        budgetScore: scoreResult.budgetScore,
        authorityScore: scoreResult.authorityScore,
        needScore: scoreResult.needScore,
        timingScore: scoreResult.timingScore,
        factors: scoreResult.factors,
        riskFactors: scoreResult.riskFactors,
        recommendations: scoreResult.recommendations,
      },
    });

    res.json({
      success: true,
      data: savedScore,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 获取商机评分
 */
export const getOpportunityScore = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const score = await prisma.opportunityScore.findUnique({
      where: { opportunityId: id },
    });

    if (!score) {
      res.status(404).json({
        success: false,
        message: '评分不存在，请先计算',
      });
      return;
    }

    res.json({
      success: true,
      data: score,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 获取评分概览
 */
export const getScoreSummary = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;

    // 获取用户负责的商机评分统计
    const opportunities = await prisma.opportunity.findMany({
      where: { ownerId: userId, status: 'active' },
      include: {
        score: true,
        customer: {
          select: { name: true, shortName: true },
        },
      },
    });

    const scoresWithOpportunities = opportunities
      .filter(o => o.score)
      .map(o => ({
        opportunityId: o.id,
        title: o.title,
        customerName: o.customer.name,
        customerShortName: o.customer.shortName,
        value: Number(o.value),
        stage: o.stage,
        overallScore: o.score!.overallScore,
        winProbability: o.score!.winProbability,
      }));

    // 统计数据
    const summary = {
      totalOpportunities: opportunities.length,
      scoredOpportunities: scoresWithOpportunities.length,
      averageScore: scoresWithOpportunities.length > 0
        ? Math.round(scoresWithOpportunities.reduce((sum, o) => sum + o.overallScore, 0) / scoresWithOpportunities.length)
        : 0,
      highScoreCount: scoresWithOpportunities.filter(o => o.overallScore >= 70).length,
      predictedValue: scoresWithOpportunities.reduce((sum, o) => sum + o.value * (o.winProbability / 100), 0),
      topOpportunities: scoresWithOpportunities
        .sort((a, b) => b.overallScore - a.overallScore)
        .slice(0, 5),
    };

    res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    next(error);
  }
};

// ==================== 流失预警 ====================

/**
 * 分析客户流失风险
 */
export const analyzeChurnRisk = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    // 获取客户信息
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        recordings: {
          where: { status: 'analyzed' },
          select: { sentiment: true, recordedAt: true },
          orderBy: { recordedAt: 'desc' },
          take: 10,
        },
        opportunities: {
          select: { stage: true, status: true, lastActivity: true },
        },
        scheduleTasks: {
          select: { status: true, dueDate: true },
        },
        contacts: {
          select: { lastContact: true },
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

    // 调用流失分析服务
    const churnResult = await churnAnalysisService.analyzeChurnRisk({
      customerId: customer.id,
      customerName: customer.name,
      stage: customer.stage,
      lastContactDate: customer.lastContactDate,
      estimatedValue: Number(customer.estimatedValue),
      recordings: customer.recordings.map(r => ({
        sentiment: r.sentiment || 'neutral',
        recordedAt: r.recordedAt,
      })),
      opportunities: customer.opportunities.map(o => ({
        stage: o.stage,
        status: o.status,
        lastActivity: o.lastActivity,
      })),
      scheduleTasks: customer.scheduleTasks.map(t => ({
        status: t.status,
        dueDate: t.dueDate,
      })),
      contacts: customer.contacts.map(c => ({
        lastContact: c.lastContact,
      })),
    });

    // 保存流失预警
    const savedAlert = await prisma.churnAlert.upsert({
      where: { customerId: id },
      create: {
        customerId: id,
        riskLevel: churnResult.riskLevel,
        riskScore: churnResult.riskScore,
        reasons: churnResult.reasons,
        signals: churnResult.signals,
        suggestions: churnResult.suggestions,
      },
      update: {
        riskLevel: churnResult.riskLevel,
        riskScore: churnResult.riskScore,
        reasons: churnResult.reasons,
        signals: churnResult.signals,
        suggestions: churnResult.suggestions,
        status: 'active',
      },
    });

    // 更新客户风险评分
    await prisma.customer.update({
      where: { id },
      data: { riskScore: churnResult.riskScore },
    });

    res.json({
      success: true,
      data: savedAlert,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 获取客户流失预警
 */
export const getChurnAlert = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const alert = await prisma.churnAlert.findFirst({
      where: { customerId: id },
      include: {
        customer: {
          select: { name: true, shortName: true, stage: true },
        },
      },
    });

    if (!alert) {
      res.status(404).json({
        success: false,
        message: '预警不存在，请先分析',
      });
      return;
    }

    res.json({
      success: true,
      data: alert,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 获取流失预警列表
 */
export const getChurnAlerts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const { riskLevel, status, page = 1, limit = 20 } = req.query;

    const where: any = {};
    if (riskLevel) {
      where.riskLevel = riskLevel;
    }
    if (status) {
      where.status = status;
    }
    // 筛选当前用户负责的客户
    where.customer = { ownerId: userId };

    const [alerts, total] = await Promise.all([
      prisma.churnAlert.findMany({
        where,
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              shortName: true,
              stage: true,
              estimatedValue: true,
            },
          },
        },
        orderBy: { riskScore: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
      }),
      prisma.churnAlert.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        items: alerts,
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
 * 处理流失预警
 */
export const handleChurnAlert = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const { action } = req.body; // 'handled' or 'ignored'

    if (!['handled', 'ignored'].includes(action)) {
      res.status(400).json({
        success: false,
        message: '无效的操作类型',
      });
      return;
    }

    const alert = await prisma.churnAlert.update({
      where: { id },
      data: {
        status: action,
        handledAt: new Date(),
        handledBy: userId,
      },
    });

    res.json({
      success: true,
      data: alert,
    });
  } catch (error) {
    next(error);
  }
};

// ==================== 客户画像 ====================

/**
 * 生成客户洞察
 */
export const generateCustomerInsights = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    // 获取客户相关数据
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        recordings: {
          where: { status: 'analyzed' },
          select: {
            transcript: true,
            summary: true,
            keywords: true,
            keyPoints: true,
          },
          orderBy: { recordedAt: 'desc' },
          take: 10,
        },
        contacts: {
          select: {
            name: true,
            title: true,
            department: true,
            role: true,
            notes: true,
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

    // 调用客户洞察服务
    const insightResult = await customerInsightService.extractCustomerInsights({
      customerId: customer.id,
      recordings: customer.recordings.map(r => ({
        transcript: r.transcript || undefined,
        summary: r.summary || undefined,
        keywords: r.keywords as string[] | undefined,
        keyPoints: r.keyPoints as string[] | undefined,
      })),
      contacts: customer.contacts.map(c => ({
        name: c.name,
        title: c.title || undefined,
        department: c.department || undefined,
        role: c.role,
        notes: c.notes || undefined,
      })),
      notes: customer.notes || undefined,
    });

    // 保存洞察结果
    const savedInsight = await prisma.customerInsight.upsert({
      where: { customerId: id },
      create: {
        customerId: id,
        extractedNeeds: insightResult.extractedNeeds,
        extractedBudget: insightResult.extractedBudget,
        decisionMakers: insightResult.decisionMakers,
        painPoints: insightResult.painPoints,
        competitorInfo: insightResult.competitorInfo,
        timeline: insightResult.timeline,
        confidence: insightResult.confidence,
      },
      update: {
        extractedNeeds: insightResult.extractedNeeds,
        extractedBudget: insightResult.extractedBudget,
        decisionMakers: insightResult.decisionMakers,
        painPoints: insightResult.painPoints,
        competitorInfo: insightResult.competitorInfo,
        timeline: insightResult.timeline,
        confidence: insightResult.confidence,
      },
    });

    res.json({
      success: true,
      data: savedInsight,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 获取客户洞察
 */
export const getCustomerInsights = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const insight = await prisma.customerInsight.findUnique({
      where: { customerId: id },
    });

    if (!insight) {
      res.status(404).json({
        success: false,
        message: '洞察不存在，请先生成',
      });
      return;
    }

    res.json({
      success: true,
      data: insight,
    });
  } catch (error) {
    next(error);
  }
};