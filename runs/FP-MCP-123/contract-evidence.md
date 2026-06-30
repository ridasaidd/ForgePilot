# FP-MCP-123 Contract Evidence

Result: PASSED

Defined the human approval evidence preflight evaluation contract for guarded start preflight reports.

## Packet

- FP-MCP-123 — Human Approval Evidence Preflight Evaluation Contract

## Packet Commit

- `bcccc55 Add FP-MCP-123 human approval evidence contract packet`

## Contract Status

This packet is contract-only.

No implementation was changed.

No MCP bridge code was changed.

No runner code was changed.

No OpenCode configuration was changed.

## Contract Definition

`humanApprovalEvidence` answers:

```text
Does a supplied approval evidence artifact exist, match the current request scope, remain valid for preflight evaluation, and satisfy the human approval evidence standard?
```

It does not answer:

```text
Has approval been consumed?
```

It does not answer:

```text
Should execution start?
```

## Core Separation

The contract explicitly separates:

```text
approval evidence
```

from:

```text
approval consumption
```

Approval evidence means a scoped human approval artifact exists and is valid for the request.

Approval consumption means a separate append-only observation records that a valid approval was consumed for a specific start attempt.

The preflight report may evaluate approval evidence.

The preflight report must not consume approval.

## Non-Authorizing Semantics

The contract explicitly states that human approval evidence:

- does not authorize execution by itself
- does not consume approval
- does not make runner start callable
- does not override the disable switch
- does not override runner capability state
- does not override OpenCode readiness
- does not create approval consumption evidence
- does not mutate approval artifacts

## Gate Shape

The gate uses the standard guarded preflight gate shape:

```json
{
  "evaluated": true,
  "passed": false,
  "state": "DEFERRED",
  "reasons": ["HUMAN_APPROVAL_EVIDENCE_NOT_EVALUATED"],
  "evidencePath": null,
  "evidenceSha256": null
}
```

Allowed states:

- `PASSED`
- `FAILED`
- `INCOMPLETE`
- `DEFERRED`
- `NOT_EVALUATED`

## Required Input Context

The contract defines that human approval evidence evaluation requires:

- packet id for the current preflight request
- request id
- request artifact path
- request artifact sha256
- request model id
- request run mode
- repository branch
- repository commit bound by the request
- optional approval id
- approval artifact path, if supplied
- approval artifact sha256, if supplied
- approval packet id, if cross-packet
- approval scope
- approval creation timestamp
- approval expiration timestamp
- approval text or canonical approval marker
- operator identifier
- approval evidence type

## Approval Evidence Types

The contract defines three distinct evidence types:

1. Missing approval evidence
2. Non-authorizing dry-run fixture
3. Real scoped human approval evidence

These must not be collapsed.

## Missing Approval Evidence

If no approval id is supplied, the gate should be:

```text
state: INCOMPLETE
passed: false
reason: HUMAN_APPROVAL_EVIDENCE_MISSING
```

## Non-Authorizing Dry-Run Fixture

Dry-run fixtures may be observed but must not satisfy execution approval.

For the existing FP-MCP-118 fixture, future expected behavior is:

```text
passed: false
state: DEFERRED or FAILED
reason: HUMAN_APPROVAL_EVIDENCE_FIXTURE_NOT_AUTHORIZING
```

or:

```text
passed: false
state: FAILED
reason: HUMAN_APPROVAL_EVIDENCE_NOT_USABLE_FOR_EXECUTION
```

The fixture must not make `humanApprovalEvidence` pass for guarded-start readiness.

## Real Scoped Approval Evidence

The contract defines that a real approval evidence artifact may pass only if all conditions hold:

- artifact exists
- artifact is readable
- artifact is committed
- artifact is under an allowed evidence path
- artifact hash matches current content
- approval id matches supplied approval id
- approval scope request id matches current request id
- approval scope model id matches current model id
- approval scope run mode matches current run mode
- approval scope repository branch matches current branch
- approval scope repository commit matches the request-bound commit
- approval text or marker exactly matches the required canonical approval phrase
- operator identifier is present and non-secret
- expiration timestamp exists
- current time is before expiration timestamp
- approval has not been invalidated
- approval has not been quarantined
- approval has not already been consumed for this request if single-use semantics are in effect

