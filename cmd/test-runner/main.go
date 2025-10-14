package main

import (
	"flag"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"
)

func main() {
	var (
		verbose = flag.Bool("v", false, "Verbose output")
		race    = flag.Bool("race", false, "Enable race detection")
		cover   = flag.Bool("cover", false, "Enable coverage reporting")
		timeout = flag.Duration("timeout", 10*time.Minute, "Test timeout")
		pattern = flag.String("run", "", "Run only tests matching pattern")
	)
	flag.Parse()

	// Get the project root directory
	projectRoot, err := os.Getwd()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Failed to get current directory: %v\n", err)
		os.Exit(1)
	}

	// Change to project root
	if err := os.Chdir(projectRoot); err != nil {
		fmt.Fprintf(os.Stderr, "Failed to change to project root: %v\n", err)
		os.Exit(1)
	}

	// Build test command
	args := []string{"test"}

	if *verbose {
		args = append(args, "-v")
	}

	if *race {
		args = append(args, "-race")
	}

	if *cover {
		args = append(args, "-cover", "-coverprofile=coverage.out")
	}

	if *timeout > 0 {
		args = append(args, "-timeout", timeout.String())
	}

	if *pattern != "" {
		args = append(args, "-run", *pattern)
	}

	// Add test directory
	args = append(args, "./tests/...")

	fmt.Printf("Running tests with command: go %s\n", strings.Join(args, " "))

	// Set environment variables for tests
	cmd := exec.Command("go", args...)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	// Set MONGODB_URI environment variable for tests
	cmd.Env = append(os.Environ(), "MONGODB_URI="+getMongoURI())

	start := time.Now()
	err = cmd.Run()
	duration := time.Since(start)

	if err != nil {
		fmt.Fprintf(os.Stderr, "Tests failed after %v: %v\n", duration, err)
		os.Exit(1)
	}

	fmt.Printf("All tests passed in %v\n", duration)

	// Generate coverage report if requested
	if *cover {
		coverageFile := filepath.Join(projectRoot, "coverage.out")
		if _, err := os.Stat(coverageFile); err == nil {
			fmt.Println("\nGenerating coverage report...")
			cmd = exec.Command("go", "tool", "cover", "-html=coverage.out", "-o", "coverage.html")
			if err := cmd.Run(); err != nil {
				fmt.Fprintf(os.Stderr, "Failed to generate coverage report: %v\n", err)
			} else {
				fmt.Println("Coverage report generated: coverage.html")
			}
		}
	}
}

// getMongoURI returns the MongoDB URI for tests
func getMongoURI() string {
	if uri := os.Getenv("MONGODB_URI"); uri != "" {
		return uri
	}
	return "mongodb://localhost:27017"
}
