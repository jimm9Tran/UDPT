# 🛍️ Jimm9-Shop

A comprehensive e-commerce platform built with microservices architecture, featuring modern web technologies, event-driven communication, and scalable design patterns.

## 🎉 Demo Ready - Complete E-commerce Platform

**Frontend**: http://localhost:3005  
**API Gateway**: http://localhost:4000  

**Admin Login**: `admin@gmail.com` / `admin123`  
**Customer Login**: `customer@gmail.com` / `customer123`  

### 🚀 Quick Start
```bash
# Start all services
docker-compose -f docker-compose.dev.yml up -d

# Test the system
./test-system.sh

# View status
docker-compose -f docker-compose.dev.yml ps
```

## 📋 Table of Contents

- [System Architecture](#-system-architecture)
- [Microservices Overview](#-microservices-overview)
- [Technology Stack](#-technology-stack)
- [Data Flow & Business Logic](#-data-flow--business-logic)
- [API Documentation](#-api-documentation)
- [Setup & Deployment](#-setup--deployment)
- [Use Cases & Scenarios](#-use-cases--scenarios)
- [Infrastructure](#-infrastructure)

## 🏗️ System Architecture

The system follows a microservices architecture with the following core principles:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React App     │    │   API Gateway   │    │  Microservices  │
│                 │    │                 │    │                 │
│  - Shopping UI  │◄──►│  - Routing      │◄──►│  - User         │
│  - Admin Panel  │    │  - CORS         │    │  - Product      │
│  - Auth Flow    │    │  - Middleware   │    │  - Order        │
└─────────────────┘    └─────────────────┘    │  - Payment      │
                                              │  - Expiration   │
                                              └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  NATS Streaming │
                    │                 │
                    │  Event Bus for  │
                    │  Inter-service  │
                    │  Communication  │
                    └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │    MongoDB      │
                    │                 │
                    │  Database per   │
                    │  Service        │
                    └─────────────────┘
```

### Core Architecture Patterns

- **API Gateway Pattern**: Single entry point for all client requests
- **Database per Service**: Each microservice owns its data
- **Event-Driven Architecture**: Asynchronous communication via NATS
- **CQRS**: Command Query Responsibility Segregation for complex operations
- **Circuit Breaker**: Resilience patterns for service failures

## 🔧 Microservices Overview

### 1. 👤 User Service
**Purpose**: Manages user authentication, authorization, and profile management

**Technologies**:
- Node.js + TypeScript + Express.js
- MongoDB (User database)
- JWT for authentication
- bcrypt for password hashing

**Key Features**:
- User registration and login
- JWT token generation and validation
- Role-based access control (Admin/Customer)
- Password reset functionality
- User profile management

**Endpoints**:
- `POST /api/users/signup` - User registration
- `POST /api/users/signin` - User login
- `GET /api/users/currentuser` - Get current user
- `POST /api/users/signout` - User logout

### 2. 📦 Product Service
**Purpose**: Manages product catalog, inventory, and product information

**Technologies**:
- Node.js + TypeScript + Express.js
- MongoDB (Product database)
- Multer for image uploads
- Image processing capabilities

**Key Features**:
- Product CRUD operations
- Category management
- Inventory tracking
- Product search and filtering
- Image upload and management
- Stock level monitoring

**Endpoints**:
- `GET /api/products` - List products with pagination
- `POST /api/products` - Create new product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)
- `GET /api/products/:id` - Get product details

### 3. 🛒 Order Service
**Purpose**: Handles order lifecycle, cart management, and order processing

**Technologies**:
- Node.js + TypeScript + Express.js
- MongoDB (Order database)
- NATS Streaming for event publishing
- Complex order state management

**Key Features**:
- Shopping cart functionality
- Order creation and management
- Order status tracking
- Inventory reservation
- Integration with payment service
- Order history

**Endpoints**:
- `POST /api/orders` - Create new order
- `GET /api/orders` - List user orders
- `GET /api/orders/:id` - Get order details
- `PATCH /api/orders/:id` - Update order status

**Order States**:
- `Created` → `AwaitingPayment` → `Complete` → `Cancelled`

### 4. 💳 Payment Service
**Purpose**: Processes payments and manages payment methods

**Technologies**:
- Node.js + TypeScript + Express.js
- MongoDB (Payment database)
- VNPay integration
- Cash on Delivery (COD) support
- Stripe integration (configurable)

**Key Features**:
- Multiple payment methods (VNPay, COD, Stripe)
- Payment processing and validation
- Payment status tracking
- Refund handling
- Payment history

**Endpoints**:
- `POST /api/payments` - Process payment
- `GET /api/payments/:orderId` - Get payment status
- `POST /api/payments/vnpay-return` - VNPay callback
- `POST /api/payments/vnpay-ipn` - VNPay IPN handler

### 5. ⏱️ Expiration Service
**Purpose**: Manages time-sensitive operations and automatic cleanups

**Technologies**:
- Node.js + TypeScript
- Bull Queue for job scheduling
- Redis for job storage
- NATS for event publishing

**Key Features**:
- Order expiration handling
- Automatic inventory release
- Scheduled cleanup tasks
- Payment timeout management

**Event Handling**:
- Listens to `OrderCreated` events
- Sets expiration timers
- Publishes `OrderExpired` events

### 6. 🌐 API Gateway
**Purpose**: Routes requests, handles CORS, and provides middleware

**Technologies**:
- Node.js + Express.js
- http-proxy-middleware
- CORS configuration
- Request logging

**Key Features**:
- Request routing to appropriate services
- CORS handling
- Request/response logging
- Load balancing (configurable)
- Rate limiting (configurable)

**Routing Configuration**:
```javascript
/api/users/* → User Service (3001)
/api/products/* → Product Service (3002)
/api/orders/* → Order Service (3003)
/api/payments/* → Payment Service (3004)
```

### 7. 🎨 Frontend Service
**Purpose**: User interface for customers and administrators

**Technologies**:
- React 18
- TypeScript
- TailwindCSS
- Axios for API calls
- React Router for navigation

**Key Features**:
- Responsive design
- Shopping cart functionality
- User authentication
- Admin dashboard
- Product catalog browsing
- Order management
- Payment integration

## 💻 Technology Stack

### Backend Services
| Service | Language | Framework | Database | Key Libraries |
|---------|----------|-----------|----------|---------------|
| User | TypeScript | Express.js | MongoDB | JWT, bcrypt |
| Product | TypeScript | Express.js | MongoDB | Multer, Mongoose |
| Order | TypeScript | Express.js | MongoDB | NATS, Bull |
| Payment | TypeScript | Express.js | MongoDB | VNPay SDK |
| Expiration | TypeScript | Node.js | Redis | Bull Queue |
| API Gateway | JavaScript | Express.js | - | http-proxy-middleware |

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 | UI Framework |
| TypeScript | Type Safety |
| TailwindCSS | Styling |
| Axios | HTTP Client |
| React Router | Navigation |

### Infrastructure
| Component | Technology | Purpose |
|-----------|------------|---------|
| Message Broker | NATS Streaming | Event-driven communication |
| Database | MongoDB | Data persistence |
| Cache/Queue | Redis | Job queues and caching |
| Containerization | Docker | Service isolation |
| Orchestration | Docker Compose | Local development |

## 📊 Data Flow & Business Logic

### 1. User Registration & Authentication Flow

```
User Registration:
Frontend → API Gateway → User Service → MongoDB
                     ↓
              JWT Token Generated
                     ↓
              Response to Frontend
```

**Business Logic**:
1. User submits registration form
2. User service validates email uniqueness
3. Password is hashed using bcrypt
4. User record created in database
5. JWT token generated and returned

### 2. Product Management Flow

```
Product Creation (Admin):
Frontend → API Gateway → Product Service → MongoDB
                     ↓
              Product Created Event
                     ↓
              NATS → Other Services
```

**Business Logic**:
1. Admin creates/updates product
2. Product service validates data
3. Images processed and stored
4. Product saved to database
5. ProductCreated event published

### 3. Order Processing Flow

```
Order Creation:
Frontend → API Gateway → Order Service → MongoDB
                     ↓
              OrderCreated Event
                     ↓
              NATS → Payment Service
                   → Expiration Service
                   → Product Service (inventory)
```

**Business Logic**:
1. User adds items to cart
2. Order service validates inventory
3. Order created with `Created` status
4. Inventory temporarily reserved
5. OrderCreated event published
6. Expiration timer set (15 minutes)
7. Payment process initiated

### 4. Payment Processing Flow

```
Payment Flow:
Order Service → Payment Service → External Gateway (VNPay)
            ↓                              ↓
    PaymentCreated Event              Payment Response
            ↓                              ↓
         NATS Bus                  Payment Status Update
            ↓                              ↓
    Order Service ← PaymentCompleted Event
```

**Business Logic**:
1. Payment service receives payment request
2. Validates order and amount
3. Processes payment via selected method
4. Updates payment status
5. Publishes PaymentCompleted/Failed event
6. Order service updates order status

### 5. Inventory Management Flow

```
Inventory Updates:
Order Created → Inventory Reserved
Payment Failed → Inventory Released  
Order Expired → Inventory Released
Order Complete → Inventory Committed
```

**Business Logic**:
- **Reservation**: Inventory held during payment process
- **Release**: Inventory returned on failure/expiration
- **Commit**: Final inventory deduction on successful payment

## 🔌 API Documentation

### Authentication Endpoints
```
POST /api/users/signup
POST /api/users/signin
GET /api/users/currentuser
POST /api/users/signout
```

### Product Endpoints
```
GET /api/products              # List products
GET /api/products/:id          # Get product details
POST /api/products             # Create product (Admin)
PUT /api/products/:id          # Update product (Admin)
DELETE /api/products/:id       # Delete product (Admin)
```

### Order Endpoints
```
POST /api/orders              # Create order
GET /api/orders               # List user orders
GET /api/orders/:id           # Get order details
PATCH /api/orders/:id         # Update order status
```

### Payment Endpoints
```
POST /api/payments            # Process payment
GET /api/payments/:orderId    # Get payment status
POST /api/payments/vnpay-return  # VNPay callback
```

### Request/Response Examples

**Create Order**:
```json
POST /api/orders
{
  "items": [
    {
      "productId": "64f1e2d4c8d1a2b3c4d5e6f7",
      "quantity": 2,
      "price": 29.99
    }
  ],
  "shippingAddress": {
    "street": "123 Main St",
    "city": "Ho Chi Minh City",
    "country": "Vietnam"
  }
}
```

**Response**:
```json
{
  "id": "64f1e2d4c8d1a2b3c4d5e6f8",
  "status": "created",
  "items": [...],
  "totalAmount": 59.98,
  "createdAt": "2023-09-01T10:00:00.000Z"
}
```

## 🚀 Setup & Deployment

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local development)
- MongoDB (for local development)

### Environment Variables

Create `.env` files in each service directory:

**User Service (.env)**:
```env
JWT_KEY=your-jwt-secret
MONGO_URI=mongodb://localhost:27017/users
NATS_URL=nats://localhost:4222
```

**Payment Service (.env)**:
```env
VNPAY_TMN_CODE=your-vnpay-code
VNPAY_SECRET_KEY=your-vnpay-secret
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
```

### Development Setup

1. **Clone and Install**:
```bash
git clone <repository-url>
cd e-commerce-microservices
npm install
```

2. **Start Infrastructure**:
```bash
docker-compose -f docker-compose.dev.yml up -d
```

3. **Install Service Dependencies**:
```bash
cd user && npm install
cd ../product && npm install
cd ../order && npm install
cd ../payment && npm install
cd ../expiration && npm install
cd ../frontend && npm install
```

4. **Start Services**:
```bash
# Terminal 1 - User Service
cd user && npm run dev

# Terminal 2 - Product Service  
cd product && npm run dev

# Terminal 3 - Order Service
cd order && npm run dev

# Terminal 4 - Payment Service
cd payment && npm run dev

# Terminal 5 - Expiration Service
cd expiration && npm run dev

# Terminal 6 - API Gateway
cd api-gateway && npm start

# Terminal 7 - Frontend
cd frontend && npm start
```

### Production Deployment

1. **Build Docker Images**:
```bash
docker-compose build
```

2. **Deploy with Docker Compose**:
```bash
docker-compose up -d
```

3. **Kubernetes Deployment** (optional):
```bash
kubectl apply -f k8s/
```

## 🎯 Use Cases & Scenarios

### Customer Journey

1. **Registration & Login**:
   - User visits frontend application
   - Registers new account or logs in
   - JWT token stored for authentication

2. **Product Browsing**:
   - Browse product catalog
   - Filter by category, price, ratings
   - View product details and images

3. **Shopping Cart**:
   - Add products to cart
   - Modify quantities
   - View cart total and items

4. **Checkout Process**:
   - Provide shipping information
   - Select payment method
   - Review order details
   - Place order

5. **Payment**:
   - Process payment via VNPay or COD
   - Receive payment confirmation
   - Order status updated

6. **Order Tracking**:
   - View order history
   - Track order status
   - Receive notifications

### Admin Journey

1. **Admin Dashboard**:
   - Login with admin credentials
   - Access admin panel

2. **Product Management**:
   - Add new products
   - Update product information
   - Manage inventory levels
   - Upload product images

3. **Order Management**:
   - View all orders
   - Update order status
   - Process refunds
   - Generate reports

### Error Scenarios

1. **Payment Failure**:
   - Order expires after 15 minutes
   - Inventory automatically released
   - User notified of failure

2. **Service Downtime**:
   - Circuit breaker patterns
   - Graceful degradation
   - Error messages to users

3. **Inventory Issues**:
   - Out of stock notifications
   - Backorder handling
   - Inventory synchronization

## 🏗️ Infrastructure

### Service Ports
- Frontend: 3005
- API Gateway: 4000
- User Service: 3001
- Product Service: 3002
- Order Service: 3003
- Payment Service: 3004
- Expiration Service: 3006

### External Dependencies
- MongoDB: 27017
- NATS Streaming: 4222
- Redis: 6379

### Monitoring & Logging
- Service health checks
- Request/response logging
- Error tracking
- Performance monitoring

### Security
- JWT-based authentication
- CORS configuration
- Input validation
- SQL injection prevention
- XSS protection


**Status**: ✅ **FULLY OPERATIONAL & DEMO READY**
