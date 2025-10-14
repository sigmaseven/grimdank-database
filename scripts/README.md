# Database Seeding Instructions

This directory contains scripts to populate the Grimdank database with sample data.

## Quick Setup

### Option 1: Manual MongoDB Import (Recommended)

1. **Start MongoDB** (if not already running):
   ```bash
   # Windows
   net start MongoDB
   
   # macOS
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongod
   ```

2. **Import sample data** using MongoDB Compass or mongoimport:
   ```bash
   # Import factions
   mongoimport --db grimdank_db --collection factions --file scripts/sample_data.json --jsonArray
   
   # Or use MongoDB Compass to import the JSON data
   ```

### Option 2: Use the Go Seeding Script

1. **Make sure MongoDB is running without authentication**:
   ```bash
   # Check if MongoDB is running
   net start MongoDB
   ```

2. **Run the seeding script**:
   ```bash
   go run scripts/simple_seed.go
   ```

## Sample Data Included

The seeding script will add:

- **3 Factions**: Space Marines, Orks, Eldar
- **6 Rules**: Bolter Discipline, Tactical Precision, Iron Will, Stealth, Furious Charge, Feel No Pain
- **6 Weapons**: Bolter, Plasma Gun, Power Sword, Heavy Bolter, Flamer, Melta Gun
- **6 WarGear**: Frag Grenades, Krak Grenades, Medi-pack, Auspex, Comms Array, Jump Pack
- **6 Units**: Tactical Marine, Assault Marine, Devastator Marine, Terminator, Scout, Ork Boy
- **3 Army Books**: Codex: Space Marines, Codex: Orks, Codex: Craftworlds
- **3 Army Lists**: Ultramarines 3rd Company, Goff Waaagh!, Biel-Tan Warhost

## Troubleshooting

### MongoDB Authentication Error
If you get "Command insert requires authentication", you need to:

1. **Disable MongoDB authentication** (for development):
   - Edit your MongoDB config file
   - Comment out or remove authentication settings
   - Restart MongoDB

2. **Or create a user with proper permissions**:
   ```javascript
   use grimdank_db
   db.createUser({
     user: "grimdank",
     pwd: "password",
     roles: ["readWrite"]
   })
   ```

### Connection Issues
- Make sure MongoDB is running on `localhost:27017`
- Check that the database name is `grimdank_db` (as configured in the app)
- Verify MongoDB is accessible without authentication for development

## Manual Data Entry

If seeding doesn't work, you can manually add data through the application interface:

1. Start the application: `go run main.go`
2. Open the frontend in your browser
3. Navigate to each section (Rules, Weapons, etc.)
4. Use the "Add New" buttons to create sample entries

## Verification

After seeding, you can verify the data by:

1. **Starting the application**: `go run main.go`
2. **Opening the frontend**: Navigate to `http://localhost:3000`
3. **Checking each section**: Rules, Weapons, WarGear, Units, Factions, ArmyBooks, ArmyLists
4. **Verifying pagination**: Make sure the "failed to load" errors are gone

The application should now have sample data and work without the empty list errors!
