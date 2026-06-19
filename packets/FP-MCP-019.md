# FP-MCP-019 — Remote Runner API Contract

## Task

Define the private dev-side remote runner API contract used by the ForgePilot MCP staging bridge.

## Goal

Create a stable contract between the staging/control-plane MCP bridge and the private dev/execution-plane runner before implementing any runner service or execution-start tool.

FP-MCP-019 answers one question:

**What API may the staging MCP bridge use to communicate with the private dev runner without becoming a raw OpenCode or shell proxy?**

This packet is contract-only.

It does not implement a runner service.

It does not implement MCP runner-start tools.

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

FP-MCP-019 may define:

* private runner endpoint contract
* request and response shapes
* authentication requirements
* timeout requirements
* idempotency requirements
* allowed operations
* forbidden operations
* artifact transfer boundaries
* status polling boundaries
* artifact readback boundaries
* error/reason code standards
* logging/redaction requirements
* versioning requirements
* future implementation constraints

FP-MCP-019 must not add:

* runner implementation code
* MCP tool implementation code
* OpenCode execution
* OpenCode CLI invocation
* OpenCode API invocation
* shell execution
* arbitrary HTTP proxying
* background workers
* artifact-writing implementation
* Git mutation
* SQLite mutation

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

## Topology

The approved topology remains:

```text
ChatGPT
  ↓
staging MCP bridge
  ↓
private dev runner API
  ↓
ForgePilot-controlled OpenCode harness
  ↓
recorded run artifacts
```

The staging MCP bridge is the control plane.

The private dev runner is the execution plane.

The staging bridge must not become a raw OpenCode proxy.

The private runner must not expose arbitrary shell or arbitrary OpenCode execution.

---

## Trust Model

The runner API is not a source of truth by itself.

The runner API reports observations.

ForgePilot artifacts remain the evidence record.

A runner response is not admitted evidence until verification and admission rules allow it.

---

## Base URL

The staging bridge may derive the runner base URL only from controlled environment configuration:

```text
FORGEPILOT_REMOTE_RUNNER_BASE_URL
FORGEPILOT_RUNNER_BASE_URL
```

The user must not be able to supply a raw runner URL through a tool call.

The runner base URL must not be returned in normal tool output.

---

## Authentication

The staging bridge may authenticate to the runner using a bearer token derived from controlled environment configuration:

```text
FORGEPILOT_REMOTE_RUNNER_TOKEN
FORGEPILOT_RUNNER_TOKEN
```

The token must not be:

* returned in MCP output
* logged
* written to artifacts
* echoed in errors
* included in verification files
* exposed to OpenCode

The runner should reject unauthenticated or invalid requests with:

```text
RUNNER_AUTH_FAILED
```

---

## Protocol Version

The runner API must expose a protocol version.

Recommended initial protocol version:

```text
forgepilot-runner-v1
```

Every response should include:

```text
runnerProtocolVersion
```

The staging bridge must reject incompatible future protocol versions unless a future packet authorizes compatibility.

---

## Required Endpoints

The private runner contract may define the following endpoints:

```text
GET  /runner/capabilities
POST /runner/validate-request
POST /runner/start-run
GET  /runner/runs/<runnerRunId>/status
GET  /runner/runs/<runnerRunId>/artifacts
GET  /runner/runs/<runnerRunId>/artifacts/<artifactName>
```

No other runner endpoint is authorized by FP-MCP-019.

---

## Endpoint: GET /runner/capabilities

Purpose:

Report runner availability and static capabilities.

Allowed behavior:

* read runner configuration
* read local OpenCode harness availability
* return supported operations
* return supported run modes
* return discovered local model ids if safe
* return runner protocol version
* return execution enabled state

Forbidden behavior:

* start OpenCode
* run shell commands except future explicitly authorized health checks
* create artifacts
* mutate files
* mutate Git
* contact model providers
* return secrets

Recommended response shape:

