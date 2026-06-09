# Audit Prompt — FP-META-010

**Task:** FP-META-010 — Evaluation Metrics Population Procedure

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

# FP-META-010 — Evaluation Metrics Population Procedure

## Task

Extend the model evaluation harness documentation to define when and how fields in `metrics.json` are populated during the evaluation lifecycle.

## Goal

Ensure the metrics schema introduced in FP-META-008 and expanded in FP-META-009 produces useful data instead of mostly empty or inconsistent values.

This packet defines the metrics population procedure only.

It does not add automation, CLI commands, SQLite storage, aggregation logic, routing logic, or runtime behavior.

## Requirements

Update:

- docs/model-evaluation-harness.md
- evals/model-eval-v1/README.md
- prompts/model-eval-run-v1.md

Document the lifecycle phases for populating `metrics.json`:

1. Executor run start
2. Executor run completion
3. Audit completion
4. Comparison completion

Document which fields are populated at each phase.

### Executor Run Start

The following fields should be populated when the executor run begins:

- `packet_id`
- `packet_category`
- `model_id`
- `base_commit`
- `run_branch`

If unavailable, string fields use `""`.

### Executor Run Completion

The following fields should be populated when the executor run finishes:

- `execution_duration_seconds`
- `prompt_tokens`
- `completion_tokens`
- `reasoning_tokens`
- `total_tokens`
- `estimated_cost`
- `notes`

Unavailable number fields use `null`.

Token and cost fields may remain `null` when provider usage data is unavailable.

### Audit Completion

The following fields should be populated after audit completion:

- `auditor_model`
- `audit_result`
- `first_pass_success`
- `fix_attempts`
- `human_intervention`
- `root_cause`
- `ambiguity_discovered`
- `escalation_occurrence`

Unavailable boolean or numeric fields use `null`.

Unavailable string fields use `""`.

### Comparison Completion

The following field should be populated after comparison completion:

- `comparison_outcome`

`comparison_outcome` remains `null` until the model comparison is complete.

Document that `metrics.json` is updated in place as evaluation phases complete.

Document that the same populated metrics artifact must be copied into:

```text
evals/model-eval-v1/<PACKET_ID>/<MODEL_NAME>/metrics.json
```

Document that if a value cannot be reliably determined, it should remain `null` or `""` according to its field type rather than being guessed.

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

- Executor run start population phase is documented.
- Executor run completion population phase is documented.
- Audit completion population phase is documented.
- Comparison completion population phase is documented.
- In-place metrics update behavior is documented.
- Null/empty-string handling remains documented.
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
- Executor run start population phase is documented => PASS
- Executor run completion population phase is documented => PASS
- Audit completion population phase is documented => PASS
- Comparison completion population phase is documented => PASS
- In-place metrics update behavior is documented => PASS
- Null/empty-string handling remains documented => PASS
- Existing tests pass => PASS
- No runtime behavior changes => PASS

RESULT:
Successfully documented the metrics.json population procedure across all four lifecycle phases (executor run start, executor run completion, audit completion, comparison completion) in all three required files. In-place update behavior, evaluation artifact copy procedure, and no-guessing rules are documented. Existing tests pass with no runtime behavior changes.

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
  ✔ should have a working test harness (0.827601ms)
  ✔ should confirm environment-centric architecture principle (0.254113ms)
✔ ForgePilot (1.919018ms)
▶ Database client
  ✔ should initialize the database and create the data directory (31.040197ms)
  ✔ should throw when getDb is called before initDb (0.694044ms)
✔ Database client (32.02365ms)
▶ Database migration
  ✔ should create the events table via migration (37.717741ms)
  ✔ should be idempotent (running migrate twice does not fail) (66.400156ms)
  ✔ should create all required core schema tables (56.038466ms)
  ✔ should have correct foreign keys on core schema tables (62.014337ms)
✔ Database migration (223.211358ms)
▶ CLI prompt-baselines
  ✔ should print ForgePilot and prompt baseline file paths (954.97992ms)
✔ CLI prompt-baselines (955.287793ms)
$ tsx src/cli/forgepilot.ts -- -- packet-metrics
▶ Packet metrics
  ✔ should return zero counts when no packets exist (35.840797ms)
  ✔ should count completed and failed packets correctly (0.862601ms)
  ✔ CLI packet-metrics should print all three labels (974.068727ms)
  ✔ CLI packet-metrics should succeed with zero counts on empty db (61.838318ms)
