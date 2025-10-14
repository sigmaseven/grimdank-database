package tests

import (
	"context"
	"os"
	"testing"
	"time"

	"grimdank-database/database"
	"grimdank-database/models"
	"grimdank-database/repositories"
	"grimdank-database/services"

	"go.mongodb.org/mongo-driver/mongo"
)

// TestDB represents the test database connection
type TestDB struct {
	Client      *mongo.Client
	Database    *mongo.Database
	Collections map[string]*mongo.Collection
}

// TestRepositories holds all repository instances for testing
type TestRepositories struct {
	RuleRepo     *repositories.RuleRepository
	WeaponRepo   *repositories.WeaponRepository
	WarGearRepo  *repositories.WarGearRepository
	UnitRepo     *repositories.UnitRepository
	ArmyBookRepo *repositories.ArmyBookRepository
	ArmyListRepo *repositories.ArmyListRepository
}

// TestServices holds all service instances for testing
type TestServices struct {
	RuleService     *services.RuleService
	WeaponService   *services.WeaponService
	WarGearService  *services.WarGearService
	UnitService     *services.UnitService
	ArmyBookService *services.ArmyBookService
	ArmyListService *services.ArmyListService
}

var (
	testDB              *TestDB
	testRepos           *TestRepositories
	testServices        *TestServices
	testCollectionNames = []string{
		"rules", "weapons", "wargear", "units", "armybooks", "armylists",
	}
	// Track created entities for cleanup
	createdEntities = make(map[string][]string) // collection -> []entityIDs
)

// SetupTestDB initializes the test database connection
func SetupTestDB(t *testing.T) *TestDB {
	// Use the same MONGODB_URI environment variable as the main application
	mongoURI := os.Getenv("MONGODB_URI")
	if mongoURI == "" {
		mongoURI = "mongodb://localhost:27017"
	}

	testDBName := "grimdank_db"

	// Connect to database using the same method as main application
	db, err := database.Connect(mongoURI, testDBName)
	if err != nil {
		t.Fatalf("Failed to connect to test database: %v", err)
	}

	// Create collections map
	collections := make(map[string]*mongo.Collection)
	for _, name := range testCollectionNames {
		collections[name] = db.Database.Collection(name)
	}

	testDB = &TestDB{
		Client:      db.Client,
		Database:    db.Database,
		Collections: collections,
	}

	return testDB
}

// SetupTestRepositories initializes all repository instances
func SetupTestRepositories(t *testing.T) *TestRepositories {
	if testDB == nil {
		SetupTestDB(t)
	}

	testRepos = &TestRepositories{
		RuleRepo:     repositories.NewRuleRepository(testDB.Collections["rules"]),
		WeaponRepo:   repositories.NewWeaponRepository(testDB.Collections["weapons"]),
		WarGearRepo:  repositories.NewWarGearRepository(testDB.Collections["wargear"]),
		UnitRepo:     repositories.NewUnitRepository(testDB.Collections["units"]),
		ArmyBookRepo: repositories.NewArmyBookRepository(testDB.Collections["armybooks"]),
		ArmyListRepo: repositories.NewArmyListRepository(testDB.Collections["armylists"]),
	}

	return testRepos
}

// SetupTestServices initializes all service instances
func SetupTestServices(t *testing.T) *TestServices {
	if testRepos == nil {
		SetupTestRepositories(t)
	}

	testServices = &TestServices{
		RuleService:     services.NewRuleService(testRepos.RuleRepo),
		WeaponService:   services.NewWeaponService(testRepos.WeaponRepo),
		WarGearService:  services.NewWarGearService(testRepos.WarGearRepo),
		UnitService:     services.NewUnitService(testRepos.UnitRepo),
		ArmyBookService: services.NewArmyBookService(testRepos.ArmyBookRepo),
		ArmyListService: services.NewArmyListService(testRepos.ArmyListRepo),
	}

	return testServices
}

