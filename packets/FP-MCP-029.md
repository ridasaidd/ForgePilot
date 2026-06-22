# FP-MCP-029 — Guarded Start Non-Execution Verification

## Task

Verify the guarded remote runner start path after FP-MCP-028 lifecycle validation was fixed.

## Goal

Prove that a request artifact can pass local validation and remote runner endpoint validation, then enter the guarded start path without starting OpenCode or enabling execution.

FP-MCP-029 answers one question:

**Can ForgePilot contact the guarded start path for a validated request while preserving the no-execution boundary?**

This packet may call the guarded MCP start tool exactly once after validation passes.

This packet must not enable runner execution.

This packet must not start OpenCode.

This packet must not treat runner reachability as execution authority.

---

## Background

FP-MCP-027 exposed a request artifact lifecycle contradiction.

FP-MCP-028 fixed lifecycle validation by separating:

```text
creationCommit
artifactCommit
currentCommit
```

After FP-MCP-028, both local validation and remote runner endpoint validation can pass for a committed request artifact while preserving the no-execution boundary.

The next required observation is the guarded start path.

The private runner currently exposes:

```text
POST /runner/start-run
```

but the runner skeleton is expected to remain non-executing.

The expected runner behavior is rejection or non-implementation, not execution.

---

## Scope Boundary

FP-MCP-029 may:

* create a fresh request artifact for FP-MCP-029
* commit the request artifact before validation
* validate the request artifact locally
* validate the request artifact through the private runner endpoint
* call the guarded MCP start tool exactly once after validation passes
* record the guarded start result
* record whether the runner start endpoint was contacted
* record whether pre-start and post-start state artifacts were written
* record whether the runner returned a clear non-execution reason
* record verification artifacts

FP-MCP-029 must not:

* enable runner execution
* set `FORGEPILOT_RUNNER_EXECUTION_ENABLED=true`
* start OpenCode
* invoke OpenCode CLI
* invoke OpenCode API
* call model providers
* execute shell commands through the runner
* add new runner endpoints
* add new MCP tools
* expose the runner publicly
* commit tokens or secrets
* mutate SQLite
* force a PASS if the observed result exposes a blocker

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

## Required Starting State

Before execution:

```text
ForgePilot repo clean: true
MCP bridge repo clean: true
runnerConfigured: true
runnerReachable: true
runner executionEnabled: false
OpenCode executionEnabled: false
```

The runner must remain bound to the private dev plane.

Expected runner bind:

```text
127.0.0.1:8791
```

---

## Fresh Request Creation

Create a fresh request artifact using:

```text
forgepilot_create_opencode_run_request
```

Recommended input:

```text
packetId: FP-MCP-029
modelId: qwen-3.7-max
runMode: DESIGN_ONLY
approval: CREATE_REQUEST_ARTIFACT
```

The request artifact must be committed before validation.

Expected path:

```text
runs/FP-MCP-029/opencode-requests/<requestId>.json
```

---

## Local Validation Requirement

Validate the committed request artifact using:

```text
forgepilot_validate_remote_runner_request
```

Expected:

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

If local validation fails, do not call the start tool.

Record the result honestly.

---

## Remote Runner Endpoint Validation Requirement

Validate the committed request artifact through the runner endpoint using:

```text
forgepilot_validate_remote_runner_endpoint_request
```

Expected:

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

If remote validation fails, do not call the start tool.

Record the result honestly.

---

## Guarded Start Requirement

Only after local and remote validation pass, call:

```text
forgepilot_start_remote_runner_request
```

Required input:

```text
packetId: FP-MCP-029
requestId: <requestId>
approval: START_REMOTE_RUNNER_REQUEST
```

Expected safety result:

```text
started: false
accepted: false
approvalAccepted: true
runnerConfigured: true
localValidationPassed: true
remoteValidationPassed: true
executionStarted: false
```

The start endpoint may be contacted.

The runner must not start OpenCode.

The runner must not start execution.

The runner may reject the request because execution is not implemented.

The verification must record the exact reason codes returned.

---

## Result Classification

FP-MCP-029 should be classified as `PASS` if:

```text
local validation passes
remote validation passes
guarded start path is attempted exactly once
executionStarted remains false
started remains false
runner execution remains disabled
OpenCode is not started
no shell execution occurs
no secrets are committed
```

FP-MCP-029 should be classified as `PASS_WITH_OBSERVABILITY_FOLLOWUP` if:

```text
the non-execution boundary is preserved
but the returned reason codes collapse a specific runner rejection into a generic protocol error
```

FP-MCP-029 should be classified as `BLOCKED` if:

```text
local validation fails
remote validation fails
the start tool cannot be safely called
```

FP-MCP-029 should be classified as `FAILED` if:

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
runs/FP-MCP-029/
```

Recommended artifacts:

```text
runs/FP-MCP-029/executor-result.md
runs/FP-MCP-029/verification.txt
```

If the guarded start tool writes state artifacts, preserve them as evidence if they are safe to commit.

Possible state artifact path:

```text
runs/FP-MCP-029/qwen-3.7-max-DESIGN_ONLY/remote-runner-start-state.json
```

---

## Verification Requirements

Verification must record:

* packet commit
* request artifact commit
* request artifact id
* request artifact path
* request artifact SHA-256
* creation commit
* artifact commit
* current validation commit
* local validation result
* remote runner endpoint validation result
* guarded start result
* whether the start endpoint was contacted
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

* FP-MCP-029 packet is committed.
* A fresh FP-MCP-029 request artifact is created.
* The request artifact is committed before validation.
* Local validation passes.
* Remote runner endpoint validation passes.
* Guarded start tool is called only after validation passes.
* Guarded start does not start execution.
* Guarded start does not start OpenCode.
* Execution remains disabled.
* Exact reason codes are recorded.
* Verification artifacts are committed.
* Repository is clean after verification commit.

---

## Non-Goals

FP-MCP-029 does not:

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

If FP-MCP-029 reveals that the bridge collapses a runner `EXECUTION_NOT_IMPLEMENTED` response into a generic protocol error, a follow-up packet may be needed to improve guarded start rejection classification.

That follow-up must remain observability-focused and must not enable execution.
