# Guarded Execution Preflight Contract

## Purpose

This document defines the preflight contract that must pass before ForgePilot may ever permit real remote runner execution.

The contract exists to keep a hard boundary between:

```text
validated request
guarded start path
execution preflight
execution permission
execution start
execution result
```

ForgePilot must not infer execution permission from the absence of failures.

Execution permission must be explicitly observed through preflight gates.

Introduced by:

```text
FP-MCP-033
```

Current expected result:

```text
preflightEligible: false
executionPermitted: false
executionStarted: false
reasons:
- EXECUTION_DISABLED
```

---

## Core Rule

Real execution is impossible unless every required preflight gate explicitly passes.

The preflight model is affirmative:

```text
eligible only if all required gates explicitly pass
```

not negative:

```text
eligible if no gate failed
```

---

## Contract Status

Current runner state:

```text
non-executing skeleton
```

Current supported run mode:

```text
DESIGN_ONLY
```

Current execution state:

```text
runner executionEnabled: false
OpenCode executionEnabled: false
```

Therefore, under this contract, the current system is expected to be validation-capable but not execution-eligible.

---

## Preflight Axes

The preflight contract evaluates these independent axes:

```text
request artifact eligibility
repository state
runner identity
runner capability
execution enablement
model eligibility
run-mode eligibility
artifact path safety
provenance completeness
state artifact readiness
auditability
secrets boundary
network exposure boundary
```

These axes must not be collapsed into one generic `valid` flag.

---

## Preflight States

Every preflight gate must produce one of these states:

```text
PASSED
FAILED
BLOCKED
NOT_EVALUATED
```

### PASSED

The condition was evaluated and passed.

### FAILED

The condition was evaluated and failed.

### BLOCKED

The condition could not be evaluated because a prerequisite was missing or unsafe.

### NOT_EVALUATED

The condition was intentionally not evaluated in the current operation.

---

## Required Output Shape

A preflight result should be structured and machine-readable.

Recommended shape:

```json
{
  "schemaVersion": "FP-MCP-033",
  "packetId": "FP-MCP-033",
  "requestId": "REQ-...",
  "preflightEligible": false,
  "executionPermitted": false,
  "executionStarted": false,
  "checkedAt": "2026-06-22T00:00:00.000Z",
  "gates": {
    "requestArtifact": "PASSED",
    "lifecycle": "PASSED",
    "packet": "PASSED",
    "model": "PASSED",
    "runMode": "PASSED",
    "runnerIdentity": "PASSED",
    "runnerCapability": "PASSED",
    "executionEnablement": "FAILED",
    "opencodeBoundary": "PASSED",
    "artifactRecording": "NOT_EVALUATED",
    "secretsBoundary": "PASSED",
    "networkExposure": "PASSED"
  },
  "reasons": [
    "EXECUTION_DISABLED"
  ]
}
```

The exact implementation may evolve, but the contract must preserve:

```text
preflightEligible
executionPermitted
executionStarted
per-gate state
reason codes
checkedAt
```

---

## Gate 1 — Request Artifact

The request artifact gate must verify:

```text
request artifact exists
request artifact is committed
request artifact path is safe
request artifact schema is recognized
request id matches requested id
packet id matches requested packet
model id is present
run mode is present
executionStarted in request artifact is false
baseCommit is present
artifactDir is present
artifactDir is safe
```

Failure examples:

```text
REQUEST_ARTIFACT_MISSING
REQUEST_ARTIFACT_INVALID
REQUEST_ARTIFACT_HASH_MISMATCH
REQUEST_ID_MISMATCH
REQUEST_PACKET_MISMATCH
UNSAFE_ARTIFACT_DIR
```

---

## Gate 2 — Lifecycle

The lifecycle gate must verify:

```text
creationCommit exists
artifactCommit exists
creationCommit is ancestor of artifactCommit
artifactCommit is reachable from current HEAD
current HEAD is the validation commit
working tree is clean
```

Failure examples:

```text
CREATION_COMMIT_MISSING
ARTIFACT_COMMIT_MISSING
CREATION_COMMIT_NOT_ANCESTOR_OF_ARTIFACT_COMMIT
ARTIFACT_COMMIT_NOT_REACHABLE_FROM_HEAD
DIRTY_WORKING_TREE
```

---

## Gate 3 — Packet

The packet gate must verify:

```text
packet exists
packet is committed
packet id is valid
packet permits the requested operation
packet does not authorize broader execution than requested
```

Failure examples:

```text
PACKET_MISSING
INVALID_PACKET_ID
PACKET_NOT_AUTHORIZED
```

---

## Gate 4 — Model

The model gate must verify:

```text
model id is allowlisted
model id matches request artifact
model id matches artifact directory
model id is permitted for the requested run mode
```

Failure examples:

```text
MODEL_NOT_ALLOWED
MODEL_MISMATCH
```

---

## Gate 5 — Run Mode

The run-mode gate must verify:

```text
run mode is allowlisted
run mode matches request artifact
run mode matches artifact directory
run mode has a documented execution policy
```

Current allowed run mode:

```text
DESIGN_ONLY
```

Failure examples:

```text
RUN_MODE_NOT_ALLOWED
RUN_MODE_MISMATCH
RUN_MODE_POLICY_MISSING
```

---

## Gate 6 — Runner Identity

The runner identity gate must verify:

```text
runner is configured
runner is reachable
runner protocol version is recognized
runner host role is dev-execution-plane
bridge host role is staging-control-plane
runner endpoint is private
runner capabilities endpoint reports expected protocol
```

Failure examples:

```text
RUNNER_UNCONFIGURED
RUNNER_UNREACHABLE
RUNNER_PROTOCOL_ERROR
RUNNER_HOST_ROLE_MISMATCH
BRIDGE_HOST_ROLE_MISMATCH
NETWORK_BOUNDARY_VIOLATION
```

---

## Gate 7 — Runner Capability

The runner capability gate must verify:

```text
runner supports capabilities
runner supports validate-request
runner supports start-run only through guarded contract
runner reports executionEnabled explicitly
runner reports supported run modes
runner reports allowed models
```

Failure examples:

```text
RUNNER_CAPABILITY_MISSING
RUNNER_PROTOCOL_ERROR
MODEL_NOT_ALLOWED
RUN_MODE_NOT_ALLOWED
```

---

## Gate 8 — Execution Enablement

The execution enablement gate must verify:

```text
execution enablement state is explicit
execution enablement source is recorded
execution enablement is false unless a future packet explicitly authorizes true
```

Current expected result:

```text
executionEnabled: false
```

Therefore, current preflight must report:

```text
preflightEligible: false
executionPermitted: false
executionStarted: false
reasons:
- EXECUTION_DISABLED
```

This is a healthy result.

---

## Gate 9 — OpenCode Boundary

The OpenCode boundary gate must verify:

```text
OpenCode execution is disabled
OpenCode discovery does not start OpenCode
OpenCode CLI is not invoked during preflight
OpenCode API is not invoked during preflight
model provider is not contacted during preflight
```

Failure examples:

```text
OPENCODE_BOUNDARY_VIOLATION
OPENCODE_EXECUTION_ENABLED
OPENCODE_CLI_INVOKED
OPENCODE_API_INVOKED
MODEL_PROVIDER_CONTACTED
```

---

## Gate 10 — Artifact Recording

The artifact recording gate must verify that future execution, if ever enabled, can record:

```text
pre-start state
start request state
runner response state
post-start state
stdout path or null
stderr path or null
exit code or null
timing metadata
runner run id
request artifact digest
source commit
artifact directory
reason codes
```

This contract does not require execution artifacts to exist now.

It requires that the future execution harness cannot start without a defined artifact recording plan.

Failure examples:

```text
ARTIFACT_RECORDING_UNDEFINED
STATE_ARTIFACT_WRITE_FAILED
```

---

## Gate 11 — Secrets Boundary

The secrets boundary gate must verify:

```text
runner token is not recorded
environment secrets are not recorded
authorization headers are not recorded
model provider tokens are not recorded
logs do not include secrets
artifacts do not include secrets
```

Failure examples:

```text
SECRETS_BOUNDARY_VIOLATION
SECRET_IN_ARTIFACT
SECRET_IN_LOG
```

---

## Gate 12 — Network Exposure

The network exposure gate must verify:

```text
private runner remains private
runner is not publicly exposed
bridge may contact runner only through configured private endpoint
capabilities endpoint is safe
start endpoint is guarded
```

Failure examples:

```text
NETWORK_BOUNDARY_VIOLATION
RUNNER_PUBLICLY_EXPOSED
UNGUARDED_START_ENDPOINT
```

---

## Reason Code Rules

Reason codes must be stable uppercase strings.

Recommended reason codes:

```text
PRECHECK_FAILED
PRECHECK_BLOCKED
EXECUTION_DISABLED
RUNNER_UNREACHABLE
REQUEST_ARTIFACT_INVALID
REQUEST_ARTIFACT_MISSING
REQUEST_ARTIFACT_HASH_MISMATCH
REQUEST_LIFECYCLE_INVALID
PACKET_NOT_AUTHORIZED
MODEL_NOT_ALLOWED
RUN_MODE_NOT_ALLOWED
UNSAFE_ARTIFACT_DIR
SECRETS_BOUNDARY_VIOLATION
NETWORK_BOUNDARY_VIOLATION
OPENCODE_BOUNDARY_VIOLATION
ARTIFACT_RECORDING_UNDEFINED
```

New reason codes must be additive.

Existing reason-code meanings must not be changed.

---

## Execution Permission Rule

A future runner may only set:

```text
executionPermitted: true
```

if all required gates are:

```text
PASSED
```

and if a future packet explicitly authorizes execution enablement.

Until that future packet exists, the only contract-compliant result is:

```text
executionPermitted: false
```

---

## Current Expected Observation

For the current system, a conforming preflight observation should report:

```text
runner reachable: true
runner executionEnabled: false
OpenCode executionEnabled: false
preflightEligible: false
executionPermitted: false
executionStarted: false
reasons:
- EXECUTION_DISABLED
```

This is not a failure.

It is the expected safe state.

---

## Non-Goals

This contract does not:

```text
implement OpenCode execution
enable runner execution
add a real execution harness
add model-provider calls
add routing logic
add scheduling
add SQLite persistence
add dashboards
change authentication
expose the private runner publicly
make execution possible
```

---

## Future Work

After this contract, ForgePilot may safely proceed to one of two packets:

1. Implement a non-executing preflight validation tool that returns this gate structure.
2. Define the execution artifact contract for a future runner harness.

Neither follow-up should enable execution.