```json
{
  "runnerVersion": "0.1.0",
  "runnerProtocolVersion": "forgepilot-runner-v1",
  "runnerHostRole": "dev-execution-plane",
  "executionEnabled": false,
  "opencodeHarnessConfigured": true,
  "opencodeHarnessReachable": false,
  "supportedOperations": [
    "capabilities",
    "validate-request"
  ],
  "supportedRunModes": [
    "DESIGN_ONLY"
  ],
  "allowedModels": [
    "deepseek-v4-pro-high",
    "qwen-3.7-max"
  ],
  "reasons": [
    "EXECUTION_DISABLED"
  ]
}
```

---

## Endpoint: POST /runner/validate-request

Purpose:

Allow the runner to independently validate a request artifact before start.

Allowed request shape:

```json
{
  "packetId": "FP-MCP-000",
  "requestId": "REQ-00000000T000000000Z-00000000",
  "requestArtifactPath": "runs/FP-MCP-000/opencode-requests/REQ-00000000T000000000Z-00000000.json",
  "requestArtifactSha256": "<sha256>",
  "baseCommit": "<git-short-sha>",
  "boundaryVersion": "FP-MCP-019"
}
```

Forbidden request fields:

* prompt
* command
* shell
* model override
* run-mode override
* raw artifact directory override
* arbitrary repository path
* arbitrary environment variables
* secrets

Recommended response shape:

```json
{
  "valid": true,
  "runnerContacted": true,
  "executionStarted": false,
  "packetId": "FP-MCP-000",
  "requestId": "REQ-00000000T000000000Z-00000000",
  "baseCommitMatches": true,
  "requestArtifactDigestMatches": true,
  "modelAllowed": true,
  "runModeAllowed": true,
  "artifactDirSafe": true,
  "runnerProtocolVersion": "forgepilot-runner-v1",
  "reasons": []
}
```

Validation must not start execution.

---

## Endpoint: POST /runner/start-run

Purpose:

Request the runner to start a previously validated OpenCode run.

FP-MCP-019 defines the contract only.

A later packet must authorize implementation and MCP exposure.

Allowed request shape:

```json
{
  "packetId": "FP-MCP-000",
  "requestId": "REQ-00000000T000000000Z-00000000",
  "requestArtifactPath": "runs/FP-MCP-000/opencode-requests/REQ-00000000T000000000Z-00000000.json",
  "requestArtifactSha256": "<sha256>",
  "baseCommit": "<git-short-sha>",
  "approval": "START_REMOTE_RUNNER_REQUEST",
  "boundaryVersion": "FP-MCP-019"
}
```

Forbidden request fields:

* raw prompt
* raw command
* shell command
* model override
* run-mode override
* arbitrary URL
* arbitrary path
* environment variables
* secrets
* provider credentials

Recommended accepted response:

```json
{
  "accepted": true,
  "runnerRunId": "RUN-00000000T000000000Z-00000000",
  "runnerContacted": true,
  "executionStarted": true,
  "packetId": "FP-MCP-000",
  "requestId": "REQ-00000000T000000000Z-00000000",
  "artifactDir": "runs/FP-MCP-000/qwen-3.7-max-DESIGN_ONLY/",
  "runnerProtocolVersion": "forgepilot-runner-v1",
  "status": "RUNNER_ACCEPTED",
  "reasons": []
}
```

Recommended rejected response:

```json
{
  "accepted": false,
  "runnerRunId": null,
  "runnerContacted": true,
  "executionStarted": false,
  "packetId": "FP-MCP-000",
  "requestId": "REQ-00000000T000000000Z-00000000",
  "artifactDir": null,
  "runnerProtocolVersion": "forgepilot-runner-v1",
  "status": "RUNNER_REJECTED",
  "reasons": [
    "BASE_COMMIT_MISMATCH"
  ]
}
```

---

## Endpoint: GET /runner/runs/<runnerRunId>/status

Purpose:

Read runner status for a previously accepted run.

Allowed behavior:

* return run status
* return timestamps
* return artifact availability summary
* return sanitized failure reason codes

Forbidden behavior:

* stream raw terminal output
* return secrets
* mutate run state
* retry execution
* restart execution
* expose raw prompt text unless future packet explicitly authorizes it

