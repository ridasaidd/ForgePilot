# FP-MCP-369 — Reconcile FP-MCP-297 to FP-MCP-368 ledger gap

## Checkpoint Type

    MCP_LEDGER_RECONCILIATION

## Summary

This packet records the auditor-requested reconciliation for the FP-MCP-297 through FP-MCP-368 gap before evaluating FP-MCP-365 through FP-MCP-368 on their own merits.

The reconciliation answers three safety-critical questions:

1. Did FP-027 run during the gap?
2. What is the guarded sequencer, and when was it introduced?
3. What evidence and packet/run artifacts account for the gap?

## Claim

    The packet/run ledger discovered by this reconciliation supports the claim that FP-027 did not run during FP-MCP-297 through FP-MCP-368.

## Primary Auditor Report

    runs/FP-MCP-369/auditor-reconciliation-report.md

## Supporting Artifacts

    runs/FP-MCP-369/ledger-gap-diagnostic.raw.md
    runs/FP-MCP-369/ledger-gap-reconciliation-summary.md
    runs/FP-MCP-369/packet-boundary-index.tsv
    runs/FP-MCP-369/evidence-id-reconciliation.tsv
    runs/FP-MCP-369/sequencer-introduction-search.md

## Direct Answer: FP-027 Status

    FP-027 did not run.

The discovered packet/run ledger repeatedly records:

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

## Most Important Safety-Relevant Finding

FP-MCP-319 is the strongest safety-relevant event in the gap.

It records that the project reached the final guarded runner-start boundary, but the attempted guarded runner-start executor call was blocked by the platform safety layer before MCP execution.

Therefore:

- no runner start endpoint contact occurred
- OpenCode was not started
- FP-027 did not run

## Guarded Sequencer Definition

The guarded sequencer is the state-machine-like logic that determines the next legal guarded canary gate for a specific request tuple.

It sits behind tools/functions such as:

- getGuardedCanaryNextGate
- forgepilot_get_guarded_canary_next_gate
- forgepilot_observe_next_gate
- forgepilot_apply_guarded_canary_next_gate

It evaluates evidence and prerequisites including:

- repository branch/head/clean state
- request artifact validity
- approval validity and consumption state
- clearance validity
- scoped enablement validity
- runner capability freshness
- exact tuple binding
- stale, expired, or mismatched artifacts

## Guarded Sequencer Introduction

Within the FP-MCP-297 through FP-MCP-368 reconciliation range, the first clear introduction point is:

    FP-MCP-308 — Gate Sequencer Implementation

FP-MCP-308 introduced:

- src/guarded-canary-gate-sequencer.ts
- forgepilot_get_guarded_canary_next_gate

Later sequencer milestones include:

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

## Packet Coverage

The reconciliation examined packet/run artifacts from FP-MCP-297 through FP-MCP-368.

The raw diagnostic found missing packet files for some numeric packet IDs while corresponding run directories existed for several of them.

Examples disclosed in the auditor report include:

- FP-MCP-302 packet file missing, run directory exists
- FP-MCP-320 packet file missing, run directory exists
- FP-MCP-331 packet file missing, run directory exists
- FP-MCP-335 packet file missing, run directory exists
- FP-MCP-338 packet file missing, run directory exists
- FP-MCP-341 packet file missing, run directory exists

This does not by itself prove an unsafe event, but it remains disclosed as a ledger-shape caveat.

## Evidence ID Reconciliation

The evidence-id extraction table is recorded at:

    runs/FP-MCP-369/evidence-id-reconciliation.tsv

If the auditor requires exact current evidence count beyond what the repository artifacts expose, that should be answered by a direct evidence-ledger query in a later checkpoint.

## Bubblewrap Caveat Carried Forward

The auditor's bubblewrap caveat is accepted and carried forward:

    Bubblewrap reduces blast radius.
    Bubblewrap does not provide VM-level isolation.
    Future sandboxed-command artifacts must not describe bubblewrap as fully isolated.

## Classification

    A. The available packet/run ledger supports the claim that FP-027 did not run in FP-MCP-297 through FP-MCP-368.

## Caveats

- This reconciliation is generated from repository packet/run artifacts.
- Some numeric packet files are missing even though run directories exist.
- Evidence ID reconciliation may require direct evidence-ledger tooling if exact current count is required.
- This checkpoint does not evaluate FP-MCP-365 through FP-MCP-368 on their own merits; it closes the precondition for that evaluation.
- This checkpoint does not resume sandbox preview work.

## Non-Goals

This packet does not:

- implement MCP changes
- expose new tools
- execute bubblewrap
- execute sandboxed commands
- start OpenCode
- contact the runner start endpoint
- consume approval
- clear a disable switch
- run FP-027 canary
- restart MCP

## Non-Execution Boundary

    execution authorized: false
    approval consumed: false
    disable switch cleared: false
    runner start endpoint contacted: false
    OpenCode started: false
    FP-027 canary run: false

## Expected Result

    FP-MCP-369 records the auditor-requested ledger reconciliation and explicitly preserves that FP-027 remains not run through FP-MCP-368.
