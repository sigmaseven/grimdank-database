package handlers

import (
	"encoding/json"
	"net/http"

	"grimdank-database/models"
	"grimdank-database/services"

	"github.com/gorilla/mux"
)

// Import Handler
type ImportHandler struct {
	ruleService     *services.RuleService
	weaponService   *services.WeaponService
	wargearService  *services.WarGearService
	unitService     *services.UnitService
	armyBookService *services.ArmyBookService
	armyListService *services.ArmyListService
}

func NewImportHandler(
	ruleService *services.RuleService,
	weaponService *services.WeaponService,
	wargearService *services.WarGearService,
	unitService *services.UnitService,
	armyBookService *services.ArmyBookService,
	armyListService *services.ArmyListService,
) *ImportHandler {
	return &ImportHandler{
		ruleService:     ruleService,
		weaponService:   weaponService,
		wargearService:  wargearService,
		unitService:     unitService,
		armyBookService: armyBookService,
		armyListService: armyListService,
	}
}

// Import Rules
func (h *ImportHandler) ImportRules(w http.ResponseWriter, r *http.Request) {
	var rules []models.Rule
	if err := json.NewDecoder(r.Body).Decode(&rules); err != nil {
		http.Error(w, "Invalid JSON format", http.StatusBadRequest)
		return
	}

	importedIDs, err := h.ruleService.BulkImportRules(r.Context(), rules)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	response := map[string]interface{}{
		"message":      "Rules imported successfully",
		"count":        len(importedIDs),
		"imported_ids": importedIDs,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(response)
}

// Import Weapons
func (h *ImportHandler) ImportWeapons(w http.ResponseWriter, r *http.Request) {
	var weapons []models.Weapon
	if err := json.NewDecoder(r.Body).Decode(&weapons); err != nil {
		http.Error(w, "Invalid JSON format", http.StatusBadRequest)
		return
	}

	importedIDs, err := h.weaponService.BulkImportWeapons(r.Context(), weapons)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	response := map[string]interface{}{
		"message":      "Weapons imported successfully",
		"count":        len(importedIDs),
		"imported_ids": importedIDs,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(response)
}

// Import WarGear
func (h *ImportHandler) ImportWarGear(w http.ResponseWriter, r *http.Request) {
	var wargear []models.WarGear
	if err := json.NewDecoder(r.Body).Decode(&wargear); err != nil {
		http.Error(w, "Invalid JSON format", http.StatusBadRequest)
		return
	}

	importedIDs, err := h.wargearService.BulkImportWarGear(r.Context(), wargear)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	response := map[string]interface{}{
		"message":      "WarGear imported successfully",
		"count":        len(importedIDs),
		"imported_ids": importedIDs,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(response)
}

// Import Units
func (h *ImportHandler) ImportUnits(w http.ResponseWriter, r *http.Request) {
	var units []models.Unit
	if err := json.NewDecoder(r.Body).Decode(&units); err != nil {
		http.Error(w, "Invalid JSON format", http.StatusBadRequest)
		return
	}

	importedIDs, err := h.unitService.BulkImportUnits(r.Context(), units)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	response := map[string]interface{}{
		"message":      "Units imported successfully",
		"count":        len(importedIDs),
		"imported_ids": importedIDs,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(response)
}

// Import Army Books
func (h *ImportHandler) ImportArmyBooks(w http.ResponseWriter, r *http.Request) {
	var armyBooks []models.ArmyBook
	if err := json.NewDecoder(r.Body).Decode(&armyBooks); err != nil {
		http.Error(w, "Invalid JSON format", http.StatusBadRequest)
		return
	}

	importedIDs, err := h.armyBookService.BulkImportArmyBooks(r.Context(), armyBooks)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	response := map[string]interface{}{
		"message":      "Army Books imported successfully",
		"count":        len(importedIDs),
		"imported_ids": importedIDs,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(response)
}

// Import Army Lists
func (h *ImportHandler) ImportArmyLists(w http.ResponseWriter, r *http.Request) {
	var armyLists []models.ArmyList
	if err := json.NewDecoder(r.Body).Decode(&armyLists); err != nil {
		http.Error(w, "Invalid JSON format", http.StatusBadRequest)
		return
	}

	importedIDs, err := h.armyListService.BulkImportArmyLists(r.Context(), armyLists)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	response := map[string]interface{}{
		"message":      "Army Lists imported successfully",
		"count":        len(importedIDs),
		"imported_ids": importedIDs,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(response)
}

// Get Import Template
func (h *ImportHandler) GetImportTemplate(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	entityType := vars["type"]

	var template interface{}

	switch entityType {
	case "rules":
		template = []models.Rule{
			{
				Name:        "Example Rule",
				Description: "This is an example rule description",
				Type:        "Special Rule",
				Points:      0,
			},
		}
	case "weapons":
		template = []models.Weapon{
			{
				Name:     "Example Weapon",
				Type:     "Rapid Fire",
				Range:    "24\"",
				Strength: "4",
				AP:       "0",
				Damage:   "1",
				Rules:    []models.Rule{},
				Points:   0,
			},
		}
	case "wargear":
		template = []models.WarGear{
			{
				Name:        "Example WarGear",
				Type:        "Equipment",
				Description: "This is an example wargear description",
				Points:      5,
				Rules:       []models.Rule{},
				Weapons:     []models.Weapon{},
			},
		}
	case "units":
		template = []models.Unit{
			{
				Name:            "Example Unit",
				Type:            "Infantry",
				Movement:        "6\"",
				WeaponSkill:     "3+",
				BallisticSkill:  "3+",
				Strength:        "3",
				Toughness:       "3",
				Wounds:          "1",
				Initiative:      "3",
				Attacks:         "1",
				Leadership:      "7",
				Save:            "3+",
				Points:          10,
				Rules:           []models.Rule{},
				AvailableWeapons: []models.Weapon{},
				AvailableWarGear: []models.WarGear{},
			},
		}
	case "armybooks":
		template = []models.ArmyBook{
			{
				Name:        "Example Army Book",
				Faction:     "Space Marines",
				Description: "This is an example army book",
				Units:       []models.Unit{},
				Rules:       []models.Rule{},
			},
		}
	case "armylists":
		template = []models.ArmyList{
			{
				Name:        "Example Army List",
				Player:      "Player Name",
				Faction:     "Space Marines",
				Points:      2000,
				Units:       []models.Unit{},
				Description: "This is an example army list",
			},
		}
	default:
		http.Error(w, "Invalid entity type", http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(template)
}
