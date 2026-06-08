# Audit Prompt — FP-META-003

**Task:** FP-META-003

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

---

## Executor Result

# FP-META-003 Executor Result

## Status: SUCCESS

## Summary

Created `prompts/auditor-baseline-v1.md` — a versioned auditor baseline prompt that defines expected auditor behavior for ForgePilot packet audits. The prompt includes all required sections: Role, Audit Rules, Evidence Rules, Scope Discipline, Failure Classification Rules (with all six root cause categories: ENVIRONMENT, PACKET, EXECUTOR, AUDITOR, HUMAN, NONE), Final Output Contract, and Behavioral Guidance. No code changes, no model integrations, no routing logic, no broker logic, no runtime behavior changes.

## Files Changed

- `prompts/auditor-baseline-v1.md` — Created the versioned auditor baseline prompt with all required sections, root cause categories, output contract, and behavioral guidance.

## Acceptance Criteria Verification

- `prompts/auditor-baseline-v1.md` exists — PASS
- Prompt is documented and versioned — PASS
- Prompt includes all required sections — PASS
- Root cause categories are documented — PASS (ENVIRONMENT, PACKET, EXECUTOR, AUDITOR, HUMAN, NONE)
- Existing tests pass — PASS (8/8)
- No runtime behavior changes — PASS
- No routing logic — PASS
- No broker logic — PASS
- No model integrations — PASS

---

## Verification Output

$ pnpm typecheck

> forgepilot@0.1.0 typecheck /home/ridasaidd/forgepilot
> tsc --noEmit

(no output — passed)

$ pnpm test

> forgepilot@0.1.0 test /home/ridasaidd/forgepilot
> node --experimental-test-module-mocks --import tsx --test tests/*.test.ts

▶ ForgePilot
  ✔ should have a working test harness (0.686747ms)
  ✔ should confirm environment-centric architecture principle (0.176928ms)
✔ ForgePilot (1.639423ms)
▶ Database client
  ✔ should initialize the database and create the data directory (31.971ms)
  ✔ should throw when getDb is called before initDb (0.772859ms)
✔ Database client (33.049714ms)
▶ Database migration
  ✔ should create the events table via migration (39.118807ms)
  ✔ should be idempotent (running migrate twice does not fail) (54.224485ms)
  ✔ should create all required core schema tables (52.158392ms)
  ✔ should have correct foreign keys on core schema tables (52.569025ms)
✔ Database migration (198.654566ms)
ℹ tests 8
ℹ suites 3
ℹ pass 8
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 551.040576

$ test -f prompts/auditor-baseline-v1.md
=> EXISTS

---

## Git Status

On branch fp-meta-003-auditor-baseline
Untracked files:
  (use "git add <file>..." to include in what will be committed)
	packets/FP-META-003.md
	prompts/auditor-baseline-v1.md
	runs/FP-META-003/

nothing added to commit but untracked files present (use "git add" to track)

---

## Relevant Diff



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

