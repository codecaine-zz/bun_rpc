// ── tests/rpc.test.ts ──
// Tests for the RPC framework

import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { makeRpcServer } from "../rpc.ts";
import type { Server } from "bun";

describe("RPC Framework", () => {
  let server: Server;
  const port = 9000;
  const baseUrl = `http://localhost:${port}`;

  const testApi = {
    add: (a: number, b: number): number => a + b,
    greet: (name: string): string => `Hello, ${name}!`,
    asyncOperation: async (): Promise<string> => {
      await Bun.sleep(10);
      return "completed";
    },
    throwError: (): never => {
      throw new Error("Intentional error");
    },
  };

  beforeAll(() => {
    server = makeRpcServer(testApi, {
      port,
      allowedOrigins: ["http://localhost:9000"],
    });
  });

  afterAll(() => {
    server.stop();
  });

  test("should call simple RPC method", async () => {
    const response = await fetch(`${baseUrl}/rpc`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ method: "add", args: [5, 3] }),
    });

    const data = await response.json();
    expect(data.result).toBe(8);
    expect(data.error).toBeUndefined();
  });

  test("should call method with string parameter", async () => {
    const response = await fetch(`${baseUrl}/rpc`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ method: "greet", args: ["World"] }),
    });

    const data = await response.json();
    expect(data.result).toBe("Hello, World!");
  });

  test("should handle async operations", async () => {
    const response = await fetch(`${baseUrl}/rpc`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ method: "asyncOperation", args: [] }),
    });

    const data = await response.json();
    expect(data.result).toBe("completed");
  });

  test("should return error for non-existent method", async () => {
    const response = await fetch(`${baseUrl}/rpc`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ method: "nonExistent", args: [] }),
    });

    const data = await response.json();
    expect(data.error).toBeDefined();
    expect(data.error).toContain("unknown method");
  });

  test("should handle method errors gracefully", async () => {
    const response = await fetch(`${baseUrl}/rpc`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ method: "throwError", args: [] }),
    });

    const data = await response.json();
    expect(data.error).toBeDefined();
    expect(data.error).toContain("Intentional error");
  });

  test("should return method list", async () => {
    const response = await fetch(`${baseUrl}/rpc/methods`);
    const data = await response.json();

    expect(data.methods).toBeDefined();
    expect(Array.isArray(data.methods)).toBe(true);
    expect(data.methods.length).toBeGreaterThan(0);

    const methodNames = data.methods.map((m: any) => m.name);
    expect(methodNames).toContain("add");
    expect(methodNames).toContain("greet");
  });

  test("should reject non-POST requests to /rpc", async () => {
    const response = await fetch(`${baseUrl}/rpc`, {
      method: "GET",
    });

    expect(response.status).toBe(404);
  });

  test("should reject invalid JSON", async () => {
    const response = await fetch(`${baseUrl}/rpc`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "invalid json",
    });

    try {
      const data = await response.json();
      expect(data.error).toBeDefined();
    } catch (e) {
      // Invalid JSON response is expected
      expect(e).toBeDefined();
    }
  });
});
