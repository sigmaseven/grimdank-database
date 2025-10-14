package tests

import (
	"context"
	"fmt"
	"testing"

	"grimdank-database/models"
)

func TestFactionCRUD(t *testing.T) {
	// Setup
	SetupTestServices(t)
	defer CleanupTestDB(t)
	ctx := context.Background()

	t.Run("Create Faction", func(t *testing.T) {
		faction := CreateTestFaction()

		createdFaction, err := testServices.FactionService.CreateFaction(ctx, faction)
		if err != nil {
			t.Fatalf("Failed to create faction: %v", err)
		}

		if createdFaction.ID.IsZero() {
			t.Error("Created faction should have a valid ID")
		}

		AssertEqualFactions(t, faction, createdFaction, "Created faction should match input")
	})

	t.Run("Get Faction By ID", func(t *testing.T) {
		// Create a faction first
		faction := CreateTestFaction()
		createdFaction, err := testServices.FactionService.CreateFaction(ctx, faction)
		if err != nil {
			t.Fatalf("Failed to create faction: %v", err)
		}

		// Get the faction by ID
		retrievedFaction, err := testServices.FactionService.GetFactionByID(ctx, createdFaction.ID.Hex())
		if err != nil {
			t.Fatalf("Failed to get faction by ID: %v", err)
		}

		AssertEqualFactions(t, createdFaction, retrievedFaction, "Retrieved faction should match created faction")
	})

	t.Run("Get All Factions", func(t *testing.T) {
		// Clean up first
		CleanupTestDB(t)

		// Create multiple factions
		factions := []*models.Faction{
			{Name: "Faction A", Description: "First faction", Type: "Official"},
			{Name: "Faction B", Description: "Second faction", Type: "Custom"},
			{Name: "Faction C", Description: "Third faction", Type: "Official"},
		}

		for _, faction := range factions {
			_, err := testServices.FactionService.CreateFaction(ctx, faction)
			if err != nil {
				t.Fatalf("Failed to create faction: %v", err)
			}
		}

		// Get all factions
		allFactions, err := testServices.FactionService.GetAllFactions(ctx, 10, 0)
		if err != nil {
			t.Fatalf("Failed to get all factions: %v", err)
		}

		if len(allFactions) != 3 {
			t.Errorf("Expected 3 factions, got %d", len(allFactions))
		}
	})

	t.Run("Search Factions By Name", func(t *testing.T) {
		// Clean up first
		CleanupTestDB(t)

		// Create factions with different names
		factions := []*models.Faction{
			{Name: "Fire Legion", Description: "A fire faction", Type: "Official"},
			{Name: "Ice Warriors", Description: "An ice faction", Type: "Custom"},
			{Name: "Fire Marines", Description: "Another fire faction", Type: "Official"},
		}

		for _, faction := range factions {
			_, err := testServices.FactionService.CreateFaction(ctx, faction)
			if err != nil {
				t.Fatalf("Failed to create faction: %v", err)
			}
		}

		// Search for factions containing "Fire"
		fireFactions, err := testServices.FactionService.SearchFactionsByName(ctx, "Fire", 10, 0)
		if err != nil {
			t.Fatalf("Failed to search factions by name: %v", err)
		}

		if len(fireFactions) != 2 {
			t.Errorf("Expected 2 factions with 'Fire' in name, got %d", len(fireFactions))
		}
	})

	t.Run("Update Faction", func(t *testing.T) {
		// Create a faction first
		faction := CreateTestFaction()
		createdFaction, err := testServices.FactionService.CreateFaction(ctx, faction)
		if err != nil {
			t.Fatalf("Failed to create faction: %v", err)
		}

		// Update the faction
		createdFaction.Description = "Updated description"
		createdFaction.Type = "Custom"

		err = testServices.FactionService.UpdateFaction(ctx, createdFaction.ID.Hex(), createdFaction)
		if err != nil {
			t.Fatalf("Failed to update faction: %v", err)
		}

		// Retrieve and verify the update
		updatedFaction, err := testServices.FactionService.GetFactionByID(ctx, createdFaction.ID.Hex())
		if err != nil {
			t.Fatalf("Failed to get updated faction: %v", err)
		}

		if updatedFaction.Description != "Updated description" {
			t.Errorf("Expected description 'Updated description', got '%s'", updatedFaction.Description)
		}
		if updatedFaction.Type != "Custom" {
			t.Errorf("Expected type 'Custom', got '%s'", updatedFaction.Type)
		}
	})

	t.Run("Delete Faction", func(t *testing.T) {
		// Create a faction first
		faction := CreateTestFaction()
		createdFaction, err := testServices.FactionService.CreateFaction(ctx, faction)
		if err != nil {
			t.Fatalf("Failed to create faction: %v", err)
		}

		// Delete the faction
		err = testServices.FactionService.DeleteFaction(ctx, createdFaction.ID.Hex())
		if err != nil {
			t.Fatalf("Failed to delete faction: %v", err)
		}

		// Try to get the deleted faction - should fail
		_, err = testServices.FactionService.GetFactionByID(ctx, createdFaction.ID.Hex())
		if err == nil {
			t.Error("Expected error when getting deleted faction, but got none")
		}
	})

	t.Run("Create Faction With Empty Name Should Fail", func(t *testing.T) {
		faction := &models.Faction{
			Name:        "",
			Description: "A faction with empty name",
			Type:        "Official",
		}

		_, err := testServices.FactionService.CreateFaction(ctx, faction)
		if err == nil {
			t.Error("Expected error when creating faction with empty name, but got none")
		}
	})

	t.Run("Update Faction With Empty Name Should Fail", func(t *testing.T) {
		// Create a faction first
		faction := CreateTestFaction()
		createdFaction, err := testServices.FactionService.CreateFaction(ctx, faction)
		if err != nil {
			t.Fatalf("Failed to create faction: %v", err)
		}

		// Try to update with empty name
		createdFaction.Name = ""
		err = testServices.FactionService.UpdateFaction(ctx, createdFaction.ID.Hex(), createdFaction)
		if err == nil {
			t.Error("Expected error when updating faction with empty name, but got none")
		}
	})

	t.Run("Get Non-Existent Faction Should Fail", func(t *testing.T) {
		nonExistentID := "507f1f77bcf86cd799439011" // Valid ObjectID format but non-existent

		_, err := testServices.FactionService.GetFactionByID(ctx, nonExistentID)
		if err == nil {
			t.Error("Expected error when getting non-existent faction, but got none")
		}
	})

	t.Run("Update Non-Existent Faction Should Fail", func(t *testing.T) {
		faction := CreateTestFaction()
		nonExistentID := "507f1f77bcf86cd799439011" // Valid ObjectID format but non-existent

		err := testServices.FactionService.UpdateFaction(ctx, nonExistentID, faction)
		if err == nil {
			t.Error("Expected error when updating non-existent faction, but got none")
		}
	})

	t.Run("Delete Non-Existent Faction Should Fail", func(t *testing.T) {
		nonExistentID := "507f1f77bcf86cd799439011" // Valid ObjectID format but non-existent

		err := testServices.FactionService.DeleteFaction(ctx, nonExistentID)
		if err == nil {
			t.Error("Expected error when deleting non-existent faction, but got none")
		}
	})

	t.Run("Invalid ObjectID Should Fail", func(t *testing.T) {
		invalidID := "invalid-id"

		_, err := testServices.FactionService.GetFactionByID(ctx, invalidID)
		if err == nil {
			t.Error("Expected error when using invalid ObjectID, but got none")
		}

		faction := CreateTestFaction()
		err = testServices.FactionService.UpdateFaction(ctx, invalidID, faction)
		if err == nil {
			t.Error("Expected error when updating with invalid ObjectID, but got none")
		}

		err = testServices.FactionService.DeleteFaction(ctx, invalidID)
		if err == nil {
			t.Error("Expected error when deleting with invalid ObjectID, but got none")
		}
	})
}

