// ── UUID & Random Generator Demo ──
// Demonstrates Bun's UUID and random APIs
// Run with: bun run demos/uuid-random/server.ts

import { makeRpcServer } from "../../rpc.ts";
import { randomUUIDv7 } from "bun";
import { join } from "path";

const CONFIG = {
  PORT: 3016,
  STATIC_FILE: join(import.meta.dir, "client.html"),
  SOURCE_FILE: join(import.meta.dir, "server.ts"),
} as const;

const api = {
  /** Generate a UUIDv7 (time-ordered UUID) */
  generateUUID: (): string => {
    return randomUUIDv7();
  },

  /** Generate multiple UUIDs */
  generateUUIDs: (count: number): string[] => {
    if (count < 1 || count > 100) {
      throw new Error("Count must be between 1 and 100");
    }
    
    const uuids: string[] = [];
    for (let i = 0; i < count; i++) {
      uuids.push(randomUUIDv7());
    }
    return uuids;
  },

  /** Generate a random integer between min and max (inclusive) */
  randomInt: (min: number, max: number): number => {
    if (min > max) {
      throw new Error("Min must be less than or equal to max");
    }
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  /** Generate an array of random integers */
  randomInts: (count: number, min: number, max: number): number[] => {
    if (count < 1 || count > 1000) {
      throw new Error("Count must be between 1 and 1000");
    }
    
    const numbers: number[] = [];
    for (let i = 0; i < count; i++) {
      numbers.push(Math.floor(Math.random() * (max - min + 1)) + min);
    }
    return numbers;
  },

  /** Generate a random string */
  randomString: (length: number, charset: "alphanumeric" | "alpha" | "numeric" | "hex" = "alphanumeric"): string => {
    if (length < 1 || length > 1000) {
      throw new Error("Length must be between 1 and 1000");
    }
    
    const charsets = {
      alphanumeric: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
      alpha: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
      numeric: "0123456789",
      hex: "0123456789abcdef"
    };
    
    const chars = charsets[charset];
    let result = "";
    
    for (let i = 0; i < length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    
    return result;
  },

  /** Pick random items from an array */
  randomPick: (items: any[], count: number): any[] => {
    if (count < 1 || count > items.length) {
      throw new Error(`Count must be between 1 and ${items.length}`);
    }
    
    const shuffled = [...items].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  },

  /** Shuffle an array */
  shuffle: (items: any[]): any[] => {
    const shuffled = [...items];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  },

  /** Generate random color hex code */
  randomColor: (): string => {
    return "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0");
  },

  /** Generate random colors */
  randomColors: (count: number): string[] => {
    if (count < 1 || count > 100) {
      throw new Error("Count must be between 1 and 100");
    }
    
    const colors: string[] = [];
    for (let i = 0; i < count; i++) {
      colors.push("#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0"));
    }
    return colors;
  },

  /** Generate random boolean */
  randomBoolean: (): boolean => {
    return Math.random() < 0.5;
  },

  /** Generate random float between min and max */
  randomFloat: (min: number, max: number, decimals: number = 2): number => {
    if (min > max) {
      throw new Error("Min must be less than or equal to max");
    }
    const random = Math.random() * (max - min) + min;
    return parseFloat(random.toFixed(decimals));
  },

  /** Generate random date between two dates */
  randomDate: (startDate: string, endDate: string): string => {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    
    if (start > end) {
      throw new Error("Start date must be before end date");
    }
    
    const random = new Date(start + Math.random() * (end - start));
    return random.toISOString();
  },

  /** Generate random password */
  generatePassword: (length: number, includeSymbols: boolean = true): string => {
    if (length < 8 || length > 128) {
      throw new Error("Length must be between 8 and 128");
    }
    
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";
    
    let chars = lowercase + uppercase + numbers;
    if (includeSymbols) {
      chars += symbols;
    }
    
    let password = "";
    // Ensure at least one of each type
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    if (includeSymbols) {
      password += symbols[Math.floor(Math.random() * symbols.length)];
    }
    
    // Fill the rest
    for (let i = password.length; i < length; i++) {
      password += chars[Math.floor(Math.random() * chars.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }
};

makeRpcServer(api, {
  port: CONFIG.PORT,
  staticFile: CONFIG.STATIC_FILE,
  sourceFile: CONFIG.SOURCE_FILE,
});

console.log(`🎲 UUID & Random Generator Demo running at http://localhost:${CONFIG.PORT}`);
