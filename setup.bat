@echo off
echo Setting up Grimdank Database...

REM Check if Go is installed
go version >nul 2>&1
if %errorlevel% neq 0 (
    echo Go is not installed. Please install Go 1.21 or higher.
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js is not installed. Please install Node.js 16 or higher.
    exit /b 1
)

REM Check if MongoDB is running
sc query MongoDB >nul 2>&1
if %errorlevel% neq 0 (
    echo MongoDB service not found. Please install and start MongoDB.
    exit /b 1
)

echo Installing Go dependencies...
go mod tidy

echo Installing frontend dependencies...
cd frontend
npm install
cd ..

echo Creating .env file...
if not exist .env (
    copy env.example .env
    echo Created .env file. Please update the MongoDB URI if needed.
)

echo Setup complete!
echo.
echo To start the application:
echo 1. Start the backend: go run main.go
echo 2. Start the frontend: cd frontend ^&^& npm start
echo.
echo Backend will be available at: http://localhost:8080
echo Frontend will be available at: http://localhost:3000