func TestFactionPagination(t *testing.T) {
	// Setup
	SetupTestServices(t)
	defer CleanupTestDB(t)
	ctx := context.Background()

	t.Run("Test Pagination", func(t *testing.T) {
		// Create 5 factions
		for i := 1; i <= 5; i++ {
			faction := &models.Faction{
				Name:        fmt.Sprintf("Faction %d", i),
				Description: fmt.Sprintf("Description %d", i),
				Type:        "Official",
			}
			_, err := testServices.FactionService.CreateFaction(ctx, faction)
			if err != nil {
				t.Fatalf("Failed to create faction %d: %v", i, err)
			}
		}

		// Test limit
		factions, err := testServices.FactionService.GetAllFactions(ctx, 3, 0)
		if err != nil {
			t.Fatalf("Failed to get factions with limit: %v", err)
		}

		if len(factions) != 3 {
			t.Errorf("Expected 3 factions with limit 3, got %d", len(factions))
		}

		// Test skip
		factions, err = testServices.FactionService.GetAllFactions(ctx, 3, 2)
		if err != nil {
			t.Fatalf("Failed to get factions with skip: %v", err)
		}

		if len(factions) != 3 {
			t.Errorf("Expected 3 factions with skip 2, got %d", len(factions))
		}
	})
}
