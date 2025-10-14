package tests

import (
	"context"
	"os"
	"reflect"
	"testing"
	"time"

	"grimdank-database/database"
	"grimdank-database/models"
	"grimdank-database/repositories"
	"grimdank-database/services"

	"go.mongodb.org/mongo-driver/bson/primitive"
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
	FactionRepo  *repositories.FactionRepository
}

// TestServices holds all service instances for testing
type TestServices struct {
	RuleService       *services.RuleService
	WeaponService     *services.WeaponService
	WarGearService    *services.WarGearService
	UnitService       *services.UnitService
	ArmyBookService   *services.ArmyBookService
	ArmyListService   *services.ArmyListService
	FactionService    *services.FactionService
	PopulationService *services.PopulationService
}

var (
	testDB              *TestDB
	testRepos           *TestRepositories
	testServices        *TestServices
	testCollectionNames = []string{
		"rules", "weapons", "wargear", "units", "armybooks", "armylists", "factions",
	}
	// Track created entities for cleanup
	createdEntities = make(map[string][]string) // collection -> []entityIDs
)

// SetupTestDB initializes the test database connection
func SetupTestDB(t *testing.T) *TestDB {
	// Use the same MONGODB_URI environment variable as the main application
	mongoURI := os.Getenv("MONGODB_URI")
	if mongoURI == "" {
		// Use the same credentials as docker-compose.yml
		mongoURI = "mongodb://admin:password@localhost:27017/grimdank_db?authSource=admin"
	}

	testDBName := "grimdank_db"

	// Connect to database using the same method as main application
	db, err := database.Connect(mongoURI, testDBName, 10)
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
		FactionRepo:  repositories.NewFactionRepository(testDB.Collections["factions"]),
	}

	return testRepos
}

// SetupTestServices initializes all service instances
func SetupTestServices(t *testing.T) *TestServices {
	if testRepos == nil {
		SetupTestRepositories(t)
	}

	// Clean up any existing data before starting tests
	CleanupTestDB(t)

	testServices = &TestServices{
		RuleService:     services.NewRuleService(testRepos.RuleRepo),
		WeaponService:   services.NewWeaponService(testRepos.WeaponRepo),
		WarGearService:  services.NewWarGearService(testRepos.WarGearRepo),
		UnitService:     services.NewUnitService(testRepos.UnitRepo),
		ArmyBookService: services.NewArmyBookService(testRepos.ArmyBookRepo),
		ArmyListService: services.NewArmyListService(testRepos.ArmyListRepo),
		FactionService:  services.NewFactionService(testRepos.FactionRepo),
		PopulationService: services.NewPopulationService(
			services.NewRuleService(testRepos.RuleRepo),
			services.NewWeaponService(testRepos.WeaponRepo),
			services.NewWarGearService(testRepos.WarGearRepo),
			services.NewUnitService(testRepos.UnitRepo),
		),
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
		Points:      []int{5, 10, 15},
	}
}

// CreateTestRuleWithName creates a test rule with a specific name
func CreateTestRuleWithName(name string) *models.Rule {
	return &models.Rule{
		Name:        name,
		Description: "A test rule for unit testing",
		Type:        "Special Rule",
		Points:      []int{5, 10, 15},
	}
}

// CreateTestWeapon creates a test weapon for testing
func CreateTestWeapon() *models.Weapon {
	return &models.Weapon{
		Name:    "Test Weapon",
		Type:    "Ranged",
		Range:   24,
		AP:      "0",
		Attacks: 1,
		Points:  10,
		Rules:   []models.RuleReference{},
	}
}

// CreateTestWarGear creates a test wargear for testing
func CreateTestWarGear() *models.WarGear {
	return &models.WarGear{
		Name:        "Test WarGear",
		Type:        "Equipment",
		Description: "A test wargear item",
		Points:      15,
		Rules:       []models.RuleReference{},
	}
}

// CreateTestUnit creates a test unit for testing
func CreateTestUnit() *models.Unit {
	return &models.Unit{
		Name:             "Test Unit",
		Type:             "Infantry",
		Melee:            3,
		Ranged:           3,
		Morale:           7,
		Defense:          3,
		Points:           100,
		Rules:            []models.RuleReference{},
		AvailableWeapons: []primitive.ObjectID{},
		AvailableWarGear: []primitive.ObjectID{},
		Weapons:          []primitive.ObjectID{},
		WarGear:          []primitive.ObjectID{},
	}
}

