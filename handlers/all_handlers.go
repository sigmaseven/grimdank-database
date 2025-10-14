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

// Weapon Handler
type WeaponHandler struct {
	service *services.WeaponService
}

func NewWeaponHandler(service *services.WeaponService) *WeaponHandler {
	return &WeaponHandler{
		service: service,
	}
}

func (h *WeaponHandler) CreateWeapon(w http.ResponseWriter, r *http.Request) {
	var weapon models.Weapon
	if err := json.NewDecoder(r.Body).Decode(&weapon); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	createdWeapon, err := h.service.CreateWeapon(r.Context(), &weapon)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(createdWeapon)
}

func (h *WeaponHandler) GetWeapon(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	weapon, err := h.service.GetWeaponByID(r.Context(), id)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			http.Error(w, "Weapon not found", http.StatusNotFound)
		} else {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(weapon)
}

func (h *WeaponHandler) GetWeapons(w http.ResponseWriter, r *http.Request) {
	limitStr := r.URL.Query().Get("limit")
	skipStr := r.URL.Query().Get("skip")
	name := r.URL.Query().Get("name")

	limit := int64(50)
	skip := int64(0)

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
		weapons, err = h.service.SearchWeaponsByName(r.Context(), name, limit, skip)
	} else {
		weapons, err = h.service.GetAllWeapons(r.Context(), limit, skip)
	}

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(weapons)
}

