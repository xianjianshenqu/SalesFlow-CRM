/**
 * 客户流失预警服务
 * 基于多维度指标分析客户流失风险并生成挽回建议
 */

import type {
  ChurnAnalysisInput,
  ChurnAnalysisResult,
} from './types';

// 风险因子权重配置
const RISK_WEIGHTS = {
  lastContact: 0.25,       // 最近联系时间
  communicationTrend: 0.20, // 沟通频率变化
  sentimentTrend: 0.15,     // 录音情感趋势
  opportunityStagnation: 0.20, // 商机停滞时间
  taskCompletion: 0.10,     // 任务完成率
  contactActivity: 0.10,    // 联系人活跃度
};

// 风险等级阈值
const RISK_THRESHOLDS = {
  high: 70,    // 风险分数 >= 70 为高风险
  medium: 40,  // 风险分数 >= 40 为中风险
  low: 0,      // 风险分数 < 40 为低风险
};

class ChurnAnalysisService {
  /**
   * 分析客户流失风险
   */
  async analyzeChurnRisk(input: ChurnAnalysisInput): Promise<ChurnAnalysisResult> {
    // 计算各风险因子分数
    const riskFactors = this.calculateRiskFactors(input);

    // 计算总风险分数（加权平均）
    const riskScore = Math.round(
      riskFactors.lastContact * RISK_WEIGHTS.lastContact +
      riskFactors.communicationTrend * RISK_WEIGHTS.communicationTrend +
      riskFactors.sentimentTrend * RISK_WEIGHTS.sentimentTrend +
      riskFactors.opportunityStagnation * RISK_WEIGHTS.opportunityStagnation +
      riskFactors.taskCompletion * RISK_WEIGHTS.taskCompletion +
      riskFactors.contactActivity * RISK_WEIGHTS.contactActivity
    );

    // 确定风险等级
    const riskLevel = this.determineRiskLevel(riskScore);

    // 生成流失原因分析
    const reasons = this.generateReasons(input, riskFactors);

    // 识别预警信号
    const signals = this.identifySignals(input, riskFactors);

    // 生成挽回建议
    const suggestions = await this.generateRetentionSuggestions(input, riskLevel, riskFactors, reasons);

    return {
      riskLevel,
      riskScore,
      reasons,
      signals,
      suggestions,
    };
  }

  /**
   * 生成挽回建议
   */
  async generateRetentionSuggestions(
    input: ChurnAnalysisInput,
    riskLevel: 'high' | 'medium' | 'low',
    riskFactors: Record<string, number>,
    reasons: ChurnAnalysisResult['reasons']
  ): Promise<ChurnAnalysisResult['suggestions']> {
    const suggestions: ChurnAnalysisResult['suggestions'] = [];

    // 根据风险等级给出基础建议
    if (riskLevel === 'high') {
      suggestions.push({
        action: '立即安排高层拜访，了解客户真实情况',
        priority: 'high',
        expectedOutcome: '重建信任关系，获取一手信息',
      });
    }

    // 根据具体风险原因给出针对性建议
    for (const reason of reasons.slice(0, 3)) {
      const suggestion = this.getSuggestionForReason(reason.factor, input);
      if (suggestion) {
        suggestions.push(suggestion);
      }
    }

    // 根据客户价值调整建议优先级
    if (input.estimatedValue > 500000) {
      suggestions.unshift({
        action: '申请特殊资源支持，制定专属挽回方案',
        priority: 'high',
        expectedOutcome: '通过高价值客户专属服务挽回',
      });
    }

    // 去重并限制数量
    const uniqueSuggestions = suggestions.filter(
      (s, index, self) => self.findIndex(item => item.action === s.action) === index
    );

    return uniqueSuggestions.slice(0, 5);
  }

  /**
   * 计算各风险因子分数（0-100，分数越高风险越大）
   */
  private calculateRiskFactors(input: ChurnAnalysisInput): Record<string, number> {
    return {
      lastContact: this.calculateLastContactRisk(input),
      communicationTrend: this.calculateCommunicationTrendRisk(input),
      sentimentTrend: this.calculateSentimentTrendRisk(input),
      opportunityStagnation: this.calculateOpportunityStagnationRisk(input),
      taskCompletion: this.calculateTaskCompletionRisk(input),
      contactActivity: this.calculateContactActivityRisk(input),
    };
  }

