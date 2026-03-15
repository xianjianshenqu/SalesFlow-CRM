/**
 * CRM系统一键启动脚本
 * 自动检测可用端口并启动前后端服务
 */

const { spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const net = require('net');

// 配置
const CONFIG = {
  frontendDir: 'crm-frontend',
  backendDir: 'crm-backend',
  defaultFrontendPort: 5173,
  defaultBackendPort: 3001,
  minPort: 3000,
  maxPort: 9999,
};

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

// 创建后端 .env 文件
function createBackendEnv(port, frontendPort) {
  const envPath = path.join(__dirname, CONFIG.backendDir, '.env');
  const envExamplePath = path.join(__dirname, CONFIG.backendDir, '.env.example');
  
  let envContent = '';
  
  // 如果存在 .env.example，读取它作为模板
  if (fs.existsSync(envExamplePath)) {
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
  log(`✓ 已创建/更新后端配置文件 .env`, 'green');
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
    }, 2000);
    
    childProcess.on('exit', (code) => {
      if (code !== 0 && code !== null) {
        log(`${name} 异常退出，代码: ${code}`, 'yellow');
      }
    });
  });
}

// 主函数
async function main() {
  console.log('\n' + '='.repeat(50));
  log('       CRM 系统一键启动脚本', 'cyan');
  console.log('='.repeat(50) + '\n');
  
  try {
    // 1. 检测可用端口
    log('正在检测可用端口...', 'blue');
    const frontendPort = await findAvailablePort(CONFIG.defaultFrontendPort);
    const backendPort = await findAvailablePort(CONFIG.defaultBackendPort);
    
    log(`\n✓ 前端端口: ${frontendPort}`, 'green');
    log(`✓ 后端端口: ${backendPort}`, 'green');
    
    // 2. 更新配置文件
    log('\n正在更新配置文件...', 'blue');
    createBackendEnv(backendPort, frontendPort);
    createFrontendEnv(backendPort);
    updateViteConfig(frontendPort);
    
    // 3. 启动服务
    log('\n正在启动服务...', 'blue');
    
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
    console.log('\n' + '='.repeat(50));
    log('🎉 CRM 系统启动成功！', 'green');
    console.log('='.repeat(50));
    log(`\n📱 前端地址: http://localhost:${frontendPort}`, 'cyan');
    log(`🔧 后端地址: http://localhost:${backendPort}`, 'cyan');
    log(`📚 API文档: http://localhost:${backendPort}/api-docs`, 'cyan');
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
    log(`\n启动失败: ${error.message}`, 'red');
    process.exit(1);
  }
}

main();