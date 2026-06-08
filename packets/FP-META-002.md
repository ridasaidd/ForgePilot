FP-META-002 — Executor Prompt Baseline

Task

Create the first versioned executor prompt for ForgePilot.

The purpose of this packet is to establish a measurable baseline prompt that can be reused across future packet executions and evaluated through ForgePilot metrics.

Goal

Create a documented executor baseline prompt that defines expected executor behavior.

This packet does not integrate the prompt into OpenCode, brokers, routing systems, model providers, or automation.

The prompt is an experimental artifact only.

Requirements

Create:

prompts/executor-baseline-v1.md

The prompt must define:

Role

What the executor is responsible for.

Execution Rules

What work the executor should perform.

Verification Rules

How the executor should verify completion.

Artifact Rules

Required execution artifacts.

Scope Discipline

Rules preventing executor drift.

Final Output Contract

Required executor output structure.

Required Behavioral Guidance

The prompt should instruct the executor to:

* Follow packet requirements exactly.
* Avoid adding unrequested functionality.
* Avoid architecture expansion.
* Verify all acceptance criteria.
* Record evidence before declaring success.
* Generate required artifacts.
* Prefer small changes over broad refactors.

The prompt should instruct the executor not to:

* Invent requirements.
* Add features outside packet scope.
* Skip verification.
* Declare success without evidence.

Implementation Constraints

* Do not modify existing packet behavior.
* Do not modify runtime behavior.
* Do not add routing logic.
* Do not add model provider logic.
* Do not add broker integration.
* Do not add autonomous execution.
* Do not add workflow orchestration.

Verification Requirements

Run and record:

pnpm typecheck
pnpm test

Verify:

test -f prompts/executor-baseline-v1.md

Acceptance Criteria

* prompts/executor-baseline-v1.md exists.
* Prompt is documented and versioned.
* Prompt includes all required sections.
* Existing tests pass.
* No runtime behavior changes.
* No model integrations.
* No routing logic.
* No broker logic.

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

runs/FP-META-002/executor-result.md
runs/FP-META-002/verification.txt
runs/FP-META-002/audit-prompt.md

using the existing FP-003 handoff workflow.
