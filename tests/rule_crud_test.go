package tests

import (
	"context"
	"fmt"
	"reflect"
	"testing"

	"grimdank-database/models"
)

func TestRuleCRUD(t *testing.T) {
	// Setup with improved cleanup
	SetupTestServices(t)
	cleanupManager := NewTestCleanupManager(t)
	defer func() {
		cleanupManager.PrintCleanupReport(t)
		cleanupManager.CleanupAll(t)
		cleanupManager.VerifyCleanup(t)
	}()
	ctx := context.Background()

	t.Run("Create Rule", func(t *testing.T) {
		rule := CreateTestRule()

		createdRule, err := testServices.RuleService.CreateRule(ctx, rule)
		if err != nil {
			t.Fatalf("Failed to create rule: %v", err)
		}

		if createdRule.ID.IsZero() {
			t.Error("Created rule should have a valid ID")
		}

		// Track the created entity for cleanup
		cleanupManager.TrackEntity("rules", createdRule.ID.Hex())

		AssertEqualRules(t, rule, createdRule, "Created rule should match input")
	})

	t.Run("Get Rule By ID", func(t *testing.T) {
		// Create a rule first
		rule := CreateTestRule()
		createdRule, err := testServices.RuleService.CreateRule(ctx, rule)
		if err != nil {
			t.Fatalf("Failed to create rule: %v", err)
		}

		// Track the created entity for cleanup
		cleanupManager.TrackEntity("rules", createdRule.ID.Hex())

		// Get the rule by ID
		retrievedRule, err := testServices.RuleService.GetRuleByID(ctx, createdRule.ID.Hex())
		if err != nil {
			t.Fatalf("Failed to get rule by ID: %v", err)
		}

		AssertEqualRules(t, createdRule, retrievedRule, "Retrieved rule should match created rule")
	})

	t.Run("Get All Rules", func(t *testing.T) {
		// Clean up first to ensure fresh start
		cleanupManager.EnsureEmptyDatabase(t)

		// Create multiple rules
		rules := []*models.Rule{
			{Name: "Rule 1", Description: "First rule", Type: "Type A", Points: []int{5, 10, 15}},
			{Name: "Rule 2", Description: "Second rule", Type: "Type B", Points: []int{10, 20, 30}},
			{Name: "Rule 3", Description: "Third rule", Type: "Type A", Points: []int{15, 30, 45}},
		}

		var createdRuleIDs []string
		for _, rule := range rules {
			createdRule, err := testServices.RuleService.CreateRule(ctx, rule)
			if err != nil {
				t.Fatalf("Failed to create rule: %v", err)
			}
			createdRuleIDs = append(createdRuleIDs, createdRule.ID.Hex())
		}

		// Track all created entities for cleanup
		for _, ruleID := range createdRuleIDs {
			cleanupManager.TrackEntity("rules", ruleID)
		}

		// Get all rules
		allRules, err := testServices.RuleService.GetAllRules(ctx, 10, 0)
		if err != nil {
			t.Fatalf("Failed to get all rules: %v", err)
		}

		if len(allRules) != 3 {
			t.Errorf("Expected 3 rules, got %d", len(allRules))
		}
	})

	t.Run("Search Rules By Name", func(t *testing.T) {
		// Clean up first
		CleanupTestDB(t)

		// Create rules with different names
		rules := []*models.Rule{
			{Name: "Fire Rule", Description: "A fire rule", Type: "Special", Points: []int{5, 10, 15}},
			{Name: "Ice Rule", Description: "An ice rule", Type: "Special", Points: []int{5, 10, 15}},
			{Name: "Fire Shield", Description: "A fire shield rule", Type: "Defensive", Points: []int{10, 20, 30}},
		}

		for _, rule := range rules {
			_, err := testServices.RuleService.CreateRule(ctx, rule)
			if err != nil {
				t.Fatalf("Failed to create rule: %v", err)
			}
		}

		// Search for rules containing "Fire"
		fireRules, err := testServices.RuleService.SearchRulesByName(ctx, "Fire", 10, 0)
		if err != nil {
			t.Fatalf("Failed to search rules by name: %v", err)
		}

		if len(fireRules) != 2 {
			t.Errorf("Expected 2 rules with 'Fire' in name, got %d", len(fireRules))
		}
	})

	t.Run("Update Rule", func(t *testing.T) {
		// Create a rule first
		rule := CreateTestRule()
		createdRule, err := testServices.RuleService.CreateRule(ctx, rule)
		if err != nil {
			t.Fatalf("Failed to create rule: %v", err)
		}

		// Update the rule
		createdRule.Description = "Updated description"
		createdRule.Points = []int{20, 40, 60}

		err = testServices.RuleService.UpdateRule(ctx, createdRule.ID.Hex(), createdRule)
		if err != nil {
			t.Fatalf("Failed to update rule: %v", err)
		}

		// Retrieve and verify the update
		updatedRule, err := testServices.RuleService.GetRuleByID(ctx, createdRule.ID.Hex())
		if err != nil {
			t.Fatalf("Failed to get updated rule: %v", err)
		}

		if updatedRule.Description != "Updated description" {
			t.Errorf("Expected description 'Updated description', got '%s'", updatedRule.Description)
		}
		if !reflect.DeepEqual(updatedRule.Points, []int{20, 40, 60}) {
			t.Errorf("Expected points [20, 40, 60], got %v", updatedRule.Points)
		}
	})

	t.Run("Delete Rule", func(t *testing.T) {
		// Create a rule first
		rule := CreateTestRule()
		createdRule, err := testServices.RuleService.CreateRule(ctx, rule)
		if err != nil {
			t.Fatalf("Failed to create rule: %v", err)
		}

		// Delete the rule
		err = testServices.RuleService.DeleteRule(ctx, createdRule.ID.Hex())
		if err != nil {
			t.Fatalf("Failed to delete rule: %v", err)
		}

		// Try to get the deleted rule - should fail
		_, err = testServices.RuleService.GetRuleByID(ctx, createdRule.ID.Hex())
		if err == nil {
			t.Error("Expected error when getting deleted rule, but got none")
		}
	})

	t.Run("Create Rule With Empty Name Should Fail", func(t *testing.T) {
		rule := &models.Rule{
			Name:        "",
			Description: "A rule with empty name",
			Type:        "Special",
			Points:      []int{5, 10, 15},
		}

		_, err := testServices.RuleService.CreateRule(ctx, rule)
		if err == nil {
			t.Error("Expected error when creating rule with empty name, but got none")
		}
	})

	t.Run("Update Rule With Empty Name Should Fail", func(t *testing.T) {
		// Create a rule first
		rule := CreateTestRule()
		createdRule, err := testServices.RuleService.CreateRule(ctx, rule)
		if err != nil {
			t.Fatalf("Failed to create rule: %v", err)
		}

		// Try to update with empty name
		createdRule.Name = ""
		err = testServices.RuleService.UpdateRule(ctx, createdRule.ID.Hex(), createdRule)
		if err == nil {
			t.Error("Expected error when updating rule with empty name, but got none")
		}
	})

	t.Run("Get Non-Existent Rule Should Fail", func(t *testing.T) {
		nonExistentID := "507f1f77bcf86cd799439011" // Valid ObjectID format but non-existent

		_, err := testServices.RuleService.GetRuleByID(ctx, nonExistentID)
		if err == nil {
			t.Error("Expected error when getting non-existent rule, but got none")
		}
	})

	t.Run("Update Non-Existent Rule Should Fail", func(t *testing.T) {
		rule := CreateTestRule()
		nonExistentID := "507f1f77bcf86cd799439011" // Valid ObjectID format but non-existent

		err := testServices.RuleService.UpdateRule(ctx, nonExistentID, rule)
		if err == nil {
			t.Error("Expected error when updating non-existent rule, but got none")
		}
	})

	t.Run("Delete Non-Existent Rule Should Fail", func(t *testing.T) {
		nonExistentID := "507f1f77bcf86cd799439011" // Valid ObjectID format but non-existent

		err := testServices.RuleService.DeleteRule(ctx, nonExistentID)
		if err == nil {
			t.Error("Expected error when deleting non-existent rule, but got none")
		}
	})

	t.Run("Invalid ObjectID Should Fail", func(t *testing.T) {
		invalidID := "invalid-id"

		_, err := testServices.RuleService.GetRuleByID(ctx, invalidID)
		if err == nil {
			t.Error("Expected error when using invalid ObjectID, but got none")
		}

		rule := CreateTestRule()
		err = testServices.RuleService.UpdateRule(ctx, invalidID, rule)
		if err == nil {
			t.Error("Expected error when updating with invalid ObjectID, but got none")
		}

		err = testServices.RuleService.DeleteRule(ctx, invalidID)
		if err == nil {
			t.Error("Expected error when deleting with invalid ObjectID, but got none")
		}
	})
}

