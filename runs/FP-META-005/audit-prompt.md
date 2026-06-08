# Audit Prompt — FP-META-005

**Task:** FP-META-005 — Model Evaluation Harness

---

## Instructions

You are an auditor. Your sole responsibility is to verify that the executor's
output satisfies the original packet as written.

### Rules

1. **Audit against the original packet only.** Do not evaluate work that was not
   requested. Do not audit against imagined requirements.

2. **Do not reward extra work.** Work beyond the packet scope is not relevant to
   the audit. Extra work does not compensate for missed requirements.

3. **Do not suggest architecture expansion.** Do not propose new features,
   refactors, or design changes beyond what the packet specifies.

4. **Do not accept partial completion unless explicitly allowed.** If the packet
   does not state that partial completion is acceptable, all deliverables must
   be satisfied. Partial completion is a FAIL.

5. **Return the structured output below.** Do not add commentary, summaries, or
   explanations outside the required fields.

---

## Original Packet

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

## Executor Result

STATUS: SUCCESS

FILES_CHANGED:

* docs/model-evaluation-harness.md
* prompts/model-eval-run-v1.md
* evals/model-eval-v1/README.md

VERIFICATION_COMMANDS_RUN:

* pnpm typecheck => PASS (exit 0)
* pnpm test => PASS (8/8 tests pass)
* test -f docs/model-evaluation-harness.md => PASS
* test -f prompts/model-eval-run-v1.md => PASS
* test -f evals/model-eval-v1/README.md => PASS

VERIFICATION_RESULTS:

* All required files exist => PASS
* Controlled variables are documented => PASS
* Measured variables are documented => PASS
* Evaluation rules are documented => PASS
* Evaluation directory structure is documented => PASS
* Evaluation prompt exists => PASS
* Existing tests pass => PASS (8/8)
* No routing logic added => PASS
* No broker integration added => PASS
* No model automation added => PASS

RESULT:
Created three files: docs/model-evaluation-harness.md defines controlled/measured variables, evaluation rules, and directory structure; prompts/model-eval-run-v1.md provides a standardized evaluation-run prompt instructing executors to follow EXECUTOR_BASELINE_V1; evals/model-eval-v1/README.md documents the per-model run storage structure. All files are markdown only — no code changes, no routing, no broker, no automation.

NOTES:
None.

---

## Verification Output

$ pnpm typecheck

> forgepilot@0.1.0 typecheck /home/ridasaidd/forgepilot
> tsc --noEmit

(exit 0)

$ pnpm test

> forgepilot@0.1.0 test /home/ridasaidd/forgepilot
> node --experimental-test-module-mocks --import tsx --test tests/*.test.ts

▶ ForgePilot
  ✔ should have a working test harness (0.880415ms)
  ✔ should confirm environment-centric architecture principle (0.322707ms)
✔ ForgePilot (2.532505ms)
▶ Database client
  ✔ should initialize the database and create the data directory (37.548629ms)
  ✔ should throw when getDb is called before initDb (5.787313ms)
✔ Database client (43.94417ms)
▶ Database migration
  ✔ should create the events table via migration (39.852724ms)
  ✔ should be idempotent (running migrate twice does not fail) (68.266656ms)
  ✔ should create all required core schema tables (67.875319ms)
  ✔ should have correct foreign keys on core schema tables (55.147849ms)
✔ Database migration (232.325262ms)
ℹ tests 8
ℹ suites 3
ℹ pass 8
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 776.728753

(exit 0)

$ test -f docs/model-evaluation-harness.md && echo FILE_EXISTS: PASS || echo FILE_EXISTS: FAIL

FILE_EXISTS: PASS

(exit 0)

$ test -f prompts/model-eval-run-v1.md && echo FILE_EXISTS: PASS || echo FILE_EXISTS: FAIL

FILE_EXISTS: PASS

(exit 0)

$ test -f evals/model-eval-v1/README.md && echo FILE_EXISTS: PASS || echo FILE_EXISTS: FAIL

FILE_EXISTS: PASS

(exit 0)

---

## Git Status

On branch fp-meta-005-model-evaluation-harness
Untracked files:
  (use "git add <file>..." to include in what will be committed)
	docs/model-evaluation-harness.md
	evals/
	packets/FP-META-005.md
	prompts/model-eval-run-v1.md
	runs/FP-META-005/

nothing added to commit but untracked files present (use "git add" to track)

---

## Relevant Diff

(no tracked files were modified — all changes are new files)

---

## Required Output

Return exactly:


AUDIT_STATUS: ACCEPTED | REJECTED | NEEDS_FRONTIER_REVIEW

BLOCKING_ISSUES:

NON_BLOCKING_NOTES:

ROOT_CAUSE_LEVEL:
ENVIRONMENT | PACKET | EXECUTOR | AUDITOR | HUMAN | NONE

ROOT_CAUSE_REASON:

REQUIRED_FIX_PACKET:
