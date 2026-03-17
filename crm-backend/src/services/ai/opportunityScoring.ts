/**
 * 商机评分服务
 * 基于BANT模型进行商机评分和成交概率预测
 */

import type {
  OpportunityScoringInput,
  OpportunityScoringResult,
} from './types';

// 评分权重配置
const SCORING_WEIGHTS = {
  engagement: 0.20,   // 互动活跃度
  budget: 0.25,       // 预算匹配度
  authority: 0.20,    // 决策人接触度
  need: 0.20,         // 需求明确度
  timing: 0.15,       // 时机成熟度
};

// 阶段基础分
const STAGE_BASE_SCORES: Record<string, number> = {
  new_lead: 20,
  contacted: 35,
  qualified: 50,
  proposal: 65,
  negotiation: 80,
  won: 100,
  lost: 0,
};

// 阶段成交概率基准
const STAGE_WIN_PROBABILITY: Record<string, number> = {
  new_lead: 10,
  contacted: 20,
  qualified: 35,
  proposal: 50,
  negotiation: 75,
  won: 100,
  lost: 0,
};

class OpportunityScoringService {
  /**
   * 分析商机并生成评分
   */
  async analyzeOpportunity(input: OpportunityScoringInput): Promise<OpportunityScoringResult> {
    // 计算各维度评分
    const engagementScore = this.calculateEngagementScore(input);
    const budgetScore = this.calculateBudgetScore(input);
    const authorityScore = this.calculateAuthorityScore(input);
    const needScore = this.calculateNeedScore(input);
    const timingScore = this.calculateTimingScore(input);

    // 计算总分
    const overallScore = Math.round(
      engagementScore * SCORING_WEIGHTS.engagement +
      budgetScore * SCORING_WEIGHTS.budget +
      authorityScore * SCORING_WEIGHTS.authority +
      needScore * SCORING_WEIGHTS.need +
      timingScore * SCORING_WEIGHTS.timing
    );

    // 计算成交概率
    const winProbability = this.calculateWinProbability(input, overallScore);

    // 生成评分因子
    const factors = this.generateFactors(input, {
      engagement: engagementScore,
      budget: budgetScore,
      authority: authorityScore,
      need: needScore,
      timing: timingScore,
    });

    // 识别风险因素
    const riskFactors = this.identifyRiskFactors(input, {
      engagement: engagementScore,
      budget: budgetScore,
      authority: authorityScore,
      need: needScore,
      timing: timingScore,
    });

    // 生成改进建议
    const recommendations = this.generateRecommendations(input, {
      engagement: engagementScore,
      budget: budgetScore,
      authority: authorityScore,
      need: needScore,
      timing: timingScore,
    }, riskFactors);

    return {
      overallScore,
      winProbability,
      engagementScore,
      budgetScore,
      authorityScore,
      needScore,
      timingScore,
      factors,
      riskFactors,
      recommendations,
    };
  }

