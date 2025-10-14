package tests

import (
	"context"
	"fmt"
	"testing"

	"grimdank-database/models"
)

func TestIntegrationCRUD(t *testing.T) {
	// Setup
	SetupTestServices(t)
	defer CleanupTestDB(t)
	ctx := context.Background()

	t.Run("Complete CRUD Workflow", func(t *testing.T) {
		// Test creating entities of all types
		rule := CreateTestRule()
		weapon := CreateTestWeapon()
		wargear := CreateTestWarGear()
		unit := CreateTestUnit()
		armyBook := CreateTestArmyBook()
		armyList := CreateTestArmyList()

		// Create all entities
		createdRule, err := testServices.RuleService.CreateRule(ctx, rule)
		if err != nil {
			t.Fatalf("Failed to create rule: %v", err)
		}

		createdWeapon, err := testServices.WeaponService.CreateWeapon(ctx, weapon)
		if err != nil {
			t.Fatalf("Failed to create weapon: %v", err)
		}

		createdWarGear, err := testServices.WarGearService.CreateWarGear(ctx, wargear)
		if err != nil {
			t.Fatalf("Failed to create wargear: %v", err)
		}

		createdUnit, err := testServices.UnitService.CreateUnit(ctx, unit)
		if err != nil {
			t.Fatalf("Failed to create unit: %v", err)
		}

		createdArmyBook, err := testServices.ArmyBookService.CreateArmyBook(ctx, armyBook)
		if err != nil {
			t.Fatalf("Failed to create army book: %v", err)
		}

		createdArmyList, err := testServices.ArmyListService.CreateArmyList(ctx, armyList)
		if err != nil {
			t.Fatalf("Failed to create army list: %v", err)
		}

		// Verify all entities were created
		allRules, err := testServices.RuleService.GetAllRules(ctx, 10, 0)
		if err != nil {
			t.Fatalf("Failed to get all rules: %v", err)
		}
		if len(allRules) != 1 {
			t.Errorf("Expected 1 rule, got %d", len(allRules))
		}

		allWeapons, err := testServices.WeaponService.GetAllWeapons(ctx, 10, 0)
		if err != nil {
			t.Fatalf("Failed to get all weapons: %v", err)
		}
		if len(allWeapons) != 1 {
			t.Errorf("Expected 1 weapon, got %d", len(allWeapons))
		}

		allWarGear, err := testServices.WarGearService.GetAllWarGear(ctx, 10, 0)
		if err != nil {
			t.Fatalf("Failed to get all wargear: %v", err)
		}
		if len(allWarGear) != 1 {
			t.Errorf("Expected 1 wargear, got %d", len(allWarGear))
		}

		allUnits, err := testServices.UnitService.GetAllUnits(ctx, 10, 0)
		if err != nil {
			t.Fatalf("Failed to get all units: %v", err)
		}
		if len(allUnits) != 1 {
			t.Errorf("Expected 1 unit, got %d", len(allUnits))
		}

		allArmyBooks, err := testServices.ArmyBookService.GetAllArmyBooks(ctx, 10, 0)
		if err != nil {
			t.Fatalf("Failed to get all army books: %v", err)
		}
		if len(allArmyBooks) != 1 {
			t.Errorf("Expected 1 army book, got %d", len(allArmyBooks))
		}

		allArmyLists, err := testServices.ArmyListService.GetAllArmyLists(ctx, 10, 0)
		if err != nil {
			t.Fatalf("Failed to get all army lists: %v", err)
		}
		if len(allArmyLists) != 1 {
			t.Errorf("Expected 1 army list, got %d", len(allArmyLists))
		}

		// Update all entities
		createdRule.Description = "Updated rule"
		err = testServices.RuleService.UpdateRule(ctx, createdRule.ID.Hex(), createdRule)
		if err != nil {
			t.Fatalf("Failed to update rule: %v", err)
		}

		createdWeapon.Attacks = 2
		err = testServices.WeaponService.UpdateWeapon(ctx, createdWeapon.ID.Hex(), createdWeapon)
		if err != nil {
			t.Fatalf("Failed to update weapon: %v", err)
		}

		createdWarGear.Description = "Updated wargear"
		err = testServices.WarGearService.UpdateWarGear(ctx, createdWarGear.ID.Hex(), createdWarGear)
		if err != nil {
			t.Fatalf("Failed to update wargear: %v", err)
		}

		createdUnit.Movement = "12\""
		err = testServices.UnitService.UpdateUnit(ctx, createdUnit.ID.Hex(), createdUnit)
		if err != nil {
			t.Fatalf("Failed to update unit: %v", err)
		}

		createdArmyBook.Description = "Updated army book"
		err = testServices.ArmyBookService.UpdateArmyBook(ctx, createdArmyBook.ID.Hex(), createdArmyBook)
		if err != nil {
			t.Fatalf("Failed to update army book: %v", err)
		}

		createdArmyList.Description = "Updated army list"
		err = testServices.ArmyListService.UpdateArmyList(ctx, createdArmyList.ID.Hex(), createdArmyList)
		if err != nil {
			t.Fatalf("Failed to update army list: %v", err)
		}

		// Delete all entities
		err = testServices.RuleService.DeleteRule(ctx, createdRule.ID.Hex())
		if err != nil {
			t.Fatalf("Failed to delete rule: %v", err)
		}

		err = testServices.WeaponService.DeleteWeapon(ctx, createdWeapon.ID.Hex())
		if err != nil {
			t.Fatalf("Failed to delete weapon: %v", err)
		}

		err = testServices.WarGearService.DeleteWarGear(ctx, createdWarGear.ID.Hex())
		if err != nil {
			t.Fatalf("Failed to delete wargear: %v", err)
		}

		err = testServices.UnitService.DeleteUnit(ctx, createdUnit.ID.Hex())
		if err != nil {
			t.Fatalf("Failed to delete unit: %v", err)
		}

		err = testServices.ArmyBookService.DeleteArmyBook(ctx, createdArmyBook.ID.Hex())
		if err != nil {
			t.Fatalf("Failed to delete army book: %v", err)
		}

		err = testServices.ArmyListService.DeleteArmyList(ctx, createdArmyList.ID.Hex())
		if err != nil {
			t.Fatalf("Failed to delete army list: %v", err)
		}

		// Verify all entities were deleted
		allRules, err = testServices.RuleService.GetAllRules(ctx, 10, 0)
		if err != nil {
			t.Fatalf("Failed to get all rules: %v", err)
		}
		if len(allRules) != 0 {
			t.Errorf("Expected 0 rules after deletion, got %d", len(allRules))
		}

		allWeapons, err = testServices.WeaponService.GetAllWeapons(ctx, 10, 0)
		if err != nil {
			t.Fatalf("Failed to get all weapons: %v", err)
		}
		if len(allWeapons) != 0 {
			t.Errorf("Expected 0 weapons after deletion, got %d", len(allWeapons))
		}

		allWarGear, err = testServices.WarGearService.GetAllWarGear(ctx, 10, 0)
		if err != nil {
			t.Fatalf("Failed to get all wargear: %v", err)
		}
		if len(allWarGear) != 0 {
			t.Errorf("Expected 0 wargear after deletion, got %d", len(allWarGear))
		}

		allUnits, err = testServices.UnitService.GetAllUnits(ctx, 10, 0)
		if err != nil {
			t.Fatalf("Failed to get all units: %v", err)
		}
		if len(allUnits) != 0 {
			t.Errorf("Expected 0 units after deletion, got %d", len(allUnits))
		}

		allArmyBooks, err = testServices.ArmyBookService.GetAllArmyBooks(ctx, 10, 0)
		if err != nil {
			t.Fatalf("Failed to get all army books: %v", err)
		}
		if len(allArmyBooks) != 0 {
			t.Errorf("Expected 0 army books after deletion, got %d", len(allArmyBooks))
		}

		allArmyLists, err = testServices.ArmyListService.GetAllArmyLists(ctx, 10, 0)
		if err != nil {
			t.Fatalf("Failed to get all army lists: %v", err)
		}
		if len(allArmyLists) != 0 {
			t.Errorf("Expected 0 army lists after deletion, got %d", len(allArmyLists))
		}
	})
}

