# FP-MCP-032 — Runner Start Status Vocabulary Alignment

## Task

Align guarded start state artifact status vocabulary with the FP-MCP-031 runner start response contract.

## Goal

Fix the implementation follow-up identified by FP-MCP-031.

FP-MCP-032 answers one question:

**Can ForgePilot record guarded start state artifacts using the FP-MCP-031 contract status vocabulary without changing execution behavior?**

This packet is a status vocabulary alignment task.

It must not enable execution.

It must not start OpenCode.

It must not add a real execution harness.

---

## Background

FP-MCP-031 documented the runner `/runner/start-run` response contract.

The contract defines these allowed semantic status values:

```text
ACCEPTED
REJECTED
NOT_IMPLEMENTED
PROTOCOL_ERROR
TRANSPORT_FAILURE
```

FP-MCP-031 then verified the current non-executing runner skeleton.

The guarded start result correctly preserved:

```text
EXECUTION_NOT_IMPLEMENTED
```

and correctly avoided:

```text
RUNNER_PROTOCOL_ERROR
RUNNER_REJECTED_REQUEST
```

However, the generated guarded start state artifact still recorded:

```text
status: RUNNER_REJECTED
```

The contract expects the current skeleton non-execution response to record:

```text
status: NOT_IMPLEMENTED
```

FP-MCP-032 aligns that state artifact vocabulary with the contract.

---

## Scope Boundary

FP-MCP-032 may:

* update MCP bridge guarded start state recording
* derive state artifact `status` from structured runner start response status when available
* map `EXECUTION_NOT_IMPLEMENTED` to `NOT_IMPLEMENTED` when the runner response is structured and non-executing
* preserve existing safety fields
* update bridge-side result shape if needed
* rebuild the MCP bridge generated output locally
* restart the MCP bridge service
* create a fresh FP-MCP-032 request artifact
* validate the request artifact locally
* validate through the private runner endpoint
* call guarded start exactly once after validation passes
* record verification artifacts

FP-MCP-032 must not:

* enable runner execution
* set `FORGEPILOT_RUNNER_EXECUTION_ENABLED=true`
* start OpenCode
* invoke OpenCode CLI
* invoke OpenCode API
* call model providers
* execute shell commands through the runner
* add a real execution harness
* add runner queueing
* add scheduling
* add worker processes
* mutate SQLite
* expose the private runner publicly
* commit tokens or secrets
* change authentication
* treat runner reachability as execution authority

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

## Problem Statement

The current guarded start state artifact records a bridge-local status:

```text
RUNNER_REJECTED
```

for a structured runner non-execution response whose semantic meaning is:

```text
NOT_IMPLEMENTED
```

This creates a mismatch between:

1. the FP-MCP-031 contract
2. the MCP bridge guarded start result
3. the persisted start state artifact

FP-MCP-032 must make the persisted state artifact contract-aligned.

---

## Required Behavior

For the current non-executing runner skeleton, guarded start should produce:

```text
started: false
accepted: false
runnerContacted: true
startEndpointContacted: true
executionStarted: false
runnerProtocolVersion: forgepilot-runner-v1
runnerRunId: null
reasons:
- EXECUTION_NOT_IMPLEMENTED
```

and the state artifact should record:

```json
{
  "schemaVersion": "FP-MCP-022",
  "packetId": "FP-MCP-032",
  "requestId": "REQ-...",
  "runnerRunId": null,
  "runnerContacted": true,
  "executionStarted": false,
  "status": "NOT_IMPLEMENTED",
  "reasons": [
    "EXECUTION_NOT_IMPLEMENTED"
  ],
  "recordedAt": "..."
}
```

It must not record:

```text
status: RUNNER_REJECTED
```

for this structured `EXECUTION_NOT_IMPLEMENTED` response.

---

## Status Mapping Rules

The state artifact status must use the FP-MCP-031 vocabulary.

