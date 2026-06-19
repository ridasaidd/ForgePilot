# FP-MCP-023 — Private Dev Runner Service Boundary

## Task

Define the safety boundary for the private dev-side ForgePilot runner service.

## Goal

Specify the execution-plane service that will receive constrained requests from the staging MCP bridge, validate ForgePilot request artifacts, invoke the OpenCode harness, and write run artifacts.

FP-MCP-023 answers one question:

**What must the private dev runner service be before it is allowed to execute OpenCode on behalf of ForgePilot?**

This packet is boundary-only.

It does not implement the runner service.

It does not implement OpenCode invocation.

It does not start OpenCode.

It does not call the OpenCode CLI.

It does not call the OpenCode API.

It does not execute shell commands.

It does not create execution artifacts.

It does not mutate request artifacts.

It does not mutate Git.

It does not mutate SQLite.

---

## Scope Boundary

FP-MCP-023 may define:

* private runner service role
* deployment boundary
* network boundary
* authentication requirements
* allowed endpoints
* forbidden endpoints
* repository access requirements
* OpenCode harness invocation boundary
* request artifact validation requirements
* execution work directory requirements
* artifact writing requirements
* logging/redaction requirements
* process isolation requirements
* timeout requirements
* concurrency requirements
* status/readback requirements
* failure reason codes
* future implementation constraints

FP-MCP-023 must not add:

* runner service implementation code
* staging MCP bridge implementation code
* OpenCode execution
* OpenCode CLI invocation
* OpenCode API invocation
* shell execution
* systemd units
* network firewall changes
* artifact-writing implementation
* Git mutation
* SQLite mutation
* background workers

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

### FP-MCP-012

FP-MCP-012 established the staging/control-plane and dev/execution-plane split.

FP-MCP-023 defines the private dev execution-plane service.

### FP-MCP-019

FP-MCP-019 defined the remote runner API contract.

FP-MCP-023 defines the service that must implement that contract.

### FP-MCP-020

FP-MCP-020 added the staging-side validation endpoint client.

The runner service must implement the corresponding validation endpoint.

### FP-MCP-022

FP-MCP-022 added the guarded staging-side start tool.

The runner service must implement the corresponding start endpoint safely.

---

## Runner Role

The private dev runner is an execution-plane component.

It may:

* receive constrained requests from the staging MCP bridge
* authenticate the staging bridge
* validate request artifacts
* verify request artifact digests
* check repository state
* invoke the ForgePilot-controlled OpenCode harness
* write run artifacts
* expose constrained run status
* expose constrained artifact readback

It must not:

* expose arbitrary shell execution
* expose arbitrary OpenCode invocation
* expose arbitrary filesystem access
* accept raw prompts from ChatGPT
* accept raw commands from ChatGPT
* accept arbitrary model overrides
* accept arbitrary paths
* mutate ForgePilot policy
* mutate admitted evidence
* bypass request artifacts

---

## Deployment Boundary

The runner must run on the private dev server.

Recommended role label:

```text
dev-execution-plane
```

The staging MCP bridge remains:

```text
staging-control-plane
```

The runner should not be publicly exposed unless protected by explicit network and authentication controls.

Preferred connectivity:

```text
staging MCP bridge
  -> private network / VPN / restricted tunnel
  -> private dev runner
```

---

## Network Boundary

The runner should listen only on a restricted interface where possible.

Allowed exposure options:

* localhost with reverse tunnel from staging
* private VPN address
* private LAN address
* firewall-restricted port
* explicitly authenticated HTTPS endpoint

The runner must not expose unauthenticated public HTTP.

The runner must not expose raw OpenCode endpoints publicly.

---

## Authentication Boundary

Every non-health endpoint must require authentication.

Recommended authentication:

```text
Authorization: Bearer <runner-token>
```

The runner token must be configured outside the repository.

The token must not be:

* committed to Git
* returned in API responses
* logged
* written to artifacts
* exposed to OpenCode
* included in verification files

Invalid or missing authentication must return:

```text
RUNNER_AUTH_FAILED
```

---

## Protocol Version

The runner must expose:

```text
runnerProtocolVersion: forgepilot-runner-v1
```

The staging bridge must reject incompatible protocol versions.

The runner must not silently change response shapes without a new packet.

---

## Allowed Endpoints

The runner may implement only:

```text
GET  /runner/capabilities
POST /runner/validate-request
POST /runner/start-run
GET  /runner/runs/<runnerRunId>/status
GET  /runner/runs/<runnerRunId>/artifacts
GET  /runner/runs/<runnerRunId>/artifacts/<artifactName>
```

No other endpoint is authorized by FP-MCP-023.

---

## Forbidden Endpoints

The runner must not expose endpoints such as:

```text
/shell
/exec
/command
/bash
/opencode/raw
/opencode/proxy
/model/prompt
/files/read
/files/write
/git/reset
/git/checkout
/env
/secrets
```

No raw proxy endpoint is allowed.

---

## Capabilities Endpoint

Endpoint:

```text
GET /runner/capabilities
```

Purpose:

Report runner availability and configured capabilities.

Allowed observations:

* runner version
* runner protocol version
* runner host role
* execution enabled state
* OpenCode harness configured state
* OpenCode harness reachable state
* supported operations
* supported run modes
* allowed model ids
* reason codes

Forbidden:

* start OpenCode
* run OpenCode health checks that mutate state
* return secrets
* return environment variables
* return raw OpenCode config
* return provider credentials

---

## Validate Request Endpoint

Endpoint:

```text
POST /runner/validate-request
```

Purpose:

Validate that the runner can accept a request artifact for future execution.

Validation must check:

* authenticated caller
* packet id syntax
* request id syntax
* request artifact path safety
* request artifact exists
* request artifact digest matches provided digest
* request artifact schema is valid
* request artifact packet id matches request
* request artifact request id matches request
* request artifact status is `REQUEST_RECORDED`
* request artifact has `executionStarted: false`
* model id is allowed
* run mode is allowed
* base commit matches runner repository commit
* artifact directory is safe
* runner execution is enabled only if future policy allows it

Validation must not start execution.

---

## Start Run Endpoint

Endpoint:

```text
POST /runner/start-run
```

Purpose:

Start a previously validated ForgePilot request artifact.

The endpoint must require:

* authenticated caller
* exact approval token from staging request
* request artifact digest verification
* local validation pass
* no existing started run for same request
* safe artifact directory
* OpenCode harness configured
* execution explicitly enabled by runner policy
* model id allowed
* run mode allowed

The endpoint must not accept:

* raw prompt
* raw command
* arbitrary shell
* arbitrary model
* arbitrary run mode
* arbitrary directory
* arbitrary environment variables
* secrets
* provider credentials

---

## Execution Enablement

The runner must have its own execution enablement control.

Recommended environment variable:

```text
FORGEPILOT_RUNNER_EXECUTION_ENABLED=false
```

Default must be false.

If disabled, `/runner/start-run` must reject with:

```text
EXECUTION_DISABLED
```

This is separate from staging bridge approval.

Both staging bridge approval and runner execution enablement are required.

---

## OpenCode Harness Boundary

The runner may invoke OpenCode only through a ForgePilot-controlled harness.

The harness must:

* derive prompt/input from request artifact and packet files
* use allowed model id only
* use allowed run mode only
* write artifacts to derived artifact directory
* capture stdout/stderr or terminal output to artifact files
* record command metadata
* record exit status
* record start and finish timestamps
* avoid secrets in artifacts
* avoid arbitrary user-supplied shell

The runner must not invoke OpenCode directly from ChatGPT-provided prompt text.

---

## Repository Boundary

The runner must operate on the configured ForgePilot repository only.

Recommended environment variable:

```text
FORGEPILOT_REPO=/home/ridasaidd/forgepilot
```

The runner must not accept repository path from the API caller.

The runner must verify repository state before execution:

* Git repository exists
* working tree is clean
* current commit matches request artifact base commit
* packet file exists
* request artifact exists
* artifact path is safe

---

## Artifact Directory Boundary

The artifact directory must be derived from the request artifact:

```text
runs/<packetId>/<modelId>-<runMode>/
```

The runner must reject:

* absolute paths
* `..`
* path traversal
* hidden path segments unless explicitly allowed
* arbitrary artifact directory overrides
* paths outside `runs/<packetId>/`

---

## Required Artifacts

A successful or failed runner execution should produce explicit artifacts.

Minimum recommended artifacts:

```text
execution-state.json
command-log.json
terminal-output.txt
executor-result.md
verification.txt
metrics.json
```

If an artifact cannot be produced, the absence must be recorded explicitly.

---

## Execution State Artifact

The runner must record execution state.

Recommended path:

```text
runs/<packetId>/<modelId>-<runMode>/execution-state.json
```

Recommended fields:

```text
schemaVersion
runnerRunId
packetId
requestId
modelId
runMode
requestArtifactPath
requestArtifactSha256
baseCommit
artifactDir
status
executionStarted
executionFinished
startedAt
finishedAt
exitCode
reasons
```

No secret fields are allowed.

---

## Command Log Artifact

The runner should record the constrained command invocation.

Recommended path:

```text
runs/<packetId>/<modelId>-<runMode>/command-log.json
```

Allowed fields:

```text
runnerRunId
commandName
argvRedacted
cwd
startedAt
finishedAt
exitCode
durationMs
```

Forbidden fields:

* provider API keys
* bearer tokens
* OAuth tokens
* raw environment variables
* secrets

---

## Terminal Output Artifact

The runner may capture terminal output.

Recommended path:

```text
runs/<packetId>/<modelId>-<runMode>/terminal-output.txt
```

Terminal output must be treated as untrusted.

If terminal output may contain secrets, the runner must either redact it or mark the artifact as not admitted.

---

## Status Endpoint

Endpoint:

```text
GET /runner/runs/<runnerRunId>/status
```

Purpose:

Read status of a runner run.

Allowed statuses:

```text
QUEUED
RUNNING
SUCCEEDED
FAILED
REJECTED
CANCELLED
UNKNOWN
```

The status endpoint must not mutate run state.

---

## Artifact List Endpoint

Endpoint:

```text
GET /runner/runs/<runnerRunId>/artifacts
```

Purpose:

List safe artifacts for a runner run.

The endpoint must not list arbitrary filesystem contents.

Only artifacts under the derived artifact directory may be listed.

---

## Artifact Read Endpoint

Endpoint:

```text
GET /runner/runs/<runnerRunId>/artifacts/<artifactName>
```

Purpose:

Read one safe artifact.

Allowed initial artifact names:

```text
execution-state.json
command-log.json
terminal-output.txt
executor-result.md
verification.txt
metrics.json
remote-runner-start-state.json
```

The endpoint must reject:

* absolute paths
* path separators
* `..`
* hidden files unless explicitly allowed
* arbitrary filenames
* files outside the derived artifact directory

---

## Concurrency Boundary

Initial runner implementation should allow at most one active run.

Reason code for rejecting concurrent start:

```text
RUNNER_BUSY
```

A future packet may define a queue.

Until then, no implicit queue is allowed.

---

## Timeout Boundary

The runner must enforce bounded execution time.

Recommended first timeout:

```text
15 minutes
```

Timeout reason:

```text
OPENCODE_EXECUTION_TIMEOUT
```

The timeout must be recorded in `execution-state.json`.

---

## Process Isolation Boundary

The runner should execute OpenCode in a constrained process.

Minimum requirements:

* fixed working directory
* sanitized environment
* no inherited secret leakage except required model provider credentials
* bounded timeout
* captured output
* no interactive shell
* no TTY unless explicitly required and recorded

A future packet may define stronger isolation.

---

## Model Provider Credentials

If OpenCode requires provider credentials, they must be configured on the private dev runner only.

