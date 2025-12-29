# Bun RPC - Test Suite

This directory contains comprehensive tests for the RPC framework and all demo applications.

## Running Tests

```bash
# Run all tests
bun test

# Run with verbose output
bun test --verbose

# Run tests in watch mode
bun test --watch

# Run with coverage
bun test --coverage

# Run specific test file
bun test tests/rpc.test.ts
```

## Test Structure

```
tests/
├── rpc.test.ts                    # Core RPC framework tests
└── demos/
    ├── shell-runner.test.ts       # Shell command execution tests
    ├── file-manager.test.ts       # File I/O operations tests
    ├── notes-app.test.ts          # SQLite database tests
    ├── password-manager.test.ts   # Password hashing tests
    ├── system-utils.test.ts       # System utilities tests
    ├── uuid-random.test.ts        # UUID and random generation tests
    └── text-processor.test.ts     # Text processing tests
```

## Test Coverage

The test suite covers:

- ✅ RPC method calls (sync and async)
- ✅ Error handling
- ✅ Input validation
- ✅ API endpoint responses
- ✅ Database operations
- ✅ File operations
- ✅ Hashing and cryptography
- ✅ System utilities
- ✅ Random data generation
- ✅ Text processing

## Writing New Tests

Use Bun's built-in test framework:

```typescript
import { describe, test, expect, beforeAll, afterAll } from "bun:test";

describe("My Feature", () => {
  beforeAll(() => {
    // Setup before all tests
  });

  test("should do something", async () => {
    const result = await myFunction();
    expect(result).toBe(expected);
  });

  afterAll(() => {
    // Cleanup after all tests
  });
});
```

## Test Ports

Each demo uses a unique port to avoid conflicts:

- Main RPC: 9000
- Shell Runner: 9010
- File Manager: 9011
- Notes App: 9012
- Password Manager: 9014
- System Utils: 9015
- UUID/Random: 9016
- Text Processor: 9017

## Continuous Integration

These tests are designed to run in CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Run tests
  run: bun test
```

## Troubleshooting

If tests fail:

1. Check that no other services are using test ports
2. Ensure all demo dependencies are met
3. Verify file permissions for file-based tests
4. Check database file access for SQLite tests
5. Review error messages for specific issues
