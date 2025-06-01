# 🧪 E-commerce System Testing Guide with Postman

## 📋 Overview
This guide provides a comprehensive testing workflow using Postman to test the entire e-commerce microservices system logic with the admin account.

## 🏗️ System Architecture
- **API Gateway**: http://localhost:4000 (Main entry point)
- **User Service**: http://localhost:3000
- **Product Service**: http://localhost:3001  
- **Order Service**: http://localhost:3002
- **Payment Service**: http://localhost:3003
- **Frontend**: http://localhost:3005

## 👥 Test Accounts Available

### Admin Account (Full Privileges)
- **Email**: `admin@example.com`
- **Password**: `admin123`
- **Capabilities**: Create/manage products, view all orders, access admin dashboard

### Customer Account (Standard User)
- **Email**: `customer@gmail.com` 
- **Password**: `customer123`
- **Capabilities**: Shop, create orders, view own orders

## 🚀 Getting Started

### 1. Import Postman Collection
1. Open Postman
2. Click **Import** 
3. Select the file: `E-commerce-Testing-Collection.postman_collection.json`
4. The collection will be imported with all pre-configured requests

### 2. Environment Setup
Set these variables in your Postman environment:
```
baseUrl: http://localhost:4000
adminToken: (will be auto-populated after login)
userToken: (will be auto-populated after login)
productId: (will be auto-populated when creating products)
orderId: (will be auto-populated when creating orders)
```

## 🧪 Complete Testing Workflow

### Phase 1: System Health Check
**Purpose**: Verify all services are running

#### 1.1 Test API Gateway Health
```
GET {{baseUrl}}/health
Expected: 200 OK with service status
```

#### 1.2 Test All Services Health  
```
GET {{baseUrl}}/health/services
Expected: 200 OK with all microservices status
```

### Phase 2: Authentication & Authorization
**Purpose**: Test admin login and permissions

#### 2.1 Admin Login
```
POST {{baseUrl}}/api/users/signin
Body: {
  "email": "admin@example.com", 
  "password": "admin123"
}
Expected: 200 OK with admin token
Auto-saves: adminToken variable
```

#### 2.2 Verify Admin Profile
```
GET {{baseUrl}}/api/users/currentuser
Headers: Authorization: Bearer {{adminToken}}
Expected: 200 OK with admin user details (isAdmin: true)
```

#### 2.3 Test Admin Privileges
```
GET {{baseUrl}}/api/users
Headers: Authorization: Bearer {{adminToken}}
Expected: 200 OK with list of all users (admin-only endpoint)
```

### Phase 3: Product Management (Admin Functions)
**Purpose**: Test product CRUD operations

#### 3.1 Create Product (Admin Only)
```
POST {{baseUrl}}/api/products
Headers: 
  Content-Type: application/json
  Authorization: Bearer {{adminToken}}
Body: {
  "title": "Test iPhone 15 Pro",
  "description": "Latest iPhone for testing",
  "price": 1199,
  "category": "Electronics",
  "brand": "Apple",
  "stockQuantity": 100,
  "specifications": {
    "storage": "256GB",
    "color": "Natural Titanium",
    "display": "6.1-inch Super Retina XDR"
  }
}
Expected: 201 Created with product details
Auto-saves: productId variable
```

#### 3.2 Get All Products
```
GET {{baseUrl}}/api/products
Expected: 200 OK with product catalog
```

#### 3.3 Get Product by ID
```
GET {{baseUrl}}/api/products/{{productId}}
Expected: 200 OK with specific product details
```

#### 3.4 Update Product (Admin Only)
```
PUT {{baseUrl}}/api/products/{{productId}}
Headers:
  Content-Type: application/json
  Authorization: Bearer {{adminToken}}
Body: {
  "title": "Updated iPhone 15 Pro",
  "price": 1099,
  "stockQuantity": 95
}
Expected: 200 OK with updated product
```

