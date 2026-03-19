/**
 * 企业信息搜索服务
 * 整合网络搜索和AI提取能力，获取真实企业信息
 */

import serperClient, { SearchResult, NewsResult } from './serper.client';
import aiClient, { ChatMessage } from '../ai/client';
import prisma from '../../repositories/prisma';
import { CompanyIntelligenceResult } from '../ai.service';

// 搜索缓存配置
const CACHE_CONFIG = {
  enabled: true,
  ttlHours: 24 * 7, // 缓存7天
};

// 搜索结果缓存接口
interface CachedSearchResult {
  companyName: string;
  intelligenceResult: CompanyIntelligenceResult;
  searchResults?: {
    organic: SearchResult[];
    news: NewsResult[];
  };
  createdAt: Date;
  expiresAt: Date;
}

/**
 * 企业搜索服务类
 */
class CompanySearchService {
  /**
   * 搜索企业信息（主入口）
   * 优先从缓存获取，否则进行网络搜索
   */
  async searchCompany(companyName: string, options?: {
    forceRefresh?: boolean;
    useCache?: boolean;
  }): Promise<CompanyIntelligenceResult> {
    const useCache = options?.useCache !== false && CACHE_CONFIG.enabled;
    const forceRefresh = options?.forceRefresh || false;

    // 1. 检查缓存
    if (useCache && !forceRefresh) {
      const cached = await this.getCachedResult(companyName);
      if (cached) {
        console.log(`[CompanySearch] 命中缓存: ${companyName}`);
        return cached.intelligenceResult;
      }
    }

    // 2. 检查 Serper API 是否可用
    if (!serperClient.isConfigured()) {
      console.warn('[CompanySearch] Serper API 未配置，返回空结果');
      return this.getEmptyResult(companyName);
    }

    // 3. 执行网络搜索
    console.log(`[CompanySearch] 开始搜索: ${companyName}`);
    
    try {
      const searchResults = await serperClient.searchCompany(companyName);
      
      // 4. 使用 LLM 提取结构化信息
      const intelligenceResult = await this.extractIntelligence(
        companyName,
        searchResults.organic,
        searchResults.news,
        searchResults.knowledgeGraph
      );

      // 5. 缓存结果
      if (useCache) {
        await this.cacheResult(companyName, intelligenceResult, {
          organic: searchResults.organic,
          news: searchResults.news,
        });
      }

      return intelligenceResult;
    } catch (error) {
      console.error('[CompanySearch] 搜索失败:', error);
      throw error;
    }
  }

  /**
   * 使用 LLM 从搜索结果中提取结构化信息
   */
  private async extractIntelligence(
    companyName: string,
    organicResults: SearchResult[],
    newsResults: NewsResult[],
    knowledgeGraph?: { title?: string; description?: string; attributes?: Record<string, string> }
  ): Promise<CompanyIntelligenceResult> {
    // 如果 AI 客户端可用，使用真实 LLM 提取
    if (aiClient.isConfigured()) {
      return this.extractWithLLM(companyName, organicResults, newsResults, knowledgeGraph);
    }

    // 否则使用规则提取
    return this.extractWithRules(companyName, organicResults, newsResults, knowledgeGraph);
  }

  /**
   * 使用 LLM 提取结构化信息
   */
  private async extractWithLLM(
    companyName: string,
    organicResults: SearchResult[],
    newsResults: NewsResult[],
    knowledgeGraph?: { title?: string; description?: string; attributes?: Record<string, string> }
  ): Promise<CompanyIntelligenceResult> {
    // 构建搜索结果摘要
    const searchContext = this.buildSearchContext(organicResults, newsResults, knowledgeGraph);

    const systemPrompt = `你是一位企业信息分析专家。你需要从网络搜索结果中提取企业的结构化信息。

请根据提供的搜索结果，提取以下信息并返回JSON格式：
{
  "basicInfo": {
    "name": "企业全称",
    "industry": "所属行业",
    "scale": "企业规模（如：1-50人、50-200人、500-1000人等）",
    "founded": "成立时间（如：2010年）",
    "address": "公司地址",
    "website": "官方网站",
    "description": "企业简介（50-100字）"
  },
  "businessScope": ["主营业务1", "主营业务2", "主营业务3", "主营业务4"],
  "recentNews": [
    {"title": "新闻标题", "date": "YYYY-MM-DD", "summary": "新闻摘要"}
  ],
  "keyContacts": [
    {"name": "联系人姓名", "title": "职位", "department": "部门", "source": "信息来源", "confidence": 0.8}
  ],
  "salesPitch": {
    "opening": "针对该企业的个性化开场白",
    "painPoints": ["可能痛点1", "可能痛点2", "可能痛点3"],
    "talkingPoints": ["谈话要点1", "谈话要点2", "谈话要点3", "谈话要点4"],
    "objectionHandlers": [
      {"objection": "可能的异议", "response": "应对话术"}
    ]
  }
}

注意事项：
1. 只提取搜索结果中明确出现的信息，不要编造
2. 如果某项信息未找到，该字段可以省略或设为空
3. 关键联系人的confidence表示信息可信度（0-1之间）
4. 销售话术应根据企业所属行业和业务特点生成`;

    const userPrompt = `请从以下搜索结果中提取"${companyName}"的企业信息：

搜索结果：
${searchContext}

请返回JSON格式的分析结果。`;

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ];

