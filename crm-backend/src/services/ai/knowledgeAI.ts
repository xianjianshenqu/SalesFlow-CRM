/**
 * 知识库AI服务
 * 提供文档分析、知识搜索、需求增强等AI功能
 * 支持真实API调用和模拟降级模式
 */

import type {
  DocumentAnalysisResult,
  RelevantKnowledgeResult,
  EnhancedRequirementResult,
} from './types';
import aiClient, { ChatMessage } from './client';
import knowledgeService from '../knowledge.service';

/**
 * 知识库AI服务类
 */
class KnowledgeAIService {
  /**
   * AI分析文档内容，提取关键信息
   */
  async analyzeDocument(content: string, fileType: string): Promise<DocumentAnalysisResult> {
    // 如果AI客户端已配置，调用真实API
    if (aiClient.isConfigured()) {
      try {
        return await this.callRealDocumentAnalysis(content, fileType);
      } catch (error) {
        console.error('[Knowledge AI] 真实API调用失败，降级到模拟模式:', error);
        return this.mockDocumentAnalysis(content, fileType);
      }
    }

    // 降级到模拟模式
    return this.mockDocumentAnalysis(content, fileType);
  }

  /**
   * 调用真实AI分析文档
   */
  private async callRealDocumentAnalysis(content: string, fileType: string): Promise<DocumentAnalysisResult> {
    const systemPrompt = `你是一位专业的文档分析专家，擅长从各类文档中提取关键信息。
请分析提供的文档内容，提取以下信息并以JSON格式返回：
- summary: 文档摘要（200字以内）
- keyTopics: 关键主题数组
- entities: 实体数组，每项包含name、type、relevance(0-1)
- recommendations: 基于文档内容的建议数组
- confidence: 分析置信度(0-1)`;

    const userPrompt = `请分析以下${fileType.toUpperCase()}文档内容：

${content.substring(0, 3000)}

请返回JSON格式的分析结果。`;

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ];

