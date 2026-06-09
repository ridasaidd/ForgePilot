# Audit Prompt — FP-META-012

**Task:** FP-META-012 — Metrics Field Recording Standards

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

# FP-META-012 — Metrics Field Recording Standards

## Task

Extend the model evaluation harness documentation to define objective recording standards for key `metrics.json` outcome and quality fields.

## Goal

Ensure evaluation metrics are recorded consistently across benchmark packets, auditors, and comparison runs.

This packet defines field recording standards only.

It does not add automation, CLI commands, SQLite storage, aggregation logic, routing logic, runtime behavior, or workflow orchestration.

## Requirements

Update:

- docs/model-evaluation-harness.md
- evals/model-eval-v1/README.md
- prompts/model-eval-run-v1.md

Document recording standards for these fields:

- `first_pass_success`
- `fix_attempts`
- `human_intervention`
- `ambiguity_discovered`
- `escalation_occurrence`
- `root_cause`

## Field Recording Standards

### first_pass_success

Record `true` only when the executor's first submitted implementation satisfies all acceptance criteria and is accepted without requiring a fix run.

Record `false` when the executor requires one or more fix attempts before acceptance or rejection.

Record `null` when the result is not yet known.

### fix_attempts

Record `0` when the implementation is accepted on the first attempt.

Increment by `1` for each requested correction after the first executor result.

Record `null` when the result is not yet known.

### human_intervention

Record `true` when a human manually changes files, repairs artifacts, rewrites outputs, resolves ambiguity for the executor, or gives corrective implementation guidance during the run.

Record `false` when the run completes without human correction or manual repair.

Record `null` when the result is not yet known.

### ambiguity_discovered

Record `true` when the packet allows more than one reasonable interpretation, causes divergent model behavior, requires clarification, or contains underspecified terms that affect implementation or comparison.

Record `false` when no meaningful ambiguity is discovered.

Record `null` when the result is not yet known.

### escalation_occurrence

Record `true` when the run requires frontier review, human arbitration, invalid-run handling, auditor escalation, or model escalation.

Record `false` when no escalation occurs.

Record `null` when the result is not yet known.

### root_cause

Record `NONE` for accepted runs with no failure.

For failed, rejected, invalid, or escalated runs, record one of:

- `ENVIRONMENT`
- `PACKET`
- `EXECUTOR`
- `AUDITOR`
- `HUMAN`

Use:

- `ENVIRONMENT` when local setup, dependencies, test environment, filesystem, network, or tooling caused the issue.
- `PACKET` when unclear, incorrect, incomplete, contradictory, or underspecified packet requirements caused the issue.
- `EXECUTOR` when the executor model failed to follow clear instructions, violated constraints, produced incorrect work, or omitted required deliverables.
- `AUDITOR` when the auditor made an incorrect judgment, missed evidence, or applied inconsistent criteria.
- `HUMAN` when human operator error contaminated, interrupted, misdirected, or manually altered the run in a way that affected validity.

Record `null` when the result is not yet known.

## Examples

Document examples based on prior ForgePilot findings:

- FP-EVAL-002 discovered packet ambiguity around the meaning of "Successful packets"; this should record `ambiguity_discovered: true` and `root_cause: PACKET`.
- A run that requires manually copying missing evaluation artifacts should record `human_intervention: true`.
- A run accepted on first submission with no repair should record `first_pass_success: true` and `fix_attempts: 0`.
- A run requiring frontier review should record `escalation_occurrence: true`.

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

- `first_pass_success` recording standard is documented.
- `fix_attempts` recording standard is documented.
- `human_intervention` recording standard is documented.
- `ambiguity_discovered` recording standard is documented.
- `escalation_occurrence` recording standard is documented.
- `root_cause` allowed values and meanings are documented.
- Examples are documented.
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
- first_pass_success recording standard is documented => PASS
- fix_attempts recording standard is documented => PASS
- human_intervention recording standard is documented => PASS
- ambiguity_discovered recording standard is documented => PASS
- escalation_occurrence recording standard is documented => PASS
- root_cause allowed values and meanings are documented => PASS
- Examples are documented => PASS
- Existing tests pass => PASS
- No runtime behavior changes => PASS

