#!/bin/bash

# E-Commerce Microservices Setup Script

echo "🚀 E-Commerce Microservices Setup"
echo "================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

echo "✅ Docker is running"

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose is not installed. Please install docker-compose first."
    exit 1
fi

echo "✅ docker-compose is available"

# Create directories if they don't exist
echo "📁 Checking project structure..."

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.dev.yml down 2>/dev/null || true

# Remove existing volumes (optional - uncomment if you want to reset data)
# echo "🗑️  Removing existing volumes..."
# docker-compose -f docker-compose.dev.yml down -v 2>/dev/null || true

# Build and start services
echo "🏗️  Building and starting services..."
docker-compose -f docker-compose.dev.yml up --build -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Check service health
echo "🔍 Checking service health..."

services=("mongo:27017" "nats:4222" "redis:6379")
for service in "${services[@]}"; do
    IFS=':' read -r host port <<< "$service"
    if docker-compose -f docker-compose.dev.yml exec $host echo "Service is running" > /dev/null 2>&1; then
        echo "✅ $host is running"
    else
        echo "❌ $host is not responding"
    fi
done

# Check API Gateway
echo "🔍 Checking API Gateway..."
sleep 5
if curl -s http://localhost:4000/api/health > /dev/null 2>&1; then
    echo "✅ API Gateway is running on http://localhost:4000"
else
    echo "⚠️  API Gateway not yet ready (this is normal on first startup)"
fi

# Check Frontend
echo "🔍 Checking Frontend..."
sleep 5
if curl -s http://localhost:3005 > /dev/null 2>&1; then
    echo "✅ Frontend is running on http://localhost:3005"
else
    echo "⚠️  Frontend not yet ready (this is normal on first startup)"
fi

echo ""
echo "🎉 Setup Complete!"
echo "=================="
echo ""
echo "🌐 Access the application:"
echo "   Frontend:    http://localhost:3005"
echo "   API Gateway: http://localhost:4000"
echo ""
echo "📊 View logs:"
echo "   All services: docker-compose -f docker-compose.dev.yml logs -f"
echo "   Frontend:     docker-compose -f docker-compose.dev.yml logs -f frontend"
echo "   API Gateway:  docker-compose -f docker-compose.dev.yml logs -f api-gateway"
echo ""
echo "🛑 Stop services:"
echo "   docker-compose -f docker-compose.dev.yml down"
echo ""
echo "📖 For detailed demo instructions, see DEMO_SETUP.md"
