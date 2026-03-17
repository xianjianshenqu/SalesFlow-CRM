# CRM系统AI功能增强开发计划

## 一、项目概述

### 1.1 项目目标
在现有CRM系统基础上，接入AI能力辅助销售人员提升销售流程效率和决策质量。

### 1.2 技术架构
- **前端**: React + TypeScript + Zustand + Vite
- **后端**: Node.js + Express + Prisma
- **数据库**: MySQL
- **AI服务**: 腾讯云混元大模型（已有基础封装）

### 1.3 开发周期
总计 **8周**，分3个阶段实施

---

## 二、阶段一：快速见效（第1-2周）

### 功能2.1：智能跟进提醒与话术建议

#### 数据库变更
```prisma
// 新增：跟进建议表
model FollowUpSuggestion {
  id          String   @id @default(uuid())
  customerId  String
  type        String   // call, visit, email, wechat
  priority    String   // high, medium, low
  reason      String   @db.Text
  suggestedAt DateTime @default(now())
  expiresAt   DateTime?
  script      String?  @db.Text  // AI生成的话术
  status      String   @default("pending") // pending, completed, dismissed
  createdAt   DateTime @default(now())
  
  customer Customer @relation(fields: [customerId], references: [id], onDelete: Cascade)
  
  @@index([customerId])
  @@index([status])
  @@map("follow_up_suggestions")
}

// Customer表新增字段
model Customer {
  // ... 现有字段
  lastAnalysisAt DateTime?  // 最后AI分析时间
  riskScore      Int?       // 流失风险评分 0-100
  engagementScore Int?      // 互动活跃度评分 0-100
}
```

#### 后端API设计
| 方法 | 路径 | 描述 |
|-----|------|------|
| GET | `/api/v1/ai/follow-up-suggestions` | 获取跟进建议列表 |
| POST | `/api/v1/ai/follow-up-suggestions/generate` | 为客户生成跟进建议 |
| PATCH | `/api/v1/ai/follow-up-suggestions/:id/status` | 更新建议状态 |
| POST | `/api/v1/ai/scripts/generate` | 生成跟进话术 |

#### 前端组件
- `AIFollowUpWidget.tsx` - 跟进建议小组件
- `ScriptGenerator.tsx` - 话术生成对话框
- 集成到Dashboard和客户详情页

#### 开发任务
| 任务 | 负责模块 | 工时 |
|-----|---------|-----|
| 数据库迁移 + Prisma Schema更新 | 后端 | 0.5天 |
| AI分析服务扩展（跟进时机分析） | 后端 | 1天 |
| 跟进建议API开发 | 后端 | 1天 |
| 话术生成API开发 | 后端 | 0.5天 |
| 前端跟进建议组件 | 前端 | 1天 |
| 话术生成对话框 | 前端 | 0.5天 |
| Dashboard集成 | 前端 | 0.5天 |

---

### 功能2.2：智能日报/周报生成

#### 数据库变更
```prisma
model DailyReport {
  id          String   @id @default(uuid())
  userId      String
  date        DateTime @db.Date
  type        String   // daily, weekly
  content     String   @db.Text
  summary     String   @db.Text
  highlights  Json?    // 重点事项[]
  risks       Json?    // 风险提示[]
  nextActions Json?    // 下一步行动[]
  createdAt   DateTime @default(now())
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([userId, date, type])
  @@map("daily_reports")
}
```

#### 后端API设计
| 方法 | 路径 | 描述 |
|-----|------|------|
| POST | `/api/v1/ai/reports/generate` | 生成日报/周报 |
| GET | `/api/v1/ai/reports` | 获取报告列表 |
| GET | `/api/v1/ai/reports/:id` | 获取报告详情 |
| PUT | `/api/v1/ai/reports/:id` | 更新报告内容 |

#### 前端组件
- `AIReportGenerator.tsx` - 报告生成页面
- `ReportPreview.tsx` - 报告预览组件

#### 开发任务
| 任务 | 负责模块 | 工时 |
|-----|---------|-----|
| 数据库迁移 | 后端 | 0.5天 |
| 报告生成服务（数据汇总+AI生成） | 后端 | 1.5天 |
| 报告API开发 | 后端 | 1天 |
| 前端报告生成页面 | 前端 | 1天 |
| 报告预览与编辑 | 前端 | 0.5天 |

---

## 三、阶段二：核心价值（第3-5周）

### 功能3.1：智能商机评分与预测

