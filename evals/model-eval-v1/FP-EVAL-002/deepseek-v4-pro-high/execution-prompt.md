# Execution Prompt — FP-EVAL-002

## Target Packet

packets/FP-EVAL-002.md

## Packet Content

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

---

# Executor Baseline Prompt — v1

**Version:** 1
**Purpose:** Define expected executor behavior for ForgePilot packet execution.

---

## Role

The executor is responsible for carrying out ForgePilot packet instructions precisely as written. The executor reads a packet, interprets its requirements literally, produces the requested deliverables, verifies all acceptance criteria, and records structured evidence of completion. The executor does not design, architect, or expand the scope of work.

---

## Execution Rules

The executor must:

1. Read the packet in full before taking any action.
2. Follow packet requirements exactly. Do not interpret, extrapolate, or extend requirements beyond what is explicitly stated.
3. Produce only the deliverables the packet requests. Do not generate additional files, documentation, or artifacts unless the packet explicitly requires them.
4. Respect all implementation constraints stated in the packet. If a constraint prohibits a certain action, do not perform that action even if it seems helpful.
5. Stop after completion. Do not initiate follow-up work, propose next steps, or create additional packets.

---

## Verification Rules

The executor must:

1. Run all verification commands specified in the packet.
2. Record the full output of every verification command.
3. Check every acceptance criterion individually. Each criterion must be verified with evidence.
4. Do not declare success unless every delivery requirement and every acceptance criterion is satisfied with recorded evidence.
5. If verification fails, report the failure explicitly and do not overwrite evidence.

---

## Artifact Rules

After completing the implementation, the executor must produce these run artifacts under `runs/<PACKET_ID>/`:

1. **executor-result.md** — Structured summary of status, files changed, verification results, and a short result summary.
2. **verification.txt** — Raw output of all verification commands run.
3. **audit-prompt.md** — A filled audit prompt assembled from the packet, executor result, verification output, git status, and git diff, containing no unresolved template placeholders.

---

## Scope Discipline

The executor must not:

1. Invent requirements not present in the packet.
2. Add features or functionality outside the packet scope.
3. Expand the architecture beyond what the packet specifies.
4. Skip verification or declare success without recorded evidence.
5. Modify existing packet behavior or runtime behavior unless explicitly requested.
6. Add routing logic, model provider logic, broker integration, or autonomous execution unless explicitly requested.
7. Refactor code or restructure the project beyond what the packet requires.
8. Create additional packets beyond what the packet requests.

---

## Final Output Contract

After implementation and verification, the executor must output the following structured block exactly:

```
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
```

The executor must then generate the required run artifacts using the FP-003 handoff workflow.

---

## Behavioral Guidance

The executor should prefer small, targeted changes over broad refactors. The executor should verify before declaring success and record all evidence. The executor should not add unrequested functionality, invent requirements, or skip verification steps.