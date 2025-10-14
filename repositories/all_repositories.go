package repositories

import (
	"context"
	"grimdank-database/models"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

// WarGear Repository
type WarGearRepository struct {
	*BaseRepository
}

func NewWarGearRepository(collection *mongo.Collection) *WarGearRepository {
	return &WarGearRepository{
		BaseRepository: NewBaseRepository(collection),
	}
}

func (r *WarGearRepository) CreateWarGear(ctx context.Context, wargear *models.WarGear) (string, error) {
	id, err := r.Create(ctx, wargear)
	if err != nil {
		return "", err
	}
	wargear.ID = id
	return id.Hex(), nil
}

func (r *WarGearRepository) GetWarGearByID(ctx context.Context, id string) (*models.WarGear, error) {
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, err
	}

	var wargear models.WarGear
	err = r.GetByID(ctx, objectID, &wargear)
	if err != nil {
		return nil, err
	}
	return &wargear, nil
}

func (r *WarGearRepository) GetAllWarGear(ctx context.Context, limit, skip int64) ([]models.WarGear, error) {
	wargear := make([]models.WarGear, 0)
	err := r.GetAll(ctx, bson.M{}, &wargear, limit, skip)
	if err != nil {
		return nil, err
	}
	if wargear == nil {
		wargear = make([]models.WarGear, 0)
	}
	return wargear, nil
}

func (r *WarGearRepository) SearchWarGearByName(ctx context.Context, name string, limit, skip int64) ([]models.WarGear, error) {
	wargear := make([]models.WarGear, 0)
	err := r.SearchByName(ctx, name, &wargear, limit, skip)
	if err != nil {
		return nil, err
	}
	if wargear == nil {
		wargear = make([]models.WarGear, 0)
	}
	return wargear, nil
}

func (r *WarGearRepository) UpdateWarGear(ctx context.Context, id string, wargear *models.WarGear) error {
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return err
	}
	wargear.ID = objectID
	return r.Update(ctx, objectID, wargear)
}

func (r *WarGearRepository) DeleteWarGear(ctx context.Context, id string) error {
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return err
	}
	return r.Delete(ctx, objectID)
}

// Unit Repository
type UnitRepository struct {
	*BaseRepository
}

func NewUnitRepository(collection *mongo.Collection) *UnitRepository {
	return &UnitRepository{
		BaseRepository: NewBaseRepository(collection),
	}
}

func (r *UnitRepository) CreateUnit(ctx context.Context, unit *models.Unit) (string, error) {
	id, err := r.Create(ctx, unit)
	if err != nil {
		return "", err
	}
	unit.ID = id
	return id.Hex(), nil
}

func (r *UnitRepository) GetUnitByID(ctx context.Context, id string) (*models.Unit, error) {
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, err
	}

	var unit models.Unit
	err = r.GetByID(ctx, objectID, &unit)
	if err != nil {
		return nil, err
	}
	return &unit, nil
}

func (r *UnitRepository) GetAllUnits(ctx context.Context, limit, skip int64) ([]models.Unit, error) {
	units := make([]models.Unit, 0)
	err := r.GetAll(ctx, bson.M{}, &units, limit, skip)
	if err != nil {
		return nil, err
	}
	if units == nil {
		units = make([]models.Unit, 0)
	}
	return units, nil
}

func (r *UnitRepository) SearchUnitsByName(ctx context.Context, name string, limit, skip int64) ([]models.Unit, error) {
	units := make([]models.Unit, 0)
	err := r.SearchByName(ctx, name, &units, limit, skip)
	if err != nil {
		return nil, err
	}
	if units == nil {
		units = make([]models.Unit, 0)
	}
	return units, nil
}

func (r *UnitRepository) UpdateUnit(ctx context.Context, id string, unit *models.Unit) error {
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return err
	}
	unit.ID = objectID
	return r.Update(ctx, objectID, unit)
}

func (r *UnitRepository) DeleteUnit(ctx context.Context, id string) error {
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return err
	}
	return r.Delete(ctx, objectID)
}

// ArmyBook Repository
type ArmyBookRepository struct {
	*BaseRepository
}

