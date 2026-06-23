# FP-MCP-071 — Single-Use Approval Consumption Recorder

## Status

DRAFT

## Type

Implementation packet

## Depends On

- FP-MCP-066 — Real Human Approval Evidence Contract
- FP-MCP-067 — Real Human Approval Evidence Recorder
- FP-MCP-068 — Real Human Approval Evidence Validator Alignment
- FP-MCP-069 — Human Approval Expiration and Fresh Approval Revalidation
- FP-MCP-070 — Single-Use Approval Consumption Contract

## Task

Implement a create-only recorder for single-use human approval consumption evidence.

The recorder must create an append-only consumption event for a valid approval without mutating the original approval artifact.

FP-MCP-071 must not enable execution.

FP-MCP-071 must not contact the runner start endpoint.

FP-MCP-071 must not start OpenCode.

---

## Goal

Add a non-executing MCP tool that records approval consumption evidence.

FP-MCP-071 answers one question:

> Can ForgePilot record that a validated human approval has been consumed, as append-only evidence, without mutating the approval artifact or approaching execution?

The expected result is:

```text
approvalConsumptionRecorderDefined: true
approvalConsumptionRecorded: true
approvalConsumed: true
approvalMutated: false
executionAllowedNow: false
executionStarted: false
startEndpointContacted: false
opencodeStarted: false
```

This is a successful result.

---

## Governing Principles

FP-MCP-071 is constrained by:

```text
P01 — ForgePilot records observations, not narratives.
P02 — Trust cannot be retroactively created.
P03 — ForgePilot does not optimize for favorable outcomes.
P04 — Only admitted evidence may influence observatory outputs.
P06 — Classification follows observation.
```

Consumption must be an observed event.

The approval artifact must remain immutable.

Consumption must not be inferred.

Consumption must not start execution.

Consumption must not contact the runner start endpoint.

---

## Required Tool

The bridge must add a tool named:

```text
forgepilot_record_human_approval_consumption
```

The tool must record a consumption artifact only.

It must not call the runner start endpoint.

It must not start OpenCode.

It must not enable execution.

It must not mutate the approval artifact.

---

## Required Inputs

The tool must require:

```text
packetId
approvalId
approvalPacketId
requestId
modelId
runMode
repoCommit
branch
approval
```

The required approval literal must be:

```text
RECORD_HUMAN_APPROVAL_CONSUMPTION
```

The canonical test input should consume the fresh approval recorded in FP-MCP-069:

```text
packetId: FP-MCP-071
approvalPacketId: FP-MCP-069
approvalId: APPROVAL-20260623T095047127Z-6d1ed2e9
requestId: REQ-20260622T144553300Z-fbbe8d82
modelId: qwen-3.7-max
runMode: DESIGN_ONLY
repoCommit: 40b53dc
branch: main
approval: RECORD_HUMAN_APPROVAL_CONSUMPTION
```

---

## Required Behavior

The consumption recorder must:

1. Validate the approval artifact using the aligned FP-MCP-068 validation semantics.
2. Require the approval to be committed.
3. Require the approval to be structurally valid.
4. Require the approval to match the exact expected scope.
5. Require the approval to be unexpired.
6. Require the approval to be unconsumed.
7. Require the approval to be unrevoked.
8. Require the approval to be unquarantined.
9. Create a consumption artifact under:

```text
runs/<packetId>/approval-consumptions/<consumptionId>.json
```

10. Use create-only writes.
11. Refuse overwrite.
12. Record the approval path.
13. Record the approval validation result used as the basis for consumption.
14. Record `approvalConsumed: true`.
15. Record `approvalMutated: false`.
16. Preserve `executionAllowedNow: false`.
17. Preserve `executionStarted: false`.
18. Preserve `startEndpointContacted: false`.
19. Preserve `opencodeStarted: false`.

---

## Required Consumption Artifact Shape

The consumption artifact must be JSON.

It must include:

```text
schemaVersion
boundaryVersion
artifactType
consumptionId
approvalId
approvalPacketId
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
notes
```

Required values:

```text
schemaVersion: FP-MCP-071
boundaryVersion: FP-MCP-071
artifactType: human-approval-consumption
consumptionState: RECORDED
consumptionKind: EXECUTION_ENABLEMENT_SINGLE_USE
consumedAction: ALLOW_ONE_GUARDED_REMOTE_RUNNER_EXECUTION_ATTEMPT
singleUse: true
approvalConsumed: true
approvalMutated: false
executionAllowedNow: false
executionStarted: false
startEndpointContacted: false
opencodeStarted: false
```

