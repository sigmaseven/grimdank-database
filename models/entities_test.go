package models

import (
	"testing"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func TestRuleReference(t *testing.T) {
	ruleID := primitive.NewObjectID()
	ruleRef := RuleReference{
		RuleID: ruleID,
		Tier:   2,
	}
	
	if ruleRef.RuleID != ruleID {
		t.Error("RuleID not set correctly")
	}
	
	if ruleRef.Tier != 2 {
		t.Error("Tier not set correctly")
	}
}

func TestRule(t *testing.T) {
	rule := Rule{
		ID:          primitive.NewObjectID(),
		Name:        "Test Rule",
		Description: "Test Description",
		Type:        "unit",
		Points:      []int{1, 2, 3},
	}
	
	if rule.Name != "Test Rule" {
		t.Error("Name not set correctly")
	}
	
	if rule.Type != "unit" {
		t.Error("Type not set correctly")
	}
	
	if len(rule.Points) != 3 {
		t.Error("Points not set correctly")
	}
}

func TestWeapon(t *testing.T) {
	weapon := Weapon{
		ID:     primitive.NewObjectID(),
		Name:   "Test Weapon",
		Type:   "melee",
		Attacks: 3,
		AP:     "2",
		Range:  12,
		Rules:  []RuleReference{},
	}
	
	if weapon.Name != "Test Weapon" {
		t.Error("Name not set correctly")
	}
	
	if weapon.Type != "melee" {
		t.Error("Type not set correctly")
	}
	
	if weapon.Attacks != 3 {
		t.Error("Attacks not set correctly")
	}
}

func TestWarGear(t *testing.T) {
	wargear := WarGear{
		ID:     primitive.NewObjectID(),
		Name:   "Test WarGear",
		Type:   "armor",
		Points: 5,
		Rules:  []RuleReference{},
	}
	
	if wargear.Name != "Test WarGear" {
		t.Error("Name not set correctly")
	}
	
	if wargear.Type != "armor" {
		t.Error("Type not set correctly")
	}
	
	if wargear.Points != 5 {
		t.Error("Points not set correctly")
	}
}

func TestUnit(t *testing.T) {
	unit := Unit{
		ID:               primitive.NewObjectID(),
		Name:             "Test Unit",
		Type:             "infantry",
		Points:           10,
		Rules:            []RuleReference{},
		AvailableWeapons: []primitive.ObjectID{},
		AvailableWarGear: []primitive.ObjectID{},
		Weapons:          []primitive.ObjectID{},
		WarGear:          []primitive.ObjectID{},
	}
	
	if unit.Name != "Test Unit" {
		t.Error("Name not set correctly")
	}
	
	if unit.Type != "infantry" {
		t.Error("Type not set correctly")
	}
	
	if unit.Points != 10 {
		t.Error("Points not set correctly")
	}
}

func TestArmyBook(t *testing.T) {
	armyBook := ArmyBook{
		ID:        primitive.NewObjectID(),
		Name:      "Test Army Book",
		FactionID: primitive.NewObjectID(),
		Rules:     []RuleReference{},
	}
	
	if armyBook.Name != "Test Army Book" {
		t.Error("Name not set correctly")
	}
	
	if armyBook.FactionID.IsZero() {
		t.Error("FactionID not set correctly")
	}
}

func TestArmyList(t *testing.T) {
	armyList := ArmyList{
		ID:       primitive.NewObjectID(),
		Name:     "Test Army List",
		FactionID: primitive.NewObjectID(),
		Units:    []primitive.ObjectID{},
	}
	
	if armyList.Name != "Test Army List" {
		t.Error("Name not set correctly")
	}
	
	if armyList.FactionID.IsZero() {
		t.Error("FactionID not set correctly")
	}
}

func TestFaction(t *testing.T) {
	faction := Faction{
		ID:   primitive.NewObjectID(),
		Name: "Test Faction",
	}
	
	if faction.Name != "Test Faction" {
		t.Error("Name not set correctly")
	}
}
