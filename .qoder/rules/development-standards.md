# CRM 系统开发规范

## 技术栈

### 前端 (crm-frontend)
- **框架**: React 19 + TypeScript 5.x
- **构建工具**: Vite 8.x
- **样式**: Tailwind CSS 4.x
- **状态管理**: Zustand
- **路由**: React Router 7.x
- **HTTP 客户端**: Fetch API (封装在 api.ts)

### 后端 (crm-backend)
- **框架**: Express.js + TypeScript 5.x
- **数据库**: MySQL 8.0 + Prisma ORM
- **认证**: JWT
- **API 文档**: Swagger/OpenAPI

---

## 一、代码风格规范

### 1.1 缩进与格式

```typescript
// ✅ 正确：使用 2 空格缩进
function example() {
  const data = {
    name: 'test',
    value: 100
  };
  return data;
}

// ❌ 错误：使用 Tab 或 4 空格
function bad() {
    const data = {
        name: 'test'
    };
}
```

### 1.2 引号与分号

```typescript
// ✅ 使用单引号（字符串）
const name = 'customer';

// ✅ 模板字符串用于插值
const message = `客户 ${name} 创建成功`;

// ✅ 不强制要求分号（TypeScript 会自动处理）
const value = 1
const result = value + 2
```

### 1.3 对象与数组

```typescript
// ✅ 对象字面量：最后一项不加逗号，单行可省略
const config = { name: 'test', value: 100 };

// ✅ 多行对象：保持一致的缩进
const customer = {
  id: 'c1',
  name: '华为技术有限公司',
  stage: 'negotiation'
};

// ✅ 数组：简洁明了
const stages = ['new_lead', 'contacted', 'negotiation'];
```

---

## 二、命名规范

### 2.1 变量与常量

| 类型 | 命名方式 | 示例 |
|------|---------|------|
| 变量 | camelCase | `customerName`, `totalValue` |
| 常量 | UPPER_SNAKE_CASE | `API_BASE_URL`, `MAX_RETRY_COUNT` |
| 私有变量 | _前缀 | `_internalState` |
| 布尔变量 | is/has/should 前缀 | `isLoading`, `hasPermission`, `shouldUpdate` |

```typescript
// ✅ 正确
const customerList = [];
const isLoading = false;
const MAX_PAGE_SIZE = 100;

// ❌ 错误
const CustomerList = [];
const loading = false;
const maxpagesize = 100;
```

### 2.2 函数与方法

| 类型 | 命名方式 | 示例 |
|------|---------|------|
| 普通函数 | camelCase | `getCustomerById`, `calculateTotal` |
| 事件处理 | handle 前缀 | `handleSubmit`, `handleClick` |
| 异步函数 | 保持一致 | `fetchCustomers`, `saveData` |
| 回调函数 | on 前缀 | `onSuccess`, `onError` |

```typescript
// ✅ 正确
async function fetchCustomerById(id: string) { }
const handleSubmit = (data: FormData) => { };
function calculateTotal(items: Item[]): number { }

// ❌ 错误
function FetchCustomer(id) { }
function submit() { }
function calc(items) { }
```

### 2.3 类与接口

| 类型 | 命名方式 | 示例 |
|------|---------|------|
| 类 | PascalCase | `CustomerService`, `AuthController` |
| 接口 | PascalCase | `Customer`, `CreateCustomerInput` |
| 类型别名 | PascalCase | `Stage`, `Priority` |
| 枚举 | PascalCase | `TaskStatus`, `Sentiment` |

```typescript
// ✅ 正确
interface Customer {
  id: string;
  name: string;
}

class CustomerService {
  async findAll() { }
}

type Stage = 'new_lead' | 'contacted' | 'negotiation';

// ❌ 错误
interface customer { }
class customerService { }
type stage = string;
```

### 2.4 文件命名

