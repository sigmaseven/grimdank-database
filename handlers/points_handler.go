package handlers

import (
	"encoding/json"
	"net/http"

	"grimdank-database/models"
	"grimdank-database/services"

	"github.com/gorilla/mux"
)

// PointsHandler handles points calculation requests
type PointsHandler struct {
	rulePointsService *services.RulePointsService
}

// NewPointsHandler creates a new points handler
func NewPointsHandler(rulePointsService *services.RulePointsService) *PointsHandler {
	return &PointsHandler{
		rulePointsService: rulePointsService,
	}
}

// CalculatePointsRequest represents a request to calculate points
type CalculatePointsRequest struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	Type        string `json:"type"`
}

// CalculatePointsResponse represents the response from points calculation
type CalculatePointsResponse struct {
	CalculatedPoints []int                  `json:"calculated_points"`
	Breakdown        map[string]interface{} `json:"breakdown"`
	Explanation      string                 `json:"explanation"`
}

// CalculatePoints calculates points for a rule
func (h *PointsHandler) CalculatePoints(w http.ResponseWriter, r *http.Request) {
	var req CalculatePointsRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON format", http.StatusBadRequest)
		return
	}

	// Create a temporary rule for calculation
	rule := &models.Rule{
		Name:        req.Name,
		Description: req.Description,
		Type:        req.Type,
	}

	// Calculate points
	calculatedPoints := h.rulePointsService.CalculateRulePoints(rule)
	breakdown := h.rulePointsService.GetPointsBreakdown(rule)
	explanation := h.rulePointsService.GetPointsExplanation(rule)

	response := CalculatePointsResponse{
		CalculatedPoints: calculatedPoints,
		Breakdown:        breakdown,
		Explanation:      explanation,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// CalculatePointsForRule calculates points for an existing rule by ID
func (h *PointsHandler) CalculatePointsForRule(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	ruleID := vars["id"]

	// Get the rule first
	rule, err := h.rulePointsService.GetRuleService().GetRuleByID(r.Context(), ruleID)
	if err != nil {
		http.Error(w, "Rule not found", http.StatusNotFound)
		return
	}

	// Calculate points
	calculatedPoints := h.rulePointsService.CalculateRulePoints(rule)
	breakdown := h.rulePointsService.GetPointsBreakdown(rule)
	explanation := h.rulePointsService.GetPointsExplanation(rule)

	response := CalculatePointsResponse{
		CalculatedPoints: calculatedPoints,
		Breakdown:        breakdown,
		Explanation:      explanation,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// UpdateRuleWithCalculatedPoints updates a rule with calculated points
func (h *PointsHandler) UpdateRuleWithCalculatedPoints(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	ruleID := vars["id"]

	// Get the rule first
	rule, err := h.rulePointsService.GetRuleService().GetRuleByID(r.Context(), ruleID)
	if err != nil {
		http.Error(w, "Rule not found", http.StatusNotFound)
		return
	}

	// Update with calculated points
	updatedRule, err := h.rulePointsService.UpdateRuleWithCalculatedPoints(r.Context(), ruleID, rule)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	response := map[string]interface{}{
		"message": "Rule updated with calculated points",
		"rule":    updatedRule,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// BulkCalculatePoints calculates points for multiple rules
func (h *PointsHandler) BulkCalculatePoints(w http.ResponseWriter, r *http.Request) {
	var rules []models.Rule
	if err := json.NewDecoder(r.Body).Decode(&rules); err != nil {
		http.Error(w, "Invalid JSON format", http.StatusBadRequest)
		return
	}

	// Calculate points for all rules
	updatedRules := h.rulePointsService.BulkCalculatePoints(rules)

	response := map[string]interface{}{
		"message": "Points calculated for all rules",
		"rules":   updatedRules,
		"count":   len(updatedRules),
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// GetPointsBreakdown returns detailed breakdown for a rule
func (h *PointsHandler) GetPointsBreakdown(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	ruleID := vars["id"]

	// Get the rule first
	rule, err := h.rulePointsService.GetRuleService().GetRuleByID(r.Context(), ruleID)
	if err != nil {
		http.Error(w, "Rule not found", http.StatusNotFound)
		return
	}

	// Get breakdown
	breakdown := h.rulePointsService.GetPointsBreakdown(rule)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(breakdown)
}
