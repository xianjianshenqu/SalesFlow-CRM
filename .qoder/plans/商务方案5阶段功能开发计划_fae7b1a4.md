# 商务方案5阶段功能开发计划

## 一、数据库模型设计

### 1.1 扩展Proposal模型状态枚举
**文件**: `crm-backend/prisma/schema.prisma`

新增状态值：
```prisma
enum ProposalStatus {
  draft              // 草稿
  requirement_analysis  // 需求分析中 (新增)
  designing          // 方案设计中 (新增)
  pending_review     // 待内部评审 (新增)
  review_passed      // 评审通过 (新增)
  review_rejected    // 评审驳回 (新增)
  customer_proposal  // 客户提案中 (新增)
  negotiation        // 商务谈判中 (新增)
  sent               // 已发送
  accepted           // 已接受
  rejected           // 已拒绝
  expired            // 已过期
}
```

### 1.2 新增模型
**文件**: `crm-backend/prisma/schema.prisma`

```prisma
// 方案模板库
model ProposalTemplate {
  id          String   @id @default(uuid())
  name        String
  category    String   // 行业分类
  description String?  @db.Text
  content     String   @db.Text  // JSON格式模板内容
  products    Json?    // 推荐产品配置
  terms       String?  @db.Text  // 标准条款
  tags        Json?    // string[] 标签
  usageCount  Int      @default(0)
  isActive    Boolean  @default(true)
  createdById String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([category])
  @@map("proposal_templates")
}

// 需求分析记录
model RequirementAnalysis {
  id           String   @id @default(uuid())
  proposalId   String   @unique
  customerId   String
  
  // 需求来源
  sourceType   String   // manual, ai_recording, ai_followup
  recordingId  String?  // 关联录音
  
  // 需求内容
  rawContent   String?  @db.Text  // 原始输入/AI提取
  aiEnhanced   Boolean  @default(false)
  finalContent String?  @db.Text  // 最终确认的需求
  
  // AI分析结果
  extractedNeeds    Json?  // AI提取的需求列表
  painPoints        Json?  // 痛点分析
  budgetHint        Json?  // 预算线索
  decisionTimeline  String?
  
  // 状态
  status       String   @default("draft")  // draft, confirmed
  
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  @@map("requirement_analyses")
}

// 内部评审记录
model ProposalReview {
  id           String   @id @default(uuid())
  proposalId   String
  
  // 评审状态
  status       String   @default("pending")  // pending, approved, rejected
  
  // 推送领导
  reviewerId   String?  // 评审人ID
  
  // 共享团队
  sharedWith   Json?    // 共享的团队成员ID[]
  
  // 评审意见
  comments     Json?    // [{userId, comment, createdAt}]
  
  // 结果
  result       String?  // approved, rejected
  resultNotes  String?  @db.Text
  reviewedAt   DateTime?
  
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  @@map("proposal_reviews")
}

// 客户提案记录
model CustomerProposal {
  id             String   @id @default(uuid())
  proposalId     String
  
  // 邮件信息
  emailTo        String   // 收件人
  emailCc        Json?    // 抄送列表
  emailSubject   String?
  emailBody      String?  @db.Text
  
  // 发送状态
  sendStatus     String   @default("draft")  // draft, sent, delivered, opened, failed
  sentAt         DateTime?
  deliveredAt    DateTime?
  openedAt       DateTime?
  openCount      Int      @default(0)
  
  // 链接跟踪
  trackingToken  String?  @unique
  viewUrl        String?
  
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  @@map("customer_proposals")
}

// 商务谈判记录
model NegotiationRecord {
  id           String   @id @default(uuid())
  proposalId   String
  
  // 谈判记录
  discussions  Json?    // [{date, content, participants}]
  
  // 条款确认
  agreedTerms  Json?    // 确认的条款
  
  // 最终文档
  finalDocumentUrl String?
  
  // 状态
  status       String   @default("ongoing")  // ongoing, completed, cancelled
  
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  @@map("negotiation_records")
}
```

---

## 二、后端API设计

### 2.1 方案模板API
**文件**: `crm-backend/src/routes/proposals.routes.ts` (扩展)

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /proposals/templates | 获取模板列表 |
| POST | /proposals/templates | 创建模板 |
| POST | /proposals/templates/:id/clone | 克隆模板 |

### 2.2 需求分析阶段API
**文件**: `crm-backend/src/controllers/proposal.controller.ts` (扩展)

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /proposals/:id/requirement-analysis | 创建需求分析 |
| POST | /proposals/:id/requirement-analysis/ai-analyze | AI分析需求(录音/跟单) |
| POST | /proposals/:id/requirement-analysis/ai-enhance | AI补充完善需求 |
| PUT | /proposals/:id/requirement-analysis | 更新需求分析 |
| POST | /proposals/:id/requirement-analysis/confirm | 确认需求分析 |

### 2.3 方案设计阶段API
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /proposals/:id/design | 开始方案设计 |
| POST | /proposals/:id/design/match-template | AI匹配模板 |
| POST | /proposals/:id/design/generate | AI生成方案 |
| PUT | /proposals/:id/design | 修改方案内容 |
| POST | /proposals/:id/design/confirm | 确认方案 |

### 2.4 内部评审阶段API
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /proposals/:id/review | 发起内部评审 |
| POST | /proposals/:id/review/assign | 推送评审人 |
| POST | /proposals/:id/review/share | 共享给团队 |
| POST | /proposals/:id/review/comment | 添加评审意见 |
| POST | /proposals/:id/review/approve | 评审通过 |
| POST | /proposals/:id/review/reject | 评审驳回 |

