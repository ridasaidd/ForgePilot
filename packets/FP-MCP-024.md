# FP-MCP-024 — Implement Private Dev Runner Skeleton

## Task

Implement the first private dev runner service skeleton.

## Goal

Create a non-executing runner service that implements the safe foundation for the future ForgePilot execution plane.

FP-MCP-024 answers one question:

**Can the private dev runner expose authenticated, constrained capability and validation endpoints without starting OpenCode?**

This packet may add runner service code.

This packet must not start OpenCode.

This packet must not implement `/runner/start-run` execution.

This packet must not invoke OpenCode CLI.

This packet must not invoke OpenCode API.

This packet must not execute arbitrary shell.

---

## Scope Boundary

FP-MCP-024 may add:

* private runner service source files
* runner package scripts
* runner configuration documentation
* runner authentication middleware
* runner health/capabilities endpoint
* runner validate-request endpoint
* static runner policy
* safe request artifact validation
* safe request artifact SHA-256 verification
* safe Git state checks
* safe artifact directory derivation/checking
* sanitized logging
* tests for capabilities and validation behavior

FP-MCP-024 must not add:

* OpenCode execution
* OpenCode CLI invocation
* OpenCode API invocation
* shell execution
* `/runner/start-run` execution behavior
* background workers
* job queue
* model provider calls
* provider credentials
* staging MCP bridge code changes unless strictly required for compatibility
* SQLite mutation
* Git mutation
* request artifact mutation
* artifact-writing execution behavior
* public unauthenticated runner exposure

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

### FP-MCP-019

FP-MCP-019 defined the remote runner API contract.

FP-MCP-024 implements only the non-executing subset of that contract.

### FP-MCP-023

FP-MCP-023 defined the private dev runner service boundary.

FP-MCP-024 implements a skeleton within that boundary.

---

## Implementation Type

FP-MCP-024 is an implementation packet.

It may add code, tests, and documentation.

It must remain non-executing.

---

## Runner Location

The runner may be added to the ForgePilot repository or a clearly documented runner subdirectory.

Recommended location:

```text
runner/
```

Allowed examples:

```text
runner/server.ts
runner/policy.ts
runner/validation.ts
runner/logging.ts
runner/README.md
runner/tests/
```

If another location is used, it must be documented in the executor result.

---

## Runtime

The runner may use the existing project runtime.

Recommended:

```text
Node.js
TypeScript
```

The runner should not introduce a heavy framework unless required.

Acceptable lightweight HTTP libraries:

* Node built-in HTTP server
* Express
* Fastify

The choice must be documented.

---

## Required Endpoint Set

FP-MCP-024 may implement only:

```text
GET  /runner/capabilities
POST /runner/validate-request
```

Optional safe endpoint:

```text
GET /runner/health
```

FP-MCP-024 must not implement executable behavior for:

```text
POST /runner/start-run
```

If `/runner/start-run` is present, it must return a hard rejection:

```text
501 Not Implemented
EXECUTION_NOT_IMPLEMENTED
```

---

## Authentication

All `/runner/*` endpoints except optional `/runner/health` must require authentication.

Required header:

```text
Authorization: Bearer <token>
```

The token must be read from environment configuration.

Recommended variable:

```text
FORGEPILOT_RUNNER_TOKEN
```

If the token is not configured, protected endpoints must fail closed.

Reason code:

```text
RUNNER_AUTH_UNCONFIGURED
```

If token is missing or invalid:

```text
RUNNER_AUTH_FAILED
```

The token must not be:

* committed to Git
* logged
* returned in responses
* written to artifacts
* exposed through capabilities

---

## Configuration

The runner must derive configuration from environment variables or safe defaults.

Recommended variables:

```text
FORGEPILOT_REPO=/home/ridasaidd/forgepilot
FORGEPILOT_RUNNER_TOKEN=<secret>
FORGEPILOT_RUNNER_HOST=127.0.0.1
FORGEPILOT_RUNNER_PORT=8791
FORGEPILOT_RUNNER_EXECUTION_ENABLED=false
```