#### 3.5 Search Products
```
GET {{baseUrl}}/api/products/search?q=iPhone&category=Electronics
Expected: 200 OK with filtered results
```

### Phase 4: Customer Account & Shopping Flow
**Purpose**: Test customer journey

#### 4.1 Customer Login
```
POST {{baseUrl}}/api/users/signin
Body: {
  "email": "customer@gmail.com",
  "password": "customer123"  
}
Expected: 200 OK with customer token
Auto-saves: userToken variable
```

#### 4.2 Create Order (Customer)
```
POST {{baseUrl}}/api/orders
Headers:
  Content-Type: application/json
  Authorization: Bearer {{userToken}}
Body: {
  "cart": [
    {
      "productId": "{{productId}}",
      "qty": 2,
      "color": "Natural Titanium",
      "size": "256GB"
    }
  ]
}
Expected: 201 Created with order details
Auto-saves: orderId variable
```

#### 4.3 Get Customer Orders
```
GET {{baseUrl}}/api/orders/myorders
Headers: Authorization: Bearer {{userToken}}
Expected: 200 OK with customer's order history
```

#### 4.4 Get Specific Order
```
GET {{baseUrl}}/api/orders/{{orderId}}
Headers: Authorization: Bearer {{userToken}}
Expected: 200 OK with detailed order info
```

### Phase 5: Order Management (Admin Functions)
**Purpose**: Test admin order management

#### 5.1 Get All Orders (Admin Only)
```
GET {{baseUrl}}/api/orders
Headers: Authorization: Bearer {{adminToken}}
Expected: 200 OK with all system orders
```

#### 5.2 Update Order Status (Admin Only)
```
PUT {{baseUrl}}/api/orders/{{orderId}}/status
Headers:
  Content-Type: application/json
  Authorization: Bearer {{adminToken}}
Body: {
  "status": "processing"
}
Expected: 200 OK with updated order
```

#### 5.3 Deliver Order (Admin Only)
```
PATCH {{baseUrl}}/api/orders/{{orderId}}/deliver
Headers: Authorization: Bearer {{adminToken}}
Expected: 200 OK with delivered status
```

### Phase 6: Payment Processing
**Purpose**: Test payment system

#### 6.1 Create VNPay Payment
```
POST {{baseUrl}}/api/payments
Headers:
  Content-Type: application/json
  Authorization: Bearer {{userToken}}
Body: {
  "orderId": "{{orderId}}",
  "amount": 2398,
  "paymentMethod": "VNPay",
  "bankCode": "NCB"
}
Expected: 200 OK with payment URL
```

#### 6.2 Create COD Payment
```
POST {{baseUrl}}/api/payments/cod
Headers:
  Content-Type: application/json
  Authorization: Bearer {{userToken}}
Body: {
  "orderId": "{{orderId}}",
  "amount": 2398
}
Expected: 201 Created with COD payment
```

#### 6.3 Get Payment Details
```
GET {{baseUrl}}/api/payments/order/{{orderId}}
Headers: Authorization: Bearer {{userToken}}
Expected: 200 OK with payment information
```

### Phase 7: Inventory Management
**Purpose**: Test inventory system

#### 7.1 Check Inventory
```
POST {{baseUrl}}/api/products/check-inventory
Headers: Content-Type: application/json
Body: {
  "items": [
    {
      "productId": "{{productId}}",
      "quantity": 5
    }
  ]
}
Expected: 200 OK with inventory status
```

#### 7.2 Reserve Inventory
```
POST {{baseUrl}}/api/products/reserve-inventory
Headers: Content-Type: application/json
Body: {
  "items": [
    {
      "productId": "{{productId}}",
      "quantity": 2
    }
  ]
}
Expected: 200 OK with reservation details
```

## 🎯 Testing Scenarios

### Scenario 1: Complete Purchase Flow
1. Admin creates product → Customer logs in → Adds to cart → Creates order → Makes payment → Admin processes order

