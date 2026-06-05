Now I'll create the new migration file:
CREATE TABLE IF NOT EXISTS phases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS steps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  phase_id INTEGER NOT NULL REFERENCES phases(id),
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  step_id INTEGER NOT NULL REFERENCES steps(id),
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS packets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id INTEGER NOT NULL REFERENCES tasks(id),
  packet_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS clarifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  packet_id INTEGER NOT NULL REFERENCES packets(id),
  question TEXT NOT NULL,
  answer TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  resolved_at TEXT
);

CREATE TABLE IF NOT EXISTS executions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  packet_id INTEGER NOT NULL REFERENCES packets(id),
  executor_model TEXT NOT NULL,
  result TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  completed_at TEXT
);

CREATE TABLE IF NOT EXISTS audits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  execution_id INTEGER NOT NULL REFERENCES executions(id),
  auditor_model TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  root_cause_level TEXT,
  root_cause_reason TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS leases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id INTEGER NOT NULL REFERENCES tasks(id),
  worker_id TEXT NOT NULL,
  leased_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS routing_decisions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  packet_id INTEGER NOT NULL REFERENCES packets(id),
  chosen_model TEXT NOT NULL,
  reason TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS model_metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  model_name TEXT NOT NULL,
  task_type TEXT NOT NULL,
  success_rate REAL NOT NULL DEFAULT 0.0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
-- ForgePilot Schema
-- Current state representation as of FP-002-V3
-- Includes FP-001 (events) + FP-002-V3 core schema tables

CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_type TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS phases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS steps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  phase_id INTEGER NOT NULL REFERENCES phases(id),
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  step_id INTEGER NOT NULL REFERENCES steps(id),
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS packets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id INTEGER NOT NULL REFERENCES tasks(id),
  packet_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS clarifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  packet_id INTEGER NOT NULL REFERENCES packets(id),
  question TEXT NOT NULL,
  answer TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  resolved_at TEXT
);

CREATE TABLE IF NOT EXISTS executions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  packet_id INTEGER NOT NULL REFERENCES packets(id),
  executor_model TEXT NOT NULL,
  result TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  completed_at TEXT
);

CREATE TABLE IF NOT EXISTS audits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  execution_id INTEGER NOT NULL REFERENCES executions(id),
  auditor_model TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  root_cause_level TEXT,
  root_cause_reason TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS leases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id INTEGER NOT NULL REFERENCES tasks(id),
  worker_id TEXT NOT NULL,
  leased_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS routing_decisions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  packet_id INTEGER NOT NULL REFERENCES packets(id),
  chosen_model TEXT NOT NULL,
  reason TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS model_metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  model_name TEXT NOT NULL,
  task_type TEXT NOT NULL,
  success_rate REAL NOT NULL DEFAULT 0.0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
  assert.equal(rows.length, 1, "Migration should only be recorded once");
});

it("should not create any forbidden workflow tables", () => {
it("should create all required core schema tables", () => {
  closeDb();
  const dbPath = path.join(testDir, "forbidden-tables-test.db");
  const dbPath = path.join(testDir, "schema-tables-test.db");
  initDb(dbPath);
  migrate();
  const db = getDb();

  const forbidden = [
  const required = [
    "events",
    "_migrations",
    "phases",
    "steps",
    "tasks",
    "packets",
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
$ pnpm install

Already up to date
Done in 578ms using pnpm v11.5.2

$ find migrations -type f | sort

migrations/000_initial.sql
migrations/001_core_schema.sql

$ pnpm typecheck

$ tsc --noEmit

$ git diff -- migrations/000_initial.sql

(no output)

$ pnpm test

$ node --experimental-test-module-mocks --import tsx --test tests/*.test.ts
▶ ForgePilot
  ✔ should have a working test harness (0.665136ms)
  ✔ should confirm environment-centric architecture principle (0.175576ms)
✔ ForgePilot (1.581201ms)
▶ Database client
  ✔ should initialize the database and create the data directory (29.56808ms)
  ✔ should throw when getDb is called before initDb (0.666654ms)
✔ Database client (30.505015ms)
▶ Database migration
  ✔ should create the events table via migration (35.166856ms)
  ✔ should be idempotent (running migrate twice does not fail) (50.704708ms)
  ✔ should create all required core schema tables (53.832424ms)
  ✔ should have correct foreign keys on core schema tables (51.074527ms)
✔ Database migration (191.33417ms)
ℹ tests 8
ℹ suites 3
ℹ pass 8
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 576.084048

$ pnpm fp -- init-db

$ tsx src/cli/forgepilot.ts -- -- init-db
Database initialized successfully.

$ node --import tsx -e "
import { initDb, getDb, closeDb } from './src/db/client.js';
import { migrate } from './src/db/migrate.js';
const tmpDir = '/tmp/forgepilot-verify-' + Date.now();
initDb(tmpDir + '/test.db');
migrate();
const db = getDb();
const tables = db.prepare('SELECT name FROM sqlite_master WHERE type=\\'table\\' ORDER BY name').all().map(r => r.name);
console.log('Tables:', JSON.stringify(tables));
closeDb();
"

Tables: ["_migrations","audits","clarifications","events","executions","leases","model_metrics","packets","phases","routing_decisions","sqlite_sequence","steps","tasks"]
All verifications pass. Let me mark the final task complete.

STATUS: SUCCESS

FILES_CHANGED:

    migrations/001_core_schema.sql (new)
    src/db/schema.sql (updated documentation)
    tests/smoke.test.ts (updated: replaced forbidden-tables test with required-tables + foreign-keys tests)

VERIFICATION_COMMANDS_RUN:

    pnpm install (already up to date)
    pnpm typecheck (passed)
    pnpm test (8 pass, 0 fail)
    pnpm fp -- init-db (success)
    find migrations -type f | sort (2 files: 000_initial.sql, 001_core_schema.sql)
    git diff -- migrations/000_initial.sql (no diff, unchanged)
    Verified DB tables via better-sqlite3: 11 user tables (events + 10 new) + 2 internal (_migrations, sqlite_sequence), 0 forbidden

RESULT: All acceptance criteria met. New migration 001_core_schema.sql creates exactly the 10 required tables (phases, steps, tasks, packets, clarifications, executions, audits, leases, routing_decisions, model_metrics) with correct columns, foreign keys, and no extra tables/indexes/triggers. FP-001 foundation is fully preserved (events table, initDb/getDb/closeDb API, migration tracking, idempotency, all existing tests pass). No packet_metrics, packet_templates, workflow, routing, or AI provider logic was added.

NOTES:

    Updated test file replaced the FP-001 "forbidden workflow tables" test with a "required core schema tables" test + foreign key validation, since those tables are now explicitly required by FP-002-V3.
    src/db/schema.sql updated as schema documentation (optional per instructions).


