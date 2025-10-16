package tests

import (
	"context"
	"testing"

	"grimdank-database/models"
	"grimdank-database/repositories"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

func TestBaseRepository(t *testing.T) {
	// Setup
	SetupTestServices(t)
	defer CleanupTestDB(t)
	ctx := context.Background()

	// Get a collection for testing
	collection := testDB.Database.Collection("test_collection")
	baseRepo := repositories.NewBaseRepository(collection)

	t.Run("Create Document", func(t *testing.T) {
		document := map[string]interface{}{
			"name":        "Test Document",
			"description": "A test document",
		}

		id, err := baseRepo.Create(ctx, document)
		if err != nil {
			t.Fatalf("Failed to create document: %v", err)
		}

		if id.IsZero() {
			t.Error("Expected valid ObjectID, got zero value")
		}
	})

	t.Run("Get Document By ID", func(t *testing.T) {
		// Create a document first
		document := map[string]interface{}{
			"name":        "Test Document",
			"description": "A test document",
		}

		id, err := baseRepo.Create(ctx, document)
		if err != nil {
			t.Fatalf("Failed to create document: %v", err)
		}

		// Get the document
		var result map[string]interface{}
		err = baseRepo.GetByID(ctx, id, &result)
		if err != nil {
			t.Fatalf("Failed to get document by ID: %v", err)
		}

		if result["name"] != "Test Document" {
			t.Errorf("Expected name 'Test Document', got %v", result["name"])
		}
	})

	t.Run("Get Non-Existent Document", func(t *testing.T) {
		nonExistentID := primitive.NewObjectID()
		var result map[string]interface{}
		err := baseRepo.GetByID(ctx, nonExistentID, &result)
		if err == nil {
			t.Error("Expected error when getting non-existent document, but got none")
		}
	})

	t.Run("Get All Documents", func(t *testing.T) {
		// Create multiple documents
		for i := 0; i < 3; i++ {
			document := map[string]interface{}{
				"name":        "Test Document",
				"description": "A test document",
				"index":       i,
			}
			_, err := baseRepo.Create(ctx, document)
			if err != nil {
				t.Fatalf("Failed to create document %d: %v", i, err)
			}
		}

		var results []map[string]interface{}
		err := baseRepo.GetAll(ctx, map[string]interface{}{}, &results, 10, 0)
		if err != nil {
			t.Fatalf("Failed to get all documents: %v", err)
		}

		if len(results) < 3 {
			t.Errorf("Expected at least 3 documents, got %d", len(results))
		}
	})

	t.Run("Update Document", func(t *testing.T) {
		// Create a document first
		document := map[string]interface{}{
			"name":        "Test Document",
			"description": "A test document",
		}

		id, err := baseRepo.Create(ctx, document)
		if err != nil {
			t.Fatalf("Failed to create document: %v", err)
		}

		// Update the document
		updatedDocument := map[string]interface{}{
			"name":        "Updated Document",
			"description": "An updated document",
		}

		err = baseRepo.Update(ctx, id, updatedDocument)
		if err != nil {
			t.Fatalf("Failed to update document: %v", err)
		}

		// Verify the update
		var result map[string]interface{}
		err = baseRepo.GetByID(ctx, id, &result)
		if err != nil {
			t.Fatalf("Failed to get updated document: %v", err)
		}

		if result["name"] != "Updated Document" {
			t.Errorf("Expected name 'Updated Document', got %v", result["name"])
		}
	})

	t.Run("Update Non-Existent Document", func(t *testing.T) {
		nonExistentID := primitive.NewObjectID()
		document := map[string]interface{}{
			"name": "Test Document",
		}

		err := baseRepo.Update(ctx, nonExistentID, document)
		if err == nil {
			t.Error("Expected error when updating non-existent document, but got none")
		}
	})

	t.Run("Delete Document", func(t *testing.T) {
		// Create a document first
		document := map[string]interface{}{
			"name":        "Test Document",
			"description": "A test document",
		}

		id, err := baseRepo.Create(ctx, document)
		if err != nil {
			t.Fatalf("Failed to create document: %v", err)
		}

		// Delete the document
		err = baseRepo.Delete(ctx, id)
		if err != nil {
			t.Fatalf("Failed to delete document: %v", err)
		}

		// Verify deletion
		var result map[string]interface{}
		err = baseRepo.GetByID(ctx, id, &result)
		if err == nil {
			t.Error("Expected error when getting deleted document, but got none")
		}
	})

	t.Run("Delete Non-Existent Document", func(t *testing.T) {
		nonExistentID := primitive.NewObjectID()
		err := baseRepo.Delete(ctx, nonExistentID)
		if err == nil {
			t.Error("Expected error when deleting non-existent document, but got none")
		}
	})
}

func TestRuleRepository(t *testing.T) {
	// Setup
	SetupTestServices(t)
	defer CleanupTestDB(t)
	ctx := context.Background()

	collection := testDB.Database.Collection("rules")
	repo := repositories.NewRuleRepository(collection)

	t.Run("Create Rule", func(t *testing.T) {
		rule := CreateTestRule()
		id, err := repo.CreateRule(ctx, rule)
		if err != nil {
			t.Fatalf("Failed to create rule: %v", err)
		}

		if id == "" {
			t.Error("Expected valid ID, got empty string")
		}

		// Verify the rule was created
		objectID, err := primitive.ObjectIDFromHex(id)
		if err != nil {
			t.Fatalf("Failed to parse ObjectID: %v", err)
		}

		var result models.Rule
		err = repo.GetByID(ctx, objectID, &result)
		if err != nil {
			t.Fatalf("Failed to get created rule: %v", err)
		}

		if result.Name != rule.Name {
			t.Errorf("Expected name %s, got %s", rule.Name, result.Name)
		}
	})

	t.Run("Get Rule By ID", func(t *testing.T) {
		// Create a rule first
		rule := CreateTestRule()
		id, err := repo.CreateRule(ctx, rule)
		if err != nil {
			t.Fatalf("Failed to create rule: %v", err)
		}

		// Get the rule by ID
		retrievedRule, err := repo.GetRuleByID(ctx, id)
		if err != nil {
			t.Fatalf("Failed to get rule by ID: %v", err)
		}

		if retrievedRule.Name != rule.Name {
			t.Errorf("Expected name %s, got %s", rule.Name, retrievedRule.Name)
		}
	})

	t.Run("Get All Rules", func(t *testing.T) {
		// Create multiple rules
		for i := 0; i < 3; i++ {
			rule := &models.Rule{
				Name:        "Test Rule",
				Description: "A test rule",
			}
			_, err := repo.CreateRule(ctx, rule)
			if err != nil {
				t.Fatalf("Failed to create rule %d: %v", i, err)
			}
		}

		// Get all rules
		rules, err := repo.GetAllRules(ctx, 10, 0)
		if err != nil {
			t.Fatalf("Failed to get all rules: %v", err)
		}

		if len(rules) < 3 {
			t.Errorf("Expected at least 3 rules, got %d", len(rules))
		}
	})

	t.Run("Search Rules By Name", func(t *testing.T) {
		// Create rules with different names
		ruleNames := []string{"Fire Rule", "Ice Rule", "Fire Magic"}
		for _, name := range ruleNames {
			rule := &models.Rule{
				Name:        name,
				Description: "A test rule",
			}
			_, err := repo.CreateRule(ctx, rule)
			if err != nil {
				t.Fatalf("Failed to create rule: %v", err)
			}
		}

		// Search for rules containing "Fire"
		fireRules, err := repo.SearchRulesByName(ctx, "Fire", 10, 0)
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
		id, err := repo.CreateRule(ctx, rule)
		if err != nil {
			t.Fatalf("Failed to create rule: %v", err)
		}

		// Update the rule
		rule.Description = "Updated description"
		err = repo.UpdateRule(ctx, id, rule)
		if err != nil {
			t.Fatalf("Failed to update rule: %v", err)
		}

		// Verify the update
		updatedRule, err := repo.GetRuleByID(ctx, id)
		if err != nil {
			t.Fatalf("Failed to get updated rule: %v", err)
		}

		if updatedRule.Description != "Updated description" {
			t.Errorf("Expected description 'Updated description', got '%s'", updatedRule.Description)
		}
	})

	t.Run("Delete Rule", func(t *testing.T) {
		// Create a rule first
		rule := CreateTestRule()
		id, err := repo.CreateRule(ctx, rule)
		if err != nil {
			t.Fatalf("Failed to create rule: %v", err)
		}

		// Delete the rule
		err = repo.DeleteRule(ctx, id)
		if err != nil {
			t.Fatalf("Failed to delete rule: %v", err)
		}

		// Verify deletion
		_, err = repo.GetRuleByID(ctx, id)
		if err == nil {
			t.Error("Expected error when getting deleted rule, but got none")
		}
	})

	t.Run("Bulk Import Rules", func(t *testing.T) {
		rules := []models.Rule{
			{Name: "Bulk Rule 1", Description: "First bulk rule"},
			{Name: "Bulk Rule 2", Description: "Second bulk rule"},
		}

		importedIDs, err := repo.BulkImportRules(ctx, rules)
		if err != nil {
			t.Fatalf("Failed to bulk import rules: %v", err)
		}

		if len(importedIDs) != 2 {
			t.Errorf("Expected 2 imported IDs, got %d", len(importedIDs))
		}
	})

	t.Run("Bulk Import Empty Rules List", func(t *testing.T) {
		rules := []models.Rule{}

		importedIDs, err := repo.BulkImportRules(ctx, rules)
		if err != nil {
			t.Fatalf("Failed to bulk import empty rules list: %v", err)
		}

		if len(importedIDs) != 0 {
			t.Errorf("Expected 0 imported IDs for empty list, got %d", len(importedIDs))
		}
	})
}

func TestWeaponRepository(t *testing.T) {
	// Setup
	SetupTestServices(t)
	defer CleanupTestDB(t)
	ctx := context.Background()

	collection := testDB.Database.Collection("weapons")
	repo := repositories.NewWeaponRepository(collection)

	t.Run("Create Weapon", func(t *testing.T) {
		weapon := CreateTestWeapon()
		id, err := repo.CreateWeapon(ctx, weapon)
		if err != nil {
			t.Fatalf("Failed to create weapon: %v", err)
		}

		if id == "" {
			t.Error("Expected valid ID, got empty string")
		}
	})

	t.Run("Get Weapon By ID", func(t *testing.T) {
		// Create a weapon first
		weapon := CreateTestWeapon()
		id, err := repo.CreateWeapon(ctx, weapon)
		if err != nil {
			t.Fatalf("Failed to create weapon: %v", err)
		}

		// Get the weapon by ID
		retrievedWeapon, err := repo.GetWeaponByID(ctx, id)
		if err != nil {
			t.Fatalf("Failed to get weapon by ID: %v", err)
		}

		if retrievedWeapon.Name != weapon.Name {
			t.Errorf("Expected name %s, got %s", weapon.Name, retrievedWeapon.Name)
		}
	})

	t.Run("Get All Weapons", func(t *testing.T) {
		// Create multiple weapons
		for i := 0; i < 3; i++ {
			weapon := &models.Weapon{
				Name:    "Test Weapon",
				Type:    "Melee",
				Range:   0,
				AP:      "3+",
				Attacks: 2,
				Points:  10,
			}
			_, err := repo.CreateWeapon(ctx, weapon)
			if err != nil {
				t.Fatalf("Failed to create weapon %d: %v", i, err)
			}
		}

		// Get all weapons
		weapons, err := repo.GetAllWeapons(ctx, 10, 0)
		if err != nil {
			t.Fatalf("Failed to get all weapons: %v", err)
		}

		if len(weapons) < 3 {
			t.Errorf("Expected at least 3 weapons, got %d", len(weapons))
		}
	})

	t.Run("Search Weapons By Name", func(t *testing.T) {
		// Create weapons with different names
		weaponNames := []string{"Fire Sword", "Ice Axe", "Fire Staff"}
		for _, name := range weaponNames {
			weapon := &models.Weapon{
				Name:    name,
				Type:    "Melee",
				Range:   0,
				AP:      "3+",
				Attacks: 2,
				Points:  10,
			}
			_, err := repo.CreateWeapon(ctx, weapon)
			if err != nil {
				t.Fatalf("Failed to create weapon: %v", err)
			}
		}

		// Search for weapons containing "Fire"
		fireWeapons, err := repo.SearchWeaponsByName(ctx, "Fire", 10, 0)
		if err != nil {
			t.Fatalf("Failed to search weapons by name: %v", err)
		}

		if len(fireWeapons) != 2 {
			t.Errorf("Expected 2 weapons with 'Fire' in name, got %d", len(fireWeapons))
		}
	})

	t.Run("Update Weapon", func(t *testing.T) {
		// Create a weapon first
		weapon := CreateTestWeapon()
		id, err := repo.CreateWeapon(ctx, weapon)
		if err != nil {
			t.Fatalf("Failed to create weapon: %v", err)
		}

		// Update the weapon
		weapon.Points = 20
		err = repo.UpdateWeapon(ctx, id, weapon)
		if err != nil {
			t.Fatalf("Failed to update weapon: %v", err)
		}

		// Verify the update
		updatedWeapon, err := repo.GetWeaponByID(ctx, id)
		if err != nil {
			t.Fatalf("Failed to get updated weapon: %v", err)
		}

		if updatedWeapon.Points != 20 {
			t.Errorf("Expected points 20, got %d", updatedWeapon.Points)
		}
	})

	t.Run("Delete Weapon", func(t *testing.T) {
		// Create a weapon first
		weapon := CreateTestWeapon()
		id, err := repo.CreateWeapon(ctx, weapon)
		if err != nil {
			t.Fatalf("Failed to create weapon: %v", err)
		}

		// Delete the weapon
		err = repo.DeleteWeapon(ctx, id)
		if err != nil {
			t.Fatalf("Failed to delete weapon: %v", err)
		}

		// Verify deletion
		_, err = repo.GetWeaponByID(ctx, id)
		if err == nil {
			t.Error("Expected error when getting deleted weapon, but got none")
		}
	})

	t.Run("Bulk Import Weapons", func(t *testing.T) {
		weapons := []models.Weapon{
			{Name: "Bulk Weapon 1", Type: "Melee", Range: 0, AP: "3+", Attacks: 2, Points: 10},
			{Name: "Bulk Weapon 2", Type: "Ranged", Range: 24, AP: "4+", Attacks: 1, Points: 15},
		}

		importedIDs, err := repo.BulkImportWeapons(ctx, weapons)
		if err != nil {
			t.Fatalf("Failed to bulk import weapons: %v", err)
		}

		if len(importedIDs) != 2 {
			t.Errorf("Expected 2 imported IDs, got %d", len(importedIDs))
		}
	})
}
