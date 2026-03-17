# AI音频分析

<cite>
**本文档引用的文件**
- [ai.service.ts](file://crm-backend/src/services/ai.service.ts)
- [opportunityScoring.ts](file://crm-backend/src/services/ai/opportunityScoring.ts)
- [churnAnalysis.ts](file://crm-backend/src/services/ai/churnAnalysis.ts)
- [reportGeneration.ts](file://crm-backend/src/services/ai/reportGeneration.ts)
- [resourceMatching.ts](file://crm-backend/src/services/ai/resourceMatching.ts)
- [salesCoach.ts](file://crm-backend/src/services/ai/salesCoach.ts)
- [index.ts](file://crm-backend/src/services/ai/index.ts)
- [recording.controller.ts](file://crm-backend/src/controllers/recording.controller.ts)
- [recording.service.ts](file://crm-backend/src/services/recording.service.ts)
- [recordings.routes.ts](file://crm-backend/src/routes/recordings.routes.ts)
- [recording.validator.ts](file://crm-backend/src/validators/recording.validator.ts)
- [index.ts](file://crm-backend/src/config/index.ts)
- [app.ts](file://crm-backend/src/app.ts)
- [index.tsx](file://crm-frontend/src/pages/AIAudio/index.tsx)
- [AIAnalysisPanel.tsx](file://crm-frontend/src/pages/AIAudio/components/AIAnalysisPanel.tsx)
- [AudioPlayer.tsx](file://crm-frontend/src/pages/AIAudio/components/AudioPlayer.tsx)
- [RecordingList.tsx](file://crm-frontend/src/pages/AIAudio/components/RecordingList.tsx)
- [OpportunityScoreCard.tsx](file://crm-frontend/src/components/AI/OpportunityScoreCard.tsx)
- [ChurnAlertCard.tsx](file://crm-frontend/src/components/AI/ChurnAlertCard.tsx)
- [CustomerInsightPanel.tsx](file://crm-frontend/src/components/AI/CustomerInsightPanel.tsx)
- [index.ts](file://crm-frontend/src/types/index.ts)
- [package.json](file://crm-backend/package.json)
- [schema.prisma](file://crm-backend/prisma/schema.prisma)
- [20260317020137_add_ai_features/migration.sql](file://crm-backend/prisma/migrations/20260317020137_add_ai_features/migration.sql)
- [20260315081326_init/migration.sql](file://crm-backend/prisma/migrations/20260315081326_init/migration.sql)
- [20260315135448_add_contacts_and_business_cards/migration.sql](file://crm-backend/prisma/migrations/20260315135448_add_contacts_and_business_cards/migration.sql)
- [20260315155023_add_cold_visit_records/migration.sql](file://crm-backend/prisma/migrations/20260315155023_add_cold_visit_records/migration.sql)
</cite>

## 更新摘要
**变更内容**
- 新增AI智能分析功能：机会评分系统、客户流失预警系统、智能客户洞察生成系统
- 扩展AI服务架构，增加商机评分、流失预警、客户洞察等高级AI分析功能
- 更新数据库迁移和AI功能相关组件的详细说明
- 增加AI分析结果的数据持久化机制
- 更新前端界面与AI功能的集成说明

## 目录
1. [项目概述](#项目概述)
2. [系统架构](#系统架构)
3. [核心组件分析](#核心组件分析)
4. [AI音频分析流程](#ai音频分析流程)
5. [AI智能分析功能](#ai智能分析功能)
6. [数据库迁移与版本管理](#数据库迁移与版本管理)
7. [前端界面设计](#前端界面设计)
8. [数据模型](#数据模型)
9. [API接口设计](#api接口设计)
10. [性能考虑](#性能考虑)
11. [故障排除指南](#故障排除指南)
12. [总结](#总结)

## 项目概述

销售AI CRM系统是一个基于现代Web技术栈构建的企业级客户关系管理系统。该系统的核心功能之一是AI音频分析，能够自动分析销售通话录音，提取关键信息并生成智能化的销售建议。

### 主要特性

- **智能语音分析**：自动识别通话情感、提取关键词和关键点
- **销售洞察**：分析客户心理状态和购买意向
- **自动化建议**：基于分析结果生成具体的行动建议
- **多格式支持**：支持MP3、WAV、M4A等多种音频格式
- **钉钉集成**：支持从钉钉平台同步录音数据
- **实时播放**：内置音频播放器支持多种播放控制
- **AI功能扩展**：支持客户洞察、流失预警、商机评分等AI功能
- **智能分析系统**：提供机会评分、客户流失预警、智能客户洞察等高级AI分析功能

## 系统架构

系统采用前后端分离的架构设计，后端使用Node.js + Express框架，前端使用React + TypeScript构建。

```mermaid
graph TB
subgraph "前端层 (React)"
FE1[AI音频分析页面]
FE2[录音列表组件]
FE3[音频播放器]
FE4[AI分析面板]
FE5[统计概览]
FE6[智能建议列表]
FE7[商机评分卡片]
FE8[流失预警卡片]
FE9[客户洞察面板]
end
subgraph "API层"
API1[录音路由]
API2[分析路由]
API3[统计路由]
API4[AI分析路由]
end
subgraph "业务逻辑层"
BL1[录音控制器]
BL2[录音服务]
BL3[AI服务]
BL4[AI分析服务]
BL5[机会评分服务]
BL6[流失预警服务]
BL7[客户洞察服务]
end
subgraph "数据访问层"
DA1[Prisma ORM]
DA2[MySQL数据库]
DA3[数据库迁移管理]
end
subgraph "外部服务"
ES1[钉钉API]
ES2[AI分析服务]
ES3[文件存储]
ES4[Tencent Cloud API]
end
FE1 --> API1
FE2 --> API1
FE3 --> API1
FE4 --> API2
FE5 --> API3
FE6 --> API2
FE7 --> API4
FE8 --> API4
FE9 --> API4
API1 --> BL1
API2 --> BL1
API3 --> BL1
API4 --> BL5
API4 --> BL6
API4 --> BL7
BL1 --> BL2
BL2 --> BL3
BL2 --> BL4
BL5 --> BL3
BL6 --> BL3
BL7 --> BL3
BL2 --> DA1
DA1 --> DA2
DA3 --> DA2
BL3 --> ES2
BL4 --> ES2
BL5 --> ES4
BL6 --> ES4
BL7 --> ES4
BL1 --> ES1
```

**图表来源**
- [app.ts:74-78](file://crm-backend/src/app.ts#L74-L78)
- [recordings.routes.ts:12-355](file://crm-backend/src/routes/recordings.routes.ts#L12-L355)
- [index.ts:37-55](file://crm-backend/src/services/ai/index.ts#L37-L55)

## 核心组件分析

### AI服务组件

AI服务是整个系统的核心组件，负责处理所有AI相关的分析功能。

```mermaid
classDiagram
class AIService {
+analyzeRecording(audioUrl, duration, customerInfo) Promise~AIAnalysisResult~
+transcribeAudio(audioUrl) Promise~string~
+analyzeSentiment(text) Promise~SentimentType~
+extractKeywords(text) Promise~string[]~
+generateSummary(text, keywords) Promise~string~
+analyzeCompany(companyName, imageUrl) Promise~CompanyIntelligenceResult~
+callRealAI(audioUrl, duration, customerInfo) Promise~AIAnalysisResult~
-mockAnalysis(duration, customerInfo) Promise~AIAnalysisResult~
-generateMockResult(duration, customerInfo) AIAnalysisResult
-generateMockCompanyIntelligence(companyName) CompanyIntelligenceResult
}
class AIAnalysisResult {
+string transcript
+SentimentType sentiment
+string[] keywords
+string[] keyPoints
+string[] actionItems
+string summary
+psychology : Psychology
+suggestions : Suggestion[]
}
class CompanyIntelligenceResult {
+basicInfo : BasicInfo
+string[] businessScope
+News[] recentNews
+Contact[] keyContacts
+SalesPitch salesPitch
}
AIService --> AIAnalysisResult
AIService --> CompanyIntelligenceResult
```

**图表来源**
- [ai.service.ts:79-564](file://crm-backend/src/services/ai.service.ts#L79-L564)

### 录音服务组件

录音服务负责处理录音相关的业务逻辑，包括存储、分析和管理。

```mermaid
classDiagram
class RecordingService {
-PrismaClient prisma
+create(data, userId) Promise~AudioRecording~
+getAll(query) Promise~PaginatedResult~
+getById(id) Promise~AudioRecording~
+update(id, data) Promise~AudioRecording~
+delete(id) Promise~void~
+analyze(id) Promise~AnalyzedRecording~
+upload(data, userId) Promise~AudioRecording~
+syncFromDingTalk(userId) Promise~SyncResult~
+getDetailById(id) Promise~DetailedRecording~
+getStats(customerId) Promise~RecordingStats~
+getByCustomerId(customerId) Promise~AudioRecording[]~
}
class RecordingController {
+create(req, res, next) Promise~void~
+getAll(req, res, next) Promise~void~
+getById(req, res, next) Promise~void~
+update(req, res, next) Promise~void~
+delete(req, res, next) Promise~void~
+analyze(req, res, next) Promise~void~
+getStats(req, res, next) Promise~void~
+upload(req, res, next) Promise~void~
+syncFromDingTalk(req, res, next) Promise~void~
+getDetail(req, res, next) Promise~void~
}
RecordingController --> RecordingService
RecordingService --> AIService
```

**图表来源**
- [recording.service.ts:9-455](file://crm-backend/src/services/recording.service.ts#L9-L455)
- [recording.controller.ts:46-230](file://crm-backend/src/controllers/recording.controller.ts#L46-L230)

**章节来源**
- [ai.service.ts:79-564](file://crm-backend/src/services/ai.service.ts#L79-L564)
- [recording.service.ts:9-455](file://crm-backend/src/services/recording.service.ts#L9-L455)
- [recording.controller.ts:46-230](file://crm-backend/src/controllers/recording.controller.ts#L46-L230)

## AI音频分析流程

系统提供了完整的AI音频分析工作流程，从录音上传到最终的分析结果展示。

```mermaid
sequenceDiagram
participant User as 用户
participant Frontend as 前端界面
participant API as 后端API
participant Service as 录音服务
participant AIService as AI服务
participant DB as 数据库
User->>Frontend : 上传录音文件
Frontend->>API : POST /api/v1/recordings/upload
API->>Service : upload()
Service->>DB : 创建录音记录
DB-->>Service : 返回录音信息
Service-->>API : 返回录音数据
API-->>Frontend : 录音上传成功
User->>Frontend : 点击开始分析
Frontend->>API : POST /api/v1/recordings/ : id/analyze
API->>Service : analyze()
Service->>DB : 更新状态为processing
Service->>AIService : analyzeRecording()
AIService->>AIService : 调用AI分析API
AIService-->>Service : 返回分析结果
Service->>DB : 更新分析结果
DB-->>Service : 确认更新
Service-->>API : 返回完整分析数据
API-->>Frontend : 显示分析结果
```

**图表来源**
- [recording.controller.ts:129-137](file://crm-backend/src/controllers/recording.controller.ts#L129-L137)
- [recording.service.ts:145-208](file://crm-backend/src/services/recording.service.ts#L145-L208)
- [ai.service.ts:86-98](file://crm-backend/src/services/ai.service.ts#L86-L98)

### 分析流程详细说明

1. **录音上传**：用户通过前端界面上传音频文件，系统验证文件格式和大小
2. **状态初始化**：录音记录创建时状态设置为"pending"
3. **AI分析触发**：用户点击分析按钮，系统调用AI分析服务
4. **状态更新**：分析开始前将状态更新为"processing"
5. **AI处理**：调用AI服务进行语音转文字、情感分析、关键词提取等
6. **结果保存**：将分析结果保存到数据库，状态更新为"analyzed"
7. **结果展示**：前端界面展示完整的分析结果

**章节来源**
- [recording.controller.ts:129-137](file://crm-backend/src/controllers/recording.controller.ts#L129-L137)
- [recording.service.ts:145-208](file://crm-backend/src/services/recording.service.ts#L145-L208)
- [ai.service.ts:86-98](file://crm-backend/src/services/ai.service.ts#L86-L98)

## AI智能分析功能

系统新增了三大核心AI智能分析功能，提供更全面的销售智能分析能力。

### 商机评分系统

商机评分系统基于BANT模型（Budget预算、Authority决策权、Need需求、Timeline时机）对销售商机进行全面评估。

```mermaid
flowchart TD
Start([商机评分开始]) --> Collect[收集商机数据]
Collect --> Engagement[计算互动活跃度]
Collect --> Budget[计算预算匹配度]
Collect --> Authority[计算决策人接触度]
Collect --> Need[计算需求明确度]
Collect --> Timing[计算时机成熟度]
Engagement --> Weight[加权计算]
Budget --> Weight
Authority --> Weight
Need --> Weight
Timing --> Weight
Weight --> Score[生成综合评分]
Score --> Probability[计算成交概率]
Probability --> Factors[生成评分因子]
Factors --> Risks[识别风险因素]
Risks --> Recommendations[生成改进建议]
Recommendations --> End([评分完成])
```

**图表来源**
- [opportunityScoring.ts:46-105](file://crm-backend/src/services/ai/opportunityScoring.ts#L46-L105)

### 客户流失预警系统

客户流失预警系统通过多维度指标分析客户流失风险，提供预警信号和挽回建议。

```mermaid
flowchart TD
Start([流失预警开始]) --> Data[收集客户数据]
Data --> RiskFactors[计算风险因子]
RiskFactors --> LastContact[最近联系时间]
RiskFactors --> Communication[沟通频率变化]
RiskFactors --> Sentiment[情感趋势]
RiskFactors --> Opportunity[商机停滞]
RiskFactors --> TaskCompletion[任务完成率]
RiskFactors --> ContactActivity[联系人活跃度]
LastContact --> RiskScore[计算风险分数]
Communication --> RiskScore
Sentiment --> RiskScore
Opportunity --> RiskScore
TaskCompletion --> RiskScore
ContactActivity --> RiskScore
RiskScore --> RiskLevel[确定风险等级]
RiskLevel --> Reasons[生成流失原因]
Reasons --> Signals[识别预警信号]
Signals --> Suggestions[生成挽回建议]
Suggestions --> End([预警完成])
```

**图表来源**
- [churnAnalysis.ts:32-65](file://crm-backend/src/services/ai/churnAnalysis.ts#L32-L65)

### 智能客户洞察生成系统

智能客户洞察系统从录音和客户数据中提取关键洞察信息，包括需求、预算、决策人等。

```mermaid
flowchart TD
Start([客户洞察开始]) --> Input[输入客户数据]
Input --> Extract[提取需求信息]
Input --> Budget[提取预算信息]
Input --> Decision[识别决策人]
Input --> PainPoints[分析痛点]
Input --> Timeline[提取时间线]
Extract --> Confidence[计算置信度]
Budget --> Confidence
Decision --> Confidence
PainPoints --> Confidence
Timeline --> Confidence
Confidence --> Insights[生成洞察报告]
Insights --> End([洞察完成])
```

**图表来源**
- [customerInsight.ts](file://crm-backend/src/services/ai/customerInsight.ts)

**章节来源**
- [opportunityScoring.ts:42-611](file://crm-backend/src/services/ai/opportunityScoring.ts#L42-L611)
- [churnAnalysis.ts:28-517](file://crm-backend/src/services/ai/churnAnalysis.ts#L28-L517)
- [reportGeneration.ts:16-301](file://crm-backend/src/services/ai/reportGeneration.ts#L16-L301)
- [resourceMatching.ts:44-692](file://crm-backend/src/services/ai/resourceMatching.ts#L44-L692)
- [salesCoach.ts:51-780](file://crm-backend/src/services/ai/salesCoach.ts#L51-L780)

## 数据库迁移与版本管理

系统采用Prisma进行数据库管理，支持完整的数据库迁移和版本控制。

### 数据库迁移架构

```mermaid
graph TB
subgraph "数据库迁移层次"
M1[20260315081326_init] --> M2[20260315135448_add_contacts_and_business_cards]
M2 --> M3[20260315155023_add_cold_visit_records]
M3 --> M4[20260317020137_add_ai_features]
end
subgraph "AI功能迁移"
M4 --> T1[customers表增强]
T1 --> T2[follow_up_suggestions表]
T1 --> T3[daily_reports表]
T1 --> T4[opportunity_scores表]
T1 --> T5[churn_alerts表]
T1 --> T6[customer_insights表]
end
subgraph "数据模型映射"
S1[schema.prisma] --> T1
S1 --> T2
S1 --> T3
S1 --> T4
S1 --> T5
S1 --> T6
end
```

**图表来源**
- [20260317020137_add_ai_features/migration.sql:1-120](file://crm-backend/prisma/migrations/20260317020137_add_ai_features/migration.sql#L1-L120)
- [schema.prisma:189-218](file://crm-backend/prisma/schema.prisma#L189-L218)

### AI功能数据库结构

AI功能相关的数据库结构在`20260317020137_add_ai_features`迁移中得到完善：

#### 客户表增强
- `engagementScore`：互动活跃度评分 (0-100)
- `riskScore`：流失风险评分 (0-100)  
- `lastAnalysisAt`：最后AI分析时间

#### 新增AI分析相关表

**跟进建议表 (follow_up_suggestions)**
- 存储AI生成的跟进建议
- 支持不同类型和优先级
- 包含到期时间和脚本内容

**日常报告表 (daily_reports)**
- 支持日报和周报功能
- 存储内容、摘要、重点事项等

**商机评分表 (opportunity_scores)**
- 客观评分维度：互动活跃度、预算匹配度、决策人接触度、需求明确度、时机成熟度
- 包含风险因素和改进建议

**客户流失预警表 (churn_alerts)**
- 流失风险等级和评分
- 预警信号和挽回建议
- 处理状态跟踪

**客户洞察表 (customer_insights)**
- AI提取的客户需求、预算、决策人等信息
- 置信度和分析来源

**章节来源**
- [20260317020137_add_ai_features/migration.sql:1-120](file://crm-backend/prisma/migrations/20260317020137_add_ai_features/migration.sql#L1-L120)
- [schema.prisma:572-685](file://crm-backend/prisma/schema.prisma#L572-L685)

## 前端界面设计

前端界面采用现代化的设计理念，提供了直观易用的操作界面。

### 主要界面组件

```mermaid
graph TB
subgraph "AI音频分析页面"
A[页面标题]
B[钉钉状态卡片]
C[统计概览]
D[录音列表]
E[音频播放器]
F[AI分析面板]
G[智能建议列表]
H[上传录音弹窗]
end
subgraph "AI智能分析组件"
I[商机评分卡片]
J[流失预警卡片]
K[客户洞察面板]
L[销售绩效分析]
M[资源智能匹配]
N[AI教练建议]
end
subgraph "录音列表组件"
D1[客户头像]
D2[录音信息]
D3[状态标签]
D4[情感图标]
end
subgraph "AI分析面板"
F1[分析状态]
F2[情感分析]
F3[关键词展示]
F4[关键点列表]
F5[心理分析]
F6[转录文本]
end
subgraph "音频播放器"
E1[播放控制]
E2[进度条]
E3[播放速度]
E4[跳转功能]
end
D --> D1
D --> D2
D --> D3
D --> D4
F --> F1
F --> F2
F --> F3
F --> F4
F --> F5
F --> F6
E --> E1
E --> E2
E --> E3
E --> E4
I --> I1
J --> J1
K --> K1
```

**图表来源**
- [index.tsx:166-344](file://crm-frontend/src/pages/AIAudio/index.tsx#L166-L344)
- [AIAnalysisPanel.tsx:46-224](file://crm-frontend/src/pages/AIAudio/components/AIAnalysisPanel.tsx#L46-L224)
- [AudioPlayer.tsx:9-165](file://crm-frontend/src/pages/AIAudio/components/AudioPlayer.tsx#L9-L165)
- [RecordingList.tsx:41-158](file://crm-frontend/src/pages/AIAudio/components/RecordingList.tsx#L41-L158)
- [OpportunityScoreCard.tsx:54-336](file://crm-frontend/src/components/AI/OpportunityScoreCard.tsx#L54-L336)
- [ChurnAlertCard.tsx:62-326](file://crm-frontend/src/components/AI/ChurnAlertCard.tsx#L62-L326)
- [CustomerInsightPanel.tsx:80-381](file://crm-frontend/src/components/AI/CustomerInsightPanel.tsx#L80-L381)

### 界面交互流程

```mermaid
flowchart TD
Start([用户打开AI音频分析页面]) --> LoadData[加载录音数据]
LoadData --> ShowList[显示录音列表]
ShowList --> SelectRecording{选择录音?}
SelectRecording --> |是| ShowDetails[显示录音详情]
SelectRecording --> |否| Wait[等待选择]
ShowDetails --> PlayAudio[播放音频]
ShowDetails --> AnalyzeButton{点击分析?}
AnalyzeButton --> |是| StartAnalysis[开始AI分析]
AnalyzeButton --> |否| End[结束]
StartAnalysis --> ShowProgress[显示分析进度]
ShowProgress --> AnalysisComplete[分析完成]
AnalysisComplete --> ShowResults[显示分析结果]
ShowResults --> ShowAIComponents[显示AI智能分析组件]
ShowAIComponents --> OpportunityScore[商机评分卡片]
ShowAIComponents --> ChurnAlert[流失预警卡片]
ShowAIComponents --> CustomerInsight[客户洞察面板]
OpportunityScore --> AddToSchedule{添加到日程?}
ChurnAlert --> HandleAlert{处理预警?}
CustomerInsight --> GenerateInsight{生成洞察?}
AddToSchedule --> |是| CreateTask[创建日程任务]
AddToSchedule --> |否| End
HandleAlert --> |是| MarkHandled[标记已处理]
HandleAlert --> |否| End
GenerateInsight --> |是| RefreshInsight[刷新洞察]
GenerateInsight --> |否| End
CreateTask --> End
MarkHandled --> End
RefreshInsight --> End
Wait --> End
```

**图表来源**
- [index.tsx:81-106](file://crm-frontend/src/pages/AIAudio/index.tsx#L81-L106)
- [AIAnalysisPanel.tsx:72-90](file://crm-frontend/src/pages/AIAudio/components/AIAnalysisPanel.tsx#L72-L90)

**章节来源**
- [index.tsx:27-344](file://crm-frontend/src/pages/AIAudio/index.tsx#L27-L344)
- [AIAnalysisPanel.tsx:46-224](file://crm-frontend/src/pages/AIAudio/components/AIAnalysisPanel.tsx#L46-L224)
- [AudioPlayer.tsx:9-165](file://crm-frontend/src/pages/AIAudio/components/AudioPlayer.tsx#L9-L165)
- [RecordingList.tsx:41-158](file://crm-frontend/src/pages/AIAudio/components/RecordingList.tsx#L41-L158)
- [OpportunityScoreCard.tsx:54-336](file://crm-frontend/src/components/AI/OpportunityScoreCard.tsx#L54-L336)
- [ChurnAlertCard.tsx:62-326](file://crm-frontend/src/components/AI/ChurnAlertCard.tsx#L62-L326)
- [CustomerInsightPanel.tsx:80-381](file://crm-frontend/src/components/AI/CustomerInsightPanel.tsx#L80-L381)

## 数据模型

系统定义了完整的数据模型来支持AI音频分析功能。

```mermaid
erDiagram
AUDIO_RECORDING {
string id PK
string customerId FK
string customerName
string customerShortName
string contactPerson
integer duration
datetime recordedAt
string title
enum sentiment
string summary
string[] keyPoints
string[] actionItems
string[] keywords
string transcript
enum status
integer fileSize
string fileUrl
string notes
datetime createdAt
datetime updatedAt
}
CUSTOMER {
string id PK
string name
string shortName
string contactPerson
string phone
string email
string company
string industry
datetime lastAnalysisAt
integer riskScore
integer engagementScore
datetime createdAt
datetime updatedAt
}
USER {
string id PK
string name
string email
string role
datetime createdAt
datetime updatedAt
}
SCHEDULE_TASK {
string id PK
string title
string description
datetime startTime
datetime endTime
enum type
enum priority
enum status
string customerId
string customerName
string aiSuggestion
boolean isAIOptimized
datetime createdAt
datetime updatedAt
}
FOLLOW_UP_SUGGESTION {
string id PK
string customerId FK
string type
string priority
string reason
datetime suggestedAt
datetime expiresAt
string script
string status
datetime createdAt
datetime updatedAt
}
DAILY_REPORT {
string id PK
string userId FK
date date
string type
string content
string summary
string[] highlights
string[] risks
string[] nextActions
datetime createdAt
datetime updatedAt
}
OPPORTUNITY_SCORE {
string id PK
string opportunityId FK
integer overallScore
integer winProbability
integer engagementScore
integer budgetScore
integer authorityScore
integer needScore
integer timingScore
string[] factors
string[] riskFactors
string[] recommendations
datetime analyzedAt
datetime createdAt
datetime updatedAt
}
CHURN_ALERT {
string id PK
string customerId FK
string riskLevel
integer riskScore
string[] reasons
string[] signals
string[] suggestions
string status
datetime handledAt
string handledBy
datetime createdAt
datetime updatedAt
}
CUSTOMER_INSIGHT {
string id PK
string customerId FK
string[] extractedNeeds
string extractedBudget
string[] decisionMakers
string[] painPoints
string[] competitorInfo
string[] timeline
integer confidence
string source
datetime analyzedAt
datetime createdAt
datetime updatedAt
}
AUDIO_RECORDING ||--o{ FOLLOW_UP_SUGGESTION : generates
AUDIO_RECORDING ||--o{ CHURN_ALERT : monitors
AUDIO_RECORDING ||--|| CUSTOMER_INSIGHT : creates
CUSTOMER ||--o{ AUDIO_RECORDING : has
USER ||--o{ AUDIO_RECORDING : created_by
AUDIO_RECORDING ||--o{ SCHEDULE_TASK : generates
CUSTOMER ||--o{ FOLLOW_UP_SUGGESTION : has
USER ||--o{ DAILY_REPORT : creates
CUSTOMER ||--o{ CHURN_ALERT : has
CUSTOMER ||--|| CUSTOMER_INSIGHT : has
```

**图表来源**
- [index.ts:73-96](file://crm-frontend/src/types/index.ts#L73-L96)
- [index.ts:19-37](file://crm-frontend/src/types/index.ts#L19-L37)
- [index.ts:136-150](file://crm-frontend/src/types/index.ts#L136-L150)
- [schema.prisma:282-311](file://crm-backend/prisma/schema.prisma#L282-L311)
- [schema.prisma:575-593](file://crm-backend/prisma/schema.prisma#L575-L593)
- [schema.prisma:596-613](file://crm-backend/prisma/schema.prisma#L596-L613)
- [schema.prisma:616-641](file://crm-backend/prisma/schema.prisma#L616-L641)
- [schema.prisma:644-664](file://crm-backend/prisma/schema.prisma#L644-L664)
- [schema.prisma:667-685](file://crm-backend/prisma/schema.prisma#L667-L685)

### 关键数据结构

#### 音频录音模型
- **基础信息**：客户信息、录音时长、文件URL等
- **分析结果**：情感倾向、关键词、关键点、行动项等
- **状态管理**：pending、processing、analyzed三种状态

#### AI分析结果模型
- **转录文本**：完整的语音转文字内容
- **情感分析**：positive、neutral、negative三种情感类型
- **关键词提取**：自动识别的重要词汇
- **心理分析**：客户态度、购买意向、痛点等洞察

#### AI功能扩展模型
- **跟进建议**：自动化的销售建议和行动项
- **客户洞察**：AI提取的客户需求和决策信息
- **流失预警**：客户流失风险评估和预警
- **商机评分**：多维度的商机价值评估

**章节来源**
- [index.ts:73-133](file://crm-frontend/src/types/index.ts#L73-L133)
- [schema.prisma:572-685](file://crm-backend/prisma/schema.prisma#L572-L685)

## API接口设计

系统提供了完整的RESTful API来支持AI音频分析功能。

### 录音管理API

| 接口 | 方法 | 路径 | 描述 |
|------|------|------|------|
| 获取录音列表 | GET | `/api/v1/recordings` | 分页获取录音列表 |
| 创建录音 | POST | `/api/v1/recordings` | 创建新的录音记录 |
| 获取录音详情 | GET | `/api/v1/recordings/:id` | 获取录音详细信息 |
| 更新录音 | PUT | `/api/v1/recordings/:id` | 更新录音信息 |
| 删除录音 | DELETE | `/api/v1/recordings/:id` | 删除录音记录 |
| 触发AI分析 | POST | `/api/v1/recordings/:id/analyze` | 对指定录音进行AI分析 |
| 获取统计信息 | GET | `/api/v1/recordings/stats` | 获取录音统计信息 |
| 上传录音文件 | POST | `/api/v1/recordings/upload` | 上传录音文件 |
| 同步钉钉录音 | POST | `/api/v1/recordings/sync` | 从钉钉同步录音 |

### AI智能分析API

| 接口 | 方法 | 路径 | 描述 |
|------|------|------|------|
| 获取AI分析结果 | GET | `/api/v1/recordings/:id/ai-result` | 获取录音的AI分析结果 |
| 生成跟进建议 | POST | `/api/v1/follow-up-suggestions` | 生成AI跟进建议 |
| 获取客户洞察 | GET | `/api/v1/customer-insights/:customerId` | 获取客户洞察信息 |
| 获取商机评分 | GET | `/api/v1/opportunity-scores/:opportunityId` | 获取商机评分 |
| 获取流失预警 | GET | `/api/v1/churn-alerts/:customerId` | 获取客户流失预警 |
| 分析流失风险 | POST | `/api/v1/churn-analysis/:customerId` | 分析客户流失风险 |
| 计算商机评分 | POST | `/api/v1/opportunity-scoring/:opportunityId` | 计算商机评分 |
| 生成客户洞察 | POST | `/api/v1/customer-insights/generate/:customerId` | 生成客户洞察 |

### 请求和响应示例

**获取录音列表请求**
```json
GET /api/v1/recordings?page=1&limit=10&sentiment=positive
Authorization: Bearer <token>
```

**AI分析响应**
```json
{
  "id": "recording-id",
  "customerId": "customer-id",
  "sentiment": "positive",
  "summary": "通话摘要内容",
  "keywords": ["关键词1", "关键词2"],
  "keyPoints": ["关键点1", "关键点2"],
  "actionItems": ["行动项1", "行动项2"],
  "transcript": "完整转录文本",
  "psychology": {
    "attitude": "interested",
    "purchaseIntent": "high",
    "painPoints": ["痛点1", "痛点2"],
    "concerns": ["顾虑1", "顾虑2"]
  },
  "suggestions": [
    {
      "type": "demo",
      "title": "安排产品演示",
      "description": "安排30分钟的产品演示会议",
      "priority": "high"
    }
  ],
  "notes": "{\"psychology\": {...}, \"suggestions\": [...]}"
}
```

**商机评分响应**
```json
{
  "id": "score-id",
  "opportunityId": "opportunity-id",
  "overallScore": 85,
  "winProbability": 75,
  "engagementScore": 90,
  "budgetScore": 80,
  "authorityScore": 75,
  "needScore": 85,
  "timingScore": 90,
  "factors": [
    {
      "name": "互动活跃度",
      "score": 90,
      "impact": "positive",
      "description": "客户互动频繁，跟进及时"
    }
  ],
  "riskFactors": [
    {
      "factor": "互动不足",
      "severity": "medium",
      "suggestion": "增加跟进频率，保持客户关注度"
    }
  ],
  "recommendations": [
    {
      "action": "安排客户拜访或深度沟通",
      "priority": "high",
      "expectedImpact": "提升客户关注度，加速决策进程"
    }
  ]
}
```

**章节来源**
- [recordings.routes.ts:14-355](file://crm-backend/src/routes/recordings.routes.ts#L14-L355)
- [recording.validator.ts:11-62](file://crm-backend/src/validators/recording.validator.ts#L11-L62)

## 性能考虑

系统在设计时充分考虑了性能优化，确保在大量数据场景下的稳定运行。

### 性能优化策略

1. **异步处理**：AI分析采用异步处理，避免阻塞主线程
2. **状态管理**：通过状态字段跟踪分析进度，支持并发处理
3. **缓存机制**：模拟AI分析结果，减少重复计算开销
4. **分页查询**：数据库查询支持分页，避免大数据量查询
5. **文件上传限制**：设置合理的文件大小限制，防止资源滥用
6. **数据库索引优化**：为常用查询字段建立索引
7. **批量操作**：支持批量AI分析和数据处理
8. **AI服务池化**：多个AI分析服务共享资源，提高利用率

### 性能监控指标

- **分析响应时间**：模拟分析约1.5-2.5秒
- **并发处理能力**：支持多个录音同时分析
- **内存使用**：合理控制分析结果缓存
- **数据库查询**：优化查询索引和分页
- **AI准确率**：模拟准确率94-99%
- **AI服务吞吐量**：支持每秒处理多个分析请求

## 故障排除指南

### 常见问题及解决方案

#### AI分析失败
**问题描述**：AI分析过程中出现错误
**可能原因**：
- 环境变量配置不正确
- 网络连接问题
- 文件格式不支持

**解决步骤**：
1. 检查AI配置是否正确
2. 验证网络连接
3. 确认录音文件格式
4. 查看服务器日志

#### 录音上传失败
**问题描述**：录音文件上传过程中出现问题
**可能原因**：
- 文件大小超出限制
- 文件格式不支持
- 权限问题

**解决步骤**：
1. 检查文件大小是否超过100MB限制
2. 验证文件格式是否为MP3、WAV、M4A、OGG、WEBM
3. 确认用户权限
4. 检查上传目录权限

#### 前端界面异常
**问题描述**：AI音频分析页面显示异常
**可能原因**：
- API接口调用失败
- 数据格式不正确
- 网络连接问题

**解决步骤**：
1. 检查浏览器开发者工具中的网络请求
2. 验证API响应格式
3. 确认JWT令牌有效性
4. 刷新页面重试

#### 数据库迁移失败
**问题描述**：数据库迁移过程中出现问题
**可能原因**：
- 数据库连接问题
- 迁移文件冲突
- 权限不足

**解决步骤**：
1. 检查数据库连接配置
2. 验证迁移文件完整性
3. 确认数据库权限
4. 查看迁移日志

#### AI智能分析功能异常
**问题描述**：商机评分、流失预警、客户洞察等功能异常
**可能原因**：
- AI服务配置问题
- 数据格式不正确
- 依赖服务不可用

**解决步骤**：
1. 检查AI服务配置和密钥
2. 验证输入数据格式
3. 确认依赖服务状态
4. 查看AI服务日志

**章节来源**
- [recording.controller.ts:157-190](file://crm-backend/src/controllers/recording.controller.ts#L157-L190)
- [recording.service.ts:145-208](file://crm-backend/src/services/recording.service.ts#L145-L208)

## 总结

销售AI CRM系统的AI音频分析功能是一个完整的端到端解决方案，涵盖了从录音上传、AI分析到结果展示的全流程。

### 系统优势

1. **技术先进性**：采用最新的AI技术和语音处理算法
2. **用户体验**：提供直观易用的界面和流畅的操作体验
3. **扩展性强**：模块化设计便于功能扩展和维护
4. **安全性高**：完善的权限控制和数据安全保障
5. **性能优异**：优化的架构设计支持高并发处理
6. **数据库管理**：完整的迁移和版本控制机制
7. **AI功能丰富**：支持多种AI分析和预测功能
8. **智能分析全面**：提供机会评分、流失预警、客户洞察等高级AI分析功能

### 技术特色

- **智能分析**：自动识别情感、提取关键词、生成洞察
- **多格式支持**：支持主流音频格式的处理
- **实时同步**：与钉钉平台无缝集成
- **可视化展示**：丰富的图表和数据展示
- **自动化建议**：基于分析结果生成具体的行动建议
- **数据库迁移**：完整的数据库版本管理和迁移机制
- **AI功能扩展**：支持客户洞察、流失预警、商机评分等高级功能
- **智能分析系统**：提供机会评分、客户流失预警、智能客户洞察等AI智能分析功能

### 发展前景

随着AI技术的不断发展，该系统还有很大的改进空间：

1. **AI算法优化**：持续改进分析准确性和智能化水平
2. **多语言支持**：扩展对更多语言的支持
3. **实时分析**：实现实时语音流分析能力
4. **移动端优化**：增强移动设备上的使用体验
5. **集成扩展**：支持更多第三方平台的集成
6. **数据库优化**：进一步优化数据库性能和查询效率
7. **AI功能扩展**：开发更多AI驱动的销售辅助功能
8. **智能分析深化**：提供更精准的商机预测和客户行为分析

该系统为销售团队提供了强大的智能化工具，能够显著提升销售效率和客户服务质量。