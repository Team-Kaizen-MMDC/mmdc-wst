# Running Playwright Tests

This guide shows you how to run the Playwright test suite using the provided scripts.

## Quick Start

### Using the Bash Script (Recommended)

```bash
# Make the script executable (first time only)
chmod +x run-tests.sh

# Run all tests
./run-tests.sh

# Run specific test suite
./run-tests.sh smoke      # Smoke tests (all pages, all links)
./run-tests.sh e2e        # End-to-end navigation tests
./run-tests.sh ui         # Interactive UI mode (best for development)
```

### Using npm Scripts

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:smoke
npm run test:e2e
npm run test:i18n
npm run test:jobs
npm run test:offcanvas

# Run in UI mode (interactive)
npm run test:ui

# Run specific browser
npm run test:chromium
npm run test:firefox
npm run test:mobile
```

## The Bash Script (`run-tests.sh`)

The bash script provides the most convenient way to run tests with automatic server management.

### Available Commands

| Command                    | Description                           |
| -------------------------- | ------------------------------------- |
| `./run-tests.sh`           | Run all tests (default)               |
| `./run-tests.sh smoke`     | Run smoke tests only (72 tests)       |
| `./run-tests.sh e2e`       | Run end-to-end tests only (30 tests)  |
| `./run-tests.sh i18n`      | Run i18n tests only                   |
| `./run-tests.sh jobs`      | Run job page tests only               |
| `./run-tests.sh offcanvas` | Run offcanvas tests only              |
| `./run-tests.sh ui`        | Open Playwright UI mode (interactive) |
| `./run-tests.sh debug`     | Run in debug mode                     |
| `./run-tests.sh headed`    | Run with visible browser              |
| `./run-tests.sh chromium`  | Run Chromium tests only               |
| `./run-tests.sh firefox`   | Run Firefox tests only                |
| `./run-tests.sh mobile`    | Run mobile tests only                 |
| `./run-tests.sh report`    | Show test report from last run        |
| `./run-tests.sh codegen`   | Launch code generator                 |
| `./run-tests.sh install`   | Install Playwright browsers           |
| `./run-tests.sh list`      | List all available tests              |

### Options

| Option           | Description                                      |
| ---------------- | ------------------------------------------------ |
| `--no-server`    | Don't auto-start server (use if already running) |
| `--grep PATTERN` | Run tests matching pattern                       |
| `--help`         | Show help message                                |

### Examples

```bash
# Run all tests (auto-starts server)
./run-tests.sh

# Run smoke tests only
./run-tests.sh smoke

# Run tests in UI mode (best for development)
./run-tests.sh ui

# Run specific tests by pattern
./run-tests.sh --grep "Brand logo"

# Run tests with server already running
./run-tests.sh smoke --no-server

# Run Chromium tests with visible browser
./run-tests.sh headed chromium

# Run mobile tests
./run-tests.sh mobile

# Generate code for new tests
./run-tests.sh codegen
```

### Features

✅ **Automatic Server Management**: Starts Python server on port 8000 and stops it when done
✅ **Colored Output**: Easy-to-read colored status messages
✅ **Error Handling**: Graceful error messages and exit codes
✅ **Server Detection**: Checks if server is already running
✅ **Clean Shutdown**: Ensures server is stopped even on Ctrl+C

## npm Scripts

### Basic Commands

```bash
# Install Playwright browsers (first time only)
npm run playwright:install

# Start dev server manually
npm run server

# Run all tests
npm test
# or
npm run test:playwright

# Run with server auto-start/stop
npm run test:with-server
```

### Test Suites

```bash
npm run test:smoke        # Smoke tests (72 tests)
npm run test:e2e          # E2E tests (30 tests)
npm run test:i18n         # i18n tests (7 tests)
npm run test:jobs         # Job tests (5 tests)
npm run test:offcanvas    # Offcanvas tests (5 tests)
```

### Development

```bash
npm run test:ui           # Interactive UI mode
npm run test:headed       # Run with visible browser
npm run test:debug        # Debug mode
npm run test:codegen      # Code generator
```

### Browser-Specific

```bash
npm run test:chromium     # Chromium only
npm run test:firefox      # Firefox only
npm run test:mobile       # Mobile (webkit) only
```

### Reporting

```bash
npm run test:report       # Show test report
```

## Development Workflow

### 1. First Time Setup

```bash
# Install dependencies
npm install

# Install Playwright browsers
npm run playwright:install
# or
./run-tests.sh install
```

### 2. Daily Development

**Option A: Using the bash script (recommended)**

```bash
# Run tests in UI mode for interactive debugging
./run-tests.sh ui
```

**Option B: Using npm**

```bash
# Start server in one terminal
npm run server

# Run tests in another terminal
npm run test:ui
```

### 3. Before Committing

```bash
# Run all tests
./run-tests.sh

# Or run specific suites
./run-tests.sh smoke     # Quick validation
./run-tests.sh e2e       # User flows
```

### 4. Debugging Failed Tests

```bash
# Option 1: UI mode (best)
./run-tests.sh ui

# Option 2: Debug mode
./run-tests.sh debug

