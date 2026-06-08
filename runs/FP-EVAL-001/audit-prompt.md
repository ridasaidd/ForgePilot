# Audit Prompt — FP-EVAL-001

**Task:** FP-EVAL-001

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

FP-EVAL-001 — Prompt Baselines CLI Command

Task

Add a small read-only CLI command that prints the ForgePilot project name and available prompt baseline files.

Goal

Create a simple, low-risk, code-based benchmark task for the first model evaluation run.

This packet is intentionally small so executor behavior can be compared across models using the same packet, same baseline prompts, same verification commands, and same auditor.

Requirements

Add a CLI command:

pnpm fp -- prompt-baselines

The command must print output containing:

ForgePilot
Executor Baseline: prompts/executor-baseline-v1.md
Auditor Baseline: prompts/auditor-baseline-v1.md

Exact extra formatting is allowed, but those three strings must appear.

Allowed Files

The executor may modify only:

src/cli/forgepilot.ts
tests/smoke.test.ts

The executor may create run artifacts under:

runs/FP-EVAL-001/

Implementation Constraints

* Read-only command only.
* Do not modify prompt baseline files.
* Do not modify database schema or migrations.
* Do not add routing logic.
* Do not add broker integration.
* Do not add model provider logic.
* Do not add autonomous execution.
* Do not add workflow orchestration.
* Do not create additional packets.

Verification Requirements

Run and record:

pnpm typecheck
pnpm test
pnpm fp -- prompt-baselines

Verify command output includes:

ForgePilot
Executor Baseline: prompts/executor-baseline-v1.md
Auditor Baseline: prompts/auditor-baseline-v1.md

Acceptance Criteria

* pnpm fp -- prompt-baselines works.
* Output includes ForgePilot.
* Output includes Executor Baseline: prompts/executor-baseline-v1.md.
* Output includes Auditor Baseline: prompts/auditor-baseline-v1.md.
* Existing tests pass.
* Only allowed source/test files are changed.
* No routing logic added.
* No broker integration added.
* No model provider logic added.
* No workflow orchestration added.

Executor Final Instructions

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

runs/FP-EVAL-001/executor-result.md
runs/FP-EVAL-001/verification.txt
runs/FP-EVAL-001/audit-prompt.md

using the existing FP-003 handoff workflow.

---

## Executor Result

STATUS: SUCCESS
FILES_CHANGED:
- src/cli/forgepilot.ts
- tests/smoke.test.ts
VERIFICATION_COMMANDS_RUN:
- pnpm typecheck => PASS (exit 0, no errors)
- pnpm test => PASS (9/9 tests, 0 failures)
- pnpm fp -- prompt-baselines => PASS (exit 0, correct output)
VERIFICATION_RESULTS:
- pnpm fp -- prompt-baselines works => PASS
- Output includes ForgePilot => PASS
- Output includes Executor Baseline: prompts/executor-baseline-v1.md => PASS
- Output includes Auditor Baseline: prompts/auditor-baseline-v1.md => PASS
- Existing tests pass => PASS
- Only allowed source/test files are changed => PASS
- No routing logic added => PASS
- No broker integration added => PASS
- No model provider logic added => PASS
- No workflow orchestration added => PASS
RESULT:
Added a read-only `prompt-baselines` CLI command that prints the ForgePilot project name and available prompt baseline file paths. The command is accessible via `pnpm fp -- prompt-baselines`. Only allowed files were modified (src/cli/forgepilot.ts, tests/smoke.test.ts). All constraints respected. All tests pass. All acceptance criteria met.
NOTES:
None.

---

## Verification Output

$ pnpm typecheck

> forgepilot@0.1.0 typecheck /home/ridasaidd/forgepilot
> tsc --noEmit

No output (exit code 0) — typecheck passed.

---

$ pnpm test

