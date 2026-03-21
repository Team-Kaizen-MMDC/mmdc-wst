# Test Scripts Summary

## Created Files

### 1. Bash Script: `run-tests.sh`

A comprehensive bash script for running Playwright tests with automatic server management.

**Features:**

- ✅ Automatic Python server start/stop
- ✅ Colored output for better readability
- ✅ Server detection (won't start if already running)
- ✅ Graceful shutdown on Ctrl+C
- ✅ Multiple test commands (all, smoke, e2e, ui, debug, etc.)
- ✅ Browser-specific testing (chromium, firefox, mobile)
- ✅ Pattern matching with `--grep`
- ✅ Help documentation built-in

**Usage:**

```bash
# Make executable (first time)
chmod +x run-tests.sh

# Run all tests
./run-tests.sh

# Run specific suite
./run-tests.sh smoke
./run-tests.sh e2e
./run-tests.sh ui

# Run with options
./run-tests.sh --grep "Brand logo"
./run-tests.sh smoke --no-server
```

### 2. npm Scripts (Updated `package.json`)

Added comprehensive npm scripts for all test scenarios.

**Added Scripts:**

```json
"test": "npx playwright test"
"test:ui": "npx playwright test --ui"
"test:headed": "npx playwright test --headed"
"test:debug": "npx playwright test --debug"
"test:smoke": "npx playwright test smoke-links.spec.ts"
"test:e2e": "npx playwright test e2e-navigation.spec.ts"
"test:i18n": "npx playwright test i18n.spec.ts"
"test:jobs": "npx playwright test jobs.spec.js"
"test:offcanvas": "npx playwright test offcanvas.spec.ts"
"test:chromium": "npx playwright test --project=chromium"
"test:firefox": "npx playwright test --project=firefox"
"test:mobile": "npx playwright test --project=webkit-mobile"
"test:report": "npx playwright show-report"
"test:codegen": "npx playwright codegen http://localhost:3000"
"test:with-server": "..." // Auto-start/stop server
```

**Usage:**

```bash
npm test                  # Run all tests
npm run test:smoke        # Smoke tests
npm run test:ui           # UI mode
npm run test:chromium     # Chromium only
```

### 3. Makefile Targets (Updated `Makefile`)

Added make targets for convenient test running.

**Added Targets:**

```makefile
make test           # Run all tests
make test-smoke     # Smoke tests only
make test-e2e       # E2E tests only
make test-ui        # UI mode
make test-install   # Install browsers
```

**Usage:**

```bash
make test
make test-smoke
make test-ui
```

### 4. Documentation: `RUNNING_TESTS.md`

Comprehensive guide for running tests with:

- Quick start instructions
- All available commands
- Development workflow
- Troubleshooting guide
- CI/CD integration examples
- Test maintenance tips
- Advanced usage patterns

## Quick Reference

### Recommended Commands

| Task             | Bash Script              | npm                          | Make                |
| ---------------- | ------------------------ | ---------------------------- | ------------------- |
| Run all tests    | `./run-tests.sh`         | `npm test`                   | `make test`         |
| Smoke tests      | `./run-tests.sh smoke`   | `npm run test:smoke`         | `make test-smoke`   |
| E2E tests        | `./run-tests.sh e2e`     | `npm run test:e2e`           | `make test-e2e`     |
| UI mode          | `./run-tests.sh ui`      | `npm run test:ui`            | `make test-ui`      |
| Install browsers | `./run-tests.sh install` | `npm run playwright:install` | `make test-install` |

### Most Useful Commands

**For Development:**

```bash
./run-tests.sh ui              # Best for interactive debugging
```

**For Quick Validation:**

```bash
./run-tests.sh smoke           # Fast validation of all pages
```

**Before Commits:**

```bash
./run-tests.sh                 # Run all tests
```

**For CI/CD:**

```bash
npm run test:with-server       # Auto-manages server
```

## Features Comparison

| Feature           | Bash Script  | npm Scripts | Make         |
| ----------------- | ------------ | ----------- | ------------ |
| Auto-start server | ✅ Yes       | ⚠️ Manual   | ⚠️ Manual    |
| Colored output    | ✅ Yes       | ❌ No       | ❌ No        |
| Help message      | ✅ Built-in  | ❌ No       | ✅ Yes       |
| Pattern matching  | ✅ `--grep`  | ⚠️ Manual   | ⚠️ Manual    |
| Server detection  | ✅ Yes       | ❌ No       | ❌ No        |
| Exit codes        | ✅ Proper    | ✅ Proper   | ✅ Proper    |
| Cross-platform    | ⚠️ Unix only | ✅ All      | ⚠️ Unix only |

**Recommendation:** Use bash script (`./run-tests.sh`) for best experience on Unix systems.

## Test Commands Available

### All Methods Support

1. **All Tests** - Run complete test suite (119 tests)
2. **Smoke Tests** - Test all pages/links (72 tests)
3. **E2E Tests** - Test user flows (30 tests)
4. **i18n Tests** - Test language toggle (7 tests)
5. **Jobs Tests** - Test job pages (5 tests)
6. **Offcanvas Tests** - Test mobile menu (5 tests)
7. **UI Mode** - Interactive debugging
8. **Chromium/Firefox/Mobile** - Browser-specific testing

### Bash Script Only

9. **Debug Mode** - Step-through debugging
10. **Headed Mode** - Visible browser
11. **Code Generator** - Record new tests
12. **List Tests** - Show all available tests
13. **Pattern Matching** - `--grep` support
14. **No-Server Mode** - Skip server management
15. **Help Command** - Built-in documentation

## Examples

### Daily Development

```bash
# Start server once
npm run server

# In another terminal, run tests interactively
./run-tests.sh ui
```

### Quick Check

```bash
# Run smoke tests (validates all pages quickly)
./run-tests.sh smoke
```

### Before Commit

```bash
# Run all tests with auto-managed server
./run-tests.sh
```

### Debug Specific Test

```bash
# Debug a specific test by name
./run-tests.sh debug --grep "Brand logo"
```

### CI Pipeline

```bash
# Run tests with server auto-start/stop
npm run test:with-server
```

### Generate New Test

```bash
# Launch code generator
./run-tests.sh codegen
```

## File Structure

```
mmdc-wst/
├── run-tests.sh                              # Main bash script
├── package.json                              # npm scripts
├── Makefile                                  # Make targets
└── tests/
    └── playwright/
        ├── smoke-links.spec.ts              # 72 smoke tests
        ├── e2e-navigation.spec.ts           # 30 E2E tests
        ├── i18n.spec.ts                     # 7 i18n tests
        ├── jobs.spec.js                     # 5 job tests
        ├── offcanvas.spec.ts                # 5 offcanvas tests
        ├── playwright.config.js             # Playwright config
        ├── RUNNING_TESTS.md                 # This guide
        ├── TEST_GUIDE.md                    # Comprehensive docs
        ├── QUICK_REFERENCE.md               # Quick commands
        └── TEST_UPDATE_SUMMARY.md           # What changed
```

## Getting Started

### First Time Setup

```bash
# 1. Install dependencies
npm install

# 2. Install Playwright browsers (choose one)
./run-tests.sh install
npm run playwright:install
make test-install

# 3. Run tests (choose one)
./run-tests.sh
npm test
make test
```

### Choose Your Method

**Use Bash Script (`./run-tests.sh`) if:**

- ✅ You're on macOS/Linux
- ✅ You want automatic server management
- ✅ You want colored output
- ✅ You want the most features

**Use npm Scripts (`npm run test:*`) if:**

- ✅ You're on Windows
- ✅ You want standard Node.js tooling
- ✅ You're familiar with npm scripts

**Use Make (`make test*`) if:**

- ✅ You prefer Make for project tasks
- ✅ You want simple, short commands
- ✅ You're already using Make for other tasks

## Troubleshooting

### Script Won't Run

```bash
# Make executable
chmod +x run-tests.sh

# Or run directly
bash run-tests.sh
```

### Port 8000 Already in Use

```bash
# Option 1: Use existing server
./run-tests.sh --no-server

# Option 2: Kill process on port 8000
lsof -ti:3000 | xargs kill
```

### Browsers Not Installed

```bash
./run-tests.sh install
```

### Tests Fail

```bash
# Run in UI mode to debug
./run-tests.sh ui
```

## Summary

**Files Created:**

- ✅ `run-tests.sh` - Bash script (359 lines)
- ✅ `RUNNING_TESTS.md` - Documentation (500+ lines)
- ✅ Updated `package.json` - Added 17 test scripts
- ✅ Updated `Makefile` - Added 5 test targets

**Total Commands Added:** 30+ different ways to run tests

**Best Practices:**

1. Use `./run-tests.sh ui` for development
2. Use `./run-tests.sh smoke` for quick checks
3. Use `./run-tests.sh` before commits
4. Use `npm run test:with-server` in CI/CD

**Next Steps:**

1. Try running: `./run-tests.sh ui`
2. Explore: `./run-tests.sh --help`
3. Read: `tests/playwright/RUNNING_TESTS.md`