#### 数据库变更
```prisma
model OpportunityScore {
  id              String   @id @default(uuid())
  opportunityId   String   @unique
  overallScore    Int      // 总评分 0-100
  winProbability  Int      // 成交概率 0-100
  
  // 维度评分
  engagementScore Int      // 互动活跃度
  budgetScore     Int      // 预算匹配度
  authorityScore  Int      // 决策人接触度
  needScore       Int      // 需求明确度
  timingScore     Int      // 时机成熟度
  
  // 分析依据
  factors         Json?    // 评分因子[]
  riskFactors     Json?    // 风险因素[]
  recommendations Json?    // 改进建议[]
  
  analyzedAt      DateTime @default(now())
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  opportunity Opportunity @relation(fields: [opportunityId], references: [id], onDelete: Cascade)
  
  @@map("opportunity_scores")
}

// Opportunity表扩展
model Opportunity {
  // ... 现有字段
  scoreId       String?
  score         OpportunityScore?
}
```

#### 后端API设计
| 方法 | 路径 | 描述 |
|-----|------|------|
| POST | `/api/v1/ai/opportunities/:id/score` | 分析商机评分 |
| GET | `/api/v1/ai/opportunities/:id/score` | 获取评分结果 |
| POST | `/api/v1/ai/opportunities/batch-score` | 批量评分 |
| GET | `/api/v1/ai/opportunities/predictions` | 预测成交商机列表 |

#### 前端组件
- `OpportunityScoreCard.tsx` - 商机评分卡片
- `ScoreBreakdown.tsx` - 评分详情分解
- `PredictionList.tsx` - 预测列表

#### 开发任务
| 任务 | 负责模块 | 工时 |
|-----|---------|-----|
| 数据库迁移 | 后端 | 0.5天 |
| 商机评分算法设计与实现 | 后端 | 2天 |
| 批量评分任务调度 | 后端 | 1天 |
| 评分API开发 | 后端 | 1天 |
| 前端评分卡片组件 | 前端 | 1天 |
| 评分详情组件 | 前端 | 1天 |
| 销售漏斗集成 | 前端 | 0.5天 |

---

### 功能3.2：客户流失预警

#### 数据库变更
```prisma
model ChurnAlert {
  id          String   @id @default(uuid())
  customerId  String
  riskLevel   String   // high, medium, low
  riskScore   Int      // 0-100
  reasons     Json?    // 流失原因[]
  signals     Json?    // 预警信号[]
  suggestions Json?    // 挽回建议[]
  status      String   @default("active") // active, handled, ignored
  handledAt   DateTime?
  handledBy   String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  customer Customer @relation(fields: [customerId], references: [id], onDelete: Cascade)
  
  @@index([customerId])
  @@index([riskLevel])
  @@index([status])
  @@map("churn_alerts")
}
```

#### 后端API设计
| 方法 | 路径 | 描述 |
|-----|------|------|
| GET | `/api/v1/ai/churn-alerts` | 获取流失预警列表 |
| POST | `/api/v1/ai/churn-alerts/analyze` | 分析客户流失风险 |
| PATCH | `/api/v1/ai/churn-alerts/:id/handle` | 处理预警 |
| GET | `/api/v1/ai/churn-alerts/stats` | 预警统计 |

#### 前端组件
- `ChurnAlertPanel.tsx` - 流失预警面板
- `CustomerRiskBadge.tsx` - 风险标签
- `RetentionPlanDialog.tsx` - 挽回计划对话框

#### 开发任务
| 任务 | 负责模块 | 工时 |
|-----|---------|-----|
| 数据库迁移 | 后端 | 0.5天 |
| 流失风险分析算法 | 后端 | 2天 |
| 预警API开发 | 后端 | 1天 |
| 前端预警面板 | 前端 | 1.5天 |
| 客户详情页集成 | 前端 | 0.5天 |

---

### 功能3.3：智能客户画像补充

#### 数据库变更
```prisma
model CustomerInsight {
  id          String   @id @default(uuid())
  customerId  String   @unique
  extractedNeeds    Json?    // 提取的需求[]
  extractedBudget   Json?    // 预算信息
  decisionMakers    Json?    // 决策人信息[]
  painPoints        Json?    // 痛点[]
  competitorInfo    Json?    // 竞品信息
  timeline          Json?    // 时间线
  confidence        Int      @default(0) // 置信度
  source            String   @default("ai_analysis")
  analyzedAt        DateTime @default(now())
  createdAt         DateTime @default(now())
  
  customer Customer @relation(fields: [customerId], references: [id], onDelete: Cascade)
  
  @@map("customer_insights")
}
```

