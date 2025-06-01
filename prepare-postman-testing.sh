#!/bin/bash

# E-commerce System Postman Testing Preparation Script
# This script verifies the system is ready for Postman testing

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
API_BASE="http://localhost:4000"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="admin123"
CUSTOMER_EMAIL="customer@gmail.com"
CUSTOMER_PASSWORD="customer123"

echo "🧪 E-commerce System - Postman Testing Preparation"
echo "=================================================="
echo

# Function to print status
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if services are running
print_status "Checking system health..."

# 1. Check API Gateway
print_status "Testing API Gateway connection..."
gateway_response=$(curl -s -o /dev/null -w "%{http_code}" "$API_BASE/health")
if [ "$gateway_response" = "200" ]; then
    print_success "✅ API Gateway is running (Port 4000)"
else
    print_error "❌ API Gateway not responding. Please start the system first."
    echo "   Run: ./start-dev.sh or docker-compose -f docker-compose.dev.yml up"
    exit 1
fi

# 2. Check all microservices
print_status "Checking all microservices..."
services_response=$(curl -s "$API_BASE/health/services")
if echo "$services_response" | grep -q "user\|product\|order\|payment"; then
    print_success "✅ All microservices are responding"
else
    print_warning "⚠️  Some microservices might not be fully ready"
fi

# 3. Test admin account
print_status "Verifying admin account..."
admin_login_data='{
    "email": "'$ADMIN_EMAIL'",
    "password": "'$ADMIN_PASSWORD'"
}'

admin_response=$(curl -s -X POST "$API_BASE/api/users/signin" \
    -H "Content-Type: application/json" \
    -d "$admin_login_data")

if echo "$admin_response" | grep -q "isAdmin.*true"; then
    print_success "✅ Admin account is working"
    # Extract admin token for testing
    admin_token=$(echo "$admin_response" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    if [ -n "$admin_token" ]; then
        print_success "✅ Admin token obtained successfully"
    fi
else
    print_error "❌ Admin account login failed"
    echo "Response: $admin_response"
fi

# 4. Test customer account  
print_status "Verifying customer account..."
customer_login_data='{
    "email": "'$CUSTOMER_EMAIL'",
    "password": "'$CUSTOMER_PASSWORD'"
}'

customer_response=$(curl -s -X POST "$API_BASE/api/users/signin" \
    -H "Content-Type: application/json" \
    -d "$customer_login_data")

if echo "$customer_response" | grep -q "email.*$CUSTOMER_EMAIL"; then
    print_success "✅ Customer account is working"
else
    print_warning "⚠️  Customer account might need to be created"
fi

# 5. Test admin privileges
if [ -n "$admin_token" ]; then
    print_status "Testing admin privileges..."
    admin_test=$(curl -s -o /dev/null -w "%{http_code}" "$API_BASE/api/users" \
        -H "Authorization: Bearer $admin_token")
    
    if [ "$admin_test" = "200" ]; then
        print_success "✅ Admin privileges are working"
    else
        print_warning "⚠️  Admin privileges might need verification"
    fi
fi

# 6. Check if products exist
print_status "Checking product catalog..."
products_response=$(curl -s "$API_BASE/api/products")
if echo "$products_response" | grep -q "title\|name"; then
    print_success "✅ Product catalog has items"
else
    print_warning "⚠️  Product catalog appears empty - you might want to seed data"
fi

echo
echo "📋 System Status Summary:"
echo "========================"
echo "🏠 Frontend: http://localhost:3005"
echo "🔗 API Gateway: http://localhost:4000"
echo "👤 User Service: http://localhost:3000"
echo "📦 Product Service: http://localhost:3001"
echo "🛒 Order Service: http://localhost:3002"
echo "💳 Payment Service: http://localhost:3003"
echo

echo "👥 Test Accounts:"
echo "================"
echo "🔑 Admin: $ADMIN_EMAIL / $ADMIN_PASSWORD"
echo "👤 Customer: $CUSTOMER_EMAIL / $CUSTOMER_PASSWORD"
echo

echo "📱 Postman Collection:"
echo "====================="
echo "📄 File: E-commerce-Testing-Collection.postman_collection.json"
echo "📖 Guide: POSTMAN_TESTING_GUIDE.md"
echo

echo "🎯 Quick Start Steps:"
echo "===================="
echo "1. Import the Postman collection"
echo "2. Set environment variables:"
echo "   - baseUrl: http://localhost:4000"
echo "3. Run the requests in order:"
echo "   - Health Checks → User Service → Product Service → Order Service → Payment Service"
echo "4. Start with 'Admin Login' to get authentication token"
echo

print_success "🚀 System is ready for Postman testing!"
echo
echo "📚 For detailed testing instructions, see: POSTMAN_TESTING_GUIDE.md"
