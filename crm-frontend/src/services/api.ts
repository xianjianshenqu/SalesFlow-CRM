/**
 * API配置和服务层
 * 用于前端与后端API通信
 */

import type { AudioRecording, RecordingStats } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1';
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || '10000');

// HTTP请求封装
class ApiService {
  private baseUrl: string;
  private timeout: number;

  constructor(baseUrl: string, timeout: number) {
    this.baseUrl = baseUrl;
    this.timeout = timeout;
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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return { data, status: response.status };
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
  }) => api.post<{ user: User; token: string }>('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post<{ user: User; token: string }>('/auth/login', data),

  getProfile: () => api.get<User>('/auth/me'),

  updateProfile: (data: Partial<User>) => api.put<User>('/auth/me', data),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.post('/auth/change-password', data),

  refreshToken: () => api.post<{ accessToken: string; refreshToken: string }>('/auth/refresh'),
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
    return api.get<{ items: Customer[]; total: number }>(`/customers?${query}`);
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

interface CreateCustomerInput {
  name: string;
  shortName?: string;
  email?: string;
  stage?: string;
  estimatedValue?: number;
  priority?: string;
  contactPerson: string;
  phone?: string;
  city?: string;
  industry?: string;
  notes?: string;
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
};

export default api;