RESULT:
Successfully documented objective recording standards for all six metrics.json outcome and quality fields (first_pass_success, fix_attempts, human_intervention, ambiguity_discovered, escalation_occurrence, root_cause) and recording standards examples in all three required files. Existing tests pass with no runtime behavior changes.

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
  ✔ should have a working test harness (0.940879ms)
  ✔ should confirm environment-centric architecture principle (0.333318ms)
✔ ForgePilot (2.189465ms)
▶ Database client
  ✔ should initialize the database and create the data directory (33.804853ms)
  ✔ should throw when getDb is called before initDb (0.684988ms)
✔ Database client (34.83027ms)
▶ Database migration
  ✔ should create the events table via migration (36.705713ms)
  ✔ should be idempotent (running migrate twice does not fail) (57.154164ms)
  ✔ should create all required core schema tables (54.08469ms)
  ✔ should have correct foreign keys on core schema tables (57.324813ms)
✔ Database migration (206.025369ms)
▶ CLI prompt-baselines
  ✔ should print ForgePilot and prompt baseline file paths (956.027285ms)
✔ CLI prompt-baselines (956.403382ms)
$ tsx src/cli/forgepilot.ts -- -- packet-metrics
▶ Packet metrics
  ✔ should return zero counts when no packets exist (42.047004ms)
  ✔ should count completed and failed packets correctly (1.086973ms)
  ✔ CLI packet-metrics should print all three labels (955.078685ms)
  ✔ CLI packet-metrics should succeed with zero counts on empty db (55.433425ms)
✔ Packet metrics (1116.133838ms)
ℹ tests 13
ℹ suites 5
ℹ pass 13
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2763.734883

$ test -f docs/model-evaluation-harness.md
PASS: docs/model-evaluation-harness.md exists

$ test -f evals/model-eval-v1/README.md
PASS: evals/model-eval-v1/README.md exists

$ test -f prompts/model-eval-run-v1.md
PASS: prompts/model-eval-run-v1.md exists

---

## Git Status

On branch eval/fp-meta-012/qwen-3.7-max
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
index 52d9e66..bc1d7ef 100644
--- a/docs/model-evaluation-harness.md
+++ b/docs/model-evaluation-harness.md
@@ -192,6 +192,71 @@ No other values are permitted for `comparison_outcome`.
 * Comparison outcomes must not be inferred from branch names, packet names, or model names.
 * Comparison outcomes must be determined from documented comparison results.
 
