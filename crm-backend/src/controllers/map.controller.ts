import { Request, Response, NextFunction } from 'express';
import mapService from '../services/map.service';
import { success, created } from '../utils/response';
import { AppError } from '../middlewares/errorHandler';

/**
 * 地图控制器
 */
class MapController {
  /**
   * 获取客户分布
   * @route GET /api/v1/map/customers
   */
  async getCustomerDistribution(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await mapService.getCustomerDistribution(req.query as any);
      return success(res, result, '获取客户分布成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取拜访路线列表
   * @route GET /api/v1/map/routes
   */
  async getRoutes(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await mapService.getRoutes(req.query as any);
      return success(res, result, '获取拜访路线成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 创建拜访路线
   * @route POST /api/v1/map/routes
   */
  async createRoute(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(401, '用户未认证', 'UNAUTHORIZED');
      }

      const result = await mapService.createRoute(req.body, userId);
      return created(res, result, '拜访路线创建成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 更新拜访路线
   * @route PUT /api/v1/map/routes/:id
   */
  async updateRoute(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await mapService.updateRoute(id, req.body);
      return success(res, result, '拜访路线更新成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 优化拜访路线
   * @route POST /api/v1/map/routes/optimize
   */
  async optimizeRoute(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await mapService.optimizeRoute(req.body);
      return success(res, result, '路线优化成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取热力图数据
   * @route GET /api/v1/map/heatmap
   */
  async getHeatmapData(_req: Request, res: Response, next: NextFunction) {
    try {
      const result = await mapService.getHeatmapData();
      return success(res, result, '获取热力图数据成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取区域统计
   * @route GET /api/v1/map/regions
   */
  async getRegionStats(_req: Request, res: Response, next: NextFunction) {
    try {
      const result = await mapService.getRegionStats();
      return success(res, result, '获取区域统计成功');
    } catch (error) {
      next(error);
    }
  }
}

export default new MapController();