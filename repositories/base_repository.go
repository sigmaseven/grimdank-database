package repositories

import (
	"context"
	"errors"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type BaseRepository struct {
	Collection *mongo.Collection
}

func NewBaseRepository(collection *mongo.Collection) *BaseRepository {
	return &BaseRepository{
		Collection: collection,
	}
}

func (r *BaseRepository) Create(ctx context.Context, document interface{}) (primitive.ObjectID, error) {
	result, err := r.Collection.InsertOne(ctx, document)
	if err != nil {
		return primitive.NilObjectID, err
	}
	return result.InsertedID.(primitive.ObjectID), nil
}

func (r *BaseRepository) GetByID(ctx context.Context, id primitive.ObjectID, result interface{}) error {
	filter := bson.M{"_id": id}
	err := r.Collection.FindOne(ctx, filter).Decode(result)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return errors.New("document not found")
		}
		return err
	}
	return nil
}

func (r *BaseRepository) GetAll(ctx context.Context, filter bson.M, results interface{}, limit, skip int64) error {
	opts := options.Find()
	if limit > 0 {
		opts.SetLimit(limit)
	}
	if skip > 0 {
		opts.SetSkip(skip)
	}

	cursor, err := r.Collection.Find(ctx, filter, opts)
	if err != nil {
		return err
	}
	defer cursor.Close(ctx)

	err = cursor.All(ctx, results)
	if err != nil {
		return err
	}

	// Ensure we return an empty slice instead of nil when no documents are found
	// This prevents frontend crashes when trying to map over the results
	return nil
}

func (r *BaseRepository) Update(ctx context.Context, id primitive.ObjectID, update interface{}) error {
	filter := bson.M{"_id": id}
	result, err := r.Collection.ReplaceOne(ctx, filter, update)
	if err != nil {
		return err
	}
	if result.MatchedCount == 0 {
		return errors.New("document not found")
	}
	return nil
}

func (r *BaseRepository) Delete(ctx context.Context, id primitive.ObjectID) error {
	filter := bson.M{"_id": id}
	result, err := r.Collection.DeleteOne(ctx, filter)
	if err != nil {
		return err
	}
	if result.DeletedCount == 0 {
		return errors.New("document not found")
	}
	return nil
}

func (r *BaseRepository) SearchByName(ctx context.Context, name string, results interface{}, limit, skip int64) error {
	filter := bson.M{
		"name": bson.M{
			"$regex":   name,
			"$options": "i",
		},
	}
	return r.GetAll(ctx, filter, results, limit, skip)
}

func (r *BaseRepository) BulkInsert(ctx context.Context, documents []interface{}) ([]primitive.ObjectID, error) {
	if len(documents) == 0 {
		return []primitive.ObjectID{}, nil
	}

	result, err := r.Collection.InsertMany(ctx, documents)
	if err != nil {
		return nil, err
	}

	insertedIDs := make([]primitive.ObjectID, len(result.InsertedIDs))
	for i, id := range result.InsertedIDs {
		insertedIDs[i] = id.(primitive.ObjectID)
	}

	return insertedIDs, nil
}
