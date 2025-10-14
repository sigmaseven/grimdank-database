#!/bin/bash

# Grimdank Database Troubleshooting Script
echo "🔍 Grimdank Database Troubleshooting"
echo "====================================="

# Check if Docker is running
echo "📋 Checking Docker status..."
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi
echo "✅ Docker is running"

# Check if containers are running
echo ""
echo "📋 Checking container status..."
echo "MongoDB:"
docker ps --filter "name=grimdank-mongodb" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "Backend:"
docker ps --filter "name=grimdank-backend" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "Frontend:"
docker ps --filter "name=grimdank-frontend" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Check container logs
echo ""
echo "📋 Checking container logs..."
echo "MongoDB logs (last 10 lines):"
docker logs grimdank-mongodb 2>&1 | tail -10

echo ""
echo "Backend logs (last 10 lines):"
docker logs grimdank-backend 2>&1 | tail -10

echo ""
echo "Frontend logs (last 10 lines):"
docker logs grimdank-frontend 2>&1 | tail -10

# Check health endpoints
echo ""
echo "📋 Checking health endpoints..."
echo "Backend health:"
curl -s http://localhost:8080/health || echo "❌ Backend health check failed"

echo ""
echo "Frontend:"
curl -s -I http://localhost:3000 | head -1 || echo "❌ Frontend not responding"

# Check MongoDB connection
echo ""
echo "📋 Checking MongoDB connection..."
docker exec grimdank-mongodb mongosh --eval "db.adminCommand('ping')" 2>/dev/null && echo "✅ MongoDB is responding" || echo "❌ MongoDB connection failed"

# Check network connectivity
echo ""
echo "📋 Checking network connectivity..."
docker exec grimdank-backend ping -c 1 mongodb > /dev/null 2>&1 && echo "✅ Backend can reach MongoDB" || echo "❌ Backend cannot reach MongoDB"

echo ""
echo "🔍 Troubleshooting complete!"
echo ""
echo "💡 Common solutions:"
echo "1. Restart containers: docker-compose restart"
echo "2. Rebuild containers: docker-compose up --build"
echo "3. Check logs: docker-compose logs [service]"
echo "4. Clean restart: docker-compose down && docker-compose up"
