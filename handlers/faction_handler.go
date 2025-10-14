package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"github.com/gorilla/mux"

	"grimdank-database/models"
	"grimdank-database/services"
)

type FactionHandler struct {
	service *services.FactionService
}

func NewFactionHandler(service *services.FactionService) *FactionHandler {
	return &FactionHandler{
		service: service,
	}
}

func (h *FactionHandler) CreateFaction(w http.ResponseWriter, r *http.Request) {
	var faction models.Faction
	if err := json.NewDecoder(r.Body).Decode(&faction); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	createdFaction, err := h.service.CreateFaction(r.Context(), &faction)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(createdFaction)
}

func (h *FactionHandler) GetFaction(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	faction, err := h.service.GetFactionByID(r.Context(), id)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			http.Error(w, "Faction not found", http.StatusNotFound)
		} else {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(faction)
}

func (h *FactionHandler) GetFactions(w http.ResponseWriter, r *http.Request) {
	// Parse query parameters
	limitStr := r.URL.Query().Get("limit")
	skipStr := r.URL.Query().Get("skip")
	name := r.URL.Query().Get("name")

	limit := 0
	skip := 0

	if limitStr != "" {
		if parsedLimit, err := strconv.Atoi(limitStr); err == nil {
			limit = parsedLimit
		}
	}

	if skipStr != "" {
		if parsedSkip, err := strconv.Atoi(skipStr); err == nil {
			skip = parsedSkip
		}
	}

	var factions []models.Faction
	var err error

	if name != "" {
		factions, err = h.service.SearchFactionsByName(r.Context(), name, limit, skip)
	} else {
		factions, err = h.service.GetAllFactions(r.Context(), limit, skip)
	}

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(factions)
}

func (h *FactionHandler) UpdateFaction(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	var faction models.Faction
	if err := json.NewDecoder(r.Body).Decode(&faction); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	err := h.service.UpdateFaction(r.Context(), id, &faction)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			http.Error(w, "Faction not found", http.StatusNotFound)
		} else {
			http.Error(w, err.Error(), http.StatusBadRequest)
		}
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(faction)
}

func (h *FactionHandler) DeleteFaction(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	err := h.service.DeleteFaction(r.Context(), id)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			http.Error(w, "Faction not found", http.StatusNotFound)
		} else {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
