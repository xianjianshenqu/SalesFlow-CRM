import { Request, Response } from 'express';
import companySearchService from '../services/companySearch.service';
import { asyncHandler, sendResponse } from '../utils/response';

export class CompanySearchController {
  /**
   * 搜索企业
   * GET /api/v1/companies/search?keyword=xxx&limit=10
   */
  search = asyncHandler(async (req: Request, res: Response) => {
    const { keyword, limit } = req.query;

    if (!keyword || typeof keyword !== 'string') {
      sendResponse(res, 200, []);
      return;
    }

    const limitNum = limit ? parseInt(limit as string, 10) : 10;
    const results = await companySearchService.searchCompanies(keyword, limitNum);
    sendResponse(res, 200, results);
  });

  /**
   * 获取企业详情
   * GET /api/v1/companies/:creditCode
   */
  getDetail = asyncHandler(async (req: Request, res: Response) => {
    const { creditCode } = req.params;

    if (!creditCode) {
      sendResponse(res, 400, null, '请提供统一社会信用代码');
      return;
    }

    const company = await companySearchService.getCompanyByCreditCode(creditCode);
    
    if (!company) {
      sendResponse(res, 404, null, '未找到该企业信息');
      return;
    }

    sendResponse(res, 200, company);
  });
}

export default new CompanySearchController();