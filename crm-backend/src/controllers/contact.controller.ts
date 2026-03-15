import { Request, Response } from 'express';
import contactService from '../services/contact.service';
import { asyncHandler, sendResponse } from '../utils/response';

export class ContactController {
  // 获取客户的所有联系人
  getByCustomer = asyncHandler(async (req: Request, res: Response) => {
    const { customerId } = req.params;
    const { role, department, isPrimary, search } = req.query;

    const contacts = await contactService.findByCustomerId(customerId, {
      role: role as string,
      department: department as string,
      isPrimary: isPrimary === 'true' ? true : isPrimary === 'false' ? false : undefined,
      search: search as string,
    });

    sendResponse(res, 200, contacts);
  });

  // 获取单个联系人
  getById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const contact = await contactService.findById(id);
    sendResponse(res, 200, contact);
  });

  // 创建联系人
  create = asyncHandler(async (req: Request, res: Response) => {
    const { customerId } = req.params;
    const userId = req.user?.userId;
    const contact = await contactService.create(customerId, req.body, userId);
    sendResponse(res, 201, contact, 'Contact created successfully');
  });

  // 更新联系人
  update = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const contact = await contactService.update(id, req.body);
    sendResponse(res, 200, contact, 'Contact updated successfully');
  });

  // 删除联系人
  delete = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await contactService.delete(id);
    sendResponse(res, 200, result);
  });

  // 设为主联系人
  setPrimary = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const contact = await contactService.setPrimary(id);
    sendResponse(res, 200, contact, 'Primary contact updated');
  });

  // 批量导入联系人
  batchImport = asyncHandler(async (req: Request, res: Response) => {
    const { customerId } = req.params;
    const userId = req.user?.userId;
    const { contacts } = req.body;
    const result = await contactService.batchImport(customerId, contacts, userId);
    sendResponse(res, 201, result, `${result.length} contacts imported successfully`);
  });

  // 获取联系人统计
  getStats = asyncHandler(async (req: Request, res: Response) => {
    const { customerId } = req.query;
    const stats = await contactService.getStats(customerId as string);
    sendResponse(res, 200, stats);
  });

  // 按部门分组统计
  getByDepartment = asyncHandler(async (req: Request, res: Response) => {
    const { customerId } = req.params;
    const result = await contactService.getByDepartment(customerId);
    sendResponse(res, 200, result);
  });
}

export default new ContactController();