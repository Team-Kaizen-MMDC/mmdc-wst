#!/usr/bin/env bash

#
# Playwright Test Runner Script
# Provides convenient commands for running different test suites
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PORT=8000
SERVER_LOG="/tmp/mmdc-wst-server-$$.log"
SERVER_PID=""
PLAYWRIGHT_CONFIG="--config=tests/playwright/playwright.config.js"

# Function to print colored messages
print_info() {
    echo -e "${BLUE}ℹ ${NC}$1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Function to check if server is running
check_server() {
    if curl -s "http://localhost:$PORT" > /dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Function to start dev server
start_server() {
    print_info "Starting dev server on port $PORT..."
    python3 -m http.server $PORT > "$SERVER_LOG" 2>&1 &
    SERVER_PID=$!
    
    # Wait for server to be ready
    for i in {1..10}; do
        if check_server; then
            print_success "Dev server started (PID: $SERVER_PID)"
            return 0
        fi
        sleep 0.5
    done
    
    print_error "Failed to start dev server"
    return 1
}

# Function to stop server
stop_server() {
    if [ -n "$SERVER_PID" ]; then
        print_info "Stopping dev server (PID: $SERVER_PID)..."
        kill $SERVER_PID 2>/dev/null || true
        wait $SERVER_PID 2>/dev/null || true
        print_success "Dev server stopped"
    fi
    
    # Clean up log file
    rm -f "$SERVER_LOG"
}

# Trap to ensure server is stopped on exit
trap stop_server EXIT INT TERM

# Function to show usage
show_usage() {
    cat << EOF
${GREEN}Playwright Test Runner${NC}

Usage: ./run-tests.sh [command] [options]

${YELLOW}Commands:${NC}
  all              Run all tests (default)
  smoke            Run smoke tests (all pages, all links)
  e2e              Run end-to-end navigation tests
  i18n             Run internationalization tests
  jobs             Run job pages tests
  offcanvas        Run mobile offcanvas tests
  ui               Run tests in UI mode (interactive)
  debug            Run tests in debug mode
  headed           Run tests with visible browser
  chromium         Run tests in Chromium only
  firefox          Run tests in Firefox only
  mobile           Run tests in mobile viewport (webkit)
  report           Show test report from last run
  codegen          Launch code generator
  install          Install Playwright browsers
  list             List all available tests

${YELLOW}Options:${NC}
  --no-server      Don't start dev server (use if already running)
  --grep PATTERN   Run tests matching pattern
  --help           Show this help message

${YELLOW}Examples:${NC}
  ./run-tests.sh                    # Run all tests
  ./run-tests.sh smoke              # Run smoke tests only
  ./run-tests.sh ui                 # Interactive UI mode
  ./run-tests.sh --grep "Brand"     # Run tests matching "Brand"
  ./run-tests.sh smoke --no-server  # Run smoke tests (server already running)
  ./run-tests.sh headed chromium    # Run Chromium tests with visible browser

${YELLOW}Quick Tips:${NC}
  • Use 'ui' mode for development (best debugging experience)
  • Use 'smoke' to quickly validate all pages
  • Use 'e2e' to test user flows
  • Use '--no-server' if you have a server running on port $PORT

EOF
}

# Parse command line arguments
COMMAND="all"
NO_SERVER=false
EXTRA_ARGS=()

while [[ $# -gt 0 ]]; do
    case $1 in
        --help|-h)
            show_usage
            exit 0
            ;;
        --no-server)
            NO_SERVER=true
            shift
            ;;
        all|smoke|e2e|i18n|jobs|offcanvas|ui|debug|headed|chromium|firefox|mobile|report|codegen|install|list)
            COMMAND=$1
            shift
            ;;
        *)
            EXTRA_ARGS+=("$1")
            shift
            ;;
    esac
done

# Check if Playwright is installed
if ! command -v npx &> /dev/null; then
    print_error "npx not found. Please install Node.js and npm."
    exit 1
fi

