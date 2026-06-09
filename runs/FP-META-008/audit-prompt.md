# Audit Prompt — FP-META-008

**Task:** FP-META-008 — Evaluation Metrics Artifact Specification

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

# FP-META-008 — Evaluation Metrics Artifact Specification

## Task

Extend the model evaluation harness documentation to require a structured metrics artifact for every evaluation run.

## Goal

Prevent loss of evaluation data by requiring every executor run to produce a standardized metrics artifact that can later be aggregated and analyzed.

This packet defines the artifact format and recording procedure only.

It does not add automation, CLI commands, SQLite storage, aggregation logic, or runtime behavior.

## Requirements

Update:

* docs/model-evaluation-harness.md
* evals/model-eval-v1/README.md
* prompts/model-eval-run-v1.md

Document a required artifact:

runs/<PACKET_ID>/metrics.json

and a copied evaluation artifact:

evals/model-eval-v1/<PACKET_ID>/<MODEL_NAME>/metrics.json

Document the required fields exactly as specified:

{
  "packet_id": "",
  "model_id": "",
  "base_commit": "",
  "run_branch": "",
  "audit_result": "",
  "comparison_outcome": null,
  "first_pass_success": null,
  "fix_attempts": null,
  "human_intervention": null,
  "root_cause": null,
  "ambiguity_discovered": null,
  "execution_duration_seconds": null,
  "prompt_tokens": null,
  "completion_tokens": null,
  "reasoning_tokens": null,
  "total_tokens": null,
  "estimated_cost": null,
  "notes": ""
}

The metrics schema defined in this packet is normative. Executors must document the schema exactly as specified and must not add, remove, or rename fields.

Document that unavailable values should be recorded as null.

Document that metrics artifacts are generated per model run.

Document that comparison_outcome remains null during individual executor runs and is populated after comparison completion.

## Implementation Constraints

* Documentation only.
* Do not modify runtime behavior.
* Do not modify CLI behavior.
* Do not add SQLite storage.
* Do not add aggregation logic.
* Do not add model routing.
* Do not add broker integration.
* Do not add autonomous execution.
* Do not add workflow orchestration.

## Verification Requirements

Run and record:

pnpm typecheck
pnpm test

Verify:

test -f docs/model-evaluation-harness.md
test -f evals/model-eval-v1/README.md
test -f prompts/model-eval-run-v1.md

## Acceptance Criteria

* metrics.json artifact is documented.
* Required fields are documented exactly as specified.
* Null handling is documented.
* Per-model-run ownership is documented.
* Post-comparison outcome recording is documented.
* Existing tests pass.
* No runtime behavior changes.

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
- metrics.json artifact is documented => PASS
- Required fields are documented exactly as specified => PASS
- Null handling is documented => PASS
- Per-model-run ownership is documented => PASS
- Post-comparison outcome recording is documented => PASS
- Existing tests pass => PASS
- No runtime behavior changes => PASS

RESULT:
Successfully extended the model evaluation harness documentation to require a structured metrics artifact for every evaluation run. The metrics.json artifact is now documented in all three required files with the exact schema specified, null handling rules, per-model-run ownership, and post-comparison outcome recording.

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
  ✔ should have a working test harness (0.699692ms)
  ✔ should confirm environment-centric architecture principle (0.199798ms)
✔ ForgePilot (1.663294ms)
▶ Database client
  ✔ should initialize the database and create the data directory (29.72255ms)
  ✔ should throw when getDb is called before initDb (0.649432ms)
✔ Database client (30.678986ms)
▶ Database migration
  ✔ should create the events table via migration (35.22255ms)
  ✔ should be idempotent (running migrate twice does not fail) (49.782784ms)
  ✔ should create all required core schema tables (49.839729ms)
  ✔ should have correct foreign keys on core schema tables (50.07675ms)
✔ Database migration (185.51367ms)
▶ CLI prompt-baselines
  ✔ should print ForgePilot and prompt baseline file paths (918.882375ms)
✔ CLI prompt-baselines (919.1761ms)
$ tsx src/cli/forgepilot.ts -- -- packet-metrics
▶ Packet metrics
  ✔ should return zero counts when no packets exist (40.890716ms)
  ✔ should count completed and failed packets correctly (0.786156ms)
  ✔ CLI packet-metrics should print all three labels (1025.841736ms)
  ✔ CLI packet-metrics should succeed with zero counts on empty db (53.217003ms)
✔ Packet metrics (1183.02424ms)
ℹ tests 13
ℹ suites 5
ℹ pass 13
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2606.895063

$ test -f docs/model-evaluation-harness.md
PASS: docs/model-evaluation-harness.md exists

$ test -f evals/model-eval-v1/README.md
PASS: evals/model-eval-v1/README.md exists

