# Restart script for MongoDB and Backend services (excludes frontend)
# This script stops, rebuilds, and starts the services to capture latest changes

Write-Host "Stopping MongoDB and Backend services..." -ForegroundColor Yellow
docker-compose down mongodb backend

Write-Host "Rebuilding and starting MongoDB and Backend services..." -ForegroundColor Yellow
docker-compose up --build -d mongodb backend

Write-Host "Services restarted successfully!" -ForegroundColor Green
Write-Host "MongoDB and Backend are now running with latest changes." -ForegroundColor Green
Write-Host "Frontend was left untouched." -ForegroundColor Green
