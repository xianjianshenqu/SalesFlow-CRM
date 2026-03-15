import { Request, Response, NextFunction } from 'express';
import dashboardService from '../services/dashboard.service';
import { success } from '../utils/response';
import { AppError } from '../middlewares/errorHandler';

/**
 * 仪表盘控制器
 */
class DashboardController {
  /**
   * 获取概览统计
   * @route GET /api/v1/dashboard/overview
   */
  async getOverview(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const result = await dashboardService.getOverview(userId);
      return success(res, result, '获取概览统计成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取漏斗概览
   * @route GET /api/v1/dashboard/funnel-summary
   */
  async getFunnelSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const result = await dashboardService.getFunnelSummary(userId);
      return success(res, result, '获取漏斗概览成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取AI建议
   * @route GET /api/v1/dashboard/ai-suggestions
   */
  async getAISuggestions(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(401, '用户未认证', 'UNAUTHORIZED');
      }

      const result = await dashboardService.getAISuggestions(userId);
      return success(res, result, '获取AI建议成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取今日日程
   * @route GET /api/v1/dashboard/today-schedule
   */
  async getTodaySchedule(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(401, '用户未认证', 'UNAUTHORIZED');
      }

      const result = await dashboardService.getTodaySchedule(userId);
      return success(res, result, '获取今日日程成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取最近录音
   * @route GET /api/v1/dashboard/recent-recordings
   */
  async getRecentRecordings(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const { limit = '5' } = req.query;
      const result = await dashboardService.getRecentRecordings(userId, parseInt(limit as string));
      return success(res, result, '获取最近录音成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取销售趋势
   * @route GET /api/v1/dashboard/sales-trend
   */
  async getSalesTrend(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const { months = '6' } = req.query;
      const result = await dashboardService.getSalesTrend(userId, parseInt(months as string));
      return success(res, result, '获取销售趋势成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取完整仪表盘数据
   * @route GET /api/v1/dashboard/full
   */
  async getFullDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(401, '用户未认证', 'UNAUTHORIZED');
      }

      const result = await dashboardService.getFullDashboard(userId);
      return success(res, result, '获取仪表盘数据成功');
    } catch (error) {
      next(error);
    }
  }
}

export default new DashboardController();