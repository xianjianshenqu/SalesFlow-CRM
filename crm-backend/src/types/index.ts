// Enums matching frontend types
export type Stage = 'new_lead' | 'contacted' | 'solution' | 'negotiation' | 'won';
export type Priority = 'high' | 'medium' | 'low';
export type CustomerSource = 'direct' | 'referral' | 'website' | 'conference' | 'partner';
export type PaymentStatus = 'paid' | 'partial' | 'pending' | 'overdue';
export type Sentiment = 'positive' | 'neutral' | 'negative';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type TaskType = 'call' | 'meeting' | 'visit' | 'task';
export type ProposalStatus = 'draft' | 'pending_review' | 'sent' | 'accepted' | 'rejected';
export type ServiceProjectStatus = 'active' | 'pending' | 'completed';
export type MilestoneStatus = 'completed' | 'in_progress' | 'pending';
export type RecordingStatus = 'analyzed' | 'pending' | 'processing';
export type ResourceStatus = 'available' | 'busy' | 'offline';
export type RequestStatus = 'pending' | 'in_progress' | 'completed';
export type UserRole = 'admin' | 'manager' | 'sales';

// Pagination
export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Filter interfaces
export interface CustomerFilter extends PaginationParams {
  stage?: Stage | 'all';
  priority?: Priority;
  source?: CustomerSource;
  search?: string;
}

export interface OpportunityFilter extends PaginationParams {
  stage?: Stage;
  priority?: Priority;
  owner?: string;
}

export interface PaymentFilter extends PaginationParams {
  status?: PaymentStatus;
  customerId?: string;
}

export interface ScheduleFilter {
  date?: string;
  type?: TaskType;
  status?: TaskStatus;
  customerId?: string;
}

// Label mappings
export const STAGE_LABELS: Record<Stage, string> = {
  new_lead: '新线索',
  contacted: '已联系',
  solution: '方案建议',
  negotiation: '谈判中',
  won: '已成交',
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  high: '高',
  medium: '中',
  low: '低',
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  paid: '已付款',
  partial: '部分付款',
  pending: '待付款',
  overdue: '已逾期',
};

export const SOURCE_LABELS: Record<CustomerSource, string> = {
  direct: '直销',
  referral: '推荐',
  website: '网站',
  conference: '会议',
  partner: '合作伙伴',
};