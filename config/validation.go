package config

import (
	"fmt"
	"net/url"
	"strconv"
	"strings"
	"time"
)

// ValidationError represents a configuration validation error
type ValidationError struct {
	Field   string
	Message string
}

func (ve ValidationError) Error() string {
	return fmt.Sprintf("validation error for field '%s': %s", ve.Field, ve.Message)
}

// ValidationConfig holds validation rules
type ValidationConfig struct {
	MinDatabaseTimeout int
	MaxDatabaseTimeout int
	MinServerPort      int
	MaxServerPort      int
	RequiredFields     []string
}

// DefaultValidationConfig returns default validation rules
func DefaultValidationConfig() *ValidationConfig {
	return &ValidationConfig{
		MinDatabaseTimeout: 1,
		MaxDatabaseTimeout: 300,
		MinServerPort:      1024,
		MaxServerPort:      65535,
		RequiredFields:     []string{"MongoURI", "Database", "ServerPort"},
	}
}

// ValidateConfig validates the configuration
func ValidateConfig(cfg *Config, validationCfg *ValidationConfig) error {
	if validationCfg == nil {
		validationCfg = DefaultValidationConfig()
	}

	var errors []ValidationError

	// Validate required fields
	for _, field := range validationCfg.RequiredFields {
		switch field {
		case "MongoURI":
			if err := validateMongoURI(cfg.MongoURI); err != nil {
				errors = append(errors, ValidationError{Field: field, Message: err.Error()})
			}
		case "Database":
			if err := validateDatabaseName(cfg.Database); err != nil {
				errors = append(errors, ValidationError{Field: field, Message: err.Error()})
			}
		case "ServerPort":
			if err := validateServerPort(cfg.ServerPort, validationCfg); err != nil {
				errors = append(errors, ValidationError{Field: field, Message: err.Error()})
			}
		}
	}

	// Validate database timeout
	if err := validateDatabaseTimeout(cfg.DatabaseTimeout, validationCfg); err != nil {
		errors = append(errors, ValidationError{Field: "DatabaseTimeout", Message: err.Error()})
	}

	if len(errors) > 0 {
		return fmt.Errorf("configuration validation failed: %v", errors)
	}

	return nil
}

// validateMongoURI validates the MongoDB URI
func validateMongoURI(uri string) error {
	if uri == "" {
		return fmt.Errorf("MongoURI cannot be empty")
	}

	// Parse the URI to check format
	parsedURI, err := url.Parse(uri)
	if err != nil {
		return fmt.Errorf("invalid URI format: %v", err)
	}

	// Check if it's a MongoDB URI
	if parsedURI.Scheme != "mongodb" && parsedURI.Scheme != "mongodb+srv" {
		return fmt.Errorf("URI must use mongodb or mongodb+srv scheme")
	}

	// Check if host is provided
	if parsedURI.Host == "" {
		return fmt.Errorf("host must be provided in URI")
	}

	// Check for basic security (not localhost in production)
	if strings.Contains(uri, "localhost") || strings.Contains(uri, "127.0.0.1") {
		// This is a warning, not an error, but we'll log it
		fmt.Printf("WARNING: Using localhost in MongoDB URI - ensure this is correct for your environment\n")
	}

	return nil
}

// validateDatabaseName validates the database name
func validateDatabaseName(dbName string) error {
	if dbName == "" {
		return fmt.Errorf("database name cannot be empty")
	}

	// Check length
	if len(dbName) > 64 {
		return fmt.Errorf("database name too long (max 64 characters)")
	}

	// Check for invalid characters
	invalidChars := []string{"/", "\\", ".", " ", "$", "\"", "'"}
	for _, char := range invalidChars {
		if strings.Contains(dbName, char) {
			return fmt.Errorf("database name contains invalid character: %s", char)
		}
	}

	// Check if it starts with a number
	if len(dbName) > 0 && dbName[0] >= '0' && dbName[0] <= '9' {
		return fmt.Errorf("database name cannot start with a number")
	}

	return nil
}

// validateServerPort validates the server port
func validateServerPort(port string, validationCfg *ValidationConfig) error {
	if port == "" {
		return fmt.Errorf("server port cannot be empty")
	}

	portNum, err := strconv.Atoi(port)
	if err != nil {
		return fmt.Errorf("server port must be a valid number")
	}

	if portNum < validationCfg.MinServerPort || portNum > validationCfg.MaxServerPort {
		return fmt.Errorf("server port must be between %d and %d", validationCfg.MinServerPort, validationCfg.MaxServerPort)
	}

	return nil
}

// validateDatabaseTimeout validates the database timeout
func validateDatabaseTimeout(timeout int, validationCfg *ValidationConfig) error {
	if timeout < validationCfg.MinDatabaseTimeout || timeout > validationCfg.MaxDatabaseTimeout {
		return fmt.Errorf("database timeout must be between %d and %d seconds",
			validationCfg.MinDatabaseTimeout, validationCfg.MaxDatabaseTimeout)
	}
	return nil
}

