# FP-MCP-031 — Runner Start Response Contract

## Task

Define the ForgePilot private runner `/runner/start-run` response contract before any real execution harness is implemented.

## Goal

Create a stable, explicit, machine-checkable response contract for guarded runner start attempts.

FP-MCP-031 answers one question:

**What exact JSON shapes may the private runner return for accepted, rejected, not-implemented, protocol-error, and transport-failure start outcomes?**

This packet is contract-only.

It must not enable execution.

It must not start OpenCode.

It must not add a real execution harness.

---

## Background

FP-MCP-028 fixed request artifact lifecycle validation by separating:

```text
creationCommit
artifactCommit
currentCommit
```

FP-MCP-029 verified that the guarded start path can be reached after validation while preserving the non-execution boundary.

FP-MCP-030 fixed guarded start classification so a structured non-execution rejection is preserved as:

```text
EXECUTION_NOT_IMPLEMENTED
```

instead of being collapsed into:

```text
RUNNER_PROTOCOL_ERROR
RUNNER_REJECTED_REQUEST
```

The next step is to freeze the runner start response contract before any real execution behavior exists.

Without this contract, future execution work risks mixing:

```text
transport failure
protocol failure
policy rejection
not implemented
accepted execution
execution started
execution completed
```

into one ambiguous result shape.

FP-MCP-031 prevents that collapse.

---

## Scope Boundary

FP-MCP-031 may:

* add documentation for the runner `/runner/start-run` response contract
* define required fields for all start response classes
* define allowed start statuses
* define allowed reason-code categories
* define HTTP status expectations
* define bridge interpretation rules
* define safety invariants for non-execution responses
* update existing docs if appropriate
* add lightweight schema-like TypeScript constants or types if the MCP bridge already has a natural location for them
* add tests if the MCP bridge repo has an obvious test path
* verify the current non-implemented runner response against the new contract
* record verification artifacts

FP-MCP-031 must not:

* enable runner execution
* set `FORGEPILOT_RUNNER_EXECUTION_ENABLED=true`
* start OpenCode
* invoke OpenCode CLI
* invoke OpenCode API
* call model providers
* execute shell commands through the runner
* add a real execution harness
* add queueing
* add scheduling
* add worker processes
* mutate SQLite
* expose the private runner publicly
* commit tokens or secrets
* introduce routing logic

---

## Governing Principles

This packet is constrained by:

* P01 — ForgePilot records observations, not narratives.
* P02 — Trust cannot be retroactively created.
* P03 — ForgePilot does not optimize for favorable outcomes.
* P04 — Only admitted evidence may influence observatory outputs.
* P05 — Do not build infrastructure for evidence that does not yet exist.
* P06 — Classification follows observation.

---

## Contract Goals

The contract must ensure that:

1. Transport failures are distinguishable from runner decisions.
2. Malformed runner responses are distinguishable from policy rejections.
3. Non-implemented start behavior is distinguishable from failed execution.
4. Rejected starts are distinguishable from accepted starts.
5. Accepted starts require a runner run id.
6. `executionStarted` cannot be inferred from `accepted`.
7. `executionStarted` must be explicit.
8. Non-execution responses must always preserve `executionStarted: false`.
9. The bridge may classify safely without guessing.
10. Future execution support can be added without rewriting old evidence.

---

## Required Response Envelope

All structured runner `/runner/start-run` responses must use this top-level envelope:

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

If a field cannot be provided, it must be explicitly set to `null` where safe rather than silently omitted, unless omission is part of a documented protocol-error test case.

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

### ACCEPTED

Meaning:

The runner accepted the start request and created a durable runner run identity.

Required invariants:

```text
accepted: true
runnerRunId: non-empty string
executionStarted: explicit boolean
reasons: []
```

If execution is still disabled, `ACCEPTED` must not be returned.

If execution has not actually started, `executionStarted` must be false even if a run id was created.

### REJECTED

Meaning:

The runner understood the request and intentionally refused it for policy, validation, authorization, or safety reasons.

Required invariants:

```text
accepted: false
executionStarted: false
runnerRunId: null
reasons: non-empty array
```

Examples:

```text
RUNNER_EXECUTION_DISABLED
MODEL_NOT_ALLOWED
RUN_MODE_NOT_ALLOWED
REQUEST_ARTIFACT_INVALID
DIRTY_WORKING_TREE
UNSAFE_ARTIFACT_DIR
BASE_COMMIT_MISMATCH
```

### NOT_IMPLEMENTED

Meaning:

The runner understood the request, but the start operation is intentionally not implemented.

Required invariants:

```text
accepted: false
executionStarted: false
runnerRunId: null
reasons:
- EXECUTION_NOT_IMPLEMENTED
```

Recommended HTTP status:

```text
501
```

This is the current expected runner skeleton behavior.

### PROTOCOL_ERROR

Meaning:

The runner or bridge observed a malformed request or response that cannot safely be classified as an intentional policy rejection.

Required invariants:

```text
accepted: false
executionStarted: false
runnerRunId: null
reasons: non-empty array
```

Examples:

```text
RUNNER_PROTOCOL_ERROR
MISSING_REQUIRED_FIELD
INVALID_STATUS
MISMATCHED_PACKET_ID
MISMATCHED_REQUEST_ID
```