## Canonical Approval Text

The contract defines canonical approval text behavior.

Recommended phrase:

```text
I approve this ForgePilot guarded start request.
```

The evaluator must not infer approval from informal notes.

Examples that must not pass:

- `looks good`
- `ok`
- `approved`
- `ship it`
- `run it`
- any non-canonical paraphrase

## Scope Matching

The contract requires exact scope matching for:

- request id
- model id
- run mode
- repository commit
- branch

Approval must not be reused across:

- requests
- commits
- models
- run modes

## Expiration

Approval evidence must expire.

Failure conditions:

- missing `expiresAt`
- invalid ISO-8601 UTC timestamp
- current time at or after `expiresAt`

Expiration failure reason:

```text
HUMAN_APPROVAL_EVIDENCE_EXPIRED
```

## Operator Identity

The contract requires a non-secret operator identifier.

Allowed:

- stable non-secret operator id
- non-secret operator handle
- non-reversible email hash

Forbidden:

- raw email address
- password
- API key
- OAuth token
- session token
- private key
- secret-bearing note

## Append-Only Requirement

Approval evidence evaluation is read-only.

The evaluator may read existing approval artifacts.

The evaluator must not:

- rewrite approval artifacts
- normalize approval artifacts
- mark approval as used
- consume approval
- create approval
- create approval consumption evidence
- upgrade dry-run fixtures into real approvals
- infer missing approval from operator notes
- infer approval from absence of rejection

## State Semantics

### PASSED

Means:

```text
A valid human approval evidence artifact exists for this preflight request.
```

Does not mean:

```text
Approval has been consumed.
```

Does not mean:

```text
Execution may start.
```

### FAILED

Required when approval evidence is present but unsafe or contradictory.

Examples:

- approval id mismatch
- request id mismatch
- model id mismatch
- run mode mismatch
- repository commit mismatch
- branch mismatch
- expired approval
- invalid expiration timestamp
- missing canonical approval text
- non-canonical approval text
- unsafe approval path
- artifact hash mismatch
- approval already consumed when single-use is required
- approval invalidated
- approval quarantined
- secret-bearing operator identity

### INCOMPLETE

Required when required approval evidence is absent or incomplete.

Examples:

- no approval id supplied
- approval artifact missing
- approval artifact path missing
- approval hash missing
- approval scope missing
- approval expiration missing
- operator id missing

### DEFERRED

Allowed when evaluation cannot determine readiness because a prerequisite standard or implementation is missing.

Examples:

- approval evidence evaluator not implemented
- approval fixture evaluator not implemented
- invalidation/quarantine ledger not queryable
- approval consumption ledger not queryable
- canonical approval text not yet configured

### NOT_EVALUATED

Allowed only when the guarded preflight report did not attempt approval evidence evaluation.

## Reason Codes

The contract defines reason code groups for:

- missing / incomplete approval evidence
- deferred approval evidence
- failed approval evidence

Current expected reason remains:

```text
HUMAN_APPROVAL_EVIDENCE_NOT_EVALUATED
```

until implementation exists.

## Current Expected Behavior

Until implementation exists, the guarded preflight report may continue to return:

```json
{
  "humanApprovalEvidence": {
    "evaluated": true,
    "passed": false,
    "state": "DEFERRED",
    "reasons": ["HUMAN_APPROVAL_EVIDENCE_NOT_EVALUATED"],
    "evidencePath": null,
    "evidenceSha256": null
  }
}
```

This remains correct after FP-MCP-123 because the approval evidence evaluation standard has been defined but not implemented.

## Conclusion

FP-MCP-123 successfully defines the human approval evidence preflight evaluation contract and preserves the separation between approval evidence, approval consumption, and execution authorization.
