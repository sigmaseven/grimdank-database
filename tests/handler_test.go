package tests

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"grimdank-database/handlers"
	"grimdank-database/models"
	"grimdank-database/services"

	"github.com/gorilla/mux"
)

func TestRuleHandler(t *testing.T) {
	// Setup
	SetupTestServices(t)
	defer CleanupTestDB(t)

	handler := handlers.NewRuleHandler(testServices.RuleService)

	t.Run("Create Rule", func(t *testing.T) {
		rule := CreateTestRule()
		jsonData, _ := json.Marshal(rule)

		req := httptest.NewRequest("POST", "/rules", bytes.NewBuffer(jsonData))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()

		handler.CreateRule(w, req)

		if w.Code != http.StatusCreated {
			t.Errorf("Expected status %d, got %d", http.StatusCreated, w.Code)
		}

		var response models.Rule
		err := json.NewDecoder(w.Body).Decode(&response)
		if err != nil {
			t.Fatalf("Failed to decode response: %v", err)
		}

		if response.Name != rule.Name {
			t.Errorf("Expected name %s, got %s", rule.Name, response.Name)
		}
	})

	t.Run("Create Rule With Invalid JSON", func(t *testing.T) {
		req := httptest.NewRequest("POST", "/rules", bytes.NewBufferString("invalid json"))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()

		handler.CreateRule(w, req)

		if w.Code != http.StatusBadRequest {
			t.Errorf("Expected status %d, got %d", http.StatusBadRequest, w.Code)
		}
	})

	t.Run("Get Rule", func(t *testing.T) {
		// Create a rule first
		rule := CreateTestRule()
		createdRule, err := testServices.RuleService.CreateRule(context.Background(), rule)
		if err != nil {
			t.Fatalf("Failed to create rule: %v", err)
		}

		req := httptest.NewRequest("GET", "/rules/"+createdRule.ID.Hex(), nil)
		w := httptest.NewRecorder()

		// Create a gorilla/mux router to handle the route
		router := mux.NewRouter()
		router.HandleFunc("/rules/{id}", handler.GetRule)
		router.ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Errorf("Expected status %d, got %d", http.StatusOK, w.Code)
		}

		var response models.Rule
		err = json.NewDecoder(w.Body).Decode(&response)
		if err != nil {
			t.Fatalf("Failed to decode response: %v", err)
		}

		if response.Name != createdRule.Name {
			t.Errorf("Expected name %s, got %s", createdRule.Name, response.Name)
		}
	})

	t.Run("Get Non-Existent Rule", func(t *testing.T) {
		nonExistentID := "507f1f77bcf86cd799439011"
		req := httptest.NewRequest("GET", "/rules/"+nonExistentID, nil)
		w := httptest.NewRecorder()

		// Create a mux router to handle the route
		mux := http.NewServeMux()
		mux.HandleFunc("/rules/{id}", handler.GetRule)
		mux.ServeHTTP(w, req)

		if w.Code != http.StatusNotFound {
			t.Errorf("Expected status %d, got %d", http.StatusNotFound, w.Code)
		}
	})

	t.Run("Get Rules", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/rules", nil)
		w := httptest.NewRecorder()

		handler.GetRules(w, req)

		if w.Code != http.StatusOK {
			t.Errorf("Expected status %d, got %d", http.StatusOK, w.Code)
		}

		var response []models.Rule
		err := json.NewDecoder(w.Body).Decode(&response)
		if err != nil {
			t.Fatalf("Failed to decode response: %v", err)
		}

		// Should be an array (even if empty)
		if response == nil {
			t.Error("Expected array response, got nil")
		}
	})

	t.Run("Update Rule", func(t *testing.T) {
		// Create a rule first
		rule := CreateTestRule()
		createdRule, err := testServices.RuleService.CreateRule(context.Background(), rule)
		if err != nil {
			t.Fatalf("Failed to create rule: %v", err)
		}

		// Update the rule
		createdRule.Description = "Updated description"
		jsonData, _ := json.Marshal(createdRule)

		req := httptest.NewRequest("PUT", "/rules/"+createdRule.ID.Hex(), bytes.NewBuffer(jsonData))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()

		// Create a gorilla/mux router to handle the route
		router := mux.NewRouter()
		router.HandleFunc("/rules/{id}", handler.UpdateRule)
		router.ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Errorf("Expected status %d, got %d", http.StatusOK, w.Code)
		}
	})

	t.Run("Delete Rule", func(t *testing.T) {
		// Create a rule first
		rule := CreateTestRule()
		createdRule, err := testServices.RuleService.CreateRule(context.Background(), rule)
		if err != nil {
			t.Fatalf("Failed to create rule: %v", err)
		}

		req := httptest.NewRequest("DELETE", "/rules/"+createdRule.ID.Hex(), nil)
		w := httptest.NewRecorder()

		// Create a gorilla/mux router to handle the route
		router := mux.NewRouter()
		router.HandleFunc("/rules/{id}", handler.DeleteRule)
		router.ServeHTTP(w, req)

		if w.Code != http.StatusNoContent {
			t.Errorf("Expected status %d, got %d", http.StatusNoContent, w.Code)
		}
	})
}

