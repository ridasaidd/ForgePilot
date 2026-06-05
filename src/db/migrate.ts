import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { initDb, getDb } from "./client.js";

const MIGRATIONS_DIR = path.resolve("migrations");

export function migrate(): void {
  const db = getDb();

  db.exec(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      executed_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  if (!fs.existsSync(MIGRATIONS_DIR)) {
    return;
  }

  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  const executed = new Set(
    db
      .prepare("SELECT name FROM _migrations")
      .all()
      .map((r: unknown) => (r as { name: string }).name)
  );

  const insertStmt = db.prepare(
    "INSERT INTO _migrations (name) VALUES (?)"
  );

  for (const file of files) {
    if (executed.has(file)) continue;
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), "utf-8");
    db.exec(sql);
    insertStmt.run(file);
  }
}

export function initAndMigrate(dbPath?: string): Database.Database {
  const db = initDb(dbPath);
  migrate();
  return db;
}
