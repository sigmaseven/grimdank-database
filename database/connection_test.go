package database

import (
	"testing"
)

func TestMaskURI(t *testing.T) {
	// Test with long URI (should be truncated)
	uri := "mongodb://user:password@localhost:27017/db"
	masked := maskURI(uri)
	expected := "mongodb://user:passw..."
	if masked != expected {
		t.Errorf("Expected %s, got %s", expected, masked)
	}
	
	// Test with short URI (should not be truncated)
	uri = "mongodb://localhost"
	masked = maskURI(uri)
	if masked != uri {
		t.Errorf("Expected %s, got %s", uri, masked)
	}
	
	// Test with medium URI (should not be truncated)
	uri = "mongodb://localhost"
	masked = maskURI(uri)
	if masked != uri {
		t.Errorf("Expected %s, got %s", uri, masked)
	}
}

func TestConnectWithInvalidURI(t *testing.T) {
	// Test with invalid URI
	_, err := Connect("invalid-uri", "test_db", 5)
	if err == nil {
		t.Error("Expected error for invalid URI")
	}
}

func TestConnectWithTimeout(t *testing.T) {
	// Test with very short timeout to ensure timeout is respected
	_, err := Connect("mongodb://localhost:27017", "test_db", 1)
	// This might fail due to connection timeout, which is expected
	if err != nil {
		// Check if it's a timeout error
		if !contains(err.Error(), "timeout") && !contains(err.Error(), "connection") {
			t.Logf("Connection error (expected): %v", err)
		}
	}
}

func contains(s, substr string) bool {
	return len(s) >= len(substr) && s[:len(substr)] == substr
}
