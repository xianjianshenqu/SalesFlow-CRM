import { Request, Response } from 'express';
import paymentService from '../services/payment.service';
import { asyncHandler, sendResponse, sendPaginatedResponse } from '../utils/response';

export class PaymentController {
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const { status, customerId } = req.query;

    const result = await paymentService.findAll({
      page,
      pageSize,
      status: status as string,
      customerId: customerId as string,
    });

    sendPaginatedResponse(res, result.data, result.page, result.pageSize, result.total);
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const payment = await paymentService.findById(id);
    sendResponse(res, 200, payment);
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const payment = await paymentService.create(req.body);
    sendResponse(res, 201, payment, 'Payment created successfully');
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const payment = await paymentService.update(id, req.body);
    sendResponse(res, 200, payment, 'Payment updated successfully');
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await paymentService.delete(id);
    sendResponse(res, 200, result);
  });

  getStats = asyncHandler(async (_req: Request, res: Response) => {
    const stats = await paymentService.getStats();
    sendResponse(res, 200, stats);
  });

  getOverdue = asyncHandler(async (_req: Request, res: Response) => {
    const payments = await paymentService.getOverdue();
    sendResponse(res, 200, payments);
  });

  getForecast = asyncHandler(async (_req: Request, res: Response) => {
    const forecast = await paymentService.getForecast();
    sendResponse(res, 200, forecast);
  });
}

export default new PaymentController();