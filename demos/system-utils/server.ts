// ── System Utilities Demo ──
// Demonstrates Bun's utility APIs: Bun.version, Bun.env, Bun.which, etc.
// Run with: bun run demos/system-utils/server.ts

import { makeRpcServer } from "../../rpc.ts";
import { $ } from "bun";
import { join } from "path";

const CONFIG = {
  PORT: 3015,
  STATIC_FILE: join(import.meta.dir, "client.html"),
  SOURCE_FILE: join(import.meta.dir, "server.ts"),
} as const;

const api = {
  /** Get Bun runtime information */
  getBunInfo: (): {
    version: string;
    revision: string;
    platform: string;
    arch: string;
  } => {
    return {
      version: Bun.version,
      revision: Bun.revision,
      platform: process.platform,
      arch: process.arch,
    };
  },

  /** Get environment variables (filtered for safety) */
  getEnvironment: (): Record<string, string> => {
    const safe = [
      "HOME",
      "USER",
      "SHELL",
      "PATH",
      "LANG",
      "TERM",
      "PWD",
      "NODE_ENV",
    ];
    
    const env: Record<string, string> = {};
    for (const key of safe) {
      if (Bun.env[key]) {
        env[key] = Bun.env[key];
      }
    }
    return env;
  },

  /** Find the path to an executable using Bun.which */
  which: async (command: string): Promise<string | null> => {
    return Bun.which(command);
  },

  /** Get system uptime and load */
  getSystemStats: async (): Promise<{
    uptime: number;
    loadAverage: number[];
    totalMemory: number;
    freeMemory: number;
    cpuCount: number;
  }> => {
    const os = await import("os");
    return {
      uptime: os.uptime(),
      loadAverage: os.loadavg(),
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      cpuCount: os.cpus().length,
    };
  },

  /** Get process information */
  getProcessInfo: (): {
    pid: number;
    ppid: number;
    argv: string[];
    execPath: string;
    cwd: string;
    memoryUsage: NodeJS.MemoryUsage;
    uptime: number;
  } => {
    return {
      pid: process.pid,
      ppid: process.ppid,
      argv: process.argv,
      execPath: process.execPath,
      cwd: process.cwd(),
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime(),
    };
  },

  /** Sleep for a specified duration (demonstrates Bun.sleep) */
  sleep: async (milliseconds: number): Promise<string> => {
    const start = Date.now();
    await Bun.sleep(milliseconds);
    const end = Date.now();
    return `Slept for ${end - start}ms`;
  },

  /** Get high-resolution timestamp in nanoseconds */
  getNanoseconds: (): number => {
    return Bun.nanoseconds();
  },

  /** Inspect a JavaScript value (Bun.inspect) */
  inspect: (value: any): string => {
    return Bun.inspect(value);
  },

  /** Deep equals comparison (Bun.deepEquals) */
  deepEquals: (a: any, b: any): boolean => {
    return Bun.deepEquals(a, b);
  },

  /** Get file URL to path conversion */
  fileURLToPath: (url: string): string => {
    return Bun.fileURLToPath(url);
  },

  /** Get path to file URL conversion */
  pathToFileURL: (path: string): string => {
    return Bun.pathToFileURL(path).href;
  },

  /** Escape HTML (Bun.escapeHTML) */
  escapeHTML: (text: string): string => {
    return Bun.escapeHTML(text);
  },

  /** Get string display width (Bun.stringWidth) */
  stringWidth: (text: string): number => {
    return Bun.stringWidth(text);
  },

  /** Get disk usage information */
  getDiskUsage: async (): Promise<string> => {
    try {
      const result = await $`df -h /`.text();
      return result;
    } catch (error: any) {
      return `Error: ${error.message}`;
    }
  },
};

makeRpcServer(api, {
  port: CONFIG.PORT,
  staticFile: CONFIG.STATIC_FILE,
  sourceFile: CONFIG.SOURCE_FILE,
});

console.log(`⚙️ System Utilities Demo running at http://localhost:${CONFIG.PORT}`);
