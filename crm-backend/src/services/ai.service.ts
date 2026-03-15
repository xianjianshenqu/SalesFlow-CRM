/**
 * AI服务 - 封装大模型API调用
 * 支持腾讯云混元/文心一言等国产大模型
 */

// 情感类型定义
export type SentimentType = 'positive' | 'neutral' | 'negative';

// AI分析结果接口
export interface AIAnalysisResult {
  transcript: string;
  sentiment: SentimentType;
  keywords: string[];
  keyPoints: string[];
  actionItems: string[];
  summary: string;
  psychology: {
    attitude: 'interested' | 'neutral' | 'resistant';
    purchaseIntent: 'high' | 'medium' | 'low';
    painPoints: string[];
    concerns: string[];
  };
  suggestions: {
    type: 'email' | 'demo' | 'proposal' | 'follow_up' | 'price';
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
  }[];
}

// 模拟AI配置
const AI_CONFIG = {
  // 如果配置了腾讯云密钥，则使用真实API
  useRealAPI: process.env.TENCENT_SECRET_ID && process.env.TENCENT_SECRET_KEY,
  apiKey: process.env.TENCENT_SECRET_ID || '',
  apiSecret: process.env.TENCENT_SECRET_KEY || '',
  region: process.env.TENCENT_REGION || 'ap-shanghai',
};

/**
 * AI服务类
 * 提供语音分析、情感识别、关键词提取等AI能力
 */
class AIService {
  /**
   * 综合分析录音内容
   * @param _audioUrl 录音文件URL
   * @param duration 录音时长（秒）
   * @param customerInfo 客户信息（用于上下文）
   */
  async analyzeRecording(
    _audioUrl: string,
    duration: number,
    customerInfo?: { name?: string; industry?: string }
  ): Promise<AIAnalysisResult> {
    // 如果配置了真实API，调用真实服务
    if (AI_CONFIG.useRealAPI) {
      return this.callRealAI(_audioUrl, duration, customerInfo);
    }

    // 否则使用模拟AI分析
    return this.mockAnalysis(duration, customerInfo);
  }

  /**
   * 调用真实AI API（腾讯云混元）
   */
  private async callRealAI(
    _audioUrl: string,
    duration: number,
    customerInfo?: { name?: string; industry?: string }
  ): Promise<AIAnalysisResult> {
    try {
      // TODO: 实现真实的腾讯云混元API调用
      // 1. 调用ASR服务进行语音转文字
      // 2. 调用NLP服务进行情感分析、关键词提取
      // 3. 调用大模型生成摘要和建议
      
      // 目前仍返回模拟数据，等待API密钥配置
      return this.mockAnalysis(duration, customerInfo);
    } catch (error) {
      console.error('AI API调用失败:', error);
      // 降级到模拟分析
      return this.mockAnalysis(duration, customerInfo);
    }
  }

  /**
   * 模拟AI分析（用于开发测试）
   */
  private mockAnalysis(
    duration: number,
    customerInfo?: { name?: string; industry?: string }
  ): Promise<AIAnalysisResult> {
    return new Promise((resolve) => {
      // 模拟API延迟
      setTimeout(() => {
        const result = this.generateMockResult(duration, customerInfo);
        resolve(result);
      }, 1500 + Math.random() * 1000);
    });
  }

