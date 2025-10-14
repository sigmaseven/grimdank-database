package services

import (
	"context"
	"fmt"

	"go.mongodb.org/mongo-driver/bson/primitive"

	"grimdank-database/models"
	"grimdank-database/repositories"
)

type FactionService struct {
	repo *repositories.FactionRepository
}

func NewFactionService(repo *repositories.FactionRepository) *FactionService {
	return &FactionService{
		repo: repo,
	}
}

func (s *FactionService) CreateFaction(ctx context.Context, faction *models.Faction) (*models.Faction, error) {
	if faction.Name == "" {
		return nil, fmt.Errorf("faction name is required")
	}

	err := s.repo.CreateFaction(ctx, faction)
	if err != nil {
		return nil, fmt.Errorf("failed to create faction: %w", err)
	}

	return faction, nil
}

func (s *FactionService) GetFactionByID(ctx context.Context, id string) (*models.Faction, error) {
	faction, err := s.repo.GetFactionByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("faction not found: %w", err)
	}

	return faction, nil
}

func (s *FactionService) GetAllFactions(ctx context.Context, limit, skip int) ([]models.Faction, error) {
	factions, err := s.repo.GetAllFactions(ctx, limit, skip)
	if err != nil {
		return nil, fmt.Errorf("failed to get factions: %w", err)
	}

	return factions, nil
}

func (s *FactionService) SearchFactionsByName(ctx context.Context, name string, limit, skip int) ([]models.Faction, error) {
	factions, err := s.repo.SearchFactionsByName(ctx, name, limit, skip)
	if err != nil {
		return nil, fmt.Errorf("failed to search factions: %w", err)
	}

	return factions, nil
}

func (s *FactionService) UpdateFaction(ctx context.Context, id string, faction *models.Faction) error {
	if faction.Name == "" {
		return fmt.Errorf("faction name is required")
	}

	err := s.repo.UpdateFaction(ctx, id, faction)
	if err != nil {
		return fmt.Errorf("failed to update faction: %w", err)
	}

	return nil
}

func (s *FactionService) DeleteFaction(ctx context.Context, id string) error {
	err := s.repo.DeleteFaction(ctx, id)
	if err != nil {
		return fmt.Errorf("failed to delete faction: %w", err)
	}

	return nil
}

func (s *FactionService) BulkImportFactions(ctx context.Context, factions []models.Faction) ([]primitive.ObjectID, error) {
	importedIDs, err := s.repo.BulkImportFactions(ctx, factions)
	if err != nil {
		return nil, fmt.Errorf("failed to import factions: %w", err)
	}

	return importedIDs, nil
}
