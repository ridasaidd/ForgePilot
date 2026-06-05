import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

const DEFAULT_DB_PATH = path.resolve("data/forgepilot.db");

let db: Database.Database | null = null;

export function initDb(dbPath?: string): Database.Database {
  const resolvedPath = dbPath ?? DEFAULT_DB_PATH;
  const dir = path.dirname(resolvedPath);
  fs.mkdirSync(dir, { recursive: true });
  db = new Database(resolvedPath);
  db.pragma("journal_mode = WAL");
  return db;
}

export function getDb(): Database.Database {
  if (!db) {
    throw new Error("Database not initialized. Call initDb() first.");
  }
  return db;
}

export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}
