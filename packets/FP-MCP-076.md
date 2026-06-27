# FP-MCP-076 — Post-Consumption Blocked Attempt Classification

## Status

DRAFT

## Type

Contract / classification packet

## Depends On

- FP-MCP-070 — Single-Use Approval Consumption Contract
- FP-MCP-071 — Single-Use Approval Consumption Recorder
- FP-MCP-072 — Consumed Approval Validator Enforcement
- FP-MCP-073 — Execution Preflight Consumed Approval Gate Enforcement
- FP-MCP-074 — Start Path Consumed Approval Gate Enforcement
- FP-MCP-075 — Human Approval Consumption Readiness Checkpoint

## Task

Define the classification contract for a guarded start attempt where approval evidence has been consumed, but execution still does not start.

FP-MCP-076 must not implement runtime behavior.

FP-MCP-076 must not create approval evidence.

FP-MCP-076 must not create consumption evidence.

FP-MCP-076 must not mutate approval artifacts.

FP-MCP-076 must not mutate consumption artifacts.

FP-MCP-076 must not enable execution.

FP-MCP-076 must not contact the runner start endpoint.

FP-MCP-076 must not start OpenCode.

---

## Goal

FP-MCP-076 answers one question:

> How should ForgePilot classify a start attempt after approval consumption when a later gate still blocks before execution begins?

The expected contract result is:

```text
postConsumptionBlockedAttemptClassificationDefined: true
blockedAfterConsumptionClassificationDefined: true
approvalConsumed: false
newConsumptionEvidenceCreated: false
approvalMutated: false
consumptionArtifactMutated: false
executionAllowedNow: false
executionStarted: false
startEndpointContacted: false
opencodeStarted: false
```

This is a successful result.

---

## Why This Packet Exists

FP-MCP-070 explicitly defined this unresolved boundary:

```text
A consumed approval must not be reusable even if later gates fail.
A future packet must explicitly classify blocked-after-consumption attempts.
```

The example classification from FP-MCP-070 was:

```text
approvalConsumed: true
executionStarted: false
startEndpointContacted: false
blockedAfterConsumption: true
blockedAfterConsumptionReason: <reason>
```

FP-MCP-076 resolves that classification boundary.

It does not implement the future start handoff.

It does not consume any approval.

It defines how such an event must be recorded and interpreted when the system eventually reaches that boundary.

---

## Core Classification

A post-consumption blocked attempt is an observed event where:

```text
approval was valid and usable before the consumption boundary
consumption evidence was created append-only
approval is now single-use spent
one or more later gates blocked
runner start endpoint was not contacted
OpenCode was not started
no runnerRunId was created
```

This state must not be classified as execution success.

This state must not be classified as approval failure.

This state must not make the approval reusable.

This state must not mutate the approval artifact.

This state must preserve the consumption artifact as valid append-only evidence.

---

## Required Classification Fields

Future runtime evidence for this state must include:

```text
postConsumptionAttemptClassified
postConsumptionAttemptClassification
blockedAfterConsumption
blockedAfterConsumptionReason
blockedAfterConsumptionReasons
blockedAfterConsumptionGate
approvalConsumed
consumptionEvidenceCreated
consumptionEvidenceId
consumptionEvidencePath
approvalMutated
consumptionArtifactMutated
executionAllowedNow
executionStarted
startEndpointContacted
opencodeStarted
runnerRunId
```

Required values for a blocked-after-consumption event:

```text
postConsumptionAttemptClassified: true
postConsumptionAttemptClassification: BLOCKED_AFTER_CONSUMPTION
blockedAfterConsumption: true
approvalConsumed: true
consumptionEvidenceCreated: true
approvalMutated: false
consumptionArtifactMutated: false
executionStarted: false
startEndpointContacted: false
opencodeStarted: false
runnerRunId: null
```

---

## Required Classification Reasons

Allowed `blockedAfterConsumptionReason` values must distinguish later-gate failures, including at least:

```text
DISABLE_SWITCH_ACTIVE
RUNNER_EXECUTION_DISABLED
OPENCODE_EXECUTION_DISABLED
PRE_START_EVIDENCE_INVALID
STATE_SNAPSHOT_INVALID
SECRET_BOUNDARY_BLOCKED
NETWORK_BOUNDARY_BLOCKED
RUNNER_CAPABILITY_MISSING
REMOTE_VALIDATION_FAILED
START_ENDPOINT_UNAVAILABLE
UNKNOWN_POST_CONSUMPTION_BLOCKER
```

The reason must describe the first or primary gate that blocked after consumption.

`blockedAfterConsumptionReasons` may include all observed later blockers.

The classification must not collapse all blocked-after-consumption cases into generic failure.

---

## Non-Reuse Rule

Once consumption evidence is created, the approval remains spent even if the attempt is later classified as blocked after consumption.

The system must preserve:

```text
approvalConsumed: true
approvalUsableForExecution: false
APPROVAL_CONSUMED
```

Future validators must continue to reject the approval.

Future preflight checks must continue to reject the approval.

Future start attempts must continue to reject the approval.

A blocked-after-consumption attempt must never roll back consumption.

---

## Relationship To Execution Success

The following states are distinct:

```text
CONSUMED_AND_STARTED
CONSUMED_AND_BLOCKED_BEFORE_START
CONSUMED_AND_START_STATUS_UNKNOWN
CONSUMED_WITH_INVALID_CONSUMPTION_EVIDENCE
NOT_CONSUMED_AND_BLOCKED
```