func TestBulkImportIntegration(t *testing.T) {
	// Setup
	SetupTestServices(t)
	defer CleanupTestDB(t)
	ctx := context.Background()

	t.Run("Bulk Import All Entity Types", func(t *testing.T) {
		// Create test data for all entity types
		rules := []models.Rule{
			{Name: "Bulk Rule 1", Description: "First bulk rule", Type: "Type A", Points: []int{5, 10, 15}},
			{Name: "Bulk Rule 2", Description: "Second bulk rule", Type: "Type B", Points: []int{10, 20, 30}},
		}

		weapons := []models.Weapon{
			{Name: "Bulk Weapon 1", Type: "Ranged", Range: 12, AP: "0", Attacks: 1, Points: 5},
			{Name: "Bulk Weapon 2", Type: "Melee", Range: 0, AP: "1", Attacks: 2, Points: 10},
		}

		wargear := []models.WarGear{
			{Name: "Bulk Wargear 1", Type: "Equipment", Description: "First bulk wargear", Points: 5},
			{Name: "Bulk Wargear 2", Type: "Armor", Description: "Second bulk wargear", Points: 10},
		}

		units := []models.Unit{
			{
				Name: "Bulk Unit 1", Type: "Infantry", Movement: "6\"", WeaponSkill: "3+",
				BallisticSkill: "3+", Strength: "3", Toughness: "3", Wounds: "1",
				Initiative: "3", Attacks: "1", Leadership: "7", Save: "3+", Points: 100,
				Weapons: []models.Weapon{}, WarGear: []models.WarGear{},
			},
			{
				Name: "Bulk Unit 2", Type: "Vehicle", Movement: "12\"", WeaponSkill: "4+",
				BallisticSkill: "4+", Strength: "6", Toughness: "7", Wounds: "3",
				Initiative: "2", Attacks: "2", Leadership: "8", Save: "3+", Points: 200,
				Weapons: []models.Weapon{}, WarGear: []models.WarGear{},
			},
		}

		armyBooks := []models.ArmyBook{
			{Name: "Bulk Army Book 1", Faction: "Faction A", Description: "First bulk army book"},
			{Name: "Bulk Army Book 2", Faction: "Faction B", Description: "Second bulk army book"},
		}

		armyLists := []models.ArmyList{
			{Name: "Bulk Army List 1", Player: "Player A", Faction: "Faction A", Points: 1000, Description: "First bulk army list"},
			{Name: "Bulk Army List 2", Player: "Player B", Faction: "Faction B", Points: 1500, Description: "Second bulk army list"},
		}

		// Import all data
		_, err := testServices.RuleService.BulkImportRules(ctx, rules)
		if err != nil {
			t.Fatalf("Failed to bulk import rules: %v", err)
		}

		_, err = testServices.WeaponService.BulkImportWeapons(ctx, weapons)
		if err != nil {
			t.Fatalf("Failed to bulk import weapons: %v", err)
		}

		_, err = testServices.WarGearService.BulkImportWarGear(ctx, wargear)
		if err != nil {
			t.Fatalf("Failed to bulk import wargear: %v", err)
		}

		_, err = testServices.UnitService.BulkImportUnits(ctx, units)
		if err != nil {
			t.Fatalf("Failed to bulk import units: %v", err)
		}

		_, err = testServices.ArmyBookService.BulkImportArmyBooks(ctx, armyBooks)
		if err != nil {
			t.Fatalf("Failed to bulk import army books: %v", err)
		}

		_, err = testServices.ArmyListService.BulkImportArmyLists(ctx, armyLists)
		if err != nil {
			t.Fatalf("Failed to bulk import army lists: %v", err)
		}

		// Verify all data was imported
		allRules, err := testServices.RuleService.GetAllRules(ctx, 10, 0)
		if err != nil {
			t.Fatalf("Failed to get all rules: %v", err)
		}
		if len(allRules) != 2 {
			t.Errorf("Expected 2 rules after bulk import, got %d", len(allRules))
		}

		allWeapons, err := testServices.WeaponService.GetAllWeapons(ctx, 10, 0)
		if err != nil {
			t.Fatalf("Failed to get all weapons: %v", err)
		}
		if len(allWeapons) != 2 {
			t.Errorf("Expected 2 weapons after bulk import, got %d", len(allWeapons))
		}

		allWarGear, err := testServices.WarGearService.GetAllWarGear(ctx, 10, 0)
		if err != nil {
			t.Fatalf("Failed to get all wargear: %v", err)
		}
		if len(allWarGear) != 2 {
			t.Errorf("Expected 2 wargear after bulk import, got %d", len(allWarGear))
		}

		allUnits, err := testServices.UnitService.GetAllUnits(ctx, 10, 0)
		if err != nil {
			t.Fatalf("Failed to get all units: %v", err)
		}
		if len(allUnits) != 2 {
			t.Errorf("Expected 2 units after bulk import, got %d", len(allUnits))
		}

		allArmyBooks, err := testServices.ArmyBookService.GetAllArmyBooks(ctx, 10, 0)
		if err != nil {
			t.Fatalf("Failed to get all army books: %v", err)
		}
		if len(allArmyBooks) != 2 {
			t.Errorf("Expected 2 army books after bulk import, got %d", len(allArmyBooks))
		}

		allArmyLists, err := testServices.ArmyListService.GetAllArmyLists(ctx, 10, 0)
		if err != nil {
			t.Fatalf("Failed to get all army lists: %v", err)
		}
		if len(allArmyLists) != 2 {
			t.Errorf("Expected 2 army lists after bulk import, got %d", len(allArmyLists))
		}
	})
}

