/**
 * 销售绩效AI教练服务
 * 提供销售数据分析、绩效评估、个性化改进建议等功能
 */

import {
  PerformanceAnalysisInput,
  PerformanceAnalysisResult,
  CoachingSuggestionInput,
  CoachingSuggestionResult,
  SkillGapAnalysisResult,
} from './types';

// 行业基准数据
const INDUSTRY_BENCHMARKS = {
  calls: { excellent: 50, good: 35, average: 25 },
  meetings: { excellent: 15, good: 10, average: 6 },
  visits: { excellent: 8, good: 5, average: 3 },
  proposals: { excellent: 10, good: 6, average: 4 },
  conversionRate: { excellent: 30, good: 20, average: 12 },
  avgDealSize: { excellent: 100000, good: 60000, average: 35000 },
};

// 技能评估标准
const SKILL_STANDARDS = {
  communication: {
    name: '沟通能力',
    requiredLevel: 80,
    indicators: ['录音情感分析结果', '客户反馈评分', '会议成交率'],
  },
  negotiation: {
    name: '谈判技巧',
    requiredLevel: 75,
    indicators: ['价格谈判成功率', '异议处理能力', '合同条款达成率'],
  },
  product: {
    name: '产品知识',
    requiredLevel: 85,
    indicators: ['产品演示评分', '技术问题解答准确率', '方案匹配度'],
  },
  timeManagement: {
    name: '时间管理',
    requiredLevel: 70,
    indicators: ['任务完成率', '跟进及时性', '日程规划合理性'],
  },
};

/**
 * 销售绩效AI教练服务类
 */
class SalesCoachService {
  /**
   * 分析销售绩效
   */
  async analyzePerformance(input: PerformanceAnalysisInput): Promise<PerformanceAnalysisResult> {
    await this.simulateDelay(1000, 1800);

    // 计算各项指标
    const metrics = this.calculateMetrics(input);

    // 识别优势和弱点
    const strengths = this.identifyStrengths(input, metrics);
    const weaknesses = this.identifyWeaknesses(input, metrics);

    // 分析趋势
    const trends = this.analyzeTrends(input, metrics);

    // 计算总体评分
    const overallScore = this.calculateOverallScore(metrics, strengths, weaknesses);

    // 确定绩效等级
    const performanceLevel = this.determinePerformanceLevel(overallScore);

    return {
      overallScore,
      performanceLevel,
      metrics,
      strengths,
      weaknesses,
      trends,
    };
  }

  /**
   * 生成教练建议
   */
  async generateCoachingSuggestions(input: CoachingSuggestionInput): Promise<CoachingSuggestionResult> {
    await this.simulateDelay(1200, 2000);

    const suggestions = this.generateSuggestions(input);
    const weeklyPlan = this.generateWeeklyPlan(input);
    const motivationMessage = this.generateMotivationMessage(input);

    return {
      suggestions,
      weeklyPlan,
      motivationMessage,
    };
  }

  /**
   * 识别技能差距
   */
  async identifySkillGaps(
    performanceAnalysis: PerformanceAnalysisResult,
    skillAssessment?: CoachingSuggestionInput['skillAssessment']
  ): Promise<SkillGapAnalysisResult> {
    await this.simulateDelay(600, 1000);

    const skills: SkillGapAnalysisResult['skills'] = [];
    let totalGap = 0;

    // 评估各项技能
    for (const [key, standard] of Object.entries(SKILL_STANDARDS)) {
      const currentLevel = skillAssessment?.[key as keyof typeof skillAssessment] || 
        this.inferSkillLevel(key, performanceAnalysis);
      const gap = Math.max(0, standard.requiredLevel - currentLevel);
      totalGap += gap;

      skills.push({
        name: standard.name,
        currentLevel,
        requiredLevel: standard.requiredLevel,
        gap,
        priority: gap > 20 ? 'high' : gap > 10 ? 'medium' : 'low',
        improvementActions: this.generateSkillImprovementActions(key, gap),
      });
    }

    // 推荐培训
    const recommendedTraining = this.recommendTraining(skills);

    return {
      skills,
      overallGapScore: Math.round(totalGap / Object.keys(SKILL_STANDARDS).length),
      recommendedTraining,
    };
  }

