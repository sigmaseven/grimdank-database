package services

import (
	"context"
	"errors"
	"fmt"
	"grimdank-database/models"
	"grimdank-database/repositories"
	"strings"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Weapon Service
type WeaponService struct {
	repo *repositories.WeaponRepository
}

func NewWeaponService(repo *repositories.WeaponRepository) *WeaponService {
	return &WeaponService{
		repo: repo,
	}
}

func (s *WeaponService) CreateWeapon(ctx context.Context, weapon *models.Weapon) (*models.Weapon, error) {
	if strings.TrimSpace(weapon.Name) == "" {
		return nil, errors.New("name is required")
	}

	// Validate weapon type (only "melee" or "ranged" allowed)
	weaponType := strings.ToLower(strings.TrimSpace(weapon.Type))
	if weaponType != "melee" && weaponType != "ranged" {
		return nil, errors.New("weapon type must be either 'melee' or 'ranged'")
	}
	weapon.Type = weaponType // Normalize to lowercase

	id, err := s.repo.CreateWeapon(ctx, weapon)
	if err != nil {
		return nil, err
	}
	weapon.ID, _ = primitive.ObjectIDFromHex(id)
	return weapon, nil
}

func (s *WeaponService) GetWeaponByID(ctx context.Context, id string) (*models.Weapon, error) {
	return s.repo.GetWeaponByID(ctx, id)
}

func (s *WeaponService) GetAllWeapons(ctx context.Context, limit, skip int64) ([]models.Weapon, error) {
	return s.repo.GetAllWeapons(ctx, limit, skip)
}

func (s *WeaponService) SearchWeaponsByName(ctx context.Context, name string, limit, skip int64) ([]models.Weapon, error) {
	return s.repo.SearchWeaponsByName(ctx, name, limit, skip)
}

func (s *WeaponService) UpdateWeapon(ctx context.Context, id string, weapon *models.Weapon) error {
	if strings.TrimSpace(weapon.Name) == "" {
		return errors.New("name is required")
	}

	// Validate weapon type (only "melee" or "ranged" allowed)
	weaponType := strings.ToLower(strings.TrimSpace(weapon.Type))
	if weaponType != "melee" && weaponType != "ranged" {
		return errors.New("weapon type must be either 'melee' or 'ranged'")
	}
	weapon.Type = weaponType // Normalize to lowercase

	return s.repo.UpdateWeapon(ctx, id, weapon)
}

func (s *WeaponService) DeleteWeapon(ctx context.Context, id string) error {
	return s.repo.DeleteWeapon(ctx, id)
}

func (s *WeaponService) CountWeapons(ctx context.Context) (int64, error) {
	return s.repo.CountWeapons(ctx)
}

func (s *WeaponService) CountWeaponsByName(ctx context.Context, name string) (int64, error) {
	return s.repo.CountWeaponsByName(ctx, name)
}

func (s *WeaponService) BulkImportWeapons(ctx context.Context, weapons []models.Weapon) ([]string, error) {
	// Validate all weapons before importing
	for i, weapon := range weapons {
		if strings.TrimSpace(weapon.Name) == "" {
			return nil, fmt.Errorf("weapon at index %d has empty name", i)
		}
		// Validate and normalize weapon type
		weaponType := strings.ToLower(strings.TrimSpace(weapon.Type))
		if weaponType != "melee" && weaponType != "ranged" {
			return nil, fmt.Errorf("weapon at index %d has invalid type '%s': must be 'melee' or 'ranged'", i, weapon.Type)
		}
		weapons[i].Type = weaponType // Normalize to lowercase
	}

	return s.repo.BulkImportWeapons(ctx, weapons)
}

// WarGear Service
type WarGearService struct {
	repo *repositories.WarGearRepository
}

func NewWarGearService(repo *repositories.WarGearRepository) *WarGearService {
	return &WarGearService{
		repo: repo,
	}
}

func (s *WarGearService) CreateWarGear(ctx context.Context, wargear *models.WarGear) (*models.WarGear, error) {
	if strings.TrimSpace(wargear.Name) == "" {
		return nil, errors.New("name is required")
	}

	id, err := s.repo.CreateWarGear(ctx, wargear)
	if err != nil {
		return nil, err
	}
	wargear.ID, _ = primitive.ObjectIDFromHex(id)
	return wargear, nil
}

func (s *WarGearService) GetWarGearByID(ctx context.Context, id string) (*models.WarGear, error) {
	return s.repo.GetWarGearByID(ctx, id)
}

func (s *WarGearService) GetAllWarGear(ctx context.Context, limit, skip int64) ([]models.WarGear, error) {
	return s.repo.GetAllWarGear(ctx, limit, skip)
}

func (s *WarGearService) SearchWarGearByName(ctx context.Context, name string, limit, skip int64) ([]models.WarGear, error) {
	return s.repo.SearchWarGearByName(ctx, name, limit, skip)
}

func (s *WarGearService) UpdateWarGear(ctx context.Context, id string, wargear *models.WarGear) error {
	if strings.TrimSpace(wargear.Name) == "" {
		return errors.New("name is required")
	}

	return s.repo.UpdateWarGear(ctx, id, wargear)
}

func (s *WarGearService) DeleteWarGear(ctx context.Context, id string) error {
	return s.repo.DeleteWarGear(ctx, id)
}

func (s *WarGearService) BulkImportWarGear(ctx context.Context, wargear []models.WarGear) ([]string, error) {
	// Validate all wargear before importing
	for i, item := range wargear {
		if strings.TrimSpace(item.Name) == "" {
			return nil, fmt.Errorf("wargear at index %d has empty name", i)
		}
	}

	return s.repo.BulkImportWarGear(ctx, wargear)
}

// Unit Service
type UnitService struct {
	repo *repositories.UnitRepository
}

func NewUnitService(repo *repositories.UnitRepository) *UnitService {
	return &UnitService{
		repo: repo,
	}
}

func (s *UnitService) CreateUnit(ctx context.Context, unit *models.Unit) (*models.Unit, error) {
	if strings.TrimSpace(unit.Name) == "" {
		return nil, errors.New("name is required")
	}

	id, err := s.repo.CreateUnit(ctx, unit)
	if err != nil {
		return nil, err
	}
	unit.ID, _ = primitive.ObjectIDFromHex(id)
	return unit, nil
}

func (s *UnitService) GetUnitByID(ctx context.Context, id string) (*models.Unit, error) {
	return s.repo.GetUnitByID(ctx, id)
}

func (s *UnitService) GetAllUnits(ctx context.Context, limit, skip int64) ([]models.Unit, error) {
	return s.repo.GetAllUnits(ctx, limit, skip)
}

func (s *UnitService) SearchUnitsByName(ctx context.Context, name string, limit, skip int64) ([]models.Unit, error) {
	return s.repo.SearchUnitsByName(ctx, name, limit, skip)
}

func (s *UnitService) UpdateUnit(ctx context.Context, id string, unit *models.Unit) error {
	if strings.TrimSpace(unit.Name) == "" {
		return errors.New("name is required")
	}

	return s.repo.UpdateUnit(ctx, id, unit)
}

func (s *UnitService) DeleteUnit(ctx context.Context, id string) error {
	return s.repo.DeleteUnit(ctx, id)
}

func (s *UnitService) BulkImportUnits(ctx context.Context, units []models.Unit) ([]string, error) {
	// Validate all units before importing
	for i, unit := range units {
		if strings.TrimSpace(unit.Name) == "" {
			return nil, fmt.Errorf("unit at index %d has empty name", i)
		}
	}

	return s.repo.BulkImportUnits(ctx, units)
}

// ArmyBook Service
type ArmyBookService struct {
	repo *repositories.ArmyBookRepository
}

func NewArmyBookService(repo *repositories.ArmyBookRepository) *ArmyBookService {
	return &ArmyBookService{
		repo: repo,
	}
}

func (s *ArmyBookService) CreateArmyBook(ctx context.Context, armyBook *models.ArmyBook) (*models.ArmyBook, error) {
	if strings.TrimSpace(armyBook.Name) == "" {
		return nil, errors.New("name is required")
	}

	id, err := s.repo.CreateArmyBook(ctx, armyBook)
	if err != nil {
		return nil, err
	}
	armyBook.ID, _ = primitive.ObjectIDFromHex(id)
	return armyBook, nil
}

func (s *ArmyBookService) GetArmyBookByID(ctx context.Context, id string) (*models.ArmyBook, error) {
	return s.repo.GetArmyBookByID(ctx, id)
}

func (s *ArmyBookService) GetAllArmyBooks(ctx context.Context, limit, skip int64) ([]models.ArmyBook, error) {
	return s.repo.GetAllArmyBooks(ctx, limit, skip)
}

func (s *ArmyBookService) SearchArmyBooksByName(ctx context.Context, name string, limit, skip int64) ([]models.ArmyBook, error) {
	return s.repo.SearchArmyBooksByName(ctx, name, limit, skip)
}

func (s *ArmyBookService) UpdateArmyBook(ctx context.Context, id string, armyBook *models.ArmyBook) error {
	if strings.TrimSpace(armyBook.Name) == "" {
		return errors.New("name is required")
	}

	return s.repo.UpdateArmyBook(ctx, id, armyBook)
}

func (s *ArmyBookService) DeleteArmyBook(ctx context.Context, id string) error {
	return s.repo.DeleteArmyBook(ctx, id)
}

func (s *ArmyBookService) BulkImportArmyBooks(ctx context.Context, armyBooks []models.ArmyBook) ([]string, error) {
	// Validate all army books before importing
	for i, armyBook := range armyBooks {
		if strings.TrimSpace(armyBook.Name) == "" {
			return nil, fmt.Errorf("army book at index %d has empty name", i)
		}
	}

	return s.repo.BulkImportArmyBooks(ctx, armyBooks)
}

// ArmyList Service
type ArmyListService struct {
	repo *repositories.ArmyListRepository
}

func NewArmyListService(repo *repositories.ArmyListRepository) *ArmyListService {
	return &ArmyListService{
		repo: repo,
	}
}

func (s *ArmyListService) CreateArmyList(ctx context.Context, armyList *models.ArmyList) (*models.ArmyList, error) {
	if strings.TrimSpace(armyList.Name) == "" {
		return nil, errors.New("name is required")
	}

	id, err := s.repo.CreateArmyList(ctx, armyList)
	if err != nil {
		return nil, err
	}
	armyList.ID, _ = primitive.ObjectIDFromHex(id)
	return armyList, nil
}

func (s *ArmyListService) GetArmyListByID(ctx context.Context, id string) (*models.ArmyList, error) {
	return s.repo.GetArmyListByID(ctx, id)
}

func (s *ArmyListService) GetAllArmyLists(ctx context.Context, limit, skip int64) ([]models.ArmyList, error) {
	return s.repo.GetAllArmyLists(ctx, limit, skip)
}

func (s *ArmyListService) SearchArmyListsByName(ctx context.Context, name string, limit, skip int64) ([]models.ArmyList, error) {
	return s.repo.SearchArmyListsByName(ctx, name, limit, skip)
}

func (s *ArmyListService) UpdateArmyList(ctx context.Context, id string, armyList *models.ArmyList) error {
	if strings.TrimSpace(armyList.Name) == "" {
		return errors.New("name is required")
	}

	return s.repo.UpdateArmyList(ctx, id, armyList)
}

func (s *ArmyListService) DeleteArmyList(ctx context.Context, id string) error {
	return s.repo.DeleteArmyList(ctx, id)
}

func (s *ArmyListService) BulkImportArmyLists(ctx context.Context, armyLists []models.ArmyList) ([]string, error) {
	// Validate all army lists before importing
	for i, armyList := range armyLists {
		if strings.TrimSpace(armyList.Name) == "" {
			return nil, fmt.Errorf("army list at index %d has empty name", i)
		}
	}

	return s.repo.BulkImportArmyLists(ctx, armyLists)
}
