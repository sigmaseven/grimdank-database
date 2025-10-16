package services

import (
	"context"
	"fmt"

	"grimdank-database/models"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// UnitPointsService handles unit points calculation using existing services
type UnitPointsService struct {
	ruleService    *RuleService
	weaponService  *WeaponService
	wargearService *WarGearService
}

// NewUnitPointsService creates a new unit points service
func NewUnitPointsService(ruleService *RuleService, weaponService *WeaponService, wargearService *WarGearService) *UnitPointsService {
	return &UnitPointsService{
		ruleService:    ruleService,
		weaponService:  weaponService,
		wargearService: wargearService,
	}
}

// UnitPointsBreakdown represents the breakdown of unit costs
type UnitPointsBreakdown struct {
	BaseCost        int `json:"base_cost"`
	UnitRulesCost   int `json:"unit_rules_cost"`
	WeaponsCost     int `json:"weapons_cost"`
	WeaponRulesCost int `json:"weapon_rules_cost"`
	WargearCost     int `json:"wargear_cost"`
	TotalPoints     int `json:"total_points"`
}

// CalculateUnitPoints calculates the total points for a unit
func (ups *UnitPointsService) CalculateUnitPoints(ctx context.Context, unit *models.Unit) (*UnitPointsBreakdown, error) {
	if unit == nil {
		return nil, fmt.Errorf("unit cannot be nil")
	}

	breakdown := &UnitPointsBreakdown{}

	// Calculate base unit cost from stats
	baseCost := ups.calculateBaseUnitCost(unit.Melee, unit.Ranged, unit.Morale, unit.Defense)
	breakdown.BaseCost = baseCost

	// Calculate unit rules cost (rules × number of models)
	unitRulesCost := ups.calculateUnitRulesCost(ctx, unit.Rules, unit.Amount)
	breakdown.UnitRulesCost = unitRulesCost

	// Calculate weapons cost (weapon points × quantity + weapon rules × models)
	weaponsCost, weaponRulesCost := ups.calculateWeaponsCost(ctx, unit.Weapons, unit.Amount)
	breakdown.WeaponsCost = weaponsCost
	breakdown.WeaponRulesCost = weaponRulesCost

	// Calculate wargear cost (wargear rules × models)
	wargearCost := ups.calculateWargearCost(ctx, unit.WarGear, unit.Amount)
	breakdown.WargearCost = wargearCost

	// Calculate total points
	breakdown.TotalPoints = baseCost + unitRulesCost + weaponsCost + weaponRulesCost + wargearCost

	return breakdown, nil
}

// calculateBaseUnitCost calculates the base cost from unit stats
func (ups *UnitPointsService) calculateBaseUnitCost(melee, ranged, morale, defense int) int {
	// Base formula: (melee + ranged + morale + defense) * 2 + 10
	// This gives a reasonable base cost that scales with stats
	statSum := melee + ranged + morale + defense
	baseCost := statSum*2 + 10

	// Ensure minimum cost of 5 points
	if baseCost < 5 {
		baseCost = 5
	}

	return baseCost
}

// calculateUnitRulesCost calculates the cost of rules attached to the unit
func (ups *UnitPointsService) calculateUnitRulesCost(ctx context.Context, rules []models.RuleReference, modelCount int) int {
	totalCost := 0

	for _, ruleRef := range rules {
		// Get the rule to access its points
		rule, err := ups.ruleService.GetRuleByID(ctx, ruleRef.RuleID.Hex())
		if err != nil {
			// If rule not found, skip it
			continue
		}

		// Get the appropriate tier cost
		tierIndex := ruleRef.Tier - 1
		if tierIndex < 0 || tierIndex >= len(rule.Points) {
			tierIndex = 0 // Default to first tier if invalid
		}

		ruleCost := rule.Points[tierIndex]

		// Multiply by number of models in the unit
		totalCost += ruleCost * modelCount
	}

	return totalCost
}

// calculateWeaponsCost calculates the cost of weapons and their rules
func (ups *UnitPointsService) calculateWeaponsCost(ctx context.Context, weapons []models.WeaponReference, modelCount int) (int, int) {
	weaponsCost := 0
	weaponRulesCost := 0

	for _, weaponRef := range weapons {
		// Get the weapon to access its points and rules
		weapon, err := ups.weaponService.GetWeaponByID(ctx, weaponRef.WeaponID.Hex())
		if err != nil {
			// If weapon not found, skip it
			continue
		}

		// Calculate weapon base cost (weapon points × quantity)
		weaponBaseCost := weapon.Points * weaponRef.Quantity
		weaponsCost += weaponBaseCost

		// Calculate weapon rules cost (weapon rules × models)
		for _, ruleRef := range weapon.Rules {
			// Get the rule to access its points
			rule, err := ups.ruleService.GetRuleByID(ctx, ruleRef.RuleID.Hex())
			if err != nil {
				// If rule not found, skip it
				continue
			}

			// Get the appropriate tier cost
			tierIndex := ruleRef.Tier - 1
			if tierIndex < 0 || tierIndex >= len(rule.Points) {
				tierIndex = 0 // Default to first tier if invalid
			}

			ruleCost := rule.Points[tierIndex]

			// Multiply by number of models in the unit
			weaponRulesCost += ruleCost * modelCount
		}
	}

	return weaponsCost, weaponRulesCost
}

// calculateWargearCost calculates the cost of wargear rules
func (ups *UnitPointsService) calculateWargearCost(ctx context.Context, wargear []primitive.ObjectID, modelCount int) int {
	totalCost := 0

	for _, wargearID := range wargear {
		// Get the wargear to access its rules
		wargear, err := ups.wargearService.GetWarGearByID(ctx, wargearID.Hex())
		if err != nil {
			// If wargear not found, skip it
			continue
		}

		// Calculate wargear rules cost (wargear rules × models)
		for _, ruleRef := range wargear.Rules {
			// Get the rule to access its points
			rule, err := ups.ruleService.GetRuleByID(ctx, ruleRef.RuleID.Hex())
			if err != nil {
				// If rule not found, skip it
				continue
			}

			// Get the appropriate tier cost
			tierIndex := ruleRef.Tier - 1
			if tierIndex < 0 || tierIndex >= len(rule.Points) {
				tierIndex = 0 // Default to first tier if invalid
			}

			ruleCost := rule.Points[tierIndex]

			// Multiply by number of models in the unit
			totalCost += ruleCost * modelCount
		}
	}

	return totalCost
}

