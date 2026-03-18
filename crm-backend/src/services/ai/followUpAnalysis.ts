/**
 * 跟进时机分析服务
 * 分析客户互动数据，生成跟进建议和话术
 */

import type {
  FollowUpSuggestionInput,
  FollowUpSuggestionResult,
  ScriptGenerationInput,
  ScriptGenerationResult,
} from './types';
import aiClient, { ChatMessage } from './client';

// AI配置
const AI_CONFIG = {
  useRealAPI: process.env.DASHSCOPE_API_KEY,
};

/**
 * 跟进时机分析服务
 */
class FollowUpAnalysisService {
  /**
   * 分析客户数据，生成跟进建议
   */
  async analyzeFollowUpTiming(input: FollowUpSuggestionInput): Promise<FollowUpSuggestionResult> {
    if (AI_CONFIG.useRealAPI && aiClient.isConfigured()) {
      try {
        return await this.callRealAnalysis(input);
      } catch (error) {
        console.error('[FollowUp Analysis] 真实API调用失败，降级到模拟模式:', error);
        return this.mockAnalysis(input);
      }
    }
    return this.mockAnalysis(input);
  }

  /**
   * 生成跟进话术
   */
  async generateScript(input: ScriptGenerationInput): Promise<ScriptGenerationResult> {
    if (AI_CONFIG.useRealAPI && aiClient.isConfigured()) {
      try {
        return await this.callRealScriptGeneration(input);
      } catch (error) {
        console.error('[FollowUp Analysis] 话术生成失败，降级到模拟模式:', error);
        return this.mockScriptGeneration(input);
      }
    }
    return this.mockScriptGeneration(input);
  }

  /**
   * 调用真实AI API分析跟进时机
   */
  private async callRealAnalysis(input: FollowUpSuggestionInput): Promise<FollowUpSuggestionResult> {
    const systemPrompt = `你是一位专业的销售跟进策略分析师，擅长分析客户互动数据并给出最佳的跟进建议。
请根据提供的客户数据，生成跟进时机建议。
你需要返回一个JSON对象，包含以下字段：
- type: 跟进方式（call/visit/email/wechat）
- priority: 优先级（high/medium/low）
- reason: 跟进原因和建议（详细说明为什么需要跟进以及跟进要点）
- suggestedAt: 建议跟进时间（ISO格式日期字符串）
- expiresAt: 建议过期时间（ISO格式日期字符串，可选）
- script: 建议的跟进话术（可选）`;

    const lastContact = input.lastContactDate ? new Date(input.lastContactDate) : null;
    const daysSinceContact = lastContact
      ? Math.floor((Date.now() - lastContact.getTime()) / (1000 * 60 * 60 * 24))
      : 999;

    const userPrompt = `请分析以下客户并给出跟进建议：

【客户信息】
- 客户ID：${input.customerId}
- 客户名称：${input.customerName || '未知'}
- 所属行业：${input.industry || '未知'}
- 上次联系：${lastContact ? `${lastContact.toLocaleDateString()}（${daysSinceContact}天前）` : '从未联系'}

【通话录音分析】
${input.recordings && input.recordings.length > 0
  ? input.recordings.slice(0, 3).map(r => `- 情感倾向：${r.sentiment}，摘要：${r.summary || '无'}`).join('\n')
  : '- 暂无通话录音'}

【商机情况】
${input.opportunities && input.opportunities.length > 0
  ? input.opportunities.slice(0, 3).map(o => `- 阶段：${o.stage}，价值：¥${o.value}`).join('\n')
  : '- 暂无商机'}

【待办任务】
${input.scheduleTasks && input.scheduleTasks.length > 0
  ? input.scheduleTasks.slice(0, 5).map(t => `- ${t.type}：${t.status}`).join('\n')
  : '- 暂无待办任务'}

请生成JSON格式的跟进建议。`;

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ];

    const response = await aiClient.chatForJson<FollowUpSuggestionResult>(messages, {
      temperature: 0.6,
      maxTokens: 1000,
    });

