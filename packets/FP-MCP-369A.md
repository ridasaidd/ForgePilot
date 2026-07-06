# FP-MCP-369A — Evidence-ID and FP-MCP-319 platform-block reconciliation

## Checkpoint Type

    MCP_LEDGER_RECONCILIATION_ADDENDUM

## Summary

This packet closes the two auditor-open items after FP-MCP-369.

The auditor provisionally accepted the FP-MCP-297 through FP-MCP-368 reconciliation, but required:

1. Direct evidence-ledger query to confirm the evidence_id sequence from 175 through current.
2. Explicit FP-MCP-319 platform-block doctrine check against the standing no-bypass rules from FP-MCP-188/194/195.

This addendum records both.

## Claim

    FP-MCP-369A closes the auditor's two open reconciliation items: evidence_id 175 through 228 is continuous in the live SQLite evidence ledger, and FP-MCP-319 is classified as a platform block observed and held, not bypassed and not a completed FP-027 run.

## Source Artifacts

    runs/FP-MCP-369A/evidence-ledger-direct-query.py
    runs/FP-MCP-369A/evidence-ledger-direct-query-result.json
    runs/FP-MCP-369A/evidence-ledger-direct-query.tsv
    runs/FP-MCP-369A/evidence-ledger-direct-query-summary.md
    runs/FP-MCP-369A/platform-block-doctrine-check.md
    runs/FP-MCP-369A/process-gap-finding.md

## Evidence-Ledger Direct Query Result

The direct query inspected:

    data/forgepilot.db

Discovered evidence-relevant tables included:

    evidence_records
    evidence_admission_events
    admission_review_requests
    admission_invalidation_events
    evidence_record_admission_events
    evidence_record_validation_events

The two primary active evidence tables contained:

    evidence_records: 228 rows
    evidence_admission_events: 228 rows

The evidence_id range query returned:

    source: sqlite
    start: 175
    current max evidence id: 228
    observed count: 54
    continuous: true
    missing ids: none

Classification:

    DIRECT_OR_EXTRACTED_EVIDENCE_ID_SEQUENCE_CONTINUOUS_FROM_175_TO_CURRENT

## Evidence-ID Conclusion

The auditor's first open item is closed.

The live SQLite evidence ledger contains a continuous evidence_id sequence from 175 through 228 with no missing IDs.

## FP-MCP-319 Platform-Block Doctrine Check

The doctrine check is recorded at:

    runs/FP-MCP-369A/platform-block-doctrine-check.md

FP-MCP-319 is classified as:

    PLATFORM_BLOCK_OBSERVED_AND_HELD

not:

    FP_027_RUN_ATTEMPT_COMPLETED
    FP_027_CANARY_RUN
    RUNNER_START_CONTACTED
    OPENAI_PLATFORM_BLOCK_BYPASSED

The recorded FP-MCP-319 behavior was:

- final guarded runner-start executor call reached the platform boundary
- platform safety layer blocked the call before MCP execution
- the block was recorded as the result
- no successful rephrased replacement call reached MCP execution
- no manual bypass was recorded
- no runner-start endpoint contact occurred
- OpenCode was not started
- approval was not consumed
- disable switch was not cleared
- FP-027 did not run

## FP-MCP-319 Doctrine Conclusion

The auditor's second open item is closed by repository-ledger evidence.

FP-MCP-319 followed the no-bypass posture: the platform block was treated as an observation and recorded, not evaded.

## Process Gap Finding

The auditor's structural observation is accepted and recorded at:

    runs/FP-MCP-369A/process-gap-finding.md

Finding:

    FP-MCP-298 through FP-MCP-368 introduced substantial guarded execution infrastructure without concurrent auditor review at the points where new state machines, executors, and gates were introduced.

This retrospective reconciliation did not find evidence of unsafe execution, but the absence of concurrent review is still a process gap.

## Standing Process Rule Going Forward

Any future packet that introduces a new:

- state machine
- executor
- gate mechanism
- execution-adjacent sequencing layer
- approval mechanism
- clearance mechanism
- enablement mechanism
- tool-surface category change

must be flagged for auditor review at introduction time, not discovered later through retrospective reconciliation.

## Bubblewrap/Sandbox Implication

Sandbox preview work remains paused until this addendum is reviewed.

Future sandboxed-command packets must be auditor-visible at introduction time because they introduce execution-adjacent mechanism design.

Bubblewrap remains classified as reduced-risk sandboxing, not full VM-level isolation.

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

    FP-MCP-369A closes the auditor's two open reconciliation items and records the process-gap rule before sandbox preview work resumes.