### TRANSPORT_FAILURE

Meaning:

The bridge could not reach the runner or could not obtain a structured response.

This is primarily a bridge-side classification and may not be returned by the runner itself.

Required invariants:

```text
runnerContacted: false
startEndpointContacted: false
accepted: false
executionStarted: false
runnerRunId: null
reasons: non-empty array
```

Examples:

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

A non-2xx HTTP status is not automatically a protocol error.

If the response body is structured ForgePilot runner JSON and satisfies the contract, the bridge must classify it by `status` and `reasons`.

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

## Reason Code Categories

Reason codes must be stable uppercase strings.

Recommended categories:

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

New reason codes must be additive and must not change the meaning of existing codes.

---

## Current Runner Skeleton Expected Response

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

The bridge may expose this as:

```text
started: false
accepted: false
executionStarted: false
runnerProtocolVersion: forgepilot-runner-v1
reasons:
- EXECUTION_NOT_IMPLEMENTED
```

---

## Verification Flow

1. Confirm ForgePilot repo is clean.
2. Confirm MCP bridge repo is clean or record implementation commit if changed.
3. Confirm runner is reachable.
4. Confirm runner execution remains disabled.
5. Confirm OpenCode execution remains disabled.
6. Verify the current runner non-implemented start response satisfies the contract.
7. Verify the MCP bridge preserves:
   ```text
   EXECUTION_NOT_IMPLEMENTED
   ```
8. Verify the MCP bridge does not emit:
   ```text
   RUNNER_PROTOCOL_ERROR
   RUNNER_REJECTED_REQUEST
   ```
   for a valid structured non-execution response.
9. Record verification artifacts.

A fresh request artifact may be created if needed, but this packet does not require a new request if FP-MCP-030 evidence is sufficient and directly referenced.

If a fresh request is created, it must be committed before validation.

---

## Result Classification

FP-MCP-031 should be classified as `PASS` if:

```text
contract documentation is added
allowed response statuses are defined
required fields are defined
bridge interpretation rules are defined
non-2xx structured JSON is explicitly allowed
current NOT_IMPLEMENTED response is contract-compliant
executionStarted remains false
OpenCode is not started
runner execution remains disabled
```

FP-MCP-031 should be classified as `PASS_WITH_IMPLEMENTATION_FOLLOWUP` if:

```text
the contract is documented
but current runner or bridge output does not fully match the documented envelope
```

FP-MCP-031 should be classified as `BLOCKED` if:

```text
the current runner response cannot be observed
or the bridge cannot safely verify the current response
```

FP-MCP-031 should be classified as `FAILED` if:

```text
executionStarted becomes true
OpenCode starts
runner execution is enabled
a shell command executes through the runner
a secret is committed
the runner becomes publicly exposed
```

---

## Expected Artifacts

Recommended documentation artifact:

```text
docs/runner-start-response-contract.md
```

Recommended verification artifacts:

```text
runs/FP-MCP-031/executor-result.md
runs/FP-MCP-031/verification.txt
```

If a fresh guarded start is performed, preserve safe generated state artifacts under:

```text
runs/FP-MCP-031/
```

---

## Verification Requirements

Verification must record:

* packet commit
* documentation commit
* whether any MCP bridge implementation commit was required
* whether any runner implementation commit was required
* runner reachability
* runner execution enabled state
* OpenCode execution enabled state
* observed start status
* observed reason codes
* whether `EXECUTION_NOT_IMPLEMENTED` is preserved
* whether `RUNNER_PROTOCOL_ERROR` is avoided for valid structured rejection
* whether `RUNNER_REJECTED_REQUEST` is avoided for valid structured rejection
* whether execution started
* whether OpenCode started
* final repository cleanliness

---

## Safety Confirmation Required

The executor result must explicitly state:

```text
OpenCode started: NO
OpenCode CLI invoked: NO
OpenCode API invoked: NO
Runner execution enabled: NO
Shell executed through runner: NO
Secrets committed: NO
Runner publicly exposed: NO
```

---

## Acceptance Criteria

* FP-MCP-031 packet is committed.
* Runner start response contract documentation is committed.
* Allowed status values are defined.
* Required response fields are defined.
* Bridge interpretation rules are defined.
* Non-2xx structured JSON rejection is explicitly classified as valid when contract-compliant.
* Current `NOT_IMPLEMENTED` runner skeleton response is verified against the contract.
* Execution remains disabled.
* OpenCode does not start.
* Verification artifacts are committed.
* Repository is clean after verification commit.

---

## Non-Goals

FP-MCP-031 does not:

* implement OpenCode execution
* enable runner execution
* add a real execution harness
* add model-provider calls
* add routing logic
* add scheduling
* add SQLite persistence
* add dashboards
* change authentication
* expose the private runner publicly

---

## Expected Follow-Up

After FP-MCP-031, ForgePilot can proceed toward one of two next packets:

1. A contract conformance implementation packet if the runner or bridge does not fully match the documented response envelope.
2. A guarded execution preflight contract packet defining what must be true before execution can ever be enabled.

No real execution should be implemented until the preflight contract exists and passes.
