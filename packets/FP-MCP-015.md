# FP-MCP-015 — Remote Runner Request Validation Tool

## Task

Add a read-only ForgePilot MCP tool that validates whether an existing OpenCode request artifact is eligible to be forwarded to a private dev-side runner.

## Goal

Implement the next safe step after FP-MCP-012 and FP-MCP-014 by validating remote-runner eligibility without contacting the runner, starting OpenCode, or mutating artifacts.

FP-MCP-015 answers one question:

**Is this recorded request artifact eligible to be sent to the remote dev runner, assuming a future runner start tool exists?**

This packet adds validation only.

It does not start OpenCode.

It does not contact a remote runner.

It does not call the OpenCode CLI.

It does not call the OpenCode API.

It does not execute shell commands beyond existing constrained Git status operations already present in the bridge.

It does not create artifacts.

It does not mutate request artifacts.

It does not mutate Git.

It does not mutate SQLite.

---

## Scope Boundary

FP-MCP-015 may update the bridge to add:

* one read-only MCP validation tool
* input schema for `packetId` and `requestId`
* output schema for remote-runner eligibility
* structured result output
* readable text fallback content
* request artifact read/parse validation
* base commit matching check
* repository cleanliness check
* allowed model check
* allowed run-mode check
* safe artifact directory check
* stable reason codes

FP-MCP-015 must not add:

* remote runner calls
* OpenCode execution
* OpenCode CLI invocation
* OpenCode API invocation
* shell execution tools
* arbitrary prompt execution
* arbitrary command execution
* model policy mutation
* model allowlist mutation
* request artifact creation
* request artifact mutation
* run artifact creation
* Git mutation
* SQLite mutation
* background workers
* autonomous execution

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

### FP-MCP-007

FP-MCP-007 creates durable OpenCode request artifacts.

FP-MCP-015 validates whether such an artifact is eligible for remote-runner handoff.

### FP-MCP-010

FP-MCP-010 reads OpenCode request artifacts.

FP-MCP-015 builds on read/parse logic but returns an eligibility decision.

### FP-MCP-011

FP-MCP-011 defines execution-start prerequisites.

FP-MCP-015 validates a subset of those prerequisites before any future execution-start tool exists.

### FP-MCP-012

FP-MCP-012 defines the remote runner boundary.

FP-MCP-015 validates whether a request may be forwarded to a private dev runner under that boundary.

### FP-MCP-014

FP-MCP-014 reports capability state.

FP-MCP-015 should preserve the same policy distinction:

```text
discoveredModels != allowedModels
```

---

## Tool to Add

FP-MCP-015 should add:

```text
forgepilot_validate_remote_runner_request
```

---

## Tool Purpose

The tool checks whether a recorded request artifact is safe and eligible for future remote-runner handoff.

It does not contact the remote runner.

It does not start OpenCode.

It does not create run artifacts.

It only validates local request and repository state.

---

## Required Input Schema

```text
packetId: string
requestId: string
```

The tool must not accept:

* raw prompt
* raw command
* model override
* run-mode override
* raw file path
* raw artifact directory
* raw repository path
* environment variables
* secrets
* arbitrary JSON payloads
* approval token

Approval is intentionally not part of this validation tool because no execution is started.

---

## Required Output Fields

The tool should return:

```text
eligible: boolean
executionEnabled: boolean
executionStarted: boolean
runnerContacted: boolean
packetId: string
requestId: string
requestArtifactPath: string | null
packetExists: boolean
requestExists: boolean
requestArtifactValid: boolean
modelAllowed: boolean
runModeAllowed: boolean
workingTreeClean: boolean
baseCommitMatches: boolean
safeArtifactDir: boolean
artifactDir: string | null
currentCommit: string | null
requestBaseCommit: string | null
modelId: string | null
runMode: string | null
boundaryVersion: string
statusSource: string
reasons: string[]
```

---

## Eligibility Requirements

The tool should return `eligible: true` only if all of the following are true:

* packet id is valid
* request id is valid
* packet file exists
* request artifact exists
* request artifact JSON parses
* request artifact has `schemaVersion: "FP-MCP-007"`
* request artifact has `status: "REQUEST_RECORDED"`
* request artifact `packetId` matches input `packetId`
* request artifact `requestId` matches input `requestId`
* model id is allowed
* run mode is allowed
* repository working tree is clean
* current commit matches request artifact `baseCommit`
* artifact directory is safe
* artifact directory has expected shape: `runs/<packetId>/<modelId>-<runMode>/`
* no execution has already started according to request artifact fields

