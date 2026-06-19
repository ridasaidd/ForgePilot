# FP-MCP-006 — OpenCode Run Request Validation Tool

## Task

Add a read-only ForgePilot MCP tool that validates whether an OpenCode run request would be acceptable under the FP-MCP-005 boundary.

## Goal

Allow ChatGPT to check whether a proposed OpenCode run request is structurally valid and policy-allowed without starting OpenCode, creating artifacts, mutating files, mutating Git, mutating SQLite, or accepting arbitrary commands.

FP-MCP-006 answers one question:

**Would this ForgePilot-scoped OpenCode run request be valid if execution were enabled?**

This packet implements validation only.

It does not start OpenCode.

It does not create run request artifacts.

It does not execute shell commands.

It does not accept arbitrary prompts.

It does not mutate files.

It does not mutate Git.

It does not mutate SQLite.

It does not enable execution.

---

## Scope Boundary

FP-MCP-006 may add one MCP tool:

* `forgepilot_validate_opencode_run_request`

The tool may accept only structured fields:

* `packetId`
* `modelId`
* `runMode`

The tool may return:

* whether the request is valid
* whether execution is enabled
* whether approval is required
* whether the packet exists
* whether the model is allowed
* whether the run mode is allowed
* whether the working tree is clean
* the current base commit
* the resolved safe artifact directory label
* validation reasons
* boundary version
* status source

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
* create files
* write artifacts
* mutate Git
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

FP-MCP-006 must preserve the FP-MCP-001 rule:

> ChatGPT must never receive a generic command runner.

The validation tool must not be shaped like:

```text
run_command(command)
```

or:

```text
opencode_do_anything(prompt)
```

The validation tool must be shaped like a ForgePilot workflow boundary check.

---

## Relationship to FP-MCP-002

FP-MCP-002 added the read-only OpenCode status discovery tool.

FP-MCP-006 must preserve the execution-disabled state:

```text
opencodeExecutionEnabled: false
liveOpenCodeChecked: false
```

The validation tool may report whether execution is currently enabled, but for this packet execution must remain disabled.

---

## Relationship to FP-MCP-003

FP-MCP-003 defines the ChatGPT MCP compliance boundary.

FP-MCP-006 inherits:

* no hidden side effects
* no arbitrary execution authority
* no secret exposure
* no unrestricted filesystem access
* no arbitrary prompt execution
* execution-capable actions require explicit user approval
* read-only tools must be side-effect-free

The validation tool must be annotated and implemented as read-only.

---

## Relationship to FP-MCP-004

FP-MCP-004 added sanitized MCP tool invocation logging.

FP-MCP-006 must ensure the new validation tool is covered by the same safe logging pattern.

Allowed log content:

* tool name
* invocation start
* PASS or FAIL
* sanitized error code
* duration in milliseconds

Forbidden log content:

* tool arguments
* packet contents
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

FP-MCP-006 implements only the validation-only future tool described by FP-MCP-005:

```text
forgepilot_validate_opencode_run_request(packet_id, model_id, run_mode)
```

The tool validates a proposed request but must not create or execute that request.

---

## Required Tool Name

The tool must be named:

```text
forgepilot_validate_opencode_run_request
```

---

## Required Input Shape

The tool must accept exactly these structured inputs:

```json
{
  "packetId": "FP-MCP-005",
  "modelId": "qwen-3.7-max",
  "runMode": "DESIGN_ONLY"
}
```

Input field names should use MCP/TypeScript-friendly camelCase:

* `packetId`
* `modelId`
* `runMode`

The tool must not accept free-form instructions or prompts.

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

Valid examples:

```text
FP-MCP-006
FP-META-016
FP-EVAL-002
FP-012
```

Invalid examples:

