# Grimdank Database Test Makefile

.PHONY: test test-verbose test-race test-cover test-clean test-setup test-all help

# Default test target
test:
	@echo "Running all tests..."
	@set MONGODB_URI=mongodb://localhost:27017&& go test ./tests/... -v

# Verbose test output
test-verbose:
	@echo "Running tests with verbose output..."
	@set MONGODB_URI=mongodb://localhost:27017&& go test ./tests/... -v -timeout=10m

# Run tests with race detection
test-race:
	@echo "Running tests with race detection..."
	@set MONGODB_URI=mongodb://localhost:27017&& go test ./tests/... -v -race -timeout=10m

# Run tests with coverage
test-cover:
	@echo "Running tests with coverage..."
	@set MONGODB_URI=mongodb://localhost:27017&& go test ./tests/... -v -cover -coverprofile=coverage.out -timeout=10m
	@echo "Generating coverage report..."
	go tool cover -html=coverage.out -o coverage.html
	@echo "Coverage report generated: coverage.html"

# Run specific test pattern
test-pattern:
	@echo "Usage: make test-pattern PATTERN='TestName'"
	@if [ -z "$(PATTERN)" ]; then echo "Please specify PATTERN"; exit 1; fi
	@set MONGODB_URI=mongodb://localhost:27017&& go test ./tests/... -v -run=$(PATTERN) -timeout=10m

# Run tests for specific entity type
test-rules:
	@echo "Running Rule CRUD tests..."
	@set MONGODB_URI=mongodb://localhost:27017&& go test ./tests/... -v -run="TestRule" -timeout=10m

test-weapons:
	@echo "Running Weapon CRUD tests..."
	@set MONGODB_URI=mongodb://localhost:27017&& go test ./tests/... -v -run="TestWeapon" -timeout=10m

test-wargear:
	@echo "Running WarGear CRUD tests..."
	@set MONGODB_URI=mongodb://localhost:27017&& go test ./tests/... -v -run="TestWarGear" -timeout=10m

test-units:
	@echo "Running Unit CRUD tests..."
	@set MONGODB_URI=mongodb://localhost:27017&& go test ./tests/... -v -run="TestUnit" -timeout=10m

test-armybooks:
	@echo "Running ArmyBook CRUD tests..."
	@set MONGODB_URI=mongodb://localhost:27017&& go test ./tests/... -v -run="TestArmyBook" -timeout=10m

test-armylists:
	@echo "Running ArmyList CRUD tests..."
	@set MONGODB_URI=mongodb://localhost:27017&& go test ./tests/... -v -run="TestArmyList" -timeout=10m

test-integration:
	@echo "Running Integration tests..."
	@set MONGODB_URI=mongodb://localhost:27017&& go test ./tests/... -v -run="TestIntegration" -timeout=10m

# Clean test artifacts
test-clean:
	@echo "Cleaning test artifacts..."
	rm -f coverage.out coverage.html
	@echo "Test artifacts cleaned"

# Setup test environment
test-setup:
	@echo "Setting up test environment..."
	@if ! command -v go >/dev/null 2>&1; then \
		echo "Go is not installed. Please install Go first."; \
		exit 1; \
	fi
	@if ! command -v docker >/dev/null 2>&1; then \
		echo "Docker is not installed. Please install Docker first."; \
		exit 1; \
	fi
	@echo "Starting MongoDB for tests..."
	docker-compose up -d mongodb
	@echo "Waiting for MongoDB to be ready..."
	@sleep 5
	@echo "Test environment ready"

# Run all tests with different configurations
test-all: test-setup test-cover test-clean
	@echo "All tests completed"

# Run tests in parallel
test-parallel:
	@echo "Running tests in parallel..."
	@set MONGODB_URI=mongodb://localhost:27017&& go test ./tests/... -v -parallel=4 -timeout=10m

# Run tests with specific timeout
test-timeout:
	@echo "Usage: make test-timeout TIMEOUT='5m'"
	@if [ -z "$(TIMEOUT)" ]; then echo "Please specify TIMEOUT"; exit 1; fi
	@set MONGODB_URI=mongodb://localhost:27017&& go test ./tests/... -v -timeout=$(TIMEOUT)

# Run tests with specific count
test-count:
	@echo "Usage: make test-count COUNT='3'"
	@if [ -z "$(COUNT)" ]; then echo "Please specify COUNT"; exit 1; fi
	@set MONGODB_URI=mongodb://localhost:27017&& go test ./tests/... -v -count=$(COUNT) -timeout=10m

# Run tests with short flag
test-short:
	@echo "Running short tests..."
	@set MONGODB_URI=mongodb://localhost:27017&& go test ./tests/... -v -short -timeout=5m

# Run tests with failfast
test-failfast:
	@echo "Running tests with failfast..."
	@set MONGODB_URI=mongodb://localhost:27017&& go test ./tests/... -v -failfast -timeout=10m

# Run tests with json output
test-json:
	@echo "Running tests with JSON output..."
	@set MONGODB_URI=mongodb://localhost:27017&& go test ./tests/... -json -timeout=10m

# Run tests with benchmark
test-bench:
	@echo "Running tests with benchmarks..."
	@set MONGODB_URI=mongodb://localhost:27017&& go test ./tests/... -v -bench=. -timeout=10m

# Help target
help:
	@echo "Available test targets:"
	@echo "  test              - Run all tests"
	@echo "  test-verbose    - Run tests with verbose output"
	@echo "  test-race       - Run tests with race detection"
	@echo "  test-cover      - Run tests with coverage report"
	@echo "  test-clean      - Clean test artifacts"
	@echo "  test-setup      - Setup test environment"
	@echo "  test-all        - Run all tests with setup and cleanup"
	@echo "  test-parallel   - Run tests in parallel"
	@echo "  test-short      - Run short tests only"
	@echo "  test-failfast   - Run tests with failfast"
	@echo "  test-json       - Run tests with JSON output"
	@echo "  test-bench      - Run tests with benchmarks"
	@echo ""
	@echo "Entity-specific tests:"
	@echo "  test-rules      - Run Rule CRUD tests"
	@echo "  test-weapons    - Run Weapon CRUD tests"
	@echo "  test-wargear    - Run WarGear CRUD tests"
	@echo "  test-units      - Run Unit CRUD tests"
	@echo "  test-armybooks  - Run ArmyBook CRUD tests"
	@echo "  test-armylists  - Run ArmyList CRUD tests"
	@echo "  test-integration - Run Integration tests"
	@echo ""
	@echo "Parameterized tests:"
	@echo "  test-pattern PATTERN='TestName' - Run specific test pattern"
	@echo "  test-timeout TIMEOUT='5m'       - Run tests with specific timeout"
	@echo "  test-count COUNT='3'            - Run tests specific number of times"
	@echo ""
	@echo "Examples:"
	@echo "  make test-cover"
	@echo "  make test-pattern PATTERN='TestRuleCRUD'"
	@echo "  make test-timeout TIMEOUT='5m'"