### Structured NOT_IMPLEMENTED

If the runner or bridge result indicates:

```text
accepted: false
executionStarted: false
reasons includes EXECUTION_NOT_IMPLEMENTED
```

then state artifact status should be:

```text
NOT_IMPLEMENTED
```

### Structured REJECTED

If the runner returns a structured policy rejection that is not not-implemented:

```text
accepted: false
executionStarted: false
reasons does not include EXECUTION_NOT_IMPLEMENTED
```

then state artifact status should be:

```text
REJECTED
```

### ACCEPTED

If the runner returns:

```text
accepted: true
runnerRunId: non-empty string
```

then state artifact status should be:

```text
ACCEPTED
```

This case must not occur in FP-MCP-032 because execution remains disabled and the runner skeleton remains non-executing.

### PROTOCOL_ERROR

If the bridge detects a malformed or unsafe structured response:

```text
RUNNER_PROTOCOL_ERROR
```

then state artifact status should be:

```text
PROTOCOL_ERROR
```

### TRANSPORT_FAILURE

If the bridge cannot contact the runner or cannot obtain a structured response:

```text
RUNNER_UNREACHABLE
RUNNER_TIMEOUT
RUNNER_AUTH_FAILED
```

then state artifact status should be:

```text
TRANSPORT_FAILURE
```

---

## Implementation Guidance

The likely target is the MCP bridge state recording layer in:

```text
/home/ridasaidd/forgepilot-chatgpt-mcp/src/server.ts
```

The likely behavior to change is wherever `remote-runner-start-state.json` is written with:

```text
status: RUNNER_REJECTED
```

The implementation should introduce a small deterministic mapping function, for example:

```text
deriveRunnerStartStateStatus(...)
```

The mapping must be based on observed fields, not narrative interpretation.

The implementation should prefer structured runner status if available and contract-valid.

If no structured status is available, derive from safe observed booleans and reason codes.

The implementation must preserve existing fields:

```text
schemaVersion
packetId
requestId
runnerRunId
runnerContacted
executionStarted
reasons
recordedAt
```

It may add a new compatibility field if useful, for example:

```text
legacyStatus
```

but it must not require that field.

---

## Fresh Verification Request

FP-MCP-032 should use a fresh request artifact.

Recommended input:

```text
packetId: FP-MCP-032
modelId: qwen-3.7-max
runMode: DESIGN_ONLY
approval: CREATE_REQUEST_ARTIFACT
```

The request artifact must be committed before validation.

Expected path:

```text
runs/FP-MCP-032/opencode-requests/<requestId>.json
```

---

## Verification Flow

1. Confirm ForgePilot repo is clean.
2. Confirm MCP bridge repo is clean before implementation.
3. Apply the MCP bridge status vocabulary alignment.
4. Build the MCP bridge with `pnpm run build`.
5. Restart the MCP bridge service.
6. Commit and push the MCP bridge implementation.
7. Create a fresh FP-MCP-032 request artifact.
8. Commit the request artifact.
9. Validate locally.
10. Validate through the private runner endpoint.
11. Call guarded start exactly once.
12. Read the generated state artifact.
13. Verify the state artifact records:
    ```text
    status: NOT_IMPLEMENTED
    ```
14. Verify the state artifact does not record:
    ```text
    status: RUNNER_REJECTED
    ```
15. Record verification artifacts.
16. Commit verification artifacts.
17. Confirm repository cleanliness.

---

## Local Validation Expected Result

```text
eligible: true
executionEnabled: false
executionStarted: false
runnerContacted: false
requestArtifactValid: true
modelAllowed: true
runModeAllowed: true
workingTreeClean: true
baseCommitMatches: true
creationCommitExists: true
artifactCommitExists: true
creationCommitAncestorOfArtifactCommit: true
artifactCommitReachableFromHead: true
safeArtifactDir: true
reasons: []
```

---

## Remote Validation Expected Result

