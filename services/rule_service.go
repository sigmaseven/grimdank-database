package services

import (
	"context"
	"errors"
	"grimdank-database/models"
	"grimdank-database/repositories"
	"strings"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type RuleService struct {
	repo *repositories.RuleRepository
}

func NewRuleService(repo *repositories.RuleRepository) *RuleService {
	return &RuleService{
		repo: repo,
	}
}

func (s *RuleService) CreateRule(ctx context.Context, rule *models.Rule) (*models.Rule, error) {
	// Validate required fields
	if strings.TrimSpace(rule.Name) == "" {
		return nil, errors.New("name is required")
	}

	id, err := s.repo.CreateRule(ctx, rule)
	if err != nil {
		return nil, err
	}
	rule.ID, _ = primitive.ObjectIDFromHex(id)
	return rule, nil
}

func (s *RuleService) GetRuleByID(ctx context.Context, id string) (*models.Rule, error) {
	return s.repo.GetRuleByID(ctx, id)
}

func (s *RuleService) GetAllRules(ctx context.Context, limit, skip int64) ([]models.Rule, error) {
	return s.repo.GetAllRules(ctx, limit, skip)
}

func (s *RuleService) SearchRulesByName(ctx context.Context, name string, limit, skip int64) ([]models.Rule, error) {
	return s.repo.SearchRulesByName(ctx, name, limit, skip)
}

func (s *RuleService) UpdateRule(ctx context.Context, id string, rule *models.Rule) error {
	// Validate required fields
	if strings.TrimSpace(rule.Name) == "" {
		return errors.New("name is required")
	}

	return s.repo.UpdateRule(ctx, id, rule)
}

func (s *RuleService) DeleteRule(ctx context.Context, id string) error {
	return s.repo.DeleteRule(ctx, id)
}
