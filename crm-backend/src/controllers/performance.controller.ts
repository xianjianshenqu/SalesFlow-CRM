import { Request, Response, NextFunction } from 'express';
import performanceService from '../services/performance.service';
import { success, created } from '../utils/response';
import { AppError } from '../middlewares/errorHandler';

/**
 * 销售绩效控制器
 */
class PerformanceController {
  // ==================== 绩效数据管理 ====================

  /**
   * 记录绩效数据
   * @route POST /api/v1/performance/record
   */
  async recordPerformance(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await performanceService.recordPerformance(req.body);
      return created(res, result, '绩效数据记录成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 批量记录绩效数据
   * @route POST /api/v1/performance/record/batch
   */
  async batchRecordPerformance(req: Request, res: Response, next: NextFunction) {
    try {
      const { records } = req.body;
      if (!Array.isArray(records)) {
        throw new AppError(400, 'records必须是数组', 'INVALID_INPUT');
      }
      const result = await performanceService.batchRecordPerformance(records);
      return created(res, result, '批量记录成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取绩效记录列表
   * @route GET /api/v1/performance/records
   */
  async getRecords(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await performanceService.getPerformanceRecords(req.query as any);
      return success(res, result, '获取绩效记录成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取用户绩效详情
   * @route GET /api/v1/performance/user/:userId
   */
  async getUserPerformance(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const { startDate, endDate } = req.query;
      const result = await performanceService.getUserPerformance(
        userId,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );
      return success(res, result, '获取用户绩效成功');
    } catch (error) {
      next(error);
    }
  }

  // ==================== 绩效仪表盘 ====================

  /**
   * 获取绩效仪表盘
   * @route GET /api/v1/performance/dashboard
   */
  async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(401, '用户未认证', 'UNAUTHORIZED');
      }
      const result = await performanceService.getDashboard(userId);
      return success(res, result, '获取仪表盘成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取绩效趋势
   * @route GET /api/v1/performance/trends
   */
  async getTrends(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(401, '用户未认证', 'UNAUTHORIZED');
      }
      const days = parseInt(req.query.days as string) || 30;
      const result = await performanceService.getTrends(userId, days);
      return success(res, result, '获取趋势成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * AI绩效分析
   * @route GET /api/v1/performance/analysis
   */
  async analyzePerformance(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(401, '用户未认证', 'UNAUTHORIZED');
      }
      const period = (req.query.period as 'daily' | 'weekly' | 'monthly') || 'weekly';
      const result = await performanceService.analyzePerformance(userId, period);
      return success(res, result, '绩效分析完成');
    } catch (error) {
      next(error);
    }
  }

  // ==================== 教练建议 ====================

  /**
   * 生成教练建议
   * @route POST /api/v1/performance/coaching/generate
   */
  async generateCoaching(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(401, '用户未认证', 'UNAUTHORIZED');
      }
      const result = await performanceService.generateCoachingSuggestions(userId);
      return created(res, result, '教练建议生成成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取教练建议列表
   * @route GET /api/v1/performance/coaching
   */
  async getCoachingSuggestions(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(401, '用户未认证', 'UNAUTHORIZED');
      }
      const { status } = req.query;
      const result = await performanceService.getCoachingSuggestions(userId, status as string);
      return success(res, result, '获取建议列表成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 完成教练建议
   * @route POST /api/v1/performance/coaching/:id/complete
   */
  async completeCoachingSuggestion(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await performanceService.completeCoachingSuggestion(id);
      return success(res, result, '建议已标记完成');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 忽略教练建议
   * @route POST /api/v1/performance/coaching/:id/dismiss
   */
  async dismissCoachingSuggestion(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await performanceService.dismissCoachingSuggestion(id);
      return success(res, result, '建议已忽略');
    } catch (error) {
      next(error);
    }
  }

  // ==================== 团队排名与统计 ====================

  /**
   * 获取团队排名
   * @route GET /api/v1/performance/ranking
   */
  async getTeamRanking(req: Request, res: Response, next: NextFunction) {
    try {
      const { department, limit } = req.query;
      const result = await performanceService.getTeamRanking(
        department as string,
        limit ? parseInt(limit as string) : 10
      );
      return success(res, result, '获取团队排名成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取绩效统计概览
   * @route GET /api/v1/performance/stats
   */
  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const { department } = req.query;
      const result = await performanceService.getStats(department as string);
      return success(res, result, '获取统计成功');
    } catch (error) {
      next(error);
    }
  }
}

export default new PerformanceController();