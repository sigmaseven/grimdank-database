package tests

import (
	"context"
	"testing"

	"grimdank-database/models"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

func TestEntityRelationships(t *testing.T) {
	// Setup
	SetupTestServices(t)
	defer CleanupTestDB(t)
	ctx := context.Background()

	t.Run("Unit with Rules Relationship", func(t *testing.T) {
		// Create a rule first
		rule := &models.Rule{
			Name:        "Test Rule",
			Description: "A test rule",
			Type:        "Defensive",
			Points:      []int{5, 10, 15},
		}
		createdRule, err := testServices.RuleService.CreateRule(ctx, rule)
		if err != nil {
			t.Fatalf("Failed to create rule: %v", err)
		}

		// Create a unit with the rule
		unit := &models.Unit{
			Name:    "Test Unit",
			Type:    "Infantry",
			Melee:   3,
			Ranged:  3,
			Morale:  7,
			Defense: 3,
			Points:  100,
			Rules: []models.RuleReference{
				{RuleID: createdRule.ID, Tier: 1},
			},
		}
		createdUnit, err := testServices.UnitService.CreateUnit(ctx, unit)
		if err != nil {
			t.Fatalf("Failed to create unit: %v", err)
		}

		// Verify the unit has the rule
		if len(createdUnit.Rules) != 1 {
			t.Errorf("Expected 1 rule, got %d", len(createdUnit.Rules))
		}

		if createdUnit.Rules[0].RuleID != createdRule.ID {
			t.Error("Rule ID does not match")
		}

		if createdUnit.Rules[0].Tier != 1 {
			t.Errorf("Expected tier 1, got %d", createdUnit.Rules[0].Tier)
		}
	})

	t.Run("Weapon with Rules Relationship", func(t *testing.T) {
		// Create a rule first
		rule := &models.Rule{
			Name:        "Weapon Rule",
			Description: "A weapon rule",
			Type:        "Offensive",
			Points:      []int{3, 6, 9},
		}
		createdRule, err := testServices.RuleService.CreateRule(ctx, rule)
		if err != nil {
			t.Fatalf("Failed to create rule: %v", err)
		}

		// Create a weapon with the rule
		weapon := &models.Weapon{
			Name:    "Test Weapon",
			Type:    "Ranged",
			Range:   24,
			AP:      "0",
			Attacks: 1,
			Points:  50,
			Rules: []models.RuleReference{
				{RuleID: createdRule.ID, Tier: 2},
			},
		}
		createdWeapon, err := testServices.WeaponService.CreateWeapon(ctx, weapon)
		if err != nil {
			t.Fatalf("Failed to create weapon: %v", err)
		}

		// Verify the weapon has the rule
		if len(createdWeapon.Rules) != 1 {
			t.Errorf("Expected 1 rule, got %d", len(createdWeapon.Rules))
		}

		if createdWeapon.Rules[0].RuleID != createdRule.ID {
			t.Error("Rule ID does not match")
		}

		if createdWeapon.Rules[0].Tier != 2 {
			t.Errorf("Expected tier 2, got %d", createdWeapon.Rules[0].Tier)
		}
	})

	t.Run("WarGear with Rules Relationship", func(t *testing.T) {
		// Create a rule first
		rule := &models.Rule{
			Name:        "WarGear Rule",
			Description: "A wargear rule",
			Type:        "Passive",
			Points:      []int{2, 4, 6},
		}
		createdRule, err := testServices.RuleService.CreateRule(ctx, rule)
		if err != nil {
			t.Fatalf("Failed to create rule: %v", err)
		}

		// Create wargear with the rule
		wargear := &models.WarGear{
			Name:        "Test WarGear",
			Description: "Test equipment",
			Points:      25,
			Rules: []models.RuleReference{
				{RuleID: createdRule.ID, Tier: 1},
			},
		}
		createdWarGear, err := testServices.WarGearService.CreateWarGear(ctx, wargear)
		if err != nil {
			t.Fatalf("Failed to create wargear: %v", err)
		}

		// Verify the wargear has the rule
		if len(createdWarGear.Rules) != 1 {
			t.Errorf("Expected 1 rule, got %d", len(createdWarGear.Rules))
		}

		if createdWarGear.Rules[0].RuleID != createdRule.ID {
			t.Error("Rule ID does not match")
		}

		if createdWarGear.Rules[0].Tier != 1 {
			t.Errorf("Expected tier 1, got %d", createdWarGear.Rules[0].Tier)
		}
	})

	t.Run("Unit with Multiple Rules", func(t *testing.T) {
		// Create multiple rules
		rules := []*models.Rule{
			{Name: "Rule 1", Description: "First rule", Type: "Defensive", Points: []int{5, 10, 15}},
			{Name: "Rule 2", Description: "Second rule", Type: "Offensive", Points: []int{3, 6, 9}},
			{Name: "Rule 3", Description: "Third rule", Type: "Passive", Points: []int{2, 4, 6}},
		}

		ruleIDs := make([]primitive.ObjectID, len(rules))
		for i, rule := range rules {
			createdRule, err := testServices.RuleService.CreateRule(ctx, rule)
			if err != nil {
				t.Fatalf("Failed to create rule %d: %v", i+1, err)
			}
			ruleIDs[i] = createdRule.ID
		}

		// Create a unit with multiple rules
		unit := &models.Unit{
			Name:    "Multi-Rule Unit",
			Type:    "Infantry",
			Melee:   4,
			Ranged:  4,
			Morale:  8,
			Defense: 4,
			Points:  150,
			Rules: []models.RuleReference{
				{RuleID: ruleIDs[0], Tier: 1},
				{RuleID: ruleIDs[1], Tier: 2},
				{RuleID: ruleIDs[2], Tier: 3},
			},
		}
		createdUnit, err := testServices.UnitService.CreateUnit(ctx, unit)
		if err != nil {
			t.Fatalf("Failed to create unit: %v", err)
		}

		// Verify the unit has all rules
		if len(createdUnit.Rules) != 3 {
			t.Errorf("Expected 3 rules, got %d", len(createdUnit.Rules))
		}

		// Verify each rule and tier
		expectedTiers := []int{1, 2, 3}
		for i, ruleRef := range createdUnit.Rules {
			if ruleRef.RuleID != ruleIDs[i] {
				t.Errorf("Rule %d ID does not match", i+1)
			}
			if ruleRef.Tier != expectedTiers[i] {
				t.Errorf("Rule %d tier expected %d, got %d", i+1, expectedTiers[i], ruleRef.Tier)
			}
		}
	})

	t.Run("Cross-Entity Rule Validation", func(t *testing.T) {
		// Create rules of different types
		defensiveRule := &models.Rule{Name: "Defensive", Type: "Defensive", Points: []int{5, 10, 15}}
		offensiveRule := &models.Rule{Name: "Offensive", Type: "Offensive", Points: []int{3, 6, 9}}
		passiveRule := &models.Rule{Name: "Passive", Type: "Passive", Points: []int{2, 4, 6}}
		tacticalRule := &models.Rule{Name: "Tactical", Type: "Tactical", Points: []int{1, 2, 3}}

		createdDefensive, _ := testServices.RuleService.CreateRule(ctx, defensiveRule)
		createdOffensive, _ := testServices.RuleService.CreateRule(ctx, offensiveRule)
		createdPassive, _ := testServices.RuleService.CreateRule(ctx, passiveRule)
		createdTactical, _ := testServices.RuleService.CreateRule(ctx, tacticalRule)

		// Test that Units can use all rule types
		unit := &models.Unit{
			Name:  "Universal Unit",
			Type:  "Infantry",
			Melee: 3, Ranged: 3, Morale: 7, Defense: 3,
			Points: 200,
			Rules: []models.RuleReference{
				{RuleID: createdDefensive.ID, Tier: 1},
				{RuleID: createdOffensive.ID, Tier: 1},
				{RuleID: createdPassive.ID, Tier: 1},
				{RuleID: createdTactical.ID, Tier: 1},
			},
		}
		_, err := testServices.UnitService.CreateUnit(ctx, unit)
		if err != nil {
			t.Fatalf("Failed to create unit with all rule types: %v", err)
		}

		// Test that Weapons can use Offensive and Passive rules
		weapon := &models.Weapon{
			Name:  "Combat Weapon",
			Type:  "Ranged",
			Range: 24, AP: "0", Attacks: 1, Points: 100,
			Rules: []models.RuleReference{
				{RuleID: createdOffensive.ID, Tier: 1},
				{RuleID: createdPassive.ID, Tier: 1},
			},
		}
		_, err = testServices.WeaponService.CreateWeapon(ctx, weapon)
		if err != nil {
			t.Fatalf("Failed to create weapon with appropriate rules: %v", err)
		}

		// Test that WarGear can use Defensive, Passive, and Tactical rules
		wargear := &models.WarGear{
			Name:        "Defensive Equipment",
			Description: "Protective gear",
			Points:      75,
			Rules: []models.RuleReference{
				{RuleID: createdDefensive.ID, Tier: 1},
				{RuleID: createdPassive.ID, Tier: 1},
				{RuleID: createdTactical.ID, Tier: 1},
			},
		}
		_, err = testServices.WarGearService.CreateWarGear(ctx, wargear)
		if err != nil {
			t.Fatalf("Failed to create wargear with appropriate rules: %v", err)
		}
	})
}
