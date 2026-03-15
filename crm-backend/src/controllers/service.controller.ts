import { Request, Response, NextFunction } from 'express';
import serviceService from '../services/service.service';
import { success, created } from '../utils/response';
import { AppError } from '../middlewares/errorHandler';

/**
 * 售后服务控制器
 */
class ServiceController {
  /**
   * 创建服务项目
   * @route POST /api/v1/services
   */
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(401, '用户未认证', 'UNAUTHORIZED');
      }

      const service = await serviceService.create(req.body, userId);
      return created(res, service, '服务项目创建成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取服务项目列表
   * @route GET /api/v1/services
   */
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await serviceService.getAll(req.query as any);
      return success(res, result, '获取服务项目列表成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取服务项目详情
   * @route GET /api/v1/services/:id
   */
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const service = await serviceService.getById(id);

      if (!service) {
        throw new AppError(404, '服务项目不存在', 'NOT_FOUND');
      }

      return success(res, service, '获取服务项目详情成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 更新服务项目
   * @route PUT /api/v1/services/:id
   */
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const service = await serviceService.update(id, req.body);
      return success(res, service, '服务项目更新成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 更新项目进度
   * @route PATCH /api/v1/services/:id/progress
   */
  async updateProgress(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const service = await serviceService.updateProgress(id, req.body);
      return success(res, service, '进度更新成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 删除服务项目
   * @route DELETE /api/v1/services/:id
   */
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await serviceService.delete(id);
      return success(res, null, '服务项目删除成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 添加里程碑
   * @route POST /api/v1/services/:id/milestones
   */
  async addMilestone(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const service = await serviceService.addMilestone(id, req.body);
      return created(res, service, '里程碑添加成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 更新里程碑状态
   * @route PATCH /api/v1/services/:id/milestones/:milestoneId
   */
  async updateMilestone(req: Request, res: Response, next: NextFunction) {
    try {
      const { id, milestoneId } = req.params;
      const service = await serviceService.updateMilestone(id, milestoneId, req.body);
      return success(res, service, '里程碑更新成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取服务统计
   * @route GET /api/v1/services/stats
   */
  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const { customerId } = req.query;
      const stats = await serviceService.getStats(customerId as string);
      return success(res, stats, '获取服务统计成功');
    } catch (error) {
      next(error);
    }
  }
}

export default new ServiceController();