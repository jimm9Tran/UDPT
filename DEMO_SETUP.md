# E-Commerce Microservices Demo Setup

This project is a complete microservices-based e-commerce system with a React frontend, API Gateway, and multiple backend services.

## 🏗️ Architecture Overview

### Services:
- **Frontend**: React + TailwindCSS (Port 3000)
- **API Gateway**: Express.js (Port 4000)
- **User Service**: Authentication & User Management (Port 3000 internal)
- **Product Service**: Product Catalog (Port 3001 internal)
- **Order Service**: Order Management (Port 3002 internal)
- **Payment Service**: Payment Processing with VNPay (Port 3003 internal)
- **Expiration Service**: Order expiration handling
- **NATS Streaming**: Event bus for microservices communication
- **MongoDB**: Database for all services
- **Redis**: Caching and session management

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local development)
- Git

### 1. Clone and Setup
```bash
git clone <your-repo>
cd <project-directory>
```

### 2. Environment Configuration
The `.env` file is already configured for Docker development. Key variables:
- MongoDB: Local Docker containers
- NATS: Event streaming
- VNPay: Payment integration (sandbox)
- JWT: Authentication

### 3. Start All Services
```bash
# Build and start all services
docker-compose -f docker-compose.dev.yml up --build

# Or run in background
docker-compose -f docker-compose.dev.yml up -d --build
```

### 4. Access the Application
- **Frontend**: http://localhost:3005
- **API Gateway**: http://localhost:4000
- **MongoDB**: localhost:27017
- **NATS**: localhost:4222

## 🎯 Demo Workflow

### 1. User Registration & Login
1. Go to http://localhost:3005
2. Click "Register" → Create a new account
3. Login with your credentials
4. JWT token is automatically managed

### 2. Browse Products
1. Visit "Products" page
2. Use search functionality
3. Filter and browse catalog
4. Click on products for details

### 3. Shopping Cart
1. Add products to cart from product detail pages
2. View cart from navbar (cart icon shows item count)
3. Modify quantities in cart
4. Remove items

### 4. Checkout Process
1. Go to Cart → "Proceed to Checkout"
2. Fill shipping information
3. Choose payment method:
   - **VNPay**: Redirects to VNPay sandbox
   - **Cash on Delivery**: Direct order creation
4. Complete order

### 5. Order Management
1. View order history in "Orders" page
2. Click on orders to see detailed information
3. Track order status

### 6. Admin Features
1. Login as admin (create admin user via API or modify user role in database)
2. Access `/admin` route
3. View dashboard with:
   - Total orders, revenue, users
   - Recent orders
   - System statistics

## 🛠️ Development Guide

### Local Development (without Docker)
```bash
# Start infrastructure
docker-compose -f docker-compose.dev.yml up mongo nats redis

# Start each service
cd user && npm install && npm run dev
cd product && npm install && npm run dev
cd order && npm install && npm run dev
cd payment && npm install && npm run dev
cd expiration && npm install && npm run dev
cd api-gateway && npm install && npm run dev
cd frontend && npm install && npm start
```

### Testing API Endpoints

#### User Service (via API Gateway)
```bash
# Register
curl -X POST http://localhost:4000/api/users/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# Login
curl -X POST http://localhost:4000/api/users/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

#### Product Service
```bash
# Get products
curl http://localhost:4000/api/products

# Create product (admin only)
curl -X POST http://localhost:4000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <jwt-token>" \
  -d '{"title":"Test Product","description":"Test Description","price":99.99,"category":"Electronics"}'
```

#### Order Service
```bash
# Create order
curl -X POST http://localhost:4000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <jwt-token>" \
  -d '{"items":[{"productId":"<product-id>","quantity":2}],"shippingAddress":"123 Main St"}'
```

## 🔧 Troubleshooting

### Common Issues

1. **Port Conflicts**
   ```bash
   # Check ports
   netstat -tulpn | grep LISTEN
   
   # Kill processes on specific ports
   sudo kill -9 $(sudo lsof -t -i:3000)
   ```

2. **MongoDB Connection Issues**
   ```bash
   # Check MongoDB status
   docker logs <mongo-container-id>
   
   # Reset MongoDB data
   docker-compose down -v
   docker-compose up --build
   ```

3. **NATS Connection Issues**
   ```bash
   # Check NATS logs
   docker logs <nats-container-id>
   
   # Restart NATS
   docker-compose restart nats
   ```

4. **Frontend Not Loading**
   ```bash
   # Check if API Gateway is running
   curl http://localhost:4000/api/health
   
   # Check frontend logs
   docker logs <frontend-container-id>
   ```

### Database Access
```bash
# Access MongoDB
docker exec -it <mongo-container> mongo

# View databases
show dbs

# Use specific database
use User
db.users.find()
```

### Logs Monitoring
```bash
# All services
docker-compose -f docker-compose.dev.yml logs -f

# Specific service
docker-compose -f docker-compose.dev.yml logs -f frontend
docker-compose -f docker-compose.dev.yml logs -f api-gateway
```

## 📱 Frontend Features

### User Interface
- **Responsive Design**: Mobile-first with TailwindCSS
- **Authentication**: JWT-based with auto-refresh
- **Shopping Cart**: Persistent with localStorage
- **Real-time Updates**: Toast notifications
- **Route Protection**: Protected routes for authenticated users

### Pages
- **Home**: Hero section, features, bestsellers
- **Products**: Catalog with search and filtering
- **Product Detail**: Individual product pages
- **Cart**: Shopping cart management
- **Checkout**: Order creation and payment
- **Orders**: Order history and tracking
- **Admin**: Dashboard with analytics

## 🔐 Security Features

- JWT authentication with refresh tokens
- Protected API routes
- CORS configuration
- Rate limiting on API Gateway
- Input validation and sanitization
- Secure payment processing

## 🚀 Production Deployment

For production deployment:

1. Update environment variables for production databases
2. Use production MongoDB Atlas instead of local MongoDB
3. Configure proper secrets management
4. Set up SSL/TLS certificates
5. Use production VNPay credentials
6. Implement logging and monitoring
7. Set up CI/CD pipeline

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review service logs
3. Ensure all environment variables are set correctly
4. Verify Docker containers are running

## 🎉 Demo Scenarios

### Complete Purchase Flow
1. Register → Login → Browse Products → Add to Cart → Checkout → Payment → Order Confirmation

### Admin Management
1. Login as admin → View dashboard → Manage orders → Monitor system health

### Payment Testing
- Use VNPay sandbox credentials for testing payments
- Test both successful and failed payment scenarios
