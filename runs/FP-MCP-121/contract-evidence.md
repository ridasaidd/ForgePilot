# FP-MCP-121 Contract Evidence

Result: PASSED

Defined the evidence ledger readiness contract for guarded start preflight reports.

## Packet

- FP-MCP-121 — Guarded Preflight Report Evidence Ledger Readiness Contract

## Packet Commit

- `b176ebc Add FP-MCP-121 evidence ledger readiness contract packet`

## Contract Status

This packet is contract-only.

No implementation was changed.

No MCP bridge code was changed.

No runner code was changed.

No OpenCode configuration was changed.

## Contract Definition

`evidenceLedgerReadiness` answers:

```text
Are all evidence artifacts required by the current guarded-start preflight contract present, committed, immutable for the current evaluation, and cross-referenced well enough to support a future guarded-start decision?
```

It does not answer:

```text
Should execution start?
```

## Non-Authorizing Semantics

The contract explicitly states that ledger readiness:

- does not authorize execution
- does not consume approval
- does not make runner start callable
- does not override the disable switch
- does not override runner capability state
- does not override OpenCode readiness
- does not imply a runner may start

## Required Gate Shape

The gate uses the standard guarded preflight gate shape:

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

## Required Input Context

The contract defines that ledger readiness evaluation requires:

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

## Required Ledger Observations

The contract defines required artifact observations:

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

## Required Artifact Properties

The contract requires every required artifact to be:

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

## Cross-Packet Evidence

The contract allows cross-packet evidence only when the relationship is explicit.

Current example chain:

- FP-MCP-117 owns the request artifact.
- FP-MCP-118 owns the approval fixture.
- FP-MCP-119 owns the pre-start evidence fixture.
- FP-MCP-120 owns the state snapshot fixture.

The contract requires any ledger readiness check to report the source packet and artifact path for each dependency.

Cross-packet use must not silently collapse evidence into the current packet.

## Fixture Semantics

The contract defines that dry-run fixtures may satisfy ledger presence for non-executing readiness tests only.

They may support:

```text
Evidence exists and is internally consistent enough to be observed.
```

They must not imply:

```text
Execution is approved.
```

They must not imply:

```text
The runner may start.
```

## Approval Evidence Levels

The contract defines three distinct approval evidence levels:

1. Missing approval id
2. Supplied but non-authorizing approval fixture
3. Real scoped approval evidence

The ledger must distinguish all three.

Current FP-MCP-118 approval fixture evidence may improve observation specificity, but it must not make `humanApprovalEvidence` pass for execution.

## Independence Rules

The contract defines independence from:

- disable switch state
- runner capability state
- OpenCode readiness state

Ledger readiness may become structurally ready while those gates still fail.

However, ledger readiness must not override:

- `disableSwitch: FAILED`
- `runnerCapabilityState: FAILED`
- `opencodeReadiness: FAILED`
- `executionPermitted: false`
- `eligibleForFutureGuardedStart: false`
- `runnerStartEndpointContacted: false`
- `startEndpointContacted: false`
- `opencodeStarted: false`

## State Semantics

### PASSED

Allowed only when all required artifact observations are present, committed, readable, internally consistent, hash-matching, explicit, and not invalidated or quarantined.

Meaning:

```text
The evidence ledger is structurally ready for this preflight evaluation.
```

Not meaning:

```text
Execution may start.
```

### FAILED

Required when evidence is present but contradictory or unsafe.

Examples:

- artifact hash mismatch
- request id mismatch
- model id mismatch
- run mode mismatch
- unsafe artifact path
- ambiguous cross-packet dependency
- contradictory evidence
- invalidated evidence
- quarantined evidence

### INCOMPLETE

Required when expected evidence is missing.

Examples:

- request artifact missing
- pre-start evidence missing
- state snapshot evidence missing
- expected approval artifact missing
- required hash missing
- required path missing
- source packet missing

### DEFERRED

Allowed when the contract cannot yet determine readiness because a prerequisite standard or implementation is not available.

Examples:

- ledger readiness implementation not present
- approval readiness standard not implemented
- invalidation/quarantine ledger not queryable
- artifact index not defined
- cross-packet dependency index not defined

### NOT_EVALUATED

Allowed only when the guarded preflight report did not attempt the ledger check.

## Reason Codes

The contract defines reason code groups for:

- deferred states
- incomplete states
- failed states

Current expected reason remains:

```text
EVIDENCE_LEDGER_NOT_READY
```

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

This remains correct even after FP-MCP-120 because the readiness standard has been defined but not implemented.

## Conclusion

FP-MCP-121 successfully defines the evidence ledger readiness contract and keeps the current `DEFERRED` behavior correct.
