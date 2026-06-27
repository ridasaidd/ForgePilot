# FP-MCP-081 — OpenCode Start Tool Implementation Boundary

## Status

DRAFT

## Type

Contract packet

## Depends On

- FP-MCP-001 — OpenCode executor boundary
- FP-MCP-002 — Read-only OpenCode discovery boundary
- FP-MCP-044 — Execution disable switch status policy
- FP-MCP-070 — Single-use approval consumption contract
- FP-MCP-071 — Append-only consumption recorder
- FP-MCP-072 — Validator rejects consumed approval
- FP-MCP-073 — Preflight rejects consumed approval
- FP-MCP-074 — Start path rejects consumed approval
- FP-MCP-075 — Human approval consumption readiness checkpoint
- FP-MCP-076 — Post-consumption blocked-attempt classification
- FP-MCP-077 — Successful-start consumption handoff contract
- FP-MCP-078 — Execution enablement readiness review
- FP-MCP-079 — Ambiguous start-state classification contract
- FP-MCP-080 — Execution recovery and quarantine contract

## Current Observed State

At the time this packet is defined, the MCP bridge is not execution-capable.

Observed status:

```text
opencodeDiscoveryConfigured: true
opencodeExecutionEnabled: false
liveOpenCodeChecked: false
supportedRunModes:
- DESIGN_ONLY
allowedModels:
- deepseek-v4-pro-high
- qwen-3.7-max
executionDisabledReason:
FP-MCP-002 is read-only discovery only. Executor start tools are not implemented.
```

Remote runner status:

```text
runnerConfigured: true
runnerReachable: true
executionEnabled: false
supportedOperations:
- capabilities
- validate-request
supportedRunModes:
- DESIGN_ONLY
```

Execution disable state:

```text
globalDisableActive: true
executionAllowedNow: false
runnerExecutionEnabled: false
opencodeExecutionEnabled: false
startEndpointContacted: false
opencodeStarted: false
```

---

## Task

Define the implementation boundary for future MCP-side OpenCode start tooling.

FP-MCP-081 answers one question:

> What must exist before ForgePilot may implement an MCP tool capable of initiating an OpenCode-backed model run?

FP-MCP-081 is contract-only.

FP-MCP-081 must not implement start tooling.

FP-MCP-081 must not enable execution.

FP-MCP-081 must not relax the global disable switch.

FP-MCP-081 must not contact the runner start endpoint.

FP-MCP-081 must not start OpenCode.

FP-MCP-081 must not create a runnerRunId.

FP-MCP-081 must not consume an approval.

FP-MCP-081 must not mutate approval or consumption evidence.

---

## Goal

FP-MCP-081 defines the minimum safe boundary for future start-tool implementation.

Expected result:

```text
opencodeStartToolBoundaryDefined: true
startToolImplementationAuthorized: false
executionEnablementAuthorized: false
executionAllowedNow: false
globalDisableSwitchRelaxed: false
runnerStartEndpointContacted: false
opencodeStarted: false
runnerRunIdCreated: false
approvalConsumed: false
evidenceMutationAllowed: false
```

This is a successful result.

---

## Core Rule

A start tool is not a start permission.

A start tool implementation must be treated as execution-adjacent even before it is allowed to start execution.

A future MCP start tool must be unable to bypass:

```text
packet scope validation
request validation
model allowlist
run mode allowlist
global disable switch
operator disable switch
approval validation
single-use approval consumption rules
consumption verification
remote runner capability validation
execution enablement policy gates
ambiguous start-state classification
quarantine and recovery rules
telemetry capture requirements
```

No future tool may infer permission from the presence of a request artifact alone.

No future tool may infer permission from approval existence alone.

No future tool may infer permission from runner reachability alone.

No future tool may infer permission from OpenCode discovery configuration alone.

Execution must require explicit gate satisfaction.

---

## Required Future Tool Layers

Future MCP OpenCode start tooling must be split into distinct layers.

### Layer 1 — Request Artifact Creation

Creates a durable request artifact only.

Required properties:

```text
does not contact runner start endpoint
does not start OpenCode
does not consume approval
does not create runnerRunId
does not mark execution as started
records packetId
records requestId
records requestedModelId
records requestedRunMode
records requested artifact paths
records expected verification requirements
records current execution disable status
records current OpenCode status
records current runner capability status
```

This layer may exist while execution is globally disabled.

### Layer 2 — Request Validation

Validates whether the request is structurally and policy-valid.