+### Metrics Field Recording Standards
+
+The following standards define how outcome and quality fields in `metrics.json` must be recorded. These standards ensure consistent recording across benchmark packets, auditors, and comparison runs.
+
+#### first_pass_success
+
+Record `true` only when the executor's first submitted implementation satisfies all acceptance criteria and is accepted without requiring a fix run.
+
+Record `false` when the executor requires one or more fix attempts before acceptance or rejection.
+
+Record `null` when the result is not yet known.
+
+#### fix_attempts
+
+Record `0` when the implementation is accepted on the first attempt.
+
+Increment by `1` for each requested correction after the first executor result.
+
+Record `null` when the result is not yet known.
+
+#### human_intervention
+
+Record `true` when a human manually changes files, repairs artifacts, rewrites outputs, resolves ambiguity for the executor, or gives corrective implementation guidance during the run.
+
+Record `false` when the run completes without human correction or manual repair.
+
+Record `null` when the result is not yet known.
+
+#### ambiguity_discovered
+
+Record `true` when the packet allows more than one reasonable interpretation, causes divergent model behavior, requires clarification, or contains underspecified terms that affect implementation or comparison.
+
+Record `false` when no meaningful ambiguity is discovered.
+
+Record `null` when the result is not yet known.
+
+#### escalation_occurrence
+
+Record `true` when the run requires frontier review, human arbitration, invalid-run handling, auditor escalation, or model escalation.
+
+Record `false` when no escalation occurs.
+
+Record `null` when the result is not yet known.
+
+#### root_cause
+
+Record `NONE` for accepted runs with no failure.
+
+For failed, rejected, invalid, or escalated runs, record one of:
+
+* `ENVIRONMENT` — When local setup, dependencies, test environment, filesystem, network, or tooling caused the issue.
+* `PACKET` — When unclear, incorrect, incomplete, contradictory, or underspecified packet requirements caused the issue.
+* `EXECUTOR` — When the executor model failed to follow clear instructions, violated constraints, produced incorrect work, or omitted required deliverables.
+* `AUDITOR` — When the auditor made an incorrect judgment, missed evidence, or applied inconsistent criteria.
+* `HUMAN` — When human operator error contaminated, interrupted, misdirected, or manually altered the run in a way that affected validity.
+
+Record `null` when the result is not yet known.
+
+#### Recording Standards Examples
+
+* FP-EVAL-002 discovered packet ambiguity around the meaning of "Successful packets"; this should record `ambiguity_discovered: true` and `root_cause: PACKET`.
+* A run that requires manually copying missing evaluation artifacts should record `human_intervention: true`.
+* A run accepted on first submission with no repair should record `first_pass_success: true` and `fix_attempts: 0`.
+* A run requiring frontier review should record `escalation_occurrence: true`.
+
 ---
 
 ## Comparison Rubric

diff --git a/evals/model-eval-v1/README.md b/evals/model-eval-v1/README.md
index 3b28245..8153000 100644
--- a/evals/model-eval-v1/README.md
+++ b/evals/model-eval-v1/README.md
@@ -181,6 +181,71 @@ No other values are permitted for `comparison_outcome`.
 * Comparison outcomes must not be inferred from branch names, packet names, or model names.
 * Comparison outcomes must be determined from documented comparison results.
 
+### Metrics Field Recording Standards
+
+The following standards define how outcome and quality fields in `metrics.json` must be recorded. These standards ensure consistent recording across benchmark packets, auditors, and comparison runs.
+
+#### first_pass_success
+
+Record `true` only when the executor's first submitted implementation satisfies all acceptance criteria and is accepted without requiring a fix run.
+
+Record `false` when the executor requires one or more fix attempts before acceptance or rejection.
+
+Record `null` when the result is not yet known.
+
+#### fix_attempts
+
+Record `0` when the implementation is accepted on the first attempt.
+
+Increment by `1` for each requested correction after the first executor result.
+
+Record `null` when the result is not yet known.
+
+#### human_intervention
+
+Record `true` when a human manually changes files, repairs artifacts, rewrites outputs, resolves ambiguity for the executor, or gives corrective implementation guidance during the run.
+
+Record `false` when the run completes without human correction or manual repair.
+
+Record `null` when the result is not yet known.
+
+#### ambiguity_discovered
+
+Record `true` when the packet allows more than one reasonable interpretation, causes divergent model behavior, requires clarification, or contains underspecified terms that affect implementation or comparison.
+
+Record `false` when no meaningful ambiguity is discovered.
+
+Record `null` when the result is not yet known.
+
+#### escalation_occurrence
+
+Record `true` when the run requires frontier review, human arbitration, invalid-run handling, auditor escalation, or model escalation.
+
+Record `false` when no escalation occurs.
+
+Record `null` when the result is not yet known.
+
+#### root_cause
+
+Record `NONE` for accepted runs with no failure.
+
+For failed, rejected, invalid, or escalated runs, record one of:
+
+* `ENVIRONMENT` — When local setup, dependencies, test environment, filesystem, network, or tooling caused the issue.
+* `PACKET` — When unclear, incorrect, incomplete, contradictory, or underspecified packet requirements caused the issue.
+* `EXECUTOR` — When the executor model failed to follow clear instructions, violated constraints, produced incorrect work, or omitted required deliverables.
+* `AUDITOR` — When the auditor made an incorrect judgment, missed evidence, or applied inconsistent criteria.
+* `HUMAN` — When human operator error contaminated, interrupted, misdirected, or manually altered the run in a way that affected validity.
+
+Record `null` when the result is not yet known.
+
+#### Recording Standards Examples
+
+* FP-EVAL-002 discovered packet ambiguity around the meaning of "Successful packets"; this should record `ambiguity_discovered: true` and `root_cause: PACKET`.
+* A run that requires manually copying missing evaluation artifacts should record `human_intervention: true`.
+* A run accepted on first submission with no repair should record `first_pass_success: true` and `fix_attempts: 0`.
+* A run requiring frontier review should record `escalation_occurrence: true`.
+
 ## How to Use