func (h *WeaponHandler) UpdateWeapon(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	var weapon models.Weapon
	if err := json.NewDecoder(r.Body).Decode(&weapon); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	err := h.service.UpdateWeapon(r.Context(), id, &weapon)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			http.Error(w, "Weapon not found", http.StatusNotFound)
		} else {
			http.Error(w, err.Error(), http.StatusBadRequest)
		}
		return
	}

	// Fetch the updated weapon to return to client
	updatedWeapon, err := h.service.GetWeaponByID(r.Context(), id)
	if err != nil {
		http.Error(w, "Failed to fetch updated weapon", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(updatedWeapon)
}

func (h *WeaponHandler) DeleteWeapon(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	err := h.service.DeleteWeapon(r.Context(), id)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			http.Error(w, "Weapon not found", http.StatusNotFound)
		} else {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// WarGear Handler
type WarGearHandler struct {
	service *services.WarGearService
}

func NewWarGearHandler(service *services.WarGearService) *WarGearHandler {
	return &WarGearHandler{
		service: service,
	}
}

func (h *WarGearHandler) CreateWarGear(w http.ResponseWriter, r *http.Request) {
	var wargear models.WarGear
	if err := json.NewDecoder(r.Body).Decode(&wargear); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	createdWarGear, err := h.service.CreateWarGear(r.Context(), &wargear)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(createdWarGear)
}

func (h *WarGearHandler) GetWarGear(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	wargear, err := h.service.GetWarGearByID(r.Context(), id)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			http.Error(w, "WarGear not found", http.StatusNotFound)
		} else {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(wargear)
}

func (h *WarGearHandler) GetAllWarGear(w http.ResponseWriter, r *http.Request) {
	limitStr := r.URL.Query().Get("limit")
	skipStr := r.URL.Query().Get("skip")
	name := r.URL.Query().Get("name")

	limit := int64(50)
	skip := int64(0)

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

	var wargear []models.WarGear
	var err error

	if name != "" {
		wargear, err = h.service.SearchWarGearByName(r.Context(), name, limit, skip)
	} else {
		wargear, err = h.service.GetAllWarGear(r.Context(), limit, skip)
	}

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(wargear)
}

func (h *WarGearHandler) UpdateWarGear(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	var wargear models.WarGear
	if err := json.NewDecoder(r.Body).Decode(&wargear); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	err := h.service.UpdateWarGear(r.Context(), id, &wargear)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			http.Error(w, "WarGear not found", http.StatusNotFound)
		} else {
			http.Error(w, err.Error(), http.StatusBadRequest)
		}
		return
	}

	// Fetch the updated wargear to return to client
	updatedWarGear, err := h.service.GetWarGearByID(r.Context(), id)
	if err != nil {
		http.Error(w, "Failed to fetch updated wargear", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(updatedWarGear)
}

func (h *WarGearHandler) DeleteWarGear(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	err := h.service.DeleteWarGear(r.Context(), id)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			http.Error(w, "WarGear not found", http.StatusNotFound)
		} else {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// Unit Handler
type UnitHandler struct {
	service *services.UnitService
}

func NewUnitHandler(service *services.UnitService) *UnitHandler {
	return &UnitHandler{
		service: service,
	}
}

func (h *UnitHandler) CreateUnit(w http.ResponseWriter, r *http.Request) {
	var unit models.Unit
	if err := json.NewDecoder(r.Body).Decode(&unit); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	createdUnit, err := h.service.CreateUnit(r.Context(), &unit)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(createdUnit)
}

func (h *UnitHandler) GetUnit(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	unit, err := h.service.GetUnitByID(r.Context(), id)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			http.Error(w, "Unit not found", http.StatusNotFound)
		} else {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(unit)
}

func (h *UnitHandler) GetUnits(w http.ResponseWriter, r *http.Request) {
	limitStr := r.URL.Query().Get("limit")
	skipStr := r.URL.Query().Get("skip")
	name := r.URL.Query().Get("name")

	limit := int64(50)
	skip := int64(0)

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

	var units []models.Unit
	var err error

	if name != "" {
		units, err = h.service.SearchUnitsByName(r.Context(), name, limit, skip)
	} else {
		units, err = h.service.GetAllUnits(r.Context(), limit, skip)
	}

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(units)
}

func (h *UnitHandler) UpdateUnit(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	var unit models.Unit
	if err := json.NewDecoder(r.Body).Decode(&unit); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	err := h.service.UpdateUnit(r.Context(), id, &unit)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			http.Error(w, "Unit not found", http.StatusNotFound)
		} else {
			http.Error(w, err.Error(), http.StatusBadRequest)
		}
		return
	}

	// Fetch the updated unit to return to client
	updatedUnit, err := h.service.GetUnitByID(r.Context(), id)
	if err != nil {
		http.Error(w, "Failed to fetch updated unit", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(updatedUnit)
}

func (h *UnitHandler) DeleteUnit(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	err := h.service.DeleteUnit(r.Context(), id)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			http.Error(w, "Unit not found", http.StatusNotFound)
		} else {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// ArmyBook Handler
type ArmyBookHandler struct {
	service *services.ArmyBookService
}

func NewArmyBookHandler(service *services.ArmyBookService) *ArmyBookHandler {
	return &ArmyBookHandler{
		service: service,
	}
}

func (h *ArmyBookHandler) CreateArmyBook(w http.ResponseWriter, r *http.Request) {
	var armyBook models.ArmyBook
	if err := json.NewDecoder(r.Body).Decode(&armyBook); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	createdArmyBook, err := h.service.CreateArmyBook(r.Context(), &armyBook)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(createdArmyBook)
}

func (h *ArmyBookHandler) GetArmyBook(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	armyBook, err := h.service.GetArmyBookByID(r.Context(), id)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			http.Error(w, "ArmyBook not found", http.StatusNotFound)
		} else {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(armyBook)
}

func (h *ArmyBookHandler) GetArmyBooks(w http.ResponseWriter, r *http.Request) {
	limitStr := r.URL.Query().Get("limit")
	skipStr := r.URL.Query().Get("skip")
	name := r.URL.Query().Get("name")

	limit := int64(50)
	skip := int64(0)

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

	var armyBooks []models.ArmyBook
	var err error

	if name != "" {
		armyBooks, err = h.service.SearchArmyBooksByName(r.Context(), name, limit, skip)
	} else {
		armyBooks, err = h.service.GetAllArmyBooks(r.Context(), limit, skip)
	}

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(armyBooks)
}

func (h *ArmyBookHandler) UpdateArmyBook(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	var armyBook models.ArmyBook
	if err := json.NewDecoder(r.Body).Decode(&armyBook); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	err := h.service.UpdateArmyBook(r.Context(), id, &armyBook)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			http.Error(w, "ArmyBook not found", http.StatusNotFound)
		} else {
			http.Error(w, err.Error(), http.StatusBadRequest)
		}
		return
	}

	// Fetch the updated army book to return to client
	updatedArmyBook, err := h.service.GetArmyBookByID(r.Context(), id)
	if err != nil {
		http.Error(w, "Failed to fetch updated army book", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(updatedArmyBook)
}

func (h *ArmyBookHandler) DeleteArmyBook(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	err := h.service.DeleteArmyBook(r.Context(), id)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			http.Error(w, "ArmyBook not found", http.StatusNotFound)
		} else {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// ArmyList Handler
type ArmyListHandler struct {
	service *services.ArmyListService
}

func NewArmyListHandler(service *services.ArmyListService) *ArmyListHandler {
	return &ArmyListHandler{
		service: service,
	}
}

func (h *ArmyListHandler) CreateArmyList(w http.ResponseWriter, r *http.Request) {
	var armyList models.ArmyList
	if err := json.NewDecoder(r.Body).Decode(&armyList); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	createdArmyList, err := h.service.CreateArmyList(r.Context(), &armyList)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(createdArmyList)
}

func (h *ArmyListHandler) GetArmyList(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	armyList, err := h.service.GetArmyListByID(r.Context(), id)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			http.Error(w, "ArmyList not found", http.StatusNotFound)
		} else {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(armyList)
}

func (h *ArmyListHandler) GetArmyLists(w http.ResponseWriter, r *http.Request) {
	limitStr := r.URL.Query().Get("limit")
	skipStr := r.URL.Query().Get("skip")
	name := r.URL.Query().Get("name")

	limit := int64(50)
	skip := int64(0)

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

	var armyLists []models.ArmyList
	var err error

	if name != "" {
		armyLists, err = h.service.SearchArmyListsByName(r.Context(), name, limit, skip)
	} else {
		armyLists, err = h.service.GetAllArmyLists(r.Context(), limit, skip)
	}

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(armyLists)
}

func (h *ArmyListHandler) UpdateArmyList(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	var armyList models.ArmyList
	if err := json.NewDecoder(r.Body).Decode(&armyList); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	err := h.service.UpdateArmyList(r.Context(), id, &armyList)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			http.Error(w, "ArmyList not found", http.StatusNotFound)
		} else {
			http.Error(w, err.Error(), http.StatusBadRequest)
		}
		return
	}

	// Fetch the updated army list to return to client
	updatedArmyList, err := h.service.GetArmyListByID(r.Context(), id)
	if err != nil {
		http.Error(w, "Failed to fetch updated army list", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(updatedArmyList)
}

func (h *ArmyListHandler) DeleteArmyList(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	err := h.service.DeleteArmyList(r.Context(), id)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			http.Error(w, "ArmyList not found", http.StatusNotFound)
		} else {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
