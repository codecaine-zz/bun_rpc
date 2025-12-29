// ── Compression Demo ──
// Demonstrates Bun's compression APIs: gzip, deflate, zstd
// Run with: bun run demos/compression/server.ts

import { makeRpcServer } from "../../rpc.ts";
import { join } from "path";

// Configuration
const CONFIG = {
  PORT: 3018,
  STATIC_FILE: join(import.meta.dir, "client.html"),
  SOURCE_FILE: join(import.meta.dir, "server.ts"),
} as const;

const api = {
  /** Compress text using gzip */
  gzipCompress: (text: string): { 
    originalSize: number; 
    compressedSize: number; 
    base64: string;
    ratio: string;
  } => {
    const data = Buffer.from(text);
    const compressed = Bun.gzipSync(data);
    
    return {
      originalSize: data.length,
      compressedSize: compressed.length,
      base64: Buffer.from(compressed).toString('base64'),
      ratio: `${((1 - compressed.length / data.length) * 100).toFixed(2)}%`,
    };
  },

  /** Decompress gzip data */
  gzipDecompress: (base64: string): string => {
    const compressed = Buffer.from(base64, 'base64');
    const decompressed = Bun.gunzipSync(compressed);
    return Buffer.from(decompressed).toString('utf-8');
  },

  /** Compress text using deflate */
  deflateCompress: (text: string): { 
    originalSize: number; 
    compressedSize: number; 
    base64: string;
    ratio: string;
  } => {
    const data = Buffer.from(text);
    const compressed = Bun.deflateSync(data);
    
    return {
      originalSize: data.length,
      compressedSize: compressed.length,
      base64: Buffer.from(compressed).toString('base64'),
      ratio: `${((1 - compressed.length / data.length) * 100).toFixed(2)}%`,
    };
  },

  /** Decompress deflate data */
  deflateDecompress: (base64: string): string => {
    const compressed = Buffer.from(base64, 'base64');
    const decompressed = Bun.inflateSync(compressed);
    return Buffer.from(decompressed).toString('utf-8');
  },

  /** Compress text using zstd (async) */
  zstdCompress: async (text: string, level: number = 3): Promise<{
    originalSize: number;
    compressedSize: number;
    base64: string;
    ratio: string;
    level: number;
  }> => {
    try {
      const data = Buffer.from(text);
      const compressed = await Bun.zstdCompress(data, { level });
      
      return {
        originalSize: data.length,
        compressedSize: compressed.length,
        base64: Buffer.from(compressed).toString('base64'),
        ratio: `${((1 - compressed.length / data.length) * 100).toFixed(2)}%`,
        level,
      };
    } catch (error: any) {
      throw new Error(`zstdCompress failed: ${error.message}`);
    }
  },

  /** Decompress zstd data (async) */
  zstdDecompress: async (base64: string): Promise<string> => {
    try {
      const compressed = Buffer.from(base64, 'base64');
      const decompressed = await Bun.zstdDecompress(compressed);
      return Buffer.from(decompressed).toString('utf-8');
    } catch (error: any) {
      throw new Error(`zstdDecompress failed: ${error.message}`);
    }
  },

  /** Compress text using zstd (sync) */
  zstdCompressSync: (text: string, level: number = 3): {
    originalSize: number;
    compressedSize: number;
    base64: string;
    ratio: string;
    level: number;
  } => {
    try {
      const data = Buffer.from(text);
      const compressed = Bun.zstdCompressSync(data, { level });
      
      return {
        originalSize: data.length,
        compressedSize: compressed.length,
        base64: Buffer.from(compressed).toString('base64'),
        ratio: `${((1 - compressed.length / data.length) * 100).toFixed(2)}%`,
        level,
      };
    } catch (error: any) {
      throw new Error(`zstdCompressSync failed: ${error.message}`);
    }
  },

  /** Decompress zstd data (sync) */
  zstdDecompressSync: (base64: string): string => {
    try {
      const compressed = Buffer.from(base64, 'base64');
      const decompressed = Bun.zstdDecompressSync(compressed);
      return Buffer.from(decompressed).toString('utf-8');
    } catch (error: any) {
      throw new Error(`zstdDecompressSync failed: ${error.message}`);
    }
  },

  /** Compare compression algorithms on sample text */
  compareCompression: async (text: string): Promise<{
    original: number;
    gzip: { size: number; ratio: string };
    deflate: { size: number; ratio: string };
    zstd: { size: number; ratio: string };
    winner: string;
  }> => {
    const data = Buffer.from(text);
    const gzipped = Bun.gzipSync(data);
    const deflated = Bun.deflateSync(data);
const zstded = await Bun.zstdCompress(data, { level: 3 });
    
    const results = {
      gzip: gzipped.length,
      deflate: deflated.length,
      zstd: zstded.length,
    };
    
    const winner = Object.entries(results).sort((a, b) => a[1] - b[1])[0]?.[0] || 'gzip';

    return {
      original: data.length,
      gzip: {
        size: gzipped.length,
        ratio: `${((1 - gzipped.length / data.length) * 100).toFixed(2)}%`,
      },
      deflate: {
        size: deflated.length,
        ratio: `${((1 - deflated.length / data.length) * 100).toFixed(2)}%`,
      },
      zstd: {
        size: zstded.length,
        ratio: `${((1 - zstded.length / data.length) * 100).toFixed(2)}%`,
      },
      winner,
    };
  },
};

makeRpcServer(api, {
  port: CONFIG.PORT,
  staticFile: CONFIG.STATIC_FILE,
  sourceFile: CONFIG.SOURCE_FILE,
});

console.log(`🗜️ Compression Demo running at http://localhost:${CONFIG.PORT}`);