```text
../secrets
.env
/home/user/file
packets/FP-MCP-006.md
run tests please
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

A disallowed model must cause validation failure.

---

## Run Mode Validation

A valid `runMode` must be allowlisted.

Initial allowed run mode:

```text
DESIGN_ONLY
```

Disallowed modes must fail validation until future packets define and accept them.

Future possible modes may include:

```text
VERIFY_RUN
AUDIT_RUN
COMPARE_RUNS
EXECUTE_PACKET
```

But FP-MCP-006 must not enable them.

---

## Working Tree Validation

The tool must check the ForgePilot working tree state.

Default rule:

```text
working tree must be clean
```

If the working tree is dirty, validation must fail.

The response must include:

```json
{
  "workingTreeClean": true
}
```

or:

```json
{
  "workingTreeClean": false
}
```

The tool may use Git read-only commands already used by `forgepilot_status`.

It must not mutate Git.

---

## Artifact Directory Resolution

The tool may compute a safe artifact directory label.

Recommended label shape:

```text
runs/<packetId>/<modelId>-<runMode>/
```

This is a label only.

FP-MCP-006 must not create the directory.

The artifact directory must not be accepted from user input.

The artifact directory must be derived only from validated structured fields.

---

## Required Response Shape

The tool should return small JSON text.

Recommended response shape:

```json
{
  "valid": true,
  "executionEnabled": false,
  "requiresApproval": true,
  "packetExists": true,
  "modelAllowed": true,
  "runModeAllowed": true,
  "workingTreeClean": true,
  "baseCommit": "abc1234",
  "wouldUseArtifactDir": "runs/FP-MCP-006/qwen-3.7-max-DESIGN_ONLY/",
  "boundaryVersion": "FP-MCP-006",
  "statusSource": "ForgePilot validation-only policy",
  "reasons": []
}
```

For invalid requests, the tool should return:

```json
{
  "valid": false,
  "executionEnabled": false,
  "requiresApproval": true,
  "packetExists": false,
  "modelAllowed": true,
  "runModeAllowed": true,
  "workingTreeClean": true,
  "baseCommit": "abc1234",
  "wouldUseArtifactDir": null,
  "boundaryVersion": "FP-MCP-006",
  "statusSource": "ForgePilot validation-only policy",
  "reasons": [
    "UNKNOWN_PACKET"
  ]
}
```

---

## Validation Reasons

Validation failure reasons should use stable codes.

Initial reason codes:

* `UNKNOWN_PACKET`
* `INVALID_PACKET_ID`
* `DISALLOWED_MODEL`
* `DISALLOWED_RUN_MODE`
* `DIRTY_WORKING_TREE`
* `INVALID_ARTIFACT_DIR`
* `UNKNOWN_ERROR`

The tool must not return raw exception messages that may expose internals.

---

## Execution Disabled Rule

FP-MCP-006 must always return:

```json
{
  "executionEnabled": false
}
```

Execution must remain disabled until a future packet explicitly changes this.

A valid validation result means:

```text
This request is structurally valid under the current boundary.
```

It does not mean:

```text
OpenCode may now run.
```

---

## Approval Rule

The tool must report that approval is required for any future execution-capable action.

Recommended field:

```json
{
  "requiresApproval": true
}
```

Validation itself is read-only and does not require an additional approval prompt.

---

## Read-Only Annotation

The tool must be registered as read-only.

Expected annotations:

```text
readOnlyHint: true
destructiveHint: false
idempotentHint: true
openWorldHint: false
```

---

## Logging Requirement

The new tool must be covered by safe invocation logging.

Expected log lines:

```text
MCP tool invoked: forgepilot_validate_opencode_run_request
MCP tool completed: forgepilot_validate_opencode_run_request PASS durationMs=<number>
```

On failure:

```text
MCP tool completed: forgepilot_validate_opencode_run_request FAIL errorCode=<SANITIZED_CODE> durationMs=<number>
```

Logs must not include `packetId`, `modelId`, `runMode`, packet content, file paths, prompts, secrets, or results.

---

## Existing Tool Compatibility

Existing tools must continue to work:

* `forgepilot_status`
* `forgepilot_get_opencode_status`
* `forgepilot_list_packets`
* `forgepilot_list_runs`
* `forgepilot_read_file`

---

## Acceptance Criteria

* `forgepilot_validate_opencode_run_request` exists.
* The tool is read-only.
* The tool accepts only `packetId`, `modelId`, and `runMode`.
* The tool accepts no shell command.
* The tool accepts no arbitrary prompt.
* The tool accepts no arbitrary path.
* The tool accepts no Git arguments.
* The tool accepts no SQL.
* The tool does not start OpenCode.
* The tool does not call OpenCode CLI.
* The tool does not call OpenCode API.
* The tool does not create artifacts.
* The tool does not write files.
* The tool does not mutate Git.
* The tool does not mutate SQLite.
* The tool does not expose secrets.
* The tool does not expose environment variables.
* The tool validates packet existence.
* The tool validates model allowlist membership.
* The tool validates run mode allowlist membership.
* The tool checks working tree cleanliness.
* The tool returns `executionEnabled: false`.
* The tool returns `requiresApproval: true`.
* The tool returns stable validation reason codes.
* The tool derives but does not create an artifact directory label.
* The tool is covered by sanitized invocation logging.
* Existing read-only tools continue to work.

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

Verify through ChatGPT MCP connector:

* `forgepilot_validate_opencode_run_request` is visible.
* Valid request returns `valid: true` and `executionEnabled: false`.
* Unknown packet returns `valid: false` with `UNKNOWN_PACKET`.
* Disallowed model returns `valid: false` with `DISALLOWED_MODEL`.
* Disallowed run mode returns `valid: false` with `DISALLOWED_RUN_MODE`.
* Existing read-only tools still work.
* OpenCode status still reports execution disabled.

Record artifacts under:

```text
runs/FP-MCP-006/
```

Recommended artifacts:

* `runs/FP-MCP-006/executor-result.md`
* `runs/FP-MCP-006/verification.txt`

