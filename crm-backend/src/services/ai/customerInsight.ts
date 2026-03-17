/**
 * 客户洞察服务
 * 从客户互动数据中提取需求、痛点、决策人信息等关键洞察
 */

import type {
  CustomerInsightInput,
  CustomerInsightResult,
} from './types';

// 需求关键词库
const NEED_KEYWORDS: Record<string, string[]> = {
  efficiency: ['效率', '自动化', '流程优化', '节省时间', '提升产能', '降本增效'],
  cost: ['成本', '预算', '性价比', '投资回报', 'ROI', '费用'],
  quality: ['质量', '稳定性', '可靠性', '品质', '高标准'],
  integration: ['集成', '对接', '兼容', 'API', '数据互通', '系统整合'],
  security: ['安全', '隐私', '合规', '数据保护', '权限管理'],
  scalability: ['扩展', '规模', '容量', '增长', '弹性'],
  support: ['服务', '支持', '响应', '培训', '售后'],
  innovation: ['创新', '新技术', '数字化', '智能化', '转型'],
};

// 痛点关键词库
const PAIN_POINT_KEYWORDS: Record<string, string[]> = {
  process: ['流程复杂', '效率低', '手工操作', '重复工作', '审批慢'],
  system: ['系统老旧', '数据孤岛', '功能缺失', '体验差', '不稳定'],
  cost: ['成本高', '预算紧张', '人力不足', '资源有限'],
  competition: ['竞争激烈', '市场份额', '客户流失', '差异化'],
  management: ['管理困难', '信息不透明', '决策慢', '协同难'],
};

// 竞品关键词
const COMPETITOR_INDICATORS = ['竞品', '竞争对手', '对比', '比较', '其他厂商', '别的产品'];

class CustomerInsightService {
  /**
   * 提取客户洞察
   */
  async extractCustomerInsights(input: CustomerInsightInput): Promise<CustomerInsightResult> {
    // 提取需求
    const extractedNeeds = this.extractNeeds(input);

    // 提取预算信息
    const extractedBudget = this.extractBudget(input);

    // 分析决策人
    const decisionMakers = this.analyzeDecisionMakers(input);

    // 识别痛点
    const painPoints = this.identifyPainPoints(input);

    // 分析竞品信息
    const competitorInfo = this.analyzeCompetitorInfo(input);

    // 构建时间线
    const timeline = this.buildTimeline(input);

    // 计算置信度
    const confidence = this.calculateConfidence(input, {
      needsCount: extractedNeeds.length,
      hasBudget: !!extractedBudget,
      decisionMakersCount: decisionMakers.length,
      painPointsCount: painPoints.length,
    });

    return {
      extractedNeeds,
      extractedBudget,
      decisionMakers,
      painPoints,
      competitorInfo,
      timeline,
      confidence,
    };
  }

  /**
   * 分析决策人
   */
  async analyzeDecisionMakers(input: CustomerInsightInput): Promise<CustomerInsightResult['decisionMakers']> {
    const decisionMakers: CustomerInsightResult['decisionMakers'] = [];

    if (!input.contacts || input.contacts.length === 0) {
      return decisionMakers;
    }

    for (const contact of input.contacts) {
      // 根据角色判断影响力
      let influence: 'high' | 'medium' | 'low' = 'low';
      let stance: 'supporter' | 'neutral' | 'blocker' = 'neutral';

      switch (contact.role) {
        case 'decision_maker':
          influence = 'high';
          break;
        case 'key_influencer':
          influence = 'high';
          break;
        case 'coach':
          influence = 'medium';
          stance = 'supporter'; // 教练通常支持我们
          break;
        case 'gatekeeper':
          influence = 'medium';
          break;
        case 'blocker':
          influence = 'medium';
          stance = 'blocker';
          break;
        case 'end_user':
          influence = 'low';
          break;
      }

      // 从备注中分析态度
      if (contact.notes) {
        const noteText = contact.notes.toLowerCase();
        if (noteText.includes('支持') || noteText.includes('认可') || noteText.includes('满意')) {
          stance = 'supporter';
        } else if (noteText.includes('反对') || noteText.includes('担忧') || noteText.includes('不满')) {
          stance = 'blocker';
        }
      }

      decisionMakers.push({
        name: contact.name,
        title: contact.title,
        influence,
        stance,
      });
    }

    // 按影响力排序
    return decisionMakers.sort((a, b) => {
      const influenceOrder = { high: 0, medium: 1, low: 2 };
      return influenceOrder[a.influence] - influenceOrder[b.influence];
    });
  }

