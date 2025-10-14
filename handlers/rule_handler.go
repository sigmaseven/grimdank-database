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

type RuleHandler struct {
	service *services.RuleService
}

func NewRuleHandler(service *services.RuleService) *RuleHandler {
	return &RuleHandler{
		service: service,
	}
}

func (h *RuleHandler) CreateRule(w http.ResponseWriter, r *http.Request) {
	var rule models.Rule
	if err := json.NewDecoder(r.Body).Decode(&rule); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	createdRule, err := h.service.CreateRule(r.Context(), &rule)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(createdRule)
}

func (h *RuleHandler) GetRule(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	rule, err := h.service.GetRuleByID(r.Context(), id)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			http.Error(w, "Rule not found", http.StatusNotFound)
		} else {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(rule)
}

func (h *RuleHandler) GetRules(w http.ResponseWriter, r *http.Request) {
	// Parse query parameters
	limitStr := r.URL.Query().Get("limit")
	skipStr := r.URL.Query().Get("skip")
	name := r.URL.Query().Get("name")

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

	var rules []models.Rule
	var err error

	if name != "" {
		rules, err = h.service.SearchRulesByName(r.Context(), name, limit, skip)
	} else {
		rules, err = h.service.GetAllRules(r.Context(), limit, skip)
	}

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(rules)
}

func (h *RuleHandler) UpdateRule(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	var rule models.Rule
	if err := json.NewDecoder(r.Body).Decode(&rule); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	err := h.service.UpdateRule(r.Context(), id, &rule)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			http.Error(w, "Rule not found", http.StatusNotFound)
		} else {
			http.Error(w, err.Error(), http.StatusBadRequest)
		}
		return
	}

	// Fetch the updated rule to return to client
	updatedRule, err := h.service.GetRuleByID(r.Context(), id)
	if err != nil {
		http.Error(w, "Failed to fetch updated rule", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(updatedRule)
}

func (h *RuleHandler) DeleteRule(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	err := h.service.DeleteRule(r.Context(), id)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			http.Error(w, "Rule not found", http.StatusNotFound)
		} else {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