  /**
   * 预测绩效趋势
   */
  async predictPerformanceTrend(
    historicalData: Array<{ date: Date; revenue: number; deals: number }>
  ): Promise<{ predictedRevenue: number; predictedDeals: number; confidence: number }> {
    await this.simulateDelay(400, 800);

    if (historicalData.length < 2) {
      return {
        predictedRevenue: 0,
        predictedDeals: 0,
        confidence: 0.3,
      };
    }

    // 简单线性趋势预测
    const recentTrend = historicalData.slice(-3);
    const avgRevenueGrowth = this.calculateAverageGrowth(recentTrend.map(d => d.revenue));
    const avgDealsGrowth = this.calculateAverageGrowth(recentTrend.map(d => d.deals));

    const lastRevenue = historicalData[historicalData.length - 1].revenue;
    const lastDeals = historicalData[historicalData.length - 1].deals;

    return {
      predictedRevenue: Math.round(lastRevenue * (1 + avgRevenueGrowth)),
      predictedDeals: Math.round(lastDeals * (1 + avgDealsGrowth)),
      confidence: Math.min(0.9, 0.5 + historicalData.length * 0.05),
    };
  }

  /**
   * 生成行动计划
   */
  async generateActionPlan(
    userId: string,
    suggestions: CoachingSuggestionResult['suggestions']
  ): Promise<Array<{ week: number; focus: string; actions: string[]; expectedOutcome: string }>> {
    await this.simulateDelay(500, 900);

    // 4周行动计划
    const plan = [];
    const highPriority = suggestions.filter(s => s.priority === 'high');
    const mediumPriority = suggestions.filter(s => s.priority === 'medium');

    // 第1周：处理高优先级问题
    plan.push({
      week: 1,
      focus: highPriority[0]?.title || '核心能力提升',
      actions: highPriority.slice(0, 2).flatMap(s => s.actions.map(a => a.action)),
      expectedOutcome: '解决最紧迫的绩效问题',
    });

    // 第2周：持续改进
    plan.push({
      week: 2,
      focus: highPriority[0]?.title || '技能强化',
      actions: highPriority.flatMap(s => s.actions.slice(1).map(a => a.action)),
      expectedOutcome: '巩固第一周的改进成果',
    });

    // 第3周：中等优先级
    plan.push({
      week: 3,
      focus: mediumPriority[0]?.title || '能力拓展',
      actions: mediumPriority.slice(0, 2).flatMap(s => s.actions.map(a => a.action)),
      expectedOutcome: '拓展销售技能范围',
    });

    // 第4周：总结和规划
    plan.push({
      week: 4,
      focus: '复盘与规划',
      actions: ['回顾前三周的行动成果', '调整后续改进计划', '设定新的绩效目标'],
      expectedOutcome: '形成持续改进的习惯',
    });

    return plan;
  }

