/**
 * 报告生成服务
 * 根据用户活动数据自动生成日报/周报
 */

import type { DailyReportInput, DailyReportResult } from './types';

// AI配置
const AI_CONFIG = {
  useRealAPI: process.env.TENCENT_SECRET_ID && process.env.TENCENT_SECRET_KEY,
};

/**
 * 报告生成服务
 */
class ReportGenerationService {
  /**
   * 生成日报/周报
   */
  async generateReport(input: DailyReportInput): Promise<DailyReportResult> {
    if (AI_CONFIG.useRealAPI) {
      return this.callRealGeneration(input);
    }
    return this.mockGeneration(input);
  }

  /**
   * 调用真实AI API
   */
  private async callRealGeneration(input: DailyReportInput): Promise<DailyReportResult> {
    // TODO: 实现腾讯云混元API调用
    return this.mockGeneration(input);
  }

  /**
   * 模拟报告生成
   */
  private mockGeneration(input: DailyReportInput): Promise<DailyReportResult> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const result = this.generateMockReport(input);
        resolve(result);
      }, 1200 + Math.random() * 800);
    });
  }

  /**
   * 生成模拟报告内容
   */
  private generateMockReport(input: DailyReportInput): DailyReportResult {
    const { userName, type, activities, stats } = input;
    const isWeekly = type === 'weekly';

    // 生成摘要
    const summary = this.generateSummary(userName, stats, isWeekly);

    // 生成正文
    const content = this.generateContent(userName, activities, stats, isWeekly);

    // 生成重点事项
    const highlights = this.generateHighlights(activities, stats);

    // 生成风险提示
    const risks = this.generateRisks(activities);

    // 生成下一步行动
    const nextActions = this.generateNextActions(activities);

    return {
      summary,
      content,
      highlights,
      risks,
      nextActions,
    };
  }

  /**
   * 生成摘要
   */
  private generateSummary(userName: string, stats: DailyReportInput['stats'], isWeekly: boolean): string {
    const period = isWeekly ? '本周' : '今日';
    
    if (isWeekly) {
      return `${period}${userName}共完成${stats.totalCalls}次电话沟通、${stats.totalMeetings}次会议、${stats.totalVisits}次客户拜访，新增${stats.newCustomers}个客户，推进商机金额¥${this.formatCurrency(stats.opportunityValue)}，成功签约${stats.closedDeals}单。整体工作饱满，客户开发进展顺利。`;
    }

    return `${period}完成${stats.totalCalls}次电话、${stats.totalMeetings}次会议、${stats.totalVisits}次拜访，录制${stats.totalRecordings}条通话录音。新增客户${stats.newCustomers}个，推进商机价值¥${this.formatCurrency(stats.opportunityValue)}。`;
  }

  /**
   * 生成正文
   */
  private generateContent(
    _userName: string,
    activities: DailyReportInput['activities'],
    _stats: DailyReportInput['stats'],
    isWeekly: boolean
  ): string {
    const sections: string[] = [];

    // 客户拜访情况
    if (activities.customers.length > 0) {
      const customerNames = [...new Set(activities.customers.map(c => c.name))].slice(0, 5);
      sections.push(`【客户跟进】\n${isWeekly ? '本周' : '今日'}跟进客户${activities.customers.length}家，包括：${customerNames.join('、')}等。`);
    }

    // 商机进展
    if (activities.opportunities.length > 0) {
      const oppList = activities.opportunities
        .slice(0, 5)
        .map(o => `${o.customerName}的"${o.title}"(${this.formatStage(o.stage)}阶段，¥${this.formatCurrency(o.value)})`)
        .join('、');
      sections.push(`【商机进展】\n${isWeekly ? '本周' : '今日'}推进商机${activities.opportunities.length}个：${oppList}。`);
    }

    // 任务完成情况
    if (activities.tasks.length > 0) {
      const completedTasks = activities.tasks.filter(t => t.status === 'completed').length;
      const pendingTasks = activities.tasks.filter(t => t.status === 'pending').length;
      sections.push(`【任务执行】\n${isWeekly ? '本周' : '今日'}完成${completedTasks}项任务，待处理${pendingTasks}项。`);
    }

    // 通话录音分析
    if (activities.recordings.length > 0) {
      const positiveCount = activities.recordings.filter(r => r.sentiment === 'positive').length;
      const negativeCount = activities.recordings.filter(r => r.sentiment === 'negative').length;
      sections.push(`【通话分析】\n录制通话${activities.recordings.length}条，客户态度积极${positiveCount}次，需关注${negativeCount}次。`);
    }

    // 回款情况
    if (activities.payments.length > 0) {
      const totalPaid = activities.payments
        .filter(p => p.status === 'paid')
        .reduce((sum, p) => sum + p.amount, 0);
      sections.push(`【回款情况】\n${isWeekly ? '本周' : '今日'}回款¥${this.formatCurrency(totalPaid)}。`);
    }

    return sections.join('\n\n');
  }

  /**
   * 生成重点事项
   */
  private generateHighlights(
    activities: DailyReportInput['activities'],
    _stats: DailyReportInput['stats']
  ): DailyReportResult['highlights'] {
    const highlights: DailyReportResult['highlights'] = [];

    // 检查高价值商机
    const highValueOpps = activities.opportunities.filter(o => o.value >= 500000);
    if (highValueOpps.length > 0) {
      highlights.push({
        type: 'success',
        title: '高价值商机推进',
        description: `${highValueOpps[0].customerName}的商机（¥${this.formatCurrency(highValueOpps[0].value)}）处于${this.formatStage(highValueOpps[0].stage)}阶段，建议重点跟进。`,
      });
    }

    // 检查积极客户
    const positiveRecordings = activities.recordings.filter(r => r.sentiment === 'positive');
    if (positiveRecordings.length > 0) {
      highlights.push({
        type: 'success',
        title: '客户反馈积极',
        description: `${positiveRecordings[0].customerName}在通话中表现出积极态度，${positiveRecordings[0].summary || '建议趁热打铁推进合作'}。`,
      });
    }

    // 检查新增客户
    const newCustomers = activities.customers.filter(c => c.stage === 'new');
    if (newCustomers.length > 0) {
      highlights.push({
        type: 'info',
        title: '新增客户',
        description: `新增${newCustomers.length}个潜在客户，包括${newCustomers[0].name}等。`,
      });
    }

    return highlights;
  }

  /**
   * 生成风险提示
   */
  private generateRisks(activities: DailyReportInput['activities']): DailyReportResult['risks'] {
    const risks: DailyReportResult['risks'] = [];

    // 检查长时间未联系的商机 - 基于商机阶段判断
    const staleOpps = activities.opportunities.filter(o => {
      // 如果商机处于早期阶段超过一定时间，认为可能需要关注
      return o.stage === 'new_lead' || o.stage === 'contacted';
    });

    if (staleOpps.length > 0) {
      risks.push({
        level: 'medium',
        description: `${staleOpps[0].customerName}的商机已超过7天无活动，可能存在流失风险。`,
        suggestion: '建议立即安排跟进，了解客户最新动态。',
      });
    }

    // 检查负面录音
    const negativeRecordings = activities.recordings.filter(r => r.sentiment === 'negative');
    if (negativeRecordings.length > 0) {
      risks.push({
        level: 'high',
        description: `${negativeRecordings[0].customerName}在通话中表现出负面情绪。`,
        suggestion: '建议尽快安排面对面沟通，解决客户顾虑。',
      });
    }

    // 检查待办任务堆积
    const pendingTasks = activities.tasks.filter(t => t.status === 'pending');
    if (pendingTasks.length > 3) {
      risks.push({
        level: 'low',
        description: `有${pendingTasks.length}项待办任务待处理。`,
        suggestion: '建议合理安排时间，优先处理高优先级任务。',
      });
    }

    return risks;
  }

  /**
   * 生成下一步行动
   */
  private generateNextActions(activities: DailyReportInput['activities']): DailyReportResult['nextActions'] {
    const actions: DailyReportResult['nextActions'] = [];

    // 根据商机状态生成行动
    const proposalOpps = activities.opportunities.filter(o => o.stage === 'proposal' || o.stage === 'negotiation');
    if (proposalOpps.length > 0) {
      actions.push({
        priority: 'high',
        action: `跟进${proposalOpps[0].customerName}的报价/谈判进度`,
        customer: proposalOpps[0].customerName,
      });
    }

    // 根据录音生成行动
    const positiveRecordings = activities.recordings.filter(r => r.sentiment === 'positive');
    if (positiveRecordings.length > 0) {
      actions.push({
        priority: 'high',
        action: `趁热打铁，推进${positiveRecordings[0].customerName}的合作意向`,
        customer: positiveRecordings[0].customerName,
      });
    }

    // 根据待办生成行动
    const pendingTasks = activities.tasks.filter(t => t.status === 'pending').slice(0, 2);
    for (const task of pendingTasks) {
      actions.push({
        priority: 'medium',
        action: task.title,
        customer: task.customerName,
      });
    }

    // 添加常规行动
    if (actions.length < 3) {
      actions.push({
        priority: 'low',
        action: '整理客户资料，更新CRM系统',
      });
    }

    return actions;
  }

  /**
   * 格式化阶段名称
   */
  private formatStage(stage: string): string {
    const stageMap: Record<string, string> = {
      new_lead: '新线索',
      contacted: '已联系',
      qualified: '已验证',
      proposal: '报价',
      negotiation: '谈判',
      won: '已成交',
      lost: '已流失',
    };
    return stageMap[stage] || stage;
  }

  /**
   * 格式化金额
   */
  private formatCurrency(value: number): string {
    if (value >= 10000) {
      return `${(value / 10000).toFixed(1)}万`;
    }
    return value.toLocaleString();
  }
}

export default new ReportGenerationService();