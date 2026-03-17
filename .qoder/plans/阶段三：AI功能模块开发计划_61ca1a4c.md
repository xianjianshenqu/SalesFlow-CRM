# 阶段三：AI功能模块开发计划

## 一、智能报价与方案生成功能

### 1.1 新建服务文件
**文件**: `crm-backend/src/services/ai/proposalAI.ts`

核心功能：
- `generateSmartQuotation()`: 基于客户信息、历史数据、市场行情生成智能报价
- `generateProposalContent()`: AI生成方案内容（产品推荐、条款、服务承诺）
- `analyzeCompetitorPricing()`: 竞品价格分析
- `calculateDiscountStrategy()`: 折扣策略建议

关键算法：
- 客户价值评估：结合客户规模、行业、历史合作
- 价格弹性分析：基于客户敏感度调整报价策略
- 产品组合推荐：根据需求匹配最优产品组合

### 1.2 扩展Proposal服务
**文件**: `crm-backend/src/services/proposal.service.ts`

新增方法：
- `generateSmartProposal()`: 调用AI生成完整方案
- `getRecommendedProducts()`: 获取推荐产品组合
- `getPricingStrategy()`: 获取定价策略建议

### 1.3 新增API路由
**文件**: `crm-backend/src/routes/proposals.routes.ts`

- `POST /proposals/:id/smart-generate`: 智能生成完整方案
- `GET /proposals/:id/pricing-strategy`: 获取定价策略
- `POST /proposals/:id/recommend-products`: 推荐产品组合

---

## 二、销售绩效AI教练系统

### 2.1 数据库模型扩展
**文件**: `crm-backend/prisma/schema.prisma`

新增模型：
```prisma
// 销售绩效记录
model SalesPerformance {
  id              String   @id @default(uuid())
  userId          String
  date            DateTime @db.Date
  calls           Int      @default(0)
  meetings        Int      @default(0)
  visits          Int      @default(0)
  proposals       Int      @default(0)
  closedDeals     Int      @default(0)
  revenue         Decimal  @default(0) @db.Decimal(15, 2)
  conversionRate  Float?
  avgDealSize     Decimal? @db.Decimal(15, 2)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([userId, date])
  @@map("sales_performances")
}

// AI教练建议
model CoachingSuggestion {
  id          String   @id @default(uuid())
  userId      String
  type        String   // performance, skill, opportunity, time_management
  priority    String   // high, medium, low
  title       String
  description String   @db.Text
  actions     Json?    // 建议行动[]
  metrics     Json?    // 相关指标
  status      String   @default("pending") // pending, completed, dismissed
  createdAt   DateTime @default(now())
  expiresAt   DateTime?
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([type])
  @@map("coaching_suggestions")
}
```

### 2.2 新建AI教练服务
**文件**: `crm-backend/src/services/ai/salesCoach.ts`

核心功能：
- `analyzePerformance()`: 销售数据分析与绩效评估
- `generateCoachingSuggestions()`: 生成个性化改进建议
- `identifySkillGaps()`: 识别技能差距
- `predictPerformanceTrend()`: 预测绩效趋势
- `generateActionPlan()`: 生成行动计划

### 2.3 新建绩效服务
**文件**: `crm-backend/src/services/performance.service.ts`

功能：
- 记录和查询销售绩效数据
- 计算绩效指标和排名
- 生成绩效报告

### 2.4 新建API路由
**文件**: `crm-backend/src/routes/performance.routes.ts`

- `GET /performance/dashboard`: 获取绩效仪表盘
- `GET /performance/coaching`: 获取AI教练建议
- `POST /performance/coaching/:id/complete`: 标记建议完成
- `GET /performance/trends`: 获取绩效趋势分析
- `POST /performance/record`: 记录绩效数据

---

## 三、售前资源智能匹配功能

### 3.1 新建资源匹配AI服务
**文件**: `crm-backend/src/services/ai/resourceMatching.ts`

核心算法：
- `calculateMatchScore()`: 多维度匹配评分
  - 技能匹配度 (40%)
  - 经验匹配度 (20%)
  - 地理位置匹配 (15%)
  - 工作负载评估 (15%)
  - 历史成功率 (10%)

- `findOptimalAssignment()`: 最优分配算法
- `predictResourceAvailability()`: 预测资源可用性
- `generateAssignmentRecommendation()`: 生成分配建议

### 3.2 扩展Presales服务
**文件**: `crm-backend/src/services/presales.service.ts`