    return aiClient.chatForJson<DocumentAnalysisResult>(messages, {
      temperature: 0.5,
      maxTokens: 1500,
    });
  }

  /**
   * 模拟文档分析
   */
  private async mockDocumentAnalysis(content: string, fileType: string): Promise<DocumentAnalysisResult> {
    await this.simulateDelay(500, 1000);

    const fileTypeLower = fileType.toLowerCase();

    // 根据文件类型返回不同的模拟分析结果
    if (fileTypeLower === 'xlsx' || fileTypeLower === 'xls' || fileTypeLower === 'csv') {
      return this.mockExcelAnalysis(content);
    } else if (fileTypeLower === 'pdf') {
      return this.mockPdfAnalysis(content);
    } else if (fileTypeLower === 'docx' || fileTypeLower === 'doc') {
      return this.mockWordAnalysis(content);
    } else {
      return this.mockGenericAnalysis(content);
    }
  }

  /**
   * Excel文件模拟分析
   */
  private mockExcelAnalysis(_content: string): DocumentAnalysisResult {
    return {
      summary: '这是一份数据表格文档，包含结构化数据。通过分析发现数据组织良好，可用于产品价格管理或业务数据分析。',
      keyTopics: ['数据表格', '结构化数据', '价格信息', '产品信息'],
      entities: [
        { name: '产品数据表', type: '文档类型', relevance: 0.95 },
        { name: '价格信息', type: '数据类型', relevance: 0.85 },
        { name: '规格参数', type: '数据类型', relevance: 0.75 },
      ],
      recommendations: [
        '可将数据导入产品价格表进行统一管理',
        '建议定期更新价格信息以保持数据准确性',
        '可用于生成产品报价参考',
      ],
      confidence: 0.85,
    };
  }

  /**
   * PDF文件模拟分析
   */
  private mockPdfAnalysis(content: string): DocumentAnalysisResult {
    const hasPriceInfo = content.includes('价格') || content.includes('元') || content.includes('¥');
    const hasContract = content.includes('合同') || content.includes('协议') || content.includes('条款');

    return {
      summary: `这是一份PDF文档，${hasPriceInfo ? '包含价格相关信息，' : ''}${hasContract ? '可能是合同或协议类文档。' : '内容可用于知识检索和参考。'}`,
      keyTopics: hasContract ? ['合同文档', '法律条款', '商务协议'] : ['文档资料', '参考信息', '业务文档'],
      entities: [
        { name: 'PDF文档', type: '文档类型', relevance: 1.0 },
        ...(hasPriceInfo ? [{ name: '价格信息', type: '业务信息', relevance: 0.9 }] : []),
        ...(hasContract ? [{ name: '合同条款', type: '法律信息', relevance: 0.85 }] : []),
      ],
      recommendations: hasContract
        ? ['可作为合同模板参考', '建议提取关键条款用于模板库', '注意审核法律条款的适用性']
        : ['可用于知识库检索', '建议提取关键信息建立索引'],
      confidence: 0.75,
    };
  }

  /**
   * Word文件模拟分析
   */
  private mockWordAnalysis(_content: string): DocumentAnalysisResult {
    return {
      summary: '这是一份Word文档，包含格式化的文本内容。文档结构清晰，适合作为模板或参考资料。',
      keyTopics: ['文档模板', '格式化文本', '业务资料'],
      entities: [
        { name: 'Word文档', type: '文档类型', relevance: 1.0 },
        { name: '文本内容', type: '内容类型', relevance: 0.8 },
      ],
      recommendations: [
        '可作为文档模板使用',
        '建议提取关键段落作为模板片段',
        '可用于培训材料参考',
      ],
      confidence: 0.7,
    };
  }

  /**
   * 通用文件模拟分析
   */
  private mockGenericAnalysis(_content: string): DocumentAnalysisResult {
    return {
      summary: '文档已成功上传，内容可用于知识库管理和检索。建议进一步完善文档元数据以便更好地利用。',
      keyTopics: ['文档资料', '知识库'],
      entities: [
        { name: '上传文档', type: '文档类型', relevance: 1.0 },
      ],
      recommendations: [
        '完善文档描述和标签信息',
        '定期审查文档内容的时效性',
      ],
      confidence: 0.6,
    };
  }

  /**
   * 生成文档摘要
   */
  async generateDocumentSummary(content: string): Promise<string> {
    // 如果AI客户端已配置，调用真实API
    if (aiClient.isConfigured()) {
      try {
        return await this.callRealSummaryGeneration(content);
      } catch (error) {
        console.error('[Knowledge AI] 摘要生成失败，降级到模拟模式:', error);
        return this.mockSummaryGeneration(content);
      }
    }

    // 降级到模拟模式
    return this.mockSummaryGeneration(content);
  }

  /**
   * 调用真实AI生成摘要
   */
  private async callRealSummaryGeneration(content: string): Promise<string> {
    const systemPrompt = `你是一位专业的文档摘要专家。请为提供的文档生成简洁的摘要（200字以内），突出重点信息。`;

    const userPrompt = `请为以下内容生成摘要：

${content.substring(0, 3000)}`;

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ];

    const response = await aiClient.chat(messages, {
      temperature: 0.5,
      maxTokens: 500,
    });

    return response.content;
  }

  /**
   * 模拟摘要生成
   */
  private async mockSummaryGeneration(content: string): Promise<string> {
    await this.simulateDelay(300, 600);

    // 截取前200字并添加模拟摘要文本
    const preview = content.substring(0, 200).replace(/\n/g, ' ');
    return `${preview}... [AI生成的文档摘要] 本文档包含业务相关资料，可用于知识库管理和检索。建议结合实际业务场景使用。`;
  }

  /**
   * 根据方案需求搜索相关知识（语义搜索模拟）
   */
  async searchRelevantKnowledge(
    query: string,
    context?: {
      industry?: string;
      customerNeeds?: string[];
      budget?: number;
    }
  ): Promise<RelevantKnowledgeResult> {
    try {
      // 调用知识库服务搜索
      const searchResults = await knowledgeService.searchKnowledge({
        q: query,
        limit: 10,
      });

      // 使用简单评分模拟相关度
      const result: RelevantKnowledgeResult = {
        products: [],
        templates: [],
        contracts: [],
        suggestions: [],
      };

      // 处理产品结果
      if (searchResults.results.products && searchResults.results.products.length > 0) {
        result.products = searchResults.results.products.map((p: any, index: number) => ({
          id: p.id,
          name: p.productName,
          relevance: Math.max(0.5, 1 - index * 0.1),
          reason: this.generateProductRelevanceReason(p, context),
        }));
      }

      // 处理合同模板结果
      if (searchResults.results.contracts && searchResults.results.contracts.length > 0) {
        result.contracts = searchResults.results.contracts.map((c: any, index: number) => ({
          id: c.id,
          name: c.name,
          relevance: Math.max(0.5, 1 - index * 0.1),
          reason: `匹配${c.category || '通用'}类型合同模板，已被使用${c.usageCount || 0}次`,
        }));
      }

      // 生成建议
      result.suggestions = this.generateSearchSuggestions(query, context, result);

      return result;
    } catch (error) {
      console.error('[Knowledge AI] 知识搜索失败:', error);
      // 静默降级，返回空结果
      return {
        products: [],
        templates: [],
        contracts: [],
        suggestions: ['知识库搜索暂时不可用，请稍后重试'],
      };
    }
  }

  /**
   * 生成产品相关度原因
   */
  private generateProductRelevanceReason(product: any, context?: { industry?: string; budget?: number }): string {
    const reasons: string[] = [];

    if (context?.industry && product.category) {
      reasons.push(`产品分类"${product.category}"与行业匹配`);
    }

    if (context?.budget && product.unitPrice) {
      const budgetRatio = product.unitPrice / context.budget;
      if (budgetRatio < 0.3) {
        reasons.push('价格在预算范围内，性价比高');
      } else if (budgetRatio < 0.6) {
        reasons.push('价格适中，符合预算预期');
      }
    }

    if (reasons.length === 0) {
      reasons.push('产品信息与查询内容相关');
    }

    return reasons.join('；');
  }

  /**
   * 生成搜索建议
   */
  private generateSearchSuggestions(
    _query: string,
    context?: { industry?: string; customerNeeds?: string[]; budget?: number },
    results?: RelevantKnowledgeResult
  ): string[] {
    const suggestions: string[] = [];

    if (results?.products && results.products.length > 0) {
      suggestions.push(`发现${results.products.length}个相关产品，可参考产品定价`);
    }

    if (results?.contracts && results.contracts.length > 0) {
      suggestions.push(`有${results.contracts.length}个合同模板可用，建议参考相关条款`);
    }

    if (context?.industry) {
      suggestions.push(`建议关注"${context.industry}"行业的特殊需求`);
    }

    if (context?.budget) {
      suggestions.push(`预算${context.budget.toLocaleString()}元，建议优化产品组合`);
    }

    if (suggestions.length === 0) {
      suggestions.push('建议完善知识库内容以获得更精准的匹配');
    }

    return suggestions;
  }

  /**
   * 基于知识库增强需求分析
   */
  async enhanceRequirementAnalysis(
    requirements: string,
    knowledgeContext: any
  ): Promise<EnhancedRequirementResult> {
    try {
      // 从知识库获取产品数据作为上下文
      let knowledgeProducts: any[] = [];
      try {
        knowledgeProducts = await knowledgeService.exportProducts({
          isActive: true,
        });
      } catch (e) {
        console.warn('[Knowledge AI] 获取产品数据失败:', e);
      }

      // 如果AI客户端已配置，调用真实API
      if (aiClient.isConfigured()) {
        try {
          return await this.callRealEnhancement(requirements, knowledgeProducts, knowledgeContext);
        } catch (error) {
          console.error('[Knowledge AI] 需求增强失败，降级到模拟模式:', error);
          return this.mockEnhancement(requirements, knowledgeProducts, knowledgeContext);
        }
      }

      // 降级到模拟模式
      return this.mockEnhancement(requirements, knowledgeProducts, knowledgeContext);
    } catch (error) {
      console.error('[Knowledge AI] 需求增强失败:', error);
      // 静默降级，返回基础结果
      return this.mockEnhancement(requirements, [], knowledgeContext);
    }
  }

  /**
   * 调用真实AI增强需求分析
   */
  private async callRealEnhancement(
    requirements: string,
    knowledgeProducts: any[],
    knowledgeContext: any
  ): Promise<EnhancedRequirementResult> {
    const systemPrompt = `你是一位专业的需求分析专家，擅长基于知识库数据增强需求理解。
请分析客户需求，结合提供的产品知识库，生成增强的需求分析结果。
返回JSON格式：
- enhancedNeeds: 增强后的需求数组，每项包含need、priority、source、knowledgeRef
- suggestedProducts: 建议产品数组，每项包含name、reason
- estimatedBudget: 预算估算对象，包含min、max、confidence
- additionalInsights: 额外洞察数组`;

    const productsContext = knowledgeProducts.length > 0
      ? `知识库产品参考：\n${knowledgeProducts.slice(0, 10).map(p => `- ${p.productName}: ¥${p.unitPrice}`).join('\n')}`
      : '暂无产品数据';

    const userPrompt = `请分析以下客户需求：

${requirements}

${productsContext}

客户背景：${knowledgeContext?.industry || '未知行业'}

请返回JSON格式的增强分析结果。`;

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ];

    return aiClient.chatForJson<EnhancedRequirementResult>(messages, {
      temperature: 0.6,
      maxTokens: 2000,
    });
  }

  /**
   * 模拟需求增强
   */
  private async mockEnhancement(
    requirements: string,
    knowledgeProducts: any[],
    knowledgeContext: any
  ): Promise<EnhancedRequirementResult> {
    await this.simulateDelay(600, 1200);

    // 从需求中提取关键词模拟需求识别
    const needs = this.extractNeedsFromText(requirements);

    // 基于知识库产品生成建议
    const suggestedProducts = this.generateSuggestedProducts(knowledgeProducts, requirements);

    // 估算预算
    const estimatedBudget = this.estimateBudget(knowledgeProducts, suggestedProducts);

    // 生成额外洞察
    const additionalInsights = this.generateInsights(requirements, knowledgeContext);

    return {
      enhancedNeeds: needs.map((need, index) => ({
        need,
        priority: index === 0 ? 'high' : index < 3 ? 'medium' : 'low',
        source: 'AI分析',
        knowledgeRef: knowledgeProducts.length > 0 ? '基于知识库产品数据' : undefined,
      })),
      suggestedProducts,
      estimatedBudget,
      additionalInsights,
    };
  }

  /**
   * 从文本中提取需求
   */
  private extractNeedsFromText(text: string): string[] {
    const commonNeeds = [
      '提升业务效率',
      '降低运营成本',
      '数据可视化分析',
      '流程自动化',
      '系统集成',
      '移动办公支持',
      '安全保障',
      '技术支持服务',
    ];

    // 简单匹配
    const matched = commonNeeds.filter(need =>
      text.toLowerCase().includes(need.toLowerCase()) ||
      text.toLowerCase().includes(need.slice(0, 4))
    );

    // 如果没有匹配到，返回通用需求
    if (matched.length === 0) {
      return ['业务效率提升', '数字化转型', '系统集成需求'];
    }

    return matched.slice(0, 5);
  }

  /**
   * 生成建议产品
   */
  private generateSuggestedProducts(knowledgeProducts: any[], _requirements: string): Array<{ name: string; reason: string }> {
    if (knowledgeProducts.length === 0) {
      return [
        { name: '基础服务包', reason: '满足基本业务需求' },
        { name: '技术支持服务', reason: '保障系统稳定运行' },
      ];
    }

    // 选择前3个产品
    return knowledgeProducts.slice(0, 3).map(p => ({
      name: p.productName,
      reason: `单价¥${p.unitPrice}，${p.specification || '标准规格'}`,
    }));
  }

  /**
   * 估算预算
   */
  private estimateBudget(knowledgeProducts: any[], suggestedProducts: Array<{ name: string }>): { min: number; max: number; confidence: number } {
    if (knowledgeProducts.length === 0 || suggestedProducts.length === 0) {
      return { min: 50000, max: 200000, confidence: 0.5 };
    }

    // 计算建议产品的总价
    const totalPrice = suggestedProducts.reduce((sum, sp) => {
      const product = knowledgeProducts.find(p => p.productName === sp.name);
      return sum + (product?.unitPrice || 50000);
    }, 0);

    return {
      min: Math.round(totalPrice * 0.8),
      max: Math.round(totalPrice * 1.3),
      confidence: 0.7,
    };
  }

  /**
   * 生成洞察
   */
  private generateInsights(requirements: string, context?: any): string[] {
    const insights: string[] = [
      '建议重点关注客户的长期合作潜力',
      '可考虑提供分阶段实施方案以降低客户决策门槛',
    ];

    if (context?.industry) {
      insights.push(`${context.industry}行业通常关注数据安全和合规性要求`);
    }

    if (requirements.length < 50) {
      insights.push('需求描述较为简略，建议进一步沟通确认详细需求');
    }

    return insights;
  }

  /**
   * 辅助方法：模拟延迟
   */
  private simulateDelay(min: number, max: number): Promise<void> {
    return new Promise(resolve => {
      setTimeout(resolve, min + Math.random() * (max - min));
    });
  }
}

// 导出单例实例
const knowledgeAIService = new KnowledgeAIService();
export default knowledgeAIService;
