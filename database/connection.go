package database

import (
	"context"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Database struct {
	Client   *mongo.Client
	Database *mongo.Database
}

func Connect(uri, dbName string, timeoutSeconds int) (*Database, error) {
	log.Printf("Attempting to connect to MongoDB...")
	log.Printf("URI: %s", maskURI(uri))
	log.Printf("Database: %s", dbName)
	log.Printf("Timeout: %d seconds", timeoutSeconds)

	ctx, cancel := context.WithTimeout(context.Background(), time.Duration(timeoutSeconds)*time.Second)
	defer cancel()

	// Create client options with better configuration
	clientOptions := options.Client().ApplyURI(uri)
	clientOptions.SetMaxPoolSize(10)
	clientOptions.SetMinPoolSize(5)
	clientOptions.SetMaxConnIdleTime(30 * time.Second)

	client, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		log.Printf("Failed to create MongoDB client: %v", err)
		return nil, err
	}

	// Test the connection
	err = client.Ping(ctx, nil)
	if err != nil {
		log.Printf("Failed to ping MongoDB: %v", err)
		return nil, err
	}

	log.Println("✅ Connected to MongoDB successfully")

	db := client.Database(dbName)
	return &Database{
		Client:   client,
		Database: db,
	}, nil
}

// maskURI masks sensitive parts of the MongoDB URI for logging
func maskURI(uri string) string {
	if len(uri) > 20 {
		return uri[:20] + "..."
	}
	return uri
}

func (db *Database) Disconnect() error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	return db.Client.Disconnect(ctx)
}

// Collection returns a collection from the database
func (db *Database) Collection(name string) *mongo.Collection {
	return db.Database.Collection(name)
}
