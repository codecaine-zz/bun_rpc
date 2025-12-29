// ── File Manager Demo ──
// Demonstrates Bun's File I/O APIs: Bun.file, Bun.write
// Run with: bun run demos/file-manager/server.ts

import { makeRpcServer } from "../../rpc.ts";
import { join } from "path";

const CONFIG = {
  PORT: 3011,
  STATIC_FILE: join(import.meta.dir, "client.html"),
  SOURCE_FILE: join(import.meta.dir, "server.ts"),
  DATA_DIR: join(import.meta.dir, "data"),
} as const;

// Ensure data directory exists
await Bun.write(join(CONFIG.DATA_DIR, ".gitkeep"), "");

const api = {
  /** List all files in the data directory */
  listFiles: async (): Promise<Array<{ name: string; size: number; modified: Date }>> => {
    try {
      const files = await Array.fromAsync(new Bun.Glob("*").scan(CONFIG.DATA_DIR));
      const fileInfo = await Promise.all(
        files.map(async (name) => {
          const file = Bun.file(join(CONFIG.DATA_DIR, name));
          return {
            name,
            size: file.size,
            modified: new Date(file.lastModified)
          };
        })
      );
      return fileInfo.filter(f => f.name !== '.gitkeep');
    } catch (error: any) {
      throw new Error(`Failed to list files: ${error.message}`);
    }
  },

  /** Read a text file */
  readFile: async (filename: string): Promise<string> => {
    // Sanitize filename
    const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = join(CONFIG.DATA_DIR, safeName);
    
    try {
      const file = Bun.file(filePath);
      
      if (!(await file.exists())) {
        throw new Error(`File '${safeName}' not found`);
      }
      
      return await file.text();
    } catch (error: any) {
      throw new Error(`Failed to read file: ${error.message}`);
    }
  },

  /** Write content to a text file */
  writeFile: async (filename: string, content: string): Promise<string> => {
    // Sanitize filename
    const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = join(CONFIG.DATA_DIR, safeName);
    
    try {
      await Bun.write(filePath, content);
      return `File '${safeName}' written successfully (${content.length} bytes)`;
    } catch (error: any) {
      throw new Error(`Failed to write file: ${error.message}`);
    }
  },

  /** Delete a file */
  deleteFile: async (filename: string): Promise<string> => {
    const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = join(CONFIG.DATA_DIR, safeName);
    
    try {
      const file = Bun.file(filePath);
      
      if (!(await file.exists())) {
        throw new Error(`File '${safeName}' not found`);
      }
      
      await Bun.write(filePath, ""); // Clear content first
      // Note: Bun doesn't have a delete API, so we use Node's fs
      const fs = await import('fs/promises');
      await fs.unlink(filePath);
      
      return `File '${safeName}' deleted successfully`;
    } catch (error: any) {
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  },

  /** Get file stats */
  getFileStats: async (filename: string): Promise<{ 
    name: string; 
    size: number; 
    type: string; 
    modified: Date;
    exists: boolean;
  }> => {
    const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = join(CONFIG.DATA_DIR, safeName);
    const file = Bun.file(filePath);
    
    return {
      name: safeName,
      size: file.size,
      type: file.type,
      modified: new Date(file.lastModified),
      exists: await file.exists()
    };
  },

  /** Append content to a file */
  appendFile: async (filename: string, content: string): Promise<string> => {
    const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = join(CONFIG.DATA_DIR, safeName);
    
    try {
      const file = Bun.file(filePath);
      let existing = '';
      
      if (await file.exists()) {
        existing = await file.text();
      }
      
      await Bun.write(filePath, existing + content);
      return `Content appended to '${safeName}'`;
    } catch (error: any) {
      throw new Error(`Failed to append to file: ${error.message}`);
    }
  }
};

makeRpcServer(api, {
  port: CONFIG.PORT,
  staticFile: CONFIG.STATIC_FILE,
  sourceFile: CONFIG.SOURCE_FILE,
});

console.log(`📁 File Manager Demo running at http://localhost:${CONFIG.PORT}`);
