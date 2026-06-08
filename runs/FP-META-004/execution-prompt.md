# Execution Prompt — FP-META-004

## Target Packet

packets/FP-META-004.md

## Packet Content

FP-META-004 — Execution Prompt Generator

Task

Create a generator that produces a standardized execution prompt for a ForgePilot packet.

The purpose of this packet is to eliminate manual construction of executor prompts and ensure all executions begin from a consistent prompt structure.

Goal

Generate:

runs/<PACKET_ID>/execution-prompt.md

using:

prompts/executor-baseline-v1.md

and packet metadata.

This packet does not invoke models, perform execution, perform auditing, or automate workflow orchestration.

Requirements

Create a command:

pnpm fp -- build-execution-prompt <PACKET_ID>

The command must generate:

runs/<PACKET_ID>/execution-prompt.md

The generated prompt must contain:

1. Reference to the target packet.
2. Execution instructions.
3. Artifact requirements.
4. FP-003 handoff requirements.
5. Stop-after-completion instructions.

The generated prompt must be fully populated and contain no unresolved placeholders.

Generated Prompt Requirements

The generated prompt must instruct the executor to:

* Read the packet.
* Follow the packet exactly.
* Avoid scope expansion.
* Verify all acceptance criteria.
* Generate required run artifacts.
* Use the FP-003 handoff workflow.
* Stop after completion.

The generated prompt must instruct the executor not to:

* Perform audits.
* Create additional packets.
* Modify unrelated files.
* Expand scope.

Implementation Constraints

* Preserve existing behavior.
* Do not modify runtime workflow behavior.
* Do not add model provider logic.
* Do not add routing logic.
* Do not add broker integration.
* Do not add autonomous execution.
* Do not add workflow orchestration.

Verification Requirements

Run and record:

pnpm typecheck
pnpm test

Verify:

pnpm fp -- build-execution-prompt FP-META-004
test -f runs/FP-META-004/execution-prompt.md
grep -q "{{" runs/FP-META-004/execution-prompt.md && echo FAIL || echo PASS

Acceptance Criteria

* Command exists.
* execution-prompt.md is generated.
* Generated prompt contains packet reference.
* Generated prompt contains artifact requirements.
* Generated prompt contains stop instructions.
* Generated prompt contains no unresolved placeholders.
* Existing tests pass.
* No routing logic.
* No broker integration.
* No model integrations.

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

runs/FP-META-004/executor-result.md
runs/FP-META-004/verification.txt
runs/FP-META-004/audit-prompt.md

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