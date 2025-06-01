#!/bin/bash

echo "🚀 Starting E-commerce Microservices Development Environment"
echo "============================================================"

# Stop existing containers
echo "🔄 Stopping existing containers..."
docker-compose down

# Remove orphaned containers
echo "🧹 Cleaning up orphaned containers..."
docker-compose down --remove-orphans

# Build and start all services
echo "🏗️  Building and starting all services..."
docker-compose up --build -d

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 30

# Check service health
echo "🔍 Checking service health..."
echo "==============================================="

# Check MongoDB
if curl -s "http://localhost:27017" > /dev/null 2>&1; then
    echo "✅ MongoDB: CONNECTED"
else
    echo "❌ MongoDB: NOT CONNECTED"
fi

# Check Redis
if redis-cli -h localhost -p 6379 ping > /dev/null 2>&1; then
    echo "✅ Redis: CONNECTED"
else
    echo "❌ Redis: NOT CONNECTED"
fi

# Check NATS
if curl -s "http://localhost:8222" > /dev/null 2>&1; then
    echo "✅ NATS Streaming: CONNECTED"
else
    echo "❌ NATS Streaming: NOT CONNECTED"
fi

# Check microservices
services=("3000" "3001" "3002" "3003" "4000")
service_names=("User Service" "Product Service" "Order Service" "Payment Service" "API Gateway")

for i in "${!services[@]}"; do
    port="${services[$i]}"
    name="${service_names[$i]}"
    
    if curl -s "http://localhost:${port}/api/health" > /dev/null 2>&1; then
        echo "✅ $name: HEALTHY"
    else
        echo "❌ $name: UNHEALTHY"
    fi
done

# Check Frontend
if curl -s "http://localhost:3005" > /dev/null 2>&1; then
    echo "✅ Frontend: RUNNING"
else
    echo "❌ Frontend: NOT RUNNING"
fi

echo ""
echo "🌐 Service URLs:"
echo "==============================================="
echo "Frontend:        http://localhost:3005"
echo "API Gateway:     http://localhost:4000"
echo "User Service:    http://localhost:3000"
echo "Product Service: http://localhost:3001"
echo "Order Service:   http://localhost:3002"
echo "Payment Service: http://localhost:3003"
echo ""
echo "📊 Infrastructure:"
echo "==============================================="
echo "MongoDB:         http://localhost:27017"
echo "Redis:           http://localhost:6379"
echo "NATS:            http://localhost:4222"
echo "NATS Monitor:    http://localhost:8222"
echo ""
echo "🎯 Admin Login:"
echo "==============================================="
echo "Email:    admin@gmail.com"
echo "Password: admin123"
echo ""
echo "🔧 Useful Commands:"
echo "==============================================="
echo "View logs:           docker-compose logs -f [service-name]"
echo "Restart service:     docker-compose restart [service-name]"
echo "Stop all:            docker-compose down"
echo "View all services:   docker-compose ps"
echo ""
echo "✨ Development environment is ready!"
