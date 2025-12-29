// ── Notes App with SQLite ──
// Demonstrates Bun's built-in SQLite database
// Run with: bun run demos/notes-app/server.ts

import { makeRpcServer } from "../../rpc.ts";
import { Database } from "bun:sqlite";
import { join } from "path";

const CONFIG = {
  PORT: 3012,
  STATIC_FILE: join(import.meta.dir, "client.html"),
  SOURCE_FILE: join(import.meta.dir, "server.ts"),
  DB_FILE: join(import.meta.dir, "notes.db"),
} as const;

// Initialize SQLite database
const db = new Database(CONFIG.DB_FILE);

// Create tables
db.run(`
  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    note_id INTEGER NOT NULL,
    tag TEXT NOT NULL,
    FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE
  )
`);

interface Note {
  id?: number;
  title: string;
  content: string;
  category: string;
  created_at?: string;
  updated_at?: string;
}

const api = {
  /** Get all notes */
  getAllNotes: (): Note[] => {
    const query = db.query("SELECT * FROM notes ORDER BY updated_at DESC");
    return query.all() as Note[];
  },

  /** Get a single note by ID */
  getNote: (id: number): Note | null => {
    const query = db.query("SELECT * FROM notes WHERE id = ?");
    return query.get(id) as Note | null;
  },

  /** Create a new note */
  createNote: (title: string, content: string, category: string = "general"): Note => {
    const insert = db.prepare(
      "INSERT INTO notes (title, content, category) VALUES (?, ?, ?)"
    );
    const result = insert.run(title, content, category);
    
    const query = db.query("SELECT * FROM notes WHERE id = ?");
    return query.get(result.lastInsertRowid) as Note;
  },

  /** Update an existing note */
  updateNote: (id: number, title: string, content: string, category: string): Note => {
    const update = db.prepare(
      "UPDATE notes SET title = ?, content = ?, category = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
    );
    update.run(title, content, category, id);
    
    const query = db.query("SELECT * FROM notes WHERE id = ?");
    return query.get(id) as Note;
  },

  /** Delete a note */
  deleteNote: (id: number): { success: boolean; message: string } => {
    const del = db.prepare("DELETE FROM notes WHERE id = ?");
    const result = del.run(id);
    
    return {
      success: result.changes > 0,
      message: result.changes > 0 ? "Note deleted" : "Note not found"
    };
  },

  /** Search notes by keyword */
  searchNotes: (keyword: string): Note[] => {
    const query = db.query(
      "SELECT * FROM notes WHERE title LIKE ? OR content LIKE ? ORDER BY updated_at DESC"
    );
    const pattern = `%${keyword}%`;
    return query.all(pattern, pattern) as Note[];
  },

  /** Get notes by category */
  getNotesByCategory: (category: string): Note[] => {
    const query = db.query("SELECT * FROM notes WHERE category = ? ORDER BY updated_at DESC");
    return query.all(category) as Note[];
  },

  /** Get all categories */
  getCategories: (): string[] => {
    const query = db.query("SELECT DISTINCT category FROM notes ORDER BY category");
    const rows = query.all() as Array<{ category: string }>;
    return rows.map(r => r.category);
  },

  /** Get database stats */
  getStats: (): { totalNotes: number; categories: number; lastUpdated: string | null } => {
    const countQuery = db.query("SELECT COUNT(*) as count FROM notes");
    const count = (countQuery.get() as { count: number }).count;
    
    const catQuery = db.query("SELECT COUNT(DISTINCT category) as count FROM notes");
    const catCount = (catQuery.get() as { count: number }).count;
    
    const lastQuery = db.query("SELECT MAX(updated_at) as last FROM notes");
    const last = (lastQuery.get() as { last: string | null }).last;
    
    return {
      totalNotes: count,
      categories: catCount,
      lastUpdated: last
    };
  }
};

makeRpcServer(api, {
  port: CONFIG.PORT,
  staticFile: CONFIG.STATIC_FILE,
  sourceFile: CONFIG.SOURCE_FILE,
});

console.log(`📝 Notes App running at http://localhost:${CONFIG.PORT}`);
