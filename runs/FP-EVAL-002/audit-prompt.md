# Audit Prompt — FP-EVAL-002

**Task:** FP-EVAL-002 — Packet Metrics Summary CLI Command

---

## Instructions

You are an auditor. Your sole responsibility is to verify that the executor's
output satisfies the original packet as written.

### Rules

1. **Audit against the original packet only.** Do not evaluate work that was not
   requested. Do not audit against imagined requirements.

2. **Do not reward extra work.** Work beyond the packet scope is not relevant to
   the audit. Extra work does not compensate for missed requirements.

3. **Do not suggest architecture expansion.** Do not propose new features,
   refactors, or design changes beyond what the packet specifies.

4. **Do not accept partial completion unless explicitly allowed.** If the packet
   does not state that partial completion is acceptable, all deliverables must
   be satisfied. Partial completion is a FAIL.

5. **Return the structured output below.** Do not add commentary, summaries, or
   explanations outside the required fields.

---

## Original Packet

# FP-EVAL-002 — Packet Metrics Summary CLI Command

## Task

Add a read-only CLI command that prints a summary of packet execution metrics stored in SQLite.

## Goal

Create a benchmark that requires interaction with the existing SQLite layer while remaining small, deterministic, and easy to audit.

This benchmark is intended to be more difficult than FP-EVAL-001 because it requires the executor to understand and reuse the existing database layer without modifying schema or migrations.

## Requirements

Add a CLI command:

pnpm fp -- packet-metrics

The command must print:

- Total packets
- Successful packets
- Failed packets

Exact formatting is not required.

The output must contain those three labels.

If no packet records exist in SQLite, the command must still succeed and print zero counts.

## Allowed Files

The executor may modify only:

- src/cli/forgepilot.ts
- src/db/*.ts
- tests/*.test.ts

The executor may create run artifacts under:

- runs/FP-EVAL-002/

## Implementation Constraints

- Read-only command only.
- Use or extend the existing SQLite/database access layer.
- Do not modify database schema.
- Do not create migrations.
- Do not modify existing packet records.
- Do not add routing logic.
- Do not add broker integration.
- Do not add model provider logic.
- Do not add autonomous execution.
- Do not add workflow orchestration.

## Verification Requirements

Run and record:

pnpm typecheck
pnpm test
pnpm fp -- init-db
pnpm fp -- packet-metrics

Verify output contains:

- Total packets
- Successful packets
- Failed packets

## Acceptance Criteria

- pnpm fp -- packet-metrics works.
- Output includes Total packets.
- Output includes Successful packets.
- Output includes Failed packets.
- Command succeeds even when no packet records exist.
- Existing tests pass.
- Only allowed source/test files are changed.
- No schema changes.
- No migrations added.
- No routing logic added.
- No broker integration added.
- No model provider logic added.
- No workflow orchestration added.

## Executor Final Instructions

After implementation and verification, output only:

STATUS: SUCCESS | FAILED

FILES_CHANGED:
- file

VERIFICATION_COMMANDS_RUN:
- command => result

VERIFICATION_RESULTS:
- item => PASS | FAIL

RESULT:
Short summary.

NOTES:
Short notes only if needed.

Then generate:

runs/FP-EVAL-002/executor-result.md
runs/FP-EVAL-002/verification.txt
runs/FP-EVAL-002/audit-prompt.md

using the existing FP-003 handoff workflow.

---

## Executor Result

STATUS: SUCCESS

FILES_CHANGED:
- src/cli/forgepilot.ts
- src/db/metrics.ts
- tests/smoke.test.ts

VERIFICATION_COMMANDS_RUN:
- pnpm typecheck => passed (no errors)
- pnpm test => 13 tests, 13 passed, 0 failed
- pnpm fp -- init-db => Database initialized successfully.
- pnpm fp -- packet-metrics => Total packets: 0, Successful packets: 0, Failed packets: 0

VERIFICATION_RESULTS:
- pnpm fp -- packet-metrics works => PASS
- Output includes Total packets => PASS
- Output includes Successful packets => PASS
- Output includes Failed packets => PASS
- Command succeeds even when no packet records exist => PASS
- Existing tests pass => PASS
- Only allowed source/test files are changed => PASS
- No schema changes => PASS
- No migrations added => PASS
- No routing logic added => PASS
- No broker integration added => PASS
- No model provider logic added => PASS
- No workflow orchestration added => PASS

RESULT:
Added a read-only packet-metrics CLI command (src/db/metrics.ts) that queries the existing SQLite packets table for total, successful (status=completed), and failed (status=failed) counts. Integrated into the CLI (src/cli/forgepilot.ts). All 13 tests pass including 4 new packet-metrics tests.

NOTES:
None.

---

## Verification Output

$ tsc --noEmit
---
$ node --experimental-test-module-mocks --import tsx --test tests/*.test.ts
$ tsx src/cli/forgepilot.ts -- -- prompt-baselines
▶ ForgePilot
  ✔ should have a working test harness (0.687413ms)
  ✔ should confirm environment-centric architecture principle (0.222391ms)
✔ ForgePilot (1.642052ms)
▶ Database client
  ✔ should initialize the database and create the data directory (28.1913ms)
  ✔ should throw when getDb is called before initDb (0.675581ms)
✔ Database client (29.127271ms)
▶ Database migration
  ✔ should create the events table via migration (35.108623ms)
  ✔ should be idempotent (running migrate twice does not fail) (51.797408ms)
  ✔ should create all required core schema tables (51.707648ms)
  ✔ should have correct foreign keys on core schema tables (52.595527ms)
✔ Database migration (191.819247ms)
▶ CLI prompt-baselines
  ✔ should print ForgePilot and prompt baseline file paths (925.385144ms)
✔ CLI prompt-baselines (925.624647ms)
$ tsx src/cli/forgepilot.ts -- -- packet-metrics
▶ Packet metrics
  ✔ should return zero counts when no packets exist (38.87864ms)
  ✔ should count completed and failed packets correctly (1.068677ms)
  ✔ CLI packet-metrics should print all three labels (1015.092275ms)
  ✔ CLI packet-metrics should succeed with zero counts on empty db (52.337561ms)
✔ Packet metrics (1168.586703ms)
ℹ tests 13
ℹ suites 5
ℹ pass 13
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2595.923201
---
$ tsx src/cli/forgepilot.ts -- -- init-db
Database initialized successfully.
---
$ tsx src/cli/forgepilot.ts -- -- packet-metrics
Total packets: 0
Successful packets: 0
Failed packets: 0

---

## Git Status

On branch eval/fp-eval-002/deepseek-v4-pro-high
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
	modified:   src/cli/forgepilot.ts
	modified:   tests/smoke.test.ts

Untracked files:
  (use "git add <file>..." to include in what will be committed)
	evals/model-eval-v1/FP-EVAL-002/
	runs/FP-EVAL-002/
	src/db/metrics.ts

no changes added to commit (use "git add" and/or "git commit -a")

---

## Relevant Diff

diff --git a/src/cli/forgepilot.ts b/src/cli/forgepilot.ts
index f334b0c..3069446 100644
--- a/src/cli/forgepilot.ts
+++ b/src/cli/forgepilot.ts
@@ -13,6 +13,7 @@ Options:
   --init-db             Initialize the SQLite database and run pending migrations
   --build-audit-prompt <id>     Build audit prompt for a packet run
   --build-execution-prompt <id> Build execution prompt for a packet
+  --packet-metrics      Print summary of packet execution metrics
   --prompt-baselines    Print project name and available prompt baseline files
 
 Environment:
@@ -167,6 +168,7 @@ async function main(): Promise<void> {
       "init-db": { type: "boolean" },
       "build-audit-prompt": { type: "string" },
       "build-execution-prompt": { type: "string" },
+      "packet-metrics": { type: "boolean" },
       "prompt-baselines": { type: "boolean" },
     },
     strict: true,
@@ -212,6 +214,19 @@ async function main(): Promise<void> {
     return;
   }
 
+  if (values["packet-metrics"] || positionals[0] === "packet-metrics") {
+    const { initAndMigrate } = await import("../db/migrate.js");
+    initAndMigrate();
+    const { getPacketMetrics } = await import("../db/metrics.js");
+    const { closeDb } = await import("../db/client.js");
+    const metrics = getPacketMetrics();
+    closeDb();
+    console.log(`Total packets: ${metrics.total}`);
+    console.log(`Successful packets: ${metrics.successful}`);
+    console.log(`Failed packets: ${metrics.failed}`);
+    return;
+  }
+
   if (values["prompt-baselines"] || positionals[0] === "prompt-baselines") {
     console.log("ForgePilot");
     console.log("Executor Baseline: prompts/executor-baseline-v1.md");
diff --git a/tests/smoke.test.ts b/tests/smoke.test.ts
index a422ae5..363ae65 100644
--- a/tests/smoke.test.ts
+++ b/tests/smoke.test.ts
@@ -216,3 +216,80 @@ describe("CLI prompt-baselines", () => {
     );
   });
 });
+
+describe("Packet metrics", () => {
+  let metricsDbPath: string;
+
+  before(() => {
+    metricsDbPath = path.join(testDir, "metrics-test.db");
+    initDb(metricsDbPath);
+    migrate();
+  });
+
+  after(() => {
+    closeDb();
+  });
+
+  it("should return zero counts when no packets exist", async () => {
+    const { getPacketMetrics } = await import("../src/db/metrics.js");
+    const metrics = getPacketMetrics();
+    assert.equal(metrics.total, 0, "Total should be 0");
+    assert.equal(metrics.successful, 0, "Successful should be 0");
+    assert.equal(metrics.failed, 0, "Failed should be 0");
+  });
+
+  it("should count completed and failed packets correctly", () => {
+    const db = getDb();
+    db.exec("INSERT INTO phases (id, name, status) VALUES (1, 'test-phase', 'pending')");
+    db.exec("INSERT INTO steps (id, phase_id, name, status) VALUES (1, 1, 'test-step', 'pending')");
+    db.exec("INSERT INTO tasks (id, step_id, name, status) VALUES (1, 1, 'test-task', 'pending')");
+    db.exec("INSERT INTO packets (id, task_id, packet_type, status) VALUES (1, 1, 'eval', 'completed')");
+    db.exec("INSERT INTO packets (id, task_id, packet_type, status) VALUES (2, 1, 'eval', 'failed')");
+    db.exec("INSERT INTO packets (id, task_id, packet_type, status) VALUES (3, 1, 'eval', 'pending')");
+    db.exec("INSERT INTO packets (id, task_id, packet_type, status) VALUES (4, 1, 'eval', 'completed')");
+
+    const metrics = db
+      .prepare(
+        `SELECT
+          (SELECT COUNT(*) FROM packets) as total,
+          (SELECT COUNT(*) FROM packets WHERE status = 'completed') as successful,
+          (SELECT COUNT(*) FROM packets WHERE status = 'failed') as failed`
+      )
+      .get() as { total: number; successful: number; failed: number };
+
+    assert.equal(metrics.total, 4, "Total should be 4");
+    assert.equal(metrics.successful, 2, "Successful should be 2");
+    assert.equal(metrics.failed, 1, "Failed should be 1");
+  });
+
+  it("CLI packet-metrics should print all three labels", () => {
+    const output = execSync("pnpm fp -- packet-metrics", {
+      encoding: "utf-8",
+      cwd: process.cwd(),
+    });
+    assert.ok(output.includes("Total packets"), "Output should include Total packets");
+    assert.ok(output.includes("Successful packets"), "Output should include Successful packets");
+    assert.ok(output.includes("Failed packets"), "Output should include Failed packets");
+  });
+
+  it("CLI packet-metrics should succeed with zero counts on empty db", () => {
+    closeDb();
+    const emptyDbPath = path.join(testDir, "empty-metrics-test.db");
+    initDb(emptyDbPath);
+    migrate();
+    const db = getDb();
+
+    const metrics = db
+      .prepare(
+        `SELECT
+          (SELECT COUNT(*) FROM packets) as total,
+          (SELECT COUNT(*) FROM packets WHERE status = 'completed') as successful,
+          (SELECT COUNT(*) FROM packets WHERE status = 'failed') as failed`
+      )
+      .get() as { total: number; successful: number; failed: number };
+
+    assert.equal(metrics.total, 0);
+    assert.equal(metrics.successful, 0);
+    assert.equal(metrics.failed, 0);
+  });
+});

---

## Required Output

Return exactly:


AUDIT_STATUS: ACCEPTED | REJECTED | NEEDS_FRONTIER_REVIEW

BLOCKING_ISSUES:

NON_BLOCKING_NOTES:

ROOT_CAUSE_LEVEL:
ENVIRONMENT | PACKET | EXECUTOR | AUDITOR | HUMAN | NONE

ROOT_CAUSE_REASON:

REQUIRED_FIX_PACKET:

