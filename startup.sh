#!/bin/bash

# Startup script for Grimdank Database
echo "🚀 Starting Grimdank Database..."

# Wait for MongoDB to be ready
echo "⏳ Waiting for MongoDB to be ready..."
until mongosh --host mongodb:27017 --username admin --password password --authenticationDatabase admin --eval "db.adminCommand('ping')" > /dev/null 2>&1; do
  echo "   MongoDB not ready yet, waiting..."
  sleep 2
done
echo "✅ MongoDB is ready!"

# Start the application
echo "🚀 Starting backend application..."
exec ./main
