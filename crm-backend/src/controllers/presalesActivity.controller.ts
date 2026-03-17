import { Request, Response, NextFunction } from 'express';
import presalesActivityService from '../services/presalesActivity.service';
import { success, created } from '../utils/response';
import { AppError } from '../middlewares/errorHandler';

/**
 * 售前活动控制器
 */
class PresalesActivityController {
  // ==================== 活动管理 ====================

  /**
   * 创建活动
   * @route POST /api/v1/presales/activities
   */
  async createActivity(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(401, '用户未认证', 'UNAUTHORIZED');
      }

      const activity = await presalesActivityService.createActivity(req.body, userId);
      return created(res, activity, '活动创建成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取活动列表
   * @route GET /api/v1/presales/activities
   */
  async getActivities(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await presalesActivityService.getActivities(req.query as any);
      return success(res, result, '获取活动列表成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取活动详情
   * @route GET /api/v1/presales/activities/:id
   */
  async getActivityById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const activity = await presalesActivityService.getActivityById(id);

      if (!activity) {
        throw new AppError(404, '活动不存在', 'NOT_FOUND');
      }

      return success(res, activity, '获取活动详情成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 更新活动
   * @route PUT /api/v1/presales/activities/:id
   */
  async updateActivity(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const activity = await presalesActivityService.updateActivity(id, req.body);
      return success(res, activity, '活动更新成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 删除活动
   * @route DELETE /api/v1/presales/activities/:id
   */
  async deleteActivity(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await presalesActivityService.deleteActivity(id);
      return success(res, null, '活动删除成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 更新活动状态
   * @route PATCH /api/v1/presales/activities/:id/status
   */
  async updateActivityStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const activity = await presalesActivityService.updateActivityStatus(id, status);
      return success(res, activity, '活动状态更新成功');
    } catch (error) {
      next(error);
    }
  }

  // ==================== 审批流程 ====================

  /**
   * 提交审批
   * @route POST /api/v1/presales/activities/:id/submit-approval
   */
  async submitForApproval(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const activity = await presalesActivityService.submitForApproval(id);
      return success(res, activity, '活动已提交审批');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 审批通过
   * @route POST /api/v1/presales/activities/:id/approve
   */
  async approveActivity(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(401, '用户未认证', 'UNAUTHORIZED');
      }

      const { notes } = req.body;
      const activity = await presalesActivityService.approveActivity(id, userId, notes);
      return success(res, activity, '活动审批通过');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 审批拒绝
   * @route POST /api/v1/presales/activities/:id/reject
   */
  async rejectActivity(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(401, '用户未认证', 'UNAUTHORIZED');
      }

      const { notes } = req.body;
      const activity = await presalesActivityService.rejectActivity(id, userId, notes);
      return success(res, activity, '活动已拒绝');
    } catch (error) {
      next(error);
    }
  }

  // ==================== 二维码管理 ====================

  /**
   * 生成二维码
   * @route POST /api/v1/presales/activities/:id/qrcodes
   */
  async createQrCode(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const qrCode = await presalesActivityService.createQrCode(id, req.body);
      return created(res, qrCode, '二维码生成成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取活动二维码列表
   * @route GET /api/v1/presales/activities/:id/qrcodes
   */
  async getQrCodes(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const qrCodes = await presalesActivityService.getQrCodes(id);
      return success(res, qrCodes, '获取二维码列表成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取二维码详情
   * @route GET /api/v1/presales/qrcodes/:qrCodeId
   */
  async getQrCodeById(req: Request, res: Response, next: NextFunction) {
    try {
      const { qrCodeId } = req.params;
      const qrCode = await presalesActivityService.getQrCodeById(qrCodeId);

      if (!qrCode) {
        throw new AppError(404, '二维码不存在', 'NOT_FOUND');
      }

      return success(res, qrCode, '获取二维码详情成功');
    } catch (error) {
      next(error);
    }
  }

  // ==================== 签到功能 ====================

  /**
   * 签到
   * @route POST /api/v1/presales/sign-in
   */
  async signIn(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await presalesActivityService.signIn(req.body);
      return success(res, result, result.isNewCustomer ? '签到成功，新客户已创建' : '签到成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取活动签到记录
   * @route GET /api/v1/presales/activities/:id/sign-ins
   */
  async getSignIns(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await presalesActivityService.getSignIns(id, req.query as any);
      return success(res, result, '获取签到记录成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取签到详情
   * @route GET /api/v1/presales/sign-ins/:signInId
   */
  async getSignInById(req: Request, res: Response, next: NextFunction) {
    try {
      const { signInId } = req.params;
      const signIn = await presalesActivityService.getSignInById(signInId);

      if (!signIn) {
        throw new AppError(404, '签到记录不存在', 'NOT_FOUND');
      }

      return success(res, signIn, '获取签到详情成功');
    } catch (error) {
      next(error);
    }
  }

  // ==================== 问题管理 ====================

  /**
   * 创建问题
   * @route POST /api/v1/presales/sign-ins/:signInId/questions
   */
  async createQuestion(req: Request, res: Response, next: NextFunction) {
    try {
      const { signInId } = req.params;
      const question = await presalesActivityService.createQuestion(signInId, req.body);
      return created(res, question, '问题提交成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取活动问题列表
   * @route GET /api/v1/presales/activities/:id/questions
   */
  async getQuestions(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await presalesActivityService.getQuestions(id, req.query as any);
      return success(res, result, '获取问题列表成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 更新问题
   * @route PATCH /api/v1/presales/questions/:questionId
   */
  async updateQuestion(req: Request, res: Response, next: NextFunction) {
    try {
      const { questionId } = req.params;
      const question = await presalesActivityService.updateQuestion(questionId, req.body);
      return success(res, question, '问题更新成功');
    } catch (error) {
      next(error);
    }
  }

  /**
   * 回答问题
   * @route POST /api/v1/presales/questions/:questionId/answer
   */
  async answerQuestion(req: Request, res: Response, next: NextFunction) {
    try {
      const { questionId } = req.params;
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(401, '用户未认证', 'UNAUTHORIZED');
      }

      const question = await presalesActivityService.answerQuestion(questionId, userId, req.body);
      return success(res, question, '问题回答成功');
    } catch (error) {
      next(error);
    }
  }

  // ==================== 统计 ====================

  /**
   * 获取活动统计
   * @route GET /api/v1/presales/activities/:id/stats
   */
  async getActivityStats(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const stats = await presalesActivityService.getActivityStats(id);
      return success(res, stats, '获取活动统计成功');
    } catch (error) {
      next(error);
    }
  }
}

export default new PresalesActivityController();