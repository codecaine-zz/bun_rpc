// ── server.js ──
// Run with:  bun run server.js

import { makeRpcServer } from "./rpc.js";

/* -------------------------------------------------
   1️⃣  Define your API – just plain functions!
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
   2️⃣  That's it! The helper does the rest.
   ------------------------------------------------- */
makeRpcServer(api, {
  port: 3000,
  staticFile: "client.html",
  allowedOrigins: ["http://localhost:3000", "http://127.0.0.1:3000"],
});
