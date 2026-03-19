/**
 * CRM系统一键启动脚本
 * 自动检测并启动数据库服务，然后启动前后端服务
 */

const { spawn, exec, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const net = require('net');

// 配置
const CONFIG = {
  frontendDir: 'crm-frontend',
  backendDir: 'crm-backend',
  defaultFrontendPort: 5173,
  defaultBackendPort: 3002,
  mysqlPort: 3306,
  mysqlHost: 'localhost',
  mysqlDatabase: 'crm_db',
  mysqlUser: 'root',
  mysqlPassword: 'password',
  minPort: 3000,
  maxPort: 9999,
};

// 可能的 MySQL 服务名称
const MYSQL_SERVICE_NAMES = [
  'MySQL',
  'MySQL80',
  'MySQL57',
  'MySQL56',
  'MySQL55',
  'MySQL8',
  'MySQL5',
  'wampmysqld64',
  'wampmysqld',
  'mariadb',
];

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, total, message) {
  log(`\n[${step}/${total}] ${message}`, 'cyan');
}

// 检查端口是否可用
function checkPort(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', () => resolve(false));
    server.once('listening', () => {
      server.close();
      resolve(true);
    });
    server.listen(port);
  });
}

// 检查端口是否被占用（服务是否运行）
function isPortInUse(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(true);
      } else {
        resolve(false);
      }
    });
    server.once('listening', () => {
      server.close();
      resolve(false);
    });
    server.listen(port);
  });
}

// 查找可用端口
async function findAvailablePort(startPort) {
  let port = startPort;
  while (port <= CONFIG.maxPort) {
    if (await checkPort(port)) {
      return port;
    }
    log(`端口 ${port} 已被占用，尝试下一个端口...`, 'yellow');
    port++;
  }
  throw new Error('无法找到可用端口');
}

// 执行命令并返回结果
function execCommand(command, options = {}) {
  return new Promise((resolve) => {
    exec(command, { encoding: 'utf8', ...options }, (error, stdout, stderr) => {
      resolve({ error, stdout, stderr, success: !error });
    });
  });
}

// 检查是否有管理员权限
async function checkAdminPrivileges() {
  try {
    // 尝试执行需要管理员权限的操作
    const result = await execCommand('net session 2>&1');
    return result.success || !result.stderr.includes('拒绝访问');
  } catch {
    return false;
  }
}

// 获取 MySQL 服务名称
async function getMySQLServiceName() {
  for (const serviceName of MYSQL_SERVICE_NAMES) {
    const result = await execCommand(`sc query "${serviceName}"`);
    if (result.stdout && result.stdout.includes('SERVICE_NAME')) {
      return serviceName;
    }
  }
  return null;
}

// 检查 MySQL 服务状态
async function checkMySQLServiceStatus(serviceName) {
  const result = await execCommand(`sc query "${serviceName}"`);
  if (result.stdout) {
    if (result.stdout.includes('RUNNING')) {
      return 'running';
    } else if (result.stdout.includes('STOPPED')) {
      return 'stopped';
    }
  }
  return 'not_found';
}

// 启动 MySQL 服务
async function startMySQLService(serviceName) {
  log(`正在启动 MySQL 服务 (${serviceName})...`, 'yellow');
  
  const result = await execCommand(`net start "${serviceName}"`);
  
  if (result.success || result.stdout.includes('服务已经启动')) {
    log(`✓ MySQL 服务已启动`, 'green');
    return true;
  }
  
  if (result.stderr && result.stderr.includes('拒绝访问')) {
    log(`✗ 需要管理员权限才能启动 MySQL 服务`, 'red');
    log(`请以管理员身份运行此脚本，或手动启动 MySQL 服务`, 'yellow');
    return false;
  }
  
  if (result.stderr && result.stderr.includes('服务已经启动')) {
    log(`✓ MySQL 服务已经在运行`, 'green');
    return true;
  }
  
  return false;
}

