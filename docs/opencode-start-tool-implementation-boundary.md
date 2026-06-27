# OpenCode Start Tool Implementation Boundary

## Source Packet

FP-MCP-081 — OpenCode Start Tool Implementation Boundary

## Purpose

This document records the contract boundary for future MCP-side OpenCode start tooling.

The current ForgePilot MCP bridge is not execution-capable. OpenCode discovery is configured, but OpenCode execution is disabled. The remote runner is reachable, but its advertised operations are limited to capabilities and validate-request. The global execution disable switch remains active.

FP-MCP-081 therefore defines the boundary required before start tooling may be implemented or enabled. It does not implement start tooling.

## Core Boundary

A start tool is not a start permission.

A start tool implementation must be treated as execution-adjacent even before it is allowed to start execution.

Future start tooling must not bypass:

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

No future tool may infer permission from:

```text
request artifact existence
approval artifact existence
runner reachability
OpenCode discovery configuration
```

Execution must require explicit gate satisfaction.

## Required Future Tool Layers

Future MCP OpenCode start tooling must be layered.

### Layer 1 — Request Artifact Creation

Creates a durable request artifact only.

This layer must not:

```text
contact the runner start endpoint
start OpenCode
consume approval
create a runnerRunId
mark execution as started
```

This layer may exist while execution is globally disabled.

### Layer 2 — Request Validation

Validates the request structurally and against policy.

This layer must validate at least:

```text
packetId
requestId
model allowlist
run mode allowlist
packet existence
packet scope compatibility
expected artifacts
forbidden operation classes
approval reference when required
approval validity when supplied
approval unconsumed state when supplied
runner run-mode support
OpenCode boundary support
global disable status recording
```

This layer must not start execution.

### Layer 3 — Start Preflight

Evaluates whether all gates required for a start attempt are satisfied.

This layer must fail closed.

Required gates include:

```text
valid request artifact
packet permits start attempt
execution enablement policy permits start attempt
global disable switch inactive
operator disable switch inactive
runner execution capability present
OpenCode execution boundary satisfied
human approval valid and unconsumed
approval scope matches request
approval consumption can be recorded append-only
start endpoint contact authorized by packet
telemetry capture path available
quarantine path available
```

### Layer 4 — Approval Consumption Handoff

Approval consumption must occur before authorized start endpoint contact.

Required order:

```text
validate approval
confirm approval unconsumed
confirm request scope matches approval scope
write append-only consumption evidence
verify consumption evidence
only then permit start endpoint contact
```

If consumption write or verification status is unknown, the state must become ambiguous and fail closed.

### Layer 5 — Controlled Start Attempt

This is the only layer that may contact the runner start endpoint.

FP-MCP-081 does not authorize this layer.

A future packet must explicitly authorize, implement, and verify this behavior.

## Tool Naming Boundary

Future tool classes should distinguish non-executing and executing behavior:

```text
forgepilot_create_opencode_start_request
forgepilot_validate_opencode_start_request
forgepilot_evaluate_opencode_start_preflight
forgepilot_start_opencode_request
```

The first three classes must be non-executing.

Only the final class may be execution-capable, and only after a future packet explicitly authorizes it.

## Request Artifact Contract

A future request artifact should be durable and append-only.

Suggested path:

```text
runs/<packetId>/opencode-requests/<requestId>.json
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

## Failure Classification Requirement

Future start tooling must classify failures instead of collapsing them into generic failure.

Required classes include:

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

## Telemetry Requirement

Future start tooling must capture structured telemetry.

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

Missing telemetry must be explicitly recorded as unknown or null. Absence of telemetry must not be interpreted as success.

## Non-Authorization

FP-MCP-081 does not authorize execution.

FP-MCP-081 does not authorize implementation of execution-capable tooling.

FP-MCP-081 does not relax the global disable switch.

FP-MCP-081 does not authorize runner start endpoint contact.

FP-MCP-081 does not authorize OpenCode start.

FP-MCP-081 only defines the OpenCode start tool implementation boundary.

