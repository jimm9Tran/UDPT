#!/bin/bash

echo "🚀 Starting Synchronized E-commerce Microservices"
echo "================================================="

# Function to check if a port is available
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "⚠️  Port $port is already in use. Stopping existing process..."
        # Kill process using the port
        kill -9 $(lsof -ti :$port) 2>/dev/null || true
        sleep 2
    fi
}

# Function to wait for service to be ready
wait_for_service() {
    local url=$1
    local service_name=$2
    local max_attempts=30
    local attempt=1
    
    echo -n "⏳ Waiting for $service_name to be ready..."
    while [ $attempt -le $max_attempts ]; do
        if curl -s "$url" >/dev/null 2>&1; then
            echo " ✅ Ready!"
            return 0
        fi
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done
    echo " ❌ Timeout!"
    return 1
}

# Check and free ports
echo "🔍 Checking ports..."
ports=(3000 3001 3002 3003 3005 4000 27017 6379 4222 8222)
for port in "${ports[@]}"; do
    check_port $port
done

# Stop any existing Docker containers
echo "🛑 Stopping existing containers..."
docker-compose down --remove-orphans 2>/dev/null || true

# Remove old Docker networks
echo "🧹 Cleaning up networks..."
docker network prune -f 2>/dev/null || true

# Build and start infrastructure first
echo "🏗️  Starting infrastructure services..."
docker-compose up -d mongo redis nats

# Wait for infrastructure to be ready
echo "⏳ Waiting for infrastructure..."
wait_for_service "http://localhost:27017" "MongoDB"
wait_for_service "http://localhost:8222" "NATS"

# Check Redis with ping
echo -n "⏳ Waiting for Redis to be ready..."
while ! redis-cli -h localhost -p 6379 ping >/dev/null 2>&1; do
    echo -n "."
    sleep 1
done
echo " ✅ Ready!"

# Start microservices
echo "🚀 Starting microservices..."
docker-compose up -d user-service product-service order-service payment-service

# Wait for microservices
wait_for_service "http://localhost:3000/api/health" "User Service"
wait_for_service "http://localhost:3001/api/health" "Product Service"
wait_for_service "http://localhost:3002/api/health" "Order Service"
wait_for_service "http://localhost:3003/api/health" "Payment Service"

# Start API Gateway
echo "🌐 Starting API Gateway..."
docker-compose up -d api-gateway
wait_for_service "http://localhost:4000/health" "API Gateway"

# Start Frontend
echo "💻 Starting Frontend..."
docker-compose up -d frontend
wait_for_service "http://localhost:3005" "Frontend"

# Final health check
echo ""
echo "🔍 System Health Check"
echo "====================="

services=(
    "http://localhost:27017|MongoDB"
    "http://localhost:6379|Redis" 
    "http://localhost:8222|NATS Monitor"
    "http://localhost:3000/api/health|User Service"
    "http://localhost:3001/api/health|Product Service"
    "http://localhost:3002/api/health|Order Service"
    "http://localhost:3003/api/health|Payment Service"
    "http://localhost:4000/health|API Gateway"
    "http://localhost:3005|Frontend"
)

for service in "${services[@]}"; do
    url="${service%|*}"
    name="${service#*|}"
    
    if curl -s "$url" >/dev/null 2>&1; then
        echo "✅ $name: HEALTHY"
    else
        echo "❌ $name: UNHEALTHY"
    fi
done

echo ""
echo "🎯 Quick Test - Admin Login"
echo "=========================="
response=$(curl -s -w "%{http_code}" -X POST "http://localhost:4000/api/users/signin" \
    -H "Content-Type: application/json" \
    -d '{"email": "admin@gmail.com", "password": "admin123"}')

status_code="${response: -3}"
if [ "$status_code" = "200" ]; then
    echo "✅ Admin login test: PASSED"
else
    echo "❌ Admin login test: FAILED (Status: $status_code)"
fi

echo ""
echo "🌟 System Ready!"
echo "================"
echo "Frontend:        http://localhost:3005"
echo "API Gateway:     http://localhost:4000"
echo "Admin Login:     admin@gmail.com / admin123"
echo ""
echo "📊 Infrastructure URLs:"
echo "MongoDB:         mongodb://localhost:27017"
echo "Redis:           redis://localhost:6379"
echo "NATS Monitor:    http://localhost:8222"
echo ""
echo "🔧 Management Commands:"
echo "View logs:       docker-compose logs -f [service-name]"
echo "Stop all:        docker-compose down"
echo "Restart:         docker-compose restart [service-name]"
echo ""
echo "🧪 Run comprehensive test:"
echo "./test-system-comprehensive.sh"
