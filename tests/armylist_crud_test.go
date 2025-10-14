package tests

import (
	"context"
	"fmt"
	"testing"

	"grimdank-database/models"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

func TestArmyListCRUD(t *testing.T) {
	// Setup
	SetupTestServices(t)
	defer CleanupTestDB(t)
	ctx := context.Background()

	t.Run("Create ArmyList", func(t *testing.T) {
		armyList := CreateTestArmyList()

		createdArmyList, err := testServices.ArmyListService.CreateArmyList(ctx, armyList)
		if err != nil {
			t.Fatalf("Failed to create army list: %v", err)
		}

		if createdArmyList.ID.IsZero() {
			t.Error("Created army list should have a valid ID")
		}

		AssertEqualArmyLists(t, armyList, createdArmyList, "Created army list should match input")
	})

	t.Run("Get ArmyList By ID", func(t *testing.T) {
		// Create an army list first
		armyList := CreateTestArmyList()
		createdArmyList, err := testServices.ArmyListService.CreateArmyList(ctx, armyList)
		if err != nil {
			t.Fatalf("Failed to create army list: %v", err)
		}

		// Get the army list by ID
		retrievedArmyList, err := testServices.ArmyListService.GetArmyListByID(ctx, createdArmyList.ID.Hex())
		if err != nil {
			t.Fatalf("Failed to get army list by ID: %v", err)
		}

		AssertEqualArmyLists(t, createdArmyList, retrievedArmyList, "Retrieved army list should match created army list")
	})

	t.Run("Get All ArmyLists", func(t *testing.T) {
		// Clean up first
		CleanupTestDB(t)

		// Create multiple army lists
		armyLists := []*models.ArmyList{
			{Name: "Army List 1", Player: "Player A", FactionID: primitive.NewObjectID(), Points: 1000, Description: "First army list"},
			{Name: "Army List 2", Player: "Player B", FactionID: primitive.NewObjectID(), Points: 1500, Description: "Second army list"},
			{Name: "Army List 3", Player: "Player C", FactionID: primitive.NewObjectID(), Points: 2000, Description: "Third army list"},
		}

		for _, armyList := range armyLists {
			_, err := testServices.ArmyListService.CreateArmyList(ctx, armyList)
			if err != nil {
				t.Fatalf("Failed to create army list: %v", err)
			}
		}

		// Get all army lists
		allArmyLists, err := testServices.ArmyListService.GetAllArmyLists(ctx, 10, 0)
		if err != nil {
			t.Fatalf("Failed to get all army lists: %v", err)
		}

		if len(allArmyLists) != 3 {
			t.Errorf("Expected 3 army lists, got %d", len(allArmyLists))
		}
	})

	t.Run("Search ArmyLists By Name", func(t *testing.T) {
		// Clean up first
		CleanupTestDB(t)

		// Create army lists with different names
		armyLists := []*models.ArmyList{
			{Name: "Fire Legion List", Player: "Player A", FactionID: primitive.NewObjectID(), Points: 1000, Description: "A fire army list"},
			{Name: "Ice Warriors List", Player: "Player B", FactionID: primitive.NewObjectID(), Points: 1500, Description: "An ice army list"},
			{Name: "Fire Marines List", Player: "Player C", FactionID: primitive.NewObjectID(), Points: 2000, Description: "Another fire army list"},
		}

		for _, armyList := range armyLists {
			_, err := testServices.ArmyListService.CreateArmyList(ctx, armyList)
			if err != nil {
				t.Fatalf("Failed to create army list: %v", err)
			}
		}

		// Search for army lists containing "Fire"
		fireArmyLists, err := testServices.ArmyListService.SearchArmyListsByName(ctx, "Fire", 10, 0)
		if err != nil {
			t.Fatalf("Failed to search army lists by name: %v", err)
		}

		if len(fireArmyLists) != 2 {
			t.Errorf("Expected 2 army lists with 'Fire' in name, got %d", len(fireArmyLists))
		}
	})

	t.Run("Update ArmyList", func(t *testing.T) {
		// Create an army list first
		armyList := CreateTestArmyList()
		createdArmyList, err := testServices.ArmyListService.CreateArmyList(ctx, armyList)
		if err != nil {
			t.Fatalf("Failed to create army list: %v", err)
		}

		// Update the army list
		createdArmyList.Description = "Updated description"
		createdArmyList.Points = 2000

		err = testServices.ArmyListService.UpdateArmyList(ctx, createdArmyList.ID.Hex(), createdArmyList)
		if err != nil {
			t.Fatalf("Failed to update army list: %v", err)
		}

		// Retrieve and verify the update
		updatedArmyList, err := testServices.ArmyListService.GetArmyListByID(ctx, createdArmyList.ID.Hex())
		if err != nil {
			t.Fatalf("Failed to get updated army list: %v", err)
		}

		if updatedArmyList.Description != "Updated description" {
			t.Errorf("Expected description 'Updated description', got '%s'", updatedArmyList.Description)
		}
		if updatedArmyList.Points != 2000 {
			t.Errorf("Expected points 2000, got %d", updatedArmyList.Points)
		}
	})

	t.Run("Delete ArmyList", func(t *testing.T) {
		// Create an army list first
		armyList := CreateTestArmyList()
		createdArmyList, err := testServices.ArmyListService.CreateArmyList(ctx, armyList)
		if err != nil {
			t.Fatalf("Failed to create army list: %v", err)
		}

		// Delete the army list
		err = testServices.ArmyListService.DeleteArmyList(ctx, createdArmyList.ID.Hex())
		if err != nil {
			t.Fatalf("Failed to delete army list: %v", err)
		}

		// Try to get the deleted army list - should fail
		_, err = testServices.ArmyListService.GetArmyListByID(ctx, createdArmyList.ID.Hex())
		if err == nil {
			t.Error("Expected error when getting deleted army list, but got none")
		}
	})

	t.Run("Create ArmyList With Empty Name Should Fail", func(t *testing.T) {
		armyList := &models.ArmyList{
			Name:        "",
			Player:      "Test Player",
			FactionID:   primitive.NewObjectID(),
			Points:      1000,
			Description: "An army list with empty name",
		}

		_, err := testServices.ArmyListService.CreateArmyList(ctx, armyList)
		if err == nil {
			t.Error("Expected error when creating army list with empty name, but got none")
		}
	})

	t.Run("Update ArmyList With Empty Name Should Fail", func(t *testing.T) {
		// Create an army list first
		armyList := CreateTestArmyList()
		createdArmyList, err := testServices.ArmyListService.CreateArmyList(ctx, armyList)
		if err != nil {
			t.Fatalf("Failed to create army list: %v", err)
		}

		// Try to update with empty name
		createdArmyList.Name = ""
		err = testServices.ArmyListService.UpdateArmyList(ctx, createdArmyList.ID.Hex(), createdArmyList)
		if err == nil {
			t.Error("Expected error when updating army list with empty name, but got none")
		}
	})

	t.Run("Get Non-Existent ArmyList Should Fail", func(t *testing.T) {
		nonExistentID := "507f1f77bcf86cd799439011" // Valid ObjectID format but non-existent

		_, err := testServices.ArmyListService.GetArmyListByID(ctx, nonExistentID)
		if err == nil {
			t.Error("Expected error when getting non-existent army list, but got none")
		}
	})

	t.Run("Update Non-Existent ArmyList Should Fail", func(t *testing.T) {
		armyList := CreateTestArmyList()
		nonExistentID := "507f1f77bcf86cd799439011" // Valid ObjectID format but non-existent

		err := testServices.ArmyListService.UpdateArmyList(ctx, nonExistentID, armyList)
		if err == nil {
			t.Error("Expected error when updating non-existent army list, but got none")
		}
	})

	t.Run("Delete Non-Existent ArmyList Should Fail", func(t *testing.T) {
		nonExistentID := "507f1f77bcf86cd799439011" // Valid ObjectID format but non-existent

		err := testServices.ArmyListService.DeleteArmyList(ctx, nonExistentID)
		if err == nil {
			t.Error("Expected error when deleting non-existent army list, but got none")
		}
	})

	t.Run("Invalid ObjectID Should Fail", func(t *testing.T) {
		invalidID := "invalid-id"

		_, err := testServices.ArmyListService.GetArmyListByID(ctx, invalidID)
		if err == nil {
			t.Error("Expected error when using invalid ObjectID, but got none")
		}

		armyList := CreateTestArmyList()
		err = testServices.ArmyListService.UpdateArmyList(ctx, invalidID, armyList)
		if err == nil {
			t.Error("Expected error when updating with invalid ObjectID, but got none")
		}

		err = testServices.ArmyListService.DeleteArmyList(ctx, invalidID)
		if err == nil {
			t.Error("Expected error when deleting with invalid ObjectID, but got none")
		}
	})
}

func TestArmyListBulkImport(t *testing.T) {
	// Setup
	SetupTestServices(t)
	defer CleanupTestDB(t)
	ctx := context.Background()

	t.Run("Bulk Import ArmyLists", func(t *testing.T) {
		armyLists := []models.ArmyList{
			{Name: "Bulk Army List 1", Player: "Player A", FactionID: primitive.NewObjectID(), Points: 1000, Description: "First bulk army list"},
			{Name: "Bulk Army List 2", Player: "Player B", FactionID: primitive.NewObjectID(), Points: 1500, Description: "Second bulk army list"},
			{Name: "Bulk Army List 3", Player: "Player C", FactionID: primitive.NewObjectID(), Points: 2000, Description: "Third bulk army list"},
		}

		importedIDs, err := testServices.ArmyListService.BulkImportArmyLists(ctx, armyLists)
		if err != nil {
			t.Fatalf("Failed to bulk import army lists: %v", err)
		}

		if len(importedIDs) != 3 {
			t.Errorf("Expected 3 imported IDs, got %d", len(importedIDs))
		}

		// Verify all army lists were created
		allArmyLists, err := testServices.ArmyListService.GetAllArmyLists(ctx, 10, 0)
		if err != nil {
			t.Fatalf("Failed to get all army lists: %v", err)
		}

		if len(allArmyLists) != 3 {
			t.Errorf("Expected 3 army lists in database, got %d", len(allArmyLists))
		}
	})

	t.Run("Bulk Import ArmyLists With Empty Name Should Fail", func(t *testing.T) {
		// Clean up first
		CleanupTestDB(t)

		armyLists := []models.ArmyList{
			{Name: "Valid Army List", Player: "Player A", FactionID: primitive.NewObjectID(), Points: 1000, Description: "A valid army list"},
			{Name: "", Player: "Player B", FactionID: primitive.NewObjectID(), Points: 1500, Description: "Invalid army list with empty name"},
		}

		_, err := testServices.ArmyListService.BulkImportArmyLists(ctx, armyLists)
		if err == nil {
			t.Error("Expected error when bulk importing army lists with empty name, but got none")
		}
	})

	t.Run("Bulk Import Empty ArmyLists List", func(t *testing.T) {
		armyLists := []models.ArmyList{}

		importedIDs, err := testServices.ArmyListService.BulkImportArmyLists(ctx, armyLists)
		if err != nil {
			t.Fatalf("Failed to bulk import empty army lists list: %v", err)
		}

		if len(importedIDs) != 0 {
			t.Errorf("Expected 0 imported IDs for empty list, got %d", len(importedIDs))
		}
	})
}

func TestArmyListPagination(t *testing.T) {
	// Setup
	SetupTestServices(t)
	defer CleanupTestDB(t)
	ctx := context.Background()

	t.Run("Test Pagination", func(t *testing.T) {
		// Create 5 army lists
		for i := 1; i <= 5; i++ {
			armyList := &models.ArmyList{
				Name:        fmt.Sprintf("Army List %d", i),
				Player:      fmt.Sprintf("Player %d", i),
				FactionID:   primitive.NewObjectID(),
				Points:      i * 500,
				Description: fmt.Sprintf("Description %d", i),
			}
			_, err := testServices.ArmyListService.CreateArmyList(ctx, armyList)
			if err != nil {
				t.Fatalf("Failed to create army list %d: %v", i, err)
			}
		}

		// Test limit
		armyLists, err := testServices.ArmyListService.GetAllArmyLists(ctx, 3, 0)
		if err != nil {
			t.Fatalf("Failed to get army lists with limit: %v", err)
		}

		if len(armyLists) != 3 {
			t.Errorf("Expected 3 army lists with limit 3, got %d", len(armyLists))
		}

		// Test skip
		armyLists, err = testServices.ArmyListService.GetAllArmyLists(ctx, 3, 2)
		if err != nil {
			t.Fatalf("Failed to get army lists with skip: %v", err)
		}

		if len(armyLists) != 3 {
			t.Errorf("Expected 3 army lists with skip 2, got %d", len(armyLists))
		}
	})
}
