#!/bin/bash

# =============================================================================
# STANDARDIZED DEVELOPMENT STARTUP SCRIPT
# =============================================================================
# This script starts the entire microservices system with standardized configuration

echo "🚀 Starting E-commerce Microservices System (Development Mode)"
echo "================================================================="

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Check if Docker is running
print_status "Checking Docker status..."
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi
print_success "Docker is running"

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    print_error "docker-compose not found. Please install docker-compose."
    exit 1
fi

# Set environment for local development
export COMPOSE_FILE=docker-compose.dev.yml
export ENV_FILE=.env.local

print_status "Using configuration:"
echo "  📄 Compose file: $COMPOSE_FILE"
echo "  🔧 Environment: $ENV_FILE"

# Stop any existing containers
print_status "Stopping any existing containers..."
docker-compose -f $COMPOSE_FILE down --remove-orphans 2>/dev/null

# Remove any orphaned volumes (optional)
if [[ "$1" == "--clean" ]]; then
    print_warning "Cleaning up volumes and images..."
    docker-compose -f $COMPOSE_FILE down -v
    docker system prune -f
fi

# Pull latest images for infrastructure services
print_status "Pulling latest infrastructure images..."
docker-compose -f $COMPOSE_FILE pull mongo nats redis

# Build all services
print_status "Building all microservices..."
docker-compose -f $COMPOSE_FILE build

# Start infrastructure services first
print_status "Starting infrastructure services..."
docker-compose -f $COMPOSE_FILE up -d mongo nats redis

# Wait for infrastructure to be ready
print_status "Waiting for infrastructure services to be ready..."
sleep 10

# Start microservices
print_status "Starting microservices..."
docker-compose -f $COMPOSE_FILE up -d expiration-service user-service product-service order-service payment-service

# Wait for microservices to be ready
print_status "Waiting for microservices to be ready..."
sleep 15

# Start API Gateway
print_status "Starting API Gateway..."
docker-compose -f $COMPOSE_FILE up -d api-gateway

# Wait for API Gateway
print_status "Waiting for API Gateway to be ready..."
sleep 10

# Start Frontend
print_status "Starting Frontend..."
docker-compose -f $COMPOSE_FILE up -d frontend

# Display status
print_success "All services started!"
echo ""
echo "🌐 Service URLs:"
echo "  📱 Frontend:        http://localhost:3005"
echo "  🔌 API Gateway:     http://localhost:4000"
echo "  👤 User Service:    http://localhost:3000"
echo "  📦 Product Service: http://localhost:3001"
echo "  📋 Order Service:   http://localhost:3002"
echo "  💳 Payment Service: http://localhost:3003"
echo "  ⏰ Expiration:      http://localhost:3006"
echo ""
echo "🗄️  Infrastructure:"
echo "  🍃 MongoDB:         mongodb://localhost:27017"
echo "  🔄 NATS:           nats://localhost:4222"
echo "  🗄️  Redis:          redis://localhost:6379"
echo ""

# Run health check
print_status "Running health check..."
sleep 5
if [[ -f "./scripts/health-check.sh" ]]; then
    chmod +x ./scripts/health-check.sh
    ./scripts/health-check.sh
else
    print_warning "Health check script not found"
fi

echo ""
print_success "🎉 System is ready!"
echo ""
echo "📊 Useful commands:"
echo "  📜 View logs:        docker-compose -f $COMPOSE_FILE logs -f [service-name]"
echo "  🔄 Restart service:  docker-compose -f $COMPOSE_FILE restart [service-name]"
echo "  ⛔ Stop all:         docker-compose -f $COMPOSE_FILE down"
echo "  📈 Monitor:          docker-compose -f $COMPOSE_FILE ps"
echo ""
