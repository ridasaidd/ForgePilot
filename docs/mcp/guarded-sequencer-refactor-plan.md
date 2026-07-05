# Guarded Sequencer Refactor and MCP Conformance Plan

## Status

This document governs ForgePilot MCP guarded sequencer work after completion of the inline registration extraction series.

The inline registration extraction series ended with:

- FP-MCP-361 — Extract final inline MCP registration block
- FP-MCP-361A — Runtime validation after final inline registration extraction

At that point:

- src/server.ts no longer owned inline MCP registration callback declarations.
- src/tool-registry/register-tools.ts no longer contained RegisterInlineTools callback plumbing.
- The MCP tool surface remained stable:
  - 78 registered tools
  - 11 ChatGPT-safe tools
  - 76 dev tools
  - 78 all-profile tools
- Runtime diagnostics confirmed the safe read-only non-execution boundary remained intact.

## Purpose

This plan defines the required order, constraints, and standards for future guarded sequencer work.

The immediate behavioral issue is the false-positive guarded sequencer next-gate behavior.

The purpose of this plan is to prevent that work from becoming an ad hoc fix and to require evidence-first diagnosis, MCP conformance review, and narrow implementation.

## Governing Principle

A next gate may be reported only if all prerequisite evidence for that exact tuple is present, current, unexpired, and positively valid.

Absence, mismatch, expiry, stale state, or fallback defaults must produce a blocked or needs-evidence state, not an actionable next gate.

## MCP and OpenAI Conformance Principle

Tool descriptors guide the model.

Runtime guards constrain the server.

Artifacts record what happened.

Contract checks prove that the visible surface did not drift.

Runtime diagnostics prove that the safe profile stayed safe.

Tool annotations and descriptions may inform ChatGPT, but they must never be the only enforcement layer.

Every mutating or execution-adjacent path must be blocked by server-side checks, exact tuple matching, explicit approval literals, expiry checks, and recorded evidence.

## Required Work Order

### Phase 1 — Plan Record

Record this plan before any sequencer diagnosis or fix.

Expected checkpoint:

- FP-MCP-362 — Guarded sequencer refactor and MCP conformance plan

### Phase 2 — Diagnostic Packet

Diagnose the false-positive guarded sequencer next-gate behavior before implementing a fix.

Expected checkpoint:

- FP-MCP-363 — Diagnose guarded sequencer false-positive next-gate behavior

The diagnostic must answer:

- What inputs did the sequencer receive?
- What artifacts did it read?
- What tuple did it derive?
- What evidence state did it derive?
- Which branch selected the reported next gate?
- Which condition should have blocked the reported next gate?
- Whether the bug is caused by:
  - evidence lookup
  - tuple matching
  - stale clearance or enablement artifacts
  - expiry handling
  - fallback defaults
  - broad truthiness checks
  - missing negative conditions
  - deprecated mode-switched behavior

### Phase 3 — Minimal Correction Packet

Only after the diagnostic evidence exists, implement the minimal correction.

Expected checkpoint:

- FP-MCP-364 — Correct guarded sequencer false-positive next-gate behavior

The correction must be limited to the identified failure path.

It must not introduce unrelated tool changes, profile changes, registration changes, or execution behavior.

### Phase 4 — Runtime Validation Packet

After the correction is committed, build and restart the MCP bridge, refresh Actions, and validate runtime diagnostics.

Expected checkpoint:

- FP-MCP-364A — Runtime validation after guarded sequencer correction

## Relevant Current Source Areas

The final extracted registration module localizes the ChatGPT-facing sequencer-adjacent tools:

- src/tool-groups/inline-after-diagnostics-tools.ts

Relevant tools include:

- forgepilot_apply_guarded_canary_next_gate
- forgepilot_get_guarded_canary_next_gate
- forgepilot_observe_next_gate
- forgepilot_preview_clearance_creation
- forgepilot_record_clearance_intent

The underlying behavior may live behind helper functions passed into that module, including:

- applyGuardedCanaryNextGate
- getGuardedCanaryNextGate
- observeNextGate
- previewClearanceCreation
- recordClearanceIntent
- validateScopedEnablementApproval

Future packets must inspect both:

1. extracted tool-group wiring
2. underlying guarded sequencer/helper implementation

## Required MCP Tool Standards

Every sequencer-related tool must be reviewed against these standards.

### Naming

- Tool names must be stable, specific, and action-accurate.
- Read-only tools must not sound mutating.
- Mutating tools must not sound like previews or observations.

### Description Accuracy

