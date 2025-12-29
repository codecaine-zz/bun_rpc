// ── server.ts ──
// Run with:  bun run server.ts

import { makeRpcServer } from "./rpc.ts";

// Configuration
const CONFIG = {
  PORT: 3000,
  STATIC_FILE: "client.html",
  SOURCE_FILE: "./server.ts",
  ALLOWED_ORIGINS: ["http://localhost:3000", "http://127.0.0.1:3000"],
} as const;

/* -------------------------------------------------
   1️⃣  Define your API – just plain functions with types!
   ------------------------------------------------- */
const api = {
  /** add two numbers */
  add: (a: number, b: number): number => a + b,

  /** greet a person */
  greet: (name: string): string => `Hello, ${name}!`,

  /** return a random colour – just to show async works */
  randomColour: async (): Promise<string> => {
    await new Promise(r => setTimeout(r, 200));   // fake delay
    const colours = ["red", "green", "blue", "orange"];
    return colours[Math.floor(Math.random() * colours.length)] || 'red';
  },
};

/* -------------------------------------------------
   2️⃣  That's it! The helper does the rest.
   ------------------------------------------------- */
makeRpcServer(api, {
  port: CONFIG.PORT,
  staticFile: CONFIG.STATIC_FILE,
  sourceFile: CONFIG.SOURCE_FILE,  // Enable type extraction
  allowedOrigins: [...CONFIG.ALLOWED_ORIGINS],
});
