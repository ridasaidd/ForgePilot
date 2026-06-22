# FP-MCP-030 — Guarded Start Rejection Classification

## Task

Improve guarded start rejection classification so the MCP bridge preserves structured non-execution reasons returned by the private runner start endpoint.

## Goal

Fix the observability gap exposed by FP-MCP-029.

FP-MCP-030 answers one question:

**Can ForgePilot preserve a runner's explicit non-execution rejection reason during guarded start without treating the rejection as a protocol error?**

This packet is an observability and classification fix.

It must not enable execution.

It must not start OpenCode.

---

## Background

FP-MCP-029 verified the guarded start path after FP-MCP-028 corrected request artifact lifecycle validation.

FP-MCP-029 produced the required primary safety result:

```text
started: false
accepted: false
executionStarted: false
localValidationPassed: true
remoteValidationPassed: true
preStartStateRecorded: true
postStartStateRecorded: true
```

However, FP-MCP-029 also exposed an observability issue.

The private runner's `/runner/start-run` endpoint is intentionally non-executing and currently returns a non-success HTTP status for the skeleton start path.

The bridge recorded the guarded start rejection as:

```text
RUNNER_PROTOCOL_ERROR
RUNNER_REJECTED_REQUEST
```

This is too generic.

A deliberate non-execution response should be classified as a structured rejection, not as a protocol error, when the runner returns parseable ForgePilot runner JSON with expected safety fields.

---

## Scope Boundary

FP-MCP-030 may:

* update MCP bridge start-run response parsing
* parse structured JSON bodies from non-2xx runner start responses
* preserve runner-provided reason codes such as `EXECUTION_NOT_IMPLEMENTED`
* avoid classifying valid structured non-execution responses as protocol errors
* update guarded start result fields if needed
* update pre-start and post-start state recording if needed
* update tests or add focused tests if the bridge repo has a test path
* rebuild the MCP bridge generated output locally
* restart the MCP bridge service
* re-run guarded start verification with a fresh request artifact
* record verification artifacts

FP-MCP-030 must not:

* enable runner execution
* set `FORGEPILOT_RUNNER_EXECUTION_ENABLED=true`
* start OpenCode
* invoke OpenCode CLI
* invoke OpenCode API
* call model providers
* execute shell commands through the runner
* add a real execution harness
* add new runner endpoints
* expose the runner publicly
* commit tokens or secrets
* mutate SQLite
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

The guarded start bridge path currently treats a non-2xx runner response as a protocol error before preserving the runner's structured response body.

This collapses a meaningful safety rejection into generic reasons.

Observed FP-MCP-029 guarded start result:

```text
started: false
accepted: false
runnerContacted: true
startEndpointContacted: true
executionStarted: false
localValidationPassed: true
remoteValidationPassed: true
preStartStateRecorded: true
postStartStateRecorded: true
reasons:
- RUNNER_PROTOCOL_ERROR
- RUNNER_REJECTED_REQUEST
```

Expected improved classification:

```text
started: false
accepted: false
runnerContacted: true
startEndpointContacted: true
executionStarted: false
localValidationPassed: true
remoteValidationPassed: true
preStartStateRecorded: true
postStartStateRecorded: true
runnerProtocolVersion: forgepilot-runner-v1
reasons:
- EXECUTION_NOT_IMPLEMENTED
```

If the runner returns malformed JSON, missing protocol fields, or unsafe execution fields, `RUNNER_PROTOCOL_ERROR` remains appropriate.

---

## Required Classification Model

The bridge must distinguish at least three cases.

### Case 1 — Transport Failure

Examples:

```text
runner unreachable
timeout
connection refused
```

Expected classification:

```text
runnerContacted: false
startEndpointContacted: false
reasons:
- RUNNER_UNREACHABLE
```

or the specific transport reason.

### Case 2 — Protocol Failure

Examples:

```text
malformed JSON
missing runnerProtocolVersion
wrong packetId
wrong requestId
executionStarted true when not expected
accepted true without valid runnerRunId
```

Expected classification:

```text
reasons:
- RUNNER_PROTOCOL_ERROR
```

### Case 3 — Structured Non-Execution Rejection

Examples:

```text
HTTP 501 with ForgePilot runner JSON
accepted: false
executionStarted: false
reasons:
- EXECUTION_NOT_IMPLEMENTED
```

Expected classification:

```text
started: false
accepted: false
executionStarted: false
runnerContacted: true
startEndpointContacted: true
runnerProtocolVersion: forgepilot-runner-v1
reasons:
- EXECUTION_NOT_IMPLEMENTED
```

This case must not automatically add:

```text
RUNNER_PROTOCOL_ERROR
RUNNER_REJECTED_REQUEST
```

unless the response is malformed or violates safety expectations.

---

## Implementation Guidance

The likely MCP bridge target is:

```text
/home/ridasaidd/forgepilot-chatgpt-mcp/src/server.ts
```

The likely functions are:

```text
postRemoteRunnerStartRun
startRemoteRunnerRequest
```

The current start-run client should be changed so that:

1. It attempts to parse runner JSON even when `response.ok === false`.
2. If the JSON is structured and contains valid ForgePilot runner fields, it returns the parsed response to the caller along with the HTTP status.
3. Authentication failures may remain classified as `RUNNER_AUTH_FAILED`.
4. Malformed responses remain `RUNNER_PROTOCOL_ERROR`.
5. A structured rejection with `executionStarted: false` is treated as a rejection observation, not a protocol error.

The implementation should not require changing the runner if the runner already returns structured JSON for `/runner/start-run`.

---

## Fresh Verification Request

FP-MCP-030 should use a fresh request artifact.

Recommended input:

```text
packetId: FP-MCP-030
modelId: qwen-3.7-max
runMode: DESIGN_ONLY
approval: CREATE_REQUEST_ARTIFACT
```

The request artifact must be committed before validation.

Expected path:

```text
runs/FP-MCP-030/opencode-requests/<requestId>.json
```

---

## Verification Flow

1. Confirm ForgePilot repo is clean.
2. Confirm MCP bridge repo is clean after implementation commit.
3. Confirm runner is reachable and execution remains disabled.
4. Create a fresh FP-MCP-030 request artifact.
5. Commit the request artifact.
6. Validate locally.
7. Validate through the remote runner endpoint.
8. Call guarded start exactly once.
9. Record the guarded start result.
10. Record verification artifacts.
11. Commit verification artifacts.
12. Confirm ForgePilot repo is clean.

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

After the classification fix, a guarded start attempt against the current non-executing runner skeleton should produce a structured non-execution rejection.

Expected:

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
runnerProtocolVersion: forgepilot-runner-v1
reasons:
- EXECUTION_NOT_IMPLEMENTED
```

The exact reason code may differ if the runner's explicit non-execution code differs, but it must be specific and must not be collapsed into `RUNNER_PROTOCOL_ERROR` when the response is structurally valid.

---

## Result Classification

FP-MCP-030 should be classified as `PASS` if:

```text
local validation passes
remote validation passes
guarded start is attempted exactly once
executionStarted remains false
started remains false
OpenCode is not started
runner execution remains disabled
structured non-execution reason is preserved
RUNNER_PROTOCOL_ERROR is not emitted for a valid structured non-execution response
```

FP-MCP-030 should be classified as `PASS_WITH_FOLLOWUP` if:

```text
the safety boundary is preserved
but the bridge still emits partially generic rejection metadata
```

FP-MCP-030 should be classified as `BLOCKED` if:

```text
local validation fails
remote validation fails
the guarded start tool cannot be safely called
```

FP-MCP-030 should be classified as `FAILED` if:

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

Record verification artifacts under:

```text
runs/FP-MCP-030/
```

Recommended artifacts:

```text
runs/FP-MCP-030/executor-result.md
runs/FP-MCP-030/verification.txt
```

If the guarded start tool writes state artifacts, preserve them if they are safe to commit.

Possible state artifact path:

```text
runs/FP-MCP-030/qwen-3.7-max-DESIGN_ONLY/remote-runner-start-state.json
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
* guarded start result before or after classification fix
* exact reason codes
* whether `RUNNER_PROTOCOL_ERROR` was avoided for a structured rejection
* whether pre-start state was recorded
* whether post-start state was recorded
* whether execution started
* whether OpenCode was started
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

* FP-MCP-030 packet is committed.
* MCP bridge classification logic is updated.
* MCP bridge implementation commit is recorded.
* A fresh FP-MCP-030 request artifact is created and committed.
* Local validation passes.
* Remote runner endpoint validation passes.
* Guarded start is called exactly once after validation passes.
* Guarded start does not start execution.
* Guarded start preserves a specific structured non-execution reason.
* `RUNNER_PROTOCOL_ERROR` is not emitted for a structurally valid non-execution rejection.
* Execution remains disabled.
* OpenCode does not start.
* Verification artifacts are committed.
* Repository is clean after verification commit.

---

## Non-Goals

FP-MCP-030 does not:

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

After FP-MCP-030, ForgePilot may proceed toward a more explicit runner start contract packet.

That future work should define the exact JSON contract for accepted, rejected, and non-implemented start responses before any real execution harness is added.
