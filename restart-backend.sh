#!/bin/bash

# Restart script for MongoDB and Backend services (excludes frontend)
# This script stops, rebuilds, and starts the services to capture latest changes

echo "Stopping MongoDB and Backend services..."
docker-compose down mongodb backend

echo "Rebuilding and starting MongoDB and Backend services..."
docker-compose up --build -d mongodb backend

echo "Services restarted successfully!"
echo "MongoDB and Backend are now running with latest changes."
echo "Frontend was left untouched."