func TestRuleBulkImport(t *testing.T) {
	// Setup
	SetupTestServices(t)
	defer CleanupTestDB(t)
	ctx := context.Background()

	t.Run("Bulk Import Rules", func(t *testing.T) {
		rules := []models.Rule{
			{Name: "Bulk Rule 1", Description: "First bulk rule", Type: "Type A", Points: []int{5, 10, 15}},
			{Name: "Bulk Rule 2", Description: "Second bulk rule", Type: "Type B", Points: []int{10, 20, 30}},
			{Name: "Bulk Rule 3", Description: "Third bulk rule", Type: "Type C", Points: []int{15, 30, 45}},
		}

		importedIDs, err := testServices.RuleService.BulkImportRules(ctx, rules)
		if err != nil {
			t.Fatalf("Failed to bulk import rules: %v", err)
		}

		if len(importedIDs) != 3 {
			t.Errorf("Expected 3 imported IDs, got %d", len(importedIDs))
		}

		// Verify all rules were created
		allRules, err := testServices.RuleService.GetAllRules(ctx, 10, 0)
		if err != nil {
			t.Fatalf("Failed to get all rules: %v", err)
		}

		if len(allRules) != 3 {
			t.Errorf("Expected 3 rules in database, got %d", len(allRules))
		}
	})

	t.Run("Bulk Import Rules With Empty Name Should Fail", func(t *testing.T) {
		// Clean up first
		CleanupTestDB(t)

		rules := []models.Rule{
			{Name: "Valid Rule", Description: "A valid rule", Type: "Type A", Points: []int{5, 10, 15}},
			{Name: "", Description: "Invalid rule with empty name", Type: "Type B", Points: []int{10, 20, 30}},
		}

		_, err := testServices.RuleService.BulkImportRules(ctx, rules)
		if err == nil {
			t.Error("Expected error when bulk importing rules with empty name, but got none")
		}
	})

	t.Run("Bulk Import Empty Rules List", func(t *testing.T) {
		rules := []models.Rule{}

		importedIDs, err := testServices.RuleService.BulkImportRules(ctx, rules)
		if err != nil {
			t.Fatalf("Failed to bulk import empty rules list: %v", err)
		}

		if len(importedIDs) != 0 {
			t.Errorf("Expected 0 imported IDs for empty list, got %d", len(importedIDs))
		}
	})
}

