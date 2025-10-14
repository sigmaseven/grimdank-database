package config

import (
	"os"
	"testing"
)

func TestLoadConfig(t *testing.T) {
	// Test with default values
	config := LoadConfig()
	
	if config.MongoURI == "" {
		t.Error("Expected MongoURI to be set")
	}
	
	if config.Database == "" {
		t.Error("Expected Database to be set")
	}
	
	if config.ServerPort == "" {
		t.Error("Expected ServerPort to be set")
	}
	
	if config.DatabaseTimeout <= 0 {
		t.Error("Expected DatabaseTimeout to be positive")
	}
}

func TestLoadConfigWithEnvVars(t *testing.T) {
	// Set environment variables
	os.Setenv("MONGODB_URI", "mongodb://test:27017")
	os.Setenv("DATABASE_NAME", "test_db")
	os.Setenv("SERVER_PORT", "9090")
	os.Setenv("DATABASE_TIMEOUT", "30")
	
	// Reload config
	config := LoadConfig()
	
	if config.MongoURI != "mongodb://test:27017" {
		t.Errorf("Expected MongoURI to be 'mongodb://test:27017', got '%s'", config.MongoURI)
	}
	
	if config.Database != "test_db" {
		t.Errorf("Expected Database to be 'test_db', got '%s'", config.Database)
	}
	
	if config.ServerPort != "9090" {
		t.Errorf("Expected ServerPort to be '9090', got '%s'", config.ServerPort)
	}
	
	if config.DatabaseTimeout != 30 {
		t.Errorf("Expected DatabaseTimeout to be 30, got %d", config.DatabaseTimeout)
	}
	
	// Clean up
	os.Unsetenv("MONGODB_URI")
	os.Unsetenv("DATABASE_NAME")
	os.Unsetenv("SERVER_PORT")
	os.Unsetenv("DATABASE_TIMEOUT")
}

func TestGetEnvInt(t *testing.T) {
	// Test with valid integer
	os.Setenv("TEST_INT", "42")
	result := getEnvInt("TEST_INT", 10)
	if result != 42 {
		t.Errorf("Expected 42, got %d", result)
	}
	
	// Test with invalid integer
	os.Setenv("TEST_INT", "invalid")
	result = getEnvInt("TEST_INT", 10)
	if result != 10 {
		t.Errorf("Expected default 10, got %d", result)
	}
	
	// Test with missing env var
	os.Unsetenv("TEST_INT")
	result = getEnvInt("TEST_INT", 10)
	if result != 10 {
		t.Errorf("Expected default 10, got %d", result)
	}
	
	// Clean up
	os.Unsetenv("TEST_INT")
}
