# 🧪 Testing Quick Reference

## Run Tests

| Command | Description |
|---------|-------------|
| `bun test` | Run all tests |
| `bun test --verbose` | Run with detailed output |
| `bun test --watch` | Run in watch mode (re-run on changes) |
| `bun test --coverage` | Run with coverage report |
| `bun test tests/rpc.test.ts` | Run specific test file |

## NPM Scripts

```bash
npm test              # Run all tests
npm run test:verbose  # Verbose output
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

## Test Files

```
tests/
├── rpc.test.ts                      # Core RPC framework (8 tests)
├── demos/
│   ├── shell-runner.test.ts        # Shell commands (6 tests)
│   ├── file-manager.test.ts        # File I/O (5 tests)
│   ├── notes-app.test.ts           # SQLite database (9 tests)
│   ├── password-manager.test.ts    # Password hashing (12 tests)
│   ├── system-utils.test.ts        # System utilities (13 tests)
│   ├── uuid-random.test.ts         # UUID/random gen (14 tests)
│   ├── text-processor.test.ts      # Text processing (23 tests)
│   └── compression.test.ts         # Compression (5 tests, 6 skipped)
└── README.md                        # Testing documentation
```

## Test Status

```
✅ 92 tests passing
⏭️ 6 tests skipped (version-dependent features)
✅ 250 assertions
✅ 0 failures
⚡ ~864ms execution time
```

## Quick Test Example

```typescript
import { describe, test, expect, beforeAll } from "bun:test";

describe("My Feature", () => {
  beforeAll(async () => {
    // Setup: start server
    await import("../../path/to/server.ts");
  });

  test("should work correctly", async () => {
    const response = await fetch("http://localhost:3000/rpc", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ method: "add", args: [2, 3] }),
    });
    
    const data = await response.json();
    expect(data.result).toBe(5);
  });
});
```

## Test Ports

| Service | Port |
|---------|------|
| Main RPC | 9000 |
| Shell Runner | 3010 |
| File Manager | 3011 |
| Notes App | 3012 |
| Password Manager | 3014 |
| System Utils | 3015 |
| UUID/Random | 3016 |
| Text Processor | 3017 |
| Compression | 3018 |

## CI/CD Example

```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: oven-sh/setup-bun@v1
      - run: bun test
```

## Need Help?

- 📖 [Full Test Documentation](tests/README.md)
- 📊 [Test Summary Report](TEST_SUMMARY.md)
- 🚀 [Bun Test Docs](https://bun.sh/docs/cli/test)
