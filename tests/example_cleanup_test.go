package tests

import (
	"context"
	"testing"

	"grimdank-database/models"
)

// ExampleCleanupTest demonstrates the improved cleanup system
func ExampleCleanupTest(t *testing.T) {
	// Setup with improved cleanup
	SetupTestServices(t)
	cleanupManager := NewTestCleanupManager(t)

	// Ensure we start with a clean database
	cleanupManager.EnsureEmptyDatabase(t)

	// Defer cleanup with reporting and verification
	defer func() {
		cleanupManager.PrintCleanupReport(t)
		cleanupManager.CleanupAll(t)
		cleanupManager.VerifyCleanup(t)
	}()

	ctx := context.Background()

	t.Run("Create and Track Entities", func(t *testing.T) {
		// Create a rule
		rule := CreateTestRule()
		createdRule, err := testServices.RuleService.CreateRule(ctx, rule)
		if err != nil {
			t.Fatalf("Failed to create rule: %v", err)
		}

		// Track the created entity
		cleanupManager.TrackEntity("rules", createdRule.ID.Hex())

		// Create a weapon
		weapon := CreateTestWeapon()
		createdWeapon, err := testServices.WeaponService.CreateWeapon(ctx, weapon)
		if err != nil {
			t.Fatalf("Failed to create weapon: %v", err)
		}

		// Track the created entity
		cleanupManager.TrackEntity("weapons", createdWeapon.ID.Hex())

		// Verify entities were created
		ruleCount := cleanupManager.GetEntityCount(t, "rules")
		weaponCount := cleanupManager.GetEntityCount(t, "weapons")

		if ruleCount != 1 {
			t.Errorf("Expected 1 rule, got %d", ruleCount)
		}

		if weaponCount != 1 {
			t.Errorf("Expected 1 weapon, got %d", weaponCount)
		}
	})

	t.Run("Collection-Specific Cleanup", func(t *testing.T) {
		// Create multiple rules
		rules := []*models.Rule{
			CreateTestRuleWithName("Rule 1"),
			CreateTestRuleWithName("Rule 2"),
			CreateTestRuleWithName("Rule 3"),
		}

		var ruleIDs []string
		for _, rule := range rules {
			created, err := testServices.RuleService.CreateRule(ctx, rule)
			if err != nil {
				t.Fatalf("Failed to create rule: %v", err)
			}
			ruleIDs = append(ruleIDs, created.ID.Hex())
		}

		// Track all rules
		for _, ruleID := range ruleIDs {
			cleanupManager.TrackEntity("rules", ruleID)
		}

		// Verify we have 3 rules
		ruleCount := cleanupManager.GetEntityCount(t, "rules")
		if ruleCount != 3 {
			t.Errorf("Expected 3 rules, got %d", ruleCount)
		}

		// Clean up only rules collection
		cleanupManager.CleanupCollection(t, "rules")

		// Verify rules are gone but weapons remain
		ruleCount = cleanupManager.GetEntityCount(t, "rules")
		weaponCount := cleanupManager.GetEntityCount(t, "weapons")

		if ruleCount != 0 {
			t.Errorf("Expected 0 rules after cleanup, got %d", ruleCount)
		}

		if weaponCount != 1 {
			t.Errorf("Expected 1 weapon to remain, got %d", weaponCount)
		}
	})
}

// TestCleanupIsolation verifies that test data doesn't pollute the main database
func TestCleanupIsolation(t *testing.T) {
	// This test verifies that our test database is properly isolated
	SetupTestServices(t)
	cleanupManager := NewTestCleanupManager(t)
	defer cleanupManager.CleanupAll(t)

	ctx := context.Background()

	// Create test data
	rule := CreateTestRule()
	createdRule, err := testServices.RuleService.CreateRule(ctx, rule)
	if err != nil {
		t.Fatalf("Failed to create rule: %v", err)
	}

	cleanupManager.TrackEntity("rules", createdRule.ID.Hex())

	// Verify the rule exists in test database
	ruleCount := cleanupManager.GetEntityCount(t, "rules")
	if ruleCount != 1 {
		t.Errorf("Expected 1 rule in test database, got %d", ruleCount)
	}

	// Verify we're using the test database
	dbName := GetTestDatabaseName()
	if dbName != "grimdank_test_db" {
		t.Errorf("Expected test database name 'grimdank_test_db', got '%s'", dbName)
	}

	// Clean up and verify
	cleanupManager.CleanupAll(t)
	cleanupManager.VerifyCleanup(t)

	// Verify cleanup was successful
	ruleCount = cleanupManager.GetEntityCount(t, "rules")
	if ruleCount != 0 {
		t.Errorf("Expected 0 rules after cleanup, got %d", ruleCount)
	}
}