  /**
   * 预测成交概率（30/60/90天）
   */
  async predictWinProbability(
    input: OpportunityScoringInput
  ): Promise<{ day30: number; day60: number; day90: number }> {
    const result = await this.analyzeOpportunity(input);
    const baseProbability = result.winProbability;

    // 根据阶段和预期成交日期调整概率
    const expectedCloseDays = input.expectedCloseDate
      ? Math.max(0, Math.ceil((new Date(input.expectedCloseDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
      : 90;

    // 30天成交概率
    const day30 = expectedCloseDays <= 30
      ? Math.min(95, baseProbability + 10)
      : Math.max(5, baseProbability - Math.min(20, (expectedCloseDays - 30) * 0.3));

    // 60天成交概率
    const day60 = expectedCloseDays <= 60
      ? Math.min(95, baseProbability + 5)
      : Math.max(5, baseProbability - Math.min(15, (expectedCloseDays - 60) * 0.2));

    // 90天成交概率
    const day90 = expectedCloseDays <= 90
      ? Math.min(95, baseProbability)
      : Math.max(5, baseProbability - Math.min(10, (expectedCloseDays - 90) * 0.1));

    return {
      day30: Math.round(day30),
      day60: Math.round(day60),
      day90: Math.round(day90),
    };
  }

  /**
   * 计算互动活跃度评分
   */
  private calculateEngagementScore(input: OpportunityScoringInput): number {
    let score = STAGE_BASE_SCORES[input.stage] || 30;

    // 根据最近活动时间调整
    if (input.lastActivity) {
      const daysSinceLastActivity = Math.ceil(
        (Date.now() - new Date(input.lastActivity).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSinceLastActivity <= 3) {
        score += 15;
      } else if (daysSinceLastActivity <= 7) {
        score += 10;
      } else if (daysSinceLastActivity <= 14) {
        score += 5;
      } else if (daysSinceLastActivity > 30) {
        score -= 15;
      } else if (daysSinceLastActivity > 21) {
        score -= 10;
      }
    } else {
      score -= 10; // 没有活动记录
    }

    // 根据录音数量和情感调整
    if (input.recordings && input.recordings.length > 0) {
      const positiveRatio = input.recordings.filter(r => r.sentiment === 'positive').length / input.recordings.length;
      if (positiveRatio > 0.7) {
        score += 10;
      } else if (positiveRatio > 0.5) {
        score += 5;
      } else if (positiveRatio < 0.3) {
        score -= 10;
      }
    }

    // 根据任务完成情况调整
    if (input.scheduleTasks && input.scheduleTasks.length > 0) {
      const completedRatio = input.scheduleTasks.filter(t => t.status === 'completed').length / input.scheduleTasks.length;
      if (completedRatio > 0.8) {
        score += 10;
      } else if (completedRatio > 0.5) {
        score += 5;
      } else if (completedRatio < 0.3) {
        score -= 5;
      }
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * 计算预算匹配度评分
   */
  private calculateBudgetScore(input: OpportunityScoringInput): number {
    let score = 50; // 默认中等

    // 根据商机价值调整
    if (input.value > 0) {
      if (input.value >= 500000) {
        score = 75; // 高价值商机
      } else if (input.value >= 100000) {
        score = 65;
      } else if (input.value >= 50000) {
        score = 55;
      } else {
        score = 45; // 小额商机
      }
    }

    // 根据客户阶段调整预算可能性
    if (input.customerStage === 'won') {
      score = 90;
    } else if (input.customerStage === 'negotiation') {
      score += 15;
    } else if (input.customerStage === 'proposal') {
      score += 10;
    } else if (input.customerStage === 'qualified' || input.customerStage === 'contacted') {
      score += 5;
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * 计算决策人接触度评分
   */
  private calculateAuthorityScore(input: OpportunityScoringInput): number {
    let score = 30; // 默认较低，未接触决策人

    if (input.contacts && input.contacts.length > 0) {
      // 检查是否有决策人
      const hasDecisionMaker = input.contacts.some(
        c => c.role === 'decision_maker'
      );
      const hasKeyInfluencer = input.contacts.some(
        c => c.role === 'key_influencer'
      );
      const hasCoach = input.contacts.some(
        c => c.role === 'coach'
      );
      const primaryContact = input.contacts.find(c => c.isPrimary);

      if (hasDecisionMaker) {
        score = 85;
        if (primaryContact?.role === 'decision_maker') {
          score = 95; // 主联系人是决策人
        }
      } else if (hasKeyInfluencer) {
        score = 70;
      } else if (hasCoach) {
        score = 60;
      }

      // 联系人数量加分
      const contactCount = input.contacts.length;
      if (contactCount >= 4) {
        score += 5;
      } else if (contactCount >= 2) {
        score += 3;
      }
    }

    // 根据阶段调整
    if (input.stage === 'negotiation') {
      score = Math.max(score, 70);
    } else if (input.stage === 'proposal') {
      score = Math.max(score, 60);
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * 计算需求明确度评分
   */
  private calculateNeedScore(input: OpportunityScoringInput): number {
    let score = 40; // 默认需求不够明确

    // 根据阶段推断需求明确度
    if (input.stage === 'won' || input.stage === 'negotiation') {
      score = 85;
    } else if (input.stage === 'proposal') {
      score = 75;
    } else if (input.stage === 'qualified') {
      score = 60;
    } else if (input.stage === 'contacted') {
      score = 50;
    }

    // 根据录音关键词调整
    if (input.recordings && input.recordings.length > 0) {
      // 假设积极情感的录音表示需求更明确
      const positiveCount = input.recordings.filter(r => r.sentiment === 'positive').length;
      if (positiveCount >= 3) {
        score += 10;
      } else if (positiveCount >= 1) {
        score += 5;
      }
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * 计算时机成熟度评分
   */
  private calculateTimingScore(input: OpportunityScoringInput): number {
    let score = 50;

    // 根据预期成交日期调整
    if (input.expectedCloseDate) {
      const daysToClose = Math.ceil(
        (new Date(input.expectedCloseDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );

      if (daysToClose <= 7) {
        score = 90; // 即将成交
      } else if (daysToClose <= 14) {
        score = 80;
      } else if (daysToClose <= 30) {
        score = 70;
      } else if (daysToClose <= 60) {
        score = 60;
      } else if (daysToClose <= 90) {
        score = 50;
      } else {
        score = 35; // 时间太长，不确定性增加
      }
    }

    // 根据阶段调整
    score = Math.max(score, STAGE_WIN_PROBABILITY[input.stage] || 30);

    // 根据最近活动调整
    if (input.lastActivity) {
      const daysSinceLastActivity = Math.ceil(
        (Date.now() - new Date(input.lastActivity).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSinceLastActivity > 14) {
        score -= 10; // 长时间无活动，时机不成熟
      }
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * 计算成交概率
   */
  private calculateWinProbability(input: OpportunityScoringInput, overallScore: number): number {
    // 基于阶段的基础概率
    let probability = STAGE_WIN_PROBABILITY[input.stage] || 10;

    // 根据总分调整
    if (overallScore >= 80) {
      probability = Math.min(95, probability + 15);
    } else if (overallScore >= 70) {
      probability = Math.min(90, probability + 10);
    } else if (overallScore >= 60) {
      probability = Math.min(85, probability + 5);
    } else if (overallScore < 40) {
      probability = Math.max(5, probability - 10);
    }

    // 根据是否有决策人接触调整
    if (input.contacts && input.contacts.some(c => c.role === 'decision_maker')) {
      probability = Math.min(95, probability + 10);
    }

    return Math.round(probability);
  }

  /**
   * 生成评分因子
   */
  private generateFactors(
    input: OpportunityScoringInput,
    scores: { engagement: number; budget: number; authority: number; need: number; timing: number }
  ): OpportunityScoringResult['factors'] {
    const factors: OpportunityScoringResult['factors'] = [];

    // 互动活跃度因子
    factors.push({
      name: '互动活跃度',
      score: scores.engagement,
      impact: scores.engagement >= 60 ? 'positive' : scores.engagement >= 40 ? 'neutral' : 'negative',
      description: scores.engagement >= 60
        ? '客户互动频繁，跟进及时'
        : scores.engagement >= 40
          ? '互动频率一般，需加强跟进'
          : '互动不足，存在流失风险',
    });

    // 预算匹配度因子
    factors.push({
      name: '预算匹配度',
      score: scores.budget,
      impact: scores.budget >= 60 ? 'positive' : scores.budget >= 40 ? 'neutral' : 'negative',
      description: input.value > 100000
        ? `商机价值 ¥${(input.value / 10000).toFixed(1)}万，预算充足`
        : '预算信息待确认',
    });

    // 决策人接触度因子
    const hasDecisionMaker = input.contacts?.some(c => c.role === 'decision_maker');
    factors.push({
      name: '决策人接触度',
      score: scores.authority,
      impact: hasDecisionMaker ? 'positive' : scores.authority >= 50 ? 'neutral' : 'negative',
      description: hasDecisionMaker
        ? '已接触决策人，决策链清晰'
        : '尚未接触决策人，建议拓展联系人',
    });

    // 需求明确度因子
    factors.push({
      name: '需求明确度',
      score: scores.need,
      impact: scores.need >= 60 ? 'positive' : scores.need >= 40 ? 'neutral' : 'negative',
      description: scores.need >= 60
        ? '客户需求明确，痛点清晰'
        : '需求尚不明确，需深入挖掘',
    });

    // 时机成熟度因子
    factors.push({
      name: '时机成熟度',
      score: scores.timing,
      impact: scores.timing >= 60 ? 'positive' : scores.timing >= 40 ? 'neutral' : 'negative',
      description: input.expectedCloseDate
        ? `预计成交日期：${new Date(input.expectedCloseDate).toLocaleDateString('zh-CN')}`
        : '成交时间待确定',
    });

    return factors;
  }

  /**
   * 识别风险因素
   */
  private identifyRiskFactors(
    input: OpportunityScoringInput,
    scores: { engagement: number; budget: number; authority: number; need: number; timing: number }
  ): OpportunityScoringResult['riskFactors'] {
    const risks: OpportunityScoringResult['riskFactors'] = [];

    // 检查互动风险
    if (scores.engagement < 40) {
      risks.push({
        factor: '互动不足',
        severity: 'high',
        suggestion: '立即安排跟进活动，建议电话或拜访',
      });
    } else if (scores.engagement < 60) {
      risks.push({
        factor: '互动频率偏低',
        severity: 'medium',
        suggestion: '增加跟进频率，保持客户关注度',
      });
    }

    // 检查长时间未活动
    if (input.lastActivity) {
      const daysSinceLastActivity = Math.ceil(
        (Date.now() - new Date(input.lastActivity).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSinceLastActivity > 14) {
        risks.push({
          factor: `${daysSinceLastActivity}天无活动记录`,
          severity: daysSinceLastActivity > 30 ? 'high' : 'medium',
          suggestion: '尽快安排客户接触，了解最新情况',
        });
      }
    }

    // 检查决策人接触风险
    if (!input.contacts?.some(c => c.role === 'decision_maker')) {
      risks.push({
        factor: '未接触决策人',
        severity: input.stage === 'negotiation' || input.stage === 'proposal' ? 'high' : 'medium',
        suggestion: '尝试接触决策层，了解最终决策者',
      });
    }

    // 检查时机风险
    if (input.expectedCloseDate) {
      const daysToClose = Math.ceil(
        (new Date(input.expectedCloseDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      if (daysToClose < 7 && input.stage !== 'negotiation' && input.stage !== 'won') {
        risks.push({
          factor: '成交日期临近但阶段滞后',
          severity: 'high',
          suggestion: '加速推进销售流程，或调整成交预期',
        });
      }
    }

    // 检查负面情感风险
    if (input.recordings && input.recordings.length > 0) {
      const negativeRatio = input.recordings.filter(r => r.sentiment === 'negative').length / input.recordings.length;
      if (negativeRatio > 0.5) {
        risks.push({
          factor: '客户态度偏负面',
          severity: 'high',
          suggestion: '深入了解客户顾虑，针对性解决问题',
        });
      } else if (negativeRatio > 0.3) {
        risks.push({
          factor: '存在负面反馈',
          severity: 'medium',
          suggestion: '关注客户不满点，及时回应',
        });
      }
    }

    return risks;
  }

  /**
   * 生成改进建议
   */
  private generateRecommendations(
    input: OpportunityScoringInput,
    scores: { engagement: number; budget: number; authority: number; need: number; timing: number },
    riskFactors: OpportunityScoringResult['riskFactors']
  ): OpportunityScoringResult['recommendations'] {
    const recommendations: OpportunityScordingResult['recommendations'] = [];

    // 基于评分最低维度给出建议
    const sortedScores = Object.entries(scores).sort((a, b) => a[1] - b[1]);

    // 最需要改进的维度
    const lowestDimension = sortedScores[0];
    switch (lowestDimension[0]) {
      case 'engagement':
        recommendations.push({
          action: '安排客户拜访或深度沟通',
          priority: 'high',
          expectedImpact: '提升客户关注度，加速决策进程',
        });
        break;
      case 'authority':
        recommendations.push({
          action: '通过现有联系人引荐决策层',
          priority: 'high',
          expectedImpact: '建立决策人关系，缩短销售周期',
        });
        break;
      case 'need':
        recommendations.push({
          action: '组织需求研讨会或方案演示',
          priority: 'medium',
          expectedImpact: '明确客户痛点，提升方案匹配度',
        });
        break;
      case 'timing':
        recommendations.push({
          action: '与客户确认项目时间表',
          priority: 'medium',
          expectedImpact: '把控销售节奏，优化资源配置',
        });
        break;
      case 'budget':
        recommendations.push({
          action: '确认预算范围和审批流程',
          priority: 'medium',
          expectedImpact: '避免后期价格障碍',
        });
        break;
    }

    // 基于风险因素给出建议
    for (const risk of riskFactors) {
      if (risk.severity === 'high') {
        recommendations.push({
          action: risk.suggestion,
          priority: 'high',
          expectedImpact: `解决${risk.factor}问题`,
        });
      }
    }

    // 根据阶段给出特定建议
    if (input.stage === 'proposal') {
      recommendations.push({
        action: '跟进方案反馈，安排答疑会议',
        priority: 'high',
        expectedImpact: '推动进入谈判阶段',
      });
    } else if (input.stage === 'negotiation') {
      recommendations.push({
        action: '准备合同条款，协调签约时间',
        priority: 'high',
        expectedImpact: '促成最终成交',
      });
    }

    // 去重并返回
    const uniqueRecommendations = recommendations.filter(
      (rec, index, self) => self.findIndex(r => r.action === rec.action) === index
    );

    return uniqueRecommendations.slice(0, 5);
  }
}

export default new OpportunityScoringService();