/**
 * 问题分类结果
 */
interface QuestionClassification {
  category: 'product' | 'pricing' | 'technical' | 'implementation' | 'others';
  priority: 'high' | 'medium' | 'low';
  confidence: number;
  keywords: string[];
  suggestedAnswer?: string;
  sentiment: 'positive' | 'neutral' | 'negative';
}

/**
 * 批量分类结果
 */
interface BatchClassificationResult {
  questionId: string;
  classification: QuestionClassification;
}

/**
 * AI问题分类服务
 * 使用AI对客户问题进行智能分类和分析
 */
class QuestionClassificationService {
  /**
   * 调用AI进行文本分析
   */
  private async chat(prompt: string): Promise<string> {
    // 使用关键词分析和模拟响应
    // 在实际部署中可以替换为真实的LLM调用
    const keywords = this.extractKeywordsFromPrompt(prompt);
    return this.generateMockResponse(keywords);
  }

  /**
   * 从提示中提取关键词
   */
  private extractKeywordsFromPrompt(prompt: string): string[] {
    const keywords: string[] = [];
    const patterns = [
      /问题[：:]\s*"""([\s\S]*?)"""/,
      /客户问题[：:]\s*"""([\s\S]*?)"""/,
    ];
    
    for (const pattern of patterns) {
      const match = prompt.match(pattern);
      if (match) {
        keywords.push(...match[1].split(/[\s,，。！？、；：]+/).filter(w => w.length >= 2));
      }
    }
    
    return [...new Set(keywords)];
  }

  /**
   * 生成模拟响应
   */
  private generateMockResponse(keywords: string[]): string {
    // 根据关键词生成分类结果
    const lowerKeywords = keywords.map(k => k.toLowerCase());
    
    let category = 'others';
    let priority = 'medium';
    let sentiment = 'neutral';
    
    // 分类判断
    if (lowerKeywords.some(k => ['价格', '费用', '成本', '折扣', '付款'].includes(k))) {
      category = 'pricing';
    } else if (lowerKeywords.some(k => ['功能', '特性', '产品', '支持'].includes(k))) {
      category = 'product';
    } else if (lowerKeywords.some(k => ['技术', '架构', '性能', '集成', '接口'].includes(k))) {
      category = 'technical';
    } else if (lowerKeywords.some(k => ['实施', '部署', '培训', '交付'].includes(k))) {
      category = 'implementation';
    }
    
    // 优先级判断
    if (lowerKeywords.some(k => ['紧急', '尽快', '马上', '立即'].includes(k))) {
      priority = 'high';
    } else if (lowerKeywords.some(k => ['了解', '咨询', '顺便'].includes(k))) {
      priority = 'low';
    }
    
    // 情绪判断
    if (lowerKeywords.some(k => ['满意', '很好', '不错', '感谢'].includes(k))) {
      sentiment = 'positive';
    } else if (lowerKeywords.some(k => ['问题', '担忧', '困难', '不满', '差'].includes(k))) {
      sentiment = 'negative';
    }
    
    return JSON.stringify({
      category,
      priority,
      confidence: 0.85,
      keywords: keywords.slice(0, 5),
      suggestedAnswer: `针对${category === 'pricing' ? '价格' : category === 'product' ? '产品' : category === 'technical' ? '技术' : category === 'implementation' ? '实施' : '相关'}问题，建议进行详细沟通了解具体需求`,
      sentiment
    });
  }

  /**
   * 分类单个问题
   */
  async classifyQuestion(question: string): Promise<QuestionClassification> {
    const prompt = `你是一个专业的售前技术支持助手。请分析以下客户问题，并给出分类结果。

客户问题：
"""
${question}
"""

请按以下格式输出JSON结果（不要包含任何其他文字说明）：
{
  "category": "分类（product=产品相关，pricing=价格相关，technical=技术相关，implementation=实施相关，others=其他）",
  "priority": "优先级（high=高，medium=中，low=低）",
  "confidence": 0.95,
  "keywords": ["关键词1", "关键词2"],
  "suggestedAnswer": "建议的回答方向（简短描述即可）",
  "sentiment": "客户情绪（positive=积极，neutral=中性，negative=消极）"
}

分类标准：
- product: 关于产品功能、特性、对比等问题
- pricing: 关于价格、折扣、付款方式等问题
- technical: 关于技术架构、集成、性能等问题
- implementation: 关于项目实施、交付、培训等问题
- others: 其他类型问题

优先级标准：
- high: 紧急、影响决策、涉及核心功能
- medium: 一般咨询、需要进一步了解
- low: 简单咨询、信息确认类`;

    try {
      const response = await this.chat(prompt);
      
      // 解析JSON响应
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        
        // 验证和规范化结果
        return {
          category: this.validateCategory(result.category),
          priority: this.validatePriority(result.priority),
          confidence: this.validateConfidence(result.confidence),
          keywords: Array.isArray(result.keywords) ? result.keywords : [],
          suggestedAnswer: result.suggestedAnswer || undefined,
          sentiment: this.validateSentiment(result.sentiment),
        };
      }
    } catch (error) {
      console.error('AI classification error:', error);
    }

