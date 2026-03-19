/**
 * 企查查API客户端
 * 官方文档: https://openapi.qcc.com/
 * 
 * 支持的功能:
 * - 企业工商信息查询 (ApiCode: 410)
 * - 企业模糊搜索 (ApiCode: 886)
 * - Token认证 (MD5加密)
 */

import { createHash } from 'crypto';

// ============== 类型定义 ==============

/**
 * 企查查API配置
 */
export interface QCCConfig {
  appKey: string;      // 应用APPKEY
  secretKey: string;   // 应用SecretKey
  baseUrl?: string;    // API基础URL，默认 https://api.qichacha.com
  timeout?: number;    // 请求超时时间（毫秒），默认 10000
}

/**
 * 企业工商信息（完整版）
 * 来源: 企查查 ApiCode 410
 */
export interface QCCCompanyBasicInfo {
  KeyNo: string;                    // 主键
  Name: string;                     // 企业名称
  No: string;                       // 工商注册号/企业编号
  BelongOrg: string;                // 登记机关
  OperId: string;                   // 法定代表人ID
  OperName: string;                 // 法定代表人名称
  StartDate: string;                // 成立日期
  EndDate: string;                  // 吊销日期
  Status: string;                   // 登记状态
  Province: string;                 // 省份
  UpdatedDate: string;              // 更新日期
  CreditCode: string;               // 统一社会信用代码
  RegistCapi: string;               // 注册资本（旧字段）
  RegisteredCapital: string;        // 注册资本数额
  RegisteredCapitalUnit: string;    // 注册资本单位
  RegisteredCapitalCCY: string;     // 注册资本币种
  EconKind: string;                 // 企业类型
  Address: string;                  // 注册地址
  Scope: string;                    // 经营范围
  TermStart: string;                // 营业期限始
  TermEnd: string;                  // 营业期限至
  CheckDate: string;                // 核准日期
  OrgNo: string;                    // 组织机构代码
  IsOnStock: string;                // 是否上市（0-未上市，1-上市）
  StockNumber: string;              // 股票代码
  StockType: string;                // 上市类型
  ImageUrl: string;                 // 企业Logo地址
  EntType: string;                  // 企业性质
  RecCap: string;                   // 实缴资本
  PaidUpCapital: string;            // 实缴出资额数额
  PaidUpCapitalUnit: string;        // 实缴出资额单位
  PaidUpCapitalCCY: string;         // 实缴出资额币种
  Area?: {                          // 行政区域
    Province: string;
    City: string;
    County: string;
  };
  OriginalName?: Array<{            // 曾用名
    Name: string;
    ChangeDate: string;
  }>;
  RevokeInfo?: {                    // 注销吊销信息
    CancelDate: string;
    CancelReason: string;
    RevokeDate: string;
    RevokeReason: string;
  };
}

/**
 * 模糊搜索结果项
 * 来源: 企查查 ApiCode 886
 * 官方文档: https://openapi.qcc.com/dataApi/886
 */
export interface QCCSearchResultItem {
  KeyNo: string;          // 主键
  Name: string;           // 企业名称
  CreditCode: string;     // 统一社会信用代码
  StartDate: string;      // 成立日期
  OperName: string;       // 法定代表人姓名
  Status: string;         // 状态
  No: string;             // 注册号
  Address: string;        // 注册地址
}

/**
 * API响应基础结构
 */
export interface QCCAPIResponse<T> {
  Status: string;         // 状态码：200=成功
  Message: string;        // 消息
  OrderNumber: string;    // 订单号
  Result: T;              // 结果数据
}

/**
 * 企业工商信息查询结果
 */
export interface QCCBasicDetailsResult {
  Id: string;
  Name: string;
  No: string;
  CreditCode: string;
  OperName: string;
  RegistCapi: string;
  StartDate: string;
  Status: string;
  Address: string;
  Scope: string;
  EconKind: string;
  Province: string;
  City?: string;
  TermStart: string;
  TermEnd: string;
  BelongOrg: string;
  IsOnStock: string;
  StockNumber: string;
  StockType: string;
  ImageUrl: string;
  EntType: string;
}

/**
 * 错误信息
 */
export class QCCError extends Error {
  public statusCode: string;
  public orderNumber?: string;

  constructor(message: string, statusCode: string = 'UNKNOWN', orderNumber?: string) {
    super(message);
    this.name = 'QCCError';
    this.statusCode = statusCode;
    this.orderNumber = orderNumber;
  }
}

// ============== 客户端实现 ==============

/**
 * 企查查API客户端类
 */
class QCCClient {
  private config: QCCConfig | null = null;
  private initialized = false;

  /**
   * 初始化客户端
   */
  init(config: QCCConfig): void {
    this.config = {
      baseUrl: 'https://api.qichacha.com',
      timeout: 10000,
      ...config,
    };
    this.initialized = true;
    console.log('[QCC Client] 初始化完成');
  }

  /**
   * 检查是否已配置
   */
  isConfigured(): boolean {
    return this.initialized && 
           !!this.config?.appKey && 
           !!this.config?.secretKey &&
           this.config.appKey !== 'your-qcc-app-key-here' &&
           this.config.secretKey !== 'your-qcc-secret-key-here';
  }