---

## Required False Fields

Because FP-MCP-015 is validation-only, the output must always include:

```text
executionEnabled: false
executionStarted: false
runnerContacted: false
```

Even if `eligible: true`, this tool must not start anything.

---

## Request Artifact Validation

The request artifact must be read from the safe derived path:

```text
runs/<packetId>/opencode-requests/<requestId>.json
```

The tool must not accept a raw path.

The tool must reject:

* invalid packet id
* invalid request id
* path traversal
* non-json artifact path
* malformed JSON
* arrays
* non-object JSON
* mismatched packet id
* mismatched request id
* unexpected schema version
* unsafe artifact directory

---

## Base Commit Rule

The current ForgePilot commit must match the request artifact `baseCommit`.

If it does not match:

```text
eligible: false
baseCommitMatches: false
reasons includes BASE_COMMIT_MISMATCH
```

A later packet may define safe revalidation, but FP-MCP-015 must not.

---

## Model and Run Mode Rule

The model and run mode must be revalidated against ForgePilot policy.

The request artifact values are not automatically trusted.

If invalid:

```text
reasons includes DISALLOWED_MODEL
```

or:

```text
reasons includes DISALLOWED_RUN_MODE
```

---

## Safe Artifact Directory Rule

The request artifact `artifactDir` must match:

```text
runs/<packetId>/<modelId>-<runMode>/
```

If it does not match:

```text
reasons includes UNSAFE_ARTIFACT_DIR
```

The tool must not accept artifact directory from user input.

---

## Failure Reason Codes

Use stable reason codes.

Recommended reason codes:

```text
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
```

Raw exception messages must not be returned if they expose internals.

---

## Structured Output Requirement

The tool must follow FP-MCP-008 and FP-MCP-009.

Required result pattern:

```ts
return {
  structuredContent: result,
  content: [
    {
      type: "text",
      text: JSON.stringify(result, null, 2)
    }
  ]
};
```

---

## Tool Annotation Requirement

The tool must be read-only:

```text
readOnlyHint: true
destructiveHint: false
idempotentHint: true
openWorldHint: false
```

---

## Logging Requirement

FP-MCP-004 sanitized logging remains authoritative.

The tool must not log:

* request artifact contents
* model request arguments
* tool output
* structuredContent
* raw config
* secrets
* environment variables
* tokens
* prompts
* terminal output

Allowed log shape remains:

```text
MCP tool invoked: forgepilot_validate_remote_runner_request
MCP tool completed: forgepilot_validate_remote_runner_request PASS durationMs=<number>
MCP tool completed: forgepilot_validate_remote_runner_request FAIL errorCode=<SANITIZED_CODE> durationMs=<number>
```

---

## Acceptance Criteria

* `forgepilot_validate_remote_runner_request` is added.
* The tool is read-only.
* The tool declares an input schema.
* The tool declares an output schema.
* The tool returns `structuredContent`.
* The tool preserves readable text fallback.
* The tool accepts only `packetId` and `requestId`.
* The tool does not accept approval.
* The tool does not accept raw prompt.
* The tool does not accept raw command.
* The tool does not accept raw path.
* The tool validates packet id.
* The tool validates request id.
* The tool reads request artifact from a derived safe path.
* The tool validates request artifact schema.
* The tool validates packet/request id match.
* The tool validates model allowlist.
* The tool validates run-mode allowlist.
* The tool validates repository cleanliness.
* The tool validates base commit match.
* The tool validates safe artifact directory.
* The tool always reports `executionEnabled: false`.
* The tool always reports `executionStarted: false`.
* The tool always reports `runnerContacted: false`.
* The tool does not contact the remote runner.
* The tool does not call OpenCode API.
* The tool does not call OpenCode CLI.
* The tool does not start OpenCode.
* The tool does not mutate request artifacts.
* The tool does not mutate Git.
* The tool does not mutate SQLite.
* Existing tools remain available.
* Bridge build passes.
* Bridge tests pass.
* Tool appears after Actions refresh.

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

Verify through ChatGPT MCP connector:

* `forgepilot_validate_remote_runner_request` is visible
* tool output is structured
* known FP-MCP-007 request returns expected eligibility fields
* invalid request id is rejected or safely fails
* runnerContacted is false
* executionEnabled is false
* executionStarted is false
* no execution is started
* existing tools remain available

Record artifacts under:

```text
runs/FP-MCP-015/
```

Recommended artifacts:

* `runs/FP-MCP-015/executor-result.md`
* `runs/FP-MCP-015/verification.txt`
