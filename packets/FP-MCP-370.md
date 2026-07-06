# FP-MCP-370 — Sandbox phase entry readiness gate

## Checkpoint Type

    MCP_SANDBOX_PHASE_ENTRY_GATE

## Summary

This packet records that ForgePilot has reached the sandbox phase boundary after closing the FP-MCP-297 through FP-MCP-368 reconciliation gap and the FP-MCP-369A auditor addendum items.

This is not sandbox implementation.

This is not sandbox preview.

This is a readiness gate that defines what has been cleared and what must remain true before sandboxed-command preview artifacts begin.

## Claim

    ForgePilot may proceed toward sandbox-phase design work only after preserving the reconciliation findings, FP-027 non-run status, FP-MCP-319 platform-block doctrine classification, evidence-id continuity, and auditor-visible introduction rule for future execution-adjacent mechanisms.

## Governing Reconciliation Packets

    FP-MCP-369  — Reconcile FP-MCP-297 to FP-MCP-368 ledger gap
    FP-MCP-369A — Evidence-ID and FP-MCP-319 platform-block reconciliation

## Reconciliation Results Carried Forward

### FP-027 Status

    FP-027 did not run through FP-MCP-368.

The reconciled ledger records:

- runner start endpoint contacted: false
- OpenCode started: false
- approval consumed: false
- disable switch cleared: false
- FP-027 canary run: false

### Evidence-ID Continuity

The direct SQLite evidence-ledger query in FP-MCP-369A inspected:

    data/forgepilot.db

Result:

    evidence_records: 228 rows
    evidence_admission_events: 228 rows
    checked range: evidence_id 175 through 228
    continuous: true
    missing ids: none

Classification:

    DIRECT_OR_EXTRACTED_EVIDENCE_ID_SEQUENCE_CONTINUOUS_FROM_175_TO_CURRENT

### FP-MCP-319 Platform-Block Doctrine

FP-MCP-319 is classified as:

    PLATFORM_BLOCK_OBSERVED_AND_HELD

not:

    FP_027_RUN_ATTEMPT_COMPLETED
    FP_027_CANARY_RUN
    RUNNER_START_CONTACTED
    OPENAI_PLATFORM_BLOCK_BYPASSED

The final guarded runner-start executor call reached the platform boundary but was blocked before MCP execution.

Therefore:

- no runner-start endpoint contact occurred
- OpenCode was not started
- approval was not consumed
- disable switch was not cleared
- FP-027 did not run

## Process Rule Carried Forward

The auditor's process-gap finding is accepted.

Going forward, any packet that introduces a new:

- state machine
- executor
- gate mechanism
- execution-adjacent sequencing layer
- approval mechanism
- clearance mechanism
- enablement mechanism
- tool-surface category change

must be flagged for auditor review at introduction time.

This rule applies to sandboxed-command work.

## Sandbox Phase Boundary

The next sandbox-phase work must begin with a non-executing preview/request artifact design.

The next intended packet after this gate is:

    FP-MCP-371 — Sandboxed command preview artifact design

That packet must remain non-executing unless explicitly re-scoped.

## Bubblewrap Classification Carried Forward

Bubblewrap is classified as:

    reduced-risk sandboxing

not:

    full VM-level isolation

Future sandbox documents must not describe bubblewrap as fully isolated.

Required wording:

    Bubblewrap reduces blast radius.
    Bubblewrap shares the host kernel.
    Bubblewrap does not provide VM-level isolation.

## Required Constraints For Sandbox Preview Design

The sandbox preview artifact design must include:

- packet id
- request id
- proposed command
- command purpose
- expected working directory
- copied workspace source
- copied workspace target
- explicit no-real-repo-write policy
- explicit no-secrets-mount policy
- explicit no-Docker-socket policy
- network policy
- timeout policy
- output-size policy
- artifact export policy
- approval requirement
- risk classification
- non-admission-by-default rule
- bubblewrap caveat
- auditor-visible introduction marker

The preview artifact must not execute the command.

## Required Non-Execution Boundary

Until a later packet explicitly authorizes sandbox execution, sandbox-phase work must not:

- run bubblewrap
- execute shell commands inside bubblewrap
- execute shell commands outside bubblewrap
- expose direct terminal access
- expose sandbox execution to ChatGPT-safe
- create a command execution MCP tool
- start OpenCode
- contact runner start
- consume approval
- clear disable switch
- run FP-027 canary

## Current State

This packet records readiness to enter sandbox preview design, not readiness to execute sandboxed commands.

## Non-Goals

This packet does not:

- implement MCP changes
- add sandbox preview tooling
- add sandbox execution tooling
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

    FP-MCP-370 records the sandbox phase entry gate and preserves the auditor reconciliation requirements before sandbox preview design begins.
