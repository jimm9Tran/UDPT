# Quick Start Guide

## 🚀 For Demo/Testing (Recommended)

### Using Setup Script
```bash
# macOS/Linux
./setup.sh

# Windows
setup.bat
```

### Manual Docker Setup
```bash
# Start all services
docker-compose -f docker-compose.dev.yml up --build

# Or in background
docker-compose -f docker-compose.dev.yml up --build -d
```

**Access Points:**
- Frontend: http://localhost:3005
- API Gateway: http://localhost:4000

## 🛠️ For Development

### Option 1: Full Docker (Easiest)
```bash
npm run start
# or
npm run start:detached
```

### Option 2: Hybrid (Infrastructure in Docker, Services Local)
```bash
# Start infrastructure only
npm run dev:infrastructure

# In separate terminals, start services locally
cd user && npm run dev
cd product && npm run dev
cd order && npm run dev
cd payment && npm run dev
cd expiration && npm run dev
cd api-gateway && npm run dev
cd frontend && npm start
```

### Option 3: Frontend Development Only
```bash
# Start all backend services
docker-compose -f docker-compose.dev.yml up --build api-gateway user-service product-service order-service payment-service expiration-service mongo nats redis

# Start frontend locally for hot reload
npm run dev:frontend
```

## 📱 Testing the Application

### 1. User Flow Test
1. Register at http://localhost:3005/register
2. Login at http://localhost:3005/login
3. Browse products at http://localhost:3005/products
4. Add items to cart
5. Checkout at http://localhost:3005/checkout
6. View orders at http://localhost:3005/orders

### 2. API Testing
```bash
# Health check
npm run test:api

# User registration
curl -X POST http://localhost:4000/api/users/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# Get products
curl http://localhost:4000/api/products
```

### 3. Admin Testing
1. Create admin user (modify user role in database or API)
2. Access http://localhost:3005/admin
3. View dashboard and manage orders

## 🔧 Useful Commands

```bash
# View logs
npm run logs                # All services
npm run logs:frontend       # Frontend only
npm run logs:gateway        # API Gateway only

# Restart services
npm run restart             # All services
npm run restart:frontend    # Frontend only

# Stop everything
npm run stop               # Stop containers
npm run stop:volumes       # Stop and remove data

# Check status
npm run ps                 # Show running containers

# Clean up
npm run clean              # Remove unused Docker resources
```

## 🐛 Quick Troubleshooting

### Services not starting?
```bash
# Check Docker
docker --version
docker-compose --version

# Check ports
netstat -tulpn | grep :3000
netstat -tulpn | grep :4000

# Reset everything
npm run stop:volumes
npm run start
```

### Frontend not loading?
```bash
# Check API Gateway
curl http://localhost:4000/api/health

# Check frontend logs
npm run logs:frontend
```

### Database issues?
```bash
# Reset MongoDB data
npm run stop:volumes
npm run start
```

## 📋 Environment Variables

Key variables in `.env`:
- `JWT_KEY`: Authentication secret
- `MONGO_URI_*`: Database connections  
- `NATS_*`: Event streaming config
- `VNPAY_*`: Payment integration
- `REACT_APP_API_URL`: Frontend API endpoint

## 🎯 Demo Scenarios

### Basic E-commerce Flow
1. **Register** → Create account
2. **Browse** → View product catalog  
3. **Cart** → Add/remove items
4. **Checkout** → Complete purchase
5. **Orders** → Track order history

### Payment Testing
- **VNPay**: Use sandbox for testing
- **COD**: Direct order completion

### Admin Features
- **Dashboard**: View system statistics
- **Orders**: Manage customer orders
- **Products**: Catalog management

## 📚 Documentation
- `DEMO_SETUP.md` - Detailed setup guide
- `README.md` - Project overview
- `/frontend/README.md` - Frontend specifics
- `/api-gateway/README.md` - Gateway details
