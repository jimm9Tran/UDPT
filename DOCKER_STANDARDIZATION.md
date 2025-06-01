# 🐳 Docker Configuration Standardization Guide

## 📋 Overview

This document outlines the standardized Docker configuration for the E-commerce Microservices system. The configuration has been optimized for consistency, maintainability, and scalability.

## 🚀 Quick Start

### Development Environment

```bash
# Start the entire system
chmod +x start-standardized.sh
./start-standardized.sh

# Stop the system
chmod +x stop-system.sh
./stop-system.sh

# Clean restart (removes volumes)
./stop-system.sh --clean
./start-standardized.sh
```

### Production Environment

```bash
# Copy and configure production environment
cp .env.prod .env.production
# Edit .env.production with your production values

# Start production system
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d
```

## 🏗️ Architecture

### Port Standardization

| Service | External Port | Internal Port | Purpose |
|---------|---------------|---------------|---------|
| Frontend | 3005 | 3000 | React Application |
| User Service | 3000 | 3000 | User Management |
| Product Service | 3001 | 3001 | Product Catalog |
| Order Service | 3002 | 3002 | Order Processing |
| Payment Service | 3003 | 3003 | Payment Processing |
| API Gateway | 4000 | 4000 | Request Routing |
| Expiration Service | 3006 | 3006 | Order Expiration |

### Infrastructure Services

| Service | Port | Purpose |
|---------|------|---------|
| MongoDB | 27017 | Database |
| NATS | 4222 (client), 8222 (monitoring) | Message Broker |
| Redis | 6379 | Caching & Session Storage |

## 📁 File Structure

```
├── docker-compose.dev.yml      # Development configuration
├── docker-compose.prod.yml     # Production configuration
├── .env                        # Base environment variables
├── .env.local                  # Local development overrides
├── .env.prod                   # Production template
├── start-standardized.sh       # Development startup script
├── stop-system.sh             # System shutdown script
└── scripts/
    └── health-check.sh         # Health monitoring script
```

## 🔧 Configuration Details

### Development Features

- **Hot Reload**: All services support code changes without rebuild
- **Volume Mounting**: Source code mounted for development
- **Health Checks**: Comprehensive health monitoring
- **Service Dependencies**: Proper startup order with health conditions
- **Local Database**: Uses containerized MongoDB instead of cloud

### Production Features

- **Resource Limits**: Memory and CPU constraints
- **Security**: Authentication for databases
- **Persistence**: Named volumes for data persistence
- **Network Isolation**: Custom Docker network
- **Optimized Images**: Multi-stage builds for smaller images

## 🌐 Service Communication

### Internal Communication (Docker Network)

```
Frontend → API Gateway → Microservices
   ↓           ↓              ↓
External    Internal      Internal
 Port        Port          Port
 3005   →    4000     →   3000-3003
```

### External Access

- **Frontend**: http://localhost:3005
- **API Gateway**: http://localhost:4000
- **Direct Service Access** (development only): http://localhost:3000-3003

## 🔍 Health Monitoring

### Automated Health Checks

All services include health check endpoints:

```bash
# Check all services
./scripts/health-check.sh

# Check specific service
curl http://localhost:4000/health
```

### Health Check Endpoints

- **API Gateway**: `GET /health`
- **Microservices**: `GET /health`
- **Frontend**: `GET /` (React app)

## 🗄️ Data Management

### Development Data

```bash
# Reset all data
./stop-system.sh --clean
./start-standardized.sh

# Backup development data
docker run --rm -v code_mongo-data:/data -v $(pwd):/backup alpine tar czf /backup/mongo-backup.tar.gz -C /data .
```

### Production Data

```bash
# Backup production database
docker exec ecommerce-mongo-prod mongodump --out /tmp/backup
docker cp ecommerce-mongo-prod:/tmp/backup ./backup-$(date +%Y%m%d)

# Restore production database
docker cp ./backup-20240101 ecommerce-mongo-prod:/tmp/restore
docker exec ecommerce-mongo-prod mongorestore /tmp/restore
```

## 🚨 Troubleshooting

### Common Issues

1. **Port Conflicts**
   ```bash
   # Check what's using ports
   lsof -i :3000-3006,4000,27017,6379,4222
   
   # Kill conflicting processes
   sudo kill -9 $(lsof -t -i:3000)
   ```

2. **Container Build Issues**
   ```bash
   # Clean rebuild
   docker-compose -f docker-compose.dev.yml down
   docker system prune -f
   docker-compose -f docker-compose.dev.yml build --no-cache
   ```

3. **Permission Issues**
   ```bash
   # Fix script permissions
   chmod +x start-standardized.sh stop-system.sh scripts/health-check.sh
   ```

4. **Database Connection Issues**
   ```bash
   # Check MongoDB connection
   docker exec -it ecommerce-mongo mongosh
   
   # Check service logs
   docker-compose -f docker-compose.dev.yml logs mongo
   ```

### Service-Specific Issues

1. **Frontend Build Errors**
   ```bash
   # Clear npm cache
   docker-compose -f docker-compose.dev.yml exec frontend npm cache clean --force
   
   # Rebuild node_modules
   docker-compose -f docker-compose.dev.yml down
   docker volume rm code_frontend_node_modules
   docker-compose -f docker-compose.dev.yml up --build frontend
   ```

2. **API Gateway Routing Issues**
   ```bash
   # Check service discovery
   docker-compose -f docker-compose.dev.yml exec api-gateway curl http://user-service:3000/health
   
   # Verify environment variables
   docker-compose -f docker-compose.dev.yml exec api-gateway env | grep SERVICE_URL
   ```

## 📊 Monitoring Commands

```bash
# View all container status
docker-compose -f docker-compose.dev.yml ps

# View logs for all services
docker-compose -f docker-compose.dev.yml logs -f

# View logs for specific service
docker-compose -f docker-compose.dev.yml logs -f user-service

# Monitor resource usage
docker stats

# Check service health
curl http://localhost:4000/health/services
```

## 🔄 Updates and Maintenance

### Updating Services

```bash
# Update specific service
docker-compose -f docker-compose.dev.yml up -d --build user-service

# Update all services
docker-compose -f docker-compose.dev.yml up -d --build
```

### Database Migrations

```bash
# Run migrations (if needed)
docker-compose -f docker-compose.dev.yml exec user-service npm run migrate
```

## 🔐 Security Considerations

### Development Environment

- Uses default passwords (acceptable for local development)
- All ports exposed for debugging
- No SSL/TLS termination

### Production Environment

- **Change all default passwords** in `.env.prod`
- Use proper SSL/TLS certificates
- Implement proper firewall rules
- Use secrets management for sensitive data
- Enable Docker daemon security features

## 📈 Performance Optimization

### Development

- Resource limits disabled for easier debugging
- All services run in development mode
- Hot reload enabled

### Production

- Optimized resource allocation
- Production-ready configurations
- Caching strategies enabled
- Proper logging configuration

## 🤝 Contributing

When making changes to Docker configuration:

1. Update both dev and prod configurations
2. Test changes locally
3. Update this documentation
4. Run health checks to verify system integrity
5. Update version numbers if needed

## 📞 Support

For issues related to Docker configuration:

1. Check this documentation
2. Run health checks
3. Review container logs
4. Check service-specific documentation
5. Contact development team

---

**Last Updated**: May 31, 2025
**Configuration Version**: 2.0.0