#### 开发任务
| 任务 | 负责模块 | 工时 |
|-----|---------|-----|
| 数据库迁移 | 后端 | 0.5天 |
| 录音内容分析服务扩展 | 后端 | 1.5天 |
| 画像提取API | 后端 | 1天 |
| 前端画像展示组件 | 前端 | 1.5天 |

---

## 四、阶段三：全面赋能（第6-8周）

### 功能4.1：智能报价与方案建议

#### 数据库变更
```prisma
model PricingSuggestion {
  id              String   @id @default(uuid())
  opportunityId   String
  suggestedPrice  Decimal  @db.Decimal(15, 2)
  priceRange      Json?    // { min, max }
  confidence      Int
  factors         Json?    // 定价因子
  comparableDeals Json?    // 类似成交案例
  strategy        String?  @db.Text
  createdAt       DateTime @default(now())
  
  opportunity Opportunity @relation(fields: [opportunityId], references: [id], onDelete: Cascade)
  
  @@map("pricing_suggestions")
}

model ProposalTemplate {
  id          String   @id @default(uuid())
  name        String
  industry    String?
  category    String?
  content     String   @db.Text
  variables   Json?    // 可替换变量
  usageCount  Int      @default(0)
  isDefault   Boolean  @default(false)
  createdAt   DateTime @default(now())
  
  @@map("proposal_templates")
}
```

#### 开发任务
| 任务 | 负责模块 | 工时 |
|-----|---------|-----|
| 数据库迁移 | 后端 | 0.5天 |
| 定价建议算法 | 后端 | 2天 |
| 方案模板管理API | 后端 | 1天 |
| 方案生成API | 后端 | 1.5天 |
| 前端定价建议组件 | 前端 | 1天 |
| 方案生成页面 | 前端 | 1.5天 |

---

### 功能4.2：销售绩效AI教练

#### 数据库变更
```prisma
model SalesCoaching {
  id              String   @id @default(uuid())
  userId          String
  period          String   // weekly, monthly
  overallScore    Int
  strengths       Json?    // 优势[]
  improvements    Json?    // 待改进[]
  bestPractices   Json?    // 最佳实践
  comparison      Json?    // 与Top Sales对比
  recommendations Json?    // 改进建议[]
  createdAt       DateTime @default(now())
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("sales_coachings")
}

model TopSalesPattern {
  id              String   @id @default(uuid())
  patternType     String   // opening, objection_handling, closing
  description     String   @db.Text
  examples        Json?    // 示例[]
  effectiveness   Int      // 有效性评分
  usageScenarios  Json?    // 适用场景
  createdAt       DateTime @default(now())
  
  @@map("top_sales_patterns")
}
```

#### 开发任务
| 任务 | 负责模块 | 工时 |
|-----|---------|-----|
| 数据库迁移 | 后端 | 0.5天 |
| 销售行为分析服务 | 后端 | 2天 |
| Top Sales模式提取 | 后端 | 1.5天 |
| 教练建议API | 后端 | 1天 |
| 前端教练面板 | 前端 | 2天 |
| 个人报告页面 | 前端 | 1天 |

---

### 功能4.3：售前资源智能匹配

#### 数据库变更
```prisma
model ResourceMatch {
  id          String   @id @default(uuid())
  requestId   String
  resourceId  String?
  matchScore  Int
  reasons     Json?    // 匹配原因
  alternatives Json?   // 备选资源
  status      String   @default("suggested")
  createdAt   DateTime @default(now())
  
  request PreSalesRequest @relation(fields: [requestId], references: [id], onDelete: Cascade)
  resource PreSalesResource? @relation(fields: [resourceId], references: [id])
  
  @@map("resource_matches")
}
```

#### 开发任务
| 任务 | 负责模块 | 工时 |
|-----|---------|-----|
| 数据库迁移 | 后端 | 0.5天 |
| 资源匹配算法 | 后端 | 1.5天 |
| 匹配API开发 | 后端 | 1天 |
| 前端匹配建议组件 | 前端 | 1天 |

---

## 五、AI服务扩展设计

### 5.1 新增AI服务模块

```
src/services/ai/
├── index.ts              # AI服务入口
├── audioAnalysis.ts      # 音频分析（现有）
├── companyAnalysis.ts    # 企业分析（现有）
├── followUpAnalysis.ts   # 跟进时机分析（新增）
├── opportunityScoring.ts # 商机评分（新增）
├── churnPrediction.ts    # 流失预测（新增）
├── pricingSuggestion.ts  # 定价建议（新增）
├── salesCoaching.ts      # 销售教练（新增）
└── reportGeneration.ts   # 报告生成（新增）
```

