package tests

import (
	"context"
	"testing"

	"grimdank-database/models"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

func TestPopulationService(t *testing.T) {
	// Setup
	SetupTestServices(t)
	defer CleanupTestDB(t)
	ctx := context.Background()

	t.Run("Populate Weapon Rules", func(t *testing.T) {
		// Create a rule first
		rule := CreateTestRule()
		createdRule, err := testServices.RuleService.CreateRule(ctx, rule)
		if err != nil {
			t.Fatalf("Failed to create rule: %v", err)
		}

		// Create a weapon with rule reference
		weapon := &models.Weapon{
			Name:    "Test Weapon",
			Type:    "Melee",
			Range:   0,
			AP:      "3+",
			Attacks: 2,
			Points:  10,
			Rules: []models.RuleReference{
				{RuleID: createdRule.ID, Tier: 1},
			},
		}

		createdWeapon, err := testServices.WeaponService.CreateWeapon(ctx, weapon)
		if err != nil {
			t.Fatalf("Failed to create weapon: %v", err)
		}

		// Test population
		populatedWeapon, err := testServices.PopulationService.PopulateWeaponRules(ctx, createdWeapon)
		if err != nil {
			t.Fatalf("Failed to populate weapon rules: %v", err)
		}

		if len(populatedWeapon.PopulatedRules) != 1 {
			t.Errorf("Expected 1 populated rule, got %d", len(populatedWeapon.PopulatedRules))
		}

		if populatedWeapon.PopulatedRules[0].Name != createdRule.Name {
			t.Errorf("Expected rule name %s, got %s", createdRule.Name, populatedWeapon.PopulatedRules[0].Name)
		}

		if populatedWeapon.PopulatedRules[0].Tier != 1 {
			t.Errorf("Expected tier 1, got %d", populatedWeapon.PopulatedRules[0].Tier)
		}
	})

	t.Run("Populate WarGear Rules", func(t *testing.T) {
		// Create a rule first
		rule := CreateTestRule()
		createdRule, err := testServices.RuleService.CreateRule(ctx, rule)
		if err != nil {
			t.Fatalf("Failed to create rule: %v", err)
		}

		// Create wargear with rule reference
		wargear := &models.WarGear{
			Name:        "Test WarGear",
			Description: "Test equipment",
			Points:      5,
			Rules: []models.RuleReference{
				{RuleID: createdRule.ID, Tier: 2},
			},
		}

		createdWarGear, err := testServices.WarGearService.CreateWarGear(ctx, wargear)
		if err != nil {
			t.Fatalf("Failed to create wargear: %v", err)
		}

		// Test population
		populatedWarGear, err := testServices.PopulationService.PopulateWarGearRules(ctx, createdWarGear)
		if err != nil {
			t.Fatalf("Failed to populate wargear rules: %v", err)
		}

		if len(populatedWarGear.PopulatedRules) != 1 {
			t.Errorf("Expected 1 populated rule, got %d", len(populatedWarGear.PopulatedRules))
		}

		if populatedWarGear.PopulatedRules[0].Name != createdRule.Name {
			t.Errorf("Expected rule name %s, got %s", createdRule.Name, populatedWarGear.PopulatedRules[0].Name)
		}
	})

	t.Run("Populate Unit With References", func(t *testing.T) {
		// Create a rule first
		rule := CreateTestRule()
		createdRule, err := testServices.RuleService.CreateRule(ctx, rule)
		if err != nil {
			t.Fatalf("Failed to create rule: %v", err)
		}

		// Create a weapon
		weapon := &models.Weapon{
			Name:    "Test Weapon",
			Type:    "Melee",
			Range:   0,
			AP:      "3+",
			Attacks: 2,
			Points:  10,
		}

		createdWeapon, err := testServices.WeaponService.CreateWeapon(ctx, weapon)
		if err != nil {
			t.Fatalf("Failed to create weapon: %v", err)
		}

		// Create wargear
		wargear := &models.WarGear{
			Name:        "Test WarGear",
			Description: "Test equipment",
			Points:      5,
		}

		createdWarGear, err := testServices.WarGearService.CreateWarGear(ctx, wargear)
		if err != nil {
			t.Fatalf("Failed to create wargear: %v", err)
		}

		// Create a unit with references
		unit := &models.Unit{
			Name:             "Test Unit",
			Type:             "Infantry",
			Melee:            3,
			Ranged:           3,
			Morale:           7,
			Defense:          3,
			Points:           100,
			Rules:            []models.RuleReference{{RuleID: createdRule.ID, Tier: 1}},
			AvailableWeapons: []primitive.ObjectID{createdWeapon.ID},
			AvailableWarGear: []primitive.ObjectID{createdWarGear.ID},
			Weapons:          []models.WeaponReference{{WeaponID: createdWeapon.ID, Quantity: 1, Type: "Melee"}},
			WarGear:          []primitive.ObjectID{createdWarGear.ID},
		}

		createdUnit, err := testServices.UnitService.CreateUnit(ctx, unit)
		if err != nil {
			t.Fatalf("Failed to create unit: %v", err)
		}

		// Test population
		populatedUnit, err := testServices.PopulationService.PopulateUnitWithReferences(ctx, createdUnit)
		if err != nil {
			t.Fatalf("Failed to populate unit with references: %v", err)
		}

		if len(populatedUnit.PopulatedRules) != 1 {
			t.Errorf("Expected 1 populated rule, got %d", len(populatedUnit.PopulatedRules))
		}

		if len(populatedUnit.PopulatedAvailableWeapons) != 1 {
			t.Errorf("Expected 1 populated available weapon, got %d", len(populatedUnit.PopulatedAvailableWeapons))
		}

		if len(populatedUnit.PopulatedAvailableWarGear) != 1 {
			t.Errorf("Expected 1 populated available wargear, got %d", len(populatedUnit.PopulatedAvailableWarGear))
		}

		if len(populatedUnit.PopulatedWeapons) != 1 {
			t.Errorf("Expected 1 populated weapon, got %d", len(populatedUnit.PopulatedWeapons))
		}

		if len(populatedUnit.PopulatedWarGear) != 1 {
			t.Errorf("Expected 1 populated wargear, got %d", len(populatedUnit.PopulatedWarGear))
		}
	})

	t.Run("Populate Weapon Rules With Non-Existent Rule", func(t *testing.T) {
		// Create a weapon with non-existent rule reference
		weapon := &models.Weapon{
			Name:    "Test Weapon",
			Type:    "Melee",
			Range:   0,
			AP:      "3+",
			Attacks: 2,
			Points:  10,
			Rules: []models.RuleReference{
				{RuleID: primitive.NewObjectID(), Tier: 1},
			},
		}

		createdWeapon, err := testServices.WeaponService.CreateWeapon(ctx, weapon)
		if err != nil {
			t.Fatalf("Failed to create weapon: %v", err)
		}

		// Test population should fail
		_, err = testServices.PopulationService.PopulateWeaponRules(ctx, createdWeapon)
		if err == nil {
			t.Error("Expected error when populating weapon with non-existent rule, but got none")
		}
	})

	t.Run("Populate WarGear Rules With Non-Existent Rule", func(t *testing.T) {
		// Create wargear with non-existent rule reference
		wargear := &models.WarGear{
			Name:        "Test WarGear",
			Description: "Test equipment",
			Points:      5,
			Rules: []models.RuleReference{
				{RuleID: primitive.NewObjectID(), Tier: 2},
			},
		}

		createdWarGear, err := testServices.WarGearService.CreateWarGear(ctx, wargear)
		if err != nil {
			t.Fatalf("Failed to create wargear: %v", err)
		}

		// Test population should fail
		_, err = testServices.PopulationService.PopulateWarGearRules(ctx, createdWarGear)
		if err == nil {
			t.Error("Expected error when populating wargear with non-existent rule, but got none")
		}
	})
}
