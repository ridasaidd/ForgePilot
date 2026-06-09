# Audit Prompt — FP-META-011

**Task:** FP-META-011 — Comparison Outcome Standards

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

# FP-META-011 — Comparison Outcome Standards

## Task

Extend the model evaluation harness documentation to define the allowed values, ownership, and recording rules for comparison_outcome in metrics.json.

## Goal

Ensure model comparison results are recorded consistently across benchmark packets and can later be aggregated, analyzed, stored in SQLite, and consumed by routing logic.

This packet defines comparison outcome standards only.

It does not add automation, CLI commands, SQLite storage, aggregation logic, routing logic, runtime behavior, or workflow orchestration.

## Requirements

Update:

- docs/model-evaluation-harness.md
- evals/model-eval-v1/README.md
- prompts/model-eval-run-v1.md

Document that comparison_outcome may contain only the following values:

WINNER
RUNNER_UP
TIE
INVALID

### Outcome Definitions

WINNER — Assigned to the model selected as the strongest implementation for a benchmark packet.

RUNNER_UP — Assigned to a valid implementation that was not selected as the winner.

TIE — Assigned when multiple implementations are judged equivalent and no winner is selected.

INVALID — Assigned when a run is excluded from comparison due to failure, corruption, missing artifacts, audit rejection, or inability to complete evaluation.

### Ownership

Document that:

- Executors never populate comparison_outcome.
- Auditors never populate comparison_outcome.
- The comparison phase is solely responsible for populating comparison_outcome.

### Recording Rules

Document:

- Exactly one winner may exist per benchmark unless a tie is declared.
- Multiple models may receive TIE.
- Multiple models may receive RUNNER_UP.
- INVALID runs are excluded from winner selection.
- comparison_outcome remains null until comparison completion.

### Metrics Update Rules

Document:

- The comparison phase updates the existing metrics.json artifact in place.
- The comparison result must be written to:
    - runs/<PACKET_ID>/metrics.json
    - evals/model-eval-v1/<PACKET_ID>/<MODEL_NAME>/metrics.json
- Comparison outcomes must not be inferred from branch names, packet names, or model names.
- Comparison outcomes must be determined from documented comparison results.

## Implementation Constraints

- Documentation only.
- Do not modify runtime behavior.
- Do not modify CLI behavior.
- Do not add SQLite storage.
- Do not add aggregation logic.
- Do not add routing logic.
- Do not add broker integration.
- Do not add autonomous execution.
- Do not add workflow orchestration.

## Verification Requirements

Run and record:

```bash
pnpm typecheck
pnpm test
```

Verify:

```bash
test -f docs/model-evaluation-harness.md
test -f evals/model-eval-v1/README.md
test -f prompts/model-eval-run-v1.md
```

## Acceptance Criteria

- Allowed comparison outcome values are documented.
- Outcome definitions are documented.
- Comparison ownership is documented.
- Recording rules are documented.
- Metrics update rules are documented.
- Existing tests pass.
- No runtime behavior changes.

---

## Executor Result

STATUS: SUCCESS

FILES_CHANGED:
- docs/model-evaluation-harness.md
- evals/model-eval-v1/README.md
- prompts/model-eval-run-v1.md

VERIFICATION_COMMANDS_RUN:
- pnpm typecheck => PASS
- pnpm test => PASS (13 tests, 0 failures)
- test -f docs/model-evaluation-harness.md => PASS
- test -f evals/model-eval-v1/README.md => PASS
- test -f prompts/model-eval-run-v1.md => PASS

VERIFICATION_RESULTS:
- Allowed comparison outcome values are documented => PASS
- Outcome definitions are documented => PASS
- Comparison ownership is documented => PASS
- Recording rules are documented => PASS
- Metrics update rules are documented => PASS
- Existing tests pass => PASS
- No runtime behavior changes => PASS

RESULT:
Successfully documented the allowed comparison_outcome values (WINNER, RUNNER_UP, TIE, INVALID), outcome definitions, ownership rules, recording rules, and metrics update rules in all three required files. Existing tests pass with no runtime behavior changes.

NOTES:
None.

---

## Verification Output

$ pnpm typecheck
$ tsc --noEmit