// CreateTestArmyBook creates a test army book for testing
func CreateTestArmyBook() *models.ArmyBook {
	return &models.ArmyBook{
		Name:        "Test Army Book",
		FactionID:   primitive.NewObjectID(),
		Description: "A test army book",
		Units:       []primitive.ObjectID{},
		Rules:       []models.RuleReference{},
	}
}

// CreateTestArmyList creates a test army list for testing
func CreateTestArmyList() *models.ArmyList {
	return &models.ArmyList{
		Name:        "Test Army List",
		Player:      "Test Player",
		FactionID:   primitive.NewObjectID(),
		Points:      1000,
		Units:       []primitive.ObjectID{},
		Description: "A test army list",
	}
}

// CreateTestFaction creates a test faction for testing
func CreateTestFaction() *models.Faction {
	return &models.Faction{
		Name:        "Test Faction",
		Description: "A test faction",
		Type:        "Official",
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
	if !reflect.DeepEqual(expected.Points, actual.Points) {
		t.Errorf("%s: Expected points %v, got %v", msg, expected.Points, actual.Points)
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
		t.Errorf("%s: Expected range %d, got %d", msg, expected.Range, actual.Range)
	}
	// Strength field removed from Weapon model
	if expected.AP != actual.AP {
		t.Errorf("%s: Expected AP %s, got %s", msg, expected.AP, actual.AP)
	}
	if expected.Attacks != actual.Attacks {
		t.Errorf("%s: Expected attacks %d, got %d", msg, expected.Attacks, actual.Attacks)
	}
	if !reflect.DeepEqual(expected.Points, actual.Points) {
		t.Errorf("%s: Expected points %v, got %v", msg, expected.Points, actual.Points)
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
	if !reflect.DeepEqual(expected.Points, actual.Points) {
		t.Errorf("%s: Expected points %v, got %v", msg, expected.Points, actual.Points)
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
	if expected.Melee != actual.Melee {
		t.Errorf("%s: Expected melee %d, got %d", msg, expected.Melee, actual.Melee)
	}
	if expected.Ranged != actual.Ranged {
		t.Errorf("%s: Expected ranged %d, got %d", msg, expected.Ranged, actual.Ranged)
	}
	if expected.Morale != actual.Morale {
		t.Errorf("%s: Expected morale %d, got %d", msg, expected.Morale, actual.Morale)
	}
	if expected.Defense != actual.Defense {
		t.Errorf("%s: Expected defense %d, got %d", msg, expected.Defense, actual.Defense)
	}
	if !reflect.DeepEqual(expected.Points, actual.Points) {
		t.Errorf("%s: Expected points %v, got %v", msg, expected.Points, actual.Points)
	}
}

// AssertEqualArmyBooks compares two army books and fails the test if they're not equal
func AssertEqualArmyBooks(t *testing.T, expected, actual *models.ArmyBook, msg string) {
	if expected.Name != actual.Name {
		t.Errorf("%s: Expected name %s, got %s", msg, expected.Name, actual.Name)
	}
	if expected.FactionID != actual.FactionID {
		t.Errorf("%s: Expected faction ID %s, got %s", msg, expected.FactionID.Hex(), actual.FactionID.Hex())
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
	if expected.FactionID != actual.FactionID {
		t.Errorf("%s: Expected faction ID %s, got %s", msg, expected.FactionID.Hex(), actual.FactionID.Hex())
	}
	if !reflect.DeepEqual(expected.Points, actual.Points) {
		t.Errorf("%s: Expected points %v, got %v", msg, expected.Points, actual.Points)
	}
}

// AssertEqualFactions compares two factions and fails the test if they're not equal
func AssertEqualFactions(t *testing.T, expected, actual *models.Faction, msg string) {
	if expected.Name != actual.Name {
		t.Errorf("%s: Expected name %s, got %s", msg, expected.Name, actual.Name)
	}
	if expected.Description != actual.Description {
		t.Errorf("%s: Expected description %s, got %s", msg, expected.Description, actual.Description)
	}
	if expected.Type != actual.Type {
		t.Errorf("%s: Expected type %s, got %s", msg, expected.Type, actual.Type)
	}
}
