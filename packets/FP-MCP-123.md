# FP-MCP-123 — Human Approval Evidence Preflight Evaluation Contract

## Task

Define the human approval evidence evaluation contract for guarded start preflight reports.

## Goal

Specify what the `humanApprovalEvidence` gate means before implementing or changing any code.

This packet answers one question:

What must be true before the guarded start preflight report may mark `humanApprovalEvidence` as `PASSED`?

## Background

FP-MCP-116 implemented a read-only guarded start preflight report skeleton.

FP-MCP-117 verified the report against a real request artifact.

FP-MCP-118 verified the report with a non-authorizing approval evidence fixture.

FP-MCP-119 verified the report after committed pre-start evidence.

FP-MCP-120 verified the report after committed start state snapshot evidence.

FP-MCP-121 defined the evidence ledger readiness contract.

FP-MCP-122 implemented a read-only evidence ledger readiness skeleton.

After FP-MCP-122, the guarded preflight report can structurally pass:

- `repository`
- `requestArtifact`
- `commitBinding`
- `modelAndRunMode`
- `preStartEvidence`
- `stateSnapshotEvidence`
- `evidenceLedgerReadiness`

The remaining blockers are intentionally:

- `disableSwitch: FAILED`
- `runnerCapabilityState: FAILED`
- `opencodeReadiness: FAILED`
- `humanApprovalEvidence: DEFERRED`

The `humanApprovalEvidence` gate currently returns:

```text
state: DEFERRED
reason: HUMAN_APPROVAL_EVIDENCE_NOT_EVALUATED
```

That is correct until the approval evidence evaluation contract is explicit.

## Scope

Allowed:

- Define the human approval evidence preflight contract.
- Define approval evidence states.
- Define real approval evidence requirements.
- Define non-authorizing fixture semantics.
- Define approval expiration behavior.
- Define scope matching requirements.
- Define approval evidence versus approval consumption.
- Define failure, incomplete, and deferred reasons.
- Define when `humanApprovalEvidence` may pass.
- Define what `humanApprovalEvidence` must not imply.
- Record contract evidence under `runs/FP-MCP-123/`.

Forbidden:

- Do not implement code.
- Do not modify the MCP bridge.
- Do not modify the runner.
- Do not modify OpenCode configuration.
- Do not enable execution.
- Do not make start callable.
- Do not add start to `supportedOperations`.
- Do not contact the runner start endpoint.
- Do not start OpenCode.
- Do not create runner run id.
- Do not create real approval evidence.
- Do not consume approval.
- Do not mutate approval artifacts.
- Do not mutate request artifacts.
- Do not implement `PRESENT_GUARDED`.
- Do not implement `CALLABLE_GUARDED`.

## Contract

### Definition

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

It does not authorize execution.

It does not consume approval.

It does not make runner start callable.

It does not override the disable switch.

It does not override runner capability state.

It does not override OpenCode readiness.

### Approval Evidence Is Not Approval Consumption

Approval evidence and approval consumption are separate observations.

Approval evidence means:

```text
A scoped human approval artifact exists and is valid for this request.
```

Approval consumption means:

```text
A separate append-only observation records that a valid approval was consumed for a specific start attempt.
```

The preflight report may evaluate approval evidence.

The preflight report must not consume approval.

A `PASSED` human approval evidence gate must not mutate the approval artifact.

A `PASSED` human approval evidence gate must not create approval consumption evidence.

### Gate Shape

The gate must use the standard guarded preflight gate shape:

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

### Required Input Context

A human approval evidence evaluation requires:

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

### Approval Evidence Types

The contract recognizes three approval evidence types:

1. Missing approval evidence
2. Non-authorizing dry-run fixture
3. Real scoped human approval evidence

These must not be collapsed.

### Missing Approval Evidence

If no approval id is supplied, the gate must be:

```text
state: INCOMPLETE
passed: false
reason: HUMAN_APPROVAL_EVIDENCE_MISSING
```

Missing approval evidence is not a failure of the artifact. It means no artifact was supplied for evaluation.

### Non-Authorizing Dry-Run Fixture

A dry-run fixture may be evaluated as an observed artifact, but it must not satisfy execution approval.

