// ── tests/demos/text-processor.test.ts ──
// Tests for Text Processor demo

import { describe, test, expect, beforeAll } from "bun:test";

describe("Text Processor Demo", () => {
  const port = 3017;
  const baseUrl = `http://localhost:${port}`;

  beforeAll(async () => {
    await import("../../demos/text-processor/server.ts");
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

  test("should escape HTML", async () => {
    const data = await callRpc("escapeHTML", ["<script>alert('xss')</script>"]);
    expect(data.result).toBeDefined();
    expect(data.result).not.toContain("<script>");
    expect(data.result).toContain("&lt;");
  });

  test("should get string width", async () => {
    const data = await callRpc("getStringWidth", ["Hello"]);
    expect(data.result).toBeDefined();
    expect(data.result).toBe(5);
  });

  test("should count words", async () => {
    const data = await callRpc("countWords", ["Hello world this is a test"]);
    expect(data.result).toBeDefined();
    expect(data.result).toBe(6);
  });

  test("should analyze text", async () => {
    const text = "Hello World!\nThis is a test.";
    const data = await callRpc("analyzeText", [text]);
    expect(data.result).toBeDefined();
    expect(data.result.characters).toBeGreaterThan(0);
    expect(data.result.words).toBeGreaterThan(0);
    expect(data.result.lines).toBe(2);
  });

  test("should convert to uppercase", async () => {
    const data = await callRpc("convertCase", ["hello", "upper"]);
    expect(data.result).toBe("HELLO");
  });

  test("should convert to lowercase", async () => {
    const data = await callRpc("convertCase", ["HELLO", "lower"]);
    expect(data.result).toBe("hello");
  });

  test("should convert to title case", async () => {
    const data = await callRpc("convertCase", ["hello world", "title"]);
    expect(data.result).toBe("Hello World");
  });

  test("should normalize whitespace", async () => {
    const data = await callRpc("normalizeWhitespace", ["hello    world  test"]);
    expect(data.result).toBe("hello world test");
  });

  test("should reverse text", async () => {
    const data = await callRpc("reverseText", ["hello"]);
    expect(data.result).toBe("olleh");
  });

  test("should extract URLs", async () => {
    const text = "Visit https://bun.sh and http://example.com";
    const data = await callRpc("extractURLs", [text]);
    expect(data.result).toBeDefined();
    expect(Array.isArray(data.result)).toBe(true);
    expect(data.result.length).toBe(2);
    expect(data.result).toContain("https://bun.sh");
  });

  test("should extract emails", async () => {
    const text = "Contact us at test@example.com or hello@bun.sh";
    const data = await callRpc("extractEmails", [text]);
    expect(data.result).toBeDefined();
    expect(Array.isArray(data.result)).toBe(true);
    expect(data.result.length).toBe(2);
  });

  test("should find and replace", async () => {
    const data = await callRpc("findReplace", ["hello hello", "hello", "hi", true]);
    expect(data.result).toBeDefined();
    expect(data.result.result).toBe("hi hi");
    expect(data.result.count).toBe(2);
  });

  test("should remove duplicate lines", async () => {
    const text = "line1\nline2\nline1\nline3";
    const data = await callRpc("removeDuplicateLines", [text]);
    expect(data.result).toBeDefined();
    expect(data.result.split("\n").length).toBe(3);
  });

  test("should sort lines ascending", async () => {
    const text = "c\nb\na";
    const data = await callRpc("sortLines", [text, "asc"]);
    expect(data.result).toBe("a\nb\nc");
  });

  test("should sort lines descending", async () => {
    const text = "a\nb\nc";
    const data = await callRpc("sortLines", [text, "desc"]);
    expect(data.result).toBe("c\nb\na");
  });

  test("should add line numbers", async () => {
    const text = "line1\nline2\nline3";
    const data = await callRpc("addLineNumbers", [text]);
    expect(data.result).toBeDefined();
    expect(data.result).toContain("1. line1");
    expect(data.result).toContain("2. line2");
  });

  test("should truncate text", async () => {
    const data = await callRpc("truncate", ["Hello World", 8, "..."]);
    expect(data.result).toBe("Hello...");
  });

  test("should wrap text", async () => {
    const text = "This is a long line that should be wrapped";
    const data = await callRpc("wrapText", [text, 20]);
    expect(data.result).toBeDefined();
    expect(data.result).toContain("\n");
  });

  test("should strip HTML", async () => {
    const html = "<div>Hello <b>World</b></div>";
    const data = await callRpc("stripHTML", [html]);
    expect(data.result).toBe("Hello World");
  });

  test("should encode base64", async () => {
    const data = await callRpc("base64Encode", ["Hello"]);
    expect(data.result).toBe("SGVsbG8=");
  });

  test("should decode base64", async () => {
    const data = await callRpc("base64Decode", ["SGVsbG8="]);
    expect(data.result).toBe("Hello");
  });

  test("should calculate reading time", async () => {
    const text = "word ".repeat(200); // 200 words
    const data = await callRpc("getReadingTime", [text]);
    expect(data.result).toBeDefined();
    expect(data.result.wordCount).toBe(200);
    expect(data.result.minutes).toBeGreaterThanOrEqual(0);
  });
});
