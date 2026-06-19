# FP-MCP-021 — Remote Runner Start Tool Boundary

## Task

Define the safety boundary for a future MCP tool that requests the private dev runner to start an OpenCode run.

## Goal

Establish the final control-plane requirements before the staging MCP bridge may call the private dev runner `/runner/start-run` endpoint.

FP-MCP-021 answers one question:

**What must be true before ChatGPT may request the private dev runner to start an OpenCode run through ForgePilot?**

This packet is boundary-only.

It does not implement a start tool.

It does not call `/runner/start-run`.

It does not start OpenCode.

It does not call the OpenCode CLI.

It does not call the OpenCode API directly.

It does not execute shell commands.

It does not create execution artifacts.

It does not mutate request artifacts.

It does not mutate Git.

It does not mutate SQLite.

---

## Scope Boundary

FP-MCP-021 may define:

* future start tool name
* required input schema
* required approval token
* local validation gate
* remote validation gate
* request digest requirement
* runner start request shape
* expected runner response shape
* required pre-start state artifact
* required post-start state artifact
* timeout requirements
* idempotency requirements
* failure reason codes
* logging and redaction requirements
* artifact capture requirements
* verification requirements
* future implementation constraints

FP-MCP-021 must not add:

* MCP start tool implementation
* runner implementation code
* OpenCode execution
* OpenCode CLI invocation
* OpenCode API invocation
* shell execution
* arbitrary HTTP proxying
* artifact writing implementation
* Git mutation
* SQLite mutation
* background workers
* automatic retries

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

### FP-MCP-015

FP-MCP-015 added local remote-runner request validation.

A future start tool must pass local validation before any start attempt.

### FP-MCP-018

FP-MCP-018 added remote runner status discovery.

A future start tool may require runner status to show a configured and reachable runner, but status alone must not authorize execution.

### FP-MCP-019

FP-MCP-019 defined the remote runner API contract.

A future start tool must call only the contracted `/runner/start-run` endpoint.

### FP-MCP-020

FP-MCP-020 added a remote runner validation endpoint client.

A future start tool must pass remote validation before calling `/runner/start-run`.

---

## Future Tool Name

The future implementation packet should add:

```text
forgepilot_start_remote_runner_request
```

This packet does not add that tool.

---

## Required Input Schema

The future start tool may accept only:

```text
packetId: string
requestId: string
approval: string
```

It must not accept:

* runner URL
* HTTP method
* raw HTTP body
* prompt
* command
* shell
* model override
* run-mode override
* artifact directory override
* arbitrary repository path
* environment variables
* secrets
* OpenCode options
* provider credentials

The request artifact remains the only source of execution intent.

---

## Required Approval Token

The future start tool must require exact approval:

```text
START_REMOTE_RUNNER_REQUEST
```

Any missing or incorrect approval must produce:

```text
runnerContacted: false
executionStarted: false
reasons: ["APPROVAL_REQUIRED"]
```

The approval token authorizes only the specific packet id and request id in the tool call.

It must not authorize future starts.

---

## Required Gate Order

The future start tool must execute gates in this order:

```text
1. Validate input syntax.
2. Check exact approval token.
3. Run local validation equivalent to FP-MCP-015.
4. Confirm runner is configured.
5. Compute request artifact SHA-256 digest.
6. Call remote runner validate-request equivalent to FP-MCP-020.
7. Confirm remote validation accepted.
8. Record pre-start state artifact.
9. Call POST /runner/start-run.
10. Record post-start state artifact.
11. Return structured result.
```

If any gate fails, later gates must not run.

---

## Local Validation Gate

The future start tool must verify locally:

* packet id is syntactically valid
* request id is syntactically valid
* packet file exists
* request artifact exists
* request artifact path is derived from packet id and request id
* request artifact path is safe
* request artifact schema is valid
* request artifact packet id matches input packet id
* request artifact request id matches input request id
* request artifact status is `REQUEST_RECORDED`
* request artifact has `executionStarted: false`
* model is allowed
* run mode is allowed
* current repository working tree is clean
* current commit matches request artifact base commit
* artifact directory is safe

If local validation fails:

```text
runnerContacted: false
executionStarted: false
```

---

## Remote Validation Gate

Before start, the future start tool must validate the request with the configured remote runner endpoint:

```text
POST /runner/validate-request
```

Start may proceed only if remote validation returns:

```text
valid: true
executionStarted: false
runnerProtocolVersion: forgepilot-runner-v1
reasons: []
```

