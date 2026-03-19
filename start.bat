@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul
title CRM系统启动器

:: 检查管理员权限
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ========================================
    echo   需要 administrator privileges
    echo ========================================
    echo.
    echo 正在请求 administrator privileges...
    echo.
    
    :: 使用 PowerShell 以管理员身份重新运行
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)

:: 已有管理员权限，继续执行
echo.
echo ============================================================
echo           CRM 系统一键启动脚本 v2.0
echo ============================================================
echo.

cd /d "%~dp0"

:: 检查 Node.js
echo [检查] Node.js 环境...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [错误] 未找到 Node.js，请先安装 Node.js
    echo 下载地址: https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo [成功] Node.js 版本: %NODE_VERSION%

:: 检查 npm
echo [检查] npm 环境...
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [错误] 未找到 npm
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('npm -v') do set NPM_VERSION=%%i
echo [成功] npm 版本: %NPM_VERSION%

:: 检查 MySQL 命令行工具
echo.
echo [检查] MySQL 环境...
where mysql >nul 2>nul
if %errorlevel% neq 0 (
    echo [警告] 未检测到 MySQL 命令行工具
    echo 请确保 MySQL 已安装并添加到 PATH 环境变量
    echo.
    echo 如果 MySQL 服务已经在运行，可以继续
    echo.
    set /p CONTINUE="是否继续启动? (Y/N): "
    if /i not "!CONTINUE!"=="Y" (
        exit /b 1
    )
) else (
    echo [成功] MySQL 命令行工具已安装
)

:: 检查后端依赖
echo.
echo [检查] 后端依赖...
cd crm-backend
if not exist "node_modules" (
    echo [安装] 正在安装后端依赖...
    call npm install
    if %errorlevel% neq 0 (
        echo [错误] 后端依赖安装失败
        cd ..
        pause
        exit /b 1
    )
)
cd ..

:: 检查前端依赖
echo [检查] 前端依赖...
cd crm-frontend
if not exist "node_modules" (
    echo [安装] 正在安装前端依赖...
    call npm install
    if %errorlevel% neq 0 (
        echo [错误] 前端依赖安装失败
        cd ..
        pause
        exit /b 1
    )
)
cd ..

echo.
echo ============================================================
echo           开始启动 CRM 系统
echo ============================================================
echo.

:: 运行启动脚本
node start.js

:: 如果脚本异常退出，暂停以显示错误信息
if %errorlevel% neq 0 (
    echo.
    echo [错误] 启动脚本异常退出
    pause
)