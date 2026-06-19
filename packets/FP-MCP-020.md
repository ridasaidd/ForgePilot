# FP-MCP-020 — Add Remote Runner Validation Endpoint Client

## Task

Add a staging-side MCP tool/client that validates an existing OpenCode request artifact against the private dev runner `/runner/validate-request` endpoint.

## Goal

Allow ChatGPT, through the staging MCP bridge, to ask the private dev runner whether a request artifact is acceptable for future execution, without starting OpenCode.

FP-MCP-020 answers one question:

**Can the staging MCP bridge safely ask the private dev runner to validate a request artifact without starting execution?**

This packet may implement a read-only remote validation client.

It must not start OpenCode.

It must not call the OpenCode CLI.

It must not call the OpenCode API directly.

It must not call `/runner/start-run`.

It must not create execution artifacts.

It must not mutate request artifacts.

It must not mutate Git.

It must not mutate SQLite.

---

## Scope Boundary

FP-MCP-020 may add:

* one MCP tool for remote runner request validation
* fixed client call to `POST /runner/validate-request`
* request artifact digest calculation
* safe request artifact path derivation
* local pre-validation before runner contact
* bounded timeout
* structured output
* readable JSON fallback
* sanitized reason codes

FP-MCP-020 must not add:

* remote runner implementation code
* OpenCode execution
* OpenCode CLI invocation
* OpenCode API invocation
* remote runner start behavior
* shell execution
* arbitrary HTTP proxying
* arbitrary URL fetching
* raw prompt transmission
* raw command transmission
* artifact writing implementation
* request artifact mutation
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

FP-MCP-020 must run equivalent local validation before contacting the remote runner.

If local validation fails, the remote runner must not be contacted.

### FP-MCP-018

FP-MCP-018 added remote runner status discovery.

FP-MCP-020 may reuse runner base URL and authentication environment configuration.

### FP-MCP-019

FP-MCP-019 defined the remote runner API contract.

FP-MCP-020 implements the staging-side client for only:

```text
POST /runner/validate-request
```

---

## Tool Added

Add MCP tool:

```text
forgepilot_validate_remote_runner_endpoint_request
```

Alternative acceptable name:

```text
forgepilot_validate_remote_runner_endpoint
```

The implementation packet should choose one stable name and record it.

Recommended tool name:

```text
forgepilot_validate_remote_runner_endpoint_request
```

Tool purpose:

```text
Validate an existing OpenCode request artifact with the configured remote runner validate-request endpoint. This tool does not start OpenCode.
```

---

## Input Schema

The tool may accept only:

```text
packetId: string
requestId: string
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
* approval token

No approval token is required because validation does not start execution.

---

## Local Preconditions

Before contacting the runner, the tool must verify:

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
* runner base URL is configured
* runner validation endpoint URL is derived, not user-supplied

If any local precondition fails, the runner must not be contacted.

---

## Request Artifact Digest

Before contacting the runner, the tool must compute:

```text
requestArtifactSha256
```

over the exact request artifact file content.

The digest is sent to the runner so the runner can verify that it is validating the same artifact.

The digest must be returned in MCP output only if the implementation chooses to expose it as a non-secret integrity value.

If returned, it must be labeled clearly as a digest, not as evidence of execution.

---

## Runner Endpoint

The tool may contact only:

```text
POST <configured-runner-base-url>/runner/validate-request
```

The configured base URL may come only from:

```text
FORGEPILOT_REMOTE_RUNNER_BASE_URL
FORGEPILOT_RUNNER_BASE_URL
```

The tool must not contact:

* `/runner/start-run`
* `/runner/runs/...`
* arbitrary paths
* OpenCode directly
* model providers directly
* shell endpoints

---

## Staging-to-Runner Request Shape

Allowed request body:

```json
{
  "packetId": "FP-MCP-000",
  "requestId": "REQ-00000000T000000000Z-00000000",
  "requestArtifactPath": "runs/FP-MCP-000/opencode-requests/REQ-00000000T000000000Z-00000000.json",
  "requestArtifactSha256": "<sha256>",
  "baseCommit": "<git-short-sha>",
  "boundaryVersion": "FP-MCP-020"
}
```

Forbidden request body fields:

* prompt
* command
* shell
* model override
* run-mode override
* raw artifact directory override
* arbitrary repository path
* environment variables
* secrets
* approval token

---

## Expected Local Failure Result

If runner URL is not configured:

```json
{
  "valid": false,
  "runnerConfigured": false,
  "runnerContacted": false,
  "executionStarted": false,
  "executionEnabled": false,
  "reasons": [
    "RUNNER_UNCONFIGURED"
  ]
}
```

If local request validation fails:

```json
{
  "valid": false,
  "runnerConfigured": true,
  "runnerContacted": false,
  "executionStarted": false,
  "executionEnabled": false,
  "reasons": [
    "BASE_COMMIT_MISMATCH"
  ]
}
```

The runner must not be contacted for local failures.

---

## Expected Remote Validation Success Result

If local validation passes and the runner validates the request:

```json
{
  "valid": true,
  "runnerConfigured": true,
  "runnerContacted": true,
  "runnerAccepted": true,
  "executionStarted": false,
  "executionEnabled": false,
  "packetId": "FP-MCP-000",
  "requestId": "REQ-00000000T000000000Z-00000000",
  "runnerProtocolVersion": "forgepilot-runner-v1",
  "reasons": []
}
```

Remote validation success does not authorize execution.

---

## Expected Remote Validation Failure Result

If the runner rejects validation:

```json
{
  "valid": false,
  "runnerConfigured": true,
  "runnerContacted": true,
  "runnerAccepted": false,
  "executionStarted": false,
  "executionEnabled": false,
  "reasons": [
    "RUNNER_REJECTED_REQUEST"
  ]
}
```

---

## Execution Policy

The tool must always return:

```text
executionEnabled: false
executionStarted: false
```

The tool must never call:

```text
POST /runner/start-run
```

---

## Timeout Boundary

The runner validation request must have a bounded timeout.

Recommended initial timeout:

```text
5000 milliseconds
```

Timeout must return:

```text
runnerContacted: false or unknown
executionStarted: false
reasons: ["RUNNER_TIMEOUT"]
```

If contact state is ambiguous, the result must say so explicitly.

No automatic retry is allowed.

---

## Open World Annotation

Because this tool contacts the configured private/dev runner endpoint, it must be annotated:

```text
openWorldHint: true
```

Because validation is read-only with respect to execution, it should also be annotated:

```text
readOnlyHint: true
destructiveHint: false
idempotentHint: true
```

---

## Output Schema

The tool should return structured output with at least:

```text
valid
runnerConfigured
runnerContacted
runnerAccepted
executionEnabled
executionStarted
packetId
requestId
requestArtifactPath
requestArtifactSha256
baseCommit
runnerProtocolVersion
boundaryVersion
statusSource
checkedAt
reasons
```

Additional fields may include local validation booleans if useful:

```text
packetExists
requestExists
requestArtifactValid
modelAllowed
runModeAllowed
workingTreeClean
baseCommitMatches
safeArtifactDir
```

Output must not include:

* runner base URL
* bearer token
* environment variable values
* raw request artifact contents
* prompt text
* shell commands
* terminal output
* provider credentials
* OAuth tokens

---

## Runner Response Handling

The runner response must be treated as untrusted input.

The staging bridge must validate:

* response is JSON object
* boolean fields are booleans
* reason codes are strings
* protocol version is compatible
* packet id matches request packet id
* request id matches request id
* executionStarted is false

If the runner response is malformed:

```text
RUNNER_PROTOCOL_ERROR
```

If the runner says execution started during validation:

```text
RUNNER_PROTOCOL_ERROR
```

Validation must never start execution.

---

## Logging Boundary

FP-MCP-004 sanitized logging remains authoritative.

Allowed staging log shape:

```text
MCP tool invoked: forgepilot_validate_remote_runner_endpoint_request
MCP tool completed: forgepilot_validate_remote_runner_endpoint_request PASS durationMs=<number>
MCP tool completed: forgepilot_validate_remote_runner_endpoint_request FAIL errorCode=<SANITIZED_CODE> durationMs=<number>
```

The tool must not log:

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
```

---

## Trust Boundary

Remote runner validation is not execution.

Remote runner validation is not admitted evidence.

Remote runner validation is a pre-execution observation.

Execution remains disabled until a later packet explicitly adds and verifies a start tool.

---

## Acceptance Criteria

* MCP tool for remote runner endpoint validation is added.
* Tool accepts only packetId and requestId.
* Tool accepts no approval token.
* Tool accepts no arbitrary URL.
* Tool performs local validation before runner contact.
* Tool computes request artifact SHA-256 digest.
* Tool contacts only configured `/runner/validate-request`.
* Tool does not contact `/runner/start-run`.
* Tool uses bounded timeout.
* Tool is marked read-only.
* Tool is marked non-destructive.
* Tool is marked idempotent.
* Tool is marked open-world.
* Tool returns structured output.
* Tool preserves readable JSON fallback.
* Tool returns executionEnabled false.
* Tool returns executionStarted false.
* Tool does not start OpenCode.
* Tool does not call OpenCode CLI.
* Tool does not call OpenCode API.
* Tool does not execute shell commands.
* Tool does not create execution artifacts.
* Tool does not mutate request artifacts.
* Tool does not mutate Git.
* Tool does not mutate SQLite.
* Tool does not expose secrets.
* Tool does not log secrets.
* Build passes.
* Test passes.
* Tool is visible in ChatGPT Actions.
* Unconfigured runner case returns RUNNER_UNCONFIGURED without runner contact.
* Local validation failure case does not contact runner.

---

## Verification Requirements

Verification must record:

* ForgePilot packet commit
* bridge implementation commit
* build/test result
* service restart result
* Actions refresh/tool visibility result
* unconfigured runner result
* local validation failure result where applicable
* confirmation that runner start was not called
* confirmation that OpenCode was not started
* confirmation that execution remains disabled

Record artifacts under:

```text
runs/FP-MCP-020/
```

Recommended artifacts:

* `runs/FP-MCP-020/executor-result.md`
* `runs/FP-MCP-020/verification.txt`
