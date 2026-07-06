# FP-MCP-371A Auditor Schema Review Addendum

## Auditor Review Result

The auditor accepted FP-MCP-371 for the limited purpose of proceeding to a later non-executing preview artifact writer implementation.

## Scope Of Acceptance

The acceptance authorizes only:

    a later non-executing preview artifact writer packet

It does not authorize:

- sandbox execution
- bubblewrap execution
- shell execution
- command execution MCP tooling
- ChatGPT-safe execution exposure
- direct terminal access
- approval consumption
- runner start endpoint contact
- OpenCode start
- FP-027 canary run

## Auditor-Identified Strong Points

The auditor specifically approved these design properties:

- invalidIf rules make rejection mechanical rather than relying only on human review.
- previewIsEvidence: false is separate from futureSandboxOutputInitialTrustTier: TIER_0_UNTRUSTED.
- This preserves the distinction between execution safety and evidence trustworthiness.
- Approval binding to preview ID, command hash, policy version, and head commit is tight and should be considered for reuse in guarded-runner approvals.
- argv is preferred over shell strings.
- shell is forbidden by default.

## Auditor-Identified Gap

The auditor identified one schema gap:

    redactKnownSecretPatterns: true is honestly described as attempted but not guaranteed, but the schema lacked a field for what happens if a redaction failure is later discovered after storage.

## Schema Addendum

The schema now adds:

    outputPolicy.onRedactionFailureDiscovered

Allowed v1 value:

    MANUAL_INCIDENT_REVIEW_REQUIRED

Required semantics:

- Redaction is attempted but not guaranteed.
- Later-discovered redaction failure is an incident.
- Affected artifacts must not be silently reused.
- Affected artifacts must not be admitted as evidence.
- Manual review must decide quarantine, redaction, deletion, supersession, or access restriction.

## Updated Design Artifact

- docs/mcp/sandboxed-command-preview-artifact-design.md

## Result

FP-MCP-371A closes the auditor's schema gap before writer implementation.

## Next Authorized Packet

The next authorized packet may be:

    FP-MCP-372 — Non-executing sandbox preview artifact writer implementation

That packet must remain non-executing.

## Non-Execution Boundary

    execution authorized: false
    approval consumed: false
    disable switch cleared: false
    runner start endpoint contacted: false
    OpenCode started: false
    FP-027 canary run: false
