@echo off
echo 🚀 E-Commerce Microservices Setup
echo =================================

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running. Please start Docker first.
    pause
    exit /b 1
)

echo ✅ Docker is running

REM Check if docker-compose is available
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ docker-compose is not installed. Please install docker-compose first.
    pause
    exit /b 1
)

echo ✅ docker-compose is available

REM Stop existing containers
echo 🛑 Stopping existing containers...
docker-compose -f docker-compose.dev.yml down 2>nul

REM Build and start services
echo 🏗️  Building and starting services...
docker-compose -f docker-compose.dev.yml up --build -d

REM Wait for services to be ready
echo ⏳ Waiting for services to start...
timeout /t 10 /nobreak >nul

REM Check API Gateway
echo 🔍 Checking API Gateway...
timeout /t 5 /nobreak >nul
curl -s http://localhost:4000/api/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ API Gateway is running on http://localhost:4000
) else (
    echo ⚠️  API Gateway not yet ready (this is normal on first startup)
)

REM Check Frontend
echo 🔍 Checking Frontend...
timeout /t 5 /nobreak >nul
curl -s http://localhost:3000 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Frontend is running on http://localhost:3000
) else (
    echo ⚠️  Frontend not yet ready (this is normal on first startup)
)

echo.
echo 🎉 Setup Complete!
echo ==================
echo.
echo 🌐 Access the application:
echo    Frontend:    http://localhost:3000
echo    API Gateway: http://localhost:4000
echo.
echo 📊 View logs:
echo    All services: docker-compose -f docker-compose.dev.yml logs -f
echo    Frontend:     docker-compose -f docker-compose.dev.yml logs -f frontend
echo    API Gateway:  docker-compose -f docker-compose.dev.yml logs -f api-gateway
echo.
echo 🛑 Stop services:
echo    docker-compose -f docker-compose.dev.yml down
echo.
echo 📖 For detailed demo instructions, see DEMO_SETUP.md
pause