$ pnpm test
$ node --experimental-test-module-mocks --import tsx --test tests/*.test.ts
$ tsx src/cli/forgepilot.ts -- -- prompt-baselines
▶ ForgePilot
  ✔ should have a working test harness (0.809693ms)
  ✔ should confirm environment-centric architecture principle (0.247429ms)
✔ ForgePilot (1.835592ms)
▶ Database client
  ✔ should initialize the database and create the data directory (36.472251ms)
  ✔ should throw when getDb is called before initDb (0.751896ms)
✔ Database client (37.566613ms)
▶ Database migration
  ✔ should create the events table via migration (52.186362ms)
  ✔ should be idempotent (running migrate twice does not fail) (54.567496ms)
  ✔ should create all required core schema tables (58.251271ms)
  ✔ should have correct foreign keys on core schema tables (58.664405ms)
✔ Database migration (224.431968ms)
▶ CLI prompt-baselines
  ✔ should print ForgePilot and prompt baseline file paths (989.265642ms)
✔ CLI prompt-baselines (989.557793ms)
$ tsx src/cli/forgepilot.ts -- -- packet-metrics
▶ Packet metrics
  ✔ should return zero counts when no packets exist (40.746977ms)
  ✔ should count completed and failed packets correctly (1.43881ms)
  ✔ CLI packet-metrics should print all three labels (948.303126ms)
  ✔ CLI packet-metrics should succeed with zero counts on empty db (53.682043ms)
✔ Packet metrics (1107.744833ms)
ℹ tests 13
ℹ suites 5
ℹ pass 13
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2740.885824

$ test -f docs/model-evaluation-harness.md
PASS: docs/model-evaluation-harness.md exists

$ test -f evals/model-eval-v1/README.md
PASS: evals/model-eval-v1/README.md exists

$ test -f prompts/model-eval-run-v1.md
PASS: prompts/model-eval-run-v1.md exists

---

## Git Status

On branch eval/fp-meta-011/qwen-3.7-max
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
	modified:   docs/model-evaluation-harness.md
	modified:   evals/model-eval-v1/README.md
	modified:   prompts/model-eval-run-v1.md

no changes added to commit (use "git add" and/or "git commit -a")

---

## Relevant Diff

diff --git a/docs/model-evaluation-harness.md b/docs/model-evaluation-harness.md
index e02e73f..52d9e66 100644
--- a/docs/model-evaluation-harness.md
+++ b/docs/model-evaluation-harness.md
@@ -154,6 +154,44 @@ After all phases complete, the same populated `metrics.json` artifact must be co
 evals/model-eval-v1/<PACKET_ID>/<MODEL_NAME>/metrics.json
 ```
 
+### Comparison Outcome Standards
+
+The `comparison_outcome` field in `metrics.json` records the result of model comparison for a given benchmark packet. Only the following values are permitted:
+
+#### Allowed Values
+
+| Value | Definition |
+|-------|-----------|
+| `WINNER` | Assigned to the model selected as the strongest implementation for a benchmark packet. |
+| `RUNNER_UP` | Assigned to a valid implementation that was not selected as the winner. |
+| `TIE` | Assigned when multiple implementations are judged equivalent and no winner is selected. |
+| `INVALID` | Assigned when a run is excluded from comparison due to failure, corruption, missing artifacts, audit rejection, or inability to complete evaluation. |
+
+No other values are permitted for `comparison_outcome`.
+
+#### Ownership
+
+* Executors never populate `comparison_outcome`.
+* Auditors never populate `comparison_outcome`.
+* The comparison phase is solely responsible for populating `comparison_outcome`.
+
+#### Recording Rules
+
+* Exactly one winner may exist per benchmark unless a tie is declared.
+* Multiple models may receive `TIE`.
+* Multiple models may receive `RUNNER_UP`.
+* `INVALID` runs are excluded from winner selection.
+* `comparison_outcome` remains `null` until comparison completion.
+
+#### Metrics Update Rules
+
+* The comparison phase updates the existing `metrics.json` artifact in place.
+* The comparison result must be written to:
+    * `runs/<PACKET_ID>/metrics.json`
+    * `evals/model-eval-v1/<PACKET_ID>/<MODEL_NAME>/metrics.json`
+* Comparison outcomes must not be inferred from branch names, packet names, or model names.
+* Comparison outcomes must be determined from documented comparison results.
+
 ---
 
 ## Comparison Rubric

diff --git a/evals/model-eval-v1/README.md b/evals/model-eval-v1/README.md
index 9b60b44..3b28245 100644
--- a/evals/model-eval-v1/README.md
+++ b/evals/model-eval-v1/README.md
@@ -143,6 +143,44 @@ After all phases complete, the same populated `metrics.json` artifact must be co
 evals/model-eval-v1/<PACKET_ID>/<MODEL_NAME>/metrics.json
 ```
 
+### Comparison Outcome Standards
+
+The `comparison_outcome` field in `metrics.json` records the result of model comparison for a given benchmark packet. Only the following values are permitted:
+
+#### Allowed Values
+
+| Value | Definition |
+|-------|-----------|
+| `WINNER` | Assigned to the model selected as the strongest implementation for a benchmark packet. |
+| `RUNNER_UP` | Assigned to a valid implementation that was not selected as the winner. |
+| `TIE` | Assigned when multiple implementations are judged equivalent and no winner is selected. |
+| `INVALID` | Assigned when a run is excluded from comparison due to failure, corruption, missing artifacts, audit rejection, or inability to complete evaluation. |
+
+No other values are permitted for `comparison_outcome`.
+
+#### Ownership
+
+* Executors never populate `comparison_outcome`.
+* Auditors never populate `comparison_outcome`.
+* The comparison phase is solely responsible for populating `comparison_outcome`.
+
+#### Recording Rules
+
+* Exactly one winner may exist per benchmark unless a tie is declared.
+* Multiple models may receive `TIE`.
+* Multiple models may receive `RUNNER_UP`.
+* `INVALID` runs are excluded from winner selection.
+* `comparison_outcome` remains `null` until comparison completion.
+
+#### Metrics Update Rules
+
+* The comparison phase updates the existing `metrics.json` artifact in place.
+* The comparison result must be written to:
+    * `runs/<PACKET_ID>/metrics.json`
+    * `evals/model-eval-v1/<PACKET_ID>/<MODEL_NAME>/metrics.json`
+* Comparison outcomes must not be inferred from branch names, packet names, or model names.
+* Comparison outcomes must be determined from documented comparison results.
+
 ## How to Use

diff --git a/prompts/model-eval-run-v1.md b/prompts/model-eval-run-v1.md
index 36c5697..723ad55 100644
--- a/prompts/model-eval-run-v1.md
+++ b/prompts/model-eval-run-v1.md
@@ -135,6 +135,44 @@ After all phases complete, the same populated `metrics.json` artifact must be co
 evals/model-eval-v1/<PACKET_ID>/<MODEL_NAME>/metrics.json
 ```
 
+#### Comparison Outcome Standards
+
+The `comparison_outcome` field in `metrics.json` records the result of model comparison for a given benchmark packet. Only the following values are permitted:
+
+##### Allowed Values
+
+| Value | Definition |
+|-------|-----------|
+| `WINNER` | Assigned to the model selected as the strongest implementation for a benchmark packet. |
+| `RUNNER_UP` | Assigned to a valid implementation that was not selected as the winner. |
+| `TIE` | Assigned when multiple implementations are judged equivalent and no winner is selected. |
+| `INVALID` | Assigned when a run is excluded from comparison due to failure, corruption, missing artifacts, audit rejection, or inability to complete evaluation. |
+
+No other values are permitted for `comparison_outcome`.
+
+##### Ownership
+
+* Executors never populate `comparison_outcome`.
+* Auditors never populate `comparison_outcome`.
+* The comparison phase is solely responsible for populating `comparison_outcome`.
+
+##### Recording Rules
+
+* Exactly one winner may exist per benchmark unless a tie is declared.
+* Multiple models may receive `TIE`.
+* Multiple models may receive `RUNNER_UP`.
+* `INVALID` runs are excluded from winner selection.
+* `comparison_outcome` remains `null` until comparison completion.
+
+##### Metrics Update Rules
+
+* The comparison phase updates the existing `metrics.json` artifact in place.
+* The comparison result must be written to:
+    * `runs/<PACKET_ID>/metrics.json`
+    * `evals/model-eval-v1/<PACKET_ID>/<MODEL_NAME>/metrics.json`
+* Comparison outcomes must not be inferred from branch names, packet names, or model names.
+* Comparison outcomes must be determined from documented comparison results.
+
 ### Scope Discipline

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
