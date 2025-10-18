# Test Commands Cheat Sheet

## 🚀 Most Common Commands

```bash
# 🎯 RECOMMENDED: Interactive UI mode (best for development)
./run-tests.sh ui

# ✅ Quick validation (smoke tests - 72 tests, ~30 seconds)
./run-tests.sh smoke

# 🔍 Run all tests (119 tests, ~2 minutes)
./run-tests.sh

# 🐛 Debug specific test
./run-tests.sh --grep "Brand logo"
```

## 📋 All Test Suites

| Suite               | Tests | Time    | Command                    |
| ------------------- | ----- | ------- | -------------------------- |
| **All Tests**       | 119   | ~2 min  | `./run-tests.sh`           |
| **Smoke Tests**     | 72    | ~30 sec | `./run-tests.sh smoke`     |
| **E2E Tests**       | 30    | ~45 sec | `./run-tests.sh e2e`       |
| **i18n Tests**      | 7     | ~10 sec | `./run-tests.sh i18n`      |
| **Job Tests**       | 5     | ~8 sec  | `./run-tests.sh jobs`      |
| **Offcanvas Tests** | 5     | ~8 sec  | `./run-tests.sh offcanvas` |

## 🛠️ Three Ways to Run Tests

### Method 1: Bash Script (⭐ RECOMMENDED)

```bash
./run-tests.sh [command]        # Auto-manages server
./run-tests.sh smoke            # Smoke tests
./run-tests.sh ui               # UI mode
./run-tests.sh --help           # Show help
```

### Method 2: npm Scripts

```bash
npm test                        # All tests
npm run test:smoke              # Smoke tests
npm run test:ui                 # UI mode
npm run test:with-server        # With auto-server
```

### Method 3: Make

```bash
make test                       # All tests
make test-smoke                 # Smoke tests
make test-ui                    # UI mode
make test-install               # Install browsers
```

## 🎯 By Use Case

### Development

```bash
./run-tests.sh ui              # Interactive debugging ⭐
./run-tests.sh debug           # Step-through debugging
./run-tests.sh headed          # See browser window
```

### Validation

```bash
./run-tests.sh smoke           # Quick check (30 sec) ⭐
./run-tests.sh e2e             # User flows (45 sec)
./run-tests.sh                 # Complete suite (2 min)
```

### Debugging

```bash
./run-tests.sh ui              # Best option ⭐
./run-tests.sh debug           # CLI debugging
./run-tests.sh --grep "test"   # Specific test
./run-tests.sh report          # View last results
```

### CI/CD

```bash
npm run test:with-server       # Auto-server ⭐
./run-tests.sh --no-server     # External server
npm test                       # Simple
```

### Specific Features

```bash
./run-tests.sh i18n            # Language toggle
./run-tests.sh jobs            # Job pages
./run-tests.sh offcanvas       # Mobile menu
```

## 🌐 By Browser

```bash
./run-tests.sh chromium        # Chromium only
./run-tests.sh firefox         # Firefox only
./run-tests.sh mobile          # Mobile (iPhone 12)
```

```bash
npm run test:chromium          # Chromium only
npm run test:firefox           # Firefox only
npm run test:mobile            # Mobile
```

## 🔍 Advanced

```bash
# Pattern matching
./run-tests.sh --grep "Brand"
./run-tests.sh smoke --grep "Header"

# With existing server
./run-tests.sh --no-server

# Generate new tests
./run-tests.sh codegen

# List all tests
./run-tests.sh list

# Multiple options
./run-tests.sh headed chromium --grep "login"
```

## 📊 Decision Tree

```
Need to run tests?
├─ First time?
│  └─ ./run-tests.sh install
│
├─ Developing/debugging?
│  └─ ./run-tests.sh ui ⭐
│
├─ Quick check?
│  └─ ./run-tests.sh smoke
│
├─ Before commit?
│  └─ ./run-tests.sh
│
├─ CI/CD pipeline?
│  └─ npm run test:with-server
│
└─ Specific test failing?
   └─ ./run-tests.sh ui --grep "test name"
```

## 🎓 Learning Path

### Day 1: Getting Started

```bash
./run-tests.sh install         # Install browsers
./run-tests.sh smoke           # Run quick tests
./run-tests.sh --help          # Read help
```

### Day 2: Explore UI Mode

```bash
./run-tests.sh ui              # Interactive mode
# Click tests, see timeline, inspect DOM
```

### Day 3: Try Different Suites

```bash
./run-tests.sh smoke           # All pages
./run-tests.sh e2e             # User flows
./run-tests.sh i18n            # Language
```

### Day 4: Debug Issues

```bash
./run-tests.sh ui --grep "failing test"
./run-tests.sh debug
./run-tests.sh report
```

### Week 2: Add New Tests

```bash
./run-tests.sh codegen         # Record actions
# Edit test files
./run-tests.sh ui              # Verify
```

## 💡 Pro Tips

```bash
# 1. Always use UI mode for debugging
./run-tests.sh ui

# 2. Run smoke tests frequently (they're fast!)
./run-tests.sh smoke

# 3. Use grep to focus on specific tests
./run-tests.sh --grep "Brand logo"

# 4. Leave server running during development
npm run server                 # Terminal 1
./run-tests.sh ui --no-server  # Terminal 2

# 5. Check help anytime
./run-tests.sh --help
```

## ⚡ Speed Optimization

| Command                   | Time | When to Use          |
| ------------------------- | ---- | -------------------- |
| `./run-tests.sh i18n`     | ~10s | Testing translations |
| `./run-tests.sh jobs`     | ~8s  | Testing job pages    |
| `./run-tests.sh smoke`    | ~30s | Quick validation ⭐  |
| `./run-tests.sh e2e`      | ~45s | Testing flows        |
| `./run-tests.sh chromium` | ~45s | Single browser       |
| `./run-tests.sh`          | ~2m  | Full validation      |

## 🆘 Common Issues

```bash
# "Permission denied"
chmod +x run-tests.sh

# "Port 8000 in use"
./run-tests.sh --no-server

# "Browsers not installed"
./run-tests.sh install

# "Tests failing"
./run-tests.sh ui              # Debug visually

# "Need help"
./run-tests.sh --help
```

## 📚 Documentation

- `RUNNING_TESTS.md` - Complete guide
- `TEST_GUIDE.md` - Test documentation
- `QUICK_REFERENCE.md` - Quick commands
- `./run-tests.sh --help` - Built-in help

## ✅ Quick Start

```bash
# 1. Setup (first time only)
npm install
./run-tests.sh install

# 2. Run tests
./run-tests.sh ui              # Best for development
./run-tests.sh smoke           # Quick validation
./run-tests.sh                 # Full test suite

# 3. Get help
./run-tests.sh --help
```

---

**Remember:** When in doubt, use `./run-tests.sh ui` 🎯
