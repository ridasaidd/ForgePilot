# FP-MCP-371A — Sandbox preview schema auditor addendum

## Checkpoint Type

    MCP_SANDBOX_PREVIEW_SCHEMA_AUDITOR_ADDENDUM

## Summary

This packet records the auditor's acceptance of FP-MCP-371 for a later non-executing sandbox preview artifact writer implementation, with one schema improvement required before implementation.

The improvement adds explicit handling for later-discovered redaction failures.

## Claim

    FP-MCP-371A records that FP-MCP-371 may proceed to a later non-executing preview writer implementation after adding outputPolicy.onRedactionFailureDiscovered with manual incident review semantics.

## Auditor Result

The auditor accepted FP-MCP-371 for the limited purpose of proceeding to a non-executing preview artifact writer.

The auditor did not authorize sandbox execution.

## Auditor-Identified Strong Points

- invalidIf rules make rejection mechanical.
- previewIsEvidence: false remains separate from TIER_0_UNTRUSTED.
- Execution safety and evidence trustworthiness remain separate axes.
- Approval binding to preview ID, command hash, policy version, and head commit is strong.
- argv is preferred over shell strings.
- shell is forbidden by default.

## Auditor-Identified Gap

The output policy acknowledged that redaction is attempted but not guaranteed, but lacked a field for later-discovered redaction failure after storage.

## Schema Change

The design now adds:

    outputPolicy.onRedactionFailureDiscovered

Allowed v1 value:

    MANUAL_INCIDENT_REVIEW_REQUIRED

Required semantics:

- Redaction is attempted but not guaranteed.
- Later-discovered redaction failure is an incident.
- Affected artifacts must not be silently reused.
- Affected artifacts must not be admitted as evidence.
- Manual review must decide quarantine, redaction, deletion, supersession, or access restriction.

## Updated Artifact

    docs/mcp/sandboxed-command-preview-artifact-design.md

## Run Artifact

    runs/FP-MCP-371A/auditor-schema-review-addendum.md

## Next Authorized Packet

    FP-MCP-372 — Non-executing sandbox preview artifact writer implementation

The next packet must remain non-executing.

## Non-Goals

This packet does not:

- implement MCP tools
- execute commands
- invoke bubblewrap
- create approvals
- consume approvals
- contact runner start
- start OpenCode
- clear disable switches
- run FP-027 canary
- admit sandbox output as evidence
- restart MCP

## Non-Execution Boundary

    execution authorized: false
    approval consumed: false
    disable switch cleared: false
    runner start endpoint contacted: false
    OpenCode started: false
    FP-027 canary run: false

## Expected Result

    FP-MCP-371A records auditor acceptance plus the redaction-failure schema addendum before non-executing writer implementation begins.