Default execution state must be false.

The runner must not accept repository path, token, or execution enablement from request body.

---

## Capabilities Endpoint

Endpoint:

```text
GET /runner/capabilities
```

Required authenticated response fields:

```text
runnerConfigured
runnerHostRole
runnerVersion
runnerProtocolVersion
executionEnabled
opencodeHarnessConfigured
opencodeHarnessReachable
supportedOperations
supportedRunModes
allowedModels
statusSource
checkedAt
reasons
```

Required values for FP-MCP-024:

```text
runnerHostRole: dev-execution-plane
runnerProtocolVersion: forgepilot-runner-v1
executionEnabled: false
opencodeHarnessReachable: false
```

Allowed supported operations:

```text
capabilities
validate-request
```

The endpoint must not start OpenCode.

The endpoint must not contact model providers.

---

## Validate Request Endpoint

Endpoint:

```text
POST /runner/validate-request
```

Required authenticated request fields:

```text
packetId
requestId
requestArtifactPath
requestArtifactSha256
baseCommit
boundaryVersion
```

The endpoint must reject any unknown fields that imply execution, including:

```text
prompt
command
shell
modelOverride
runModeOverride
artifactDirOverride
env
secrets
providerCredentials
```

Validation must check:

* packet id syntax
* request id syntax
* request artifact path safety
* request artifact file exists
* request artifact SHA-256 matches provided digest
* request artifact parses as JSON
* request artifact schema version is acceptable
* request artifact packet id matches request
* request artifact request id matches request
* request artifact base commit matches request
* request artifact status is `REQUEST_RECORDED`
* request artifact has `executionStarted: false`
* model id is allowed
* run mode is allowed
* artifact directory is safe
* packet file exists
* repository is clean
* repository current commit matches request/base commit

Validation must not start execution.

Validation must not write artifacts.

Validation must not mutate the request artifact.

---

## Validate Request Response

The endpoint should return structured JSON:

```text
valid
accepted
runnerConfigured
runnerContacted
executionEnabled
executionStarted
packetId
requestId
requestArtifactPath
requestArtifactSha256
baseCommit
artifactDir
modelId
runMode
runnerProtocolVersion
boundaryVersion
statusSource
checkedAt
reasons
```

For FP-MCP-024, successful validation still must not imply execution.

Required values:

```text
executionStarted: false
executionEnabled: false
```

---

## Request Artifact Path Boundary

The runner must accept only repository-relative paths under:

```text
runs/<packetId>/opencode-requests/
```

The runner must reject:

* absolute paths
* `..`
* path traversal
* hidden path segments
* paths outside `runs/`
* paths outside the packet run directory
* paths not ending in `.json`

---

## Artifact Directory Boundary

The runner must derive artifact directory from the request artifact.

Expected format:

```text
runs/<packetId>/<modelId>-<runMode>/
```

The runner must reject unsafe derived paths.

---

## Git State Boundary

The runner may inspect Git state.

Allowed Git observations:

```text
rev-parse --short HEAD
status --short
```

The runner must not mutate Git.

Forbidden Git commands include:

```text
checkout
reset
clean
merge
rebase
commit
push
pull
fetch
branch -D
```

If implemented through a Git library, equivalent mutation operations are forbidden.

---

## Filesystem Boundary

The runner may read only:

* packet files under `packets/`
* request artifact files under `runs/<packetId>/opencode-requests/`
* repository metadata needed for validation

The runner must not expose arbitrary file reading.

The runner must not write files in FP-MCP-024.

---

## Logging Boundary

Runner logs must be sanitized.

Allowed log shape:

```text
Runner operation invoked: <operation_name>
Runner operation completed: <operation_name> PASS durationMs=<number>
Runner operation completed: <operation_name> FAIL errorCode=<SANITIZED_CODE> durationMs=<number>
```

Runner logs must not contain:

* bearer tokens
* provider keys
* OAuth tokens
* raw environment variables
* raw prompts
* raw commands
* request artifact contents
* request artifact digest
* terminal output
* secrets