- Descriptions must state whether the tool is read-only or mutating.
- Descriptions must not imply safety that the handler does not enforce.
- Descriptions must mention important non-side-effect guarantees when relevant:
  - no OpenCode start
  - no runner start contact
  - no approval consumption
  - no disable-switch clearing
  - no canary run

### Input Schema

- Required fields must be required.
- Optional fields must be optional only when fallback behavior is safe and explicit.
- Approval literals must be exact and narrow.
- Tuple-identifying fields must not be silently broadened.
- Defaults must not create an actionable next gate.

### Output Schema

- Structured output must match declared output schema.
- Read-only tools must report boundary fields truthfully.
- Blocked states must be explicit and machine-readable.
- Missing evidence must not be represented as success.
- Derived state must include enough reason codes to audit branch selection.

### Annotations

- Read-only annotations must match actual server behavior.
- Mutating or execution-adjacent tools must not be mislabeled as read-only.
- Annotations are hints only; server-side checks remain mandatory.

### Runtime Enforcement

- Server-side checks must enforce all gates.
- Exact tuple matching is required.
- Expiry checks are required for local clearance and enablement artifacts.
- Stale artifacts must not satisfy current prerequisites.
- Approval usability and approval consumption state must be checked where relevant.
- Fallback defaults must fail closed.

### Surface Profiles

- ChatGPT-safe default profile must remain narrow.
- No dev/all tool may leak into ChatGPT-safe profile.
- Contract counts must remain stable unless a packet explicitly authorizes a surface change.
- Deprecated mode-switched tools must not become the preferred ChatGPT-facing path.

## Anti-False-Positive Rules

The sequencer must not report an actionable next gate when:

- required request evidence is missing
- required approval evidence is missing
- approval evidence is invalid
- approval evidence is already consumed when consumption would matter
- clearance artifact is missing
- clearance artifact is expired
- clearance artifact tuple does not exactly match current inputs
- enablement artifact is missing
- enablement artifact is expired
- enablement artifact tuple does not exactly match current inputs
- runner capability evidence is missing or stale
- target execution commit does not match
- execution base commit does not match
- branch does not match
- model id does not match
- run mode does not match
- workspace id does not match
- default/fallback values would be required to advance

In those cases, the sequencer must return a blocked, needs-evidence, or no-action state with explicit reason codes.

## Required Checks for Sequencer Fix Packets

Every future sequencer implementation packet must run these checks:

- node scripts/check-tool-contracts.mjs
- node ./node_modules/typescript/bin/tsc --noEmit
- node scripts/check-hardcoded-packet-ids.mjs
- git diff --check
- grep -R "registerTool(" -n src/server.ts src/**/*.ts 2>/dev/null | wc -l

Expected preserved counts unless a packet explicitly authorizes a surface change:

- registeredToolCount: 78
- contractCount: 78
- defaultVisibleCount: 11
- chatgptSafeVisibleCount: 11
- devVisibleCount: 76
- allVisibleCount: 78
- duplicateRegisteredTools: []
- duplicateContracts: []
- missingContracts: []
- extraContracts: []

## Required Evidence for Diagnostic Packet

The diagnostic packet must produce an artifact that includes:

- exact bridge commit inspected
- exact files inspected
- exact tools inspected
- exact helper functions inspected
- minimal reproduction or state reconstruction
- observed false-positive next gate
- expected blocked state
- derived state fields
- reason codes
- branch condition responsible
- proposed minimal correction
- MCP/OpenAI conformance observations
- explicit statement that no fix was implemented unless separately authorized

## Required Evidence for Fix Packet

The fix packet must include:

- diagnosis checkpoint referenced
- exact failure path corrected
- exact files changed
- tests or deterministic checks added if feasible
- before/after behavior statement
- preserved tool surface counts
- preserved safe profile
- preserved approval literals unless explicitly justified
- preserved output schemas unless explicitly justified
- non-execution boundary statement

## Non-Execution Boundary

Unless a packet explicitly authorizes otherwise, sequencer work must not:

- start OpenCode
- contact the runner start endpoint
- consume execution approval
- clear a disable switch
- run FP-027 canary
- broaden ChatGPT-safe profile
- introduce new execution capability
- change default surface behavior
- change invalid-profile fallback behavior

## Completion Criteria

This plan is satisfied when:

1. The false-positive next-gate behavior is diagnosed with branch-level evidence.
2. The minimal correction is implemented.
3. Runtime validation confirms safe boundary preservation.
4. Sequencer tools conform to the stated MCP/OpenAI tool standards.
5. Future sequencer packets reference this plan as the governing standard.
