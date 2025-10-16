package services

import (
	"math"
	"strconv"
	"strings"
)

// PointsCalculator handles dynamic points calculation for rules
type PointsCalculator struct {
	config *PointsCalculatorConfig
}

// NewPointsCalculator creates a new points calculator
func NewPointsCalculator() *PointsCalculator {
	return &PointsCalculator{
		config: GetPointsCalculatorConfig(),
	}
}

// NewPointsCalculatorWithConfig creates a new points calculator with custom config
func NewPointsCalculatorWithConfig(config *PointsCalculatorConfig) *PointsCalculator {
	return &PointsCalculator{
		config: config,
	}
}

// RuleEffectiveness represents the effectiveness level of a rule
type RuleEffectiveness struct {
	BaseValue  string  `json:"baseValue"`  // Base effectiveness: "minimal", "moderate", "strong", "overpowered"
	Multiplier float64 `json:"multiplier"` // Additional multiplier (0.1-2.0)
	Frequency  string  `json:"frequency"`  // Rule frequency: "passive", "conditional", "limited"
}

// CalculatePoints calculates the points for a rule based on effectiveness
func (pc *PointsCalculator) CalculatePoints(effectiveness RuleEffectiveness) []int {
	// Calculate base points using logarithmic scaling
	// This ensures we get reasonable point ranges from 2 to ~150

	// Base calculation using weighted effectiveness states
	baseWeight := pc.getBaseEffectivenessWeight(effectiveness.BaseValue)

	// Combined effectiveness score (base effectiveness only)
	combinedScore := baseWeight

	// Apply multiplier
	finalScore := combinedScore * effectiveness.Multiplier

	// Apply frequency multiplier
	frequencyMultiplier := pc.getFrequencyMultiplier(effectiveness.Frequency)
	finalScore = finalScore * frequencyMultiplier

	// Calculate base points using logarithmic scaling
	// This gives us: 1 point at score 1, ~75 points at score 10
	basePoints := math.Pow(2, (finalScore-1)/2)

	// Ensure minimum of 1 point
	if basePoints < 1 {
		basePoints = 1
	}

	// Ensure maximum of 75 points
	if basePoints > 75 {
		basePoints = 75
	}

	// Calculate tier points with 10% scaling, ensuring unique costs
	tier1 := int(math.Round(basePoints))
	tier2 := int(math.Round(basePoints * 1.1))
	tier3 := int(math.Round(basePoints * 1.21)) // 1.1 * 1.1 = 1.21

	// Ensure each tier has a unique cost (minimum 1 point difference)
	if tier2 <= tier1 {
		tier2 = tier1 + 1
	}
	if tier3 <= tier2 {
		tier3 = tier2 + 1
	}

	// Ensure tiers don't exceed the maximum (75 points)
	if tier1 > 75 {
		tier1 = 75
	}
	if tier2 > 75 {
		tier2 = 75
	}
	if tier3 > 75 {
		tier3 = 75
	}

	return []int{tier1, tier2, tier3}
}

// getFrequencyMultiplier returns the multiplier based on rule frequency
func (pc *PointsCalculator) getFrequencyMultiplier(frequency string) float64 {
	switch frequency {
	case "passive":
		return 1.0 // Full cost - always active
	case "conditional":
		return 0.7 // 30% discount - triggered by conditions
	case "limited":
		return 0.4 // 60% discount - limited uses
	default:
		return 0.7 // Default to conditional if not specified
	}
}

// getBaseEffectivenessWeight returns the weight based on base effectiveness level
func (pc *PointsCalculator) getBaseEffectivenessWeight(baseValue string) float64 {
	switch baseValue {
	case "minimal":
		return 1.0 // Minimal effectiveness - weak rules
	case "moderate":
		return 3.0 // Moderate effectiveness - decent rules
	case "strong":
		return 5.0 // Strong effectiveness - powerful rules
	case "overpowered":
		return 8.0 // Overpowered effectiveness - game-breaking rules
	default:
		return 3.0 // Default to moderate if not specified
	}
}

// CalculatePointsFromDescription attempts to calculate points from rule description
func (pc *PointsCalculator) CalculatePointsFromDescription(ruleName, description string) []int {
	effectiveness := pc.analyzeRuleText(ruleName, description)
	return pc.CalculatePoints(effectiveness)
}

