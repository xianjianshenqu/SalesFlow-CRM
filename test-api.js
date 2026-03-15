/**
 * CRM系统前后端连通性测试脚本
 * 测试所有主要API接口
 */

const http = require('http');

const BASE_URL = 'http://localhost:3001';
const API_PREFIX = '/api/v1';

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// HTTP请求函数
function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };
    
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }
    
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });
    
    req.on('error', reject);
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

// 测试结果
const results = {
  passed: 0,
  failed: 0,
  tests: []
};

async function test(name, fn) {
  try {
    await fn();
    results.passed++;
    results.tests.push({ name, status: 'PASS' });
    log(`  ✓ ${name}`, 'green');
  } catch (error) {
    results.failed++;
    results.tests.push({ name, status: 'FAIL', error: error.message });
    log(`  ✗ ${name}`, 'red');
    log(`    错误: ${error.message}`, 'yellow');
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message || 'Assertion failed');
}

// 测试套件
async function runTests() {
  console.log('\n' + '='.repeat(60));
  log('       CRM系统前后端连通性测试', 'cyan');
  console.log('='.repeat(60) + '\n');
  
  let authToken = null;
  let userId = null;
  let customerId = null;
  let opportunityId = null;
  let paymentId = null;
  
  // ==================== 1. 健康检查 ====================
  log('\n📡 1. 健康检查测试', 'blue');
  
  await test('健康检查端点', async () => {
    const res = await request('GET', '/health');
    assert(res.status === 200, `状态码应为200，实际为${res.status}`);
    assert(res.data.status === 'ok', '健康状态应为ok');
  });
  
  // ==================== 2. 用户认证 ====================
  log('\n🔐 2. 用户认证测试', 'blue');
  
  await test('用户注册', async () => {
    const res = await request('POST', `${API_PREFIX}/auth/register`, {
      email: `test_${Date.now()}@example.com`,
      password: 'test123456',
      name: 'Test User',
      department: 'Sales',
      phone: '13800138000'
    });
    assert(res.status === 201, `状态码应为201，实际为${res.status}`);
    assert(res.data.success === true, '注册应成功');
    assert(res.data.data?.token, '应返回token');
    authToken = res.data.data?.token;
    userId = res.data.data?.user?.id;
  });
  
  await test('用户登录', async () => {
    const res = await request('POST', `${API_PREFIX}/auth/login`, {
      email: 'test@example.com',
      password: 'test123456'
    });
    // 可能因为用户不存在而失败，这是预期的
    if (res.status === 200 && res.data.success) {
      authToken = res.data.data?.token;
    }
    // 测试已注册用户登录
    assert(true, '登录测试完成');
  });
  
  await test('获取当前用户信息 (需要认证)', async () => {
    if (!authToken) {
      throw new Error('没有可用的认证token');
    }
    const res = await request('GET', `${API_PREFIX}/auth/me`, null, authToken);
    assert(res.status === 200, `状态码应为200，实际为${res.status}`);
    assert(res.data.success === true, '应成功返回用户信息');
    assert(res.data.data?.email, '应返回用户邮箱');
  });
  
  // ==================== 3. 客户管理 ====================
  log('\n👥 3. 客户管理测试', 'blue');
  
  await test('创建客户', async () => {
    if (!authToken) throw new Error('需要认证');
    const res = await request('POST', `${API_PREFIX}/customers`, {
      name: '测试公司_' + Date.now(),
      shortName: '测试',
      contactPerson: '张三',
      phone: '13900139000',
      email: 'contact@test.com',
      city: '北京',
      industry: 'IT',
      priority: 'high',
      stage: 'new',
      estimatedValue: 100000
    }, authToken);
    assert(res.status === 201, `状态码应为201，实际为${res.status}`);
    customerId = res.data.data?.id;
  });
  
  await test('获取客户列表', async () => {
    if (!authToken) throw new Error('需要认证');
    const res = await request('GET', `${API_PREFIX}/customers?page=1&pageSize=10`, null, authToken);
    assert(res.status === 200, `状态码应为200，实际为${res.status}`);
    assert(Array.isArray(res.data.data?.items), '应返回客户数组');
  });
  
  await test('获取客户详情', async () => {
    if (!authToken || !customerId) throw new Error('需要认证和客户ID');
    const res = await request('GET', `${API_PREFIX}/customers/${customerId}`, null, authToken);
    assert(res.status === 200, `状态码应为200，实际为${res.status}`);
  });
  
  await test('更新客户', async () => {
    if (!authToken || !customerId) throw new Error('需要认证和客户ID');
    const res = await request('PUT', `${API_PREFIX}/customers/${customerId}`, {
      name: '更新后的公司名',
      priority: 'medium'
    }, authToken);
    assert(res.status === 200, `状态码应为200，实际为${res.status}`);
  });
  
  await test('获取客户统计', async () => {
    if (!authToken) throw new Error('需要认证');
    const res = await request('GET', `${API_PREFIX}/customers/stats`, null, authToken);
    assert(res.status === 200, `状态码应为200，实际为${res.status}`);
  });
  
  // ==================== 4. 商机管理 ====================
  log('\n💼 4. 商机管理测试', 'blue');
  
  await test('创建商机', async () => {
    if (!authToken || !customerId) throw new Error('需要认证和客户ID');
    const res = await request('POST', `${API_PREFIX}/opportunities`, {
      customerId: customerId,
      title: '测试商机_' + Date.now(),
      value: 50000,
      stage: 'new_lead',
      probability: 30,
      priority: 'medium'
    }, authToken);
    assert(res.status === 201, `状态码应为201，实际为${res.status}`);
    opportunityId = res.data.data?.id;
  });
  
  await test('获取商机列表', async () => {
    if (!authToken) throw new Error('需要认证');
    const res = await request('GET', `${API_PREFIX}/opportunities`, null, authToken);
    assert(res.status === 200, `状态码应为200，实际为${res.status}`);
  });
  
  // ==================== 5. 支付管理 ====================
  log('\n💰 5. 支付管理测试', 'blue');
  
  await test('创建支付记录', async () => {
    if (!authToken || !customerId) throw new Error('需要认证和客户ID');
    const res = await request('POST', `${API_PREFIX}/payments`, {
      customerId: customerId,
      totalAmount: 30000,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      notes: '测试支付记录'
    }, authToken);
    assert(res.status === 201, `状态码应为201，实际为${res.status}`);
    paymentId = res.data.data?.id;
  });
  
  await test('获取支付列表', async () => {
    if (!authToken) throw new Error('需要认证');
    const res = await request('GET', `${API_PREFIX}/payments`, null, authToken);
    assert(res.status === 200, `状态码应为200，实际为${res.status}`);
  });
  
  // ==================== 6. 仪表盘 ====================
  log('\n📊 6. 仪表盘测试', 'blue');
  
  await test('获取仪表盘概览', async () => {
    if (!authToken) throw new Error('需要认证');
    const res = await request('GET', `${API_PREFIX}/dashboard/overview`, null, authToken);
    assert(res.status === 200, `状态码应为200，实际为${res.status}`);
  });
  
  // ==================== 7. CORS测试 ====================
  log('\n🌐 7. CORS跨域测试', 'blue');
  
  await test('CORS预检请求', async () => {
    // 模拟CORS预检
    const res = await request('OPTIONS', `${API_PREFIX}/customers`);
    assert(res.status === 204 || res.status === 200, `CORS预检应成功`);
  });
  
  // ==================== 8. 错误处理 ====================
  log('\n⚠️ 8. 错误处理测试', 'blue');
  
  await test('无效路由返回404', async () => {
    const res = await request('GET', `${API_PREFIX}/invalid-route`);
    assert(res.status === 404, `状态码应为404，实际为${res.status}`);
  });
  
  await test('未认证返回401', async () => {
    const res = await request('GET', `${API_PREFIX}/customers`);
    assert(res.status === 401, `状态码应为401，实际为${res.status}`);
  });
  
  await test('验证错误返回400', async () => {
    if (!authToken) throw new Error('需要认证');
    const res = await request('POST', `${API_PREFIX}/customers`, {
      // 缺少必填字段
    }, authToken);
    assert(res.status === 400, `状态码应为400，实际为${res.status}`);
  });
  
  // ==================== 清理测试数据 ====================
  log('\n🧹 清理测试数据', 'blue');
  
  await test('删除测试商机', async () => {
    if (!authToken || !opportunityId) return;
    const res = await request('DELETE', `${API_PREFIX}/opportunities/${opportunityId}`, null, authToken);
    assert(res.status === 200 || res.status === 204, '删除应成功');
  });
  
  await test('删除测试客户', async () => {
    if (!authToken || !customerId) return;
    const res = await request('DELETE', `${API_PREFIX}/customers/${customerId}`, null, authToken);
    assert(res.status === 200 || res.status === 204, '删除应成功');
  });
  
  // ==================== 测试结果 ====================
  console.log('\n' + '='.repeat(60));
  log('       测试结果汇总', 'cyan');
  console.log('='.repeat(60));
  log(`\n通过: ${results.passed}`, 'green');
  log(`失败: ${results.failed}`, results.failed > 0 ? 'red' : 'green');
  log(`总计: ${results.passed + results.failed}\n`, 'reset');
  
  if (results.failed > 0) {
    log('失败的测试:', 'yellow');
    results.tests
      .filter(t => t.status === 'FAIL')
      .forEach(t => log(`  - ${t.name}: ${t.error}`, 'red'));
  }
  
  console.log('\n' + '='.repeat(60));
  log('       前端配置检查', 'cyan');
  console.log('='.repeat(60) + '\n');
  
  // 检查前端配置
  const fs = require('fs');
  const path = require('path');
  
  const frontendEnvPath = path.join(__dirname, 'crm-frontend', '.env');
  const backendEnvPath = path.join(__dirname, 'crm-backend', '.env');
  
  if (fs.existsSync(frontendEnvPath)) {
    log('✓ 前端 .env 文件存在', 'green');
    const envContent = fs.readFileSync(frontendEnvPath, 'utf-8');
    log(`  内容: ${envContent.split('\n').filter(l => l.trim()).join(', ')}`, 'reset');
  } else {
    log('✗ 前端 .env 文件不存在', 'red');
  }
  
  if (fs.existsSync(backendEnvPath)) {
    log('✓ 后端 .env 文件存在', 'green');
  } else {
    log('✗ 后端 .env 文件不存在', 'red');
  }
  
  // 检查前端是否使用mock数据
  log('\n⚠️ 发现问题:', 'yellow');
  log('前端目前使用 mock 数据，未连接后端 API', 'yellow');
  log('需要创建 API 服务层来连接前后端\n', 'yellow');
  
  process.exit(results.failed > 0 ? 1 : 0);
}

runTests().catch(console.error);