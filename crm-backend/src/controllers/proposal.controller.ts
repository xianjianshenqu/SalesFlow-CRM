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
}

export default new ProposalController();