  /**
   * 计算指标
   */
  private calculateMetrics(input: PerformanceAnalysisInput): PerformanceAnalysisResult['metrics'] {
    const { metrics: data, targets, previousPeriodComparison } = input;

    // 收入指标
    const revenueTarget = targets?.revenue || data.revenue * 1.2;
    const revenueAchievement = (data.revenue / revenueTarget) * 100;

    // 成交指标
    const dealsTarget = targets?.deals || data.closedDeals * 1.2;
    const dealsAchievement = (data.closedDeals / dealsTarget) * 100;
    const avgDealSize = data.closedDeals > 0 ? data.revenue / data.closedDeals : 0;

    // 转化率
    const conversionRate = data.proposals > 0 ? (data.closedDeals / data.proposals) * 100 : 0;

    // 活动效率
    const callsTarget = targets?.calls || INDUSTRY_BENCHMARKS.calls.good;
    const meetingsTarget = targets?.meetings || INDUSTRY_BENCHMARKS.meetings.good;

    return {
      revenue: {
        actual: data.revenue,
        target: revenueTarget,
        achievement: Math.min(revenueAchievement, 150),
        trend: this.determineTrend(previousPeriodComparison?.revenueChange || 0),
      },
      deals: {
        actual: data.closedDeals,
        target: dealsTarget,
        achievement: Math.min(dealsAchievement, 150),
        avgDealSize,
      },
      activities: {
        calls: {
          actual: data.calls,
          target: callsTarget,
          efficiency: Math.min((data.calls / callsTarget) * 100, 150),
        },
        meetings: {
          actual: data.meetings,
          target: meetingsTarget,
          efficiency: Math.min((data.meetings / meetingsTarget) * 100, 150),
        },
        visits: {
          actual: data.visits,
          target: INDUSTRY_BENCHMARKS.visits.good,
          efficiency: Math.min((data.visits / INDUSTRY_BENCHMARKS.visits.good) * 100, 150),
        },
        proposals: {
          actual: data.proposals,
          conversionRate,
        },
      },
    };
  }

  /**
   * 识别优势
   */
  private identifyStrengths(
    input: PerformanceAnalysisInput,
    metrics: PerformanceAnalysisResult['metrics']
  ): PerformanceAnalysisResult['strengths'] {
    const strengths: PerformanceAnalysisResult['strengths'] = [];

    // 收入表现
    if (metrics.revenue.achievement >= 100) {
      strengths.push({
        area: '收入达成',
        score: Math.min(metrics.revenue.achievement, 120),
        description: `收入达成率${metrics.revenue.achievement.toFixed(1)}%，表现优异`,
      });
    }

    // 活动量
    if (metrics.activities.calls.efficiency >= 100) {
      strengths.push({
        area: '电话活动量',
        score: metrics.activities.calls.efficiency,
        description: `电话量${input.metrics.calls}通，超出目标`,
      });
    }

    // 会议效率
    if (metrics.activities.meetings.efficiency >= 100) {
      strengths.push({
        area: '会议安排',
        score: metrics.activities.meetings.efficiency,
        description: `会议安排${input.metrics.meetings}场，表现突出`,
      });
    }

    // 转化率
    if (metrics.activities.proposals.conversionRate >= INDUSTRY_BENCHMARKS.conversionRate.good) {
      strengths.push({
        area: '成交转化',
        score: metrics.activities.proposals.conversionRate,
        description: `转化率${metrics.activities.proposals.conversionRate.toFixed(1)}%，高于行业平均水平`,
      });
    }

    // 客户关系
    const positiveRecordings = input.metrics.recordings?.filter(r => r.sentiment === 'positive').length || 0;
    if (positiveRecordings > (input.metrics.recordings?.length || 0) * 0.5) {
      strengths.push({
        area: '客户关系',
        score: 85,
        description: '客户沟通情感分析结果良好，关系维护到位',
      });
    }

    return strengths.length > 0 ? strengths : [{ area: '工作态度', score: 70, description: '持续努力，保持积极态度' }];
  }

