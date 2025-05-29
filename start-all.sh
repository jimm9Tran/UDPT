#!/bin/bash

# Build and run all microservices
echo "🚀 Starting E-commerce Microservices System..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check if .env exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Creating from .env.example...${NC}"
    cp .env.example .env
    echo -e "${RED}❗ Please update .env with your actual VNPay credentials before continuing${NC}"
    exit 1
fi

# Load environment variables
source .env

echo -e "${BLUE}📋 Checking required services...${NC}"

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker is running${NC}"

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ docker-compose not found. Please install docker-compose.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ docker-compose is available${NC}"

# Build and start services
echo -e "\n${YELLOW}🔨 Building and starting services...${NC}"

# Stop any existing containers
echo -e "${YELLOW}🛑 Stopping existing containers...${NC}"
docker-compose -f docker-compose.dev.yml down

# Build and start services
echo -e "${YELLOW}🚀 Starting all services...${NC}"
docker-compose -f docker-compose.dev.yml up --build -d

# Wait for services to start
echo -e "${YELLOW}⏳ Waiting for services to initialize...${NC}"
sleep 30

# Check service health
echo -e "\n${BLUE}🏥 Checking service health...${NC}"

services=(
    "http://localhost:3000:User Service"
    "http://localhost:3001:Product Service" 
    "http://localhost:3002:Order Service"
    "http://localhost:3003:Payment Service"
    "http://localhost:4222:NATS Streaming"
    "http://localhost:27017:MongoDB"
    "http://localhost:6379:Redis"
)

for service in "${services[@]}" ; do
    url="${service%%:*}"
    name="${service##*:}"
    
    if curl -f -s -m 5 "$url" >/dev/null 2>&1 || nc -z ${url#http://} 2>/dev/null; then
        echo -e "${GREEN}✅ $name is running${NC}"
    else
        echo -e "${RED}❌ $name is not responding${NC}"
    fi
done

# Show service URLs
echo -e "\n${BLUE}🌐 Service URLs:${NC}"
echo -e "   📱 User Service:     http://localhost:3000"
echo -e "   📦 Product Service:  http://localhost:3001"
echo -e "   🛒 Order Service:    http://localhost:3002"
echo -e "   💳 Payment Service:  http://localhost:3003"
echo -e "   📡 NATS Monitor:     http://localhost:8222"
echo -e "   🗄️  MongoDB:         mongodb://localhost:27017"
echo -e "   🚀 Redis:            redis://localhost:6379"

# Show sample API calls
echo -e "\n${YELLOW}📖 Sample API Calls:${NC}"
echo -e "   # User signup"
echo -e "   curl -X POST http://localhost:3000/api/users/signup \\"
echo -e "     -H 'Content-Type: application/json' \\"
echo -e "     -d '{\"email\":\"test@example.com\",\"password\":\"password\",\"name\":\"Test User\"}'"

echo -e "\n   # Create product"
echo -e "   curl -X POST http://localhost:3001/api/products \\"
echo -e "     -H 'Content-Type: application/json' \\"
echo -e "     -H 'Cookie: session=<jwt_token>' \\"
echo -e "     -d '{\"name\":\"iPhone 15\",\"price\":25000000,\"description\":\"Latest iPhone\"}'"

echo -e "\n   # Create order"
echo -e "   curl -X POST http://localhost:3002/api/orders \\"
echo -e "     -H 'Content-Type: application/json' \\"
echo -e "     -H 'Cookie: session=<jwt_token>' \\"
echo -e "     -d '{\"orderItems\":[{\"product\":\"product_id\",\"qty\":1}],\"paymentMethod\":\"VNPay\"}'"

echo -e "\n   # Create payment"
echo -e "   curl -X POST http://localhost:3003/api/payments \\"
echo -e "     -H 'Content-Type: application/json' \\"
echo -e "     -H 'Cookie: session=<jwt_token>' \\"
echo -e "     -d '{\"orderId\":\"order_id\",\"amount\":50000}'"

echo -e "\n${GREEN}🎉 All services are now running!${NC}"
echo -e "${YELLOW}📝 Next steps:${NC}"
echo -e "   1. Import Postman collection: payment/postman-collection.json"
echo -e "   2. Update your VNPay credentials in .env file"
echo -e "   3. Test the complete order-to-payment flow"
echo -e "   4. Check logs: docker-compose -f docker-compose.dev.yml logs -f"

echo -e "\n${BLUE}🛠️  Useful commands:${NC}"
echo -e "   Stop all:     docker-compose -f docker-compose.dev.yml down"
echo -e "   View logs:    docker-compose -f docker-compose.dev.yml logs -f [service-name]"
echo -e "   Restart:      docker-compose -f docker-compose.dev.yml restart [service-name]"
echo -e "   Clean up:     docker-compose -f docker-compose.dev.yml down -v --rmi all"
