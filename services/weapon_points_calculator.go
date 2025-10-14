package services

import (
	"math"
	"strconv"
	"strings"
)

// WeaponPointsCalculator handles dynamic points calculation for weapons
type WeaponPointsCalculator struct{}

// NewWeaponPointsCalculator creates a new weapon points calculator
func NewWeaponPointsCalculator() *WeaponPointsCalculator {
	return &WeaponPointsCalculator{}
}

// WeaponStats represents the key stats for weapon points calculation
type WeaponStats struct {
	Range   int    `json:"range"`   // Range in inches
	Attacks string `json:"attacks"` // Number of attacks (can be "1", "2", "3", "X", etc.)
	AP      string `json:"ap"`      // Armor Piercing value (e.g., "0", "1", "2", "3")
	Type    string `json:"type"`    // Weapon type (Ranged/Melee)
}

// CalculateWeaponPoints calculates the base points for a weapon based on its stats
func (wpc *WeaponPointsCalculator) CalculateWeaponPoints(stats WeaponStats) int {
	// Base calculation using logarithmic scaling
	// This ensures we get reasonable point ranges from 1 to ~100

	// Calculate individual stat scores
	rangeScore := wpc.calculateRangeScore(stats.Range, stats.Type)
	attacksScore := wpc.calculateAttacksScore(stats.Attacks)
	apScore := wpc.calculateAPScore(stats.AP)

	// Combine scores with weighted importance
	// Range is most important for ranged weapons, less for melee
	// Attacks are important for all weapons
	// AP is moderately important
	var combinedScore float64

	if stats.Type == "Ranged" || stats.Type == "Weapon" {
		// For ranged weapons: Range (40%), Attacks (40%), AP (20%)
		combinedScore = (rangeScore * 0.4) + (attacksScore * 0.4) + (apScore * 0.2)
	} else {
		// For melee weapons: Range (10%), Attacks (60%), AP (30%)
		combinedScore = (rangeScore * 0.1) + (attacksScore * 0.6) + (apScore * 0.3)
	}

	// Apply logarithmic scaling to get reasonable point values
	// This gives us: 1 point at score 1, ~25 points at score 8, ~50 points at score 10
	basePoints := math.Pow(1.6, combinedScore/2)

	// Ensure minimum of 1 point and maximum of 50 points
	if basePoints < 1 {
		basePoints = 1
	}
	if basePoints > 50 {
		basePoints = 50
	}

	// Round to nearest integer
	return int(math.Round(basePoints))
}

// calculateRangeScore calculates the score for weapon range
func (wpc *WeaponPointsCalculator) calculateRangeScore(rangeValue int, weaponType string) float64 {
	if weaponType == "Melee" {
		// Melee weapons get minimal range score
		return 1.0
	}

	// Ranged weapons: cap at 48" and use linear scaling
	// 0-6": 1.0, 7-12": 2.0, 13-18": 3.0, 19-24": 4.0, 25-30": 5.0, 31-36": 6.0, 37-42": 7.0, 43-48": 8.0
	cappedRange := rangeValue
	if cappedRange > 48 {
		cappedRange = 48
	}

	// Linear scaling: every 6" = 1 point, max 8 points at 48"
	return math.Min(float64(cappedRange)/6.0, 8.0)
}

// calculateAttacksScore calculates the score for number of attacks
func (wpc *WeaponPointsCalculator) calculateAttacksScore(attacks string) float64 {
	// Parse attacks value (handle "1", "2", "3", "X", etc.)
	attacksValue, err := strconv.Atoi(strings.TrimSpace(attacks))
	if err != nil {
		// If we can't parse (e.g., "X"), assume 3 attacks
		if strings.ToUpper(strings.TrimSpace(attacks)) == "X" {
			attacksValue = 3
		} else {
			attacksValue = 1
		}
	}

	// Linear scaling with diminishing returns
	// 1 attack: 1.0, 2 attacks: 2.0, 3 attacks: 2.8, 4 attacks: 3.5, 5+ attacks: 4.0
	if attacksValue <= 0 {
		return 0.5
	} else if attacksValue == 1 {
		return 1.0
	} else if attacksValue == 2 {
		return 2.0
	} else if attacksValue == 3 {
		return 2.8
	} else if attacksValue == 4 {
		return 3.5
	} else if attacksValue <= 6 {
		return 4.0
	} else {
		// Diminishing returns for very high attack counts
		return 4.0 + (float64(attacksValue-6) * 0.2)
	}
}

// calculateAPScore calculates the score for armor piercing value
func (wpc *WeaponPointsCalculator) calculateAPScore(ap string) float64 {
	// Parse AP value (handle "0", "1", "2", "3", etc.)
	apValue, err := strconv.Atoi(strings.TrimSpace(ap))
	if err != nil {
		// If we can't parse, assume no AP
		return 1.0
	}

	// AP scaling: 0 = 1.0, 1 = 1.5, 2 = 2.0, 3 = 2.5, 4+ = 3.0
	if apValue <= 0 {
		return 1.0
	} else if apValue == 1 {
		return 1.5
	} else if apValue == 2 {
		return 2.0
	} else if apValue == 3 {
		return 2.5
	} else {
		return 3.0
	}
}

// GetWeaponStatsBreakdown returns a detailed breakdown of the calculation
func (wpc *WeaponPointsCalculator) GetWeaponStatsBreakdown(stats WeaponStats) map[string]interface{} {
	rangeScore := wpc.calculateRangeScore(stats.Range, stats.Type)
	attacksScore := wpc.calculateAttacksScore(stats.Attacks)
	apScore := wpc.calculateAPScore(stats.AP)

	var rangeWeight, attacksWeight, apWeight float64
	if stats.Type == "Ranged" || stats.Type == "Weapon" {
		rangeWeight = 0.4
		attacksWeight = 0.4
		apWeight = 0.2
	} else {
		rangeWeight = 0.1
		attacksWeight = 0.6
		apWeight = 0.3
	}

	weightedRange := rangeScore * rangeWeight
	weightedAttacks := attacksScore * attacksWeight
	weightedAP := apScore * apWeight
	combinedScore := weightedRange + weightedAttacks + weightedAP

	basePoints := math.Pow(1.6, combinedScore/2)
	if basePoints < 1 {
		basePoints = 1
	}
	if basePoints > 50 {
		basePoints = 50
	}

	return map[string]interface{}{
		"range": map[string]interface{}{
			"value":    stats.Range,
			"score":    rangeScore,
			"weight":   rangeWeight,
			"weighted": weightedRange,
		},
		"attacks": map[string]interface{}{
			"value":    stats.Attacks,
			"score":    attacksScore,
			"weight":   attacksWeight,
			"weighted": weightedAttacks,
		},
		"ap": map[string]interface{}{
			"value":    stats.AP,
			"score":    apScore,
			"weight":   apWeight,
			"weighted": weightedAP,
		},
		"combinedScore":    combinedScore,
		"calculatedPoints": int(math.Round(basePoints)),
		"weaponType":       stats.Type,
	}
}
