#!/bin/bash

echo "🌱 Seeding Grimdank Database..."

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "❌ MongoDB is not running. Please start MongoDB first."
    echo "   On Windows: net start MongoDB"
    echo "   On macOS: brew services start mongodb-community"
    echo "   On Linux: sudo systemctl start mongod"
    exit 1
fi

# Run the seeding script
echo "📦 Running database seeder..."
go run scripts/seed_database.go

if [ $? -eq 0 ]; then
    echo "✅ Database seeding completed successfully!"
    echo "🎮 You can now test the application with sample data."
else
    echo "❌ Database seeding failed. Check the error messages above."
    exit 1
fi
