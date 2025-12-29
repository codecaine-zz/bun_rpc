// ── Text Processing Demo ──
// Demonstrates Bun's text processing APIs: Bun.escapeHTML, Bun.stringWidth, Bun.indexOfLine
// Run with: bun run demos/text-processor/server.ts

import { makeRpcServer } from "../../rpc.ts";
import { join } from "path";

const CONFIG = {
  PORT: 3017,
  STATIC_FILE: join(import.meta.dir, "client.html"),
  SOURCE_FILE: join(import.meta.dir, "server.ts"),
} as const;

const api = {
  /** Escape HTML special characters (Bun.escapeHTML) */
  escapeHTML: (text: string): string => {
    return Bun.escapeHTML(text);
  },

  /** Get display width of a string (Bun.stringWidth) */
  getStringWidth: (text: string): number => {
    return Bun.stringWidth(text);
  },

  /** Find the line number of a character index (Bun.indexOfLine) */
  indexOfLine: (text: string, byteOffset: number): number => {
    return Bun.indexOfLine(Buffer.from(text), byteOffset);
  },

  /** Count words in text */
  countWords: (text: string): number => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  },

  /** Count characters, words, and lines */
  analyzeText: (text: string): {
    characters: number;
    charactersNoSpaces: number;
    words: number;
    lines: number;
    sentences: number;
    paragraphs: number;
    displayWidth: number;
  } => {
    const lines = text.split('\n');
    const words = text.trim().split(/\s+/).filter(w => w.length > 0);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    
    return {
      characters: text.length,
      charactersNoSpaces: text.replace(/\s/g, '').length,
      words: words.length,
      lines: lines.length,
      sentences: sentences.length,
      paragraphs: paragraphs.length,
      displayWidth: Bun.stringWidth(text)
    };
  },

  /** Convert case */
  convertCase: (text: string, caseType: "upper" | "lower" | "title" | "sentence" | "camel" | "snake" | "kebab"): string => {
    switch (caseType) {
      case "upper":
        return text.toUpperCase();
      case "lower":
        return text.toLowerCase();
      case "title":
        return text.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase());
      case "sentence":
        return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
      case "camel":
        return text.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match, index) => {
          if (+match === 0) return "";
          return index === 0 ? match.toLowerCase() : match.toUpperCase();
        });
      case "snake":
        return text.toLowerCase().replace(/\s+/g, '_');
      case "kebab":
        return text.toLowerCase().replace(/\s+/g, '-');
      default:
        return text;
    }
  },

  /** Remove extra whitespace */
  normalizeWhitespace: (text: string): string => {
    return text.trim().replace(/\s+/g, ' ');
  },

  /** Reverse text */
  reverseText: (text: string): string => {
    return text.split('').reverse().join('');
  },

  /** Extract URLs from text */
  extractURLs: (text: string): string[] => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.match(urlRegex) || [];
  },

  /** Extract emails from text */
  extractEmails: (text: string): string[] => {
    const emailRegex = /[\w.-]+@[\w.-]+\.\w+/g;
    return text.match(emailRegex) || [];
  },

  /** Find and replace */
  findReplace: (text: string, find: string, replace: string, caseSensitive: boolean = true): {
    result: string;
    count: number;
  } => {
    const flags = caseSensitive ? 'g' : 'gi';
    const regex = new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);
    const matches = text.match(regex);
    const count = matches ? matches.length : 0;
    const result = text.replace(regex, replace);
    
    return { result, count };
  },

  /** Remove duplicate lines */
  removeDuplicateLines: (text: string): string => {
    const lines = text.split('\n');
    const unique = [...new Set(lines)];
    return unique.join('\n');
  },

  /** Sort lines */
  sortLines: (text: string, order: "asc" | "desc" = "asc"): string => {
    const lines = text.split('\n');
    lines.sort();
    if (order === "desc") {
      lines.reverse();
    }
    return lines.join('\n');
  },

  /** Add line numbers */
  addLineNumbers: (text: string): string => {
    const lines = text.split('\n');
    return lines.map((line, i) => `${i + 1}. ${line}`).join('\n');
  },

  /** Truncate text */
  truncate: (text: string, maxLength: number, ellipsis: string = "..."): string => {
    if (text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength - ellipsis.length) + ellipsis;
  },

  /** Wrap text to specified width */
  wrapText: (text: string, width: number): string => {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';
    
    for (const word of words) {
      if (currentLine.length + word.length + 1 <= width) {
        currentLine += (currentLine ? ' ' : '') + word;
      } else {
        if (currentLine) {
          lines.push(currentLine);
        }
        currentLine = word;
      }
    }
    
    if (currentLine) {
      lines.push(currentLine);
    }
    
    return lines.join('\n');
  },

  /** Remove HTML tags */
  stripHTML: (html: string): string => {
    return html.replace(/<[^>]*>/g, '');
  },

  /** Encode/Decode Base64 */
  base64Encode: (text: string): string => {
    return Buffer.from(text).toString('base64');
  },

  base64Decode: (encoded: string): string => {
    return Buffer.from(encoded, 'base64').toString('utf-8');
  },

  /** Calculate reading time (assumes 200 words per minute) */
  getReadingTime: (text: string): {
    minutes: number;
    seconds: number;
    wordCount: number;
  } => {
    const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
    const minutes = Math.floor(words / 200);
    const seconds = Math.round((words % 200) / 200 * 60);
    
    return {
      minutes,
      seconds,
      wordCount: words
    };
  }
};

makeRpcServer(api, {
  port: CONFIG.PORT,
  staticFile: CONFIG.STATIC_FILE,
  sourceFile: CONFIG.SOURCE_FILE,
});

console.log(`📝 Text Processor Demo running at http://localhost:${CONFIG.PORT}`);
