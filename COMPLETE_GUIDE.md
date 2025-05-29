# 🏪 E-commerce Microservices System - Hướng dẫn hoàn chình

Hệ thống thương mại điện tử phân tán sử dụng kiến trúc microservices với Node.js, TypeScript, MongoDB, NATS Streaming và VNPay.

## 🎯 Tổng quan hệ thống

### Services đã hoàn thiện:
- ✅ **User Service** (Port 3000): Quản lý người dùng, đăng ký, đăng nhập
- ✅ **Product Service** (Port 3001): Quản lý sản phẩm, đánh giá
- ✅ **Order Service** (Port 3002): Quản lý đơn hàng, xử lý workflow
- ✅ **Payment Service** (Port 3003): Tích hợp VNPay, xử lý thanh toán
- ✅ **Expiration Service**: Xử lý hết hạn đơn hàng với Bull Queue

### Infrastructure:
- ✅ **MongoDB**: Database cho từng service
- ✅ **NATS Streaming**: Message broker cho event-driven architecture  
- ✅ **Redis**: Cache và queue management
- ✅ **Docker**: Containerization

## 🚀 Khởi động hệ thống

### 1. Prerequisites
```bash
# Cài đặt Docker và Docker Compose
# Cài đặt Node.js 18+
# Clone repository
```

### 2. Cấu hình environment
```bash
# Copy và chỉnh sửa file môi trường
cp .env.example .env

# Cập nhật thông tin VNPay trong .env:
VNPAY_TMN_CODE=your_vnpay_terminal_code
VNPAY_HASH_SECRET=your_vnpay_hash_secret
```

### 3. Khởi động tất cả services
```bash
# Sử dụng script tự động
./start-all.sh

# Hoặc thủ công
docker-compose -f docker-compose.dev.yml up --build
```

## 🔄 Workflow hoàn chỉnh: Từ đặt hàng đến thanh toán

### 1. User Registration & Login
```http
POST /api/users/signup
{
  "email": "user@example.com",
  "password": "password123",
  "name": "Test User"
}
```

### 2. Create Product
```http
POST /api/products
{
  "name": "iPhone 15 Pro",
  "price": 25000000,
  "description": "Điện thoại thông minh cao cấp",
  "category": "Electronics",
  "countInStock": 50
}
```

### 3. Create Order
```http
POST /api/orders
{
  "orderItems": [
    {
      "product": "product_id",
      "qty": 1,
      "price": 25000000
    }
  ],
  "shippingAddress": {
    "address": "123 Main St",
    "city": "Ho Chi Minh",
    "postalCode": "70000",
    "country": "Vietnam"
  },
  "paymentMethod": "VNPay"
}
```

### 4. Create Payment
```http
POST /api/payments
{
  "orderId": "order_id_from_step_3",
  "amount": 25000000,
  "bankCode": "NCB"
}
```

### 5. VNPay Payment Flow
1. Client nhận `paymentUrl` từ response
2. Redirect user đến VNPay
3. User thực hiện thanh toán
4. VNPay callback về hệ thống
5. Order status được cập nhật thành `completed`

## 📡 Event-Driven Architecture

### Events Flow:
```
ProductCreated → OrderService cập nhật product cache
OrderCreated → ProductService trừ inventory
OrderCreated → ExpirationService set timer
OrderCreated → PaymentService log order info
PaymentCreated → OrderService cập nhật trạng thái
OrderCancelled → ProductService hoàn inventory
OrderCancelled → PaymentService hủy payment
ExpirationCompleted → OrderService hủy order
```

## 🧪 Testing

### 1. Import Postman Collection
```bash
# Import file: payment/postman-collection.json
# Hoặc test manual với curl commands trong start-all.sh
```

### 2. Test Payment Service
```bash
cd payment
./test.sh
```

### 3. End-to-End Testing
1. Tạo user account
2. Tạo sản phẩm
3. Tạo đơn hàng  
4. Tạo thanh toán
5. Test VNPay flow (sử dụng sandbox)