  /**
   * 生成模拟分析结果
   */
  private generateMockResult(
    duration: number,
    customerInfo?: { name?: string; industry?: string }
  ): AIAnalysisResult {
    // 情感分析模板
    const sentiments: SentimentType[] = ['positive', 'neutral', 'negative'];
    const sentiment = sentiments[Math.floor(Math.random() * sentiments.length)];

    // 根据情感生成不同风格的关键词
    const keywordSets: Record<SentimentType, string[][]> = {
      positive: [
        ['产品认可', '合作意向', '预算充足', '决策周期短', '技术需求明确'],
        ['价格满意', '服务认可', '时间表确定', '团队配合', '签约意向'],
        ['需求匹配', '方案满意', '竞争优势', '交付能力', '售后保障'],
      ],
      neutral: [
        ['需求确认', '内部评审', '竞品对比', '预算申请', '流程审批'],
        ['技术评估', '案例参考', '方案优化', '时间规划', '资源配置'],
        ['部门协调', '领导汇报', '合同审核', '风险评估', '采购流程'],
      ],
      negative: [
        ['价格敏感', '竞品优势', '决策困难', '预算限制', '时间紧张'],
        ['集成难题', '技术担忧', '服务顾虑', '交付风险', '售后问题'],
        ['流程复杂', '审批延迟', '需求变更', '人员调整', '项目暂停'],
      ],
    };

    const keywords = keywordSets[sentiment][Math.floor(Math.random() * 3)];

    // 生成关键点
    const keyPointTemplates = [
      ['客户对产品功能表示认可', '讨论了具体实施计划', '明确了下一步行动'],
      ['技术需求已确认', '需要内部审批流程', '预计2-3周反馈'],
      ['价格谈判进行中', '需要提供更多案例', '考虑分阶段实施'],
      ['客户关注售后服务', '希望延长质保期', '需要定制化开发'],
      ['竞品对比阶段', '强调性价比', '期待差异化方案'],
    ];
    const keyPoints = keyPointTemplates[Math.floor(Math.random() * keyPointTemplates.length)];

    // 生成行动项
    const actionItemSets: Record<SentimentType, Array<{ type: 'email' | 'demo' | 'proposal' | 'follow_up' | 'price'; title: string; priority: 'high' | 'medium' | 'low' }>> = {
      positive: [
        { type: 'proposal', title: '发送正式报价单', priority: 'high' },
        { type: 'demo', title: '安排产品演示', priority: 'high' },
        { type: 'email', title: '发送产品资料', priority: 'medium' },
        { type: 'follow_up', title: '确认签约时间', priority: 'high' },
      ],
      neutral: [
        { type: 'email', title: '发送技术文档', priority: 'medium' },
        { type: 'follow_up', title: '跟进审批进度', priority: 'medium' },
        { type: 'demo', title: '安排技术答疑', priority: 'low' },
        { type: 'proposal', title: '优化方案细节', priority: 'medium' },
      ],
      negative: [
        { type: 'price', title: '重新评估价格方案', priority: 'high' },
        { type: 'demo', title: '安排技术评估', priority: 'high' },
        { type: 'email', title: '提供成功案例', priority: 'medium' },
        { type: 'follow_up', title: '协调内部资源', priority: 'medium' },
      ],
    };

    const actionTemplates = actionItemSets[sentiment];
    const selectedActions = actionTemplates
      .sort(() => 0.5 - Math.random())
      .slice(0, 2 + Math.floor(Math.random() * 2));

    const actionItems = selectedActions.map((a: { type: 'email' | 'demo' | 'proposal' | 'follow_up' | 'price'; title: string; priority: 'high' | 'medium' | 'low' }) => a.title);
    const suggestions = selectedActions.map((a: { type: 'email' | 'demo' | 'proposal' | 'follow_up' | 'price'; title: string; priority: 'high' | 'medium' | 'low' }) => ({
      type: a.type,
      title: a.title,
      description: this.getSuggestionDescription(a.type, customerInfo?.name),
      priority: a.priority,
    }));

    // 生成摘要
    const summaryTemplates: Record<SentimentType, string[]> = {
      positive: [
        `客户对产品方案表示认可，${keywords[0]}是本次沟通的重点。双方就${keywords[1]}进行了深入讨论，客户态度积极，合作意向明确。`,
        `本次通话主要围绕${keywords[0]}和${keywords[1]}展开，客户对产品功能表示满意，预计近期可进入签约阶段。`,
      ],
      neutral: [
        `客户目前处于${keywords[0]}阶段，需要等待内部${keywords[1]}完成。建议持续跟进，保持沟通。`,
        `本次沟通确认了客户的${keywords[0]}需求，后续需要关注${keywords[1]}的进展情况。`,
      ],
      negative: [
        `客户对${keywords[0]}表示担忧，${keywords[1]}是目前的主要障碍。需要针对性解决问题，重建客户信心。`,
        `本次通话发现客户存在${keywords[0]}方面的顾虑，建议尽快提供解决方案，避免商机流失。`,
      ],
    };

    const summary = summaryTemplates[sentiment][Math.floor(Math.random() * 2)];

    // 生成心理分析
    const psychology: AIAnalysisResult['psychology'] = {
      attitude: sentiment === 'positive' ? 'interested' : sentiment === 'negative' ? 'resistant' : 'neutral',
      purchaseIntent: sentiment === 'positive' ? 'high' : sentiment === 'negative' ? 'low' : 'medium',
      painPoints: sentiment === 'negative' ? [keywords[0], keywords[1]] : [keywords[Math.floor(Math.random() * 3)]],
      concerns: sentiment === 'negative' ? keywords.slice(0, 2) : [],
    };

    // 生成转录文本
    const transcript = this.generateMockTranscript(duration, customerInfo, keywords);

    return {
      transcript,
      sentiment,
      keywords,
      keyPoints,
      actionItems,
      summary,
      psychology,
      suggestions,
    };
  }