  /**
   * 识别痛点
   */
  async identifyPainPoints(input: CustomerInsightInput): Promise<CustomerInsightResult['painPoints']> {
    const painPoints: CustomerInsightResult['painPoints'] = [];
    const allText = this.getAllText(input);

    for (const [category, keywords] of Object.entries(PAIN_POINT_KEYWORDS)) {
      for (const keyword of keywords) {
        if (allText.includes(keyword)) {
          painPoints.push({
            point: keyword,
            severity: this.determineSeverity(keyword, input),
            category: this.getPainPointCategory(category),
          });
          break; // 每个类别只取一个
        }
      }
    }

    // 从录音关键点提取痛点
    if (input.recordings) {
      for (const recording of input.recordings) {
        if (recording.keyPoints) {
          for (const point of recording.keyPoints) {
            // 检查是否是痛点描述
            if (point.includes('问题') || point.includes('困难') || point.includes('担忧')) {
              painPoints.push({
                point: point,
                severity: 'medium',
                category: '其他',
              });
            }
          }
        }
      }
    }

    return painPoints.slice(0, 10);
  }

  /**
   * 分析竞品信息
   */
  async analyzeCompetitorInfo(input: CustomerInsightInput): Promise<CustomerInsightResult['competitorInfo']> {
    const competitorInfo: CustomerInsightResult['competitorInfo'] = [];
    const allText = this.getAllText(input);

    // 检查是否有竞品相关讨论
    for (const indicator of COMPETITOR_INDICATORS) {
      if (allText.includes(indicator)) {
        // 尝试提取竞品名称
        const competitors = this.extractCompetitorNames(allText);
        for (const name of competitors) {
          competitorInfo.push({
            name,
            strength: this.extractCompetitorStrength(allText, name),
            weakness: this.extractCompetitorWeakness(allText, name),
          });
        }
        break;
      }
    }

    return competitorInfo;
  }

  /**
   * 提取需求
   */
  private extractNeeds(input: CustomerInsightInput): CustomerInsightResult['extractedNeeds'] {
    const needs: CustomerInsightResult['extractedNeeds'] = [];
    const allText = this.getAllText(input);

    for (const [category, keywords] of Object.entries(NEED_KEYWORDS)) {
      for (const keyword of keywords) {
        if (allText.includes(keyword)) {
          needs.push({
            need: this.getNeedLabel(category),
            priority: this.determineNeedPriority(category, allText),
            source: '录音分析',
          });
          break; // 每个类别只取一个
        }
      }
    }

    // 从录音关键词中提取
    if (input.recordings) {
      for (const recording of input.recordings) {
        if (recording.keywords) {
          for (const keyword of recording.keywords.slice(0, 3)) {
            // 检查是否已存在类似需求
            if (!needs.some(n => keyword.includes(n.need) || n.need.includes(keyword))) {
              needs.push({
                need: keyword,
                priority: 'medium',
                source: '客户提及',
              });
            }
          }
        }
      }
    }

    return needs.slice(0, 8);
  }

  /**
   * 提取预算信息
   */
  private extractBudget(input: CustomerInsightInput): CustomerInsightResult['extractedBudget'] {
    const allText = this.getAllText(input);

    // 尝试提取预算范围
    const budgetPatterns = [
      /预算[约]?(\d+)[到至]?(\d+)?[万]?/g,
      /(\d+)[万]?(预算|预算范围)/g,
      /投资[约]?(\d+)[万]?/g,
      /(预算|投资)(充足|紧张|有限)/g,
    ];

    for (const pattern of budgetPatterns) {
      const match = pattern.exec(allText);
      if (match) {
        if (match[1] && !isNaN(Number(match[1]))) {
          const min = Number(match[1]);
          const max = match[2] && !isNaN(Number(match[2])) ? Number(match[2]) : min * 1.5;
          return {
            range: `¥${min}万 - ¥${Math.round(max)}万`,
            currency: 'CNY',
            timeline: '待确认',
            confidence: 70,
          };
        }
        // 匹配到预算描述但无具体数字
        return {
          range: '待确认',
          currency: 'CNY',
          timeline: '待确认',
          confidence: 40,
        };
      }
    }

    return null;
  }

  /**
   * 构建时间线
   */
  private buildTimeline(input: CustomerInsightInput): CustomerInsightResult['timeline'] {
    const timeline: CustomerInsightResult['timeline'] = {
      milestones: [],
    };

    // 从录音摘要中提取时间信息
    if (input.recordings) {
      for (const recording of input.recordings) {
        if (recording.summary) {
          // 尝试提取日期信息
          const datePatterns = [
            /(\d+月\d+日)/g,
            /(\d+月)/g,
            /(下[周月])/g,
            /(本月|下月|年底|年初)/g,
          ];

          for (const pattern of datePatterns) {
            const match = pattern.exec(recording.summary);
            if (match) {
              timeline.milestones.push({
                name: recording.summary.slice(0, 50) + '...',
                date: match[1],
              });
              break;
            }
          }
        }
      }
    }

    // 添加决策和实施日期占位
    timeline.milestones.push({
      name: '项目决策',
      date: '待确认',
    });
    timeline.milestones.push({
      name: '项目启动',
      date: '待确认',
    });

    return timeline;
  }

