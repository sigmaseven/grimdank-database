package repositories

import (
	"context"
	"grimdank-database/models"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type RuleRepository struct {
	*BaseRepository
}

func NewRuleRepository(collection *mongo.Collection) *RuleRepository {
	return &RuleRepository{
		BaseRepository: NewBaseRepository(collection),
	}
}

func (r *RuleRepository) CreateRule(ctx context.Context, rule *models.Rule) (string, error) {
	id, err := r.Create(ctx, rule)
	if err != nil {
		return "", err
	}
	rule.ID = id
	return id.Hex(), nil
}

func (r *RuleRepository) GetRuleByID(ctx context.Context, id string) (*models.Rule, error) {
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, err
	}

	var rule models.Rule
	err = r.GetByID(ctx, objectID, &rule)
	if err != nil {
		return nil, err
	}
	return &rule, nil
}

func (r *RuleRepository) GetAllRules(ctx context.Context, limit, skip int64) ([]models.Rule, error) {
	var rules []models.Rule
	err := r.GetAll(ctx, bson.M{}, &rules, limit, skip)
	return rules, err
}

func (r *RuleRepository) SearchRulesByName(ctx context.Context, name string, limit, skip int64) ([]models.Rule, error) {
	var rules []models.Rule
	err := r.SearchByName(ctx, name, &rules, limit, skip)
	return rules, err
}

func (r *RuleRepository) UpdateRule(ctx context.Context, id string, rule *models.Rule) error {
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return err
	}
	rule.ID = objectID
	return r.Update(ctx, objectID, rule)
}

func (r *RuleRepository) DeleteRule(ctx context.Context, id string) error {
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return err
	}
	return r.Delete(ctx, objectID)
}

func (r *RuleRepository) CountRules(ctx context.Context) (int64, error) {
	return r.Count(ctx, bson.M{})
}

func (r *RuleRepository) CountRulesByName(ctx context.Context, name string) (int64, error) {
	filter := bson.M{
		"name": bson.M{
			"$regex":   name,
			"$options": "i",
		},
	}
	return r.Count(ctx, filter)
}

func (r *RuleRepository) BulkImportRules(ctx context.Context, rulesList []models.Rule) ([]string, error) {
	if len(rulesList) == 0 {
		return []string{}, nil
	}

	documents := make([]interface{}, len(rulesList))
	for i, rule := range rulesList {
		documents[i] = rule
	}

	insertedIDs, err := r.BulkInsert(ctx, documents)
	if err != nil {
		return nil, err
	}

	hexIDs := make([]string, len(insertedIDs))
	for i, id := range insertedIDs {
		hexIDs[i] = id.Hex()
	}

	return hexIDs, nil
}

func (r *RuleRepository) GetRulesByIDs(ctx context.Context, ids []primitive.ObjectID) ([]models.Rule, error) {
	var rules []models.Rule
	filter := bson.M{"_id": bson.M{"$in": ids}}
	err := r.GetAll(ctx, filter, &rules, 0, 0)
	return rules, err
}
