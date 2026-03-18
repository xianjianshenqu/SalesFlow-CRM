/**
 * API配置和服务层
 * 用于前端与后端API通信
 */

import type { 
  AudioRecording, 
  RecordingStats,
  ColdVisitRecord,
  ConvertFromColdVisitInput,
  CompanyBasicInfo,
  CompanyNews,
  KeyContact,
  SalesPitch,
  CompanyIntelligence,
  AnalyzeCompanyInput,
  CompanySearchResult,
  CreateCustomerInput
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002/api/v1';
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || '10000');

// HTTP请求封装
class ApiService {
  private baseUrl: string;
  private timeout: number;
  private isRefreshing: boolean = false;
  private failedQueue: Array<{
    resolve: (value: unknown) => void;
    reject: (reason: unknown) => void;
  }> = [];

  constructor(baseUrl: string, timeout: number) {
    this.baseUrl = baseUrl;
    this.timeout = timeout;
  }

  private async refreshAccessToken(): Promise<boolean> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) return false;

    try {
      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) return false;

      const result = await response.json();
      localStorage.setItem('auth_token', result.data.accessToken);
      if (result.data.refreshToken) {
        localStorage.setItem('refresh_token', result.data.refreshToken);
      }
      return true;
    } catch {
      return false;
    }
  }

  private processQueue(error: Error | null, token: string | null = null) {
    this.failedQueue.forEach((promise) => {
      if (error) {
        promise.reject(error);
      } else {
        promise.resolve(token);
      }
    });
    this.failedQueue = [];
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ data: T; status: number }> {
    const token = localStorage.getItem('auth_token');
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // 处理 401 错误 - 尝试刷新 token
      if (response.status === 401 && !endpoint.includes('/auth/')) {
        if (this.isRefreshing) {
          // 等待正在刷新的请求完成
          return new Promise((resolve, reject) => {
            this.failedQueue.push({ resolve, reject });
          }).then(() => this.request<T>(endpoint, options));
        }

        this.isRefreshing = true;
        const refreshed = await this.refreshAccessToken();
        this.isRefreshing = false;

        if (refreshed) {
          this.processQueue(null, localStorage.getItem('auth_token'));
          // 使用新 token 重试请求
          return this.request<T>(endpoint, options);
        } else {
          this.processQueue(new Error('Token refresh failed'));
          // 清除认证状态
          localStorage.removeItem('auth_token');
          localStorage.removeItem('refresh_token');
          // 跳转到登录页
          window.location.href = '/login';
          throw new Error('认证已过期，请重新登录');
        }
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `HTTP error! status: ${response.status}`);
      }

      // 后端返回格式: { success, data, message }，这里解包返回实际的 data
      return { data: result.data, status: response.status };
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('请求超时');
      }
      throw error;
    }
  }

  async get<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, body?: unknown) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(endpoint: string, body?: unknown) {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async patch<T>(endpoint: string, body?: unknown) {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

const api = new ApiService(API_BASE_URL, API_TIMEOUT);

// ==================== 认证API ====================
export const authApi = {
  register: (data: {
    email: string;
    password: string;
    name: string;
    department?: string;
    phone?: string;
  }) => api.post<{ user: User; tokens: { accessToken: string; refreshToken: string } }>('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post<{ user: User; tokens: { accessToken: string; refreshToken: string } }>('/auth/login', data),

  getProfile: () => api.get<User>('/auth/me'),

  updateProfile: (data: Partial<User>) => api.put<User>('/auth/me', data),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.post('/auth/change-password', data),

  refreshToken: () => {
    const refreshToken = localStorage.getItem('refresh_token');
    return api.post<{ accessToken: string; refreshToken: string }>('/auth/refresh', { refreshToken });
  },
};

// ==================== 客户API ====================
export const customerApi = {
  getAll: (params?: {
    page?: number;
    pageSize?: number;
    stage?: string;
    priority?: string;
    search?: string;
  }) => {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.pageSize) query.set('pageSize', String(params.pageSize));
    if (params?.stage) query.set('stage', params.stage);
    if (params?.priority) query.set('priority', params.priority);
    if (params?.search) query.set('search', params.search);
    // api.request 已解包后端 { data: [...] }，所以这里返回 Customer[]
    return api.get<Customer[]>(`/customers?${query}`);
  },

  getById: (id: string) => api.get<Customer>(`/customers/${id}`),

  create: (data: CreateCustomerInput) => api.post<Customer>('/customers', data),

  update: (id: string, data: Partial<CreateCustomerInput>) =>
    api.put<Customer>(`/customers/${id}`, data),

  delete: (id: string) => api.delete(`/customers/${id}`),

  getStats: () => api.get<CustomerStats>('/customers/stats'),

  getDistribution: () => api.get<Distribution>('/customers/distribution'),
};

// ==================== 商机API ====================
export const opportunityApi = {
  getAll: (params?: { customerId?: string; stage?: string }) => {
    const query = new URLSearchParams();
    if (params?.customerId) query.set('customerId', params.customerId);
    if (params?.stage) query.set('stage', params.stage);
    return api.get<Opportunity[]>(`/opportunities?${query}`);
  },

  getById: (id: string) => api.get<Opportunity>(`/opportunities/${id}`),

  create: (data: CreateOpportunityInput) => api.post<Opportunity>('/opportunities', data),

  update: (id: string, data: Partial<CreateOpportunityInput>) =>
    api.put<Opportunity>(`/opportunities/${id}`, data),

  delete: (id: string) => api.delete(`/opportunities/${id}`),

  moveStage: (id: string, stage: string) =>
    api.patch<Opportunity>(`/opportunities/${id}/stage`, { stage }),
};

// ==================== 支付API ====================
export const paymentApi = {
  getAll: (params?: { customerId?: string; status?: string }) => {
    const query = new URLSearchParams();
    if (params?.customerId) query.set('customerId', params.customerId);
    if (params?.status) query.set('status', params.status);
    return api.get<Payment[]>(`/payments?${query}`);
  },

  getById: (id: string) => api.get<Payment>(`/payments/${id}`),

  create: (data: CreatePaymentInput) => api.post<Payment>('/payments', data),

  update: (id: string, data: Partial<CreatePaymentInput>) =>
    api.put<Payment>(`/payments/${id}`, data),

  delete: (id: string) => api.delete(`/payments/${id}`),

  addPayment: (id: string, amount: number) =>
    api.post<Payment>(`/payments/${id}/add-payment`, { amount }),
};

// ==================== 仪表盘API ====================
export const dashboardApi = {
  getOverview: () => api.get<DashboardOverview>('/dashboard/overview'),

  getSalesTrend: (period: string) =>
    api.get<SalesTrend[]>(`/dashboard/sales-trend?period=${period}`),

  getTopCustomers: (limit: number) =>
    api.get<TopCustomer[]>(`/dashboard/top-customers?limit=${limit}`),
};

// ==================== 日程API ====================
export const scheduleApi = {
  getAll: (params?: { startDate?: string; endDate?: string }) => {
    const query = new URLSearchParams();
    if (params?.startDate) query.set('startDate', params.startDate);
    if (params?.endDate) query.set('endDate', params.endDate);
    return api.get<ScheduleTask[]>(`/schedules?${query}`);
  },

  getById: (id: string) => api.get<ScheduleTask>(`/schedules/${id}`),

  create: (data: CreateScheduleInput) => api.post<ScheduleTask>('/schedules', data),

  update: (id: string, data: Partial<CreateScheduleInput>) =>
    api.put<ScheduleTask>(`/schedules/${id}`, data),

  delete: (id: string) => api.delete(`/schedules/${id}`),
};

// ==================== 团队API ====================
export const teamApi = {
  getMembers: () => api.get<TeamMember[]>('/team'),

  getMember: (id: string) => api.get<TeamMember>(`/team/${id}`),

  getActivities: (limit?: number) =>
    api.get<TeamActivity[]>(`/team/activities${limit ? `?limit=${limit}` : ''}`),
};

// ==================== 录音API ====================
export const recordingApi = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    customerId?: string;
    sentiment?: string;
    status?: string;
    search?: string;
  }) => {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.customerId) query.set('customerId', params.customerId);
    if (params?.sentiment) query.set('sentiment', params.sentiment);
    if (params?.status) query.set('status', params.status);
    if (params?.search) query.set('search', params.search);
    return api.get<{ data: AudioRecording[]; pagination: { page: number; limit: number; total: number; totalPages: number } }>(`/recordings?${query}`);
  },

  getById: (id: string) => api.get<AudioRecording>(`/recordings/${id}`),

  getDetail: (id: string) => api.get<AudioRecording>(`/recordings/${id}/detail`),

  upload: (formData: FormData) =>
    fetch(`${API_BASE_URL}/recordings/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
      },
      body: formData,
    }).then((r) => r.json()),

  create: (data: CreateRecordingInput) => api.post<AudioRecording>('/recordings', data),

  update: (id: string, data: Partial<CreateRecordingInput>) =>
    api.put<AudioRecording>(`/recordings/${id}`, data),

  delete: (id: string) => api.delete(`/recordings/${id}`),

  analyze: (id: string) => api.post<AudioRecording>(`/recordings/${id}/analyze`),

  syncFromDingTalk: () => api.post<{ synced: number; recordings: AudioRecording[] }>('/recordings/sync'),

  getStats: (customerId?: string) => {
    const query = customerId ? `?customerId=${customerId}` : '';
    return api.get<RecordingStats>(`/recordings/stats${query}`);
  },
};

// ==================== 类型定义 ====================
interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  department?: string;
  phone?: string;
  avatar?: string;
  createdAt?: string;
  lastLoginAt?: string;
}

interface Customer {
  id: string;
  name: string;
  company?: string;
  shortName?: string;
  email?: string;
  stage: string;
  estimatedValue: number;
  priority: string;
  contactPerson?: string;
  phone?: string;
  city?: string;
  industry?: string;
  notes?: string;
  ownerId?: string;
  createdAt: string;
  updatedAt: string;
}

interface CustomerStats {
  total: number;
  byStage: Record<string, number>;
  byPriority: Record<string, number>;
  totalValue: number;
}

interface Distribution {
  byCity: { city: string; count: number }[];
  byIndustry: { industry: string; count: number }[];
  bySource: { source: string; count: number }[];
}

interface Opportunity {
  id: string;
  customerId: string;
  title: string;
  stage: string;
  value: number;
  probability: number;
  priority: string;
  expectedCloseDate?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateOpportunityInput {
  customerId: string;
  title: string;
  stage?: string;
  value?: number;
  probability?: number;
  priority?: string;
  expectedCloseDate?: string;
  description?: string;
  nextStep?: string;
}

interface Payment {
  id: string;
  invoiceId: string;
  customerId: string;
  totalAmount: number;
  paidAmount: number;
  balance: number;
  status: string;
  dueDate: string;
  paidDate?: string;
  notes?: string;
  createdAt: string;
}

interface CreatePaymentInput {
  customerId: string;
  totalAmount: number;
  paidAmount?: number;
  status?: string;
  dueDate: string;
  notes?: string;
}

interface DashboardOverview {
  totalCustomers: number;
  totalOpportunities: number;
  totalRevenue: number;
  pendingPayments: number;
  conversionRate: number;
}

interface SalesTrend {
  date: string;
  revenue: number;
  deals: number;
}

interface TopCustomer {
  id: string;
  name: string;
  totalValue: number;
  dealCount: number;
}

interface ScheduleTask {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  type: string;
  priority: string;
  status: string;
  customerId?: string;
  location?: string;
  reminder?: boolean;
  assigneeId?: string;
  createdAt: string;
}

interface CreateScheduleInput {
  title: string;
  description?: string;
  dueDate: string;
  type?: string;
  priority?: string;
  customerId?: string;
  location?: string;
  reminder?: boolean;
}

interface TeamMember {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  avatar?: string;
  role: string;
  department?: string;
  position?: string;
  revenue: number;
  deals: number;
  customers: number;
  isActive: boolean;
}

interface TeamActivity {
  id: string;
  type: string;
  title: string;
  description?: string;
  memberId?: string;
  createdAt: string;
}

interface CreateRecordingInput {
  customerId: string;
  title: string;
  duration: number;
  fileUrl: string;
  fileSize?: number;
  contactPerson?: string;
  transcript?: string;
  summary?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  keywords?: string[];
  actionItems?: string[];
  notes?: string;
}

// ==================== 联系人类型 ====================
type ContactRole = 'decision_maker' | 'key_influencer' | 'coach' | 'end_user' | 'gatekeeper' | 'blocker';

interface Contact {
  id: string;
  customerId: string;
  name: string;
  title?: string;
  department?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  wechat?: string;
  role: ContactRole;
  isPrimary: boolean;
  notes?: string;
  lastContact?: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateContactInput {
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

interface ContactStats {
  total: number;
  primaryCount: number;
  byRole: { role: string; _count: number }[];
}

// ==================== 名片扫描类型 ====================
interface OcrResult {
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

interface BusinessCard {
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

interface CreateCustomerFromCardInput {
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

interface CustomerFromCardResult {
  customer: Customer;
  contact: Contact;
}

// ==================== 联系人API ====================
export const contactApi = {
  getByCustomer: (customerId: string, params?: {
    role?: string;
    department?: string;
    isPrimary?: boolean;
    search?: string;
  }) => {
    const query = new URLSearchParams();
    if (params?.role) query.set('role', params.role);
    if (params?.department) query.set('department', params.department);
    if (params?.isPrimary !== undefined) query.set('isPrimary', String(params.isPrimary));
    if (params?.search) query.set('search', params.search);
    return api.get<Contact[]>(`/customers/${customerId}/contacts?${query}`);
  },

  getById: (id: string) => api.get<Contact>(`/contacts/${id}`),

  create: (customerId: string, data: CreateContactInput) =>
    api.post<Contact>(`/customers/${customerId}/contacts`, data),

  update: (id: string, data: Partial<CreateContactInput>) =>
    api.put<Contact>(`/contacts/${id}`, data),

  delete: (id: string) => api.delete(`/contacts/${id}`),

  setPrimary: (id: string) => api.patch<Contact>(`/contacts/${id}/primary`),

  batchImport: (customerId: string, contacts: CreateContactInput[]) =>
    api.post<Contact[]>(`/customers/${customerId}/contacts/batch`, { contacts }),

  getStats: (customerId?: string) => {
    const query = customerId ? `?customerId=${customerId}` : '';
    return api.get<ContactStats>(`/contacts/stats${query}`);
  },
};

// ==================== 名片扫描API ====================
export const businessCardApi = {
  scan: (imageUrl: string) =>
    api.post<BusinessCard>('/business-cards/scan', { imageUrl }),

  createCustomer: (businessCardId: string, data: CreateCustomerFromCardInput) =>
    api.post<CustomerFromCardResult>(`/business-cards/${businessCardId}/create-customer`, data),

  getAll: (params?: { status?: string; page?: number; pageSize?: number }) => {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.page) query.set('page', String(params.page));
    if (params?.pageSize) query.set('pageSize', String(params.pageSize));
    return api.get<{ items: BusinessCard[]; total: number }>(`/business-cards?${query}`);
  },

  getById: (id: string) => api.get<BusinessCard>(`/business-cards/${id}`),

  delete: (id: string) => api.delete(`/business-cards/${id}`),
};

// ==================== 陌生拜访AI助手API ====================
export const coldVisitApi = {
  // 分析企业信息
  analyze: (input: { companyName?: string; imageUrl?: string }) =>
    api.post<ColdVisitRecord>('/cold-visit/analyze', input),

  // 转换为客户
  convert: (recordId: string, data: Partial<ConvertFromColdVisitInput>) =>
    api.post<{ customer: Customer; record: ColdVisitRecord }>(`/cold-visit/${recordId}/convert`, data),

  // 获取历史记录
  getHistory: (params?: { page?: number; limit?: number; status?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.status) query.set('status', params.status);
    if (params?.search) query.set('search', params.search);
    return api.get<{ data: ColdVisitRecord[]; pagination: { page: number; limit: number; total: number; totalPages: number } }>(`/cold-visit/history?${query}`);
  },

  // 获取单个记录
  getById: (id: string) => api.get<ColdVisitRecord>(`/cold-visit/${id}`),

  // 删除记录
  delete: (id: string) => api.delete(`/cold-visit/${id}`),
};

// ==================== 售前活动API ====================
// 活动类型
type ActivityType = 'demo' | 'poc' | 'training' | 'seminar' | 'other';
type ActivityStatus = 'draft' | 'pending_approval' | 'approved' | 'ongoing' | 'completed' | 'cancelled';
type ApprovalStatus = 'none' | 'pending' | 'approved' | 'rejected';

// 售前活动接口
interface PresalesActivity {
  id: string;
  title: string;
  type: ActivityType;
  description?: string;
  customerId?: string;
  location?: string;
  startTime: string;
  endTime: string;
  status: ActivityStatus;
  approvalStatus: ApprovalStatus;
  approvalNotes?: string;
  approvedById?: string;
  approvedAt?: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  customer?: {
    id: string;
    name: string;
    company?: string;
  };
  createdBy: {
    id: string;
    name: string;
  };
  approvedBy?: {
    id: string;
    name: string;
  };
  _count?: {
    qrCodes: number;
    signIns: number;
    questions: number;
  };
}

interface CreatePresalesActivityInput {
  title: string;
  type: ActivityType;
  description?: string;
  customerId?: string;
  location?: string;
  startTime: string;
  endTime: string;
}

interface UpdatePresalesActivityInput {
  title?: string;
  type?: ActivityType;
  description?: string;
  customerId?: string;
  location?: string;
  startTime?: string;
  endTime?: string;
}

// 活动二维码
interface ActivityQrCode {
  id: string;
  activityId: string;
  codeType: 'exclusive' | 'generic';
  qrCodeUrl: string;
  qrCodeData: string;
  validFrom: string;
  validUntil?: string;
  isActive: boolean;
  scanCount: number;
  createdAt: string;
}

interface CreateQrCodeInput {
  codeType: 'exclusive' | 'generic';
  validFrom?: string;
  validUntil?: string;
}

// 活动签到
interface ActivitySignIn {
  id: string;
  activityId: string;
  qrCodeId: string;
  customerId?: string;
  customerName: string;
  phone: string;
  email?: string;
  company?: string;
  title?: string;
  isNewCustomer: boolean;
  notes?: string;
  signedAt: string;
  customer?: {
    id: string;
    name: string;
    company?: string;
  };
  questions?: ActivityQuestion[];
}

interface SignInInput {
  qrCodeId: string;
  customerName: string;
  phone: string;
  email?: string;
  company?: string;
  title?: string;
  notes?: string;
}

// 活动问题
interface ActivityQuestion {
  id: string;
  activityId: string;
  signInId: string;
  customerId?: string;
  question: string;
  category?: string;
  priority?: string;
  aiAnalysis?: {
    category: string;
    priority: string;
    keywords: string[];
    suggestedAnswer?: string;
  };
  status: 'pending' | 'answered' | 'closed';
  answer?: string;
  answeredAt?: string;
  answeredBy?: string;
  createdAt: string;
}

interface CreateQuestionInput {
  question: string;
}

interface UpdateQuestionInput {
  status?: 'pending' | 'answered' | 'closed';
  answer?: string;
}

// AI问题分类结果
interface QuestionClassification {
  category: string;
  priority: string;
  keywords: string[];
  suggestedAnswer?: string;
}

// 售前活动API
export const presalesActivityApi = {
  // 活动管理
  getAll: (params?: {
    page?: number;
    pageSize?: number;
    status?: ActivityStatus;
    type?: ActivityType;
    search?: string;
  }) => {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.pageSize) query.set('pageSize', String(params.pageSize));
    if (params?.status) query.set('status', params.status);
    if (params?.type) query.set('type', params.type);
    if (params?.search) query.set('search', params.search);
    return api.get<{ items: PresalesActivity[]; total: number }>(`/presales/activities?${query}`);
  },

  getById: (id: string) => api.get<PresalesActivity>(`/presales/activities/${id}`),

  create: (data: CreatePresalesActivityInput) =>
    api.post<PresalesActivity>('/presales/activities', data),

  update: (id: string, data: UpdatePresalesActivityInput) =>
    api.put<PresalesActivity>(`/presales/activities/${id}`, data),

  delete: (id: string) => api.delete(`/presales/activities/${id}`),

  updateStatus: (id: string, status: ActivityStatus) =>
    api.patch<PresalesActivity>(`/presales/activities/${id}/status`, { status }),

  // 审批流程
  submitApproval: (id: string) =>
    api.post<PresalesActivity>(`/presales/activities/${id}/submit-approval`),

  approve: (id: string, approvalNotes?: string) =>
    api.post<PresalesActivity>(`/presales/activities/${id}/approve`, { approvalNotes }),

  reject: (id: string, approvalNotes: string) =>
    api.post<PresalesActivity>(`/presales/activities/${id}/reject`, { approvalNotes }),

  // 二维码管理
  createQrCode: (activityId: string, data: CreateQrCodeInput) =>
    api.post<ActivityQrCode>(`/presales/activities/${activityId}/qrcodes`, data),

  getQrCodes: (activityId: string) =>
    api.get<ActivityQrCode[]>(`/presales/activities/${activityId}/qrcodes`),

  getQrCode: (qrCodeId: string) =>
    api.get<ActivityQrCode>(`/presales/qrcodes/${qrCodeId}`),

  // 签到功能
  signIn: (data: SignInInput) =>
    api.post<ActivitySignIn>('/presales/sign-in', data),

  getSignIns: (activityId: string) =>
    api.get<ActivitySignIn[]>(`/presales/activities/${activityId}/sign-ins`),

  getSignIn: (signInId: string) =>
    api.get<ActivitySignIn>(`/presales/sign-ins/${signInId}`),

  // 问题管理
  createQuestion: (signInId: string, data: CreateQuestionInput) =>
    api.post<ActivityQuestion>(`/presales/sign-ins/${signInId}/questions`, data),

  getQuestions: (activityId: string) =>
    api.get<ActivityQuestion[]>(`/presales/activities/${activityId}/questions`),

  updateQuestion: (questionId: string, data: UpdateQuestionInput) =>
    api.patch<ActivityQuestion>(`/presales/questions/${questionId}`, data),

  answerQuestion: (questionId: string, answer: string) =>
    api.post<ActivityQuestion>(`/presales/questions/${questionId}/answer`, { answer }),

  // AI分类
  classifyQuestion: (question: string) =>
    api.post<QuestionClassification>('/presales/questions/classify', { question }),
};

// ==================== 商务方案API ====================

// 方案状态类型
export type ProposalStatus = 
  | 'draft' 
  | 'requirement_analysis' 
  | 'designing' 
  | 'pending_review' 
  | 'review_passed' 
  | 'review_rejected' 
  | 'customer_proposal' 
  | 'negotiation' 
  | 'sent' 
  | 'accepted' 
  | 'rejected' 
  | 'expired';

// 方案类型
export interface Proposal {
  id: string;
  title: string;
  customerId: string;
  value: number;
  status: ProposalStatus;
  description?: string;
  products?: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    description?: string;
    priority?: 'essential' | 'recommended' | 'optional';
  }>;
  terms?: string;
  validUntil?: string;
  sentAt?: string;
  notes?: string;
  ownerId?: string;
  createdById?: string;
  createdAt: string;
  updatedAt: string;
  customer?: {
    id: string;
    name: string;
    company?: string;
  shortName?: string;
    email?: string;
    phone?: string;
  };
  createdBy?: {
    id: string;
    name: string;
    email?: string;
  };
}

// 方案模板类型
export interface ProposalTemplate {
  id: string;
  name: string;
  category: string;
  description?: string;
  content: string;
  products?: any;
  terms?: string;
  tags?: string[];
  usageCount: number;
  isActive: boolean;
  matchScore?: number;
  createdAt: string;
}

// 需求分析类型
export interface RequirementAnalysis {
  id: string;
  proposalId: string;
  customerId: string;
  sourceType: 'manual' | 'ai_recording' | 'ai_followup';
  recordingId?: string;
  rawContent?: string;
  aiEnhanced: boolean;
  finalContent?: string;
  extractedNeeds?: Array<{
    need: string;
    priority: 'high' | 'medium' | 'low';
    source: string;
  }>;
  painPoints?: Array<{
    point: string;
    severity: 'high' | 'medium' | 'low';
    category: string;
  }>;
  budgetHint?: {
    range?: string;
    timeline?: string;
  };
  decisionTimeline?: string;
  status: 'draft' | 'confirmed';
  createdAt: string;
}

// 评审类型
export interface ProposalReview {
  id: string;
  proposalId: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewerId?: string;
  sharedWith?: string[];
  comments?: Array<{
    userId: string;
    comment: string;
    createdAt: string;
  }>;
  result?: 'approved' | 'rejected';
  resultNotes?: string;
  reviewedAt?: string;
  createdAt: string;
}

// 客户提案类型
export interface CustomerProposalRecord {
  id: string;
  proposalId: string;
  emailTo: string;
  emailCc?: string[];
  emailSubject?: string;
  emailBody?: string;
  sendStatus: 'draft' | 'sent' | 'delivered' | 'opened' | 'failed';
  sentAt?: string;
  deliveredAt?: string;
  openedAt?: string;
  openCount: number;
  trackingToken?: string;
  viewUrl?: string;
  createdAt: string;
}

// 商务谈判类型
export interface NegotiationRecord {
  id: string;
  proposalId: string;
  discussions?: Array<{
    date: string;
    content: string;
    participants?: string[];
  }>;
  agreedTerms?: Array<{
    term: string;
    value: string;
    confirmed?: boolean;
  }>;
  finalDocumentUrl?: string;
  status: 'ongoing' | 'completed' | 'cancelled';
  createdAt: string;
}

// 商务方案API
export const proposalApi = {
  // 基础CRUD
  getAll: (params?: {
    page?: number;
    limit?: number;
    customerId?: string;
    status?: ProposalStatus;
    minAmount?: number;
    maxAmount?: number;
    search?: string;
  }) => {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.customerId) query.set('customerId', params.customerId);
    if (params?.status) query.set('status', params.status);
    if (params?.minAmount) query.set('minAmount', String(params.minAmount));
    if (params?.maxAmount) query.set('maxAmount', String(params.maxAmount));
    if (params?.search) query.set('search', params.search);
    return api.get<{ data: Proposal[]; pagination: { page: number; limit: number; total: number; totalPages: number } }>(`/proposals?${query}`);
  },

  getById: (id: string) => api.get<Proposal>(`/proposals/${id}`),

  create: (data: {
    customerId: string;
    title: string;
    value: number;
    description?: string;
    products?: any[];
    terms?: string;
    validUntil?: string;
    notes?: string;
  }) => api.post<Proposal>('/proposals', data),

  update: (id: string, data: Partial<{
    title: string;
    value: number;
    description: string;
    products: any[];
    terms: string;
    validUntil: string;
    notes: string;
  }>) => api.put<Proposal>(`/proposals/${id}`, data),

  delete: (id: string) => api.delete(`/proposals/${id}`),

  updateStatus: (id: string, status: ProposalStatus, notes?: string) =>
    api.patch<Proposal>(`/proposals/${id}/status`, { status, notes }),

  getStats: (customerId?: string) => {
    const query = customerId ? `?customerId=${customerId}` : '';
    return api.get<any>(`/proposals/stats${query}`);
  },

  // 模板管理
  getTemplates: (params?: { page?: number; limit?: number; category?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.category) query.set('category', params.category);
    if (params?.search) query.set('search', params.search);
    return api.get<{ data: ProposalTemplate[]; pagination: any }>(`/proposals/templates?${query}`);
  },

  createTemplate: (data: {
    name: string;
    category: string;
    content: string;
    description?: string;
    products?: any;
    terms?: string;
    tags?: string[];
  }) => api.post<ProposalTemplate>('/proposals/templates', data),

  cloneTemplate: (id: string) => api.post<ProposalTemplate>(`/proposals/templates/${id}/clone`),

  // 需求分析阶段
  createRequirementAnalysis: (proposalId: string, data: {
    customerId: string;
    sourceType: 'manual' | 'ai_recording' | 'ai_followup';
    recordingId?: string;
    rawContent?: string;
  }) => api.post<RequirementAnalysis>(`/proposals/${proposalId}/requirement-analysis`, data),

  getRequirementAnalysis: (proposalId: string) => 
    api.get<RequirementAnalysis>(`/proposals/${proposalId}/requirement-analysis`),

  aiAnalyzeRequirement: (proposalId: string, data: {
    sourceType: 'recording' | 'followup';
    recordingId?: string;
  }) => api.post<any>(`/proposals/${proposalId}/requirement-analysis/ai-analyze`, data),

  aiEnhanceRequirement: (proposalId: string) => 
    api.post<RequirementAnalysis>(`/proposals/${proposalId}/requirement-analysis/ai-enhance`),

  updateRequirementAnalysis: (proposalId: string, data: any) => 
    api.put<RequirementAnalysis>(`/proposals/${proposalId}/requirement-analysis`, data),

  confirmRequirementAnalysis: (proposalId: string, finalContent: string) => 
    api.post<Proposal>(`/proposals/${proposalId}/requirement-analysis/confirm`, { finalContent }),

  // 方案设计阶段
  startDesign: (proposalId: string) => 
    api.post<Proposal>(`/proposals/${proposalId}/design`),

  matchTemplate: (proposalId: string, criteria: { industry?: string; needs?: string[]; budget?: number }) => 
    api.post<ProposalTemplate[]>(`/proposals/${proposalId}/design/match-template`, criteria),

  applyTemplate: (proposalId: string, templateId: string) => 
    api.post<Proposal>(`/proposals/${proposalId}/design/apply-template`, { templateId }),

  updateDesign: (proposalId: string, data: any) => 
    api.put<Proposal>(`/proposals/${proposalId}/design`, data),

  confirmDesign: (proposalId: string) => 
    api.post<Proposal>(`/proposals/${proposalId}/design/confirm`),

  // 内部评审阶段
  createReview: (proposalId: string, data: { reviewerId?: string; sharedWith?: string[] }) => 
    api.post<ProposalReview>(`/proposals/${proposalId}/review`, data),

  getReview: (proposalId: string) => 
    api.get<ProposalReview>(`/proposals/${proposalId}/review`),

  addReviewComment: (proposalId: string, comment: string) => 
    api.post<ProposalReview>(`/proposals/${proposalId}/review/comment`, { comment }),

  approveReview: (proposalId: string, resultNotes?: string) => 
    api.post<Proposal>(`/proposals/${proposalId}/review/approve`, { resultNotes }),

  rejectReview: (proposalId: string, resultNotes: string) => 
    api.post<Proposal>(`/proposals/${proposalId}/review/reject`, { resultNotes }),

  // 客户提案阶段
  createCustomerProposal: (proposalId: string, data: {
    emailTo: string;
    emailCc?: string[];
    emailSubject?: string;
    emailBody?: string;
  }) => api.post<CustomerProposalRecord>(`/proposals/${proposalId}/customer-proposal`, data),

  getCustomerProposal: (proposalId: string) => 
    api.get<CustomerProposalRecord>(`/proposals/${proposalId}/customer-proposal`),

  generateEmailTemplate: (proposalId: string) => 
    api.post<{ subject: string; body: string }>(`/proposals/${proposalId}/customer-proposal/generate-email`),

  updateCustomerProposalEmail: (proposalId: string, data: any) => 
    api.put<CustomerProposalRecord>(`/proposals/${proposalId}/customer-proposal/email`, data),

  sendCustomerProposal: (proposalId: string) => 
    api.post<Proposal>(`/proposals/${proposalId}/customer-proposal/send`),

  // 商务谈判阶段
  createNegotiation: (proposalId: string) => 
    api.post<NegotiationRecord>(`/proposals/${proposalId}/negotiation`),

  getNegotiation: (proposalId: string) => 
    api.get<NegotiationRecord>(`/proposals/${proposalId}/negotiation`),

  addDiscussion: (proposalId: string, data: { content: string; participants?: string[] }) => 
    api.post<NegotiationRecord>(`/proposals/${proposalId}/negotiation/discussion`, data),

  updateNegotiationTerms: (proposalId: string, agreedTerms: any[]) => 
    api.put<NegotiationRecord>(`/proposals/${proposalId}/negotiation/terms`, { agreedTerms }),

  completeNegotiation: (proposalId: string) => 
    api.post<Proposal>(`/proposals/${proposalId}/negotiation/complete`),
};

// ==================== 企业搜索API ====================
export const companySearchApi = {
  search: (keyword: string, limit?: number) => {
    const query = new URLSearchParams();
    query.set('keyword', keyword);
    if (limit) query.set('limit', String(limit));
    return api.get<CompanySearchResult[]>(`/companies/search?${query}`);
  },
  
  getDetail: (creditCode: string) => 
    api.get<CompanySearchResult>(`/companies/${creditCode}`),
};

// ==================== 类型导出 ====================
export type {
  User,
  Customer,
  CreateCustomerInput,
  CustomerStats,
  Distribution,
  Opportunity,
  CreateOpportunityInput,
  Payment,
  CreatePaymentInput,
  DashboardOverview,
  SalesTrend,
  TopCustomer,
  ScheduleTask,
  CreateScheduleInput,
  TeamMember,
  TeamActivity,
  AudioRecording,
  RecordingStats,
  Contact,
  ContactRole,
  CreateContactInput,
  ContactStats,
  OcrResult,
  BusinessCard,
  CreateCustomerFromCardInput,
  CustomerFromCardResult,
  // 陌生拜访相关类型
  CompanyBasicInfo,
  CompanyNews,
  KeyContact,
  SalesPitch,
  CompanyIntelligence,
  ColdVisitRecord,
  AnalyzeCompanyInput,
  ConvertFromColdVisitInput,
  // 售前活动相关类型
  ActivityType,
  ActivityStatus,
  ApprovalStatus,
  PresalesActivity,
  CreatePresalesActivityInput,
  UpdatePresalesActivityInput,
  ActivityQrCode,
  CreateQrCodeInput,
  ActivitySignIn,
  SignInInput,
  ActivityQuestion,
  CreateQuestionInput,
  UpdateQuestionInput,
  QuestionClassification,
};

export default api;