Recommended response shape:

```json
{
  "runnerRunId": "RUN-00000000T000000000Z-00000000",
  "packetId": "FP-MCP-000",
  "requestId": "REQ-00000000T000000000Z-00000000",
  "status": "RUNNING",
  "executionStarted": true,
  "executionFinished": false,
  "exitCode": null,
  "artifactDir": "runs/FP-MCP-000/qwen-3.7-max-DESIGN_ONLY/",
  "availableArtifacts": [],
  "runnerProtocolVersion": "forgepilot-runner-v1",
  "reasons": []
}
```

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

---

## Endpoint: GET /runner/runs/<runnerRunId>/artifacts

Purpose:

List artifacts available for a runner run.

Recommended response shape:

```json
{
  "runnerRunId": "RUN-00000000T000000000Z-00000000",
  "packetId": "FP-MCP-000",
  "requestId": "REQ-00000000T000000000Z-00000000",
  "artifactDir": "runs/FP-MCP-000/qwen-3.7-max-DESIGN_ONLY/",
  "artifacts": [
    "executor-result.md",
    "verification.txt",
    "metrics.json"
  ],
  "runnerProtocolVersion": "forgepilot-runner-v1",
  "reasons": []
}
```

The runner must not list arbitrary filesystem contents.

---

## Endpoint: GET /runner/runs/<runnerRunId>/artifacts/<artifactName>

Purpose:

Read one allowed artifact.

Allowed artifact names should be constrained to a safe allowlist or sanitized filename pattern.

Recommended initial allowlist:

```text
executor-result.md
verification.txt
metrics.json
command-log.json
terminal-output.txt
execution-state.json
remote-runner-start-state.json
```

The endpoint must reject:

* absolute paths
* `..`
* path separators
* hidden files unless explicitly allowed
* arbitrary filenames
* secrets
* provider credentials

Recommended response shape:

```json
{
  "runnerRunId": "RUN-00000000T000000000Z-00000000",
  "artifactName": "executor-result.md",
  "content": "...",
  "truncated": false,
  "returnedChars": 1000,
  "totalChars": 1000,
  "runnerProtocolVersion": "forgepilot-runner-v1",
  "reasons": []
}
```

---

## Runner Run ID Format

Recommended runner run id format:

```text
RUN-YYYYMMDDTHHMMSSmmmZ-xxxxxxxx
```

Example:

```text
RUN-20260619T131500000Z-a1b2c3d4
```

Runner run ids must not contain path separators.

---

## Request Artifact Digest

The staging bridge should compute:

```text
requestArtifactSha256
```

The runner must verify it before validation or start.

Digest mismatch must produce:

```text
REQUEST_DIGEST_MISMATCH
```

---

## Base Commit Requirement

The runner must verify that the current execution repository commit matches the request artifact `baseCommit`.

Mismatch must produce:

```text
BASE_COMMIT_MISMATCH
```

The runner must not start execution when base commit mismatches.

---

## Idempotency

Capability and status reads are idempotent.

Validation is idempotent.

Start-run is not idempotent.

The runner must reject duplicate starts for the same request artifact unless a future packet defines retry semantics.

Duplicate start reason code:

```text
RUN_ALREADY_STARTED
```

---

## Timeout Requirements

The staging bridge must use bounded timeouts for runner API calls.

Recommended initial values:

```text
capabilities: 3000 ms
validate-request: 5000 ms
start-run: 10000 ms
status: 5000 ms
artifact-list: 5000 ms
artifact-read: 5000 ms
```

Timeouts must return reason code:

```text
RUNNER_TIMEOUT
```

---

## No Raw Proxy Rule

The staging bridge must never expose:

* arbitrary HTTP method selection
* arbitrary runner URL selection
* arbitrary path selection
* arbitrary body forwarding
* arbitrary OpenCode options
* arbitrary shell execution
* arbitrary filesystem access

Each MCP tool must map to exactly one constrained runner operation.

---

## Logging Boundary

