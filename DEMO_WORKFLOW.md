# 🛍️ E-commerce System Demo Workflow

## 🎯 Demo Objectives
Test the complete e-commerce microservices system end-to-end workflow including:
- User authentication and authorization
- Product catalog management
- Shopping cart functionality
- Order creation and management
- Payment processing
- Admin panel features

## 👥 Test Accounts

### Admin Account
- **Email**: admin@gmail.com
- **Password**: admin123
- **Privileges**: Full admin access to create products, manage orders, view dashboard

### Customer Account
- **Email**: customer@gmail.com
- **Password**: customer123
- **Privileges**: Regular customer access for shopping

## 🏪 Sample Products Created
1. **iPhone 15 Pro Max** - $1,199 (Smartphone)
2. **Samsung Galaxy S24 Ultra** - $1,299 (Smartphone)
3. **MacBook Pro M3** - $1,999 (Laptop)
4. **AirPods Pro 2** - $249 (Audio)

## 🔄 Complete Workflow Demo

### Phase 1: Frontend Access & Product Browsing
1. **Open Frontend**: http://localhost:3005
2. **Browse Homepage**: View hero section, features, bestsellers
3. **View Products**: Navigate to products page, browse catalog
4. **Search Products**: Test search functionality
5. **Product Details**: Click on products to view details

### Phase 2: User Authentication
1. **Register New User**: Test signup process
2. **Login as Customer**: Use customer@gmail.com / customer123
3. **Login as Admin**: Use admin@gmail.com / admin123
4. **Test Navigation**: Verify different menu options for admin vs customer

### Phase 3: Shopping Cart & Checkout
1. **Add to Cart**: Add multiple products with different quantities
2. **Cart Management**: Update quantities, remove items
3. **Guest Checkout**: Test checkout without login
4. **User Checkout**: Test checkout while logged in
5. **Shipping Info**: Fill out shipping address
6. **Payment Methods**: Test both VNPay and COD options

### Phase 4: Order Management
1. **Order Creation**: Complete order placement
2. **Order History**: View "My Orders" as customer
3. **Order Details**: View individual order information
4. **Order Status**: Check order status updates

### Phase 5: Admin Panel Testing
1. **Admin Dashboard**: View sales statistics and recent orders
2. **Product Management**: Create, edit, delete products
3. **Order Management**: View all orders, update order status
4. **User Management**: View registered users

### Phase 6: Payment Processing
1. **VNPay Integration**: Test VNPay payment flow
2. **COD Orders**: Test Cash on Delivery orders
3. **Payment Confirmation**: Verify payment status updates
4. **Order Completion**: Test order delivery marking

## 🧪 API Testing Scenarios

### Authentication APIs
```bash
# User Registration
curl -X POST http://localhost:4000/api/users/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","name":"Test User","gender":"male","age":25}'

# User Login
curl -X POST http://localhost:4000/api/users/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

### Product APIs
```bash
# Get All Products
curl -X GET http://localhost:4000/api/products

# Get Product by ID
curl -X GET http://localhost:4000/api/products/{productId}

# Search Products
curl -X GET "http://localhost:4000/api/products?search=iPhone"
```

### Order APIs
```bash
# Create Order (requires authentication)
curl -X POST http://localhost:4000/api/orders \
  -H "Content-Type: application/json" \
  -H "Cookie: session=..." \
  -d '{"cart":[{"productId":"...","quantity":1,"color":"Blue","size":"128GB"}]}'

# Get My Orders
curl -X GET http://localhost:4000/api/orders/myorders \
  -H "Cookie: session=..."
```

## 🔍 Verification Checkpoints

### ✅ System Health
- [ ] All Docker containers running
- [ ] API Gateway responding (http://localhost:4000/health)
- [ ] Frontend accessible (http://localhost:3005)
- [ ] Database connections working
- [ ] NATS messaging working

### ✅ Authentication Flow
- [ ] User registration working
- [ ] User login working
- [ ] JWT tokens being generated
- [ ] Protected routes enforced
- [ ] Admin privileges working

### ✅ Product Management
- [ ] Products displaying on homepage
- [ ] Product search working
- [ ] Product details loading
- [ ] Admin can create/edit products

### ✅ Shopping Cart
- [ ] Add to cart functionality
- [ ] Cart state persistence
- [ ] Quantity updates working
- [ ] Cart total calculations correct

### ✅ Order Processing
- [ ] Order creation successful
- [ ] Order appears in user's order history
- [ ] Order details accessible
- [ ] Admin can see all orders

### ✅ Payment Processing
- [ ] VNPay integration working
- [ ] COD orders processing
- [ ] Payment status updates
- [ ] Order completion flow

## 🐛 Troubleshooting Common Issues

### API Gateway Timeouts
- Check if all microservices are running
- Verify Docker network connectivity
- Check API Gateway logs: `docker logs code-api-gateway-1`

### Authentication Issues
- Verify JWT_KEY environment variable
- Check cookie settings in browser
- Verify user credentials in database

### Product Display Issues
- Check product service logs: `docker logs code-product-service-1`
- Verify image URLs are accessible
- Check API responses in browser DevTools

### Payment Issues
- Verify VNPay configuration
- Check payment service logs: `docker logs code-payment-service-1`
- Test with COD first as fallback

## 📊 Success Metrics
1. **User Registration**: 100% success rate
2. **Product Browsing**: Fast loading, no errors
3. **Cart Operations**: Smooth add/remove/update
4. **Order Placement**: End-to-end completion
5. **Payment Processing**: Both VNPay and COD working
6. **Admin Functions**: All admin features accessible

## 🎉 Demo Completion
Upon completing all phases, you should have:
- Demonstrated full user journey from browsing to purchase
- Verified all microservices communication
- Tested both customer and admin workflows
- Confirmed payment processing capabilities
- Validated system scalability and reliability

The e-commerce microservices system is now fully operational and ready for production deployment!