// 等待 MySQL 服务就绪
async function waitForMySQLReady(maxWaitTime = 30000) {
  log('等待 MySQL 服务就绪...', 'yellow');
  
  const startTime = Date.now();
  const interval = 1000;
  
  while (Date.now() - startTime < maxWaitTime) {
    const inUse = await isPortInUse(CONFIG.mysqlPort);
    if (inUse) {
      // 尝试连接 MySQL
      const mysqlCheck = await execCommand(
        `mysql -u ${CONFIG.mysqlUser} -p${CONFIG.mysqlPassword} -e "SELECT 1;" 2>&1`
      );
      if (mysqlCheck.success || mysqlCheck.stdout.includes('1')) {
        log('✓ MySQL 服务已就绪', 'green');
        return true;
      }
    }
    
    process.stdout.write('.');
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  
  console.log('');
  return false;
}

// 检查并创建数据库
async function ensureDatabaseExists() {
  log(`检查数据库 ${CONFIG.mysqlDatabase} 是否存在...`, 'yellow');
  
  const result = await execCommand(
    `mysql -u ${CONFIG.mysqlUser} -p${CONFIG.mysqlPassword} -e "SHOW DATABASES LIKE '${CONFIG.mysqlDatabase}';" 2>&1`
  );
  
  if (result.stdout && result.stdout.includes(CONFIG.mysqlDatabase)) {
    log(`✓ 数据库 ${CONFIG.mysqlDatabase} 已存在`, 'green');
    return true;
  }
  
  // 创建数据库
  log(`正在创建数据库 ${CONFIG.mysqlDatabase}...`, 'yellow');
  const createResult = await execCommand(
    `mysql -u ${CONFIG.mysqlUser} -p${CONFIG.mysqlPassword} -e "CREATE DATABASE ${CONFIG.mysqlDatabase} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>&1`
  );
  
  if (createResult.success || !createResult.stderr.includes('error')) {
    log(`✓ 数据库 ${CONFIG.mysqlDatabase} 已创建`, 'green');
    return true;
  }
  
  log(`✗ 创建数据库失败: ${createResult.stderr}`, 'red');
  return false;
}

// 运行 Prisma 迁移
async function runPrismaMigration() {
  log('正在运行 Prisma 迁移...', 'yellow');
  
  const backendPath = path.join(__dirname, CONFIG.backendDir);
  
  // 先生成 Prisma 客户端
  log('生成 Prisma 客户端...', 'blue');
  const generateResult = await execCommand('npx prisma generate', { cwd: backendPath });
  
  if (!generateResult.success && generateResult.stderr) {
    log(`Prisma 生成警告: ${generateResult.stderr}`, 'yellow');
  }
  
  // 运行迁移
  log('执行数据库迁移...', 'blue');
  const migrateResult = await execCommand('npx prisma migrate deploy', { cwd: backendPath });
  
  if (migrateResult.success || migrateResult.stdout.includes('success')) {
    log('✓ 数据库迁移完成', 'green');
    return true;
  }
  
  // 如果迁移失败，可能需要先运行 migrate dev
  if (migrateResult.stderr && migrateResult.stderr.includes('No migration')) {
    log('尝试运行开发迁移...', 'yellow');
    const devMigrateResult = await execCommand('npx prisma migrate dev --name init', { cwd: backendPath });
    if (devMigrateResult.success || devMigrateResult.stdout.includes('success')) {
      log('✓ 数据库迁移完成', 'green');
      return true;
    }
  }
  
  log(`迁移警告: ${migrateResult.stderr}`, 'yellow');
  return true; // 继续执行，迁移可能已完成
}

// 运行种子数据
async function runDatabaseSeed() {
  log('正在导入种子数据...', 'yellow');
  
  const backendPath = path.join(__dirname, CONFIG.backendDir);
  const result = await execCommand('npm run db:seed', { cwd: backendPath });
  
  if (result.success || result.stdout.includes('success')) {
    log('✓ 种子数据导入完成', 'green');
    return true;
  }
  
  log(`种子数据警告: ${result.stderr || result.stdout}`, 'yellow');
  return true; // 继续执行，种子数据可能已存在
}

// 从 .env 文件读取数据库配置
function readDatabaseConfig() {
  const envPath = path.join(__dirname, CONFIG.backendDir, '.env');
  
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const lines = envContent.split('\n');
    
    for (const line of lines) {
      if (line.startsWith('DATABASE_URL=')) {
        // 解析 DATABASE_URL: mysql://user:password@host:port/database
        const match = line.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)"/);
        if (match) {
          CONFIG.mysqlUser = match[1];
          CONFIG.mysqlPassword = match[2];
          CONFIG.mysqlHost = match[3];
          CONFIG.mysqlPort = parseInt(match[4], 10);
          CONFIG.mysqlDatabase = match[5].replace(/"/g, '');
        }
        break;
      }
    }
  }
}

