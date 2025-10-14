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

// Weapon represents a weapon in the game
type Weapon struct {
	ID      primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Name    string             `bson:"name" json:"name" validate:"required"`
	Type    string             `bson:"type" json:"type"`
	Range   int                `bson:"range" json:"range"`
	AP      string             `bson:"ap" json:"ap"`
	Attacks int                `bson:"attacks" json:"attacks"`
	Rules   []Rule             `bson:"rules" json:"rules"`
	Points  int                `bson:"points" json:"points"`
}

// WarGear represents wargear items
type WarGear struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Name        string             `bson:"name" json:"name" validate:"required"`
	Type        string             `bson:"type" json:"type"`
	Description string             `bson:"description" json:"description"`
	Points      int                `bson:"points" json:"points"`
	Rules       []Rule             `bson:"rules" json:"rules"`
}

// Unit represents a game unit
type Unit struct {
	ID               primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Name             string             `bson:"name" json:"name" validate:"required"`
	Type             string             `bson:"type" json:"type"`
	Movement         string             `bson:"movement" json:"movement"`
	WeaponSkill      string             `bson:"weaponSkill" json:"weaponSkill"`
	BallisticSkill   string             `bson:"ballisticSkill" json:"ballisticSkill"`
	Strength         string             `bson:"strength" json:"strength"`
	Toughness        string             `bson:"toughness" json:"toughness"`
	Wounds           string             `bson:"wounds" json:"wounds"`
	Initiative       string             `bson:"initiative" json:"initiative"`
	Attacks          string             `bson:"attacks" json:"attacks"`
	Leadership       string             `bson:"leadership" json:"leadership"`
	Save             string             `bson:"save" json:"save"`
	Points           int                `bson:"points" json:"points"`
	Rules            []Rule             `bson:"rules" json:"rules"`
	AvailableWeapons []Weapon           `bson:"availableWeapons" json:"availableWeapons"`
	AvailableWarGear []WarGear          `bson:"availableWarGear" json:"availableWarGear"`
	Weapons          []Weapon           `bson:"weapons" json:"weapons"`
	WarGear          []WarGear          `bson:"warGear" json:"warGear"`
}

// ArmyBook represents an army book
type ArmyBook struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Name        string             `bson:"name" json:"name" validate:"required"`
	Faction     string             `bson:"faction" json:"faction"`
	Description string             `bson:"description" json:"description"`
	Units       []Unit             `bson:"units" json:"units"`
	Rules       []Rule             `bson:"rules" json:"rules"`
}

// ArmyList represents a player's army list
type ArmyList struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Name        string             `bson:"name" json:"name" validate:"required"`
	Player      string             `bson:"player" json:"player"`
	Faction     string             `bson:"faction" json:"faction"`
	Points      int                `bson:"points" json:"points"`
	Units       []Unit             `bson:"units" json:"units"`
	Description string             `bson:"description" json:"description"`
}
