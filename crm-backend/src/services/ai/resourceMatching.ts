/**
 * 售前资源智能匹配AI服务
 * 提供多维度资源匹配评分、最优分配算法、资源可用性预测等功能
 */

import {
  ResourceMatchingInput,
  ResourceInfo,
  ResourceMatchingResult,
  AssignmentRecommendationInput,
  AssignmentRecommendationResult,
} from './types';

// 匹配权重配置
const MATCH_WEIGHTS = {
  skillMatch: 0.40,        // 技能匹配度
  experienceMatch: 0.20,   // 经验匹配度
  locationMatch: 0.15,     // 地理位置
  workloadFit: 0.15,       // 工作负载
  successHistory: 0.10,    // 历史成功率
};

// 推荐阈值
const RECOMMENDATION_THRESHOLDS = {
  highly_recommended: 85,
  recommended: 70,
  acceptable: 50,
};

// 技能重要性级别
const SKILL_IMPORTANCE_LEVELS: Record<string, 'critical' | 'important' | 'preferred'> = {
  '技术演示': 'critical',
  '需求分析': 'critical',
  '方案设计': 'critical',
  '项目管理': 'important',
  '沟通协调': 'important',
  '文档编写': 'preferred',
  '培训交付': 'preferred',
};

/**
 * 售前资源智能匹配服务类
 */
class ResourceMatchingService {
  /**
   * 智能匹配资源
   * 基于多维度评分算法匹配最合适的售前资源
   */
  async matchResources(
    input: ResourceMatchingInput,
    availableResources: ResourceInfo[]
  ): Promise<ResourceMatchingResult> {
    await this.simulateDelay(600, 1200);

    if (availableResources.length === 0) {
      return {
        matchedResources: [],
        bestMatch: { resourceId: '', confidence: 0, reason: '没有可用资源' },
        alternatives: [],
        recommendations: ['暂无可用资源，建议等待或调整需求'],
      };
    }

    // 计算每个资源的匹配分数
    const matchedResources = availableResources
      .map(resource => this.calculateMatchScore(input, resource))
      .sort((a, b) => b.matchScore - a.matchScore);

    // 确定最佳匹配
    const bestMatch = matchedResources[0];

    // 生成备选方案
    const alternatives = matchedResources.slice(1, 4).map(r => ({
      resourceId: r.resource.id,
      score: r.matchScore,
      tradeoffs: this.analyzeTradeoffs(bestMatch, r),
    }));

    // 生成建议
    const recommendations = this.generateMatchingRecommendations(input, matchedResources);

    return {
      matchedResources,
      bestMatch: {
        resourceId: bestMatch.resource.id,
        confidence: bestMatch.matchScore / 100,
        reason: this.generateMatchReason(bestMatch),
      },
      alternatives,
      recommendations,
    };
  }

  /**
   * 计算匹配分数
   * 多维度评分算法
   */
  calculateMatchScore(input: ResourceMatchingInput, resource: ResourceInfo): ResourceMatchingResult['matchedResources'][0] {
    // 技能匹配 (40%)
    const skillMatch = this.calculateSkillMatch(input.requiredSkills, resource.skills);

    // 经验匹配 (20%)
    const experienceMatch = this.calculateExperienceMatch(input, resource);

    // 地理位置匹配 (15%)
    const locationMatch = this.calculateLocationMatch(input.location, resource.location);

    // 工作负载评估 (15%)
    const workloadFit = this.calculateWorkloadFit(resource);

    // 历史成功率 (10%)
    const successHistory = this.calculateSuccessHistory(resource);

    // 综合评分
    const matchScore =
      skillMatch.score * MATCH_WEIGHTS.skillMatch +
      experienceMatch.score * MATCH_WEIGHTS.experienceMatch +
      locationMatch.score * MATCH_WEIGHTS.locationMatch +
      workloadFit.score * MATCH_WEIGHTS.workloadFit +
      successHistory.score * MATCH_WEIGHTS.successHistory;

    // 计算匹配和缺失的技能
    const matchedSkills = input.requiredSkills.filter(skill =>
      resource.skills.some(s => s.toLowerCase().includes(skill.toLowerCase()) || skill.toLowerCase().includes(s.toLowerCase()))
    );
    const missingSkills = input.requiredSkills.filter(skill =>
      !resource.skills.some(s => s.toLowerCase().includes(skill.toLowerCase()) || skill.toLowerCase().includes(s.toLowerCase()))
    );

    // 确定推荐级别
    const recommendation = this.determineRecommendation(matchScore);

    return {
      resource,
      matchScore: Math.round(matchScore),
      matchedSkills,
      missingSkills,
      factors: {
        skillMatch: { score: skillMatch.score, weight: MATCH_WEIGHTS.skillMatch * 100, details: skillMatch.details },
        experienceMatch: { score: experienceMatch.score, weight: MATCH_WEIGHTS.experienceMatch * 100, details: experienceMatch.details },
        locationMatch: { score: locationMatch.score, weight: MATCH_WEIGHTS.locationMatch * 100, details: locationMatch.details },
        workloadFit: { score: workloadFit.score, weight: MATCH_WEIGHTS.workloadFit * 100, details: workloadFit.details },
        successHistory: { score: successHistory.score, weight: MATCH_WEIGHTS.successHistory * 100, details: successHistory.details },
      },
      recommendation,
      availabilityWindow: resource.status === 'available' ? {
        availableFrom: new Date(),
        availableUntil: undefined,
      } : undefined,
    };
  }

