package handlers

import (
	"encoding/json"
	"net/http"

	"grimdank-database/models"
	"grimdank-database/services"
)

// UnitPointsHandler handles unit points calculation requests
type UnitPointsHandler struct {
	unitPointsService *services.UnitPointsService
	debugMode         bool
}

// NewUnitPointsHandler creates a new unit points handler
func NewUnitPointsHandler(unitPointsService *services.UnitPointsService, debugMode bool) *UnitPointsHandler {
	return &UnitPointsHandler{
		unitPointsService: unitPointsService,
		debugMode:         debugMode,
	}
}

// CalculateUnitPointsRequest represents the request for unit points calculation
type CalculateUnitPointsRequest struct {
	Unit *models.Unit `json:"unit"`
}

// CalculateUnitPointsResponse represents the response from unit points calculation
type CalculateUnitPointsResponse struct {
	TotalPoints int                           `json:"total_points"`
	Breakdown   *services.UnitPointsBreakdown `json:"breakdown"`
}

// CalculateUnitPoints calculates points for a unit
func (h *UnitPointsHandler) CalculateUnitPoints(w http.ResponseWriter, r *http.Request) {
	var req CalculateUnitPointsRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON format", http.StatusBadRequest)
		return
	}

	if req.Unit == nil {
		http.Error(w, "Unit is required", http.StatusBadRequest)
		return
	}

	// Calculate points
	breakdown, err := h.unitPointsService.CalculateUnitPoints(r.Context(), req.Unit)
	if err != nil {
		http.Error(w, "Failed to calculate unit points: "+err.Error(), http.StatusInternalServerError)
		return
	}

	response := CalculateUnitPointsResponse{
		TotalPoints: breakdown.TotalPoints,
		Breakdown:   breakdown,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
