# FP-MCP-007 — OpenCode Run Request Artifact Tool

## Task

Add a ForgePilot MCP tool that creates a durable OpenCode run request artifact after validating the request under the FP-MCP-006 validation boundary.

## Goal

Allow ChatGPT to help prepare a ForgePilot-scoped OpenCode executor request without starting OpenCode, executing shell commands, mutating source files, mutating Git history, mutating SQLite, or accepting arbitrary prompts.

FP-MCP-007 answers one question:

**Can ForgePilot safely record an approved, structured OpenCode run request artifact without executing it?**

This packet implements request artifact creation only.

It does not start OpenCode.

It does not call the OpenCode CLI.

It does not call the OpenCode API.

It does not execute shell commands.

It does not accept arbitrary prompts.

It does not modify source files.

It does not mutate Git history.

It does not mutate SQLite.

It does not enable execution.

---

## Scope Boundary

FP-MCP-007 may add one MCP tool:

* `forgepilot_create_opencode_run_request`

The tool may accept only structured fields:

* `packetId`
* `modelId`
* `runMode`
* `approval`

The tool may create a durable JSON request artifact under a ForgePilot-controlled path.

The tool may return:

* whether the artifact was created
* whether execution is enabled
* whether the request was valid
* whether approval was present
* request id
* artifact path
* packet id
* model id
* run mode
* base commit
* boundary version
* status source
* reasons

The tool must not accept:

* shell commands
* arbitrary prompts
* arbitrary filesystem paths
* Git arguments
* SQL
* environment variables
* secrets
* raw OpenCode configuration
* provider API keys

The tool must not:

* start OpenCode
* call the OpenCode CLI
* call the OpenCode API
* execute shell commands
* modify source files
* mutate Git history
* mutate SQLite
* inspect arbitrary process state
* expose secrets
* expose environment variables

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

## Relationship to FP-MCP-001

FP-MCP-001 defines the OpenCode executor authority boundary.

FP-MCP-007 must preserve the FP-MCP-001 rule:

> ChatGPT must never receive a generic command runner.

The request artifact tool must not be shaped like:

```text
run_command(command)
```

or:

```text
opencode_do_anything(prompt)
```

The tool must create only a ForgePilot-scoped request artifact from structured inputs.

---

## Relationship to FP-MCP-002

FP-MCP-002 added read-only OpenCode status discovery.

FP-MCP-007 must preserve:

```text
opencodeExecutionEnabled: false
liveOpenCodeChecked: false
```

Request artifact creation does not enable OpenCode execution.

---

## Relationship to FP-MCP-003

FP-MCP-003 defines the ChatGPT MCP compliance boundary.

FP-MCP-007 inherits:

* no hidden side effects
* no arbitrary execution authority
* no secret exposure
* no unrestricted filesystem access
* no arbitrary prompt execution
* execution-capable actions require explicit user approval
* write-capable tools must not be represented as read-only

Unlike FP-MCP-006, FP-MCP-007 is not read-only because it creates a request artifact.

The tool must clearly represent itself as write-capable but non-destructive and non-executing.

---

## Relationship to FP-MCP-004

FP-MCP-004 added sanitized MCP tool invocation logging.

FP-MCP-007 must ensure the new artifact creation tool is covered by safe logging.

Allowed log content:

* tool name
* invocation start
* PASS or FAIL
* sanitized error code
* duration in milliseconds

Forbidden log content:

* tool arguments
* approval text
* packet contents
* artifact contents
* prompts
* conversations
* file contents
* tool result contents
* secrets
* environment variables
* raw OpenCode configuration
* shell output

---

## Relationship to FP-MCP-005

FP-MCP-005 defines the OpenCode run request boundary.

FP-MCP-007 implements the next safe layer after validation:

```text
forgepilot_create_opencode_run_request(packet_id, model_id, run_mode)
```

But FP-MCP-007 must require explicit structured approval before writing an artifact.

The created artifact is a request record only.

It is not an execution grant.

---

## Relationship to FP-MCP-006

FP-MCP-006 added:

```text
forgepilot_validate_opencode_run_request
```

FP-MCP-007 must reuse the same validation rules.

A request artifact must not be created unless validation passes.

Required validation before artifact creation:

* valid packet id
* known packet file
* allowed model id
* allowed run mode
* clean ForgePilot working tree

If validation fails, the tool must not create an artifact.

---

## Required Tool Name

The tool must be named:

```text
forgepilot_create_opencode_run_request
```

---

## Required Input Shape

The tool must accept exactly these structured inputs:

```json
{
  "packetId": "FP-MCP-006",
  "modelId": "qwen-3.7-max",
  "runMode": "DESIGN_ONLY",
  "approval": "CREATE_REQUEST_ARTIFACT"
}
```

Input field names should use MCP/TypeScript-friendly camelCase:

* `packetId`
* `modelId`
* `runMode`
* `approval`

The tool must not accept free-form execution instructions or prompts.

---

## Approval Requirement

The tool writes a request artifact, so it requires explicit approval.

Required approval value:

```text
CREATE_REQUEST_ARTIFACT
```

If approval is missing or does not exactly match, the tool must return failure and must not create an artifact.

Failure reason:

```text
APPROVAL_REQUIRED
```

Approval only authorizes writing the request artifact.

Approval does not authorize OpenCode execution.

---

## Packet ID Validation

A valid `packetId` must:

* be a string
* match a known packet file under `packets/`
* resolve to a packet filename of the form `<packetId>.md`
* not include path separators
* not include `..`
* not be absolute
* not reference arbitrary filesystem paths

Initial acceptable pattern:

```text
FP-[A-Z0-9]+(-[A-Z0-9]+)*
```

---

## Model ID Validation

A valid `modelId` must be allowlisted.

Initial allowed model ids:

```text
deepseek-v4-pro-high
qwen-3.7-max
```

A model being available in OpenCode does not automatically make it eligible for ForgePilot execution.

A disallowed model must cause artifact creation failure.

---

## Run Mode Validation

A valid `runMode` must be allowlisted.

Initial allowed run mode:

```text
DESIGN_ONLY
```

Disallowed modes must fail validation until future packets define and accept them.

---

## Working Tree Validation

The tool must check the ForgePilot working tree state before creating an artifact.

Default rule:

```text
working tree must be clean
```

If the working tree is dirty, the tool must not create an artifact.

Failure reason:

```text
DIRTY_WORKING_TREE
```

The tool may use Git read-only commands already used by `forgepilot_status`.

It must not mutate Git.

---

## Artifact Directory Rules

The tool may create a directory under:

```text
runs/<packetId>/opencode-requests/
```

The directory must be derived from validated structured inputs.

The directory must not be accepted from user input.

The tool must not write outside the `runs/` tree.

The tool must not overwrite an existing request artifact.

---

## Request ID Rules

The tool must generate a request id internally.

Recommended format:

```text
REQ-<timestamp>-<short-random-id>
```

The request id must not be accepted from user input.

The request id must be safe for filenames.

The request id must not include path separators.

---

## Artifact File Name

Recommended artifact filename:

```text
<requestId>.json
```

Recommended artifact path:

```text
runs/<packetId>/opencode-requests/<requestId>.json
```

---

## Request Artifact Schema

The created JSON artifact should include:

```json
{
  "schemaVersion": "FP-MCP-007",
  "requestId": "REQ-20260619T070000Z-ab12cd34",
  "createdAt": "2026-06-19T07:00:00.000Z",
  "createdBy": "chatgpt-mcp",
  "packetId": "FP-MCP-006",
  "modelId": "qwen-3.7-max",
  "runMode": "DESIGN_ONLY",
  "approval": "CREATE_REQUEST_ARTIFACT",
  "approvalScope": "request-artifact-only",
  "executionEnabled": false,
  "executionStarted": false,
  "baseCommit": "abc1234",
  "artifactDir": "runs/FP-MCP-006/qwen-3.7-max-DESIGN_ONLY/",
  "requestArtifactPath": "runs/FP-MCP-006/opencode-requests/REQ-20260619T070000Z-ab12cd34.json",
  "boundaryVersion": "FP-MCP-007",
  "validationBoundary": "FP-MCP-006",
  "status": "REQUEST_RECORDED"
}
```

The artifact must not include:

* prompt contents
* conversation contents
* shell commands
* secrets
* environment variables
* raw OpenCode configuration
* provider API keys

---

## Required Response Shape

The tool should return small JSON text.

Recommended success response:

```json
{
  "created": true,
  "valid": true,
  "executionEnabled": false,
  "executionStarted": false,
  "requiresApproval": true,
  "approvalAccepted": true,
  "requestId": "REQ-20260619T070000Z-ab12cd34",
  "requestArtifactPath": "runs/FP-MCP-006/opencode-requests/REQ-20260619T070000Z-ab12cd34.json",
  "packetId": "FP-MCP-006",
  "modelId": "qwen-3.7-max",
  "runMode": "DESIGN_ONLY",
  "baseCommit": "abc1234",
  "boundaryVersion": "FP-MCP-007",
  "statusSource": "ForgePilot request-artifact policy",
  "reasons": []
}
```