  /**
   * 识别弱点
   */
  private identifyWeaknesses(
    input: PerformanceAnalysisInput,
    metrics: PerformanceAnalysisResult['metrics']
  ): PerformanceAnalysisResult['weaknesses'] {
    const weaknesses: PerformanceAnalysisResult['weaknesses'] = [];

    // 收入差距
    if (metrics.revenue.achievement < 80) {
      weaknesses.push({
        area: '收入达成',
        score: metrics.revenue.achievement,
        description: `收入达成率仅${metrics.revenue.achievement.toFixed(1)}%，距离目标有差距`,
        impact: '影响整体绩效和团队目标达成',
      });
    }

    // 活动量不足
    if (metrics.activities.calls.efficiency < 70) {
      weaknesses.push({
        area: '电话活动量',
        score: metrics.activities.calls.efficiency,
        description: `电话量${input.metrics.calls}通，低于目标`,
        impact: '商机获取渠道受限，影响后续转化',
      });
    }

    // 转化率低
    if (metrics.activities.proposals.conversionRate < INDUSTRY_BENCHMARKS.conversionRate.average) {
      weaknesses.push({
        area: '成交转化',
        score: metrics.activities.proposals.conversionRate,
        description: `转化率${metrics.activities.proposals.conversionRate.toFixed(1)}%，低于行业平均`,
        impact: '方案投入产出比低，资源利用效率待提升',
      });
    }

    // 平均成交额低
    if (metrics.deals.avgDealSize < INDUSTRY_BENCHMARKS.avgDealSize.average) {
      weaknesses.push({
        area: '单笔成交额',
        score: (metrics.deals.avgDealSize / INDUSTRY_BENCHMARKS.avgDealSize.good) * 100,
        description: `平均成交额${metrics.deals.avgDealSize.toFixed(0)}元，有提升空间`,
        impact: '影响整体收入规模和客户价值挖掘',
      });
    }

    // 任务完成率
    const completedTasks = input.metrics.tasks?.filter(t => t.status === 'completed').length || 0;
    const totalTasks = input.metrics.tasks?.length || 1;
    if (completedTasks / totalTasks < 0.7) {
      weaknesses.push({
        area: '任务执行',
        score: (completedTasks / totalTasks) * 100,
        description: `任务完成率${((completedTasks / totalTasks) * 100).toFixed(0)}%，需要提升执行力`,
        impact: '影响工作节奏和客户满意度',
      });
    }

    return weaknesses;
  }

  /**
   * 分析趋势
   */
  private analyzeTrends(
    input: PerformanceAnalysisInput,
    metrics: PerformanceAnalysisResult['metrics']
  ): PerformanceAnalysisResult['trends'] {
    const { previousPeriodComparison } = input;

    // 预测下月数据
    const growthFactor = previousPeriodComparison?.revenueChange || 0;
    const predictedRevenue = metrics.revenue.actual * (1 + growthFactor / 100 + 0.05);
    const predictedDeals = Math.round(metrics.deals.actual * (1 + (previousPeriodComparison?.dealsChange || 5) / 100));

    return {
      revenueTrend: this.determineTrend(previousPeriodComparison?.revenueChange || 0),
      activityTrend: this.determineTrend(previousPeriodComparison?.callsChange || 0),
      conversionTrend: metrics.activities.proposals.conversionRate >= INDUSTRY_BENCHMARKS.conversionRate.average ? 'stable' : 'down',
      predictedNextMonth: {
        revenue: Math.round(predictedRevenue),
        deals: predictedDeals,
        confidence: 0.65 + Math.random() * 0.2,
      },
    };
  }