---

## Test Requirements

Tests should cover:

* capabilities endpoint requires auth
* capabilities endpoint returns protocol version
* capabilities endpoint reports execution disabled
* validate-request requires auth
* validate-request rejects missing token
* validate-request rejects invalid token
* validate-request rejects invalid packet id
* validate-request rejects invalid request id
* validate-request rejects unsafe request artifact path
* validate-request rejects digest mismatch
* validate-request rejects unknown execution fields
* validate-request does not write artifacts
* validate-request does not mutate request artifact
* `/runner/start-run`, if present, returns not implemented and does not execute

Tests must not start OpenCode.

---

## Start Run Boundary

FP-MCP-024 must not implement execution.

If a start endpoint is included for contract compatibility, it must return:

```json
{
  "accepted": false,
  "executionStarted": false,
  "runnerProtocolVersion": "forgepilot-runner-v1",
  "boundaryVersion": "FP-MCP-024",
  "reasons": ["EXECUTION_NOT_IMPLEMENTED"]
}
```

No artifacts may be written by this endpoint in FP-MCP-024.

---

## Reason Codes

The runner may emit:

```text
RUNNER_AUTH_UNCONFIGURED
RUNNER_AUTH_FAILED
RUNNER_PROTOCOL_ERROR
INVALID_PACKET_ID
INVALID_REQUEST_ID
UNKNOWN_PACKET
UNKNOWN_REQUEST
INVALID_REQUEST_ARTIFACT
REQUEST_PACKET_MISMATCH
REQUEST_ID_MISMATCH
INVALID_REQUEST_SCHEMA
REQUEST_NOT_RECORDED
REQUEST_DIGEST_MISMATCH
DISALLOWED_MODEL
DISALLOWED_RUN_MODE
DIRTY_WORKING_TREE
BASE_COMMIT_MISMATCH
UNSAFE_ARTIFACT_DIR
UNSAFE_REQUEST_ARTIFACT_PATH
EXECUTION_DISABLED
EXECUTION_NOT_IMPLEMENTED
FORBIDDEN_EXECUTION_FIELD
ARTIFACT_WRITE_FORBIDDEN
```

---

## Acceptance Criteria

* Runner skeleton exists in documented location.
* Runner can be built.
* Runner can be tested.
* Capabilities endpoint is implemented.
* Validate-request endpoint is implemented.
* Protected endpoints require bearer authentication.
* Missing runner token fails closed.
* Invalid bearer token fails closed.
* Capabilities reports protocol version `forgepilot-runner-v1`.
* Capabilities reports execution disabled.
* Capabilities does not start OpenCode.
* Validate-request performs safe local validation.
* Validate-request verifies request artifact digest.
* Validate-request rejects unsafe paths.
* Validate-request rejects execution-shaped fields.
* Validate-request does not write artifacts.
* Validate-request does not mutate request artifact.
* Validate-request does not start OpenCode.
* No OpenCode CLI invocation is added.
* No OpenCode API invocation is added.
* No shell execution is added.
* No model provider call is added.
* `/runner/start-run` is absent or hard-rejecting.
* Tests pass.
* Existing ForgePilot tests pass.
* Repository remains clean after commit.

---

## Verification Requirements

Verification must record:

* packet commit
* implementation commit
* runner location
* runtime choice
* build command and result
* test command and result
* capabilities endpoint auth failure result
* capabilities endpoint success result
* validate-request auth failure result
* validate-request unsafe path rejection
* validate-request digest mismatch rejection
* start-run absent or hard rejection result
* confirmation that OpenCode was not started
* confirmation that no OpenCode CLI/API invocation was added
* confirmation that no shell execution was added
* confirmation that no artifacts were written by validation
* confirmation that request artifact was not mutated
* clean tree confirmation

Record artifacts under:

```text
runs/FP-MCP-024/
```

Recommended artifacts:

* `runs/FP-MCP-024/executor-result.md`
* `runs/FP-MCP-024/verification.txt`
