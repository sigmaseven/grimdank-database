package services

import (
	"math"
	"strconv"
	"strings"
)

// PointsCalculator handles dynamic points calculation for rules
type PointsCalculator struct{}

// NewPointsCalculator creates a new points calculator
func NewPointsCalculator() *PointsCalculator {
	return &PointsCalculator{}
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
func (pc *PointsCalculator) CalculatePointsFromDescription(ruleName, description, ruleType string) []int {
	effectiveness := pc.analyzeRuleText(ruleName, description, ruleType)
	return pc.CalculatePoints(effectiveness)
}

// analyzeRuleText analyzes rule text to determine effectiveness
func (pc *PointsCalculator) analyzeRuleText(name, description, ruleType string) RuleEffectiveness {
	// Start with base values
	baseValue := "moderate" // Default moderate effectiveness
	multiplier := 1.0
	complexity := 2

	// Convert to lowercase for analysis
	text := strings.ToLower(name + " " + description + " " + ruleType)

	// Analyze for high-impact keywords
	highImpactKeywords := []string{
		"invulnerable", "eternal", "immortal", "regeneration", "feel no pain",
		"fearless", "stubborn", "unbreakable", "eternal warrior", "daemon",
		"psychic", "magic", "warp", "soul", "spirit", "ethereal",
		"phase", "teleport", "deep strike", "outflank", "infiltrate",
		"stealth", "concealed", "hidden", "camouflage", "scout",
		"fleet", "fast", "swift", "nimble", "agile", "quick",
		"tough", "hardy", "resilient", "durable", "sturdy",
		"strong", "mighty", "powerful", "devastating", "destructive",
		"explosive", "blast", "template", "area", "zone",
		"rending", "armour bane", "armourbane", "melta", "plasma",
		"flame", "fire", "burn", "ignite", "incendiary",
		"poison", "toxic", "venom", "acid", "corrosive",
		"shred", "tear", "rip", "rend", "cleave",
		"pierce", "penetrate", "drill", "bore", "punch",
		"ignore", "bypass", "negate", "cancel", "void",
		"immunity", "immune", "resistant", "resistance",
		"bonus", "extra", "additional", "plus", "more",
		"reroll", "roll again", "roll twice", "choose",
		"preferred enemy", "hatred", "rage", "fury", "berserk",
		"furious charge", "assault", "close combat", "melee",
		"shooting", "ranged", "fire", "shoot", "gun",
		"weapon", "armour", "save", "ward", "shield",
		"cover", "concealment", "protection", "defense",
		"movement", "advance", "charge", "run", "fleet",
		"leadership", "morale", "break", "flee", "rout",
	}

	// Count high-impact keywords
	highImpactCount := 0
	for _, keyword := range highImpactKeywords {
		if strings.Contains(text, keyword) {
			highImpactCount++
		}
	}

	// Adjust base value based on keyword count
	if highImpactCount >= 3 {
		baseValue = "overpowered"
	} else if highImpactCount >= 2 {
		baseValue = "strong"
	} else if highImpactCount >= 1 {
		baseValue = "moderate"
	}

	// Analyze for complexity indicators
	complexityKeywords := []string{
		"if", "when", "unless", "but", "however", "except",
		"roll", "dice", "d6", "d3", "2d6", "3d6",
		"turn", "phase", "round", "battle", "game",
		"model", "unit", "army", "faction", "force",
		"within", "range", "distance", "inches", "cm",
		"line of sight", "los", "visible", "hidden",
		"terrain", "cover", "concealment", "obstacle",
		"difficult", "dangerous", "hazardous", "perilous",
		"special", "unique", "rare", "legendary", "epic",
	}

	complexityCount := 0
	for _, keyword := range complexityKeywords {
		if strings.Contains(text, keyword) {
			complexityCount++
		}
	}

	// Adjust complexity based on keyword count
	if complexityCount >= 5 {
		complexity = 5
	} else if complexityCount >= 3 {
		complexity = 4
	} else if complexityCount >= 1 {
		complexity = 3
	}

	// Analyze rule type for additional modifiers
	switch ruleType {
	case "Special Rule", "Special Ability", "Special Power":
		multiplier = 1.2
	case "Psychic Power", "Magic", "Warp":
		multiplier = 1.5
	case "Equipment", "Wargear", "Gear":
		multiplier = 0.8
	case "Tactical", "Strategic", "Command":
		multiplier = 1.3
	case "Defensive", "Protection", "Armour":
		multiplier = 1.1
	case "Offensive", "Attack", "Weapon":
		multiplier = 1.2
	}

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

		if maxNumber >= 20 {
			baseValue = "overpowered"
		} else if maxNumber >= 10 {
			baseValue = "strong"
		} else if maxNumber >= 6 {
			baseValue = "moderate"
		}
	}
	if complexity > 5 {
		complexity = 5
	}
	if complexity < 1 {
		complexity = 1
	}
	if multiplier > 2.0 {
		multiplier = 2.0
	}
	if multiplier < 0.1 {
		multiplier = 0.1
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

	// Passive indicators - always active rules
	passiveKeywords := []string{
		"always", "permanent", "constant", "immune", "invulnerable",
		"fearless", "stubborn", "unbreakable", "eternal", "stealth",
		"concealed", "hidden", "camouflage", "feel no pain", "regeneration",
		"tough", "hardy", "resilient", "durable", "sturdy", "save",
		"ward", "shield", "protection", "armour", "cover", "concealment",
	}

	// Limited indicators - restricted use rules
	limitedKeywords := []string{
		"once per game", "once per turn", "once per battle", "once",
		"roll a dice", "roll", "d6", "d3", "2d6", "3d6", "on a",
		"command point", "cp", "spend", "cost", "pay", "sacrifice",
		"lose", "remove", "destroy", "kill", "wound", "damage",
	}

	// Conditional indicators - triggered rules
	conditionalKeywords := []string{
		"if", "when", "unless", "but", "however", "except", "provided",
		"charging", "charged", "assault", "close combat", "melee",
		"shooting", "ranged", "fire", "shoot", "gun", "weapon",
		"within", "range", "distance", "inches", "cm", "line of sight",
		"los", "visible", "hidden", "terrain", "cover", "concealment",
		"difficult", "dangerous", "hazardous", "perilous", "turn",
		"phase", "round", "battle", "game", "model", "unit", "army",
	}

	// Count keyword matches
	passiveCount := 0
	limitedCount := 0
	conditionalCount := 0

	for _, keyword := range passiveKeywords {
		if strings.Contains(text, keyword) {
			passiveCount++
		}
	}

	for _, keyword := range limitedKeywords {
		if strings.Contains(text, keyword) {
			limitedCount++
		}
	}

	for _, keyword := range conditionalKeywords {
		if strings.Contains(text, keyword) {
			conditionalCount++
		}
	}

	// Determine frequency based on keyword counts
	if limitedCount >= 2 || (limitedCount >= 1 && conditionalCount == 0) {
		return "limited"
	} else if passiveCount >= 2 || (passiveCount >= 1 && conditionalCount == 0) {
		return "passive"
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

// GetPointsExplanation returns a human-readable explanation of the points calculation
func (pc *PointsCalculator) GetPointsExplanation(effectiveness RuleEffectiveness) string {
	points := pc.CalculatePoints(effectiveness)

	// Get the actual values used in calculation
	baseWeight := pc.getBaseEffectivenessWeight(effectiveness.BaseValue)
	frequencyMultiplier := pc.getFrequencyMultiplier(effectiveness.Frequency)

	// Calculate the intermediate values
	combinedScore := baseWeight
	finalScore := combinedScore * effectiveness.Multiplier
	adjustedScore := finalScore * frequencyMultiplier
	basePoints := math.Pow(2, (adjustedScore-1)/2)
	clampedPoints := math.Max(1, math.Min(75, basePoints))

	explanation := "Points Calculation Formula:\n\n"
	explanation += "Step 1: Base Score = Base Effectiveness Weight\n"
	explanation += "        = " + strconv.FormatFloat(baseWeight, 'f', 1, 64) + "\n\n"

	explanation += "Step 2: Final Score = Base Score × Multiplier\n"
	explanation += "        = " + strconv.FormatFloat(combinedScore, 'f', 1, 64) + " × " + strconv.FormatFloat(effectiveness.Multiplier, 'f', 1, 64) + " = " + strconv.FormatFloat(finalScore, 'f', 1, 64) + "\n\n"

	explanation += "Step 3: Adjusted Score = Final Score × Frequency Multiplier\n"
	explanation += "        = " + strconv.FormatFloat(finalScore, 'f', 1, 64) + " × " + strconv.FormatFloat(frequencyMultiplier, 'f', 1, 64) + " = " + strconv.FormatFloat(adjustedScore, 'f', 1, 64) + "\n\n"

	explanation += "Step 4: Base Points = 2^((Adjusted Score - 1) / 2)\n"
	explanation += "        = 2^((" + strconv.FormatFloat(adjustedScore, 'f', 1, 64) + " - 1) / 2) = 2^(" + strconv.FormatFloat((adjustedScore-1)/2, 'f', 1, 64) + ") = " + strconv.FormatFloat(basePoints, 'f', 1, 64) + "\n\n"

	explanation += "Step 5: Clamp to Range (1-75)\n"
	explanation += "        = max(1, min(75, " + strconv.FormatFloat(basePoints, 'f', 1, 64) + ")) = " + strconv.FormatFloat(clampedPoints, 'f', 1, 64) + "\n\n"

	explanation += "Step 6: Calculate Tiers (ensuring unique costs)\n"
	explanation += "        Tier 1 = " + strconv.FormatFloat(clampedPoints, 'f', 1, 64) + " = " + strconv.Itoa(points[0]) + " points\n"
	explanation += "        Tier 2 = " + strconv.FormatFloat(clampedPoints, 'f', 1, 64) + " × 1.1 = " + strconv.FormatFloat(clampedPoints*1.1, 'f', 1, 64) + " = " + strconv.Itoa(points[1]) + " points\n"
	explanation += "        Tier 3 = " + strconv.FormatFloat(clampedPoints, 'f', 1, 64) + " × 1.21 = " + strconv.FormatFloat(clampedPoints*1.21, 'f', 1, 64) + " = " + strconv.Itoa(points[2]) + " points\n"
	explanation += "        (Adjusted to ensure unique costs: min 1 point difference per tier)\n\n"

	explanation += "Final Result: " + strconv.Itoa(points[0]) + " / " + strconv.Itoa(points[1]) + " / " + strconv.Itoa(points[2]) + " points (Tier 1/2/3)"

	return explanation
}
