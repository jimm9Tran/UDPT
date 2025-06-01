#!/bin/bash

# =============================================================================
# STANDARDIZED SYSTEM SHUTDOWN SCRIPT
# =============================================================================

echo "🛑 Stopping E-commerce Microservices System"
echo "============================================="

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Set configuration
export COMPOSE_FILE=docker-compose.dev.yml

print_status "Using configuration: $COMPOSE_FILE"

# Graceful shutdown
print_status "Stopping all services gracefully..."
docker-compose -f $COMPOSE_FILE stop

# Remove containers
print_status "Removing containers..."
docker-compose -f $COMPOSE_FILE down --remove-orphans

# Clean volumes if requested
if [[ "$1" == "--clean" ]]; then
    print_warning "Removing volumes (data will be lost)..."
    docker-compose -f $COMPOSE_FILE down -v
fi

# Clean images if requested  
if [[ "$1" == "--clean-all" ]]; then
    print_warning "Removing volumes and images..."
    docker-compose -f $COMPOSE_FILE down -v --rmi all
    docker system prune -f
fi

print_success "System stopped successfully!"

echo ""
echo "💡 Options:"
echo "  🧹 Clean volumes:     ./stop-system.sh --clean"
echo "  🧹 Clean everything:  ./stop-system.sh --clean-all"
echo ""
