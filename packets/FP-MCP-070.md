# FP-MCP-070 — Single-Use Approval Consumption Contract

## Status

DRAFT

## Type

Contract packet

## Depends On

- FP-MCP-066 — Real Human Approval Evidence Contract
- FP-MCP-067 — Real Human Approval Evidence Recorder
- FP-MCP-068 — Real Human Approval Evidence Validator Alignment
- FP-MCP-069 — Human Approval Expiration and Fresh Approval Revalidation

## Task

Define the contract for consuming real human approval evidence.

This packet defines when a usable approval becomes consumed, what consumption evidence must contain, and how future validators and start gates must reject consumed approval evidence.

FP-MCP-070 is contract-only.

It must not implement consumption.

It must not mutate approval artifacts.

It must not consume any approval.

It must not start execution.

---

## Goal

Create a precise single-use consumption contract for real human approval evidence.

FP-MCP-070 answers one question:

> Once a real human approval has been validated as usable, what must happen so it cannot be reused?

The expected result is:

```text
approvalConsumptionContractDefined: true
approvalConsumptionRecorderDefined: false
approvalConsumed: false
approvalMutated: false
executionAllowedNow: false
executionStarted: false
startEndpointContacted: false
opencodeStarted: false
```

This is a successful result.

---

## Governing Principles

FP-MCP-070 is constrained by:

```text
P01 — ForgePilot records observations, not narratives.
P02 — Trust cannot be retroactively created.
P03 — ForgePilot does not optimize for favorable outcomes.
P04 — Only admitted evidence may influence observatory outputs.
P06 — Classification follows observation.
```

Consumption must be an observed event.

Consumption must not be inferred from a successful execution.

Consumption must not mutate the original approval artifact.

Consumption must not be skipped because execution remains disabled.

A start attempt that reaches the consumption boundary must create explicit consumption evidence before the approval can be considered spent.

---

## Scope Boundary

FP-MCP-070 may:

* define approval consumption event shape
* define consumption timing
* define consumption identity and scope binding
* define validator expectations for consumed approval evidence
* define start-gate expectations for future consumption enforcement
* define replay protection requirements
* define failure classification for consumed approvals
* define run artifacts under `runs/FP-MCP-070/`
* define a contract document under `docs/`

FP-MCP-070 must not:

* create a consumption artifact
* mutate any approval artifact
* consume an approval
* add a consumption recorder tool
* add a consumption validator tool
* mark any approval as consumed
* mark any approval as revoked
* mark any approval as quarantined
* enable runner execution
* enable OpenCode execution
* call the runner start endpoint
* start OpenCode
* create a real `runnerRunId`
* create real execution artifacts
* weaken the global disable switch
* weaken request validation
* weaken pre-start evidence validation
* weaken state snapshot validation
* weaken human approval evidence validation
* bypass FP-MCP-064 start approval gate enforcement

---

## Background

FP-MCP-069 proved that the aligned validator can distinguish:

```text
expired committed real approval evidence -> invalid
fresh uncommitted real approval evidence -> invalid
fresh committed real approval evidence -> validator-derived usable approval evidence
```

That creates the next required boundary.

A usable approval must not be reusable.

The system must define when approval evidence is consumed and how future validation must reject it.

This packet defines the contract only.

---

## Core Model

Real human approval evidence is single-use.

A real approval may become usable only through validator derivation.

A usable real approval must become consumed once a guarded start attempt crosses the future consumption boundary.

Consumption is not the same as execution success.

Consumption is not the same as runner contact.

Consumption is not the same as OpenCode start.

Consumption is a separate evidence event that records:

```text
this approval was used for this guarded start attempt
```

The original approval artifact remains immutable.

The consumption event is appended as separate evidence.

---

## Consumption Timing Contract

A future packet must decide the exact start-path point where consumption happens.

FP-MCP-070 defines the required timing constraints.

Consumption must occur after:

```text
request artifact validation passed
pre-start evidence validation passed
state snapshot validation passed
human approval evidence validation passed
approval is fresh
approval is committed
approval is not revoked
approval is not quarantined
approval is not already consumed
```

Consumption must occur before:

```text
runner start endpoint contact
OpenCode start
external model execution
runnerRunId creation
real execution artifact creation
```

A consumed approval must not be reusable even if later gates fail.

A future packet must explicitly classify blocked-after-consumption attempts.

Example classification:

```text
approvalConsumed: true
executionStarted: false
startEndpointContacted: false
blockedAfterConsumption: true
blockedAfterConsumptionReason: <reason>
```

FP-MCP-070 does not implement that behavior.

---

## Consumption Evidence Artifact Contract

A future consumption recorder must create a separate JSON artifact.

It must use create-only writes.

It must not overwrite existing files.

It must live under an allowed ForgePilot evidence path:

```text
runs/<packetId>/approval-consumptions/<consumptionId>.json
```

The consumption id must be globally unique enough for the repository and must use the format:

```text
CONSUMPTION-<UTC timestamp>-<opaque suffix>
```

Example shape:

```json
{
  "schemaVersion": "FP-MCP-070",
  "artifactType": "human-approval-consumption",
  "consumptionId": "CONSUMPTION-20260623T000000000Z-abcdef12",
  "approvalId": "APPROVAL-20260623T095047127Z-6d1ed2e9",
  "approvalPath": "runs/FP-MCP-069/approvals/APPROVAL-20260623T095047127Z-6d1ed2e9.json",
  "consumptionState": "RECORDED",
  "consumptionKind": "EXECUTION_ENABLEMENT_SINGLE_USE",
  "consumedAction": "ALLOW_ONE_GUARDED_REMOTE_RUNNER_EXECUTION_ATTEMPT",
  "scope": {
    "packetId": "FP-MCP-036",
    "requestId": "REQ-20260622T144553300Z-fbbe8d82",
    "modelId": "qwen-3.7-max",
    "runMode": "DESIGN_ONLY",
    "repoCommit": "40b53dc",
    "branch": "main"
  },
  "approvalValidation": {
    "validatorBoundaryVersion": "FP-MCP-068",
    "approvalEvidenceContractVersion": "FP-MCP-066",
    "approvalEvidenceValid": true,
    "approvalUsableForExecution": true,
    "checkedAt": "2026-06-23T00:00:00.000Z"
  },
  "consumedAt": "2026-06-23T00:00:01.000Z",
  "consumedByTool": "<future consumption recorder tool>",
  "consumedByBoundaryVersion": "<future consumption boundary>",
  "startAttemptId": "<future attempt id>",
  "singleUse": true,
  "approvalConsumed": true,
  "approvalMutated": false,
  "executionAllowedNow": false,
  "executionStarted": false,
  "startEndpointContacted": false,
  "opencodeStarted": false,
  "notes": []
}
```

The example is illustrative.

FP-MCP-070 does not create this artifact.

---

## Required Consumption Fields

A future consumption artifact must include:

```text
schemaVersion
artifactType
consumptionId
approvalId
approvalPath
consumptionState
consumptionKind
consumedAction
scope
approvalValidation
consumedAt
consumedByTool
consumedByBoundaryVersion
startAttemptId
singleUse
approvalConsumed
approvalMutated
executionAllowedNow
executionStarted
startEndpointContacted
opencodeStarted
```

---

## Required Values

For a consumption event to be eligible for validation, these values must hold:

```text
artifactType == human-approval-consumption
consumptionState == RECORDED
consumptionKind == EXECUTION_ENABLEMENT_SINGLE_USE
consumedAction == ALLOW_ONE_GUARDED_REMOTE_RUNNER_EXECUTION_ATTEMPT
singleUse == true
approvalConsumed == true
approvalMutated == false
```

A consumption artifact must not claim:

```text
executionStarted: true
startEndpointContacted: true
opencodeStarted: true
```

unless a later execution packet explicitly defines that boundary.

Until then, consumption evidence remains non-executing evidence.

---

## Scope Binding Requirements

Consumption scope must exactly match the approval scope.

A consumption event must bind to exactly one:

```text
approvalId
packetId
requestId
modelId
runMode
repoCommit
branch
```

A consumption event must not bind to:

```text
all approvals
all packets
all requests
all models
all run modes
future approvals
future requests
multiple start attempts
background execution
recurring execution
```

Any scope mismatch must fail closed.

Any consumption event for an approval that does not match the start request must fail closed.

---

## Replay Protection Requirements

A consumed approval must fail future validation.

A future validator must reject an approval as consumed when any valid consumption event exists for that approval.

A future validator must detect:

```text
no consumption event
one valid consumption event
multiple consumption events for the same approval
malformed consumption event
scope-mismatched consumption event
uncommitted consumption event
consumption event after approval expiration
consumption event for revoked approval
consumption event for quarantined approval
```

Multiple consumption events for the same approval must not make the approval more trusted.

Multiple consumption events should be treated as an anomaly and fail closed unless a future packet defines an explicit recovery path.

---

## Validator Expectations For Future Packets

A future validator update must be able to derive:

```text
approvalEvidenceValid
approvalUsableForExecution
approvalConsumed
consumptionEvidencePresent
consumptionEvidenceValid
consumptionScopeMatchesApproval
consumptionScopeMatchesRequest
```

