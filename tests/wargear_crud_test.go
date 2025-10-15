package tests

import (
	"context"
	"fmt"
	"testing"

	"grimdank-database/models"
)

func TestWarGearCRUD(t *testing.T) {
	// Setup
	SetupTestServices(t)
	defer CleanupTestDB(t)
	ctx := context.Background()

	t.Run("Create WarGear", func(t *testing.T) {
		wargear := CreateTestWarGear()

		createdWarGear, err := testServices.WarGearService.CreateWarGear(ctx, wargear)
		if err != nil {
			t.Fatalf("Failed to create wargear: %v", err)
		}

		if createdWarGear.ID.IsZero() {
			t.Error("Created wargear should have a valid ID")
		}

		AssertEqualWarGear(t, wargear, createdWarGear, "Created wargear should match input")
	})

	t.Run("Get WarGear By ID", func(t *testing.T) {
		// Create a wargear first
		wargear := CreateTestWarGear()
		createdWarGear, err := testServices.WarGearService.CreateWarGear(ctx, wargear)
		if err != nil {
			t.Fatalf("Failed to create wargear: %v", err)
		}

		// Get the wargear by ID
		retrievedWarGear, err := testServices.WarGearService.GetWarGearByID(ctx, createdWarGear.ID.Hex())
		if err != nil {
			t.Fatalf("Failed to get wargear by ID: %v", err)
		}

		AssertEqualWarGear(t, createdWarGear, retrievedWarGear, "Retrieved wargear should match created wargear")
	})

	t.Run("Get All WarGear", func(t *testing.T) {
		// Clean up first
		CleanupTestDB(t)

		// Create multiple wargear items
		wargearItems := []*models.WarGear{
			{Name: "Wargear 1", Description: "First wargear", Points: 5},
			{Name: "Wargear 2", Description: "Second wargear", Points: 10},
			{Name: "Wargear 3", Description: "Third wargear", Points: 15},
		}

		for _, wargear := range wargearItems {
			_, err := testServices.WarGearService.CreateWarGear(ctx, wargear)
			if err != nil {
				t.Fatalf("Failed to create wargear: %v", err)
			}
		}

		// Get all wargear
		allWarGear, err := testServices.WarGearService.GetAllWarGear(ctx, 10, 0)
		if err != nil {
			t.Fatalf("Failed to get all wargear: %v", err)
		}

		if len(allWarGear) != 3 {
			t.Errorf("Expected 3 wargear items, got %d", len(allWarGear))
		}
	})

	t.Run("Search WarGear By Name", func(t *testing.T) {
		// Clean up first
		CleanupTestDB(t)

		// Create wargear with different names
		wargearItems := []*models.WarGear{
			{Name: "Fire Shield", Description: "A fire shield", Points: 10},
			{Name: "Ice Sword", Description: "An ice sword", Points: 15},
			{Name: "Fire Gauntlets", Description: "Fire gauntlets", Points: 8},
		}

		for _, wargear := range wargearItems {
			_, err := testServices.WarGearService.CreateWarGear(ctx, wargear)
			if err != nil {
				t.Fatalf("Failed to create wargear: %v", err)
			}
		}

		// Search for wargear containing "Fire"
		fireWarGear, err := testServices.WarGearService.SearchWarGearByName(ctx, "Fire", 10, 0)
		if err != nil {
			t.Fatalf("Failed to search wargear by name: %v", err)
		}

		if len(fireWarGear) != 2 {
			t.Errorf("Expected 2 wargear items with 'Fire' in name, got %d", len(fireWarGear))
		}
	})

	t.Run("Update WarGear", func(t *testing.T) {
		// Create a wargear first
		wargear := CreateTestWarGear()
		createdWarGear, err := testServices.WarGearService.CreateWarGear(ctx, wargear)
		if err != nil {
			t.Fatalf("Failed to create wargear: %v", err)
		}

		// Update the wargear
		createdWarGear.Description = "Updated description"
		createdWarGear.Points = 25

		err = testServices.WarGearService.UpdateWarGear(ctx, createdWarGear.ID.Hex(), createdWarGear)
		if err != nil {
			t.Fatalf("Failed to update wargear: %v", err)
		}

		// Retrieve and verify the update
		updatedWarGear, err := testServices.WarGearService.GetWarGearByID(ctx, createdWarGear.ID.Hex())
		if err != nil {
			t.Fatalf("Failed to get updated wargear: %v", err)
		}

		if updatedWarGear.Description != "Updated description" {
			t.Errorf("Expected description 'Updated description', got '%s'", updatedWarGear.Description)
		}
		if updatedWarGear.Points != 25 {
			t.Errorf("Expected points 25, got %d", updatedWarGear.Points)
		}
	})

	t.Run("Delete WarGear", func(t *testing.T) {
		// Create a wargear first
		wargear := CreateTestWarGear()
		createdWarGear, err := testServices.WarGearService.CreateWarGear(ctx, wargear)
		if err != nil {
			t.Fatalf("Failed to create wargear: %v", err)
		}

		// Delete the wargear
		err = testServices.WarGearService.DeleteWarGear(ctx, createdWarGear.ID.Hex())
		if err != nil {
			t.Fatalf("Failed to delete wargear: %v", err)
		}

		// Try to get the deleted wargear - should fail
		_, err = testServices.WarGearService.GetWarGearByID(ctx, createdWarGear.ID.Hex())
		if err == nil {
			t.Error("Expected error when getting deleted wargear, but got none")
		}
	})

	t.Run("Create WarGear With Empty Name Should Fail", func(t *testing.T) {
		wargear := &models.WarGear{
			Name:        "",
			Description: "A wargear with empty name",
			Points:      5,
		}

		_, err := testServices.WarGearService.CreateWarGear(ctx, wargear)
		if err == nil {
			t.Error("Expected error when creating wargear with empty name, but got none")
		}
	})

	t.Run("Update WarGear With Empty Name Should Fail", func(t *testing.T) {
		// Create a wargear first
		wargear := CreateTestWarGear()
		createdWarGear, err := testServices.WarGearService.CreateWarGear(ctx, wargear)
		if err != nil {
			t.Fatalf("Failed to create wargear: %v", err)
		}

		// Try to update with empty name
		createdWarGear.Name = ""
		err = testServices.WarGearService.UpdateWarGear(ctx, createdWarGear.ID.Hex(), createdWarGear)
		if err == nil {
			t.Error("Expected error when updating wargear with empty name, but got none")
		}
	})

	t.Run("Get Non-Existent WarGear Should Fail", func(t *testing.T) {
		nonExistentID := "507f1f77bcf86cd799439011" // Valid ObjectID format but non-existent

		_, err := testServices.WarGearService.GetWarGearByID(ctx, nonExistentID)
		if err == nil {
			t.Error("Expected error when getting non-existent wargear, but got none")
		}
	})

	t.Run("Update Non-Existent WarGear Should Fail", func(t *testing.T) {
		wargear := CreateTestWarGear()
		nonExistentID := "507f1f77bcf86cd799439011" // Valid ObjectID format but non-existent

		err := testServices.WarGearService.UpdateWarGear(ctx, nonExistentID, wargear)
		if err == nil {
			t.Error("Expected error when updating non-existent wargear, but got none")
		}
	})

	t.Run("Delete Non-Existent WarGear Should Fail", func(t *testing.T) {
		nonExistentID := "507f1f77bcf86cd799439011" // Valid ObjectID format but non-existent

		err := testServices.WarGearService.DeleteWarGear(ctx, nonExistentID)
		if err == nil {
			t.Error("Expected error when deleting non-existent wargear, but got none")
		}
	})

	t.Run("Invalid ObjectID Should Fail", func(t *testing.T) {
		invalidID := "invalid-id"

		_, err := testServices.WarGearService.GetWarGearByID(ctx, invalidID)
		if err == nil {
			t.Error("Expected error when using invalid ObjectID, but got none")
		}

		wargear := CreateTestWarGear()
		err = testServices.WarGearService.UpdateWarGear(ctx, invalidID, wargear)
		if err == nil {
			t.Error("Expected error when updating with invalid ObjectID, but got none")
		}

		err = testServices.WarGearService.DeleteWarGear(ctx, invalidID)
		if err == nil {
			t.Error("Expected error when deleting with invalid ObjectID, but got none")
		}
	})
}

