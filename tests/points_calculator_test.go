package tests

import (
	"strconv"
	"testing"

	"grimdank-database/models"
	"grimdank-database/services"
)

func TestRulePointsService(t *testing.T) {
	// Setup
	SetupTestServices(t)
	defer CleanupTestDB(t)

	service := services.NewRulePointsService(testServices.RuleService)

	t.Run("Calculate Rule Points - Basic Rule", func(t *testing.T) {
		rule := &models.Rule{
			Name:        "Basic Rule",
			Description: "A basic rule",
		}

		points := service.CalculateRulePoints(rule)
		if len(points) == 0 {
			t.Error("Expected points to be calculated, got empty slice")
		}

		// Basic rules should have some points
		if points[0] <= 0 {
			t.Errorf("Expected positive points, got %d", points[0])
		}
	})

	t.Run("Calculate Rule Points - Advanced Rule", func(t *testing.T) {
		rule := &models.Rule{
			Name:        "Advanced Rule",
			Description: "An advanced rule with complex mechanics",
		}

		points := service.CalculateRulePoints(rule)
		if len(points) == 0 {
			t.Error("Expected points to be calculated, got empty slice")
		}

		// Advanced rules should have higher points
		if points[0] <= 0 {
			t.Errorf("Expected positive points, got %d", points[0])
		}
	})

	t.Run("Get Points Breakdown", func(t *testing.T) {
		rule := &models.Rule{
			Name:        "Test Rule",
			Description: "A test rule",
		}

		breakdown := service.GetPointsBreakdown(rule)
		if breakdown == nil {
			t.Error("Expected breakdown to be returned, got nil")
		}

		// Check that breakdown contains expected keys
		if _, exists := breakdown["calculated_points"]; !exists {
			t.Error("Expected 'calculated_points' in breakdown")
		}
		if _, exists := breakdown["effectiveness"]; !exists {
			t.Error("Expected 'effectiveness' in breakdown")
		}
	})

	t.Run("Get Points Explanation", func(t *testing.T) {
		rule := &models.Rule{
			Name:        "Test Rule",
			Description: "A test rule",
		}

		explanation := service.GetPointsExplanation(rule)
		if explanation == "" {
			t.Error("Expected explanation to be returned, got empty string")
		}
	})

	t.Run("Calculate Rule Points - Different Descriptions", func(t *testing.T) {
		ruleDescriptions := []string{"Special Ability", "Weapon Rule", "Unit Rule", "Faction Rule"}

		for _, description := range ruleDescriptions {
			rule := &models.Rule{
				Name:        "Test Rule",
				Description: description,
			}

			points := service.CalculateRulePoints(rule)
			if len(points) == 0 {
				t.Errorf("Expected points to be calculated for description %s, got empty slice", description)
			}
		}
	})
}

