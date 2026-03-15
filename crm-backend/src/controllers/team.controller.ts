import { Request, Response, NextFunction } from 'express';
import teamService from '../services/team.service';
import { success, created } from '../utils/response';
import { AppError } from '../middlewares/errorHandler';

/**
 * 团队控制器
 */
class TeamController {
  /**
   * 创建团队成员
   * @route POST /api/v1/team/members
   */
  async createMember(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(401, '用户未认证', 'UNAUTHORIZED');
      }

      const member = await teamService.createMember(req.body, userId);
      return created(res, member, '成员创建成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取团队成员列表
   * @route GET /api/v1/team/members
   */
  async getMembers(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await teamService.getMembers(req.query as any);
      return success(res, result, '获取成员列表成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取团队成员详情
   * @route GET /api/v1/team/members/:id
   */
  async getMemberById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const member = await teamService.getMemberById(id);

      if (!member) {
        throw new AppError(404, '成员不存在', 'NOT_FOUND');
      }

      return success(res, member, '获取成员详情成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 更新团队成员
   * @route PUT /api/v1/team/members/:id
   */
  async updateMember(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const member = await teamService.updateMember(id, req.body);
      return success(res, member, '成员更新成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 删除团队成员
   * @route DELETE /api/v1/team/members/:id
   */
  async deleteMember(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await teamService.deleteMember(id);
      return success(res, null, '成员删除成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取业绩排行
   * @route GET /api/v1/team/ranking
   */
  async getRanking(req: Request, res: Response, next: NextFunction) {
    try {
      const { type = 'revenue', limit = '10' } = req.query;
      const ranking = await teamService.getRanking(
        type as 'revenue' | 'deals' | 'customers',
        parseInt(limit as string)
      );
      return success(res, ranking, '获取排行榜成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取团队统计
   * @route GET /api/v1/team/stats
   */
  async getStats(_req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await teamService.getStats();
      return success(res, stats, '获取团队统计成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取团队活动
   * @route GET /api/v1/team/activities
   */
  async getActivities(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await teamService.getActivities(req.query as any);
      return success(res, result, '获取团队活动成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 创建团队活动
   * @route POST /api/v1/team/activities
   */
  async createActivity(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(401, '用户未认证', 'UNAUTHORIZED');
      }

      // 获取当前用户的成员ID
      const member = await teamService.getMembers({ 
        page: 1, 
        limit: 1, 
        search: userId 
      } as any);

      if (!member.data.length) {
        throw new AppError(400, '用户不是团队成员', 'BAD_REQUEST');
      }

      const activity = await teamService.createActivity(member.data[0].id, req.body);
      return created(res, activity, '活动记录成功');
    } catch (error) {
      next(error);
    }
  }
}

export default new TeamController();