func TestWarGearBulkImport(t *testing.T) {
	// Setup
	SetupTestServices(t)
	defer CleanupTestDB(t)
	ctx := context.Background()

	t.Run("Bulk Import WarGear", func(t *testing.T) {
		wargearItems := []models.WarGear{
			{Name: "Bulk Wargear 1", Description: "First bulk wargear", Points: 5},
			{Name: "Bulk Wargear 2", Description: "Second bulk wargear", Points: 10},
			{Name: "Bulk Wargear 3", Description: "Third bulk wargear", Points: 15},
		}

		importedIDs, err := testServices.WarGearService.BulkImportWarGear(ctx, wargearItems)
		if err != nil {
			t.Fatalf("Failed to bulk import wargear: %v", err)
		}

		if len(importedIDs) != 3 {
			t.Errorf("Expected 3 imported IDs, got %d", len(importedIDs))
		}

		// Verify all wargear were created
		allWarGear, err := testServices.WarGearService.GetAllWarGear(ctx, 10, 0)
		if err != nil {
			t.Fatalf("Failed to get all wargear: %v", err)
		}

		if len(allWarGear) != 3 {
			t.Errorf("Expected 3 wargear items in database, got %d", len(allWarGear))
		}
	})

	t.Run("Bulk Import WarGear With Empty Name Should Fail", func(t *testing.T) {
		// Clean up first
		CleanupTestDB(t)

		wargearItems := []models.WarGear{
			{Name: "Valid Wargear", Description: "A valid wargear", Points: 5},
			{Name: "", Description: "Invalid wargear with empty name", Points: 10},
		}

		_, err := testServices.WarGearService.BulkImportWarGear(ctx, wargearItems)
		if err == nil {
			t.Error("Expected error when bulk importing wargear with empty name, but got none")
		}
	})

	t.Run("Bulk Import Empty WarGear List", func(t *testing.T) {
		wargearItems := []models.WarGear{}

		importedIDs, err := testServices.WarGearService.BulkImportWarGear(ctx, wargearItems)
		if err != nil {
			t.Fatalf("Failed to bulk import empty wargear list: %v", err)
		}

		if len(importedIDs) != 0 {
			t.Errorf("Expected 0 imported IDs for empty list, got %d", len(importedIDs))
		}
	})
}