    // 返回默认分类
    return this.getDefaultClassification(question);
  }

  /**
   * 批量分类问题
   */
  async classifyQuestions(questions: Array<{ id: string; question: string }>): Promise<BatchClassificationResult[]> {
    const results: BatchClassificationResult[] = [];

    // 分批处理，每批5个问题
    const batchSize = 5;
    for (let i = 0; i < questions.length; i += batchSize) {
      const batch = questions.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(async (q) => ({
          questionId: q.id,
          classification: await this.classifyQuestion(q.question),
        }))
      );
      results.push(...batchResults);
    }

    return results;
  }

  /**
   * 生成问题摘要
   */
  async summarizeQuestions(questions: string[]): Promise<string> {
    if (questions.length === 0) {
      return '暂无问题';
    }

    const prompt = `请对以下客户问题进行汇总分析，生成一份简洁的问题摘要报告：

问题列表：
${questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

请包含：
1. 问题总数
2. 主要问题类型分布
3. 关键关注点
4. 建议跟进方向

请用简洁的中文输出摘要（不超过200字）。`;

    try {
      const response = await this.chat(prompt);
      return response;
    } catch (error) {
      console.error('AI summarization error:', error);
      return `共收到 ${questions.length} 个问题，请查看详细列表。`;
    }
  }

  /**
   * 生成问题建议回答
   */
  async suggestAnswer(question: string, category: string, context?: string): Promise<string> {
    const prompt = `作为售前技术支持专家，请针对以下客户问题给出专业的回答建议。

问题类别：${category}
客户问题：${question}
${context ? `背景信息：${context}` : ''}

请给出：
1. 问题理解
2. 回答要点
3. 建议的回答话术（简洁专业，不超过150字）

直接输出回答建议即可。`;

    try {
      const response = await this.chat(prompt);
      return response;
    } catch (error) {
      console.error('AI suggestion error:', error);
      return '请根据客户具体情况，结合产品特性进行专业解答。';
    }
  }

  /**
   * 分析问题趋势
   */
  async analyzeTrends(questions: Array<{ question: string; category?: string; createdAt: Date }>): Promise<{
    hotTopics: string[];
    recommendations: string[];
  }> {
    if (questions.length === 0) {
      return { hotTopics: [], recommendations: [] };
    }

    const questionsText = questions
      .map((q) => `[${q.category || '未分类'}] ${q.question}`)
      .join('\n');

    const prompt = `请分析以下客户问题的趋势和模式：

${questionsText}

请输出JSON格式结果：
{
  "hotTopics": ["热点话题1", "热点话题2", "热点话题3"],
  "recommendations": ["建议1", "建议2", "建议3"]
}

热点话题：客户最关注的问题领域
建议：针对这些问题的改进建议`;

    try {
      const response = await this.chat(prompt);
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        return {
          hotTopics: Array.isArray(result.hotTopics) ? result.hotTopics : [],
          recommendations: Array.isArray(result.recommendations) ? result.recommendations : [],
        };
      }
    } catch (error) {
      console.error('AI trend analysis error:', error);
    }

    return { hotTopics: [], recommendations: [] };
  }

  // ==================== 辅助方法 ====================

  /**
   * 验证分类
   */
  private validateCategory(category: string): QuestionClassification['category'] {
    const validCategories: QuestionClassification['category'][] = [
      'product', 'pricing', 'technical', 'implementation', 'others'
    ];
    return validCategories.includes(category as any) ? category as any : 'others';
  }

  /**
   * 验证优先级
   */
  private validatePriority(priority: string): QuestionClassification['priority'] {
    const validPriorities: QuestionClassification['priority'][] = ['high', 'medium', 'low'];
    return validPriorities.includes(priority as any) ? priority as any : 'medium';
  }

  /**
   * 验证置信度
   */
  private validateConfidence(confidence: number): number {
    if (typeof confidence !== 'number' || isNaN(confidence)) {
      return 0.5;
    }
    return Math.max(0, Math.min(1, confidence));
  }

  /**
   * 验证情绪
   */
  private validateSentiment(sentiment: string): QuestionClassification['sentiment'] {
    const validSentiments: QuestionClassification['sentiment'][] = ['positive', 'neutral', 'negative'];
    return validSentiments.includes(sentiment as any) ? sentiment as any : 'neutral';
  }

  /**
   * 获取默认分类
   */
  private getDefaultClassification(question: string): QuestionClassification {
    // 简单的关键词匹配作为后备方案
    const lowerQuestion = question.toLowerCase();
    
    let category: QuestionClassification['category'] = 'others';
    let priority: QuestionClassification['priority'] = 'medium';

    // 分类关键词
    if (lowerQuestion.includes('价格') || lowerQuestion.includes('费用') || lowerQuestion.includes('成本')) {
      category = 'pricing';
    } else if (lowerQuestion.includes('功能') || lowerQuestion.includes('特性') || lowerQuestion.includes('支持')) {
      category = 'product';
    } else if (lowerQuestion.includes('技术') || lowerQuestion.includes('架构') || lowerQuestion.includes('性能')) {
      category = 'technical';
    } else if (lowerQuestion.includes('实施') || lowerQuestion.includes('部署') || lowerQuestion.includes('培训')) {
      category = 'implementation';
    }

    // 优先级关键词
    if (lowerQuestion.includes('紧急') || lowerQuestion.includes('尽快') || lowerQuestion.includes('马上')) {
      priority = 'high';
    } else if (lowerQuestion.includes('了解') || lowerQuestion.includes('咨询')) {
      priority = 'low';
    }

    return {
      category,
      priority,
      confidence: 0.3,
      keywords: this.extractKeywords(question),
      sentiment: 'neutral',
    };
  }

  /**
   * 提取关键词
   */
  private extractKeywords(text: string): string[] {
    // 简单的关键词提取
    const stopWords = ['的', '是', '在', '有', '和', '与', '或', '我', '我们', '你们', '请问', '想', '要', '能', '可以'];
    const words = text.split(/[\s,，。！？、；：""''（）【】]+/);
    return words
      .filter(word => word.length >= 2 && !stopWords.includes(word))
      .slice(0, 5);
  }
}

export default new QuestionClassificationService();