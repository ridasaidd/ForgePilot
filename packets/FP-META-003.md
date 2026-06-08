FP-META-003 — Auditor Prompt Baseline

Task

Create the first versioned auditor prompt for ForgePilot.

The purpose of this packet is to establish a measurable baseline prompt that can be reused across future audits and evaluated through ForgePilot metrics.

Goal

Create a documented auditor baseline prompt that defines expected auditor behavior.

This packet does not integrate the prompt into OpenCode, brokers, routing systems, model providers, automation, or runtime workflows.

The prompt is an experimental artifact only.

Requirements

Create:

prompts/auditor-baseline-v1.md

The prompt must define:

Role

What the auditor is responsible for.

Audit Rules

How audits must be performed.

Evidence Rules

How evidence must be evaluated.

Scope Discipline

Rules preventing auditor drift.

Failure Classification Rules

How root causes should be classified.

Final Output Contract

Required auditor output structure.

Required Behavioral Guidance

The prompt should instruct the auditor to:

* Audit against the packet only.
* Verify claims using provided evidence.
* Require evidence before acceptance.
* Distinguish blocking and non-blocking issues.
* Report observations without inventing requirements.
* Classify failures using the defined root-cause categories.

The prompt should instruct the auditor not to:

* Invent requirements.
* Reward extra work.
* Suggest architecture expansion.
* Audit against personal preferences.
* Accept work without evidence.

Required Root Cause Categories

The prompt must define:

ENVIRONMENT
PACKET
EXECUTOR
AUDITOR
HUMAN
NONE

and explain when each should be used.

Implementation Constraints

* Do not modify runtime behavior.
* Do not modify packet execution behavior.
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

test -f prompts/auditor-baseline-v1.md

Acceptance Criteria

* prompts/auditor-baseline-v1.md exists.
* Prompt is documented and versioned.
* Prompt includes all required sections.
* Root cause categories are documented.
* Existing tests pass.
* No runtime behavior changes.
* No routing logic.
* No broker logic.
* No model integrations.

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

runs/FP-META-003/executor-result.md
runs/FP-META-003/verification.txt
runs/FP-META-003/audit-prompt.md

using the existing FP-003 handoff workflow.