$ test -f prompts/model-eval-run-v1.md
PASS: prompts/model-eval-run-v1.md exists

---

## Git Status

On branch eval/fp-meta-008/qwen-3.7-max
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
	modified:   docs/model-evaluation-harness.md
	modified:   evals/model-eval-v1/README.md
	modified:   prompts/model-eval-run-v1.md

Untracked files:
  (use "git add <file>..." to include in what will be committed)
	runs/FP-META-008/

no changes added to commit (use "git add" and/or "git commit -a")

---

## Relevant Diff

diff --git a/docs/model-evaluation-harness.md b/docs/model-evaluation-harness.md
index cfa06ab..3801dbc 100644
--- a/docs/model-evaluation-harness.md
+++ b/docs/model-evaluation-harness.md
@@ -34,6 +34,56 @@ The following variables are recorded per evaluation run:
 
 ---
 
+## Metrics Artifact
+
+Every evaluation run must produce a structured metrics artifact. The metrics artifact ensures that evaluation data is preserved in a standardized format for later aggregation and analysis.
+
+### Artifact Locations
+
+The metrics artifact must be generated at two locations:
+
+1. **Run artifact** — `runs/<PACKET_ID>/metrics.json`
+2. **Evaluation artifact** — `evals/model-eval-v1/<PACKET_ID>/<MODEL_NAME>/metrics.json`
+
+The evaluation artifact is a copy of the run artifact, placed in the per-model evaluation directory after the run completes.
+
+### Required Schema
+
+The metrics artifact must contain exactly the following fields:
+
+```json
+{
+  "packet_id": "",
+  "model_id": "",
+  "base_commit": "",
+  "run_branch": "",
+  "audit_result": "",
+  "comparison_outcome": null,
+  "first_pass_success": null,
+  "fix_attempts": null,
+  "human_intervention": null,
+  "root_cause": null,
+  "ambiguity_discovered": null,
+  "execution_duration_seconds": null,
+  "prompt_tokens": null,
+  "completion_tokens": null,
+  "reasoning_tokens": null,
+  "total_tokens": null,
+  "estimated_cost": null,
+  "notes": ""
+}
+```
+
+### Field Rules
+
+* **Unavailable values** — Any field whose value is not available at the time of recording must be set to `null`.
+* **Per-model-run ownership** — Each metrics artifact is generated per model run. One metrics artifact corresponds to one executor model executing one packet.
+* **comparison_outcome** — This field remains `null` during individual executor runs. It is populated after comparison completion, when results from multiple models are compared.
+* **String fields** — `packet_id`, `model_id`, `base_commit`, `run_branch`, `audit_result`, and `notes` are string fields. Empty strings are used when the value is not yet determined.
+* **Schema is normative** — Executors must use the schema exactly as specified. No fields may be added, removed, or renamed.
+
+---
+
 ## Comparison Rubric
 
 Every model comparison must evaluate and record these five dimensions:
@@ -96,6 +146,7 @@ evals/
         audit-result.md
         git-status.txt
         relevant-diff.txt
+        metrics.json
 ```
 
 Per-model run storage isolates each model's run artifacts under `evals/model-eval-v1/<PACKET_ID>/<MODEL_NAME>/`. This preserves a complete record of each evaluation run for comparison and audit.
diff --git a/evals/model-eval-v1/README.md b/evals/model-eval-v1/README.md
index 2524e9d..478003b 100644
--- a/evals/model-eval-v1/README.md
+++ b/evals/model-eval-v1/README.md
@@ -18,6 +18,7 @@ evals/model-eval-v1/
       audit-result.md             # Auditor's determination and findings
       git-status.txt              # Git status at time of run
       relevant-diff.txt           # Diff of changes made during run
+      metrics.json                # Structured metrics artifact for this run
 ```
 
 ## Per-Model Run Storage
@@ -26,11 +27,55 @@ Each model's evaluation run is stored under `evals/model-eval-v1/<PACKET_ID>/<MO
 
 This isolates run artifacts per model per packet, enabling fair and auditable comparisons.
 
