# Grimdank Database Test Suite

This directory contains comprehensive unit tests for all CRUD operations across all entity types in the Grimdank Database application.

## Test Structure

The test suite is organized as follows:

- `setup_test.go` - Test setup, utilities, and helper functions
- `rule_crud_test.go` - Rule entity CRUD tests
- `weapon_crud_test.go` - Weapon entity CRUD tests
- `wargear_crud_test.go` - WarGear entity CRUD tests
- `unit_crud_test.go` - Unit entity CRUD tests
- `armybook_crud_test.go` - ArmyBook entity CRUD tests
- `armylist_crud_test.go` - ArmyList entity CRUD tests
- `integration_test.go` - Integration tests across all entities
- `run_tests.go` - Test runner utility

## Test Coverage

Each entity type has comprehensive tests covering:

### CRUD Operations
- ✅ **Create** - Create new entities with valid data
- ✅ **Read** - Retrieve entities by ID and get all entities
- ✅ **Update** - Update existing entities with new data
- ✅ **Delete** - Remove entities from the database

### Validation Tests
- ✅ **Required Fields** - Test validation of required fields (e.g., name)
- ✅ **Empty Names** - Test rejection of entities with empty names
- ✅ **Invalid IDs** - Test handling of invalid ObjectIDs
- ✅ **Non-existent Entities** - Test operations on non-existent entities

### Search and Pagination
- ✅ **Search by Name** - Test case-insensitive name searching
- ✅ **Pagination** - Test limit and skip parameters
- ✅ **Empty Results** - Test handling of empty result sets

### Bulk Operations
- ✅ **Bulk Import** - Test importing multiple entities at once
- ✅ **Bulk Validation** - Test validation of bulk import data
- ✅ **Empty Bulk Lists** - Test handling of empty bulk import lists

### Integration Tests
- ✅ **Cross-Entity Operations** - Test operations across multiple entity types
- ✅ **Bulk Import Integration** - Test bulk importing all entity types
- ✅ **Search Integration** - Test searching across all entity types
- ✅ **Pagination Integration** - Test pagination across all entity types

## Running Tests

### Prerequisites

1. **Go 1.19+** - Required for running tests
2. **MongoDB** - Test database (can use Docker)
3. **Docker** - For running MongoDB in container

### Quick Start

```bash
# Run all tests
make test

# Run tests with coverage
make test-cover

# Run specific entity tests
make test-rules
make test-weapons
make test-wargear
make test-units
make test-armybooks
make test-armylists

# Run integration tests
make test-integration
```

### Using Go Test Directly

```bash
# Run all tests
go test ./tests/... -v

# Run with coverage
go test ./tests/... -v -cover -coverprofile=coverage.out

# Run specific test
go test ./tests/... -v -run="TestRuleCRUD"

# Run with race detection
go test ./tests/... -v -race

# Run with timeout
go test ./tests/... -v -timeout=10m
```

### Test Environment Setup

The tests use a separate test database to avoid interfering with development data:

```bash
# Environment variable for test database (same as main application)
export MONGODB_URI="mongodb://localhost:27017"
# Test database name is automatically set to grimdank_test_db
```

## Test Configuration

### Database Configuration

Tests automatically:
- Connect to MongoDB (default: `mongodb://localhost:27017`)
- Use test database: `grimdank_test_db`
- Clean up test data after each test
- Handle connection timeouts and errors

### Test Data

Each test creates its own test data using helper functions:
- `CreateTestRule()` - Creates a test rule
- `CreateTestWeapon()` - Creates a test weapon
- `CreateTestWarGear()` - Creates a test wargear item
- `CreateTestUnit()` - Creates a test unit
- `CreateTestArmyBook()` - Creates a test army book
- `CreateTestArmyList()` - Creates a test army list

### Assertion Helpers

Custom assertion functions for comparing entities:
- `AssertEqualRules()` - Compare rule entities
- `AssertEqualWeapons()` - Compare weapon entities
- `AssertEqualWarGear()` - Compare wargear entities
- `AssertEqualUnits()` - Compare unit entities
- `AssertEqualArmyBooks()` - Compare army book entities
- `AssertEqualArmyLists()` - Compare army list entities

## Test Patterns

### CRUD Test Pattern

Each entity follows this test pattern:

```go
func TestEntityCRUD(t *testing.T) {
    // Setup
    SetupTestServices(t)
    defer CleanupTestDB(t)
    ctx := context.Background()

    t.Run("Create Entity", func(t *testing.T) {
        // Test entity creation
    })

    t.Run("Get Entity By ID", func(t *testing.T) {
        // Test entity retrieval
    })

    t.Run("Get All Entities", func(t *testing.T) {
        // Test getting all entities
    })

    t.Run("Search Entities By Name", func(t *testing.T) {
        // Test name-based search
    })

    t.Run("Update Entity", func(t *testing.T) {
        // Test entity updates
    })

    t.Run("Delete Entity", func(t *testing.T) {
        // Test entity deletion
    })

    // ... validation and error tests
}
```

### Integration Test Pattern

Integration tests verify cross-entity functionality:

```go
func TestIntegrationCRUD(t *testing.T) {
    // Setup
    SetupTestServices(t)
    defer CleanupTestDB(t)
    ctx := context.Background()

    t.Run("Complete CRUD Workflow", func(t *testing.T) {
        // Test complete workflow across all entities
    })
}
```

## Continuous Integration

The test suite is designed to work with CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    services:
      mongodb:
        image: mongo:latest
        ports:
          - 27017:27017
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-go@v3
        with:
          go-version: '1.19'
      - run: make test-cover
```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Ensure MongoDB is running
   - Check connection string
   - Verify network connectivity

2. **Test Timeout**
   - Increase timeout: `go test -timeout=30m`
   - Check database performance
   - Verify test data size

3. **Race Conditions**
   - Run with race detection: `go test -race`
   - Check for concurrent access issues
   - Verify proper cleanup

4. **Memory Issues**
   - Check for memory leaks in tests
   - Verify proper cleanup of resources
   - Monitor test database size

### Debug Mode

Run tests with verbose output for debugging:

```bash
go test ./tests/... -v -timeout=30m
```

### Test Database Cleanup

If tests fail and leave data in the test database:

```bash
# Connect to MongoDB and clean test database
mongo grimdank_test_db --eval "db.dropDatabase()"
```

## Contributing

When adding new tests:

1. Follow the existing test patterns
2. Add comprehensive error case testing
3. Include integration tests for new features
4. Update this README with new test categories
5. Ensure tests are deterministic and isolated

## Performance Considerations

- Tests use connection pooling for efficiency
- Database cleanup happens after each test
- Bulk operations are tested for performance
- Pagination tests verify scalability
- Integration tests verify real-world scenarios