If a supplied approval id points to a dry-run fixture, the gate may be:

```text
state: DEFERRED
passed: false
reason: HUMAN_APPROVAL_EVIDENCE_FIXTURE_NOT_AUTHORIZING
```

or:

```text
state: FAILED
passed: false
reason: HUMAN_APPROVAL_EVIDENCE_NOT_USABLE_FOR_EXECUTION
```

The choice depends on whether the preflight is evaluating fixture presence or execution readiness.

For guarded-start readiness, a fixture must not pass.

Current FP-MCP-118 approval fixture evidence therefore must remain non-authorizing.

### Real Scoped Approval Evidence

A real approval evidence artifact may pass only if all conditions hold:

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

### Canonical Approval Text

Real approval evidence must contain an exact canonical approval text.

Recommended canonical text:

```text
I approve this ForgePilot guarded start request.
```

A future implementation may define a stricter phrase including request id, model id, and run mode.

The evaluator must not infer approval from informal notes.

Examples that must not pass:

- `looks good`
- `ok`
- `approved`
- `ship it`
- `run it`
- any non-canonical paraphrase

### Scope Matching

Approval evidence must be scoped exactly.

The following fields must match:

- request id
- model id
- run mode
- repository commit
- branch

A mismatch in any scope field is a failure.

The evaluator must not reuse approval across requests.

The evaluator must not reuse approval across commits.

The evaluator must not reuse approval across models.

The evaluator must not reuse approval across run modes.

### Expiration

Approval evidence must expire.

If `expiresAt` is missing, the gate must fail.

If `expiresAt` is not parseable as ISO-8601 UTC, the gate must fail.

If the current time is at or after `expiresAt`, the gate must fail.

Expiration failure reason:

```text
HUMAN_APPROVAL_EVIDENCE_EXPIRED
```

### Operator Identity

Approval evidence must include a non-secret operator identifier.

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

If only secret-bearing identity is available, the gate must fail or defer until sanitized evidence exists.

### Append-Only Requirement

Human approval evidence evaluation is read-only.

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

### State Semantics

#### PASSED

`humanApprovalEvidence` may be `PASSED` only when real scoped approval evidence is present, committed, readable, unexpired, hash-matching, scope-matching, canonical, non-secret, and not invalidated.

`PASSED` means:

```text
A valid human approval evidence artifact exists for this preflight request.
```

`PASSED` does not mean:

```text
Approval has been consumed.
```

`PASSED` does not mean:

```text
Execution may start.
```

#### FAILED

`humanApprovalEvidence` must be `FAILED` when approval evidence is present but unsafe or contradictory.

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

#### INCOMPLETE

`humanApprovalEvidence` must be `INCOMPLETE` when required approval evidence is absent or incomplete.

Examples:

- no approval id supplied
- approval artifact missing
- approval artifact path missing
- approval hash missing
- approval scope missing
- approval expiration missing
- operator id missing

#### DEFERRED

`humanApprovalEvidence` may be `DEFERRED` when evaluation cannot determine readiness because a prerequisite standard or implementation is missing.

Examples:

- approval evidence evaluator not implemented
- approval fixture evaluator not implemented
- invalidation/quarantine ledger not queryable
- approval consumption ledger not queryable
- canonical approval text not yet configured

#### NOT_EVALUATED

`humanApprovalEvidence` may be `NOT_EVALUATED` only when the guarded preflight report did not attempt approval evidence evaluation.

If an approval id is supplied and the evaluator is available, `PASSED`, `FAILED`, `INCOMPLETE`, or `DEFERRED` is preferred.

## Required Reason Codes

Recommended reason codes:

### Missing / Incomplete

- `HUMAN_APPROVAL_EVIDENCE_MISSING`
- `HUMAN_APPROVAL_EVIDENCE_ARTIFACT_MISSING`
- `HUMAN_APPROVAL_EVIDENCE_PATH_MISSING`
- `HUMAN_APPROVAL_EVIDENCE_HASH_MISSING`
- `HUMAN_APPROVAL_EVIDENCE_SCOPE_MISSING`
- `HUMAN_APPROVAL_EVIDENCE_EXPIRATION_MISSING`
- `HUMAN_APPROVAL_EVIDENCE_OPERATOR_MISSING`

