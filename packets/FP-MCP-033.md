# FP-MCP-033 — Guarded Execution Preflight Contract

## Task

Define the complete preflight contract that must pass before ForgePilot may ever enable real remote runner execution.

## Goal

Create a durable, explicit, machine-checkable boundary between the current non-executing runner skeleton and any future execution harness.

FP-MCP-033 answers one question:

**What exact conditions must be true before ForgePilot may permit a runner to start real OpenCode execution?**

This packet is contract-only.

It must not enable execution.

It must not start OpenCode.

It must not add a real execution harness.

---

## Background

The FP-MCP start boundary has now reached a stable non-executing contract layer.

Completed prior packets:

```text
FP-MCP-028 — request artifact lifecycle validation fixed
FP-MCP-029 — guarded start non-execution verified
FP-MCP-030 — structured rejection reason preserved
FP-MCP-031 — runner start response contract documented
FP-MCP-032 — state artifact status vocabulary aligned
```

The system can now:

```text
create request artifacts
commit request artifacts
validate request artifacts locally
validate request artifacts through the private runner endpoint
call the guarded start path
record non-execution state artifacts
preserve EXECUTION_NOT_IMPLEMENTED
record status: NOT_IMPLEMENTED
avoid RUNNER_REJECTED for the not-implemented skeleton case
```

The next step must not be execution.

The next step is a preflight contract.

Before any real execution harness exists, ForgePilot needs a written and verifiable definition of all conditions that must be true before execution can ever be enabled.

---

## Scope Boundary

FP-MCP-033 may:

* define preflight eligibility conditions
* define execution enablement gates
* define required request artifact fields
* define required repository state
* define required runner identity state
* define required model and run-mode allowlist checks
* define required provenance fields
* define required artifact recording behavior
* define required safety-state artifacts
* define required audit and verification boundaries
* define required failure classifications
* add documentation under `docs/`
* add schema-like documentation
* add non-executing validation helpers if the implementation target is obvious and safe
* verify that current runner state remains non-executing and therefore not preflight-eligible
* record verification artifacts

FP-MCP-033 must not:

* enable runner execution
* set `FORGEPILOT_RUNNER_EXECUTION_ENABLED=true`
* start OpenCode
* invoke OpenCode CLI
* invoke OpenCode API
* call model providers
* execute shell commands through the runner
* add a real execution harness
* add worker processes
* add scheduling
* add queueing
* mutate SQLite
* make routing decisions
* expose the private runner publicly
* commit tokens or secrets
* treat preflight definition as preflight approval

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

## Core Preflight Principle

Execution must be impossible unless every required preflight condition is explicitly observed.

ForgePilot must not infer execution eligibility from the absence of failure.

The preflight contract must be affirmative:

```text
eligible only if all required gates explicitly pass
```

not negative:

```text
eligible if no gate failed
```

---

## Required Preflight Axes

The contract must define at least these independent axes:

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

## Required Preflight States

Each preflight check should produce one of these states:

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

## Required Preflight Gate Categories

### 1. Request Artifact Gate

Must verify:

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

### 2. Lifecycle Gate

Must verify:

```text
creationCommit exists
artifactCommit exists
creationCommit is ancestor of artifactCommit
artifactCommit is reachable from current HEAD
current HEAD is the validation commit
working tree is clean
```

### 3. Packet Gate

Must verify:

```text
packet exists
packet is committed
packet id is valid
packet permits the requested operation
packet does not authorize broader execution than requested
```

### 4. Model Gate

Must verify:

```text
model id is allowlisted
model id matches request artifact
model id matches artifact directory
model id is permitted for the requested run mode
```

### 5. Run Mode Gate

Must verify:

```text
run mode is allowlisted
run mode matches request artifact
run mode matches artifact directory
run mode has a documented execution policy
```

For current ForgePilot state:

```text
DESIGN_ONLY
```

is the only allowed run mode.

### 6. Runner Identity Gate

Must verify:

```text
runner is configured
runner is reachable
runner protocol version is recognized
runner host role is dev-execution-plane
bridge host role is staging-control-plane
runner endpoint is private
runner capabilities endpoint reports expected protocol
```

### 7. Runner Capability Gate

Must verify:

```text
runner supports capabilities
runner supports validate-request
runner supports start-run only through guarded contract
runner reports executionEnabled explicitly
runner reports supported run modes
runner reports allowed models
```

### 8. Execution Enablement Gate

Must verify:

```text
execution enablement state is explicit
execution enablement source is recorded
execution enablement is false unless a future packet explicitly authorizes true
```

Current expected state:

```text
executionEnabled: false
```

Therefore current preflight result must be:

```text
NOT_EXECUTION_ELIGIBLE
```

or equivalent, while still allowing validation.

### 9. OpenCode Boundary Gate

Must verify:

```text
OpenCode execution is disabled
OpenCode discovery does not start OpenCode
OpenCode CLI is not invoked during preflight
OpenCode API is not invoked during preflight
model provider is not contacted during preflight
```

### 10. Artifact Recording Gate

Must verify that future execution, if ever enabled, would record:

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

FP-MCP-033 does not require those execution artifacts to exist now.

It requires the contract to define them.

### 11. Secrets Boundary Gate

Must verify:

```text
runner token is not recorded
environment secrets are not recorded
authorization headers are not recorded
model provider tokens are not recorded
logs do not include secrets
artifacts do not include secrets
```

### 12. Network Exposure Gate

Must verify:

```text
private runner remains private
runner is not publicly exposed
bridge may contact runner only through configured private endpoint
capabilities endpoint is safe
start endpoint is guarded
```

---

## Required Preflight Output Shape

The preflight result should be structured and machine-readable.

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

## Current Expected Preflight Classification

For the current ForgePilot system, preflight should not permit execution.

Expected current classification:

```text
preflightEligible: false
executionPermitted: false
executionStarted: false
reasons:
- EXECUTION_DISABLED
```

This is a healthy result.

FP-MCP-033 must not attempt to change it.

---

## Failure Classification

The contract must distinguish:

```text
PRECHECK_FAILED
PRECHECK_BLOCKED
EXECUTION_DISABLED
RUNNER_UNREACHABLE
REQUEST_ARTIFACT_INVALID
REQUEST_LIFECYCLE_INVALID
PACKET_NOT_AUTHORIZED
MODEL_NOT_ALLOWED
RUN_MODE_NOT_ALLOWED
UNSAFE_ARTIFACT_DIR
SECRETS_BOUNDARY_VIOLATION
NETWORK_BOUNDARY_VIOLATION
OPENCODE_BOUNDARY_VIOLATION
```

Reason codes must remain stable uppercase strings.

---

## Verification Flow

1. Confirm ForgePilot repo is clean.
2. Confirm runner is reachable.
3. Confirm runner execution remains disabled.
4. Confirm OpenCode execution remains disabled.
5. Add preflight contract documentation.
6. Commit documentation.
7. Verify that current system does not become execution-eligible.
8. Record verification artifacts.
9. Confirm repository cleanliness.

A fresh request artifact may be created if needed, but FP-MCP-033 can be completed as documentation-only if the current status tools are sufficient.

---

## Expected Documentation Artifact

Recommended file:

```text
docs/guarded-execution-preflight-contract.md
```

The document must define:

```text
preflight axes
preflight states
required gates
required output shape
reason codes
current expected non-execution result
future execution constraints
```

---

## Expected Verification Artifacts

Recommended files:

```text
runs/FP-MCP-033/executor-result.md
runs/FP-MCP-033/verification.txt
```

---

## Result Classification

FP-MCP-033 should be classified as `PASS` if:

```text
preflight contract documentation is committed
required preflight axes are defined
required gate states are defined
required gate categories are defined
required output shape is defined
current system remains non-execution-eligible
runner execution remains disabled
OpenCode execution remains disabled
no execution is attempted
verification artifacts are committed
repo is clean
```

FP-MCP-033 should be classified as `PASS_WITH_FOLLOWUP` if:

```text
the contract is documented
but implementation helpers are not yet added
```

FP-MCP-033 should be classified as `BLOCKED` if:

```text
current runner state cannot be observed
OpenCode boundary cannot be observed
documentation cannot be committed
```

FP-MCP-033 should be classified as `FAILED` if:

```text
executionStarted becomes true
OpenCode starts
runner execution is enabled
a shell command executes through the runner
a secret is committed
the runner becomes publicly exposed
```

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

* FP-MCP-033 packet is committed.
* Guarded execution preflight contract documentation is committed.
* Preflight axes are defined.
* Preflight states are defined.
* Required gates are defined.
* Required output shape is defined.
* Current system remains non-execution-eligible.
* Runner execution remains disabled.
* OpenCode execution remains disabled.
* No execution is attempted.
* Verification artifacts are committed.
* Repository is clean after verification commit.

---

## Non-Goals

FP-MCP-033 does not:

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
* make execution possible

---

## Expected Follow-Up

After FP-MCP-033, ForgePilot can proceed to one of two safe next steps:

1. Implement a non-executing preflight validation tool that returns the FP-MCP-033 gate structure.
2. Define the execution artifact contract for a future runner harness.

Neither follow-up should enable execution.
