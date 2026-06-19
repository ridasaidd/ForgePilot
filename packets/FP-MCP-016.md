# FP-MCP-016 — Remote Runner Start Boundary

## Task

Define the boundary for a future ForgePilot MCP tool that may request the private dev-side runner to start an OpenCode run.

## Goal

Establish the final safety conditions required before the staging MCP bridge may contact the private dev runner for execution start.

FP-MCP-016 answers one question:

**What must be true before the staging MCP bridge may ask the private dev runner to start OpenCode?**

This packet is boundary-only.

It does not add a runner-start tool.

It does not contact the remote runner.

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

FP-MCP-016 may define:

* remote runner start prerequisites
* exact approval-token requirements
* required validation result requirements
* staging-to-dev request shape
* forbidden request fields
* remote runner authentication requirements
* remote runner timeout requirements
* execution state artifact requirements
* pre-contact state artifact requirements
* post-contact state artifact requirements
* failure reason codes
* retry restrictions
* logging and redaction requirements
* future implementation tool behavior

FP-MCP-016 must not implement:

* MCP runner-start tools
* remote runner HTTP calls
* OpenCode execution
* OpenCode CLI invocation
* OpenCode API invocation
* shell execution
* background workers
* runner service code
* artifact writing code
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

## Relationship to Earlier MCP Packets

### FP-MCP-011

FP-MCP-011 defines the local execution-start boundary.

FP-MCP-016 applies that execution-start boundary to the remote runner topology.

### FP-MCP-012

FP-MCP-012 defines the staging/control-plane and dev/execution-plane split.

FP-MCP-016 defines the future start boundary across that split.

### FP-MCP-013

FP-MCP-013 defines capability discovery as observation, not policy.

FP-MCP-016 must not treat discovered capabilities as authorization.

### FP-MCP-014

FP-MCP-014 adds conservative capability discovery.

FP-MCP-016 may require capability state to indicate that execution is enabled in a future packet, but capability state alone is never sufficient.

### FP-MCP-015

FP-MCP-015 adds read-only remote-runner request validation.

FP-MCP-016 requires a passing FP-MCP-015-style validation result before any future runner contact.

---

## Core Rule

A future remote runner start tool must not accept raw execution content.

It must not accept:

* raw prompt
* raw shell command
* model override
* run-mode override
* raw artifact directory
* raw repository path
* raw runner URL
* arbitrary HTTP body
* arbitrary JSON execution payload
* environment variables
* secrets

Allowed future input shape:

```text
packetId: string
requestId: string
approval: string
```

The request artifact remains the only execution input.

---

## Future Tool Name

The future implementation packet may add:

```text
forgepilot_start_remote_runner_request
```

or:

```text
forgepilot_start_opencode_run
```

FP-MCP-016 does not add either tool.

The final name should be chosen by the implementation packet.

---

## Required Approval Token

Remote runner start must require an exact approval token.

Recommended token:

```text
START_REMOTE_RUNNER_REQUEST
```

The future tool must reject all other approval values.

Missing or incorrect approval must result in:

```text
executionStarted: false
runnerContacted: false
reasons: ["APPROVAL_REQUIRED"]
```

The approval token authorizes only the specific packet/request pair passed to the tool.

It must not authorize arbitrary future starts.

---

## Required Validation Gate

Before contacting the remote runner, a future start tool must perform the same checks as:

```text
forgepilot_validate_remote_runner_request
```

The validation must pass immediately before runner contact.

Required pre-contact state:

```text
eligible: true
executionEnabled: false
executionStarted: false
runnerContacted: false
reasons: []
```

If validation fails, the runner must not be contacted.

---

## Base Commit Requirement

The current ForgePilot commit must match the request artifact `baseCommit`.

If not:

```text
runnerContacted: false
executionStarted: false
reasons: ["BASE_COMMIT_MISMATCH"]
```

No remote runner contact is allowed under FP-MCP-016 when base commit mismatches.

---

## Remote Runner Contact Preconditions

The future start tool may contact the remote runner only if:

* approval token is exact
* packet id is valid
* request id is valid
* request artifact exists
* request artifact is valid
* packet file exists
* model is allowed
* run mode is allowed
* repository working tree is clean
* current commit matches request artifact base commit
* artifact directory is safe
* request has not already started
* runner endpoint is configured
* runner authentication material is configured
* execution has been explicitly enabled by future policy