  /**
   * 生成分配建议
   */
  async generateAssignmentRecommendation(
    input: AssignmentRecommendationInput
  ): Promise<AssignmentRecommendationResult> {
    await this.simulateDelay(400, 800);

    if (input.matchedResources.length === 0) {
      return {
        recommendedResourceId: '',
        confidence: 0,
        reasoning: '没有可匹配的资源',
        alternativeOptions: [],
        riskAssessment: { level: 'high', factors: ['资源不足'], mitigations: ['等待资源释放', '调整项目时间'] },
        suggestedTerms: {
          estimatedStartDate: new Date(),
          estimatedDuration: 0,
          handoffNotes: '',
        },
      };
    }

    const bestMatch = input.matchedResources[0];
    const urgencyFactor = this.calculateUrgencyFactor(input.urgencyLevel);

    // 根据紧急程度调整推荐
    let recommendedResource = bestMatch;
    if (input.urgencyLevel === 'urgent' && bestMatch.resource.status !== 'available') {
      // 紧急情况寻找最可能快速上手的资源
      const quickStart = input.matchedResources.find(r =>
        r.resource.status === 'available' && r.matchScore >= 60
      );
      if (quickStart) {
        recommendedResource = quickStart;
      }
    }

    // 生成替代方案
    const alternativeOptions = input.matchedResources.slice(1, 3).map((r, index) => ({
      resourceId: r.resource.id,
      scenario: index === 0 ? '首选资源不可用时' : '需要特定技能组合时',
      conditions: r.missingSkills.length > 0
        ? [`需要补充${r.missingSkills.join('、')}技能支持`]
        : ['可独立完成任务'],
    }));

    // 风险评估
    const riskAssessment = this.assessRisk(recommendedResource, input);

    // 建议条款
    const suggestedTerms = {
      estimatedStartDate: this.estimateStartDate(recommendedResource),
      estimatedDuration: input.matchedResources[0].resource.currentWorkload
        ? Math.round((100 - input.matchedResources[0].resource.currentWorkload) / 10)
        : 5,
      handoffNotes: this.generateHandoffNotes(recommendedResource),
    };

    return {
      recommendedResourceId: recommendedResource.resource.id,
      confidence: (recommendedResource.matchScore / 100) * urgencyFactor,
      reasoning: this.generateAssignmentReasoning(recommendedResource, input),
      alternativeOptions,
      riskAssessment,
      suggestedTerms,
    };
  }

