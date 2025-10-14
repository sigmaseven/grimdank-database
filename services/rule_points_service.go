package services

import (
	"context"
	"grimdank-database/models"
)

// RulePointsService handles points calculation for rules
type RulePointsService struct {
	pointsCalculator *PointsCalculator
	ruleService      *RuleService
}

// GetRuleService returns the rule service (for internal use)
func (rps *RulePointsService) GetRuleService() *RuleService {
	return rps.ruleService
}

// NewRulePointsService creates a new rule points service
func NewRulePointsService(ruleService *RuleService) *RulePointsService {
	return &RulePointsService{
		pointsCalculator: NewPointsCalculator(),
		ruleService:      ruleService,
	}
}

// CalculateRulePoints calculates points for a rule based on its content
func (rps *RulePointsService) CalculateRulePoints(rule *models.Rule) []int {
	effectiveness := rps.pointsCalculator.analyzeRuleText(rule.Name, rule.Description, rule.Type)
	return rps.pointsCalculator.CalculatePoints(effectiveness)
}

// CalculateRulePointsWithCustom calculates points with custom effectiveness values
func (rps *RulePointsService) CalculateRulePointsWithCustom(rule *models.Rule, effectiveness RuleEffectiveness) []int {
	return rps.pointsCalculator.CalculatePoints(effectiveness)
}

// GetPointsExplanation returns explanation for rule points
func (rps *RulePointsService) GetPointsExplanation(rule *models.Rule) string {
	effectiveness := rps.pointsCalculator.analyzeRuleText(rule.Name, rule.Description, rule.Type)
	return rps.pointsCalculator.GetPointsExplanation(effectiveness)
}

// UpdateRuleWithCalculatedPoints updates a rule with calculated points
func (rps *RulePointsService) UpdateRuleWithCalculatedPoints(ctx context.Context, ruleID string, rule *models.Rule) (*models.Rule, error) {
	// Calculate points
	calculatedPoints := rps.CalculateRulePoints(rule)
	rule.Points = calculatedPoints

	// Update the rule in the database
	err := rps.ruleService.UpdateRule(ctx, ruleID, rule)
	if err != nil {
		return nil, err
	}

	return rule, nil
}

// BulkCalculatePoints calculates points for multiple rules
func (rps *RulePointsService) BulkCalculatePoints(rules []models.Rule) []models.Rule {
	updatedRules := make([]models.Rule, len(rules))

	for i, rule := range rules {
		calculatedPoints := rps.CalculateRulePoints(&rule)
		rule.Points = calculatedPoints
		updatedRules[i] = rule
	}

	return updatedRules
}

// GetPointsBreakdown returns detailed breakdown of points calculation
func (rps *RulePointsService) GetPointsBreakdown(rule *models.Rule) map[string]interface{} {
	effectiveness := rps.pointsCalculator.analyzeRuleText(rule.Name, rule.Description, rule.Type)
	points := rps.pointsCalculator.CalculatePoints(effectiveness)

	return map[string]interface{}{
		"rule_id":           rule.ID.Hex(),
		"rule_name":         rule.Name,
		"calculated_points": points,
		"effectiveness": map[string]interface{}{
			"base_value":  effectiveness.BaseValue,
			"multiplier":  effectiveness.Multiplier,
			"game_impact": effectiveness.GameImpact,
			"frequency":   effectiveness.Frequency,
		},
		"explanation": rps.pointsCalculator.GetPointsExplanation(effectiveness),
		"tier_scaling": map[string]interface{}{
			"tier_1":            points[0],
			"tier_2":            points[1],
			"tier_3":            points[2],
			"tier_2_multiplier": 1.1,
			"tier_3_multiplier": 1.21,
		},
	}
}