// analyzeRuleText analyzes rule text to determine effectiveness
func (pc *PointsCalculator) analyzeRuleText(name, description string) RuleEffectiveness {
	// Start with base values
	baseValue := "moderate" // Default moderate effectiveness
	multiplier := 1.0
	complexity := 2

	// Convert to lowercase for analysis
	text := strings.ToLower(name + " " + description)

	// Count high-impact keywords using configuration
	highImpactCount := 0
	for _, keyword := range pc.config.HighImpactKeywords {
		if strings.Contains(text, keyword) {
			highImpactCount++
		}
	}

	// Adjust base value based on keyword count using configuration thresholds
	if highImpactCount >= pc.config.HighImpactThreshold {
		baseValue = "overpowered"
	} else if highImpactCount >= pc.config.StrongThreshold {
		baseValue = "strong"
	} else if highImpactCount >= pc.config.ModerateThreshold {
		baseValue = "moderate"
	}

	// Analyze for complexity indicators using configuration
	complexityCount := 0
	for _, keyword := range pc.config.ComplexityKeywords {
		if strings.Contains(text, keyword) {
			complexityCount++
		}
	}

	// Adjust complexity based on keyword count using configuration thresholds
	if complexityCount >= pc.config.HighComplexityThreshold {
		complexity = pc.config.MaxComplexity
	} else if complexityCount >= pc.config.MediumComplexityThreshold {
		complexity = pc.config.MaxComplexity - 1
	} else if complexityCount >= 1 {
		complexity = 3
	}

	// All rules are now treated equally without type restrictions

	// Analyze frequency and base effectiveness based on text patterns
	frequency := pc.analyzeFrequency(text)
	baseValue = pc.analyzeBaseEffectiveness(text)

	// Analyze for numerical values that might indicate power level
	numbers := pc.extractNumbers(text)
	if len(numbers) > 0 {
		// If we find high numbers, it might indicate a powerful rule
		maxNumber := 0
		for _, num := range numbers {
			if num > maxNumber {
				maxNumber = num
			}
		}

		// Use configuration thresholds for numerical analysis
		if maxNumber >= pc.config.OverpoweredThreshold {
			baseValue = "overpowered"
		} else if maxNumber >= pc.config.StrongNumericalThreshold {
			baseValue = "strong"
		} else if maxNumber >= pc.config.ModerateNumericalThreshold {
			baseValue = "moderate"
		}
	}

	// Apply bounds using configuration
	if complexity > pc.config.MaxComplexity {
		complexity = pc.config.MaxComplexity
	}
	if complexity < pc.config.MinComplexity {
		complexity = pc.config.MinComplexity
	}
	if multiplier > pc.config.MaxMultiplier {
		multiplier = pc.config.MaxMultiplier
	}
	if multiplier < pc.config.MinMultiplier {
		multiplier = pc.config.MinMultiplier
	}

	return RuleEffectiveness{
		BaseValue:  baseValue,
		Multiplier: multiplier,
		Frequency:  frequency,
	}
}

// extractNumbers extracts numbers from text
func (pc *PointsCalculator) extractNumbers(text string) []int {
	var numbers []int
	words := strings.Fields(text)

	for _, word := range words {
		// Remove common suffixes
		cleanWord := strings.TrimSuffix(word, "s")
		cleanWord = strings.TrimSuffix(cleanWord, "th")
		cleanWord = strings.TrimSuffix(cleanWord, "st")
		cleanWord = strings.TrimSuffix(cleanWord, "nd")
		cleanWord = strings.TrimSuffix(cleanWord, "rd")

		// Try to convert to number
		if num, err := strconv.Atoi(cleanWord); err == nil {
			numbers = append(numbers, num)
		}
	}

	return numbers
}

