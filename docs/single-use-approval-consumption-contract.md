# Single-Use Approval Consumption Contract

Packet: FP-MCP-070  
Type: Contract / boundary definition  
Status: Recorded as non-executing contract evidence

## Purpose

This document records the single-use approval consumption boundary for ForgePilot real human approval evidence.

FP-MCP-069 proved that a fresh committed real approval can become validator-derived usable approval evidence, while expired and uncommitted approvals fail closed. FP-MCP-070 defines the next boundary: once such an approval is used for a guarded start attempt, it must not be reusable.

## Core Rule

A real human approval is single-use.

Consumption must be recorded as a separate evidence artifact.

The original approval artifact must remain immutable.

Consumption must not be inferred from execution success, runner contact, OpenCode start, or absence of error.

## Consumption Timing

A future implementation must record consumption only after these gates pass:

```text
request artifact validation
pre-start evidence validation
state snapshot validation
human approval evidence validation
approval freshness validation
approval commit provenance validation
not-revoked validation
not-quarantined validation
not-already-consumed validation
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

## Consumption Artifact Shape

A future consumption recorder must write a create-only JSON artifact under:

```text
runs/<packetId>/approval-consumptions/<consumptionId>.json
```

The artifact must include at least:

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

The required artifact type is:

```text
human-approval-consumption
```

The required consumption kind is:

```text
EXECUTION_ENABLEMENT_SINGLE_USE
```

The required consumed action is:

```text
ALLOW_ONE_GUARDED_REMOTE_RUNNER_EXECUTION_ATTEMPT
```

## Scope Binding

Consumption scope must exactly match the approval scope.

It must bind to exactly one:

```text
approvalId
packetId
requestId
modelId
runMode
repoCommit
branch
```

Any scope mismatch must fail closed.

A consumption event must not cover all approvals, all packets, all requests, all models, all run modes, future requests, recurring execution, or background execution.

## Replay Protection

A consumed approval must fail future validation.

A future validator must derive:

```text
approvalConsumed: true
approvalEvidenceValid: false
approvalUsableForExecution: false
reasons:
- APPROVAL_CONSUMED
```

Multiple consumption events for the same approval must be treated as an anomaly and fail closed unless a later packet defines an explicit recovery path.

## Non-Execution Boundary

FP-MCP-070 does not implement consumption and does not create consumption evidence.

The current observed boundary remains:

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

## Next Packets

The next narrow packets should be:

```text
FP-MCP-071 — Single-Use Approval Consumption Recorder
FP-MCP-072 — Consumed Approval Validator Enforcement
FP-MCP-073 — Start Request Approval Consumption Gate Enforcement
FP-MCP-074 — Approval Consumption Negative Fixture Revalidation
FP-MCP-075 — Human Approval Consumption Readiness Checkpoint
```
