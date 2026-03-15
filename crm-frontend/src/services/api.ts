/**
 * API配置和服务层
 * 用于前端与后端API通信
 */

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
  getAll: (customerId?: string) =>
    api.get<AudioRecording[]>(`/recordings${customerId ? `?customerId=${customerId}` : ''}`),

  getById: (id: string) => api.get<AudioRecording>(`/recordings/${id}`),

  upload: (formData: FormData) =>
    fetch(`${API_BASE_URL}/recordings/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
      },
      body: formData,
    }).then((r) => r.json()),
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

interface AudioRecording {
  id: string;
  customerId: string;
  title?: string;
  duration: number;
  recordedAt: string;
  sentiment?: string;
  summary?: string;
  keywords?: string[];
  status: string;
  fileUrl?: string;
  transcript?: string;
}

export default api;