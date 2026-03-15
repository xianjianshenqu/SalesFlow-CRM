import type { Customer, Stage, Priority, CustomerSource } from '../types';

// 客户Mock数据
export const mockCustomers: Customer[] = [
  {
    id: 'c1',
    name: '华为技术有限公司',
    shortName: 'HW',
    email: 'li.wei@huawei.com',
    stage: 'negotiation',
    estimatedValue: 1250000,
    nextFollowUp: '2023-10-14',
    source: 'direct',
    priority: 'high',
    contactPerson: '李伟',
    phone: '13800138001',
    address: '深圳市龙岗区坂田华为基地',
    city: '深圳',
    industry: '通信设备',
    createdAt: '2023-09-01',
    updatedAt: '2023-10-12'
  },
  {
    id: 'c2',
    name: '阿里巴巴集团',
    shortName: 'AL',
    email: 'zhang.m@alibaba-inc.com',
    stage: 'solution',
    estimatedValue: 850000,
    nextFollowUp: '2023-10-18',
    source: 'referral',
    priority: 'high',
    contactPerson: '张明',
    phone: '13800138002',
    address: '杭州市余杭区文一西路969号',
    city: '杭州',
    industry: '电子商务',
    createdAt: '2023-08-15',
    updatedAt: '2023-10-15'
  },
  {
    id: 'c3',
    name: '比亚迪股份有限公司',
    shortName: 'BYD',
    email: 'chen.q@byd.com',
    stage: 'contacted',
    estimatedValue: 420000,
    nextFollowUp: '2023-10-20',
    source: 'website',
    priority: 'medium',
    contactPerson: '陈强',
    phone: '13800138003',
    address: '深圳市坪山区比亚迪路',
    city: '深圳',
    industry: '汽车制造',
    createdAt: '2023-09-20',
    updatedAt: '2023-10-10'
  },
  {
    id: 'c4',
    name: '中国平安保险（集团）股份有限公司',
    shortName: 'PA',
    email: 'finance@pingan.com.cn',
    stage: 'won',
    estimatedValue: 2100000,
    nextFollowUp: '2023-10-25',
    source: 'partner',
    priority: 'high',
    contactPerson: '王芳',
    phone: '13800138004',
    address: '深圳市福田区福华三路',
    city: '深圳',
    industry: '金融服务',
    createdAt: '2023-07-01',
    updatedAt: '2023-10-16'
  },
  {
    id: 'c5',
    name: '腾讯科技（深圳）有限公司',
    shortName: 'TN',
    email: 'marketing@tencent.com',
    stage: 'new_lead',
    estimatedValue: 120000,
    nextFollowUp: '2023-10-16',
    source: 'conference',
    priority: 'low',
    contactPerson: '刘洋',
    phone: '13800138005',
    address: '深圳市南山区科技园',
    city: '深圳',
    industry: '互联网',
    createdAt: '2023-10-14',
    updatedAt: '2023-10-14'
  },
  {
    id: 'c6',
    name: '宁德时代新能源科技股份有限公司',
    shortName: 'ND',
    email: 'wu.xy@catl.com',
    stage: 'negotiation',
    estimatedValue: 680000,
    nextFollowUp: '2023-10-22',
    source: 'direct',
    priority: 'high',
    contactPerson: '吴欣怡',
    phone: '13800138006',
    address: '福建省宁德市蕉城区',
    city: '宁德',
    industry: '新能源',
    createdAt: '2023-08-01',
    updatedAt: '2023-10-15'
  },
  {
    id: 'c7',
    name: '美团点评',
    shortName: 'MT',
    email: 'business@meituan.com',
    stage: 'contacted',
    estimatedValue: 320000,
    nextFollowUp: '2023-10-19',
    source: 'website',
    priority: 'medium',
    contactPerson: '赵敏',
    phone: '13800138007',
    address: '北京市朝阳区望京东路',
    city: '北京',
    industry: '本地生活',
    createdAt: '2023-09-10',
    updatedAt: '2023-10-13'
  },
  {
    id: 'c8',
    name: '百度在线网络技术（北京）有限公司',
    shortName: 'BD',
    email: 'partner@baidu.com',
    stage: 'negotiation',
    estimatedValue: 550000,
    nextFollowUp: '2023-10-21',
    source: 'referral',
    priority: 'medium',
    contactPerson: '孙立',
    phone: '13800138008',
    address: '北京市海淀区上地十街',
    city: '北京',
    industry: '人工智能',
    createdAt: '2023-08-20',
    updatedAt: '2023-10-11'
  }
];

// 根据阶段筛选客户
export function filterCustomersByStage(customers: Customer[], stage: Stage | 'all'): Customer[] {
  if (stage === 'all') return customers;
  return customers.filter(c => c.stage === stage);
}

// 获取客户总数
export function getTotalCustomers(): number {
  return mockCustomers.length;
}

// 获取活跃客户数
export function getActiveCustomers(): number {
  return mockCustomers.filter(c => c.stage !== 'won').length;
}

// 获取总价值
export function getTotalValue(): number {
  return mockCustomers.reduce((sum, c) => sum + c.estimatedValue, 0);
}

// 根据ID获取客户
export function getCustomerById(id: string): Customer | undefined {
  return mockCustomers.find(c => c.id === id);
}

// 获取客户首字母缩写颜色
export function getCustomerColor(shortName: string): { bg: string; text: string; border: string } {
  const colors = [
    { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-600', border: 'border-red-100' },
    { bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-600', border: 'border-orange-100' },
    { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600', border: 'border-amber-100' },
    { bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-600', border: 'border-green-100' },
    { bg: 'bg-teal-50 dark:bg-teal-900/20', text: 'text-teal-600', border: 'border-teal-100' },
    { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600', border: 'border-blue-100' },
    { bg: 'bg-indigo-50 dark:bg-indigo-900/20', text: 'text-indigo-600', border: 'border-indigo-100' },
    { bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-600', border: 'border-purple-100' },
  ];
  
  const index = shortName.charCodeAt(0) % colors.length;
  return colors[index];
}