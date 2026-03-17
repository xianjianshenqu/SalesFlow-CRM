import { Request, Response, NextFunction } from 'express';
import presalesService from '../services/presales.service';
import { success, created } from '../utils/response';
import { AppError } from '../middlewares/errorHandler';

/**
 * 售前中心控制器
 */
class PresalesController {
  // ==================== 资源管理 ====================

  /**
   * 创建售前资源
   * @route POST /api/v1/presales/resources
   */
  async createResource(req: Request, res: Response, next: NextFunction) {
    try {
      const resource = await presalesService.createResource(req.body);
      return created(res, resource, '售前资源创建成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取售前资源列表
   * @route GET /api/v1/presales/resources
   */
  async getResources(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await presalesService.getResources(req.query as any);
      return success(res, result, '获取售前资源列表成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取售前资源详情
   * @route GET /api/v1/presales/resources/:id
   */
  async getResourceById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const resource = await presalesService.getResourceById(id);

      if (!resource) {
        throw new AppError(404, '售前资源不存在', 'NOT_FOUND');
      }

      return success(res, resource, '获取售前资源详情成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 更新售前资源
   * @route PUT /api/v1/presales/resources/:id
   */
  async updateResource(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const resource = await presalesService.updateResource(id, req.body);
      return success(res, resource, '售前资源更新成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 删除售前资源
   * @route DELETE /api/v1/presales/resources/:id
   */
  async deleteResource(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await presalesService.deleteResource(id);
      return success(res, null, '售前资源删除成功');
    } catch (error) {
      next(error);
    }
  }

  // ==================== 请求管理 ====================

  /**
   * 创建售前请求
   * @route POST /api/v1/presales/requests
   */
  async createRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(401, '用户未认证', 'UNAUTHORIZED');
      }

      const request = await presalesService.createRequest(req.body, userId);
      return created(res, request, '售前请求创建成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取售前请求列表
   * @route GET /api/v1/presales/requests
   */
  async getRequests(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await presalesService.getRequests(req.query as any);
      return success(res, result, '获取售前请求列表成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取售前请求详情
   * @route GET /api/v1/presales/requests/:id
   */
  async getRequestById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const request = await presalesService.getRequestById(id);

      if (!request) {
        throw new AppError(404, '售前请求不存在', 'NOT_FOUND');
      }

      return success(res, request, '获取售前请求详情成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 更新售前请求
   * @route PUT /api/v1/presales/requests/:id
   */
  async updateRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const request = await presalesService.updateRequest(id, req.body);
      return success(res, request, '售前请求更新成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 更新请求状态
   * @route PATCH /api/v1/presales/requests/:id/status
   */
  async updateRequestStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const request = await presalesService.updateRequestStatus(id, req.body);
      return success(res, request, '请求状态更新成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 删除售前请求
   * @route DELETE /api/v1/presales/requests/:id
   */
  async deleteRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await presalesService.deleteRequest(id);
      return success(res, null, '售前请求删除成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 智能匹配资源
   * @route GET /api/v1/presales/requests/:id/match
   */
  async matchResources(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await presalesService.matchResources(id);
      return success(res, result, '资源匹配成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * AI智能匹配资源
   * @route GET /api/v1/presales/requests/:id/smart-match
   */
  async smartMatchResources(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await presalesService.smartMatchResources(id);
      return success(res, result, 'AI资源匹配成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 自动分配资源
   * @route POST /api/v1/presales/requests/:id/auto-assign
   */
  async autoAssignResource(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await presalesService.autoAssignResource(id);
      return success(res, result, '自动分配成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取资源负载概览
   * @route GET /api/v1/presales/resources/workload
   */
  async getResourcesWorkloadOverview(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await presalesService.getResourcesWorkloadOverview();
      return success(res, result, '获取资源负载概览成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取售前统计
   * @route GET /api/v1/presales/stats
   */
  async getStats(_req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await presalesService.getStats();
      return success(res, stats, '获取售前统计成功');
    } catch (error) {
      next(error);
    }
  }
}

export default new PresalesController();