  /**
   * 计算总体评分
   */
  private calculateOverallScore(
    metrics: PerformanceAnalysisResult['metrics'],
    strengths: PerformanceAnalysisResult['strengths'],
    weaknesses: PerformanceAnalysisResult['weaknesses']
  ): number {
    // 基础分
    let score = 50;

    // 收入权重40%
    score += (metrics.revenue.achievement / 100) * 20;

    // 成交权重25%
    score += (metrics.deals.achievement / 100) * 12.5;

    // 活动权重20%
    const activityScore = (
      metrics.activities.calls.efficiency +
      metrics.activities.meetings.efficiency
    ) / 2;
    score += (activityScore / 100) * 10;

    // 转化率权重15%
    const conversionScore = (metrics.activities.proposals.conversionRate / 30) * 100;
    score += (conversionScore / 100) * 7.5;

    // 优势和弱点调整
    strengths.forEach(s => score += s.score * 0.02);
    weaknesses.forEach(w => score -= (100 - w.score) * 0.02);

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * 确定绩效等级
   */
  private determinePerformanceLevel(score: number): PerformanceAnalysisResult['performanceLevel'] {
    if (score >= 85) return 'excellent';
    if (score >= 70) return 'good';
    if (score >= 55) return 'average';
    return 'needs_improvement';
  }

  /**
   * 生成建议
   */
  private generateSuggestions(input: CoachingSuggestionInput): CoachingSuggestionResult['suggestions'] {
    const suggestions: CoachingSuggestionResult['suggestions'] = [];
    const { performanceAnalysis } = input;

    // 基于弱点生成建议
    for (const weakness of performanceAnalysis.weaknesses) {
      const suggestion = this.createSuggestionForWeakness(weakness, input);
      if (suggestion) {
        suggestions.push(suggestion);
      }
    }

    // 基于趋势生成建议
    if (performanceAnalysis.trends.revenueTrend === 'decreasing') {
      suggestions.push({
        type: 'opportunity',
        priority: 'high',
        title: '激活沉睡商机',
        description: '收入呈下降趋势，需要重点激活意向客户和跟进商机',
        actions: [
          { step: 1, action: '梳理所有进行中的商机，识别高潜力客户', expectedOutcome: '明确跟进重点' },
          { step: 2, action: '对超过7天未联系的商机进行电话跟进', expectedOutcome: '重新激活商机', timeRequired: '2小时' },
          { step: 3, action: '准备针对性的促销方案促进成交', expectedOutcome: '提升成交转化' },
        ],
        metrics: { current: performanceAnalysis.metrics.revenue.actual, target: performanceAnalysis.metrics.revenue.target || 0, improvement: 20 },
      });
    }

    // 时间管理建议
    const lowEfficiencyAreas = Object.entries(performanceAnalysis.metrics.activities)
      .filter(([area, data]) => area !== 'proposals' && 'efficiency' in data && data.efficiency < 80)
      .map(([area]) => area);

    if (lowEfficiencyAreas.length > 0) {
      suggestions.push({
        type: 'time_management',
        priority: 'medium',
        title: '优化时间分配',
        description: `在${lowEfficiencyAreas.join('、')}方面的活动效率有待提升`,
        actions: [
          { step: 1, action: '制定每日固定时间段进行电话拜访', expectedOutcome: '提升电话量稳定性' },
          { step: 2, action: '利用CRM系统管理跟进提醒', expectedOutcome: '避免客户流失' },
          { step: 3, action: '每周复盘时间使用效率', expectedOutcome: '持续优化工作节奏' },
        ],
        metrics: { current: 60, target: 90, improvement: 30 },
      });
    }

    return suggestions.length > 0 ? suggestions : this.getDefaultSuggestions();
  }

  /**
   * 为弱点创建建议
   */
  private createSuggestionForWeakness(
    weakness: PerformanceAnalysisResult['weaknesses'][0],
    input: CoachingSuggestionInput
  ): CoachingSuggestionResult['suggestions'][0] | null {
    const suggestionMap: Record<string, CoachingSuggestionResult['suggestions'][0]> = {
      '收入达成': {
        type: 'performance',
        priority: weakness.score < 50 ? 'high' : 'medium',
        title: '提升收入达成率',
        description: weakness.description,
        actions: [
          { step: 1, action: '分析当前商机管道，识别可快速成交的机会', expectedOutcome: '找到增收突破口' },
          { step: 2, action: '制定客户拜访计划，重点跟进高价值客户', expectedOutcome: '提升成交概率' },
          { step: 3, action: '学习成功案例的成交技巧', expectedOutcome: '提升谈判能力' },
        ],
        metrics: { current: weakness.score, target: 100, improvement: 100 - weakness.score },
      },
      '成交转化': {
        type: 'skill',
        priority: 'high',
        title: '提升成交转化能力',
        description: weakness.description,
        actions: [
          { step: 1, action: '分析失败案例，找出转化障碍点', expectedOutcome: '明确改进方向' },
          { step: 2, action: '学习异议处理技巧，准备标准应答话术', expectedOutcome: '增强谈判信心' },
          { step: 3, action: '请求主管陪同重要客户拜访', expectedOutcome: '现场学习和指导' },
        ],
        metrics: { current: weakness.score, target: INDUSTRY_BENCHMARKS.conversionRate.good, improvement: INDUSTRY_BENCHMARKS.conversionRate.good - weakness.score },
        resources: [
          { type: 'video', title: '高转化率销售技巧', url: '/training/conversion-skills' },
          { type: 'mentor', title: '请教团队销冠' },
        ],
      },
      '电话活动量': {
        type: 'performance',
        priority: weakness.score < 50 ? 'high' : 'medium',
        title: '增加电话拜访量',
        description: weakness.description,
        actions: [
          { step: 1, action: '每天固定上午9-11点进行电话拜访', expectedOutcome: '建立稳定工作习惯' },
          { step: 2, action: '准备好电话脚本和常见问题应答', expectedOutcome: '提升通话效率' },
          { step: 3, action: '设置每日通话目标并进行追踪', expectedOutcome: '确保目标达成' },
        ],
        metrics: { current: weakness.score, target: 100, improvement: 100 - weakness.score },
      },
      '单笔成交额': {
        type: 'skill',
        priority: 'medium',
        title: '提升客单价能力',
        description: weakness.description,
        actions: [
          { step: 1, action: '学习产品组合销售技巧', expectedOutcome: '发现增销机会' },
          { step: 2, action: '了解客户全貌，挖掘深度需求', expectedOutcome: '找到更多销售机会' },
          { step: 3, action: '准备不同价位方案供客户选择', expectedOutcome: '引导客户选择高价值方案' },
        ],
        metrics: { current: weakness.score, target: 80, improvement: 80 - weakness.score },
      },
    };

    return suggestionMap[weakness.area] || null;
  }

  /**
   * 生成周计划
   */
  private generateWeeklyPlan(input: CoachingSuggestionInput): CoachingSuggestionResult['weeklyPlan'] {
    const days = ['周一', '周二', '周三', '周四', '周五'];

    return days.map((day, index) => {
      const focusAreas = ['客户跟进', '商机开发', '方案准备', '客户拜访', '复盘规划'];
      const tasks = [
        ['整理客户名单，安排本周跟进计划', '完成15通有效电话', '更新CRM商机状态'],
        ['重点客户深度沟通', '发送产品资料', '安排下周会议'],
        ['准备客户方案', '完善报价文档', '内部技术对接'],
        ['外出拜访客户', '现场需求调研', '建立客户关系'],
        ['周度业绩复盘', '制定下周目标', '学习培训课程'],
      ];

      return {
        day,
        focus: focusAreas[index],
        tasks: tasks[index],
      };
    });
  }

  /**
   * 生成激励消息
   */
  private generateMotivationMessage(input: CoachingSuggestionInput): string {
    const { performanceAnalysis } = input;
    const level = performanceAnalysis.performanceLevel;

    const messages: Record<string, string[]> = {
      excellent: [
        '太棒了！你的表现非常出色，继续保持这种状态！',
        '优秀！你是团队的标杆，可以考虑分享成功经验给同事们。',
      ],
      good: [
        '做得不错！你正在正确的轨道上，再努力一点就能更上一层楼！',
        '很好的进展！关注细节优化，突破就在眼前。',
      ],
      average: [
        '稳扎稳打，持续改进。每个人都有自己的节奏，关键是不断进步！',
        '你已经打下了基础，现在是突破的关键时期，加油！',
      ],
      needs_improvement: [
        '困难只是暂时的，相信自己，按照计划一步步来，一定会看到改变！',
        '每一次挑战都是成长的机会，我们相信你有能力做得更好！',
      ],
    };

    const options = messages[level] || messages.average;
    return options[Math.floor(Math.random() * options.length)];
  }

  /**
   * 获取默认建议
   */
  private getDefaultSuggestions(): CoachingSuggestionResult['suggestions'] {
    return [
      {
        type: 'performance',
        priority: 'medium',
        title: '持续优化日常工作',
        description: '保持良好的工作习惯，稳步提升业绩表现',
        actions: [
          { step: 1, action: '每日回顾工作完成情况', expectedOutcome: '保持工作节奏' },
          { step: 2, action: '及时更新客户信息', expectedOutcome: '信息准确完整' },
          { step: 3, action: '主动学习产品知识', expectedOutcome: '提升专业能力' },
        ],
        metrics: { current: 70, target: 85, improvement: 15 },
      },
    ];
  }

  /**
   * 推断技能等级
   */
  private inferSkillLevel(skill: string, analysis: PerformanceAnalysisResult): number {
    const skillMapping: Record<string, () => number> = {
      communication: () => {
        const avgScore = (analysis.metrics.revenue.achievement + analysis.strengths.length * 10) / 2;
        return Math.min(90, avgScore);
      },
      negotiation: () => {
        return Math.min(90, analysis.metrics.activities.proposals.conversionRate * 2.5);
      },
      product: () => {
        const hasProductStrength = analysis.strengths.some(s => s.area.includes('产品') || s.area.includes('方案'));
        return hasProductStrength ? 80 : 65;
      },
      timeManagement: () => {
        const efficiency = (
          analysis.metrics.activities.calls.efficiency +
          analysis.metrics.activities.meetings.efficiency
        ) / 2;
        return Math.min(90, efficiency);
      },
    };

    return skillMapping[skill]?.() || 70;
  }

  /**
   * 生成技能改进行动
   */
  private generateSkillImprovementActions(skill: string, gap: number): string[] {
    const actions: Record<string, string[]> = {
      communication: [
        '多听优秀销售录音，学习沟通技巧',
        '参加销售沟通培训课程',
        '练习电话开场白和异议处理话术',
      ],
      negotiation: [
        '学习谈判心理学基础',
        '准备常见异议的标准应答',
        '请求主管陪同重要谈判',
      ],
      product: [
        '系统学习产品功能和应用场景',
        '参与产品培训和工作坊',
        '制作个人产品演示脚本',
      ],
      timeManagement: [
        '学习时间管理方法论（如番茄工作法）',
        '使用日历工具规划每日工作',
        '设置工作提醒和截止时间',
      ],
    };

    return actions[skill] || ['制定个人改进计划', '寻求主管指导'];
  }

  /**
   * 推荐培训
   */
  private recommendTraining(skills: SkillGapAnalysisResult['skills']): SkillGapAnalysisResult['recommendedTraining'] {
    return skills
      .filter(s => s.priority === 'high' || s.priority === 'medium')
      .sort((a, b) => b.gap - a.gap)
      .slice(0, 3)
      .map(skill => ({
        skill: skill.name,
        resource: this.getTrainingResource(skill.name),
        duration: skill.priority === 'high' ? '2周强化' : '1个月常规',
        priority: skill.priority as 'high' | 'medium' | 'low',
      }));
  }

  /**
   * 获取培训资源
   */
  private getTrainingResource(skillName: string): string {
    const resources: Record<string, string> = {
      '沟通能力': '《高情商销售沟通》在线课程',
      '谈判技巧': '《商务谈判实战技巧》工作坊',
      '产品知识': '产品认证培训体系',
      '时间管理': '《高效能人士的时间管理》课程',
    };

    return resources[skillName] || '综合能力提升培训';
  }

  /**
   * 辅助方法
   */
  private simulateDelay(min: number, max: number): Promise<void> {
    return new Promise(resolve => {
      setTimeout(resolve, min + Math.random() * (max - min));
    });
  }

  private determineTrend(change: number): 'up' | 'down' | 'stable' {
    if (change > 5) return 'up';
    if (change < -5) return 'down';
    return 'stable';
  }

  private calculateAverageGrowth(values: number[]): number {
    if (values.length < 2) return 0;
    const growths = [];
    for (let i = 1; i < values.length; i++) {
      if (values[i - 1] !== 0) {
        growths.push((values[i] - values[i - 1]) / values[i - 1]);
      }
    }
    return growths.length > 0 ? growths.reduce((a, b) => a + b, 0) / growths.length : 0;
  }
}

export default new SalesCoachService();