Remote validation failure must prevent start.

---

## Runner Configuration Gate

The future start tool must require a configured runner base URL from controlled environment configuration:

```text
FORGEPILOT_REMOTE_RUNNER_BASE_URL
FORGEPILOT_RUNNER_BASE_URL
```

If unconfigured:

```text
runnerConfigured: false
runnerContacted: false
executionStarted: false
reasons: ["RUNNER_UNCONFIGURED"]
```

The tool must never accept a runner URL from the user.

---

## Runner Authentication

The future start tool may use a bearer token from:

```text
FORGEPILOT_REMOTE_RUNNER_TOKEN
FORGEPILOT_RUNNER_TOKEN
```

The token must not be:

* returned in MCP output
* logged
* written to artifacts
* exposed to OpenCode
* included in verification files

Authentication failure must produce:

```text
RUNNER_AUTH_FAILED
```

---

## Request Artifact Digest

The future start tool must compute:

```text
requestArtifactSha256
```

over the exact request artifact file content.

The digest must be sent to both:

```text
/runner/validate-request
/runner/start-run
```

Digest mismatch must prevent start.

---

## Start Endpoint

The future start tool may contact only:

```text
POST <configured-runner-base-url>/runner/start-run
```

It must not contact:

* arbitrary paths
* arbitrary URLs
* OpenCode directly
* model providers directly
* shell endpoints
* artifact endpoints unless future readback packet authorizes them

---

## Start Request Shape

Allowed request body:

```json
{
  "packetId": "FP-MCP-000",
  "requestId": "REQ-00000000T000000000Z-00000000",
  "requestArtifactPath": "runs/FP-MCP-000/opencode-requests/REQ-00000000T000000000Z-00000000.json",
  "requestArtifactSha256": "<sha256>",
  "baseCommit": "<git-short-sha>",
  "approval": "START_REMOTE_RUNNER_REQUEST",
  "boundaryVersion": "FP-MCP-021"
}
```

Forbidden request fields:

* prompt
* command
* shell
* model override
* run-mode override
* artifact directory override
* arbitrary repository path
* arbitrary environment variables
* secrets
* provider credentials
* OpenCode options

---

## Expected Start Success Response

A successful runner response should have:

```json
{
  "accepted": true,
  "runnerRunId": "RUN-20260619T131500000Z-a1b2c3d4",
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

The staging bridge must validate:

* response is a JSON object
* `accepted` is true
* `runnerRunId` is valid
* `runnerContacted` is true
* `executionStarted` is true
* packet id matches
* request id matches
* artifact directory is safe
* protocol version is compatible
* reasons is an array of strings

---

## Expected Start Rejection Response

A rejected runner response should have:

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
  "reasons": ["BASE_COMMIT_MISMATCH"]
}
```

Runner rejection must be recorded as an observation.

---

## Pre-Start State Artifact

Before calling `/runner/start-run`, the future implementation must write a pre-start state artifact.

Recommended path:

```text
runs/<packetId>/<modelId>-<runMode>/remote-runner-start-state.json
```

Recommended content:

```json
{
  "schemaVersion": "FP-MCP-021",
  "packetId": "<packetId>",
  "requestId": "<requestId>",
  "modelId": "<modelId>",
  "runMode": "<runMode>",
  "requestArtifactPath": "<path>",
  "requestArtifactSha256": "<sha256>",
  "baseCommit": "<commit>",
  "approval": "START_REMOTE_RUNNER_REQUEST",
  "runnerContacted": false,
  "executionStarted": false,
  "status": "START_REQUEST_RECORDED",
  "createdAt": "<iso-date>"
}
```

This artifact must not contain secrets.

---

## Post-Start State Artifact

After runner response, the future implementation must record the result.

Recommended success state:

```json
{
  "schemaVersion": "FP-MCP-021",
  "packetId": "<packetId>",
  "requestId": "<requestId>",
  "runnerRunId": "<runnerRunId>",
  "runnerContacted": true,
  "executionStarted": true,
  "status": "RUNNER_ACCEPTED",
  "reasons": []
}
```

Recommended failure state:

```json
{
  "schemaVersion": "FP-MCP-021",
  "packetId": "<packetId>",
  "requestId": "<requestId>",
  "runnerRunId": null,
  "runnerContacted": true,
  "executionStarted": false,
  "status": "RUNNER_REJECTED",
  "reasons": ["<reason>"]
}
```

