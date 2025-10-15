package services

import (
	"context"
	"grimdank-database/models"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// PopulationService handles populating referenced entities
type PopulationService struct {
	ruleService    *RuleService
	weaponService  *WeaponService
	wargearService *WarGearService
	unitService    *UnitService
}

func NewPopulationService(ruleService *RuleService, weaponService *WeaponService, wargearService *WarGearService, unitService *UnitService) *PopulationService {
	return &PopulationService{
		ruleService:    ruleService,
		weaponService:  weaponService,
		wargearService: wargearService,
		unitService:    unitService,
	}
}

// PopulateWeaponRules populates rule references with full rule data
func (ps *PopulationService) PopulateWeaponRules(ctx context.Context, weapon *models.Weapon) (*models.PopulatedWeapon, error) {
	populatedWeapon := &models.PopulatedWeapon{
		Weapon: *weapon,
	}

	// Populate rules with tier information
	for _, ruleRef := range weapon.Rules {
		rule, err := ps.ruleService.GetRuleByID(ctx, ruleRef.RuleID.Hex())
		if err != nil {
			return nil, err
		}
		// Create a rule with tier information
		ruleWithTier := models.RuleWithTier{
			Rule: *rule,
			Tier: ruleRef.Tier,
		}
		populatedWeapon.PopulatedRules = append(populatedWeapon.PopulatedRules, ruleWithTier)
	}

	return populatedWeapon, nil
}

// PopulateWarGearRules populates rule references with full rule data
func (ps *PopulationService) PopulateWarGearRules(ctx context.Context, wargear *models.WarGear) (*models.PopulatedWarGear, error) {
	populatedWarGear := &models.PopulatedWarGear{
		WarGear: *wargear,
	}

	// Populate rules
	for _, ruleRef := range wargear.Rules {
		rule, err := ps.ruleService.GetRuleByID(ctx, ruleRef.RuleID.Hex())
		if err != nil {
			return nil, err
		}
		populatedWarGear.PopulatedRules = append(populatedWarGear.PopulatedRules, *rule)
	}

	return populatedWarGear, nil
}

// PopulateUnitWithReferences populates all references in a unit
func (ps *PopulationService) PopulateUnitWithReferences(ctx context.Context, unit *models.Unit) (*models.PopulatedUnit, error) {
	populatedUnit := &models.PopulatedUnit{
		Unit: *unit,
	}

	// Populate rules
	for _, ruleRef := range unit.Rules {
		rule, err := ps.ruleService.GetRuleByID(ctx, ruleRef.RuleID.Hex())
		if err != nil {
			return nil, err
		}
		populatedUnit.PopulatedRules = append(populatedUnit.PopulatedRules, *rule)
	}

	// Populate available weapons
	for _, weaponID := range unit.AvailableWeapons {
		weapon, err := ps.weaponService.GetWeaponByID(ctx, weaponID.Hex())
		if err != nil {
			return nil, err
		}
		populatedUnit.PopulatedAvailableWeapons = append(populatedUnit.PopulatedAvailableWeapons, *weapon)
	}

	// Populate available wargear
	for _, wargearID := range unit.AvailableWarGear {
		wargear, err := ps.wargearService.GetWarGearByID(ctx, wargearID.Hex())
		if err != nil {
			return nil, err
		}
		populatedUnit.PopulatedAvailableWarGear = append(populatedUnit.PopulatedAvailableWarGear, *wargear)
	}

	// Populate equipped weapons with quantity and type info
	for _, weaponRef := range unit.Weapons {
		weapon, err := ps.weaponService.GetWeaponByID(ctx, weaponRef.WeaponID.Hex())
		if err != nil {
			return nil, err
		}
		popWeaponRef := models.PopulatedWeaponReference{
			Weapon:   *weapon,
			Quantity: weaponRef.Quantity,
			Type:     weaponRef.Type,
		}
		populatedUnit.PopulatedWeapons = append(populatedUnit.PopulatedWeapons, popWeaponRef)
	}

	// Populate equipped wargear
	for _, wargearID := range unit.WarGear {
		wargear, err := ps.wargearService.GetWarGearByID(ctx, wargearID.Hex())
		if err != nil {
			return nil, err
		}
		populatedUnit.PopulatedWarGear = append(populatedUnit.PopulatedWarGear, *wargear)
	}

	return populatedUnit, nil
}

// CalculateTotalPoints calculates total points including rule costs
func (ps *PopulationService) CalculateTotalPoints(ctx context.Context, weapon *models.Weapon) (int, error) {
	basePoints := weapon.Points
	rulePoints := 0

	for _, ruleRef := range weapon.Rules {
		rule, err := ps.ruleService.GetRuleByID(ctx, ruleRef.RuleID.Hex())
		if err != nil {
			return 0, err
		}

		// Use the specified tier (1, 2, or 3) or default to tier 1
		tier := ruleRef.Tier
		if tier < 1 || tier > 3 {
			tier = 1
		}

		if len(rule.Points) >= tier {
			rulePoints += rule.Points[tier-1] // Convert to 0-based index
		}
	}

	return basePoints + rulePoints, nil
}

// AddRuleToWeapon adds a rule reference to a weapon
func (ps *PopulationService) AddRuleToWeapon(ctx context.Context, weaponID string, ruleID string, tier int) error {
	ruleObjID, err := primitive.ObjectIDFromHex(ruleID)
	if err != nil {
		return err
	}

	ruleRef := models.RuleReference{
		RuleID: ruleObjID,
		Tier:   tier,
	}

	// Get current weapon
	weapon, err := ps.weaponService.GetWeaponByID(ctx, weaponID)
	if err != nil {
		return err
	}

	// Add rule reference
	weapon.Rules = append(weapon.Rules, ruleRef)

	// Update weapon
	return ps.weaponService.UpdateWeapon(ctx, weaponID, weapon)
}

// RemoveRuleFromWeapon removes a rule reference from a weapon
func (ps *PopulationService) RemoveRuleFromWeapon(ctx context.Context, weaponID string, ruleID string) error {
	ruleObjID, err := primitive.ObjectIDFromHex(ruleID)
	if err != nil {
		return err
	}

	// Get current weapon
	weapon, err := ps.weaponService.GetWeaponByID(ctx, weaponID)
	if err != nil {
		return err
	}

	// Remove rule reference
	var newRules []models.RuleReference
	for _, ruleRef := range weapon.Rules {
		if ruleRef.RuleID != ruleObjID {
			newRules = append(newRules, ruleRef)
		}
	}
	weapon.Rules = newRules

	// Update weapon
	return ps.weaponService.UpdateWeapon(ctx, weaponID, weapon)
}

// AddRuleToWarGear adds a rule reference to a wargear item
func (ps *PopulationService) AddRuleToWarGear(ctx context.Context, wargearID string, ruleID string, tier int) error {
	ruleObjID, err := primitive.ObjectIDFromHex(ruleID)
	if err != nil {
		return err
	}

	ruleRef := models.RuleReference{
		RuleID: ruleObjID,
		Tier:   tier,
	}

	// Get current wargear
	wargear, err := ps.wargearService.GetWarGearByID(ctx, wargearID)
	if err != nil {
		return err
	}

	// Add rule reference
	wargear.Rules = append(wargear.Rules, ruleRef)

	// Update wargear
	return ps.wargearService.UpdateWarGear(ctx, wargearID, wargear)
}

// RemoveRuleFromWarGear removes a rule reference from a wargear item
func (ps *PopulationService) RemoveRuleFromWarGear(ctx context.Context, wargearID string, ruleID primitive.ObjectID) error {
	// Get current wargear
	wargear, err := ps.wargearService.GetWarGearByID(ctx, wargearID)
	if err != nil {
		return err
	}

	// Remove rule reference
	var newRules []models.RuleReference
	for _, ruleRef := range wargear.Rules {
		if ruleRef.RuleID != ruleID {
			newRules = append(newRules, ruleRef)
		}
	}
	wargear.Rules = newRules

	// Update wargear
	return ps.wargearService.UpdateWarGear(ctx, wargearID, wargear)
}
