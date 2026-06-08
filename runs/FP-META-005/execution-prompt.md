# Execution Prompt — FP-META-005

## Target Packet

packets/FP-META-005.md

## Packet Content

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