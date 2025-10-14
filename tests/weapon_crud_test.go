package tests

import (
	"context"
	"fmt"
	"testing"

	"grimdank-database/models"
)

func TestWeaponCRUD(t *testing.T) {
	// Setup
	SetupTestServices(t)
	defer CleanupTestDB(t)
	ctx := context.Background()

	t.Run("Create Weapon", func(t *testing.T) {
		weapon := CreateTestWeapon()

		createdWeapon, err := testServices.WeaponService.CreateWeapon(ctx, weapon)
		if err != nil {
			t.Fatalf("Failed to create weapon: %v", err)
		}

		if createdWeapon.ID.IsZero() {
			t.Error("Created weapon should have a valid ID")
		}

		AssertEqualWeapons(t, weapon, createdWeapon, "Created weapon should match input")
	})

	t.Run("Get Weapon By ID", func(t *testing.T) {
		// Create a weapon first
		weapon := CreateTestWeapon()
		createdWeapon, err := testServices.WeaponService.CreateWeapon(ctx, weapon)
		if err != nil {
			t.Fatalf("Failed to create weapon: %v", err)
		}

		// Get the weapon by ID
		retrievedWeapon, err := testServices.WeaponService.GetWeaponByID(ctx, createdWeapon.ID.Hex())
		if err != nil {
			t.Fatalf("Failed to get weapon by ID: %v", err)
		}

		AssertEqualWeapons(t, createdWeapon, retrievedWeapon, "Retrieved weapon should match created weapon")
	})

	t.Run("Get All Weapons", func(t *testing.T) {
		// Clean up first
		CleanupTestDB(t)

		// Create multiple weapons
		weapons := []*models.Weapon{
			{Name: "Weapon 1", Type: "Ranged", Range: "12\"", Strength: "3", AP: "0", Attacks: 1, Points: 5},
			{Name: "Weapon 2", Type: "Melee", Range: "Melee", Strength: "4", AP: "1", Attacks: 2, Points: 10},
			{Name: "Weapon 3", Type: "Ranged", Range: "24\"", Strength: "5", AP: "2", Attacks: 3, Points: 15},
		}

		for _, weapon := range weapons {
			_, err := testServices.WeaponService.CreateWeapon(ctx, weapon)
			if err != nil {
				t.Fatalf("Failed to create weapon: %v", err)
			}
		}

		// Get all weapons
		allWeapons, err := testServices.WeaponService.GetAllWeapons(ctx, 10, 0)
		if err != nil {
			t.Fatalf("Failed to get all weapons: %v", err)
		}

		if len(allWeapons) != 3 {
			t.Errorf("Expected 3 weapons, got %d", len(allWeapons))
		}
	})

	t.Run("Search Weapons By Name", func(t *testing.T) {
		// Clean up first
		CleanupTestDB(t)

		// Create weapons with different names
		weapons := []*models.Weapon{
			{Name: "Fire Rifle", Type: "Ranged", Range: "24\"", Strength: "4", AP: "0", Attacks: 1, Points: 10},
			{Name: "Ice Sword", Type: "Melee", Range: "Melee", Strength: "3", AP: "1", Attacks: 1, Points: 8},
			{Name: "Fire Cannon", Type: "Ranged", Range: "36\"", Strength: "6", AP: "2", Attacks: 3, Points: 20},
		}

		for _, weapon := range weapons {
			_, err := testServices.WeaponService.CreateWeapon(ctx, weapon)
			if err != nil {
				t.Fatalf("Failed to create weapon: %v", err)
			}
		}

		// Search for weapons containing "Fire"
		fireWeapons, err := testServices.WeaponService.SearchWeaponsByName(ctx, "Fire", 10, 0)
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
		createdWeapon, err := testServices.WeaponService.CreateWeapon(ctx, weapon)
		if err != nil {
			t.Fatalf("Failed to create weapon: %v", err)
		}

		// Update the weapon
		createdWeapon.Attacks = 2
		createdWeapon.Points = 25

		err = testServices.WeaponService.UpdateWeapon(ctx, createdWeapon.ID.Hex(), createdWeapon)
		if err != nil {
			t.Fatalf("Failed to update weapon: %v", err)
		}

		// Retrieve and verify the update
		updatedWeapon, err := testServices.WeaponService.GetWeaponByID(ctx, createdWeapon.ID.Hex())
		if err != nil {
			t.Fatalf("Failed to get updated weapon: %v", err)
		}

		if updatedWeapon.Attacks != 2 {
			t.Errorf("Expected attacks 2, got %d", updatedWeapon.Attacks)
		}
		if updatedWeapon.Points != 25 {
			t.Errorf("Expected points 25, got %d", updatedWeapon.Points)
		}
	})

	t.Run("Delete Weapon", func(t *testing.T) {
		// Create a weapon first
		weapon := CreateTestWeapon()
		createdWeapon, err := testServices.WeaponService.CreateWeapon(ctx, weapon)
		if err != nil {
			t.Fatalf("Failed to create weapon: %v", err)
		}

		// Delete the weapon
		err = testServices.WeaponService.DeleteWeapon(ctx, createdWeapon.ID.Hex())
		if err != nil {
			t.Fatalf("Failed to delete weapon: %v", err)
		}

		// Try to get the deleted weapon - should fail
		_, err = testServices.WeaponService.GetWeaponByID(ctx, createdWeapon.ID.Hex())
		if err == nil {
			t.Error("Expected error when getting deleted weapon, but got none")
		}
	})

	t.Run("Create Weapon With Empty Name Should Fail", func(t *testing.T) {
		weapon := &models.Weapon{
			Name:     "",
			Type:     "Ranged",
			Range:    "24\"",
			Strength: "4",
			AP:       "0",
			Attacks:  1,
			Points:   10,
		}

		_, err := testServices.WeaponService.CreateWeapon(ctx, weapon)
		if err == nil {
			t.Error("Expected error when creating weapon with empty name, but got none")
		}
	})

	t.Run("Update Weapon With Empty Name Should Fail", func(t *testing.T) {
		// Create a weapon first
		weapon := CreateTestWeapon()
		createdWeapon, err := testServices.WeaponService.CreateWeapon(ctx, weapon)
		if err != nil {
			t.Fatalf("Failed to create weapon: %v", err)
		}

		// Try to update with empty name
		createdWeapon.Name = ""
		err = testServices.WeaponService.UpdateWeapon(ctx, createdWeapon.ID.Hex(), createdWeapon)
		if err == nil {
			t.Error("Expected error when updating weapon with empty name, but got none")
		}
	})

	t.Run("Get Non-Existent Weapon Should Fail", func(t *testing.T) {
		nonExistentID := "507f1f77bcf86cd799439011" // Valid ObjectID format but non-existent

		_, err := testServices.WeaponService.GetWeaponByID(ctx, nonExistentID)
		if err == nil {
			t.Error("Expected error when getting non-existent weapon, but got none")
		}
	})

	t.Run("Update Non-Existent Weapon Should Fail", func(t *testing.T) {
		weapon := CreateTestWeapon()
		nonExistentID := "507f1f77bcf86cd799439011" // Valid ObjectID format but non-existent

		err := testServices.WeaponService.UpdateWeapon(ctx, nonExistentID, weapon)
		if err == nil {
			t.Error("Expected error when updating non-existent weapon, but got none")
		}
	})

	t.Run("Delete Non-Existent Weapon Should Fail", func(t *testing.T) {
		nonExistentID := "507f1f77bcf86cd799439011" // Valid ObjectID format but non-existent

		err := testServices.WeaponService.DeleteWeapon(ctx, nonExistentID)
		if err == nil {
			t.Error("Expected error when deleting non-existent weapon, but got none")
		}
	})

	t.Run("Invalid ObjectID Should Fail", func(t *testing.T) {
		invalidID := "invalid-id"

		_, err := testServices.WeaponService.GetWeaponByID(ctx, invalidID)
		if err == nil {
			t.Error("Expected error when using invalid ObjectID, but got none")
		}

		weapon := CreateTestWeapon()
		err = testServices.WeaponService.UpdateWeapon(ctx, invalidID, weapon)
		if err == nil {
			t.Error("Expected error when updating with invalid ObjectID, but got none")
		}

		err = testServices.WeaponService.DeleteWeapon(ctx, invalidID)
		if err == nil {
			t.Error("Expected error when deleting with invalid ObjectID, but got none")
		}
	})
}

func TestWeaponBulkImport(t *testing.T) {
	// Setup
	SetupTestServices(t)
	defer CleanupTestDB(t)
	ctx := context.Background()

	t.Run("Bulk Import Weapons", func(t *testing.T) {
		weapons := []models.Weapon{
			{Name: "Bulk Weapon 1", Type: "Ranged", Range: "12\"", Strength: "3", AP: "0", Attacks: 1, Points: 5},
			{Name: "Bulk Weapon 2", Type: "Melee", Range: "Melee", Strength: "4", AP: "1", Attacks: 2, Points: 10},
			{Name: "Bulk Weapon 3", Type: "Ranged", Range: "24\"", Strength: "5", AP: "2", Attacks: 3, Points: 15},
		}

		importedIDs, err := testServices.WeaponService.BulkImportWeapons(ctx, weapons)
		if err != nil {
			t.Fatalf("Failed to bulk import weapons: %v", err)
		}

		if len(importedIDs) != 3 {
			t.Errorf("Expected 3 imported IDs, got %d", len(importedIDs))
		}

		// Verify all weapons were created
		allWeapons, err := testServices.WeaponService.GetAllWeapons(ctx, 10, 0)
		if err != nil {
			t.Fatalf("Failed to get all weapons: %v", err)
		}

		if len(allWeapons) != 3 {
			t.Errorf("Expected 3 weapons in database, got %d", len(allWeapons))
		}
	})

	t.Run("Bulk Import Weapons With Empty Name Should Fail", func(t *testing.T) {
		// Clean up first
		CleanupTestDB(t)

		weapons := []models.Weapon{
			{Name: "Valid Weapon", Type: "Ranged", Range: "12\"", Strength: "3", AP: "0", Attacks: 1, Points: 5},
			{Name: "", Type: "Melee", Range: "Melee", Strength: "4", AP: "1", Attacks: 2, Points: 10},
		}

		_, err := testServices.WeaponService.BulkImportWeapons(ctx, weapons)
		if err == nil {
			t.Error("Expected error when bulk importing weapons with empty name, but got none")
		}
	})

	t.Run("Bulk Import Empty Weapons List", func(t *testing.T) {
		weapons := []models.Weapon{}

		importedIDs, err := testServices.WeaponService.BulkImportWeapons(ctx, weapons)
		if err != nil {
			t.Fatalf("Failed to bulk import empty weapons list: %v", err)
		}

		if len(importedIDs) != 0 {
			t.Errorf("Expected 0 imported IDs for empty list, got %d", len(importedIDs))
		}
	})
}

func TestWeaponPagination(t *testing.T) {
	// Setup
	SetupTestServices(t)
	defer CleanupTestDB(t)
	ctx := context.Background()

	t.Run("Test Pagination", func(t *testing.T) {
		// Create 5 weapons
		for i := 1; i <= 5; i++ {
			weapon := &models.Weapon{
				Name:     fmt.Sprintf("Weapon %d", i),
				Type:     "Ranged",
				Range:    fmt.Sprintf("%d\"", i*6),
				Strength: fmt.Sprintf("%d", i+2),
				AP:       fmt.Sprintf("%d", i-1),
				Attacks:  i,
				Points:   i * 5,
			}
			_, err := testServices.WeaponService.CreateWeapon(ctx, weapon)
			if err != nil {
				t.Fatalf("Failed to create weapon %d: %v", i, err)
			}
		}

		// Test limit
		weapons, err := testServices.WeaponService.GetAllWeapons(ctx, 3, 0)
		if err != nil {
			t.Fatalf("Failed to get weapons with limit: %v", err)
		}

		if len(weapons) != 3 {
			t.Errorf("Expected 3 weapons with limit 3, got %d", len(weapons))
		}

		// Test skip
		weapons, err = testServices.WeaponService.GetAllWeapons(ctx, 3, 2)
		if err != nil {
			t.Fatalf("Failed to get weapons with skip: %v", err)
		}

		if len(weapons) != 3 {
			t.Errorf("Expected 3 weapons with skip 2, got %d", len(weapons))
		}
	})
}