// analyzeFrequency analyzes rule text to determine frequency type
func (pc *PointsCalculator) analyzeFrequency(text string) string {
	// Convert to lowercase for analysis
	text = strings.ToLower(text)

	// Count keyword matches using configuration
	passiveCount := 0
	limitedCount := 0
	frequentCount := 0

	for _, keyword := range pc.config.PassiveKeywords {
		if strings.Contains(text, keyword) {
			passiveCount++
		}
	}

	for _, keyword := range pc.config.LimitedKeywords {
		if strings.Contains(text, keyword) {
			limitedCount++
		}
	}

	for _, keyword := range pc.config.FrequentKeywords {
		if strings.Contains(text, keyword) {
			frequentCount++
		}
	}

	// Determine frequency based on keyword counts
	if limitedCount >= 2 || (limitedCount >= 1 && frequentCount == 0) {
		return "limited"
	} else if passiveCount >= 2 || (passiveCount >= 1 && frequentCount == 0) {
		return "passive"
	} else if frequentCount >= 1 {
		return "frequent"
	} else {
		return "conditional" // Default to conditional
	}
}

// analyzeBaseEffectiveness analyzes rule text to determine base effectiveness level
func (pc *PointsCalculator) analyzeBaseEffectiveness(text string) string {
	// Convert to lowercase for analysis
	text = strings.ToLower(text)

	// Overpowered indicators - game-breaking rules
	overpoweredKeywords := []string{
		"immune to all", "ignore all", "unlimited", "automatic", "always pass",
		"cannot be", "immune to", "invulnerable to", "eternal", "immortal",
		"unbreakable", "unstoppable", "overpowered", "broken", "overpowered",
		"win the game", "instant win", "guaranteed", "certain", "absolute",
		"eternal warrior", "immortal", "unbreakable", "unstoppable",
	}

	// Strong indicators - powerful rules
	strongKeywords := []string{
		"invulnerable save", "feel no pain", "eternal warrior", "fearless",
		"preferred enemy", "hate", "rage", "furious charge", "counter-attack",
		"stubborn", "unbreakable", "stealth", "concealed", "hidden",
		"regeneration", "tough", "hardy", "resilient", "durable", "sturdy",
		"ward save", "shield", "protection", "armour", "cover", "concealment",
		"preferred enemy", "hate", "rage", "furious charge", "counter-attack",
		"psychic", "magic", "warp", "soul", "spirit", "ethereal",
		"phase", "teleport", "deep strike", "outflank", "infiltrate",
	}

	// Moderate indicators - decent rules
	moderateKeywords := []string{
		"all friendly", "all units", "within", "range", "distance", "inches",
		"leadership", "morale", "fear", "terror", "awe", "inspiring",
		"command", "officer", "sergeant", "leader", "commander", "captain",
		"lieutenant", "major", "colonel", "general", "marshal", "lord",
		"reroll", "rerolls", "bonus", "penalty", "modifier", "adjustment",
		"difficult", "dangerous", "hazardous", "perilous", "challenging",
		"fearless", "stubborn", "unbreakable", "stealth", "concealed",
	}

	// Minimal indicators - weak rules
	minimalKeywords := []string{
		"+1", "+2", "+3", "-1", "-2", "-3", "bonus", "penalty", "modifier",
		"reroll", "rerolls", "dice", "roll", "rolls", "d6", "d3", "2d6", "3d6",
		"hit", "wound", "save", "armour", "cover", "concealment", "stealth",
		"move", "movement", "advance", "charge", "assault", "close combat",
		"melee", "shooting", "ranged", "fire", "shoot", "gun", "weapon",
		"if", "when", "unless", "but", "however", "except", "provided",
	}

	// Count keyword matches
	overpoweredCount := 0
	strongCount := 0
	moderateCount := 0
	minimalCount := 0

	for _, keyword := range overpoweredKeywords {
		if strings.Contains(text, keyword) {
			overpoweredCount++
		}
	}

	for _, keyword := range strongKeywords {
		if strings.Contains(text, keyword) {
			strongCount++
		}
	}

	for _, keyword := range moderateKeywords {
		if strings.Contains(text, keyword) {
			moderateCount++
		}
	}

	for _, keyword := range minimalKeywords {
		if strings.Contains(text, keyword) {
			minimalCount++
		}
	}

	// Determine base effectiveness based on keyword counts
	if overpoweredCount >= 2 || (overpoweredCount >= 1 && strongCount == 0) {
		return "overpowered"
	} else if strongCount >= 2 || (strongCount >= 1 && moderateCount == 0) {
		return "strong"
	} else if moderateCount >= 2 || (moderateCount >= 1 && minimalCount == 0) {
		return "moderate"
	} else {
		return "minimal" // Default to minimal
	}
}
