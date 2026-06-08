FP-EVAL-001 — Prompt Baselines CLI Command

Task

Add a small read-only CLI command that prints the ForgePilot project name and available prompt baseline files.

Goal

Create a simple, low-risk, code-based benchmark task for the first model evaluation run.

This packet is intentionally small so executor behavior can be compared across models using the same packet, same baseline prompts, same verification commands, and same auditor.

Requirements

Add a CLI command:

pnpm fp -- prompt-baselines

The command must print output containing:

ForgePilot
Executor Baseline: prompts/executor-baseline-v1.md
Auditor Baseline: prompts/auditor-baseline-v1.md

Exact extra formatting is allowed, but those three strings must appear.

Allowed Files

The executor may modify only:

src/cli/forgepilot.ts
tests/smoke.test.ts

The executor may create run artifacts under:

runs/FP-EVAL-001/

Implementation Constraints

* Read-only command only.
* Do not modify prompt baseline files.
* Do not modify database schema or migrations.
* Do not add routing logic.
* Do not add broker integration.
* Do not add model provider logic.
* Do not add autonomous execution.
* Do not add workflow orchestration.
* Do not create additional packets.

Verification Requirements

Run and record:

pnpm typecheck
pnpm test
pnpm fp -- prompt-baselines

Verify command output includes:

ForgePilot
Executor Baseline: prompts/executor-baseline-v1.md
Auditor Baseline: prompts/auditor-baseline-v1.md

Acceptance Criteria

* pnpm fp -- prompt-baselines works.
* Output includes ForgePilot.
* Output includes Executor Baseline: prompts/executor-baseline-v1.md.
* Output includes Auditor Baseline: prompts/auditor-baseline-v1.md.
* Existing tests pass.
* Only allowed source/test files are changed.
* No routing logic added.
* No broker integration added.
* No model provider logic added.
* No workflow orchestration added.

Executor Final Instructions

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

runs/FP-EVAL-001/executor-result.md
runs/FP-EVAL-001/verification.txt
runs/FP-EVAL-001/audit-prompt.md

using the existing FP-003 handoff workflow.
