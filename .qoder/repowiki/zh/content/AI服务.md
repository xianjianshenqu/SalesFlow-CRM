# AI服务

<cite>
**本文档引用的文件**
- [ai.controller.ts](file://crm-backend/src/controllers/ai.controller.ts)
- [ai.routes.ts](file://crm-backend/src/routes/ai.routes.ts)
- [ai.service.ts](file://crm-backend/src/services/ai.service.ts)
- [ai/index.ts](file://crm-backend/src/services/ai/index.ts)
- [ai/types.ts](file://crm-backend/src/services/ai/types.ts)
- [followUpAnalysis.ts](file://crm-backend/src/services/ai/followUpAnalysis.ts)
- [reportGeneration.ts](file://crm-backend/src/services/ai/reportGeneration.ts)
- [opportunityScoring.ts](file://crm-backend/src/services/ai/opportunityScoring.ts)
- [churnAnalysis.ts](file://crm-backend/src/services/ai/churnAnalysis.ts)
- [customerInsight.ts](file://crm-backend/src/services/ai/customerInsight.ts)
- [aiService.ts](file://crm-frontend/src/services/aiService.ts)
- [FollowUpWidget.tsx](file://crm-frontend/src/components/AI/FollowUpWidget.tsx)
- [ScriptGenerator.tsx](file://crm-frontend/src/components/AI/ScriptGenerator.tsx)
- [OpportunityScoreCard.tsx](file://crm-frontend/src/components/AI/OpportunityScoreCard.tsx)
- [index.ts](file://crm-frontend/src/components/AI/index.ts)
- [schema.prisma](file://crm-backend/prisma/schema.prisma)
</cite>

## 目录
1. [项目概述](#项目概述)
2. [项目结构](#项目结构)
3. [核心组件](#核心组件)
4. [架构概览](#架构概览)
5. [详细组件分析](#详细组件分析)
6. [依赖关系分析](#依赖关系分析)
7. [性能考虑](#性能考虑)
8. [故障排除指南](#故障排除指南)
9. [结论](#结论)

## 项目概述

销售AI CRM系统是一个集成人工智能技术的客户关系管理系统，专注于为企业销售团队提供智能化的客户管理和销售辅助功能。该系统通过AI技术分析客户互动数据，提供智能的销售建议、商机评分、流失预警和客户洞察等功能。

系统采用前后端分离架构，后端使用Node.js + Express构建RESTful API，前端使用React + TypeScript开发用户界面。AI功能通过阿里云百炼Qwen模型实现，支持多种销售场景的智能化处理。

## 项目结构

系统采用模块化的项目结构，主要分为以下几个核心部分：

```mermaid
graph TB
subgraph "后端架构"
A[Controllers 控制器层]
B[Services 服务层]
C[AI Services AI服务]
D[Database 数据库]
end
subgraph "前端架构"
E[Components 组件层]
F[Services API服务]
G[Types 类型定义]
end
subgraph "AI功能"
H[语音分析]
I[文本分析]
J[机器学习]
K[自然语言处理]
end
A --> B
B --> C
C --> H
C --> I
C --> J
C --> K
B --> D
E --> F
F --> A
```

**图表来源**
- [ai.controller.ts:1-800](file://crm-backend/src/controllers/ai.controller.ts#L1-L800)
- [ai.routes.ts:1-98](file://crm-backend/src/routes/ai.routes.ts#L1-L98)

**章节来源**
- [ai.controller.ts:1-800](file://crm-backend/src/controllers/ai.controller.ts#L1-L800)
- [ai.routes.ts:1-98](file://crm-backend/src/routes/ai.routes.ts#L1-L98)

## 核心组件

### AI服务架构

系统的核心AI服务采用模块化设计，每个AI功能都有独立的服务类和控制器：

```mermaid
classDiagram
class AIService {
+analyzeRecording(audioUrl, duration, customerInfo)
+transcribeAudio(audioUrl)
+analyzeSentiment(text)
+extractKeywords(text)
+generateSummary(text, keywords)
+analyzeCompany(companyName, imageUrl, options)
}
class FollowUpAnalysisService {
+analyzeFollowUpTiming(input)
+generateScript(input)
}
class ReportGenerationService {
+generateReport(input)
}
class OpportunityScoringService {
+analyzeOpportunity(input)
+predictWinProbability(input)
}
class ChurnAnalysisService {
+analyzeChurnRisk(input)
}
class CustomerInsightService {
+extractCustomerInsights(input)
}
AIService --> FollowUpAnalysisService
AIService --> ReportGenerationService
AIService --> OpportunityScoringService
AIService --> ChurnAnalysisService
AIService --> CustomerInsightService
```

**图表来源**
- [ai.service.ts:75-734](file://crm-backend/src/services/ai.service.ts#L75-L734)
- [followUpAnalysis.ts:22-480](file://crm-backend/src/services/ai/followUpAnalysis.ts#L22-L480)
- [reportGeneration.ts:17-379](file://crm-backend/src/services/ai/reportGeneration.ts#L17-L379)
- [opportunityScoring.ts:42-613](file://crm-backend/src/services/ai/opportunityScoring.ts#L42-L613)
- [churnAnalysis.ts:28-517](file://crm-backend/src/services/ai/churnAnalysis.ts#L28-L517)
- [customerInsight.ts:35-548](file://crm-backend/src/services/ai/customerInsight.ts#L35-L548)

### 数据模型设计

系统使用Prisma ORM管理数据库，AI相关的核心数据模型包括：

| 模型名称 | 描述 | 主要字段 |
|---------|------|----------|
| FollowUpSuggestion | 跟进建议 | customerId, type, priority, reason, status |
| DailyReport | 日报/周报 | userId, date, type, content, summary |
| OpportunityScore | 商机评分 | opportunityId, overallScore, winProbability |
| ChurnAlert | 流失预警 | customerId, riskLevel, riskScore, status |
| CustomerInsight | 客户洞察 | customerId, extractedNeeds, confidence |

**章节来源**
- [schema.prisma:627-740](file://crm-backend/prisma/schema.prisma#L627-L740)

## 架构概览

系统采用分层架构设计，确保AI功能与业务逻辑的解耦：

```mermaid
graph TD
subgraph "表现层"
A[React前端组件]
B[用户界面]
end
subgraph "API层"
C[Express路由]
D[控制器]
E[中间件]
end
subgraph "业务逻辑层"
F[AI服务]
G[业务服务]
H[数据访问层]
end
subgraph "数据层"
I[MySQL数据库]
J[AI模型API]
end
A --> C
C --> D
D --> F
F --> H
H --> I
F --> J
```

**图表来源**
- [ai.routes.ts:30-98](file://crm-backend/src/routes/ai.routes.ts#L30-L98)
- [ai.controller.ts:1-800](file://crm-backend/src/controllers/ai.controller.ts#L1-L800)

### API接口设计

系统提供RESTful API接口，支持以下主要功能：

| 功能模块 | HTTP方法 | 路径 | 描述 |
|---------|----------|------|------|
| 跟进建议 | GET | `/ai/follow-up-suggestions` | 获取跟进建议列表 |
| 跟进建议 | POST | `/ai/follow-up-suggestions/generate` | 为客户生成跟进建议 |
| 话术生成 | POST | `/ai/scripts/generate` | 生成跟进话术 |
| 商机评分 | POST | `/ai/opportunities/:id/score` | 计算商机评分 |
| 流失预警 | POST | `/ai/customers/:id/churn-analysis` | 分析客户流失风险 |
| 客户洞察 | POST | `/ai/customers/:id/insights` | 生成客户洞察 |

**章节来源**
- [ai.routes.ts:35-98](file://crm-backend/src/routes/ai.routes.ts#L35-L98)

## 详细组件分析

### 跟进时机分析服务

跟进时机分析服务是AI系统的核心功能之一，通过分析客户互动数据提供智能化的跟进建议：

```mermaid
sequenceDiagram
participant Client as 客户端
participant Controller as 控制器
participant Service as 跟进分析服务
participant AI as AI模型
participant DB as 数据库
Client->>Controller : POST /ai/follow-up-suggestions/generate
Controller->>Service : analyzeFollowUpTiming(input)
Service->>Service : 分析客户数据
alt AI模型可用
Service->>AI : 调用AI API
AI-->>Service : 返回分析结果
else AI模型不可用
Service->>Service : 使用模拟算法
Service-->>Service : 生成模拟结果
end
Service->>DB : 保存建议到数据库
DB-->>Service : 保存成功
Service-->>Controller : 返回建议结果
Controller-->>Client : 返回JSON响应
```

**图表来源**
- [followUpAnalysis.ts:26-118](file://crm-backend/src/services/ai/followUpAnalysis.ts#L26-L118)
- [ai.controller.ts:83-197](file://crm-backend/src/controllers/ai.controller.ts#L83-L197)

#### 核心算法分析

跟进时机分析采用多维度评分算法：

1. **时间分析**：计算距离上次联系的天数
2. **情感分析**：分析通话录音中的情感倾向
3. **商机状态**：评估活跃商机的价值和阶段
4. **任务跟踪**：监控待办任务的完成情况

**章节来源**
- [followUpAnalysis.ts:176-260](file://crm-backend/src/services/ai/followUpAnalysis.ts#L176-L260)

### 商机评分服务

商机评分服务基于BANT模型（Budget Authority Need Timing）进行综合评估：

```mermaid
flowchart TD
A[开始评分] --> B[收集客户数据]
B --> C[计算互动活跃度]
C --> D[评估预算匹配度]
D --> E[分析决策人接触度]
E --> F[评估需求明确度]
F --> G[分析时机成熟度]
G --> H[计算加权总分]
H --> I[生成成交概率]
I --> J[识别风险因素]
J --> K[生成改进建议]
K --> L[保存评分结果]
L --> M[结束]
```

**图表来源**
- [opportunityScoring.ts:46-105](file://crm-backend/src/services/ai/opportunityScoring.ts#L46-L105)

#### 评分维度详解

| 维度 | 权重 | 评估指标 | 评分范围 |
|------|------|----------|----------|
| 互动活跃度 | 20% | 联系频率、活动参与度 | 0-100 |
| 预算匹配度 | 25% | 商机价值、预算充足性 | 0-100 |
| 决策人接触度 | 20% | 决策层接触、影响力 | 0-100 |
| 需求明确度 | 20% | 需求表达、痛点清晰度 | 0-100 |
| 时机成熟度 | 15% | 成交时间、项目进度 | 0-100 |

**章节来源**
- [opportunityScoring.ts:11-41](file://crm-backend/src/services/ai/opportunityScoring.ts#L11-L41)

### 流失预警服务

流失预警服务通过实时监控客户行为模式，提前识别潜在的客户流失风险：

```mermaid
stateDiagram-v2
[*] --> 正常状态
正常状态 --> 监控中 : 定期检查
监控中 --> 风险预警 : 风险分数>40
监控中 --> 正常状态 : 风险分数<=40
风险预警 --> 处理中 : 人工干预
处理中 --> 正常状态 : 成功挽留
处理中 --> 流失 : 无法挽留
流失 --> [*]
正常状态 --> [*]
```

**图表来源**
- [churnAnalysis.ts:32-65](file://crm-backend/src/services/ai/churnAnalysis.ts#L32-L65)

#### 风险因子分析

系统监控以下关键风险因子：

1. **联系频率下降**：最近联系间隔超过阈值
2. **情感转冷**：通话录音中负面情感增加
3. **商机停滞**：项目推进超过预期时间
4. **任务积压**：跟进任务未按时完成
5. **决策人缺失**：关键决策人未接触

**章节来源**
- [churnAnalysis.ts:115-124](file://crm-backend/src/services/ai/churnAnalysis.ts#L115-L124)

### 客户洞察服务

客户洞察服务从多维度分析客户数据，提取关键的业务洞察：

```mermaid
graph LR
A[原始数据] --> B[需求提取]
A --> C[痛点识别]
A --> D[决策人分析]
A --> E[竞品分析]
A --> F[预算分析]
B --> G[需求优先级]
C --> H[痛点严重程度]
D --> I[影响力评估]
E --> J[竞品优势]
F --> K[预算范围]
G --> L[洞察报告]
H --> L
I --> L
J --> L
K --> L
```

**图表来源**
- [customerInsight.ts:39-75](file://crm-backend/src/services/ai/customerInsight.ts#L39-L75)

#### 洞察提取算法

系统使用关键词匹配和模式识别技术：

1. **需求识别**：基于预定义的关键字库匹配
2. **痛点分析**：通过情感分析和上下文理解
3. **决策人评估**：结合角色和备注信息
4. **竞品分析**：自动识别竞品提及和比较
5. **预算估算**：通过模式匹配提取预算信息

**章节来源**
- [customerInsight.ts:210-246](file://crm-backend/src/services/ai/customerInsight.ts#L210-L246)

### 前端AI组件

前端提供了丰富的AI功能组件，支持用户交互和可视化展示：

#### 跟进建议小组件

```mermaid
classDiagram
class FollowUpWidget {
+suggestions : FollowUpSuggestion[]
+loading : boolean
+error : string
+fetchSuggestions()
+handleStatusChange(id, status)
}
class ScriptGenerator {
+isOpen : boolean
+contactType : string
+purpose : string
+generateScript()
+copyToClipboard()
}
class OpportunityScoreCard {
+score : OpportunityScore
+loading : boolean
+activeTab : string
+fetchScore()
}
FollowUpWidget --> aiService
ScriptGenerator --> aiService
OpportunityScoreCard --> aiService
```

**图表来源**
- [FollowUpWidget.tsx:61-210](file://crm-frontend/src/components/AI/FollowUpWidget.tsx#L61-L210)
- [ScriptGenerator.tsx:37-272](file://crm-frontend/src/components/AI/ScriptGenerator.tsx#L37-L272)
- [OpportunityScoreCard.tsx:54-336](file://crm-frontend/src/components/AI/OpportunityScoreCard.tsx#L54-L336)

**章节来源**
- [FollowUpWidget.tsx:1-210](file://crm-frontend/src/components/AI/FollowUpWidget.tsx#L1-L210)
- [ScriptGenerator.tsx:1-272](file://crm-frontend/src/components/AI/ScriptGenerator.tsx#L1-L272)
- [OpportunityScoreCard.tsx:1-336](file://crm-frontend/src/components/AI/OpportunityScoreCard.tsx#L1-L336)

## 依赖关系分析

系统采用模块化设计，各组件之间的依赖关系清晰：

```mermaid
graph TB
subgraph "AI服务层"
A[ai.service.ts]
B[followUpAnalysis.ts]
C[reportGeneration.ts]
D[opportunityScoring.ts]
E[churnAnalysis.ts]
F[customerInsight.ts]
end
subgraph "控制器层"
G[ai.controller.ts]
end
subgraph "路由层"
H[ai.routes.ts]
end
subgraph "前端组件"
I[FollowUpWidget.tsx]
J[ScriptGenerator.tsx]
K[OpportunityScoreCard.tsx]
end
subgraph "API服务"
L[aiService.ts]
end
A --> B
A --> C
A --> D
A --> E
A --> F
G --> A
H --> G
I --> L
J --> L
K --> L
```

**图表来源**
- [ai/index.ts:43-66](file://crm-backend/src/services/ai/index.ts#L43-L66)
- [ai.controller.ts:8-14](file://crm-backend/src/controllers/ai.controller.ts#L8-L14)

### 外部依赖

系统主要依赖以下外部服务：

| 依赖项 | 版本 | 用途 | 配置要求 |
|--------|------|------|----------|
| Node.js | >= 16.0.0 | 运行时环境 | 必需 |
| Express | ^4.18.0 | Web框架 | 必需 |
| Prisma | ^4.0.0 | ORM框架 | 必需 |
| MySQL | ^8.0 | 数据存储 | 必需 |
| Alibaba Cloud Qwen | ^1.0 | AI模型 | 可选 |
| Serper API | ^1.0 | 网络搜索 | 可选 |

**章节来源**
- [ai.service.ts:1-10](file://crm-backend/src/services/ai.service.ts#L1-L10)

## 性能考虑

### AI模型调用优化

系统实现了智能的AI模型调用策略：

1. **降级机制**：当AI模型不可用时自动切换到模拟算法
2. **缓存策略**：对常用分析结果进行缓存
3. **批量处理**：支持批量AI分析请求
4. **异步处理**：长耗时的AI分析采用异步处理

### 数据库优化

```mermaid
flowchart TD
A[查询请求] --> B{是否命中缓存}
B --> |是| C[返回缓存数据]
B --> |否| D[查询数据库]
D --> E[分析数据]
E --> F[生成响应]
F --> G[更新缓存]
G --> H[返回响应]
```

**图表来源**
- [ai.service.ts:82-100](file://crm-backend/src/services/ai.service.ts#L82-L100)

### 前端性能优化

前端组件实现了以下性能优化：

1. **懒加载**：AI组件按需加载
2. **虚拟滚动**：大量数据的高效渲染
3. **防抖节流**：API调用的频率控制
4. **状态缓存**：组件状态的本地缓存

## 故障排除指南

### 常见问题及解决方案

#### AI模型调用失败

**问题症状**：AI分析功能不可用，返回错误信息

**可能原因**：
1. AI模型API密钥配置错误
2. 网络连接问题
3. API服务不可用

**解决方案**：
1. 检查环境变量配置
2. 验证网络连接
3. 查看API服务状态

#### 数据库连接失败

**问题症状**：系统无法连接到数据库

**可能原因**：
1. 数据库服务器宕机
2. 连接参数错误
3. 权限配置问题

**解决方案**：
1. 检查数据库服务状态
2. 验证连接字符串
3. 确认用户权限

#### 前端组件加载失败

**问题症状**：AI组件无法正常显示

**可能原因**：
1. API接口调用失败
2. 认证令牌过期
3. 网络请求超时

**解决方案**：
1. 检查API接口状态
2. 刷新认证令牌
3. 增加请求超时时间

**章节来源**
- [ai.service.ts:82-100](file://crm-backend/src/services/ai.service.ts#L82-L100)
- [ai.controller.ts:1-800](file://crm-backend/src/controllers/ai.controller.ts#L1-L800)

## 结论

销售AI CRM系统通过集成先进的AI技术，为企业销售团队提供了智能化的客户管理解决方案。系统采用模块化架构设计，具有良好的可扩展性和维护性。

### 主要优势

1. **功能完整性**：涵盖销售全流程的AI辅助功能
2. **技术先进性**：采用最新的AI模型和算法
3. **用户体验**：直观易用的前端界面设计
4. **系统稳定性**：完善的错误处理和降级机制

### 发展方向

1. **AI模型优化**：持续改进AI分析准确性
2. **功能扩展**：增加更多AI辅助功能
3. **性能优化**：提升系统响应速度
4. **集成能力**：支持更多第三方服务集成

该系统为企业数字化转型提供了强有力的技术支撑，有助于提升销售效率和客户满意度。