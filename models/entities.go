package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Rule represents a game rule
type Rule struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Name        string             `bson:"name" json:"name" validate:"required"`
	Description string             `bson:"description" json:"description"`
	Points      []int              `bson:"points" json:"points"`
}

// RuleReference represents a reference to a rule with optional tier selection
type RuleReference struct {
	RuleID primitive.ObjectID `bson:"ruleId" json:"ruleId" validate:"required"`
	Tier   int                `bson:"tier" json:"tier"` // 1, 2, or 3 for tier selection
}

// WeaponReference represents a reference to a weapon with quantity and type
type WeaponReference struct {
	WeaponID primitive.ObjectID `bson:"weaponId" json:"weaponId" validate:"required"`
	Quantity int                `bson:"quantity" json:"quantity"` // Number of models with this weapon
	Type     string             `bson:"type" json:"type"`         // "Melee" or "Ranged"
}

// Weapon represents a weapon in the game
type Weapon struct {
	ID      primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Name    string             `bson:"name" json:"name" validate:"required"`
	Type    string             `bson:"type" json:"type"`
	Range   int                `bson:"range" json:"range"`
	AP      string             `bson:"ap" json:"ap"`
	Attacks int                `bson:"attacks" json:"attacks"`
	Rules   []RuleReference    `bson:"rules" json:"rules"`
	Points  int                `bson:"points" json:"points"`
}

// WarGear represents wargear items
type WarGear struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Name        string             `bson:"name" json:"name" validate:"required"`
	Description string             `bson:"description" json:"description"`
	Points      int                `bson:"points" json:"points"`
	Rules       []RuleReference    `bson:"rules" json:"rules"`
}

// Unit represents a game unit
type Unit struct {
	ID               primitive.ObjectID   `bson:"_id,omitempty" json:"id"`
	Name             string               `bson:"name" json:"name" validate:"required"`
	Type             string               `bson:"type" json:"type"`
	Melee            int                  `bson:"melee" json:"melee"`
	Ranged           int                  `bson:"ranged" json:"ranged"`
	Morale           int                  `bson:"morale" json:"morale"`
	Defense          int                  `bson:"defense" json:"defense"`
	Points           int                  `bson:"points" json:"points"`
	Amount           int                  `bson:"amount" json:"amount" validate:"min=1"` // Number of models in the unit
	Max              int                  `bson:"max" json:"max" validate:"min=1"`       // Maximum number of models allowed
	Rules            []RuleReference      `bson:"rules" json:"rules"`
	AvailableWeapons []primitive.ObjectID `bson:"availableWeaponIds" json:"availableWeaponIds"`
	AvailableWarGear []primitive.ObjectID `bson:"availableWarGearIds" json:"availableWarGearIds"`
	Weapons          []WeaponReference    `bson:"weapons" json:"weapons"`
	WarGear          []primitive.ObjectID `bson:"warGearIds" json:"warGearIds"`
}

// ArmyBook represents an army book
type ArmyBook struct {
	ID          primitive.ObjectID   `bson:"_id,omitempty" json:"id"`
	Name        string               `bson:"name" json:"name" validate:"required"`
	FactionID   primitive.ObjectID   `bson:"factionId" json:"factionId"`
	Description string               `bson:"description" json:"description"`
	Units       []primitive.ObjectID `bson:"unitIds" json:"unitIds"`
	Rules       []RuleReference      `bson:"rules" json:"rules"`
}

// ArmyList represents a player's army list
type ArmyList struct {
	ID          primitive.ObjectID   `bson:"_id,omitempty" json:"id"`
	Name        string               `bson:"name" json:"name" validate:"required"`
	Player      string               `bson:"player" json:"player"`
	FactionID   primitive.ObjectID   `bson:"factionId" json:"factionId"`
	Points      int                  `bson:"points" json:"points"`
	Units       []primitive.ObjectID `bson:"unitIds" json:"unitIds"`
	Description string               `bson:"description" json:"description"`
}

// RuleWithTier represents a rule with tier information
type RuleWithTier struct {
	Rule
	Tier int `json:"tier"`
}

// Faction represents a game faction
type Faction struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Name        string             `bson:"name" json:"name"`
	Description string             `bson:"description" json:"description"`
	Type        string             `bson:"type" json:"type"` // "Official" or "Custom"
	CreatedAt   time.Time          `bson:"createdAt" json:"createdAt"`
	UpdatedAt   time.Time          `bson:"updatedAt" json:"updatedAt"`
}

// Populated entities for API responses (when you need the full data)
type PopulatedWeapon struct {
	Weapon
	PopulatedRules []RuleWithTier `json:"populatedRules"`
}

type PopulatedWarGear struct {
	WarGear
	PopulatedRules []Rule `json:"populatedRules"`
}

// PopulatedWeaponReference combines weapon details with quantity/type info
type PopulatedWeaponReference struct {
	Weapon   Weapon `json:"weapon"`
	Quantity int    `json:"quantity"`
	Type     string `json:"type"`
}

type PopulatedUnit struct {
	Unit
	PopulatedRules            []Rule                     `json:"populatedRules"`
	PopulatedAvailableWeapons []Weapon                   `json:"populatedAvailableWeapons"`
	PopulatedAvailableWarGear []WarGear                  `json:"populatedAvailableWarGear"`
	PopulatedWeapons          []PopulatedWeaponReference `json:"populatedWeapons"`
	PopulatedWarGear          []WarGear                  `json:"populatedWarGear"`
}

type PopulatedArmyBook struct {
	ArmyBook
	PopulatedUnits []Unit `json:"populatedUnits"`
	PopulatedRules []Rule `json:"populatedRules"`
}

type PopulatedArmyList struct {
	ArmyList
	PopulatedUnits []Unit `json:"populatedUnits"`
}