Required checks:

```text
packetId is present
requestId is present
modelId is allowlisted
runMode is allowlisted
packet exists
packet scope is compatible with requested operation
expected artifacts are declared
forbidden operation classes are declared
approval reference is present if required
approval is valid if supplied
approval is unconsumed if supplied
runner supports requested run mode
OpenCode boundary supports requested model
global disable status is recorded
```

This layer must not start execution.

### Layer 3 — Start Preflight

Evaluates whether all gates required for a start attempt are satisfied.

Required checks:

```text
request artifact exists
request artifact is valid
packet scope permits start attempt
execution enablement policy permits start attempt
global disable switch is not active
operator disable switch is not active
runner execution capability is present
OpenCode execution boundary is satisfied
human approval is valid
human approval is unconsumed
approval scope matches request
approval consumption can be recorded append-only
start endpoint contact is authorized by packet
telemetry capture path is available
quarantine path is available
```

This layer must fail closed.

### Layer 4 — Approval Consumption Handoff

Creates append-only consumption evidence before any authorized start endpoint contact.

Required ordering:

```text
validate approval
confirm approval unconsumed
confirm request scope matches approval scope
write consumption evidence
verify consumption evidence
only then permit start endpoint contact
```

If consumption write or verification status is unknown, the state must become ambiguous and fail closed.

### Layer 5 — Controlled Start Attempt

Contacts the runner start endpoint only after all earlier gates pass.

A future controlled start attempt must record:

```text
startAttemptId
requestId
packetId
modelId
runMode
approvalId
consumptionId
startEndpointContacted
runnerResponseStatus
runnerRunId
opencodeStarted
startAttemptState
knownFacts
unknownFacts
telemetryArtifactPaths
quarantineArtifactPaths
```

This layer is not authorized by FP-MCP-081.

FP-MCP-081 only defines the boundary required before this layer may be implemented or enabled.

---

## Start Tool Naming Boundary

Future start tooling must use names that distinguish non-executing and executing behavior.

Allowed conceptual tool classes:

```text
forgepilot_create_opencode_start_request
forgepilot_validate_opencode_start_request
forgepilot_evaluate_opencode_start_preflight
forgepilot_start_opencode_request
```

The first three classes must be non-executing.

Only the final class may be execution-capable, and only after a future packet explicitly authorizes it.

A non-executing tool must not use names that imply execution occurred.

An executing tool must not hide execution behind names like:

```text
prepare
validate
inspect
dry-run
status
```

---

## Required Request Artifact Contract

A future request artifact must be durable and append-only.

Suggested path:

```text
runs/<packetId>/opencode-requests/<requestId>.json
```

Suggested id format:

```text
REQ-<UTC timestamp>-<opaque suffix>
```

Required fields:

```text
schemaVersion
artifactType
packetId
requestId
requestedModelId
requestedRunMode
requestState
createdAt
createdByTool
repoCommit
repoBranch
expectedArtifacts
requiredVerification
forbiddenActions
allowedActions
approvalRequired
approvalId
approvalPath
consumptionRequired
consumptionId
runnerStartEndpointContactAuthorized
executionEnablementAuthorized
executionAllowedNow
globalDisableActive
runnerExecutionEnabled
opencodeExecutionEnabled
startEndpointContacted
opencodeStarted
runnerRunId
boundaryVersion
```

Required initial values for a non-executing request artifact:

```text
artifactType: opencode-start-request
requestState: CREATED_NOT_STARTED
runnerStartEndpointContactAuthorized: false
executionEnablementAuthorized: false
executionAllowedNow: false
startEndpointContacted: false
opencodeStarted: false
runnerRunId: null
```

---

## Required Failure Classifications

Future start tooling must classify at least the following failures:

```text
REQUEST_ARTIFACT_MISSING
REQUEST_ARTIFACT_MALFORMED
PACKET_NOT_FOUND
PACKET_SCOPE_MISMATCH
MODEL_NOT_ALLOWLISTED
RUN_MODE_NOT_ALLOWLISTED
EXPECTED_ARTIFACTS_MISSING
FORBIDDEN_ACTION_DECLARED
APPROVAL_REQUIRED_BUT_MISSING
APPROVAL_INVALID
APPROVAL_CONSUMED
APPROVAL_SCOPE_MISMATCH
CONSUMPTION_WRITE_FAILED
CONSUMPTION_VERIFICATION_FAILED
CONSUMPTION_STATUS_UNKNOWN
GLOBAL_DISABLE_ACTIVE
OPERATOR_DISABLE_ACTIVE
RUNNER_EXECUTION_DISABLED
OPENCODE_EXECUTION_DISABLED
RUNNER_CAPABILITY_MISSING
OPENCODE_BOUNDARY_UNSATISFIED
START_ENDPOINT_CONTACT_NOT_AUTHORIZED
START_STATE_AMBIGUOUS
QUARANTINE_REQUIRED
```