### Deferred

- `HUMAN_APPROVAL_EVIDENCE_NOT_EVALUATED`
- `HUMAN_APPROVAL_EVIDENCE_EVALUATOR_MISSING`
- `HUMAN_APPROVAL_EVIDENCE_FIXTURE_NOT_AUTHORIZING`
- `APPROVAL_CONSUMPTION_LEDGER_NOT_QUERYABLE`
- `APPROVAL_INVALIDATION_LEDGER_NOT_QUERYABLE`
- `CANONICAL_APPROVAL_TEXT_NOT_CONFIGURED`

### Failed

- `HUMAN_APPROVAL_EVIDENCE_NOT_USABLE_FOR_EXECUTION`
- `HUMAN_APPROVAL_EVIDENCE_ID_MISMATCH`
- `HUMAN_APPROVAL_EVIDENCE_REQUEST_MISMATCH`
- `HUMAN_APPROVAL_EVIDENCE_MODEL_MISMATCH`
- `HUMAN_APPROVAL_EVIDENCE_RUN_MODE_MISMATCH`
- `HUMAN_APPROVAL_EVIDENCE_COMMIT_MISMATCH`
- `HUMAN_APPROVAL_EVIDENCE_BRANCH_MISMATCH`
- `HUMAN_APPROVAL_EVIDENCE_EXPIRED`
- `HUMAN_APPROVAL_EVIDENCE_EXPIRATION_INVALID`
- `HUMAN_APPROVAL_EVIDENCE_CANONICAL_TEXT_MISSING`
- `HUMAN_APPROVAL_EVIDENCE_CANONICAL_TEXT_MISMATCH`
- `HUMAN_APPROVAL_EVIDENCE_PATH_UNSAFE`
- `HUMAN_APPROVAL_EVIDENCE_HASH_MISMATCH`
- `HUMAN_APPROVAL_EVIDENCE_ALREADY_CONSUMED`
- `HUMAN_APPROVAL_EVIDENCE_INVALIDATED`
- `HUMAN_APPROVAL_EVIDENCE_QUARANTINED`
- `HUMAN_APPROVAL_EVIDENCE_OPERATOR_SECRET_BEARING`

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

This remains correct after FP-MCP-122 because the approval evidence evaluation standard has only now been defined and has not yet been implemented.

For the existing FP-MCP-118 approval fixture, the future expected state should be non-authorizing:

```text
passed: false
state: DEFERRED or FAILED
reason: HUMAN_APPROVAL_EVIDENCE_FIXTURE_NOT_AUTHORIZING
```

A fixture must not make the gate pass for execution readiness.

## Verification

Verification must show:

- packet committed
- contract evidence recorded under `runs/FP-MCP-123/`
- no implementation changes
- no bridge changes
- no runner changes
- no execution enabled
- no runner start endpoint contact
- no OpenCode start
- no real approval creation
- no approval consumption
- no approval artifact mutation
- no request artifact mutation

## Evidence

Record:

- `runs/FP-MCP-123/contract-evidence.md`
- `runs/FP-MCP-123/verification.txt`

## Success Criteria

This packet is successful if:

1. The human approval evidence preflight contract is explicit.
2. The contract distinguishes approval evidence from approval consumption.
3. The contract distinguishes missing approval, fixture approval, and real scoped approval.
4. The contract defines `PASSED`, `FAILED`, `INCOMPLETE`, `DEFERRED`, and `NOT_EVALUATED`.
5. The contract defines scope matching.
6. The contract defines expiration behavior.
7. The contract defines canonical approval text behavior.
8. The contract defines operator identity safety.
9. The contract defines reason codes.
10. The current expected state remains `DEFERRED`.
11. No code is changed.
12. Verification passes.

## Non-goals

This packet does not implement approval evidence evaluation.

This packet does not implement real approval evidence creation.

This packet does not implement approval consumption.

This packet does not implement approval invalidation or quarantine lookup.

This packet does not enable execution.

This packet does not make start callable.

This packet does not add start to supported operations.

This packet does not implement `PRESENT_GUARDED`.

This packet does not implement `CALLABLE_GUARDED`.

This packet does not perform a remote runner start.