They must not be:

* visible to ChatGPT
* passed through MCP
* returned in API responses
* written to artifacts
* logged

---

## Runner Run ID

The runner must generate run ids in the format:

```text
RUN-YYYYMMDDTHHMMSSmmmZ-xxxxxxxx
```

Example:

```text
RUN-20260619T131500000Z-a1b2c3d4
```

Run ids must not contain path separators.

---

## State and Idempotency

The runner must detect duplicate starts for the same request artifact.

Duplicate starts must return:

```text
RUN_ALREADY_STARTED
```

Start-run is not idempotent.

Retries require a future packet.

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
* raw shell commands
* request artifact contents
* terminal output unless stored in approved artifact
* secrets

---

## Reason Codes

The runner may emit:

```text
RUNNER_UNCONFIGURED
RUNNER_UNREACHABLE
RUNNER_TIMEOUT
RUNNER_AUTH_FAILED
RUNNER_PROTOCOL_ERROR
RUNNER_REJECTED_REQUEST
RUNNER_BUSY
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
RUN_ALREADY_STARTED
EXECUTION_DISABLED
OPENCODE_HARNESS_UNCONFIGURED
OPENCODE_HARNESS_UNREACHABLE
OPENCODE_EXECUTION_FAILED
OPENCODE_EXECUTION_TIMEOUT
ARTIFACT_WRITE_FAILED
ARTIFACT_NOT_FOUND
ARTIFACT_NOT_ALLOWED
```

---

## Trust Boundary

Runner execution is not admitted evidence.

Runner artifacts are candidate evidence.

They must still be verified, audited, and admitted before influencing observatory outputs.

---

## Acceptance Criteria

* Runner service role is documented.
* Deployment boundary is documented.
* Network boundary is documented.
* Authentication boundary is documented.
* Protocol version is documented.
* Allowed endpoints are documented.
* Forbidden endpoints are documented.
* Capabilities endpoint behavior is documented.
* Validate-request endpoint behavior is documented.
* Start-run endpoint behavior is documented.
* Runner execution enablement is documented.
* OpenCode harness boundary is documented.
* Repository boundary is documented.
* Artifact directory boundary is documented.
* Required artifacts are documented.
* Execution state artifact is documented.
* Command log artifact is documented.
* Terminal output artifact is documented.
* Status endpoint is documented.
* Artifact list endpoint is documented.
* Artifact read endpoint is documented.
* Concurrency boundary is documented.
* Timeout boundary is documented.
* Process isolation boundary is documented.
* Model provider credential boundary is documented.
* Runner run id format is documented.
* State/idempotency behavior is documented.
* Logging boundary is documented.
* Reason codes are documented.
* Trust boundary is documented.
* No runner service implementation is added.
* No OpenCode execution is added.
* No OpenCode CLI invocation is added.
* No OpenCode API invocation is added.
* No shell execution is added.
* No artifact-writing implementation is added.
* No Git mutation is added.
* No SQLite mutation is added.

---

## Future Implementation Packet

The next implementation packet may be:

```text
FP-MCP-024 — Implement Private Dev Runner Skeleton
```

That packet may implement a non-executing runner skeleton with:

* authentication
* `/runner/capabilities`
* `/runner/validate-request`
* no `/runner/start-run` execution yet

A later packet should implement actual OpenCode execution only after the skeleton is verified.

---

## Verification Requirements

Because FP-MCP-023 is boundary-only, verification should confirm:

* packet exists
* packet is committed
* no runner implementation was added
* no bridge code changed
* no MCP tools changed
* no runtime behavior changed
* no OpenCode execution was added
* no OpenCode CLI call was added
* no OpenCode API call was added
* no shell execution was added
* no artifact-writing implementation was added
* ForgePilot repository remains clean after commit

Record artifacts under:

```text
runs/FP-MCP-023/
```

Recommended artifacts:

* `runs/FP-MCP-023/executor-result.md`
* `runs/FP-MCP-023/verification.txt`
