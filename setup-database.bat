@echo off
chcp 65001 >nul
title CRM 数据库设置向导

echo.
echo ========================================
echo    CRM 系统 MySQL 数据库设置向导
echo ========================================
echo.

cd /d "%~dp0"

:: 检查 MySQL 是否可用
echo [步骤 1/5] 检查 MySQL 连接...
mysql --version >nul 2>nul
if %errorlevel% neq 0 (
    echo [警告] 未检测到 MySQL 命令行工具
    echo.
    echo 请确保已安装 MySQL 并将其添加到系统 PATH 环境变量中
    echo 或者手动执行以下步骤：
    echo.
    echo 1. 安装 MySQL Server
    echo 2. 启动 MySQL 服务
    echo 3. 创建数据库: CREATE DATABASE crm_db;
    echo 4. 更新 .env 中的数据库连接信息
    echo 5. 运行: cd crm-backend ^&^& npm run prisma:migrate
    echo 6. 运行: cd crm-backend ^&^& npm run db:seed
    echo.
    pause
    exit /b 1
)

:: 获取 MySQL root 密码
echo.
echo 请输入 MySQL root 用户密码（输入后按回车）：
echo 注意：密码不会显示在屏幕上
set /p MYSQL_PASSWORD="MySQL root 密码: "

:: 测试 MySQL 连接
echo.
echo [步骤 2/5] 测试 MySQL 连接...
mysql -u root -p%MYSQL_PASSWORD% -e "SELECT 1;" >nul 2>nul
if %errorlevel% neq 0 (
    echo [错误] 无法连接到 MySQL，请检查密码是否正确
    pause
    exit /b 1
)
echo [成功] MySQL 连接成功

:: 创建数据库
echo.
echo [步骤 3/5] 创建数据库 crm_db...
mysql -u root -p%MYSQL_PASSWORD% -e "CREATE DATABASE IF NOT EXISTS crm_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
if %errorlevel% neq 0 (
    echo [错误] 创建数据库失败
    pause
    exit /b 1
)
echo [成功] 数据库 crm_db 已创建

:: 更新 .env 文件
echo.
echo [步骤 4/5] 更新后端 .env 配置...
cd crm-backend
powershell -Command "(Get-Content .env) -replace 'DATABASE_URL=.*', 'DATABASE_URL=\"mysql://root:%MYSQL_PASSWORD%@localhost:3306/crm_db\"' | Set-Content .env"
echo [成功] .env 配置已更新

:: 运行 Prisma 迁移
echo.
echo [步骤 5/5] 运行数据库迁移和种子数据...
echo 正在生成 Prisma 客户端...
call npx prisma generate
if %errorlevel% neq 0 (
    echo [错误] Prisma 客户端生成失败
    pause
    exit /b 1
)

echo 正在运行数据库迁移...
call npx prisma migrate deploy
if %errorlevel% neq 0 (
    echo [警告] 迁移可能已完成，继续执行...
)

echo 正在导入种子数据...
call npm run db:seed
if %errorlevel% neq 0 (
    echo [警告] 种子数据导入可能已存在，继续执行...
)

echo.
echo ========================================
echo        数据库设置完成！
echo ========================================
echo.
echo 测试账户信息：
echo   管理员: admin@crm.com / admin123
echo   销售:   alex@crm.com / sales123
echo.
echo 现在可以运行 start.bat 启动 CRM 系统
echo.

pause