func TestWarGearPagination(t *testing.T) {
	// Setup
	SetupTestServices(t)
	defer CleanupTestDB(t)
	ctx := context.Background()

	t.Run("Test Pagination", func(t *testing.T) {
		// Create 5 wargear items
		for i := 1; i <= 5; i++ {
			wargear := &models.WarGear{
				Name:        fmt.Sprintf("Wargear %d", i),
				Description: fmt.Sprintf("Description %d", i),
				Points:      i * 5,
			}
			_, err := testServices.WarGearService.CreateWarGear(ctx, wargear)
			if err != nil {
				t.Fatalf("Failed to create wargear %d: %v", i, err)
			}
		}

		// Test limit
		wargearItems, err := testServices.WarGearService.GetAllWarGear(ctx, 3, 0)
		if err != nil {
			t.Fatalf("Failed to get wargear with limit: %v", err)
		}

		if len(wargearItems) != 3 {
			t.Errorf("Expected 3 wargear items with limit 3, got %d", len(wargearItems))
		}

		// Test skip
		wargearItems, err = testServices.WarGearService.GetAllWarGear(ctx, 3, 2)
		if err != nil {
			t.Fatalf("Failed to get wargear with skip: %v", err)
		}

		if len(wargearItems) != 3 {
			t.Errorf("Expected 3 wargear items with skip 2, got %d", len(wargearItems))
		}
	})
}
