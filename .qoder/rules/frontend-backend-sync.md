# CRM 系统前后端同步开发规则

## 核心原则

**前端与后端必须保持同步状态，任何前端变更都必须确保后端服务正常运行。**

## 强制要求

### 1. 前端开发前必须确认后端状态

在启动前端开发或测试之前，必须执行以下检查：

```
✅ 检查后端服务是否已启动（默认端口：3001）
✅ 检查后端 API 是否可访问（http://localhost:3001/api/v1）
✅ 检查数据库连接是否正常
✅ 检查前端 .env 文件中的 API_BASE_URL 是否与后端端口匹配
```

### 2. 启动服务的正确顺序

```
1. 先启动后端服务：cd crm-backend && npm run dev
2. 确认后端正常运行（访问 http://localhost:3001/api/v1/health 或任意 API 端点）
3. 再启动前端服务：cd crm-frontend && npm run dev
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
| 后端 (Express) | 3001 | crm-backend/.env |
| 数据库 (MySQL) | 3306 | crm-backend/.env |

## 环境变量配置

### 前端环境变量 (crm-frontend/.env)

```env
VITE_API_BASE_URL=http://localhost:3001/api/v1
VITE_API_TIMEOUT=10000
```

### 后端环境变量 (crm-backend/.env)

```env
PORT=3001
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