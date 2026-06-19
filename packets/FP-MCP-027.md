# FP-MCP-027 — Fresh Request Remote Validation

## Task

Create and validate a fresh OpenCode run request artifact through the wired private runner path.

## Goal

Prove that the staging MCP bridge can create a fresh request artifact at the current ForgePilot commit and successfully validate it through the private dev runner, while still preserving the no-execution boundary.

FP-MCP-027 answers one question:

**Can a current request artifact pass local and remote validation without starting OpenCode?**

This packet may create a new request artifact.

This packet may validate that request through the staging bridge and private runner.

This packet must not start OpenCode.

This packet must not execute `/runner/start-run` successfully.

---

## Scope Boundary

FP-MCP-027 may:

* create a fresh request artifact using the existing MCP request tool
* list and read the created request artifact
* validate the created request artifact locally
* validate the created request artifact through the private runner
* test the guarded start path and confirm it remains non-executing
* record validation results
* record verification artifacts

FP-MCP-027 must not:

* add new MCP tools
* add new runner endpoints
* modify MCP bridge code
* modify runner code
* enable runner execution
* invoke OpenCode CLI
* invoke OpenCode API
* execute shell commands through the runner
* call model providers
* write execution artifacts
* mutate the request artifact after creation
* mutate SQLite
* expose the runner publicly
* commit tokens or secrets

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

## Relationship to Earlier Packets

### FP-MCP-007

FP-MCP-007 introduced durable request artifacts.

### FP-MCP-015

FP-MCP-015 introduced local remote-runner eligibility validation.

### FP-MCP-020

FP-MCP-020 introduced staging-to-runner validation endpoint client.

### FP-MCP-022

FP-MCP-022 introduced the guarded start tool.

### FP-MCP-024

FP-MCP-024 implemented the non-executing private runner skeleton.

### FP-MCP-026

FP-MCP-026 wired the staging bridge to the private runner.

FP-MCP-027 verifies the first fresh request through that wired path.

---

## Implementation Type

FP-MCP-027 is validation-only.

It may create a request artifact.

It must not implement new code.

---

## Fresh Request Creation

Create a new request artifact using:

```text
forgepilot_create_opencode_run_request
```

Recommended input:

```text
packetId: FP-MCP-027
modelId: qwen-3.7-max
runMode: DESIGN_ONLY
approval: CREATE_REQUEST_ARTIFACT
```

The request artifact must be created at the current clean commit.

Expected request path:

```text
runs/FP-MCP-027/opencode-requests/<requestId>.json
```

The request artifact must include:

```text
schemaVersion: FP-MCP-007
createdBy: chatgpt-mcp
approval: CREATE_REQUEST_ARTIFACT
executionEnabled: false
executionStarted: false
status: REQUEST_RECORDED
validationBoundary: FP-MCP-006
```

---

## Local Request Validation

Validate the fresh request using:

```text
forgepilot_validate_remote_runner_request
```

Expected:

```text
eligible: true
executionEnabled: false
executionStarted: false
requestArtifactValid: true
modelAllowed: true
runModeAllowed: true
workingTreeClean: true
baseCommitMatches: true
safeArtifactDir: true
reasons: []
```

---

## Remote Runner Validation

Validate the fresh request through the wired runner using:

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

The runner must not start execution during validation.

---

## Guarded Start Verification

Invoke the guarded start tool with exact approval:

```text
forgepilot_start_remote_runner_request
```

Input:

```text
packetId: FP-MCP-027
requestId: <fresh request id>
approval: START_REMOTE_RUNNER_REQUEST
```

Because FP-MCP-024 runner skeleton does not implement execution, the expected result is:

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
reasons includes EXECUTION_NOT_IMPLEMENTED or RUNNER_REJECTED_REQUEST
```

If the bridge records a pre-start state artifact before contacting `/runner/start-run`, that artifact must show:

```text
executionStarted: false
status: START_REQUEST_RECORDED
```

The tool must not report `started: true`.

---

## Request Artifact Mutation Boundary

The original request artifact must remain immutable after creation.

It must not be modified by:

* local validation
* remote validation
* guarded start attempt
* runner rejection

Execution state must be recorded separately if any state artifact is produced.

---

## Execution Boundary

FP-MCP-027 must preserve:

```text
runner executionEnabled: false
OpenCode not started
OpenCode CLI not invoked
OpenCode API not invoked
shell not executed
executionStarted remains false
```

---

## Acceptance Criteria

* FP-MCP-027 packet is committed.
* Fresh request artifact is created.
* Fresh request artifact is readable.
* Fresh request artifact base commit matches current commit at creation.
* Local remote-runner validation passes.
* Remote runner endpoint validation passes.
* Runner is contacted for remote validation.
* Runner accepts validation.
* Remote validation does not start execution.
* Guarded start with exact approval does not start execution.
* Start path reaches only the non-executing runner skeleton.
* Start result remains false/non-executing.
* No OpenCode execution occurs.
* No OpenCode CLI invocation occurs.
* No OpenCode API invocation occurs.
* No shell execution endpoint is used.
* Request artifact remains immutable.
* Runner remains localhost-only.
* Runner execution remains disabled.
* No secrets are committed.
* Verification artifacts are recorded.
* Repository remains clean after verification commit.

---

## Verification Requirements

Verification must record:

* packet commit
* request artifact id
* request artifact path
* request artifact digest if available
* local validation result
* remote validation result
* guarded start result
* runner status result
* runner localhost bind result
* confirmation that OpenCode was not started
* confirmation that execution remains disabled
* confirmation that request artifact was not mutated
* confirmation that no secrets were committed
* clean tree confirmation

Record artifacts under:

```text
runs/FP-MCP-027/
```

Recommended artifacts:

* `runs/FP-MCP-027/executor-result.md`
* `runs/FP-MCP-027/verification.txt`

