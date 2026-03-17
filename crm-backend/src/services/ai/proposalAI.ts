/**
 * 智能报价与方案生成AI服务
 * 提供基于客户信息的智能报价、方案内容生成、竞品分析等功能
 */

import {
  SmartQuotationInput,
  SmartQuotationResult,
  ProposalGenerationInput,
  ProposalGenerationResult,
} from './types';

// 行业定价基准数据
const INDUSTRY_PRICING_BENCHMARKS: Record<string, { avgDiscount: number; priceElasticity: number }> = {
  '信息技术': { avgDiscount: 0.15, priceElasticity: 0.8 },
  '制造业': { avgDiscount: 0.12, priceElasticity: 0.6 },
  '金融服务': { avgDiscount: 0.08, priceElasticity: 0.4 },
  '教育培训': { avgDiscount: 0.18, priceElasticity: 0.9 },
  '医疗健康': { avgDiscount: 0.10, priceElasticity: 0.5 },
  '电子商务': { avgDiscount: 0.14, priceElasticity: 0.7 },
  '物流运输': { avgDiscount: 0.11, priceElasticity: 0.55 },
  '房地产': { avgDiscount: 0.09, priceElasticity: 0.45 },
  '文化传媒': { avgDiscount: 0.16, priceElasticity: 0.75 },
  '能源环保': { avgDiscount: 0.13, priceElasticity: 0.65 },
  'default': { avgDiscount: 0.12, priceElasticity: 0.6 },
};

// 产品推荐配置
const PRODUCT_RECOMMENDATIONS: Record<string, Array<{ name: string; description: string; category: string; basePrice: number }>> = {
  '信息技术': [
    { name: '企业版许可', description: '完整功能的企业级授权', category: '软件', basePrice: 50000 },
    { name: 'API集成套件', description: '第三方系统对接方案', category: '集成', basePrice: 30000 },
    { name: '数据分析模块', description: '业务数据分析与可视化', category: '分析', basePrice: 25000 },
    { name: '技术支持服务', description: '7x24小时技术支持', category: '服务', basePrice: 15000 },
  ],
  '制造业': [
    { name: '生产管理模块', description: '生产计划与排程管理', category: '核心', basePrice: 80000 },
    { name: '质量控制套件', description: '全流程质量管控', category: '质量', basePrice: 40000 },
    { name: '设备维护系统', description: '设备全生命周期管理', category: '维护', basePrice: 35000 },
    { name: '培训服务包', description: '员工系统操作培训', category: '服务', basePrice: 20000 },
  ],
  'default': [
    { name: '基础服务包', description: '核心功能模块', category: '核心', basePrice: 30000 },
    { name: '高级功能模块', description: '扩展功能组件', category: '扩展', basePrice: 20000 },
    { name: '技术支持服务', description: '专业技术支持', category: '服务', basePrice: 10000 },
    { name: '培训服务', description: '系统使用培训', category: '服务', basePrice: 8000 },
  ],
};

/**
 * 智能报价与方案生成服务类
 */
class ProposalAIService {
  /**
   * 生成智能报价
   * 基于客户信息、历史数据、市场行情生成智能报价建议
   */
  async generateSmartQuotation(input: SmartQuotationInput): Promise<SmartQuotationResult> {
    // 模拟AI处理延迟
    await this.simulateDelay(800, 1500);

    // 获取行业定价基准
    const benchmark = INDUSTRY_PRICING_BENCHMARKS[input.industry || 'default'] || INDUSTRY_PRICING_BENCHMARKS.default;

    // 基础价格计算
    const basePrice = this.calculateBasePrice(input);

    // 定价因子分析
    const pricingFactors = this.analyzePricingFactors(input, benchmark);

    // 价格调整
    let adjustedPrice = basePrice;
    pricingFactors.forEach(factor => {
      if (factor.impact === 'increase') {
        adjustedPrice *= (1 + factor.weight * 0.01);
      } else if (factor.impact === 'decrease') {
        adjustedPrice *= (1 - factor.weight * 0.01);
      }
    });

    // 折扣策略
    const discountStrategy = this.calculateDiscountStrategy(input, adjustedPrice, benchmark);

    // 竞品比较
    const competitorComparison = this.analyzeCompetitorPricing(input, adjustedPrice);

    // 价格范围
    const priceRange = {
      min: Math.round(adjustedPrice * 0.85),
      max: Math.round(adjustedPrice * 1.15),
      recommended: Math.round(adjustedPrice),
    };

    // 推荐建议
    const recommendations = this.generatePricingRecommendations(input, adjustedPrice, discountStrategy);

    return {
      recommendedPrice: Math.round(adjustedPrice),
      priceRange,
      discountStrategy,
      pricingFactors,
      competitorComparison,
      recommendations,
      confidence: this.calculateConfidence(input),
    };
  }

