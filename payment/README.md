# Payment Service - VNPay Integration

Payment Service là microservice xử lý thanh toán cho hệ thống e-commerce sử dụng VNPay gateway.

## Tính năng

- ✅ Tích hợp VNPay payment gateway
- ✅ Xử lý callback và IPN từ VNPay
- ✅ Event-driven architecture với NATS Streaming
- ✅ Optimistic concurrency control với MongoDB
- ✅ Xác thực và ủy quyền với JWT
- ✅ Validation dữ liệu đầu vào
- ✅ Error handling toàn diện

## API Endpoints

### 1. Tạo thanh toán
```http
POST /api/payments
Content-Type: application/json
Authorization: Bearer <jwt_token>

{
  "orderId": "order_id_here",
  "amount": 100000,
  "bankCode": "NCB" // optional
}
```

**Response:**
```json
{
  "id": "payment_id",
  "orderId": "order_id",
  "amount": 100000,
  "status": "pending",
  "paymentUrl": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?...",
  "vnpayTxnRef": "order_id_timestamp"
}
```

### 2. Lấy thông tin thanh toán
```http
GET /api/payments/:paymentId
Authorization: Bearer <jwt_token>
```

### 3. Lấy thanh toán theo đơn hàng
```http
GET /api/payments/order/:orderId
Authorization: Bearer <jwt_token>
```

### 4. VNPay Callback (GET)
```http
GET /api/payments/vnpay-callback?vnp_Amount=...&vnp_ResponseCode=...
```

### 5. VNPay IPN (POST)
```http
POST /api/payments/vnpay-ipn
Content-Type: application/json

{
  "vnp_Amount": "10000000",
  "vnp_ResponseCode": "00",
  ...
}
```

## Events

### Listening Events
- `OrderCreated`: Lắng nghe khi có đơn hàng mới được tạo
- `OrderCancelled`: Lắng nghe khi đơn hàng bị hủy

### Publishing Events
- `PaymentCreated`: Phát sự kiện khi thanh toán thành công

## Environment Variables

```bash
# NATS Configuration
NATS_CLUSTER_ID=ticketing
NATS_CLIENT_ID=payment-service
NATS_URL=http://localhost:4222

# MongoDB
MONGO_URI_PAYMENT=mongodb://localhost:27017/payment

# JWT
JWT_KEY=your-secret-key

# VNPay Configuration
VNPAY_TMN_CODE=your_vnpay_terminal_code
VNPAY_HASH_SECRET=your_vnpay_hash_secret
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=http://localhost:3003/api/payments/vnpay-callback

# Client URL
CLIENT_URL=http://localhost:3000
```

## VNPay Flow

1. **Tạo thanh toán**: Client gọi API `/api/payments` với thông tin đơn hàng
2. **Redirect**: Server trả về `paymentUrl`, client redirect user đến VNPay
3. **Thanh toán**: User thực hiện thanh toán trên VNPay
4. **Callback**: VNPay redirect về `/api/payments/vnpay-callback`
5. **IPN**: VNPay gửi thông báo về `/api/payments/vnpay-ipn`
6. **Event**: Nếu thành công, phát event `PaymentCreated`

## Payment Status

- `pending`: Đang chờ thanh toán
- `success`: Thanh toán thành công
- `failed`: Thanh toán thất bại
- `cancelled`: Thanh toán bị hủy

## Security

- Xác thực chữ ký từ VNPay bằng HMAC-SHA512
- Validation input parameters
- JWT token authentication
- Environment variables cho sensitive data

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build
npm run build

# Start production
npm start
```

## Docker

```bash
# Build image
docker build -t payment-service .

# Run container
docker run -p 3003:3000 payment-service
```

## Testing với Postman

### 1. Tạo Payment
```http
POST http://localhost:3003/api/payments
Headers:
- Content-Type: application/json
- Cookie: session=<jwt_token>

Body:
{
  "orderId": "507f1f77bcf86cd799439011",
  "amount": 50000,
  "bankCode": "NCB"
}
```

### 2. Test VNPay Callback
Sau khi tạo payment, copy `paymentUrl` và mở trong browser để test flow thanh toán.

## Troubleshooting

### Lỗi thường gặp:

1. **Chữ ký không hợp lệ**: Kiểm tra `VNPAY_HASH_SECRET`
2. **Order not found**: Đảm bảo OrderCreated event đã được xử lý
3. **MongoDB connection**: Kiểm tra `MONGO_URI_PAYMENT`
4. **NATS connection**: Kiểm tra `NATS_URL` và NATS server

### Debug:

```bash
# Check logs
docker logs payment-service

# Check MongoDB
mongo mongodb://localhost:27017/payment

# Check NATS
curl http://localhost:8222/streaming/channelsz
```