| 类型 | 命名方式 | 示例 |
|------|---------|------|
| 组件文件 | PascalCase | `CustomerList.tsx`, `Sidebar.tsx` |
| 页面文件 | PascalCase 或 index | `Customers/index.tsx` |
| 工具文件 | camelCase | `api.ts`, `logger.ts` |
| 类型文件 | camelCase | `types/index.ts` |
| 样式文件 | 与组件同名 | `Sidebar.css` |

### 2.5 数据库字段

```prisma
// ✅ 正确：camelCase
model Customer {
  id              String   @id @default(uuid())
  name            String
  shortName       String?  @map("short_name")
  estimatedValue  Int      @map("estimated_value")
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")

  @@map("customers")
}
```

---

## 三、TypeScript 规范

### 3.1 类型定义

```typescript
// ✅ 优先使用 interface 定义对象类型
interface Customer {
  id: string;
  name: string;
}

// ✅ 使用 type 定义联合类型、工具类型
type Stage = 'new_lead' | 'contacted' | 'negotiation';
type CustomerWithContacts = Customer & { contacts: Contact[] };

// ✅ 使用 Readonly 表示不可变
interface Config {
  readonly apiUrl: string;
  readonly timeout: number;
}

// ❌ 避免 any，使用 unknown 或具体类型
function process(data: unknown) {
  if (typeof data === 'string') {
    return data.toUpperCase();
  }
}
```

### 3.2 函数签名

```typescript
// ✅ 明确的参数和返回类型
async function getCustomer(id: string): Promise<Customer | null> {
  return prisma.customer.findUnique({ where: { id } });
}

// ✅ 可选参数放后面
interface SearchParams {
  query: string;
  page?: number;
  pageSize?: number;
}

// ✅ 使用解构参数
function createCustomer({ name, email, phone }: CreateCustomerInput): Customer {
  return { id: generateId(), name, email, phone };
}
```

### 3.3 泛型使用

```typescript
// ✅ 有意义的泛型名称
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

// ✅ 泛型约束
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}
```

---

## 四、React 组件规范

### 4.1 组件结构

