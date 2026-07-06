# FP-MCP-369 — Auditor Reconciliation Report

## Purpose

This report exists to answer the auditor's gap questions before FP-MCP-365 through FP-MCP-368 are evaluated on their own merits.

The auditor requested:

1. Full accounting for the gap between FP-MCP-297 and FP-MCP-365.
2. Explicit FP-027 canary status.
3. Explanation of what the guarded sequencer is and when it was introduced.
4. Evidence ledger reconciliation from evidence_id 175 to current.
5. Safety-relevant summary before continuing with bubblewrap/sandbox work.

## Current Classification

The reconciliation diagnostic supports this provisional classification:

    A. The available packet/run ledger supports the claim that FP-027 did not run during FP-MCP-297 through FP-MCP-368.

This report should still be reviewed against the source artifacts listed below.

## Source Artifacts

Primary raw diagnostic:

- runs/FP-MCP-369/ledger-gap-diagnostic.raw.md

Derived reconciliation artifacts:

- runs/FP-MCP-369/ledger-gap-reconciliation-summary.md
- runs/FP-MCP-369/packet-boundary-index.tsv
- runs/FP-MCP-369/evidence-id-reconciliation.tsv
- runs/FP-MCP-369/sequencer-introduction-search.md

## Direct Answer: Did FP-027 Run?

Based on the packet/run ledger discovered by FP-MCP-369:

    FP-027 did not run.

The ledger repeatedly records:

- runner start endpoint contacted: false
- OpenCode started: false
- approval consumed: false
- disable switch cleared: false
- FP-027 canary run: false

The current live MCP runtime separately reported:

- fp027CanaryRun: false
- runnerStartEndpointContacted: false
- opencodeStarted: false
- approvalConsumed: false
- disableSwitchCleared: false

## Most Important Safety-Relevant Sequence

### FP-MCP-297

Pre-start evidence sequencing hold.

Status:

- FP-027 did not run.
- Runner start endpoint was not contacted.
- OpenCode was not started.
- Approval was not consumed.
- Disable switch was not cleared.

### FP-MCP-298

FP-027 canary sequence guard.

Purpose:

- Turned FP-027 canary order into explicit mechanical sequencing guard.
- State snapshot recording forbidden until approved pre-start evidence exists and validates.

Status:

- Non-executing guard artifact.
- FP-027 did not run.

### FP-MCP-299

FP-027 pre-start and snapshot evidence result.

Purpose:

- Recorded and validated approved pre-start evidence.
- Recorded and validated state snapshot evidence.
- Stopped because approval window was near expiry.

Status:

- FP-027 did not run.
- Runner start endpoint was not contacted.
- OpenCode was not started.

### FP-MCP-300

Fresh scoped canary approval renewal.

Purpose:

- Renewed fresh scoped approval for FP-MCP-295 request tuple.
- Next legal gate was clearance preview/review, not runner start.

Status:

- FP-027 did not run.
- Approval was not consumed.
- Runner start endpoint was not contacted.

### FP-MCP-301

Operator-local clearance preview result.

Purpose:

- Advanced only through clearance preview/review.
- Did not create clearance.

Status:

- FP-027 did not run.
- Runner start endpoint was not contacted.

### FP-MCP-303

Guarded canary blocked at execution enablement.

Purpose:

- Fresh approval and local clearance path advanced.
- Aggregate orientation blocked on GLOBAL_DISABLE_ACTIVE, RUNNER_EXECUTION_DISABLED, and OPENCODE_EXECUTION_DISABLED.

Status:

- Blocked before runner start.
- FP-027 did not run.

### FP-MCP-304

Scoped execution enablement gate design.

Purpose:

- Designed missing scoped enablement gate between local clearance and guarded runner start.
- Explicitly did not create a standing global unlock.

Status:

- Design-only.
- FP-027 did not run.

### FP-MCP-305 / 306

Scoped enablement tool implementation and negative checks.

Purpose:

- Implemented and checked scoped enablement tooling.
- Did not attempt guarded canary run.

Status:

- FP-027 did not run.
- Runner start endpoint was not contacted.

### FP-MCP-307

Fresh positive path fail-closed hold.

Purpose:

- Fresh approval and valid local clearance were created.
- Operator selected adjacent clearance-preview tool instead of scoped enablement preview.
- Stopped under expiry/tool-selection drift.

Status:

- Fail-closed hold.
- FP-027 did not run.

### FP-MCP-308

Gate Sequencer Implementation.

Purpose:

- Introduced the gate sequencer implementation.
- Implemented `src/guarded-canary-gate-sequencer.ts`.
- Registered `forgepilot_get_guarded_canary_next_gate`.

Status:

- Sequencer introduction point in this reconciled range.
- No FP-027 canary run.

### FP-MCP-309

Sequencer first read.

Purpose:

- First read of sequencer behavior.

Status:

- No FP-027 canary run.

### FP-MCP-312

Sequencer-enforced gate executor V1.

Purpose:

- Added `src/guarded-canary-gate-executor.ts`.
- Registered `forgepilot_apply_guarded_canary_next_gate`.
- V1 supported clearance preview/create only.
- Scoped enablement and runner start were not supported.

Status:

- No live canary attempted.
- No runner start contact.

### FP-MCP-314

Canary action surface narrowing.

Purpose:

- Hid adjacent manual guarded canary tools by default.
- Kept enforced executor registered.

Status:

- No canary run.

### FP-MCP-315

Guarded canary V1 clearance gate checkpoint.

Purpose:

- Live narrowed MCP surface used guarded executor.
- Executor performed V1 clearance preview/create gate.

Status:

- Stopped before enablement or runner start.
- FP-027 did not run.

### FP-MCP-316

Guarded canary scoped enablement executor implementation.

Purpose:

- Extended executor to support scoped enablement preview/create.
- Explicitly preserved stop-before-runner-start boundary.

Status:

- No runner start path, approval consumption, OpenCode start, or canary execution path added.

### FP-MCP-317

FP-MCP-316 functional test result.

Purpose:

- Live executor advanced through approval, clearance, runner capability observation, and scoped execution enablement creation.

Status:

- Stopped before runner start.
- Runner capability observation did not contact runner start endpoint.
- FP-027 did not run.

### FP-MCP-318

Guarded runner start executor implementation result.

Purpose:

- Implemented final runner-start attempt stage through existing startRemoteRunnerRequest contract.
- Preserved narrowed guarded surface.

Status:

- Implementation only.
- No runner start endpoint contacted during implementation.
- FP-027 did not run.

### FP-MCP-319

Guarded runner start final test platform block.

Purpose:

- Prepared the FP-MCP-295 canary tuple through approval, clearance, capability observation, and scoped enablement.
- Read-only sequencer confirmed final next gate.
- Attempted guarded runner-start executor call was blocked by OpenAI platform safety layer before MCP execution.

Status:

- No evidence of runner start endpoint contact.
- No runner start endpoint was contacted by ForgePilot.
- OpenCode was not started.
- FP-027 did not run.

This is the strongest answer to the auditor's main question:

    The project reached the final runner-start boundary, but the attempted call was blocked before MCP execution. Therefore FP-027 still did not run.

### FP-MCP-321 / 322 / 323 / 324

Local operator handoff and local client preparation.

Purpose:

- Moved toward local/operator tooling after ChatGPT-hosted platform block.

Status:

- No runner start contact recorded.
- No OpenCode start recorded.
- FP-027 did not run.

### FP-MCP-325 through FP-MCP-330

Fresh-session host boundary characterization.

Purpose:

- Characterized ChatGPT tool boundary and host/platform behavior after prior block.

Status:

- No runner start endpoint contact.
- No OpenCode start.
- FP-027 did not run.

### FP-MCP-332 through FP-MCP-344

Fresh approvals, wrapper probes, expired approval probes, follow-on contract clarification, host blocks.

Purpose:

- Investigated whether wrapper calls, clearance preview, and follow-on flags were allowed or blocked.
- Characterized repeated host/platform boundary behavior.

Status:

- No runner start endpoint contact.
- No OpenCode start.
- FP-027 did not run.

### FP-MCP-345 through FP-MCP-350

Capability-separated clearance tool surface and live probe series.

Purpose:

- Shifted away from deprecated/wrapper flow toward capability-separated observer/preview paths.
- Investigated committed approval and evidence-head mismatch behavior.

Status:

- Read-only or preview-oriented probes.
- Did not contact runner start.
- Did not run FP-027.

### FP-MCP-351 through FP-MCP-355

MCP server normalization, tool contract manifest, safe surface profile, runtime validation.

Purpose:

- Normalized MCP tool structure.
- Created contract manifest.
- Defined and validated default ChatGPT-safe surface profile.

Status:

- Safe surface exposed 11 tools.
- Runtime diagnostics confirmed read-only boundary.
- No runner start endpoint contact.
- No OpenCode start.
- No FP-027 canary run.

### FP-MCP-356 through FP-MCP-361A

Inline registration extraction series and runtime validations.

Purpose:

- Extracted inline MCP registration blocks out of `src/server.ts`.
- Preserved stable tool counts and safe surface.
- Repeated runtime validations confirmed safe boundary.

Status:

- No runner start endpoint contact.
- No OpenCode start.
- No FP-027 canary run.

### FP-MCP-362 through FP-MCP-364A

Guarded sequencer refactor plan, diagnostic, correction, runtime validation.

Purpose:

- FP-MCP-362 recorded the guarded sequencer refactor/conformance plan.
- FP-MCP-363 diagnosed a false-positive path where stale enablement could satisfy the current clearance prerequisite.
- FP-MCP-364 corrected that path.
- FP-MCP-364A validated runtime boundary after restart.

Status:

- No runner start endpoint contact.
- No OpenCode start.
- No FP-027 canary run.

### FP-MCP-365 through FP-MCP-366A

