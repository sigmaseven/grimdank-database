# Grimdank Database Startup Guide

This guide helps you start the Grimdank Database application with proper service dependencies and troubleshooting.

## Quick Start

### 1. Clean Environment
```bash
# Stop and remove existing containers
docker-compose down -v

# Remove any orphaned containers
docker system prune -f
```

### 2. Start Services in Order
```bash
# Start MongoDB first
docker-compose up -d mongodb

# Wait for MongoDB to be ready (check logs)
docker-compose logs -f mongodb

# Start backend (depends on MongoDB)
docker-compose up -d backend

# Wait for backend to be ready (check logs)
docker-compose logs -f backend

# Start frontend (depends on backend)
docker-compose up -d frontend
```

### 3. Verify All Services
```bash
# Check container status
docker-compose ps

# Check health endpoints
curl http://localhost:8080/health
curl http://localhost:3000
```

## Troubleshooting

### Run Diagnostic Script
```powershell
# Windows PowerShell
.\troubleshoot.ps1

# Linux/Mac
./troubleshoot.sh
```

### Common Issues and Solutions

#### 1. 500 Internal Server Error
**Causes:**
- Backend can't connect to MongoDB
- MongoDB not ready when backend starts
- Missing environment variables
- Database initialization issues

**Solutions:**
```bash
# Check backend logs
docker-compose logs backend

# Check MongoDB logs
docker-compose logs mongodb

# Restart with proper order
docker-compose down
docker-compose up -d mongodb
sleep 30  # Wait for MongoDB
docker-compose up -d backend
docker-compose up -d frontend
```

#### 2. MongoDB Connection Issues
**Check MongoDB status:**
```bash
# Test MongoDB connection
docker exec grimdank-mongodb mongosh --eval "db.adminCommand('ping')"

# Check MongoDB logs
docker-compose logs mongodb
```

**Solutions:**
```bash
# Restart MongoDB
docker-compose restart mongodb

# Rebuild MongoDB container
docker-compose up --build -d mongodb
```

#### 3. Backend Health Check Failures
**Check backend status:**
```bash
# Test backend health
curl http://localhost:8080/health

# Check backend logs
docker-compose logs backend
```

**Solutions:**
```bash
# Restart backend
docker-compose restart backend

# Rebuild backend container
docker-compose up --build -d backend
```

#### 4. Frontend Connection Issues
**Check frontend status:**
```bash
# Test frontend
curl http://localhost:3000

# Check frontend logs
docker-compose logs frontend
```

**Solutions:**
```bash
# Restart frontend
docker-compose restart frontend

# Rebuild frontend container
docker-compose up --build -d frontend
```

## Service Dependencies

The application has the following startup order:

1. **MongoDB** (Database)
   - Health check: `mongosh --eval "db.adminCommand('ping')"`
   - Port: 27017
   - Initialization: `mongo-init.js`

2. **Backend** (API Server)
   - Depends on: MongoDB (healthy)
   - Health check: `curl http://localhost:8080/health`
   - Port: 8080
   - Environment: `MONGODB_URI`, `DATABASE_NAME`, `SERVER_PORT`

3. **Frontend** (Web Interface)
   - Depends on: Backend (healthy)
   - Port: 3000
   - Serves static files and API calls

## Environment Variables

### Backend Environment
```bash
MONGODB_URI=mongodb://admin:password@mongodb:27017/grimdank_db?authSource=admin
DATABASE_NAME=grimdank_db
SERVER_PORT=8080
```

### MongoDB Environment
```bash
MONGO_INITDB_ROOT_USERNAME=admin
MONGO_INITDB_ROOT_PASSWORD=password
MONGO_INITDB_DATABASE=grimdank_db
```

## Health Checks

### MongoDB Health Check
```bash
docker exec grimdank-mongodb mongosh --eval "db.adminCommand('ping')"
```

### Backend Health Check
```bash
curl http://localhost:8080/health
```

Expected response:
```json
{"status":"healthy","database":"connected"}
```

### Frontend Health Check
```bash
curl http://localhost:3000
```

Expected response: HTML content (200 OK)

## Logs and Debugging

### View All Logs
```bash
docker-compose logs -f
```

### View Specific Service Logs
```bash
# MongoDB logs
docker-compose logs -f mongodb

# Backend logs
docker-compose logs -f backend

# Frontend logs
docker-compose logs -f frontend
```

### Debug Container Issues
```bash
# Enter backend container
docker exec -it grimdank-backend sh

# Enter MongoDB container
docker exec -it grimdank-mongodb mongosh

# Check network connectivity
docker exec grimdank-backend ping mongodb
```

## Clean Restart Procedure

If you're experiencing persistent issues:

```bash
# 1. Stop all services
docker-compose down -v

# 2. Remove all containers and volumes
docker system prune -f
docker volume prune -f

# 3. Rebuild and start
docker-compose up --build -d

# 4. Check status
docker-compose ps
```

## Development vs Production

### Development (docker-compose.dev.yml)
- Hot reload enabled
- Volume mounts for live code changes
- Debug logging enabled

### Production (docker-compose.yml)
- Optimized builds
- No volume mounts
- Production logging

## Monitoring

### Check Service Status
```bash
# All services
docker-compose ps

# Specific service
docker-compose ps mongodb
docker-compose ps backend
docker-compose ps frontend
```

### Monitor Resource Usage
```bash
# Container resource usage
docker stats

# Specific container
docker stats grimdank-backend
```

## Support

If you continue to experience issues:

1. Run the troubleshooting script
2. Check the logs for specific error messages
3. Verify all environment variables are set correctly
4. Ensure Docker has sufficient resources allocated
5. Check for port conflicts (27017, 8080, 3000)