FP-MCP-016 does not enable execution.

---

## Execution Enabled Policy

FP-MCP-016 keeps execution disabled.

A future implementation may only start execution if a later packet explicitly enables remote runner execution.

Until then, future tools must report:

```text
executionEnabled: false
```

and must not contact the runner.

This means FP-MCP-016 is a boundary packet, not an execution permission packet.

---

## Staging-to-Dev Request Shape

A future staging-to-dev runner start request may include only:

```text
packetId
requestId
requestArtifactPath
requestArtifactDigest
baseCommit
boundaryVersion
```

The runner should independently read or verify the request artifact.

The request must not include:

* prompt text
* shell commands
* arbitrary model parameters
* environment variables
* secrets
* arbitrary filesystem paths
* full request artifact content unless a future packet explicitly defines signed artifact transfer

---

## Request Artifact Digest

A future implementation should compute a digest of the request artifact before runner contact.

Recommended field:

```text
requestArtifactSha256
```

The dev runner should verify the digest before execution.

This prevents accidental execution of a different artifact than the one approved by the control plane.

FP-MCP-016 defines this as a requirement for future implementation but does not implement it.

---

## Pre-Contact State Artifact

Before contacting the runner, a future implementation should record intent to contact the runner.

Recommended path:

```text
runs/<packetId>/<modelId>-<runMode>/remote-runner-start-state.json
```

Recommended initial state:

```json
{
  "schemaVersion": "FP-MCP-016",
  "packetId": "<packetId>",
  "requestId": "<requestId>",
  "modelId": "<modelId>",
  "runMode": "<runMode>",
  "approval": "START_REMOTE_RUNNER_REQUEST",
  "runnerContacted": false,
  "executionStarted": false,
  "status": "START_REQUEST_RECORDED"
}
```

This state artifact must not contain secrets.

---

## Post-Contact State Artifact

After runner contact, the state artifact or a new append-only artifact should record the result.

Success shape:

```text
runnerContacted: true
executionStarted: true
status: RUNNER_ACCEPTED
```

Failure shape:

```text
runnerContacted: true
executionStarted: false
status: RUNNER_REJECTED
reasons: [...]
```

No success may be inferred from missing failure.

---

## Remote Runner Response Shape

The private dev runner should return structured status.

Recommended response fields:

```text
accepted: boolean
runnerRunId: string | null
packetId: string
requestId: string
executionStarted: boolean
artifactDir: string | null
status: string
reasons: string[]
```

The response must not include:

* secrets
* environment variables
* prompts
* raw terminal output
* raw OpenCode config
* provider API keys
* OAuth tokens
* unrestricted logs

---

## Timeout Boundary

Remote runner contact must have a bounded timeout.

Recommended initial timeout:

```text
10 seconds
```

Timeout must produce:

```text
runnerContacted: false or unknown
executionStarted: false or unknown
reasons: ["RUNNER_TIMEOUT"]
```

If contact status is ambiguous, the result must say so explicitly.

No automatic retry is allowed by FP-MCP-016.

---

## Retry Boundary

A future start tool must not blindly retry start requests.

Retries may cause duplicate execution.

Retry behavior requires a later explicit packet.

Recommended reason code for rejecting duplicate starts:

```text
RUN_ALREADY_STARTED
```

---

## Idempotency Boundary

Remote runner start is not idempotent.

A future start tool must be annotated:

```text
readOnlyHint: false
destructiveHint: false
idempotentHint: false
openWorldHint: false
```

Even if the tool only starts a constrained runner, it is execution-capable and write-capable.

---

## Failure Reason Codes

Future implementation should use stable reason codes.

Recommended reason codes:

```text
APPROVAL_REQUIRED
INVALID_PACKET_ID
INVALID_REQUEST_ID
UNKNOWN_PACKET
UNKNOWN_REQUEST
INVALID_REQUEST_ARTIFACT
REQUEST_PACKET_MISMATCH
REQUEST_ID_MISMATCH
INVALID_REQUEST_SCHEMA
REQUEST_NOT_RECORDED
DISALLOWED_MODEL
DISALLOWED_RUN_MODE
DIRTY_WORKING_TREE
BASE_COMMIT_MISMATCH
UNSAFE_ARTIFACT_DIR
RUN_ALREADY_STARTED
EXECUTION_DISABLED
RUNNER_UNCONFIGURED
RUNNER_AUTH_UNCONFIGURED
RUNNER_AUTH_FAILED
RUNNER_UNREACHABLE
RUNNER_TIMEOUT
RUNNER_PROTOCOL_ERROR
RUNNER_REJECTED_REQUEST
RUNNER_ACCEPTED_BUT_NO_RUN_ID
REQUEST_DIGEST_MISMATCH
STATE_ARTIFACT_WRITE_FAILED
```

Raw exception messages must not be returned if they expose internals.

---

## Logging Requirement

FP-MCP-004 sanitized logging remains authoritative.

The staging bridge must not log:

* approval token
* runner token
* request artifact contents
* prompt text
* shell commands
* terminal output
* raw runner responses containing sensitive data
* environment variables
* secrets
* provider credentials
* OAuth tokens
* raw OpenCode configuration

Allowed log shape remains:

```text
MCP tool invoked: <tool_name>
MCP tool completed: <tool_name> PASS durationMs=<number>
MCP tool completed: <tool_name> FAIL errorCode=<SANITIZED_CODE> durationMs=<number>
```

The dev runner must follow equivalent sanitized logging.

---

## Artifact Requirements

A future remote start implementation must produce explicit artifacts.

Recommended minimum artifacts:

```text
remote-runner-start-state.json
execution-state.json
command-log.json
terminal-output.txt
executor-result.md
verification.txt
metrics.json
```

If a future implementation cannot produce one of these artifacts, the absence must be recorded explicitly.

---

## Trust Boundary

Remote runner acceptance is not admitted evidence.

Runner acceptance is an observation.

Run artifacts must still be verified.

Only admitted evidence may influence observatory outputs.

---

## Bridge Size Note

The MCP bridge implementation file is growing large.

Future implementation packets should consider a refactor before adding more runtime behavior.

Recommended future packet:

```text
FP-MCP-017 — MCP Bridge Module Refactor Boundary
```

or, if execution is deferred:

```text
FP-MCP-017 — Split MCP Bridge Tool Modules
```

This is not part of FP-MCP-016 but should be considered before implementing remote start.

---

## Acceptance Criteria

* Remote runner start prerequisites are documented.
* Exact approval token requirement is documented.
* Required validation gate is documented.
* Base commit requirement is documented.
* Execution-enabled policy is documented.
* Staging-to-dev request shape is documented.
* Forbidden request fields are documented.
* Request artifact digest requirement is documented.
* Pre-contact state artifact requirement is documented.
* Post-contact state artifact requirement is documented.
* Remote runner response shape is documented.
* Timeout boundary is documented.
* Retry boundary is documented.
* Idempotency boundary is documented.
* Failure reason codes are documented.
* Logging restrictions are documented.
* Artifact requirements are documented.
* Trust boundary is documented.
* Bridge size/refactor note is documented.
* No runner-start MCP tool is added.
* No remote runner contact is added.
* No OpenCode execution is added.
* No OpenCode CLI invocation is added.
* No OpenCode API invocation is added.
* No shell execution is added.
* No artifact-writing implementation is added.
* No Git mutation is added.
* No SQLite mutation is added.

---

## Future Implementation Packet

A future implementation packet may be:

```text
FP-MCP-017 — MCP Bridge Module Refactor Boundary
```

before execution behavior is added.

Then:

```text
FP-MCP-018 — Add Remote Runner Start Tool
```

The exact numbering may change, but remote start should not be implemented until the bridge structure remains maintainable.

---

## Verification Requirements

Because FP-MCP-016 is boundary-only, verification should confirm:

* packet exists
* packet is committed
* no bridge code changed
* no MCP tools changed
* no runtime behavior changed
* no remote runner contact was added
* no OpenCode execution was added
* no OpenCode CLI call was added
* no OpenCode API call was added
* no shell execution was added
* no artifact-writing implementation was added
* ForgePilot repository remains clean after commit

Record artifacts under:

```text
runs/FP-MCP-016/
```

Recommended artifacts:

* `runs/FP-MCP-016/executor-result.md`
* `runs/FP-MCP-016/verification.txt`
