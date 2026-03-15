import { Request, Response, NextFunction } from 'express';
import recordingService from '../services/recording.service';
import { success, created } from '../utils/response';
import { AppError } from '../middlewares/errorHandler';

/**
 * 录音控制器
 */
class RecordingController {
  /**
   * 创建录音
   * @route POST /api/v1/recordings
   */
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(401, '用户未认证', 'UNAUTHORIZED');
      }

      const recording = await recordingService.create(req.body, userId);
      return created(res, recording, '录音创建成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取录音列表
   * @route GET /api/v1/recordings
   */
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await recordingService.getAll(req.query as any);
      return success(res, result, '获取录音列表成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取录音详情
   * @route GET /api/v1/recordings/:id
   */
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const recording = await recordingService.getById(id);

      if (!recording) {
        throw new AppError(404, '录音不存在', 'NOT_FOUND');
      }

      return success(res, recording, '获取录音详情成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 更新录音
   * @route PUT /api/v1/recordings/:id
   */
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const recording = await recordingService.update(id, req.body);
      return success(res, recording, '录音更新成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 删除录音
   * @route DELETE /api/v1/recordings/:id
   */
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await recordingService.delete(id);
      return success(res, null, '录音删除成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 触发AI分析
   * @route POST /api/v1/recordings/:id/analyze
   */
  async analyze(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await recordingService.analyze(id);
      return success(res, result, 'AI分析完成');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取录音统计
   * @route GET /api/v1/recordings/stats
   */
  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const { customerId } = req.query;
      const stats = await recordingService.getStats(customerId as string);
      return success(res, stats, '获取录音统计成功');
    } catch (error) {
      next(error);
    }
  }
}

export default new RecordingController();