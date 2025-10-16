package models

import (
	"testing"
	"time"

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

func TestWeaponReference(t *testing.T) {
	weaponID := primitive.NewObjectID()
	weaponRef := WeaponReference{
		WeaponID: weaponID,
		Quantity: 5,
		Type:     "Melee",
	}

	if weaponRef.WeaponID != weaponID {
		t.Error("WeaponID not set correctly")
	}

	if weaponRef.Quantity != 5 {
		t.Error("Quantity not set correctly")
	}

	if weaponRef.Type != "Melee" {
		t.Error("Type not set correctly")
	}
}

func TestRule(t *testing.T) {
	ruleID := primitive.NewObjectID()
	rule := Rule{
		ID:          ruleID,
		Name:        "Test Rule",
		Description: "Test Description",
		Points:      []int{1, 2, 3},
	}

	if rule.ID != ruleID {
		t.Error("ID not set correctly")
	}

	if rule.Name != "Test Rule" {
		t.Error("Name not set correctly")
	}

	if rule.Description != "Test Description" {
		t.Error("Description not set correctly")
	}

	if len(rule.Points) != 3 {
		t.Error("Points not set correctly")
	}
}

func TestWeapon(t *testing.T) {
	weaponID := primitive.NewObjectID()
	weapon := Weapon{
		ID:      weaponID,
		Name:    "Test Weapon",
		Type:    "melee",
		Range:   12,
		AP:      "2",
		Attacks: 3,
		Rules:   []RuleReference{},
		Points:  15,
	}

	if weapon.ID != weaponID {
		t.Error("ID not set correctly")
	}

	if weapon.Name != "Test Weapon" {
		t.Error("Name not set correctly")
	}

	if weapon.Type != "melee" {
		t.Error("Type not set correctly")
	}

	if weapon.Range != 12 {
		t.Error("Range not set correctly")
	}

	if weapon.AP != "2" {
		t.Error("AP not set correctly")
	}

	if weapon.Attacks != 3 {
		t.Error("Attacks not set correctly")
	}

	if weapon.Points != 15 {
		t.Error("Points not set correctly")
	}

	if len(weapon.Rules) != 0 {
		t.Error("Rules not set correctly")
	}
}

func TestWarGear(t *testing.T) {
	wargearID := primitive.NewObjectID()
	wargear := WarGear{
		ID:          wargearID,
		Name:        "Test WarGear",
		Description: "Test wargear description",
		Points:      5,
		Rules:       []RuleReference{},
	}

	if wargear.ID != wargearID {
		t.Error("ID not set correctly")
	}

	if wargear.Name != "Test WarGear" {
		t.Error("Name not set correctly")
	}

	if wargear.Description != "Test wargear description" {
		t.Error("Description not set correctly")
	}

	if wargear.Points != 5 {
		t.Error("Points not set correctly")
	}
}

func TestUnit(t *testing.T) {
	unitID := primitive.NewObjectID()
	unit := Unit{
		ID:               unitID,
		Name:             "Test Unit",
		Type:             "infantry",
		Melee:            3,
		Ranged:           3,
		Morale:           7,
		Defense:          3,
		Points:           10,
		Amount:           5,
		Max:              10,
		Rules:            []RuleReference{},
		AvailableWeapons: []primitive.ObjectID{},
		AvailableWarGear: []primitive.ObjectID{},
		Weapons:          []WeaponReference{},
		WarGear:          []primitive.ObjectID{},
	}

	if unit.ID != unitID {
		t.Error("ID not set correctly")
	}

	if unit.Name != "Test Unit" {
		t.Error("Name not set correctly")
	}

	if unit.Type != "infantry" {
		t.Error("Type not set correctly")
	}

	if unit.Melee != 3 {
		t.Error("Melee not set correctly")
	}

	if unit.Ranged != 3 {
		t.Error("Ranged not set correctly")
	}

	if unit.Morale != 7 {
		t.Error("Morale not set correctly")
	}

	if unit.Defense != 3 {
		t.Error("Defense not set correctly")
	}

	if unit.Points != 10 {
		t.Error("Points not set correctly")
	}

	if unit.Amount != 5 {
		t.Error("Amount not set correctly")
	}

	if unit.Max != 10 {
		t.Error("Max not set correctly")
	}

	if len(unit.Rules) != 0 {
		t.Error("Rules not set correctly")
	}

	if len(unit.AvailableWeapons) != 0 {
		t.Error("AvailableWeapons not set correctly")
	}

	if len(unit.AvailableWarGear) != 0 {
		t.Error("AvailableWarGear not set correctly")
	}

	if len(unit.Weapons) != 0 {
		t.Error("Weapons not set correctly")
	}

	if len(unit.WarGear) != 0 {
		t.Error("WarGear not set correctly")
	}
}

func TestArmyBook(t *testing.T) {
	armyBookID := primitive.NewObjectID()
	factionID := primitive.NewObjectID()
	armyBook := ArmyBook{
		ID:          armyBookID,
		Name:        "Test Army Book",
		FactionID:   factionID,
		Description: "Test army book description",
		Units:       []primitive.ObjectID{},
		Rules:       []RuleReference{},
	}

	if armyBook.ID != armyBookID {
		t.Error("ID not set correctly")
	}

	if armyBook.Name != "Test Army Book" {
		t.Error("Name not set correctly")
	}

	if armyBook.FactionID != factionID {
		t.Error("FactionID not set correctly")
	}

	if armyBook.Description != "Test army book description" {
		t.Error("Description not set correctly")
	}

	if len(armyBook.Units) != 0 {
		t.Error("Units not set correctly")
	}

	if len(armyBook.Rules) != 0 {
		t.Error("Rules not set correctly")
	}
}

func TestArmyList(t *testing.T) {
	armyListID := primitive.NewObjectID()
	factionID := primitive.NewObjectID()
	armyList := ArmyList{
		ID:          armyListID,
		Name:        "Test Army List",
		Player:      "Test Player",
		FactionID:   factionID,
		Points:      2000,
		Units:       []primitive.ObjectID{},
		Description: "Test army list description",
	}

	if armyList.ID != armyListID {
		t.Error("ID not set correctly")
	}

	if armyList.Name != "Test Army List" {
		t.Error("Name not set correctly")
	}

	if armyList.Player != "Test Player" {
		t.Error("Player not set correctly")
	}

	if armyList.FactionID != factionID {
		t.Error("FactionID not set correctly")
	}

	if armyList.Points != 2000 {
		t.Error("Points not set correctly")
	}

	if len(armyList.Units) != 0 {
		t.Error("Units not set correctly")
	}

	if armyList.Description != "Test army list description" {
		t.Error("Description not set correctly")
	}
}

func TestFaction(t *testing.T) {
	factionID := primitive.NewObjectID()
	now := time.Now()
	faction := Faction{
		ID:          factionID,
		Name:        "Test Faction",
		Description: "Test faction description",
		Type:        "Official",
		CreatedAt:   now,
		UpdatedAt:   now,
	}

	if faction.ID != factionID {
		t.Error("ID not set correctly")
	}

	if faction.Name != "Test Faction" {
		t.Error("Name not set correctly")
	}

	if faction.Description != "Test faction description" {
		t.Error("Description not set correctly")
	}

	if faction.Type != "Official" {
		t.Error("Type not set correctly")
	}

	if !faction.CreatedAt.Equal(now) {
		t.Error("CreatedAt not set correctly")
	}

	if !faction.UpdatedAt.Equal(now) {
		t.Error("UpdatedAt not set correctly")
	}
}

func TestRuleWithTier(t *testing.T) {
	ruleID := primitive.NewObjectID()
	ruleWithTier := RuleWithTier{
		Rule: Rule{
			ID:          ruleID,
			Name:        "Test Rule",
			Description: "Test Description",
			Points:      []int{1, 2, 3},
		},
		Tier: 2,
	}

	if ruleWithTier.ID != ruleID {
		t.Error("ID not set correctly")
	}

	if ruleWithTier.Name != "Test Rule" {
		t.Error("Name not set correctly")
	}

	if ruleWithTier.Description != "Test Description" {
		t.Error("Description not set correctly")
	}

	if len(ruleWithTier.Points) != 3 {
		t.Error("Points not set correctly")
	}

	if ruleWithTier.Tier != 2 {
		t.Error("Tier not set correctly")
	}
}

func TestPopulatedWeaponReference(t *testing.T) {
	weaponID := primitive.NewObjectID()
	weapon := Weapon{
		ID:      weaponID,
		Name:    "Test Weapon",
		Type:    "melee",
		Range:   12,
		AP:      "2",
		Attacks: 3,
		Points:  15,
	}

	populatedWeaponRef := PopulatedWeaponReference{
		Weapon:   weapon,
		Quantity: 5,
		Type:     "Melee",
	}

	if populatedWeaponRef.Weapon.ID != weaponID {
		t.Error("Weapon ID not set correctly")
	}

	if populatedWeaponRef.Weapon.Name != "Test Weapon" {
		t.Error("Weapon Name not set correctly")
	}

	if populatedWeaponRef.Quantity != 5 {
		t.Error("Quantity not set correctly")
	}

	if populatedWeaponRef.Type != "Melee" {
		t.Error("Type not set correctly")
	}
}