  /**
   * 预测资源可用性
   */
  async predictResourceAvailability(
    resourceId: string,
    futureDate: Date
  ): Promise<{ available: boolean; confidence: number; reason: string }> {
    await this.simulateDelay(200, 400);

    // 模拟预测逻辑
    const daysUntilFuture = Math.ceil((futureDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    const baseAvailability = daysUntilFuture > 7 ? 0.8 : 0.5;

    return {
      available: baseAvailability > 0.6,
      confidence: baseAvailability,
      reason: daysUntilFuture > 7
        ? '时间充裕，预计可以安排'
        : '时间紧迫，需要确认现有任务进度',
    };
  }

  /**
   * 优化资源分配
   * 考虑多个请求时的全局优化
   */
  async optimizeResourceAllocation(
    requests: Array<{ id: string; input: ResourceMatchingInput; priority: 'high' | 'medium' | 'low' }>,
    resources: ResourceInfo[]
  ): Promise<Array<{ requestId: string; assignedResourceId: string; score: number; reasoning: string }>> {
    await this.simulateDelay(800, 1500);

    const assignments: Array<{ requestId: string; assignedResourceId: string; score: number; reasoning: string }> = [];
    const assignedResources = new Set<string>();
    const resourceWorkloads = new Map<string, number>();

    // 初始化工作负载
    resources.forEach(r => {
      resourceWorkloads.set(r.id, r.currentWorkload || 0);
    });

    // 按优先级排序请求
    const sortedRequests = requests.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    // 逐个分配
    for (const request of sortedRequests) {
      const availableForResource = resources.filter(r =>
        !assignedResources.has(r.id) && (resourceWorkloads.get(r.id) || 0) < 90
      );

      if (availableForResource.length > 0) {
        const matchResult = await this.matchResources(request.input, availableForResource);
        if (matchResult.matchedResources.length > 0) {
          const best = matchResult.matchedResources[0];
          assignments.push({
            requestId: request.id,
            assignedResourceId: best.resource.id,
            score: best.matchScore,
            reasoning: this.generateMatchReason(best),
          });
          assignedResources.add(best.resource.id);
          resourceWorkloads.set(best.resource.id, (resourceWorkloads.get(best.resource.id) || 0) + 30);
        }
      }
    }

    return assignments;
  }

  /**
   * 计算技能匹配度
   */
  private calculateSkillMatch(
    requiredSkills: string[],
    resourceSkills: string[]
  ): { score: number; details: string } {
    if (requiredSkills.length === 0) {
      return { score: 100, details: '无特定技能要求' };
    }

    // 计算基础匹配率
    let matchCount = 0;
    let weightedScore = 0;

    for (const required of requiredSkills) {
      const isMatched = resourceSkills.some(skill =>
        skill.toLowerCase().includes(required.toLowerCase()) ||
        required.toLowerCase().includes(skill.toLowerCase())
      );

      if (isMatched) {
        matchCount++;
        // 根据技能重要性加权
        const importance = SKILL_IMPORTANCE_LEVELS[required] || 'important';
        const weight = importance === 'critical' ? 3 : importance === 'important' ? 2 : 1;
        weightedScore += weight;
      }
    }

    // 计算最高可能加权分数
    const maxWeightedScore = requiredSkills.reduce((sum, skill) => {
      const importance = SKILL_IMPORTANCE_LEVELS[skill] || 'important';
      return sum + (importance === 'critical' ? 3 : importance === 'important' ? 2 : 1);
    }, 0);

    const score = maxWeightedScore > 0 ? (weightedScore / maxWeightedScore) * 100 : 100;

    return {
      score: Math.round(score),
      details: `匹配${matchCount}/${requiredSkills.length}项技能`,
    };
  }

  /**
   * 计算经验匹配度
   */
  private calculateExperienceMatch(
    input: ResourceMatchingInput,
    resource: ResourceInfo
  ): { score: number; details: string } {
    const experience = resource.experience || 0;

    // 基于项目预估时长评估经验需求
    const estimatedDuration = input.estimatedDuration || 8;
    const requiredExperience = estimatedDuration > 40 ? 5 : estimatedDuration > 20 ? 3 : 1;

    if (experience >= requiredExperience) {
      const excessYears = experience - requiredExperience;
      const bonus = Math.min(excessYears * 5, 20);
      return {
        score: Math.min(100, 80 + bonus),
        details: `${experience}年经验，满足${requiredExperience}年需求`,
      };
    } else {
      const gap = requiredExperience - experience;
      const deduction = gap * 15;
      return {
        score: Math.max(40, 80 - deduction),
        details: `${experience}年经验，建议${requiredExperience}年以上`,
      };
    }
  }

  /**
   * 计算地理位置匹配度
   */
  private calculateLocationMatch(
    requestLocation?: string,
    resourceLocation?: string
  ): { score: number; details: string } {
    if (!requestLocation) {
      return { score: 100, details: '无地理位置要求' };
    }

    if (!resourceLocation) {
      return { score: 70, details: '资源位置信息缺失' };
    }

    // 简单的城市匹配
    const requestCity = requestLocation.split(/[市省区县]/)[0];
    const resourceCity = resourceLocation.split(/[市省区县]/)[0];

    if (requestCity === resourceCity) {
      return { score: 100, details: `同城市(${resourceCity})，便于现场支持` };
    }

    // 同省份加分
    if (requestLocation.includes(resourceCity) || resourceLocation.includes(requestCity)) {
      return { score: 80, details: '同省份，可提供远程+现场支持' };
    }

    return { score: 50, details: '异地资源，主要提供远程支持' };
  }

  /**
   * 计算工作负载适配度
   */
  private calculateWorkloadFit(resource: ResourceInfo): { score: number; details: string } {
    const workload = resource.currentWorkload || 0;
    const status = resource.status;

    if (status === 'available' && workload < 30) {
      return { score: 100, details: '资源充裕，可立即投入' };
    }

    if (status === 'available' && workload < 60) {
      return { score: 85, details: '有一定余量，可安排任务' };
    }

    if (status === 'available' && workload < 80) {
      return { score: 60, details: '工作较满，需协调时间' };
    }

    if (status === 'busy') {
      return { score: 30, details: '当前任务较多，需等待释放' };
    }

    return { score: 10, details: '资源不可用' };
  }

  /**
   * 计算历史成功率
   */
  private calculateSuccessHistory(resource: ResourceInfo): { score: number; details: string } {
    const completedRequests = resource.completedRequests || 0;
    const successRate = resource.successRate || 0;

    if (completedRequests === 0) {
      return { score: 60, details: '暂无历史数据' };
    }

    // 综合完成数量和成功率
    const quantityBonus = Math.min(completedRequests * 2, 20);
    const rateScore = successRate * 0.8;

    return {
      score: Math.round(Math.min(100, 60 + quantityBonus + rateScore)),
      details: `完成${completedRequests}个项目，成功率${(successRate * 100).toFixed(0)}%`,
    };
  }

  /**
   * 确定推荐级别
   */
  private determineRecommendation(score: number): 'highly_recommended' | 'recommended' | 'acceptable' | 'not_recommended' {
    if (score >= RECOMMENDATION_THRESHOLDS.highly_recommended) return 'highly_recommended';
    if (score >= RECOMMENDATION_THRESHOLDS.recommended) return 'recommended';
    if (score >= RECOMMENDATION_THRESHOLDS.acceptable) return 'acceptable';
    return 'not_recommended';
  }

  /**
   * 生成匹配原因
   */
  private generateMatchReason(match: ResourceMatchingResult['matchedResources'][0]): string {
    const reasons: string[] = [];

    if (match.matchedSkills.length > 0) {
      reasons.push(`具备${match.matchedSkills.join('、')}等关键技能`);
    }

    if (match.factors.experienceMatch.score >= 80) {
      reasons.push('经验丰富');
    }

    if (match.factors.workloadFit.score >= 80) {
      reasons.push('当前工作负载适中');
    }

    if (match.factors.locationMatch.score >= 80) {
      reasons.push('地理位置优势');
    }

    if (match.factors.successHistory.score >= 80) {
      reasons.push('历史表现优秀');
    }

    return reasons.length > 0
      ? `综合评分${match.matchScore}分，${reasons.join('，')}`
      : `综合评分${match.matchScore}分，建议进一步评估`;
  }

  /**
   * 分析权衡
   */
  private analyzeTradeoffs(
    best: ResourceMatchingResult['matchedResources'][0],
    alternative: ResourceMatchingResult['matchedResources'][0]
  ): string {
    const tradeoffs: string[] = [];

    // 技能差距
    if (alternative.matchedSkills.length < best.matchedSkills.length) {
      tradeoffs.push(`缺少${alternative.missingSkills.slice(0, 2).join('、')}技能`);
    }

    // 经验差距
    if (alternative.factors.experienceMatch.score < best.factors.experienceMatch.score - 10) {
      tradeoffs.push('经验相对较少');
    }

    // 负载差距
    if (alternative.factors.workloadFit.score < best.factors.workloadFit.score - 10) {
      tradeoffs.push('工作负载较高');
    }

    return tradeoffs.length > 0
      ? `评分低${best.matchScore - alternative.matchScore}分，${tradeoffs.join('；')}`
      : `评分相近，可考虑轮换`;
  }

  /**
   * 生成匹配建议
   */
  private generateMatchingRecommendations(
    input: ResourceMatchingInput,
    matches: ResourceMatchingResult['matchedResources']
  ): string[] {
    const recommendations: string[] = [];

    // 检查匹配质量
    const topMatch = matches[0];
    if (topMatch.matchScore < 60) {
      recommendations.push('整体匹配度偏低，建议调整项目需求或降低技能要求');
    }

    // 检查技能缺口
    if (topMatch.missingSkills.length > 0) {
      recommendations.push(`建议安排${topMatch.missingSkills.slice(0, 2).join('、')}方面的技能培训或支援`);
    }

    // 检查资源紧张情况
    const availableCount = matches.filter(m => m.resource.status === 'available').length;
    if (availableCount < 2) {
      recommendations.push('可用资源有限，建议提前锁定或申请额外资源');
    }

    // 紧急项目建议
    if (input.priority === 'high') {
      recommendations.push('高优先级项目，建议同步准备备选方案');
    }

    return recommendations.length > 0 ? recommendations : ['匹配结果良好，建议尽快确认资源'];
  }

  /**
   * 计算紧急程度因子
   */
  private calculateUrgencyFactor(urgency: 'urgent' | 'high' | 'normal' | 'low'): number {
    const factors = {
      urgent: 0.95,  // 紧急情况可能需要妥协
      high: 1.0,
      normal: 1.0,
      low: 1.05,     // 低紧急可以等待更好的资源
    };
    return factors[urgency];
  }

  /**
   * 评估风险
   */
  private assessRisk(
    match: ResourceMatchingResult['matchedResources'][0],
    input: AssignmentRecommendationInput
  ): AssignmentRecommendationResult['riskAssessment'] {
    const factors: string[] = [];
    const mitigations: string[] = [];

    // 技能风险
    if (match.missingSkills.length > 0) {
      factors.push(`缺少${match.missingSkills.length}项所需技能`);
      mitigations.push('安排技能培训或技术支援');
    }

    // 工作负载风险
    if (match.factors.workloadFit.score < 60) {
      factors.push('资源工作负载较高');
      mitigations.push('提前沟通时间安排');
    }

    // 经验风险
    if (match.factors.experienceMatch.score < 60) {
      factors.push('相关经验不足');
      mitigations.push('安排资深人员指导');
    }

    // 确定风险等级
    let level: 'low' | 'medium' | 'high' = 'low';
    if (factors.length >= 3 || match.matchScore < 60) {
      level = 'high';
    } else if (factors.length >= 1 || match.matchScore < 75) {
      level = 'medium';
    }

    if (factors.length === 0) {
      factors.push('无明显风险因素');
      mitigations.push('保持常规跟进');
    }

    return { level, factors, mitigations };
  }

  /**
   * 估算开始时间
   */
  private estimateStartDate(match: ResourceMatchingResult['matchedResources'][0]): Date {
    const startDate = new Date();

    if (match.resource.status !== 'available') {
      // 如果资源忙碌，延迟开始时间
      startDate.setDate(startDate.getDate() + 3);
    } else if (match.factors.workloadFit.score < 70) {
      // 负载较高，稍微延迟
      startDate.setDate(startDate.getDate() + 1);
    }

    return startDate;
  }

  /**
   * 生成交接说明
   */
  private generateHandoffNotes(match: ResourceMatchingResult['matchedResources'][0]): string {
    const notes: string[] = [];

    notes.push(`匹配度：${match.matchScore}分`);

    if (match.matchedSkills.length > 0) {
      notes.push(`核心技能：${match.matchedSkills.join('、')}`);
    }

    if (match.missingSkills.length > 0) {
      notes.push(`需支援技能：${match.missingSkills.join('、')}`);
    }

    notes.push(`推荐等级：${match.recommendation}`);

    return notes.join('\n');
  }

  /**
   * 生成分配理由
   */
  private generateAssignmentReasoning(
    match: ResourceMatchingResult['matchedResources'][0],
    input: AssignmentRecommendationInput
  ): string {
    const reasons: string[] = [];

    reasons.push(`综合匹配分数${match.matchScore}分`);

    // 主要优势
    const topFactors = Object.entries(match.factors)
      .filter(([_, f]) => f.score >= 80)
      .map(([name, _]) => {
        const names: Record<string, string> = {
          skillMatch: '技能匹配',
          experienceMatch: '经验适配',
          locationMatch: '地理优势',
          workloadFit: '负载适中',
          successHistory: '历史表现',
        };
        return names[name];
      });

    if (topFactors.length > 0) {
      reasons.push(`${topFactors.slice(0, 2).join('、')}表现突出`);
    }

    // 紧急情况特殊说明
    if (input.urgencyLevel === 'urgent') {
      reasons.push('考虑紧急程度优先保证可用性');
    }

    return reasons.join('，');
  }

  /**
   * 辅助方法
   */
  private simulateDelay(min: number, max: number): Promise<void> {
    return new Promise(resolve => {
      setTimeout(resolve, min + Math.random() * (max - min));
    });
  }
}

export default new ResourceMatchingService();