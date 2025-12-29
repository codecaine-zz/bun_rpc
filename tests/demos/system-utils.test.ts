// ── tests/demos/system-utils.test.ts ──
// Tests for System Utilities demo

import { describe, test, expect, beforeAll } from "bun:test";

describe("System Utilities Demo", () => {
  const port = 3015;
  const baseUrl = `http://localhost:${port}`;

  beforeAll(async () => {
    await import("../../demos/system-utils/server.ts");
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

  test("should get Bun info", async () => {
    const data = await callRpc("getBunInfo", []);
    expect(data.result).toBeDefined();
    expect(data.result.version).toBeDefined();
    expect(data.result.revision).toBeDefined();
    expect(data.result.platform).toBeDefined();
    expect(data.result.arch).toBeDefined();
  });

  test("should get environment variables", async () => {
    const data = await callRpc("getEnvironment", []);
    expect(data.result).toBeDefined();
    expect(typeof data.result).toBe("object");
  });

  test("should find executable with which", async () => {
    const data = await callRpc("which", ["node"]);
    expect(data.result).toBeDefined();
    // Result can be null if command not found, which is valid
  });

  test("should get system stats", async () => {
    const data = await callRpc("getSystemStats", []);
    expect(data.result).toBeDefined();
    expect(data.result.uptime).toBeGreaterThan(0);
    expect(data.result.totalMemory).toBeGreaterThan(0);
    expect(data.result.cpuCount).toBeGreaterThan(0);
  });

  test("should get process info", async () => {
    const data = await callRpc("getProcessInfo", []);
    expect(data.result).toBeDefined();
    expect(data.result.pid).toBeGreaterThan(0);
    expect(data.result.cwd).toBeDefined();
    expect(data.result.memoryUsage).toBeDefined();
  });

  test("should sleep for specified duration", async () => {
    const start = Date.now();
    const data = await callRpc("sleep", [100]);
    const duration = Date.now() - start;
    
    expect(data.result).toBeDefined();
    expect(data.result).toContain("Slept");
    expect(duration).toBeGreaterThanOrEqual(100);
  });

  test("should get nanoseconds timestamp", async () => {
    const data = await callRpc("getNanoseconds", []);
    expect(data.result).toBeDefined();
    expect(typeof data.result).toBe("number");
    expect(data.result).toBeGreaterThan(0);
  });

  test("should escape HTML", async () => {
    const data = await callRpc("escapeHTML", ["<script>alert('xss')</script>"]);
    expect(data.result).toBeDefined();
    expect(data.result).not.toContain("<script>");
    expect(data.result).toContain("&lt;");
  });

  test("should get string width", async () => {
    const data = await callRpc("stringWidth", ["Hello"]);
    expect(data.result).toBeDefined();
    expect(data.result).toBe(5);
  });

  test("should convert file URL to path", async () => {
    const data = await callRpc("fileURLToPath", ["file:///tmp/test.txt"]);
    expect(data.result).toBeDefined();
    expect(typeof data.result).toBe("string");
  });

  test("should convert path to file URL", async () => {
    const data = await callRpc("pathToFileURL", ["/tmp/test.txt"]);
    expect(data.result).toBeDefined();
    expect(data.result).toContain("file://");
  });

  test("should test deep equals", async () => {
    const data1 = await callRpc("deepEquals", [{ a: 1 }, { a: 1 }]);
    expect(data1.result).toBe(true);

    const data2 = await callRpc("deepEquals", [{ a: 1 }, { a: 2 }]);
    expect(data2.result).toBe(false);
  });
});
