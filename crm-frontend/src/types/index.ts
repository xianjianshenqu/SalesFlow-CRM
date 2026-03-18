// 销售阶段枚举
export type Stage = 'new_lead' | 'contacted' | 'solution' | 'quoted' | 'negotiation' | 'procurement_process' | 'contract_stage' | 'won';

// 优先级枚举
export type Priority = 'high' | 'medium' | 'low';

// 客户来源枚举
export type CustomerSource = 'direct' | 'referral' | 'website' | 'conference' | 'partner';

// 客户分类类型
export type CustomerType = 'user' | 'non_user' | 'valid_non_user' | 'invalid_non_user';

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
  customerType: CustomerType;
  contactPerson: string;
  phone?: string;
  address?: string;
  city?: string;
  province?: string;
  district?: string;
  industry?: string;
  // 企业信息字段
  companyFullName?: string;
  creditCode?: string;
  registeredCapital?: number;
  establishDate?: string;
  businessScope?: string;
  legalPerson?: string;
  companyStatus?: string;
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
  title?: string;
  sentiment: Sentiment;
  summary: string;
  keyPoints: string[];
  actionItems: string[];
  keywords: string[];
  transcript?: string;
  status: 'analyzed' | 'pending' | 'processing';
  fileSize?: number;
  fileUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  psychology?: CustomerPsychology;
  suggestions?: AISuggestion[];
}

// 客户心理分析
export interface CustomerPsychology {
  attitude: 'interested' | 'neutral' | 'resistant';
  purchaseIntent: 'high' | 'medium' | 'low';
  painPoints: string[];
  concerns: string[];
}