Both staging bridge and dev runner must follow sanitized logging.

Allowed staging log shape:

```text
MCP tool invoked: <tool_name>
MCP tool completed: <tool_name> PASS durationMs=<number>
MCP tool completed: <tool_name> FAIL errorCode=<SANITIZED_CODE> durationMs=<number>
```

Allowed runner log shape:

```text
Runner operation invoked: <operation_name>
Runner operation completed: <operation_name> PASS durationMs=<number>
Runner operation completed: <operation_name> FAIL errorCode=<SANITIZED_CODE> durationMs=<number>
```

Logs must not contain:

* bearer tokens
* environment variables
* raw prompts
* raw shell commands
* provider credentials
* OAuth tokens
* full runner URLs with secrets
* raw request artifact contents
* raw terminal output unless explicitly written to approved artifact file

---

## Reason Code Standard

Common reason codes:

```text
RUNNER_UNCONFIGURED
RUNNER_UNREACHABLE
RUNNER_TIMEOUT
RUNNER_AUTH_FAILED
RUNNER_PROTOCOL_ERROR
RUNNER_REJECTED_REQUEST
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
EXECUTION_NOT_ENABLED
OPENCODE_HARNESS_UNCONFIGURED
OPENCODE_HARNESS_UNREACHABLE
OPENCODE_EXECUTION_FAILED
ARTIFACT_NOT_FOUND
ARTIFACT_NOT_ALLOWED
ARTIFACT_TRUNCATED
```

Raw exceptions must not be exposed when they reveal internals or secrets.

---

## Version Compatibility

The staging bridge must check `runnerProtocolVersion`.

If incompatible:

```text
RUNNER_PROTOCOL_ERROR
```

A future compatibility matrix may be defined if needed.

---

## Open World Boundary

Any MCP tool that contacts the remote runner API must be annotated:

```text
openWorldHint: true
```

This applies even when the operation is read-only.

---

## Acceptance Criteria

* Private runner API topology is documented.
* Base URL derivation is documented.
* Authentication requirements are documented.
* Protocol version is documented.
* Required endpoints are documented.
* Capabilities endpoint contract is documented.
* Validate-request endpoint contract is documented.
* Start-run endpoint contract is documented.
* Run-status endpoint contract is documented.
* Artifact-list endpoint contract is documented.
* Artifact-read endpoint contract is documented.
* Runner run id format is documented.
* Request artifact digest requirement is documented.
* Base commit requirement is documented.
* Idempotency requirements are documented.
* Timeout requirements are documented.
* No raw proxy rule is documented.
* Logging boundary is documented.
* Reason code standard is documented.
* Version compatibility rule is documented.
* Open-world boundary is documented.
* No runner implementation is added.
* No MCP tool implementation is added.
* No OpenCode execution is added.
* No OpenCode CLI invocation is added.
* No OpenCode API invocation is added.
* No shell execution is added.
* No artifact-writing implementation is added.
* No Git mutation is added.
* No SQLite mutation is added.

---

## Future Implementation Packets

Possible next packets:

```text
FP-MCP-020 — Add Remote Runner Validation Endpoint Client
FP-MCP-021 — Add Remote Runner Start Tool
FP-MCP-022 — Add Remote Runner Status Readback Tool
FP-MCP-023 — Add Remote Runner Artifact Readback Tool
```

The actual order may change.

Runner implementation may happen in the bridge repository or a separate private runner repository, but must obey this contract.

---

## Verification Requirements

Because FP-MCP-019 is contract-only, verification should confirm:

* packet exists
* packet is committed
* no bridge code changed
* no MCP tools changed
* no runtime behavior changed
* no runner implementation was added
* no remote execution was added
* no OpenCode execution was added
* no OpenCode CLI call was added
* no OpenCode API call was added
* no shell execution was added
* ForgePilot repository remains clean after commit

Record artifacts under:

```text
runs/FP-MCP-019/
```

Recommended artifacts:

* `runs/FP-MCP-019/executor-result.md`
* `runs/FP-MCP-019/verification.txt`
