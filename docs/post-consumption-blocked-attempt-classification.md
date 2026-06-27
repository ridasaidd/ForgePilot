# Post-Consumption Blocked Attempt Classification

## Packet

FP-MCP-076 — Post-Consumption Blocked Attempt Classification

## Result

PASS

## Classification Defined

FP-MCP-076 defines the future classification:

```text
BLOCKED_AFTER_CONSUMPTION
```

This classification applies when:

```text
approval consumption evidence has been created
the approval is now single-use spent
a later gate blocks before runner start endpoint contact
execution does not start
OpenCode does not start
no runnerRunId is created
```

## Required Future State

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

## Required Reason Family

Allowed primary blocked-after-consumption reasons include:

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

The reason must identify a later gate after consumption.

## Non-Reuse Rule

Once consumption evidence is created, the approval remains spent even if a later gate blocks.

The system must preserve:

```text
approvalConsumed: true
approvalUsableForExecution: false
APPROVAL_CONSUMED
```

A blocked-after-consumption attempt must never roll back consumption.

## Current Evidence Boundary

The existing FP-MCP-071 consumption artifact was observed as:

```text
schemaVersion: FP-MCP-071
boundaryVersion: FP-MCP-071
artifactType: human-approval-consumption
consumptionId: CONSUMPTION-20260623T111327467Z-0cfc7dee
approvalConsumed: true
executionStarted: false
startEndpointContacted: false
opencodeStarted: false
```

FP-MCP-076 does **not** reclassify this artifact as a post-consumption blocked start attempt.

Its classification remains:

```text
NON_EXECUTING_CONSUMPTION_RECORDER_EVIDENCE
```

## Safety Boundary

```text
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

## Current Runtime Safety State

```text
OpenCode execution enabled: false
runner execution enabled: false
global disable switch active: true
executionAllowedNow: false
```

## Conclusion

FP-MCP-076 passes.

The post-consumption blocked-attempt classification boundary is now defined without enabling execution, creating new consumption evidence, mutating existing evidence, contacting the runner start endpoint, or starting OpenCode.

