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

- runs/FP-META-010/executor-result.md
- runs/FP-META-010/verification.txt
- runs/FP-META-010/audit-prompt.md
- runs/FP-META-010/metrics.json

using the existing FP-003 handoff workflow.