// EnvironmentConfig holds environment-specific configuration
type EnvironmentConfig struct {
	Environment    string
	DebugMode      bool
	LogLevel       string
	EnableMetrics  bool
	EnableTracing  bool
	ConnectionPool *ConnectionPoolConfig
	CircuitBreaker *CircuitBreakerConfig
	RetryConfig    *RetryConfig
}

// ConnectionPoolConfig holds connection pool configuration
type ConnectionPoolConfig struct {
	MaxPoolSize     int
	MinPoolSize     int
	MaxConnIdleTime time.Duration
	MaxConnLifetime time.Duration
	ConnectTimeout  time.Duration
	SocketTimeout   time.Duration
}

// CircuitBreakerConfig holds circuit breaker configuration
type CircuitBreakerConfig struct {
	FailureThreshold int
	RecoveryTimeout  time.Duration
	SuccessThreshold int
	RequestTimeout   time.Duration
	MonitoringWindow time.Duration
}

// RetryConfig holds retry configuration
type RetryConfig struct {
	MaxRetries      int
	InitialDelay    time.Duration
	MaxDelay        time.Duration
	BackoffFactor   float64
	RetryableErrors []string
}

// GetEnvironmentConfig returns environment-specific configuration
func GetEnvironmentConfig(env string) *EnvironmentConfig {
	switch env {
	case "production":
		return getProductionConfig()
	case "staging":
		return getStagingConfig()
	case "development":
		return getDevelopmentConfig()
	default:
		return getDevelopmentConfig() // Default to development
	}
}

// getProductionConfig returns production configuration
func getProductionConfig() *EnvironmentConfig {
	return &EnvironmentConfig{
		Environment:   "production",
		DebugMode:     false,
		LogLevel:      "info",
		EnableMetrics: true,
		EnableTracing: true,
		ConnectionPool: &ConnectionPoolConfig{
			MaxPoolSize:     50,
			MinPoolSize:     10,
			MaxConnIdleTime: 5 * time.Minute,
			MaxConnLifetime: 30 * time.Minute,
			ConnectTimeout:  10 * time.Second,
			SocketTimeout:   30 * time.Second,
		},
		CircuitBreaker: &CircuitBreakerConfig{
			FailureThreshold: 10,
			RecoveryTimeout:  60 * time.Second,
			SuccessThreshold: 5,
			RequestTimeout:   30 * time.Second,
			MonitoringWindow: 5 * time.Minute,
		},
		RetryConfig: &RetryConfig{
			MaxRetries:    5,
			InitialDelay:  100 * time.Millisecond,
			MaxDelay:      10 * time.Second,
			BackoffFactor: 2.0,
			RetryableErrors: []string{
				"connection refused",
				"timeout",
				"network",
				"server selection timeout",
				"context deadline exceeded",
			},
		},
	}
}

// getStagingConfig returns staging configuration
func getStagingConfig() *EnvironmentConfig {
	return &EnvironmentConfig{
		Environment:   "staging",
		DebugMode:     false,
		LogLevel:      "debug",
		EnableMetrics: true,
		EnableTracing: true,
		ConnectionPool: &ConnectionPoolConfig{
			MaxPoolSize:     30,
			MinPoolSize:     5,
			MaxConnIdleTime: 3 * time.Minute,
			MaxConnLifetime: 15 * time.Minute,
			ConnectTimeout:  5 * time.Second,
			SocketTimeout:   15 * time.Second,
		},
		CircuitBreaker: &CircuitBreakerConfig{
			FailureThreshold: 5,
			RecoveryTimeout:  30 * time.Second,
			SuccessThreshold: 3,
			RequestTimeout:   15 * time.Second,
			MonitoringWindow: 2 * time.Minute,
		},
		RetryConfig: &RetryConfig{
			MaxRetries:    3,
			InitialDelay:  50 * time.Millisecond,
			MaxDelay:      5 * time.Second,
			BackoffFactor: 2.0,
			RetryableErrors: []string{
				"connection refused",
				"timeout",
				"network",
				"server selection timeout",
				"context deadline exceeded",
			},
		},
	}
}

// getDevelopmentConfig returns development configuration
func getDevelopmentConfig() *EnvironmentConfig {
	return &EnvironmentConfig{
		Environment:   "development",
		DebugMode:     true,
		LogLevel:      "debug",
		EnableMetrics: false,
		EnableTracing: false,
		ConnectionPool: &ConnectionPoolConfig{
			MaxPoolSize:     10,
			MinPoolSize:     2,
			MaxConnIdleTime: 1 * time.Minute,
			MaxConnLifetime: 10 * time.Minute,
			ConnectTimeout:  5 * time.Second,
			SocketTimeout:   10 * time.Second,
		},
		CircuitBreaker: &CircuitBreakerConfig{
			FailureThreshold: 3,
			RecoveryTimeout:  10 * time.Second,
			SuccessThreshold: 2,
			RequestTimeout:   5 * time.Second,
			MonitoringWindow: 1 * time.Minute,
		},
		RetryConfig: &RetryConfig{
			MaxRetries:    2,
			InitialDelay:  100 * time.Millisecond,
			MaxDelay:      2 * time.Second,
			BackoffFactor: 2.0,
			RetryableErrors: []string{
				"connection refused",
				"timeout",
				"network",
			},
		},
	}
}

