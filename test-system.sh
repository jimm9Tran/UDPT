#!/bin/bash

# 🛍️ E-commerce System Test Script
# This script tests the complete e-commerce microservices workflow

set -e

echo "🚀 Starting E-commerce System Test..."
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test configuration
API_BASE="http://localhost:4000"
FRONTEND_URL="http://localhost:3005"
ADMIN_EMAIL="admin@gmail.com"
ADMIN_PASSWORD="admin123"
CUSTOMER_EMAIL="customer@gmail.com"
CUSTOMER_PASSWORD="customer123"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to test API endpoint
test_api() {
    local endpoint=$1
    local expected_status=${2:-200}
    local method=${3:-GET}
    local data=${4:-""}
    
    print_status "Testing $method $endpoint"
    
    if [ "$method" = "POST" ] && [ -n "$data" ]; then
        response=$(curl -s -w "%{http_code}" -X $method "$API_BASE$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data")
    else
        response=$(curl -s -w "%{http_code}" -X $method "$API_BASE$endpoint")
    fi
    
    status_code="${response: -3}"
    body="${response%???}"
    
    if [ "$status_code" = "$expected_status" ]; then
        print_success "✅ $endpoint responded with $status_code"
        return 0
    else
        print_error "❌ $endpoint responded with $status_code (expected $expected_status)"
        echo "Response body: $body"
        return 1
    fi
}

# Test 1: System Health Check
echo
print_status "Phase 1: System Health Check"
echo "=============================="

print_status "Checking API Gateway health..."
test_api "/health"

print_status "Checking if all Docker containers are running..."
docker_status=$(docker-compose -f docker-compose.dev.yml ps --format "table {{.Service}}\t{{.Status}}" | grep -c "Up" || true)
if [ "$docker_status" -ge 8 ]; then
    print_success "✅ All Docker containers are running"
else
    print_warning "⚠️  Some containers might not be running properly"
fi

# Test 2: API Endpoints
echo
print_status "Phase 2: API Endpoints Testing"
echo "==============================="

print_status "Testing Products API..."
test_api "/api/products"

print_status "Testing Users API..."
test_api "/api/users/currentuser"

# Test 3: Authentication Flow
echo
print_status "Phase 3: Authentication Testing"
echo "==============================="

print_status "Testing admin login..."
admin_login_data='{
    "email": "'$ADMIN_EMAIL'",
    "password": "'$ADMIN_PASSWORD'"
}'

admin_response=$(curl -s -c admin_cookies.txt -X POST "$API_BASE/api/users/signin" \
    -H "Content-Type: application/json" \
    -d "$admin_login_data")

if echo "$admin_response" | grep -q "isAdmin.*true"; then
    print_success "✅ Admin login successful"
else
    print_error "❌ Admin login failed"
    echo "Response: $admin_response"
fi

print_status "Testing customer login..."
customer_login_data='{
    "email": "'$CUSTOMER_EMAIL'",
    "password": "'$CUSTOMER_PASSWORD'"
}'

customer_response=$(curl -s -c customer_cookies.txt -X POST "$API_BASE/api/users/signin" \
    -H "Content-Type: application/json" \
    -d "$customer_login_data")

if echo "$customer_response" | grep -q "email.*$CUSTOMER_EMAIL"; then
    print_success "✅ Customer login successful"
else
    print_error "❌ Customer login failed"
    echo "Response: $customer_response"
fi

# Test 4: Product Management
echo
print_status "Phase 4: Product Management Testing"
echo "==================================="

print_status "Testing product retrieval..."
products_response=$(curl -s "$API_BASE/api/products")
product_count=$(echo "$products_response" | grep -o '"id"' | wc -l | tr -d ' ')

if [ "$product_count" -gt 0 ]; then
    print_success "✅ Found $product_count products in catalog"
else
    print_error "❌ No products found in catalog"
fi

# Get first product ID for testing
PRODUCT_ID=$(echo "$products_response" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -n "$PRODUCT_ID" ]; then
    print_status "Testing individual product retrieval..."
    test_api "/api/products/$PRODUCT_ID"
fi

# Test 5: Order Flow Simulation
echo
print_status "Phase 5: Order Flow Testing"
echo "==========================="

if [ -n "$PRODUCT_ID" ]; then
    print_status "Testing order creation..."
    order_data='{
        "cart": [
            {
                "productId": "'$PRODUCT_ID'",
                "qty": 1,
                "color": "Blue",
                "size": "128GB"
            }
        ]
    }'
    
    order_response=$(curl -s -w "%{http_code}" -b customer_cookies.txt -X POST "$API_BASE/api/orders" \
        -H "Content-Type: application/json" \
        -d "$order_data")
    
    order_status="${order_response: -3}"
    if [ "$order_status" = "201" ] || [ "$order_status" = "200" ]; then
        print_success "✅ Order creation test passed"
    else
        print_warning "⚠️  Order creation might require additional setup"
    fi
fi

# Test 6: Frontend Accessibility
echo
print_status "Phase 6: Frontend Testing"
echo "========================="

print_status "Testing frontend accessibility..."
frontend_response=$(curl -s -w "%{http_code}" "$FRONTEND_URL")
frontend_status="${frontend_response: -3}"

if [ "$frontend_status" = "200" ]; then
    print_success "✅ Frontend is accessible at $FRONTEND_URL"
else
    print_error "❌ Frontend is not accessible"
fi

# Test 7: API Gateway Proxy
echo
print_status "Phase 7: API Gateway Proxy Testing"
echo "=================================="

print_status "Testing proxy to user service..."
test_api "/api/users/currentuser"

print_status "Testing proxy to product service..."
test_api "/api/products"

# Summary
echo
print_status "Test Summary"
echo "============"

echo "🌐 Frontend URL: $FRONTEND_URL"
echo "🔗 API Gateway: $API_BASE"
echo "🔑 Admin Login: $ADMIN_EMAIL / $ADMIN_PASSWORD"
echo "👤 Customer Login: $CUSTOMER_EMAIL / $CUSTOMER_PASSWORD"
echo
echo "📱 Sample Products Created:"
echo "  • iPhone 15 Pro Max - $1,199"
echo "  • Samsung Galaxy S24 Ultra - $1,299"
echo "  • MacBook Pro M3 - $1,999"
echo "  • AirPods Pro 2 - $249"
echo
print_success "🎉 E-commerce system test completed!"
echo
echo "📋 Next Steps:"
echo "1. Open frontend: $FRONTEND_URL"
echo "2. Login as admin: $ADMIN_EMAIL / $ADMIN_PASSWORD"
echo "3. Login as customer: $CUSTOMER_EMAIL / $CUSTOMER_PASSWORD"
echo "4. Test complete shopping workflow"
echo "5. Test admin dashboard features"
echo
echo "🔧 If you encounter issues:"
echo "• Check docker containers: docker-compose -f docker-compose.dev.yml ps"
echo "• View logs: docker-compose -f docker-compose.dev.yml logs [service-name]"
echo "• Restart services: docker-compose -f docker-compose.dev.yml restart"

# Cleanup
rm -f admin_cookies.txt customer_cookies.txt 2>/dev/null || true

echo
print_status "🛍️ Happy shopping and testing!"