  /**
   * 生成方案内容
   * AI生成完整的商务方案内容
   */
  async generateProposalContent(input: ProposalGenerationInput): Promise<ProposalGenerationResult> {
    // 模拟AI处理延迟
    await this.simulateDelay(1000, 2000);

    // 执行摘要
    const executiveSummary = this.generateExecutiveSummary(input);

    // 问题陈述
    const problemStatement = this.generateProblemStatement(input);

    // 解决方案
    const proposedSolution = this.generateProposedSolution(input);

    // 产品推荐
    const productRecommendations = this.generateProductRecommendations(input);

    // 实施计划
    const implementationPlan = this.generateImplementationPlan(input);

    // 条款
    const terms = this.generateTerms(input);

    // 服务等级
    const serviceLevel = this.generateServiceLevel();

    // ROI预测
    const roiProjection = this.calculateROI(input, productRecommendations);

    // 下一步行动
    const nextSteps = this.generateNextSteps(input);

    return {
      executiveSummary,
      problemStatement,
      proposedSolution,
      productRecommendations,
      implementationPlan,
      terms,
      serviceLevel,
      roiProjection,
      nextSteps,
    };
  }

  /**
   * 分析竞品定价
   */
  async analyzeCompetitorPricing(input: SmartQuotationInput, ourPrice: number): Promise<SmartQuotationResult['competitorComparison'] | undefined> {
    if (!input.competitors || input.competitors.length === 0) {
      return undefined;
    }

    return input.competitors.map(competitor => {
      const theirPrice = competitor.price || ourPrice * (0.85 + Math.random() * 0.3);
      const priceDiff = ((ourPrice - theirPrice) / theirPrice) * 100;

      return {
        competitor: competitor.name,
        theirPrice: Math.round(theirPrice),
        ourAdvantage: this.generateCompetitiveAdvantage(competitor.name, priceDiff),
        pricePosition: priceDiff > 5 ? 'higher' : priceDiff < -5 ? 'lower' : 'similar',
      };
    });
  }

  /**
   * 计算折扣策略
   */
  private calculateDiscountStrategy(
    input: SmartQuotationInput,
    price: number,
    benchmark: { avgDiscount: number; priceElasticity: number }
  ): SmartQuotationResult['discountStrategy'] {
    // 基于客户价值和历史交易计算折扣
    let suggestedDiscount = benchmark.avgDiscount;

    // 大客户折扣
    if (input.estimatedValue && input.estimatedValue > 500000) {
      suggestedDiscount += 0.05;
    }

    // 老客户折扣
    if (input.previousDeals && input.previousDeals.length > 0) {
      suggestedDiscount += 0.03;
    }

    // 预算限制调整
    if (input.budget?.max && price > input.budget.max) {
      const neededDiscount = (price - input.budget.max) / price;
      suggestedDiscount = Math.max(suggestedDiscount, neededDiscount + 0.02);
    }

    suggestedDiscount = Math.min(suggestedDiscount, 0.30); // 最大30%折扣

    return {
      suggestedDiscount: Math.round(suggestedDiscount * 100) / 100,
      reason: this.generateDiscountReason(input, suggestedDiscount),
      conditions: suggestedDiscount > 0.15 ? ['需要财务审批', '需签订年度合作协议'] : undefined,
    };
  }

  /**
   * 计算基础价格
   */
  private calculateBasePrice(input: SmartQuotationInput): number {
    if (input.products && input.products.length > 0) {
      return input.products.reduce((sum, p) => {
        const price = p.unitPrice || this.estimateProductPrice(p.name);
        return sum + price * p.quantity;
      }, 0);
    }

    // 基于客户估价或默认值
    return input.estimatedValue || 100000;
  }

  /**
   * 分析定价因子
   */
  private analyzePricingFactors(
    input: SmartQuotationInput,
    benchmark: { avgDiscount: number; priceElasticity: number }
  ): SmartQuotationResult['pricingFactors'] {
    const factors: SmartQuotationResult['pricingFactors'] = [];

    // 行业因子
    factors.push({
      factor: '行业特性',
      impact: benchmark.priceElasticity > 0.7 ? 'decrease' : 'neutral',
      weight: Math.abs(benchmark.priceElasticity - 0.5) * 20,
      description: `${input.industry || '通用'}行业的价格敏感度为${(benchmark.priceElasticity * 100).toFixed(0)}%`,
    });

    // 客户价值因子
    if (input.estimatedValue && input.estimatedValue > 300000) {
      factors.push({
        factor: '客户价值',
        impact: 'increase',
        weight: 5,
        description: '高价值客户，建议提供更优质的服务方案',
      });
    }

    // 历史合作因子
    if (input.previousDeals && input.previousDeals.length > 0) {
      factors.push({
        factor: '历史合作',
        impact: 'decrease',
        weight: 3,
        description: `已有${input.previousDeals.length}次合作记录，可享受老客户优惠`,
      });
    }

    // 预算因子
    if (input.budget) {
      if (input.budget.max && input.budget.max < (input.estimatedValue || 100000) * 0.8) {
        factors.push({
          factor: '预算限制',
          impact: 'decrease',
          weight: 8,
          description: '客户预算有限，需要调整方案配置',
        });
      } else if (input.budget.min && input.budget.min > (input.estimatedValue || 100000) * 1.2) {
        factors.push({
          factor: '预算充足',
          impact: 'increase',
          weight: 5,
          description: '客户预算充足，可推荐高级方案',
        });
      }
    }

    // 竞品因子
    if (input.competitors && input.competitors.length > 0) {
      factors.push({
        factor: '竞争环境',
        impact: 'decrease',
        weight: 4,
        description: `存在${input.competitors.length}家竞品，需保持价格竞争力`,
      });
    }

    return factors;
  }

  /**
   * 生成定价建议
   */
  private generatePricingRecommendations(
    input: SmartQuotationInput,
    price: number,
    discountStrategy: SmartQuotationResult['discountStrategy']
  ): SmartQuotationResult['recommendations'] {
    const recommendations: SmartQuotationResult['recommendations'] = [];

    // 定价建议
    recommendations.push({
      type: 'pricing',
      suggestion: `建议报价${Math.round(price).toLocaleString()}元，可提供最高${(discountStrategy.suggestedDiscount * 100).toFixed(0)}%折扣`,
      expectedImpact: '在保持利润的同时提高成交概率',
    });

    // 捆绑销售建议
    if (input.products && input.products.length < 3) {
      recommendations.push({
        type: 'bundling',
        suggestion: '推荐增加技术培训和维护服务，形成完整解决方案',
        expectedImpact: '提升客单价20-30%，增强客户粘性',
      });
    }

    // 增销建议
    if (input.estimatedValue && input.estimatedValue > 200000) {
      recommendations.push({
        type: 'upsell',
        suggestion: '客户规模较大，建议推荐企业级高级版本',
        expectedImpact: '可提升合同金额30-50%',
      });
    }

    // 折扣策略建议
    if (discountStrategy.suggestedDiscount > 0.15) {
      recommendations.push({
        type: 'discount',
        suggestion: '建议采用阶梯式折扣，首年优惠，续签恢复原价',
        expectedImpact: '在满足客户预算需求的同时保护长期利润',
      });
    }

    return recommendations;
  }

  /**
   * 生成执行摘要
   */
  private generateExecutiveSummary(input: ProposalGenerationInput): string {
    const customerName = input.company || input.customerName || '贵公司';
    const industry = input.industry || '贵行业';
    const value = input.value.toLocaleString();

    return `本方案专为${customerName}量身定制，基于对${industry}行业特点的深入理解，提供了一套完整的解决方案。方案总价值${value}元，涵盖核心业务需求，预期可在3-6个月内实现投资回报。`;
  }