新增方法：
- `smartMatchResources()`: 智能资源匹配
- `autoAssignResource()`: 自动分配资源
- `getResourceWorkload()`: 获取资源工作负载
- `optimizeResourceAllocation()`: 优化资源分配

### 3.3 数据库模型扩展
**文件**: `crm-backend/prisma/schema.prisma`

新增模型：
```prisma
// 资源匹配记录
model ResourceMatchRecord {
  id              String   @id @default(uuid())
  requestId       String
  resourceId      String
  matchScore      Float
  matchedSkills   Json?    // 匹配的技能[]
  missingSkills   Json?    // 缺失的技能[]
  aiRecommendation Boolean @default(false)
  factors         Json?    // 匹配因子详情
  createdAt       DateTime @default(now())
  
  request PreSalesRequest @relation(fields: [requestId], references: [id], onDelete: Cascade)
  resource PreSalesResource @relation(fields: [resourceId], references: [id], onDelete: Cascade)
  
  @@map("resource_match_records")
}
```

### 3.4 新增API路由
**文件**: `crm-backend/src/routes/presales.routes.ts`

- `GET /presales/requests/:id/smart-match`: AI智能匹配
- `POST /presales/requests/:id/auto-assign`: 自动分配资源
- `GET /presales/resources/workload`: 获取资源负载概览

---

## 四、类型定义与验证器

### 4.1 AI服务类型
**文件**: `crm-backend/src/services/ai/types.ts`

新增类型：
- `SmartQuotationInput/Result`: 智能报价
- `ProposalGenerationInput/Result`: 方案生成
- `PerformanceAnalysisInput/Result`: 绩效分析
- `CoachingSuggestionInput/Result`: 教练建议
- `ResourceMatchingInput/Result`: 资源匹配

### 4.2 验证器
**文件**: `crm-backend/src/validators/performance.validator.ts`

---

## 五、数据库迁移

执行命令：
```bash
npx prisma migrate dev --name add_sales_performance_and_coaching
```

---

## 六、单元测试

### 6.1 测试文件
- `tests/services/proposalAI.test.ts`: 智能报价测试
- `tests/services/salesCoach.test.ts`: 销售教练测试
- `tests/services/resourceMatching.test.ts`: 资源匹配测试
- `tests/services/performance.test.ts`: 绩效服务测试

---

## 七、执行顺序

1. 扩展Prisma Schema，添加新数据模型
2. 执行数据库迁移
3. 更新 `src/services/ai/types.ts`，添加新类型定义
4. 创建 `src/services/ai/proposalAI.ts`（智能报价与方案生成）
5. 创建 `src/services/ai/salesCoach.ts`（销售绩效AI教练）
6. 创建 `src/services/ai/resourceMatching.ts`（资源智能匹配）
7. 更新 `src/services/ai/index.ts`，导出新服务
8. 创建 `src/services/performance.service.ts`（绩效服务）
9. 扩展 `src/services/proposal.service.ts`，集成AI功能
10. 扩展 `src/services/presales.service.ts`，增强匹配功能
11. 创建 `src/validators/performance.validator.ts`
12. 创建 `src/routes/performance.routes.ts`
13. 更新 `src/routes/proposals.routes.ts`，添加新路由
14. 更新 `src/routes/presales.routes.ts`，添加新路由
15. 更新 `src/routes/index.ts`，注册新路由
16. 编写单元测试

---

## 八、文件变更清单

| 操作 | 文件路径 |
|------|---------|
| 修改 | `prisma/schema.prisma` |
| 修改 | `src/services/ai/types.ts` |
| 新建 | `src/services/ai/proposalAI.ts` |
| 新建 | `src/services/ai/salesCoach.ts` |
| 新建 | `src/services/ai/resourceMatching.ts` |
| 修改 | `src/services/ai/index.ts` |
| 新建 | `src/services/performance.service.ts` |
| 修改 | `src/services/proposal.service.ts` |
| 修改 | `src/services/presales.service.ts` |
| 新建 | `src/validators/performance.validator.ts` |
| 新建 | `src/routes/performance.routes.ts` |
| 修改 | `src/routes/proposals.routes.ts` |
| 修改 | `src/routes/presales.routes.ts` |
| 修改 | `src/routes/index.ts` |
| 新建 | `tests/services/proposalAI.test.ts` |
| 新建 | `tests/services/salesCoach.test.ts` |
| 新建 | `tests/services/resourceMatching.test.ts` |