// 创建后端 .env 文件
function createBackendEnv(port, frontendPort) {
  const envPath = path.join(__dirname, CONFIG.backendDir, '.env');
  const envExamplePath = path.join(__dirname, CONFIG.backendDir, '.env.example');
  
  let envContent = '';
  
  // 如果存在现有 .env，读取它
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf-8');
  } else if (fs.existsSync(envExamplePath)) {
    envContent = fs.readFileSync(envExamplePath, 'utf-8');
  }
  
  // 更新配置
  const lines = envContent.split('\n');
  const updatedLines = lines.map(line => {
    if (line.startsWith('PORT=')) {
      return `PORT=${port}`;
    }
    if (line.startsWith('CORS_ORIGIN=')) {
      return `CORS_ORIGIN=http://localhost:${frontendPort}`;
    }
    return line;
  });
  
  // 确保包含必要的配置
  if (!updatedLines.some(l => l.startsWith('PORT='))) {
    updatedLines.push(`PORT=${port}`);
  }
  if (!updatedLines.some(l => l.startsWith('CORS_ORIGIN='))) {
    updatedLines.push(`CORS_ORIGIN=http://localhost:${frontendPort}`);
  }
  
  fs.writeFileSync(envPath, updatedLines.join('\n'));
  log(`✓ 已更新后端配置文件 .env`, 'green');
}

// 更新前端 vite.config.ts
function updateViteConfig(port) {
  const viteConfigPath = path.join(__dirname, CONFIG.frontendDir, 'vite.config.ts');
  
  const configContent = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: ${port},
    strictPort: false,
    host: true,
  },
})
`;
  
  fs.writeFileSync(viteConfigPath, configContent);
  log(`✓ 已更新前端 Vite 配置，端口: ${port}`, 'green');
}

// 创建前端环境配置
function createFrontendEnv(backendPort) {
  const envPath = path.join(__dirname, CONFIG.frontendDir, '.env');
  const envContent = `# API Configuration