func TestWeaponPointsCalculator(t *testing.T) {
	calculator := services.NewWeaponPointsCalculator()

	t.Run("Calculate Weapon Points - Melee Weapon", func(t *testing.T) {
		stats := services.WeaponStats{
			Type:    "Melee",
			AP:      "3+",
			Attacks: "2",
			Range:   0,
		}

		points := calculator.CalculateWeaponPoints(stats)
		if points <= 0 {
			t.Errorf("Expected positive points for melee weapon, got %d", points)
		}
	})

	t.Run("Calculate Weapon Points - Ranged Weapon", func(t *testing.T) {
		stats := services.WeaponStats{
			Type:    "Ranged",
			AP:      "4+",
			Attacks: "1",
			Range:   24,
		}

		points := calculator.CalculateWeaponPoints(stats)
		if points <= 0 {
			t.Errorf("Expected positive points for ranged weapon, got %d", points)
		}
	})

	t.Run("Calculate Weapon Points - Heavy Weapon", func(t *testing.T) {
		stats := services.WeaponStats{
			Type:    "Heavy",
			AP:      "2+",
			Attacks: "3",
			Range:   36,
		}

		points := calculator.CalculateWeaponPoints(stats)
		if points <= 0 {
			t.Errorf("Expected positive points for heavy weapon, got %d", points)
		}
	})

	t.Run("Get Weapon Stats Breakdown", func(t *testing.T) {
		stats := services.WeaponStats{
			Type:    "Melee",
			AP:      "3+",
			Attacks: "2",
			Range:   0,
		}

		breakdown := calculator.GetWeaponStatsBreakdown(stats)
		if breakdown == nil {
			t.Error("Expected breakdown to be returned, got nil")
		}

		// Check that breakdown contains expected keys
		if _, exists := breakdown["range"]; !exists {
			t.Error("Expected 'range' in breakdown")
		}
		if _, exists := breakdown["attacks"]; !exists {
			t.Error("Expected 'attacks' in breakdown")
		}
		if _, exists := breakdown["ap"]; !exists {
			t.Error("Expected 'ap' in breakdown")
		}
	})

	t.Run("Calculate Weapon Points - Different AP Values", func(t *testing.T) {
		apValues := []string{"2+", "3+", "4+", "5+", "6+"}

		for _, ap := range apValues {
			stats := services.WeaponStats{
				Type:    "Melee",
				AP:      ap,
				Attacks: "2",
				Range:   0,
			}

			points := calculator.CalculateWeaponPoints(stats)
			if points <= 0 {
				t.Errorf("Expected positive points for AP %s, got %d", ap, points)
			}
		}
	})

	t.Run("Calculate Weapon Points - Different Attack Counts", func(t *testing.T) {
		attackCounts := []int{1, 2, 3, 4, 5}

		for _, attacks := range attackCounts {
			stats := services.WeaponStats{
				Type:    "Melee",
				AP:      "3+",
				Attacks: strconv.Itoa(attacks),
				Range:   0,
			}

			points := calculator.CalculateWeaponPoints(stats)
			if points <= 0 {
				t.Errorf("Expected positive points for %d attacks, got %d", attacks, points)
			}
		}
	})

	t.Run("Calculate Weapon Points - Different Ranges", func(t *testing.T) {
		ranges := []int{0, 12, 24, 36, 48}

		for _, weaponRange := range ranges {
			stats := services.WeaponStats{
				Type:    "Ranged",
				AP:      "4+",
				Attacks: "1",
				Range:   weaponRange,
			}

			points := calculator.CalculateWeaponPoints(stats)
			if points <= 0 {
				t.Errorf("Expected positive points for range %d, got %d", weaponRange, points)
			}
		}
	})
}

func TestPointsCalculator(t *testing.T) {
	calculator := services.NewPointsCalculator()

	t.Run("Calculate Points - Basic Rule", func(t *testing.T) {
		effectiveness := services.RuleEffectiveness{
			BaseValue:  "moderate",
			Multiplier: 1.0,
			Frequency:  "conditional",
		}

		points := calculator.CalculatePoints(effectiveness)
		if len(points) == 0 {
			t.Error("Expected points to be calculated, got empty slice")
		}

		if points[0] <= 0 {
			t.Errorf("Expected positive points for basic rule, got %d", points[0])
		}
	})

	t.Run("Calculate Points - Strong Rule", func(t *testing.T) {
		effectiveness := services.RuleEffectiveness{
			BaseValue:  "strong",
			Multiplier: 1.5,
			Frequency:  "passive",
		}

		points := calculator.CalculatePoints(effectiveness)
		if len(points) == 0 {
			t.Error("Expected points to be calculated, got empty slice")
		}

		if points[0] <= 0 {
			t.Errorf("Expected positive points for strong rule, got %d", points[0])
		}
	})

	t.Run("Calculate Points - Overpowered Rule", func(t *testing.T) {
		effectiveness := services.RuleEffectiveness{
			BaseValue:  "overpowered",
			Multiplier: 2.0,
			Frequency:  "limited",
		}

		points := calculator.CalculatePoints(effectiveness)
		if len(points) == 0 {
			t.Error("Expected points to be calculated, got empty slice")
		}

		if points[0] <= 0 {
			t.Errorf("Expected positive points for overpowered rule, got %d", points[0])
		}
	})

	t.Run("Calculate Points - Different Effectiveness Levels", func(t *testing.T) {
		effectivenessLevels := []string{"minimal", "moderate", "strong", "overpowered"}

		for _, level := range effectivenessLevels {
			effectiveness := services.RuleEffectiveness{
				BaseValue:  level,
				Multiplier: 1.0,
				Frequency:  "conditional",
			}

			points := calculator.CalculatePoints(effectiveness)
			if len(points) == 0 {
				t.Errorf("Expected points to be calculated for level %s, got empty slice", level)
			}

			if points[0] <= 0 {
				t.Errorf("Expected positive points for level %s, got %d", level, points[0])
			}
		}
	})
}