```text
valid: true
runnerConfigured: true
runnerContacted: true
runnerAccepted: true
executionEnabled: false
executionStarted: false
runnerProtocolVersion: forgepilot-runner-v1
reasons: []
```

---

## Guarded Start Expected Result

```text
started: false
accepted: false
approvalAccepted: true
runnerConfigured: true
runnerContacted: true
startEndpointContacted: true
executionStarted: false
localValidationPassed: true
remoteValidationPassed: true
preStartStateRecorded: true
postStartStateRecorded: true
runnerRunId: null
runnerProtocolVersion: forgepilot-runner-v1
reasons:
- EXECUTION_NOT_IMPLEMENTED
```

---

## State Artifact Expected Result

Expected path:

```text
runs/FP-MCP-032/qwen-3.7-max-DESIGN_ONLY/remote-runner-start-state.json
```

Expected content properties:

```text
packetId: FP-MCP-032
requestId: <requestId>
runnerRunId: null
runnerContacted: true
executionStarted: false
status: NOT_IMPLEMENTED
reasons:
- EXECUTION_NOT_IMPLEMENTED
```

Must not contain:

```text
status: RUNNER_REJECTED
```

---

## Result Classification

FP-MCP-032 should be classified as `PASS` if:

```text
MCP bridge implementation is updated
bridge builds successfully
fresh request artifact is created and committed
local validation passes
remote validation passes
guarded start is attempted exactly once
executionStarted remains false
OpenCode is not started
runner execution remains disabled
state artifact status is NOT_IMPLEMENTED
state artifact reasons preserve EXECUTION_NOT_IMPLEMENTED
state artifact does not use RUNNER_REJECTED for this case
```

FP-MCP-032 should be classified as `PASS_WITH_FOLLOWUP` if:

```text
the safety boundary is preserved
but additional contract status fields still need alignment
```

FP-MCP-032 should be classified as `BLOCKED` if:

```text
the MCP bridge cannot be patched safely
the bridge cannot be rebuilt
local validation fails
remote validation fails
guarded start cannot be safely called
```

FP-MCP-032 should be classified as `FAILED` if:

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

Verification artifacts:

```text
runs/FP-MCP-032/executor-result.md
runs/FP-MCP-032/verification.txt
```

Generated state artifact:

```text
runs/FP-MCP-032/qwen-3.7-max-DESIGN_ONLY/remote-runner-start-state.json
```

---

## Verification Requirements

Verification must record:

* packet commit
* MCP bridge implementation commit
* request artifact commit
* request artifact id
* request artifact path
* request artifact SHA-256
* creation commit
* artifact commit
* current validation commit
* local validation result
* remote validation result
* guarded start result
* generated state artifact path
* generated state artifact status
* generated state artifact reasons
* whether `NOT_IMPLEMENTED` is recorded
* whether `RUNNER_REJECTED` is absent for this case
* whether execution started
* whether OpenCode started
* whether runner execution remained disabled
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

* FP-MCP-032 packet is committed.
* MCP bridge state status mapping is updated.
* MCP bridge builds successfully.
* MCP bridge implementation commit is recorded.
* Fresh FP-MCP-032 request artifact is created and committed.
* Local validation passes.
* Remote validation passes.
* Guarded start is called exactly once.
* Guarded start does not start execution.
* State artifact records `status: NOT_IMPLEMENTED`.
* State artifact preserves `EXECUTION_NOT_IMPLEMENTED`.
* State artifact does not record `status: RUNNER_REJECTED` for this case.
* Execution remains disabled.
* OpenCode does not start.
* Verification artifacts are committed.
* Repository is clean after verification commit.

---

## Non-Goals

FP-MCP-032 does not:

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

After FP-MCP-032, ForgePilot should be ready for a guarded execution preflight contract packet.

That future packet should define the complete set of preconditions that must pass before real execution can ever be enabled.
