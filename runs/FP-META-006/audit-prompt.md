# Audit Prompt — FP-META-006

**Task:** FP-META-006 — Model Evaluation Procedure Hardening

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

# FP-META-006 — Model Evaluation Procedure Hardening

## Task

Update the model evaluation harness documentation to prevent contaminated model comparisons.

## Goal

Ensure future model evaluation runs compare executor models fairly by requiring each model to start from the same base commit and isolated branch before any implementation is merged.

## Requirements

Update:

- docs/model-evaluation-harness.md
- evals/model-eval-v1/README.md

The documentation must define:

- Same packet requirement.
- Same base commit requirement.
- Isolated branch per executor model.
- No merging benchmark implementation until all compared model runs are complete.
- Invalid-run classification for contaminated runs.
- Required invalid-run artifact location.

Invalid run artifact path format:

evals/model-eval-v1/<PACKET_ID>/<MODEL_ID>/invalid-run.md

## Implementation Constraints

- Documentation only.
- Do not modify runtime behavior.
- Do not modify CLI behavior.
- Do not add model routing.
- Do not add broker integration.
- Do not add autonomous execution.
- Do not add workflow orchestration.

## Verification Requirements

Run and record:

pnpm typecheck
pnpm test

Verify:

test -f docs/model-evaluation-harness.md
test -f evals/model-eval-v1/README.md

## Acceptance Criteria

- Same base commit rule is documented.
- Isolated branch per model rule is documented.
- No merge before comparison completion rule is documented.
- Invalid-run classification is documented.
- Invalid-run artifact path is documented.
- Existing tests pass.
- No runtime behavior changes.

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

runs/FP-META-006/executor-result.md
runs/FP-META-006/verification.txt
runs/FP-META-006/audit-prompt.md

using the existing FP-003 handoff workflow.

---

## Executor Result

# FP-META-006 Executor Result

## Status: SUCCESS

## Summary

Updated `docs/model-evaluation-harness.md` and `evals/model-eval-v1/README.md` with contamination prevention rules: same packet requirement, same base commit requirement, isolated branch per executor model, no merging until comparison complete, invalid-run classification, and invalid-run artifact path.

## Files Changed

- `docs/model-evaluation-harness.md` — Added "Contamination Prevention" section with all six required rules.
- `evals/model-eval-v1/README.md` — Added "Contamination Prevention" section with all six required rules.

## Design Decisions

- Documentation only. No runtime, CLI, or code changes.
- Added contamination prevention as a new section in both files to keep existing content intact.
- Invalid-run artifact path documented as `evals/model-eval-v1/<PACKET_ID>/<MODEL_ID>/invalid-run.md` per packet specification.
- No model routing, broker integration, autonomous execution, or workflow orchestration added.

---

## Verification Output

$ pnpm typecheck
> tsc --noEmit
(exit 0)

$ pnpm test
> node --experimental-test-module-mocks --import tsx --test tests/*.test.ts
  ForgePilot (1.749905ms) - 2 passed
  Database client (31.722775ms) - 2 passed
  Database migration (200.143411ms) - 4 passed
  CLI prompt-baselines (949.427061ms) - 1 passed
  tests 9, pass 9, fail 0
(exit 0)

$ test -f docs/model-evaluation-harness.md && echo "PASS" || echo "FAIL"
PASS

$ test -f evals/model-eval-v1/README.md && echo "PASS" || echo "FAIL"
PASS

---

## Git Status

On branch fp-meta-006-model-eval-procedure
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
	modified:   docs/model-evaluation-harness.md
	modified:   evals/model-eval-v1/README.md

Untracked files:
  (use "git add <file>..." to include in what will be committed)
	packets/FP-META-006.md
	runs/FP-META-006/

no changes added to commit (use "git add" and/or "git commit -a")

---

## Relevant Diff

diff --git a/docs/model-evaluation-harness.md b/docs/model-evaluation-harness.md
index 785ab41..bf6e483 100644
--- a/docs/model-evaluation-harness.md
+++ b/docs/model-evaluation-harness.md
@@ -46,6 +46,25 @@ The following rules govern all evaluation runs:
 
 ---
 
+## Contamination Prevention
+
+The following rules prevent contaminated model comparisons:
+
+* **Same packet** — Every executor model under evaluation must execute the identical packet. No model may run a modified or substituted packet.
+* **Same base commit** — Every executor model must start from the same base commit. The base commit hash must be recorded in each run's artifacts. No model may begin implementation from a different commit.
+* **Isolated branch per model** — Each executor model must work on its own isolated branch. No model may write to another model's branch. Branches must be created from the same base commit.
+* **No merging until comparison complete** — Benchmark implementation must not be merged into any shared branch until all compared model runs are complete and results have been recorded. Merging one model's implementation before all runs finish contaminates the comparison baseline.
+* **Invalid-run classification** — Any run that violates the same-packet, same-base-commit, isolated-branch, or no-merge-before-completion rules is classified as an invalid run. Invalid runs must not be included in model comparisons.
+* **Invalid-run artifact** — When a run is classified as invalid, an invalid-run artifact must be created at:
+
+```
+evals/model-eval-v1/<PACKET_ID>/<MODEL_ID>/invalid-run.md
+```
+
+This artifact must document the reason for invalidation.
+
+---
+
 ## Evaluation Directory Structure
 
 Evaluations are stored under `evals/`. The recommended structure for the first harness version is:
diff --git a/evals/model-eval-v1/README.md b/evals/model-eval-v1/README.md
index f104912..6e28308 100644
--- a/evals/model-eval-v1/README.md
+++ b/evals/model-eval-v1/README.md
@@ -34,3 +34,20 @@ This isolates run artifacts per model per packet, enabling fair and auditable co
 4. Run the audit prompt for each evaluation run using the same auditor model.
 5. Record measured variables for each run.
 6. Compare results across models.
+
+## Contamination Prevention
+
+The following rules must be followed to ensure fair model comparisons:
+
+* **Same packet** — Every executor model must execute the identical packet. No substitutions or modifications are permitted.
+* **Same base commit** — Every executor model must start from the same base commit. Record the base commit hash in each run's artifacts.
+* **Isolated branch per model** — Each executor model must work on its own isolated branch, created from the same base commit. No model may write to another model's branch.
+* **No merging until comparison complete** — Do not merge any benchmark implementation into a shared branch until all compared model runs are complete and results are recorded.
+* **Invalid-run classification** — Any run violating the same-packet, same-base-commit, isolated-branch, or no-merge rules is classified as invalid and must not be included in comparisons.
+* **Invalid-run artifact** — Invalid runs must produce an artifact at:
+
+```
+evals/model-eval-v1/<PACKET_ID>/<MODEL_ID>/invalid-run.md
+```
+
+This artifact must document the reason for invalidation.

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
