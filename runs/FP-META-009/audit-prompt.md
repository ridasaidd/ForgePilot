# Audit Prompt — FP-META-009

**Task:** FP-META-009 — Tier 1 Evaluation Metrics Expansion

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

# FP-META-009 — Tier 1 Evaluation Metrics Expansion

## Task

Extend the model evaluation metrics artifact specification to include the Tier 1 routing and cost metrics needed for evidence-based model assignment.

## Goal

Improve ForgePilot's ability to learn which model should execute which task by recording the most important routing, audit, escalation, duration, token, and cost fields.

This packet expands the existing `metrics.json` schema introduced by FP-META-008.

It does not add automation, CLI commands, SQLite storage, aggregation logic, routing logic, or runtime behavior.

## Requirements

Update:

- docs/model-evaluation-harness.md
- evals/model-eval-v1/README.md
- prompts/model-eval-run-v1.md

Add the following required fields to the documented `metrics.json` schema:

```json
"packet_category": "",
"auditor_model": "",
"escalation_occurrence": null
```

The updated schema must include these fields:

```json
{
  "packet_id": "",
  "packet_category": "",
  "model_id": "",
  "auditor_model": "",
  "base_commit": "",
  "run_branch": "",
  "audit_result": "",
  "comparison_outcome": null,
  "first_pass_success": null,
  "fix_attempts": null,
  "human_intervention": null,
  "root_cause": null,
  "ambiguity_discovered": null,
  "escalation_occurrence": null,
  "execution_duration_seconds": null,
  "prompt_tokens": null,
  "completion_tokens": null,
  "reasoning_tokens": null,
  "total_tokens": null,
  "estimated_cost": null,
  "notes": ""
}
```

Document these field meanings:

- `packet_category` records the task category used for future routing analysis.
- `auditor_model` records which model or human audited the run.
- `escalation_occurrence` records whether the run required escalation or frontier review.

Document that unavailable values should be recorded as `null`.

Document that string fields whose values are not yet known should use `""`.

The metrics schema defined in this packet is normative. Executors must document the schema exactly as specified and must not add, remove, or rename fields.

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

- `packet_category` is added to the documented metrics schema.
- `auditor_model` is added to the documented metrics schema.
- `escalation_occurrence` is added to the documented metrics schema.
- Updated field meanings are documented.
- Null handling remains documented.
- Empty-string handling for unknown string fields remains documented.
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
- packet_category is added to the documented metrics schema => PASS
- auditor_model is added to the documented metrics schema => PASS
- escalation_occurrence is added to the documented metrics schema => PASS
- Updated field meanings are documented => PASS
- Null handling remains documented => PASS
- Empty-string handling for unknown string fields remains documented => PASS
- Existing tests pass => PASS
- No runtime behavior changes => PASS

RESULT:
Successfully extended the metrics.json schema documentation in all three required files to include packet_category, auditor_model, and escalation_occurrence fields. Field meanings are documented, string field lists are updated, and null/empty-string handling rules remain intact.

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
  ✔ should have a working test harness (1.067973ms)
  ✔ should confirm environment-centric architecture principle (0.362689ms)
✔ ForgePilot (2.645636ms)
▶ Database client
  ✔ should initialize the database and create the data directory (31.901019ms)
  ✔ should throw when getDb is called before initDb (0.747822ms)
✔ Database client (32.991344ms)
▶ Database migration
  ✔ should create the events table via migration (37.996947ms)
  ✔ should be idempotent (running migrate twice does not fail) (59.251867ms)
  ✔ should create all required core schema tables (54.387211ms)
  ✔ should have correct foreign keys on core schema tables (53.094884ms)
✔ Database migration (205.391452ms)
▶ CLI prompt-baselines
  ✔ should print ForgePilot and prompt baseline file paths (1039.464356ms)
✔ CLI prompt-baselines (1039.721766ms)
$ tsx src/cli/forgepilot.ts -- -- packet-metrics
▶ Packet metrics
  ✔ should return zero counts when no packets exist (37.225347ms)
  ✔ should count completed and failed packets correctly (0.733951ms)
  ✔ CLI packet-metrics should print all three labels (1001.867339ms)
  ✔ CLI packet-metrics should succeed with zero counts on empty db (53.517684ms)
✔ Packet metrics (1157.151472ms)
ℹ tests 13
ℹ suites 5
ℹ pass 13
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2939.514512

$ test -f docs/model-evaluation-harness.md
PASS: docs/model-evaluation-harness.md exists

$ test -f evals/model-eval-v1/README.md
PASS: evals/model-eval-v1/README.md exists

$ test -f prompts/model-eval-run-v1.md
PASS: prompts/model-eval-run-v1.md exists

---

## Git Status

On branch eval/fp-meta-009/qwen-3.7-max
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
index 3801dbc..9fea602 100644
--- a/docs/model-evaluation-harness.md
+++ b/docs/model-evaluation-harness.md
@@ -54,7 +54,9 @@ The metrics artifact must contain exactly the following fields:
 ```json
 {
   "packet_id": "",
+  "packet_category": "",
   "model_id": "",
+  "auditor_model": "",
   "base_commit": "",
   "run_branch": "",
   "audit_result": "",
@@ -64,6 +66,7 @@ The metrics artifact must contain exactly the following fields:
   "human_intervention": null,
   "root_cause": null,
   "ambiguity_discovered": null,
+  "escalation_occurrence": null,
   "execution_duration_seconds": null,
   "prompt_tokens": null,
   "completion_tokens": null,
@@ -74,12 +77,18 @@ The metrics artifact must contain exactly the following fields:
 }
 ```
 