Safe-surface eligibility audit and sanitized observer exposure.

Purpose:

- Audited `forgepilot_observe_next_gate`.
- Found it read-only but action-shaped due to `nextToolArguments` and `followOnAfterSuccess`.
- Sanitized those outputs.
- Exposed observer to ChatGPT-safe.
- Runtime validation confirmed live visibility and safe boundary.

Status:

- No runner start endpoint contact.
- No OpenCode start.
- No FP-027 canary run.

### FP-MCP-367 through FP-MCP-368

Bubblewrap sandbox design and diagnostic.

Purpose:

- Rejected direct terminal access.
- Chose bubblewrap as future reduced-risk sandbox direction.
- Confirmed bubblewrap installed and minimally viable.

Status:

- No MCP implementation.
- No command execution tool.
- No runner start endpoint contact.
- No OpenCode start.
- No FP-027 canary run.

## What Is The Guarded Sequencer?

The guarded sequencer is the state-machine-like logic that determines the next legal guarded canary gate for a specific request tuple.

It sits behind tools/functions such as:

- `getGuardedCanaryNextGate`
- `forgepilot_get_guarded_canary_next_gate`
- `forgepilot_observe_next_gate`
- `forgepilot_apply_guarded_canary_next_gate`

It evaluates evidence and prerequisites such as:

- repository branch/head/clean state
- request artifact validity
- approval validity and consumption state
- clearance validity
- scoped enablement validity
- runner capability freshness
- exact tuple binding
- stale/expired/mismatched artifacts

It should return a next gate only when prerequisites for that exact tuple are present, current, unexpired, and valid.

## When Was The Guarded Sequencer Introduced?

Within the FP-MCP-297 through FP-MCP-368 reconciliation range, the first clear introduction point is:

    FP-MCP-308 — Gate Sequencer Implementation

FP-MCP-308 implemented:

- `src/guarded-canary-gate-sequencer.ts`
- `forgepilot_get_guarded_canary_next_gate`

Later sequencer-related milestones include:

- FP-MCP-309 — Sequencer First Read
- FP-MCP-312 — Sequencer-Enforced Gate Executor V1
- FP-MCP-314 — Canary Action Surface Narrowing
- FP-MCP-315 — Guarded Canary V1 Clearance Gate Checkpoint
- FP-MCP-316 — Scoped Enablement Executor Implementation
- FP-MCP-318 — Runner Start Executor Implementation
- FP-MCP-319 — Final Runner Start Test Platform Block
- FP-MCP-362 — Guarded Sequencer Refactor and MCP Conformance Plan
- FP-MCP-363 — False-positive diagnostic
- FP-MCP-364 — False-positive correction
- FP-MCP-365/366 — Safe observer audit and sanitized exposure

## Evidence ID Reconciliation

The generated evidence reconciliation table is:

- runs/FP-MCP-369/evidence-id-reconciliation.tsv

This file should be reviewed directly for the evidence_id sequence.

If evidence IDs are missing from the TSV, the correct classification is not "trust by recap"; it is:

    evidence-id reconciliation incomplete pending direct evidence-ledger query.

## Missing Numeric Packet Files

The raw diagnostic found missing packet files for some numbers in the 297–368 range, while some corresponding run directories exist.

Examples include:

- FP-MCP-302 packet file missing, run directory exists
- FP-MCP-320 packet file missing, run directory exists
- FP-MCP-331 packet file missing, run directory exists
- FP-MCP-335 packet file missing, run directory exists
- FP-MCP-338 packet file missing, run directory exists
- FP-MCP-341 packet file missing, run directory exists

This does not by itself prove an unsafe event, but it must be disclosed.

The packet/run coverage index is:

- runs/FP-MCP-369/packet-boundary-index.tsv

## Auditor-Relevant Conclusion

Before signing off on FP-MCP-365 through FP-MCP-368, the auditor's main concern should be answered as follows:

    FP-027 did not run during FP-MCP-297 through FP-MCP-368 according to the packet/run ledger discovered by this diagnostic.

The strongest safety-relevant event in the gap is FP-MCP-319:

    the project reached the final guarded runner-start boundary,
    but the attempted guarded runner-start executor call was blocked by the platform before MCP execution,
    so no runner start endpoint contact occurred and FP-027 did not run.

## Remaining Caveats

- This report is generated from repository artifacts, not from an external database query.
- Some numeric packet files are missing despite run directories existing.
- Evidence ID reconciliation depends on the extracted TSV and may require direct evidence-ledger tooling if the auditor needs exact current evidence count.
- Bubblewrap must continue to be described as reduced-risk sandboxing, not full VM-level isolation.
- FP-MCP-369 should be reviewed before sandbox preview work resumes.

## Recommendation

Record FP-MCP-369 as a reconciliation checkpoint before proceeding to sandboxed-command preview artifacts.

Do not proceed to FP-MCP-370 or any execution-related sandbox tool until the auditor accepts this reconciliation.