VITE_API_BASE_URL=http://localhost:${backendPort}/api/v1
VITE_API_TIMEOUT=10000
`;
  fs.writeFileSync(envPath, envContent);
  log(`✓ 已创建前端环境配置 .env`, 'green');
}

// 启动进程
function startProcess(command, args, cwd, name) {
  return new Promise((resolve, reject) => {
    log(`\n正在启动 ${name}...`, 'cyan');
    
    const isWindows = process.platform === 'win32';
    const shell = isWindows ? true : false;
    
    const childProcess = spawn(command, args, {
      cwd: path.resolve(cwd),
      shell,
      stdio: 'inherit',
      env: { ...process.env, FORCE_COLOR: '1' }
    });
    
    childProcess.on('error', (error) => {
      log(`${name} 启动失败: ${error.message}`, 'red');
      reject(error);
    });
    
    // 给进程一些时间来启动
    setTimeout(() => {
      if (!childProcess.killed) {
        log(`✓ ${name} 已启动`, 'green');
        resolve(childProcess);
      }
    }, 3000);
    
    childProcess.on('exit', (code) => {
      if (code !== 0 && code !== null) {
        log(`${name} 异常退出，代码: ${code}`, 'yellow');
      }
    });
  });
}

// 主函数
async function main() {
  const totalSteps = 7;
  let currentStep = 0;
  
  console.log('\n' + '='.repeat(60));
  log('       CRM 系统一键启动脚本 v2.0', 'magenta');
  console.log('='.repeat(60) + '\n');
  
  try {
    // 读取数据库配置
    readDatabaseConfig();
    
    // 步骤 1: 检查管理员权限
    currentStep++;
    logStep(currentStep, totalSteps, '检查系统环境');
    
    const isAdmin = await checkAdminPrivileges();
    if (isAdmin) {
      log('✓ 检测到管理员权限', 'green');
    } else {
      log('⚠ 未检测到管理员权限（可能需要手动启动数据库服务）', 'yellow');
    }
    
    // 步骤 2: 检查并启动 MySQL 服务
    currentStep++;
    logStep(currentStep, totalSteps, '检查并启动 MySQL 数据库服务');
    
    // 检查 MySQL 端口是否已在使用
    const mysqlPortInUse = await isPortInUse(CONFIG.mysqlPort);
    
    if (mysqlPortInUse) {
      log(`✓ MySQL 端口 ${CONFIG.mysqlPort} 已在监听`, 'green');
    } else {
      // 查找 MySQL 服务
      const serviceName = await getMySQLServiceName();
      
      if (serviceName) {
        log(`找到 MySQL 服务: ${serviceName}`, 'blue');
        const serviceStatus = await checkMySQLServiceStatus(serviceName);
        
        if (serviceStatus === 'running') {
          log(`✓ MySQL 服务已在运行`, 'green');
        } else if (serviceStatus === 'stopped') {
          if (isAdmin) {
            const started = await startMySQLService(serviceName);
            if (!started) {
              throw new Error('无法启动 MySQL 服务');
            }
          } else {
            log('✗ 需要管理员权限启动 MySQL 服务', 'red');
            log('请手动启动 MySQL 服务后按任意键继续...', 'yellow');
            // 等待用户按键（在批处理中处理）
          }
        }
      } else {
        log('⚠ 未找到 MySQL 服务，请确保 MySQL 已安装', 'yellow');
        log('您可以手动启动 MySQL 服务后继续', 'yellow');
      }
      
      // 等待 MySQL 就绪
      const mysqlReady = await waitForMySQLReady();
      if (!mysqlReady) {
        throw new Error('MySQL 服务未能就绪，请检查 MySQL 是否正确安装和配置');
      }
    }
    
    // 步骤 3: 检查并创建数据库
    currentStep++;
    logStep(currentStep, totalSteps, '检查并创建数据库');
    
    const dbCreated = await ensureDatabaseExists();
    if (!dbCreated) {
      throw new Error('无法创建数据库');
    }
    
    // 步骤 4: 运行数据库迁移
    currentStep++;
    logStep(currentStep, totalSteps, '运行数据库迁移');
    
    await runPrismaMigration();
    
    // 步骤 5: 运行种子数据
    currentStep++;
    logStep(currentStep, totalSteps, '导入种子数据');
    
    await runDatabaseSeed();
    
    // 步骤 6: 检测可用端口并更新配置
    currentStep++;
    logStep(currentStep, totalSteps, '检测端口并更新配置');
    
    const frontendPort = await findAvailablePort(CONFIG.defaultFrontendPort);
    const backendPort = await findAvailablePort(CONFIG.defaultBackendPort);
    
    log(`\n前端端口: ${frontendPort}`, 'blue');
    log(`后端端口: ${backendPort}`, 'blue');
    
    createBackendEnv(backendPort, frontendPort);
    createFrontendEnv(backendPort);
    updateViteConfig(frontendPort);
    
    // 步骤 7: 启动服务
    currentStep++;
    logStep(currentStep, totalSteps, '启动前后端服务');
    
    // 启动后端
    const backendProcess = await startProcess(
      'npm',
      ['run', 'dev'],
      path.join(__dirname, CONFIG.backendDir),
      '后端服务'
    );
    
    // 启动前端
    const frontendProcess = await startProcess(
      'npm',
      ['run', 'dev'],
      path.join(__dirname, CONFIG.frontendDir),
      '前端服务'
    );
    
    // 显示启动信息
    console.log('\n' + '='.repeat(60));
    log('🎉 CRM 系统启动成功！', 'green');
    console.log('='.repeat(60));
    log(`\n📱 前端地址: http://localhost:${frontendPort}`, 'cyan');
    log(`🔧 后端地址: http://localhost:${backendPort}`, 'cyan');
    log(`📚 API文档: http://localhost:${backendPort}/api-docs`, 'cyan');
    log(`💾 数据库: ${CONFIG.mysqlDatabase} (端口 ${CONFIG.mysqlPort})`, 'cyan');
    log('\n测试账户:', 'magenta');
    log('  管理员: admin@crm.com / admin123', 'blue');
    log('  销售:   alex@crm.com / sales123', 'blue');
    log('\n按 Ctrl+C 停止所有服务', 'yellow');
    console.log('');
    
    // 处理退出
    process.on('SIGINT', () => {
      log('\n正在停止服务...', 'yellow');
      backendProcess.kill();
      frontendProcess.kill();
      process.exit(0);
    });
    
  } catch (error) {
    log(`\n✗ 启动失败: ${error.message}`, 'red');
    log('\n故障排除建议:', 'yellow');
    log('1. 确保已安装 MySQL 并启动服务', 'yellow');
    log('2. 以管理员身份运行此脚本', 'yellow');
    log('3. 检查数据库连接配置 (.env 文件)', 'yellow');
    log('4. 运行 setup-database.bat 进行数据库初始化', 'yellow');
    process.exit(1);
  }
}

main();