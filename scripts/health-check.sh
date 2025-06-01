#!/bin/bash

# Health Check Script for Microservices
# This script checks the health status of all microservices

echo "🔍 Starting health check for all microservices..."
echo "=================================================="

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Service configuration (Updated for standardized ports)
declare -A services=(
    ["user-service"]="3000"
    ["product-service"]="3001"
    ["order-service"]="3002"
    ["payment-service"]="3003"
    ["api-gateway"]="4000"
    ["frontend"]="3005"
    ["expiration-service"]="3006"
)

# Infrastructure services
declare -A infrastructure=(
    ["MongoDB"]="27017"
    ["Redis"]="6379"
    ["NATS"]="4222"
)

# Function to check HTTP service
check_http_service() {
    local service_name=$1
    local port=$2
    local url="http://localhost:${port}"
    
    echo -n "Checking ${service_name} (port ${port})... "
    
    if curl -s --max-time 5 "${url}/health" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ HEALTHY${NC}"
        return 0
    elif curl -s --max-time 5 "${url}" > /dev/null 2>&1; then
        echo -e "${YELLOW}⚠ RESPONDING (no health endpoint)${NC}"
        return 1
    else
        echo -e "${RED}✗ UNHEALTHY${NC}"
        return 2
    fi
}

# Function to check infrastructure service
check_infrastructure() {
    local service_name=$1
    local port=$2
    
    echo -n "Checking ${service_name} (port ${port})... "
    
    case $service_name in
        "MongoDB")
            if nc -z localhost $port 2>/dev/null; then
                echo -e "${GREEN}✓ CONNECTED${NC}"
                return 0
            else
                echo -e "${RED}✗ DISCONNECTED${NC}"
                return 1
            fi
            ;;
        "Redis")
            if redis-cli -p $port ping 2>/dev/null | grep -q "PONG"; then
                echo -e "${GREEN}✓ CONNECTED${NC}"
                return 0
            else
                echo -e "${RED}✗ DISCONNECTED${NC}"
                return 1
            fi
            ;;
        "NATS")
            if nc -z localhost $port 2>/dev/null; then
                echo -e "${GREEN}✓ CONNECTED${NC}"
                return 0
            else
                echo -e "${RED}✗ DISCONNECTED${NC}"
                return 1
            fi
            ;;
    esac
}

# Check infrastructure services first
echo -e "\n${BLUE}Infrastructure Services:${NC}"
echo "------------------------"
for service in "${!infrastructure[@]}"; do
    check_infrastructure "$service" "${infrastructure[$service]}"
done

# Check microservices
echo -e "\n${BLUE}Microservices:${NC}"
echo "---------------"
healthy_count=0
total_count=${#services[@]}

for service in "${!services[@]}"; do
    if check_http_service "$service" "${services[$service]}"; then
        ((healthy_count++))
    fi
done

# Summary
echo -e "\n${BLUE}Summary:${NC}"
echo "--------"
echo "Healthy services: ${healthy_count}/${total_count}"

if [ $healthy_count -eq $total_count ]; then
    echo -e "${GREEN}All services are healthy! 🎉${NC}"
    exit 0
else
    echo -e "${YELLOW}Some services need attention! ⚠️${NC}"
    exit 1
fi

# Port conflict explanation
echo -e "\n${BLUE}Why different ports are necessary:${NC}"
echo "-----------------------------------"
echo "❌ Cannot use port 3000 for all services because:"
echo "   1. Port conflicts: Only one process can bind to a port"
echo "   2. Service isolation: Each service needs its own endpoint"
echo "   3. Load balancing: API Gateway routes to specific service ports"
echo "   4. Debugging: Easier to identify which service is responding"
echo ""
echo "✅ Current port mapping:"
echo "   - API Gateway: 3000 (main entry point)"
echo "   - User Service: 3001"
echo "   - Product Service: 3002"
echo "   - Order Service: 3003"
echo "   - Payment Service: 3004"
echo "   - Frontend: 3005"
