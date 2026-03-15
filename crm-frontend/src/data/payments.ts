import type { Payment } from '../types';

// 回款记录Mock数据
export const mockPayments: Payment[] = [
  {
    id: 'p1',
    invoiceId: 'INV-2023-001',
    customerId: 'c4',
    customerName: '中国平安保险（集团）股份有限公司',
    totalAmount: 2100000,
    paidAmount: 2100000,
    balance: 0,
    status: 'paid',
    planType: '年度服务费',
    dueDate: '2023-10-01'
  },
  {
    id: 'p2',
    invoiceId: 'INV-2023-002',
    customerId: 'c1',
    customerName: '华为技术有限公司',
    totalAmount: 625000,
    paidAmount: 312500,
    balance: 312500,
    status: 'partial',
    planType: '首付款50%',
    dueDate: '2023-10-15'
  },
  {
    id: 'p3',
    invoiceId: 'INV-2023-003',
    customerId: 'c2',
    customerName: '阿里巴巴集团',
    totalAmount: 425000,
    paidAmount: 0,
    balance: 425000,
    status: 'pending',
    planType: '项目启动款',
    dueDate: '2023-11-01'
  },
  {
    id: 'p4',
    invoiceId: 'INV-2023-004',
    customerId: 'c6',
    customerName: '宁德时代新能源科技股份有限公司',
    totalAmount: 340000,
    paidAmount: 0,
    balance: 340000,
    status: 'overdue',
    planType: '合同首付款',
    dueDate: '2023-10-05',
    lastReminder: '2023-10-10'
  },
  {
    id: 'p5',
    invoiceId: 'INV-2023-005',
    customerId: 'c3',
    customerName: '比亚迪股份有限公司',
    totalAmount: 210000,
    paidAmount: 0,
    balance: 210000,
    status: 'pending',
    planType: '预付款',
    dueDate: '2023-11-15'
  },
  {
    id: 'p6',
    invoiceId: 'INV-2023-006',
    customerId: 'c8',
    customerName: '百度在线网络技术（北京）有限公司',
    totalAmount: 275000,
    paidAmount: 275000,
    balance: 0,
    status: 'paid',
    planType: '项目款',
    dueDate: '2023-09-30'
  }
];

// 获取回款统计
export function getPaymentStats() {
  const totalPaid = mockPayments.reduce((sum, p) => sum + p.paidAmount, 0);
  const totalPending = mockPayments
    .filter(p => p.status === 'pending' || p.status === 'partial')
    .reduce((sum, p) => sum + p.balance, 0);
  const totalOverdue = mockPayments
    .filter(p => p.status === 'overdue')
    .reduce((sum, p) => sum + p.balance, 0);
  
  return {
    totalPaid,
    totalPending,
    totalOverdue,
    totalCount: mockPayments.length
  };
}

// 获取逾期回款
export function getOverduePayments(): Payment[] {
  return mockPayments.filter(p => p.status === 'overdue');
}

// 获取待回款
export function getPendingPayments(): Payment[] {
  return mockPayments.filter(p => p.status === 'pending' || p.status === 'partial');
}

// 根据客户ID获取回款记录
export function getPaymentsByCustomerId(customerId: string): Payment[] {
  return mockPayments.filter(p => p.customerId === customerId);
}

// 获取收款预测数据（按月）
export function getPaymentForecast() {
  return [
    { month: '10月', expected: 625000, actual: 2375000 },
    { month: '11月', expected: 850000, actual: 0 },
    { month: '12月', expected: 550000, actual: 0 },
    { month: '1月', expected: 420000, actual: 0 },
    { month: '2月', expected: 120000, actual: 0 }
  ];
}