+## Metrics Artifact
+
+Every evaluation run must produce a structured metrics artifact. The metrics artifact is stored at two locations:
+
+1. **Run artifact** — `runs/<PACKET_ID>/metrics.json`
+2. **Evaluation artifact** — `evals/model-eval-v1/<PACKET_ID>/<MODEL_NAME>/metrics.json`
+
+The evaluation artifact is a copy of the run artifact, placed in the per-model evaluation directory after the run completes.
+
+### Required Schema
+
+The metrics artifact must contain exactly the following fields:
+
+```json
+{
+  "packet_id": "",
+  "model_id": "",
+  "base_commit": "",
+  "run_branch": "",
+  "audit_result": "",
+  "comparison_outcome": null,
+  "first_pass_success": null,
+  "fix_attempts": null,
+  "human_intervention": null,
+  "root_cause": null,
+  "ambiguity_discovered": null,
+  "execution_duration_seconds": null,
+  "prompt_tokens": null,
+  "completion_tokens": null,
+  "reasoning_tokens": null,
+  "total_tokens": null,
+  "estimated_cost": null,
+  "notes": ""
+}
+```
+
+### Field Rules
+
+* **Unavailable values** — Any field whose value is not available at the time of recording must be set to `null`.
+* **Per-model-run ownership** — Each metrics artifact is generated per model run. One metrics artifact corresponds to one executor model executing one packet.
+* **comparison_outcome** — This field remains `null` during individual executor runs. It is populated after comparison completion, when results from multiple models are compared.
+* **String fields** — `packet_id`, `model_id`, `base_commit`, `run_branch`, `audit_result`, and `notes` are string fields. Empty strings are used when the value is not yet determined.
+* **Schema is normative** — Executors must use the schema exactly as specified. No fields may be added, removed, or renamed.
+
 ## How to Use
 
 1. Select a benchmark packet to evaluate against.
 2. For each executor model under evaluation, run the model evaluation run prompt (`prompts/model-eval-run-v1.md`) targeting the benchmark packet.
-3. After completion, copy the generated run artifacts from `runs/<PACKET_ID>/` into `evals/model-eval-v1/<PACKET_ID>/<MODEL_NAME>/`.
+3. After completion, copy the generated run artifacts from `runs/<PACKET_ID>/` into `evals/model-eval-v1/<PACKET_ID>/<MODEL_NAME>/`, including the `metrics.json` artifact.
 4. Run the audit prompt for each evaluation run using the same auditor model.
 5. Record measured variables for each run.
 6. Compare results across models.
diff --git a/prompts/model-eval-run-v1.md b/prompts/model-eval-run-v1.md
index 746cf73..7909c99 100644
--- a/prompts/model-eval-run-v1.md
+++ b/prompts/model-eval-run-v1.md
@@ -26,6 +26,42 @@ After completing the implementation, produce these run artifacts under `runs/<PA
 1. **executor-result.md** — Structured summary of status, files changed, verification results, and a short result summary.
 2. **verification.txt** — Raw output of all verification commands run.
 3. **audit-prompt.md** — A filled audit prompt assembled from the packet, executor result, verification output, git status, and git diff, containing no unresolved template placeholders.
+4. **metrics.json** — Structured metrics artifact containing evaluation run data.
+
+#### Metrics Artifact Schema
+
+The `metrics.json` artifact must contain exactly the following fields:
+
+```json
+{
+  "packet_id": "",
+  "model_id": "",
+  "base_commit": "",
+  "run_branch": "",
+  "audit_result": "",
+  "comparison_outcome": null,
+  "first_pass_success": null,
+  "fix_attempts": null,
+  "human_intervention": null,
+  "root_cause": null,
+  "ambiguity_discovered": null,
+  "execution_duration_seconds": null,
+  "prompt_tokens": null,
+  "completion_tokens": null,
+  "reasoning_tokens": null,
+  "total_tokens": null,
+  "estimated_cost": null,
+  "notes": ""
+}
+```
+
+#### Metrics Artifact Rules
+
+* **Unavailable values** — Any field whose value is not available at the time of recording must be set to `null`.
+* **Per-model-run ownership** — Each metrics artifact is generated per model run. One metrics artifact corresponds to one executor model executing one packet.
+* **comparison_outcome** — This field remains `null` during individual executor runs. It is populated after comparison completion, when results from multiple models are compared.
+* **String fields** — `packet_id`, `model_id`, `base_commit`, `run_branch`, `audit_result`, and `notes` are string fields. Empty strings are used when the value is not yet determined.
+* **Schema is normative** — The schema must be used exactly as specified. No fields may be added, removed, or renamed.
 
 ### Scope Discipline
 
@@ -42,7 +78,7 @@ Do not:
 
 ### Post-Execution
 
-After completing the evaluation run, copy the run artifacts from `runs/<PACKET_ID>/` into the evaluation directory under `evals/model-eval-v1/<PACKET_ID>/<MODEL_NAME>/` using the model name assigned to this evaluation run.
+After completing the evaluation run, copy the run artifacts from `runs/<PACKET_ID>/` into the evaluation directory under `evals/model-eval-v1/<PACKET_ID>/<MODEL_NAME>/` using the model name assigned to this evaluation run. This includes the `metrics.json` artifact.
 
 ### Behavioral Guidance
 

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
