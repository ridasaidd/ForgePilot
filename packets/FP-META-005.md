FP-META-005 — Model Evaluation Harness

Task

Create the first ForgePilot model evaluation harness.

The purpose of this packet is to establish a standardized process for comparing executor models using identical tasks, prompts, verification procedures, and auditing criteria.

This packet defines the evaluation methodology only.

It does not automate model execution, model routing, escalation, broker integration, or workflow orchestration.

Goal

Create a reusable evaluation framework that allows ForgePilot to compare executor models fairly and consistently.

The framework should define:

* What variables are controlled.
* What variables are measured.
* How evaluation runs are recorded.
* How results are compared.

Requirements

Create:

docs/model-evaluation-harness.md
prompts/model-eval-run-v1.md
evals/model-eval-v1/README.md

Harness Requirements

The documentation must define:

Controlled Variables

At minimum:

* Packet
* Executor baseline prompt version
* Auditor baseline prompt version
* Auditor model
* Verification procedure

Measured Variables

At minimum:

* Audit result
* First-pass success
* Fix attempts
* Escalation occurrence
* Root cause classification
* Human intervention
* Notes

Evaluation Rules

The harness must state:

* Models must be evaluated against the same packet.
* Audits should use the same auditor model.
* Prompt versions must be recorded.
* Results must be recorded in metrics.
* Evaluations must preserve run artifacts.

Evaluation Directory Structure

Document a recommended structure for:

evals/
  model-eval-v1/

including per-model run storage.

Prompt Requirements

Create a reusable evaluation-run prompt that instructs an executor model to:

* Execute a benchmark packet.
* Follow EXECUTOR_BASELINE_V1.
* Generate required run artifacts.
* Stop after completion.

Implementation Constraints

* Do not add model routing.
* Do not add broker integration.
* Do not add autonomous execution.
* Do not add workflow orchestration.
* Do not add model selection logic.
* Do not modify existing runtime behavior.

Verification Requirements

Run and record:

pnpm typecheck
pnpm test

Verify:

test -f docs/model-evaluation-harness.md
test -f prompts/model-eval-run-v1.md
test -f evals/model-eval-v1/README.md

Acceptance Criteria

* All required files exist.
* Controlled variables are documented.
* Measured variables are documented.
* Evaluation rules are documented.
* Evaluation directory structure is documented.
* Evaluation prompt exists.
* Existing tests pass.
* No routing logic added.
* No broker integration added.
* No model automation added.

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

runs/FP-META-005/executor-result.md
runs/FP-META-005/verification.txt
runs/FP-META-005/audit-prompt.md

using the existing FP-003 handoff workflow.
