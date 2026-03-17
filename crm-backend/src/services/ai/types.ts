/**
 * AI服务类型定义
 */

// 跟进建议类型
export interface FollowUpSuggestionInput {
  customerId: string;
  customerName?: string;
  industry?: string;
  lastContactDate?: Date | null;
  recordings?: Array<{
    sentiment: string;
    summary?: string;
    recordedAt: Date;
  }>;
  opportunities?: Array<{
    stage: string;
    value: number;
    lastActivity?: Date | null;
  }>;
  scheduleTasks?: Array<{
    type: string;
    status: string;
    dueDate: Date;
  }>;
}

export interface FollowUpSuggestionResult {
  type: 'call' | 'visit' | 'email' | 'wechat';
  priority: 'high' | 'medium' | 'low';
  reason: string;
  suggestedAt: Date;
  expiresAt?: Date;
  script?: string;
}

// 话术生成类型
export interface ScriptGenerationInput {
  customerName: string;
  contactName?: string;
  industry?: string;
  contactType: 'call' | 'visit' | 'email' | 'wechat';
  purpose: string;
  previousContext?: string;
  painPoints?: string[];
  interests?: string[];
}

export interface ScriptGenerationResult {
  script: string;
  keyPoints: string[];
  tips: string[];
}

// 日报生成类型
export interface DailyReportInput {
  userId: string;
  userName: string;
  date: Date;
  type: 'daily' | 'weekly';
  activities: {
    customers: Array<{
      name: string;
      stage: string;
      lastContact?: Date;
    }>;
    opportunities: Array<{
      title: string;
      customerName: string;
      stage: string;
      value: number;
      change?: string;
    }>;
    tasks: Array<{
      title: string;
      type: string;
      status: string;
      customerName?: string;
    }>;
    recordings: Array<{
      customerName: string;
      duration: number;
      sentiment: string;
      summary?: string;
    }>;
    payments: Array<{
      customerName: string;
      amount: number;
      status: string;
    }>;
  };
  stats: {
    totalCalls: number;
    totalMeetings: number;
    totalVisits: number;
    totalRecordings: number;
    newCustomers: number;
    opportunityValue: number;
    closedDeals: number;
  };
}

export interface DailyReportResult {
  summary: string;
  content: string;
  highlights: Array<{
    type: 'success' | 'warning' | 'info';
    title: string;
    description: string;
  }>;
  risks: Array<{
    level: 'high' | 'medium' | 'low';
    description: string;
    suggestion: string;
  }>;
  nextActions: Array<{
    priority: 'high' | 'medium' | 'low';
    action: string;
    customer?: string;
    dueDate?: Date;
  }>;
}

// 商机评分类型
export interface OpportunityScoringInput {
  opportunityId: string;
  customerId: string;
  customerIndustry?: string;
  customerStage?: string;
  value: number;
  stage: string;
  expectedCloseDate?: Date | null;
  lastActivity?: Date | null;
  recordings?: Array<{
    sentiment: string;
    recordedAt: Date;
  }>;
  contacts?: Array<{
    role: string;
    isPrimary: boolean;
  }>;
  scheduleTasks?: Array<{
    type: string;
    status: string;
  }>;
}

export interface OpportunityScoringResult {
  overallScore: number;
  winProbability: number;
  engagementScore: number;
  budgetScore: number;
  authorityScore: number;
  needScore: number;
  timingScore: number;
  factors: Array<{
    name: string;
    score: number;
    impact: 'positive' | 'neutral' | 'negative';
    description: string;
  }>;
  riskFactors: Array<{
    factor: string;
    severity: 'high' | 'medium' | 'low';
    suggestion: string;
  }>;
  recommendations: Array<{
    action: string;
    priority: 'high' | 'medium' | 'low';
    expectedImpact: string;
  }>;
}

// 流失预警类型
export interface ChurnAnalysisInput {
  customerId: string;
  customerName: string;
  stage: string;
  lastContactDate?: Date | null;
  estimatedValue: number;
  recordings?: Array<{
    sentiment: string;
    recordedAt: Date;
  }>;
  opportunities?: Array<{
    stage: string;
    status: string;
    lastActivity?: Date | null;
  }>;
  scheduleTasks?: Array<{
    status: string;
    dueDate: Date;
  }>;
  contacts?: Array<{
    lastContact?: Date | null;
  }>;
}

export interface ChurnAnalysisResult {
  riskLevel: 'high' | 'medium' | 'low';
  riskScore: number;
  reasons: Array<{
    factor: string;
    weight: number;
    evidence: string;
  }>;
  signals: Array<{
    type: string;
    description: string;
    detectedAt: Date;
  }>;
  suggestions: Array<{
    action: string;
    priority: 'high' | 'medium' | 'low';
    expectedOutcome: string;
  }>;
}

// 客户洞察类型
export interface CustomerInsightInput {
  customerId: string;
  recordings?: Array<{
    transcript?: string;
    summary?: string;
    keywords?: string[];
    keyPoints?: string[];
  }>;
  contacts?: Array<{
    name: string;
    title?: string;
    department?: string;
    role: string;
    notes?: string;
  }>;
  notes?: string;
}

export interface CustomerInsightResult {
  extractedNeeds: Array<{
    need: string;
    priority: 'high' | 'medium' | 'low';
    source: string;
  }>;
  extractedBudget: {
    range?: string;
    currency?: string;
    timeline?: string;
    confidence: number;
  } | null;
  decisionMakers: Array<{
    name: string;
    title?: string;
    influence: 'high' | 'medium' | 'low';
    stance: 'supporter' | 'neutral' | 'blocker';
  }>;
  painPoints: Array<{
    point: string;
    severity: 'high' | 'medium' | 'low';
    category: string;
  }>;
  competitorInfo: Array<{
    name: string;
    product?: string;
    strength?: string;
    weakness?: string;
  }>;
  timeline: {
    decisionDate?: string;
    implementationDate?: string;
    milestones: Array<{
      name: string;
      date?: string;
    }>;
  };
  confidence: number;
}