// AI建议
export interface AISuggestion {
  type: 'email' | 'demo' | 'proposal' | 'follow_up' | 'price';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

// 录音统计
export interface RecordingStats {
  total: number;
  averageDuration: number;
  totalDuration: number;
  sentimentDistribution: {
    positive: number;
    neutral: number;
    negative: number;
  };
  statusDistribution: {
    pending: number;
    processing: number;
    analyzed: number;
  };
  todayCount: number;
  weekCount: number;
  analyzedRate: number;
  aiAccuracy: number;
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
  quoted: '已报价',
  negotiation: '商务谈判',
  procurement_process: '采购流程中',
  contract_stage: '合同阶段中',
  won: '已成交'
};

// 阶段颜色映射
export const STAGE_COLORS: Record<Stage, { bg: string; text: string; ring: string }> = {
  new_lead: { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-400', ring: 'ring-slate-500/10' },
  contacted: { bg: 'bg-cyan-50 dark:bg-cyan-900/30', text: 'text-cyan-600 dark:text-cyan-400', ring: 'ring-cyan-500/10' },
  solution: { bg: 'bg-violet-50 dark:bg-violet-900/30', text: 'text-violet-600 dark:text-violet-400', ring: 'ring-violet-500/10' },
  quoted: { bg: 'bg-indigo-50 dark:bg-indigo-900/30', text: 'text-indigo-600 dark:text-indigo-400', ring: 'ring-indigo-500/10' },
  negotiation: { bg: 'bg-blue-50 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400', ring: 'ring-blue-500/10' },
  procurement_process: { bg: 'bg-amber-50 dark:bg-amber-900/30', text: 'text-amber-600 dark:text-amber-400', ring: 'ring-amber-500/10' },
  contract_stage: { bg: 'bg-orange-50 dark:bg-orange-900/30', text: 'text-orange-600 dark:text-orange-400', ring: 'ring-orange-500/10' },
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

// ==================== 联系人相关类型 ====================

// 联系人角色类型
export type ContactRole = 'decision_maker' | 'key_influencer' | 'coach' | 'end_user' | 'gatekeeper' | 'blocker';

// 联系人接口
export interface Contact {
  id: string;
  customerId: string;
  name: string;
  title?: string;           // 职位
  department?: string;      // 部门
  email?: string;
  phone?: string;
  mobile?: string;          // 手机
  wechat?: string;          // 微信
  role: ContactRole;
  isPrimary: boolean;       // 是否主联系人
  notes?: string;
  lastContact?: string;     // 最后联系时间
  createdAt: string;
  updatedAt: string;
}

// 联系人角色标签
export const CONTACT_ROLE_LABELS: Record<ContactRole, string> = {
  decision_maker: '决策人',
  key_influencer: '关键人',
  coach: '教练',
  end_user: '用户',
  gatekeeper: '把关人',
  blocker: '反对者',
};

// 联系人角色颜色映射
export const CONTACT_ROLE_COLORS: Record<ContactRole, { bg: string; text: string; icon: string }> = {
  decision_maker: { 
    bg: 'bg-red-100 dark:bg-red-900/30', 
    text: 'text-red-700 dark:text-red-400',
    icon: '🎯'
  },
  key_influencer: { 
    bg: 'bg-orange-100 dark:bg-orange-900/30', 
    text: 'text-orange-700 dark:text-orange-400',
    icon: '⭐'
  },
  coach: { 
    bg: 'bg-green-100 dark:bg-green-900/30', 
    text: 'text-green-700 dark:text-green-400',
    icon: '🤝'
  },
  end_user: { 
    bg: 'bg-blue-100 dark:bg-blue-900/30', 
    text: 'text-blue-700 dark:text-blue-400',
    icon: '👤'
  },
  gatekeeper: { 
    bg: 'bg-purple-100 dark:bg-purple-900/30', 
    text: 'text-purple-700 dark:text-purple-400',
    icon: '🚧'
  },
  blocker: { 
    bg: 'bg-slate-100 dark:bg-slate-800', 
    text: 'text-slate-700 dark:text-slate-400',
    icon: '⚠️'
  },
};

// 创建联系人输入
export interface CreateContactInput {
  name: string;
  title?: string;
  department?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  wechat?: string;
  role?: ContactRole;
  isPrimary?: boolean;
  notes?: string;
  lastContact?: string;
}

// ==================== 名片扫描相关类型 ====================

// OCR识别结果
export interface OcrResult {
  name?: string;
  title?: string;
  department?: string;
  company?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  address?: string;
  website?: string;
  wechat?: string;
}

// 名片接口
export interface BusinessCard {
  id: string;
  customerId?: string;
  imageUrl: string;
  ocrResult?: OcrResult;
  rawData?: OcrResult;
  status: 'pending' | 'processed' | 'failed';
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
  customer?: {
    id: string;
    name: string;
    shortName: string;
  };
}

// 从名片创建客户输入
export interface CreateCustomerFromCardInput {
  name: string;
  shortName?: string;
  industry?: string;
  city?: string;
  address?: string;
  priority?: 'high' | 'medium' | 'low';
  source?: 'direct' | 'referral' | 'website' | 'conference' | 'partner';
  notes?: string;
  contactName: string;
  contactTitle?: string;
  contactDepartment?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactMobile?: string;
  contactWechat?: string;
  contactRole?: ContactRole;
}

// ==================== 陌生拜访AI助手相关类型 ====================

// 企业基本信息
export interface CompanyBasicInfo {
  name: string;
  industry?: string;
  scale?: string;
  founded?: string;
  address?: string;
  website?: string;
  description?: string;
}

// 近期动态
export interface CompanyNews {
  title: string;
  date: string;
  summary: string;
}

// 关键联系人
export interface KeyContact {
  name: string;
  title: string;
  department: string;
  source: string;
  confidence: number;
}

// 销售话术
export interface SalesPitch {
  opening: string;
  painPoints: string[];
  talkingPoints: string[];
  objectionHandlers: Array<{
    objection: string;
    response: string;
  }>;
}

// 企业信息智能分析结果
export interface CompanyIntelligence {
  basicInfo: CompanyBasicInfo;
  businessScope: string[];
  recentNews: CompanyNews[];
  keyContacts: KeyContact[];
  salesPitch: SalesPitch;
}

// 陌生拜访记录
export interface ColdVisitRecord {
  id: string;
  companyName: string;
  inputType: 'text' | 'image';
  inputContent?: string;
  imageUrl?: string;
  intelligenceResult?: CompanyIntelligence;
  customerId?: string;
  status: 'analyzed' | 'converted';
  createdAt: string;
  updatedAt: string;
  customer?: {
    id: string;
    name: string;
    shortName: string;
  };
}

// 分析企业输入
export interface AnalyzeCompanyInput {
  companyName?: string;
  imageUrl?: string;
}

// 转换为客户输入
export interface ConvertFromColdVisitInput {
  name: string;
  shortName?: string;
  industry?: string;
  city?: string;
  address?: string;
  priority?: 'high' | 'medium' | 'low';
  source?: 'direct' | 'referral' | 'website' | 'conference' | 'partner';
  notes?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
}

// ==================== 商机评分相关类型 ====================

// 评分因子
export interface ScoreFactor {
  name: string;
  score: number;
  impact: 'positive' | 'neutral' | 'negative';
  description: string;
}

// 风险因素
export interface RiskFactor {
  factor: string;
  severity: 'high' | 'medium' | 'low';
  suggestion: string;
}

// 改进建议
export interface ScoreRecommendation {
  action: string;
  priority: 'high' | 'medium' | 'low';
  expectedImpact: string;
}

// 商机评分
export interface OpportunityScore {
  id: string;
  opportunityId: string;
  overallScore: number;
  winProbability: number;
  engagementScore: number;
  budgetScore: number;
  authorityScore: number;
  needScore: number;
  timingScore: number;
  factors: ScoreFactor[];
  riskFactors: RiskFactor[];
  recommendations: ScoreRecommendation[];
  analyzedAt: string;
  createdAt: string;
  updatedAt: string;
}

// 评分概览
export interface ScoreSummary {
  totalOpportunities: number;
  scoredOpportunities: number;
  averageScore: number;
  highScoreCount: number;
  predictedValue: number;
  topOpportunities: Array<{
    opportunityId: string;
    title: string;
    customerName: string;
    customerShortName: string;
    value: number;
    stage: string;
    overallScore: number;
    winProbability: number;
  }>;
}

// ==================== 流失预警相关类型 ====================

// 流失原因
export interface ChurnReason {
  factor: string;
  weight: number;
  evidence: string;
}

// 预警信号
export interface ChurnSignal {
  type: string;
  description: string;
  detectedAt: string;
}

// 挽回建议
export interface RetentionSuggestion {
  action: string;
  priority: 'high' | 'medium' | 'low';
  expectedOutcome: string;
}

// 流失预警
export interface ChurnAlert {
  id: string;
  customerId: string;
  riskLevel: 'high' | 'medium' | 'low';
  riskScore: number;
  reasons: ChurnReason[];
  signals: ChurnSignal[];
  suggestions: RetentionSuggestion[];
  status: 'active' | 'handled' | 'ignored';
  handledAt?: string;
  handledBy?: string;
  createdAt: string;
  updatedAt: string;
  customer?: {
    id: string;
    name: string;
    shortName: string;
    stage: string;
    estimatedValue?: number;
  };
}

// ==================== 客户画像相关类型 ====================

// 提取的需求
export interface ExtractedNeed {
  need: string;
  priority: 'high' | 'medium' | 'low';
  source: string;
}

// 预算信息
export interface BudgetInfo {
  range?: string;
  currency?: string;
  timeline?: string;
  confidence: number;
}

// 决策人信息
export interface DecisionMaker {
  name: string;
  title?: string;
  influence: 'high' | 'medium' | 'low';
  stance: 'supporter' | 'neutral' | 'blocker';
}

// 痛点信息
export interface PainPoint {
  point: string;
  severity: 'high' | 'medium' | 'low';
  category: string;
}

// 竞品信息
export interface CompetitorInfo {
  name: string;
  product?: string;
  strength?: string;
  weakness?: string;
}

// 时间线
export interface InsightTimeline {
  decisionDate?: string;
  implementationDate?: string;
  milestones: Array<{
    name: string;
    date?: string;
  }>;
}

// 客户洞察
export interface CustomerInsight {
  id: string;
  customerId: string;
  extractedNeeds: ExtractedNeed[];
  extractedBudget: BudgetInfo | null;
  decisionMakers: DecisionMaker[];
  painPoints: PainPoint[];
  competitorInfo: CompetitorInfo[];
  timeline: InsightTimeline;
  confidence: number;
  analyzedAt: string;
  createdAt: string;
  updatedAt: string;
}

// ==================== 客户分类相关类型 ====================

// 客户分类标签
export const CUSTOMER_TYPE_LABELS: Record<CustomerType, string> = {
  user: '用户',
  non_user: '非用户',
  valid_non_user: '有效非用户',
  invalid_non_user: '无效非用户',
};

// 客户分类颜色映射
export const CUSTOMER_TYPE_COLORS: Record<CustomerType, { bg: string; text: string; description: string }> = {
  user: { 
    bg: 'bg-emerald-100 dark:bg-emerald-900/30', 
    text: 'text-emerald-700 dark:text-emerald-400',
    description: '已购买产品/服务的客户'
  },
  non_user: { 
    bg: 'bg-slate-100 dark:bg-slate-800', 
    text: 'text-slate-700 dark:text-slate-300',
    description: '未购买但有接触的潜在客户'
  },
  valid_non_user: { 
    bg: 'bg-blue-100 dark:bg-blue-900/30', 
    text: 'text-blue-700 dark:text-blue-400',
    description: '有购买潜力的潜在客户'
  },
  invalid_non_user: { 
    bg: 'bg-red-100 dark:bg-red-900/30', 
    text: 'text-red-700 dark:text-red-400',
    description: '无购买意向或不符合条件的客户'
  },
};

// ==================== 企业搜索相关类型 ====================

// 企业搜索结果
export interface CompanySearchResult {
  name: string;              // 企业名称
  shortName: string;         // 企业简称
  creditCode: string;        // 统一社会信用代码
  legalPerson: string;       // 法人代表
  registeredCapital: number; // 注册资本（万元）
  establishDate: string;     // 成立日期
  status: string;            // 企业状态
  industry: string;          // 行业
  city: string;              // 城市
  province: string;          // 省份
  address: string;           // 详细地址
  businessScope: string;     // 经营范围
  phone?: string;            // 联系电话
  email?: string;            // 邮箱
}

// 创建客户输入
export interface CreateCustomerInput {
  name: string;
  shortName: string;
  email?: string;
  stage?: Stage;
  estimatedValue?: number;
  nextFollowUp?: string;
  source?: CustomerSource;
  priority?: Priority;
  customerType?: CustomerType;
  contactPerson: string;
  phone?: string;
  address?: string;
  city?: string;
  province?: string;
  district?: string;
  industry?: string;
  notes?: string;
  // 企业信息字段
  companyFullName?: string;
  creditCode?: string;
  registeredCapital?: number;
  establishDate?: string;
  businessScope?: string;
  legalPerson?: string;
  companyStatus?: string;
}