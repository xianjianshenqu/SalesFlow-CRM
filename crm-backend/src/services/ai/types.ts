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

// ==================== 智能报价与方案生成类型 ====================

// 智能报价输入
export interface SmartQuotationInput {
  customerId: string;
  customerName?: string;
  industry?: string;
  company?: string;
  estimatedValue?: number;
  products?: Array<{
    name: string;
    quantity: number;
    unitPrice?: number;
  }>;
  requirements?: string[];
  budget?: {
    min?: number;
    max?: number;
    currency?: string;
  };
  competitors?: Array<{
    name: string;
    product?: string;
    price?: number;
  }>;
  previousDeals?: Array<{
    value: number;
    products?: string[];
    date: Date;
  }>;
}

// 智能报价结果
export interface SmartQuotationResult {
  recommendedPrice: number;
  priceRange: {
    min: number;
    max: number;
    recommended: number;
  };
  discountStrategy: {
    suggestedDiscount: number;
    reason: string;
    conditions?: string[];
  };
  pricingFactors: Array<{
    factor: string;
    impact: 'increase' | 'decrease' | 'neutral';
    weight: number;
    description: string;
  }>;
  competitorComparison?: Array<{
    competitor: string;
    theirPrice?: number;
    ourAdvantage: string;
  pricePosition: 'higher' | 'lower' | 'similar';
  }>;
  recommendations: Array<{
    type: 'pricing' | 'bundling' | 'discount' | 'upsell';
    suggestion: string;
    expectedImpact: string;
  }>;
  confidence: number;
}

// 方案生成输入
export interface ProposalGenerationInput {
  customerId: string;
  customerName?: string;
  industry?: string;
  company?: string;
  title: string;
  value: number;
  description?: string;
  products?: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
  totalPrice: number;
  }>;
  customerNeeds?: string[];
  painPoints?: string[];
  timeline?: {
    startDate?: string;
    endDate?: string;
  };
}

// 方案生成结果
export interface ProposalGenerationResult {
  executiveSummary: string;
  problemStatement: string;
  proposedSolution: string;
  productRecommendations: Array<{
    name: string;
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    benefit: string;
    priority: 'essential' | 'recommended' | 'optional';
  }>;
  implementationPlan: Array<{
    phase: string;
    duration: string;
    deliverables: string[];
    milestones: string[];
  }>;
  terms: string;
  serviceLevel: {
    responseTime: string;
    supportHours: string;
    warranty: string;
    training: string;
  };
  roiProjection: {
    investment: number;
    expectedReturn: number;
    paybackPeriod: string;
    benefits: string[];
  };
  nextSteps: string[];
}

// ==================== 销售绩效AI教练类型 ====================

// 绩效分析输入
export interface PerformanceAnalysisInput {
  userId: string;
  userName: string;
  period: 'daily' | 'weekly' | 'monthly';
  startDate: Date;
  endDate: Date;
  metrics: {
    calls: number;
    meetings: number;
    visits: number;
    proposals: number;
    closedDeals: number;
    revenue: number;
    opportunities: Array<{
      stage: string;
      value: number;
      lastActivity?: Date;
    }>;
    recordings?: Array<{
      sentiment: string;
      duration: number;
      recordedAt: Date;
    }>;
    tasks?: Array<{
      type: string;
      status: string;
      dueDate: Date;
    }>;
  };
  targets?: {
    revenue?: number;
    deals?: number;
    calls?: number;
    meetings?: number;
  };
  previousPeriodComparison?: {
    revenueChange: number;
    dealsChange: number;
    callsChange: number;
    meetingsChange: number;
  };
}

// 绩效分析结果
export interface PerformanceAnalysisResult {
  overallScore: number; // 0-100
  performanceLevel: 'excellent' | 'good' | 'average' | 'needs_improvement';
  metrics: {
    revenue: {
      actual: number;
      target?: number;
      achievement: number; // percentage
      trend: 'up' | 'down' | 'stable';
    };
    deals: {
      actual: number;
      target?: number;
      achievement: number;
      avgDealSize: number;
    };
    activities: {
      calls: { actual: number; target?: number; efficiency: number };
      meetings: { actual: number; target?: number; efficiency: number };
      visits: { actual: number; target?: number; efficiency: number };
      proposals: { actual: number; conversionRate: number };
    };
  };
  strengths: Array<{
    area: string;
    score: number;
    description: string;
  }>;
  weaknesses: Array<{
    area: string;
    score: number;
    description: string;
    impact: string;
  }>;
  trends: {
    revenueTrend: 'up' | 'down' | 'stable';
    activityTrend: 'up' | 'down' | 'stable';
    conversionTrend: 'up' | 'down' | 'stable';
    predictedNextMonth: {
      revenue: number;
      deals: number;
      confidence: number;
    };
  };
}

