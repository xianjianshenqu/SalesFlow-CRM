/**
 * 陌生拜访AI助手控制器
 */

import { Request, Response, NextFunction } from 'express';
import coldVisitService from '../services/coldVisit.service';
import { success } from '../utils/response';
import { analyzeCompanySchema, convertToCustomerSchema, getHistorySchema } from '../validators/coldVisit.validator';

/**
 * 分析企业信息
 * POST /api/v1/cold-visit/analyze
 */
export async function analyzeCompany(req: Request, res: Response, next: NextFunction) {
  try {
    const validatedData = analyzeCompanySchema.parse(req.body);
    const userId = req.user?.id;

    const result = await coldVisitService.analyzeCompany(validatedData as any, userId);

    return success(res, result, '企业信息分析完成');
  } catch (error) {
    next(error);
  }
}

/**
 * 将分析记录转换为客户
 * POST /api/v1/cold-visit/:id/convert
 */
export async function convertToCustomer(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const validatedData = convertToCustomerSchema.parse(req.body);
    const userId = req.user?.id;

    const result = await coldVisitService.convertToCustomer(id, validatedData, userId);

    return success(res, result, '已成功转换为客户');
  } catch (error) {
    next(error);
  }
}

/**
 * 获取分析历史记录
 * GET /api/v1/cold-visit/history
 */
export async function getHistory(req: Request, res: Response, next: NextFunction) {
  try {
    const validatedQuery = getHistorySchema.parse(req.query);
    
    const params = {
      page: validatedQuery.page ? parseInt(validatedQuery.page) : undefined,
      limit: validatedQuery.limit ? parseInt(validatedQuery.limit) : undefined,
      status: validatedQuery.status,
      search: validatedQuery.search,
    };

    const result = await coldVisitService.getHistory(params);

    return success(res, result);
  } catch (error) {
    next(error);
  }
}

/**
 * 获取单个分析记录
 * GET /api/v1/cold-visit/:id
 */
export async function getRecord(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const result = await coldVisitService.findById(id);

    return success(res, result);
  } catch (error) {
    next(error);
  }
}

/**
 * 删除分析记录
 * DELETE /api/v1/cold-visit/:id
 */
export async function deleteRecord(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const result = await coldVisitService.delete(id);

    return success(res, result, '记录已删除');
  } catch (error) {
    next(error);
  }
}