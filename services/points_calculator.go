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
	BaseValue    int     `json:"baseValue"`    // Base effectiveness (1-10 scale)
	Multiplier   float64 `json:"multiplier"`    // Additional multiplier (0.1-2.0)
	Complexity   int     `json:"complexity"`    // Rule complexity (1-5 scale)
	GameImpact   int     `json:"gameImpact"`    // Game impact level (1-5 scale)
}

// CalculatePoints calculates the points for a rule based on effectiveness
func (pc *PointsCalculator) CalculatePoints(effectiveness RuleEffectiveness) []int {
	// Calculate base points using logarithmic scaling
	// This ensures we get reasonable point ranges from 2 to ~150
	
	// Base calculation: 2^((effectiveness - 1) / 2) gives us exponential growth
	baseEffectiveness := float64(effectiveness.BaseValue)
	complexityBonus := float64(effectiveness.Complexity) * 0.2
	impactBonus := float64(effectiveness.GameImpact) * 0.3
	
	// Combined effectiveness score
	combinedScore := baseEffectiveness + complexityBonus + impactBonus
	
	// Apply multiplier
	finalScore := combinedScore * effectiveness.Multiplier
	
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
	
	// Calculate tier points with 10% scaling
	tier1 := int(math.Round(basePoints))
	tier2 := int(math.Round(basePoints * 1.1))
	tier3 := int(math.Round(basePoints * 1.21)) // 1.1 * 1.1 = 1.21
	
	return []int{tier1, tier2, tier3}
}

// CalculatePointsFromDescription attempts to calculate points from rule description
func (pc *PointsCalculator) CalculatePointsFromDescription(ruleName, description, ruleType string) []int {
	effectiveness := pc.analyzeRuleText(ruleName, description, ruleType)
	return pc.CalculatePoints(effectiveness)
}

// analyzeRuleText analyzes rule text to determine effectiveness
func (pc *PointsCalculator) analyzeRuleText(name, description, ruleType string) RuleEffectiveness {
	// Start with base values
	baseValue := 3 // Default moderate effectiveness
	multiplier := 1.0
	complexity := 2
	gameImpact := 2
	
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
		baseValue = 8
		gameImpact = 5
	} else if highImpactCount >= 2 {
		baseValue = 6
		gameImpact = 4
	} else if highImpactCount >= 1 {
		baseValue = 4
		gameImpact = 3
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
		gameImpact = 5
	case "Equipment", "Wargear", "Gear":
		multiplier = 0.8
	case "Tactical", "Strategic", "Command":
		multiplier = 1.3
		gameImpact = 4
	case "Defensive", "Protection", "Armour":
		multiplier = 1.1
	case "Offensive", "Attack", "Weapon":
		multiplier = 1.2
	}
	
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
		
		if maxNumber >= 6 {
			baseValue += 1
		}
		if maxNumber >= 10 {
			baseValue += 1
		}
		if maxNumber >= 20 {
			baseValue += 1
		}
	}
	
	// Ensure values are within reasonable bounds
	if baseValue > 10 {
		baseValue = 10
	}
	if baseValue < 1 {
		baseValue = 1
	}
	if complexity > 5 {
		complexity = 5
	}
	if complexity < 1 {
		complexity = 1
	}
	if gameImpact > 5 {
		gameImpact = 5
	}
	if gameImpact < 1 {
		gameImpact = 1
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
		Complexity: complexity,
		GameImpact: gameImpact,
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

// GetPointsExplanation returns a human-readable explanation of the points calculation
func (pc *PointsCalculator) GetPointsExplanation(effectiveness RuleEffectiveness) string {
	points := pc.CalculatePoints(effectiveness)
	
	explanation := "Points Calculation:\n"
	explanation += "• Base Effectiveness: " + strconv.Itoa(effectiveness.BaseValue) + "/10\n"
	explanation += "• Complexity: " + strconv.Itoa(effectiveness.Complexity) + "/5\n"
	explanation += "• Game Impact: " + strconv.Itoa(effectiveness.GameImpact) + "/5\n"
	explanation += "• Multiplier: " + strconv.FormatFloat(effectiveness.Multiplier, 'f', 1, 64) + "x\n"
	explanation += "• Calculated Points: " + strconv.Itoa(points[0]) + " / " + strconv.Itoa(points[1]) + " / " + strconv.Itoa(points[2]) + "\n"
	explanation += "• Tier scaling: +10% per tier\n"
	explanation += "• Range: 1-75 points per model"
	
	return explanation
}
