@echo off
echo 🌱 Seeding Grimdank Database...

echo 📦 Running database seeder...
go run scripts/seed-database/main.go

if %errorlevel% equ 0 (
    echo ✅ Database seeding completed successfully!
    echo 🎮 You can now test the application with sample data.
) else (
    echo ❌ Database seeding failed. Check the error messages above.
    pause
)
