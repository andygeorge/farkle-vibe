# Makefile for Farkle Scoring App

.PHONY: run dev test clean help

# Default target
all: help

# Run the application in development mode
run:
	@echo "Starting Farkle scoring app..."
	npm run dev

# Run the application in production mode  
start:
	@echo "Starting Farkle scoring app in production..."
	npm start

# Run MCP server
mcp:
	@echo "Starting Farkle MCP server..."
	npm run mcp

# Run tests
test:
	@echo "Running scoring tests..."
	node test-scoring.js && node test-scoring2.js

# Clean up temporary files (if any)
clean:
	@echo "Cleaning up..."
	# Add clean commands here if needed

# Show help message
help:
	@echo "Farkle Scoring App Makefile"
	@echo "=========================="
	@echo "run     - Run app in dev mode"
	@echo "start   - Start app in production mode" 
	@echo "mcp     - Run MCP server"
	@echo "test    - Run all scoring tests"
	@echo "clean   - Clean up temporary files"
	@echo "help    - Show this help message"

