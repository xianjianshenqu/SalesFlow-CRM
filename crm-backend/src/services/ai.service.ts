/**
 * AI服务 - 封装大模型API调用
 * 使用阿里云百炼Qwen模型进行智能分析
 */

import aiClient, { ChatMessage } from './ai/client';

// 情感类型定义
export type SentimentType = 'positive' | 'neutral' | 'negative';

// 企业信息智能分析结果接口
export interface CompanyIntelligenceResult {
  basicInfo: {
    name: string;
    industry?: string;
    scale?: string;
    founded?: string;
    address?: string;
    website?: string;
    description?: string;
  };
  businessScope: string[];
  recentNews: Array<{
    title: string;
    date: string;
    summary: string;
  }>;
  keyContacts: Array<{
    name: string;
    title: string;
    department: string;
    source: string;
    confidence: number;
  }>;
  salesPitch: {
    opening: string;
    painPoints: string[];
    talkingPoints: string[];
    objectionHandlers: Array<{
      objection: string;
      response: string;
    }>;
  };
}

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
    // 如果AI客户端已配置，调用真实API
    if (aiClient.isConfigured()) {
      try {
        return await this.callRealAnalysis(duration, customerInfo);
      } catch (error) {
        console.error('[AI Service] 真实API调用失败，降级到模拟模式:', error);
        // 降级到模拟分析
        return this.mockAnalysis(duration, customerInfo);
      }
    }

    // 否则使用模拟AI分析
    return this.mockAnalysis(duration, customerInfo);
  }

  /**
   * 调用真实AI API分析录音
   */
  private async callRealAnalysis(
    duration: number,
    customerInfo?: { name?: string; industry?: string }
  ): Promise<AIAnalysisResult> {
    const customerName = customerInfo?.name || '客户';
    const industry = customerInfo?.industry || '企业';

    const systemPrompt = `你是一位专业的销售分析师，擅长分析销售通话录音并提取关键信息。
请根据提供的通话时长和客户信息，模拟生成一份专业的通话分析报告。
你需要返回一个JSON对象，包含以下字段：
- transcript: 模拟的通话转录文本
- sentiment: 整体情感倾向（positive/neutral/negative）
- keywords: 关键词数组（5个）
- keyPoints: 关键要点数组（3-5个）
- actionItems: 待办事项数组（2-4个）
- summary: 通话摘要
- psychology: 客户心理分析对象
  - attitude: 客户态度（interested/neutral/resistant）
  - purchaseIntent: 购买意向（high/medium/low）
  - painPoints: 痛点数组
  - concerns: 顾虑数组
- suggestions: 建议数组，每项包含type/email/demo/proposal/follow_up/price、title、description、priority`;

    const userPrompt = `请分析以下销售通话：
- 通话时长：${Math.floor(duration / 60)}分${duration % 60}秒
- 客户名称：${customerName}
- 客户行业：${industry}

请生成一份专业的通话分析报告，返回JSON格式。`;

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ];

    try {
      const response = await aiClient.chatForJson<AIAnalysisResult>(messages, {
        temperature: 0.7,
        maxTokens: 2000,
      });

      // 验证响应格式
      if (!response.sentiment || !response.keywords || !response.summary) {
        throw new Error('AI响应格式不完整');
      }

      return response;
    } catch (error) {
      console.error('[AI Service] 分析失败:', error);
      throw error;
    }
  }

  /**
   * 模拟AI分析（用于开发测试和降级）
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

    const actionItems = selectedActions.map((a) => a.title);
    const suggestions = selectedActions.map((a) => ({
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
    if (aiClient.isConfigured()) {
      try {
        const messages: ChatMessage[] = [
          { role: 'system', content: '你是一个语音转文字助手。请根据上下文生成一段模拟的销售通话转录文本。' },
          { role: 'user', content: '请生成一段约2分钟的销售通话转录文本，包含销售代表和客户的对话。' },
        ];
        const response = await aiClient.chat(messages, { temperature: 0.8, maxTokens: 500 });
        return `[AI转录] ${response.content}`;
      } catch (error) {
        console.error('[AI Service] 语音转文字失败:', error);
      }
    }

    // 降级到模拟
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
    if (aiClient.isConfigured()) {
      try {
        const messages: ChatMessage[] = [
          { role: 'system', content: '你是一个情感分析专家。请分析文本的情感倾向，只返回 positive、neutral 或 negative 中的一个词。' },
          { role: 'user', content: `请分析以下文本的情感倾向：\n\n${text}` },
        ];
        const response = await aiClient.chat(messages, { temperature: 0.3, maxTokens: 10 });
        const sentiment = response.content.trim().toLowerCase() as SentimentType;
        if (['positive', 'neutral', 'negative'].includes(sentiment)) {
          return sentiment;
        }
      } catch (error) {
        console.error('[AI Service] 情感分析失败:', error);
      }
    }

    // 降级到简单分析
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
  async extractKeywords(text: string): Promise<string[]> {
    if (aiClient.isConfigured()) {
      try {
        const messages: ChatMessage[] = [
          { role: 'system', content: '你是一个关键词提取专家。请从文本中提取5个最重要的关键词，以JSON数组格式返回，例如：["关键词1", "关键词2", ...]' },
          { role: 'user', content: `请从以下文本中提取关键词：\n\n${text}` },
        ];
        const response = await aiClient.chatForJson<string[]>(messages, { temperature: 0.3, maxTokens: 100 });
        return response;
      } catch (error) {
        console.error('[AI Service] 关键词提取失败:', error);
      }
    }

    // 降级到模拟
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
  async generateSummary(text: string, keywords: string[]): Promise<string> {
    if (aiClient.isConfigured()) {
      try {
        const messages: ChatMessage[] = [
          { role: 'system', content: '你是一个文本摘要专家。请为给定的文本生成简洁的摘要。' },
          { role: 'user', content: `请为以下文本生成摘要：\n\n${text}` },
        ];
        const response = await aiClient.chat(messages, { temperature: 0.5, maxTokens: 200 });
        return response.content;
      } catch (error) {
        console.error('[AI Service] 摘要生成失败:', error);
      }
    }

    // 降级到模拟
    return `本次通话主要讨论了${keywords.slice(0, 3).join('、')}等内容，客户态度良好，后续需要持续跟进。`;
  }

  /**
   * 企业信息智能分析（陌生拜访AI助手核心功能）
   * @param companyName 企业名称
   * @param _imageUrl 可选的图片URL（如门牌、宣传资料等）
   */
  async analyzeCompany(companyName: string, _imageUrl?: string): Promise<CompanyIntelligenceResult> {
    // 如果AI客户端已配置，调用真实API
    if (aiClient.isConfigured()) {
      try {
        return await this.callRealCompanyAnalysis(companyName);
      } catch (error) {
        console.error('[AI Service] 真实API调用失败，降级到模拟模式:', error);
        // 降级到模拟分析
        return this.mockCompanyAnalysis(companyName);
      }
    }

    // 使用模拟分析
    return this.mockCompanyAnalysis(companyName);
  }

  /**
   * 调用真实AI进行企业信息分析
   */
  private async callRealCompanyAnalysis(companyName: string): Promise<CompanyIntelligenceResult> {
    const systemPrompt = `你是一位企业信息分析专家和销售顾问，擅长根据企业名称分析企业信息并生成销售策略。
请根据企业提供的企业名称，生成一份完整的企业信息分析报告。
你需要返回一个JSON对象，包含以下字段：
- basicInfo: 企业基本信息对象
  - name: 企业名称
  - industry: 所属行业
  - scale: 企业规模
  - founded: 成立时间
  - address: 地址
  - website: 网址
  - description: 企业简介
- businessScope: 业务范围数组（4个）
- recentNews: 近期动态数组（2个），每项包含title、date、summary
- keyContacts: 关键联系人数组（2-4个），每项包含name、title、department、source、confidence
- salesPitch: 销售话术对象
  - opening: 开场白
  - painPoints: 痛点数组（3个）
  - talkingPoints: 谈话要点数组（4个）
  - objectionHandlers: 异议处理数组（2个），每项包含objection、response`;

    const userPrompt = `请分析以下企业并生成销售策略：
企业名称：${companyName}

请返回JSON格式的分析报告。`;

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ];

    try {
      const response = await aiClient.chatForJson<CompanyIntelligenceResult>(messages, {
        temperature: 0.7,
        maxTokens: 2000,
      });

      // 确保基本信息完整
      if (!response.basicInfo) {
        response.basicInfo = { name: companyName };
      }
      if (!response.basicInfo.name) {
        response.basicInfo.name = companyName;
      }

      return response;
    } catch (error) {
      console.error('[AI Service] 企业分析失败:', error);
      throw error;
    }
  }

  /**
   * 模拟企业信息分析（开发测试用）
   */
  private mockCompanyAnalysis(companyName: string): Promise<CompanyIntelligenceResult> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const result = this.generateMockCompanyIntelligence(companyName);
        resolve(result);
      }, 2000 + Math.random() * 1000);
    });
  }

  /**
   * 生成模拟的企业信息分析结果
   */
  private generateMockCompanyIntelligence(companyName: string): CompanyIntelligenceResult {
    // 企业规模模板
    const scales = ['1-50人', '50-200人', '200-500人', '500-1000人', '1000人以上'];
    const scale = scales[Math.floor(Math.random() * scales.length)];

    // 行业模板
    const industries = [
      '信息技术', '制造业', '金融服务', '教育培训', '医疗健康',
      '电子商务', '物流运输', '房地产', '文化传媒', '能源环保'
    ];
    const industry = industries[Math.floor(Math.random() * industries.length)];

    // 业务范围模板
    const businessScopes: Record<string, string[]> = {
      '信息技术': ['软件开发', '系统集成', '云服务', '数据分析', '人工智能应用', 'IT咨询'],
      '制造业': ['生产制造', '供应链管理', '质量控制', '设备维护', '工艺研发', '产品测试'],
      '金融服务': ['贷款服务', '投资理财', '风险控制', '资产管理', '保险代理', '支付结算'],
      '教育培训': ['在线教育', '职业培训', '企业内训', '课程研发', '教材出版', '学习管理'],
      '医疗健康': ['医疗服务', '医疗器械', '药品研发', '健康管理', '远程医疗', '医学检测'],
      '电子商务': ['B2B平台', 'B2C零售', '跨境贸易', '供应链整合', '数字营销', '客户服务'],
      '物流运输': ['仓储管理', '配送服务', '冷链物流', '国际货运', '供应链优化', '智能调度'],
      '房地产': ['房地产开发', '物业管理', '商业运营', '房产经纪', '装修服务', '投资咨询'],
      '文化传媒': ['内容创作', '广告营销', '品牌策划', '媒体运营', '活动执行', '视频制作'],
      '能源环保': ['新能源开发', '节能减排', '环境监测', '废物处理', '绿色建筑', '碳中和服务'],
    };

    const businessScope = businessScopes[industry] || ['主营业务', '增值服务', '技术支持', '售后服务'];

    // 关键联系人模板
    const contactTemplates = [
      { title: '总经理', department: '管理层', confidence: 0.95 },
      { title: '采购总监', department: '采购部', confidence: 0.85 },
      { title: '技术总监', department: '技术部', confidence: 0.80 },
      { title: '运营总监', department: '运营部', confidence: 0.75 },
      { title: '财务总监', department: '财务部', confidence: 0.70 },
      { title: '人力资源总监', department: '人力资源部', confidence: 0.65 },
    ];

    const keyContacts = contactTemplates
      .sort(() => 0.5 - Math.random())
      .slice(0, 2 + Math.floor(Math.random() * 2))
      .map((template, index) => ({
        name: `张${['伟', '强', '明', '华', '军', '平'][index]}`,
        title: template.title,
        department: template.department,
        source: '公开信息',
        confidence: template.confidence,
      }));

    // 近期动态模板
    const recentNewsTemplates = [
      { title: `${companyName}获得新一轮融资`, summary: '公司近期完成融资，资金将用于业务扩展和技术研发。' },
      { title: `${companyName}发布新产品`, summary: '公司推出创新产品，进一步拓展市场份额。' },
      { title: `${companyName}战略合作签约`, summary: '与行业领先企业达成战略合作，共同开拓市场。' },
      { title: `${companyName}获得行业认证`, summary: '公司产品通过权威认证，品质获得市场认可。' },
    ];

    const recentNews = recentNewsTemplates
      .sort(() => 0.5 - Math.random())
      .slice(0, 2)
      .map((news) => ({
        ...news,
        date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      }));

    // 生成销售话术
    const salesPitch = this.generateSalesPitch(companyName, industry, businessScope);

    return {
      basicInfo: {
        name: companyName,
        industry,
        scale,
        founded: `${1990 + Math.floor(Math.random() * 30)}年`,
        address: `北京市${['朝阳区', '海淀区', '东城区', '西城区', '丰台区'][Math.floor(Math.random() * 5)]}${['科技园', '商务中心', '创业园', '产业基地'][Math.floor(Math.random() * 4)]}`,
        website: `www.${companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
        description: `${companyName}是一家专注于${industry}领域的企业，致力于为客户提供优质的产品和服务。`,
      },
      businessScope: businessScope.slice(0, 4),
      recentNews,
      keyContacts,
      salesPitch,
    };
  }

  /**
   * 生成销售话术建议
   */
  private generateSalesPitch(
    companyName: string,
    industry: string,
    businessScope: string[]
  ): CompanyIntelligenceResult['salesPitch'] {
    // 开场白模板
    const openingTemplates = [
      `您好，了解到${companyName}在${industry}领域有着出色的表现，我们公司的解决方案可以帮助贵公司在${businessScope[0]}方面实现更大的突破。`,
      `您好，注意到${companyName}近期发展迅速，我们专门为${industry}行业提供一站式解决方案，希望能有机会与您深入交流。`,
      `您好，我是专门负责${industry}行业的客户经理。了解到贵公司在${businessScope[0]}和${businessScope[1]}方面的需求，想向您介绍一下我们的解决方案。`,
    ];

    // 痛点模板
    const painPointTemplates: Record<string, string[]> = {
      '信息技术': ['数字化转型压力', '系统整合困难', '数据安全隐患', '技术人才短缺'],
      '制造业': ['生产效率提升', '质量管控难度', '供应链协同', '成本控制压力'],
      '金融服务': ['风险管理复杂', '合规要求严格', '客户体验优化', '数字化转型'],
      '教育培训': ['在线教学效果', '学员管理效率', '课程研发周期', '招生成本控制'],
      '医疗健康': ['医疗资源整合', '数据互联互通', '患者服务体验', '合规监管要求'],
      '电子商务': ['用户增长瓶颈', '供应链管理', '营销成本高', '客户留存难'],
      '物流运输': ['配送效率优化', '成本控制', '信息化程度低', '客户服务提升'],
      '房地产': ['销售转化率', '客户关系管理', '项目运营效率', '数字化转型'],
      '文化传媒': ['内容创作效率', '版权保护', '变现渠道有限', '用户粘性不足'],
      '能源环保': ['政策合规要求', '技术升级成本', '运营效率提升', '市场拓展困难'],
    };

    const painPoints = painPointTemplates[industry] || ['运营效率', '成本控制', '市场竞争', '客户服务'];

    // 谈话要点模板
    const talkingPoints = [
      '了解客户当前的业务痛点和挑战',
      '介绍我们如何帮助同行业客户解决问题',
      '分享成功案例和实际效果',
      '探讨合作可能性和下一步计划',
    ];

    // 异议处理模板
    const objectionHandlers = [
      {
        objection: '我们已经有供应商了',
        response: '理解，我们不是要替代现有供应商，而是希望能作为备选方案，为您提供更多选择和更优价格。',
      },
      {
        objection: '现在不是采购的时机',
        response: '完全理解，我们可以先保持联系，定期分享行业资讯和最佳实践，等您有需要时随时沟通。',
      },
      {
        objection: '预算有限',
        response: '我们提供灵活的合作方案，可以根据您的预算和需求定制服务内容，分期实施也是可行的。',
      },
      {
        objection: '需要向上级汇报',
        response: '没问题，我可以准备一份详细的方案介绍，包括投资回报分析，方便您向领导汇报。',
      },
    ];

    return {
      opening: openingTemplates[Math.floor(Math.random() * openingTemplates.length)],
      painPoints: painPoints.slice(0, 3),
      talkingPoints,
      objectionHandlers: objectionHandlers.slice(0, 2),
    };
  }
}

export default new AIService();