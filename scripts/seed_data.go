package main

import (
	"context"
	"fmt"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// Sample data structures
type Rule struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Name        string             `bson:"name" json:"name"`
	Description string             `bson:"description" json:"description"`
	Type        string             `bson:"type" json:"type"`
	Points      []int              `bson:"points" json:"points"`
}

type Weapon struct {
	ID      primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Name    string             `bson:"name" json:"name"`
	Type    string             `bson:"type" json:"type"`
	Range   int                `bson:"range" json:"range"`
	AP      string             `bson:"ap" json:"ap"`
	Attacks int                `bson:"attacks" json:"attacks"`
	Points  int                `bson:"points" json:"points"`
}

type WarGear struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Name        string             `bson:"name" json:"name"`
	Type        string             `bson:"type" json:"type"`
	Description string             `bson:"description" json:"description"`
	Points      int                `bson:"points" json:"points"`
}

type Unit struct {
	ID      primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Name    string             `bson:"name" json:"name"`
	Type    string             `bson:"type" json:"type"`
	Melee   int                `bson:"melee" json:"melee"`
	Ranged  int                `bson:"ranged" json:"ranged"`
	Morale  int                `bson:"morale" json:"morale"`
	Defense int                `bson:"defense" json:"defense"`
	Points  int                `bson:"points" json:"points"`
}

type Faction struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Name        string             `bson:"name" json:"name"`
	Description string             `bson:"description" json:"description"`
	Type        string             `bson:"type" json:"type"`
	CreatedAt   time.Time          `bson:"createdAt" json:"createdAt"`
	UpdatedAt   time.Time          `bson:"updatedAt" json:"updatedAt"`
}

type ArmyBook struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Name        string             `bson:"name" json:"name"`
	FactionID   primitive.ObjectID `bson:"factionId" json:"factionId"`
	Description string             `bson:"description" json:"description"`
}

type ArmyList struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Name      string             `bson:"name" json:"name"`
	Player    string             `bson:"player" json:"player"`
	FactionID primitive.ObjectID `bson:"factionId" json:"factionId"`
	Points    int                `bson:"points" json:"points"`
}

func main() {
	// Connect to MongoDB
	client, err := mongo.Connect(context.TODO(), options.Client().ApplyURI("mongodb://localhost:27017"))
	if err != nil {
		log.Fatal(err)
	}
	defer client.Disconnect(context.TODO())

	db := client.Database("grimdank")

	// Seed Rules
	rules := []Rule{
		{Name: "Bolter Discipline", Description: "Rapid fire weapons can fire twice at half range", Type: "Offensive", Points: []int{5, 10, 15}},
		{Name: "Tactical Precision", Description: "Re-roll hit rolls of 1", Type: "Tactical", Points: []int{3, 6, 9}},
		{Name: "Iron Will", Description: "Ignore morale penalties", Type: "Defensive", Points: []int{2, 4, 6}},
		{Name: "Stealth", Description: "Enemy units have -1 to hit this unit", Type: "Passive", Points: []int{4, 8, 12}},
		{Name: "Furious Charge", Description: "+1 to melee attacks on the charge", Type: "Offensive", Points: []int{3, 6, 9}},
	}

	// Seed Weapons
	weapons := []Weapon{
		{Name: "Bolter", Type: "Rapid Fire", Range: 24, AP: "0", Attacks: 1, Points: 0},
		{Name: "Plasma Gun", Type: "Assault", Range: 18, AP: "-3", Attacks: 1, Points: 5},
		{Name: "Power Sword", Type: "Melee", Range: 0, AP: "-3", Attacks: 1, Points: 3},
		{Name: "Heavy Bolter", Type: "Heavy", Range: 36, AP: "-1", Attacks: 3, Points: 8},
		{Name: "Flamer", Type: "Assault", Range: 8, AP: "0", Attacks: 1, Points: 4},
	}

	// Seed WarGear
	wargear := []WarGear{
		{Name: "Frag Grenades", Type: "Grenade", Description: "Blast weapon for clearing enemies", Points: 2},
		{Name: "Krak Grenades", Type: "Grenade", Description: "Anti-tank grenades", Points: 3},
		{Name: "Medi-pack", Type: "Equipment", Description: "Heal wounded models", Points: 5},
		{Name: "Auspex", Type: "Equipment", Description: "Detect hidden enemies", Points: 4},
		{Name: "Comms Array", Type: "Equipment", Description: "Coordinate with other units", Points: 6},
	}

	// Seed Factions first (needed for other entities)
	factions := []Faction{
		{Name: "Space Marines", Description: "Humanity's finest warriors", Type: "Official", CreatedAt: time.Now(), UpdatedAt: time.Now()},
		{Name: "Orks", Description: "Brutal and cunning greenskins", Type: "Official", CreatedAt: time.Now(), UpdatedAt: time.Now()},
		{Name: "Eldar", Description: "Ancient and graceful aliens", Type: "Official", CreatedAt: time.Now(), UpdatedAt: time.Now()},
	}

	// Insert factions and get their IDs
	factionCollection := db.Collection("factions")
	var factionIDs []primitive.ObjectID
	for _, faction := range factions {
		result, err := factionCollection.InsertOne(context.TODO(), faction)
		if err != nil {
			log.Printf("Error inserting faction %s: %v", faction.Name, err)
			continue
		}
		factionIDs = append(factionIDs, result.InsertedID.(primitive.ObjectID))
	}

	// Seed Units
	units := []Unit{
		{Name: "Tactical Marine", Type: "Infantry", Melee: 3, Ranged: 3, Morale: 7, Defense: 3, Points: 13},
		{Name: "Assault Marine", Type: "Infantry", Melee: 4, Ranged: 2, Morale: 7, Defense: 3, Points: 15},
		{Name: "Devastator Marine", Type: "Infantry", Melee: 2, Ranged: 4, Morale: 7, Defense: 3, Points: 16},
		{Name: "Terminator", Type: "Elite", Melee: 4, Ranged: 3, Morale: 8, Defense: 2, Points: 25},
		{Name: "Scout", Type: "Infantry", Melee: 3, Ranged: 3, Morale: 6, Defense: 4, Points: 10},
	}

	// Seed ArmyBooks
	armyBooks := []ArmyBook{
		{Name: "Codex: Space Marines", FactionID: factionIDs[0], Description: "Official Space Marine army book"},
		{Name: "Codex: Orks", FactionID: factionIDs[1], Description: "Official Ork army book"},
		{Name: "Codex: Craftworlds", FactionID: factionIDs[2], Description: "Official Eldar army book"},
	}

	// Seed ArmyLists
	armyLists := []ArmyList{
		{Name: "Ultramarines 3rd Company", Player: "Commander Titus", FactionID: factionIDs[0], Points: 2000},
		{Name: "Goff Waaagh!", Player: "Warboss Gork", FactionID: factionIDs[1], Points: 1500},
		{Name: "Biel-Tan Warhost", Player: "Farseer Eldrad", FactionID: factionIDs[2], Points: 1800},
	}

	// Insert all data
	collections := map[string]interface{}{
		"rules":     rules,
		"weapons":   weapons,
		"wargear":   wargear,
		"units":     units,
		"armybooks": armyBooks,
		"armylists": armyLists,
	}

	for collectionName, data := range collections {
		collection := db.Collection(collectionName)
		_, err := collection.InsertMany(context.TODO(), data.([]interface{}))
		if err != nil {
			log.Printf("Error inserting %s: %v", collectionName, err)
		} else {
			fmt.Printf("Successfully inserted %s data\n", collectionName)
		}
	}

	fmt.Println("Database seeding completed!")
}