```tsx
// ✅ 推荐的组件结构顺序
// 1. 导入
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { customerApi } from '../../services/api';
import type { Customer } from '../../types';

// 2. 类型定义
interface CustomerListProps {
  onSelect?: (customer: Customer) => void;
}

// 3. 常量
const ITEMS_PER_PAGE = 10;

// 4. 辅助函数
function formatCurrency(value: number): string {
  return `¥${value.toLocaleString()}`;
}

// 5. 子组件
function CustomerRow({ customer }: { customer: Customer }) {
  return <tr>{/* ... */}</tr>;
}

// 6. 主组件
export function CustomerList({ onSelect }: CustomerListProps) {
  // Hooks
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 副作用
  useEffect(() => {
    fetchCustomers();
  }, []);

  // 事件处理
  const handleRowClick = (customer: Customer) => {
    onSelect?.(customer);
  };

  // 渲染
  if (loading) {
    return <div>加载中...</div>;
  }

  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

### 4.2 组件类型

```tsx
// ✅ 函数组件 + Props 类型
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export function Button({ 
  label, 
  onClick, 
  variant = 'primary', 
  disabled = false 
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant}`}
    >
      {label}
    </button>
  );
}
```

### 4.3 Hooks 规范

```tsx
// ✅ 自定义 Hook 以 use 开头
function useCustomer(id: string) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    customerApi.getById(id)
      .then(res => setCustomer(res.data))
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, [id]);

  return { customer, loading, error };
}

// ✅ 使用
function CustomerDetail({ id }: { id: string }) {
  const { customer, loading, error } = useCustomer(id);
  // ...
}
```

### 4.4 状态管理 (Zustand)

```tsx
// ✅ Store 结构
interface CustomerState {
  customers: Customer[];
  selectedId: string | null;
  loading: boolean;
  
  // Actions
  fetchCustomers: () => Promise<void>;
  selectCustomer: (id: string) => void;
  addCustomer: (customer: Customer) => void;
}

export const useCustomerStore = create<CustomerState>()(
  persist(
    (set, get) => ({
      customers: [],
      selectedId: null,
      loading: false,

      fetchCustomers: async () => {
        set({ loading: true });
        const { data } = await customerApi.getAll();
        set({ customers: data.items, loading: false });
      },

      selectCustomer: (id) => set({ selectedId: id }),
      
      addCustomer: (customer) => set((state) => ({
        customers: [...state.customers, customer]
      })),
    }),
    { name: 'crm-customers' }
  )
);
```

---

## 五、后端开发规范

### 5.1 目录结构

```
crm-backend/
├── src/
│   ├── controllers/    # 控制器：处理 HTTP 请求
│   ├── services/       # 服务层：业务逻辑
│   ├── repositories/   # 数据访问层：Prisma
│   ├── routes/         # 路由定义
│   ├── middlewares/    # 中间件
│   ├── validators/     # 请求验证
│   ├── types/          # 类型定义
│   ├── utils/          # 工具函数
│   └── config/         # 配置
├── prisma/
│   └── schema.prisma   # 数据库 Schema
└── tests/
```

### 5.2 分层架构

```typescript
// Controller: 只负责请求/响应处理
export class CustomerController {
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const result = await customerService.findAll(req.query);
    sendPaginatedResponse(res, result.data, result.page, result.pageSize, result.total);
  });
}

// Service: 业务逻辑
export class CustomerService {
  async findAll(params: QueryParams) {
    const where = this.buildWhereClause(params);
    const [data, total] = await Promise.all([
      prisma.customer.findMany({ where, ...pagination }),
      prisma.customer.count({ where })
    ]);
    return { data, total, ...pagination };
  }
  
  private buildWhereClause(params: QueryParams) {
    // 构建查询条件
  }
}

// Repository: 数据访问（本项目使用 Prisma，直接在 Service 中调用）
```

### 5.3 API 路由规范

```typescript
// ✅ RESTful 风格
router.get('/', authMiddleware, customerController.getAll);      // 列表
router.get('/stats', authMiddleware, customerController.getStats); // 统计（放在 :id 前）
router.get('/:id', authMiddleware, customerController.getById);   // 详情
router.post('/', authMiddleware, validateBody(schema), customerController.create); // 创建
router.put('/:id', authMiddleware, validateBody(schema), customerController.update); // 更新
router.delete('/:id', authMiddleware, customerController.delete); // 删除

// ✅ 嵌套资源
router.get('/:id/contacts', authMiddleware, contactController.getByCustomer);
router.post('/:id/contacts', authMiddleware, contactController.create);
```

### 5.4 响应格式

```typescript
// ✅ 统一响应格式
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// ✅ 分页响应
interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// ✅ 使用工具函数
sendResponse(res, 200, customer, 'Customer created successfully');
sendPaginatedResponse(res, customers, page, pageSize, total);
```

### 5.5 错误处理

```typescript
// ✅ 自定义错误类
export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

// ✅ 在 Service 中抛出
async function findById(id: string) {
  const customer = await prisma.customer.findUnique({ where: { id } });
  if (!customer) {
    throw new NotFoundError('Customer not found');
  }
  return customer;
}

// ✅ 全局错误处理中间件
app.use(errorHandler);
```

---

## 六、数据库规范

### 6.1 Prisma Schema

```prisma
// ✅ 枚举类型
enum Stage {
  new_lead
  contacted
  solution
  negotiation
  won
  lost
}

// ✅ 模型定义
model Customer {
  id              String      @id @default(uuid())
  name            String
  shortName       String?     @map("short_name")
  email           String?     @unique
  stage           Stage       @default(new_lead)
  estimatedValue  Int         @default(0) @map("estimated_value")
  priority        Priority    @default(medium)
  ownerId         String?     @map("owner_id")
  createdAt       DateTime    @default(now()) @map("created_at")
  updatedAt       DateTime    @updatedAt @map("updated_at")
  
  // 关系
  owner          User?        @relation(fields: [ownerId], references: [id])
  contacts       Contact[]
  opportunities  Opportunity[]
  
  @@index([ownerId])
  @@index([stage])
  @@map("customers")
}
```

### 6.2 迁移规范

```bash
# 创建迁移
npx prisma migrate dev --name add_customer_priority

# 重置数据库（开发环境）
npx prisma migrate reset

# 生成客户端
npx prisma generate
```

---

## 七、注释规范

### 7.1 函数注释

```typescript
/**
 * 获取客户列表（支持分页和筛选）
 * @param params - 查询参数
 * @param params.page - 页码（从 1 开始）
 * @param params.pageSize - 每页数量
 * @param params.stage - 客户阶段筛选
 * @returns 分页客户列表
 * @throws {NotFoundError} 当客户不存在时抛出
 */
async function findAll(params: QueryParams): Promise<PaginatedResult<Customer>> {
  // 实现
}
```

### 7.2 代码注释

```typescript
// ✅ 解释为什么，而不是做什么
// 使用 Promise.all 并行查询，减少响应时间
const [customers, total] = await Promise.all([
  prisma.customer.findMany({ where }),
  prisma.customer.count({ where })
]);

// ✅ TODO 注释格式
// TODO: 后续需要添加缓存支持 - @username 2024-01-15
// FIXME: 这里有并发问题，需要加锁

// ❌ 避免无意义的注释
// 循环遍历数组
for (const item of items) { }
```

### 7.3 API 文档 (Swagger)

```typescript
/**
 * @swagger
 * /customers:
 *   get:
 *     summary: 获取客户列表
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: stage
 *         schema:
 *           type: string
 *           enum: [new_lead, contacted, negotiation, won]
 *     responses:
 *       200:
 *         description: 成功返回客户列表
 *       401:
 *         description: 未授权
 */
```

---

## 八、Git 提交规范

### 8.1 分支管理

```
main           # 生产分支，只接受合并请求
├── develop    # 开发分支
│   ├── feature/customer-module    # 功能分支
│   ├── feature/auth-system
│   ├── fix/login-error            # 修复分支
│   └── refactor/api-layer         # 重构分支
└── release/v1.0.0                 # 发布分支
```

### 8.2 提交信息格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Type 类型：**
| 类型 | 说明 | 示例 |
|------|------|------|
| feat | 新功能 | feat(customer): 添加客户导入功能 |
| fix | 修复 Bug | fix(auth): 修复登录 Token 过期问题 |
| docs | 文档更新 | docs: 更新 API 文档 |
| style | 代码格式 | style: 格式化代码缩进 |
| refactor | 重构 | refactor(service): 重构客户服务层 |
| test | 测试 | test: 添加客户单元测试 |
| chore | 构建/工具 | chore: 更新依赖版本 |

**示例：**
```bash
# 功能开发
feat(customer): 添加客户批量导入功能

支持 Excel 和 CSV 格式导入
自动匹配重复客户

Closes #123

# Bug 修复
fix(auth): 修复 Token 刷新失败问题

当 refreshToken 过期时，正确重定向到登录页

Fixes #456
```

### 8.3 Pull Request 规范

```markdown
## 变更说明
简要描述本次变更的内容和目的

## 变更类型
- [ ] 新功能 (feat)
- [ ] Bug 修复 (fix)
- [ ] 重构 (refactor)
- [ ] 文档更新 (docs)

## 测试情况
- [ ] 单元测试已通过
- [ ] 本地测试已完成
- [ ] 代码已自审

## 相关 Issue
Closes #123
```

---

## 九、前后端协作规范

### 9.1 API 对接流程

```
1. 后端先定义 Schema 和类型
2. 前后端对齐接口文档（Swagger）
3. 后端实现接口
4. 前端调用并集成
5. 联调测试
```

### 9.2 类型同步

```typescript
// ✅ 前端类型定义与后端 Prisma Schema 保持一致
// 后端 prisma/schema.prisma
model Customer {
  id        String   @id
  name      String
  stage     Stage
}

// 前端 types/index.ts
interface Customer {
  id: string;
  name: string;
  stage: Stage;
}

type Stage = 'new_lead' | 'contacted' | 'negotiation' | 'won';
```

### 9.3 错误码约定

| HTTP 状态码 | 含义 | 前端处理 |
|------------|------|---------|
| 200 | 成功 | 正常处理数据 |
| 201 | 创建成功 | 显示成功提示 |
| 400 | 请求参数错误 | 显示错误信息 |
| 401 | 未授权 | 跳转登录页 |
| 403 | 禁止访问 | 显示无权限提示 |
| 404 | 资源不存在 | 显示空状态或 404 页 |
| 500 | 服务器错误 | 显示错误提示，记录日志 |

### 9.4 开发环境配置同步

```bash
# 后端配置检查
1. PORT 是否正确
2. CORS_ORIGIN 是否包含前端地址
3. DATABASE_URL 是否正确

# 前端配置检查
1. VITE_API_BASE_URL 是否指向后端
2. 代理配置是否正确（如有）
```

---

## 十、代码审查清单

### 10.1 提交前自查

```
✅ 代码是否符合命名规范
✅ 是否有未使用的变量/导入
✅ TypeScript 是否有类型错误
✅ 是否有 ESLint 警告
✅ 是否添加了必要的注释
✅ 是否更新了相关文档
✅ 是否编写/更新了测试用例
```

### 10.2 审查重点

```
✅ 逻辑正确性：边界条件、空值处理
✅ 安全性：输入验证、SQL 注入、XSS
✅ 性能：N+1 查询、不必要的重复计算
✅ 可维护性：代码结构、命名清晰度
✅ 一致性：与现有代码风格保持一致
```

---

## 十一、禁止事项

### 11.1 绝对禁止

```typescript
// ❌ 禁止使用 any（除非极特殊情况）
const data: any = fetchData();

// ❌ 禁止在生产代码中使用 console.log
console.log('debug info');

// ❌ 禁止直接操作 DOM（React 项目）
document.getElementById('myElement');

// ❌ 禁止硬编码敏感信息
const API_KEY = 'sk-xxxxx';

// ❌ 禁止未处理的 Promise
fetch('/api/data'); // 没有 await 或 catch

// ❌ 禁止硬编码 API URL（端口可能变化）
fetch('http://localhost:3001/api/v1/customers');
// ✅ 应使用环境变量
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002/api/v1';
fetch(`${API_BASE_URL}/customers`);

// ❌ 禁止混合导入值和类型（verbatimModuleSyntax 要求）
import { customerApi, Customer } from '../services/api';
// ✅ 应分开导入
import { customerApi } from '../services/api';
import type { Customer } from '../services/api';
```

### 11.2 强烈不建议

```typescript
// ⚠️ 避免深层嵌套（超过 3 层）
if (a) {
  if (b) {
    if (c) {
      if (d) {
        // 太深了
      }
    }
  }
}

// ⚠️ 避免过长函数（超过 50 行）
function processEverything() {
  // 200 行代码...
}

// ⚠️ 避免魔法数字
setTimeout(callback, 3000); // 应该定义常量
```

---

## 附录：常用命令速查

### 前端命令
```bash
npm run dev      # 启动开发服务器
npm run build    # 构建生产版本
npm run lint     # 代码检查
npm run preview  # 预览生产构建
```

### 后端命令
```bash
npm run dev      # 启动开发服务器（nodemon）
npm run build    # 编译 TypeScript
npm run start    # 启动生产服务器
npx prisma studio # 打开数据库管理界面
```

### 数据库命令
```bash
npx prisma migrate dev    # 创建并应用迁移
npx prisma generate       # 生成客户端
npx prisma db seed        # 执行种子数据
npx prisma db reset       # 重置数据库
```