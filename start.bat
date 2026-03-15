@echo off
chcp 65001 >nul
title CRM系统启动器

echo.
echo ========================================
echo        CRM 系统一键启动
echo ========================================
echo.

cd /d "%~dp0"

:: 检查 Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [错误] 未找到 Node.js，请先安装 Node.js
    pause
    exit /b 1
)

:: 运行启动脚本
node start.js

pause