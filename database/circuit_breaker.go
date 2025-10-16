package database

import (
	"context"
	"fmt"
	"sync"
	"time"
)

// CircuitState represents the state of the circuit breaker
type CircuitState int

const (
	CircuitClosed CircuitState = iota
	CircuitOpen
	CircuitHalfOpen
)

func (cs CircuitState) String() string {
	switch cs {
	case CircuitClosed:
		return "CLOSED"
	case CircuitOpen:
		return "OPEN"
	case CircuitHalfOpen:
		return "HALF_OPEN"
	default:
		return "UNKNOWN"
	}
}

// CircuitBreakerConfig holds configuration for the circuit breaker
type CircuitBreakerConfig struct {
	FailureThreshold int           // Number of failures before opening circuit
	RecoveryTimeout  time.Duration // How long to wait before trying again
	SuccessThreshold int           // Number of successes needed to close circuit from half-open
	RequestTimeout   time.Duration // Timeout for individual requests
	MonitoringWindow time.Duration // Time window for monitoring failures
}

// DefaultCircuitBreakerConfig returns sensible defaults
func DefaultCircuitBreakerConfig() *CircuitBreakerConfig {
	return &CircuitBreakerConfig{
		FailureThreshold: 5,
		RecoveryTimeout:  30 * time.Second,
		SuccessThreshold: 3,
		RequestTimeout:   10 * time.Second,
		MonitoringWindow: 60 * time.Second,
	}
}

// CircuitBreaker implements the circuit breaker pattern
type CircuitBreaker struct {
	config       *CircuitBreakerConfig
	state        CircuitState
	failures     int
	successes    int
	lastFailure  time.Time
	lastSuccess  time.Time
	mutex        sync.RWMutex
	requestCount int
	windowStart  time.Time
}

// NewCircuitBreaker creates a new circuit breaker
func NewCircuitBreaker(config *CircuitBreakerConfig) *CircuitBreaker {
	if config == nil {
		config = DefaultCircuitBreakerConfig()
	}

	return &CircuitBreaker{
		config:      config,
		state:       CircuitClosed,
		windowStart: time.Now(),
	}
}

// Execute executes a function with circuit breaker protection
func (cb *CircuitBreaker) Execute(ctx context.Context, operation func(ctx context.Context) error) error {
	cb.mutex.Lock()
	defer cb.mutex.Unlock()

	// Check if we should allow the request
	if !cb.canExecute() {
		return fmt.Errorf("circuit breaker is %s, request rejected", cb.state)
	}

	// Create timeout context if needed
	if cb.config.RequestTimeout > 0 {
		var cancel context.CancelFunc
		ctx, cancel = context.WithTimeout(ctx, cb.config.RequestTimeout)
		defer cancel()
	}

	// Record the request
	cb.recordRequest()

	// Execute the operation
	err := operation(ctx)

	// Record the result
	cb.recordResult(err == nil)

	return err
}

// canExecute checks if the circuit breaker allows execution
func (cb *CircuitBreaker) canExecute() bool {
	now := time.Now()

	// Reset window if needed
	if now.Sub(cb.windowStart) > cb.config.MonitoringWindow {
		cb.resetWindow()
	}

	switch cb.state {
	case CircuitClosed:
		return true
	case CircuitOpen:
		// Check if recovery timeout has passed
		if now.Sub(cb.lastFailure) > cb.config.RecoveryTimeout {
			cb.state = CircuitHalfOpen
			cb.successes = 0
			return true
		}
		return false
	case CircuitHalfOpen:
		return true
	default:
		return false
	}
}

// recordRequest records that a request was made
func (cb *CircuitBreaker) recordRequest() {
	cb.requestCount++
}

// recordResult records the result of an operation
func (cb *CircuitBreaker) recordResult(success bool) {
	now := time.Now()

	if success {
		cb.lastSuccess = now
		cb.successes++

		// If we're in half-open state and have enough successes, close the circuit
		if cb.state == CircuitHalfOpen && cb.successes >= cb.config.SuccessThreshold {
			cb.state = CircuitClosed
			cb.failures = 0
			cb.successes = 0
		}
	} else {
		cb.lastFailure = now
		cb.failures++

		// If we're in closed state and have too many failures, open the circuit
		if cb.state == CircuitClosed && cb.failures >= cb.config.FailureThreshold {
			cb.state = CircuitOpen
		}

		// If we're in half-open state and get a failure, go back to open
		if cb.state == CircuitHalfOpen {
			cb.state = CircuitOpen
			cb.successes = 0
		}
	}
}

// resetWindow resets the monitoring window
func (cb *CircuitBreaker) resetWindow() {
	cb.windowStart = time.Now()
	cb.requestCount = 0
	cb.failures = 0
	cb.successes = 0
}

// GetState returns the current state of the circuit breaker
func (cb *CircuitBreaker) GetState() CircuitState {
	cb.mutex.RLock()
	defer cb.mutex.RUnlock()
	return cb.state
}

// GetStats returns statistics about the circuit breaker
func (cb *CircuitBreaker) GetStats() map[string]interface{} {
	cb.mutex.RLock()
	defer cb.mutex.RUnlock()

	return map[string]interface{}{
		"state":         cb.state.String(),
		"failures":      cb.failures,
		"successes":     cb.successes,
		"request_count": cb.requestCount,
		"last_failure":  cb.lastFailure,
		"last_success":  cb.lastSuccess,
		"window_start":  cb.windowStart,
	}
}

// Reset manually resets the circuit breaker to closed state
func (cb *CircuitBreaker) Reset() {
	cb.mutex.Lock()
	defer cb.mutex.Unlock()

	cb.state = CircuitClosed
	cb.failures = 0
	cb.successes = 0
	cb.requestCount = 0
	cb.windowStart = time.Now()
}

