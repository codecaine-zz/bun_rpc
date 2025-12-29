# Bun RPC Demos

This folder contains small demo applications showcasing RAD (Rapid Application Development) with Bun's built-in APIs and the RPC framework.

## Available Demos

### 1. Shell Runner (`/shell-runner`)
Execute safe shell commands using Bun's `$` shell API.
- **Features**: Run whitelisted commands, get system info, list files
- **Bun APIs**: `$` (shell command execution)
- **Run**: `bun run demos/shell-runner/server.ts`
- **Open**: http://localhost:3010

### 2. File Manager (`/file-manager`)
Manage files with Bun's File I/O APIs.
- **Features**: Create, read, update, delete files, list directory contents
- **Bun APIs**: `Bun.file`, `Bun.write`, `Bun.Glob`
- **Run**: `bun run demos/file-manager/server.ts`
- **Open**: http://localhost:3011

### 3. Notes App (`/notes-app`)
Full-featured notes application with SQLite database.
- **Features**: CRUD operations, categories, search, SQLite persistence
- **Bun APIs**: `bun:sqlite`, `Database`
- **Run**: `bun run demos/notes-app/server.ts`
- **Open**: http://localhost:3012

### 4. Redis Demo (`/redis`)
Production-ready Redis operations with controllers.
- **Features**: Sessions, caching, rate limiting, counters, storage
- **Package**: `@codecaine/bun-redis-wrapper`
- **Controllers**: SessionController, CacheController, RateLimiterController, CounterController, StorageController
- **Run**: `bun run demos/redis/server.ts`
- **Open**: http://localhost:3013
- **Requires**: Redis server running on localhost:6379

### 5. WebSocket Chat (`/websocket-chat`)
Real-time chat application using WebSockets.
- **Features**: Multi-user chat, user presence, real-time messaging
- **Bun APIs**: `Bun.serve` with WebSocket support
- **Run**: `bun run demos/websocket-chat/server.ts`
- **Open**: http://localhost:3014

### 6. Password Manager (`/password-manager`)
Secure password storage with hashing.
- **Features**: Password hashing (Argon2id), verification, various hash algorithms
- **Bun APIs**: `Bun.password`, `Bun.hash`, `Bun.CryptoHasher`
- **Run**: `bun run demos/password-manager/server.ts`
- **Open**: http://localhost:3015

### 7. System Utilities (`/system-utils`)
Explore system information and Bun utilities.
- **Features**: Runtime info, environment variables, system stats, process info
- **Bun APIs**: `Bun.version`, `Bun.env`, `Bun.which`, `Bun.sleep`, `Bun.escapeHTML`, etc.
- **Run**: `bun run demos/system-utils/server.ts`
- **Open**: http://localhost:3016

### 8. UUID & Random Generator (`/uuid-random`)
Generate UUIDs and random data.
- **Features**: UUIDv7, random integers, strings, colors, passwords
- **Bun APIs**: `randomUUIDv7()`, `Math.random()` utilities
- **Run**: `bun run demos/uuid-random/server.ts`
- **Open**: http://localhost:3017

### 9. Text Processor (`/text-processor`)
Comprehensive text processing utilities.
- **Features**: Case conversion, HTML escape, find/replace, text analysis
- **Bun APIs**: `Bun.escapeHTML`, `Bun.stringWidth`, `Bun.indexOfLine`
- **Run**: `bun run demos/text-processor/server.ts`
- **Open**: http://localhost:3018

### 10. Compression (`/compression`)
Compress and decompress data using multiple algorithms.
- **Features**: Gzip, Deflate, Zstd compression, algorithm comparison
- **Bun APIs**: `Bun.gzipSync`, `Bun.gunzipSync`, `Bun.deflateSync`, `Bun.inflateSync`, `Bun.zstdCompress`, `Bun.zstdDecompress`
- **Run**: `bun run demos/compression/server.ts`
- **Open**: http://localhost:3019

## Quick Start

Each demo is self-contained and can be run independently:

```bash
# Run any demo
cd demos/<demo-name>
bun run server.ts

# Or from project root
bun run demos/<demo-name>/server.ts
```

## What You'll Learn

These demos showcase Bun's official APIs from https://bun.sh/docs/runtime/bun-apis:

- **Shell**: Execute system commands safely with `$`
- **File I/O**: Work with files using `Bun.file`, `Bun.write`, `Bun.Glob`
- **SQLite**: Built-in database with `bun:sqlite`
- **WebSockets**: Real-time communication with `Bun.serve`
- **Redis**: Production-ready Redis operations with `@codecaine/bun-redis-wrapper`
- **WebSockets**: Real-time communication with `Bun.serve`
- **Hashing**: Secure password hashing with `Bun.password`, `Bun.hash`
- **Utilities**: System info, environment variables, UUID generation
- **Text Processing**: `Bun.escapeHTML`, `Bun.stringWidth`, and more
- **Compression**: Data compression with Gzip, Deflate, and Zstd
## Template Structure

Each demo follows the same structure:
- `server.ts` - Server-side API implementation using Bun's native APIs
- `client.html` - Client-side UI with RPC calls
- Uses `../../rpc.ts` for the RPC framework

## Development Tips

1. **Start Simple**: Each demo is self-contained and easy to understand
2. **No Dependencies**: All demos use only Bun's built-in APIs (no npm packages)
3. **Type Safe**: TypeScript with full type safety
4. **Copy & Modify**: Use these as templates for your own projects
5. **RAD Ready**: Perfect for rapid application development
6. **Production Ready**: Best practices for security and error handling

## Best Practices Demonstrated

- ✅ Input validation and sanitization
- ✅ Error handling with try/catch
- ✅ Security considerations (whitelisted commands, safe file operations)
- ✅ Clean separation of concerns
- ✅ Responsive UI design
- ✅ Real-time updates where applicable
- ✅ User-friendly interfaces for non-developers
