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

	t.Run("Create Rules With Different Types", func(t *testing.T) {
		// Create rules of different types
		rules := []*models.Rule{
			{Name: "Defensive Rule", Description: "A defensive rule", Type: "Defensive", Points: []int{5, 10, 15}},
			{Name: "Offensive Rule", Description: "An offensive rule", Type: "Offensive", Points: []int{3, 6, 9}},
			{Name: "Passive Rule", Description: "A passive rule", Type: "Passive", Points: []int{2, 4, 6}},
			{Name: "Tactical Rule", Description: "A tactical rule", Type: "Tactical", Points: []int{1, 2, 3}},
		}

		for _, rule := range rules {
			_, err := testServices.RuleService.CreateRule(ctx, rule)
			if err != nil {
				t.Fatalf("Failed to create rule %s: %v", rule.Name, err)
			}
		}
	})

	t.Run("Test Rule Filtering for Units", func(t *testing.T) {
		// Units should be able to use all rule types
		allRules, err := testServices.RuleService.GetAllRules(ctx, 100, 0)
		if err != nil {
			t.Fatalf("Failed to get all rules: %v", err)
		}

		// Filter rules for Units (should include all types)
		unitRules := make([]models.Rule, 0)
		for _, rule := range allRules {
			if rule.Type == "Defensive" || rule.Type == "Offensive" ||
				rule.Type == "Passive" || rule.Type == "Tactical" {
				unitRules = append(unitRules, rule)
			}
		}

		if len(unitRules) != 4 {
			t.Errorf("Expected 4 rules for Units, got %d", len(unitRules))
		}
	})

	t.Run("Test Rule Filtering for Weapons", func(t *testing.T) {
		// Weapons should primarily use Offensive and Passive rules
		allRules, err := testServices.RuleService.GetAllRules(ctx, 100, 0)
		if err != nil {
			t.Fatalf("Failed to get all rules: %v", err)
		}

		// Filter rules for Weapons (should include Offensive and Passive)
		weaponRules := make([]models.Rule, 0)
		for _, rule := range allRules {
			if rule.Type == "Offensive" || rule.Type == "Passive" {
				weaponRules = append(weaponRules, rule)
			}
		}

		if len(weaponRules) != 2 {
			t.Errorf("Expected 2 rules for Weapons, got %d", len(weaponRules))
		}

		// Verify correct rule types
		ruleTypes := make(map[string]bool)
		for _, rule := range weaponRules {
			ruleTypes[rule.Type] = true
		}

		if !ruleTypes["Offensive"] {
			t.Error("Expected Offensive rule type for Weapons")
		}
		if !ruleTypes["Passive"] {
			t.Error("Expected Passive rule type for Weapons")
		}
	})

	t.Run("Test Rule Filtering for WarGear", func(t *testing.T) {
		// WarGear should primarily use Defensive, Passive, and Tactical rules
		allRules, err := testServices.RuleService.GetAllRules(ctx, 100, 0)
		if err != nil {
			t.Fatalf("Failed to get all rules: %v", err)
		}

		// Filter rules for WarGear (should include Defensive, Passive, and Tactical)
		wargearRules := make([]models.Rule, 0)
		for _, rule := range allRules {
			if rule.Type == "Defensive" || rule.Type == "Passive" || rule.Type == "Tactical" {
				wargearRules = append(wargearRules, rule)
			}
		}

		if len(wargearRules) != 3 {
			t.Errorf("Expected 3 rules for WarGear, got %d", len(wargearRules))
		}

		// Verify correct rule types
		ruleTypes := make(map[string]bool)
		for _, rule := range wargearRules {
			ruleTypes[rule.Type] = true
		}

		if !ruleTypes["Defensive"] {
			t.Error("Expected Defensive rule type for WarGear")
		}
		if !ruleTypes["Passive"] {
			t.Error("Expected Passive rule type for WarGear")
		}
		if !ruleTypes["Tactical"] {
			t.Error("Expected Tactical rule type for WarGear")
		}
	})
}
