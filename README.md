# Bun RPC - The Simplest RPC Server

A minimal, zero-dependency RPC server template for Bun with full TypeScript support. Define typed functions, call them from the frontend—that's it.

## Why This Exists

- **No framework**: Just Bun + native HTTP
- **No build step**: Bun runs TypeScript natively
- **No boilerplate**: Define your API, call `makeRpcServer()`, done
- **Type-safe**: Full TypeScript types with automatic discovery
- **Auto-documentation**: API methods with types exposed via discovery endpoint

## Quick Start

1. **Install Bun** (if you haven't): [bun.sh](https://bun.sh/)

2. **Start the server:**
   ```bash
   bun start
   # or directly:
   bun run server.ts
   ```

3. **Open** `http://localhost:3000` in your browser

4. **Click "Run demo"** to see typed RPC calls in action

5. **Click "Discover API"** to see all methods with their type signatures

## Project Structure

```
├── rpc.ts        # Reusable RPC server factory with type extraction
├── server.ts     # Your typed API definition (edit this!)
├── client.html   # Frontend with auto-magic RPC proxy
└── server.js     # Optional JavaScript version (legacy)
```

## Adding Your Own Methods

**Edit `server.ts` with full TypeScript types:**

```typescript
import { makeRpcServer } from "./rpc.ts";

// Configuration - centralized config for easy maintenance
const CONFIG = {
  PORT: 3000,
  STATIC_FILE: "client.html",
  SOURCE_FILE: "./server.ts",
  ALLOWED_ORIGINS: ["http://localhost:3000", "http://127.0.0.1:3000"],
} as const;

const api = {
  /** add two numbers */
  add: (a: number, b: number): number => a + b,
  
  /** greet a person */
  greet: (name: string): string => `Hello, ${name}!`,
  
  /** multiply numbers - your new method */
  multiply: (a: number, b: number): number => a * b,
  
  /** fetch user data - async example */
  async getUser(id: number): Promise<{ id: number; name: string }> {
    // Your async logic here
    return { id, name: "Alice" };
  },
};

makeRpcServer(api, {
  port: CONFIG.PORT,
  staticFile: CONFIG.STATIC_FILE,
  sourceFile: CONFIG.SOURCE_FILE,  // Enables type extraction
  allowedOrigins: CONFIG.ALLOWED_ORIGINS,
});
```

**Call from the frontend:**

```javascript
const result = await api.multiply(6, 7);  // → 42
const user = await api.getUser(123);      // → { id: 123, name: "Alice" }
```

## API Discovery with Types

The discovery endpoint automatically extracts TypeScript types from your source code:

**Visit** `http://localhost:3000/rpc/methods` **or click "Discover API"** to see:

```
Available methods:

  add(a: number, b: number): number
    ↳ add two numbers

  greet(name: string): string
    ↳ greet a person

  getUser(id: number): Promise<{ id: number; name: string }>
    ↳ fetch user data - async example
```

Types and JSDoc comments are automatically extracted and displayed!

## Configuration Options

```typescript
// All demos use centralized CONFIG for easy maintenance
const CONFIG = {
  PORT: 3000,                    // Server port - change in one place!
  STATIC_FILE: "client.html",    // HTML file to serve at root
  SOURCE_FILE: "./server.ts",    // Source file for type extraction
  ALLOWED_ORIGINS: [             // CORS origins
    "http://localhost:3000",
    "http://127.0.0.1:3000",
  ],
  // Add your own config here (DB paths, data directories, etc.)
} as const;

makeRpcServer(api, {
  port: CONFIG.PORT,
  staticFile: CONFIG.STATIC_FILE,
  sourceFile: CONFIG.SOURCE_FILE,
  allowedOrigins: CONFIG.ALLOWED_ORIGINS,
});
```

**Benefits of centralized CONFIG:**
- ✅ No magic numbers scattered throughout code
- ✅ Update port in one place and it changes everywhere
- ✅ Easy to spot all configuration at a glance
- ✅ Type-safe with `as const`

## TypeScript Benefits

- **IntelliSense**: Full autocomplete in VS Code
- **Type checking**: Catch errors before runtime
- **Auto-documentation**: Types visible in discovery endpoint
- **Refactoring**: Rename/change signatures safely
- **No build step**: Bun runs `.ts` files directly

## Using with Desktop Apps

### Neutralinojs

1. **Install Neutralinojs:**
   ```bash
   npm install -g @neutralinojs/neu
   neu create my-app
   ```

2. **Copy `client.html`** to your Neutralinojs `resources` folder

3. **Update CORS** in `server.ts`:
   ```typescript
   makeRpcServer(api, {
     allowedOrigins: ["http://localhost", "http://localhost:3000"],
   });
   ```

4. **Run both:**
   ```bash
   bun start        # Terminal 1
   neu run          # Terminal 2
   ```

### pywebview, Tauri, Electron

Same pattern: start your RPC server, point your webview at `http://localhost:3000`, adjust CORS as needed.

## JavaScript Version

If you prefer JavaScript, use `server.js` and `rpc.js` instead (still included). The TypeScript version is recommended for better DX.

## Testing

Comprehensive test suite covering the RPC framework and all demo applications.

```bash
# Run all tests
bun test

# Run with verbose output
bun test --verbose

# Run specific test
bun test tests/rpc.test.ts

# Watch mode
bun test --watch

# Coverage report
bun test --coverage
```

**Test Results:**
- ✅ 92 tests passing
- ⏭️ 6 tests skipped
- ✅ 250 assertions
- ✅ Completes in ~864ms

See [TEST_SUMMARY.md](TEST_SUMMARY.md) for detailed test coverage and [tests/README.md](tests/README.md) for testing guide.

## Demo Applications

Check out the [demos/](demos/) directory for complete example applications showcasing Bun's built-in APIs:
- **Shell Runner** (3010) - Safe shell command execution
- **File Manager** (3011) - File I/O operations
- **Notes App** (3012) - SQLite database usage
- **WebSocket Chat** (3013) - Real-time communication
- **Password Manager** (3014) - Argon2id hashing
- **System Utilities** (3015) - Bun utility APIs
- **UUID Generator** (3016) - Random data generation
- **Text Processor** (3017) - Text manipulation
- **Compression** (3018) - Gzip, Deflate, Zstd compression

All demos use centralized CONFIG objects - no magic numbers!

See [demos/README.md](demos/README.md) for details.

## License

This template is provided as-is for educational and development purposes.