func TestSearchIntegration(t *testing.T) {
	// Setup
	SetupTestServices(t)
	defer CleanupTestDB(t)
	ctx := context.Background()

	t.Run("Search Across All Entity Types", func(t *testing.T) {
		// Create test data with searchable names
		rule := &models.Rule{Name: "Fire Rule", Description: "A fire rule", Type: "Special", Points: []int{5, 10, 15}}
		weapon := &models.Weapon{Name: "Fire Weapon", Type: "Ranged", Range: 24, AP: "0", Attacks: 1, Points: 10}
		wargear := &models.WarGear{Name: "Fire Wargear", Type: "Equipment", Description: "Fire equipment", Points: 15}
		unit := &models.Unit{
			Name: "Fire Unit", Type: "Infantry", Movement: "6\"", WeaponSkill: "3+",
			BallisticSkill: "3+", Strength: "3", Toughness: "3", Wounds: "1",
			Initiative: "3", Attacks: "1", Leadership: "7", Save: "3+", Points: 100,
			Weapons: []models.Weapon{}, WarGear: []models.WarGear{},
		}
		armyBook := &models.ArmyBook{Name: "Fire Army Book", Faction: "Fire Faction", Description: "A fire army book"}
		armyList := &models.ArmyList{Name: "Fire Army List", Player: "Fire Player", Faction: "Fire Faction", Points: 1000, Description: "A fire army list"}

		// Create all entities
		_, err := testServices.RuleService.CreateRule(ctx, rule)
		if err != nil {
			t.Fatalf("Failed to create rule: %v", err)
		}

		_, err = testServices.WeaponService.CreateWeapon(ctx, weapon)
		if err != nil {
			t.Fatalf("Failed to create weapon: %v", err)
		}

		_, err = testServices.WarGearService.CreateWarGear(ctx, wargear)
		if err != nil {
			t.Fatalf("Failed to create wargear: %v", err)
		}

		_, err = testServices.UnitService.CreateUnit(ctx, unit)
		if err != nil {
			t.Fatalf("Failed to create unit: %v", err)
		}

		_, err = testServices.ArmyBookService.CreateArmyBook(ctx, armyBook)
		if err != nil {
			t.Fatalf("Failed to create army book: %v", err)
		}

		_, err = testServices.ArmyListService.CreateArmyList(ctx, armyList)
		if err != nil {
			t.Fatalf("Failed to create army list: %v", err)
		}

		// Search for "Fire" across all entity types
		fireRules, err := testServices.RuleService.SearchRulesByName(ctx, "Fire", 10, 0)
		if err != nil {
			t.Fatalf("Failed to search rules: %v", err)
		}
		if len(fireRules) != 1 {
			t.Errorf("Expected 1 fire rule, got %d", len(fireRules))
		}

		fireWeapons, err := testServices.WeaponService.SearchWeaponsByName(ctx, "Fire", 10, 0)
		if err != nil {
			t.Fatalf("Failed to search weapons: %v", err)
		}
		if len(fireWeapons) != 1 {
			t.Errorf("Expected 1 fire weapon, got %d", len(fireWeapons))
		}

		fireWarGear, err := testServices.WarGearService.SearchWarGearByName(ctx, "Fire", 10, 0)
		if err != nil {
			t.Fatalf("Failed to search wargear: %v", err)
		}
		if len(fireWarGear) != 1 {
			t.Errorf("Expected 1 fire wargear, got %d", len(fireWarGear))
		}

		fireUnits, err := testServices.UnitService.SearchUnitsByName(ctx, "Fire", 10, 0)
		if err != nil {
			t.Fatalf("Failed to search units: %v", err)
		}
		if len(fireUnits) != 1 {
			t.Errorf("Expected 1 fire unit, got %d", len(fireUnits))
		}

		fireArmyBooks, err := testServices.ArmyBookService.SearchArmyBooksByName(ctx, "Fire", 10, 0)
		if err != nil {
			t.Fatalf("Failed to search army books: %v", err)
		}
		if len(fireArmyBooks) != 1 {
			t.Errorf("Expected 1 fire army book, got %d", len(fireArmyBooks))
		}

		fireArmyLists, err := testServices.ArmyListService.SearchArmyListsByName(ctx, "Fire", 10, 0)
		if err != nil {
			t.Fatalf("Failed to search army lists: %v", err)
		}
		if len(fireArmyLists) != 1 {
			t.Errorf("Expected 1 fire army list, got %d", len(fireArmyLists))
		}
	})
}

