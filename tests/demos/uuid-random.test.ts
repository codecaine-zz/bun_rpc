// ── tests/demos/uuid-random.test.ts ──
// Tests for UUID & Random Generator demo

import { describe, test, expect, beforeAll } from "bun:test";

describe("UUID & Random Generator Demo", () => {
  const port = 3016;
  const baseUrl = `http://localhost:${port}`;

  beforeAll(async () => {
    await import("../../demos/uuid-random/server.ts");
    await Bun.sleep(100);
  });

  async function callRpc(method: string, args: any[]) {
    const response = await fetch(`${baseUrl}/rpc`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ method, args }),
    });
    return await response.json();
  }

  test("should generate UUID", async () => {
    const data = await callRpc("generateUUID", []);
    expect(data.result).toBeDefined();
    expect(typeof data.result).toBe("string");
    expect(data.result.length).toBe(36); // UUID format
    expect(data.result).toMatch(/^[0-9a-f-]+$/);
  });

  test("should generate multiple UUIDs", async () => {
    const data = await callRpc("generateUUIDs", [5]);
    expect(data.result).toBeDefined();
    expect(Array.isArray(data.result)).toBe(true);
    expect(data.result.length).toBe(5);
    // Check uniqueness
    const unique = new Set(data.result);
    expect(unique.size).toBe(5);
  });

  test("should generate random integer in range", async () => {
    const data = await callRpc("randomInt", [1, 10]);
    expect(data.result).toBeDefined();
    expect(typeof data.result).toBe("number");
    expect(data.result).toBeGreaterThanOrEqual(1);
    expect(data.result).toBeLessThanOrEqual(10);
  });

  test("should generate multiple random integers", async () => {
    const data = await callRpc("randomInts", [10, 1, 100]);
    expect(data.result).toBeDefined();
    expect(Array.isArray(data.result)).toBe(true);
    expect(data.result.length).toBe(10);
    data.result.forEach((num: number) => {
      expect(num).toBeGreaterThanOrEqual(1);
      expect(num).toBeLessThanOrEqual(100);
    });
  });

  test("should generate random string", async () => {
    const data = await callRpc("randomString", [16, "alphanumeric"]);
    expect(data.result).toBeDefined();
    expect(typeof data.result).toBe("string");
    expect(data.result.length).toBe(16);
    expect(data.result).toMatch(/^[a-zA-Z0-9]+$/);
  });

  test("should generate hex string", async () => {
    const data = await callRpc("randomString", [10, "hex"]);
    expect(data.result).toBeDefined();
    expect(data.result.length).toBe(10);
    expect(data.result).toMatch(/^[0-9a-f]+$/);
  });

  test("should generate random color", async () => {
    const data = await callRpc("randomColor", []);
    expect(data.result).toBeDefined();
    expect(data.result).toMatch(/^#[0-9a-f]{6}$/);
  });

  test("should generate multiple colors", async () => {
    const data = await callRpc("randomColors", [5]);
    expect(data.result).toBeDefined();
    expect(Array.isArray(data.result)).toBe(true);
    expect(data.result.length).toBe(5);
    data.result.forEach((color: string) => {
      expect(color).toMatch(/^#[0-9a-f]{6}$/);
    });
  });

  test("should generate random boolean", async () => {
    const data = await callRpc("randomBoolean", []);
    expect(data.result).toBeDefined();
    expect(typeof data.result).toBe("boolean");
  });

  test("should generate random float", async () => {
    const data = await callRpc("randomFloat", [0, 1, 2]);
    expect(data.result).toBeDefined();
    expect(typeof data.result).toBe("number");
    expect(data.result).toBeGreaterThanOrEqual(0);
    expect(data.result).toBeLessThanOrEqual(1);
  });

  test("should generate random date", async () => {
    const start = "2024-01-01";
    const end = "2024-12-31";
    const data = await callRpc("randomDate", [start, end]);
    expect(data.result).toBeDefined();
    const date = new Date(data.result);
    expect(date.getTime()).toBeGreaterThanOrEqual(new Date(start).getTime());
    expect(date.getTime()).toBeLessThanOrEqual(new Date(end).getTime());
  });

  test("should generate password", async () => {
    const data = await callRpc("generatePassword", [16, true]);
    expect(data.result).toBeDefined();
    expect(typeof data.result).toBe("string");
    expect(data.result.length).toBe(16);
  });

  test("should shuffle array", async () => {
    const original = [1, 2, 3, 4, 5];
    const data = await callRpc("shuffle", [original]);
    expect(data.result).toBeDefined();
    expect(Array.isArray(data.result)).toBe(true);
    expect(data.result.length).toBe(original.length);
    // Check all elements are present
    expect(data.result.sort()).toEqual(original.sort());
  });

  test("should pick random items", async () => {
    const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const data = await callRpc("randomPick", [items, 3]);
    expect(data.result).toBeDefined();
    expect(Array.isArray(data.result)).toBe(true);
    expect(data.result.length).toBe(3);
    // Check all picked items are from original
    data.result.forEach((item: number) => {
      expect(items).toContain(item);
    });
  });
});
