package config

import (
	"log"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	MongoURI          string
	Database          string
	ServerPort        string
	DatabaseTimeout   int // in seconds
	Environment       string
	EnvironmentConfig *EnvironmentConfig
}

func LoadConfig() *Config {
	// Load .env file if it exists
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system environment variables")
	}

	// Get environment
	env := getEnv("ENVIRONMENT", "development")
	envConfig := GetEnvironmentConfig(env)

	config := &Config{
		MongoURI:          getEnv("MONGODB_URI", "mongodb://localhost:27017"),
		Database:          getEnv("DATABASE_NAME", "grimdank_db"),
		ServerPort:        getEnv("SERVER_PORT", "8080"),
		DatabaseTimeout:   getEnvInt("DATABASE_TIMEOUT", 10),
		Environment:       env,
		EnvironmentConfig: envConfig,
	}

	// Validate configuration
	if err := ValidateConfig(config, nil); err != nil {
		log.Fatalf("❌ Configuration validation failed: %v", err)
	}

	// Log configuration (without sensitive data)
	log.Printf("Configuration loaded for environment: %s", config.Environment)
	log.Printf("  MongoDB URI: %s", maskURI(config.MongoURI))
	log.Printf("  Database: %s", config.Database)
	log.Printf("  Server Port: %s", config.ServerPort)
	log.Printf("  Database Timeout: %d seconds", config.DatabaseTimeout)
	log.Printf("  Debug Mode: %t", envConfig.DebugMode)
	log.Printf("  Log Level: %s", envConfig.LogLevel)
	log.Printf("  Metrics Enabled: %t", envConfig.EnableMetrics)
	log.Printf("  Tracing Enabled: %t", envConfig.EnableTracing)

	return config
}

// maskURI masks sensitive parts of the MongoDB URI for logging
func maskURI(uri string) string {
	if len(uri) > 20 {
		return uri[:20] + "..."
	}
	return uri
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getEnvInt(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if intValue, err := strconv.Atoi(value); err == nil {
			return intValue
		}
	}
	return defaultValue
}
