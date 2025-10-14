package models

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Rule represents a game rule
type Rule struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Name        string             `bson:"name" json:"name" validate:"required"`
	Description string             `bson:"description" json:"description"`
	Type        string             `bson:"type" json:"type"`
	Points      []int              `bson:"points" json:"points"`
}

// RuleReference represents a reference to a rule with optional tier selection
type RuleReference struct {
	RuleID primitive.ObjectID `bson:"ruleId" json:"ruleId" validate:"required"`
	Tier   int                `bson:"tier" json:"tier"` // 1, 2, or 3 for tier selection
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
	Type        string             `bson:"type" json:"type"`
	Description string             `bson:"description" json:"description"`
	Points      int                `bson:"points" json:"points"`
	Rules       []RuleReference    `bson:"rules" json:"rules"`
}

// Unit represents a game unit
type Unit struct {
	ID               primitive.ObjectID   `bson:"_id,omitempty" json:"id"`
	Name             string               `bson:"name" json:"name" validate:"required"`
	Type             string               `bson:"type" json:"type"`
	Movement         string               `bson:"movement" json:"movement"`
	WeaponSkill      string               `bson:"weaponSkill" json:"weaponSkill"`
	BallisticSkill   string               `bson:"ballisticSkill" json:"ballisticSkill"`
	Strength         string               `bson:"strength" json:"strength"`
	Toughness        string               `bson:"toughness" json:"toughness"`
	Wounds           string               `bson:"wounds" json:"wounds"`
	Initiative       string               `bson:"initiative" json:"initiative"`
	Attacks          string               `bson:"attacks" json:"attacks"`
	Leadership       string               `bson:"leadership" json:"leadership"`
	Save             string               `bson:"save" json:"save"`
	Points           int                  `bson:"points" json:"points"`
	Rules            []RuleReference      `bson:"rules" json:"rules"`
	AvailableWeapons []primitive.ObjectID `bson:"availableWeaponIds" json:"availableWeaponIds"`
	AvailableWarGear []primitive.ObjectID `bson:"availableWarGearIds" json:"availableWarGearIds"`
	Weapons          []primitive.ObjectID `bson:"weaponIds" json:"weaponIds"`
	WarGear          []primitive.ObjectID `bson:"warGearIds" json:"warGearIds"`
}

// ArmyBook represents an army book
type ArmyBook struct {
	ID          primitive.ObjectID   `bson:"_id,omitempty" json:"id"`
	Name        string               `bson:"name" json:"name" validate:"required"`
	Faction     string               `bson:"faction" json:"faction"`
	Description string               `bson:"description" json:"description"`
	Units       []primitive.ObjectID `bson:"unitIds" json:"unitIds"`
	Rules       []RuleReference      `bson:"rules" json:"rules"`
}

// ArmyList represents a player's army list
type ArmyList struct {
	ID          primitive.ObjectID   `bson:"_id,omitempty" json:"id"`
	Name        string               `bson:"name" json:"name" validate:"required"`
	Player      string               `bson:"player" json:"player"`
	Faction     string               `bson:"faction" json:"faction"`
	Points      int                  `bson:"points" json:"points"`
	Units       []primitive.ObjectID `bson:"unitIds" json:"unitIds"`
	Description string               `bson:"description" json:"description"`
}

// RuleWithTier represents a rule with tier information
type RuleWithTier struct {
	Rule
	Tier int `json:"tier"`
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

type PopulatedUnit struct {
	Unit
	PopulatedRules            []Rule    `json:"populatedRules"`
	PopulatedAvailableWeapons []Weapon  `json:"populatedAvailableWeapons"`
	PopulatedAvailableWarGear []WarGear `json:"populatedAvailableWarGear"`
	PopulatedWeapons          []Weapon  `json:"populatedWeapons"`
	PopulatedWarGear          []WarGear `json:"populatedWarGear"`
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
