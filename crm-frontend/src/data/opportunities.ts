import type { Opportunity } from '../types';

// 销售机会Mock数据
export const mockOpportunities: Opportunity[] = [
  {
    id: 'o1',
    customerId: 'c1',
    customerName: '华为技术有限公司',
    title: '企业数字化转型项目',
    stage: 'contract_stage',
    value: 1250000,
    probability: 85,
    owner: 'Alex Chen',
    priority: 'high',
    expectedCloseDate: '2023-11-15',
    lastActivity: '2023-10-12',
    description: '华为企业级数字化转型解决方案，包含云计算、AI分析等模块',
    nextStep: '准备合同签署'
  },
  {
    id: 'o2',
    customerId: 'c2',
    customerName: '阿里巴巴集团',
    title: '智能客服系统升级',
    stage: 'procurement_process',
    value: 850000,
    probability: 70,
    owner: 'Alex Chen',
    priority: 'high',
    expectedCloseDate: '2023-12-01',
    lastActivity: '2023-10-15',
    description: '智能客服系统全面升级，集成AI对话和情感分析功能',
    nextStep: '跟进采购流程'
  },
  {
    id: 'o3',
    customerId: 'c3',
    customerName: '比亚迪股份有限公司',
    title: '供应链管理系统',
    stage: 'negotiation',
    value: 420000,
    probability: 55,
    owner: 'Sarah Wang',
    priority: 'medium',
    expectedCloseDate: '2023-12-20',
    lastActivity: '2023-10-10',
    description: '供应链管理系统优化项目',
    nextStep: '商务谈判会议'
  },
  {
    id: 'o4',
    customerId: 'c6',
    customerName: '宁德时代新能源科技股份有限公司',
    title: 'MES系统实施',
    stage: 'procurement_process',
    value: 680000,
    probability: 75,
    owner: 'Alex Chen',
    priority: 'high',
    expectedCloseDate: '2023-11-30',
    lastActivity: '2023-10-15',
    description: '制造执行系统(MES)全面实施项目',
    nextStep: '采购部门审批'
  },
  {
    id: 'o5',
    customerId: 'c7',
    customerName: '美团点评',
    title: '数据分析平台',
    stage: 'quoted',
    value: 320000,
    probability: 40,
    owner: 'Mike Liu',
    priority: 'medium',
    expectedCloseDate: '2024-01-15',
    lastActivity: '2023-10-13',
    description: '大数据分析平台建设',
    nextStep: '等待报价反馈'
  },
  {
    id: 'o6',
    customerId: 'c8',
    customerName: '百度在线网络技术（北京）有限公司',
    title: 'AI模型训练平台',
    stage: 'negotiation',
    value: 550000,
    probability: 60,
    owner: 'Sarah Wang',
    priority: 'medium',
    expectedCloseDate: '2023-12-10',
    lastActivity: '2023-10-11',
    description: 'AI模型训练和部署平台',
    nextStep: '价格谈判'
  },
  {
    id: 'o7',
    customerId: 'c5',
    customerName: '腾讯科技（深圳）有限公司',
    title: '云安全解决方案',
    stage: 'new_lead',
    value: 120000,
    probability: 20,
    owner: 'Alex Chen',
    priority: 'low',
    expectedCloseDate: '2024-02-01',
    lastActivity: '2023-10-14',
    description: '企业云安全解决方案',
    nextStep: '初步沟通需求'
  },
  {
    id: 'o8',
    customerId: 'c9',
    customerName: '京东集团',
    title: '物流智能调度系统',
    stage: 'contract_stage',
    value: 980000,
    probability: 90,
    owner: 'Sarah Wang',
    priority: 'high',
    expectedCloseDate: '2023-11-20',
    lastActivity: '2023-10-16',
    description: '物流智能调度系统开发',
    nextStep: '合同盖章'
  },
  {
    id: 'o9',
    customerId: 'c10',
    customerName: '字节跳动',
    title: '内容审核平台',
    stage: 'won',
    value: 760000,
    probability: 100,
    owner: 'Mike Liu',
    priority: 'high',
    expectedCloseDate: '2023-10-10',
    lastActivity: '2023-10-10',
    description: '内容审核平台建设',
    nextStep: '项目启动'
  }
];

// 根据阶段筛选机会
export function filterOpportunitiesByStage(opportunities: Opportunity[], stage: Opportunity['stage'] | 'all'): Opportunity[] {
  if (stage === 'all') return opportunities;
  return opportunities.filter(o => o.stage === stage);
}

// 获取漏斗总价值
export function getFunnelTotalValue(): number {
  return mockOpportunities.reduce((sum, o) => sum + o.value, 0);
}

// 获取各阶段统计
export function getStageStats() {
  const stages = ['new_lead', 'quoted', 'negotiation', 'procurement_process', 'contract_stage', 'won'] as const;
  return stages.map(stage => {
    const stageOpportunities = mockOpportunities.filter(o => o.stage === stage);
    return {
      stage,
      count: stageOpportunities.length,
      value: stageOpportunities.reduce((sum, o) => sum + o.value, 0)
    };
  });
}

// 根据客户ID获取机会
export function getOpportunitiesByCustomerId(customerId: string): Opportunity[] {
  return mockOpportunities.filter(o => o.customerId === customerId);
}