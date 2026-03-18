import { Request, Response, NextFunction } from 'express';
import proposalService from '../services/proposal.service';
import { success, created } from '../utils/response';
import { AppError } from '../middlewares/errorHandler';

/**
 * 商务方案控制器
 */
class ProposalController {
  /**
   * 创建方案
   * @route POST /api/v1/proposals
   */
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(401, '用户未认证', 'UNAUTHORIZED');
      }

      const proposal = await proposalService.create(req.body, userId);
      return created(res, proposal, '方案创建成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取方案列表
   * @route GET /api/v1/proposals
   */
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await proposalService.getAll(req.query as any);
      return success(res, result, '获取方案列表成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取方案详情
   * @route GET /api/v1/proposals/:id
   */
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const proposal = await proposalService.getById(id);

      if (!proposal) {
        throw new AppError(404, '方案不存在', 'NOT_FOUND');
      }

      return success(res, proposal, '获取方案详情成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 更新方案
   * @route PUT /api/v1/proposals/:id
   */
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const proposal = await proposalService.update(id, req.body);
      return success(res, proposal, '方案更新成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 更新方案状态
   * @route PATCH /api/v1/proposals/:id/status
   */
  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const proposal = await proposalService.updateStatus(id, req.body);
      return success(res, proposal, '状态更新成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 删除方案
   * @route DELETE /api/v1/proposals/:id
   */
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await proposalService.delete(id);
      return success(res, null, '方案删除成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * AI生成方案
   * @route POST /api/v1/proposals/:id/generate
   */
  async generateWithAI(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await proposalService.generateWithAI(id);
      return success(res, result, 'AI生成方案成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 发送方案
   * @route POST /api/v1/proposals/:id/send
   */
  async send(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await proposalService.send(id);
      return success(res, result, '方案发送成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * AI智能生成完整方案
   * @route POST /api/v1/proposals/:id/smart-generate
   */
  async generateSmartProposal(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await proposalService.generateSmartProposal(id);
      return success(res, result, 'AI智能方案生成成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取智能定价策略
   * @route GET /api/v1/proposals/:id/pricing-strategy
   */
  async getPricingStrategy(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await proposalService.getPricingStrategy(id);
      return success(res, result, '获取定价策略成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取推荐产品组合
   * @route GET /api/v1/proposals/:id/recommend-products
   */
  async getRecommendedProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await proposalService.getRecommendedProducts(id);
      return success(res, result, '获取产品推荐成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取方案统计
   * @route GET /api/v1/proposals/stats
   */
  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const { customerId } = req.query;
      const stats = await proposalService.getStats(customerId as string);
      return success(res, stats, '获取方案统计成功');
    } catch (error) {
      next(error);
    }
  }

  // ==================== 模板管理控制器 ====================

  /**
   * 获取模板列表
   * @route GET /api/v1/proposals/templates
   */
  async getTemplates(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await proposalService.getTemplates(req.query as any);
      return success(res, result, '获取模板列表成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 创建模板
   * @route POST /api/v1/proposals/templates
   */
  async createTemplate(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(401, '用户未认证', 'UNAUTHORIZED');
      }
      const template = await proposalService.createTemplate(req.body, userId);
      return created(res, template, '模板创建成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 克隆模板
   * @route POST /api/v1/proposals/templates/:id/clone
   */
  async cloneTemplate(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(401, '用户未认证', 'UNAUTHORIZED');
      }
      const template = await proposalService.cloneTemplate(id, userId);
      return success(res, template, '模板克隆成功');
    } catch (error) {
      next(error);
    }
  }

  // ==================== 需求分析阶段控制器 ====================

  /**
   * 创建需求分析
   * @route POST /api/v1/proposals/:id/requirement-analysis
   */
  async createRequirementAnalysis(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const analysis = await proposalService.createRequirementAnalysis(id, req.body);
      return created(res, analysis, '需求分析创建成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取需求分析
   * @route GET /api/v1/proposals/:id/requirement-analysis
   */
  async getRequirementAnalysis(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const analysis = await proposalService.getRequirementAnalysis(id);
      return success(res, analysis, '获取需求分析成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * AI分析需求
   * @route POST /api/v1/proposals/:id/requirement-analysis/ai-analyze
   */
  async aiAnalyzeRequirement(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { sourceType, recordingId } = req.body;
      const result = await proposalService.aiAnalyzeRequirement(id, sourceType, recordingId);
      return success(res, result, 'AI分析需求成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * AI补充需求
   * @route POST /api/v1/proposals/:id/requirement-analysis/ai-enhance
   */
  async aiEnhanceRequirement(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await proposalService.aiEnhanceRequirement(id);
      return success(res, result, 'AI补充需求成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 更新需求分析
   * @route PUT /api/v1/proposals/:id/requirement-analysis
   */
  async updateRequirementAnalysis(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const analysis = await proposalService.updateRequirementAnalysis(id, req.body);
      return success(res, analysis, '需求分析更新成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 确认需求分析
   * @route POST /api/v1/proposals/:id/requirement-analysis/confirm
   */
  async confirmRequirementAnalysis(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { finalContent } = req.body;
      const proposal = await proposalService.confirmRequirementAnalysis(id, finalContent);
      return success(res, proposal, '需求分析确认成功');
    } catch (error) {
      next(error);
    }
  }

  // ==================== 方案设计阶段控制器 ====================

  /**
   * 开始方案设计
   * @route POST /api/v1/proposals/:id/design
   */
  async startDesign(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const proposal = await proposalService.startDesign(id);
      return success(res, proposal, '开始方案设计成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * AI匹配模板
   * @route POST /api/v1/proposals/:id/design/match-template
   */
  async matchTemplate(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const templates = await proposalService.matchTemplate(id, req.body);
      return success(res, templates, '模板匹配成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 应用模板生成方案
   * @route POST /api/v1/proposals/:id/design/apply-template
   */
  async applyTemplate(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { templateId } = req.body;
      const proposal = await proposalService.applyTemplate(id, templateId);
      return success(res, proposal, '应用模板成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 更新方案设计
   * @route PUT /api/v1/proposals/:id/design
   */
  async updateDesign(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const proposal = await proposalService.updateDesign(id, req.body);
      return success(res, proposal, '方案设计更新成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 确认方案设计
   * @route POST /api/v1/proposals/:id/design/confirm
   */
  async confirmDesign(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const proposal = await proposalService.confirmDesign(id);
      return success(res, proposal, '方案设计确认成功');
    } catch (error) {
      next(error);
    }
  }

  // ==================== 内部评审阶段控制器 ====================

  /**
   * 发起内部评审
   * @route POST /api/v1/proposals/:id/review
   */
  async createReview(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const review = await proposalService.createReview(id, req.body);
      return created(res, review, '发起评审成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取评审信息
   * @route GET /api/v1/proposals/:id/review
   */
  async getReview(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const review = await proposalService.getReview(id);
      return success(res, review, '获取评审信息成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 添加评审意见
   * @route POST /api/v1/proposals/:id/review/comment
   */
  async addReviewComment(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(401, '用户未认证', 'UNAUTHORIZED');
      }
      const { comment } = req.body;
      const review = await proposalService.addReviewComment(id, userId, comment);
      return success(res, review, '添加评审意见成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 评审通过
   * @route POST /api/v1/proposals/:id/review/approve
   */
  async approveReview(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { resultNotes } = req.body;
      const proposal = await proposalService.approveReview(id, resultNotes);
      return success(res, proposal, '评审通过成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 评审驳回
   * @route POST /api/v1/proposals/:id/review/reject
   */
  async rejectReview(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { resultNotes } = req.body;
      const proposal = await proposalService.rejectReview(id, resultNotes);
      return success(res, proposal, '评审驳回成功');
    } catch (error) {
      next(error);
    }
  }

  // ==================== 客户提案阶段控制器 ====================

  /**
   * 创建客户提案
   * @route POST /api/v1/proposals/:id/customer-proposal
   */
  async createCustomerProposalRecord(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const customerProposal = await proposalService.createCustomerProposalRecord(id, req.body);
      return created(res, customerProposal, '创建客户提案成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取客户提案信息
   * @route GET /api/v1/proposals/:id/customer-proposal
   */
  async getCustomerProposalRecord(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const customerProposal = await proposalService.getCustomerProposalRecord(id);
      return success(res, customerProposal, '获取客户提案信息成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 生成邮件模板
   * @route POST /api/v1/proposals/:id/customer-proposal/generate-email
   */
  async generateEmailTemplate(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const emailTemplate = await proposalService.generateEmailTemplate(id);
      return success(res, emailTemplate, '生成邮件模板成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 更新邮件内容
   * @route PUT /api/v1/proposals/:id/customer-proposal/email
   */
  async updateCustomerProposalEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const customerProposal = await proposalService.updateCustomerProposalEmail(id, req.body);
      return success(res, customerProposal, '更新邮件内容成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 发送客户提案
   * @route POST /api/v1/proposals/:id/customer-proposal/send
   */
  async sendCustomerProposal(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const proposal = await proposalService.sendCustomerProposal(id);
      return success(res, proposal, '发送客户提案成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 邮件打开跟踪
   * @route GET /api/v1/proposals/track/:token
   */
  async trackEmailOpen(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.params;
      const result = await proposalService.trackEmailOpen(token);
      return success(res, result, '跟踪记录更新成功');
    } catch (error) {
      next(error);
    }
  }

  // ==================== 商务谈判阶段控制器 ====================

  /**
   * 创建商务谈判
   * @route POST /api/v1/proposals/:id/negotiation
   */
  async createNegotiation(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const negotiation = await proposalService.createNegotiation(id);
      return created(res, negotiation, '创建商务谈判成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取谈判记录
   * @route GET /api/v1/proposals/:id/negotiation
   */
  async getNegotiation(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const negotiation = await proposalService.getNegotiation(id);
      return success(res, negotiation, '获取谈判记录成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 添加讨论记录
   * @route POST /api/v1/proposals/:id/negotiation/discussion
   */
  async addDiscussion(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const negotiation = await proposalService.addDiscussion(id, req.body);
      return success(res, negotiation, '添加讨论记录成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 更新条款
   * @route PUT /api/v1/proposals/:id/negotiation/terms
   */
  async updateNegotiationTerms(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { agreedTerms } = req.body;
      const negotiation = await proposalService.updateAgreedTerms(id, agreedTerms);
      return success(res, negotiation, '更新条款成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 完成谈判
   * @route POST /api/v1/proposals/:id/negotiation/complete
   */
  async completeNegotiation(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const proposal = await proposalService.completeNegotiation(id);
      return success(res, proposal, '完成谈判成功');
    } catch (error) {
      next(error);
    }
  }
}

export default new ProposalController();