# 🛍️ Jimm9-Shop Microservices System

A fully functional e-commerce system built with microservices architecture, featuring React frontend, Node.js/TypeScript backend services, and comprehensive payment integration.

### ⚡ Quick Start Demo

**Frontend**: http://localhost:3005  
**API Gateway**: http://localhost:4000  

**Admin Login**: `admin@gmail.com` / `admin123`  
**Customer Login**: `customer@gmail.com` / `customer123`  

### 🚀 Start the System
```bash
# Start all services
docker-compose -f docker-compose.dev.yml up -d

# Test the system
./test-system.sh

# View status
docker-compose -f docker-compose.dev.yml ps
```

### 📖 Documentation
- 📋 [Complete Setup Guide](DEMO_SETUP.md)
- 🔄 [Demo Workflow](DEMO_WORKFLOW.md)
- ✅ [System Status](DEMO_STATUS.md)
- ⚡ [Quick Start Guide](QUICKSTART.md)

### 🏗️ Architecture
- **Frontend**: React + TailwindCSS
- **Backend**: Node.js + TypeScript microservices
- **Database**: MongoDB per service
- **Messaging**: NATS Streaming
- **Payment**: VNPay + COD integration
- **Infrastructure**: Docker + Docker Compose

### ✨ Features
- 🛒 Shopping cart & checkout
- 👤 User authentication & profiles  
- 📱 Responsive mobile design
- 💳 Multiple payment methods
- 📊 Admin dashboard
- 🔍 Product search & filtering
- 📦 Order management
- 🔐 JWT-based security

**Status**: ✅ **FULLY OPERATIONAL & DEMO READY**
