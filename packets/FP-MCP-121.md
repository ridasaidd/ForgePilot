# FP-MCP-121 — Guarded Preflight Report Evidence Ledger Readiness Contract

## Task

Define the evidence ledger readiness contract for guarded start preflight reports.

## Goal

Specify what the `evidenceLedgerReadiness` gate means before implementing or changing any code.

This packet answers one question:

What must be true before the guarded start preflight report may mark `evidenceLedgerReadiness` as `PASSED`?

## Background

FP-MCP-116 implemented a read-only guarded start preflight report skeleton.

FP-MCP-117 verified the report against a real request artifact.

FP-MCP-118 verified the report with a non-authorizing approval evidence fixture.

FP-MCP-119 verified the report after committed pre-start evidence.

FP-MCP-120 verified the report after committed start state snapshot evidence.

After FP-MCP-120, the following gates can pass using committed non-executing evidence:

- `repository`
- `requestArtifact`
- `commitBinding`
- `modelAndRunMode`
- `preStartEvidence`
- `stateSnapshotEvidence`

The remaining blockers are intentionally:

- `disableSwitch: FAILED`
- `runnerCapabilityState: FAILED`
- `opencodeReadiness: FAILED`
- `humanApprovalEvidence: DEFERRED`
- `evidenceLedgerReadiness: DEFERRED`

The `evidenceLedgerReadiness` gate currently returns:

```text
state: DEFERRED
reason: EVIDENCE_LEDGER_NOT_READY
```

That is correct until the ledger-readiness contract is explicit.

## Scope

Allowed:

- Define the evidence ledger readiness contract.
- Define gate states.
- Define required observations.
- Define acceptable evidence sources.
- Define non-authorizing semantics.
- Define failure and deferred reasons.
- Define when `evidenceLedgerReadiness` may pass.
- Define what `evidenceLedgerReadiness` must not imply.
- Record contract evidence under `runs/FP-MCP-121/`.

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
- Do not create approval evidence.
- Do not consume approval.
- Do not mutate request artifacts.
- Do not implement `PRESENT_GUARDED`.
- Do not implement `CALLABLE_GUARDED`.

## Contract

### Definition

`evidenceLedgerReadiness` answers:

```text
Are all evidence artifacts required by the current guarded-start preflight contract present, committed, immutable for the current evaluation, and cross-referenced well enough to support a future guarded-start decision?
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

### Gate Shape

The gate must use the standard guarded preflight gate shape:

```json
{
  "evaluated": true,
  "passed": false,
  "state": "DEFERRED",
  "reasons": ["EVIDENCE_LEDGER_NOT_READY"],
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

A ledger readiness evaluation requires:

- packet id
- request id
- request artifact path
- request artifact sha256
- request artifact commit
- model id
- run mode
- repository branch
- current repository commit
- pre-start evidence path
- pre-start evidence sha256
- state snapshot evidence path
- pre-start snapshot path
- pre-start snapshot sha256
- post-start snapshot path
- post-start snapshot sha256
- optional approval id
- approval evidence state, if available
- runner capability state
- disable switch state
- OpenCode readiness state

### Required Ledger Observations

The ledger is ready only if all required artifact observations are present and internally consistent.

Required artifact observations:

1. Request artifact observation
2. Commit binding observation
3. Model and run-mode observation
4. Pre-start evidence observation
5. State snapshot evidence observation
6. Runner capability observation
7. Disable switch observation
8. OpenCode readiness observation
9. Approval evidence observation, if approval id is supplied
10. Human approval consumption observation, only if real approval consumption is in scope
11. Execution start observation, only after guarded start becomes callable in a future packet

For the current `PRESENT_DISABLED` phase, observations 10 and 11 are not required and must not be fabricated.

### Required Artifact Properties

For `evidenceLedgerReadiness` to pass, every required artifact must be:

- present
- readable
- committed
- under an allowed evidence path
- content-addressed or hashable
- tied to the same request id
- tied to the same packet or explicitly cross-packet referenced
- tied to the same model id and run mode, where applicable
- tied to the current repository lineage
- not mutated during evaluation
- not contradicted by a later invalidation or quarantine record, if such records exist

### Cross-Packet Evidence

Cross-packet evidence is allowed only when the relationship is explicit.

Example:

- FP-MCP-117 owns the request artifact.
- FP-MCP-118 owns the approval fixture.
- FP-MCP-119 owns the pre-start evidence fixture.
- FP-MCP-120 owns the state snapshot fixture.

A ledger readiness check may use this chain only if it can report the source packet and artifact path for each dependency.

Cross-packet use must not silently collapse evidence into the current packet.

### Append-Only Requirement

Ledger readiness requires append-only evidence behavior.

The evaluator may read existing evidence.

The evaluator must not:

- rewrite prior evidence
- normalize prior evidence
- upgrade prior evidence state retroactively
- infer missing evidence from absence
- treat non-authorizing fixtures as authorization
- consume approval
- create approval
- start execution

### Fixture Semantics

Dry-run fixtures may satisfy ledger presence for non-executing readiness tests only.

They do not satisfy execution authorization.

A fixture may support:

```text
Evidence exists and is internally consistent enough to be observed.
```

A fixture must not imply:

```text
Execution is approved.
```

A fixture must not imply:

```text
The runner may start.
```

### Approval Evidence

Approval evidence has three distinct levels:

1. Missing approval id
2. Supplied but non-authorizing approval fixture
3. Real scoped approval evidence

The ledger must distinguish all three.

Current FP-MCP-118 approval fixture evidence may improve observation specificity, but it must not make `humanApprovalEvidence` pass for execution.

A future real approval evidence packet must define the exact criteria for approval readiness.

### Disable Switch Independence

`evidenceLedgerReadiness` is independent from disable-switch pass/fail.

The ledger may be structurally ready while the disable switch remains active.

However, ledger readiness must not override:

- `disableSwitch: FAILED`
- `executionPermitted: false`
- `eligibleForFutureGuardedStart: false`

### Runner Capability Independence

`evidenceLedgerReadiness` is independent from runner capability state.

The ledger may be structurally ready while the runner remains:

```text
startEndpointState: PRESENT_DISABLED
startCapabilityCallable: false
```

However, ledger readiness must not override:

- `runnerCapabilityState: FAILED`
- `runnerStartEndpointContacted: false`
- `startEndpointContacted: false`

### OpenCode Readiness Independence

`evidenceLedgerReadiness` is independent from OpenCode readiness.

The ledger may be structurally ready while OpenCode remains disabled.

However, ledger readiness must not override:

- `opencodeReadiness: FAILED`
- `opencodeStarted: false`

## State Semantics

### PASSED

`evidenceLedgerReadiness` may be `PASSED` only when:

- all required artifact observations are present
- all required artifacts are committed
- all required artifacts are readable
- all required artifacts are internally consistent
- all required artifacts refer to the same request id
- all required hashes match current content
- cross-packet dependencies are explicit
- no required dependency is missing
- no required dependency is uncommitted
- no required dependency is invalidated
- no required dependency is quarantined
- the evaluator can explain exactly which artifacts were used

`PASSED` means:

```text
The evidence ledger is structurally ready for this preflight evaluation.
```

`PASSED` does not mean:

```text
Execution may start.
```

### FAILED

`evidenceLedgerReadiness` must be `FAILED` when evidence is present but contradictory or unsafe.

Examples:

- artifact hash mismatch
- request id mismatch
- model id mismatch
- run mode mismatch
- artifact outside allowed evidence path
- committed artifact differs from recorded hash
- cross-packet dependency is ambiguous
- evidence chain contains contradictory observations
- evidence chain contains invalidated required evidence
- evidence chain contains quarantined required evidence

### INCOMPLETE

`evidenceLedgerReadiness` must be `INCOMPLETE` when evidence is expected but missing.

Examples:

- request artifact missing
- pre-start evidence missing
- state snapshot evidence missing
- expected approval artifact missing
- required hash missing
- required path missing
- source packet missing

### DEFERRED

`evidenceLedgerReadiness` may be `DEFERRED` when the contract cannot yet determine readiness because a prerequisite standard or implementation is not available.

Examples:

- ledger readiness implementation not present
- approval readiness standard not yet implemented
- invalidation/quarantine ledger not yet queryable
- required artifact index not yet defined
- cross-packet dependency index not yet defined

### NOT_EVALUATED

`evidenceLedgerReadiness` may be `NOT_EVALUATED` only when the guarded preflight report did not attempt the ledger check.

If the report includes this gate and can reach the ledger evaluator, `DEFERRED`, `INCOMPLETE`, `FAILED`, or `PASSED` is preferred.

## Required Reason Codes

Recommended reason codes:

### Deferred

- `EVIDENCE_LEDGER_NOT_READY`
- `EVIDENCE_LEDGER_IMPLEMENTATION_MISSING`
- `EVIDENCE_LEDGER_INDEX_MISSING`
- `APPROVAL_READINESS_STANDARD_MISSING`
- `INVALIDATION_LEDGER_NOT_QUERYABLE`
- `CROSS_PACKET_EVIDENCE_INDEX_MISSING`

### Incomplete

- `EVIDENCE_LEDGER_DEPENDENCY_MISSING`
- `REQUEST_ARTIFACT_LEDGER_ENTRY_MISSING`
- `PRE_START_EVIDENCE_LEDGER_ENTRY_MISSING`
- `STATE_SNAPSHOT_LEDGER_ENTRY_MISSING`
- `APPROVAL_EVIDENCE_LEDGER_ENTRY_MISSING`
- `EVIDENCE_ARTIFACT_HASH_MISSING`
- `EVIDENCE_ARTIFACT_COMMIT_MISSING`
- `EVIDENCE_SOURCE_PACKET_MISSING`

### Failed

- `EVIDENCE_LEDGER_HASH_MISMATCH`
- `EVIDENCE_LEDGER_REQUEST_MISMATCH`
- `EVIDENCE_LEDGER_MODEL_MISMATCH`
- `EVIDENCE_LEDGER_RUN_MODE_MISMATCH`
- `EVIDENCE_LEDGER_PATH_UNSAFE`
- `EVIDENCE_LEDGER_CROSS_PACKET_AMBIGUOUS`
- `EVIDENCE_LEDGER_CONTRADICTORY`
- `EVIDENCE_LEDGER_INVALIDATED`
- `EVIDENCE_LEDGER_QUARANTINED`

## Current Expected Behavior

Until implementation exists, the guarded preflight report should continue to return:

```json
{
  "evidenceLedgerReadiness": {
    "evaluated": true,
    "passed": false,
    "state": "DEFERRED",
    "reasons": ["EVIDENCE_LEDGER_NOT_READY"],
    "evidencePath": null,
    "evidenceSha256": null
  }
}
```

This is correct even after FP-MCP-120 because the ledger readiness standard has only now been defined and has not yet been implemented.

## Verification

Verification must show:

- packet committed
- contract document recorded or embedded
- evidence recorded under `runs/FP-MCP-121/`
- no implementation changes
- no bridge changes
- no runner changes
- no execution enabled
- no runner start endpoint contact
- no OpenCode start
- no approval creation
- no approval consumption
- no request artifact mutation

## Evidence

Record:

- `runs/FP-MCP-121/contract-evidence.md`
- `runs/FP-MCP-121/verification.txt`

## Success Criteria

This packet is successful if:

1. The ledger readiness contract is explicit.
2. The contract defines `PASSED`, `FAILED`, `INCOMPLETE`, `DEFERRED`, and `NOT_EVALUATED`.
3. The contract defines required observations.
4. The contract defines required artifact properties.
5. The contract defines cross-packet evidence behavior.
6. The contract defines fixture semantics.
7. The contract states ledger readiness is non-authorizing.
8. The contract preserves disable-switch, runner-capability, and OpenCode independence.
9. The current expected state remains `DEFERRED`.
10. No code is changed.
11. Verification passes.

## Non-goals

This packet does not implement ledger readiness.

This packet does not implement an evidence ledger index.

This packet does not implement approval readiness.

This packet does not implement invalidation or quarantine lookup.

This packet does not enable execution.

This packet does not make start callable.

This packet does not add start to supported operations.

This packet does not contact the runner start endpoint.

This packet does not start OpenCode.

This packet does not consume approval.

This packet does not create approval evidence.

This packet does not implement `PRESENT_GUARDED`.

This packet does not implement `CALLABLE_GUARDED`.
