#!/bin/bash

echo "🎯 E-commerce Microservices - Complete Setup & Deployment"
echo "========================================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Make all scripts executable
echo "${BLUE}🔧 Making scripts executable...${NC}"
chmod +x *.sh

echo ""
echo "${BLUE}1️⃣  Checking System Prerequisites${NC}"
echo "================================="

# Check Docker
if command -v docker &> /dev/null; then
    echo "✅ Docker is installed"
    docker --version
else
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check Docker Compose
if command -v docker-compose &> /dev/null; then
    echo "✅ Docker Compose is installed"
    docker-compose --version
else
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check curl
if command -v curl &> /dev/null; then
    echo "✅ curl is available"
else
    echo "❌ curl is not installed. Please install curl first."
    exit 1
fi

echo ""
echo "${BLUE}2️⃣  Checking Configuration Synchronization${NC}"
echo "=========================================="

# Run sync check
./check-sync.sh

echo ""
echo "${BLUE}3️⃣  System Deployment Options${NC}"
echo "=============================="

echo "Please choose deployment option:"
echo "1) 🚀 Quick Start (Recommended)"
echo "2) 🔧 Development Setup with Logs"
echo "3) 🧪 Start + Run Tests"
echo "4) ❌ Exit"

read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        echo ""
        echo "${GREEN}🚀 Starting Quick Deployment...${NC}"
        ./start-synchronized.sh
        ;;
    2)
        echo ""
        echo "${GREEN}🔧 Starting Development Setup...${NC}"
        ./start-synchronized.sh
        echo ""
        echo "${YELLOW}📋 Showing service logs (Press Ctrl+C to stop)...${NC}"
        sleep 3
        docker-compose logs -f
        ;;
    3)
        echo ""
        echo "${GREEN}🧪 Starting System + Running Tests...${NC}"
        ./start-synchronized.sh
        echo ""
        echo "${YELLOW}⏳ Waiting 30 seconds for system to stabilize...${NC}"
        sleep 30
        echo ""
        echo "${BLUE}🧪 Running Comprehensive Tests...${NC}"
        ./test-system-comprehensive.sh
        ;;
    4)
        echo ""
        echo "${YELLOW}👋 Setup cancelled.${NC}"
        exit 0
        ;;
    *)
        echo ""
        echo "${RED}❌ Invalid choice. Please run the script again.${NC}"
        exit 1
        ;;
esac

echo ""
echo "${GREEN}✨ Setup Complete!${NC}"
echo "=================="
echo ""
echo "${BLUE}🌐 Application URLs:${NC}"
echo "Frontend:        http://localhost:3005"
echo "API Gateway:     http://localhost:4000"
echo "Admin Panel:     http://localhost:3005/admin"
echo ""
echo "${BLUE}🔑 Admin Credentials:${NC}"
echo "Email:           admin@gmail.com"
echo "Password:        admin123"
echo ""
echo "${BLUE}📊 Infrastructure:${NC}"
echo "MongoDB:         mongodb://localhost:27017"
echo "Redis:           redis://localhost:6379"
echo "NATS Monitor:    http://localhost:8222"
echo ""
echo "${BLUE}🔧 Management Commands:${NC}"
echo "View logs:       docker-compose logs -f [service-name]"
echo "Stop system:     docker-compose down"
echo "Restart:         docker-compose restart [service-name]"
echo "Check status:    docker-compose ps"
echo ""
echo "${BLUE}🧪 Testing:${NC}"
echo "Run tests:       ./test-system-comprehensive.sh"
echo "Check admin:     ./test-admin-functionality.sh"
echo ""
echo "${GREEN}🎉 Your E-commerce Microservices system is ready!${NC}"
