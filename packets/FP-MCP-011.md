# FP-MCP-011 — OpenCode Execution Start Boundary

## Task

Define the safety, approval, validation, and artifact requirements that must exist before any ForgePilot MCP tool may start an OpenCode execution run.

## Goal

Establish the execution-start boundary for ForgePilot MCP without implementing execution.

FP-MCP-011 answers one question:

**What must be true before ChatGPT may request that ForgePilot start an OpenCode run?**

This packet is boundary-only.

It does not add an execution-start tool.

It does not start OpenCode.

It does not call the OpenCode CLI.

It does not call the OpenCode API.

It does not execute shell commands.

It does not add background workers.

It does not add autonomous execution.

It does not mutate Git.

It does not mutate SQLite.

---

## Scope Boundary

FP-MCP-011 may define:

* execution-start prerequisites
* approval requirements
* request artifact requirements
* repository cleanliness requirements
* model/run-mode requirements
* worktree requirements
* artifact directory requirements
* logging requirements
* terminal-output capture requirements
* failure-state requirements
* post-run artifact requirements
* execution-state transition rules
* future tool naming and behavior constraints

FP-MCP-011 must not implement:

* MCP execution-start tools
* OpenCode CLI invocation
* OpenCode API invocation
* shell execution
* background execution
* worker daemons
* prompt submission
* terminal streaming
* arbitrary command execution
* Git mutation
* SQLite mutation
* artifact mutation beyond future execution-result artifacts

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

### FP-MCP-001

FP-MCP-001 defines the OpenCode executor boundary.

FP-MCP-011 refines the start boundary inside that executor boundary.

### FP-MCP-005

FP-MCP-005 defines the run request boundary.

FP-MCP-011 requires a durable request artifact before execution may start.

### FP-MCP-006

FP-MCP-006 validates run request intent.

FP-MCP-011 requires validation to pass immediately before execution start.

### FP-MCP-007

FP-MCP-007 creates durable request artifacts.

FP-MCP-011 requires a request artifact as the execution-start input.

### FP-MCP-010

FP-MCP-010 allows read-only request artifact inspection.

FP-MCP-011 requires request artifacts to be inspectable before execution.

---

## Core Rule

A future execution-start tool must not accept a raw prompt.

A future execution-start tool must not accept arbitrary shell commands.

A future execution-start tool must not accept arbitrary filesystem paths.

A future execution-start tool may only accept a validated request artifact reference.

Required future input shape:

```text
packetId: string
requestId: string
approval: string
```

The request artifact must already exist.

The request artifact must have been created by the FP-MCP-007 request artifact tool.

---

## Future Tool Name

The future implementation packet may add:

```text
forgepilot_start_opencode_run
```

FP-MCP-011 does not add this tool.

The future tool must be execution-capable and therefore must not be added without this boundary.

---

## Required Future Approval Token

Execution start must require an exact approval token.

Recommended token:

```text
START_OPENCODE_RUN
```

The future execution-start tool must reject all other approval values.

Missing or incorrect approval must result in:

```text
executionStarted: false
reasons: ["APPROVAL_REQUIRED"]
```

or equivalent stable failure output.

---

## Required Future Input

A future execution-start tool may accept only:

```text
packetId: string
requestId: string
approval: string
```

It must not accept:

* prompt text
* command text
* model override
* run-mode override
* raw artifact directory
* raw repository path
* raw output path
* shell arguments
* environment variables
* secrets
* arbitrary JSON payloads

The model, run mode, packet id, artifact directory, and base commit must be read from the request artifact.

---

## Request Artifact Preconditions

Before execution may start, the future tool must read the request artifact and verify:

```text
schemaVersion: FP-MCP-007
status: REQUEST_RECORDED
executionEnabled: false
executionStarted: false
approvalScope: request-artifact-only
packetId matches input packetId
requestId matches input requestId
modelId is allowed
runMode is allowed
artifactDir is safe
requestArtifactPath is safe
```

If any check fails, execution must not start.

---

## Repository Preconditions

Before execution may start, the future tool must verify:

* ForgePilot repository exists.
* ForgePilot repository is on an expected branch.
* ForgePilot working tree is clean.
* Current commit matches the request artifact `baseCommit`, unless a later packet explicitly defines a safe rebase/revalidation policy.
* The packet file still exists.
* The packet file path is safe.
* The intended run artifact directory does not already contain an active run.

If the current commit differs from the request artifact `baseCommit`, execution must not start under FP-MCP-011.

Reason code:

```text
BASE_COMMIT_MISMATCH
```

---

## Model and Run Mode Preconditions

The future tool must enforce the existing allowlists:

```text
allowedModels:
- deepseek-v4-pro-high
- qwen-3.7-max

allowedRunModes:
- DESIGN_ONLY
```

The execution-start tool must not accept model or run-mode overrides.

The request artifact values are authoritative only if they pass the allowlist again at execution time.

---

## Execution Work Area

A future execution run must write to a deterministic run artifact directory.

Required shape:

```text
runs/<packetId>/<modelId>-<runMode>/
```

The execution-start tool must not accept a raw output directory.

The directory must be derived from validated request artifact fields.

The directory must be inside `runs/`.

The directory must not traverse outside the repository.

---

## Execution State Artifact

Before launching OpenCode, the future execution-start tool should create an execution state artifact.

Recommended path:

```text
runs/<packetId>/<modelId>-<runMode>/execution-state.json
```

Initial state:

```json
{
  "schemaVersion": "FP-MCP-011",
  "packetId": "<packetId>",
  "requestId": "<requestId>",
  "modelId": "<modelId>",
  "runMode": "<runMode>",
  "executionStarted": true,
  "executionFinished": false,
  "status": "STARTED"
}
```

This artifact records that execution was intentionally started.

The state artifact must not contain secrets.

---

## Terminal Output Capture

A future execution-start implementation must capture terminal output to artifacts.

Recommended artifacts:

```text
runs/<packetId>/<modelId>-<runMode>/terminal-output.txt
runs/<packetId>/<modelId>-<runMode>/command-log.json
```

The terminal output may be read later only through constrained artifact-reading tools.

ChatGPT must not receive live terminal access.

---

## Required Post-Run Artifacts

A future execution run should produce:

```text
executor-result.md
verification.txt
terminal-output.txt
command-log.json
metrics.json
```

If any artifact is unavailable, that absence must be recorded explicitly.

No success should be inferred from missing failure.

---

## Execution State Transitions

A future execution-start tool may transition:

```text
REQUEST_RECORDED
→ EXECUTION_START_REQUESTED
→ EXECUTION_STARTED
```

A future completion process may transition:

```text
EXECUTION_STARTED
→ EXECUTION_SUCCEEDED
```

or:

```text
EXECUTION_STARTED
→ EXECUTION_FAILED
```

or:

```text
EXECUTION_STARTED
→ EXECUTION_INCOMPLETE
```

No state transition may silently overwrite prior state.

State transitions must be append-only or artifact-preserving.

---

## Failure Reason Codes

Future implementation should use stable reason codes.

Recommended reason codes:

```text
APPROVAL_REQUIRED
UNKNOWN_PACKET
INVALID_PACKET_ID
INVALID_REQUEST_ID
UNKNOWN_REQUEST
INVALID_REQUEST_ARTIFACT
REQUEST_PACKET_MISMATCH
REQUEST_ID_MISMATCH
DISALLOWED_MODEL
DISALLOWED_RUN_MODE
DIRTY_WORKING_TREE
BASE_COMMIT_MISMATCH
UNSAFE_ARTIFACT_DIR
RUN_ALREADY_STARTED
RUN_ARTIFACT_DIR_EXISTS
EXECUTION_DISABLED
EXECUTION_START_FAILED
```

Raw exception messages must not be returned if they expose internals.

---

## Logging Requirement

FP-MCP-004 sanitized logging remains authoritative.

A future execution-start tool must not log:

* prompts
* request artifact contents
* terminal output
* tool arguments
* file contents
* environment variables
* secrets
* OpenCode configuration
* OAuth tokens
* API keys
* shell output

Allowed log shape remains:

```text
MCP tool invoked: <tool_name>
MCP tool completed: <tool_name> PASS durationMs=<number>
MCP tool completed: <tool_name> FAIL errorCode=<SANITIZED_CODE> durationMs=<number>
```

If future execution needs detailed logs, those logs must be written to run artifacts, not service logs.

---

## Tool Annotation Requirement for Future Execution Tool

A future execution-start tool must not be marked read-only.

Recommended annotations:

```text
readOnlyHint: false
destructiveHint: false
idempotentHint: false
openWorldHint: false
```

The tool is not destructive if it only creates run artifacts and starts a constrained local executor, but it is still write-capable and execution-capable.

---

## Security Boundary

The future tool must not expose a generic command runner.

Forbidden tool designs:

```text
run_shell_command(command)
run_opencode_prompt(prompt)
execute(prompt, command, cwd)
start_any_model(prompt)
write_file(path, content)
```

Allowed future shape:

```text
start_opencode_run(packetId, requestId, approval)
```

The request artifact is the only execution input.

---

## Acceptance Criteria

* Execution-start prerequisites are documented.
* Request artifact prerequisite is documented.
* Exact approval token requirement is documented.
* Raw prompt input is forbidden.
* Raw command input is forbidden.
* Raw path input is forbidden.
* Request artifact validation requirements are documented.
* Repository cleanliness requirements are documented.
* Base commit matching requirement is documented.
* Model allowlist requirement is documented.
* Run-mode allowlist requirement is documented.
* Artifact directory derivation is documented.
* Execution state artifact requirement is documented.
* Terminal output capture requirement is documented.
* Required post-run artifacts are documented.
* Failure reason codes are documented.
* Logging restrictions are documented.
* Future tool annotation requirements are documented.
* No MCP execution-start tool is added.
* No OpenCode execution is added.
* No OpenCode CLI invocation is added.
* No OpenCode API invocation is added.
* No shell execution is added.
* No Git mutation is added.
* No SQLite mutation is added.

---

## Future Implementation Packet

The future implementation packet may be:

```text
FP-MCP-012 — Add OpenCode Execution Start Tool
```

That packet may implement:

```text
forgepilot_start_opencode_run
```

Only if it satisfies the FP-MCP-011 boundary.

---

## Verification Requirements

Because FP-MCP-011 is boundary-only, verification should confirm:

* packet exists
* packet is committed
* no bridge code changed
* no MCP tools changed
* no runtime behavior changed
* no OpenCode execution was added
* no shell execution was added
* ForgePilot repository remains clean after commit

Record artifacts under:

```text
runs/FP-MCP-011/
```

Recommended artifacts:

* `runs/FP-MCP-011/executor-result.md`
* `runs/FP-MCP-011/verification.txt`