A fresh, committed, otherwise valid approval with no valid consumption event may be usable.

A consumed approval must not be usable.

Expected consumed approval validation result:

```text
approvalEvidenceValid: false
approvalUsableForExecution: false
approvalConsumed: true
reasons:
- APPROVAL_CONSUMED
```

If consumption evidence is malformed, the validator must fail closed with explicit reasons.

---

## Start Gate Expectations For Future Packets

A future start-gate consumption packet must ensure:

```text
human approval evidence is validated before consumption
consumption evidence is recorded before runner start boundary
consumed approval cannot be reused
start endpoint remains uncontacted unless all gates pass
OpenCode remains unstarted unless all gates pass
```

The start gate must not mutate the original approval artifact.

The start gate must not infer consumption from absence of an error.

The start gate must record explicit consumption evidence.

---

## Interaction With Existing Gates

Approval consumption is one boundary in the guarded start path.

Even if a fresh approval is validated and consumed, the guarded start path must still require:

```text
valid request artifact
valid explicit start request approval token
valid pre-start evidence
valid pre/post state snapshot evidence
global disable switch not active
runner execution capability enabled
OpenCode execution boundary satisfied
secret boundary satisfied
network boundary satisfied
```

FP-MCP-070 does not change those gates.

---

## Failure Classifications

Future packets must distinguish at least:

```text
APPROVAL_NOT_CONSUMED
APPROVAL_CONSUMED
APPROVAL_CONSUMPTION_MISSING
APPROVAL_CONSUMPTION_INVALID
APPROVAL_CONSUMPTION_SCOPE_MISMATCH
APPROVAL_CONSUMPTION_ARTIFACT_UNCOMMITTED
APPROVAL_CONSUMPTION_DUPLICATE
APPROVAL_CONSUMPTION_AFTER_EXPIRATION
APPROVAL_CONSUMPTION_FOR_REVOKED_APPROVAL
APPROVAL_CONSUMPTION_FOR_QUARANTINED_APPROVAL
```

These names may be refined later, but the distinctions must remain observable.

---

## Non-Goals

FP-MCP-070 does not:

```text
implement a consumption recorder
implement consumption validation
consume the FP-MCP-069 fresh approval
consume any approval
start the runner
start OpenCode
enable execution
create a real runnerRunId
create a real execution attempt
```

---

## Required Checkpoint Claims

After FP-MCP-070, the project should be able to state:

```text
approvalConsumptionContractDefined: true
approvalConsumptionRecorderDefined: false
approvalConsumptionValidatorDefined: false
approvalConsumed: false
approvalMutated: false
executionAllowedNow: false
executionStarted: false
startEndpointContacted: false
opencodeStarted: false
```

---

## Expected Artifacts

FP-MCP-070 should record:

```text
docs/single-use-approval-consumption-contract.md
runs/FP-MCP-070/executor-result.md
runs/FP-MCP-070/verification.txt
runs/FP-MCP-070/contract-result.json
```

---

## Verification

Verification should include:

1. Repository status.
2. OpenCode status.
3. Disable-switch status.
4. Confirmation that no consumption artifact was created.
5. Confirmation that no approval artifact was mutated.
6. Confirmation that no consumption recorder was added.
7. Confirmation that execution remains disabled.
8. Confirmation that the runner start endpoint was not contacted.
9. Confirmation that OpenCode was not started.

Expected verification result:

```text
approvalConsumptionContractDefined: true
approvalConsumptionRecorderDefined: false
approvalConsumptionValidatorDefined: false
approvalConsumed: false
approvalMutated: false
executionAllowedNow: false
executionStarted: false
startEndpointContacted: false
opencodeStarted: false
```

---

## Non-Authorization Statement

FP-MCP-070 does not authorize execution.

FP-MCP-070 does not consume approval evidence.

FP-MCP-070 does not create a consumption recorder.

FP-MCP-070 does not satisfy or bypass the human approval evidence gate.

FP-MCP-070 only defines the contract that future approval consumption evidence must satisfy.

---

## Recommended Next Packets

After FP-MCP-070, the next packets should remain narrow:

```text
FP-MCP-071 — Single-Use Approval Consumption Recorder
FP-MCP-072 — Consumed Approval Validator Enforcement
FP-MCP-073 — Start Request Approval Consumption Gate Enforcement
FP-MCP-074 — Approval Consumption Negative Fixture Revalidation
FP-MCP-075 — Human Approval Consumption Readiness Checkpoint
```

The next phase must not skip directly to execution.