No success may be inferred from missing failure.

---

## Request Artifact Mutation Boundary

The future start tool must not mutate the original request artifact.

It must not flip:

```text
executionStarted
status
```

inside the FP-MCP-007 request artifact.

Execution state must be recorded in new append-only run artifacts.

---

## Timeout Boundary

The start request must use a bounded timeout.

Recommended initial timeout:

```text
10000 milliseconds
```

Timeout must produce:

```text
RUNNER_TIMEOUT
```

If the contact/execution state is ambiguous, the result must say so explicitly.

No automatic retry is allowed.

---

## Idempotency Boundary

Start-run is not idempotent.

The future tool must be annotated:

```text
readOnlyHint: false
destructiveHint: false
idempotentHint: false
openWorldHint: true
```

The future tool starts an external execution process and must not be presented as read-only.

---

## Duplicate Start Boundary

The future start tool must reject duplicate starts where possible.

Reason code:

```text
RUN_ALREADY_STARTED
```

Duplicate detection may use:

* existing state artifact
* runner response
* request artifact execution state
* artifact directory state

A future retry policy requires a separate packet.

---

## Output Schema

The future start tool should return structured output with at least:

```text
started
accepted
runnerConfigured
runnerContacted
executionStarted
packetId
requestId
requestArtifactPath
requestArtifactSha256
baseCommit
runnerRunId
artifactDir
runnerProtocolVersion
boundaryVersion
statusSource
checkedAt
reasons
```

It must not return:

* runner URL
* bearer token
* environment variables
* raw request artifact contents
* prompt text
* shell commands
* terminal output
* provider credentials
* OAuth tokens

---

## Logging Boundary

FP-MCP-004 sanitized logging remains authoritative.

Allowed staging log shape:

```text
MCP tool invoked: forgepilot_start_remote_runner_request
MCP tool completed: forgepilot_start_remote_runner_request PASS durationMs=<number>
MCP tool completed: forgepilot_start_remote_runner_request FAIL errorCode=<SANITIZED_CODE> durationMs=<number>
```

The tool must not log:

* approval token
* runner URL
* runner token
* request body
* response body
* request artifact contents
* request digest
* environment variables
* secrets
* prompt text
* command text
* terminal output

---

## Reason Codes

The future start tool may emit:

```text
APPROVAL_REQUIRED
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
REMOTE_VALIDATION_FAILED
STATE_ARTIFACT_WRITE_FAILED
RUNNER_ACCEPTED_BUT_NO_RUN_ID
```

---

## Trust Boundary

A started run is not an accepted result.

Runner acceptance is only an observation that execution began.

Execution artifacts must still be collected.

The run must still be verified.

The result must still be audited.

Only admitted evidence may influence observatory outputs.

---

## Acceptance Criteria

* Future start tool name is documented.
* Required input schema is documented.
* Exact approval token is documented.
* Required gate order is documented.
* Local validation gate is documented.
* Remote validation gate is documented.
* Runner configuration gate is documented.
* Runner authentication requirements are documented.
* Request artifact digest requirement is documented.
* Start endpoint is documented.
* Start request shape is documented.
* Forbidden request fields are documented.
* Expected success response is documented.
* Expected rejection response is documented.
* Pre-start state artifact is documented.
* Post-start state artifact is documented.
* Request artifact mutation boundary is documented.
* Timeout boundary is documented.
* Idempotency boundary is documented.
* Duplicate start boundary is documented.
* Output schema is documented.
* Logging boundary is documented.
* Reason codes are documented.
* Trust boundary is documented.
* No start tool is implemented.
* No runner implementation code is added.
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
FP-MCP-022 — Add Remote Runner Start Tool
```

That packet may implement the start tool only if it satisfies FP-MCP-021.

---

## Verification Requirements

Because FP-MCP-021 is boundary-only, verification should confirm:

* packet exists
* packet is committed
* no bridge code changed
* no MCP tools changed
* no runtime behavior changed
* no runner start tool was added
* no `/runner/start-run` call was added
* no OpenCode execution was added
* no OpenCode CLI call was added
* no OpenCode API call was added
* no shell execution was added
* no artifact-writing implementation was added
* ForgePilot repository remains clean after commit

Record artifacts under:

```text
runs/FP-MCP-021/
```

Recommended artifacts:

* `runs/FP-MCP-021/executor-result.md`
* `runs/FP-MCP-021/verification.txt`
