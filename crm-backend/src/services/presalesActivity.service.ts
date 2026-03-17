import { PrismaClient, ActivityStatus, ApprovalStatus } from '@prisma/client';
import prisma from '../repositories/prisma';
import {
  CreateActivityInput,
  UpdateActivityInput,
  ActivityQueryInput,
  CreateQrCodeInput,
  SignInInput,
  SignInQueryInput,
  CreateQuestionInput,
  UpdateQuestionInput,
  AnswerQuestionInput,
  QuestionQueryInput,
} from '../validators/presalesActivity.validator';
import QRCode from 'qrcode';

/**
 * 售前活动服务 - 处理活动管理、签到和问题相关的业务逻辑
 */
class PresalesActivityService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  // ==================== 活动管理 ====================

  /**
   * 创建活动
   */
  async createActivity(data: CreateActivityInput, userId: string) {
    return this.prisma.presalesActivity.create({
      data: {
        title: data.title,
        type: data.type,
        description: data.description,
        customerId: data.customerId,
        location: data.location,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        status: 'draft',
        approvalStatus: 'none',
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
   * 获取活动列表
   */
  async getActivities(query: ActivityQueryInput) {
    const { page, limit, type, status, approvalStatus, customerId, search, startDate, endDate, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (type) {
      where.type = type;
    }

    if (status) {
      where.status = status as ActivityStatus;
    }

    if (approvalStatus) {
      where.approvalStatus = approvalStatus as ApprovalStatus;
    }

    if (customerId) {
      where.customerId = customerId;
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { location: { contains: search } },
      ];
    }

    if (startDate || endDate) {
      where.startTime = {};
      if (startDate) {
        where.startTime.gte = new Date(startDate);
      }
      if (endDate) {
        where.startTime.lte = new Date(endDate);
      }
    }

    const [total, activities] = await Promise.all([
      this.prisma.presalesActivity.count({ where }),
      this.prisma.presalesActivity.findMany({
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
          _count: {
            select: {
              signIns: true,
              questions: true,
            },
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
   * 获取活动详情
   */
  async getActivityById(id: string) {
    return this.prisma.presalesActivity.findUnique({
      where: { id },
      include: {
        customer: {
          select: { id: true, name: true, company: true, phone: true, email: true },
        },
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        approvedBy: {
          select: { id: true, name: true },
        },
        qrCodes: {
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            signIns: true,
            questions: true,
          },
        },
      },
    });
  }

  /**
   * 更新活动
   */
  async updateActivity(id: string, data: UpdateActivityInput) {
    const updateData: any = { ...data };

    if (data.startTime) {
      updateData.startTime = new Date(data.startTime);
    }

    if (data.endTime) {
      updateData.endTime = new Date(data.endTime);
    }

    if (data.status) {
      updateData.status = data.status as ActivityStatus;
    }

    if (data.customerId === null) {
      updateData.customerId = null;
    }

    return this.prisma.presalesActivity.update({
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
   * 删除活动
   */
  async deleteActivity(id: string) {
    return this.prisma.presalesActivity.delete({
      where: { id },
    });
  }

  /**
   * 更新活动状态
   */
  async updateActivityStatus(id: string, status: ActivityStatus) {
    return this.prisma.presalesActivity.update({
      where: { id },
      data: { status },
    });
  }

  // ==================== 审批流程 ====================

  /**
   * 提交审批
   */
  async submitForApproval(id: string) {
    const activity = await this.getActivityById(id);
    if (!activity) {
      throw new Error('活动不存在');
    }

    if (activity.status !== 'draft') {
      throw new Error('只有草稿状态的活动才能提交审批');
    }

    return this.prisma.presalesActivity.update({
      where: { id },
      data: {
        status: 'pending_approval',
        approvalStatus: 'pending',
      },
    });
  }

  /**
   * 审批通过
   */
  async approveActivity(id: string, userId: string, notes?: string) {
    return this.prisma.presalesActivity.update({
      where: { id },
      data: {
        status: 'approved',
        approvalStatus: 'approved',
        approvedById: userId,
        approvedAt: new Date(),
        approvalNotes: notes,
      },
      include: {
        approvedBy: {
          select: { id: true, name: true },
        },
      },
    });
  }

  /**
   * 审批拒绝
   */
  async rejectActivity(id: string, userId: string, notes?: string) {
    return this.prisma.presalesActivity.update({
      where: { id },
      data: {
        status: 'draft',
        approvalStatus: 'rejected',
        approvedById: userId,
        approvedAt: new Date(),
        approvalNotes: notes,
      },
      include: {
        approvedBy: {
          select: { id: true, name: true },
        },
      },
    });
  }

  // ==================== 二维码管理 ====================

  /**
   * 生成二维码
   */
  async createQrCode(activityId: string, data: CreateQrCodeInput) {
    const activity = await this.getActivityById(activityId);
    if (!activity) {
      throw new Error('活动不存在');
    }

    // 生成唯一ID
    const qrCodeId = crypto.randomUUID();

    // 生成二维码数据
    const qrData = JSON.stringify({
      activityId,
      qrCodeId,
      type: 'presales_signin',
      codeType: data.codeType,
      timestamp: Date.now(),
    });

    // 生成二维码图片URL
    const qrCodeUrl = await QRCode.toDataURL(qrData, {
      width: 400,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    });

    const validFrom = data.validFrom ? new Date(data.validFrom) : new Date();

    return this.prisma.activityQrCode.create({
      data: {
        activityId,
        codeType: data.codeType,
        qrCodeUrl,
        qrCodeData: qrData,
        validFrom,
        validUntil: data.validUntil ? new Date(data.validUntil) : null,
      },
    });
  }

  /**
   * 获取活动二维码列表
   */
  async getQrCodes(activityId: string) {
    return this.prisma.activityQrCode.findMany({
      where: { activityId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { signIns: true },
        },
      },
    });
  }

  /**
   * 获取二维码详情
   */
  async getQrCodeById(qrCodeId: string) {
    return this.prisma.activityQrCode.findUnique({
      where: { id: qrCodeId },
      include: {
        activity: {
          select: {
            id: true,
            title: true,
            type: true,
            startTime: true,
            endTime: true,
            location: true,
          },
        },
        _count: {
          select: { signIns: true },
        },
      },
    });
  }

  /**
   * 验证二维码有效性
   */
  async validateQrCode(qrCodeId: string) {
    const qrCode = await this.prisma.activityQrCode.findUnique({
      where: { id: qrCodeId },
      include: {
        activity: true,
      },
    });

    if (!qrCode) {
      return { valid: false, error: '二维码不存在' };
    }

    if (!qrCode.isActive) {
      return { valid: false, error: '二维码已禁用' };
    }

    const now = new Date();

    if (now < qrCode.validFrom) {
      return { valid: false, error: '二维码尚未生效' };
    }

    if (qrCode.validUntil && now > qrCode.validUntil) {
      return { valid: false, error: '二维码已过期' };
    }

    if (qrCode.activity.status !== 'approved' && qrCode.activity.status !== 'ongoing') {
      return { valid: false, error: '活动未开始或已结束' };
    }

    return { valid: true, qrCode, activity: qrCode.activity };
  }

  // ==================== 签到功能 ====================

  /**
   * 签到
   */
  async signIn(data: SignInInput) {
    // 验证二维码
    const validation = await this.validateQrCode(data.qrCodeId);
    if (!validation.valid || !validation.qrCode || !validation.activity) {
      throw new Error(validation.error || '二维码无效');
    }

    const { qrCode, activity } = validation;

    // 检查客户是否已存在
    let customer = await this.prisma.customer.findFirst({
      where: {
        OR: [
          { phone: data.phone },
          ...(data.email ? [{ email: data.email }] : []),
        ],
      },
    });

    let isNewCustomer = true;

    if (customer) {
      isNewCustomer = false;
      // 更新客户最后联系时间
      await this.prisma.customer.update({
        where: { id: customer.id },
        data: { lastContactDate: new Date() },
      });
    } else {
      // 创建新客户
      customer = await this.prisma.customer.create({
        data: {
          name: data.customerName,
          phone: data.phone,
          email: data.email || null,
          company: data.company || null,
          source: 'presales_activity',
          stage: 'new',
          priority: 'medium',
          contactPerson: data.customerName,
          notes: `来自售前活动: ${activity.title}`,
        },
      });
    }

    // 创建签到记录
    const signIn = await this.prisma.activitySignIn.create({
      data: {
        activityId: activity.id,
        qrCodeId: qrCode.id,
        customerId: customer.id,
        customerName: data.customerName,
        phone: data.phone,
        email: data.email || null,
        company: data.company || null,
        title: data.title || null,
        isNewCustomer,
        notes: data.notes || null,
      },
      include: {
        activity: {
          select: { id: true, title: true },
        },
        customer: {
          select: { id: true, name: true, company: true },
        },
      },
    });

    // 更新二维码扫描次数
    await this.prisma.activityQrCode.update({
      where: { id: qrCode.id },
      data: { scanCount: { increment: 1 } },
    });

    return {
      signIn,
      isNewCustomer,
      customer,
    };
  }

  /**
   * 获取活动签到记录
   */
  async getSignIns(activityId: string, query: SignInQueryInput) {
    const { page, limit, isNewCustomer, search } = query;
    const skip = (page - 1) * limit;

    const where: any = { activityId };

    if (isNewCustomer !== undefined) {
      where.isNewCustomer = isNewCustomer;
    }

    if (search) {
      where.OR = [
        { customerName: { contains: search } },
        { phone: { contains: search } },
        { company: { contains: search } },
      ];
    }

    const [total, signIns] = await Promise.all([
      this.prisma.activitySignIn.count({ where }),
      this.prisma.activitySignIn.findMany({
        where,
        skip,
        take: limit,
        orderBy: { signedAt: 'desc' },
        include: {
          customer: {
            select: { id: true, name: true, company: true },
          },
          _count: {
            select: { questions: true },
          },
        },
      }),
    ]);

    return {
      data: signIns,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * 获取签到详情
   */
  async getSignInById(signInId: string) {
    return this.prisma.activitySignIn.findUnique({
      where: { id: signInId },
      include: {
        activity: {
          select: { id: true, title: true, type: true, location: true },
        },
        customer: {
          select: { id: true, name: true, company: true, phone: true, email: true },
        },
        questions: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  // ==================== 问题管理 ====================

  /**
   * 创建问题
   */
  async createQuestion(signInId: string, data: CreateQuestionInput) {
    const signIn = await this.prisma.activitySignIn.findUnique({
      where: { id: signInId },
      include: { activity: true },
    });

    if (!signIn) {
      throw new Error('签到记录不存在');
    }

    return this.prisma.activityQuestion.create({
      data: {
        activityId: signIn.activityId,
        signInId,
        customerId: signIn.customerId,
        question: data.question,
        category: data.category || null,
        priority: data.priority || null,
      },
      include: {
        activity: {
          select: { id: true, title: true },
        },
        signIn: {
          select: { id: true, customerName: true },
        },
      },
    });
  }

  /**
   * 获取活动问题列表
   */
  async getQuestions(activityId: string, query: QuestionQueryInput) {
    const { page, limit, category, priority, status, search } = query;
    const skip = (page - 1) * limit;

    const where: any = { activityId };

    if (category) {
      where.category = category;
    }

    if (priority) {
      where.priority = priority;
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where.question = { contains: search };
    }

    const [total, questions] = await Promise.all([
      this.prisma.activityQuestion.count({ where }),
      this.prisma.activityQuestion.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          signIn: {
            select: { id: true, customerName: true, company: true },
          },
          customer: {
            select: { id: true, name: true, company: true },
          },
        },
      }),
    ]);

    return {
      data: questions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * 更新问题
   */
  async updateQuestion(questionId: string, data: UpdateQuestionInput) {
    return this.prisma.activityQuestion.update({
      where: { id: questionId },
      data,
    });
  }

  /**
   * 回答问题
   */
  async answerQuestion(questionId: string, userId: string, data: AnswerQuestionInput) {
    return this.prisma.activityQuestion.update({
      where: { id: questionId },
      data: {
        answer: data.answer,
        status: 'answered',
        answeredAt: new Date(),
        answeredBy: userId,
      },
    });
  }

  /**
   * 批量分类问题(使用AI)
   */
  async classifyQuestions(questionIds: string[], classifications: Array<{ category: string; priority: string; aiAnalysis?: any }>) {
    const updates = questionIds.map((id, index) =>
      this.prisma.activityQuestion.update({
        where: { id },
        data: {
          category: classifications[index].category,
          priority: classifications[index].priority,
          aiAnalysis: classifications[index].aiAnalysis || null,
        },
      })
    );

    return Promise.all(updates);
  }

  // ==================== 统计 ====================

  /**
   * 获取活动统计
   */
  async getActivityStats(activityId: string) {
    const [signInStats, questionStats] = await Promise.all([
      this.getSignInStats(activityId),
      this.getQuestionStats(activityId),
    ]);

    return {
      signIns: signInStats,
      questions: questionStats,
    };
  }

  /**
   * 获取签到统计
   */
  private async getSignInStats(activityId: string) {
    const [total, newCustomers, returningCustomers] = await Promise.all([
      this.prisma.activitySignIn.count({ where: { activityId } }),
      this.prisma.activitySignIn.count({ where: { activityId, isNewCustomer: true } }),
      this.prisma.activitySignIn.count({ where: { activityId, isNewCustomer: false } }),
    ]);

    const companyDistribution = await this.prisma.activitySignIn.groupBy({
      by: ['company'],
      where: { activityId, company: { not: null } },
      _count: true,
    });

    return {
      total,
      newCustomers,
      returningCustomers,
      companyDistribution: companyDistribution.slice(0, 10),
    };
  }

  /**
   * 获取问题统计
   */
  private async getQuestionStats(activityId: string) {
    const [total, byCategory, byStatus, byPriority] = await Promise.all([
      this.prisma.activityQuestion.count({ where: { activityId } }),
      this.prisma.activityQuestion.groupBy({
        by: ['category'],
        where: { activityId, category: { not: null } },
        _count: true,
      }),
      this.prisma.activityQuestion.groupBy({
        by: ['status'],
        where: { activityId },
        _count: true,
      }),
      this.prisma.activityQuestion.groupBy({
        by: ['priority'],
        where: { activityId, priority: { not: null } },
        _count: true,
      }),
    ]);

    return {
      total,
      byCategory,
      byStatus,
      byPriority,
    };
  }
}

export default new PresalesActivityService();