func TestRulePagination(t *testing.T) {
	// Setup
	SetupTestServices(t)
	defer CleanupTestDB(t)
	ctx := context.Background()

	t.Run("Test Pagination", func(t *testing.T) {
		// Create 5 rules
		for i := 1; i <= 5; i++ {
			rule := &models.Rule{
				Name:        fmt.Sprintf("Rule %d", i),
				Description: fmt.Sprintf("Description %d", i),
				Type:        "Type A",
				Points:      []int{i * 5, i * 10, i * 15},
			}
			_, err := testServices.RuleService.CreateRule(ctx, rule)
			if err != nil {
				t.Fatalf("Failed to create rule %d: %v", i, err)
			}
		}

		// Test limit
		rules, err := testServices.RuleService.GetAllRules(ctx, 3, 0)
		if err != nil {
			t.Fatalf("Failed to get rules with limit: %v", err)
		}

		if len(rules) != 3 {
			t.Errorf("Expected 3 rules with limit 3, got %d", len(rules))
		}

		// Test skip
		rules, err = testServices.RuleService.GetAllRules(ctx, 3, 2)
		if err != nil {
			t.Fatalf("Failed to get rules with skip: %v", err)
		}

		if len(rules) != 3 {
			t.Errorf("Expected 3 rules with skip 2, got %d", len(rules))
		}
	})
}
