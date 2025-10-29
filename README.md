# RAD RPC Template with Bun

A Rapid Application Development (RAD) template for building Remote Procedure Call (RPC) applications using the Bun JavaScript runtime. This template provides a simple, fast way to create client-server applications where the client can call server-side functions seamlessly.

## Features

- **Fast Runtime**: Powered by Bun, a fast JavaScript runtime and bundler.
- **Simple RPC**: Easy-to-use RPC mechanism for client-server communication.
- **No Build Step**: Direct HTML and JavaScript, no complex build processes.
- **CORS Support**: Configured for local development with CORS handling.
- **Async Support**: Supports both synchronous and asynchronous RPC calls.

## Prerequisites

- [Bun](https://bun.sh/) installed on your system.

## Installation

1. Clone or download this template.
2. Navigate to the project directory.
3. No additional dependencies are required as Bun handles everything.

## Usage

1. Start the server:
   ```bash
   bun run server.js
   ```

2. Open your browser and go to `http://localhost:3000`.

3. Click the "Run demo" button to see the RPC calls in action.

The server will serve the `client.html` file and handle RPC requests at the `/rpc` endpoint.

## Project Structure

- `server.js`: The Bun server that handles HTTP requests and RPC calls.
- `client.html`: The client-side HTML file with embedded JavaScript for making RPC calls.

## API

The server exposes an `api` object with methods that can be called from the client:

- `add(a, b)`: Returns the sum of two numbers.
- `greet(name)`: Returns a greeting message.
- `randomColour()`: Returns a random color (async example).

To add new methods, simply add them to the `api` object in `server.js`.

## Customization

### Adding New RPC Methods

In `server.js`, add your functions to the `api` object:

```javascript
const api = {
  // existing methods...
  yourNewMethod: (param1, param2) => {
    // your logic here
    return result;
  },
};
```

### Client-Side Usage

In `client.html`, use the `api` proxy to call server methods:

```javascript
const result = await api.yourNewMethod(arg1, arg2);
```

### Changing the Port

Modify the port in `server.js`:

```javascript
serve({
  fetch: handler,
  port: 8080,  // change to your desired port
});
```

## License

This template is provided as-is for educational and development purposes.