The `approvalValidation` object must include at least:

```text
validatorBoundaryVersion
approvalEvidenceContractVersion
approvalEvidenceValid
approvalValid
approvalUsableForExecution
humanApprovalRecorded
artifactCommitted
expirationValid
notRevoked
notConsumed
notQuarantined
checkedAt
reasons
```

---

## Required Output Fields

The tool response must include:

```text
schemaVersion
boundaryVersion
packetId
approvalPacketId
approvalId
requestId
modelId
runMode
repoCommit
branch
approvalConsumptionRecorderEvaluated
approvalConsumptionRecorderDefined
approvalConsumptionRecorded
consumptionArtifactPath
consumptionId
consumptionArtifactSha256
consumptionArtifactAlreadyExists
approvalValidationEvaluated
approvalEvidenceValid
approvalValid
approvalUsableForExecution
humanApprovalRecorded
approvalConsumed
approvalMutated
approvalRevoked
approvalQuarantined
executionAllowedNow
executionStarted
startEndpointContacted
opencodeStarted
disableSwitchStatusEvaluated
disableSwitchActive
runnerExecutionEnabled
opencodeExecutionEnabled
effectiveDisableReason
effectiveDisableScope
reasons
```

---

## Required Failure Behavior

The tool must fail closed and must not write a consumption artifact when:

```text
approval literal is wrong
approval artifact is missing
approval artifact path is unsafe
approval artifact JSON is invalid
approval artifact is uncommitted
approval validation fails
approval is expired
approval is already consumed
approval is revoked
approval is quarantined
approval scope mismatches the requested scope
consumption artifact already exists
disable-switch status cannot be evaluated
```

Failure output must preserve:

```text
approvalConsumptionRecorded: false
approvalConsumed: false
approvalMutated: false
executionAllowedNow: false
executionStarted: false
startEndpointContacted: false
opencodeStarted: false
```

---

## Important Boundary

Recording consumption does not mean execution is allowed.

After consumption is recorded, the approval is spent.

A future packet must align the validator so consumed approval evidence fails future validation.

FP-MCP-071 only records consumption evidence.

It does not enforce consumed-approval rejection yet.

---

## Verification Requirements

Verification must include:

1. Repository status before patch.
2. Bridge build success.
3. Tool discovery showing `forgepilot_record_human_approval_consumption`.
4. Consumption recorder probe using the FP-MCP-069 fresh approval.
5. Repository status showing the new consumption artifact.
6. Confirmation that the original approval artifact was not mutated.
7. Confirmation that execution remains disabled.
8. Confirmation that the runner start endpoint was not contacted.
9. Confirmation that OpenCode was not started.

Expected successful recorder result:

```text
approvalConsumptionRecorderDefined: true
approvalConsumptionRecorded: true
approvalConsumed: true
approvalMutated: false
executionAllowedNow: false
executionStarted: false
startEndpointContacted: false
opencodeStarted: false
```

---

## Expected Artifacts

FP-MCP-071 should record:

```text
runs/FP-MCP-071/approval-consumptions/<consumptionId>.json
runs/FP-MCP-071/executor-result.md
runs/FP-MCP-071/verification.txt
runs/FP-MCP-071/consumption-recorder-result.json
```

---

## Non-Goals

FP-MCP-071 must not:

```text
mutate the original approval artifact
update consumed fields inside the approval artifact
implement consumed approval validator enforcement
modify the start request path
enable execution
contact the runner start endpoint
start OpenCode
create a real runnerRunId
create real execution artifacts
```

---

## Non-Authorization Statement

FP-MCP-071 does not authorize execution.

FP-MCP-071 does not satisfy final execution readiness.

FP-MCP-071 only records append-only consumption evidence.

A consumed approval must be rejected by a future validator enforcement packet before the system can claim replay protection is complete.

---

## Recommended Next Packets

After FP-MCP-071, the next packets should remain narrow:

```text
FP-MCP-072 — Consumed Approval Validator Enforcement
FP-MCP-073 — Start Request Approval Consumption Gate Enforcement
FP-MCP-074 — Approval Consumption Negative Fixture Revalidation
FP-MCP-075 — Human Approval Consumption Readiness Checkpoint
```
