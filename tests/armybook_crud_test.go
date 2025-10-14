package tests

import (
	"context"
	"fmt"
	"testing"

	"grimdank-database/models"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

func TestArmyBookCRUD(t *testing.T) {
	// Setup
	SetupTestServices(t)
	defer CleanupTestDB(t)
	ctx := context.Background()

	t.Run("Create ArmyBook", func(t *testing.T) {
		armyBook := CreateTestArmyBook()

		createdArmyBook, err := testServices.ArmyBookService.CreateArmyBook(ctx, armyBook)
		if err != nil {
			t.Fatalf("Failed to create army book: %v", err)
		}

		if createdArmyBook.ID.IsZero() {
			t.Error("Created army book should have a valid ID")
		}

		AssertEqualArmyBooks(t, armyBook, createdArmyBook, "Created army book should match input")
	})

	t.Run("Get ArmyBook By ID", func(t *testing.T) {
		// Create an army book first
		armyBook := CreateTestArmyBook()
		createdArmyBook, err := testServices.ArmyBookService.CreateArmyBook(ctx, armyBook)
		if err != nil {
			t.Fatalf("Failed to create army book: %v", err)
		}

		// Get the army book by ID
		retrievedArmyBook, err := testServices.ArmyBookService.GetArmyBookByID(ctx, createdArmyBook.ID.Hex())
		if err != nil {
			t.Fatalf("Failed to get army book by ID: %v", err)
		}

		AssertEqualArmyBooks(t, createdArmyBook, retrievedArmyBook, "Retrieved army book should match created army book")
	})

	t.Run("Get All ArmyBooks", func(t *testing.T) {
		// Clean up first
		CleanupTestDB(t)

		// Create multiple army books
		armyBooks := []*models.ArmyBook{
			{Name: "Army Book 1", FactionID: primitive.NewObjectID(), Description: "First army book"},
			{Name: "Army Book 2", FactionID: primitive.NewObjectID(), Description: "Second army book"},
			{Name: "Army Book 3", FactionID: primitive.NewObjectID(), Description: "Third army book"},
		}

		for _, armyBook := range armyBooks {
			_, err := testServices.ArmyBookService.CreateArmyBook(ctx, armyBook)
			if err != nil {
				t.Fatalf("Failed to create army book: %v", err)
			}
		}

		// Get all army books
		allArmyBooks, err := testServices.ArmyBookService.GetAllArmyBooks(ctx, 10, 0)
		if err != nil {
			t.Fatalf("Failed to get all army books: %v", err)
		}

		if len(allArmyBooks) != 3 {
			t.Errorf("Expected 3 army books, got %d", len(allArmyBooks))
		}
	})

	t.Run("Search ArmyBooks By Name", func(t *testing.T) {
		// Clean up first
		CleanupTestDB(t)

		// Create army books with different names
		armyBooks := []*models.ArmyBook{
			{Name: "Fire Legion Codex", FactionID: primitive.NewObjectID(), Description: "A fire army book"},
			{Name: "Ice Warriors Codex", FactionID: primitive.NewObjectID(), Description: "An ice army book"},
			{Name: "Fire Marines Codex", FactionID: primitive.NewObjectID(), Description: "Another fire army book"},
		}

		for _, armyBook := range armyBooks {
			_, err := testServices.ArmyBookService.CreateArmyBook(ctx, armyBook)
			if err != nil {
				t.Fatalf("Failed to create army book: %v", err)
			}
		}

		// Search for army books containing "Fire"
		fireArmyBooks, err := testServices.ArmyBookService.SearchArmyBooksByName(ctx, "Fire", 10, 0)
		if err != nil {
			t.Fatalf("Failed to search army books by name: %v", err)
		}

		if len(fireArmyBooks) != 2 {
			t.Errorf("Expected 2 army books with 'Fire' in name, got %d", len(fireArmyBooks))
		}
	})

	t.Run("Update ArmyBook", func(t *testing.T) {
		// Create an army book first
		armyBook := CreateTestArmyBook()
		createdArmyBook, err := testServices.ArmyBookService.CreateArmyBook(ctx, armyBook)
		if err != nil {
			t.Fatalf("Failed to create army book: %v", err)
		}

		// Update the army book
		createdArmyBook.Description = "Updated description"
		createdArmyBook.FactionID = primitive.NewObjectID()

		err = testServices.ArmyBookService.UpdateArmyBook(ctx, createdArmyBook.ID.Hex(), createdArmyBook)
		if err != nil {
			t.Fatalf("Failed to update army book: %v", err)
		}

		// Retrieve and verify the update
		updatedArmyBook, err := testServices.ArmyBookService.GetArmyBookByID(ctx, createdArmyBook.ID.Hex())
		if err != nil {
			t.Fatalf("Failed to get updated army book: %v", err)
		}

		if updatedArmyBook.Description != "Updated description" {
			t.Errorf("Expected description 'Updated description', got '%s'", updatedArmyBook.Description)
		}
		if updatedArmyBook.FactionID != createdArmyBook.FactionID {
			t.Errorf("Expected faction ID to match updated faction ID")
		}
	})

	t.Run("Delete ArmyBook", func(t *testing.T) {
		// Create an army book first
		armyBook := CreateTestArmyBook()
		createdArmyBook, err := testServices.ArmyBookService.CreateArmyBook(ctx, armyBook)
		if err != nil {
			t.Fatalf("Failed to create army book: %v", err)
		}

		// Delete the army book
		err = testServices.ArmyBookService.DeleteArmyBook(ctx, createdArmyBook.ID.Hex())
		if err != nil {
			t.Fatalf("Failed to delete army book: %v", err)
		}

		// Try to get the deleted army book - should fail
		_, err = testServices.ArmyBookService.GetArmyBookByID(ctx, createdArmyBook.ID.Hex())
		if err == nil {
			t.Error("Expected error when getting deleted army book, but got none")
		}
	})

	t.Run("Create ArmyBook With Empty Name Should Fail", func(t *testing.T) {
		armyBook := &models.ArmyBook{
			Name:        "",
			FactionID:   primitive.NewObjectID(),
			Description: "An army book with empty name",
		}

		_, err := testServices.ArmyBookService.CreateArmyBook(ctx, armyBook)
		if err == nil {
			t.Error("Expected error when creating army book with empty name, but got none")
		}
	})

	t.Run("Update ArmyBook With Empty Name Should Fail", func(t *testing.T) {
		// Create an army book first
		armyBook := CreateTestArmyBook()
		createdArmyBook, err := testServices.ArmyBookService.CreateArmyBook(ctx, armyBook)
		if err != nil {
			t.Fatalf("Failed to create army book: %v", err)
		}

		// Try to update with empty name
		createdArmyBook.Name = ""
		err = testServices.ArmyBookService.UpdateArmyBook(ctx, createdArmyBook.ID.Hex(), createdArmyBook)
		if err == nil {
			t.Error("Expected error when updating army book with empty name, but got none")
		}
	})

	t.Run("Get Non-Existent ArmyBook Should Fail", func(t *testing.T) {
		nonExistentID := "507f1f77bcf86cd799439011" // Valid ObjectID format but non-existent

		_, err := testServices.ArmyBookService.GetArmyBookByID(ctx, nonExistentID)
		if err == nil {
			t.Error("Expected error when getting non-existent army book, but got none")
		}
	})

	t.Run("Update Non-Existent ArmyBook Should Fail", func(t *testing.T) {
		armyBook := CreateTestArmyBook()
		nonExistentID := "507f1f77bcf86cd799439011" // Valid ObjectID format but non-existent

		err := testServices.ArmyBookService.UpdateArmyBook(ctx, nonExistentID, armyBook)
		if err == nil {
			t.Error("Expected error when updating non-existent army book, but got none")
		}
	})

	t.Run("Delete Non-Existent ArmyBook Should Fail", func(t *testing.T) {
		nonExistentID := "507f1f77bcf86cd799439011" // Valid ObjectID format but non-existent

		err := testServices.ArmyBookService.DeleteArmyBook(ctx, nonExistentID)
		if err == nil {
			t.Error("Expected error when deleting non-existent army book, but got none")
		}
	})

	t.Run("Invalid ObjectID Should Fail", func(t *testing.T) {
		invalidID := "invalid-id"

		_, err := testServices.ArmyBookService.GetArmyBookByID(ctx, invalidID)
		if err == nil {
			t.Error("Expected error when using invalid ObjectID, but got none")
		}

		armyBook := CreateTestArmyBook()
		err = testServices.ArmyBookService.UpdateArmyBook(ctx, invalidID, armyBook)
		if err == nil {
			t.Error("Expected error when updating with invalid ObjectID, but got none")
		}

		err = testServices.ArmyBookService.DeleteArmyBook(ctx, invalidID)
		if err == nil {
			t.Error("Expected error when deleting with invalid ObjectID, but got none")
		}
	})
}

func TestArmyBookBulkImport(t *testing.T) {
	// Setup
	SetupTestServices(t)
	defer CleanupTestDB(t)
	ctx := context.Background()

	t.Run("Bulk Import ArmyBooks", func(t *testing.T) {
		armyBooks := []models.ArmyBook{
			{Name: "Bulk Army Book 1", FactionID: primitive.NewObjectID(), Description: "First bulk army book"},
			{Name: "Bulk Army Book 2", FactionID: primitive.NewObjectID(), Description: "Second bulk army book"},
			{Name: "Bulk Army Book 3", FactionID: primitive.NewObjectID(), Description: "Third bulk army book"},
		}

		importedIDs, err := testServices.ArmyBookService.BulkImportArmyBooks(ctx, armyBooks)
		if err != nil {
			t.Fatalf("Failed to bulk import army books: %v", err)
		}

		if len(importedIDs) != 3 {
			t.Errorf("Expected 3 imported IDs, got %d", len(importedIDs))
		}

		// Verify all army books were created
		allArmyBooks, err := testServices.ArmyBookService.GetAllArmyBooks(ctx, 10, 0)
		if err != nil {
			t.Fatalf("Failed to get all army books: %v", err)
		}

		if len(allArmyBooks) != 3 {
			t.Errorf("Expected 3 army books in database, got %d", len(allArmyBooks))
		}
	})

	t.Run("Bulk Import ArmyBooks With Empty Name Should Fail", func(t *testing.T) {
		// Clean up first
		CleanupTestDB(t)

		armyBooks := []models.ArmyBook{
			{Name: "Valid Army Book", FactionID: primitive.NewObjectID(), Description: "A valid army book"},
			{Name: "", FactionID: primitive.NewObjectID(), Description: "Invalid army book with empty name"},
		}

		_, err := testServices.ArmyBookService.BulkImportArmyBooks(ctx, armyBooks)
		if err == nil {
			t.Error("Expected error when bulk importing army books with empty name, but got none")
		}
	})

	t.Run("Bulk Import Empty ArmyBooks List", func(t *testing.T) {
		armyBooks := []models.ArmyBook{}

		importedIDs, err := testServices.ArmyBookService.BulkImportArmyBooks(ctx, armyBooks)
		if err != nil {
			t.Fatalf("Failed to bulk import empty army books list: %v", err)
		}

		if len(importedIDs) != 0 {
			t.Errorf("Expected 0 imported IDs for empty list, got %d", len(importedIDs))
		}
	})
}

func TestArmyBookPagination(t *testing.T) {
	// Setup
	SetupTestServices(t)
	defer CleanupTestDB(t)
	ctx := context.Background()

	t.Run("Test Pagination", func(t *testing.T) {
		// Create 5 army books
		for i := 1; i <= 5; i++ {
			armyBook := &models.ArmyBook{
				Name:        fmt.Sprintf("Army Book %d", i),
				FactionID:   primitive.NewObjectID(),
				Description: fmt.Sprintf("Description %d", i),
			}
			_, err := testServices.ArmyBookService.CreateArmyBook(ctx, armyBook)
			if err != nil {
				t.Fatalf("Failed to create army book %d: %v", i, err)
			}
		}

		// Test limit
		armyBooks, err := testServices.ArmyBookService.GetAllArmyBooks(ctx, 3, 0)
		if err != nil {
			t.Fatalf("Failed to get army books with limit: %v", err)
		}

		if len(armyBooks) != 3 {
			t.Errorf("Expected 3 army books with limit 3, got %d", len(armyBooks))
		}

		// Test skip
		armyBooks, err = testServices.ArmyBookService.GetAllArmyBooks(ctx, 3, 2)
		if err != nil {
			t.Fatalf("Failed to get army books with skip: %v", err)
		}

		if len(armyBooks) != 3 {
			t.Errorf("Expected 3 army books with skip 2, got %d", len(armyBooks))
		}
	})
}