diff --git a/prompts/model-eval-run-v1.md b/prompts/model-eval-run-v1.md
index 723ad55..edaa0fe 100644
--- a/prompts/model-eval-run-v1.md
+++ b/prompts/model-eval-run-v1.md
@@ -173,6 +173,71 @@ No other values are permitted for `comparison_outcome`.
 * Comparison outcomes must not be inferred from branch names, packet names, or model names.
 * Comparison outcomes must be determined from documented comparison results.
 
+#### Metrics Field Recording Standards
+
+The following standards define how outcome and quality fields in `metrics.json` must be recorded. These standards ensure consistent recording across benchmark packets, auditors, and comparison runs.
+
+##### first_pass_success
+
+Record `true` only when the executor's first submitted implementation satisfies all acceptance criteria and is accepted without requiring a fix run.
+
+Record `false` when the executor requires one or more fix attempts before acceptance or rejection.
+
+Record `null` when the result is not yet known.
+
+##### fix_attempts
+
+Record `0` when the implementation is accepted on the first attempt.
+
+Increment by `1` for each requested correction after the first executor result.
+
+Record `null` when the result is not yet known.
+
+##### human_intervention
+
+Record `true` when a human manually changes files, repairs artifacts, rewrites outputs, resolves ambiguity for the executor, or gives corrective implementation guidance during the run.
+
+Record `false` when the run completes without human correction or manual repair.
+
+Record `null` when the result is not yet known.
+
+##### ambiguity_discovered
+
+Record `true` when the packet allows more than one reasonable interpretation, causes divergent model behavior, requires clarification, or contains underspecified terms that affect implementation or comparison.
+
+Record `false` when no meaningful ambiguity is discovered.
+
+Record `null` when the result is not yet known.
+
+##### escalation_occurrence
+
+Record `true` when the run requires frontier review, human arbitration, invalid-run handling, auditor escalation, or model escalation.
+
+Record `false` when no escalation occurs.
+
+Record `null` when the result is not yet known.
+
+##### root_cause
+
+Record `NONE` for accepted runs with no failure.
+
+For failed, rejected, invalid, or escalated runs, record one of:
+
+* `ENVIRONMENT` — When local setup, dependencies, test environment, filesystem, network, or tooling caused the issue.
+* `PACKET` — When unclear, incorrect, incomplete, contradictory, or underspecified packet requirements caused the issue.
+* `EXECUTOR` — When the executor model failed to follow clear instructions, violated constraints, produced incorrect work, or omitted required deliverables.
+* `AUDITOR` — When the auditor made an incorrect judgment, missed evidence, or applied inconsistent criteria.
+* `HUMAN` — When human operator error contaminated, interrupted, misdirected, or manually altered the run in a way that affected validity.
+
+Record `null` when the result is not yet known.
+
+##### Recording Standards Examples
+
+* FP-EVAL-002 discovered packet ambiguity around the meaning of "Successful packets"; this should record `ambiguity_discovered: true` and `root_cause: PACKET`.
+* A run that requires manually copying missing evaluation artifacts should record `human_intervention: true`.
+* A run accepted on first submission with no repair should record `first_pass_success: true` and `fix_attempts: 0`.
+* A run requiring frontier review should record `escalation_occurrence: true`.
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