+### Field Meanings
+
+* **packet_category** — Records the task category used for future routing analysis.
+* **auditor_model** — Records which model or human audited the run.
+* **escalation_occurrence** — Records whether the run required escalation or frontier review.
+
 ### Field Rules
 
 * **Unavailable values** — Any field whose value is not available at the time of recording must be set to `null`.
 * **Per-model-run ownership** — Each metrics artifact is generated per model run. One metrics artifact corresponds to one executor model executing one packet.
 * **comparison_outcome** — This field remains `null` during individual executor runs. It is populated after comparison completion, when results from multiple models are compared.
-* **String fields** — `packet_id`, `model_id`, `base_commit`, `run_branch`, `audit_result`, and `notes` are string fields. Empty strings are used when the value is not yet determined.
+* **String fields** — `packet_id`, `packet_category`, `model_id`, `auditor_model`, `base_commit`, `run_branch`, `audit_result`, and `notes` are string fields. Empty strings are used when the value is not yet determined.
 * **Schema is normative** — Executors must use the schema exactly as specified. No fields may be added, removed, or renamed.
 
 ---
diff --git a/evals/model-eval-v1/README.md b/evals/model-eval-v1/README.md
index 478003b..cd8d028 100644
--- a/evals/model-eval-v1/README.md
+++ b/evals/model-eval-v1/README.md
@@ -43,7 +43,9 @@ The metrics artifact must contain exactly the following fields:
 ```json
 {
   "packet_id": "",
+  "packet_category": "",
   "model_id": "",
+  "auditor_model": "",
   "base_commit": "",
   "run_branch": "",
   "audit_result": "",
@@ -53,6 +55,7 @@ The metrics artifact must contain exactly the following fields:
   "human_intervention": null,
   "root_cause": null,
   "ambiguity_discovered": null,
+  "escalation_occurrence": null,
   "execution_duration_seconds": null,
   "prompt_tokens": null,
   "completion_tokens": null,
@@ -63,12 +66,18 @@ The metrics artifact must contain exactly the following fields:
 }
 ```
 
+### Field Meanings
+
+* **packet_category** — Records the task category used for future routing analysis.
+* **auditor_model** — Records which model or human audited the run.
+* **escalation_occurrence** — Records whether the run required escalation or frontier review.
+
 ### Field Rules
 
 * **Unavailable values** — Any field whose value is not available at the time of recording must be set to `null`.
 * **Per-model-run ownership** — Each metrics artifact is generated per model run. One metrics artifact corresponds to one executor model executing one packet.
 * **comparison_outcome** — This field remains `null` during individual executor runs. It is populated after comparison completion, when results from multiple models are compared.
-* **String fields** — `packet_id`, `model_id`, `base_commit`, `run_branch`, `audit_result`, and `notes` are string fields. Empty strings are used when the value is not yet determined.
+* **String fields** — `packet_id`, `packet_category`, `model_id`, `auditor_model`, `base_commit`, `run_branch`, `audit_result`, and `notes` are string fields. Empty strings are used when the value is not yet determined.
 * **Schema is normative** — Executors must use the schema exactly as specified. No fields may be added, removed, or renamed.
 
 ## How to Use
diff --git a/prompts/model-eval-run-v1.md b/prompts/model-eval-run-v1.md
index 7909c99..e126cf7 100644
--- a/prompts/model-eval-run-v1.md
+++ b/prompts/model-eval-run-v1.md
@@ -35,7 +35,9 @@ The `metrics.json` artifact must contain exactly the following fields:
 ```json
 {
   "packet_id": "",
+  "packet_category": "",
   "model_id": "",
+  "auditor_model": "",
   "base_commit": "",
   "run_branch": "",
   "audit_result": "",
@@ -45,6 +47,7 @@ The `metrics.json` artifact must contain exactly the following fields:
   "human_intervention": null,
   "root_cause": null,
   "ambiguity_discovered": null,
+  "escalation_occurrence": null,
   "execution_duration_seconds": null,
   "prompt_tokens": null,
   "completion_tokens": null,
@@ -55,12 +58,18 @@ The `metrics.json` artifact must contain exactly the following fields:
 }
 ```
 
+#### Field Meanings
+
+* **packet_category** — Records the task category used for future routing analysis.
+* **auditor_model** — Records which model or human audited the run.
+* **escalation_occurrence** — Records whether the run required escalation or frontier review.
+
 #### Metrics Artifact Rules
 
 * **Unavailable values** — Any field whose value is not available at the time of recording must be set to `null`.
 * **Per-model-run ownership** — Each metrics artifact is generated per model run. One metrics artifact corresponds to one executor model executing one packet.
 * **comparison_outcome** — This field remains `null` during individual executor runs. It is populated after comparison completion, when results from multiple models are compared.
-* **String fields** — `packet_id`, `model_id`, `base_commit`, `run_branch`, `audit_result`, and `notes` are string fields. Empty strings are used when the value is not yet determined.
+* **String fields** — `packet_id`, `packet_category`, `model_id`, `auditor_model`, `base_commit`, `run_branch`, `audit_result`, and `notes` are string fields. Empty strings are used when the value is not yet determined.
 * **Schema is normative** — The schema must be used exactly as specified. No fields may be added, removed, or renamed.
 
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
