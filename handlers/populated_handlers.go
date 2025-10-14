package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"grimdank-database/models"
	"grimdank-database/services"

	"github.com/gorilla/mux"
)

type PopulatedWeaponHandler struct {
	weaponService     *services.WeaponService
	populationService *services.PopulationService
}

func NewPopulatedWeaponHandler(weaponService *services.WeaponService, populationService *services.PopulationService) *PopulatedWeaponHandler {
	return &PopulatedWeaponHandler{
		weaponService:     weaponService,
		populationService: populationService,
	}
}

// GetWeaponWithRules returns a weapon with populated rules
func (h *PopulatedWeaponHandler) GetWeaponWithRules(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	weapon, err := h.weaponService.GetWeaponByID(r.Context(), id)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			http.Error(w, "Weapon not found", http.StatusNotFound)
		} else {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
		return
	}

	// Populate rules
	populatedWeapon, err := h.populationService.PopulateWeaponRules(r.Context(), weapon)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Calculate total points including rules
	totalPoints, err := h.populationService.CalculateTotalPoints(r.Context(), weapon)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Add calculated total to response
	response := map[string]interface{}{
		"weapon":       populatedWeapon,
		"totalPoints":  totalPoints,
		"basePoints":   weapon.Points,
		"rulePoints":   totalPoints - weapon.Points,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// AddRuleToWeapon adds a rule to a weapon
func (h *PopulatedWeaponHandler) AddRuleToWeapon(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	weaponID := vars["id"]

	var request struct {
		RuleID string `json:"ruleId"`
		Tier   int    `json:"tier"`
	}

	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	// Validate tier
	if request.Tier < 1 || request.Tier > 3 {
		http.Error(w, "Tier must be 1, 2, or 3", http.StatusBadRequest)
		return
	}

	err := h.populationService.AddRuleToWeapon(r.Context(), weaponID, request.RuleID, request.Tier)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Return updated weapon with rules
	weapon, err := h.weaponService.GetWeaponByID(r.Context(), weaponID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	populatedWeapon, err := h.populationService.PopulateWeaponRules(r.Context(), weapon)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	totalPoints, err := h.populationService.CalculateTotalPoints(r.Context(), weapon)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	response := map[string]interface{}{
		"weapon":      populatedWeapon,
		"totalPoints": totalPoints,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// RemoveRuleFromWeapon removes a rule from a weapon
func (h *PopulatedWeaponHandler) RemoveRuleFromWeapon(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	weaponID := vars["id"]
	ruleID := vars["ruleId"]

	err := h.populationService.RemoveRuleFromWeapon(r.Context(), weaponID, ruleID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Return updated weapon
	weapon, err := h.weaponService.GetWeaponByID(r.Context(), weaponID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	populatedWeapon, err := h.populationService.PopulateWeaponRules(r.Context(), weapon)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	totalPoints, err := h.populationService.CalculateTotalPoints(r.Context(), weapon)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	response := map[string]interface{}{
		"weapon":      populatedWeapon,
		"totalPoints": totalPoints,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// GetWeaponsWithRules returns all weapons with populated rules
func (h *PopulatedWeaponHandler) GetWeaponsWithRules(w http.ResponseWriter, r *http.Request) {
	// Parse query parameters
	limitStr := r.URL.Query().Get("limit")
	skipStr := r.URL.Query().Get("skip")
	name := r.URL.Query().Get("name")
	populate := r.URL.Query().Get("populate") == "true"

	limit := int64(50) // default limit
	skip := int64(0)   // default skip

	if limitStr != "" {
		if l, err := strconv.ParseInt(limitStr, 10, 64); err == nil {
			limit = l
		}
	}

	if skipStr != "" {
		if s, err := strconv.ParseInt(skipStr, 10, 64); err == nil {
			skip = s
		}
	}

	var weapons []models.Weapon
	var err error

	if name != "" {
		weapons, err = h.weaponService.SearchWeaponsByName(r.Context(), name, limit, skip)
	} else {
		weapons, err = h.weaponService.GetAllWeapons(r.Context(), limit, skip)
	}

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if !populate {
		// Return weapons without populated rules
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(weapons)
		return
	}

	// Populate rules for all weapons
	var populatedWeapons []models.PopulatedWeapon
	for _, weapon := range weapons {
		populated, err := h.populationService.PopulateWeaponRules(r.Context(), &weapon)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		populatedWeapons = append(populatedWeapons, *populated)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(populatedWeapons)
}