Recommended failure response:

```json
{
  "created": false,
  "valid": false,
  "executionEnabled": false,
  "executionStarted": false,
  "requiresApproval": true,
  "approvalAccepted": false,
  "requestId": null,
  "requestArtifactPath": null,
  "packetId": "FP-MCP-006",
  "modelId": "qwen-3.7-max",
  "runMode": "DESIGN_ONLY",
  "baseCommit": "abc1234",
  "boundaryVersion": "FP-MCP-007",
  "statusSource": "ForgePilot request-artifact policy",
  "reasons": [
    "APPROVAL_REQUIRED"
  ]
}
```

---

## Failure Reasons

Failure reasons should use stable codes.

Initial reason codes:

* `APPROVAL_REQUIRED`
* `UNKNOWN_PACKET`
* `INVALID_PACKET_ID`
* `DISALLOWED_MODEL`
* `DISALLOWED_RUN_MODE`
* `DIRTY_WORKING_TREE`
* `ARTIFACT_ALREADY_EXISTS`
* `ARTIFACT_WRITE_FAILED`
* `INVALID_ARTIFACT_PATH`
* `UNKNOWN_ERROR`

The tool must not return raw exception messages that may expose internals.

---

## Execution Disabled Rule

FP-MCP-007 must always return:

```json
{
  "executionEnabled": false,
  "executionStarted": false
}
```

Creating a request artifact means:

```text
A structured request was recorded.
```

It does not mean:

```text
OpenCode may now run.
```

---

## Tool Annotation

Because the tool writes a request artifact, it must not be annotated as read-only.

Expected annotations:

```text
readOnlyHint: false
destructiveHint: false
idempotentHint: false
openWorldHint: false
```

The tool is write-capable but non-destructive and closed-world.

---

## Existing Tool Compatibility

Existing tools must continue to work:

* `forgepilot_status`
* `forgepilot_get_opencode_status`
* `forgepilot_list_packets`
* `forgepilot_list_runs`
* `forgepilot_read_file`
* `forgepilot_validate_opencode_run_request`

---

## Acceptance Criteria

* `forgepilot_create_opencode_run_request` exists.
* The tool is not marked read-only.
* The tool is non-destructive.
* The tool accepts only `packetId`, `modelId`, `runMode`, and `approval`.
* The tool accepts no shell command.
* The tool accepts no arbitrary prompt.
* The tool accepts no arbitrary path.
* The tool accepts no Git arguments.
* The tool accepts no SQL.
* The tool requires exact approval value `CREATE_REQUEST_ARTIFACT`.
* The tool validates packet existence before writing.
* The tool validates model allowlist membership before writing.
* The tool validates run mode allowlist membership before writing.
* The tool checks working tree cleanliness before writing.
* The tool creates a JSON request artifact under `runs/<packetId>/opencode-requests/`.
* The tool does not overwrite existing artifacts.
* The tool returns the request id and artifact path.
* The tool returns `executionEnabled: false`.
* The tool returns `executionStarted: false`.
* The tool does not start OpenCode.
* The tool does not call OpenCode CLI.
* The tool does not call OpenCode API.
* The tool does not mutate Git.
* The tool does not mutate SQLite.
* The tool does not expose secrets.
* The tool does not expose environment variables.
* The tool is covered by sanitized invocation logging.
* Existing tools continue to work.

---

## Verification Requirements

In the bridge repo, run and record:

```bash
pnpm build
pnpm test
```

Restart the user service:

```bash
systemctl --user restart forgepilot-chatgpt-mcp-oauth.service
systemctl --user status forgepilot-chatgpt-mcp-oauth.service --no-pager
```

Refresh ChatGPT Actions.

Wait for propagation if needed.

Verify through ChatGPT MCP connector:

* `forgepilot_create_opencode_run_request` is visible.
* Missing approval returns `created: false` and `APPROVAL_REQUIRED`.
* Valid approved request creates one JSON artifact.
* Success response returns `created: true`, `executionEnabled: false`, and `executionStarted: false`.
* The created artifact is readable through `forgepilot_read_file`.
* Invalid model does not create an artifact.
* Invalid run mode does not create an artifact.
* Unknown packet does not create an artifact.
* Existing tools still work.
* OpenCode status still reports execution disabled.

Record artifacts under:

```text
runs/FP-MCP-007/
```

Recommended artifacts:

* `runs/FP-MCP-007/executor-result.md`
* `runs/FP-MCP-007/verification.txt`

