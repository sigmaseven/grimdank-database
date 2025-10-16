package utils

import (
	"errors"
	"strings"
)

// ValidateName validates that a name field is not empty after trimming whitespace
func ValidateName(name string) error {
	if strings.TrimSpace(name) == "" {
		return errors.New("name is required")
	}
	return nil
}

// ValidateNameWithMessage validates a name field with a custom error message
func ValidateNameWithMessage(name, fieldName string) error {
	if strings.TrimSpace(name) == "" {
		return errors.New(fieldName + " is required")
	}
	return nil
}

// ValidateWeaponType validates that a weapon type is either "melee" or "ranged"
func ValidateWeaponType(weaponType string) (string, error) {
	normalized := strings.ToLower(strings.TrimSpace(weaponType))
	if normalized != "melee" && normalized != "ranged" {
		return "", errors.New("weapon type must be either 'melee' or 'ranged'")
	}
	return normalized, nil
}

// ValidateNonEmpty validates that a string field is not empty after trimming
func ValidateNonEmpty(value, fieldName string) error {
	if strings.TrimSpace(value) == "" {
		return errors.New(fieldName + " is required")
	}
	return nil
}