### 5.2 AI服务接口设计

```typescript
// 统一AI服务接口
interface AIServiceInterface {
  // 分析类
  analyzeFollowUpTiming(customerId: string): Promise<FollowUpSuggestion>;
  analyzeOpportunityScore(opportunityId: string): Promise<OpportunityScore>;
  analyzeChurnRisk(customerId: string): Promise<ChurnAlert>;
  
  // 生成类
  generateFollowUpScript(context: ScriptContext): Promise<string>;
  generateDailyReport(userId: string, date: Date): Promise<DailyReport>;
  generateProposal(proposalContext: ProposalContext): Promise<string>;
  generatePricingSuggestion(opportunityId: string): Promise<PricingSuggestion>;
  
  // 教练类
  analyzeSalesPerformance(userId: string, period: string): Promise<SalesCoaching>;
  extractBestPractices(recordings: AudioRecording[]): Promise<TopSalesPattern[]>;
}
```

---

## 六、前端组件规划

### 6.1 新增页面

| 路由 | 页面 | 描述 |
|-----|------|------|
| `/ai-assistant` | AI助手中心 | AI功能入口 |
| `/ai-assistant/reports` | 智能报告 | 日报/周报生成 |
| `/ai-assistant/alerts` | 预警中心 | 流失预警管理 |
| `/ai-assistant/coaching` | 销售教练 | 绩效分析 |

### 6.2 新增组件

```
src/components/AI/
├── FollowUpWidget/
│   ├── index.tsx
│   ├── SuggestionCard.tsx
│   └── ScriptDialog.tsx
├── OpportunityScore/
│   ├── index.tsx
│   ├── ScoreCard.tsx
│   └── ScoreBreakdown.tsx
├── ChurnAlert/
│   ├── index.tsx
│   ├── AlertPanel.tsx
│   └── RetentionDialog.tsx
├── ReportGenerator/
│   ├── index.tsx
│   ├── ReportPreview.tsx
│   └── ReportEditor.tsx
├── SalesCoach/
│   ├── index.tsx
│   ├── CoachingPanel.tsx
│   └── PerformanceChart.tsx
└── PricingAdvisor/
    ├── index.tsx
    └── PricingSuggestion.tsx
```

---

## 七、开发时间线

```
Week 1-2: 阶段一 - 快速见效
├── Day 1-2: 智能跟进提醒（后端）
├── Day 3-4: 智能跟进提醒（前端）
├── Day 5-6: 智能日报生成
├── Day 7-8: 集成测试 + Bug修复

Week 3-5: 阶段二 - 核心价值
├── Day 9-12: 商机评分与预测
├── Day 13-16: 客户流失预警
├── Day 17-20: 智能客户画像
├── Day 21-22: 阶段测试

Week 6-8: 阶段三 - 全面赋能
├── Day 23-27: 智能报价与方案
├── Day 28-32: 销售绩效AI教练
├── Day 33-35: 售前资源匹配
├── Day 36-40: 整体测试 + 优化
```

---

## 八、依赖与风险

### 8.1 技术依赖
- 腾讯云混元大模型API（需配置密钥）
- 可选：语音识别ASR服务（如腾讯云实时语音识别）

### 8.2 风险与应对

| 风险 | 影响 | 应对措施 |
|-----|------|---------|
| AI API调用成本过高 | 预算超支 | 实现缓存机制，相似请求复用 |
| AI响应延迟 | 用户体验差 | 异步处理 + 进度提示 |
| 评分准确性不足 | 用户信任度低 | 持续收集反馈，优化模型 |
| 数据质量不佳 | AI分析效果差 | 数据清洗 + 补充录入引导 |

---

## 九、验收标准

### 9.1 功能验收
- [ ] 所有API接口正常响应
- [ ] 前端组件正确渲染和交互
- [ ] AI分析结果合理可解释
- [ ] 数据正确存储和更新

### 9.2 性能验收
- [ ] API响应时间 < 2秒（不含AI调用）
- [ ] AI分析任务完成时间 < 10秒
- [ ] 前端首屏加载 < 3秒

### 9.3 质量验收
- [ ] 代码覆盖率 > 70%
- [ ] 无Critical级别安全漏洞
- [ ] 通过ESLint检查