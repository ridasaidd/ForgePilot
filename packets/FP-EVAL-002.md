# FP-EVAL-002 — Packet Metrics Summary CLI Command

## Task

Add a read-only CLI command that prints a summary of packet execution metrics stored in SQLite.

## Goal

Create a benchmark that requires interaction with the existing SQLite layer while remaining small, deterministic, and easy to audit.

This benchmark is intended to be more difficult than FP-EVAL-001 because it requires the executor to understand and reuse the existing database layer without modifying schema or migrations.

## Requirements

Add a CLI command:

pnpm fp -- packet-metrics

The command must print:

- Total packets
- Successful packets
- Failed packets

Exact formatting is not required.

The output must contain those three labels.

If no packet records exist in SQLite, the command must still succeed and print zero counts.

## Allowed Files

The executor may modify only:

- src/cli/forgepilot.ts
- src/db/*.ts
- tests/*.test.ts

The executor may create run artifacts under:

- runs/FP-EVAL-002/

## Implementation Constraints

- Read-only command only.
- Use or extend the existing SQLite/database access layer.
- Do not modify database schema.
- Do not create migrations.
- Do not modify existing packet records.
- Do not add routing logic.
- Do not add broker integration.
- Do not add model provider logic.
- Do not add autonomous execution.
- Do not add workflow orchestration.

## Verification Requirements

Run and record:

pnpm typecheck
pnpm test
pnpm fp -- init-db
pnpm fp -- packet-metrics

Verify output contains:

- Total packets
- Successful packets
- Failed packets

## Acceptance Criteria

- pnpm fp -- packet-metrics works.
- Output includes Total packets.
- Output includes Successful packets.
- Output includes Failed packets.
- Command succeeds even when no packet records exist.
- Existing tests pass.
- Only allowed source/test files are changed.
- No schema changes.
- No migrations added.
- No routing logic added.
- No broker integration added.
- No model provider logic added.
- No workflow orchestration added.

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

runs/FP-EVAL-002/executor-result.md
runs/FP-EVAL-002/verification.txt
runs/FP-EVAL-002/audit-prompt.md

using the existing FP-003 handoff workflow.
