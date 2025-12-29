// ── tests/demos/shell-runner.test.ts ──
// Tests for Shell Runner demo

import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import type { Server } from "bun";

describe("Shell Runner Demo", () => {
  let server: Server;
  const port = 3010;
  const baseUrl = `http://localhost:${port}`;

  beforeAll(async () => {
    // Dynamically import to avoid port conflicts
    const module = await import("../../demos/shell-runner/server.ts");
  });

  async function callRpc(method: string, args: any[]) {
    const response = await fetch(`${baseUrl}/rpc`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ method, args }),
    });
    return await response.json();
  }

  test("should list files", async () => {
    const data = await callRpc("listFiles", []);
    expect(data.result).toBeDefined();
    expect(Array.isArray(data.result)).toBe(true);
  });

  test("should get current directory", async () => {
    const data = await callRpc("getCurrentDir", []);
    expect(data.result).toBeDefined();
    expect(typeof data.result).toBe("string");
    expect(data.result.length).toBeGreaterThan(0);
  });

  test("should get system info", async () => {
    const data = await callRpc("getSystemInfo", []);
    expect(data.result).toBeDefined();
    expect(data.result.os).toBeDefined();
    expect(data.result.user).toBeDefined();
    expect(data.result.date).toBeDefined();
  });

  test("should echo message", async () => {
    const message = "Hello from test";
    const data = await callRpc("echo", [message]);
    expect(data.result).toContain("Hello from test");
  });

  test("should reject unsafe commands", async () => {
    const data = await callRpc("runCommand", ["rm -rf /"]);
    expect(data.error).toBeDefined();
    expect(data.error).toContain("not allowed");
  });

  test("should run safe command", async () => {
    const data = await callRpc("runCommand", ["pwd"]);
    expect(data.result).toBeDefined();
    expect(data.result.stdout).toBeDefined();
  });
});