FP-MCP-076 defines only:

```text
CONSUMED_AND_BLOCKED_BEFORE_START
```

The packet does not define successful execution handoff.

The packet does not define rollback.

The packet does not define retries.

The packet does not authorize execution.

---

## Required Future Evidence Shape

A future post-consumption blocked-attempt artifact should be JSON and should include:

```json
{
  "schemaVersion": "FP-MCP-076",
  "artifactType": "post-consumption-blocked-attempt",
  "attemptId": "ATTEMPT-<UTC timestamp>-<opaque suffix>",
  "packetId": "<request packet id>",
  "requestId": "<request id>",
  "approvalId": "<approval id>",
  "consumptionId": "<consumption id>",
  "consumptionPath": "<consumption artifact path>",
  "postConsumptionAttemptClassified": true,
  "postConsumptionAttemptClassification": "BLOCKED_AFTER_CONSUMPTION",
  "blockedAfterConsumption": true,
  "blockedAfterConsumptionReason": "<primary later blocker>",
  "blockedAfterConsumptionReasons": [],
  "approvalConsumed": true,
  "consumptionEvidenceCreated": true,
  "approvalMutated": false,
  "consumptionArtifactMutated": false,
  "executionAllowedNow": false,
  "executionStarted": false,
  "startEndpointContacted": false,
  "opencodeStarted": false,
  "runnerRunId": null
}
```

This is an illustrative contract shape.

FP-MCP-076 must not create this artifact.

---

## Required Failure Distinctions

Future implementations must distinguish:

```text
approval rejected before consumption
approval consumed then later blocked
approval consumed then runner start attempted
approval consumed then start status unknown
approval consumption evidence malformed
approval consumption evidence duplicate
approval consumption evidence scope mismatch
approval consumption evidence not committed
```

The following classification is invalid:

```text
approvalConsumed: true
blockedAfterConsumption: false
executionStarted: false
startEndpointContacted: false
```

unless a future packet explicitly defines a different terminal state.

---

## Interaction With Current Evidence

The currently consumed FP-MCP-071 approval is not a post-consumption blocked attempt under FP-MCP-076.

Reason:

```text
FP-MCP-071 manually recorded non-executing consumption evidence for replay-protection validation.
No fresh approval crossed a future start-path consumption boundary.
No post-consumption start attempt was made.
```

Therefore FP-MCP-076 must not reclassify FP-MCP-071 as a blocked-after-consumption start attempt.

Existing evidence remains:

```text
approvalConsumed: true
executionStarted: false
startEndpointContacted: false
opencodeStarted: false
```

but its classification remains:

```text
NON_EXECUTING_CONSUMPTION_RECORDER_EVIDENCE
```

not:

```text
BLOCKED_AFTER_CONSUMPTION
```

This distinction prevents the checkpoint from rewriting history.

---

## Required Checkpoint Claims

FP-MCP-076 must explicitly claim:

```text
postConsumptionBlockedAttemptClassificationDefined: true
blockedAfterConsumptionClassificationDefined: true
currentConsumedFixtureReclassified: false
newApprovalEvidenceCreated: false
newConsumptionEvidenceCreated: false
approvalArtifactMutated: false
consumptionArtifactMutated: false
executionAllowedNow: false
executionStarted: false
startEndpointContacted: false
opencodeStarted: false
runnerRunIdCreated: false
```

---

## Verification Requirements

Verification must include:

1. Repository status.
2. OpenCode status.
3. Disable-switch status.
4. Confirmation that FP-MCP-076 is contract/classification-only.
5. Confirmation that no new approval evidence was created.
6. Confirmation that no new consumption evidence was created.
7. Confirmation that the FP-MCP-071 consumption artifact was not reclassified.
8. Confirmation that the original approval artifact was not mutated.
9. Confirmation that execution remains disabled.
10. Confirmation that the runner start endpoint was not contacted.
11. Confirmation that OpenCode was not started.

Expected verification result:

```text
postConsumptionBlockedAttemptClassificationDefined: true
currentConsumedFixtureReclassified: false
newApprovalEvidenceCreated: false
newConsumptionEvidenceCreated: false
approvalArtifactMutated: false
consumptionArtifactMutated: false
executionAllowedNow: false
executionStarted: false
startEndpointContacted: false
opencodeStarted: false
```

---

## Expected Artifacts

FP-MCP-076 should record:

```text
docs/post-consumption-blocked-attempt-classification.md
runs/FP-MCP-076/classification-contract-result.json
runs/FP-MCP-076/executor-result.md
runs/FP-MCP-076/verification.txt
```

---

## Non-Goals

FP-MCP-076 must not:

```text
create approval evidence
create consumption evidence
consume an approval
mutate approval artifacts
mutate consumption artifacts
reclassify FP-MCP-071 consumption evidence as a start attempt
implement the future start-path consumption handoff
enable runner execution
enable OpenCode execution
contact the runner start endpoint
start OpenCode
create a real runnerRunId
create real execution artifacts
change model routing
change model selection
call model providers
```

---

## Non-Authorization Statement

FP-MCP-076 does not authorize execution.

FP-MCP-076 does not enable execution.

FP-MCP-076 does not consume approval evidence.

FP-MCP-076 does not satisfy final execution readiness.

FP-MCP-076 only defines the classification boundary for future attempts that are blocked after approval consumption.