func NewArmyBookRepository(collection *mongo.Collection) *ArmyBookRepository {
	return &ArmyBookRepository{
		BaseRepository: NewBaseRepository(collection),
	}
}

func (r *ArmyBookRepository) CreateArmyBook(ctx context.Context, armyBook *models.ArmyBook) (string, error) {
	id, err := r.Create(ctx, armyBook)
	if err != nil {
		return "", err
	}
	armyBook.ID = id
	return id.Hex(), nil
}

func (r *ArmyBookRepository) GetArmyBookByID(ctx context.Context, id string) (*models.ArmyBook, error) {
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, err
	}

	var armyBook models.ArmyBook
	err = r.GetByID(ctx, objectID, &armyBook)
	if err != nil {
		return nil, err
	}
	return &armyBook, nil
}

func (r *ArmyBookRepository) GetAllArmyBooks(ctx context.Context, limit, skip int64) ([]models.ArmyBook, error) {
	armyBooks := make([]models.ArmyBook, 0)
	err := r.GetAll(ctx, bson.M{}, &armyBooks, limit, skip)
	if err != nil {
		return nil, err
	}
	if armyBooks == nil {
		armyBooks = make([]models.ArmyBook, 0)
	}
	return armyBooks, nil
}

func (r *ArmyBookRepository) SearchArmyBooksByName(ctx context.Context, name string, limit, skip int64) ([]models.ArmyBook, error) {
	armyBooks := make([]models.ArmyBook, 0)
	err := r.SearchByName(ctx, name, &armyBooks, limit, skip)
	if err != nil {
		return nil, err
	}
	if armyBooks == nil {
		armyBooks = make([]models.ArmyBook, 0)
	}
	return armyBooks, nil
}

func (r *ArmyBookRepository) UpdateArmyBook(ctx context.Context, id string, armyBook *models.ArmyBook) error {
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return err
	}
	armyBook.ID = objectID
	return r.Update(ctx, objectID, armyBook)
}

func (r *ArmyBookRepository) DeleteArmyBook(ctx context.Context, id string) error {
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return err
	}
	return r.Delete(ctx, objectID)
}

// ArmyList Repository
type ArmyListRepository struct {
	*BaseRepository
}

func NewArmyListRepository(collection *mongo.Collection) *ArmyListRepository {
	return &ArmyListRepository{
		BaseRepository: NewBaseRepository(collection),
	}
}

func (r *ArmyListRepository) CreateArmyList(ctx context.Context, armyList *models.ArmyList) (string, error) {
	id, err := r.Create(ctx, armyList)
	if err != nil {
		return "", err
	}
	armyList.ID = id
	return id.Hex(), nil
}

func (r *ArmyListRepository) GetArmyListByID(ctx context.Context, id string) (*models.ArmyList, error) {
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, err
	}

	var armyList models.ArmyList
	err = r.GetByID(ctx, objectID, &armyList)
	if err != nil {
		return nil, err
	}
	return &armyList, nil
}

func (r *ArmyListRepository) GetAllArmyLists(ctx context.Context, limit, skip int64) ([]models.ArmyList, error) {
	armyLists := make([]models.ArmyList, 0)
	err := r.GetAll(ctx, bson.M{}, &armyLists, limit, skip)
	if err != nil {
		return nil, err
	}
	if armyLists == nil {
		armyLists = make([]models.ArmyList, 0)
	}
	return armyLists, nil
}

func (r *ArmyListRepository) SearchArmyListsByName(ctx context.Context, name string, limit, skip int64) ([]models.ArmyList, error) {
	armyLists := make([]models.ArmyList, 0)
	err := r.SearchByName(ctx, name, &armyLists, limit, skip)
	if err != nil {
		return nil, err
	}
	if armyLists == nil {
		armyLists = make([]models.ArmyList, 0)
	}
	return armyLists, nil
}

func (r *ArmyListRepository) UpdateArmyList(ctx context.Context, id string, armyList *models.ArmyList) error {
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return err
	}
	armyList.ID = objectID
	return r.Update(ctx, objectID, armyList)
}

func (r *ArmyListRepository) DeleteArmyList(ctx context.Context, id string) error {
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return err
	}
	return r.Delete(ctx, objectID)
}
