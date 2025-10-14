#!/bin/bash

echo "Setting up Grimdank Database..."

# Check if Go is installed
if ! command -v go &> /dev/null; then
    echo "Go is not installed. Please install Go 1.21 or higher."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Please install Node.js 16 or higher."
    exit 1
fi

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "MongoDB is not running. Please start MongoDB."
    echo "On Windows: net start MongoDB"
    echo "On macOS: brew services start mongodb-community"
    echo "On Linux: sudo systemctl start mongod"
    exit 1
fi

echo "Installing Go dependencies..."
go mod tidy

echo "Installing frontend dependencies..."
cd frontend
npm install
cd ..

echo "Creating .env file..."
if [ ! -f .env ]; then
    cp env.example .env
    echo "Created .env file. Please update the MongoDB URI if needed."
fi

echo "Setup complete!"
echo ""
echo "To start the application:"
echo "1. Start the backend: go run main.go"
echo "2. Start the frontend: cd frontend && npm start"
echo ""
echo "Backend will be available at: http://localhost:8080"
echo "Frontend will be available at: http://localhost:3000"
