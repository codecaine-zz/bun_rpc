// ── tests/demos/compression.test.ts ──
// Tests for Compression demo

import { describe, test, expect, beforeAll } from "bun:test";

describe("Compression Demo", () => {
  const port = 3018;
  const baseUrl = `http://localhost:${port}`;

  beforeAll(async () => {
    await import("../../demos/compression/server.ts");
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

  const sampleText = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. ".repeat(10);

  test("should compress text with gzip", async () => {
    const data = await callRpc("gzipCompress", [sampleText]);
    expect(data.result).toBeDefined();
    expect(data.result.originalSize).toBeGreaterThan(0);
    expect(data.result.compressedSize).toBeLessThan(data.result.originalSize);
    expect(data.result.base64).toBeDefined();
    expect(data.result.ratio).toBeDefined();
  });

  test("should decompress gzip data", async () => {
    const compressData = await callRpc("gzipCompress", [sampleText]);
    const base64 = compressData.result.base64;
    
    const decompressData = await callRpc("gzipDecompress", [base64]);
    expect(decompressData.result).toBe(sampleText);
  });

  test("should compress text with deflate", async () => {
    const data = await callRpc("deflateCompress", [sampleText]);
    expect(data.result).toBeDefined();
    expect(data.result.compressedSize).toBeLessThan(data.result.originalSize);
  });

  test("should decompress deflate data", async () => {
    const compressData = await callRpc("deflateCompress", [sampleText]);
    const base64 = compressData.result.base64;
    
    const decompressData = await callRpc("deflateDecompress", [base64]);
    expect(decompressData.result).toBe(sampleText);
  });

  test.skip("should compress text with zstd async", async () => {
    // Skipped: zstd may not be available in all Bun versions
    const data = await callRpc("zstdCompress", [sampleText, 3]);
    expect(data.result).toBeDefined();
    expect(data.result.compressedSize).toBeLessThan(data.result.originalSize);
    expect(data.result.level).toBe(3);
  });

  test.skip("should decompress zstd data async", async () => {
    // Skipped: zstd may not be available in all Bun versions
    const compressData = await callRpc("zstdCompress", [sampleText, 3]);
    const base64 = compressData.result.base64;
    
    const decompressData = await callRpc("zstdDecompress", [base64]);
    expect(decompressData.result).toBe(sampleText);
  });

  test.skip("should compress text with zstd sync", async () => {
    // Skipped: zstd may not be available in all Bun versions
    const data = await callRpc("zstdCompressSync", [sampleText, 5]);
    expect(data.result).toBeDefined();
    expect(data.result.compressedSize).toBeLessThan(data.result.originalSize);
    expect(data.result.level).toBe(5);
  });

  test.skip("should decompress zstd data sync", async () => {
    // Skipped: zstd may not be available in all Bun versions
    const compressData = await callRpc("zstdCompressSync", [sampleText, 3]);
    const base64 = compressData.result.base64;
    
    const decompressData = await callRpc("zstdDecompressSync", [base64]);
    expect(decompressData.result).toBe(sampleText);
  });

  test.skip("should compare compression algorithms", async () => {
    // Skipped: zstd may not be available in all Bun versions
    const data = await callRpc("compareCompression", [sampleText]);
    expect(data.result).toBeDefined();
    expect(data.result.original).toBeGreaterThan(0);
    expect(data.result.gzip).toBeDefined();
    expect(data.result.deflate).toBeDefined();
    expect(data.result.zstd).toBeDefined();
    expect(data.result.winner).toBeDefined();
    expect(['gzip', 'deflate', 'zstd']).toContain(data.result.winner);
  });

  test("should achieve good compression ratio", async () => {
    const data = await callRpc("gzipCompress", [sampleText]);
    const ratio = parseFloat(data.result.ratio);
    expect(ratio).toBeGreaterThan(50); // Should compress by at least 50%
  });

  test.skip("should handle different compression levels", async () => {
    // Skipped: zstd may not be available in all Bun versions
    const level1 = await callRpc("zstdCompressSync", [sampleText, 1]);
    const level10 = await callRpc("zstdCompressSync", [sampleText, 10]);
    
    // Higher compression level should produce smaller output
    expect(level10.result.compressedSize).toBeLessThanOrEqual(level1.result.compressedSize);
  });
});
