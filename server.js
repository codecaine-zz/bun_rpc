// ── server.js ──
// Run with:  bun run server.js

import { serve } from "bun";

/* -------------------------------------------------
   1️⃣  Put the functions you want the front‑end to call
   ------------------------------------------------- */
const api = {
  /** add two numbers */
  add: (a, b) => a + b,

  /** greet a person */
  greet: (name) => `Hello, ${name}!`,

  /** return a random colour – just to show async works */
  randomColour: async () => {
    await new Promise(r => setTimeout(r, 200));   // fake delay
    const colours = ["red", "green", "blue", "orange"];
    return colours[Math.floor(Math.random() * colours.length)];
  },
};

/* -------------------------------------------------
   2️⃣  Very small RPC handler (POST /rpc)
   ------------------------------------------------- */
async function handler(req) {
  console.log(`${req.method} ${req.url} from ${req.headers.get("origin") || "unknown origin"}`);

  const url = new URL(req.url);
  const pathname = url.pathname;

  // Serve the HTML file at root or /client.html
  if (req.method === "GET" && (pathname === "/" || pathname === "/client.html")) {
    return new Response(Bun.file("client.html"), {
      headers: { "Content-Type": "text/html" },
    });
  }

  // Respond to CORS preflight requests (OPTIONS)
  if (req.method === "OPTIONS") {
    const origin = req.headers.get("origin");
    const allowedOrigins = ["http://localhost:3000", "http://127.0.0.1:3000"];
    const isAllowed = origin && allowedOrigins.includes(origin);

    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": isAllowed ? origin : "",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  // Only accept JSON POST requests for RPC calls
  if (req.method !== "POST") {
    return new Response("Bad request", { status: 400 });
  }

  const contentType = req.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    return new Response("Bad request", { status: 400 });
  }

  let payload;
  try { payload = await req.json(); } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const { method, args } = payload;
  const fn = api[method];
  if (!fn) {
    return new Response(JSON.stringify({ error: "unknown method" }), {
      status: 404,
      headers: { "content-type": "application/json" },
    });
  }

  try {
    const result = await fn(...args);
    return new Response(JSON.stringify({ result }), {
      headers: { "content-type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}

/* -------------------------------------------------
   3️⃣  Start listening (port 3000 – change if you wish)
   ------------------------------------------------- */
const server = serve({
  fetch: handler,
  port: 3000,
});

console.log(`🚀 Bun RPC server listening at http://localhost:${server.port}`);