// CleanupTestDB removes all test data from the database
func CleanupTestDB(t *testing.T) {
	if testDB == nil {
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// First, try to delete specific entities we created
	cleanupCreatedEntities(t, ctx)

	// Then drop all test collections as a fallback
	for _, name := range testCollectionNames {
		err := testDB.Collections[name].Drop(ctx)
		if err != nil {
			t.Logf("Warning: Failed to drop collection %s: %v", name, err)
		}
	}

	// Clear the tracking map
	createdEntities = make(map[string][]string)
}

// cleanupCreatedEntities removes specific entities that were created during tests
func cleanupCreatedEntities(t *testing.T, ctx context.Context) {
	for collectionName, entityIDs := range createdEntities {
		if len(entityIDs) == 0 {
			continue
		}

		collection := testDB.Collections[collectionName]
		if collection == nil {
			continue
		}

		// Delete all tracked entities
		for _, entityID := range entityIDs {
			_, err := collection.DeleteOne(ctx, map[string]interface{}{"_id": entityID})
			if err != nil {
				t.Logf("Warning: Failed to delete entity %s from %s: %v", entityID, collectionName, err)
			}
		}
	}
}

// CleanupTestDBConnection closes the database connection
func CleanupTestDBConnection(t *testing.T) {
	if testDB != nil && testDB.Client != nil {
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		err := testDB.Client.Disconnect(ctx)
		if err != nil {
			t.Logf("Warning: Failed to disconnect from database: %v", err)
		}
	}
}

// TrackCreatedEntity adds an entity ID to the tracking list for cleanup
func TrackCreatedEntity(collectionName, entityID string) {
	if createdEntities[collectionName] == nil {
		createdEntities[collectionName] = make([]string, 0)
	}
	createdEntities[collectionName] = append(createdEntities[collectionName], entityID)
}

// GetTestDatabaseName returns the test database name
func GetTestDatabaseName() string {
	return "grimdank_test_db"
}

// EnsureTestDatabaseIsolation ensures the test database is completely isolated
func EnsureTestDatabaseIsolation(t *testing.T) {
	if testDB == nil {
		SetupTestDB(t)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Drop the entire test database to ensure complete isolation
	err := testDB.Database.Drop(ctx)
	if err != nil {
		t.Logf("Warning: Failed to drop test database: %v", err)
	}

	// Recreate collections
	for _, name := range testCollectionNames {
		testDB.Collections[name] = testDB.Database.Collection(name)
	}

	// Clear tracking
	createdEntities = make(map[string][]string)
}

// CreateTestRule creates a test rule for testing
func CreateTestRule() *models.Rule {
	return &models.Rule{
		Name:        "Test Rule",
		Description: "A test rule for unit testing",
		Type:        "Special Rule",
		Points:      5,
	}
}

// CreateTestRuleWithName creates a test rule with a specific name
func CreateTestRuleWithName(name string) *models.Rule {
	return &models.Rule{
		Name:        name,
		Description: "A test rule for unit testing",
		Type:        "Special Rule",
		Points:      5,
	}
}

// CreateTestWeapon creates a test weapon for testing
func CreateTestWeapon() *models.Weapon {
	return &models.Weapon{
		Name:     "Test Weapon",
		Type:     "Ranged",
		Range:    "24\"",
		Strength: "4",
		AP:       "0",
		Attacks:  1,
		Points:   10,
		Rules:    []models.Rule{},
	}
}

// CreateTestWarGear creates a test wargear for testing
func CreateTestWarGear() *models.WarGear {
	return &models.WarGear{
		Name:        "Test WarGear",
		Type:        "Equipment",
		Description: "A test wargear item",
		Points:      15,
		Rules:       []models.Rule{},
		Weapons:     []models.Weapon{},
	}
}

// CreateTestUnit creates a test unit for testing
func CreateTestUnit() *models.Unit {
	return &models.Unit{
		Name:             "Test Unit",
		Type:             "Infantry",
		Movement:         "6\"",
		WeaponSkill:      "3+",
		BallisticSkill:   "3+",
		Strength:         "3",
		Toughness:        "3",
		Wounds:           "1",
		Initiative:       "3",
		Attacks:          "1",
		Leadership:       "7",
		Save:             "3+",
		Points:           100,
		Rules:            []models.Rule{},
		AvailableWeapons: []models.Weapon{},
		AvailableWarGear: []models.WarGear{},
	}
}

// CreateTestArmyBook creates a test army book for testing
func CreateTestArmyBook() *models.ArmyBook {
	return &models.ArmyBook{
		Name:        "Test Army Book",
		Faction:     "Test Faction",
		Description: "A test army book",
		Units:       []models.Unit{},
		Rules:       []models.Rule{},
	}
}

// CreateTestArmyList creates a test army list for testing
func CreateTestArmyList() *models.ArmyList {
	return &models.ArmyList{
		Name:        "Test Army List",
		Player:      "Test Player",
		Faction:     "Test Faction",
		Points:      1000,
		Units:       []models.Unit{},
		Description: "A test army list",
	}
}

// AssertEqualRules compares two rules and fails the test if they're not equal
func AssertEqualRules(t *testing.T, expected, actual *models.Rule, msg string) {
	if expected.Name != actual.Name {
		t.Errorf("%s: Expected name %s, got %s", msg, expected.Name, actual.Name)
	}
	if expected.Description != actual.Description {
		t.Errorf("%s: Expected description %s, got %s", msg, expected.Description, actual.Description)
	}
	if expected.Type != actual.Type {
		t.Errorf("%s: Expected type %s, got %s", msg, expected.Type, actual.Type)
	}
	if expected.Points != actual.Points {
		t.Errorf("%s: Expected points %d, got %d", msg, expected.Points, actual.Points)
	}
}

// AssertEqualWeapons compares two weapons and fails the test if they're not equal
func AssertEqualWeapons(t *testing.T, expected, actual *models.Weapon, msg string) {
	if expected.Name != actual.Name {
		t.Errorf("%s: Expected name %s, got %s", msg, expected.Name, actual.Name)
	}
	if expected.Type != actual.Type {
		t.Errorf("%s: Expected type %s, got %s", msg, expected.Type, actual.Type)
	}
	if expected.Range != actual.Range {
		t.Errorf("%s: Expected range %s, got %s", msg, expected.Range, actual.Range)
	}
	if expected.Strength != actual.Strength {
		t.Errorf("%s: Expected strength %s, got %s", msg, expected.Strength, actual.Strength)
	}
	if expected.AP != actual.AP {
		t.Errorf("%s: Expected AP %s, got %s", msg, expected.AP, actual.AP)
	}
	if expected.Attacks != actual.Attacks {
		t.Errorf("%s: Expected attacks %d, got %d", msg, expected.Attacks, actual.Attacks)
	}
	if expected.Points != actual.Points {
		t.Errorf("%s: Expected points %d, got %d", msg, expected.Points, actual.Points)
	}
}

// AssertEqualWarGear compares two wargear items and fails the test if they're not equal
func AssertEqualWarGear(t *testing.T, expected, actual *models.WarGear, msg string) {
	if expected.Name != actual.Name {
		t.Errorf("%s: Expected name %s, got %s", msg, expected.Name, actual.Name)
	}
	if expected.Type != actual.Type {
		t.Errorf("%s: Expected type %s, got %s", msg, expected.Type, actual.Type)
	}
	if expected.Description != actual.Description {
		t.Errorf("%s: Expected description %s, got %s", msg, expected.Description, actual.Description)
	}
	if expected.Points != actual.Points {
		t.Errorf("%s: Expected points %d, got %d", msg, expected.Points, actual.Points)
	}
}

// AssertEqualUnits compares two units and fails the test if they're not equal
func AssertEqualUnits(t *testing.T, expected, actual *models.Unit, msg string) {
	if expected.Name != actual.Name {
		t.Errorf("%s: Expected name %s, got %s", msg, expected.Name, actual.Name)
	}
	if expected.Type != actual.Type {
		t.Errorf("%s: Expected type %s, got %s", msg, expected.Type, actual.Type)
	}
	if expected.Movement != actual.Movement {
		t.Errorf("%s: Expected movement %s, got %s", msg, expected.Movement, actual.Movement)
	}
	if expected.Points != actual.Points {
		t.Errorf("%s: Expected points %d, got %d", msg, expected.Points, actual.Points)
	}
}

// AssertEqualArmyBooks compares two army books and fails the test if they're not equal
func AssertEqualArmyBooks(t *testing.T, expected, actual *models.ArmyBook, msg string) {
	if expected.Name != actual.Name {
		t.Errorf("%s: Expected name %s, got %s", msg, expected.Name, actual.Name)
	}
	if expected.Faction != actual.Faction {
		t.Errorf("%s: Expected faction %s, got %s", msg, expected.Faction, actual.Faction)
	}
	if expected.Description != actual.Description {
		t.Errorf("%s: Expected description %s, got %s", msg, expected.Description, actual.Description)
	}
}

// AssertEqualArmyLists compares two army lists and fails the test if they're not equal
func AssertEqualArmyLists(t *testing.T, expected, actual *models.ArmyList, msg string) {
	if expected.Name != actual.Name {
		t.Errorf("%s: Expected name %s, got %s", msg, expected.Name, actual.Name)
	}
	if expected.Player != actual.Player {
		t.Errorf("%s: Expected player %s, got %s", msg, expected.Player, actual.Player)
	}
	if expected.Faction != actual.Faction {
		t.Errorf("%s: Expected faction %s, got %s", msg, expected.Faction, actual.Faction)
	}
	if expected.Points != actual.Points {
		t.Errorf("%s: Expected points %d, got %d", msg, expected.Points, actual.Points)
	}
}