  /**
   * 生成问题陈述
   */
  private generateProblemStatement(input: ProposalGenerationInput): string {
    const industry = input.industry || '企业';
    const painPoints = input.painPoints || ['业务效率提升', '成本控制', '数字化转型'];

    return `当前${industry}领域面临的核心挑战包括：\n\n${painPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}\n\n这些问题直接影响企业的运营效率和市场竞争力，需要通过系统化的解决方案来应对。`;
  }

  /**
   * 生成解决方案
   */
  private generateProposedSolution(input: ProposalGenerationInput): string {
    const customerName = input.company || input.customerName || '贵公司';

    return `针对${customerName}的具体需求，我们提供以下综合解决方案：

**核心方案架构**
- 业务流程自动化模块：实现关键业务流程的标准化和自动化
- 数据分析平台：提供实时业务洞察和决策支持
- 集成接口：支持与现有系统的无缝对接
- 移动应用：随时随地访问和管理业务

**方案优势**
1. 行业最佳实践：融入${input.industry || '通用'}行业的成功经验
2. 灵活配置：可根据业务发展动态调整
3. 安全可靠：企业级安全架构，多重数据保护
4. 快速部署：成熟的实施方法论，缩短上线周期`;
  }

  /**
   * 生成产品推荐
   */
  private generateProductRecommendations(input: ProposalGenerationInput): ProposalGenerationResult['productRecommendations'] {
    const products = PRODUCT_RECOMMENDATIONS[input.industry || 'default'] || PRODUCT_RECOMMENDATIONS.default;
    const valueRatio = input.value / products.reduce((sum, p) => sum + p.basePrice, 0);

    return products.map((product, index) => {
      const adjustedPrice = Math.round(product.basePrice * valueRatio);
      return {
        name: product.name,
        description: product.description,
        quantity: 1,
        unitPrice: adjustedPrice,
        totalPrice: adjustedPrice,
        benefit: this.getProductBenefit(product.name),
        priority: index === 0 ? 'essential' : index < 2 ? 'recommended' : 'optional',
      };
    });
  }

  /**
   * 生成实施计划
   */
  private generateImplementationPlan(input: ProposalGenerationInput): ProposalGenerationResult['implementationPlan'] {
    const startDate = input.timeline?.startDate || new Date().toISOString().split('T')[0];

    return [
      {
        phase: '第一阶段：需求确认与方案设计',
        duration: '2周',
        deliverables: ['详细需求文档', '系统设计方案', '项目计划书'],
        milestones: ['需求评审通过', '设计确认签字'],
      },
      {
        phase: '第二阶段：系统部署与配置',
        duration: '3周',
        deliverables: ['系统环境搭建', '基础数据导入', '功能配置完成'],
        milestones: ['环境验收', '配置审核'],
      },
      {
        phase: '第三阶段：测试与培训',
        duration: '2周',
        deliverables: ['测试报告', '操作手册', '培训记录'],
        milestones: ['UAT测试通过', '培训考核完成'],
      },
      {
        phase: '第四阶段：上线与支持',
        duration: '1周',
        deliverables: ['上线检查清单', '运维文档', '支持服务启动'],
        milestones: ['系统正式上线', '验收签字'],
      },
    ];
  }

  /**
   * 生成条款
   */
  private generateTerms(input: ProposalGenerationInput): string {
    return `一、合同条款

1. 付款方式
   - 首付款：合同签订后支付30%
   - 中期款：系统部署完成后支付40%
   - 尾款：验收通过后支付30%

2. 交付周期
   - 标准交付周期为6-8周
   - 具体时间根据需求复杂度调整

3. 服务承诺
   - 质保期：系统上线后12个月
   - 响应时间：工作日4小时内响应
   - 培训服务：提供不少于16小时的系统培训

4. 知识产权
   - 定制开发部分的知识产权归客户所有
   - 标准产品模块的知识产权归供应商所有

5. 变更管理
   - 需求变更需双方书面确认
   - 重大变更可能影响交付时间和费用`;
  }

  /**
   * 生成服务等级
   */
  private generateServiceLevel(): ProposalGenerationResult['serviceLevel'] {
    return {
      responseTime: '工作日4小时内响应，紧急问题2小时内响应',
      supportHours: '周一至周五 9:00-18:00，VIP客户可享7x24小时支持',
      warranty: '系统上线后12个月免费维护',
      training: '提供不少于16小时的系统培训，包括现场培训和在线培训',
    };
  }

