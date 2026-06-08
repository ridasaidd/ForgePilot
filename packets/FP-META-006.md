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
