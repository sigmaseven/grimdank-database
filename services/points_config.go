package services

import (
	"time"
)

// PointsCalculatorConfig holds configuration for the points calculator
type PointsCalculatorConfig struct {
	// Keyword analysis thresholds
	HighImpactThreshold int
	StrongThreshold     int
	ModerateThreshold   int

	// Complexity analysis thresholds
	HighComplexityThreshold   int
	MediumComplexityThreshold int

	// Numerical value thresholds
	OverpoweredThreshold       int
	StrongNumericalThreshold   int
	ModerateNumericalThreshold int

	// Multiplier bounds
	MaxMultiplier float64
	MinMultiplier float64

	// Complexity bounds
	MaxComplexity int
	MinComplexity int

	// Frequency analysis keywords
	PassiveKeywords  []string
	LimitedKeywords  []string
	FrequentKeywords []string

	// High impact keywords
	HighImpactKeywords []string

	// Complexity keywords
	ComplexityKeywords []string

	// Base effectiveness keywords
	BaseEffectivenessKeywords map[string]string
}

// DefaultPointsCalculatorConfig returns default configuration
func DefaultPointsCalculatorConfig() *PointsCalculatorConfig {
	return &PointsCalculatorConfig{
		// Thresholds
		HighImpactThreshold:        3,
		StrongThreshold:            2,
		ModerateThreshold:          1,
		HighComplexityThreshold:    5,
		MediumComplexityThreshold:  3,
		OverpoweredThreshold:       20,
		StrongNumericalThreshold:   10,
		ModerateNumericalThreshold: 6,

		// Bounds
		MaxMultiplier: 2.0,
		MinMultiplier: 0.1,
		MaxComplexity: 5,
		MinComplexity: 1,

		// Passive indicators - always active rules
		PassiveKeywords: []string{
			"always", "permanent", "constant", "immune", "invulnerable",
			"fearless", "stubborn", "unbreakable", "eternal", "stealth",
			"concealed", "hidden", "camouflage", "feel no pain", "regeneration",
			"tough", "hardy", "resilient", "durable", "sturdy", "save",
			"ward", "shield", "protection", "armour", "cover", "concealment",
		},

		// Limited indicators - restricted use rules
		LimitedKeywords: []string{
			"once per game", "once per turn", "once per battle",
			"limited", "restricted", "conditional", "when", "if",
			"unless", "but", "however", "except", "requires",
		},

		// Frequent indicators - common use rules
		FrequentKeywords: []string{
			"every turn", "each turn", "per turn", "frequently",
			"often", "regular", "common", "standard", "basic",
		},

		// High impact keywords
		HighImpactKeywords: []string{
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
		},

		// Complexity keywords
		ComplexityKeywords: []string{
			"if", "when", "unless", "but", "however", "except",
			"roll", "dice", "d6", "d3", "2d6", "3d6",
			"turn", "phase", "round", "battle", "game",
			"model", "unit", "army", "faction", "force",
			"within", "range", "distance", "inches", "cm",
			"line of sight", "los", "visible", "hidden",
			"terrain", "cover", "concealment", "obstacle",
			"difficult", "dangerous", "hazardous", "perilous",
			"special", "unique", "rare", "legendary", "epic",
		},

		// Base effectiveness keywords
		BaseEffectivenessKeywords: map[string]string{
			"invulnerable": "overpowered",
			"eternal":      "overpowered",
			"immortal":     "overpowered",
			"devastating":  "strong",
			"destructive":  "strong",
			"powerful":     "strong",
			"mighty":       "strong",
			"strong":       "moderate",
			"tough":        "moderate",
			"hardy":        "moderate",
			"resilient":    "moderate",
		},
	}
}

// GetPointsCalculatorConfig returns configuration for the points calculator
// Can be overridden by environment variables or config files
func GetPointsCalculatorConfig() *PointsCalculatorConfig {
	config := DefaultPointsCalculatorConfig()

	// TODO: Load from environment variables or config file
	// This allows for runtime configuration changes without code changes

	return config
}

// ValidationConfig holds validation rules for points calculation
type ValidationConfig struct {
	MaxPoints            int
	MinPoints            int
	MaxTier              int
	MinTier              int
	MaxNameLength        int
	MinNameLength        int
	MaxDescriptionLength int
	MinDescriptionLength int
}

// DefaultValidationConfig returns default validation rules
func DefaultValidationConfig() *ValidationConfig {
	return &ValidationConfig{
		MaxPoints:            1000,
		MinPoints:            0,
		MaxTier:              3,
		MinTier:              1,
		MaxNameLength:        100,
		MinNameLength:        1,
		MaxDescriptionLength: 1000,
		MinDescriptionLength: 1,
	}
}

// TimeoutConfig holds timeout configuration
type TimeoutConfig struct {
	CalculationTimeout time.Duration
	AnalysisTimeout    time.Duration
	ValidationTimeout  time.Duration
}

// DefaultTimeoutConfig returns default timeout configuration
func DefaultTimeoutConfig() *TimeoutConfig {
	return &TimeoutConfig{
		CalculationTimeout: 5 * time.Second,
		AnalysisTimeout:    2 * time.Second,
		ValidationTimeout:  1 * time.Second,
	}
}

