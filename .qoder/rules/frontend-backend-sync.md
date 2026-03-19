---
trigger: always_on
---
# CRM 系统前后端同步开发规则

## 核心原则

**前端与后端必须保持同步状态，任何前端变更都必须确保后端服务正常运行。**

## 强制要求

### 1. 前端开发前必须确认后端状态

在启动前端开发或测试之前，必须执行以下检查：

```
✅ 检查后端服务是否已启动（默认端口：3002）
✅ 检查后端 API 是否可访问（http://localhost:3002/api/v1）
✅ 检查数据库连接是否正常
✅ 检查前端 .env 文件中的 VITE_API_BASE_URL 是否与后端端口匹配
```

### 2. 启动服务的正确顺序

```
1. 先启动后端服务：cd crm-backend && npm run dev
2. 确认后端正常运行（访问 http://localhost:3002/api/v1/health 或任意 API 端点）
3. 再启动前端服务：cd crm-frontend && npm run dev
```

**推荐方式：使用一键启动脚本**
```bash
node start.js    # 自动检测端口并启动前后端
# 或 Windows 下双击
start.bat
```

### 3. 一键启动脚本

项目根目录提供了 `start.js` 一键启动脚本，推荐使用：

```bash
node start.js
# 或
npm run start
# 或 Windows 下
start.bat
```

该脚本会自动：
- 检测可用端口
- 更新前后端配置文件
- 同时启动前后端服务

### 4. 前端变更时的检查清单

当前端发生以下变更时，必须检查后端对应部分：

| 前端变更类型 | 必须检查的后端部分 |
|-------------|-------------------|
| API 调用新增/修改 | 对应的 Controller、Service、路由 |
| 类型定义修改 | 后端对应的 TypeScript 类型、Prisma Schema |
| 新增页面功能 | 后端是否有对应的 API 端点 |
| 环境变量修改 | 后端 CORS 配置、端口配置 |

### 5. 错误排查流程

当遇到 "Failed to fetch" 或网络错误时，按以下顺序排查：

```
1. 检查后端服务是否运行
   → 访问 http://localhost:3001/api/v1

2. 检查前端 API_BASE_URL 配置
   → 查看 crm-frontend/.env 文件

3. 检查后端 CORS 配置
   → 查看 crm-backend/.env 中的 CORS_ORIGIN

4. 检查网络请求 URL 是否正确
   → 浏览器开发者工具 Network 面板

5. 检查认证 Token 是否有效
   → localStorage 中的 auth_token
```

## 端口配置

| 服务 | 默认端口 | 配置文件 |
|------|---------|----------|
| 前端 (Vite) | 5173 | crm-frontend/vite.config.ts |
| 后端 (Express) | 3002 | crm-backend/.env |
| 数据库 (MySQL) | 3306 | crm-backend/.env |

## 环境变量配置

### 前端环境变量 (crm-frontend/.env)

```env
VITE_API_BASE_URL=http://localhost:3002/api/v1
VITE_API_TIMEOUT=10000
```

### 后端环境变量 (crm-backend/.env)

```env
PORT=3002
CORS_ORIGIN=http://localhost:5173
DATABASE_URL=mysql://user:password@localhost:3306/crm_db
JWT_SECRET=your-jwt-secret
```

## 开发规范

1. **API 路径规范**：所有 API 调用必须通过 `src/services/api.ts` 统一管理
2. **错误处理**：前端必须有完善的错误处理和用户提示
3. **类型安全**：前后端共享类型定义，确保数据结构一致
4. **认证状态**：前端必须检查认证状态，未登录时重定向到登录页

## 常见问题解决

### 问题：登录时 "Failed to fetch"

**原因**：后端服务未启动或端口不匹配

**解决方案**：
```bash
# 方案 1：使用一键启动脚本
node start.js

# 方案 2：手动启动
cd crm-backend && npm run dev
# 新终端窗口
cd crm-frontend && npm run dev
```

### 问题：API 返回 401 Unauthorized

**原因**：Token 过期或无效

**解决方案**：
- 清除 localStorage 中的 auth_token
- 重新登录获取新 Token

### 问题：CORS 错误

**原因**：后端 CORS 配置与前端地址不匹配

**解决方案**：
- 检查 crm-backend/.env 中的 CORS_ORIGIN
- 确保包含前端访问地址

---

## 前端 API URL 规范（重要）

### 禁止硬编码 API URL

**❌ 错误做法：在组件或服务中硬编码 API 地址**
```typescript
// ❌ 禁止这样写！端口变化时会出错
const response = await fetch('http://localhost:3001/api/v1/customers', {...});
const response = await fetch('http://localhost:3002/api/v1/customers', {...});
```

**✅ 正确做法：使用环境变量**
```typescript
// ✅ 推荐：定义在文件顶部
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002/api/v1';

const response = await fetch(`${API_BASE_URL}/customers`, {...});
```

### 检查清单

当添加新的 API 调用时，确保：
```
✅ 使用 import.meta.env.VITE_API_BASE_URL 获取 API 地址
✅ 不在代码中硬编码 localhost:3001 或 localhost:3002
✅ 统一通过 src/services/api.ts 或 src/services/aiService.ts 调用 API
```

---

## TypeScript 类型导入规范（重要）

### 必须使用 `import type` 导入类型

由于项目启用了 `verbatimModuleSyntax`，类型必须使用 `import type` 语法导入。

**❌ 错误做法：混合导入值和类型**
```typescript
// ❌ 编译错误！Customer 是类型，不能和值一起导入
import { customerApi, Customer, ProposalTemplate } from '../../services/api';
```

**✅ 正确做法：分离值导入和类型导入**
```typescript
// ✅ 正确：值和类型分开导入
import { customerApi } from '../../services/api';
import type { Customer, ProposalTemplate } from '../../services/api';

// ✅ 或者使用内联类型导入语法
import { customerApi, type Customer, type ProposalTemplate } from '../../services/api';
```

### 如何判断是否需要 `type`

| 导入内容 | 是否需要 type |
|---------|--------------|
| 函数、常量、组件 | ❌ 不需要 |
| interface、type 别名 | ✅ 需要 |
| enum（作为类型使用） | ✅ 需要 |
| class（仅作为类型） | ✅ 需要 |

### 常见错误示例

```typescript
// ❌ 错误：从 api.ts 导出的类型需要 type
import { Customer, Opportunity, Payment } from '../types';

// ✅ 正确
import type { Customer, Opportunity, Payment } from '../types';

// ❌ 错误：混合导入
import { proposalApi, Customer } from '../services/api';

// ✅ 正确：分开导入
import { proposalApi } from '../services/api';
import type { Customer } from '../services/api';
```

---

## 页面空白问题排查

当遇到页面空白但无报错时，检查以下项：

```
1. 打开浏览器开发者工具 (F12)
2. 查看 Console 面板是否有错误
3. 常见原因：
   - 类型导入语法错误 → 修正为 import type
   - API URL 硬编码错误 → 改用环境变量
   - 后端未启动 → 先启动后端
   - 端口配置不一致 → 检查 .env 文件
```