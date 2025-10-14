package handlers

import (
	"encoding/json"
	"net/http"

	"grimdank-database/services"
)

// WeaponPointsHandler handles weapon points calculation requests
type WeaponPointsHandler struct {
	calculator *services.WeaponPointsCalculator
}

// NewWeaponPointsHandler creates a new weapon points handler
func NewWeaponPointsHandler() *WeaponPointsHandler {
	return &WeaponPointsHandler{
		calculator: services.NewWeaponPointsCalculator(),
	}
}

// CalculateWeaponPoints calculates points for a weapon based on its stats
func (h *WeaponPointsHandler) CalculateWeaponPoints(w http.ResponseWriter, r *http.Request) {
	var stats services.WeaponStats
	if err := json.NewDecoder(r.Body).Decode(&stats); err != nil {
		http.Error(w, "Invalid JSON: "+err.Error(), http.StatusBadRequest)
		return
	}

	// Validate required fields
	if stats.Type == "" {
		http.Error(w, "Weapon type is required", http.StatusBadRequest)
		return
	}

	// Calculate points
	points := h.calculator.CalculateWeaponPoints(stats)

	// Get detailed breakdown
	breakdown := h.calculator.GetWeaponStatsBreakdown(stats)

	response := map[string]interface{}{
		"points":    points,
		"breakdown": breakdown,
		"stats":     stats,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// GetWeaponPointsBreakdown returns a detailed breakdown of weapon points calculation
func (h *WeaponPointsHandler) GetWeaponPointsBreakdown(w http.ResponseWriter, r *http.Request) {
	var stats services.WeaponStats
	if err := json.NewDecoder(r.Body).Decode(&stats); err != nil {
		http.Error(w, "Invalid JSON: "+err.Error(), http.StatusBadRequest)
		return
	}

	// Validate required fields
	if stats.Type == "" {
		http.Error(w, "Weapon type is required", http.StatusBadRequest)
		return
	}

	breakdown := h.calculator.GetWeaponStatsBreakdown(stats)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(breakdown)
}
