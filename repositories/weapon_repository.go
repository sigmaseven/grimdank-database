package repositories

import (
	"context"
	"grimdank-database/models"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type WeaponRepository struct {
	*BaseRepository
}

func NewWeaponRepository(collection *mongo.Collection) *WeaponRepository {
	return &WeaponRepository{
		BaseRepository: NewBaseRepository(collection),
	}
}

func (r *WeaponRepository) CreateWeapon(ctx context.Context, weapon *models.Weapon) (string, error) {
	id, err := r.Create(ctx, weapon)
	if err != nil {
		return "", err
	}
	weapon.ID = id
	return id.Hex(), nil
}

func (r *WeaponRepository) GetWeaponByID(ctx context.Context, id string) (*models.Weapon, error) {
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, err
	}

	var weapon models.Weapon
	err = r.GetByID(ctx, objectID, &weapon)
	if err != nil {
		return nil, err
	}
	return &weapon, nil
}

func (r *WeaponRepository) GetAllWeapons(ctx context.Context, limit, skip int64) ([]models.Weapon, error) {
	var weapons []models.Weapon
	err := r.GetAll(ctx, bson.M{}, &weapons, limit, skip)
	return weapons, err
}

func (r *WeaponRepository) SearchWeaponsByName(ctx context.Context, name string, limit, skip int64) ([]models.Weapon, error) {
	var weapons []models.Weapon
	err := r.SearchByName(ctx, name, &weapons, limit, skip)
	return weapons, err
}

func (r *WeaponRepository) UpdateWeapon(ctx context.Context, id string, weapon *models.Weapon) error {
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return err
	}
	weapon.ID = objectID
	return r.Update(ctx, objectID, weapon)
}

func (r *WeaponRepository) DeleteWeapon(ctx context.Context, id string) error {
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return err
	}
	return r.Delete(ctx, objectID)
}