### 2.5 客户提案阶段API
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /proposals/:id/customer-proposal | 开始客户提案 |
| POST | /proposals/:id/customer-proposal/generate-email | 生成邮件模板 |
| PUT | /proposals/:id/customer-proposal/email | 编辑邮件 |
| POST | /proposals/:id/customer-proposal/send | 发送邮件 |
| GET | /proposals/:id/customer-proposal/tracking | 获取跟踪状态 |
| GET | /proposals/track/:token | 客户查看跟踪(公开) |

### 2.6 商务谈判阶段API
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /proposals/:id/negotiation | 开始商务谈判 |
| POST | /proposals/:id/negotiation/discussion | 添加讨论记录 |
| PUT | /proposals/:id/negotiation/terms | 更新条款 |
| POST | /proposals/:id/negotiation/generate-document | 生成最终文档 |
| POST | /proposals/:id/negotiation/complete | 完成谈判 |

---

## 三、前端UI设计

### 3.1 页面结构
**目录**: `crm-frontend/src/pages/Proposals/`

```
Proposals/
├── index.tsx              # 方案列表页(已有，需改造)
├── CreateProposal/
│   └── index.tsx          # 新建方案入口
├── ProposalDetail/
│   ├── index.tsx          # 方案详情主页
│   ├── RequirementAnalysis.tsx  # 阶段1: 需求分析
│   ├── ProposalDesign.tsx       # 阶段2: 方案设计
│   ├── InternalReview.tsx       # 阶段3: 内部评审
│   ├── CustomerProposal.tsx     # 阶段4: 客户提案
│   └── Negotiation.tsx          # 阶段5: 商务谈判
└── components/
    ├── StageProgress.tsx  # 阶段进度条
    ├── AIAssistant.tsx    # AI助手组件
    └── TemplateSelector.tsx # 模板选择器
```

### 3.2 新建方案流程
多步骤表单：
1. **选择客户** - 下拉选择或新建
2. **选择模板** - AI推荐或手动选择
3. **填写基本信息** - 标题、金额、描述
4. **进入需求分析** - 开始阶段1

### 3.3 各阶段UI组件

**需求分析页面**:
- AI需求分析区：选择录音/跟单记录，一键分析
- 手动输入区：富文本编辑器
- AI补充区：一键AI增强，显示建议补充内容

**方案设计页面**:
- 模板匹配区：AI推荐模板卡片
- 方案编辑区：产品配置、条款编辑
- 确认按钮：状态流转到内部评审

**内部评审页面**:
- 评审人选择：下拉选择领导
- 团队共享：多选团队成员
- 评审意见列表：时间线展示
- 通过/驳回操作

**客户提案页面**:
- 邮件编辑器：富文本编辑
- 邮件预览：发送前预览
- 发送状态跟踪：状态卡片

**商务谈判页面**:
- 讨论记录：时间线+表单添加
- 条款确认：可编辑条款列表
- 最终文档：生成+下载

---

## 四、实施步骤

### Phase 1: 数据库迁移 (第1天)
1. 更新 `prisma/schema.prisma` 添加新模型
2. 运行 `npx prisma migrate dev` 生成迁移
3. 更新 TypeScript 类型定义

### Phase 2: 后端核心API (第2-3天)
1. 创建 Validator 文件 `proposal.validator.ts` 扩展
2. 扩展 Controller `proposal.controller.ts`
3. 扩展 Service `proposal.service.ts`
4. 扩展 Routes `proposals.routes.ts`

### Phase 3: AI服务增强 (第3天)
1. 扩展 `proposalAI.ts` 添加需求分析方法
2. 新增模板匹配算法
3. 新增邮件模板生成

### Phase 4: 邮件服务集成 (第4天)
1. 安装 nodemailer
2. 创建 `mail.service.ts`
3. 配置SMTP环境变量
4. 实现发送+跟踪功能

### Phase 5: 前端页面开发 (第5-7天)
1. 改造方案列表页，接入真实API
2. 开发新建方案多步骤表单
3. 开发5个阶段详情页面
4. 开发公共组件（阶段进度、AI助手等）

### Phase 6: 联调测试 (第8天)
1. 前后端联调
2. 端到端流程测试
3. 修复问题

---

## 五、关键文件清单

### 后端新增/修改文件
- `prisma/schema.prisma` - 数据库模型
- `src/validators/proposal.validator.ts` - 验证器扩展
- `src/controllers/proposal.controller.ts` - 控制器扩展
- `src/services/proposal.service.ts` - 服务扩展
- `src/services/mail.service.ts` - 邮件服务(新增)
- `src/services/ai/proposalAI.ts` - AI服务扩展
- `src/routes/proposals.routes.ts` - 路由扩展

### 前端新增/修改文件
- `src/pages/Proposals/index.tsx` - 列表页改造
- `src/pages/Proposals/CreateProposal/index.tsx` - 新建页面
- `src/pages/Proposals/ProposalDetail/` - 详情页面组
- `src/services/api.ts` - API服务扩展
- `src/types/index.ts` - 类型定义扩展

---

## 六、技术依赖

- **邮件发送**: nodemailer (^6.9.x)
- **富文本编辑**: TipTap 或 Quill
- **PDF生成**: jspdf + html2canvas (最终文档生成)