✔ Packet metrics (1136.591983ms)
ℹ tests 13
ℹ suites 5
ℹ pass 13
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2849.791766

$ test -f docs/model-evaluation-harness.md
PASS: docs/model-evaluation-harness.md exists

$ test -f evals/model-eval-v1/README.md
PASS: evals/model-eval-v1/README.md exists

$ test -f prompts/model-eval-run-v1.md
PASS: prompts/model-eval-run-v1.md exists

---

## Git Status

On branch eval/fp-meta-010/qwen-3.7-max
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
index 9fea602..e02e73f 100644
--- a/docs/model-evaluation-harness.md
+++ b/docs/model-evaluation-harness.md
@@ -90,6 +90,69 @@ The metrics artifact must contain exactly the following fields:
 * **comparison_outcome** — This field remains `null` during individual executor runs. It is populated after comparison completion, when results from multiple models are compared.
 * **String fields** — `packet_id`, `packet_category`, `model_id`, `auditor_model`, `base_commit`, `run_branch`, `audit_result`, and `notes` are string fields. Empty strings are used when the value is not yet determined.
 * **Schema is normative** — Executors must use the schema exactly as specified. No fields may be added, removed, or renamed.
+* **In-place updates** — `metrics.json` is updated in place as evaluation phases complete. The same artifact accumulates values across phases rather than being replaced.
+* **No guessing** — If a value cannot be reliably determined, it must remain `null` or `""` according to its field type rather than being guessed.
+
+### Metrics Population Procedure
+
+The `metrics.json` artifact is populated incrementally across four lifecycle phases. Each phase owns a specific set of fields.
+
+#### Phase 1: Executor Run Start
+
+The following fields are populated when the executor run begins:
+
+* `packet_id`
+* `packet_category`
+* `model_id`
+* `base_commit`
+* `run_branch`
+
+If unavailable, string fields use `""`.
+
+#### Phase 2: Executor Run Completion
+
+The following fields are populated when the executor run finishes:
+
+* `execution_duration_seconds`
+* `prompt_tokens`
+* `completion_tokens`
+* `reasoning_tokens`
+* `total_tokens`
+* `estimated_cost`
+* `notes`
+
+Unavailable number fields use `null`. Token and cost fields may remain `null` when provider usage data is unavailable.
+
+#### Phase 3: Audit Completion
+
+The following fields are populated after audit completion:
+
+* `auditor_model`
+* `audit_result`
+* `first_pass_success`
+* `fix_attempts`
+* `human_intervention`
+* `root_cause`
+* `ambiguity_discovered`
+* `escalation_occurrence`
+
+Unavailable boolean or numeric fields use `null`. Unavailable string fields use `""`.
+
+#### Phase 4: Comparison Completion
+
+The following field is populated after comparison completion:
+
+* `comparison_outcome`
+
+`comparison_outcome` remains `null` until the model comparison is complete.
+
+#### Evaluation Artifact Copy
+
+After all phases complete, the same populated `metrics.json` artifact must be copied into:
+
+```text
+evals/model-eval-v1/<PACKET_ID>/<MODEL_NAME>/metrics.json
+```
 
 ---
 
diff --git a/evals/model-eval-v1/README.md b/evals/model-eval-v1/README.md
index cd8d028..9b60b44 100644
--- a/evals/model-eval-v1/README.md
+++ b/evals/model-eval-v1/README.md
@@ -79,6 +79,69 @@ The metrics artifact must contain exactly the following fields:
 * **comparison_outcome** — This field remains `null` during individual executor runs. It is populated after comparison completion, when results from multiple models are compared.
 * **String fields** — `packet_id`, `packet_category`, `model_id`, `auditor_model`, `base_commit`, `run_branch`, `audit_result`, and `notes` are string fields. Empty strings are used when the value is not yet determined.
 * **Schema is normative** — Executors must use the schema exactly as specified. No fields may be added, removed, or renamed.
