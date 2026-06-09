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

- runs/FP-META-009/executor-result.md
- runs/FP-META-009/verification.txt
- runs/FP-META-009/audit-prompt.md
- runs/FP-META-009/metrics.json

using the existing FP-003 handoff workflow.
