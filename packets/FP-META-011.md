FP-META-011 — Comparison Outcome Standards

Task

Extend the model evaluation harness documentation to define the allowed values, ownership, and recording rules for comparison_outcome in metrics.json.

Goal

Ensure model comparison results are recorded consistently across benchmark packets and can later be aggregated, analyzed, stored in SQLite, and consumed by routing logic.

This packet defines comparison outcome standards only.

It does not add automation, CLI commands, SQLite storage, aggregation logic, routing logic, runtime behavior, or workflow orchestration.

Requirements

Update:

* docs/model-evaluation-harness.md
* evals/model-eval-v1/README.md
* prompts/model-eval-run-v1.md

Document that comparison_outcome may contain only the following values:

WINNER
RUNNER_UP
TIE
INVALID

Outcome Definitions

WINNER

Assigned to the model selected as the strongest implementation for a benchmark packet.

RUNNER_UP

Assigned to a valid implementation that was not selected as the winner.

TIE

Assigned when multiple implementations are judged equivalent and no winner is selected.

INVALID

Assigned when a run is excluded from comparison due to failure, corruption, missing artifacts, audit rejection, or inability to complete evaluation.

Ownership

Document that:

* Executors never populate comparison_outcome.
* Auditors never populate comparison_outcome.
* The comparison phase is solely responsible for populating comparison_outcome.

Recording Rules

Document:

* Exactly one winner may exist per benchmark unless a tie is declared.
* Multiple models may receive TIE.
* Multiple models may receive RUNNER_UP.
* INVALID runs are excluded from winner selection.
* comparison_outcome remains null until comparison completion.

Metrics Update Rules

Document:

* The comparison phase updates the existing metrics.json artifact in place.
* The comparison result must be written to:
    * runs/<PACKET_ID>/metrics.json
    * evals/model-eval-v1/<PACKET_ID>/<MODEL_NAME>/metrics.json
* Comparison outcomes must not be inferred from branch names, packet names, or model names.
* Comparison outcomes must be determined from documented comparison results.

Implementation Constraints

* Documentation only.
* Do not modify runtime behavior.
* Do not modify CLI behavior.
* Do not add SQLite storage.
* Do not add aggregation logic.
* Do not add routing logic.
* Do not add broker integration.
* Do not add autonomous execution.
* Do not add workflow orchestration.

Verification Requirements

Run and record:

pnpm typecheck
pnpm test

Verify:

test -f docs/model-evaluation-harness.md
test -f evals/model-eval-v1/README.md
test -f prompts/model-eval-run-v1.md

Acceptance Criteria

* Allowed comparison outcome values are documented.
* Outcome definitions are documented.
* Comparison ownership is documented.
* Recording rules are documented.
* Metrics update rules are documented.
* Existing tests pass.
* No runtime behavior changes.

Executor Final Instructions

After implementation and verification, output only:

STATUS: SUCCESS | FAILED

FILES_CHANGED:

* file

VERIFICATION_COMMANDS_RUN:

* command => result

VERIFICATION_RESULTS:

* item => PASS | FAIL

RESULT:
Short summary.

NOTES:
Short notes only if needed.

Then generate:

* runs/FP-META-011/executor-result.md
* runs/FP-META-011/verification.txt
* runs/FP-META-011/audit-prompt.md
* runs/FP-META-011/metrics.json

using the existing FP-003 handoff workflow.