+* **In-place updates** — `metrics.json` is updated in place as evaluation phases complete. The same artifact accumulates values across phases rather than being replaced.
+* **No guessing** — If a value cannot be reliably determined, it must remain `null` or `""` according to its field type rather than being guessed.
+
+### Metrics Population Procedure
+
+The `metrics.json` artifact is populated incrementally across four lifecycle phases. Each phase owns a specific set of fields.
+
+#### Phase 1: Executor Run Start
+
+The following fields are populated when the executor run begins:
+
+* `packet_id`
+* `packet_category`
+* `model_id`
+* `base_commit`
+* `run_branch`
+
+If unavailable, string fields use `""`.
+
+#### Phase 2: Executor Run Completion
+
+The following fields are populated when the executor run finishes:
+
+* `execution_duration_seconds`
+* `prompt_tokens`
+* `completion_tokens`
+* `reasoning_tokens`
+* `total_tokens`
+* `estimated_cost`
+* `notes`
+
+Unavailable number fields use `null`. Token and cost fields may remain `null` when provider usage data is unavailable.
+
+#### Phase 3: Audit Completion
+
+The following fields are populated after audit completion:
+
+* `auditor_model`
+* `audit_result`
+* `first_pass_success`
+* `fix_attempts`
+* `human_intervention`
+* `root_cause`
+* `ambiguity_discovered`
+* `escalation_occurrence`
+
+Unavailable boolean or numeric fields use `null`. Unavailable string fields use `""`.
+
+#### Phase 4: Comparison Completion
+
+The following field is populated after comparison completion:
+
+* `comparison_outcome`
+
+`comparison_outcome` remains `null` until the model comparison is complete.
+
+#### Evaluation Artifact Copy
+
+After all phases complete, the same populated `metrics.json` artifact must be copied into:
+
+```text
+evals/model-eval-v1/<PACKET_ID>/<MODEL_NAME>/metrics.json
+```
 
 ## How to Use
 
diff --git a/prompts/model-eval-run-v1.md b/prompts/model-eval-run-v1.md
index e126cf7..36c5697 100644
--- a/prompts/model-eval-run-v1.md
+++ b/prompts/model-eval-run-v1.md
@@ -71,6 +71,69 @@ The `metrics.json` artifact must contain exactly the following fields:
 * **comparison_outcome** — This field remains `null` during individual executor runs. It is populated after comparison completion, when results from multiple models are compared.
 * **String fields** — `packet_id`, `packet_category`, `model_id`, `auditor_model`, `base_commit`, `run_branch`, `audit_result`, and `notes` are string fields. Empty strings are used when the value is not yet determined.
 * **Schema is normative** — The schema must be used exactly as specified. No fields may be added, removed, or renamed.
+* **In-place updates** — `metrics.json` is updated in place as evaluation phases complete. The same artifact accumulates values across phases rather than being replaced.
+* **No guessing** — If a value cannot be reliably determined, it must remain `null` or `""` according to its field type rather than being guessed.
+
+#### Metrics Population Procedure
+
+The `metrics.json` artifact is populated incrementally across four lifecycle phases. Each phase owns a specific set of fields.
+
+##### Phase 1: Executor Run Start
+
+The following fields are populated when the executor run begins:
+
+* `packet_id`
+* `packet_category`
+* `model_id`
+* `base_commit`
+* `run_branch`
+
+If unavailable, string fields use `""`.
+
+##### Phase 2: Executor Run Completion
+
+The following fields are populated when the executor run finishes:
+
+* `execution_duration_seconds`
+* `prompt_tokens`
+* `completion_tokens`
+* `reasoning_tokens`
+* `total_tokens`
+* `estimated_cost`
+* `notes`
+
+Unavailable number fields use `null`. Token and cost fields may remain `null` when provider usage data is unavailable.
+
+##### Phase 3: Audit Completion
+
+The following fields are populated after audit completion:
+
+* `auditor_model`
+* `audit_result`
+* `first_pass_success`
+* `fix_attempts`
+* `human_intervention`
+* `root_cause`
+* `ambiguity_discovered`
+* `escalation_occurrence`
+
+Unavailable boolean or numeric fields use `null`. Unavailable string fields use `""`.
+
+##### Phase 4: Comparison Completion
+
+The following field is populated after comparison completion:
+
+* `comparison_outcome`
+
+`comparison_outcome` remains `null` until the model comparison is complete.
+
+##### Evaluation Artifact Copy
+
+After all phases complete, the same populated `metrics.json` artifact must be copied into:
+
+```text
+evals/model-eval-v1/<PACKET_ID>/<MODEL_NAME>/metrics.json
+```
 
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