Any unknown state at or after the approval-consumption boundary must fail closed.

---

## Telemetry Capture Requirement

Future start tooling must capture telemetry as structured evidence.

At minimum:

```text
packetId
requestId
attemptId
modelId
modelRole
runMode
repoBranch
repoCommit
startTime
endTime
durationMs
inputTokens
outputTokens
estimatedCost
filesTouched
artifactsCreated
testsRun
testsPassed
typecheckPassed
verificationResult
auditResult
scopeViolations
forbiddenActionAttempts
failureClass
admissionState
```

If telemetry is unavailable, the missing fields must be recorded as unknown or null explicitly.

Absence of telemetry must not be interpreted as success.

---

## Required Checkpoint Claims

FP-MCP-081 must explicitly claim:

```text
opencodeStartToolBoundaryDefined: true
requestArtifactContractDefined: true
startPreflightBoundaryDefined: true
approvalConsumptionHandoffRequired: true
controlledStartAttemptBoundaryDefined: true
telemetryCaptureRequired: true
failureClassificationRequired: true
startToolImplementationAuthorized: false
executionEnablementAuthorized: false
executionAllowedNow: false
globalDisableSwitchRelaxed: false
runnerStartEndpointContacted: false
opencodeStarted: false
runnerRunIdCreated: false
approvalConsumed: false
newApprovalEvidenceCreated: false
newConsumptionEvidenceCreated: false
approvalArtifactMutated: false
consumptionArtifactMutated: false
evidenceMutationAllowed: false
```

---

## Verification Requirements

Verification must include:

1. Repository status.
2. OpenCode status.
3. Remote runner capability status.
4. Execution disable switch status.
5. Confirmation that FP-MCP-081 is contract-only.
6. Confirmation that no start tool was implemented.
7. Confirmation that execution remains disabled.
8. Confirmation that the global disable switch remains active.
9. Confirmation that the runner start endpoint was not contacted.
10. Confirmation that OpenCode was not started.
11. Confirmation that no runnerRunId was created.
12. Confirmation that no approval was consumed.
13. Confirmation that no approval evidence was created.
14. Confirmation that no consumption evidence was created.
15. Confirmation that existing approval and consumption evidence were not mutated.

Expected verification result:

```text
opencodeStartToolBoundaryDefined: true
requestArtifactContractDefined: true
startPreflightBoundaryDefined: true
approvalConsumptionHandoffRequired: true
controlledStartAttemptBoundaryDefined: true
telemetryCaptureRequired: true
failureClassificationRequired: true
startToolImplementationAuthorized: false
executionEnablementAuthorized: false
executionAllowedNow: false
globalDisableSwitchRelaxed: false
runnerStartEndpointContacted: false
opencodeStarted: false
runnerRunIdCreated: false
approvalConsumed: false
evidenceMutationAllowed: false
```

---

## Expected Artifacts

FP-MCP-081 should record:

```text
docs/opencode-start-tool-implementation-boundary.md
runs/FP-MCP-081/contract-result.json
runs/FP-MCP-081/executor-result.md
runs/FP-MCP-081/verification.txt
```

---

## Non-Goals

FP-MCP-081 must not:

```text
implement start tooling
add execution-capable MCP tools
enable execution
relax the global disable switch
contact the runner start endpoint
start OpenCode
create a runnerRunId
create a live model run
consume an approval
create approval evidence
create consumption evidence
mutate existing evidence
change runner configuration
change OpenCode configuration
change model allowlists
change supported run modes
implement telemetry persistence
implement packet registry
implement prior-art discovery
refactor server.ts
```

---

## Non-Authorization Statement

FP-MCP-081 does not authorize execution.

FP-MCP-081 does not authorize implementation of execution-capable tooling.

FP-MCP-081 does not relax the global disable switch.

FP-MCP-081 does not authorize runner start endpoint contact.

FP-MCP-081 does not authorize OpenCode start.

FP-MCP-081 only defines the OpenCode start tool implementation boundary.