    // 验证响应格式
    if (!response.type || !response.priority || !response.reason) {
      throw new Error('AI响应格式不完整');
    }

    // 确保日期格式正确
    if (!response.suggestedAt) {
      response.suggestedAt = new Date();
    }

    return response;
  }

  /**
   * 调用真实AI API生成话术
   */
  private async callRealScriptGeneration(input: ScriptGenerationInput): Promise<ScriptGenerationResult> {
    const systemPrompt = `你是一位专业的销售话术设计师，擅长根据客户信息和沟通目的生成有效的销售话术。
请根据提供的信息，生成跟进话术。
你需要返回一个JSON对象，包含以下字段：
- script: 话术内容（完整的对话脚本）
- keyPoints: 关键要点数组（3-5个要点）
- tips: 注意事项数组（2-4个技巧提示）`;

    const userPrompt = `请为以下情况生成销售话术：

【客户信息】
- 客户名称：${input.customerName}
- 联系人：${input.contactName || '未知'}
- 所属行业：${input.industry || '未知'}

【沟通方式】
${this.getContactTypeLabel(input.contactType)}

【沟通目的】
${this.getPurposeLabel(input.purpose)}

【上下文信息】
${input.previousContext || '- 首次沟通'}

【客户痛点】
${input.painPoints?.join('、') || '- 待了解'}

【客户兴趣点】
${input.interests?.join('、') || '- 待挖掘'}

请生成JSON格式的话术建议。`;

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ];

    const response = await aiClient.chatForJson<ScriptGenerationResult>(messages, {
      temperature: 0.7,
      maxTokens: 1500,
    });

    // 验证响应格式
    if (!response.script || !response.keyPoints) {
      throw new Error('AI响应格式不完整');
    }

    return response;
  }

  /**
   * 模拟跟进时机分析
   */
  private mockAnalysis(input: FollowUpSuggestionInput): Promise<FollowUpSuggestionResult> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const result = this.generateMockSuggestion(input);
        resolve(result);
      }, 800 + Math.random() * 500);
    });
  }

  /**
   * 生成模拟跟进建议
   */
  private generateMockSuggestion(input: FollowUpSuggestionInput): FollowUpSuggestionResult {
    const now = new Date();
    const lastContact = input.lastContactDate ? new Date(input.lastContactDate) : null;
    const daysSinceContact = lastContact
      ? Math.floor((now.getTime() - lastContact.getTime()) / (1000 * 60 * 60 * 24))
      : 999;

    // 分析录音情感
    const recordingSentiments = input.recordings?.map(r => r.sentiment) || [];
    const hasNegativeRecording = recordingSentiments.includes('negative');
    const hasPositiveRecording = recordingSentiments.includes('positive');

    // 分析商机阶段
    const activeOpportunities = input.opportunities?.filter(o => o.stage !== 'won' && o.stage !== 'lost') || [];
    const hasHighValueOpp = activeOpportunities.some(o => o.value >= 100000);

    // 分析待办任务
    const pendingTasks = input.scheduleTasks?.filter(t => t.status === 'pending') || [];
    const hasScheduledVisit = pendingTasks.some(t => t.type === 'visit');

    // 决策逻辑
    let type: FollowUpSuggestionResult['type'] = 'call';
    let priority: FollowUpSuggestionResult['priority'] = 'medium';
    let reason = '';

    if (daysSinceContact > 14) {
      priority = 'high';
      type = 'call';
      reason = `客户已超过${daysSinceContact}天未联系，建议立即进行电话跟进，保持客户关系热度。`;
    } else if (hasNegativeRecording) {
      priority = 'high';
      type = 'visit';
      reason = '近期沟通中出现负面情绪信号，建议安排上门拜访，面对面解决问题，重建信任。';
    } else if (hasHighValueOpp) {
      priority = 'high';
      type = 'visit';
      reason = '存在高价值商机，建议安排拜访推进项目进展，争取尽快成交。';
    } else if (daysSinceContact > 7) {
      priority = 'medium';
      type = 'wechat';
      reason = '一周内未联系，建议通过微信发送相关行业资讯或案例，保持互动。';
    } else if (hasPositiveRecording && activeOpportunities.length > 0) {
      priority = 'medium';
      type = 'email';
      reason = '客户态度积极，建议发送详细方案或报价，推动进入下一阶段。';
    } else if (!hasScheduledVisit && activeOpportunities.length > 0) {
      priority = 'medium';
      type = 'visit';
      reason = '商机正在推进中，建议安排拜访深入沟通。';
    } else {
      priority = 'low';
      type = 'wechat';
      reason = '常规跟进，建议发送问候或分享有价值的内容。';
    }

    // 设置过期时间
    const expiresAt = new Date(now);
    if (priority === 'high') {
      expiresAt.setDate(expiresAt.getDate() + 1);
    } else if (priority === 'medium') {
      expiresAt.setDate(expiresAt.getDate() + 3);
    } else {
      expiresAt.setDate(expiresAt.getDate() + 7);
    }

    return {
      type,
      priority,
      reason,
      suggestedAt: now,
      expiresAt,
    };
  }

  /**
   * 模拟话术生成
   */
  private mockScriptGeneration(input: ScriptGenerationInput): Promise<ScriptGenerationResult> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const result = this.generateMockScript(input);
        resolve(result);
      }, 1000 + Math.random() * 500);
    });
  }

  /**
   * 生成模拟话术
   */
  private generateMockScript(input: ScriptGenerationInput): ScriptGenerationResult {
    const { customerName, contactName, industry, contactType, purpose, previousContext, painPoints } = input;

    const contactLabel = contactName || '您';
    const industryLabel = industry || '贵司';

    // 根据联系方式和目的生成话术
    const templates: Record<string, Record<string, { script: string; keyPoints: string[]; tips: string[] }>> = {
      call: {
        follow_up: {
          script: `您好，${contactLabel}！我是XX公司的销售经理，之前我们有交流过关于${industryLabel}的解决方案。

今天打电话主要是想跟进一下上次我们讨论的内容，不知道您那边有没有进一步的考虑？

我这边也整理了一些同行业的成功案例，对您可能有一些参考价值。如果方便的话，我可以简单给您介绍一下。

您看这周有时间安排一个简短的线上会议吗？大约15-20分钟就可以。`,
          keyPoints: [
            '先确认对方是否还记得之前的沟通',
            '快速说明来电目的',
            '提供有价值的信息作为诱饵',
            '明确下一步行动建议',
          ],
          tips: [
            '语调保持热情但不急切',
            '如果对方忙碌，询问方便联系的时间',
            '准备好应对"现在没空"的话术',
          ],
        },
        demo: {
          script: `${contactLabel}您好！我是XX公司的销售经理。

了解到${industryLabel}对${purpose}有需求，我这边有一个非常适合的解决方案想给您演示一下。

我们的产品在${industry || '相关行业'}已经帮助很多企业解决了类似问题，比如...（可以举1-2个具体案例）。

您看本周${['三', '四', '五'][Math.floor(Math.random() * 3)]}下午方便安排一个产品演示吗？我可以为您详细介绍产品的核心功能和应用场景。`,
          keyPoints: [
            '直接说明来意，避免绕弯子',
            '展示行业经验和成功案例',
            '主动提出具体的演示时间',
          ],
          tips: [
            '演示时间控制在30-45分钟',
            '提前准备好针对客户行业的演示材料',
            '准备好Q&A环节',
          ],
        },
        negotiation: {
          script: `${contactLabel}您好！感谢您拨冗接听。

关于我们上次讨论的合作方案，我这边做了一些调整和优化，想跟您确认几个关键点：

1. 关于价格方面，我申请到了...的优惠
2. 关于交付时间，我们可以...
3. 关于售后服务，我们承诺...

这些调整应该能够更好地满足${industryLabel}的需求。您看是否还有其他需要我们这边配合的地方？`,
          keyPoints: [
            '先总结已取得的共识',
            '清晰说明调整的内容',
            '引导对方做出决策',
          ],
          tips: [
            '价格让步要有条件交换',
            '记录所有承诺和保证',
            '如果无法当场决定，约定下次沟通时间',
          ],
        },
      },
      visit: {
        follow_up: {
          script: `${contactLabel}您好！非常感谢您抽出时间见面。

今天来的主要目的是想进一步了解${industryLabel}在${purpose || '相关业务'}方面的需求，以及我们如何能够更好地支持您。

我先简单介绍一下我们公司和产品...

（听取客户需求和反馈）

根据您刚才提到的情况，我觉得我们确实能够提供一些帮助。让我回去整理一份针对性的方案，下周给您反馈。`,
          keyPoints: [
            '拜访前做足功课，了解客户背景',
            '多听少说，先了解需求再介绍产品',
            '留下专业的第一印象',
          ],
          tips: [
            '带好名片和宣传资料',
            '准备小礼品（如合适）',
            '着装得体，准时到达',
          ],
        },
      },
      email: {
        proposal: {
          script: `主题：关于${customerName}合作方案的详细说明

尊敬的${contactLabel}：

您好！

感谢您对我们产品的关注。根据我们之前的沟通，我整理了一份详细的合作方案供您参考。

方案主要包括以下几个部分：
1. 项目背景与需求分析
2. 解决方案概述
3. 产品功能介绍
4. 实施计划与时间表
5. 报价明细

如果您对方案有任何疑问或需要调整的地方，请随时与我联系。我这边也可以安排一次线上会议，详细解答您的问题。

期待您的回复！

此致
敬礼

---
销售经理
XX公司
电话：xxx-xxxx-xxxx
邮箱：xxx@xx.com`,
          keyPoints: [
            '邮件主题简洁明确',
            '内容结构清晰，便于快速阅读',
            '包含明确的行动号召',
          ],
          tips: [
            '附件格式使用PDF',
            '文件命名包含公司和日期',
            '发送后电话确认是否收到',
          ],
        },
      },
      wechat: {
        follow_up: {
          script: `${contactLabel}您好！

我是XX公司的销售经理，之前有幸与您交流过。

今天分享一篇关于${industry || '您所在行业'}数字化转型的文章，希望对您有所启发。

${painPoints?.length ? `关于您之前提到的${painPoints[0]}问题，我们最近有一个类似的成功案例，如果感兴趣我可以发给您参考。` : ''}

有任何问题随时联系我！`,
          keyPoints: [
            '语气轻松但保持专业',
            '提供有价值的内容，避免纯推销',
            '创造互动机会',
          ],
          tips: [
            '注意发送时间，避开休息时间',
            '内容要简洁，避免长篇大论',
            '可以适当使用表情符号，但要适度',
          ],
        },
      },
    };

    // 获取对应的话术模板
    const typeTemplates = templates[contactType] || templates.call;
    const template = typeTemplates[purpose] || typeTemplates.follow_up;

    // 根据上下文和痛点调整话术
    let script = template.script;
    if (previousContext) {
      script = script.replace('之前我们有交流过', `之前我们讨论过${previousContext}`);
    }

    return {
      script,
      keyPoints: template.keyPoints,
      tips: template.tips,
    };
  }

  /**
   * 辅助方法：获取联系方式标签
   */
  private getContactTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      call: '电话沟通',
      visit: '上门拜访',
      email: '邮件沟通',
      wechat: '微信沟通',
    };
    return labels[type] || type;
  }

  /**
   * 辅助方法：获取目的标签
   */
  private getPurposeLabel(purpose: string): string {
    const labels: Record<string, string> = {
      follow_up: '常规跟进',
      demo: '产品演示',
      negotiation: '商务谈判',
      proposal: '方案介绍',
    };
    return labels[purpose] || purpose;
  }
}

export default new FollowUpAnalysisService();