    try {
      const response = await aiClient.chatForJson<CompanyIntelligenceResult>(messages, {
        temperature: 0.3, // 低温度以获得更稳定的提取结果
        maxTokens: 2000,
      });

      // 确保基本信息完整
      if (!response.basicInfo) {
        response.basicInfo = { name: companyName };
      }
      if (!response.basicInfo.name) {
        response.basicInfo.name = companyName;
      }

      // 确保数组字段存在
      if (!response.businessScope) response.businessScope = [];
      if (!response.recentNews) response.recentNews = [];
      if (!response.keyContacts) response.keyContacts = [];
      if (!response.salesPitch) {
        response.salesPitch = {
          opening: `您好，我是负责${response.basicInfo.industry || '企业服务'}行业的客户经理。`,
          painPoints: [],
          talkingPoints: [],
          objectionHandlers: [],
        };
      }

      console.log(`[CompanySearch] LLM提取完成: ${companyName}`);
      return response;
    } catch (error) {
      console.error('[CompanySearch] LLM提取失败，降级到规则提取:', error);
      return this.extractWithRules(companyName, organicResults, newsResults, knowledgeGraph);
    }
  }

  /**
   * 使用规则提取信息（降级方案）
   */
  private extractWithRules(
    companyName: string,
    organicResults: SearchResult[],
    newsResults: NewsResult[],
    knowledgeGraph?: { title?: string; description?: string; attributes?: Record<string, string> }
  ): CompanyIntelligenceResult {
    // 从知识图谱提取基本信息
    const basicInfo: CompanyIntelligenceResult['basicInfo'] = {
      name: knowledgeGraph?.title || companyName,
      description: knowledgeGraph?.description,
    };

    // 从搜索结果提取行业信息
    const industryKeywords = ['科技', '信息', '互联网', '金融', '制造', '教育', '医疗', '电商', '物流'];
    for (const result of organicResults) {
      const text = `${result.title} ${result.snippet}`;
      for (const keyword of industryKeywords) {
        if (text.includes(keyword)) {
          basicInfo.industry = this.mapToIndustry(keyword);
          break;
        }
      }
      if (basicInfo.industry) break;
    }

    // 提取业务范围
    const businessScope: string[] = [];
    for (const result of organicResults.slice(0, 5)) {
      const keywords = this.extractBusinessKeywords(result.snippet);
      businessScope.push(...keywords);
    }
    // 去重并限制数量
    const uniqueScope = [...new Set(businessScope)].slice(0, 4);

    // 转换新闻结果
    const recentNews = newsResults.slice(0, 2).map(news => ({
      title: news.title,
      date: news.date || new Date().toISOString().split('T')[0],
      summary: news.snippet,
    }));

    return {
      basicInfo,
      businessScope: uniqueScope,
      recentNews,
      keyContacts: [], // 规则提取难以获取联系人
      salesPitch: this.generateSalesPitch(companyName, basicInfo.industry, uniqueScope),
    };
  }

  /**
   * 构建搜索上下文
   */
  private buildSearchContext(
    organicResults: SearchResult[],
    newsResults: NewsResult[],
    knowledgeGraph?: { title?: string; description?: string; attributes?: Record<string, string> }
  ): string {
    const parts: string[] = [];

    // 知识图谱信息
    if (knowledgeGraph) {
      parts.push(`【知识图谱】`);
      if (knowledgeGraph.title) parts.push(`名称: ${knowledgeGraph.title}`);
      if (knowledgeGraph.description) parts.push(`描述: ${knowledgeGraph.description}`);
      if (knowledgeGraph.attributes) {
        for (const [key, value] of Object.entries(knowledgeGraph.attributes)) {
          parts.push(`${key}: ${value}`);
        }
      }
    }

    // 搜索结果
    if (organicResults.length > 0) {
      parts.push(`\n【网页搜索结果】`);
      organicResults.slice(0, 8).forEach((result, index) => {
        parts.push(`${index + 1}. ${result.title}`);
        parts.push(`   ${result.snippet}`);
      });
    }

    // 新闻结果
    if (newsResults.length > 0) {
      parts.push(`\n【相关新闻】`);
      newsResults.slice(0, 3).forEach((news, index) => {
        parts.push(`${index + 1}. [${news.date}] ${news.title}`);
        parts.push(`   ${news.snippet}`);
      });
    }

    return parts.join('\n');
  }

  /**
   * 映射行业关键词
   */
  private mapToIndustry(keyword: string): string {
    const mapping: Record<string, string> = {
      '科技': '信息技术',
      '信息': '信息技术',
      '互联网': '互联网',
      '金融': '金融服务',
      '制造': '制造业',
      '教育': '教育培训',
      '医疗': '医疗健康',
      '电商': '电子商务',
      '物流': '物流运输',
    };
    return mapping[keyword] || keyword;
  }

  /**
   * 提取业务关键词
   */
  private extractBusinessKeywords(text: string): string[] {
    const businessKeywords = [
      '软件开发', '系统集成', '云服务', '数据分析', '人工智能',
      '智能制造', '供应链管理', '研发', '生产', '销售',
      '教育培训', '在线教育', '金融服务', '投资理财',
      '医疗服务', '医疗器械', '电子商务', '跨境电商',
    ];
    
    const found: string[] = [];
    for (const keyword of businessKeywords) {
      if (text.includes(keyword)) {
        found.push(keyword);
      }
    }
    return found;
  }

  /**
   * 生成销售话术
   */
  private generateSalesPitch(
    companyName: string,
    industry?: string,
    businessScope?: string[]
  ): CompanyIntelligenceResult['salesPitch'] {
    const industryName = industry || '企业';
    const scopeText = businessScope?.[0] || '业务';

    return {
      opening: `您好，了解到${companyName}在${industryName}领域有着出色的表现，我们公司的解决方案可以帮助贵公司在${scopeText}方面实现更大的突破。`,
      painPoints: [
        '运营效率有待提升',
        '成本控制压力',
        '数字化转型需求',
      ],
      talkingPoints: [
        '了解客户当前的业务痛点和挑战',
        '介绍我们如何帮助同行业客户解决问题',
        '分享成功案例和实际效果',
        '探讨合作可能性和下一步计划',
      ],
      objectionHandlers: [
        {
          objection: '我们已经有供应商了',
          response: '理解，我们可以作为备选方案，为您提供更多选择和更优价格。',
        },
      ],
    };
  }

  /**
   * 获取缓存结果
   */
  private async getCachedResult(companyName: string): Promise<CachedSearchResult | null> {
    try {
      // 使用 any 类型避免 Prisma 客户端未生成时的类型错误
      // 运行 npx prisma generate 后会自动生成正确的类型
      const prismaAny = prisma as any;
      
      const cache = await prismaAny.companySearchCache?.findFirst({
        where: {
          companyName,
          expiresAt: { gt: new Date() },
        },
      });

      if (cache) {
        // 更新命中次数
        await prismaAny.companySearchCache?.update({
          where: { id: cache.id },
          data: { hitCount: { increment: 1 } },
        });

        return {
          companyName: cache.companyName,
          intelligenceResult: cache.intelligenceResult as CompanyIntelligenceResult,
          searchResults: cache.searchResults as { organic: SearchResult[]; news: NewsResult[] } | undefined,
          createdAt: cache.createdAt,
          expiresAt: cache.expiresAt,
        };
      }
    } catch (error) {
      // 缓存查询可能失败（如表不存在），静默失败
      console.warn('[CompanySearch] 缓存查询失败:', error);
    }
    return null;
  }

  /**
   * 缓存结果
   */
  private async cacheResult(
    companyName: string,
    intelligenceResult: CompanyIntelligenceResult,
    searchResults?: { organic: SearchResult[]; news: NewsResult[] }
  ): Promise<void> {
    try {
      const expiresAt = new Date(Date.now() + CACHE_CONFIG.ttlHours * 60 * 60 * 1000);
      
      // 使用 any 类型避免 Prisma 客户端未生成时的类型错误
      const prismaAny = prisma as any;

      await prismaAny.companySearchCache?.upsert({
        where: { companyName },
        create: {
          companyName,
          intelligenceResult: intelligenceResult as any,
          searchResults: searchResults as any,
          source: 'web_search',
          expiresAt,
        },
        update: {
          intelligenceResult: intelligenceResult as any,
          searchResults: searchResults as any,
          source: 'web_search',
          expiresAt,
        },
      });
    } catch (error) {
      // 缓存失败不影响主流程
      console.warn('[CompanySearch] 缓存存储失败:', error);
    }
  }

  /**
   * 获取空结果
   */
  private getEmptyResult(companyName: string): CompanyIntelligenceResult {
    return {
      basicInfo: { name: companyName },
      businessScope: [],
      recentNews: [],
      keyContacts: [],
      salesPitch: {
        opening: `您好，我是负责企业服务的客户经理。`,
        painPoints: [],
        talkingPoints: [],
        objectionHandlers: [],
      },
    };
  }
}

// 导出单例实例
const companySearchService = new CompanySearchService();
export default companySearchService;