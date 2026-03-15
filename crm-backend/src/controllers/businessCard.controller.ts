import { Request, Response } from 'express';
import businessCardService from '../services/businessCard.service';
import { asyncHandler, sendResponse, sendPaginatedResponse } from '../utils/response';

export class BusinessCardController {
  // 上传并扫描名片
  uploadAndScan = asyncHandler(async (req: Request, res: Response) => {
    const { imageUrl } = req.body;
    const userId = req.user?.userId;

    if (!imageUrl) {
      return sendResponse(res, 400, null, '请提供名片图片URL');
    }

    const result = await businessCardService.uploadAndScan(imageUrl, userId);
    sendResponse(res, 201, result, '名片扫描成功');
  });

  // 从名片创建客户
  createCustomer = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.userId;
    const result = await businessCardService.createCustomerFromCard(id, req.body, userId);
    sendResponse(res, 201, result, '客户创建成功');
  });

  // 获取名片列表
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const { status } = req.query;

    const result = await businessCardService.findAll({
      page,
      pageSize,
      status: status as string,
    });

    sendPaginatedResponse(res, result.data, result.page, result.pageSize, result.total);
  });

  // 获取单个名片
  getById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const card = await businessCardService.findById(id);
    sendResponse(res, 200, card);
  });

  // 删除名片
  delete = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await businessCardService.delete(id);
    sendResponse(res, 200, result);
  });
}

export default new BusinessCardController();