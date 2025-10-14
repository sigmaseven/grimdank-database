#!/bin/bash

# Bash script to run Go tests with proper environment variables
echo "🧪 Running Go tests with MongoDB connection..."

# Set environment variables
export MONGODB_URI="mongodb://admin:password@localhost:27017/grimdank_db?authSource=admin"
export DATABASE_NAME="grimdank_db"

# Run tests
echo "Running tests with MongoDB URI: $MONGODB_URI"
go test -v -timeout=60s

echo "✅ Tests completed!"
