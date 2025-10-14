package main

import (
	"context"
	"fmt"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func main() {
	// Connect to MongoDB
	client, err := mongo.Connect(context.TODO(), options.Client().ApplyURI("mongodb://localhost:27017"))
	if err != nil {
		log.Fatal("Failed to connect to MongoDB:", err)
	}
	defer client.Disconnect(context.TODO())

	db := client.Database("grimdank_db")

	// Clear existing data
	collections := []string{"rules", "weapons", "wargear", "units", "factions", "armybooks", "armylists"}
	for _, collName := range collections {
		collection := db.Collection(collName)
		collection.Drop(context.TODO())
		fmt.Printf("Cleared %s collection\n", collName)
	}

	// Seed Factions first
	factionCollection := db.Collection("factions")
	factions := []interface{}{
		map[string]interface{}{
			"name":        "Space Marines",
			"description": "Humanity's finest warriors",
			"type":        "Official",
			"createdAt":   time.Now(),
			"updatedAt":   time.Now(),
		},
		map[string]interface{}{
			"name":        "Orks",
			"description": "Brutal and cunning greenskins",
			"type":        "Official",
			"createdAt":   time.Now(),
			"updatedAt":   time.Now(),
		},
		map[string]interface{}{
			"name":        "Eldar",
			"description": "Ancient and graceful aliens",
			"type":        "Official",
			"createdAt":   time.Now(),
			"updatedAt":   time.Now(),
		},
	}

	factionResult, err := factionCollection.InsertMany(context.TODO(), factions)
	if err != nil {
		log.Fatal("Failed to insert factions:", err)
	}
	fmt.Println("Inserted factions")

	// Get faction IDs
	factionIDs := factionResult.InsertedIDs

	// Seed Rules
	ruleCollection := db.Collection("rules")
	rules := []interface{}{
		map[string]interface{}{
			"name":        "Bolter Discipline",
			"description": "Rapid fire weapons can fire twice at half range",
			"type":        "Offensive",
			"points":      []int{5, 10, 15},
		},
		map[string]interface{}{
			"name":        "Tactical Precision",
			"description": "Re-roll hit rolls of 1",
			"type":        "Tactical",
			"points":      []int{3, 6, 9},
		},
		map[string]interface{}{
			"name":        "Iron Will",
			"description": "Ignore morale penalties",
			"type":        "Defensive",
			"points":      []int{2, 4, 6},
		},
		map[string]interface{}{
			"name":        "Stealth",
			"description": "Enemy units have -1 to hit this unit",
			"type":        "Passive",
			"points":      []int{4, 8, 12},
		},
		map[string]interface{}{
			"name":        "Furious Charge",
			"description": "+1 to melee attacks on the charge",
			"type":        "Offensive",
			"points":      []int{3, 6, 9},
		},
		map[string]interface{}{
			"name":        "Feel No Pain",
			"description": "Ignore wounds on a 5+",
			"type":        "Defensive",
			"points":      []int{2, 4, 6},
		},
	}

	_, err = ruleCollection.InsertMany(context.TODO(), rules)
	if err != nil {
		log.Fatal("Failed to insert rules:", err)
	}
	fmt.Println("Inserted rules")

	// Seed Weapons
	weaponCollection := db.Collection("weapons")
	weapons := []interface{}{
		map[string]interface{}{
			"name":    "Bolter",
			"type":    "Rapid Fire",
			"range":   24,
			"ap":      "0",
			"attacks": 1,
			"points":  0,
		},
		map[string]interface{}{
			"name":    "Plasma Gun",
			"type":    "Assault",
			"range":   18,
			"ap":      "-3",
			"attacks": 1,
			"points":  5,
		},
		map[string]interface{}{
			"name":    "Power Sword",
			"type":    "Melee",
			"range":   0,
			"ap":      "-3",
			"attacks": 1,
			"points":  3,
		},
		map[string]interface{}{
			"name":    "Heavy Bolter",
			"type":    "Heavy",
			"range":   36,
			"ap":      "-1",
			"attacks": 3,
			"points":  8,
		},
		map[string]interface{}{
			"name":    "Flamer",
			"type":    "Assault",
			"range":   8,
			"ap":      "0",
			"attacks": 1,
			"points":  4,
		},
		map[string]interface{}{
			"name":    "Melta Gun",
			"type":    "Assault",
			"range":   12,
			"ap":      "-4",
			"attacks": 1,
			"points":  7,
		},
	}

	_, err = weaponCollection.InsertMany(context.TODO(), weapons)
	if err != nil {
		log.Fatal("Failed to insert weapons:", err)
	}
	fmt.Println("Inserted weapons")

	// Seed WarGear
	wargearCollection := db.Collection("wargear")
	wargear := []interface{}{
		map[string]interface{}{
			"name":        "Frag Grenades",
			"type":        "Grenade",
			"description": "Blast weapon for clearing enemies",
			"points":      2,
		},
		map[string]interface{}{
			"name":        "Krak Grenades",
			"type":        "Grenade",
			"description": "Anti-tank grenades",
			"points":      3,
		},
		map[string]interface{}{
			"name":        "Medi-pack",
			"type":        "Equipment",
			"description": "Heal wounded models",
			"points":      5,
		},
		map[string]interface{}{
			"name":        "Auspex",
			"type":        "Equipment",
			"description": "Detect hidden enemies",
			"points":      4,
		},
		map[string]interface{}{
			"name":        "Comms Array",
			"type":        "Equipment",
			"description": "Coordinate with other units",
			"points":      6,
		},
		map[string]interface{}{
			"name":        "Jump Pack",
			"type":        "Equipment",
			"description": "Allows deep strike and increased movement",
			"points":      8,
		},
	}

	_, err = wargearCollection.InsertMany(context.TODO(), wargear)
	if err != nil {
		log.Fatal("Failed to insert wargear:", err)
	}
	fmt.Println("Inserted wargear")

	// Seed Units
	unitCollection := db.Collection("units")
	units := []interface{}{
		map[string]interface{}{
			"name":    "Tactical Marine",
			"type":    "Infantry",
			"melee":   3,
			"ranged":  3,
			"morale":  7,
			"defense": 3,
			"points":  13,
		},
		map[string]interface{}{
			"name":    "Assault Marine",
			"type":    "Infantry",
			"melee":   4,
			"ranged":  2,
			"morale":  7,
			"defense": 3,
			"points":  15,
		},
		map[string]interface{}{
			"name":    "Devastator Marine",
			"type":    "Infantry",
			"melee":   2,
			"ranged":  4,
			"morale":  7,
			"defense": 3,
			"points":  16,
		},
		map[string]interface{}{
			"name":    "Terminator",
			"type":    "Elite",
			"melee":   4,
			"ranged":  3,
			"morale":  8,
			"defense": 2,
			"points":  25,
		},
		map[string]interface{}{
			"name":    "Scout",
			"type":    "Infantry",
			"melee":   3,
			"ranged":  3,
			"morale":  6,
			"defense": 4,
			"points":  10,
		},
		map[string]interface{}{
			"name":    "Ork Boy",
			"type":    "Infantry",
			"melee":   3,
			"ranged":  2,
			"morale":  6,
			"defense": 5,
			"points":  8,
		},
	}

	_, err = unitCollection.InsertMany(context.TODO(), units)
	if err != nil {
		log.Fatal("Failed to insert units:", err)
	}
	fmt.Println("Inserted units")

	// Seed ArmyBooks
	armyBookCollection := db.Collection("armybooks")
	armyBooks := []interface{}{
		map[string]interface{}{
			"name":        "Codex: Space Marines",
			"factionId":   factionIDs[0],
			"description": "Official Space Marine army book",
		},
		map[string]interface{}{
			"name":        "Codex: Orks",
			"factionId":   factionIDs[1],
			"description": "Official Ork army book",
		},
		map[string]interface{}{
			"name":        "Codex: Craftworlds",
			"factionId":   factionIDs[2],
			"description": "Official Eldar army book",
		},
	}

	_, err = armyBookCollection.InsertMany(context.TODO(), armyBooks)
	if err != nil {
		log.Fatal("Failed to insert army books:", err)
	}
	fmt.Println("Inserted army books")

	// Seed ArmyLists
	armyListCollection := db.Collection("armylists")
	armyLists := []interface{}{
		map[string]interface{}{
			"name":      "Ultramarines 3rd Company",
			"player":    "Commander Titus",
			"factionId": factionIDs[0],
			"points":    2000,
		},
		map[string]interface{}{
			"name":      "Goff Waaagh!",
			"player":    "Warboss Gork",
			"factionId": factionIDs[1],
			"points":    1500,
		},
		map[string]interface{}{
			"name":      "Biel-Tan Warhost",
			"player":    "Farseer Eldrad",
			"factionId": factionIDs[2],
			"points":    1800,
		},
	}

	_, err = armyListCollection.InsertMany(context.TODO(), armyLists)
	if err != nil {
		log.Fatal("Failed to insert army lists:", err)
	}
	fmt.Println("Inserted army lists")

	fmt.Println("\n✅ Database seeding completed successfully!")
	fmt.Println("📊 Summary:")
	fmt.Println("   - 3 Factions")
	fmt.Println("   - 6 Rules")
	fmt.Println("   - 6 Weapons")
	fmt.Println("   - 6 WarGear items")
	fmt.Println("   - 6 Units")
	fmt.Println("   - 3 Army Books")
	fmt.Println("   - 3 Army Lists")
}