  /**
   * 计算最近联系时间风险
   */
  private calculateLastContactRisk(input: ChurnAnalysisInput): number {
    if (!input.lastContactDate) {
      return 80; // 从未联系，高风险
    }

    const daysSinceContact = Math.ceil(
      (Date.now() - new Date(input.lastContactDate).getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceContact > 60) return 95;
    if (daysSinceContact > 45) return 85;
    if (daysSinceContact > 30) return 70;
    if (daysSinceContact > 21) return 55;
    if (daysSinceContact > 14) return 40;
    if (daysSinceContact > 7) return 25;
    return 10; // 一周内有联系，低风险
  }

  /**
   * 计算沟通频率变化风险
   */
  private calculateCommunicationTrendRisk(input: ChurnAnalysisInput): number {
    // 基于任务数据估算沟通频率
    if (!input.scheduleTasks || input.scheduleTasks.length === 0) {
      return 60; // 无任务记录，中等风险
    }

    const now = Date.now();
    const twoWeeksAgo = now - 14 * 24 * 60 * 60 * 1000;
    const fourWeeksAgo = now - 28 * 24 * 60 * 60 * 1000;

    // 最近两周的任务数
    const recentTasks = input.scheduleTasks.filter(
      t => new Date(t.dueDate).getTime() > twoWeeksAgo
    ).length;

    // 之前两周的任务数
    const previousTasks = input.scheduleTasks.filter(
      t => {
        const dueTime = new Date(t.dueDate).getTime();
        return dueTime > fourWeeksAgo && dueTime <= twoWeeksAgo;
      }
    ).length;

    // 频率下降意味着风险增加
    if (previousTasks === 0) {
      return recentTasks > 0 ? 30 : 50;
    }

    const changeRatio = (previousTasks - recentTasks) / previousTasks;

    if (changeRatio > 0.5) return 80; // 频率下降50%以上
    if (changeRatio > 0.3) return 60;
    if (changeRatio > 0) return 40;
    if (changeRatio === 0) return 30;
    return 20; // 频率增加，低风险
  }

  /**
   * 计算录音情感趋势风险
   */
  private calculateSentimentTrendRisk(input: ChurnAnalysisInput): number {
    if (!input.recordings || input.recordings.length === 0) {
      return 40; // 无录音，中等偏低风险
    }

    // 按时间排序
    const sortedRecordings = [...input.recordings].sort(
      (a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
    );

    if (sortedRecordings.length < 2) {
      // 只有一次录音，根据情感判断
      const sentiment = sortedRecordings[0].sentiment;
      if (sentiment === 'negative') return 70;
      if (sentiment === 'neutral') return 40;
      return 20;
    }

    // 比较最近和之前的情感
    const recentSentiments = sortedRecordings.slice(0, Math.ceil(sortedRecordings.length / 2));
    const olderSentiments = sortedRecordings.slice(Math.ceil(sortedRecordings.length / 2));

    const recentNegative = recentSentiments.filter(r => r.sentiment === 'negative').length / recentSentiments.length;
    const olderNegative = olderSentiments.filter(r => r.sentiment === 'negative').length / olderSentiments.length;

    // 负面情感增加意味着风险增加
    if (recentNegative > olderNegative + 0.3) return 80;
    if (recentNegative > olderNegative) return 60;
    if (recentNegative === olderNegative) {
      if (recentNegative > 0.5) return 70;
      return 30;
    }
    return 20; // 情感改善
  }

  /**
   * 计算商机停滞时间风险
   */
  private calculateOpportunityStagnationRisk(input: ChurnAnalysisInput): number {
    if (!input.opportunities || input.opportunities.length === 0) {
      return 30; // 无商机，低风险（可能只是潜在客户）
    }

    // 检查活跃商机
    const activeOpportunities = input.opportunities.filter(o => o.status === 'active');

    if (activeOpportunities.length === 0) {
      return 50; // 无活跃商机
    }

    // 检查商机停滞时间
    let maxStagnationRisk = 0;
    for (const opp of activeOpportunities) {
      if (opp.lastActivity) {
        const daysSinceActivity = Math.ceil(
          (Date.now() - new Date(opp.lastActivity).getTime()) / (1000 * 60 * 60 * 24)
        );

        let risk = 0;
        if (daysSinceActivity > 45) risk = 90;
        else if (daysSinceActivity > 30) risk = 75;
        else if (daysSinceActivity > 21) risk = 55;
        else if (daysSinceActivity > 14) risk = 35;
        else risk = 20;

        maxStagnationRisk = Math.max(maxStagnationRisk, risk);
      } else {
        maxStagnationRisk = Math.max(maxStagnationRisk, 60);
      }
    }

    return maxStagnationRisk;
  }

  /**
   * 计算任务完成率风险
   */
  private calculateTaskCompletionRisk(input: ChurnAnalysisInput): number {
    if (!input.scheduleTasks || input.scheduleTasks.length === 0) {
      return 35; // 无任务，低风险
    }

    const completedTasks = input.scheduleTasks.filter(t => t.status === 'completed').length;
    const totalTasks = input.scheduleTasks.length;
    const completionRate = completedTasks / totalTasks;

    // 完成率低意味着风险高
    if (completionRate < 0.3) return 75;
    if (completionRate < 0.5) return 55;
    if (completionRate < 0.7) return 35;
    return 20;
  }

  /**
   * 计算联系人活跃度风险
   */
  private calculateContactActivityRisk(input: ChurnAnalysisInput): number {
    if (!input.contacts || input.contacts.length === 0) {
      return 70; // 无联系人，高风险
    }

    // 检查联系人最近联系时间
    const contactsWithActivity = input.contacts.filter(c => c.lastContact);
    if (contactsWithActivity.length === 0) {
      return 60;
    }

    // 找最近的联系人活动
    const mostRecentContact = contactsWithActivity.reduce((latest, c) => {
      if (!c.lastContact) return latest;
      const contactTime = new Date(c.lastContact).getTime();
      return contactTime > latest ? contactTime : latest;
    }, 0);

    const daysSinceContact = Math.ceil(
      (Date.now() - mostRecentContact) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceContact > 30) return 70;
    if (daysSinceContact > 21) return 50;
    if (daysSinceContact > 14) return 35;
    return 20;
  }

  /**
   * 确定风险等级
   */
  private determineRiskLevel(riskScore: number): 'high' | 'medium' | 'low' {
    if (riskScore >= RISK_THRESHOLDS.high) return 'high';
    if (riskScore >= RISK_THRESHOLDS.medium) return 'medium';
    return 'low';
  }

  /**
   * 生成流失原因分析
   */
  private generateReasons(
    input: ChurnAnalysisInput,
    riskFactors: Record<string, number>
  ): ChurnAnalysisResult['reasons'] {
    const reasons: ChurnAnalysisResult['reasons'] = [];

    // 按风险分数排序因子
    const sortedFactors = Object.entries(riskFactors)
      .sort((a, b) => b[1] - a[1]);

    for (const [factor, score] of sortedFactors) {
      if (score >= 50) {
        reasons.push({
          factor: this.getFactorLabel(factor),
          weight: Math.round(score / 100 * 100) / 100,
          evidence: this.getFactorEvidence(factor, input),
        });
      }
    }

    return reasons;
  }

  /**
   * 获取因子标签
   */
  private getFactorLabel(factor: string): string {
    const labels: Record<string, string> = {
      lastContact: '长时间未联系',
      communicationTrend: '沟通频率下降',
      sentimentTrend: '客户态度转冷',
      opportunityStagnation: '商机推进停滞',
      taskCompletion: '跟进任务积压',
      contactActivity: '联系人活跃度低',
    };
    return labels[factor] || factor;
  }

  /**
   * 获取因子证据
   */
  private getFactorEvidence(factor: string, input: ChurnAnalysisInput): string {
    switch (factor) {
      case 'lastContact':
        if (!input.lastContactDate) return '从未记录联系';
        const days = Math.ceil(
          (Date.now() - new Date(input.lastContactDate).getTime()) / (1000 * 60 * 60 * 24)
        );
        return `距上次联系已${days}天`;

      case 'communicationTrend':
        return '近期沟通频率明显下降';

      case 'sentimentTrend':
        if (input.recordings && input.recordings.length > 0) {
          const negativeRatio = input.recordings.filter(r => r.sentiment === 'negative').length / input.recordings.length;
          return `负面情感占比${Math.round(negativeRatio * 100)}%`;
        }
        return '录音情感分析显示态度变化';

      case 'opportunityStagnation':
        return '商机长期无进展';

      case 'taskCompletion':
        if (input.scheduleTasks && input.scheduleTasks.length > 0) {
          const completed = input.scheduleTasks.filter(t => t.status === 'completed').length;
          const total = input.scheduleTasks.length;
          return `任务完成率${Math.round(completed / total * 100)}%`;
        }
        return '跟进任务完成情况不佳';

      case 'contactActivity':
        if (!input.contacts || input.contacts.length === 0) {
          return '未添加联系人';
        }
        return '联系人互动减少';

      default:
        return '风险指标异常';
    }
  }

  /**
   * 识别预警信号
   */
  private identifySignals(
    input: ChurnAnalysisInput,
    riskFactors: Record<string, number>
  ): ChurnAnalysisResult['signals'] {
    const signals: ChurnAnalysisResult['signals'] = [];

    // 长时间未联系
    if (riskFactors.lastContact >= 55) {
      signals.push({
        type: 'contact_gap',
        description: input.lastContactDate
          ? `超过${Math.ceil((Date.now() - new Date(input.lastContactDate).getTime()) / (1000 * 60 * 60 * 24))}天未联系客户`
          : '从未联系此客户',
        detectedAt: new Date(),
      });
    }

    // 情感转冷
    if (riskFactors.sentimentTrend >= 55 && input.recordings && input.recordings.length > 0) {
      const negativeRecordings = input.recordings.filter(r => r.sentiment === 'negative');
      if (negativeRecordings.length > 0) {
        signals.push({
          type: 'negative_sentiment',
          description: `最近${negativeRecordings.length}次通话情感偏负面`,
          detectedAt: new Date(negativeRecordings[negativeRecordings.length - 1].recordedAt),
        });
      }
    }

    // 商机停滞
    if (riskFactors.opportunityStagnation >= 55) {
      signals.push({
        type: 'opportunity_stalled',
        description: '商机推进停滞超过2周',
        detectedAt: new Date(),
      });
    }

    // 任务积压
    if (riskFactors.taskCompletion >= 55) {
      signals.push({
        type: 'task_backlog',
        description: '存在未完成的跟进任务',
        detectedAt: new Date(),
      });
    }

    return signals;
  }

  /**
   * 根据原因获取建议
   */
  private getSuggestionForReason(
    reason: string,
    input: ChurnAnalysisInput
  ): ChurnAnalysisResult['suggestions'][0] | null {
    switch (reason) {
      case '长时间未联系':
        return {
          action: '立即安排电话或拜访，重新建立联系',
          priority: 'high',
          expectedOutcome: '恢复客户关系，了解最新需求',
        };

      case '沟通频率下降':
        return {
          action: '分析沟通减少原因，提供有价值的信息吸引客户',
          priority: 'medium',
          expectedOutcome: '重新激发客户兴趣',
        };

      case '客户态度转冷':
        return {
          action: '深入了解客户顾虑，针对性解决问题',
          priority: 'high',
          expectedOutcome: '化解客户不满，重建信任',
        };

      case '商机推进停滞':
        return {
          action: '重新评估商机价值，调整推进策略',
          priority: 'medium',
          expectedOutcome: '推动商机进入下一阶段',
        };

      case '跟进任务积压':
        return {
          action: '清理积压任务，优先处理高优先级事项',
          priority: 'medium',
          expectedOutcome: '提升客户服务效率',
        };

      case '联系人活跃度低':
        return {
          action: '拓展联系人网络，接触更多关键人',
          priority: 'medium',
          expectedOutcome: '建立更广泛的客户关系',
        };

      default:
        return null;
    }
  }
}

export default new ChurnAnalysisService();