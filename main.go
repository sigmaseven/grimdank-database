package main

import (
	"context"
	"log"
	"net/http"
	"time"

	"grimdank-database/config"
	"grimdank-database/database"
	"grimdank-database/handlers"
	"grimdank-database/repositories"
	"grimdank-database/services"

	"github.com/gorilla/mux"
)

func main() {
	// Load configuration
	cfg := config.LoadConfig()

	// Connect to database
	log.Println("Initializing database connection...")
	db, err := database.Connect(cfg.MongoURI, cfg.Database)
	if err != nil {
		log.Fatal("❌ Failed to connect to database:", err)
	}
	defer func() {
		log.Println("Disconnecting from database...")
		if err := db.Disconnect(); err != nil {
			log.Printf("Error disconnecting from database: %v", err)
		}
	}()

	// Initialize repositories
	ruleRepo := repositories.NewRuleRepository(db.Database.Collection("rules"))
	weaponRepo := repositories.NewWeaponRepository(db.Database.Collection("weapons"))
	wargearRepo := repositories.NewWarGearRepository(db.Database.Collection("wargear"))
	unitRepo := repositories.NewUnitRepository(db.Database.Collection("units"))
	armyBookRepo := repositories.NewArmyBookRepository(db.Database.Collection("armybooks"))
	armyListRepo := repositories.NewArmyListRepository(db.Database.Collection("armylists"))

	// Initialize services
	ruleService := services.NewRuleService(ruleRepo)
	weaponService := services.NewWeaponService(weaponRepo)
	wargearService := services.NewWarGearService(wargearRepo)
	unitService := services.NewUnitService(unitRepo)
	armyBookService := services.NewArmyBookService(armyBookRepo)
	armyListService := services.NewArmyListService(armyListRepo)

	// Initialize handlers
	ruleHandler := handlers.NewRuleHandler(ruleService)
	weaponHandler := handlers.NewWeaponHandler(weaponService)
	wargearHandler := handlers.NewWarGearHandler(wargearService)
	unitHandler := handlers.NewUnitHandler(unitService)
	armyBookHandler := handlers.NewArmyBookHandler(armyBookService)
	armyListHandler := handlers.NewArmyListHandler(armyListService)
	importHandler := handlers.NewImportHandler(ruleService, weaponService, wargearService, unitService, armyBookService, armyListService)

	// Setup routes
	router := mux.NewRouter()

	// Health check endpoint
	router.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		// Test database connection
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()

		if err := db.Client.Ping(ctx, nil); err != nil {
			w.WriteHeader(http.StatusServiceUnavailable)
			w.Write([]byte(`{"status":"unhealthy","database":"disconnected"}`))
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"healthy","database":"connected"}`))
	}).Methods("GET")

	api := router.PathPrefix("/api/v1").Subrouter()

	// Rule routes
	api.HandleFunc("/rules", ruleHandler.CreateRule).Methods("POST")
	api.HandleFunc("/rules", ruleHandler.GetRules).Methods("GET")
	api.HandleFunc("/rules/{id}", ruleHandler.GetRule).Methods("GET")
	api.HandleFunc("/rules/{id}", ruleHandler.UpdateRule).Methods("PUT")
	api.HandleFunc("/rules/{id}", ruleHandler.DeleteRule).Methods("DELETE")

	// Weapon routes
	api.HandleFunc("/weapons", weaponHandler.CreateWeapon).Methods("POST")
	api.HandleFunc("/weapons", weaponHandler.GetWeapons).Methods("GET")
	api.HandleFunc("/weapons/{id}", weaponHandler.GetWeapon).Methods("GET")
	api.HandleFunc("/weapons/{id}", weaponHandler.UpdateWeapon).Methods("PUT")
	api.HandleFunc("/weapons/{id}", weaponHandler.DeleteWeapon).Methods("DELETE")

	// WarGear routes
	api.HandleFunc("/wargear", wargearHandler.CreateWarGear).Methods("POST")
	api.HandleFunc("/wargear", wargearHandler.GetAllWarGear).Methods("GET")
	api.HandleFunc("/wargear/{id}", wargearHandler.GetWarGear).Methods("GET")
	api.HandleFunc("/wargear/{id}", wargearHandler.UpdateWarGear).Methods("PUT")
	api.HandleFunc("/wargear/{id}", wargearHandler.DeleteWarGear).Methods("DELETE")

	// Unit routes
	api.HandleFunc("/units", unitHandler.CreateUnit).Methods("POST")
	api.HandleFunc("/units", unitHandler.GetUnits).Methods("GET")
	api.HandleFunc("/units/{id}", unitHandler.GetUnit).Methods("GET")
	api.HandleFunc("/units/{id}", unitHandler.UpdateUnit).Methods("PUT")
	api.HandleFunc("/units/{id}", unitHandler.DeleteUnit).Methods("DELETE")

	// ArmyBook routes
	api.HandleFunc("/armybooks", armyBookHandler.CreateArmyBook).Methods("POST")
	api.HandleFunc("/armybooks", armyBookHandler.GetArmyBooks).Methods("GET")
	api.HandleFunc("/armybooks/{id}", armyBookHandler.GetArmyBook).Methods("GET")
	api.HandleFunc("/armybooks/{id}", armyBookHandler.UpdateArmyBook).Methods("PUT")
	api.HandleFunc("/armybooks/{id}", armyBookHandler.DeleteArmyBook).Methods("DELETE")

	// ArmyList routes
	api.HandleFunc("/armylists", armyListHandler.CreateArmyList).Methods("POST")
	api.HandleFunc("/armylists", armyListHandler.GetArmyLists).Methods("GET")
	api.HandleFunc("/armylists/{id}", armyListHandler.GetArmyList).Methods("GET")
	api.HandleFunc("/armylists/{id}", armyListHandler.UpdateArmyList).Methods("PUT")
	api.HandleFunc("/armylists/{id}", armyListHandler.DeleteArmyList).Methods("DELETE")

	// Import routes
	api.HandleFunc("/import/rules", importHandler.ImportRules).Methods("POST")
	api.HandleFunc("/import/weapons", importHandler.ImportWeapons).Methods("POST")
	api.HandleFunc("/import/wargear", importHandler.ImportWarGear).Methods("POST")
	api.HandleFunc("/import/units", importHandler.ImportUnits).Methods("POST")
	api.HandleFunc("/import/armybooks", importHandler.ImportArmyBooks).Methods("POST")
	api.HandleFunc("/import/armylists", importHandler.ImportArmyLists).Methods("POST")
	api.HandleFunc("/import/template/{type}", importHandler.GetImportTemplate).Methods("GET")

	// Add CORS middleware
	router.Use(func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

			if r.Method == "OPTIONS" {
				w.WriteHeader(http.StatusOK)
				return
			}

			next.ServeHTTP(w, r)
		})
	})

	// Start server
	log.Printf("Server starting on port %s", cfg.ServerPort)
	log.Fatal(http.ListenAndServe(":"+cfg.ServerPort, router))
}
