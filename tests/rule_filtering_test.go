package tests

import (
	"context"
	"testing"

	"grimdank-database/models"
)

func TestRuleFiltering(t *testing.T) {
	// Setup
	SetupTestServices(t)
	defer CleanupTestDB(t)
	ctx := context.Background()

	t.Run("Create Rules With Different Categories", func(t *testing.T) {
		// Create rules of different categories (no type restriction)
		rules := []*models.Rule{
			{Name: "Defensive Rule", Description: "A defensive rule", Points: []int{5, 10, 15}},
			{Name: "Offensive Rule", Description: "An offensive rule", Points: []int{3, 6, 9}},
			{Name: "Passive Rule", Description: "A passive rule", Points: []int{2, 4, 6}},
			{Name: "Tactical Rule", Description: "A tactical rule", Points: []int{1, 2, 3}},
		}

		for _, rule := range rules {
			_, err := testServices.RuleService.CreateRule(ctx, rule)
			if err != nil {
				t.Fatalf("Failed to create rule %s: %v", rule.Name, err)
			}
		}
	})

	t.Run("Test Rule Usage for Units", func(t *testing.T) {
		// Units should be able to use all rules (no type restriction)
		allRules, err := testServices.RuleService.GetAllRules(ctx, 100, 0)
		if err != nil {
			t.Fatalf("Failed to get all rules: %v", err)
		}

		// All rules should be available for Units
		if len(allRules) != 4 {
			t.Errorf("Expected 4 rules available for Units, got %d", len(allRules))
		}
	})

	t.Run("Test Rule Usage for Weapons", func(t *testing.T) {
		// Weapons should be able to use all rules (no type restriction)
		allRules, err := testServices.RuleService.GetAllRules(ctx, 100, 0)
		if err != nil {
			t.Fatalf("Failed to get all rules: %v", err)
		}

		// All rules should be available for Weapons
		if len(allRules) != 4 {
			t.Errorf("Expected 4 rules available for Weapons, got %d", len(allRules))
		}
	})

	t.Run("Test Rule Usage for WarGear", func(t *testing.T) {
		// WarGear should be able to use all rules (no type restriction)
		allRules, err := testServices.RuleService.GetAllRules(ctx, 100, 0)
		if err != nil {
			t.Fatalf("Failed to get all rules: %v", err)
		}

		// All rules should be available for WarGear
		if len(allRules) != 4 {
			t.Errorf("Expected 4 rules available for WarGear, got %d", len(allRules))
		}
	})
}
