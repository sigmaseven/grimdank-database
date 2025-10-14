package tests

import (
	"context"
	"testing"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// TestCleanupManager manages cleanup operations for tests
type TestCleanupManager struct {
	createdEntities map[string][]string
	testDB          *TestDB
}

// NewTestCleanupManager creates a new cleanup manager
func NewTestCleanupManager(t *testing.T) *TestCleanupManager {
	if testDB == nil {
		SetupTestDB(t)
	}

	return &TestCleanupManager{
		createdEntities: make(map[string][]string),
		testDB:          testDB,
	}
}

// TrackEntity tracks an entity for cleanup
func (tcm *TestCleanupManager) TrackEntity(collectionName, entityID string) {
	if tcm.createdEntities[collectionName] == nil {
		tcm.createdEntities[collectionName] = make([]string, 0)
	}
	tcm.createdEntities[collectionName] = append(tcm.createdEntities[collectionName], entityID)
}

// CleanupAll removes all tracked entities
func (tcm *TestCleanupManager) CleanupAll(t *testing.T) {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	for collectionName, entityIDs := range tcm.createdEntities {
		if len(entityIDs) == 0 {
			continue
		}

		collection := tcm.testDB.Collections[collectionName]
		if collection == nil {
			t.Logf("Warning: Collection %s not found", collectionName)
			continue
		}

		// Convert string IDs to ObjectIDs
		objectIDs := make([]primitive.ObjectID, 0, len(entityIDs))
		for _, idStr := range entityIDs {
			if objectID, err := primitive.ObjectIDFromHex(idStr); err == nil {
				objectIDs = append(objectIDs, objectID)
			} else {
				t.Logf("Warning: Invalid ObjectID %s: %v", idStr, err)
			}
		}

		if len(objectIDs) > 0 {
			// Delete all tracked entities in one operation
			filter := bson.M{"_id": bson.M{"$in": objectIDs}}
			result, err := collection.DeleteMany(ctx, filter)
			if err != nil {
				t.Logf("Warning: Failed to delete entities from %s: %v", collectionName, err)
			} else {
				t.Logf("Cleaned up %d entities from %s", result.DeletedCount, collectionName)
			}
		}
	}

	// Clear the tracking map
	tcm.createdEntities = make(map[string][]string)
}

// CleanupCollection removes all entities from a specific collection
func (tcm *TestCleanupManager) CleanupCollection(t *testing.T, collectionName string) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	collection := tcm.testDB.Collections[collectionName]
	if collection == nil {
		t.Logf("Warning: Collection %s not found", collectionName)
		return
	}

	// Delete all documents in the collection
	result, err := collection.DeleteMany(ctx, bson.M{})
	if err != nil {
		t.Logf("Warning: Failed to clean collection %s: %v", collectionName, err)
	} else {
		t.Logf("Cleaned up %d entities from %s", result.DeletedCount, collectionName)
	}

	// Remove from tracking
	delete(tcm.createdEntities, collectionName)
}

// VerifyCleanup verifies that all tracked entities have been removed
func (tcm *TestCleanupManager) VerifyCleanup(t *testing.T) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	for collectionName, entityIDs := range tcm.createdEntities {
		if len(entityIDs) == 0 {
			continue
		}

		collection := tcm.testDB.Collections[collectionName]
		if collection == nil {
			continue
		}

		// Convert string IDs to ObjectIDs
		objectIDs := make([]primitive.ObjectID, 0, len(entityIDs))
		for _, idStr := range entityIDs {
			if objectID, err := primitive.ObjectIDFromHex(idStr); err == nil {
				objectIDs = append(objectIDs, objectID)
			}
		}

		if len(objectIDs) > 0 {
			// Check if any entities still exist
			filter := bson.M{"_id": bson.M{"$in": objectIDs}}
			count, err := collection.CountDocuments(ctx, filter)
			if err != nil {
				t.Logf("Warning: Failed to count documents in %s: %v", collectionName, err)
			} else if count > 0 {
				t.Errorf("Cleanup verification failed: %d entities still exist in %s", count, collectionName)
			}
		}
	}
}

// GetEntityCount returns the number of entities in a collection
func (tcm *TestCleanupManager) GetEntityCount(t *testing.T, collectionName string) int {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	collection := tcm.testDB.Collections[collectionName]
	if collection == nil {
		t.Logf("Warning: Collection %s not found", collectionName)
		return 0
	}

	count, err := collection.CountDocuments(ctx, bson.M{})
	if err != nil {
		t.Logf("Warning: Failed to count documents in %s: %v", collectionName, err)
		return 0
	}

	return int(count)
}

// GetTrackedEntities returns the list of tracked entity IDs for a collection
func (tcm *TestCleanupManager) GetTrackedEntities(collectionName string) []string {
	return tcm.createdEntities[collectionName]
}

// EnsureEmptyDatabase ensures the test database is completely empty
func (tcm *TestCleanupManager) EnsureEmptyDatabase(t *testing.T) {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	for _, collectionName := range testCollectionNames {
		collection := tcm.testDB.Collections[collectionName]
		if collection == nil {
			continue
		}

		// Drop and recreate the collection
		err := collection.Drop(ctx)
		if err != nil {
			t.Logf("Warning: Failed to drop collection %s: %v", collectionName, err)
		}

		// Recreate the collection
		tcm.testDB.Collections[collectionName] = tcm.testDB.Database.Collection(collectionName)
	}

	// Clear tracking
	tcm.createdEntities = make(map[string][]string)
}

// PrintCleanupReport prints a report of what will be cleaned up
func (tcm *TestCleanupManager) PrintCleanupReport(t *testing.T) {
	t.Log("=== Cleanup Report ===")
	totalEntities := 0

	for collectionName, entityIDs := range tcm.createdEntities {
		if len(entityIDs) > 0 {
			t.Logf("Collection %s: %d entities to clean up", collectionName, len(entityIDs))
			totalEntities += len(entityIDs)
		}
	}

	if totalEntities == 0 {
		t.Log("No entities tracked for cleanup")
	} else {
		t.Logf("Total entities to clean up: %d", totalEntities)
	}
	t.Log("=====================")
}
