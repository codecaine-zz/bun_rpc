// ── Password Manager Demo ──
// Demonstrates Bun's hashing APIs: Bun.password, Bun.hash
// Run with: bun run demos/password-manager/server.ts

import { makeRpcServer } from "../../rpc.ts";
import { Database } from "bun:sqlite";
import { join } from "path";

const CONFIG = {
  PORT: 3014,
  STATIC_FILE: join(import.meta.dir, "client.html"),
  SOURCE_FILE: join(import.meta.dir, "server.ts"),
  DB_FILE: join(import.meta.dir, "passwords.db"),
} as const;

// Initialize SQLite database
const db = new Database(CONFIG.DB_FILE);

// Create table
db.run(`
  CREATE TABLE IF NOT EXISTS accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    service TEXT NOT NULL UNIQUE,
    username TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

const api = {
  /** Hash a password using Bun.password.hash */
  hashPassword: async (password: string): Promise<string> => {
    return await Bun.password.hash(password, {
      algorithm: "argon2id",
      memoryCost: 4,
      timeCost: 3,
    });
  },

  /** Verify a password against a hash */
  verifyPassword: async (password: string, hash: string): Promise<boolean> => {
    return await Bun.password.verify(password, hash);
  },

  /** Add a new account with hashed password */
  addAccount: async (service: string, username: string, password: string): Promise<string> => {
    try {
      const hash = await Bun.password.hash(password, {
        algorithm: "argon2id",
        memoryCost: 4,
        timeCost: 3,
      });
      
      const insert = db.prepare(
        "INSERT INTO accounts (service, username, password_hash) VALUES (?, ?, ?)"
      );
      insert.run(service, username, hash);
      
      return `Account added for ${service}`;
    } catch (error: any) {
      if (error.message.includes("UNIQUE constraint")) {
        throw new Error(`Account for ${service} already exists`);
      }
      throw error;
    }
  },

  /** Get all stored accounts (without passwords) */
  getAllAccounts: (): Array<{ id: number; service: string; username: string; created_at: string }> => {
    const query = db.query("SELECT id, service, username, created_at FROM accounts ORDER BY service");
    return query.all() as any[];
  },

  /** Verify a password for a service */
  checkPassword: async (service: string, password: string): Promise<{ match: boolean; username?: string }> => {
    const query = db.query("SELECT username, password_hash FROM accounts WHERE service = ?");
    const account = query.get(service) as { username: string; password_hash: string } | null;
    
    if (!account) {
      throw new Error(`No account found for ${service}`);
    }
    
    const match = await Bun.password.verify(password, account.password_hash);
    
    return {
      match,
      username: match ? account.username : undefined
    };
  },

  /** Delete an account */
  deleteAccount: (service: string): string => {
    const del = db.prepare("DELETE FROM accounts WHERE service = ?");
    const result = del.run(service);
    
    if (result.changes === 0) {
      throw new Error(`No account found for ${service}`);
    }
    
    return `Account deleted for ${service}`;
  },

  /** Generate various hash types using Bun.hash */
  generateHash: (text: string, algorithm: "sha256" | "sha512" | "sha1" | "md5"): string => {
    const hasher = new Bun.CryptoHasher(algorithm);
    hasher.update(text);
    return hasher.digest("hex");
  },

  /** Generate a cryptographic hash using Bun.CryptoHasher */
  generateCryptoHash: (text: string, algorithm: "sha256" | "sha512"): string => {
    const hasher = new Bun.CryptoHasher(algorithm);
    hasher.update(text);
    return hasher.digest("hex");
  },

  /** Compare password strength (demonstration) */
  checkPasswordStrength: (password: string): {
    score: number;
    strength: string;
    suggestions: string[];
  } => {
    let score = 0;
    const suggestions: string[] = [];
    
    if (password.length >= 8) score++;
    else suggestions.push("Use at least 8 characters");
    
    if (password.length >= 12) score++;
    
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    else suggestions.push("Mix uppercase and lowercase letters");
    
    if (/[0-9]/.test(password)) score++;
    else suggestions.push("Add numbers");
    
    if (/[^a-zA-Z0-9]/.test(password)) score++;
    else suggestions.push("Add special characters");
    
    const strength = score <= 1 ? "Weak" : score <= 3 ? "Medium" : "Strong";
    
    return { score, strength, suggestions };
  }
};

makeRpcServer(api, {
  port: CONFIG.PORT,
  staticFile: CONFIG.STATIC_FILE,
  sourceFile: CONFIG.SOURCE_FILE,
});

console.log(`🔐 Password Manager Demo running at http://localhost:${CONFIG.PORT}`);
