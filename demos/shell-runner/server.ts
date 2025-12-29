// ── Shell Runner Demo ──
// Demonstrates Bun's Shell API with $ for running commands
// Run with: bun run demos/shell-runner/server.ts

import { makeRpcServer } from "../../rpc.ts";
import { $ } from "bun";
import { join } from "path";

// Configuration
const CONFIG = {
  PORT: 3010,
  STATIC_FILE: join(import.meta.dir, "client.html"),
  SOURCE_FILE: join(import.meta.dir, "server.ts"),
} as const;

const api = {
  /** Execute a safe shell command and return output */
  runCommand: async (command: string): Promise<{ stdout: string; stderr: string; exitCode: number }> => {
    // Security: Only allow safe, whitelisted commands
    const safeCommands = ['ls', 'pwd', 'date', 'whoami', 'uname', 'echo'];
    const cmd = command.trim().split(' ')[0] || '';
    
    if (!safeCommands.includes(cmd)) {
      throw new Error(`Command '${cmd}' is not allowed. Allowed: ${safeCommands.join(', ')}`);
    }

    try {
      // Use Bun.spawn() to properly handle command with arguments
      const proc = Bun.spawn(command.trim().split(' '), {
        stdout: "pipe",
        stderr: "pipe",
      });
      
      const [stdout, stderr] = await Promise.all([
        new Response(proc.stdout).text(),
        new Response(proc.stderr).text()
      ]);
      
      await proc.exited;
      
      return {
        stdout: stdout,
        stderr: stderr,
        exitCode: proc.exitCode || 0
      };
    } catch (error: any) {
      return {
        stdout: '',
        stderr: error.message || 'Command execution failed',
        exitCode: 1
      };
    }
  },

  /** List files in current directory */
  listFiles: async (): Promise<string[]> => {
    const result = await $`ls -la`.text();
    return result.split('\n').filter(line => line.trim());
  },

  /** Get current working directory */
  getCurrentDir: async (): Promise<string> => {
    return await $`pwd`.text();
  },

  /** Get system information */
  getSystemInfo: async (): Promise<{ os: string; user: string; date: string }> => {
    const os = await $`uname -a`.text();
    const user = await $`whoami`.text();
    const date = await $`date`.text();
    
    return {
      os: os.trim(),
      user: user.trim(),
      date: date.trim()
    };
  },

  /** Echo a message (demonstrates command interpolation) */
  echo: async (message: string): Promise<string> => {
    // Escape and sanitize input
    const sanitized = message.replace(/[;&|`$()]/g, '');
    return await $`echo ${sanitized}`.text();
  }
};

makeRpcServer(api, {
  port: CONFIG.PORT,
  staticFile: CONFIG.STATIC_FILE,
  sourceFile: CONFIG.SOURCE_FILE,
});

console.log("🐚 Shell Runner Demo running at http://localhost:3010");