func TestWeaponHandler(t *testing.T) {
	// Setup
	SetupTestServices(t)
	defer CleanupTestDB(t)

	handler := handlers.NewWeaponHandler(testServices.WeaponService)

	t.Run("Create Weapon", func(t *testing.T) {
		weapon := CreateTestWeapon()
		jsonData, _ := json.Marshal(weapon)

		req := httptest.NewRequest("POST", "/weapons", bytes.NewBuffer(jsonData))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()

		handler.CreateWeapon(w, req)

		if w.Code != http.StatusCreated {
			t.Errorf("Expected status %d, got %d", http.StatusCreated, w.Code)
		}
	})

	t.Run("Create Weapon With Invalid JSON", func(t *testing.T) {
		req := httptest.NewRequest("POST", "/weapons", bytes.NewBufferString("invalid json"))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()

		handler.CreateWeapon(w, req)

		if w.Code != http.StatusBadRequest {
			t.Errorf("Expected status %d, got %d", http.StatusBadRequest, w.Code)
		}
	})

	t.Run("Get Weapon", func(t *testing.T) {
		// Create a weapon first
		weapon := CreateTestWeapon()
		createdWeapon, err := testServices.WeaponService.CreateWeapon(context.Background(), weapon)
		if err != nil {
			t.Fatalf("Failed to create weapon: %v", err)
		}

		req := httptest.NewRequest("GET", "/weapons/"+createdWeapon.ID.Hex(), nil)
		w := httptest.NewRecorder()

		// Create a gorilla/mux router to handle the route
		router := mux.NewRouter()
		router.HandleFunc("/weapons/{id}", handler.GetWeapon)
		router.ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Errorf("Expected status %d, got %d", http.StatusOK, w.Code)
		}
	})

	t.Run("Get Weapons", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/weapons", nil)
		w := httptest.NewRecorder()

		handler.GetWeapons(w, req)

		if w.Code != http.StatusOK {
			t.Errorf("Expected status %d, got %d", http.StatusOK, w.Code)
		}
	})
}

func TestPointsHandler(t *testing.T) {
	// Setup
	SetupTestServices(t)
	defer CleanupTestDB(t)

	handler := handlers.NewPointsHandler(services.NewRulePointsService(testServices.RuleService))

	t.Run("Calculate Points", func(t *testing.T) {
		request := handlers.CalculatePointsRequest{
			Name:        "Test Rule",
			Description: "A test rule",
			Type:        "Special Ability",
		}

		jsonData, _ := json.Marshal(request)
		req := httptest.NewRequest("POST", "/points/calculate", bytes.NewBuffer(jsonData))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()

		handler.CalculatePoints(w, req)

		if w.Code != http.StatusOK {
			t.Errorf("Expected status %d, got %d", http.StatusOK, w.Code)
		}

		var response handlers.CalculatePointsResponse
		err := json.NewDecoder(w.Body).Decode(&response)
		if err != nil {
			t.Fatalf("Failed to decode response: %v", err)
		}

		if len(response.CalculatedPoints) == 0 {
			t.Error("Expected calculated points to be returned")
		}
	})

	t.Run("Calculate Points With Invalid JSON", func(t *testing.T) {
		req := httptest.NewRequest("POST", "/points/calculate", bytes.NewBufferString("invalid json"))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()

		handler.CalculatePoints(w, req)

		if w.Code != http.StatusBadRequest {
			t.Errorf("Expected status %d, got %d", http.StatusBadRequest, w.Code)
		}
	})
}

