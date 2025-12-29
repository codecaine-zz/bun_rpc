# Bun RPC - The Simplest RPC Server

A minimal, zero-dependency RPC server template for Bun. Define functions, call them from the frontend—that's it.

## Why This Exists

- **No framework**: Just Bun + native HTTP
- **No build step**: Plain HTML and JavaScript
- **No boilerplate**: Define your API, call `makeRpcServer()`, done
- **Type-safe ready**: Add TypeScript later if you want

## Quick Start

1. **Install Bun** (if you haven't): [bun.sh](https://bun.sh/)

2. **Start the server:**
   ```bash
   bun run server.js
   ```

3. **Open** `http://localhost:3000` in your browser

4. **Click "Run demo"** to see RPC calls in action

## Project Structure

```
├── rpc.js        # Reusable RPC server factory (you won't edit this)
├── server.js     # Your API definition (edit this)
└── client.html   # Frontend with auto-magic RPC proxy
```

## Adding Your Own Methods

**That's the whole point—it's trivial:**

Edit `server.js`:

```javascript
import { makeRpcServer } from "./rpc.js";

const api = {
  add: (a, b) => a + b,
  greet: (name) => `Hello, ${name}!`,
  
  // Add your methods here:
  multiply: (a, b) => a * b,
  
  async fetchWeather: (city) => {
    // async works fine
    const res = await fetch(`https://api.example.com/weather?city=${city}`);
    return res.json();
  },
};

makeRpcServer(api, {
  port: 3000,
  staticFile: "client.html",
});
```

Call from the frontend:

```javascript
const result = await api.multiply(6, 7);  // → 42
const weather = await api.fetchWeather("London");
```

## API Discovery

Visit `http://localhost:3000/rpc/methods` to see all available methods, or click **"Discover API"** in the browser.

## Configuration Options

```javascript
makeRpcServer(api, {
  port: 3000,                    // Server port
  staticFile: "client.html",     // HTML file to serve at root
  allowedOrigins: [              // CORS origins
    "http://localhost:3000",
    "http://127.0.0.1:3000",
  ],
});
```

## Using with Desktop Apps

### Neutralinojs

1. **Install Neutralinojs:**
   ```bash
   npm install -g @neutralinojs/neu
   neu create my-app
   ```

2. **Copy `client.html`** to your Neutralinojs `resources` folder

3. **Update CORS** in `server.js` to allow Neutralinojs origin

4. **Run both:**
   ```bash
   bun run server.js    # Terminal 1
   neu run              # Terminal 2
   ```

### pywebview, Tauri, etc.

Same pattern: serve your RPC server, point your desktop webview at `http://localhost:3000`, adjust CORS as needed.

## License

This template is provided as-is for educational and development purposes.