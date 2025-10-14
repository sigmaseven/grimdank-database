package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	MongoURI   string
	Database   string
	ServerPort string
}

func LoadConfig() *Config {
	// Load .env file if it exists
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system environment variables")
	}

	config := &Config{
		MongoURI:   getEnv("MONGODB_URI", "mongodb://localhost:27017"),
		Database:   getEnv("DATABASE_NAME", "grimdank_db"),
		ServerPort: getEnv("SERVER_PORT", "8080"),
	}

	// Log configuration (without sensitive data)
	log.Printf("Configuration loaded:")
	log.Printf("  MongoDB URI: %s", maskURI(config.MongoURI))
	log.Printf("  Database: %s", config.Database)
	log.Printf("  Server Port: %s", config.ServerPort)

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
