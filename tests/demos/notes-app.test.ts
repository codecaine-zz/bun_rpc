// ── tests/demos/notes-app.test.ts ──
// Tests for Notes App demo

import { describe, test, expect, beforeAll, afterAll } from "bun:test";

describe("Notes App Demo", () => {
  const port = 3012;
  const baseUrl = `http://localhost:${port}`;
  let testNoteId: number;

  beforeAll(async () => {
    await import("../../demos/notes-app/server.ts");
    await Bun.sleep(100); // Give server time to start
  });

  async function callRpc(method: string, args: any[]) {
    const response = await fetch(`${baseUrl}/rpc`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ method, args }),
    });
    return await response.json();
  }

  test("should create a note", async () => {
    const data = await callRpc("createNote", [
      "Test Note",
      "Test content",
      "test",
    ]);
    expect(data.result).toBeDefined();
    expect(data.result.title).toBe("Test Note");
    expect(data.result.content).toBe("Test content");
    expect(data.result.category).toBe("test");
    expect(data.result.id).toBeDefined();
    testNoteId = data.result.id;
  });

  test("should get all notes", async () => {
    const data = await callRpc("getAllNotes", []);
    expect(data.result).toBeDefined();
    expect(Array.isArray(data.result)).toBe(true);
    expect(data.result.length).toBeGreaterThan(0);
  });

  test("should get a single note", async () => {
    const data = await callRpc("getNote", [testNoteId]);
    expect(data.result).toBeDefined();
    expect(data.result.id).toBe(testNoteId);
    expect(data.result.title).toBe("Test Note");
  });

  test("should update a note", async () => {
    const data = await callRpc("updateNote", [
      testNoteId,
      "Updated Title",
      "Updated content",
      "test",
    ]);
    expect(data.result).toBeDefined();
    expect(data.result.title).toBe("Updated Title");
    expect(data.result.content).toBe("Updated content");
  });

  test("should search notes", async () => {
    const data = await callRpc("searchNotes", ["Updated"]);
    expect(data.result).toBeDefined();
    expect(Array.isArray(data.result)).toBe(true);
    expect(data.result.length).toBeGreaterThan(0);
  });

  test("should get notes by category", async () => {
    const data = await callRpc("getNotesByCategory", ["test"]);
    expect(data.result).toBeDefined();
    expect(Array.isArray(data.result)).toBe(true);
  });

  test("should get categories", async () => {
    const data = await callRpc("getCategories", []);
    expect(data.result).toBeDefined();
    expect(Array.isArray(data.result)).toBe(true);
  });

  test("should get stats", async () => {
    const data = await callRpc("getStats", []);
    expect(data.result).toBeDefined();
    expect(data.result.totalNotes).toBeGreaterThan(0);
  });

  test("should delete a note", async () => {
    const data = await callRpc("deleteNote", [testNoteId]);
    expect(data.result).toBeDefined();
    expect(data.result.success).toBe(true);
  });
});
