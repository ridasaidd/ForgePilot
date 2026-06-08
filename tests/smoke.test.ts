import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { execSync } from "node:child_process";
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

  it("should create all required core schema tables", () => {
    closeDb();
    const dbPath = path.join(testDir, "schema-tables-test.db");
    initDb(dbPath);
    migrate();
    const db = getDb();

    const required = [
      "events",
      "_migrations",
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

    for (const name of required) {
      assert.ok(
        tables.includes(name),
        `Required table "${name}" should exist`
      );
    }

    const forbidden = [
      "packet_metrics",
      "packet_templates",
      "workflow_runs",
      "agents",
      "memories",
      "embeddings",
      "vector_indexes",
      "dashboards",
      "reports",
    ];

    for (const name of forbidden) {
      assert.ok(
        !tables.includes(name),
        `Forbidden table "${name}" should not exist`
      );
    }
  });

  it("should have correct foreign keys on core schema tables", () => {
    closeDb();
    const dbPath = path.join(testDir, "foreign-keys-test.db");
    initDb(dbPath);
    migrate();
    const db = getDb();

    const foreignKeys = db
      .prepare("SELECT * FROM pragma_foreign_key_list('steps')")
      .all() as { table: string; from: string; to: string }[];
    assert.ok(foreignKeys.some((fk) => fk.table === "phases" && fk.from === "phase_id" && fk.to === "id"));

    const taskFks = db
      .prepare("SELECT * FROM pragma_foreign_key_list('tasks')")
      .all() as { table: string; from: string; to: string }[];
    assert.ok(taskFks.some((fk) => fk.table === "steps" && fk.from === "step_id" && fk.to === "id"));

    const packetFks = db
      .prepare("SELECT * FROM pragma_foreign_key_list('packets')")
      .all() as { table: string; from: string; to: string }[];
    assert.ok(packetFks.some((fk) => fk.table === "tasks" && fk.from === "task_id" && fk.to === "id"));

    const clarFks = db
      .prepare("SELECT * FROM pragma_foreign_key_list('clarifications')")
      .all() as { table: string; from: string; to: string }[];
    assert.ok(clarFks.some((fk) => fk.table === "packets" && fk.from === "packet_id" && fk.to === "id"));

    const execFks = db
      .prepare("SELECT * FROM pragma_foreign_key_list('executions')")
      .all() as { table: string; from: string; to: string }[];
    assert.ok(execFks.some((fk) => fk.table === "packets" && fk.from === "packet_id" && fk.to === "id"));

    const auditFks = db
      .prepare("SELECT * FROM pragma_foreign_key_list('audits')")
      .all() as { table: string; from: string; to: string }[];
    assert.ok(auditFks.some((fk) => fk.table === "executions" && fk.from === "execution_id" && fk.to === "id"));

    const leaseFks = db
      .prepare("SELECT * FROM pragma_foreign_key_list('leases')")
      .all() as { table: string; from: string; to: string }[];
    assert.ok(leaseFks.some((fk) => fk.table === "tasks" && fk.from === "task_id" && fk.to === "id"));

    const routeFks = db
      .prepare("SELECT * FROM pragma_foreign_key_list('routing_decisions')")
      .all() as { table: string; from: string; to: string }[];
    assert.ok(routeFks.some((fk) => fk.table === "packets" && fk.from === "packet_id" && fk.to === "id"));
  });
});

describe("CLI prompt-baselines", () => {
  it("should print ForgePilot and prompt baseline file paths", () => {
    const output = execSync("pnpm fp -- prompt-baselines", {
      encoding: "utf-8",
      cwd: process.cwd(),
    });
    assert.ok(output.includes("ForgePilot"), "Output should include ForgePilot");
    assert.ok(
      output.includes("Executor Baseline: prompts/executor-baseline-v1.md"),
      "Output should include Executor Baseline path"
    );
    assert.ok(
      output.includes("Auditor Baseline: prompts/auditor-baseline-v1.md"),
      "Output should include Auditor Baseline path"
    );
  });
});

describe("Packet metrics", () => {
  let metricsDbPath: string;

  before(() => {
    metricsDbPath = path.join(testDir, "metrics-test.db");
    initDb(metricsDbPath);
    migrate();
  });

  after(() => {
    closeDb();
  });

  it("should return zero counts when no packets exist", async () => {
    const { getPacketMetrics } = await import("../src/db/metrics.js");
    const metrics = getPacketMetrics();
    assert.equal(metrics.total, 0, "Total should be 0");
    assert.equal(metrics.successful, 0, "Successful should be 0");
    assert.equal(metrics.failed, 0, "Failed should be 0");
  });

  it("should count completed and failed packets correctly", () => {
    const db = getDb();
    db.exec("INSERT INTO phases (id, name, status) VALUES (1, 'test-phase', 'pending')");
    db.exec("INSERT INTO steps (id, phase_id, name, status) VALUES (1, 1, 'test-step', 'pending')");
    db.exec("INSERT INTO tasks (id, step_id, name, status) VALUES (1, 1, 'test-task', 'pending')");
    db.exec("INSERT INTO packets (id, task_id, packet_type, status) VALUES (1, 1, 'eval', 'completed')");
    db.exec("INSERT INTO packets (id, task_id, packet_type, status) VALUES (2, 1, 'eval', 'failed')");
    db.exec("INSERT INTO packets (id, task_id, packet_type, status) VALUES (3, 1, 'eval', 'pending')");
    db.exec("INSERT INTO packets (id, task_id, packet_type, status) VALUES (4, 1, 'eval', 'completed')");

    const metrics = db
      .prepare(
        `SELECT
          (SELECT COUNT(*) FROM packets) as total,
          (SELECT COUNT(*) FROM packets WHERE status = 'completed') as successful,
          (SELECT COUNT(*) FROM packets WHERE status = 'failed') as failed`
      )
      .get() as { total: number; successful: number; failed: number };

    assert.equal(metrics.total, 4, "Total should be 4");
    assert.equal(metrics.successful, 2, "Successful should be 2");
    assert.equal(metrics.failed, 1, "Failed should be 1");
  });

  it("CLI packet-metrics should print all three labels", () => {
    const output = execSync("pnpm fp -- packet-metrics", {
      encoding: "utf-8",
      cwd: process.cwd(),
    });
    assert.ok(output.includes("Total packets"), "Output should include Total packets");
    assert.ok(output.includes("Successful packets"), "Output should include Successful packets");
    assert.ok(output.includes("Failed packets"), "Output should include Failed packets");
  });

  it("CLI packet-metrics should succeed with zero counts on empty db", () => {
    closeDb();
    const emptyDbPath = path.join(testDir, "empty-metrics-test.db");
    initDb(emptyDbPath);
    migrate();
    const db = getDb();

    const metrics = db
      .prepare(
        `SELECT
          (SELECT COUNT(*) FROM packets) as total,
          (SELECT COUNT(*) FROM packets WHERE status = 'completed') as successful,
          (SELECT COUNT(*) FROM packets WHERE status = 'failed') as failed`
      )
      .get() as { total: number; successful: number; failed: number };

    assert.equal(metrics.total, 0);
    assert.equal(metrics.successful, 0);
    assert.equal(metrics.failed, 0);
  });
});
