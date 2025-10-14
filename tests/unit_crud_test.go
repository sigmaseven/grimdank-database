package tests

import (
	"context"
	"fmt"
	"testing"

	"grimdank-database/models"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

func TestUnitCRUD(t *testing.T) {
	// Setup
	SetupTestServices(t)
	defer CleanupTestDB(t)
	ctx := context.Background()

	t.Run("Create Unit", func(t *testing.T) {
		unit := CreateTestUnit()

		createdUnit, err := testServices.UnitService.CreateUnit(ctx, unit)
		if err != nil {
			t.Fatalf("Failed to create unit: %v", err)
		}

		if createdUnit.ID.IsZero() {
			t.Error("Created unit should have a valid ID")
		}

		AssertEqualUnits(t, unit, createdUnit, "Created unit should match input")
	})

	t.Run("Get Unit By ID", func(t *testing.T) {
		// Create a unit first
		unit := CreateTestUnit()
		createdUnit, err := testServices.UnitService.CreateUnit(ctx, unit)
		if err != nil {
			t.Fatalf("Failed to create unit: %v", err)
		}

		// Get the unit by ID
		retrievedUnit, err := testServices.UnitService.GetUnitByID(ctx, createdUnit.ID.Hex())
		if err != nil {
			t.Fatalf("Failed to get unit by ID: %v", err)
		}

		AssertEqualUnits(t, createdUnit, retrievedUnit, "Retrieved unit should match created unit")
	})

	t.Run("Get All Units", func(t *testing.T) {
		// Clean up first
		CleanupTestDB(t)

		// Create multiple units
		units := []*models.Unit{
			{
				Name: "Unit 1", Type: "Infantry", Movement: "6\"", WeaponSkill: "3+",
				BallisticSkill: "3+", Strength: "3", Toughness: "3", Wounds: "1",
				Initiative: "3", Attacks: "1", Leadership: "7", Save: "3+", Points: 100,
				Weapons: []primitive.ObjectID{}, WarGear: []primitive.ObjectID{},
			},
			{
				Name: "Unit 2", Type: "Vehicle", Movement: "12\"", WeaponSkill: "4+",
				BallisticSkill: "4+", Strength: "6", Toughness: "7", Wounds: "3",
				Initiative: "2", Attacks: "2", Leadership: "8", Save: "3+", Points: 200,
				Weapons: []primitive.ObjectID{}, WarGear: []primitive.ObjectID{},
			},
			{
				Name: "Unit 3", Type: "Monster", Movement: "8\"", WeaponSkill: "2+",
				BallisticSkill: "5+", Strength: "8", Toughness: "8", Wounds: "6",
				Initiative: "1", Attacks: "4", Leadership: "9", Save: "2+", Points: 300,
				Weapons: []primitive.ObjectID{}, WarGear: []primitive.ObjectID{},
			},
		}

		for _, unit := range units {
			_, err := testServices.UnitService.CreateUnit(ctx, unit)
			if err != nil {
				t.Fatalf("Failed to create unit: %v", err)
			}
		}

		// Get all units
		allUnits, err := testServices.UnitService.GetAllUnits(ctx, 10, 0)
		if err != nil {
			t.Fatalf("Failed to get all units: %v", err)
		}

		if len(allUnits) != 3 {
			t.Errorf("Expected 3 units, got %d", len(allUnits))
		}
	})

	t.Run("Search Units By Name", func(t *testing.T) {
		// Clean up first
		CleanupTestDB(t)

		// Create units with different names
		units := []*models.Unit{
			{
				Name: "Fire Marines", Type: "Infantry", Movement: "6\"", WeaponSkill: "3+",
				BallisticSkill: "3+", Strength: "3", Toughness: "3", Wounds: "1",
				Initiative: "3", Attacks: "1", Leadership: "7", Save: "3+", Points: 100,
				Weapons: []primitive.ObjectID{}, WarGear: []primitive.ObjectID{},
			},
			{
				Name: "Ice Warriors", Type: "Infantry", Movement: "6\"", WeaponSkill: "3+",
				BallisticSkill: "3+", Strength: "3", Toughness: "3", Wounds: "1",
				Initiative: "3", Attacks: "1", Leadership: "7", Save: "3+", Points: 100,
				Weapons: []primitive.ObjectID{}, WarGear: []primitive.ObjectID{},
			},
			{
				Name: "Fire Tank", Type: "Vehicle", Movement: "12\"", WeaponSkill: "4+",
				BallisticSkill: "4+", Strength: "6", Toughness: "7", Wounds: "3",
				Initiative: "2", Attacks: "2", Leadership: "8", Save: "3+", Points: 200,
				Weapons: []primitive.ObjectID{}, WarGear: []primitive.ObjectID{},
			},
		}

		for _, unit := range units {
			_, err := testServices.UnitService.CreateUnit(ctx, unit)
			if err != nil {
				t.Fatalf("Failed to create unit: %v", err)
			}
		}

		// Search for units containing "Fire"
		fireUnits, err := testServices.UnitService.SearchUnitsByName(ctx, "Fire", 10, 0)
		if err != nil {
			t.Fatalf("Failed to search units by name: %v", err)
		}

		if len(fireUnits) != 2 {
			t.Errorf("Expected 2 units with 'Fire' in name, got %d", len(fireUnits))
		}
	})

	t.Run("Update Unit", func(t *testing.T) {
		// Create a unit first
		unit := CreateTestUnit()
		createdUnit, err := testServices.UnitService.CreateUnit(ctx, unit)
		if err != nil {
			t.Fatalf("Failed to create unit: %v", err)
		}

		// Update the unit
		createdUnit.Movement = "12\""
		createdUnit.Points = 200

		err = testServices.UnitService.UpdateUnit(ctx, createdUnit.ID.Hex(), createdUnit)
		if err != nil {
			t.Fatalf("Failed to update unit: %v", err)
		}

		// Retrieve and verify the update
		updatedUnit, err := testServices.UnitService.GetUnitByID(ctx, createdUnit.ID.Hex())
		if err != nil {
			t.Fatalf("Failed to get updated unit: %v", err)
		}

		if updatedUnit.Movement != "12\"" {
			t.Errorf("Expected movement '12\"', got '%s'", updatedUnit.Movement)
		}
		if updatedUnit.Points != 200 {
			t.Errorf("Expected points 200, got %d", updatedUnit.Points)
		}
	})

	t.Run("Delete Unit", func(t *testing.T) {
		// Create a unit first
		unit := CreateTestUnit()
		createdUnit, err := testServices.UnitService.CreateUnit(ctx, unit)
		if err != nil {
			t.Fatalf("Failed to create unit: %v", err)
		}

		// Delete the unit
		err = testServices.UnitService.DeleteUnit(ctx, createdUnit.ID.Hex())
		if err != nil {
			t.Fatalf("Failed to delete unit: %v", err)
		}

		// Try to get the deleted unit - should fail
		_, err = testServices.UnitService.GetUnitByID(ctx, createdUnit.ID.Hex())
		if err == nil {
			t.Error("Expected error when getting deleted unit, but got none")
		}
	})

	t.Run("Create Unit With Empty Name Should Fail", func(t *testing.T) {
		unit := &models.Unit{
			Name: "", Type: "Infantry", Movement: "6\"", WeaponSkill: "3+",
			BallisticSkill: "3+", Strength: "3", Toughness: "3", Wounds: "1",
			Initiative: "3", Attacks: "1", Leadership: "7", Save: "3+", Points: 100,
			Weapons: []primitive.ObjectID{}, WarGear: []primitive.ObjectID{},
		}

		_, err := testServices.UnitService.CreateUnit(ctx, unit)
		if err == nil {
			t.Error("Expected error when creating unit with empty name, but got none")
		}
	})

	t.Run("Update Unit With Empty Name Should Fail", func(t *testing.T) {
		// Create a unit first
		unit := CreateTestUnit()
		createdUnit, err := testServices.UnitService.CreateUnit(ctx, unit)
		if err != nil {
			t.Fatalf("Failed to create unit: %v", err)
		}

		// Try to update with empty name
		createdUnit.Name = ""
		err = testServices.UnitService.UpdateUnit(ctx, createdUnit.ID.Hex(), createdUnit)
		if err == nil {
			t.Error("Expected error when updating unit with empty name, but got none")
		}
	})

	t.Run("Get Non-Existent Unit Should Fail", func(t *testing.T) {
		nonExistentID := "507f1f77bcf86cd799439011" // Valid ObjectID format but non-existent

		_, err := testServices.UnitService.GetUnitByID(ctx, nonExistentID)
		if err == nil {
			t.Error("Expected error when getting non-existent unit, but got none")
		}
	})

	t.Run("Update Non-Existent Unit Should Fail", func(t *testing.T) {
		unit := CreateTestUnit()
		nonExistentID := "507f1f77bcf86cd799439011" // Valid ObjectID format but non-existent

		err := testServices.UnitService.UpdateUnit(ctx, nonExistentID, unit)
		if err == nil {
			t.Error("Expected error when updating non-existent unit, but got none")
		}
	})

	t.Run("Delete Non-Existent Unit Should Fail", func(t *testing.T) {
		nonExistentID := "507f1f77bcf86cd799439011" // Valid ObjectID format but non-existent

		err := testServices.UnitService.DeleteUnit(ctx, nonExistentID)
		if err == nil {
			t.Error("Expected error when deleting non-existent unit, but got none")
		}
	})

	t.Run("Invalid ObjectID Should Fail", func(t *testing.T) {
		invalidID := "invalid-id"

		_, err := testServices.UnitService.GetUnitByID(ctx, invalidID)
		if err == nil {
			t.Error("Expected error when using invalid ObjectID, but got none")
		}

		unit := CreateTestUnit()
		err = testServices.UnitService.UpdateUnit(ctx, invalidID, unit)
		if err == nil {
			t.Error("Expected error when updating with invalid ObjectID, but got none")
		}

		err = testServices.UnitService.DeleteUnit(ctx, invalidID)
		if err == nil {
			t.Error("Expected error when deleting with invalid ObjectID, but got none")
		}
	})
}

func TestUnitBulkImport(t *testing.T) {
	// Setup
	SetupTestServices(t)
	defer CleanupTestDB(t)
	ctx := context.Background()

	t.Run("Bulk Import Units", func(t *testing.T) {
		units := []models.Unit{
			{
				Name: "Bulk Unit 1", Type: "Infantry", Movement: "6\"", WeaponSkill: "3+",
				BallisticSkill: "3+", Strength: "3", Toughness: "3", Wounds: "1",
				Initiative: "3", Attacks: "1", Leadership: "7", Save: "3+", Points: 100,
				Weapons: []primitive.ObjectID{}, WarGear: []primitive.ObjectID{},
			},
			{
				Name: "Bulk Unit 2", Type: "Vehicle", Movement: "12\"", WeaponSkill: "4+",
				BallisticSkill: "4+", Strength: "6", Toughness: "7", Wounds: "3",
				Initiative: "2", Attacks: "2", Leadership: "8", Save: "3+", Points: 200,
				Weapons: []primitive.ObjectID{}, WarGear: []primitive.ObjectID{},
			},
			{
				Name: "Bulk Unit 3", Type: "Monster", Movement: "8\"", WeaponSkill: "2+",
				BallisticSkill: "5+", Strength: "8", Toughness: "8", Wounds: "6",
				Initiative: "1", Attacks: "4", Leadership: "9", Save: "2+", Points: 300,
				Weapons: []primitive.ObjectID{}, WarGear: []primitive.ObjectID{},
			},
		}

		importedIDs, err := testServices.UnitService.BulkImportUnits(ctx, units)
		if err != nil {
			t.Fatalf("Failed to bulk import units: %v", err)
		}

		if len(importedIDs) != 3 {
			t.Errorf("Expected 3 imported IDs, got %d", len(importedIDs))
		}

		// Verify all units were created
		allUnits, err := testServices.UnitService.GetAllUnits(ctx, 10, 0)
		if err != nil {
			t.Fatalf("Failed to get all units: %v", err)
		}

		if len(allUnits) != 3 {
			t.Errorf("Expected 3 units in database, got %d", len(allUnits))
		}
	})

	t.Run("Bulk Import Units With Empty Name Should Fail", func(t *testing.T) {
		// Clean up first
		CleanupTestDB(t)

		units := []models.Unit{
			{
				Name: "Valid Unit", Type: "Infantry", Movement: "6\"", WeaponSkill: "3+",
				BallisticSkill: "3+", Strength: "3", Toughness: "3", Wounds: "1",
				Initiative: "3", Attacks: "1", Leadership: "7", Save: "3+", Points: 100,
				Weapons: []primitive.ObjectID{}, WarGear: []primitive.ObjectID{},
			},
			{
				Name: "", Type: "Vehicle", Movement: "12\"", WeaponSkill: "4+",
				BallisticSkill: "4+", Strength: "6", Toughness: "7", Wounds: "3",
				Initiative: "2", Attacks: "2", Leadership: "8", Save: "3+", Points: 200,
				Weapons: []primitive.ObjectID{}, WarGear: []primitive.ObjectID{},
			},
		}

		_, err := testServices.UnitService.BulkImportUnits(ctx, units)
		if err == nil {
			t.Error("Expected error when bulk importing units with empty name, but got none")
		}
	})

	t.Run("Bulk Import Empty Units List", func(t *testing.T) {
		units := []models.Unit{}

		importedIDs, err := testServices.UnitService.BulkImportUnits(ctx, units)
		if err != nil {
			t.Fatalf("Failed to bulk import empty units list: %v", err)
		}

		if len(importedIDs) != 0 {
			t.Errorf("Expected 0 imported IDs for empty list, got %d", len(importedIDs))
		}
	})
}

func TestUnitPagination(t *testing.T) {
	// Setup
	SetupTestServices(t)
	defer CleanupTestDB(t)
	ctx := context.Background()

	t.Run("Test Pagination", func(t *testing.T) {
		// Create 5 units
		for i := 1; i <= 5; i++ {
			unit := &models.Unit{
				Name: fmt.Sprintf("Unit %d", i), Type: "Infantry", Movement: "6\"",
				WeaponSkill: "3+", BallisticSkill: "3+", Strength: "3", Toughness: "3",
				Wounds: "1", Initiative: "3", Attacks: "1", Leadership: "7", Save: "3+",
				Points: i * 50, Weapons: []primitive.ObjectID{}, WarGear: []primitive.ObjectID{},
			}
			_, err := testServices.UnitService.CreateUnit(ctx, unit)
			if err != nil {
				t.Fatalf("Failed to create unit %d: %v", i, err)
			}
		}

		// Test limit
		units, err := testServices.UnitService.GetAllUnits(ctx, 3, 0)
		if err != nil {
			t.Fatalf("Failed to get units with limit: %v", err)
		}

		if len(units) != 3 {
			t.Errorf("Expected 3 units with limit 3, got %d", len(units))
		}

		// Test skip
		units, err = testServices.UnitService.GetAllUnits(ctx, 3, 2)
		if err != nil {
			t.Fatalf("Failed to get units with skip: %v", err)
		}

		if len(units) != 3 {
			t.Errorf("Expected 3 units with skip 2, got %d", len(units))
		}
	})
}
