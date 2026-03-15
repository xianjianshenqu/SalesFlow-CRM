// 销售阶段枚举
export type Stage = 'new_lead' | 'contacted' | 'solution' | 'negotiation' | 'won';

// 优先级枚举
export type Priority = 'high' | 'medium' | 'low';

// 客户来源枚举
export type CustomerSource = 'direct' | 'referral' | 'website' | 'conference' | 'partner';

// 付款状态枚举
export type PaymentStatus = 'paid' | 'partial' | 'pending' | 'overdue';

// 情感分析枚举
export type Sentiment = 'positive' | 'neutral' | 'negative';

// 任务状态枚举
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

// 客户接口
export interface Customer {
  id: string;
  name: string;
  shortName: string;
  email: string;
  stage: Stage;
  estimatedValue: number;
  nextFollowUp: string;
  source: CustomerSource;
  priority: Priority;
  contactPerson: string;
  phone?: string;
  address?: string;
  city?: string;
  industry?: string;
  createdAt: string;
  updatedAt: string;
}

// 销售机会接口
export interface Opportunity {
  id: string;
  customerId: string;
  customerName: string;
  title: string;
  stage: Stage;
  value: number;
  probability: number;
  owner: string;
  ownerAvatar?: string;
  priority: Priority;
  expectedCloseDate: string;
  lastActivity: string;
  description?: string;
  nextStep?: string;
}

// 回款记录接口
export interface Payment {
  id: string;
  invoiceId: string;
  customerId: string;
  customerName: string;
  totalAmount: number;
  paidAmount: number;
  balance: number;
  status: PaymentStatus;
  planType: string;
  dueDate: string;
  lastReminder?: string;
}

// AI录音分析接口
export interface AudioRecording {
  id: string;
  customerId: string;
  customerName: string;
  customerShortName: string;
  contactPerson: string;
  duration: number;
  recordedAt: string;
  sentiment: Sentiment;
  summary: string;
  keyPoints: string[];
  actionItems: string[];
  status: 'analyzed' | 'pending' | 'processing';
}

// 日程任务接口
export interface ScheduleTask {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  type: 'call' | 'meeting' | 'visit' | 'task';
  priority: Priority;
  status: TaskStatus;
  customerId?: string;
  customerName?: string;
  location?: string;
  aiSuggestion?: string;
  isAIOptimized?: boolean;
}

// 商务方案接口
export interface Proposal {
  id: string;
  title: string;
  customerId: string;
  customerName: string;
  value: number;
  status: 'draft' | 'pending_review' | 'sent' | 'accepted' | 'rejected';
  createdAt: string;
  updatedAt: string;
  owner: string;
  description?: string;
}

// 团队成员接口
export interface TeamMember {
  id: string;
  name: string;
  avatar?: string;
  role: string;
  department: string;
  revenue: number;
  deals: number;
  activities: number;
  rank: number;
}

// 统计卡片数据接口
export interface StatsCard {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease';
  icon: string;
  iconBgColor: string;
  iconColor: string;
  badge?: string;
  badgeColor?: string;
}

// 销售漏斗阶段数据
export interface FunnelStage {
  name: string;
  count: number;
  percentage: number;
  value: number;
  color: string;
}

// 地图标记接口
export interface MapMarker {
  id: string;
  city: string;
  count: number;
  coordinates: {
    top: string;
    left: string;
  };
}

// 路由配置接口
export interface RouteConfig {
  path: string;
  name: string;
  icon: string;
  element: React.ReactNode;
}

// 通知接口
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  createdAt: string;
  read: boolean;
}

// 用户接口
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  department: string;
}

// 阶段映射
export const STAGE_LABELS: Record<Stage, string> = {
  new_lead: '新线索',
  contacted: '已联系',
  solution: '方案建议',
  negotiation: '谈判中',
  won: '已成交'
};

// 阶段颜色映射
export const STAGE_COLORS: Record<Stage, { bg: string; text: string; ring: string }> = {
  new_lead: { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-400', ring: 'ring-slate-500/10' },
  contacted: { bg: 'bg-indigo-50 dark:bg-indigo-900/30', text: 'text-indigo-600 dark:text-indigo-400', ring: 'ring-indigo-500/10' },
  solution: { bg: 'bg-blue-50 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400', ring: 'ring-blue-500/10' },
  negotiation: { bg: 'bg-amber-50 dark:bg-amber-900/30', text: 'text-amber-600 dark:text-amber-400', ring: 'ring-amber-500/10' },
  won: { bg: 'bg-emerald-50 dark:bg-emerald-900/30', text: 'text-emerald-600 dark:text-emerald-400', ring: 'ring-emerald-500/10' }
};

// 优先级颜色映射
export const PRIORITY_COLORS: Record<Priority, { dot: string; text: string }> = {
  high: { dot: 'bg-red-500', text: 'text-red-600' },
  medium: { dot: 'bg-amber-500', text: 'text-amber-600' },
  low: { dot: 'bg-slate-300', text: 'text-slate-600' }
};

// 付款状态颜色映射
export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, { bg: string; text: string }> = {
  paid: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400' },
  partial: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400' },
  pending: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400' },
  overdue: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400' }
};