# Test Cleanup Guide

This guide explains the improved test cleanup system that ensures proper isolation and cleanup of test data.

## Overview

The test cleanup system has been enhanced to:
- Track all entities created during tests
- Provide granular cleanup options
- Ensure complete database isolation
- Prevent test data pollution
- Offer detailed cleanup reporting

## Key Components

### 1. TestCleanupManager

The `TestCleanupManager` is the main component for managing test cleanup:

```go
// Create a cleanup manager
cleanupManager := NewTestCleanupManager(t)

// Track entities as they're created
cleanupManager.TrackEntity("rules", ruleID)

// Clean up all tracked entities
cleanupManager.CleanupAll(t)

// Verify cleanup was successful
cleanupManager.VerifyCleanup(t)
```

### 2. Enhanced Setup Functions

The setup functions now provide better isolation:

```go
// Ensure complete database isolation
EnsureTestDatabaseIsolation(t)

// Get test database name
dbName := GetTestDatabaseName() // Returns "grimdank_test_db"

// Track created entities globally
TrackCreatedEntity("rules", ruleID)
```

## Usage Patterns

### Basic Test Pattern

```go
func TestEntityCRUD(t *testing.T) {
    // Setup with improved cleanup
    SetupTestServices(t)
    cleanupManager := NewTestCleanupManager(t)
    defer func() {
        cleanupManager.PrintCleanupReport(t)
        cleanupManager.CleanupAll(t)
        cleanupManager.VerifyCleanup(t)
    }()
    ctx := context.Background()

    t.Run("Create Entity", func(t *testing.T) {
        entity := CreateTestEntity()
        
        createdEntity, err := testServices.EntityService.CreateEntity(ctx, entity)
        if err != nil {
            t.Fatalf("Failed to create entity: %v", err)
        }

        // Track the created entity for cleanup
        cleanupManager.TrackEntity("entities", createdEntity.ID.Hex())
        
        // ... rest of test
    })
}
```

### Multiple Entities Pattern

```go
t.Run("Create Multiple Entities", func(t *testing.T) {
    entities := []*models.Entity{
        CreateTestEntityWithName("Entity 1"),
        CreateTestEntityWithName("Entity 2"),
        CreateTestEntityWithName("Entity 3"),
    }

    var createdIDs []string
    for _, entity := range entities {
        created, err := testServices.EntityService.CreateEntity(ctx, entity)
        if err != nil {
            t.Fatalf("Failed to create entity: %v", err)
        }
        createdIDs = append(createdIDs, created.ID.Hex())
    }

    // Track all created entities
    for _, entityID := range createdIDs {
        cleanupManager.TrackEntity("entities", entityID)
    }
})
```

### Collection-Specific Cleanup

```go
// Clean up only specific collections
cleanupManager.CleanupCollection(t, "rules")
cleanupManager.CleanupCollection(t, "weapons")

// Get entity count for verification
count := cleanupManager.GetEntityCount(t, "rules")
if count != 0 {
    t.Errorf("Expected 0 rules, got %d", count)
}
```

## Cleanup Methods

### 1. CleanupAll()

Removes all tracked entities from their respective collections:

```go
cleanupManager.CleanupAll(t)
```

**Features:**
- Deletes only tracked entities
- Uses efficient bulk delete operations
- Provides detailed logging
- Handles ObjectID conversion automatically

### 2. CleanupCollection()

Removes all entities from a specific collection:

```go
cleanupManager.CleanupCollection(t, "rules")
```

**Use Cases:**
- When you need to clean specific collections
- For targeted cleanup operations
- When testing collection-specific functionality

### 3. EnsureEmptyDatabase()

Completely empties the test database:

```go
cleanupManager.EnsureEmptyDatabase(t)
```

**Features:**
- Drops and recreates all collections
- Ensures complete isolation
- Clears all tracking data
- Use for tests requiring fresh database state

### 4. VerifyCleanup()

Verifies that all tracked entities have been removed:

```go
cleanupManager.VerifyCleanup(t)
```

**Features:**
- Checks that tracked entities no longer exist
- Reports any remaining entities
- Fails tests if cleanup was incomplete
- Provides detailed error messages

## Reporting and Debugging

### PrintCleanupReport()

Provides detailed information about what will be cleaned up:

```go
cleanupManager.PrintCleanupReport(t)
```

**Output Example:**
```
=== Cleanup Report ===
Collection rules: 3 entities to clean up
Collection weapons: 1 entities to clean up
Total entities to clean up: 4
=====================
```

