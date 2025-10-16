package database

import (
	"context"
	"fmt"
	"log"
	"time"
)

// RetryConfig holds retry configuration
type RetryConfig struct {
	MaxRetries      int
	InitialDelay    time.Duration
	MaxDelay        time.Duration
	BackoffFactor   float64
	RetryableErrors []string
}

// DefaultRetryConfig returns sensible defaults for retry configuration
func DefaultRetryConfig() *RetryConfig {
	return &RetryConfig{
		MaxRetries:    3,
		InitialDelay:  100 * time.Millisecond,
		MaxDelay:      5 * time.Second,
		BackoffFactor: 2.0,
		RetryableErrors: []string{
			"connection refused",
			"timeout",
			"network",
			"server selection timeout",
			"context deadline exceeded",
		},
	}
}

// ResilientDatabase wraps database operations with retry logic
type ResilientDatabase struct {
	*Database
	retryConfig *RetryConfig
}

// NewResilientDatabase creates a new resilient database connection
func NewResilientDatabase(uri, dbName string, timeoutSeconds int, retryConfig *RetryConfig) (*ResilientDatabase, error) {
	if retryConfig == nil {
		retryConfig = DefaultRetryConfig()
	}

	db, err := ConnectWithRetry(uri, dbName, timeoutSeconds, retryConfig)
	if err != nil {
		return nil, err
	}

	return &ResilientDatabase{
		Database:    db,
		retryConfig: retryConfig,
	}, nil
}

// ConnectWithRetry attempts to connect with retry logic
func ConnectWithRetry(uri, dbName string, timeoutSeconds int, retryConfig *RetryConfig) (*Database, error) {
	var lastErr error

	for attempt := 0; attempt <= retryConfig.MaxRetries; attempt++ {
		if attempt > 0 {
			delay := calculateDelay(attempt, retryConfig)
			log.Printf("Retrying database connection in %v (attempt %d/%d)...", delay, attempt+1, retryConfig.MaxRetries+1)
			time.Sleep(delay)
		}

		db, err := Connect(uri, dbName, timeoutSeconds)
		if err == nil {
			log.Printf("✅ Database connected successfully on attempt %d", attempt+1)
			return db, nil
		}

		lastErr = err

		// Check if error is retryable
		if !isRetryableError(err, retryConfig.RetryableErrors) {
			log.Printf("❌ Non-retryable error encountered: %v", err)
			return nil, err
		}

		log.Printf("⚠️ Database connection failed (attempt %d/%d): %v", attempt+1, retryConfig.MaxRetries+1, err)
	}

	return nil, fmt.Errorf("failed to connect to database after %d attempts: %w", retryConfig.MaxRetries+1, lastErr)
}

// ExecuteWithRetry executes a database operation with retry logic
func (rd *ResilientDatabase) ExecuteWithRetry(ctx context.Context, operation func(ctx context.Context) error) error {
	var lastErr error

	for attempt := 0; attempt <= rd.retryConfig.MaxRetries; attempt++ {
		if attempt > 0 {
			delay := calculateDelay(attempt, rd.retryConfig)
			log.Printf("Retrying database operation in %v (attempt %d/%d)...", delay, attempt+1, rd.retryConfig.MaxRetries+1)

			select {
			case <-time.After(delay):
			case <-ctx.Done():
				return ctx.Err()
			}
		}

		err := operation(ctx)
		if err == nil {
			return nil
		}

		lastErr = err

		// Check if error is retryable
		if !isRetryableError(err, rd.retryConfig.RetryableErrors) {
			return err
		}

		log.Printf("⚠️ Database operation failed (attempt %d/%d): %v", attempt+1, rd.retryConfig.MaxRetries+1, err)
	}

	return fmt.Errorf("operation failed after %d attempts: %w", rd.retryConfig.MaxRetries+1, lastErr)
}

// calculateDelay calculates the delay for the next retry attempt
func calculateDelay(attempt int, config *RetryConfig) time.Duration {
	delay := time.Duration(float64(config.InitialDelay) * pow(config.BackoffFactor, float64(attempt)))
	if delay > config.MaxDelay {
		delay = config.MaxDelay
	}
	return delay
}

// pow calculates x^y (simple implementation)
func pow(x, y float64) float64 {
	result := 1.0
	for i := 0; i < int(y); i++ {
		result *= x
	}
	return result
}

// isRetryableError checks if an error should trigger a retry
func isRetryableError(err error, retryableErrors []string) bool {
	errStr := err.Error()
	for _, retryableErr := range retryableErrors {
		if containsSubstring(errStr, retryableErr) {
			return true
		}
	}
	return false
}

// containsSubstring checks if a string contains a substring (case-insensitive)
func containsSubstring(s, substr string) bool {
	return len(s) >= len(substr) && (s == substr || len(substr) == 0 ||
		(len(s) > len(substr) && (s[:len(substr)] == substr ||
			s[len(s)-len(substr):] == substr ||
			indexOfSubstring(s, substr) >= 0)))
}

// indexOfSubstring finds the index of a substring in a string
func indexOfSubstring(s, substr string) int {
	if len(substr) == 0 {
		return 0
	}
	for i := 0; i <= len(s)-len(substr); i++ {
		if s[i:i+len(substr)] == substr {
			return i
		}
	}
	return -1
}

// PingWithRetry tests the database connection with retry logic
func (rd *ResilientDatabase) PingWithRetry(ctx context.Context) error {
	return rd.ExecuteWithRetry(ctx, func(ctx context.Context) error {
		return rd.Client.Ping(ctx, nil)
	})
}

// DisconnectWithRetry disconnects from the database with retry logic
func (rd *ResilientDatabase) DisconnectWithRetry(ctx context.Context) error {
	return rd.ExecuteWithRetry(ctx, func(ctx context.Context) error {
		return rd.Disconnect()
	})
}
