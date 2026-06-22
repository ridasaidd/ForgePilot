# Runner Start Response Contract

## Purpose

This document defines the ForgePilot private runner `/runner/start-run` response contract.

The contract exists so the MCP bridge can distinguish:

```text
transport failure
protocol failure
policy rejection
not implemented
accepted start
execution started
```

without guessing and without collapsing meaningful runner observations into generic errors.

This document is intentionally defined before any real execution harness is added.

---

## Contract Status

Contract owner:

```text
ForgePilot MCP / private runner boundary
```

Introduced by:

```text
FP-MCP-031
```

Protocol version:

```text
forgepilot-runner-v1
```

Runner endpoint:

```text
POST /runner/start-run
```

Current expected implementation state:

```text
NOT_IMPLEMENTED
```

Current safety requirement:

```text
executionStarted: false
```

---

## Core Rule

A non-2xx HTTP response is not automatically a protocol error.

If the runner returns parseable ForgePilot runner JSON that satisfies this contract, the bridge must classify the response by its structured `status` and `reasons`.

A structured non-execution response must preserve the runner's explicit reason codes.

---

## Structured Response Envelope

All structured `/runner/start-run` responses should use this envelope:

```json
{
  "runnerProtocolVersion": "forgepilot-runner-v1",
  "status": "NOT_IMPLEMENTED",
  "accepted": false,
  "executionStarted": false,
  "packetId": "FP-MCP-031",
  "requestId": "REQ-...",
  "requestArtifactPath": "runs/FP-MCP-031/opencode-requests/REQ-....json",
  "requestArtifactSha256": "...",
  "baseCommit": "...",
  "runnerRunId": null,
  "artifactDir": "runs/FP-MCP-031/qwen-3.7-max-DESIGN_ONLY/",
  "checkedAt": "2026-06-22T00:00:00.000Z",
  "reasons": [
    "EXECUTION_NOT_IMPLEMENTED"
  ]
}
```

The exact optional fields may vary by status, but the core classification fields must remain stable.

---

## Required Core Fields

Every structured runner start response must include:

```text
runnerProtocolVersion
status
accepted
executionStarted
packetId
requestId
runnerRunId
checkedAt
reasons
```

Every response that refers to a request artifact should include:

```text
requestArtifactPath
requestArtifactSha256
baseCommit
artifactDir
```

If a field cannot be provided, it should be explicitly set to `null` where safe rather than silently omitted.

---

## Allowed Status Values

The runner start contract defines these status values:

```text
ACCEPTED
REJECTED
NOT_IMPLEMENTED
PROTOCOL_ERROR
TRANSPORT_FAILURE
```

---

## ACCEPTED

### Meaning

The runner accepted the start request and created a durable runner run identity.

### Required Invariants

```text
accepted: true
runnerRunId: non-empty string
executionStarted: explicit boolean
reasons: []
```

### Notes

`accepted: true` means the runner has accepted responsibility for a runner run identity.

It does not allow the bridge to infer that execution has started.

Execution start must be recorded explicitly through:

```text
executionStarted: true
```

If execution is still disabled, `ACCEPTED` must not be returned.

If execution has not actually started, `executionStarted` must be false even if a run id was created.

---

## REJECTED

### Meaning

The runner understood the request and intentionally refused it for policy, validation, authorization, or safety reasons.

### Required Invariants

```text
accepted: false
executionStarted: false
runnerRunId: null
reasons: non-empty array
```

### Example Reasons

```text
RUNNER_EXECUTION_DISABLED
MODEL_NOT_ALLOWED
RUN_MODE_NOT_ALLOWED
REQUEST_ARTIFACT_INVALID
REQUEST_ARTIFACT_MISSING
REQUEST_ARTIFACT_HASH_MISMATCH
DIRTY_WORKING_TREE
UNSAFE_ARTIFACT_DIR
BASE_COMMIT_MISMATCH
CREATION_COMMIT_MISSING
ARTIFACT_COMMIT_MISSING
CREATION_COMMIT_NOT_ANCESTOR_OF_ARTIFACT_COMMIT
ARTIFACT_COMMIT_NOT_REACHABLE_FROM_HEAD
```

---

## NOT_IMPLEMENTED

### Meaning

The runner understood the request, but the start operation is intentionally not implemented.

### Required Invariants

```text
accepted: false
executionStarted: false
runnerRunId: null
reasons:
- EXECUTION_NOT_IMPLEMENTED
```

### Recommended HTTP Status

```text
501
```

### Current Expected Skeleton Behavior

The current non-executing runner skeleton should return a structured `NOT_IMPLEMENTED` response equivalent to:

```json
{
  "runnerProtocolVersion": "forgepilot-runner-v1",
  "status": "NOT_IMPLEMENTED",
  "accepted": false,
  "executionStarted": false,
  "runnerRunId": null,
  "reasons": [
    "EXECUTION_NOT_IMPLEMENTED"
  ]
}
```

The MCP bridge may expose this as:

```text
started: false
accepted: false
executionStarted: false
runnerProtocolVersion: forgepilot-runner-v1
reasons:
- EXECUTION_NOT_IMPLEMENTED
```

---

## PROTOCOL_ERROR

### Meaning

The runner or bridge observed a malformed request or response that cannot safely be classified as an intentional policy rejection.

### Required Invariants

```text
accepted: false
executionStarted: false
runnerRunId: null
reasons: non-empty array
```

### Example Reasons

```text
RUNNER_PROTOCOL_ERROR
MISSING_REQUIRED_FIELD
INVALID_STATUS
MISMATCHED_PACKET_ID
MISMATCHED_REQUEST_ID
```

### Examples That Must Be Protocol Errors