### GetEntityCount()

Returns the number of entities in a collection:

```go
count := cleanupManager.GetEntityCount(t, "rules")
```

## Best Practices

### 1. Always Track Created Entities

```go
// ✅ Good - Track immediately after creation
createdEntity, err := service.CreateEntity(ctx, entity)
if err != nil {
    t.Fatalf("Failed to create entity: %v", err)
}
cleanupManager.TrackEntity("entities", createdEntity.ID.Hex())
```

### 2. Use Defer for Cleanup

```go
// ✅ Good - Use defer to ensure cleanup happens
defer func() {
    cleanupManager.CleanupAll(t)
    cleanupManager.VerifyCleanup(t)
}()
```

### 3. Verify Cleanup

```go
// ✅ Good - Always verify cleanup was successful
cleanupManager.VerifyCleanup(t)
```

### 4. Handle Cleanup Errors

```go
// ✅ Good - Handle cleanup errors gracefully
defer func() {
    if err := cleanupManager.CleanupAll(t); err != nil {
        t.Logf("Warning: Cleanup failed: %v", err)
    }
}()
```

## Test Database Isolation

### Database Naming

- **Test Database**: `grimdank_test_db`
- **Main Database**: `grimdank_db` (production/development)

### Collection Isolation

Test collections are completely separate from main application collections:

```
grimdank_test_db/
├── rules/          (test data only)
├── weapons/        (test data only)
├── wargear/        (test data only)
├── units/          (test data only)
├── armybooks/      (test data only)
└── armylists/      (test data only)
```

### Connection Management

```go
// Test database connection
testDB := SetupTestDB(t)
defer CleanupTestDBConnection(t)
```

## Error Handling

### Cleanup Failures

The cleanup system handles various failure scenarios:

```go
// Collection not found
if collection == nil {
    t.Logf("Warning: Collection %s not found", collectionName)
    continue
}

// Invalid ObjectID
if objectID, err := primitive.ObjectIDFromHex(idStr); err != nil {
    t.Logf("Warning: Invalid ObjectID %s: %v", idStr, err)
    continue
}

// Delete operation failed
if err != nil {
    t.Logf("Warning: Failed to delete entities from %s: %v", collectionName, err)
}
```

### Verification Failures

```go
// Check if entities still exist after cleanup
if count > 0 {
    t.Errorf("Cleanup verification failed: %d entities still exist in %s", count, collectionName)
}
```

## Performance Considerations

### Bulk Operations

The cleanup system uses bulk delete operations for efficiency:

```go
// Single delete operation for multiple entities
filter := bson.M{"_id": bson.M{"$in": objectIDs}}
result, err := collection.DeleteMany(ctx, filter)
```

### Timeout Management

All operations use appropriate timeouts:

```go
ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
defer cancel()
```

## Migration Guide

### From Old System

**Before:**
```go
func TestEntity(t *testing.T) {
    SetupTestServices(t)
    defer CleanupTestDB(t)
    // ... test code
}
```

**After:**
```go
func TestEntity(t *testing.T) {
    SetupTestServices(t)
    cleanupManager := NewTestCleanupManager(t)
    defer func() {
        cleanupManager.CleanupAll(t)
        cleanupManager.VerifyCleanup(t)
    }()
    // ... test code with tracking
    cleanupManager.TrackEntity("entities", entityID)
}
```

## Troubleshooting

### Common Issues

1. **Entities Not Cleaned Up**
   - Ensure `TrackEntity()` is called for each created entity
   - Check that cleanup is called in defer function
   - Verify ObjectID format is correct

2. **Cleanup Verification Fails**
   - Check for concurrent test execution
   - Verify database connection is stable
   - Ensure proper timeout settings

3. **Performance Issues**
   - Use bulk operations for multiple entities
   - Consider collection-specific cleanup
   - Monitor database connection pool

### Debug Mode

Enable verbose logging for debugging:

```go
// Add to test setup
t.Logf("Debug: Tracking %d entities in %s", len(entityIDs), collectionName)
```

## Conclusion

The improved cleanup system provides:
- **Reliability**: Ensures all test data is properly cleaned up
- **Isolation**: Prevents test data pollution
- **Transparency**: Detailed reporting of cleanup operations
- **Flexibility**: Multiple cleanup strategies for different scenarios
- **Performance**: Efficient bulk operations

This system ensures that tests are isolated, reliable, and don't interfere with each other or the main application database.
