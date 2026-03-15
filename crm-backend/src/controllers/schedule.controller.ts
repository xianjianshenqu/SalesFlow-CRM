import { Request, Response, NextFunction } from 'express';
import scheduleService from '../services/schedule.service';
import { success, created } from '../utils/response';
import { AppError } from '../middlewares/errorHandler';

/**
 * 日程任务控制器
 */
class ScheduleController {
  /**
   * 创建日程任务
   * @route POST /api/v1/schedules
   */
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(401, '用户未认证', 'UNAUTHORIZED');
      }

      const schedule = await scheduleService.create(req.body, userId);
      return created(res, schedule, '日程创建成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取日程列表
   * @route GET /api/v1/schedules
   */
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await scheduleService.getAll(req.query as any);
      return success(res, result, '获取日程列表成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取日程详情
   * @route GET /api/v1/schedules/:id
   */
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const schedule = await scheduleService.getById(id);

      if (!schedule) {
        throw new AppError(404, '日程不存在', 'NOT_FOUND');
      }

      return success(res, schedule, '获取日程详情成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 更新日程
   * @route PUT /api/v1/schedules/:id
   */
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const schedule = await scheduleService.update(id, req.body);
      return success(res, schedule, '日程更新成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 更新任务状态
   * @route PATCH /api/v1/schedules/:id/status
   */
  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const schedule = await scheduleService.updateStatus(id, req.body);
      return success(res, schedule, '状态更新成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 删除日程
   * @route DELETE /api/v1/schedules/:id
   */
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await scheduleService.delete(id);
      return success(res, null, '日程删除成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取今日日程
   * @route GET /api/v1/schedules/today
   */
  async getToday(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(401, '用户未认证', 'UNAUTHORIZED');
      }

      const tasks = await scheduleService.getToday(userId);
      return success(res, tasks, '获取今日日程成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取日程统计
   * @route GET /api/v1/schedules/stats
   */
  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const stats = await scheduleService.getStats(userId);
      return success(res, stats, '获取日程统计成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取AI建议
   * @route GET /api/v1/schedules/ai-suggestions
   */
  async getAISuggestions(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(401, '用户未认证', 'UNAUTHORIZED');
      }

      const suggestions = await scheduleService.getAISuggestions(userId);
      return success(res, suggestions, '获取AI建议成功');
    } catch (error) {
      next(error);
    }
  }
}

export default new ScheduleController();