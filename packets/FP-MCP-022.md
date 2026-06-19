# FP-MCP-022 — Add Remote Runner Start Tool

## Task

Add a guarded MCP tool that may request the private dev runner to start an OpenCode run only after all required gates pass.

## Goal

Introduce the first execution-adjacent MCP tool while preserving ForgePilot’s evidence, validation, approval, and artifact boundaries.

FP-MCP-022 answers one question:

**Can ChatGPT request a remote runner start through ForgePilot without becoming a raw OpenCode, shell, or model proxy?**

This packet may implement a guarded start tool.

The tool must fail closed unless all gates pass.

The tool must not accept raw execution content.

The tool must not contact `/runner/start-run` unless local validation, runner configuration, digest calculation, remote validation, approval, and state recording all pass.

---

## Scope Boundary

FP-MCP-022 may add:

* one MCP start tool
* exact approval-token check
* local validation gate
* remote validation gate
* request artifact digest calculation
* guarded `POST /runner/start-run` client
* pre-start state artifact writing
* post-start state artifact writing
* structured output
* readable JSON fallback
* sanitized failure reason codes

FP-MCP-022 must not add:

* remote runner implementation code
* OpenCode CLI invocation from the staging bridge
* OpenCode API invocation from the staging bridge
* shell execution from the staging bridge
* arbitrary HTTP proxying
* arbitrary URL fetching
* raw prompt transmission
* raw command transmission
* model override
* run-mode override
* arbitrary path execution
* request artifact mutation
* SQLite mutation
* automatic retries
* background execution from the staging bridge

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

FP-MCP-015 local request validation remains required before any runner contact.

### FP-MCP-020

FP-MCP-020 remote runner validation remains required before any start call.

### FP-MCP-021

FP-MCP-021 defines the start tool boundary.

FP-MCP-022 implements that boundary.

---

## Tool Added

Add MCP tool:

```text
forgepilot_start_remote_runner_request
```

Tool purpose:

```text
Request the configured private dev runner to start an OpenCode run for an existing ForgePilot request artifact after all validation gates pass.
```

---

## Input Schema

The tool may accept only:

```text
packetId: string
requestId: string
approval: string
```

The tool must not accept:

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

---

## Approval Token

The tool must require exact approval:

```text
START_REMOTE_RUNNER_REQUEST
```

Any missing or incorrect approval must produce:

```text
started: false
accepted: false
runnerContacted: false
executionStarted: false
reasons: ["APPROVAL_REQUIRED"]
```

The approval token authorizes only the specific packet id and request id in the tool call.

---

## Required Gate Order

The implementation must execute gates in this order:

```text
1. Validate input syntax.
2. Check exact approval token.
3. Run local validation equivalent to FP-MCP-015.
4. Confirm runner base URL is configured.
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

The tool must run local validation equivalent to:

```text
forgepilot_validate_remote_runner_request
```

If local validation fails:

```text
runnerContacted: false
executionStarted: false
```

The tool must not contact the runner when local validation fails.

---

## Remote Validation Gate

The tool must run remote validation equivalent to:

```text
forgepilot_validate_remote_runner_endpoint_request
```

If remote validation fails:

```text
startEndpointContacted: false
executionStarted: false
```

The tool must not call `/runner/start-run` when remote validation fails.

---

## Runner Configuration Gate

The tool may derive the runner base URL only from controlled environment configuration:

```text
FORGEPILOT_REMOTE_RUNNER_BASE_URL
FORGEPILOT_RUNNER_BASE_URL
```

If no runner is configured:

```text
runnerConfigured: false
runnerContacted: false
executionStarted: false
reasons: ["RUNNER_UNCONFIGURED"]
```

The tool must never accept a runner URL from the user.

---

## Request Artifact Digest

The tool must compute:

```text
requestArtifactSha256
```

over the exact request artifact file content.

The digest must be sent to:

```text
/runner/validate-request
/runner/start-run
```

Digest mismatch or digest failure must prevent start.

---

## Pre-Start State Artifact

Before calling `/runner/start-run`, the tool must write:

```text
runs/<packetId>/<modelId>-<runMode>/remote-runner-start-state.json
```

The artifact must record:

```text
schemaVersion: FP-MCP-022
packetId
requestId
modelId
runMode
requestArtifactPath
requestArtifactSha256
baseCommit
approval: START_REMOTE_RUNNER_REQUEST
runnerContacted: false
executionStarted: false
status: START_REQUEST_RECORDED
createdAt
```

The artifact must not contain secrets.

If pre-start artifact writing fails, the tool must not contact `/runner/start-run`.

Reason code:

```text
STATE_ARTIFACT_WRITE_FAILED
```

---

## Start Endpoint

The tool may contact only:

```text
POST <configured-runner-base-url>/runner/start-run
```

It must not contact:

* arbitrary URLs
* arbitrary runner paths
* OpenCode directly
* model providers directly
* shell endpoints
* artifact endpoints

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
  "boundaryVersion": "FP-MCP-022"
}
```

Forbidden request body fields:

* prompt
* command
* shell
* model override
* run-mode override
* artifact directory override
* arbitrary repository path
* environment variables
* secrets
* provider credentials
* OpenCode options

---