  /**
   * 计算置信度
   */
  private calculateConfidence(
    input: CustomerInsightInput,
    data: {
      needsCount: number;
      hasBudget: boolean;
      decisionMakersCount: number;
      painPointsCount: number;
    }
  ): number {
    let score = 0;

    // 录音数量贡献
    if (input.recordings && input.recordings.length > 0) {
      score += Math.min(30, input.recordings.length * 10);
    }

    // 需求数量贡献
    score += Math.min(20, data.needsCount * 5);

    // 预算信息贡献
    if (data.hasBudget) {
      score += 15;
    }

    // 决策人数量贡献
    score += Math.min(20, data.decisionMakersCount * 5);

    // 痛点数量贡献
    score += Math.min(15, data.painPointsCount * 3);

    return Math.min(100, score);
  }

  /**
   * 获取所有文本内容
   */
  private getAllText(input: CustomerInsightInput): string {
    const texts: string[] = [];

    if (input.notes) {
      texts.push(input.notes);
    }

    if (input.recordings) {
      for (const recording of input.recordings) {
        if (recording.transcript) {
          texts.push(recording.transcript);
        }
        if (recording.summary) {
          texts.push(recording.summary);
        }
        if (recording.keywords) {
          texts.push(recording.keywords.join(' '));
        }
      }
    }

    if (input.contacts) {
      for (const contact of input.contacts) {
        if (contact.notes) {
          texts.push(contact.notes);
        }
      }
    }

    return texts.join(' ');
  }

  /**
   * 获取需求标签
   */
  private getNeedLabel(category: string): string {
    const labels: Record<string, string> = {
      efficiency: '效率提升',
      cost: '成本控制',
      quality: '质量保障',
      integration: '系统集成',
      security: '安全合规',
      scalability: '扩展能力',
      support: '服务支持',
      innovation: '创新转型',
    };
    return labels[category] || category;
  }

  /**
   * 确定需求优先级
   */
  private determineNeedPriority(category: string, text: string): 'high' | 'medium' | 'low' {
    // 检查是否被强调
    const emphasisPatterns = ['关键', '核心', '重要', '必须', '紧急', '优先'];
    const categoryKeywords = NEED_KEYWORDS[category] || [];

    for (const pattern of emphasisPatterns) {
      for (const keyword of categoryKeywords) {
        if (text.includes(pattern + keyword) || text.includes(keyword + pattern)) {
          return 'high';
        }
      }
    }

    // 默认中等优先级
    return 'medium';
  }

  /**
   * 确定痛点严重程度
   */
  private determineSeverity(keyword: string, input: CustomerInsightInput): 'high' | 'medium' | 'low' {
    const highSeverityIndicators = ['严重', '紧急', '关键', '影响业务'];
    const allText = this.getAllText(input);

    for (const indicator of highSeverityIndicators) {
      if (allText.includes(indicator + keyword) || allText.includes(keyword + indicator)) {
        return 'high';
      }
    }

    // 根据痛点类型判断
    const highSeverityPoints = ['流程复杂', '效率低', '系统老旧', '数据孤岛'];
    if (highSeverityPoints.includes(keyword)) {
      return 'high';
    }

    return 'medium';
  }

  /**
   * 获取痛点类别
   */
  private getPainPointCategory(category: string): string {
    const categories: Record<string, string> = {
      process: '流程问题',
      system: '系统问题',
      cost: '成本问题',
      competition: '市场竞争',
      management: '管理问题',
    };
    return categories[category] || '其他';
  }

  /**
   * 提取竞品名称
   */
  private extractCompetitorNames(text: string): string[] {
    // 常见竞品名称（示例）
    const knownCompetitors = [
      'Salesforce', 'salesforce',
      '钉钉', 'dingtalk',
      '企业微信', 'wecom',
      '飞书', 'feishu', 'lark',
      'Zoho', 'zoho',
      'HubSpot', 'hubspot',
    ];

    const found: string[] = [];
    for (const name of knownCompetitors) {
      if (text.toLowerCase().includes(name.toLowerCase())) {
        // 返回首字母大写的形式
        found.push(name.charAt(0).toUpperCase() + name.slice(1).toLowerCase());
      }
    }

    // 如果没找到已知竞品，返回通用名称
    if (found.length === 0) {
      found.push('竞争对手A');
    }

    return found;
  }

  /**
   * 提取竞品优势
   */
  private extractCompetitorStrength(text: string, competitorName: string): string | undefined {
    const strengthPatterns = [
      new RegExp(competitorName + '[^。]*?(优势|优点|好|强)', 'i'),
      new RegExp('(优势|优点)[^。]*?' + competitorName, 'i'),
    ];

    for (const pattern of strengthPatterns) {
      const match = pattern.exec(text);
      if (match) {
        return match[0].slice(0, 50);
      }
    }

    return undefined;
  }

  /**
   * 提取竞品劣势
   */
  private extractCompetitorWeakness(text: string, competitorName: string): string | undefined {
    const weaknessPatterns = [
      new RegExp(competitorName + '[^。]*?(劣势|缺点|不足|问题)', 'i'),
      new RegExp('(劣势|缺点|不足)[^。]*?' + competitorName, 'i'),
    ];

    for (const pattern of weaknessPatterns) {
      const match = pattern.exec(text);
      if (match) {
        return match[0].slice(0, 50);
      }
    }

    return undefined;
  }
}

export default new CustomerInsightService();