func TestPaginationIntegration(t *testing.T) {
	// Setup
	SetupTestServices(t)
	defer CleanupTestDB(t)
	ctx := context.Background()

	t.Run("Pagination Across All Entity Types", func(t *testing.T) {
		// Create 10 entities of each type
		for i := 1; i <= 10; i++ {
			rule := &models.Rule{Name: fmt.Sprintf("Rule %d", i), Description: fmt.Sprintf("Description %d", i), Type: "Type A", Points: []int{i * 5, i * 10, i * 15}}
			weapon := &models.Weapon{Name: fmt.Sprintf("Weapon %d", i), Type: "Ranged", Range: 24, AP: "0", Attacks: 1, Points: i * 10}
			wargear := &models.WarGear{Name: fmt.Sprintf("Wargear %d", i), Type: "Equipment", Description: fmt.Sprintf("Description %d", i), Points: i * 15}
			unit := &models.Unit{
				Name: fmt.Sprintf("Unit %d", i), Type: "Infantry", Movement: "6\"", WeaponSkill: "3+",
				BallisticSkill: "3+", Strength: "3", Toughness: "3", Wounds: "1",
				Initiative: "3", Attacks: "1", Leadership: "7", Save: "3+", Points: i * 100,
				Weapons: []models.Weapon{}, WarGear: []models.WarGear{},
			}
			armyBook := &models.ArmyBook{Name: fmt.Sprintf("Army Book %d", i), Faction: fmt.Sprintf("Faction %d", i), Description: fmt.Sprintf("Description %d", i)}
			armyList := &models.ArmyList{Name: fmt.Sprintf("Army List %d", i), Player: fmt.Sprintf("Player %d", i), Faction: fmt.Sprintf("Faction %d", i), Points: i * 1000, Description: fmt.Sprintf("Description %d", i)}

			_, err := testServices.RuleService.CreateRule(ctx, rule)
			if err != nil {
				t.Fatalf("Failed to create rule %d: %v", i, err)
			}

			_, err = testServices.WeaponService.CreateWeapon(ctx, weapon)
			if err != nil {
				t.Fatalf("Failed to create weapon %d: %v", i, err)
			}

			_, err = testServices.WarGearService.CreateWarGear(ctx, wargear)
			if err != nil {
				t.Fatalf("Failed to create wargear %d: %v", i, err)
			}

			_, err = testServices.UnitService.CreateUnit(ctx, unit)
			if err != nil {
				t.Fatalf("Failed to create unit %d: %v", i, err)
			}

			_, err = testServices.ArmyBookService.CreateArmyBook(ctx, armyBook)
			if err != nil {
				t.Fatalf("Failed to create army book %d: %v", i, err)
			}

			_, err = testServices.ArmyListService.CreateArmyList(ctx, armyList)
			if err != nil {
				t.Fatalf("Failed to create army list %d: %v", i, err)
			}
		}

		// Test pagination for all entity types
		entities := []struct {
			name     string
			getAll   func(limit, skip int64) (interface{}, error)
			expected int
		}{
			{"Rules", func(limit, skip int64) (interface{}, error) {
				return testServices.RuleService.GetAllRules(ctx, limit, skip)
			}, 10},
			{"Weapons", func(limit, skip int64) (interface{}, error) {
				return testServices.WeaponService.GetAllWeapons(ctx, limit, skip)
			}, 10},
			{"WarGear", func(limit, skip int64) (interface{}, error) {
				return testServices.WarGearService.GetAllWarGear(ctx, limit, skip)
			}, 10},
			{"Units", func(limit, skip int64) (interface{}, error) {
				return testServices.UnitService.GetAllUnits(ctx, limit, skip)
			}, 10},
			{"ArmyBooks", func(limit, skip int64) (interface{}, error) {
				return testServices.ArmyBookService.GetAllArmyBooks(ctx, limit, skip)
			}, 10},
			{"ArmyLists", func(limit, skip int64) (interface{}, error) {
				return testServices.ArmyListService.GetAllArmyLists(ctx, limit, skip)
			}, 10},
		}

		for _, entity := range entities {
			// Test limit
			result, err := entity.getAll(5, 0)
			if err != nil {
				t.Fatalf("Failed to get %s with limit: %v", entity.name, err)
			}

			var count int
			switch v := result.(type) {
			case []models.Rule:
				count = len(v)
			case []models.Weapon:
				count = len(v)
			case []models.WarGear:
				count = len(v)
			case []models.Unit:
				count = len(v)
			case []models.ArmyBook:
				count = len(v)
			case []models.ArmyList:
				count = len(v)
			}

			if count != 5 {
				t.Errorf("Expected 5 %s with limit 5, got %d", entity.name, count)
			}

			// Test skip
			result, err = entity.getAll(5, 5)
			if err != nil {
				t.Fatalf("Failed to get %s with skip: %v", entity.name, err)
			}

			switch v := result.(type) {
			case []models.Rule:
				count = len(v)
			case []models.Weapon:
				count = len(v)
			case []models.WarGear:
				count = len(v)
			case []models.Unit:
				count = len(v)
			case []models.ArmyBook:
				count = len(v)
			case []models.ArmyList:
				count = len(v)
			}

			if count != 5 {
				t.Errorf("Expected 5 %s with skip 5, got %d", entity.name, count)
			}
		}
	})
}