# Option 3: View trace from last run
./run-tests.sh report
```

## Test Suites Breakdown

### Smoke Tests (`smoke-links.spec.ts`) - 72 tests

Tests that all navigation links work across all pages:

- Header links on all 33 pages
- Footer links on representative pages
- Mobile offcanvas navigation
- Critical navigation paths
- Hash link scrolling

**When to run**: Quick validation, before commits, after navigation changes

```bash
./run-tests.sh smoke
```

### E2E Tests (`e2e-navigation.spec.ts`) - 30 tests

Complete user journey tests:

- Job search and application flow
- Company browsing
- User registration and login
- Profile editing
- Information pages
- Cross-page consistency

**When to run**: Before releases, after feature changes, weekly regression

```bash
./run-tests.sh e2e
```

### Feature Tests - 17 tests

Specific component tests:

- `i18n.spec.ts` (7 tests) - Language toggle
- `jobs.spec.js` (5 tests) - Job pages
- `offcanvas.spec.ts` (5 tests) - Mobile menu

**When to run**: After changing specific features

```bash
./run-tests.sh i18n
./run-tests.sh jobs
./run-tests.sh offcanvas
```

## Troubleshooting

### Server Port Already in Use

If port 8000 is already in use:

```bash
# Option 1: Use --no-server flag
./run-tests.sh --no-server

# Option 2: Kill the process using port 8000
lsof -ti:8000 | xargs kill

# Option 3: Start server on different port and update config
python3 -m http.server 8001
# Update baseURL in playwright.config.js
```

### Tests Timeout

```bash
# Increase timeout in playwright.config.js
timeout: 60000  // 60 seconds

# Or run with longer timeout
npx playwright test --timeout=60000
```

### Browsers Not Installed

```bash
# Install all browsers
npm run playwright:install

# Or install with system dependencies
npx playwright install --with-deps
```

### Server Won't Start

```bash
# Check if Python is installed
python3 --version

# Try starting manually
cd /path/to/project
python3 -m http.server 8000

# Check server logs
cat /tmp/mmdc-wst-server-*.log
```

### Tests Fail but Work Locally

1. Check baseURL in `playwright.config.js` matches your server
2. Verify all pages exist and are accessible
3. Check for race conditions (add explicit waits)
4. Run in headed mode to see what's happening: `./run-tests.sh headed`

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Playwright Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Run tests
        run: npm run test:with-server

      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

### Running in Docker

```dockerfile
FROM mcr.microsoft.com/playwright:v1.40.0-focal

WORKDIR /app
COPY . .
RUN npm ci
RUN npx playwright install

CMD ["npm", "run", "test:with-server"]
```

## Advanced Usage

### Running Specific Tests

```bash
# By file name
./run-tests.sh --grep "smoke-links"

# By test name
./run-tests.sh --grep "Brand logo"

# By describe block
./run-tests.sh --grep "Smoke Tests: Header"

# Invert grep (exclude)
npx playwright test --grep-invert "mobile"
```

### Running in Parallel

```bash
# Run with more workers
npx playwright test --workers=4

# Disable parallel execution
npx playwright test --workers=1
```

### Debugging Specific Test

```bash
# Debug single test
npx playwright test --debug -g "Brand logo"

# Step through specific file
npx playwright test --debug smoke-links.spec.ts
```

### Generating New Tests

```bash
# Start code generator
./run-tests.sh codegen

# Generate test for specific page
npx playwright codegen http://localhost:8000/pages/about.html
```

## Test Maintenance

### Adding New Pages

1. Add page to `PAGES` array in `smoke-links.spec.ts`:

```typescript
{ path: '/pages/newpage.html', name: 'New Page' }
```

2. Run smoke tests to verify:

```bash
./run-tests.sh smoke
```

### Updating Selectors

1. Use UI mode to inspect elements:

```bash
./run-tests.sh ui
```

2. Update selectors in test files

3. Verify with specific test:

```bash
./run-tests.sh --grep "specific test name"
```

### Creating New E2E Flow

1. Generate code as starting point:

```bash
./run-tests.sh codegen
```

2. Add test to `e2e-navigation.spec.ts`

3. Test the new flow:

```bash
./run-tests.sh e2e --grep "new flow name"
```

## Performance Tips

- Use `test:smoke` for quick validation (most comprehensive)
- Use `test:chromium` for faster runs (single browser)
- Use `--workers=4` to parallelize across more cores
- Run specific test files instead of full suite during development
- Use UI mode (`test:ui`) instead of running tests repeatedly

## Getting Help

```bash
# Show script help
./run-tests.sh --help

# List all tests
./run-tests.sh list

# Show Playwright help
npx playwright test --help

# View test documentation
cat tests/playwright/TEST_GUIDE.md
cat tests/playwright/QUICK_REFERENCE.md
```

## Summary

**Recommended for Development:**

```bash
./run-tests.sh ui
```

**Recommended for Quick Validation:**

```bash
./run-tests.sh smoke
```

**Recommended for CI/CD:**

```bash
npm run test:with-server
```

**Recommended Before Commits:**

```bash
./run-tests.sh
```

For more details, see:

- `TEST_GUIDE.md` - Comprehensive test documentation
- `QUICK_REFERENCE.md` - Command quick reference
- `TEST_UPDATE_SUMMARY.md` - What changed in this update