  /**
   * 计算ROI
   */
  private calculateROI(
    input: ProposalGenerationInput,
    products: ProposalGenerationResult['productRecommendations']
  ): ProposalGenerationResult['roiProjection'] {
    const investment = products.reduce((sum, p) => sum + p.totalPrice, 0);
    const expectedReturn = investment * (2.5 + Math.random() * 1.5);
    const paybackMonths = Math.round(investment / (expectedReturn / 12));

    return {
      investment,
      expectedReturn: Math.round(expectedReturn),
      paybackPeriod: `${paybackMonths}个月`,
      benefits: [
        '业务效率提升30-50%',
        '运营成本降低15-25%',
        '决策效率提升40%',
        '客户满意度提升20%',
        '数据准确性提升95%',
      ],
    };
  }

  /**
   * 生成下一步行动
   */
  private generateNextSteps(input: ProposalGenerationInput): string[] {
    return [
      '安排双方技术团队对接会议，深入讨论需求细节',
      '提供产品演示环境，供客户体验测试',
      '根据反馈调整方案配置和报价',
      '准备正式合同和项目启动文档',
      '确认项目时间线和资源安排',
    ];
  }

  /**
   * 辅助方法
   */
  private simulateDelay(min: number, max: number): Promise<void> {
    return new Promise(resolve => {
      setTimeout(resolve, min + Math.random() * (max - min));
    });
  }

  private estimateProductPrice(name: string): number {
    const priceMap: Record<string, number> = {
      '基础服务': 30000,
      '高级功能': 50000,
      '技术支持': 20000,
      '培训服务': 15000,
    };
    return priceMap[name] || 25000;
  }

  private generateDiscountReason(input: SmartQuotationInput, discount: number): string {
    const reasons: string[] = [];

    if (input.estimatedValue && input.estimatedValue > 500000) {
      reasons.push('大客户优惠');
    }
    if (input.previousDeals && input.previousDeals.length > 0) {
      reasons.push('老客户回馈');
    }
    if (input.competitors && input.competitors.length > 0) {
      reasons.push('市场竞争策略');
    }

    if (reasons.length === 0) {
      reasons.push('标准商务折扣');
    }

    return `基于${reasons.join('、')}，建议给予${(discount * 100).toFixed(0)}%折扣`;
  }

  private generateCompetitiveAdvantage(competitor: string, priceDiff: number): string {
    if (priceDiff > 10) {
      return `相比${competitor}，我们的产品在功能完整性、服务响应速度和行业适配性方面具有明显优势`;
    } else if (priceDiff < -10) {
      return `相比${competitor}，我们在价格上具有显著优势，同时保证产品质量和服务水平`;
    } else {
      return `与${competitor}相比，我们在性价比、本地化服务和定制能力方面更有优势`;
    }
  }

  private calculateConfidence(input: SmartQuotationInput): number {
    let confidence = 0.6;

    // 信息完整度加分
    if (input.industry) confidence += 0.1;
    if (input.estimatedValue) confidence += 0.1;
    if (input.budget) confidence += 0.05;
    if (input.previousDeals && input.previousDeals.length > 0) confidence += 0.1;
    if (input.competitors && input.competitors.length > 0) confidence += 0.05;

    return Math.min(confidence, 0.95);
  }

  private getProductBenefit(productName: string): string {
    const benefits: Record<string, string> = {
      '企业版许可': '完整功能支持，满足企业全方位需求',
      'API集成套件': '实现系统互联互通，消除信息孤岛',
      '数据分析模块': '数据驱动决策，提升业务洞察力',
      '技术支持服务': '专业团队保障，确保系统稳定运行',
      '生产管理模块': '优化生产流程，提升制造效率',
      '质量控制套件': '全流程品控，保障产品质量',
      '设备维护系统': '降低故障率，延长设备寿命',
      '基础服务包': '核心功能保障，业务快速上线',
      '高级功能模块': '扩展业务能力，支撑持续发展',
    };

    return benefits[productName] || '提升业务效率，支撑企业发展';
  }
}

export default new ProposalAIService();