// ── tests/demos/password-manager.test.ts ──
// Tests for Password Manager demo

import { describe, test, expect, beforeAll } from "bun:test";

describe("Password Manager Demo", () => {
  const port = 3014;
  const baseUrl = `http://localhost:${port}`;
  const testService = "test-service-" + Date.now();

  beforeAll(async () => {
    await import("../../demos/password-manager/server.ts");
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

  test("should hash a password", async () => {
    const data = await callRpc("hashPassword", ["mypassword123"]);
    expect(data.result).toBeDefined();
    expect(typeof data.result).toBe("string");
    expect(data.result.length).toBeGreaterThan(50);
  });

  test("should verify correct password", async () => {
    const password = "testpassword";
    const hashData = await callRpc("hashPassword", [password]);
    const hash = hashData.result;

    const verifyData = await callRpc("verifyPassword", [password, hash]);
    expect(verifyData.result).toBe(true);
  });

  test("should reject incorrect password", async () => {
    const hashData = await callRpc("hashPassword", ["correct"]);
    const hash = hashData.result;

    const verifyData = await callRpc("verifyPassword", ["wrong", hash]);
    expect(verifyData.result).toBe(false);
  });

  test("should add account with hashed password", async () => {
    const data = await callRpc("addAccount", [
      testService,
      "testuser",
      "password123",
    ]);
    expect(data.result).toBeDefined();
    expect(data.result).toContain("Account added");
  });

  test("should get all accounts", async () => {
    const data = await callRpc("getAllAccounts", []);
    expect(data.result).toBeDefined();
    expect(Array.isArray(data.result)).toBe(true);
    const found = data.result.find((acc: any) => acc.service === testService);
    expect(found).toBeDefined();
  });

  test("should check password for service", async () => {
    const data = await callRpc("checkPassword", [testService, "password123"]);
    expect(data.result).toBeDefined();
    expect(data.result.match).toBe(true);
    expect(data.result.username).toBe("testuser");
  });

  test("should reject wrong password for service", async () => {
    const data = await callRpc("checkPassword", [testService, "wrongpassword"]);
    expect(data.result).toBeDefined();
    expect(data.result.match).toBe(false);
  });

  test("should generate hash", async () => {
    const data = await callRpc("generateHash", ["test data", "sha256"]);
    expect(data.result).toBeDefined();
    expect(typeof data.result).toBe("string");
    expect(data.result.length).toBeGreaterThan(0);
  });

  test("should generate crypto hash", async () => {
    const data = await callRpc("generateCryptoHash", ["test data", "sha256"]);
    expect(data.result).toBeDefined();
    expect(typeof data.result).toBe("string");
  });

  test("should check password strength", async () => {
    const data = await callRpc("checkPasswordStrength", ["Weak1"]);
    expect(data.result).toBeDefined();
    expect(data.result.score).toBeDefined();
    expect(data.result.strength).toBeDefined();

    const strongData = await callRpc("checkPasswordStrength", [
      "Strong@Pass123word!",
    ]);
    expect(strongData.result.strength).toBe("Strong");
  });

  test("should delete account", async () => {
    const data = await callRpc("deleteAccount", [testService]);
    expect(data.result).toBeDefined();
    expect(data.result).toContain("deleted");
  });
});
