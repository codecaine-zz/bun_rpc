// ── tests/demos/file-manager.test.ts ──
// Tests for File Manager demo

import { describe, test, expect, beforeAll, afterAll } from "bun:test";

describe("File Manager Demo", () => {
  const port = 3011;
  const baseUrl = `http://localhost:${port}`;

  beforeAll(async () => {
    await import("../../demos/file-manager/server.ts");
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

  test("should write and read file", async () => {
    const filename = "test_file.txt";
    const content = "Test content for file manager";

    // Write file
    const writeData = await callRpc("writeFile", [filename, content]);
    expect(writeData.result).toContain("written successfully");

    // Read file
    const readData = await callRpc("readFile", [filename]);
    expect(readData.result).toBe(content);

    // Clean up
    await callRpc("deleteFile", [filename]);
  });

  test("should get file stats", async () => {
    const filename = "stats_test.txt";
    await callRpc("writeFile", [filename, "content"]);

    const data = await callRpc("getFileStats", [filename]);
    expect(data.result).toBeDefined();
    expect(data.result.name).toBe(filename);
    expect(data.result.exists).toBe(true);
    expect(data.result.size).toBeGreaterThan(0);

    // Clean up
    await callRpc("deleteFile", [filename]);
  });

  test("should append to file", async () => {
    const filename = "append_test.txt";
    await callRpc("writeFile", [filename, "Hello "]);
    await callRpc("appendFile", [filename, "World"]);

    const readData = await callRpc("readFile", [filename]);
    expect(readData.result).toBe("Hello World");

    // Clean up
    await callRpc("deleteFile", [filename]);
  });

  test("should handle non-existent file", async () => {
    const data = await callRpc("readFile", ["nonexistent.txt"]);
    expect(data.error).toBeDefined();
    expect(data.error).toContain("not found");
  });
});