```text
malformed JSON
missing runnerProtocolVersion
invalid status value
wrong packetId
wrong requestId
accepted true without runnerRunId
executionStarted true in a non-accepted response
```

---

## TRANSPORT_FAILURE

### Meaning

The bridge could not reach the runner or could not obtain a structured response.

This is primarily a bridge-side classification and may not be returned by the runner itself.

### Required Invariants

```text
runnerContacted: false
startEndpointContacted: false
accepted: false
executionStarted: false
runnerRunId: null
reasons: non-empty array
```

### Example Reasons

```text
RUNNER_UNREACHABLE
RUNNER_TIMEOUT
RUNNER_AUTH_FAILED
```

---

## HTTP Status Guidance

The contract separates HTTP transport semantics from ForgePilot semantic status.

Recommended mapping:

```text
200 or 202 -> ACCEPTED, only when accepted is true
400 -> REJECTED or PROTOCOL_ERROR
401 -> REJECTED or TRANSPORT_FAILURE, depending bridge classification
403 -> REJECTED or TRANSPORT_FAILURE, depending bridge classification
409 -> REJECTED
422 -> REJECTED or PROTOCOL_ERROR
501 -> NOT_IMPLEMENTED
503 -> REJECTED or TRANSPORT_FAILURE, depending whether structured JSON exists
```

Important rule:

```text
HTTP status alone does not determine ForgePilot classification.
```

The bridge must parse structured runner JSON when present.

---

## Bridge Interpretation Rules

The MCP bridge must follow these rules:

1. Attempt to parse structured JSON for both 2xx and non-2xx runner responses.
2. If JSON parsing fails, classify as `RUNNER_PROTOCOL_ERROR` or transport failure as appropriate.
3. If JSON parses but required fields are missing, classify as `RUNNER_PROTOCOL_ERROR`.
4. If `packetId` or `requestId` mismatches the request, classify as `RUNNER_PROTOCOL_ERROR`.
5. If `executionStarted: true` appears in a non-accepted response, classify as `RUNNER_PROTOCOL_ERROR`.
6. If `accepted: true` appears without `runnerRunId`, classify as `RUNNER_PROTOCOL_ERROR`.
7. If `status: NOT_IMPLEMENTED`, preserve `EXECUTION_NOT_IMPLEMENTED`.
8. If `status: REJECTED`, preserve runner reason codes.
9. Do not add `RUNNER_REJECTED_REQUEST` when the runner already returned a specific structured reason.
10. Do not emit `RUNNER_PROTOCOL_ERROR` for a valid structured rejection.

---

## Reason Code Rules

Reason codes must be stable uppercase strings.

New reason codes must be additive and must not change the meaning of existing codes.

Reason codes are observations, not narratives.

---

## Recommended Reason Code Categories

```text
EXECUTION_NOT_IMPLEMENTED
RUNNER_EXECUTION_DISABLED
RUNNER_REJECTED_REQUEST
RUNNER_PROTOCOL_ERROR
RUNNER_UNREACHABLE
RUNNER_TIMEOUT
RUNNER_AUTH_FAILED
REQUEST_ARTIFACT_INVALID
REQUEST_ARTIFACT_MISSING
REQUEST_ARTIFACT_HASH_MISMATCH
PACKET_MISSING
MODEL_NOT_ALLOWED
RUN_MODE_NOT_ALLOWED
DIRTY_WORKING_TREE
BASE_COMMIT_MISMATCH
CREATION_COMMIT_MISSING
ARTIFACT_COMMIT_MISSING
CREATION_COMMIT_NOT_ANCESTOR_OF_ARTIFACT_COMMIT
ARTIFACT_COMMIT_NOT_REACHABLE_FROM_HEAD
UNSAFE_ARTIFACT_DIR
MISSING_REQUIRED_FIELD
INVALID_STATUS
MISMATCHED_PACKET_ID
MISMATCHED_REQUEST_ID
```

---

## Safety Invariants

These invariants must hold until a future packet explicitly enables real execution:

```text
OpenCode started: NO
OpenCode CLI invoked: NO
OpenCode API invoked: NO
Runner execution enabled: NO
Shell executed through runner: NO
Secrets committed: NO
Runner publicly exposed: NO
```

For all current `NOT_IMPLEMENTED`, `REJECTED`, `PROTOCOL_ERROR`, and `TRANSPORT_FAILURE` outcomes:

```text
executionStarted: false
runnerRunId: null
```

---

## Evidence Compatibility

Future runner execution support must not rewrite the meaning of old response records.

Historical `NOT_IMPLEMENTED` records remain evidence that the start boundary was contacted but execution did not start.

Historical `REJECTED` records remain evidence of policy or validation refusal.

Historical `PROTOCOL_ERROR` records remain evidence of malformed or unsafe response interpretation.

Historical `TRANSPORT_FAILURE` records remain evidence that the bridge could not obtain a structured runner decision.

---

## Current Conformance Observation

As of FP-MCP-030, the guarded start path produced:

```text
started: false
accepted: false
runnerContacted: true
startEndpointContacted: true
executionStarted: false
runnerProtocolVersion: forgepilot-runner-v1
reasons:
- EXECUTION_NOT_IMPLEMENTED
```

This satisfies the intended `NOT_IMPLEMENTED` classification.

The bridge no longer emits these generic reasons for the structured non-execution response:

```text
RUNNER_PROTOCOL_ERROR
RUNNER_REJECTED_REQUEST
```

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
```

---

## Expected Future Work

Before any real execution harness is added, ForgePilot should define a guarded execution preflight contract.

That future contract should specify exactly what must be true before execution can ever be enabled, including repository state, request artifact state, admission policy, runner identity, model allowlist, and artifact recording requirements.