# Main script logic
main() {
    print_info "Playwright Test Runner"
    echo ""
    
    # Handle special commands that don't need server
    case $COMMAND in
        install)
            print_info "Installing Playwright browsers..."
            npx playwright install
            print_success "Playwright browsers installed"
            exit 0
            ;;
        report)
            print_info "Opening test report..."
            npx playwright show-report
            exit 0
            ;;
        list)
            print_info "Available tests:"
            echo ""
            npx playwright test --list
            exit 0
            ;;
    esac
    
    # Ensure results directory exists so Playwright can write JSON reporter
    mkdir -p test-results

    # By default, request Playwright to emit a JSON report at test-results/results.json
    TEST_REPORTER="--reporter=json=test-results/results.json"

    # Check/start server for tests
    if [ "$NO_SERVER" = true ]; then
        if check_server; then
            print_success "Using existing dev server on port $PORT"
        else
            print_error "No server found on port $PORT. Remove --no-server or start server manually."
            exit 1
        fi
    else
        if check_server; then
            print_warning "Server already running on port $PORT. Using existing server."
        else
            start_server || exit 1
        fi
    fi
    
    echo ""
    print_info "Running tests..."
    echo ""
    
    # Run tests based on command
    case $COMMAND in
        all)
            npx playwright test $PLAYWRIGHT_CONFIG $TEST_REPORTER "${EXTRA_ARGS[@]}"
            ;;
        smoke)
            npx playwright test $PLAYWRIGHT_CONFIG smoke-links.spec.ts $TEST_REPORTER "${EXTRA_ARGS[@]}"
            ;;
        e2e)
            npx playwright test $PLAYWRIGHT_CONFIG e2e-navigation.spec.ts $TEST_REPORTER "${EXTRA_ARGS[@]}"
            ;;
        i18n)
            npx playwright test $PLAYWRIGHT_CONFIG i18n.spec.ts $TEST_REPORTER "${EXTRA_ARGS[@]}"
            ;;
        jobs)
            npx playwright test $PLAYWRIGHT_CONFIG jobs.spec.js $TEST_REPORTER "${EXTRA_ARGS[@]}"
            ;;
        offcanvas)
            npx playwright test $PLAYWRIGHT_CONFIG offcanvas.spec.ts $TEST_REPORTER "${EXTRA_ARGS[@]}"
            ;;
        ui)
            print_info "Opening Playwright UI mode..."
            npx playwright test $PLAYWRIGHT_CONFIG --ui $TEST_REPORTER "${EXTRA_ARGS[@]}"
            ;;
        debug)
            print_info "Starting debug mode..."
            npx playwright test $PLAYWRIGHT_CONFIG --debug $TEST_REPORTER "${EXTRA_ARGS[@]}"
            ;;
        headed)
            npx playwright test $PLAYWRIGHT_CONFIG --headed $TEST_REPORTER "${EXTRA_ARGS[@]}"
            ;;
        chromium)
            npx playwright test $PLAYWRIGHT_CONFIG --project=chromium $TEST_REPORTER "${EXTRA_ARGS[@]}"
            ;;
        firefox)
            npx playwright test $PLAYWRIGHT_CONFIG --project=firefox $TEST_REPORTER "${EXTRA_ARGS[@]}"
            ;;
        mobile)
            npx playwright test $PLAYWRIGHT_CONFIG --project=webkit-mobile $TEST_REPORTER "${EXTRA_ARGS[@]}"
            ;;
        codegen)
            print_info "Launching Playwright code generator..."
            npx playwright codegen http://localhost:$PORT
            ;;
        *)
            print_error "Unknown command: $COMMAND"
            echo ""
            show_usage
            exit 1
            ;;
    esac
    
    TEST_EXIT_CODE=$?
    
    echo ""
    if [ $TEST_EXIT_CODE -eq 0 ]; then
        print_success "All tests passed!"
    else
        print_error "Some tests failed (exit code: $TEST_EXIT_CODE)"
        echo ""
        print_info "Tip: Run './run-tests.sh ui' for interactive debugging"
    fi
    
    exit $TEST_EXIT_CODE
}

# Run main function
main
