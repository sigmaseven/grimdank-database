package utils

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// ParseObjectID safely converts a string to primitive.ObjectID with error handling
func ParseObjectID(id string) (primitive.ObjectID, error) {
	return primitive.ObjectIDFromHex(id)
}

// MustParseObjectID converts a string to primitive.ObjectID and panics on error
// Use only when you're certain the ID is valid
func MustParseObjectID(id string) primitive.ObjectID {
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		panic("invalid ObjectID: " + id)
	}
	return objectID
}

// IsValidObjectID checks if a string is a valid ObjectID
func IsValidObjectID(id string) bool {
	_, err := primitive.ObjectIDFromHex(id)
	return err == nil
}