## 🛠️ Development Commands

### Individual Service Development:
```bash
# User Service
cd user && npm run dev

# Product Service  
cd product && npm run dev

# Order Service
cd order && npm run dev

# Payment Service
cd payment && npm run dev
```

### Docker Commands:
```bash
# Build specific service
docker-compose -f docker-compose.dev.yml build payment-service

# View logs
docker-compose -f docker-compose.dev.yml logs -f payment-service

# Restart service
docker-compose -f docker-compose.dev.yml restart payment-service

# Stop all
docker-compose -f docker-compose.dev.yml down

# Clean up (remove volumes and images)
docker-compose -f docker-compose.dev.yml down -v --rmi all
```

## 🔒 Security Features

- ✅ JWT Authentication cho tất cả protected routes
- ✅ Password hashing với bcrypt
- ✅ Input validation với express-validator
- ✅ HMAC-SHA512 signature verification cho VNPay
- ✅ Environment variables cho sensitive data
- ✅ CORS và security headers
- ✅ Rate limiting (có thể thêm)

## 📊 Monitoring & Observability

### Service Health Checks:
- User Service: `http://localhost:3000/api/users/currentuser`
- Product Service: `http://localhost:3001/api/products`
- Order Service: `http://localhost:3002/api/orders`
- Payment Service: `http://localhost:3003/api/payments/order/test`

### NATS Monitoring:
- Dashboard: `http://localhost:8222`
- Channels: `http://localhost:8222/streaming/channelsz`

### Database Access:
```bash
# MongoDB
docker exec -it <mongo_container> mongo

# Redis
docker exec -it <redis_container> redis-cli
```

## 🚨 Troubleshooting

### Common Issues:

1. **VNPay signature mismatch**
   - Kiểm tra `VNPAY_HASH_SECRET` trong .env
   - Đảm bảo URL encoding đúng

2. **Order not found khi create payment**
   - Kiểm tra OrderCreated event đã được PaymentService nhận chưa
   - Xem logs: `docker-compose logs payment-service`

3. **NATS connection errors**
   - Đảm bảo NATS container đang chạy
   - Kiểm tra `NATS_URL` và `NATS_CLUSTER_ID`

4. **MongoDB connection issues**
   - Kiểm tra MongoDB container status
   - Verify `MONGO_URI_*` variables

### Debug Commands:
```bash
# Check all container status
docker ps

# View specific service logs
docker-compose logs payment-service

# Enter container shell
docker exec -it <container_name> sh

# Check NATS channels
curl http://localhost:8222/streaming/channelsz

# MongoDB queries
docker exec -it <mongo_container> mongo payment --eval "db.payments.find().pretty()"
```

## 🔮 Future Enhancements

### Planned Features:
- [ ] API Gateway với rate limiting
- [ ] Redis caching layer
- [ ] Elasticsearch logging
- [ ] Prometheus monitoring
- [ ] GraphQL aggregation layer
- [ ] WebSocket notifications
- [ ] Email service cho notifications
- [ ] Admin dashboard
- [ ] Mobile app integration

### Scalability Improvements:
- [ ] Kubernetes deployment
- [ ] Load balancing
- [ ] Database sharding
- [ ] CDN integration
- [ ] Auto-scaling policies

## 📞 Support

Nếu gặp vấn đề:
1. Kiểm tra logs của service liên quan
2. Verify environment variables
3. Đảm bảo tất cả containers đang chạy
4. Test individual service endpoints
5. Check NATS event flow

## 🎉 Conclusion

Hệ thống e-commerce microservices hoàn chỉnh với:
- **4 core services** hoàn toàn chức năng
- **Event-driven architecture** với NATS
- **VNPay integration** cho thanh toán
- **Docker containerization** cho deployment
- **Complete testing suite** với Postman

Ready for production deployment! 🚀
