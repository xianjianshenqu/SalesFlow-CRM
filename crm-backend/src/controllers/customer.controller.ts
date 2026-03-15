import { Request, Response } from 'express';
import customerService from '../services/customer.service';
import { asyncHandler, sendResponse, sendPaginatedResponse } from '../utils/response';

export class CustomerController {
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const { stage, priority, source, search } = req.query;

    const result = await customerService.findAll({
      page,
      pageSize,
      stage: stage as string,
      priority: priority as string,
      source: source as string,
      search: search as string,
    });

    sendPaginatedResponse(res, result.data, result.page, result.pageSize, result.total);
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const customer = await customerService.findById(id);
    sendResponse(res, 200, customer);
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const customer = await customerService.create(req.body, userId);
    sendResponse(res, 201, customer, 'Customer created successfully');
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const customer = await customerService.update(id, req.body);
    sendResponse(res, 200, customer, 'Customer updated successfully');
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await customerService.delete(id);
    sendResponse(res, 200, result);
  });

  getStats = asyncHandler(async (_req: Request, res: Response) => {
    const stats = await customerService.getStats();
    sendResponse(res, 200, stats);
  });

  getDistribution = asyncHandler(async (_req: Request, res: Response) => {
    const distribution = await customerService.getCustomerDistribution();
    sendResponse(res, 200, distribution);
  });
}

export default new CustomerController();