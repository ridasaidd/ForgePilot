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

- runs/FP-META-012/executor-result.md
- runs/FP-META-012/verification.txt
- runs/FP-META-012/audit-prompt.md
- runs/FP-META-012/metrics.json

using the existing FP-003 handoff workflow.
