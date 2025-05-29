#!/bin/bash

# Test Payment Service
echo "🚀 Testing Payment Service..."

# Base URL
BASE_URL="http://localhost:3003"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Testing Payment Service endpoints...${NC}"

# 1. Test health check (this will return 404 but service should be running)
echo -e "\n${YELLOW}1. Testing service availability...${NC}"
response=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/api/payments/health)
if [ $response -eq 404 ]; then
    echo -e "${GREEN}✅ Payment Service is running${NC}"
else
    echo -e "${RED}❌ Payment Service is not responding${NC}"
    exit 1
fi

# 2. Test creating payment without auth (should return 401)
echo -e "\n${YELLOW}2. Testing payment creation without authentication...${NC}"
response=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
  $BASE_URL/api/payments \
  -H "Content-Type: application/json" \
  -d '{"orderId":"test123","amount":100000}')

if [ $response -eq 401 ]; then
    echo -e "${GREEN}✅ Authentication required (401)${NC}"
else
    echo -e "${RED}❌ Expected 401, got $response${NC}"
fi

# 3. Test with invalid data (should return 400)
echo -e "\n${YELLOW}3. Testing payment creation with invalid data...${NC}"
response=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
  $BASE_URL/api/payments \
  -H "Content-Type: application/json" \
  -H "Cookie: session=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test" \
  -d '{"amount":"invalid"}')

if [ $response -eq 400 ]; then
    echo -e "${GREEN}✅ Invalid data rejected (400)${NC}"
else
    echo -e "${RED}❌ Expected 400, got $response${NC}"
fi

# 4. Test VNPay callback endpoint
echo -e "\n${YELLOW}4. Testing VNPay callback endpoint...${NC}"
response=$(curl -s -o /dev/null -w "%{http_code}" \
  "$BASE_URL/api/payments/vnpay-callback?vnp_TxnRef=test123&vnp_ResponseCode=00")

# This should return 400 because signature is invalid
if [ $response -eq 400 ]; then
    echo -e "${GREEN}✅ VNPay callback endpoint working (invalid signature rejected)${NC}"
else
    echo -e "${YELLOW}⚠️  VNPay callback returned $response${NC}"
fi

echo -e "\n${GREEN}🎉 Payment Service test completed!${NC}"
echo -e "${YELLOW}📝 Note: For full testing, you need:${NC}"
echo -e "   - Valid JWT token for authentication"
echo -e "   - Valid VNPay credentials in environment"
echo -e "   - Order Service running for order validation"
echo -e "   - NATS Streaming Server running"
echo -e "   - MongoDB running"

echo -e "\n${YELLOW}🔧 Environment check:${NC}"
echo -e "   VNPAY_TMN_CODE: ${VNPAY_TMN_CODE:-'❌ Not set'}"
echo -e "   VNPAY_URL: ${VNPAY_URL:-'❌ Not set'}"
echo -e "   MONGO_URI_PAYMENT: ${MONGO_URI_PAYMENT:-'❌ Not set'}"
echo -e "   NATS_URL: ${NATS_URL:-'❌ Not set'}"
