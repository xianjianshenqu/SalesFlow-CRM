import { Request, Response } from 'express';
import mockCompanySearchService from '../services/companySearch.service';
import qccClient from '../services/search/qcc.client';
import { asyncHandler, sendResponse } from '../utils/response';

// 企业搜索结果类型（与前端 CompanySearchResult 保持一致）
interface CompanySearchResult {
  name: string;
  shortName: string;
  creditCode: string;
  legalPerson: string;
  registeredCapital: number;
  establishDate: string;
  status: string;
  industry: string;
  city: string;
  province: string;
  address: string;
  businessScope: string;
  phone?: string;
  email?: string;
}

export class CompanySearchController {
  /**
   * 搜索企业
   * 数据源优先级：
   * 1. 企查查API（权威工商信息）
   * 2. 模拟数据（降级方案）
   * 
   * GET /api/v1/companies/search?keyword=xxx&limit=10
   */
  search = asyncHandler(async (req: Request, res: Response) => {
    const { keyword, limit } = req.query;

    if (!keyword || typeof keyword !== 'string') {
      sendResponse(res, 200, []);
      return;
    }

    const limitNum = limit ? parseInt(limit as string, 10) : 10;
    const searchTerm = keyword.trim();

    // 1. 优先使用企查查API
    if (qccClient.isConfigured()) {
      try {
        console.log(`[CompanySearchController] 使用企查查API搜索: ${searchTerm}`);
        const qccResults = await qccClient.fuzzySearch(searchTerm, 1);
        
        if (qccResults && qccResults.length > 0) {
          // 转换企查查数据格式为前端期望的格式
          const results: CompanySearchResult[] = qccResults.slice(0, limitNum).map(item => ({
            name: item.Name,
            shortName: item.Name.substring(0, 10), // 简称取企业名前10个字符
            creditCode: item.CreditCode,
            legalPerson: item.OperName || '',
            registeredCapital: 0, // 模糊搜索结果不含注册资本
            establishDate: item.StartDate || '',
            status: item.Status || '',
            industry: '', // 模糊搜索结果不含行业
            city: this.extractCityFromAddress(item.Address),
            province: '',
            address: item.Address || '',
            businessScope: '',
          }));
          
          console.log(`[CompanySearchController] 企查查API返回 ${results.length} 条结果`);
          sendResponse(res, 200, results);
          return;
        }
      } catch (error) {
        console.warn('[CompanySearchController] 企查查API搜索失败，降级到模拟数据:', error);
      }
    } else {
      console.log('[CompanySearchController] 企查查API未配置，使用模拟数据');
    }

    // 2. 降级到模拟数据
    const results = await mockCompanySearchService.searchCompanies(searchTerm, limitNum);
    console.log(`[CompanySearchController] 模拟数据返回 ${results.length} 条结果`);
    sendResponse(res, 200, results);
  });

  /**
   * 获取企业详情
   * 数据源优先级：
   * 1. 企查查API（权威工商信息）
   * 2. 模拟数据（降级方案）
   * 
   * GET /api/v1/companies/:creditCode
   */
  getDetail = asyncHandler(async (req: Request, res: Response) => {
    const { creditCode } = req.params;

    if (!creditCode) {
      sendResponse(res, 400, null, '请提供统一社会信用代码');
      return;
    }

    // 1. 优先使用企查查API
    if (qccClient.isConfigured()) {
      try {
        console.log(`[CompanySearchController] 使用企查查API获取详情: ${creditCode}`);
        const qccResult = await qccClient.getBasicDetailsByName(creditCode);
        
        if (qccResult) {
          // 转换企查查数据格式
          const result: CompanySearchResult = {
            name: qccResult.Name,
            shortName: qccResult.Name.substring(0, 10),
            creditCode: qccResult.CreditCode,
            legalPerson: qccResult.OperName,
            registeredCapital: this.parseRegisteredCapital(qccResult.RegistCapi),
            establishDate: qccResult.StartDate,
            status: qccResult.Status,
            industry: this.extractIndustryFromScope(qccResult.Scope),
            city: qccResult.City || '',
            province: qccResult.Province,
            address: qccResult.Address,
            businessScope: qccResult.Scope,
          };
          
          console.log(`[CompanySearchController] 企查查API返回企业详情: ${result.name}`);
          sendResponse(res, 200, result);
          return;
        }
      } catch (error) {
        console.warn('[CompanySearchController] 企查查API获取详情失败，降级到模拟数据:', error);
      }
    }

    // 2. 降级到模拟数据
    const company = await mockCompanySearchService.getCompanyByCreditCode(creditCode);
    
    if (!company) {
      sendResponse(res, 404, null, '未找到该企业信息');
      return;
    }

    sendResponse(res, 200, company);
  });

  /**
   * 从地址中提取城市
   */
  private extractCityFromAddress(address: string): string {
    if (!address) return '';
    
    // 常见城市匹配
    const cityPatterns = [
      /深圳市|深圳市/, /广州市|广州市/, /北京市|北京市/, /上海市|上海市/,
      /杭州市|杭州市/, /成都市|成都市/, /武汉市|武汉市/, /南京市|南京市/,
      /苏州市|苏州市/, /西安市|西安市/, /重庆市|重庆市/, /天津市|天津市/,
      /郑州市|郑州市/, /长沙市|长沙市/, /青岛市|青岛市/, /宁波市|宁波市/,
      /无锡市|无锡市/, /厦门市|厦门市/, /济南市|济南市/, /合肥市|合肥市/,
    ];
    
    for (const pattern of cityPatterns) {
      const match = address.match(pattern);
      if (match) {
        return match[0].replace('市', '');
      }
    }
    
    return '';
  }

  /**
   * 解析注册资本字符串为数字
   */
  private parseRegisteredCapital(capitalStr: string): number {
    if (!capitalStr) return 0;
    
    // 移除非数字字符，保留小数点
    const numStr = capitalStr.replace(/[^0-9.]/g, '');
    const num = parseFloat(numStr);
    
    // 如果包含"万"，直接返回数字
    if (capitalStr.includes('万')) {
      return num;
    }
    
    // 如果包含"亿"，转换为万
    if (capitalStr.includes('亿')) {
      return num * 10000;
    }
    
    // 默认假设单位为万元
    return num;
  }

  /**
   * 从经营范围提取行业
   */
  private extractIndustryFromScope(scope: string): string {
    if (!scope) return '';
    
    const industryKeywords: Array<{ keywords: string[]; industry: string }> = [
      { keywords: ['软件开发', '信息技术', '互联网', '网络技术', '科技'], industry: '信息技术' },
      { keywords: ['金融', '投资', '资产管理', '基金', '银行'], industry: '金融服务' },
      { keywords: ['制造', '生产', '加工', '工厂'], industry: '制造业' },
      { keywords: ['教育', '培训', '学校'], industry: '教育培训' },
      { keywords: ['医疗', '医药', '医院', '健康', '生物'], industry: '医疗健康' },
      { keywords: ['电子商务', '电商', '零售', '贸易'], industry: '电子商务' },
      { keywords: ['物流', '运输', '仓储', '配送'], industry: '物流运输' },
      { keywords: ['房地产', '物业', '置业'], industry: '房地产' },
      { keywords: ['建筑', '工程', '施工'], industry: '建筑工程' },
      { keywords: ['传媒', '广告', '文化', '影视'], industry: '文化传媒' },
      { keywords: ['能源', '环保', '新能源', '电力'], industry: '能源环保' },
      { keywords: ['农业', '种植', '养殖'], industry: '农业' },
      { keywords: ['汽车', '整车', '零部件'], industry: '汽车制造' },
      { keywords: ['通信', '电信', '移动'], industry: '通信' },
    ];

    for (const { keywords, industry } of industryKeywords) {
      if (keywords.some(kw => scope.includes(kw))) {
        return industry;
      }
    }

    return '';
  }
}

export default new CompanySearchController();