func TestWeaponPointsHandler(t *testing.T) {
	handler := handlers.NewWeaponPointsHandler()

	t.Run("Calculate Weapon Points", func(t *testing.T) {
		stats := services.WeaponStats{
			Type:    "Melee",
			AP:      "3+",
			Attacks: "2",
			Range:   0,
		}

		jsonData, _ := json.Marshal(stats)
		req := httptest.NewRequest("POST", "/weapon-points/calculate", bytes.NewBuffer(jsonData))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()

		handler.CalculateWeaponPoints(w, req)

		if w.Code != http.StatusOK {
			t.Errorf("Expected status %d, got %d", http.StatusOK, w.Code)
		}

		var response map[string]interface{}
		err := json.NewDecoder(w.Body).Decode(&response)
		if err != nil {
			t.Fatalf("Failed to decode response: %v", err)
		}

		if _, exists := response["points"]; !exists {
			t.Error("Expected 'points' in response")
		}
	})

	t.Run("Calculate Weapon Points With Invalid JSON", func(t *testing.T) {
		req := httptest.NewRequest("POST", "/weapon-points/calculate", bytes.NewBufferString("invalid json"))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()

		handler.CalculateWeaponPoints(w, req)

		if w.Code != http.StatusBadRequest {
			t.Errorf("Expected status %d, got %d", http.StatusBadRequest, w.Code)
		}
	})

	t.Run("Calculate Weapon Points With Missing Type", func(t *testing.T) {
		stats := services.WeaponStats{
			Type:    "", // Missing type
			AP:      "3+",
			Attacks: "2",
			Range:   0,
		}

		jsonData, _ := json.Marshal(stats)
		req := httptest.NewRequest("POST", "/weapon-points/calculate", bytes.NewBuffer(jsonData))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()

		handler.CalculateWeaponPoints(w, req)

		if w.Code != http.StatusBadRequest {
			t.Errorf("Expected status %d, got %d", http.StatusBadRequest, w.Code)
		}
	})

	t.Run("Get Weapon Points Breakdown", func(t *testing.T) {
		stats := services.WeaponStats{
			Type:    "Melee",
			AP:      "3+",
			Attacks: "2",
			Range:   0,
		}

		jsonData, _ := json.Marshal(stats)
		req := httptest.NewRequest("POST", "/weapon-points/breakdown", bytes.NewBuffer(jsonData))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()

		handler.GetWeaponPointsBreakdown(w, req)

		if w.Code != http.StatusOK {
			t.Errorf("Expected status %d, got %d", http.StatusOK, w.Code)
		}

		var response map[string]interface{}
		err := json.NewDecoder(w.Body).Decode(&response)
		if err != nil {
			t.Fatalf("Failed to decode response: %v", err)
		}

		if _, exists := response["calculatedPoints"]; !exists {
			t.Error("Expected 'calculatedPoints' in breakdown")
		}
	})
}

func TestImportHandler(t *testing.T) {
	// Setup
	SetupTestServices(t)
	defer CleanupTestDB(t)

	handler := handlers.NewImportHandler(
		testServices.RuleService,
		testServices.WeaponService,
		testServices.WarGearService,
		testServices.UnitService,
		testServices.ArmyBookService,
		testServices.ArmyListService,
		testServices.FactionService,
	)

	t.Run("Import Rules", func(t *testing.T) {
		rules := []models.Rule{
			{Name: "Rule 1", Description: "First rule", Type: "Special Ability"},
			{Name: "Rule 2", Description: "Second rule", Type: "Weapon Rule"},
		}

		jsonData, _ := json.Marshal(rules)
		req := httptest.NewRequest("POST", "/import/rules", bytes.NewBuffer(jsonData))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()

		handler.ImportRules(w, req)

		if w.Code != http.StatusCreated {
			t.Errorf("Expected status %d, got %d", http.StatusCreated, w.Code)
		}

		var response map[string]interface{}
		err := json.NewDecoder(w.Body).Decode(&response)
		if err != nil {
			t.Fatalf("Failed to decode response: %v", err)
		}

		if count, exists := response["count"]; !exists || count != float64(2) {
			t.Errorf("Expected count 2, got %v", count)
		}
	})

	t.Run("Import Rules With Invalid JSON", func(t *testing.T) {
		req := httptest.NewRequest("POST", "/import/rules", bytes.NewBufferString("invalid json"))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()

		handler.ImportRules(w, req)

		if w.Code != http.StatusBadRequest {
			t.Errorf("Expected status %d, got %d", http.StatusBadRequest, w.Code)
		}
	})
}
