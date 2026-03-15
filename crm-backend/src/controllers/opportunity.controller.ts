import { Request, Response } from 'express';
import opportunityService from '../services/opportunity.service';
import { asyncHandler, sendResponse, sendPaginatedResponse } from '../utils/response';

export class OpportunityController {
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const { stage, priority, customerId } = req.query;

    const result = await opportunityService.findAll({
      page,
      pageSize,
      stage: stage as string,
      priority: priority as string,
      customerId: customerId as string,
    });

    sendPaginatedResponse(res, result.data, result.page, result.pageSize, result.total);
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const opportunity = await opportunityService.findById(id);
    sendResponse(res, 200, opportunity);
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const opportunity = await opportunityService.create(req.body, userId);
    sendResponse(res, 201, opportunity, 'Opportunity created successfully');
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const opportunity = await opportunityService.update(id, req.body);
    sendResponse(res, 200, opportunity, 'Opportunity updated successfully');
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await opportunityService.delete(id);
    sendResponse(res, 200, result);
  });

  moveStage = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { stage } = req.body;
    const opportunity = await opportunityService.moveStage(id, stage);
    sendResponse(res, 200, opportunity, 'Stage updated successfully');
  });

  getStats = asyncHandler(async (_req: Request, res: Response) => {
    const stats = await opportunityService.getStats();
    sendResponse(res, 200, stats);
  });
}

export default new OpportunityController();