package main

import (
	"context"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Rule struct {
	ID          primitive.ObjectID `bson:"_id,omitempty"`
	Name        string             `bson:"name"`
	Description string             `bson:"description"`
	Points      []int              `bson:"points"`
	CreatedAt   time.Time          `bson:"createdAt"`
	UpdatedAt   time.Time          `bson:"updatedAt"`
}

type Weapon struct {
	ID      primitive.ObjectID `bson:"_id,omitempty"`
	Name    string             `bson:"name"`
	Type    string             `bson:"type"`
	Range   int                `bson:"range"`
	AP      string             `bson:"ap"`
	Attacks int                `bson:"attacks"`
	Points  int                `bson:"points"`
}

type WarGear struct {
	ID          primitive.ObjectID   `bson:"_id,omitempty"`
	Name        string               `bson:"name"`
	Description string               `bson:"description"`
	Points      int                  `bson:"points"`
	Rules       []primitive.ObjectID `bson:"rules"`
}

type Unit struct {
	ID      primitive.ObjectID   `bson:"_id,omitempty"`
	Name    string               `bson:"name"`
	Type    string               `bson:"type"`
	Melee   int                  `bson:"melee"`
	Ranged  int                  `bson:"ranged"`
	Morale  int                  `bson:"morale"`
	Defense int                  `bson:"defense"`
	Points  int                  `bson:"points"`
	Amount  int                  `bson:"amount"`
	Max     int                  `bson:"max"`
	Weapons []primitive.ObjectID `bson:"weapons"`
	WarGear []primitive.ObjectID `bson:"warGear"`
}

type Faction struct {
	ID          primitive.ObjectID `bson:"_id,omitempty"`
	Name        string             `bson:"name"`
	Description string             `bson:"description"`
	Type        string             `bson:"type"`
}

type ArmyBook struct {
	ID        primitive.ObjectID   `bson:"_id,omitempty"`
	Name      string               `bson:"name"`
	FactionID primitive.ObjectID   `bson:"factionId"`
	Version   string               `bson:"version"`
	Rules     []primitive.ObjectID `bson:"rules"`
}

type ArmyList struct {
	ID        primitive.ObjectID   `bson:"_id,omitempty"`
	Name      string               `bson:"name"`
	Player    string               `bson:"player"`
	FactionID primitive.ObjectID   `bson:"factionId"`
	Points    int                  `bson:"points"`
	UnitIds   []primitive.ObjectID `bson:"unitIds"`
}

func main() {
	log.Println("🚀 Starting placeholder data population...")

	// Connect to MongoDB
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	client, err := mongo.Connect(ctx, options.Client().ApplyURI("mongodb://localhost:27017"))
	if err != nil {
		log.Fatal("Failed to connect to MongoDB:", err)
	}
	defer client.Disconnect(context.TODO())

	db := client.Database("grimdank_db")

	// Clear existing collections
	log.Println("🧹 Clearing existing data...")
	collections := []string{"factions", "rules", "weapons", "wargear", "units", "armybooks", "armylists"}
	for _, collName := range collections {
		db.Collection(collName).Drop(context.TODO())
	}

	// Create Factions (10)
	log.Println("📦 Creating Factions...")
	factionCollection := db.Collection("factions")
	factions := []interface{}{
		Faction{Name: "Star Guardians", Description: "Elite protectors from distant star systems", Type: "Military"},
		Faction{Name: "Void Walkers", Description: "Mysterious entities that traverse dimensions", Type: "Esoteric"},
		Faction{Name: "Iron Legion", Description: "Mechanized warriors with advanced technology", Type: "Military"},
		Faction{Name: "Crystal Collective", Description: "Beings of pure energy and crystal", Type: "Esoteric"},
		Faction{Name: "Shadow Syndicate", Description: "Covert operatives and assassins", Type: "Stealth"},
		Faction{Name: "Thunder Tribes", Description: "Nomadic warriors who control storms", Type: "Military"},
		Faction{Name: "Nexus Seekers", Description: "Explorers searching for ancient knowledge", Type: "Research"},
		Faction{Name: "Crimson Order", Description: "Ancient knights bound by sacred oaths", Type: "Military"},
		Faction{Name: "Frost Clans", Description: "Hardy people adapted to frozen wastes", Type: "Tribal"},
		Faction{Name: "Ember Coalition", Description: "Fire-wielding mystics and warriors", Type: "Esoteric"},
	}
	factionResult, err := factionCollection.InsertMany(context.TODO(), factions)
	if err != nil {
		log.Fatal("Failed to insert factions:", err)
	}
	factionIDs := make([]primitive.ObjectID, len(factionResult.InsertedIDs))
	for i, id := range factionResult.InsertedIDs {
		factionIDs[i] = id.(primitive.ObjectID)
	}
	log.Printf("✅ Created %d factions\n", len(factionIDs))

	// Create Rules (10)
	log.Println("📦 Creating Rules...")
	ruleCollection := db.Collection("rules")
	rules := []interface{}{
		Rule{Name: "Shield Barrier", Description: "Provides additional protection against incoming attacks", Points: []int{5, 10, 15}, CreatedAt: time.Now(), UpdatedAt: time.Now()},
		Rule{Name: "Rapid Strike", Description: "Allows for multiple quick attacks in succession", Points: []int{8, 12, 18}, CreatedAt: time.Now(), UpdatedAt: time.Now()},
		Rule{Name: "Stealth Field", Description: "Makes the unit harder to detect and target", Points: []int{6, 9, 12}, CreatedAt: time.Now(), UpdatedAt: time.Now()},
		Rule{Name: "Commander's Will", Description: "Boosts morale of nearby friendly units", Points: []int{10, 15, 20}, CreatedAt: time.Now(), UpdatedAt: time.Now()},
		Rule{Name: "Energy Absorption", Description: "Converts incoming energy damage into power", Points: []int{7, 11, 16}, CreatedAt: time.Now(), UpdatedAt: time.Now()},
		Rule{Name: "Precision Targeting", Description: "Increases accuracy of ranged weapons", Points: []int{5, 8, 12}, CreatedAt: time.Now(), UpdatedAt: time.Now()},
		Rule{Name: "Phase Shift", Description: "Can briefly become intangible", Points: []int{12, 18, 24}, CreatedAt: time.Now(), UpdatedAt: time.Now()},
		Rule{Name: "Tactical Retreat", Description: "Can disengage from combat without penalty", Points: []int{4, 6, 8}, CreatedAt: time.Now(), UpdatedAt: time.Now()},
		Rule{Name: "Regeneration", Description: "Slowly recovers from damage over time", Points: []int{8, 14, 20}, CreatedAt: time.Now(), UpdatedAt: time.Now()},
		Rule{Name: "Coordinated Fire", Description: "Multiple units can combine ranged attacks", Points: []int{6, 10, 15}, CreatedAt: time.Now(), UpdatedAt: time.Now()},
	}
	ruleResult, err := ruleCollection.InsertMany(context.TODO(), rules)
	if err != nil {
		log.Fatal("Failed to insert rules:", err)
	}
	ruleIDs := make([]primitive.ObjectID, len(ruleResult.InsertedIDs))
	for i, id := range ruleResult.InsertedIDs {
		ruleIDs[i] = id.(primitive.ObjectID)
	}
	log.Printf("✅ Created %d rules\n", len(ruleIDs))

	// Create Weapons (10)
	log.Println("📦 Creating Weapons...")
	weaponCollection := db.Collection("weapons")
	weapons := []interface{}{
		Weapon{Name: "Plasma Rifle", Type: "ranged", Range: 24, AP: "2", Attacks: 2, Points: 15},
		Weapon{Name: "Power Blade", Type: "melee", Range: 0, AP: "3", Attacks: 3, Points: 12},
		Weapon{Name: "Laser Cannon", Type: "ranged", Range: 36, AP: "1", Attacks: 3, Points: 20},
		Weapon{Name: "Thunder Hammer", Type: "melee", Range: 0, AP: "4", Attacks: 2, Points: 18},
		Weapon{Name: "Fusion Blaster", Type: "ranged", Range: 18, AP: "3", Attacks: 1, Points: 14},
		Weapon{Name: "Electro Whip", Type: "melee", Range: 0, AP: "1", Attacks: 4, Points: 10},
		Weapon{Name: "Graviton Beamer", Type: "ranged", Range: 30, AP: "2", Attacks: 2, Points: 16},
		Weapon{Name: "Crystal Spear", Type: "melee", Range: 0, AP: "2", Attacks: 2, Points: 11},
		Weapon{Name: "Arc Projector", Type: "ranged", Range: 12, AP: "1", Attacks: 5, Points: 13},
		Weapon{Name: "Void Scythe", Type: "melee", Range: 0, AP: "3", Attacks: 3, Points: 17},
	}
	weaponResult, err := weaponCollection.InsertMany(context.TODO(), weapons)
	if err != nil {
		log.Fatal("Failed to insert weapons:", err)
	}
	weaponIDs := make([]primitive.ObjectID, len(weaponResult.InsertedIDs))
	for i, id := range weaponResult.InsertedIDs {
		weaponIDs[i] = id.(primitive.ObjectID)
	}
	log.Printf("✅ Created %d weapons\n", len(weaponIDs))

	// Create WarGear (10)
	log.Println("📦 Creating WarGear...")
	wargearCollection := db.Collection("wargear")
	wargear := []interface{}{
		WarGear{Name: "Combat Shield", Description: "Provides +1 to defense rolls", Points: 5, Rules: []primitive.ObjectID{ruleIDs[0]}},
		WarGear{Name: "Jet Pack", Description: "Allows for enhanced mobility", Points: 8, Rules: []primitive.ObjectID{ruleIDs[7]}},
		WarGear{Name: "Targeting Computer", Description: "Improves accuracy of weapons", Points: 6, Rules: []primitive.ObjectID{ruleIDs[5]}},
		WarGear{Name: "Cloaking Device", Description: "Makes unit harder to detect", Points: 10, Rules: []primitive.ObjectID{ruleIDs[2]}},
		WarGear{Name: "Energy Core", Description: "Powers special equipment", Points: 7, Rules: []primitive.ObjectID{ruleIDs[4]}},
		WarGear{Name: "Fortified Armor", Description: "Heavy protective plating", Points: 9, Rules: []primitive.ObjectID{ruleIDs[0]}},
		WarGear{Name: "Scanner Array", Description: "Detects hidden enemies", Points: 4, Rules: []primitive.ObjectID{}},
		WarGear{Name: "Medical Kit", Description: "Can heal wounded units", Points: 6, Rules: []primitive.ObjectID{ruleIDs[8]}},
		WarGear{Name: "Comm Relay", Description: "Improves coordination", Points: 5, Rules: []primitive.ObjectID{ruleIDs[3]}},
		WarGear{Name: "Phase Generator", Description: "Allows brief intangibility", Points: 12, Rules: []primitive.ObjectID{ruleIDs[6]}},
	}
	wargearResult, err := wargearCollection.InsertMany(context.TODO(), wargear)
	if err != nil {
		log.Fatal("Failed to insert wargear:", err)
	}
	wargearIDs := make([]primitive.ObjectID, len(wargearResult.InsertedIDs))
	for i, id := range wargearResult.InsertedIDs {
		wargearIDs[i] = id.(primitive.ObjectID)
	}
	log.Printf("✅ Created %d wargear items\n", len(wargearIDs))

	// Create Units (10)
	log.Println("📦 Creating Units...")
	unitCollection := db.Collection("units")
	units := []interface{}{
		Unit{Name: "Guardian Trooper", Type: "Infantry", Melee: 3, Ranged: 4, Morale: 7, Defense: 5, Points: 25, Amount: 5, Max: 10, Weapons: []primitive.ObjectID{weaponIDs[0]}, WarGear: []primitive.ObjectID{wargearIDs[0]}},
		Unit{Name: "Void Assassin", Type: "Infantry", Melee: 5, Ranged: 3, Morale: 8, Defense: 4, Points: 35, Amount: 3, Max: 5, Weapons: []primitive.ObjectID{weaponIDs[1]}, WarGear: []primitive.ObjectID{wargearIDs[3]}},
		Unit{Name: "Battle Mech", Type: "Vehicle", Melee: 4, Ranged: 6, Morale: 9, Defense: 8, Points: 75, Amount: 1, Max: 3, Weapons: []primitive.ObjectID{weaponIDs[2], weaponIDs[6]}, WarGear: []primitive.ObjectID{wargearIDs[5]}},
		Unit{Name: "Crystal Warrior", Type: "Infantry", Melee: 4, Ranged: 4, Morale: 7, Defense: 6, Points: 30, Amount: 5, Max: 10, Weapons: []primitive.ObjectID{weaponIDs[7]}, WarGear: []primitive.ObjectID{wargearIDs[4]}},
		Unit{Name: "Shadow Agent", Type: "Infantry", Melee: 4, Ranged: 5, Morale: 8, Defense: 4, Points: 32, Amount: 4, Max: 8, Weapons: []primitive.ObjectID{weaponIDs[8]}, WarGear: []primitive.ObjectID{wargearIDs[3]}},
		Unit{Name: "Storm Knight", Type: "Leader", Melee: 6, Ranged: 3, Morale: 9, Defense: 7, Points: 50, Amount: 1, Max: 1, Weapons: []primitive.ObjectID{weaponIDs[3]}, WarGear: []primitive.ObjectID{wargearIDs[8]}},
		Unit{Name: "Tech Scout", Type: "Infantry", Melee: 2, Ranged: 4, Morale: 6, Defense: 4, Points: 20, Amount: 6, Max: 12, Weapons: []primitive.ObjectID{weaponIDs[0]}, WarGear: []primitive.ObjectID{wargearIDs[6]}},
		Unit{Name: "Crimson Champion", Type: "Leader", Melee: 7, Ranged: 4, Morale: 10, Defense: 7, Points: 60, Amount: 1, Max: 1, Weapons: []primitive.ObjectID{weaponIDs[9], weaponIDs[1]}, WarGear: []primitive.ObjectID{wargearIDs[5]}},
		Unit{Name: "Frost Hunter", Type: "Infantry", Melee: 5, Ranged: 3, Morale: 7, Defense: 5, Points: 28, Amount: 5, Max: 10, Weapons: []primitive.ObjectID{weaponIDs[5]}, WarGear: []primitive.ObjectID{wargearIDs[1]}},
		Unit{Name: "Ember Priest", Type: "Leader", Melee: 3, Ranged: 5, Morale: 8, Defense: 5, Points: 45, Amount: 1, Max: 1, Weapons: []primitive.ObjectID{weaponIDs[4]}, WarGear: []primitive.ObjectID{wargearIDs[9]}},
	}
	unitResult, err := unitCollection.InsertMany(context.TODO(), units)
	if err != nil {
		log.Fatal("Failed to insert units:", err)
	}
	unitIDs := make([]primitive.ObjectID, len(unitResult.InsertedIDs))
	for i, id := range unitResult.InsertedIDs {
		unitIDs[i] = id.(primitive.ObjectID)
	}
	log.Printf("✅ Created %d units\n", len(unitIDs))

	// Create ArmyBooks (10)
	log.Println("📦 Creating ArmyBooks...")
	armyBookCollection := db.Collection("armybooks")
	armyBooks := []interface{}{
		ArmyBook{Name: "Guardians Codex", FactionID: factionIDs[0], Version: "2.0", Rules: []primitive.ObjectID{ruleIDs[0], ruleIDs[5]}},
		ArmyBook{Name: "Void Walker Grimoire", FactionID: factionIDs[1], Version: "1.5", Rules: []primitive.ObjectID{ruleIDs[6], ruleIDs[2]}},
		ArmyBook{Name: "Iron Legion Manual", FactionID: factionIDs[2], Version: "3.0", Rules: []primitive.ObjectID{ruleIDs[9], ruleIDs[3]}},
		ArmyBook{Name: "Crystal Compendium", FactionID: factionIDs[3], Version: "1.0", Rules: []primitive.ObjectID{ruleIDs[4], ruleIDs[8]}},
		ArmyBook{Name: "Shadow Operations", FactionID: factionIDs[4], Version: "2.5", Rules: []primitive.ObjectID{ruleIDs[2], ruleIDs[7]}},
		ArmyBook{Name: "Thunder Chronicles", FactionID: factionIDs[5], Version: "1.8", Rules: []primitive.ObjectID{ruleIDs[1], ruleIDs[3]}},
		ArmyBook{Name: "Nexus Archives", FactionID: factionIDs[6], Version: "2.2", Rules: []primitive.ObjectID{ruleIDs[5], ruleIDs[9]}},
		ArmyBook{Name: "Crimson Oaths", FactionID: factionIDs[7], Version: "4.0", Rules: []primitive.ObjectID{ruleIDs[0], ruleIDs[3]}},
		ArmyBook{Name: "Frost Sagas", FactionID: factionIDs[8], Version: "1.3", Rules: []primitive.ObjectID{ruleIDs[8], ruleIDs[4]}},
		ArmyBook{Name: "Ember Teachings", FactionID: factionIDs[9], Version: "2.0", Rules: []primitive.ObjectID{ruleIDs[1], ruleIDs[4]}},
	}
	armyBookResult, err := armyBookCollection.InsertMany(context.TODO(), armyBooks)
	if err != nil {
		log.Fatal("Failed to insert army books:", err)
	}
	log.Printf("✅ Created %d army books\n", len(armyBookResult.InsertedIDs))

	// Create ArmyLists (10)
	log.Println("📦 Creating ArmyLists...")
	armyListCollection := db.Collection("armylists")
	armyLists := []interface{}{
		ArmyList{Name: "Strike Force Alpha", Player: "Commander Nova", FactionID: factionIDs[0], Points: 500, UnitIds: []primitive.ObjectID{unitIDs[0], unitIDs[6]}},
		ArmyList{Name: "Phantom Brigade", Player: "Agent Shadow", FactionID: factionIDs[1], Points: 450, UnitIds: []primitive.ObjectID{unitIDs[1], unitIDs[4]}},
		ArmyList{Name: "Steel Phalanx", Player: "Marshal Iron", FactionID: factionIDs[2], Points: 600, UnitIds: []primitive.ObjectID{unitIDs[2]}},
		ArmyList{Name: "Prism Warband", Player: "Crystal Sage", FactionID: factionIDs[3], Points: 400, UnitIds: []primitive.ObjectID{unitIDs[3]}},
		ArmyList{Name: "Silent Death", Player: "Master Shade", FactionID: factionIDs[4], Points: 420, UnitIds: []primitive.ObjectID{unitIDs[4], unitIDs[1]}},
		ArmyList{Name: "Thunder Company", Player: "Lord Storm", FactionID: factionIDs[5], Points: 550, UnitIds: []primitive.ObjectID{unitIDs[5], unitIDs[0]}},
		ArmyList{Name: "Explorer Division", Player: "Scholar Prime", FactionID: factionIDs[6], Points: 380, UnitIds: []primitive.ObjectID{unitIDs[6]}},
		ArmyList{Name: "Honor Guard", Player: "Knight Captain", FactionID: factionIDs[7], Points: 650, UnitIds: []primitive.ObjectID{unitIDs[7], unitIDs[0]}},
		ArmyList{Name: "Frozen Horde", Player: "Chieftain Frost", FactionID: factionIDs[8], Points: 480, UnitIds: []primitive.ObjectID{unitIDs[8], unitIDs[6]}},
		ArmyList{Name: "Flame Covenant", Player: "High Priest Ember", FactionID: factionIDs[9], Points: 520, UnitIds: []primitive.ObjectID{unitIDs[9]}},
	}
	armyListResult, err := armyListCollection.InsertMany(context.TODO(), armyLists)
	if err != nil {
		log.Fatal("Failed to insert army lists:", err)
	}
	log.Printf("✅ Created %d army lists\n", len(armyListResult.InsertedIDs))

	log.Println("\n🎉 Successfully populated database with placeholder data!")
	log.Println("📊 Summary:")
	log.Printf("   - %d Factions\n", len(factionIDs))
	log.Printf("   - %d Rules\n", len(ruleIDs))
	log.Printf("   - %d Weapons\n", len(weaponIDs))
	log.Printf("   - %d WarGear items\n", len(wargearIDs))
	log.Printf("   - %d Units\n", len(unitIDs))
	log.Printf("   - %d Army Books\n", len(armyBookResult.InsertedIDs))
	log.Printf("   - %d Army Lists\n", len(armyListResult.InsertedIDs))
}