## Post-Start State Artifact

After runner response, the tool must update or rewrite the state artifact with the observed result.

Successful state must include:

```text
runnerRunId
runnerContacted: true
executionStarted: true
status: RUNNER_ACCEPTED
reasons: []
```

Rejected state must include:

```text
runnerRunId: null
runnerContacted: true
executionStarted: false
status: RUNNER_REJECTED
reasons
```

No success may be inferred from missing failure.

---

## Request Artifact Mutation Boundary

The tool must not mutate the original FP-MCP-007 request artifact.

The tool must not change:

```text
executionStarted
status
```

inside the request artifact.

Execution state must be recorded in new run artifacts.

---

## Output Schema

The tool should return structured output with at least:

```text
started
accepted
approvalAccepted
runnerConfigured
runnerContacted
startEndpointContacted
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

Additional local/remote validation booleans may be returned if useful.

Output must not include:

* runner URL
* bearer token
* environment variables
* raw request artifact contents
* prompt text
* command text
* terminal output
* provider credentials
* OAuth tokens

---

## Timeout Boundary

The start request must use a bounded timeout.

Recommended timeout:

```text
10000 milliseconds
```

Timeout must produce:

```text
RUNNER_TIMEOUT
```

No automatic retry is allowed.

---

## Idempotency and Tool Metadata

The tool starts external execution if all gates pass.

Required annotations:

```text
readOnlyHint: false
destructiveHint: false
idempotentHint: false
openWorldHint: true
```

The tool is not read-only.

The tool is not idempotent.

---

## Duplicate Start Boundary

The tool must reject duplicate starts where possible.

Reason code:

```text
RUN_ALREADY_STARTED
```

Duplicate detection may use:

* existing state artifact
* runner response
* request artifact state
* artifact directory state

Retry semantics require a future packet.

---

## Runner Response Handling

The runner response must be treated as untrusted.

The staging bridge must validate:

* response is JSON object
* `accepted` is boolean
* `runnerRunId` is string or null
* `runnerContacted` is true
* `executionStarted` is boolean
* packet id matches
* request id matches
* artifact directory is safe if present
* protocol version is compatible
* reasons is an array of strings

Malformed response must produce:

```text
RUNNER_PROTOCOL_ERROR
```

If the runner reports accepted but no run id:

```text
RUNNER_ACCEPTED_BUT_NO_RUN_ID
```

---

## Logging Boundary

FP-MCP-004 sanitized logging remains authoritative.

Allowed log shape:

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

The tool may emit:

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
REMOTE_VALIDATION_FAILED
STATE_ARTIFACT_WRITE_FAILED
RUNNER_ACCEPTED_BUT_NO_RUN_ID
```

---

## Expected Current Result

With no runner configured, the expected safe result is:

```text
started: false
accepted: false
approvalAccepted: true
runnerConfigured: false
runnerContacted: false
startEndpointContacted: false
executionStarted: false
reasons: ["RUNNER_UNCONFIGURED", ...local validation reasons if any]
```

This is the expected initial verification result until a private dev runner is configured.

---

## Trust Boundary

A started run is not an accepted result.

Runner acceptance only means execution began.

Artifacts must still be collected.

The run must still be verified.

The result must still be audited.

Only admitted evidence may influence observatory outputs.

---

## Acceptance Criteria

* Tool `forgepilot_start_remote_runner_request` is added.
* Tool accepts only packetId, requestId, approval.
* Tool requires exact `START_REMOTE_RUNNER_REQUEST` approval.
* Tool performs local validation before runner contact.
* Tool performs remote validation before start contact.
* Tool computes request artifact SHA-256 digest.
* Tool writes pre-start state artifact before start contact.
* Tool contacts only configured `/runner/start-run`.
* Tool does not contact `/runner/start-run` when approval fails.
* Tool does not contact `/runner/start-run` when local validation fails.
* Tool does not contact `/runner/start-run` when remote validation fails.
* Tool does not accept arbitrary URL.
* Tool does not accept prompt or command.
* Tool does not call OpenCode CLI from staging.
* Tool does not call OpenCode API from staging.
* Tool does not execute shell commands from staging.
* Tool does not mutate request artifact.
* Tool does not mutate Git.
* Tool does not mutate SQLite.
* Tool does not expose secrets.
* Tool does not log secrets.
* Tool returns structured output.
* Tool preserves readable JSON fallback.
* Tool metadata is execution-adjacent, not read-only.
* Build passes.
* Test passes.
* Tool is visible in ChatGPT Actions.
* Current unconfigured runner case safely refuses to start.

---

## Verification Requirements

Verification must record:

* ForgePilot packet commit
* bridge implementation commit
* build/test result
* service restart result
* Actions refresh/tool visibility result
* approval failure result
* unconfigured runner result
* stale request/local validation failure result where applicable
* confirmation that `/runner/start-run` was not contacted
* confirmation that OpenCode was not started
* confirmation that request artifact was not mutated
* confirmation that execution remains disabled unless runner accepts a future valid start

Record artifacts under:

```text
runs/FP-MCP-022/
```

Recommended artifacts:

* `runs/FP-MCP-022/executor-result.md`
* `runs/FP-MCP-022/verification.txt`