  /**
   * 生成模拟转录文本
   */
  private generateMockTranscript(
    duration: number,
    customerInfo?: { name?: string; industry?: string },
    keywords?: string[]
  ): string {
    const customerName = customerInfo?.name || '客户';
    const industry = customerInfo?.industry || '企业';

    const templates = [
      `[AI转录] 销售代表：您好，感谢您抽出时间进行本次沟通。\n\n${customerName}：你好，我们公司正在寻找合适的解决方案。\n\n销售代表：我们的产品可以满足${industry}行业的核心需求，特别是在${keywords?.[0] || '效率提升'}方面有明显优势。\n\n${customerName}：这点我们比较关注，能详细说说吗？\n\n销售代表：当然，我们的方案主要包括...（此处省略详细内容）\n\n${customerName}：听起来不错，关于${keywords?.[1] || '价格'}方面呢？\n\n销售代表：我们提供灵活的价格方案，可以根据您的需求定制...\n\n${customerName}：好的，我会和团队讨论一下。\n\n销售代表：期待您的反馈，我们随时为您提供支持。`,
      
      `[AI转录] 本次通话时长约${Math.floor(duration / 60)}分钟，主要讨论了${keywords?.slice(0, 3).join('、') || '产品方案'}等内容。客户对整体方案表示${Math.random() > 0.5 ? '认可' : '关注'}，后续需要重点关注${keywords?.[0] || '细节'}方面的沟通。`,

      `[AI转录] ${customerName}：感谢今天的详细介绍。\n\n销售代表：不客气，您对${keywords?.[0] || '方案'}还有什么疑问吗？\n\n${customerName}：关于实施周期我想了解更多。\n\n销售代表：通常我们需要${Math.ceil(duration / 300)}周完成部署，包括...\n\n${customerName}：好的，我需要和其他部门确认一下时间安排。\n\n销售代表：没问题，我会把详细的时间表发给您参考。`,
    ];

    return templates[Math.floor(Math.random() * templates.length)];
  }

  /**
   * 获取建议描述
   */
  private getSuggestionDescription(type: string, customerName?: string): string {
    const descriptions: Record<string, string[]> = {
      email: [
        `向${customerName || '客户'}发送详细的产品介绍文档和技术规格`,
        '发送最新产品手册和成功案例集',
      ],
      demo: [
        '安排30分钟的产品演示会议，展示核心功能',
        '预约技术团队进行深度产品演示',
      ],
      proposal: [
        '准备详细的商务方案和报价单',
        '根据客户需求定制专属方案',
      ],
      follow_up: [
        '在3天内进行电话跟进，了解客户反馈',
        '安排面谈，深入讨论合作细节',
      ],
      price: [
        '准备多套价格方案供客户选择',
        '申请特殊折扣政策，提升竞争力',
      ],
    };

    const options = descriptions[type] || ['待安排'];
    return options[Math.floor(Math.random() * options.length)];
  }

  /**
   * 语音转文字（单独接口）
   */
  async transcribeAudio(_audioUrl: string): Promise<string> {
    // 模拟转录
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve('[AI转录] 这是通话内容的转录文本...');
      }, 1000);
    });
  }

  /**
   * 情感分析（单独接口）
   */
  async analyzeSentiment(text: string): Promise<SentimentType> {
    // 简单的情感分析逻辑
    const positiveWords = ['满意', '认可', '合作', '签约', '成功', '优秀', '好'];
    const negativeWords = ['问题', '担忧', '困难', '不满', '投诉', '失败', '差'];

    let positiveScore = 0;
    let negativeScore = 0;

    positiveWords.forEach((word) => {
      if (text.includes(word)) positiveScore++;
    });

    negativeWords.forEach((word) => {
      if (text.includes(word)) negativeScore++;
    });

    if (positiveScore > negativeScore) return 'positive';
    if (negativeScore > positiveScore) return 'negative';
    return 'neutral';
  }

  /**
   * 关键词提取（单独接口）
   */
  async extractKeywords(_text: string): Promise<string[]> {
    // 模拟关键词提取
    const allKeywords = [
      '产品需求', '价格谈判', '竞品对比', '项目预算',
      '决策流程', '合作意向', '技术支持', '售后服务',
      '交付周期', '合同条款', '付款方式', '实施计划',
    ];

    return allKeywords.sort(() => 0.5 - Math.random()).slice(0, 5);
  }

  /**
   * 摘要生成（单独接口）
   */
  async generateSummary(_text: string, keywords: string[]): Promise<string> {
    // 模拟摘要生成
    return `本次通话主要讨论了${keywords.slice(0, 3).join('、')}等内容，客户态度良好，后续需要持续跟进。`;
  }
}

export default new AIService();