### Scenario 2: Admin Management Flow  
1. Admin logs in → Views all orders → Updates order status → Manages inventory → Views system health

### Scenario 3: Error Handling Flow
1. Test invalid credentials → Test unauthorized access → Test invalid product IDs → Test insufficient inventory

### Scenario 4: Concurrent Operations
1. Multiple customers ordering same product → Inventory race conditions → Payment processing

## 🔍 Key Test Points

### Authentication Tests
- ✅ Valid admin login
- ✅ Valid customer login  
- ❌ Invalid credentials
- ❌ Expired tokens
- ❌ Unauthorized access to admin endpoints

### Product Tests
- ✅ Admin can create products
- ✅ Public can view products
- ✅ Admin can update products
- ❌ Regular user cannot create products
- ✅ Search and filter functionality

### Order Tests
- ✅ Customer can create orders
- ✅ Admin can view all orders
- ✅ Customer can only view own orders
- ✅ Admin can update order status
- ❌ Invalid product in order

### Payment Tests
- ✅ VNPay payment creation
- ✅ COD payment creation
- ✅ Payment status tracking
- ❌ Invalid payment amounts
- ❌ Payment for non-existent orders

### Inventory Tests
- ✅ Stock tracking
- ✅ Inventory reservation
- ✅ Stock availability checks
- ❌ Over-ordering scenarios

## 📊 Expected Response Formats

### Successful Login Response
```json
{
  "user": {
    "id": "user_id",
    "email": "admin@example.com",
    "isAdmin": true,
    "name": "Admin User"
  },
  "token": "jwt_token_here"
}
```

### Product Creation Response
```json
{
  "id": "product_id",
  "title": "Test iPhone 15 Pro",
  "price": 1199,
  "category": "Electronics",
  "stockQuantity": 100,
  "createdAt": "2025-05-31T...",
  "updatedAt": "2025-05-31T..."
}
```

### Order Creation Response
```json
{
  "id": "order_id",
  "userId": "user_id",
  "status": "pending",
  "totalAmount": 2398,
  "items": [...],
  "createdAt": "2025-05-31T..."
}
```

## 🚨 Troubleshooting

### Common Issues
1. **401 Unauthorized**: Check if token is set correctly
2. **404 Not Found**: Verify service is running on correct port
3. **500 Internal Error**: Check service logs
4. **Connection Refused**: Ensure all microservices are started

### Service Status Check
```bash
# Check if all services are running
curl http://localhost:4000/health/services

# Check individual services
curl http://localhost:3000/api/health  # User service
curl http://localhost:3001/api/health  # Product service  
curl http://localhost:3002/api/health  # Order service
curl http://localhost:3003/api/health  # Payment service
```

### Logs Monitoring
```bash
# View API Gateway logs
docker-compose -f docker-compose.dev.yml logs api-gateway

# View all service logs
docker-compose -f docker-compose.dev.yml logs
```

## 📝 Test Checklist

### Pre-Testing Setup
- [ ] All microservices running
- [ ] Database connections established
- [ ] Postman collection imported
- [ ] Environment variables set

### Core Functionality Tests
- [ ] System health checks pass
- [ ] Admin authentication works
- [ ] Customer authentication works
- [ ] Product CRUD operations
- [ ] Order creation and management
- [ ] Payment processing
- [ ] Inventory management

### Error Handling Tests
- [ ] Invalid authentication
- [ ] Unauthorized access attempts
- [ ] Invalid data submissions
- [ ] Service unavailability scenarios

### Performance Tests
- [ ] Multiple concurrent requests
- [ ] Large data set handling
- [ ] Response time validation

## 🎉 Success Criteria

The system passes testing when:
1. All health checks return green status
2. Admin can perform all management functions
3. Customers can complete purchase workflows
4. Payment processing works correctly
5. Inventory tracking is accurate
6. Error handling is appropriate
7. Security measures are effective

---

**Happy Testing! 🚀**

For any issues or questions, refer to the system documentation or check the service logs for detailed error information.
