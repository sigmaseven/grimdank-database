# PowerShell script to run Go tests with proper environment variables
Write-Host "🧪 Running Go tests with MongoDB connection..." -ForegroundColor Green

# Set environment variables
$env:MONGODB_URI = "mongodb://admin:password@localhost:27017/grimdank_db?authSource=admin"
$env:DATABASE_NAME = "grimdank_db"

# Run tests
Write-Host "Running tests with MongoDB URI: $($env:MONGODB_URI)" -ForegroundColor Yellow
go test .\tests\... -v -timeout=60s

Write-Host "✅ Tests completed!" -ForegroundColor Green
