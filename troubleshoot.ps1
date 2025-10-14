# Grimdank Database Troubleshooting Script
Write-Host "🔍 Grimdank Database Troubleshooting" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# Check if Docker is running
Write-Host "`n📋 Checking Docker status..." -ForegroundColor Yellow
try {
    docker info | Out-Null
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running. Please start Docker first." -ForegroundColor Red
    exit 1
}

# Check if containers are running
Write-Host "`n📋 Checking container status..." -ForegroundColor Yellow
Write-Host "MongoDB:"
docker ps --filter "name=grimdank-mongodb" --format "table {{.Names}}`t{{.Status}}`t{{.Ports}}"

Write-Host "`nBackend:"
docker ps --filter "name=grimdank-backend" --format "table {{.Names}}`t{{.Status}}`t{{.Ports}}"

Write-Host "`nFrontend:"
docker ps --filter "name=grimdank-frontend" --format "table {{.Names}}`t{{.Status}}`t{{.Ports}}"

# Check container logs
Write-Host "`n📋 Checking container logs..." -ForegroundColor Yellow
Write-Host "MongoDB logs (last 10 lines):"
docker logs grimdank-mongodb 2>&1 | Select-Object -Last 10

Write-Host "`nBackend logs (last 10 lines):"
docker logs grimdank-backend 2>&1 | Select-Object -Last 10

Write-Host "`nFrontend logs (last 10 lines):"
docker logs grimdank-frontend 2>&1 | Select-Object -Last 10

# Check health endpoints
Write-Host "`n📋 Checking health endpoints..." -ForegroundColor Yellow
Write-Host "Backend health:"
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/health" -TimeoutSec 5
    Write-Host "✅ Backend is healthy: $($response.status)" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend health check failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nFrontend:"
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 5
    Write-Host "✅ Frontend is responding (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "❌ Frontend not responding: $($_.Exception.Message)" -ForegroundColor Red
}

# Check MongoDB connection
Write-Host "`n📋 Checking MongoDB connection..." -ForegroundColor Yellow
try {
    docker exec grimdank-mongodb mongosh --eval "db.adminCommand('ping')" 2>$null
    Write-Host "✅ MongoDB is responding" -ForegroundColor Green
} catch {
    Write-Host "❌ MongoDB connection failed" -ForegroundColor Red
}

# Check network connectivity
Write-Host "`n📋 Checking network connectivity..." -ForegroundColor Yellow
try {
    docker exec grimdank-backend ping -c 1 mongodb 2>$null
    Write-Host "✅ Backend can reach MongoDB" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend cannot reach MongoDB" -ForegroundColor Red
}

Write-Host "`n🔍 Troubleshooting complete!" -ForegroundColor Cyan
Write-Host "`n💡 Common solutions:" -ForegroundColor Yellow
Write-Host "1. Restart containers: docker-compose restart"
Write-Host "2. Rebuild containers: docker-compose up --build"
Write-Host "3. Check logs: docker-compose logs [service]"
Write-Host "4. Clean restart: docker-compose down && docker-compose up"
