FP-META-008 — Evaluation Metrics Artifact Specification

Task

Extend the model evaluation harness documentation to require a structured metrics artifact for every evaluation run.

Goal

Prevent loss of evaluation data by requiring every executor run to produce a standardized metrics artifact that can later be aggregated and analyzed.

This packet defines the artifact format and recording procedure only.

It does not add automation, CLI commands, SQLite storage, aggregation logic, or runtime behavior.

Requirements

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

Implementation Constraints

* Documentation only.
* Do not modify runtime behavior.
* Do not modify CLI behavior.
* Do not add SQLite storage.
* Do not add aggregation logic.
* Do not add model routing.
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

* metrics.json artifact is documented.
* Required fields are documented exactly as specified.
* Null handling is documented.
* Per-model-run ownership is documented.
* Post-comparison outcome recording is documented.
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

* runs/FP-META-008/executor-result.md
* runs/FP-META-008/verification.txt
* runs/FP-META-008/audit-prompt.md

using the existing FP-003 handoff workflow.