> forgepilot@0.1.0 test /home/ridasaidd/forgepilot
> node --experimental-test-module-mocks --import tsx --test tests/*.test.ts

▶ ForgePilot
  ✔ should have a working test harness (0.779377ms)
  ✔ should confirm environment-centric architecture principle (0.283781ms)
✔ ForgePilot (2.018852ms)
▶ Database client
  ✔ should initialize the database and create the data directory (31.401034ms)
  ✔ should throw when getDb is called before initDb (0.88986ms)
✔ Database client (32.786473ms)
▶ Database migration
  ✔ should create the events table via migration (37.022458ms)
  ✔ should be idempotent (running migrate twice does not fail) (54.393083ms)
  ✔ should create all required core schema tables (53.131052ms)
  ✔ should have correct foreign keys on core schema tables (55.021589ms)
✔ Database migration (200.247686ms)
▶ CLI prompt-baselines
  ✔ should print ForgePilot and prompt baseline file paths (1051.251733ms)
✔ CLI prompt-baselines (1051.556773ms)
ℹ tests 9
ℹ suites 4
ℹ pass 9
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 1770.80805
---TEST_EXIT: 0

---

$ pnpm fp -- prompt-baselines

> forgepilot@0.1.0 fp /home/ridasaidd/forgepilot
> tsx src/cli/forgepilot.ts -- "prompt-baselines"

ForgePilot
Executor Baseline: prompts/executor-baseline-v1.md
Auditor Baseline: prompts/auditor-baseline-v1.md
---PROMPT_EXIT: 0

---

## Git Status

M src/cli/forgepilot.ts
 M tests/smoke.test.ts
?? packets/FP-EVAL-001.md
?? runs/FP-EVAL-001/

---

## Relevant Diff

diff --git a/src/cli/forgepilot.ts b/src/cli/forgepilot.ts
index 5d5cc57..f334b0c 100644
--- a/src/cli/forgepilot.ts
+++ b/src/cli/forgepilot.ts
@@ -13,6 +13,7 @@ Options:
   --init-db             Initialize the SQLite database and run pending migrations
   --build-audit-prompt <id>     Build audit prompt for a packet run
   --build-execution-prompt <id> Build execution prompt for a packet
+  --prompt-baselines    Print project name and available prompt baseline files
 
 Environment:
   ForgePilot follows an environment-centric architecture.
@@ -166,6 +167,7 @@ async function main(): Promise<void> {
       "init-db": { type: "boolean" },
       "build-audit-prompt": { type: "string" },
       "build-execution-prompt": { type: "string" },
+      "prompt-baselines": { type: "boolean" },
     },
     strict: true,
     allowPositionals: true,
@@ -210,6 +212,13 @@ async function main(): Promise<void> {
     return;
   }
 
+  if (values["prompt-baselines"] || positionals[0] === "prompt-baselines") {
+    console.log("ForgePilot");
+    console.log("Executor Baseline: prompts/executor-baseline-v1.md");
+    console.log("Auditor Baseline: prompts/auditor-baseline-v1.md");
+    return;
+  }
+
   console.log("ForgePilot CLI — use --help for usage information.");
 }
 
diff --git a/tests/smoke.test.ts b/tests/smoke.test.ts
index 5961988..a422ae5 100644
--- a/tests/smoke.test.ts
+++ b/tests/smoke.test.ts
@@ -3,6 +3,7 @@ import assert from "node:assert/strict";
 import fs from "node:fs";
 import path from "node:path";
 import os from "node:os";
+import { execSync } from "node:child_process";
 import { initDb, getDb, closeDb } from "../src/db/client.js";
 import { migrate } from "../src/db/migrate.js";
 
@@ -197,3 +198,21 @@ describe("Database migration", () => {
     assert.ok(routeFks.some((fk) => fk.table === "packets" && fk.from === "packet_id" && fk.to === "id"));
   });
 });
+
+describe("CLI prompt-baselines", () => {
+  it("should print ForgePilot and prompt baseline file paths", () => {
+    const output = execSync("pnpm fp -- prompt-baselines", {
+      encoding: "utf-8",
+      cwd: process.cwd(),
+    });
+    assert.ok(output.includes("ForgePilot"), "Output should include ForgePilot");
+    assert.ok(
+      output.includes("Executor Baseline: prompts/executor-baseline-v1.md"),
+      "Output should include Executor Baseline path"
+    );
+    assert.ok(
+      output.includes("Auditor Baseline: prompts/auditor-baseline-v1.md"),
+      "Output should include Auditor Baseline path"
+    );
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

