# Audit Prompt — FP-META-002

**Task:** FP-META-002

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

---

## Executor Result

# FP-META-002 Executor Result

## Status: SUCCESS

## Summary

Created `prompts/executor-baseline-v1.md` — a versioned executor baseline prompt that defines expected executor behavior for ForgePilot packet execution. The prompt includes all required sections: Role, Execution Rules, Verification Rules, Artifact Rules, Scope Discipline, Final Output Contract, and Behavioral Guidance. No code changes, no model integrations, no routing logic, no broker logic, no runtime behavior changes.

## Files Changed

- `prompts/executor-baseline-v1.md` — Created the versioned executor baseline prompt with all required sections and behavioral guidance.

## Acceptance Criteria Verification

- `prompts/executor-baseline-v1.md` exists — PASS
- Prompt is documented and versioned — PASS
- Prompt includes all required sections — PASS
- Existing tests pass — PASS (8/8)
- No runtime behavior changes — PASS
- No model integrations — PASS
- No routing logic — PASS
- No broker logic — PASS

## Design Decisions

- The prompt is a standalone Markdown artifact with no code dependencies.
- Version identifier `v1` is embedded in the filename and the document header.
- All six required sections are present with clear, actionable instructions.
- Behavioral guidance covers both affirmative and prohibitive instructions as specified.

---

## Verification Output

$ pnpm typecheck
> tsc --noEmit
(exit 0)

$ pnpm test
> node --experimental-test-module-mocks --import tsx --test tests/*.test.ts
  ForgePilot (1.790443ms) - 2 passed
  Database client (34.763597ms) - 2 passed
  Database migration (215.317105ms) - 4 passed
  tests 8, pass 8, fail 0
(exit 0)

$ test -f prompts/executor-baseline-v1.md && echo "PASS" || echo "FAIL"
PASS

---

## Git Status

On branch fp-meta-002-executor-baseline
Untracked files:
  (use "git add <file>..." to include in what will be committed)
	packets/FP-META-002.md
	prompts/executor-baseline-v1.md

nothing added to commit but untracked files present (use "git add" to track)

---

## Relevant Diff

(no changes to tracked files)

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