  /**
   * 生成认证Token
   * Token = MD5(key + Timespan + SecretKey).toUpperCase()
   */
  private generateToken(timespan: string): string {
    if (!this.config) {
      throw new QCCError('客户端未初始化', 'NOT_INITIALIZED');
    }
    const raw = `${this.config.appKey}${timespan}${this.config.secretKey}`;
    return createHash('md5').update(raw).digest('hex').toUpperCase();
  }

  /**
   * 获取当前时间戳（秒级）
   */
  private getTimespan(): string {
    return Math.floor(Date.now() / 1000).toString();
  }

  /**
   * 构建请求头
   */
  private buildHeaders(): Record<string, string> {
    const timespan = this.getTimespan();
    const token = this.generateToken(timespan);
    
    return {
      'Token': token,
      'Timespan': timespan,
      'Content-Type': 'application/json',
    };
  }

  /**
   * 发送API请求
   */
  private async request<T>(
    endpoint: string,
    params: Record<string, string>
  ): Promise<QCCAPIResponse<T>> {
    if (!this.config) {
      throw new QCCError('客户端未初始化', 'NOT_INITIALIZED');
    }

    // 构建完整URL
    const url = new URL(`${this.config.baseUrl}${endpoint}`);
    url.searchParams.append('key', this.config.appKey);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    console.log(`[QCC Client] 请求: ${endpoint}?keyword=${params.keyword || params.searchKey || ''}`);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: this.buildHeaders(),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new QCCError(
          `HTTP请求失败: ${response.status} ${response.statusText}`,
          response.status.toString()
        );
      }

      const data = await response.json() as QCCAPIResponse<T>;

      // 检查API状态码
      if (data.Status !== '200') {
        throw new QCCError(
          this.getErrorMessage(data.Status),
          data.Status,
          data.OrderNumber
        );
      }

