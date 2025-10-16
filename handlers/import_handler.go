package handlers

import (
	"encoding/json"
	"net/http"

	"grimdank-database/models"
	"grimdank-database/services"

	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Import Handler
type ImportHandler struct {
	ruleService     *services.RuleService
	weaponService   *services.WeaponService
	wargearService  *services.WarGearService
	unitService     *services.UnitService
	armyBookService *services.ArmyBookService
	armyListService *services.ArmyListService
	factionService  *services.FactionService
}

func NewImportHandler(
	ruleService *services.RuleService,
	weaponService *services.WeaponService,
	wargearService *services.WarGearService,
	unitService *services.UnitService,
	armyBookService *services.ArmyBookService,
	armyListService *services.ArmyListService,
	factionService *services.FactionService,
) *ImportHandler {
	return &ImportHandler{
		ruleService:     ruleService,
		weaponService:   weaponService,
		wargearService:  wargearService,
		unitService:     unitService,
		armyBookService: armyBookService,
		armyListService: armyListService,
		factionService:  factionService,
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

// Import Factions
func (h *ImportHandler) ImportFactions(w http.ResponseWriter, r *http.Request) {
	var factions []models.Faction
	if err := json.NewDecoder(r.Body).Decode(&factions); err != nil {
		http.Error(w, "Invalid JSON format", http.StatusBadRequest)
		return
	}

	importedIDs, err := h.factionService.BulkImportFactions(r.Context(), factions)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	response := map[string]interface{}{
		"message":     "Factions imported successfully",
		"count":       len(importedIDs),
		"importedIds": importedIDs,
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
				Points:      []int{5, 10, 15},
			},
		}
	case "weapons":
		template = []models.Weapon{
			{
				Name:    "Example Weapon",
				Type:    "ranged",
				Range:   24,
				AP:      "0",
				Attacks: 1,
				Rules:   []models.RuleReference{},
				Points:  0,
			},
		}
	case "wargear":
		template = []models.WarGear{
			{
				Name:        "Example WarGear",
				Description: "This is an example wargear description",
				Points:      5,
				Rules:       []models.RuleReference{},
			},
		}
	case "units":
		template = []models.Unit{
			{
				Name:             "Example Unit",
				Type:             "Infantry",
				Melee:            3,
				Ranged:           3,
				Morale:           7,
				Defense:          3,
				Points:           10,
				Amount:           5,
				Max:              10,
				Rules:            []models.RuleReference{},
				AvailableWeapons: []primitive.ObjectID{},
				AvailableWarGear: []primitive.ObjectID{},
				Weapons:          []models.WeaponReference{},
				WarGear:          []primitive.ObjectID{},
			},
		}
	case "armybooks":
		template = []models.ArmyBook{
			{
				Name:        "Example Army Book",
				FactionID:   primitive.NewObjectID(),
				Description: "This is an example army book",
				Units:       []primitive.ObjectID{},
				Rules:       []models.RuleReference{},
			},
		}
	case "armylists":
		template = []models.ArmyList{
			{
				Name:        "Example Army List",
				Player:      "Player Name",
				FactionID:   primitive.NewObjectID(),
				Points:      2000,
				Units:       []primitive.ObjectID{},
				Description: "This is an example army list",
			},
		}
	case "factions":
		template = []models.Faction{
			{
				Name:        "Example Faction",
				Description: "This is an example faction",
				Type:        "Official",
			},
		}
	default:
		http.Error(w, "Invalid entity type", http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(template)
}
