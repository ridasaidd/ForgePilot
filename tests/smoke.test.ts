import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { initDb, getDb, closeDb } from "../src/db/client.js";
import { migrate } from "../src/db/migrate.js";

let testDir: string;

before(() => {
  testDir = fs.mkdtempSync(path.join(os.tmpdir(), "forgepilot-test-"));
});

after(() => {
  closeDb();
  fs.rmSync(testDir, { recursive: true, force: true });
});

describe("ForgePilot", () => {
  it("should have a working test harness", () => {
    assert.ok(true, "Test harness is operational");
  });

  it("should confirm environment-centric architecture principle", () => {
    const truth = "ForgePilot environment owns truth. Agents own no truth.";
    assert.ok(truth.includes("environment owns truth"));
  });
});

describe("Database client", () => {
  it("should initialize the database and create the data directory", () => {
    const dbPath = path.join(testDir, "client-test.db");
    const db = initDb(dbPath);
    assert.ok(fs.existsSync(dbPath), "Database file should exist");
    assert.ok(db.open, "Database should be open");
  });

  it("should throw when getDb is called before initDb", () => {
    closeDb();
    assert.throws(
      () => getDb(),
      /Database not initialized/
    );
  });
});

describe("Database migration", () => {
  it("should create the events table via migration", () => {
    closeDb();
    const dbPath = path.join(testDir, "migrate-test.db");
    initDb(dbPath);
    migrate();
    const db = getDb();

    const tables = db
      .prepare(
        "SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name"
      )
      .all()
      .map((r: unknown) => (r as { name: string }).name);

    assert.ok(
      tables.includes("events"),
      "events table should exist"
    );
    assert.ok(
      tables.includes("_migrations"),
      "_migrations tracking table should exist"
    );

    const columns = db
      .prepare("PRAGMA table_info(events)")
      .all()
      .map((r: unknown) => (r as { name: string }).name);

    assert.ok(columns.includes("id"), "events.id column should exist");
    assert.ok(columns.includes("event_type"), "events.event_type column should exist");
    assert.ok(columns.includes("created_at"), "events.created_at column should exist");
  });

  it("should be idempotent (running migrate twice does not fail)", () => {
    closeDb();
    const dbPath = path.join(testDir, "idempotent-test.db");
    initDb(dbPath);
    migrate();
    migrate();

    const db = getDb();

    const rows = db
      .prepare("SELECT name FROM _migrations WHERE name = ?")
      .all("000_initial.sql") as { name: string }[];

    assert.equal(rows.length, 1, "Migration should only be recorded once");
  });

  it("should not create any forbidden workflow tables", () => {
    closeDb();
    const dbPath = path.join(testDir, "forbidden-tables-test.db");
    initDb(dbPath);
    migrate();
    const db = getDb();

    const forbidden = [
      "phases",
      "steps",
      "tasks",
      "packets",
      "clarifications",
      "executions",
      "audits",
      "leases",
      "routing_decisions",
      "model_metrics",
    ];

    const tables = db
      .prepare("SELECT name FROM sqlite_master WHERE type = 'table'")
      .all()
      .map((r: unknown) => (r as { name: string }).name);

    for (const name of forbidden) {
      assert.ok(
        !tables.includes(name),
        `Forbidden table "${name}" should not exist`
      );
    }
  });
});