      return data;
    } catch (error) {
      if (error instanceof QCCError) {
        throw error;
      }
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new QCCError('请求超时', 'TIMEOUT');
        }
        throw new QCCError(`请求失败: ${error.message}`, 'REQUEST_ERROR');
      }
      throw new QCCError('未知错误', 'UNKNOWN');
    }
  }

  /**
   * 根据状态码获取错误信息
   */
  private getErrorMessage(statusCode: string): string {
    const errorMessages: Record<string, string> = {
      '200': '成功',
      '400': '请求参数错误',
      '401': 'Token验证失败',
      '402': '余额不足',
      '403': '无权限访问',
      '404': '数据不存在',
      '405': '请求方法不支持',
      '429': '请求过于频繁',
      '500': '服务器内部错误',
      '601': '接口未开通',
      '602': '应用未审核',
      '603': '应用审核失败',
      '604': '应用已禁用',
      '605': '应用不存在',
    };
    return errorMessages[statusCode] || `未知错误 (${statusCode})`;
  }

  // ============== 公开API方法 ==============

  /**
   * 企业工商信息查询 (ApiCode: 410)
   * 实时查询企业工商信息（含工商照面信息）
   * 
   * @param keyword 企业名称或统一社会信用代码
   * @returns 企业工商信息
   */
  async getBasicDetailsByName(keyword: string): Promise<QCCBasicDetailsResult | null> {
    if (!keyword || keyword.trim().length === 0) {
      return null;
    }

    try {
      const response = await this.request<QCCBasicDetailsResult>(
        '/ECIV4/GetBasicDetailsByName',
        { keyword: keyword.trim() }
      );

      return response.Result;
    } catch (error) {
      // 404表示数据不存在，返回null而不是抛出错误
      if (error instanceof QCCError && error.statusCode === '404') {
        console.log(`[QCC Client] 企业不存在: ${keyword}`);
        return null;
      }
      throw error;
    }
  }

  /**
   * 企业模糊搜索 (ApiCode: 886)
   * 通过搜索关键字（如企业名、人名、产品名、地址、电话、经营范围等）获取匹配的企业
   * 官方文档: https://openapi.qcc.com/dataApi/886
   * 
   * @param searchKey 搜索关键词（企业名称、人名、产品名、地址、电话、经营范围等）
   * @param pageIndex 页码，默认1
   * @returns 搜索结果列表（每次最多返回5条）
   */
  async fuzzySearch(
    searchKey: string,
    pageIndex: number = 1
  ): Promise<QCCSearchResultItem[]> {
    if (!searchKey || searchKey.trim().length === 0) {
      return [];
    }

    try {
      // 官方API端点: /FuzzySearch/GetList
      // 每次请求返回最多5条记录
      const response = await this.request<QCCSearchResultItem[]>(
        '/FuzzySearch/GetList',
        {
          searchKey: searchKey.trim(),
          pageIndex: pageIndex.toString(),
        }
      );

      // 官方返回的Result直接是数组
      return response.Result || [];
    } catch (error) {
      console.error('[QCC Client] 模糊搜索失败:', error);
      return [];
    }
  }

  /**
   * 企业工商详情查询 (ApiCode: 735)
   * 获取更详细的企业信息，包括股东、主要人员等
   * 
   * @param keyNo 企业主键（从搜索结果获取）
   * @returns 企业详情
   */
  async getDetailsByKeyNo(keyNo: string): Promise<QCCCompanyBasicInfo | null> {
    if (!keyNo || keyNo.trim().length === 0) {
      return null;
    }

    try {
      const response = await this.request<QCCCompanyBasicInfo>(
        '/ECIV4/GetDetailsByKeyNo',
        { keyNo: keyNo.trim() }
      );

      return response.Result;
    } catch (error) {
      if (error instanceof QCCError && error.statusCode === '404') {
        return null;
      }
      throw error;
    }
  }

  /**
   * 综合企业信息查询
   * 自动选择最佳查询方式
   * 
   * @param keyword 企业名称或统一社会信用代码
   * @returns 标准化的企业信息
   */
  async searchCompany(keyword: string): Promise<{
    found: boolean;
    data?: {
      name: string;
      creditCode: string;
      legalPerson: string;
      registeredCapital: string;
      establishDate: string;
      status: string;
      industry: string;
      province: string;
      city: string;
      address: string;
      businessScope: string;
      companyType: string;
      isOnStock: boolean;
      stockNumber?: string;
      stockType?: string;
      orgNo: string;
      termStart: string;
      termEnd: string;
      belongOrg: string;
    };
    matches?: QCCSearchResultItem[];
  }> {
    // 首先尝试精确查询
    const basicInfo = await this.getBasicDetailsByName(keyword);
    
    if (basicInfo) {
      // 找到精确匹配
      return {
        found: true,
        data: {
          name: basicInfo.Name,
          creditCode: basicInfo.CreditCode,
          legalPerson: basicInfo.OperName,
          registeredCapital: basicInfo.RegistCapi || '',
          establishDate: basicInfo.StartDate,
          status: basicInfo.Status,
          industry: this.extractIndustry(basicInfo.Scope),
          province: basicInfo.Province,
          city: basicInfo.City || '',
          address: basicInfo.Address,
          businessScope: basicInfo.Scope,
          companyType: basicInfo.EconKind,
          isOnStock: basicInfo.IsOnStock === '1',
          stockNumber: basicInfo.StockNumber || undefined,
          stockType: basicInfo.StockType || undefined,
          orgNo: basicInfo.No,
          termStart: basicInfo.TermStart,
          termEnd: basicInfo.TermEnd,
          belongOrg: basicInfo.BelongOrg,
        },
      };
    }

    // 精确查询失败，尝试模糊搜索
    // 官方API每次最多返回5条记录
    const matches = await this.fuzzySearch(keyword);
    
    if (matches.length > 0) {
      return {
        found: false,
        matches,
      };
    }

    return {
      found: false,
    };
  }

  /**
   * 从经营范围中提取行业
   */
  private extractIndustry(businessScope: string): string {
    const industryKeywords: Array<{ keywords: string[]; industry: string }> = [
      { keywords: ['软件开发', '信息技术', '互联网', '网络技术'], industry: '信息技术' },
      { keywords: ['金融', '投资', '资产管理', '基金'], industry: '金融服务' },
      { keywords: ['制造', '生产', '加工'], industry: '制造业' },
      { keywords: ['教育', '培训', '学校'], industry: '教育培训' },
      { keywords: ['医疗', '医药', '医院', '健康'], industry: '医疗健康' },
      { keywords: ['电子商务', '电商', '零售'], industry: '电子商务' },
      { keywords: ['物流', '运输', '仓储', '配送'], industry: '物流运输' },
      { keywords: ['房地产', '物业管理'], industry: '房地产' },
      { keywords: ['建筑', '工程', '施工'], industry: '建筑工程' },
      { keywords: ['传媒', '广告', '文化', '影视'], industry: '文化传媒' },
      { keywords: ['能源', '环保', '新能源'], industry: '能源环保' },
      { keywords: ['农业', '种植', '养殖'], industry: '农业' },
    ];

    for (const { keywords, industry } of industryKeywords) {
      if (keywords.some(kw => businessScope.includes(kw))) {
        return industry;
      }
    }

    return '其他';
  }

  /**
   * 健康检查
   * 测试API是否可用
   */
  async healthCheck(): Promise<{
    configured: boolean;
    available: boolean;
    message: string;
  }> {
    if (!this.isConfigured()) {
      return {
        configured: false,
        available: false,
        message: '企查查API未配置，请在.env中设置QCC_APP_KEY和QCC_SECRET_KEY',
      };
    }

    try {
      // 使用一个知名企业进行测试
      await this.getBasicDetailsByName('华为技术有限公司');
      return {
        configured: true,
        available: true,
        message: '企查查API连接正常',
      };
    } catch (error) {
      return {
        configured: true,
        available: false,
        message: error instanceof Error ? error.message : '连接失败',
      };
    }
  }
}

// 导出单例
const qccClient = new QCCClient();
export default qccClient;