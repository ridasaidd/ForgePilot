# FP-MCP-034 — Non-Executing Preflight Validation Tool

## Task

Implement a non-executing ForgePilot MCP tool that evaluates the FP-MCP-033 guarded execution preflight contract and returns a structured gate-by-gate result.

## Goal

Turn the FP-MCP-033 preflight contract from documentation into an observable validation surface, without making execution possible.

FP-MCP-034 answers one question:

**Can ForgePilot report, in a machine-readable way, why a request is or is not eligible for execution before any execution path is enabled?**

The expected current answer is:

```text
preflightEligible: false
executionPermitted: false
executionStarted: false
reason:
- EXECUTION_DISABLED
```

This is a successful result.

---

## Background

FP-MCP-033 documented the guarded execution preflight contract.

That contract defines required axes, gates, states, output shape, and failure classifications that must exist before ForgePilot may ever permit real remote runner execution.

Current ForgePilot state is intentionally non-executing:

```text
runner executionEnabled: false
OpenCode executionEnabled: false
supported run mode: DESIGN_ONLY
runner supports: capabilities, validate-request
runner start skeleton: guarded, non-executing
```

The next safe step is to implement a validation-only MCP tool that exposes the contract as structured data.

This tool must not be an execution tool.

It must not start OpenCode.

It must not contact model providers.

It must not execute shell commands through the runner.

---

## Scope Boundary

FP-MCP-034 may:

* add one read-only MCP tool for guarded execution preflight validation
* evaluate existing local request artifact validation
* evaluate existing remote runner status
* evaluate existing OpenCode status
* return FP-MCP-033 gate states
* return `preflightEligible`
* return `executionPermitted`
* return `executionStarted`
* return reason codes
* return runner and OpenCode boundary observations
* add TypeScript helpers if needed
* add output schema definitions if needed
* add tests if the MCP bridge repo has a test pattern available
* update docs if needed
* record verification artifacts

FP-MCP-034 must not:

* enable runner execution
* add a real execution harness
* start OpenCode
* invoke OpenCode CLI
* invoke OpenCode API
* call model providers
* execute shell commands through the runner
* add worker processes
* add queues
* add scheduling
* mutate SQLite
* change routing logic
* expose the private runner publicly
* commit tokens or secrets
* treat preflight eligibility as execution approval
* call the guarded start tool as part of preflight validation

---

## Required Tool

Add a new MCP tool:

```text
forgepilot_validate_execution_preflight
```

Recommended input:

```json
{
  "packetId": "FP-MCP-034",
  "requestId": "REQ-..."
}
```

The tool must be validation-only.

It must be registered with annotations equivalent to:

```text
readOnlyHint: true
destructiveHint: false
idempotentHint: true
openWorldHint: true
```

`openWorldHint` may be true because the tool may contact the configured runner capabilities or validate-request endpoint.

The tool must not call `/runner/start-run`.

---

## Required Output Shape

The tool must return a structured result compatible with FP-MCP-033.

Required top-level fields:

```json
{
  "schemaVersion": "FP-MCP-034",
  "packetId": "FP-MCP-034",
  "requestId": "REQ-...",
  "preflightEligible": false,
  "executionPermitted": false,
  "executionStarted": false,
  "runnerContacted": true,
  "opencodeContacted": false,
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

Additional fields are allowed if they are observations, not narratives.

Recommended additional fields:

```text
requestArtifactPath
requestArtifactSha256
baseCommit
currentCommit
creationCommit
artifactCommit
runnerProtocolVersion
runnerVersion
runnerSupportedOperations
runnerSupportedRunModes
runnerAllowedModels
opencodeExecutionEnabled
runnerExecutionEnabled
boundaryVersion
statusSource
```

---

## Gate State Vocabulary

The tool must use the FP-MCP-033 gate states exactly:

```text
PASSED
FAILED
BLOCKED
NOT_EVALUATED
```

The tool must not invent alternate gate states.

---

## Required Gate Evaluation

### Request Artifact Gate

Should be `PASSED` only if:

```text
request artifact exists
request artifact is valid
request artifact path is safe
packet id matches
request id matches
model id is present and allowed
run mode is present and allowed
executionStarted is false
artifactDir is safe
```

If local validation reports request artifact problems, this gate must be `FAILED`.

If the request cannot be read safely, this gate must be `BLOCKED` or `FAILED`.

### Lifecycle Gate

Should be `PASSED` only if:

```text
creationCommit exists
artifactCommit exists
creationCommit is ancestor of artifactCommit
artifactCommit is reachable from HEAD
working tree is clean
```

If any lifecycle condition fails, this gate must be `FAILED`.

### Packet Gate

Should be `PASSED` only if:

```text
packet exists
packet id is valid
packet file is present
```

If future packet-level authorization fields are introduced, this gate must incorporate them.

For FP-MCP-034, do not infer broader execution authorization from packet existence.

### Model Gate

Should be `PASSED` only if:

```text
model is allowlisted
model is present in request artifact
```

### Run Mode Gate

Should be `PASSED` only if:

```text
run mode is allowlisted
run mode is present in request artifact
```

Current expected run mode:

```text
DESIGN_ONLY
```

### Runner Identity Gate

Should be `PASSED` only if:

```text
runner is configured
runner is reachable
runner protocol version is forgepilot-runner-v1
runner host role is dev-execution-plane
bridge host role is staging-control-plane
```

If runner cannot be contacted, this gate should be `FAILED`.

### Runner Capability Gate

Should be `PASSED` only if:

```text
runner reports capabilities
runner reports validate-request support
runner reports allowed models
runner reports supported run modes
runner reports executionEnabled explicitly
```

Current runner does not need to report execution support.

### Execution Enablement Gate

Current expected result:

```text
FAILED
```

because:

```text
runner executionEnabled: false
```

This is not a packet failure.

It is the required safe classification.

The top-level result must therefore be:

```text
preflightEligible: false
executionPermitted: false
executionStarted: false
```

with reason:

```text
EXECUTION_DISABLED
```

### OpenCode Boundary Gate

Should be `PASSED` only if:

```text
OpenCode execution is disabled
OpenCode live execution is not checked
OpenCode CLI is not invoked
OpenCode API is not invoked
```

For current static OpenCode status, this gate should pass.

### Artifact Recording Gate

For FP-MCP-034, this may be:

```text
NOT_EVALUATED
```

because the tool does not start execution and does not need to prove future execution artifact writes.

### Secrets Boundary Gate

Should be `PASSED` if the tool records no secrets and exposes no token-bearing values.

### Network Exposure Gate

Should be `PASSED` if the runner endpoint remains configured/private and no public exposure is introduced.

---

## Preflight Eligibility Rule

The tool may only set:

```text
preflightEligible: true
```

if all required gates are:

```text
PASSED
```

and execution enablement is not failed.

For current ForgePilot state, the tool must return:

```text
preflightEligible: false
executionPermitted: false
executionStarted: false
reasons:
- EXECUTION_DISABLED
```

---

## Execution Permission Rule

The tool must always return:

```text
executionPermitted: false
```

for FP-MCP-034.

This packet does not authorize execution.

Even if future environmental flags accidentally report execution enabled, the tool must not start execution and should report a boundary violation or unauthorized execution state.

---

## Reason Codes

The tool should reuse existing reason codes where possible.

Required reason codes include:

```text
EXECUTION_DISABLED
REQUEST_ARTIFACT_INVALID
REQUEST_ARTIFACT_MISSING
REQUEST_LIFECYCLE_INVALID
PACKET_NOT_AUTHORIZED
MODEL_NOT_ALLOWED
RUN_MODE_NOT_ALLOWED
RUNNER_UNREACHABLE
RUNNER_PROTOCOL_ERROR
OPENCODE_BOUNDARY_VIOLATION
SECRETS_BOUNDARY_VIOLATION
NETWORK_BOUNDARY_VIOLATION
```

Reason codes must be stable uppercase strings.

---

## Safety Requirements

The implementation must preserve:

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

## Verification Requirements

Verification must include:

1. Build/typecheck of the MCP bridge.
2. Service restart.
3. Action refresh if needed.
4. Creation of a fresh FP-MCP-034 request artifact.
5. Commit of the request artifact.
6. Local request validation.
7. Remote runner endpoint validation.
8. Preflight tool invocation.
9. Confirmation that preflight returns:

```text
preflightEligible: false
executionPermitted: false
executionStarted: false
reasons:
- EXECUTION_DISABLED
```

10. Confirmation that no guarded start call was made by the preflight tool.
11. Confirmation that no OpenCode execution occurred.
12. Verification artifacts committed.

---

## Expected Files

Likely MCP bridge changes:

```text
src/server.ts
```

Possible docs update:

```text
docs/guarded-execution-preflight-contract.md
```

Expected ForgePilot artifacts:

```text
packets/FP-MCP-034.md
runs/FP-MCP-034/opencode-requests/<request>.json
runs/FP-MCP-034/executor-result.md
runs/FP-MCP-034/verification.txt
```

---

## Acceptance Criteria

FP-MCP-034 is accepted if:

```text
new MCP tool forgepilot_validate_execution_preflight exists
tool is validation-only
tool does not call start-run
tool returns FP-MCP-033 gate structure
gate states use PASSED/FAILED/BLOCKED/NOT_EVALUATED
current result is preflightEligible false
current result is executionPermitted false
current result is executionStarted false
reason includes EXECUTION_DISABLED
runner execution remains disabled
OpenCode execution remains disabled
no execution is attempted
request artifact lifecycle validation remains intact
verification artifacts are committed
repo is clean
```

---

## Failure Conditions

FP-MCP-034 fails if:

```text
executionStarted becomes true
OpenCode starts
OpenCode CLI is invoked
OpenCode API is invoked
runner execution is enabled
shell executes through runner
the tool calls /runner/start-run
secrets are written to artifacts
runner is publicly exposed
preflightEligible is true while execution is disabled
executionPermitted is true in FP-MCP-034
gate states use unapproved vocabulary
```

---

## Expected Result

Current expected successful result:

```text
PASS
```

with:

```text
preflightEligible: false
executionPermitted: false
executionStarted: false
reason:
- EXECUTION_DISABLED
```

This is the correct safe behavior.

---

## Follow-Up

After FP-MCP-034, ForgePilot can proceed to:

```text
FP-MCP-035 — Execution Artifact Contract
```

or equivalent.

That follow-up should define future execution artifacts, not enable execution.
