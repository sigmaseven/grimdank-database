package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson/primitive"

	"grimdank-database/services"
)

type PopulatedWarGearHandler struct {
	wargearService    *services.WarGearService
	populationService *services.PopulationService
}

func NewPopulatedWarGearHandler(wargearService *services.WarGearService, populationService *services.PopulationService) *PopulatedWarGearHandler {
	return &PopulatedWarGearHandler{
		wargearService:    wargearService,
		populationService: populationService,
	}
}

// GetWarGearWithRules gets a wargear item with its rules populated
func (h *PopulatedWarGearHandler) GetWarGearWithRules(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	wargearID := vars["id"]

	// Get the wargear item
	wargear, err := h.wargearService.GetWarGearByID(r.Context(), wargearID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	// Populate the rules
	populatedWarGear, err := h.populationService.PopulateWarGearRules(r.Context(), wargear)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(populatedWarGear)
}

// GetWarGearWithRulesList gets all wargear items with their rules populated
func (h *PopulatedWarGearHandler) GetWarGearWithRulesList(w http.ResponseWriter, r *http.Request) {
	// Get all wargear items
	wargearList, err := h.wargearService.GetAllWarGear(r.Context(), 0, 0)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Populate rules for each wargear item
	var populatedWarGearList []interface{}
	for _, wargear := range wargearList {
		populatedWarGear, err := h.populationService.PopulateWarGearRules(r.Context(), &wargear)
		if err != nil {
			// Log error but continue with other items
			continue
		}
		populatedWarGearList = append(populatedWarGearList, populatedWarGear)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(populatedWarGearList)
}

// AddRuleToWarGear adds a rule to a wargear item
func (h *PopulatedWarGearHandler) AddRuleToWarGear(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	wargearID := vars["id"]

	var request struct {
		RuleID string `json:"ruleId"`
		Tier   int    `json:"tier"`
	}

	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	if request.Tier < 1 || request.Tier > 3 {
		http.Error(w, "Tier must be 1, 2, or 3", http.StatusBadRequest)
		return
	}

	err := h.populationService.AddRuleToWarGear(r.Context(), wargearID, request.RuleID, request.Tier)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Return updated wargear with rules
	wargear, err := h.wargearService.GetWarGearByID(r.Context(), wargearID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	populatedWarGear, err := h.populationService.PopulateWarGearRules(r.Context(), wargear)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(populatedWarGear)
}

// RemoveRuleFromWarGear removes a rule from a wargear item
func (h *PopulatedWarGearHandler) RemoveRuleFromWarGear(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	wargearID := vars["id"]
	ruleID := vars["ruleId"]

	// Convert ruleID to ObjectID
	ruleObjectID, err := primitive.ObjectIDFromHex(ruleID)
	if err != nil {
		http.Error(w, "Invalid rule ID", http.StatusBadRequest)
		return
	}

	err = h.populationService.RemoveRuleFromWarGear(r.Context(), wargearID, ruleObjectID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Return updated wargear with rules
	wargear, err := h.wargearService.GetWarGearByID(r.Context(), wargearID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	populatedWarGear, err := h.populationService.PopulateWarGearRules(r.Context(), wargear)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(populatedWarGear)
}
