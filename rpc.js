// ── rpc.js ──
// Reusable RPC server factory for Bun

import { serve } from "bun";

/**
 * Creates an RPC server that exposes an API object over HTTP
 * @param {Object} api - Object containing methods to expose
 * @param {Object} options - Server configuration
 * @param {number} options.port - Port to listen on (default: 3000)
 * @param {string[]} options.allowedOrigins - CORS allowed origins
 * @param {string} options.staticFile - Optional HTML file to serve at root
 * @returns {Server} Bun server instance
 */
export function makeRpcServer(api, options = {}) {
  const {
    port = 3000,
    allowedOrigins = ["http://localhost:3000", "http://127.0.0.1:3000"],
    staticFile = null,
  } = options;

  async function handler(req) {
    console.log(`${req.method} ${req.url} from ${req.headers.get("origin") || "unknown origin"}`);

    const url = new URL(req.url);
    const pathname = url.pathname;

    // Serve static HTML file at root if provided
    if (staticFile && req.method === "GET" && (pathname === "/" || pathname === `/${staticFile}`)) {
      return new Response(Bun.file(staticFile), {
        headers: { "Content-Type": "text/html" },
      });
    }

    // API discovery endpoint
    if (req.method === "GET" && pathname === "/rpc/methods") {
      const methods = Object.keys(api).map(name => ({
        name,
        type: typeof api[name] === "function" ? "function" : "unknown",
      }));
      return new Response(JSON.stringify({ methods }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // Handle CORS preflight
    if (req.method === "OPTIONS") {
      const origin = req.headers.get("origin");
      const isAllowed = origin && allowedOrigins.includes(origin);

      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": isAllowed ? origin : "",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    // RPC endpoint
    if (pathname === "/rpc" && req.method === "POST") {
      const contentType = req.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        return new Response("Bad request", { status: 400 });
      }

      let payload;
      try {
        payload = await req.json();
      } catch {
        return new Response("Invalid JSON", { status: 400 });
      }

      const { method, args } = payload;
      const fn = api[method];
      if (!fn) {
        return new Response(JSON.stringify({ error: "unknown method" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      try {
        const result = await fn(...args);
        return new Response(JSON.stringify({ result }), {
          headers: { "Content-Type": "application/json" },
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    return new Response("Not found", { status: 404 });
  }

  const server = serve({
    fetch: handler,
    port,
  });

  console.log(`🚀 Bun RPC server listening at http://localhost:${server.port}`);
  console.log(`   API methods: ${Object.keys(api).join(", ")}`);
  console.log(`   Discovery: http://localhost:${server.port}/rpc/methods`);

  return server;
}