// 教练建议输入
export interface CoachingSuggestionInput {
  userId: string;
  performanceAnalysis: PerformanceAnalysisResult;
  recentActivities?: Array<{
    type: string;
    outcome?: string;
    date: Date;
  }>;
  skillAssessment?: {
    communication?: number;
    negotiation?: number;
    product?: number;
    timeManagement?: number;
  };
}

// 教练建议结果
export interface CoachingSuggestionResult {
  suggestions: Array<{
    type: 'performance' | 'skill' | 'opportunity' | 'time_management';
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    actions: Array<{
      step: number;
      action: string;
      expectedOutcome: string;
      timeRequired?: string;
    }>;
    metrics: {
      current: number;
      target: number;
      improvement: number;
    };
    resources?: Array<{
      type: 'article' | 'video' | 'course' | 'mentor';
      title: string;
      url?: string;
    }>;
  }>;
  weeklyPlan: Array<{
    day: string;
    focus: string;
    tasks: string[];
  }>;
  motivationMessage: string;
}

// 技能差距分析结果
export interface SkillGapAnalysisResult {
  skills: Array<{
    name: string;
    currentLevel: number;
    requiredLevel: number;
    gap: number;
    priority: 'high' | 'medium' | 'low';
    improvementActions: string[];
  }>;
  overallGapScore: number;
  recommendedTraining: Array<{
    skill: string;
    resource: string;
    duration: string;
    priority: 'high' | 'medium' | 'low';
  }>;
}

// ==================== 资源智能匹配类型 ====================

// 资源匹配输入
export interface ResourceMatchingInput {
  requestId: string;
  requestType: string;
  title: string;
  description?: string;
  requiredSkills: string[];
  priority: 'high' | 'medium' | 'low';
  dueDate?: Date;
  estimatedDuration?: number; // hours
  location?: string;
  customerId?: string;
  customerIndustry?: string;
}

// 资源信息
export interface ResourceInfo {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  skills: string[];
  experience?: number;
  certifications?: string[];
  status: 'available' | 'busy' | 'offline';
  availability?: string;
  location?: string;
  currentWorkload?: number; // 0-100
  completedRequests?: number;
  successRate?: number;
}

// 资源匹配结果
export interface ResourceMatchingResult {
  matchedResources: Array<{
    resource: ResourceInfo;
    matchScore: number; // 0-100
    matchedSkills: string[];
    missingSkills: string[];
    factors: {
      skillMatch: { score: number; weight: number; details: string };
      experienceMatch: { score: number; weight: number; details: string };
      locationMatch: { score: number; weight: number; details: string };
      workloadFit: { score: number; weight: number; details: string };
      successHistory: { score: number; weight: number; details: string };
    };
    recommendation: 'highly_recommended' | 'recommended' | 'acceptable' | 'not_recommended';
    availabilityWindow?: {
      availableFrom: Date;
      availableUntil?: Date;
    };
  }>;
  bestMatch: {
    resourceId: string;
    confidence: number;
    reason: string;
  };
  alternatives: Array<{
    resourceId: string;
    score: number;
    tradeoffs: string;
  }>;
  recommendations: string[];
}

// 分配建议输入
export interface AssignmentRecommendationInput {
  requestId: string;
  matchedResources: ResourceMatchingResult['matchedResources'];
  urgencyLevel: 'urgent' | 'high' | 'normal' | 'low';
}

// 分配建议结果
export interface AssignmentRecommendationResult {
  recommendedResourceId: string;
  confidence: number;
  reasoning: string;
  alternativeOptions: Array<{
    resourceId: string;
    scenario: string;
    conditions: string[];
  }>;
  riskAssessment: {
    level: 'low' | 'medium' | 'high';
    factors: string[];
    mitigations: string[];
  };
  suggestedTerms: {
    estimatedStartDate: Date;
    estimatedDuration: number;
    handoffNotes: string;
  };
}