package repositories

import (
	"context"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"grimdank-database/models"
)

type FactionRepository struct {
	collection *mongo.Collection
}

func NewFactionRepository(collection *mongo.Collection) *FactionRepository {
	return &FactionRepository{
		collection: collection,
	}
}

func (r *FactionRepository) CreateFaction(ctx context.Context, faction *models.Faction) error {
	faction.CreatedAt = time.Now()
	faction.UpdatedAt = time.Now()

	_, err := r.collection.InsertOne(ctx, faction)
	return err
}

func (r *FactionRepository) GetFactionByID(ctx context.Context, id string) (*models.Faction, error) {
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, err
	}

	var faction models.Faction
	err = r.collection.FindOne(ctx, bson.M{"_id": objectID}).Decode(&faction)
	if err != nil {
		return nil, err
	}

	return &faction, nil
}

func (r *FactionRepository) GetAllFactions(ctx context.Context, limit, skip int) ([]models.Faction, error) {
	opts := options.Find()
	if limit > 0 {
		opts.SetLimit(int64(limit))
	}
	if skip > 0 {
		opts.SetSkip(int64(skip))
	}
	opts.SetSort(bson.D{{Key: "name", Value: 1}})

	cursor, err := r.collection.Find(ctx, bson.M{}, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var factions []models.Faction
	if err = cursor.All(ctx, &factions); err != nil {
		return nil, err
	}

	return factions, nil
}

func (r *FactionRepository) SearchFactionsByName(ctx context.Context, name string, limit, skip int) ([]models.Faction, error) {
	opts := options.Find()
	if limit > 0 {
		opts.SetLimit(int64(limit))
	}
	if skip > 0 {
		opts.SetSkip(int64(skip))
	}
	opts.SetSort(bson.D{{Key: "name", Value: 1}})

	filter := bson.M{
		"name": bson.M{
			"$regex":   name,
			"$options": "i",
		},
	}

	cursor, err := r.collection.Find(ctx, filter, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var factions []models.Faction
	if err = cursor.All(ctx, &factions); err != nil {
		return nil, err
	}

	return factions, nil
}

func (r *FactionRepository) UpdateFaction(ctx context.Context, id string, faction *models.Faction) error {
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return err
	}

	faction.UpdatedAt = time.Now()
	_, err = r.collection.ReplaceOne(ctx, bson.M{"_id": objectID}, faction)
	return err
}

func (r *FactionRepository) DeleteFaction(ctx context.Context, id string) error {
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return err
	}

	_, err = r.collection.DeleteOne(ctx, bson.M{"_id": objectID})
	return err
}

func (r *FactionRepository) BulkImportFactions(ctx context.Context, factions []models.Faction) ([]primitive.ObjectID, error) {
	if len(factions) == 0 {
		return []primitive.ObjectID{}, nil
	}

	// Prepare documents for bulk insert
	docs := make([]interface{}, len(factions))
	now := time.Now()

	for i, faction := range factions {
		faction.CreatedAt = now
		faction.UpdatedAt = now
		docs[i] = faction
	}

	result, err := r.collection.InsertMany(ctx, docs)
	if err != nil {
		return nil, err
	}

	// Extract ObjectIDs from the result
	objectIDs := make([]primitive.ObjectID, len(result.InsertedIDs))
	for i, id := range result.InsertedIDs {
		objectIDs[i] = id.(primitive.ObjectID)
	}

	return objectIDs, nil
}
